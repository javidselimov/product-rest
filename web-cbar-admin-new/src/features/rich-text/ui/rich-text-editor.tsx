/**
 * Rich-text redaktoru (TipTap, spec D1 — kit-də redaktor yoxdur). Props
 * `{value, onChange, editable?}` köhnə panel ilə eynidir; `value` xaricdən
 * dəyişəndə `setContent(value, {emitUpdate:false})` ilə sinxronlaşır.
 * `CrudFormPage` bu komponenti `features/rich-text#RichTextEditor` (lazy) ilə
 * yükləyir — TipTap chunk-ı yalnız richtext sahəsi olan formlarda gəlir.
 */

import './editor.css'

import { cn } from '@cbar/lib-react-ui-kit/lib'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { Textarea } from '@cbar/lib-react-ui-kit/textarea'
import { EditorContent, useEditor } from '@tiptap/react'
import DOMPurify from 'dompurify'
import { useEffect, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import type { MediaItem } from '@/entities/media/model/types'
import { MediaPickerDialog } from '@/features/media/components/media-picker-dialog'
import { getRuntimeConfig } from '@/shared/config/runtime-config'
import { SANITIZE_CONFIG } from '@/shared/lib/sanitize-html'
import { buildExtensions } from '../model/extensions'
import { LinkDialog } from './link-dialog'
import { PreviewDialog } from './preview-dialog'
import { Toolbar } from './toolbar'

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  editable?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  editable = true,
}: RichTextEditorProps) {
  const { t } = useTranslation('richText')
  const [filePickerOpen, setFilePickerOpen] = useState(false)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkHref, setLinkHref] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  // HTML mənbə rejimi (TinyMCE "code" pariteti); açıq olanda sourceText əsasdır.
  const [sourceMode, setSourceMode] = useState(false)
  const [sourceText, setSourceText] = useState('')

  // `immediatelyRender: false` qəsdəndir: default rejimdə TipTap editoru render
  // zamanı yaradıb 1 ms-lik "destroy" taymeri qurur və effect o vaxta qədər
  // işləməsə (səhifə yenilənəndə, yüklü ilk açılışda) editoru məhv edir. Bizim
  // effect-lər isə hələ köhnə (məhv olunmuş, `schema: null`) nüsxəni görür və
  // `getHTML()` "reading 'cached'" atırdı — route xəta ekranı. Bu rejimdə editor
  // yalnız mount-dan sonra yaranır; o vaxta qədər `null`-dır və skeleton görünür.
  const editor = useEditor({
    // Nisbi `/media/{id}` şəkilləri redaktor DOM-unda ictimai API kökü ilə göstərilir.
    extensions: buildExtensions({
      mediaBaseUrl: getRuntimeConfig().urls.mediaBaseUrl,
    }),
    content: value,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML())
    },
  })
  const ready = editor !== null && !editor.isDestroyed

  useEffect(() => {
    if (!ready) return
    if (editor.isEditable !== editable) editor.setEditable(editable)
  }, [ready, editable, editor])

  // Xarici `value` sinxronu (detail query gələndə, qeyd dəyişəndə).
  useEffect(() => {
    if (!ready) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [ready, value, editor])

  if (!ready) return <Skeleton className="h-60 w-full" />

  const setLink = (href: string) => {
    setLinkOpen(false)
    if (href === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }

  const openLink = () => {
    const previous = editor.getAttributes('link').href
    setLinkHref(typeof previous === 'string' ? previous : '')
    setLinkOpen(true)
  }

  const insertMediaLink = (item: MediaItem) => {
    // Nisbi ünvan qəsdəndir: ictimai sayt /media/{id}-ni render zamanı API
    // hostuna yönləndirir — saxlanılan HTML mühitdən asılı qalmır.
    const attrs = { href: `/media/${item.id}`, 'data-media-link': '' }
    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: item.originalName,
          marks: [{ type: 'link', attrs }],
        })
        .run()
    } else {
      // Seçilmiş mətn qalır, media linkinə çevrilir.
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setMark('link', attrs)
        .run()
    }
    setFilePickerOpen(false)
  }

  const insertImage = (item: MediaItem) => {
    editor
      .chain()
      .focus()
      .setImage({ src: `/media/${item.id}`, alt: item.originalName })
      .run()
    setImagePickerOpen(false)
  }

  const toggleSourceMode = () => {
    if (sourceMode) {
      editor.commands.setContent(sourceText || '', { emitUpdate: false })
      onChange(editor.getHTML())
      setSourceMode(false)
    } else {
      setSourceText(editor.getHTML())
      setSourceMode(true)
    }
  }

  // Sanitized before it leaves the editor (DOMPurify); computed only while open.
  const rawHtml = sourceMode ? sourceText : editor.getHTML()
  const previewHtml = previewOpen
    ? DOMPurify.sanitize(rawHtml, SANITIZE_CONFIG)
    : ''

  return (
    <div
      className={cn(
        'rte border-border bg-background w-full rounded-md border',
        fullscreen &&
          'fixed inset-0 z-(--ui-z-modal) overflow-y-auto rounded-none',
      )}
    >
      <Toolbar
        editor={editor}
        editable={editable}
        sourceMode={sourceMode}
        fullscreen={fullscreen}
        onInsertFile={() => setFilePickerOpen(true)}
        onInsertImage={() => setImagePickerOpen(true)}
        onOpenLink={openLink}
        onTogglePreview={() => setPreviewOpen(true)}
        onToggleSource={toggleSourceMode}
        onToggleFullscreen={() => setFullscreen((current) => !current)}
      />

      {sourceMode && editable ? (
        <Textarea
          aria-label={t('sourceEditor')}
          value={sourceText}
          className="min-h-80 rounded-none border-0 font-mono text-xs"
          onChange={(event) => {
            setSourceText(event.target.value)
            onChange(event.target.value)
          }}
        />
      ) : (
        <div
          style={
            { '--rte-min-h': fullscreen ? '70vh' : '240px' } as CSSProperties
          }
        >
          <EditorContent editor={editor} />
        </div>
      )}

      <PreviewDialog
        open={previewOpen}
        html={previewHtml}
        onClose={() => setPreviewOpen(false)}
      />

      <LinkDialog
        open={linkOpen}
        initialHref={linkHref}
        onClose={() => setLinkOpen(false)}
        onSubmit={setLink}
      />

      {filePickerOpen ? (
        <MediaPickerDialog
          open
          onClose={() => setFilePickerOpen(false)}
          onPick={insertMediaLink}
        />
      ) : null}
      {imagePickerOpen ? (
        <MediaPickerDialog
          open
          onClose={() => setImagePickerOpen(false)}
          onPick={insertImage}
        />
      ) : null}
    </div>
  )
}
