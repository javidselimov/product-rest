# Data model: "Media" giriş səhifəsi və ümumi şablon

Backend dəyişmir. Burada **view model**-lər var — loader-lərin mövcud API cavablarından qurduğu
serializable tiplər. Hamısı `product-rest/web-cbar-new/src` daxilindədir.

## 1. Mənbələr (dəyişmir)

| Mənbə | Sxem | İstifadə |
|---|---|---|
| `GET /api/v1/pages/tree?locale=` | `entities/page-node` `PageNode` | menyu, breadcrumb, bölmə kökü, siyahı səhifələrinin H1-i |
| `GET /api/v1/pages/media?locale=` | `features/pages` `PageDetail` (`id, title, slug, content, assets`) | giriş səhifəsinin başlığı, mətni, əlavələri |
| `GET /api/v1/galleries`, `/galleries/{id}` | `features/media` | qalereya siyahısı və detalı |
| `GET /api/v1/videos`, `/video-streams` | `features/media` | video siyahısı, canlı yayım |

## 2. Bölmə kökü (`entities/page-node/lib/tree.ts`)

```ts
type SectionKey = 'about' | 'media'

/** Bölmə kökü başlığı ilə tanınır (az/en, köhnə sayt kimi). */
const SECTION_TITLES: Record<SectionKey, ReadonlySet<string>> = {
  about: new Set(['Haqqımızda', 'About us', 'About Us']),   // = ABOUT_SECTION_TITLES
  media: new Set(['Media']),
}

sectionRoot(tree, key): PageNode | null          // tree.find(title ∈ SECTION_TITLES[key])
isSectionCopy(node, key): boolean                 // "Media (Kopya)" / "Media (Copy)"
sectionKeyOf(tree, root): SectionKey | null       // kök hansı bölmədir
// Geriyə uyğunluq: ABOUT_SECTION_TITLES, aboutSection(tree) = sectionRoot(tree,'about'), isAboutCopy
```

## 3. Ümumi şablon (`widgets/section-shell/model.ts`)

```ts
type Crumb = { label: string; href: string | null }        // son element href=null
type SectionNavItem = {
  key: string; title: string; href: string; external: boolean
  current: boolean; open: boolean; children: SectionNavItem[]   // dərinlik ≤ 2
}
type SectionShellData = { locale: Locale; crumbs: Crumb[]; nav: SectionNavItem[]; share: { pageUrl: string; title: string } }

buildSectionShell({ section: SectionKey; tree; locale; current: { slug } | { href }; pageUrl; pageTitle; trail? }): SectionShellData
```

**Qaydalar** (024 §2 ilə eyni, `section` parametri ilə): `nav` bölmə kökünün uşaqlarından; Kopya
səhifəsində Kopya kökündən. Ağac boşdursa `nav = []`, `crumbs = [Ana səhifə, pageTitle]`.
Etiketlər `section` namespace-indən (`breadcrumb.home`, `breadcrumb.label`, `share.*`, `nav.label`).

## 4. Media giriş səhifəsi (`views/media/loader.ts`)

```ts
type MediaViewData = {
  locale: Locale
  title: string                 // CMS səhifə başlığı, yoxdursa t('media:title')
  html: string                  // prepareCmsHtml(page.content), yoxdursa ''
  attachments: AttachmentFile[] // page.assets → mediaUrl
  shell: SectionShellData       // section: 'media', current: { slug: 'media' }
}
```

Loader `cache()` ilə sarılır — `generateMetadata` və səhifə bir sorğunu bölüşür.
Sorğular: `getPage(locale, 'media')`, `getPagesTree(locale)` (allSettled).

## 5. Siyahı səhifələri

```ts
// views/media-galleries/loader.ts
type MediaGalleriesData = { locale; title; shell; galleries: { items: GalleryCard[] | null; error: boolean } }
// views/media-videos/loader.ts
type MediaVideosData = { locale; title; shell; streams: StreamCard[]; videos: { items: VideoCard[] | null; error: boolean } }
```

`GalleryCard`, `VideoCard`, `StreamCard` bugünkü `views/media/loader.ts` tipləridir — köçür.
`title`: ağacda `isCurrentNode(n, locale, { href })` ilə tapılan bəndin adı, yoxsa
`t('media:galleries' | 'media:videos')`. `shell.current = { href: '/{locale}/media/galleries' }`.

## 6. Qalereya detalı (`views/gallery/loader.ts`)

Mövcud `GalleryViewData` + `shell: SectionShellData` (`current: { href: '/{locale}/media/galleries' }`,
`trail: gallery.title`). Ağac sorğusu əlavə olunur (`allSettled`).

## 7. CMS səhifəsi (`views/cms-page/loader.ts`)

```ts
type ShellPageData = { section: SectionKey; shell: SectionShellData; layout: AboutLayoutKind; blocks: AboutBlock[] }
type CmsPageViewData = { ...mövcud; shellPage: ShellPageData | null }   // əvvəl `about`
```

`section === 'about'` → `layoutFor` + `parseAbout` (dəyişmir); `section === 'media'` →
`layout = 'plain'`, `blocks = [{ kind: 'html', html }]`; `null` → köhnə görünüş.

## 8. i18n (`locales/{az,en}/section.json`)

| Açar | az | en |
|---|---|---|
| `breadcrumb.home` | Ana səhifə | Home |
| `breadcrumb.label` | Səhifənin yeri | Breadcrumb |
| `share.label` | Paylaş | Share |
| `share.facebook` | Facebook-da paylaş | Share on Facebook |
| `share.linkedin` | LinkedIn-də paylaş | Share on LinkedIn |
| `share.whatsapp` | WhatsApp-da paylaş | Share on WhatsApp |
| `share.email` | E-poçtla göndər | Send by email |
| `share.print` | Çap et | Print |
| `share.newTab` | yeni pəncərədə açılır | opens in a new window |
| `nav.label` | Bölmə naviqasiyası | Section navigation |

`about.json`-dan bu açarlar silinir; `history`, `board`, `staff`, `photos`, `divisions` qalır.
`media.json`: `sectionNav`, `backToMedia` istifadədən çıxır və silinir; `title`, `galleries`,
`videos`, `streams`, kart açarları qalır.
