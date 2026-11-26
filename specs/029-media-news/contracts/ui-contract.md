# UI kontraktı: Media → Xəbərlər / Elanlar (spec 029)

Əsas: spec 022 (shell, token-lər, `tab`/`desk` breakpoint-ləri), spec 028 §2 (`widgets/section-shell`
— ölçülər dəyişmir). Burada yalnız bu səhifələrin məzmun sütunu var. Ölçülər Figma node-larından
(2026-11-02); implementasiyada brauzerdə `getBoundingClientRect` ilə tutuşdurulur (yaddaş:
"Figma ↔ DOM ölçü").

## 1. Route-lar

| URL | Route faylı | View | Dəyişiklik |
|---|---|---|---|
| `/{locale}/press-releases[?type=1]` | mövcud | `PressReleasesView` — **yenidən yazılır** | Xəbərlər siyahısı |
| `/{locale}/press-releases?type=2` | mövcud | eyni view | Elanlar siyahısı |
| `…&q=&from=&to=&page=` | — | — | filtr + paginasiya |
| `/{locale}/press-releases/{slug}` | mövcud | `PressReleaseView` — **yenidən yazılır** | detal |

`generateMetadata`: siyahıda başlıq view-dakı H1 ilə eyni (Xəbərlər/Elanlar),
`alternates.languages` tipli ünvanla; detalda mövcud (başlıq + `description`).

## 2. Siyahı — məzmun sütunu (`1048:21678`)

| Element | Figma | Desktop (≥ `desk`, sütun 984) | Tablet (`tab`…`desk`, 664) | Mobil (< `tab`, 342) |
|---|---|---|---|---|
| H1 | `1047:18007` | `SectionShell title` — 32/600 lh44 (028 §2) | eyni | 22/600 lh28 (028) |
| H1 → filtr | `1048:21676` gap | 36 | 36 | 36 |
| Filtr sətri | `1048:18772` | 984×44, `justify-between`; sol: axtarış 312 + 24 + tarix 312; sağ: "təmizlə" + 24 + "Axtar" 144 | `1658:13840` alt-alta, gap 16 (axtarış, tarix, düymələr sırası), hər sahə tam en | eyni (alt-alta), tam en |
| Axtarış sahəsi | `1048:18642` | 312×44, kit input çərçivəsi, placeholder 14/400 lh28 | tam en | tam en |
| Tarix aralığı | `1048:18661` | 312×44 bir çərçivə: `[date] – [date]` | tam en | tam en |
| "Filtrləri təmizlə" | `2304:166498` | 14/500 lh20, alt xətli, px4, h44 mərkəzdə | | |
| "Axtar" | `1048:18674` | kit `Button` primary, 144×44, r4, 16/500 | | |
| Filtr → grid | `1048:21678` gap | 60 | 60 | 60 |
| Grid | `1048:20885` | 3 sütun × 312, gap 24 (üfüqi və şaquli) | 2 × 320, gap 24 (`1658:13870`) | 1 × 342, gap 24 |
| Grid → paginasiya | | 60, sağa düzlənib | 60, sağa | 60, sağa |

### 2.1 Kart (`card / press-release`, `1048:20711`)

| Element | Ölçü | Token |
|---|---|---|
| Şəkil qutusu | en 100%, nisbət 312/197, `object-cover`, kəsilir | şəkilsiz: `bg-site-image-placeholder` (**yeni**, `#E5E5E5`) |
| Şəkil → mətn | 24 | |
| Tarix | 16/600 lh28 (Figma qutusu 24 hündür), `dd.mm.yyyy`, `<time dateTime>` | `text-muted-foreground` (Figma `#787878`; fərq ≤ 1 ton → visual-diff) |
| Tarix → başlıq | 16 | |
| Başlıq | `<h2>` 20/600 lh28, sətir limiti yoxdur | `text-foreground` (`#222`) |
| Link | bütöv kart bir `<a>`; hover: başlıq `text-primary`; fokus: kit fokus halqası | |

## 3. Detal — məzmun sütunu (`1298:19683`, `1298:18952`)

| Element | Figma | Desktop | Tablet / mobil |
|---|---|---|---|
| H1 | `1298:18124` | `SectionShell title` 32/600 lh44 (`#333` vs `text-foreground` — 028 qəbul edilmiş fərq) | 028 qaydası |
| H1 → örtük | gap 36 | 36 | 36 |
| Örtük | `1298:18930` | 984×502 (`aspect-[984/502]`), `object-cover`, `priority` | tam en, eyni nisbət |
| Örtük → mətn bloku | gap 32 | 32 | 32 |
| Tarix | `1298:18932` | 14/400 lh28 `text-muted-foreground`, `dd.mm.yyyy` | eyni |
| Tarix → mətn | gap 24 | 24 | 24 |
| Mətn | `1298:18934` | `CmsContent` (16/400 lh28, 028 `variant="about"`) | 028 |
| Mətn → qalereya | gap 36 | 36 | 36 |
| Qoşmalar | — (Figma-da yoxdur) | `Attachments`, mətndən sonra, qalereyadan əvvəl | |

Breadcrumb (`1298:18114`): "Ana səhifə › Media › Xəbərlər › {başlıq}" — `buildSectionShell`
`trail = title`, `current.href = /{locale}/press-releases?type={type}` (ağacda bənd "Xəbərlər"
zəncirdə görünür, son element başlıqdır, link deyil). Mövcud `BackLink` silinir (breadcrumb əvəz
edir, 028-dəki qalereya kimi).

### 3.1 Fotoqalereya (`1652:36210`)

| Element | Figma | Desktop | Tablet / mobil |
|---|---|---|---|
| Blok | VERTICAL, gap 48, mərkəz | `<section aria-label="Fotoqalereya">` | |
| Böyük şəkil | `1652:36240` 984×601 | `aspect-[984/601]`, `object-contain`, fon `bg-site-surface-muted`; orijinala link (`target=_blank`) | tam en |
| Zolaq sırası | `1652:36242` 984×124, `space-between` | sol ox 44 · miniatürlər · sağ ox 44 | oxlar qalır, zolaq üfüqi sürüşür |
| Ox düyməsi | `1652:36243` | kit `IconButton` 44×44, r6, 1px çərçivə; aktiv `border-primary`, deaktiv `border-border` | |
| Miniatür | `1652:36245` 180×124 | düymə, gap 24, `object-cover`; seçilmiş: 2px `site-accent` (INSIDE, `after:` overlay — şəklin üstündə; Figma `#D4D4D4` placeholder-də görünmür, visual-diff #8), `aria-current="true"` | 180×124 qalır, sürüşmə `scroll-snap` |
| Mövqe | — | vizual gizli `aria-live="polite"`: "Şəkil 2 / 5" | |

Davranış: ilk açılışda 1-ci şəkil; miniatür klik → seçilir və görünən sahəyə sürüşür (`scrollIntoView({ inline: 'nearest' })`);
oxlar ±1, kənarlarda deaktiv (dövr etmir); zolaqda fokus varkən ←/→ eyni işi görür.

## 4. Token-lər

| Token | Dəyər | Yer |
|---|---|---|
| `--site-image-placeholder` / `bg-site-image-placeholder` | **YENİ** `var(--ui-color-neutral-200)` (`#E5E5E5`) | kart şəkil qutusu |
| `bg-site-surface-muted` | mövcud `#F5F5F5` | qalereya böyük şəkil fonu |
| `text-muted-foreground`, `text-foreground`, `text-primary`, `border-primary`, `border-border` | mövcud | |

`globals.css`-də yalnız site token bloku dəyişir; route B bloku toxunulmazdır.

## 5. Client sərhədi (Maddə XI)

| Modul | `'use client'` | Səbəb |
|---|---|---|
| `widgets/photo-gallery/photo-gallery.tsx` | **YENİ** | seçilmiş şəkil state-i, klaviatura |
| `views/press-releases/news-filter.tsx` | **bəli** (implementasiyada) | state-siz native GET forması; kitin `inputVariants`-ı client modulundadır, server komponentdən çağırıla bilmir (`widgets/filter-form/date-field.tsx` ilə eyni səbəb). SSR olunur, JS-siz işləyir |
| `widgets/news-grid` | yox | statik linklər |

`web-cbar-new/CLAUDE.md` `'use client'` siyahısına `photo-gallery` əlavə olunur.

## 6. Əlçatanlıq

- Filtr: `<form role="search" aria-label={news.filterLabel}>`; hər input-un `aria-label`-i
  (Figma-da görünən etiket yoxdur, placeholder etiket deyil); tarix cütü `role="group"`
  `aria-label={news.dateRange}`.
- Kart başlığı `<h2>` (səhifə H1-i bölmə başlığıdır). Şəkil `alt=""` (dekorativ, link adı başlıqdır).
- Qalereya şəkilləri `alt={news.imageAlt}`; miniatür düymələri `aria-label={news.gallery.thumb}`.
- Paginasiya: kitin `aria-label`-ləri (mövcud).
