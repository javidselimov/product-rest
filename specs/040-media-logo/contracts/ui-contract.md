# UI kontraktı: Mərkəzi Bankın loqosu

Figma: desktop `2067:2284` (məzmun `2071:2843`, 984 en), tablet `2076:113861` (məzmun 664 en), mobil `2076:114736`
(məzmun 342 en). Şablon (breadcrumb, paylaşma, sol menyu, H1 32/600) `widgets/section-shell`-dəndir, dəyişmir.

## 1. Bloklar və aralıqlar

| | Mobil (<744) | Tablet (744–1359) | Desktop (≥1360) |
|---|---|---|---|
| Bloklar arası (Hero, başlıq+şəbəkə, yükləmə) | 28 | 32 | 36 |
| Bölmə başlığından şəbəkəyə | 20 | 20 | 20 |
| Bölmə başlığı ("Loqo versiyaları", redaktorun `h2`) | 20/600 | 22/600 | 24/600 |

Bloklar arası aralıq mövcud `AboutBlocks` (`gap-8 tab:gap-9`) ilə eyni deyil, buna görə `brand-logos` tək blokdur və
aralıqlarını özü qoyur (spec 037 `MediaRequests` nümunəsi).

## 2. Hero `2071:3012`

| | Mobil | Tablet | Desktop |
|---|---|---|---|
| Ölçü | 100% × 170 | 100% × 250 | 100% × 320 |
| Loqo eni (maks.) | 244 | 520 | 520 |

Fon `--site-surface` (#F9F9F9), tünd versiyada `--site-logo-dark`. Radius 4. Loqo mərkəzdə, `object-contain`, qutudan çıxmır.

## 3. Versiya şəbəkəsi `2071:3017`

| | Mobil | Tablet | Desktop |
|---|---|---|---|
| Sütun | 2 | 2 | 4 |
| Gap | 12 | 20 | 20 |
| Kart | 165 × 228 | 322 × 243 | 231 × 282 |
| Önizləmə hündürlüyü | 120 | 170 | 170 |
| Info padding | 12 | 14 / 16 | 14 / 16 |

- Kart: ağ fon, haşiyə 1 `--site-logo-border` (#E5E5E5, INSIDE), radius 4, `overflow-hidden`. Bir sətirdəki kartlar eyni hündürlükdədir (grid stretch), hündürlük mətnə görə böyüyür. Desktop-da Figma kartı sabit 282-dir (məzmun 262), ona görə `desk:min-h-[282px]`. Tablet və mobildə məzmun Figma hündürlüyünü özü verir.
- Önizləmə: fon açıq `--site-surface`, tünd `--site-logo-dark` (#004976). Loqo ortada, padding 20 (mobil 12), `object-contain`.
- Info: gap 4. Ad 15/600 lh20 (mobil 14/600), `text-foreground` (#222222). İzah 13/400 lh19 (mobil 12/400), `--site-logo-muted` (#787878).
- Şəkil yoxdursa önizləmə boş qutudur, eyni ölçüdə.

## 4. Yükləmə sətri `2071:2815`

| | Mobil | Tablet | Desktop |
|---|---|---|---|
| Düzülüş | sütun, gap 12 | 3 sütun, gap 16 | 3 sütun, gap 20 |

- Kart: padding 20, gap 12, haşiyə `--site-logo-border`, radius 4, ağ fon. Fayl sayı 3-dən çoxdursa yeni sətrə keçir.
- Çip: pill (radius 100), haşiyə 1 `--site-logo-chip-border` (#CCD1D6), padding 4 / 12, 13/700, rəng `--site-text-strong` (#333333). Uzun ad sətrə bölünür.
- Ölçü: 13/400, `--site-logo-muted`. Ölçü yoxdursa sətir yoxdur.
- Düymə: `<a download>`, fon `--site-logo-download` (#E9FAF7), mətn `--site-logo-download-text` (#2E9C8C), radius 4, padding 8 / 12, gap 6. Ox ikonu 14, mətn 13/600 ("Yüklə" / "Download"). `aria-label` faylın adını daşıyır: "SVG yüklə, 48 KB".
- Hover: altdan xətt mətndə; focus: kitin `focus-visible` halqası.

## 5. Token-lar (`globals.css`, spec 040 bloku)

| Token | Dəyər | Mənbə |
|---|---|---|
| `--site-logo-border` | `var(--ui-color-neutral-200)` | #E5E5E5 |
| `--site-logo-dark` | `var(--ui-color-brand-500)` | #004976 |
| `--site-logo-download` | `var(--ui-color-secondary-50)` | #E9FAF7 |
| `--site-logo-download-text` | D-2: `oklch(0.628 0.1 181.1)` | #2E9C8C, kitdə yoxdur |
| `--site-logo-chip-border` | D-2: `oklch(0.858 0.009 247.9)` | #CCD1D6, kitdə yoxdur |
| `--site-logo-muted` | `var(--ui-color-neutral-500)` | #787878 |

Kitdə eyni hex olmayan dəyər D-2 sapmasıdır (`globals.css` başlığındakı qayda) və şərhdə Figma dəyəri yazılır.
