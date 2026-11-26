# UI contract — FinCERT səhifəsi (web-cbar-new)

Figma "cbar website (Copy)" › "FinCERT" `2663:138955`: desktop `2678:3933` (1728), tablet `2683:99005` (744), mobil `2683:99847` (390); akkordion
komponenti `2678:3924` (açıq: desktop `2678:3838`, mobil `2685:3885`, tablet `2684:3862`). Ölçülər `figma_node` ilə oxunub (2026-11-18). Yoxlama
Figma rəqəmi + brauzerdə `getBoundingClientRect` ilə aparılır (Figma ↔ DOM; INSIDE stroke qutuya daxildir).

**Gizli qatlar qurulmur**: "On this page" `2678:3940`, "Anchors" `2685:3946`/`2685:3983`, üçüncü əlaqə kartı "İnsident hesabatı".

Breakpoint-lər saytın mövcud `tab:` (744) və `desk:` dəyişənləridir; konteyner `SHELL_CLASS` (desktop məzmun eni 1320). Rənglər semantik token-larla
(research R13): `#222222` foreground, `#004976` primary, `#787878` muted-foreground, `#a3a3a3` muted-foreground (zəif), `#e5e5e5`/`#d4d4d4` border,
`#e6eef4` və `#f5f5f5` — mövcud `--site-*` token və ya yeni `--site-fincert-*`.

## 1. Səhifə çərçivəsi

| | Desktop | Tablet | Mobil |
|---|---|---|---|
| Breadcrumb + paylaşma | bir sətir, `PageTools` (FAQ kimi) | iki sətir, gap 10 | iki sətir, gap 12, breadcrumb öz içində sürüşür |
| H1 "FinCERT" | 32/44 w600 | 32/44 w600 | 24/32 w600 |
| H1 → ilk bölmə | 36 | 36 | 24 |
| Bölmələr arası | 56 | 48 | 40 |
| Bölmə başlığı (h2) | 24/32 w600 | 24/32 w600 | 20/28 w600 |
| Başlıq → məzmun | 20 | 20 | 20 |
| Son bölmə → footer | 120 | mövcud `pb` (FAQ) | mövcud `pb` (FAQ) |

Sol menyu yoxdur, məzmun tam enlikdədir (FAQ, spec 051 kimi). Hər bölmə `<section id="<anker>" aria-labelledby>`; ankerlər `data-model.md`.

## 2. Missiya

Mətn 20/32 w500 foreground (desktop, tablet), 18/28 w500 (mobil). Başlıq yoxdur (Figma). Bir neçə paraqraf olarsa aralarında 16.

## 3. Fəaliyyətin əsas istiqamətləri — akkordion

- Siyahı: yuxarıda 1 px `border`; hər bənd altda 1 px `border`, ağ fon.
- `<summary>`: desktop padding 20/24, gap 20; tablet 20/20, gap 16; mobil 16/16, gap 12. Elementlər: nömrə dairəsi, başlıq (flex-1), ox ikonu 20.
- Nömrə dairəsi: desktop/tablet 36 (r 18) 16/22 w600; mobil 32 (r 16) 14/20 w600. Bağlı: fon `#e6eef4`, rəqəm primary. Açıq: fon primary, rəqəm ağ.
- Başlıq: desktop/tablet 18/26 w600, mobil 16/24 w600; bağlı foreground, açıq primary. Ox açıqda 180° fırlanır (reduced-motion: keçidsiz).
- Gövdə (açıq): desktop padding 0/64/28/80 (sol kənar başlıqla düzlənir: 24 + 36 + 20), tablet 0/20/24/72, mobil 0/16/20/16. Elementlər arası 12. Mətn
  16/26 (desktop, tablet), 16/28 (mobil) foreground. Siyahı: bəndlər arası 10, nöqtə 6 px primary dairə, nöqtə ↔ mətn 12.
- Fokus: `summary`-də görünən fokus halqası (`focus-visible`). Çap: `data-accordion` açıq.

## 4. Əlaqə məlumatları

| | Desktop | Tablet / mobil |
|---|---|---|
| Düzülüş | iki sütun, gap 24 | alt-alta, gap 12 |
| Kart | şaquli, padding 24, gap 16, r 4, 1 px `border` (`#d4d4d4`), ağ | üfüqi (ikon solda), padding 20, gap 16, hündürlük 90 |
| İkon dairəsi | 48 (r 24), fon `#f5f5f5`, ikon 24 primary | eyni |
| Mətn | etiket 14 w600 muted, dəyər 18/24 w500 primary, aralarında 6 | eyni |

Kartın özü link-dir (`mailto:`, `tel:`); bir dolu dəyər olarsa tək kart desktop-da bir sütun enində qalır.

## 5. Hesabat portalı

| | Desktop | Tablet | Mobil |
|---|---|---|---|
| Kart | üfüqi, padding 24/28, gap 24, r 4, 1 px `border` | şaquli, padding 24, gap 16 | şaquli, padding 20, gap 16 |
| İkon dairəsi | 44 (r 22), fon `#e6eef4`, ikon 22 primary | eyni | eyni |
| Mətn | başlıq 18/26 w600, təsvir 16/28 w400 muted (zəif), gap 6, flex-1 | eyni | eyni |
| Düymə | kit `Button` solid primary, padding 12/20, gap 8, 16/22 w600, xarici link ikonu 18 | eni məzmun qədər | tam en |

## 6. RFC-2350

Kart üfüqi, padding 16/20, gap 16, r 4, 1 px `border`, ağ; ad 16/22 w600 (flex-1). Sağda fayl çipi: padding 8/12, gap 10, r 4, 1 px `border`; nişan
padding 2/6, r 3, 11/14 w600 ağ mətn, PDF fonu (mövcud fayl nişanı rəngi); endirmə ikonu 14 primary. Bütün kart bir link (research R7). Üç cihazda
eyni.

## 7. Beynəlxalq əməkdaşlıq

| | Desktop | Tablet | Mobil |
|---|---|---|---|
| Kart | üfüqi, padding 24/28, gap 24, r 4, 1 px `border` | üfüqi, padding 24, gap 24 | şaquli, padding 20, gap 16 |
| Loqo | 120 × 48, `SiteImage` `object-contain` | eyni | eyni, yuxarıda |
| Mətn | ad 18/26 w600, təsvir 16/28 muted (zəif), gap 4 | gap 6, nişan mətnin altında | gap 6, nişan altda |
| Nişan | desktop-da sağda; padding 6/12, r 4, 13/18 w600 muted | | |

Nişanın fonu implementasiyada `figma_node` ilə dəqiqləşdirilir (summary-də görünən fill yoxdur). `url` varsa bütün kart xarici linkdir (yeni vərəq);
loqo yoxdursa loqo yeri tutulmur.

## 8. Vəziyyətlər

- JS-siz: hər şey işləyir (akkordion native, linklər adi `<a>`). Client komponenti yoxdur (`Reveal` istisna, spec 049).
- Reveal: hər bölmə bir `Reveal` (iç-içə yox); kartlar ayrıca bükülmür.
- Boş bölmə render olunmur; hamısı boşdursa FinCERT view yox, CMS səhifəsi (FR-016).
- Loading: mövcud `[locale]/loading.tsx` (ayrıca skeleton tələb olunmur).
