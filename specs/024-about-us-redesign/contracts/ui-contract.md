# UI kontraktı: "Haqqımızda" bölməsi

Figma node → komponent xəritəsi, ölçülər, token-lər, route-lar və i18n açarları.
Spec 022-nin `contracts/ui-contract.md`-si (shell, token-lər, `tab`/`desk` breakpoint-ləri)
əsasdır, burada yalnız əlavələr var.

## 1. Route-lar

| URL | Route faylı | View | Dəyişiklik |
|---|---|---|---|
| `/{locale}/{...slug}` (About ağacı) | `(content)/[...slug]/page.tsx` | `CmsPageView` (About olanda `AboutShell` + `widgets/about-blocks`) | layout seçimi |
| `/{locale}/organization?section=board\|management\|divisions\|offices` | `(content)/organization/page.tsx` | `OrganizationView` | yeni şablon, tablar silinir |
| `/{locale}/organization/staff/detail/{id}` | mövcud | `StaffMemberView` | yeni şablon + başlıq kartı |
| `/{locale}/organization/divisions/{id}` | **YENİ** `(content)/organization/divisions/[id]/page.tsx` | **YENİ** `DivisionView` | |

Bütün mövcud ünvanlar dəyişmir (FR-019). `generateMetadata` dəyişmir, yeni route üçün başlıq =
şöbə adı, `alternates.languages` az/en.

## 2. Ümumi şablon (`widgets/about-shell`)

| Element | Figma | Desktop (≥ `desk`) | Planşet (`tab`…`desk`) | Mobil (< `tab`) |
|---|---|---|---|---|
| Alətlər sırası | `breadcrumb, social links` | 100 hündürlük, py30, breadcrumb solda, paylaşma sağda | alt-alta, gap10, px40 py24 | alt-alta, gap12, px24 |
| Breadcrumb | `1272:11367` | düymə-link 14/500, caret 16 neutral-500, gap4 | eyni | eyni |
| Paylaşma | `social links` | 5 × 36 kvadrat, r6, `bg` site-surface, ikon 16 neutral-500, gap10 | eyni | eyni |
| Menyu | `subcategories` | 312 en, solda, `bg` site-surface-muted, r4, p20 | 664 tam en, başlıqdan əvvəl, alt boşluq 32 | 342 tam en |
| Menyu linki | `menu link` | 16/600 neutral-800 lh28, gap16; alt səviyyə 14/400 neutral-500, gap12; caret 16 | eyni | eyni |
| Aktiv link | — (Figma-da göstərilmir) | mətn brand-500 + `aria-current="page"` | eyni | eyni |
| Məzmun sütunu | `content` | 984, menyudan 24 sonra | tam en | tam en |
| H1 | `Page title` | 32/600 lh44, altında 36 | 32/600 | 22/600 lh28, altında 32 |
| Bölmə başlığı | | 20/600 lh28 | eyni | eyni |
| Mətn | | 16/400 lh28 neutral-800 | 16/400 | 14/400 |

Desktop qrid: `grid-cols-[312px_minmax(0,984px)] gap-6` 1320 konteynerdə. Menyu yapışqan deyil
(Figma-da göstərilmir).

## 3. Səhifə blokları

| Blok | Figma | Komponent | Qeyd |
|---|---|---|---|
| Tarix kartları | `1186:14884`, mobil `Milestone` | `DateCards` | desktop 3 sütun 312×160 gap24; planşet 3 × 211, p16, gap16; mobil 1 sütun, gap12 |
| Vurğulanmış qutu | `1186:14894` | `HighlightBox` | mobil gap20 |
| Funksiyalar | `1186:14901` | `cms-content.css` `details[data-accordion]` (`.about` variantı) | native `<details>`, JS-siz işləyir |
| Tarix hero | `1111:64926` | `HistoryHero` | dekorativ SVG `aria-hidden` |
| Timeline | `898:3060` | `Timeline`, `TimelineEvent` | xətt 4 en secondary-500 marker mərkəzindən; tarix 112, marker 16, gövdə 704; hadisələr arası 60 |
| İl naviqasiyası | `1272:15574`, mobil `Chronology navigation` | `YearNav` (server) + `YearNavSpy` (client) | desktop sağda sticky 88; planşet/mobil üfüqi sıra gap16 |
| Missiya banneri | `968:1094` | `MissionBanner` | |
| Dəyər sətri | `968:1100` | `ValueRow` | mobil: ikon+ad üstdə, mətn altda |
| Sədr kartı | `1189:16699` | `ChairCard` | 424 en, mərkəzdə, foto 424×264 `object-cover object-top`, ad 20/600, vəzifə 18/500 neutral-700, kölgə |
| Əməkdaş kartı | `1189:15970` / `986:5004` | `StaffCard` | 312 en, foto 312×250 `bg` neutral-500, ad 18/600, vəzifə 16/400 neutral-700, p24 pb24, kölgə, r4 |
| Kart şəbəkəsi | | `StaffGrid` | desktop 3 sütun gap24; planşet 2; mobil 1 |
| Bio başlıq kartı | `1199:17650` | `StaffHeaderCard` | foto 312×272, gap42, ad 32/600, vəzifə 18/400, xətt neutral-100, qəbul günləri və telefon 48 dairəvi ikon `bg` brand-100 |
| Şöbə məlumat kartı | `1003:12462` | `DivisionCard` | haşiyə neutral-300, p24 |
| Fayl sətri | `1000:12443` | `FileRow` (attachments-in About variantı) | 72 hündürlük, ağ, haşiyə neutral-300, p20, PDF ikonu 32, ad 16/600 |
| Sxem | `996:8542` `structure` | CMS məzmunu, `<a target=_blank>` ilə sarılmış ilk şəkil | max-w 713, `w-full h-auto` |

## 4. Token-lər (`globals.css`, route B blokundan sonra)

Yeni app token-ləri, hamısı kit primitivinə istinad edir (research R11, yeni D-2 literalı yoxdur):

```css
--site-timeline-line: var(--ui-color-secondary-500);
--site-icon-tile: var(--ui-color-secondary-50);
--site-photo-placeholder: var(--ui-color-neutral-500);
--site-hero-from: var(--ui-color-brand-500);
--site-hero-to: var(--ui-color-brand-800);
--site-shadow-card: var(--ui-shadow-md); /* Figma `1189:15970`, `986:5004`, `1189:16699`: 0 4px 30px rgba(0,0,0,.05) */
```

Kart kölgəsi kitin `--ui-shadow-md`-sidir (istifadəçi qərarı, 2026-10-14: kitə və D-2-yə
dəyişiklik yoxdur). Figma kölgəsi (`0 4px 30px rgba(0,0,0,.05)`) daha yumşaqdır və 1px halqası
yoxdur. Bu fərq `visual-diff.md`-də qəbul edilmiş fərq kimi qeyd olunur. Kit sonra yenilənsə
yalnız bu token dəyişir.

Mövcud olanlar təkrar işlədilir: `site-surface` (paylaşma düyməsi), `site-surface-muted`
(menyu), `site-on-accent-muted` = brand-100 (vurğulanmış qutu), `site-divider` = neutral-300.

**Figma rəngi → class xəritəsi (analyze D1).** Bu sənəddə və tasks-da kit primitiv adları
(`neutral-200`, `secondary-500` …) yalnız **Figma dəyərinin adıdır**. Kodda heç vaxt
`*-neutral-*` / `*-secondary-*` palitra class-ı yazılmır, həmişə sağ sütundakı token işlədilir:

| Figma | Primitiv | Class (token) |
|---|---|---|
| `#222222` | neutral-800 | `text-foreground` |
| `#333333` | neutral-700 | `text-site-text-strong` |
| `#787878` | neutral-500 | `text-muted-foreground` |
| `#D4D4D4` | neutral-300 | `border-site-divider` |
| `#E5E5E5` | neutral-200 | `border-border` |
| `#F0F0F0` | neutral-100 | `border-muted` / `bg-muted` |
| `#F5F5F5` | — (D-2, 022) | `bg-site-surface-muted` |
| `#F9F9F9` | neutral-50 | `bg-site-surface` |
| `#FFFFFF` | neutral-0 | `bg-background` |
| `#004976` | brand-500 | `bg-primary` / `text-primary` |
| `#D6EAF4` | brand-100 | `bg-site-on-accent-muted` |
| `#43B7A7` | secondary-600 | `text-site-accent-strong` |
| `#3FC1A5` ≈ `#4BC7B5` | secondary-500 | `bg-site-timeline-line` |
| `#E8F7F3` ≈ `#E9FAF7` | secondary-50 | `bg-site-icon-tile` |
| `#727271` ≈ `#787878` | neutral-500 | `bg-site-photo-placeholder` |
| hero gradient | brand-500 → brand-800 | `from-site-hero-from to-site-hero-to` |
| aktiv il | secondary-50 / 500 / 700 | `bg-site-year-active-bg`, `border-site-year-active-border`, `text-site-year-active-text` |
| marker halqası `#4BC7B5` | secondary-500 | `border-site-timeline-line` / `bg-site-timeline-line` |
| kart kölgəsi | `--ui-shadow-md` | `shadow-site-card` |

## 5. i18n açarları (`locales/{az,en}/about.json`, yeni namespace)

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
| `nav.label` | Bölmə naviqasiyası | Section navigation |
| `history.yearNav` | İllər | Years |
| `board.chair` | Sədr | Chairman |
| `board.deputies` | Sədr müavinləri | Deputy Chairmen |
| `staff.receptionDays` | Qəbul günləri | Reception days |
| `staff.contact` | Əlaqə | Contact |
| `divisions.title` | Struktur bölmələr | Divisions |
| `divisions.notFound` | Struktur bölmə tapılmadı | Division not found |

`organization.json`-dakı `sections.*`, `details`, `backToList` açarları istifadədən çıxanda
silinir (tab düymələri və geri linki yoxdur).

## 6. Client sərhədi (Maddə XI)

Yeni `'use client'` yalnız iki yerdə: `widgets/about-shell/print-button.tsx` (`window.print`)
və `widgets/about-blocks/year-nav-spy.tsx` (`IntersectionObserver`). Qalan hər şey server komponentidir.
CLAUDE.md §2 siyahısı yenilənir.

## 7. Əlçatanlıq

- Bir `h1`. Blok başlıqları `h2`. Timeline hadisəsinin başlığı `h3`.
- Breadcrumb `nav[aria-label]` + `ol`. Menyu `nav[aria-label]`, aktiv link `aria-current="page"`.
- İl naviqasiyası `nav[aria-label]`, aktiv il `aria-current="true"`.
- Dekorativ şəkillər (`hero` SVG, dəyər ikonu redaktor `alt=""` verməyibsə) `alt=""`.
- Paylaşma linklərinin hər biri görünməz mətnli `aria-label`-a malikdir, yeni tabda açıldığı
  bildirilir.
