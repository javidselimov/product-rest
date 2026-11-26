# UI kontrakt: Maliyyə savadlılığı

Ölçülər Figma-dan (bridge, 2026-11-16). Format: `en×hündürlük`, `gap`, `pad üst/sağ/alt/sol`, tipoqrafiya `çəki/ölçü/sətir`. Endlər: desktop 1728
(məzmun 984), tablet 744 (məzmun 664), mobil 390 (məzmun 342). Rəng tokenləri: hex Figma dəyəridir. Implement mərhələsində mövcud `site-*`
tokenlərinə xəritələnir, yeni token yalnız uyğunu yoxdursa əlavə olunur. Ölçmə üsulu: Edge CDP + `getBoundingClientRect`, `INSIDE` stroke
(memory: figma-measure-dom).

Şablon (breadcrumb, paylaşma, sol menyu 312px / tablet tam en / mobil `Page tools` altında, başlıq 32/44, mobil 22/28 və 24/32) spec 043-ün
`section-shell`-idir və dəyişmir. Sol menyunun bəndləri 600/16/28 `#222222`, bəndlər arası `gap 16`, qutu `pad 20`, `r4`, `#f5f5f5`.

## §1. `financial-literacy` — Figma `2236:67755` / `2248:3277` / `2248:3626`

| Element | Desktop | Tablet | Mobil |
|---|---|---|---|
| Məzmun sütunu (bloklar arası) | `gap 36` | `gap 32` | `gap 28` |
| Giriş mətni | 400/16/28 `#222222` | = | = |
| Bölmə (`section`) daxili | `gap 24` | `gap 24` | `gap 24` |
| Bölmə başlığı `h2` | 600/24/32 `#222222` | 600/24/32 | 600/20/28 |
| Alt başlıq `h3` | 600/18/26 | = | = |
| **Sitat** | tam en, `pad 28/32/28/32`, `r4`, fon `#f9f9f9`, sol xətt 4px `#43b7a7`, `gap 12` | = | `pad 20` |
| — mətn | 600/20/32 `#004976` | = | = |
| — mənbə | 500/14/28 `#787878` | = | = |
| **Prinsip kartları** | 4 sütun, kart 228×222, `gap 24` | 2 sütun 324×200, `gap 16` (sətir də 16) | 1 sütun 342×200, `gap 12` |
| — kart | `pad 24`, `gap 16`, `r4`, fon `#ffffff`, xətt 1px `#d4d4d4` | = | = |
| — ikon dairəsi | 48×48, `r24`, `#cff3ec`, ikon 24px | = | = |
| — başlıq | 600/18/26 `#222222` | = | = |
| — təsvir | 400/14/22 `#787878` | = | = |
| Kartların hündürlüyü | sıradakı ən hündür karta bərabər (`stretch`) | = | məzmuna görə |
| **Hədəf qrupu etiketləri** | 4 sütun 237×62, `gap 12` (sətir 12) | 2 sütun 326×62 | 1 sütun 342×62 |
| — etiket | `pad 12`, `gap 10`, `r4`, `#ffffff`, xətt 1px `#d4d4d4`, şaquli mərkəz | = | = |
| — ikon dairəsi | 36×36, tam dairə, `#e9faf7`, ikon 20px | = | = |
| — mətn | 600/13/18 `#222222`, iki sətrə keçə bilər | = | = |
| **Qalereya** (`PhotoGallery`) | böyük şəkil 984×601, zolaq 124, aralarında `gap 48`, oxlar 44 | 664×405, zolaq 110, `gap 32` | 342×228, zolaq 76, `gap 16`, oxlar 36 |
| **CTA** | üfüqi, `pad 40/48/40/48`, `gap 32`, `r4`, qradiyent `#0b4a7a → #052642` (≈160°), mətn bloku 634 en | şaquli, `pad 32`, `gap 20` | şaquli, `pad 24/20/24/20`, `gap 20` |
| — yuxarı sətir | 500/16/24 `#a6e8da` | = | = |
| — başlıq | 600/26/36 ağ | = | 600/22/30 |
| — ünvan sətri | 400/14/22 `#a6e8da` | = | = |
| — düymə | 48 hündürlük, `pad 0/24`, `r4`, `#4bc7b5`, mətn 500/16/28 `#004976`; sağda, şaquli mərkəz | solda, mətnin altında | tam en 342, mətn mərkəzdə |

Qalereyanın ölçüləri xəbər detalındakı `PhotoGallery` ilə eynidir (spec 029 `ui-contract.md` §3.1). Komponent dəyişmir, yalnız onun
konteyner eni yoxlanır.

## §2. `literacy-platform` — Figma portal `2261:5027`, Virtual `2421:2292` / `2421:85067` / `2421:85583`, infobank `2430:4715`

| Element | Desktop | Tablet | Mobil |
|---|---|---|---|
| Məzmun sütunu | `gap 32` | `gap 32` | `gap 28` |
| Giriş | `gap 16`, 400/16/28 | = | = |
| **Qeyd qutusu** | tam en, `pad 14/20/14/20`, fon `#e9faf7`, sol xətt 3px `#4bc7b5`, mətn 500/16/26 `#004976` | = | mətn 500/16/24 |
| **Foto sırası** | 3 sütun 312×208, `gap 24`, `r4`, boş qutu `#f1f2f4` | 3 sütun 205×160, `gap 24` | üfüqi sürüşmə, kart 280×190, `gap 12` |
| **Bölmə** | üst xətt 1px `#d4d4d4` (portalda `#e5e5e5`, bir rəng seçilir: `#e5e5e5`), `pt 24`, `gap 12` | = | = |
| — başlıq `h2` | 600/20/28 `#222222` | = | 600/18/28 |
| — mətn | 400/16/28 `#222222` | = | = |
| **Keçid düyməsi** | 48 hündürlük, `pad 0/24`, `gap 8`, `r4`, `#004976`, mətn 500/16/28 ağ, eni məzmuna görə | = | tam en 342, mətn mərkəzdə, 500/16/24 |

Foto sırasında 3-dən çox şəkil olarsa sıra növbəti sətrə keçir (desktop və tablet). Mobildə sürüşmə davam edir.

## §3. Davranış

- Bütün düymə və linklərdə `focus-visible` halqası var (`outline-ring`, mövcud qayda).
- CTA düyməsi `<a href="mailto:…">`-dir, `<button>` deyil.
- Keçid düyməsi `<a target="_blank" rel="noopener noreferrer">`-dir. Ekran oxuyucusu üçün "yeni pəncərədə açılır" mətni gizli şəkildə əlavə olunur.
- Foto sırasında hər şəkil faylı açan linkdir. Link adı `alt` mətnidir.
- Çapda qalereyanın oxları gizlənir, CTA düyməsi mətn kimi çap olunur (mövcud `print:` qaydaları).
