/**
 * TipTap extension dəsti (research R10). React-siz — həm `RichTextEditor`, həm
 * vitest round-trip testi, həm də (`.mjs` TS import edə bilmədiyi üçün eyni
 * semantika ilə yenidən yazılmış) `scripts/roundtrip-check.mjs` bu sıranı paylaşır.
 *
 * Köhnə cbar.az markup-ı ilə birə-bir uyğunluq üçün dörd xüsusi extension var.
 * TipTap heç bir extension-ın sahiblənmədiyi elementi səssizcə atır — bunlardan
 * birini silmək redaktor açıb yadda saxlanan hər səhifədən həmin markup-ı silir.
 * Dəyişikliklər `roundtrip.test.ts` ilə qorunur.
 */

import { Node, mergeAttributes, type Extensions } from '@tiptap/core'
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from '@tiptap/extension-details'
import Image, { type ImageOptions } from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TableKit } from '@tiptap/extension-table'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import Youtube from '@tiptap/extension-youtube'
import StarterKit from '@tiptap/starter-kit'

import { resolveMediaSrc } from '@/entities/media/model/types'
import { EMBED_FRAME_PRIORITY, YOUTUBE_EMBED } from './constants'

// ---- Accordion (details) ---------------------------------------------------
// Rəsmi @tiptap/extension-details üzərində iki dəyişiklik:
// 1. Saxlanılan HTML
//    `<details data-accordion><summary>…</summary><div data-type="details-content">…</div></details>`
//    olmalıdır (stok content node `data-type="detailsContent"` yazır).
// 2. Redaktorda accordion həmişə açıq görünür ki, gövdə redaktə oluna bilsin.
//    `open` yalnız redaktor DOM-undadır; `persist: false` (default) ilə heç vaxt
//    getHTML() nəticəsinə düşmür.

export const AccordionDetails = Details.extend({
  addNodeView() {
    return ({ HTMLAttributes }) => {
      const dom = document.createElement('details')
      const attributes = mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
      )
      Object.entries(attributes).forEach(([key, value]) =>
        dom.setAttribute(key, String(value)),
      )
      dom.open = true
      // Native <details> toggling bloklanır — gövdə redaktə zamanı yığılmasın.
      dom.addEventListener('click', (event) => {
        if ((event.target as HTMLElement | null)?.closest('summary'))
          event.preventDefault()
      })
      dom.addEventListener('toggle', () => {
        if (!dom.open) dom.open = true
      })
      return {
        dom,
        contentDOM: dom,
        ignoreMutation: (mutation) =>
          mutation.type === 'attributes' && mutation.target === dom,
      }
    }
  },
}).configure({
  HTMLAttributes: { 'data-accordion': '' },
})

export const AccordionContent = DetailsContent.extend({
  parseHTML() {
    return [
      { tag: 'div[data-type="details-content"]' },
      // Stok TipTap yazılışı da qəbul edilir.
      { tag: 'div[data-type="detailsContent"]' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'details-content',
      }),
      0,
    ]
  },
  addNodeView() {
    // Stok node view gövdəni toggle düyməsi basılana qədər `hidden` saxlayır;
    // həmişə açıq accordion içində gövdə sadəcə görünür.
    return ({ HTMLAttributes }) => {
      const dom = document.createElement('div')
      const attributes = mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        { 'data-type': 'details-content' },
      )
      Object.entries(attributes).forEach(([key, value]) =>
        dom.setAttribute(key, String(value)),
      )
      return { dom, contentDOM: dom }
    }
  },
})

// Media kitabxanasına gedən linkləri adi linklərdən ayırmaq üçün `data-media-link`
// boolean atributu ilə genişləndirilmiş Link.
export const MediaLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-media-link': {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.hasAttribute('data-media-link') ? '' : null,
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes['data-media-link'] == null
            ? {}
            : { 'data-media-link': '' },
      },
    }
  },
})

const EMBED_FRAME_ATTRIBUTES = [
  'src',
  'width',
  'height',
  'style',
  'title',
  'frameborder',
  'allow',
  'allowfullscreen',
  'loading',
  'referrerpolicy',
] as const

// Ümumi <iframe> keçidi. Youtube extension-ı yalnız YouTube URL-lərini oxuyur;
// bu olmasa Google Maps kimi embed-lər yadda saxlananda silinərdi.
export const EmbedFrame = Node.create({
  name: 'embedFrame',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return Object.fromEntries(
      EMBED_FRAME_ATTRIBUTES.map((attribute) => [attribute, { default: null }]),
    )
  },
  parseHTML() {
    // Youtube extension-ından aşağı prioritet — YouTube embed-ləri öz node-unda qalsın.
    return [{ tag: 'iframe', priority: EMBED_FRAME_PRIORITY }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes)]
  },
})

// ---- Şəkil ------------------------------------------------------------------
// Saxlanılan HTML-də `src` nisbi `/media/{id}`-dir (spec 001 FR-024): ictimai sayt onu
// öz `/media/[id]` proxy-sindən keçirir. Paneldə isə `/media`-nı heç kim vermir —
// deploy-da nginx yalnız SPA-dır, ona görə redaktor DOM-unda `src` ictimai api-cbar
// kökü (`VITE_MEDIA_BASE_URL`) ilə tamamlanır. Yalnız node view-dadır: `renderHTML`
// (deməli `getHTML()`) toxunulmur, nisbi ünvan bazaya düşür. Boş kök = eyni mənbə
// (lokalda Vite `/media`-nı proxy edir).

export interface EditorExtensionOptions {
  /** İctimai api-cbar kökü, sonda `/`-siz; boş sətir = nisbi qalır. */
  mediaBaseUrl?: string
}

export const MediaImage = Image.extend<
  ImageOptions & { mediaBaseUrl: string }
>({
  addOptions() {
    // `parent` stok Image-dir, həmişə var; tipdə isə optional-dır.
    return { ...(this.parent?.() as ImageOptions), mediaBaseUrl: '' }
  },
  addNodeView() {
    return ({ HTMLAttributes }) => {
      const dom = document.createElement('img')
      const attributes = mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
      )
      for (const [name, value] of Object.entries(attributes)) {
        if (value == null) continue
        dom.setAttribute(
          name,
          name === 'src'
            ? resolveMediaSrc(String(value), this.options.mediaBaseUrl)
            : String(value),
        )
      }
      return { dom }
    }
  },
})

/** Redaktorun tam extension siyahısı — sıra köhnə panel ilə eynidir. */
export function buildExtensions({
  mediaBaseUrl = '',
}: EditorExtensionOptions = {}): Extensions {
  return [
    StarterKit.configure({ link: false }),
    MediaLink.configure({ openOnClick: false, autolink: true }),
    AccordionDetails,
    DetailsSummary,
    AccordionContent,
    TableKit.configure({ table: { resizable: false } }),
    // Inline — qalereya şəkilləri tam ölçülü linkini saxlaya bilsin.
    MediaImage.configure({ inline: true, mediaBaseUrl }),
    Youtube.configure({
      nocookie: true,
      width: YOUTUBE_EMBED.WIDTH,
      height: YOUTUBE_EMBED.HEIGHT,
    }),
    EmbedFrame,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    // TextStyle + rəng/fon markları — TinyMCE textcolor/backcolor pariteti.
    TextStyleKit,
  ]
}
