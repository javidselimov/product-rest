# UI kontraktı: "Media" giriş səhifəsi və ümumi şablon

Figma node → komponent xəritəsi, ölçülər, route-lar, i18n. Spec 022 (`contracts/ui-contract.md`:
shell, token-lər, `tab`/`desk` breakpoint-ləri) və spec 024 §2 (ümumi şablon) əsasdır — burada
yalnız fərqlər və əlavələr var.

## 1. Route-lar

| URL | Route faylı | View | Dəyişiklik |
|---|---|---|---|
| `/{locale}/media` | `(content)/media/page.tsx` (mövcud) | `MediaView` — **yenidən yazılır**: `SectionShell` + CMS məzmun | giriş səhifəsi |
| `/{locale}/media/galleries` | **YENİ** `(content)/media/galleries/page.tsx` | **YENİ** `MediaGalleriesView` | köçən qalereya grid-i |
| `/{locale}/media/videos` | **YENİ** `(content)/media/videos/page.tsx` | **YENİ** `MediaVideosView` | köçən canlı yayım + video grid-i |
| `/{locale}/media/galleries/{id}` | mövcud | `GalleryView` — şablona salınır, `BackLink` silinir | |
| `/{locale}/{slug}` (Media ağacı) | `(content)/[...slug]/page.tsx` | `CmsPageView` — `section === 'media'` olanda `SectionShell` + `CmsContent variant="about"` | şablon |
| `/media`, `/media/galleries` (locale-siz) | `proxy.ts` | → `/az/…` (307) | matcher |
| `/gallery/photos[/detail/{id}]`, `/videos` (köhnə) | `proxy.ts` `legacyRedirect` | → `/{locale}/media/galleries[/{id}]`, `/{locale}/media/videos` (308) | legacy |

`generateMetadata`: `/media` başlığı CMS səhifəsindən (fallback `media:title`); yeni siyahılar
üçün başlıq ağacdakı bəndin adı; `alternates.languages` az/en hamısında.

## 2. Ümumi şablon (`widgets/section-shell`, = 024 §2)

Figma Media frame-ləri ölçüləri (2026-11-02, `figma_node`):

| Element | Figma node | Desktop (≥ `desk`) | Planşet (`tab`…`desk`) | Mobil (< `tab`) |
|---|---|---|---|---|
| Alətlər sırası | `1045:17245` | 1320×100, py30, space-between | `1658:12852` px40 py24, alt-alta gap10 | `1658:13252` gap12, konteyner px24 pt16 |
| Breadcrumb | `1298:18812` | düymə-link 14/500 lh28, h40, caret 16, gap4 | eyni | eyni |
| Paylaşma | `1045:17247` | 5 × 40 (kit `IconButton sm` 36 — 024 qəbul edilmiş fərq), r6, gap10, ikon 16 | eyni | eyni |
| Menyu | `1559:62331` | 312 en, p20, r4, `#F5F5F5` (`bg-site-surface-muted`), bəndlər arası 16 | `1658:12886` 664 tam en, px40 pb32 | `1714:30068` 342 tam en |
| Menyu linki | `menu link` `2068:111300…` | 16/600 lh28, `#222` (`text-foreground`), 272 en, uzun ad 2 sətir (56) | eyni | eyni |
| Məzmun sütunu | `1045:17249` | 984, menyudan 24 sonra, daxili gap 36 | `1658:12913` 664, px40 pb80 | `1658:13311` 342, pb64 |
| H1 | `1045:17251` | 32/600 lh44, `#333` (sayt: `text-foreground` `#222` — qəbul edilmiş fərq) | 32/600 | 22/600 lh28 |
| Mətn | `1083:26758` | 16/400 lh28 `#222` | 16/400 | 14/400 |

Qrid: `desk:grid-cols-[312px_minmax(0,984px)] desk:gap-6`. Hamısı 024-ün `about-shell.tsx`
class-larıdır — **şablon kodu ölçü baxımından dəyişmir**, yalnız adı və parametri.

## 3. Bloklar

| Blok | Figma | Komponent | Qeyd |
|---|---|---|---|
| Giriş mətni | `1083:26758` | `CmsContent variant="about"` | 2 paraqraf (`<p>`); boş sətir CMS-dən gəlirsə `cms-content.css` `p:empty` qaydası (varsa) |
| Əlavələr | — | `Attachments` | CMS səhifəsində fayl varsa (bu gün 0) |
| Qalereya kartı | — (024/002 mövcud) | `views/media-galleries` | bugünkü markup, dizayn sonrakı spec |
| Video kartı, canlı yayım kartı | — | `views/media-videos` | bugünkü markup |

## 4. Token-lər

Yeni token yoxdur. İstifadə: `bg-site-surface-muted` (menyu), `bg-site-surface` (paylaşma),
`text-foreground`, `text-muted-foreground`, `text-primary` (aktiv bənd).

## 5. i18n

Yeni namespace `section` (data-model §8). `media.json`: `sectionNav`, `backToMedia` silinir.
`about.json`: şablon açarları silinir (`breadcrumb`, `share`, `nav`).

## 6. Client sərhədi (Maddə XI)

Yeni `'use client'` yoxdur. `print-button.tsx` `section-shell`-ə köçür, dəyişmir.

## 7. Əlçatanlıq

- Bir `h1`. Breadcrumb `nav[aria-label]` + `ol`; son element `aria-current="page"`.
- Menyu `nav[aria-label]`, aktiv link `aria-current="page"`; giriş səhifəsində aktiv yoxdur.
- Paylaşma linkləri `aria-label` + "(yeni pəncərədə açılır)".
- Qalereya/video kartları mövcud `alt` qaydaları ilə.
