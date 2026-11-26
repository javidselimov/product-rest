# Vizual müqayisə — 029 Xəbərlər / Elanlar (SC-001)

Ölçmə: headless Edge 156 + CDP (`getBoundingClientRect` / `getComputedStyle`), istifadəçinin
`local:testcbar` dev serveri (:3002, test API), 2026-11-02. Sürüşmə zolağı gizlədilib
(`--hide-scrollbars`), ona görə x koordinatları Figma ilə eyni şkaladadır (konteyner 1728-də
204-dən başlayır). Figma: "cbar website (Copy)" → Media → section "Xəbərlər" `1333:30585`.
Tolerans ±2px.

## Siyahı — uyğun gələn ölçülər

| En | Element | Figma | Sayt |
|---|---|---|---|
| 1728 | Menyu / məzmun sütunu | 312 · 24 · 984 | menyu 204 w312, məzmun x540 w984 (204+312+24 ✓) |
| 1728 | H1 → filtr | 36 | 288+44 → 368 = 36 ✓ |
| 1728 | Filtr sətri | 984×44, space-between | 540,368 · 984×44 |
| 1728 | Axtarış / tarix aralığı | 312×44, aralarında 24 | 540 w312 h44 · 876 w312 h44 (24 ✓) |
| 1728 | "Filtrləri təmizlə" → "Axtar" | 106 · 24 · 144×44 | 105 · 24 · 144×44, sağ kənar 1524 = məzmun kənarı ✓ |
| 1728 | Filtr → grid | 60 | 412 → 472 = 60 ✓ |
| 1728 | Grid | 3 × 312, gap 24 / 24 | 3 sütun, 312, üfüqi 24, şaquli 24 ✓ |
| 1728 | Kart şəkli | 312×197 | 312×197 |
| 1728 | Şəkil → tarix → başlıq | 24 · 16 | 24 · 16 ✓ |
| 1728 | Tarix / başlıq şrifti | 16/600 lh28 · 20/600 lh28 | 16/600/28 · 20/600/28 |
| 1728 | Grid → paginasiya, düzlənmə | 60, sağda | 60, siyahı 1332…1524 (sağda ✓) |
| 744 | Grid / filtr | 2 × 320, gap 24; filtr alt-alta gap 16 | 2 × 320 (40, 384), gap 24; axtarış, tarix, düymələr alt-alta, gap 16 |
| 390 | Grid / H1 | 1 × 342; H1 22/600 lh28 | 1 × 342; 22/600/28 |
| hamısı | Üfüqi sürüşmə / H1 sayı | yox / 1 | `scrollWidth === innerWidth` / 1 |

## Detal — uyğun gələn ölçülər

| En | Element | Figma | Sayt |
|---|---|---|---|
| 1728 | H1 → örtük | 36 | 288+132 → 456 = 36 ✓ |
| 1728 | Örtük | 984×502 | 540,456 · 984×502 |
| 1728 | Örtük → tarix | 32 | 958 → 990 = 32 ✓ |
| 1728 | Tarix | 14/400 lh28 | 14/400/28 |
| 390 | Örtük | tam en, eyni nisbət | 342×174 |
| 1728 | Breadcrumb | Ana səhifə › Media › Xəbərlər › {başlıq} | Ana səhifə › Media › Press-relizlər › {başlıq}; son element link deyil, menyuda bənd aktiv |

Fotoqalereya brauzerdə ölçülməyib: test mühitindəki 43 yazının hər birində ən çox **1** şəkil var
(2026-11-02), ona görə qalereya orada heç vaxt görünmür. Davranışı `photo-gallery.test.tsx` və
`press-release.test.tsx` örtür; ölçülər ui-contract §3.1-dən class-larla verilib (984/601, 180×124,
gap 24, oxlar 44). Real çoxşəkilli xəbər gələndə ölçülməlidir.

## Qəbul edilmiş fərqlər

| # | Element | Figma | Sayt | Səbəb |
|---|---|---|---|---|
| 1 | Tarix aralığı placeholder-i | "from dd.mm.yyyy - to dd.mm.yyyy" | brauzerin native `<input type="date">` formatı | JS-siz GET forması üçün native input (research R3) |
| 2 | Kart tarixinin qutusu | 24 hündür (lh28 mətn) | 28 | Figma qutusu lineHeight-dən kiçikdir; kartdakı aralıqlar (24/16) dəqiqdir, kart 4px uzundur |
| 3 | Tarix rəngi | `#787878` | `text-muted-foreground` (≈ `#737373`) | semantik token, ton fərqi ≤ 1 pillə |
| 4 | Detal H1 rəngi | `#333333` | `text-foreground` `#222` | 028-dən qəbul edilmiş fərq |
| 5 | Planşet filtr bloku | 172 hündür | 164 | düymə sırası Figma-da 52, saytda 44 (düymə hündürlüyü) |
| 6 | Başlıq / menyu adı | "Xəbərlər" | "Press-relizlər" | ad CMS ağacındadır; redaktor bəndi adlandırmalıdır (spec 028 "Redaktor tapşırıqları") |
| 7 | Kart hündürlüyü | 345 (3 sətirlik başlıq) | 377–405 | test datasında başlıqlar 4–5 sətirdir; Figma sətir limiti qoymur |
| 8 | Seçilmiş miniatür çərçivəsi (qalereya) | 2px INSIDE `#D4D4D4` (neutral-300) | 2px INSIDE `site-accent` (`#4BC7B5`), `after:` overlay | boz placeholder və şəkil üzərində `#D4D4D4` görünmür; aktiv ox ilə eyni rəng; istifadəçi qərarı 2026-11-03 |
