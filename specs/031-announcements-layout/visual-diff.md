# Vizual müqayisə — 031 Elanlar (SC-001, SC-002)

Ölçmə: headless Edge + CDP (`getBoundingClientRect` / `getComputedStyle`, `--hide-scrollbars`,
`Emulation.setDeviceMetricsOverride`), istifadəçinin `local:testcbar` dev serveri (:3002, test API),
2026-11-03. Figma: "cbar website (Copy)" → Media → `Media - Elanlar` `1048:21679` (kart `1048:23221`),
tablet `1658:17103`, mobil `1658:17608`; detal `Media - Elanlar -Elan` `1298:20343`. Tolerans ±2px.
Test mühitində 23 elan var, hamısı şəkilsiz.

## Siyahı `/az/press-releases?type=2` — uyğun gələn ölçülər

| En | Element | Figma | Sayt |
|---|---|---|---|
| 1728 | H1 / məzmun sütunu | 32/600 lh44, x540 w984 | 540,288 · 984×44 |
| 1728 | Grid | 3 × 312, gap 24 / 24 | 540,472 · 3 sütun 312, üfüqi 24, şaquli 24 ✓ |
| 1728 | Kart | 312 en, şəkil qutusu yoxdur, padding 0 | 312 en, `img` 0, padding 0, radius 4, çərçivə 0 |
| 1728 | Tarix | 16/600 lh28 `#787878` | 16/600/28, `text-muted-foreground` (029-da qəbul edilmiş ton fərqi) |
| 1728 | Tarix → başlıq | 16 | 16 ✓ |
| 1728 | Başlıq | 20/600 lh28 `#222` | 20/600/28, `text-foreground` |
| 744 | Grid / kart | 2 × 320, gap 24; kart padding 16, r4 | 2 × 320 (x 40, 384), gap 24 / 24; padding 16, radius 4, çərçivə 0 |
| 744 | Tarix → başlıq | 16 | 16 ✓ (mətn eni 288 = 320 − 2×16) |
| 390 | Grid / kart | 1 × 342; kart padding 16, r4 | 1 × 342 (x 24), şaquli gap 24; padding 16, radius 4 |
| 390 | H1 | 22/600 lh28 | 342×28 |
| hamısı | Üfüqi sürüşmə / `img` kartlarda | yox / yox | `scrollWidth === innerWidth` / 0 |

## Detal — uyğun gələn ölçülər (1728)

Elan: `/az/press-releases/sigorta-sektorunda-dayandirilmis-lisenziyalar-barede-melumat`.

| Element | Figma `1298:20343` | Sayt |
|---|---|---|
| H1 | 32/600 lh44 | 540,288 · 984×44 |
| Örtük | `1298:20356` gizli | render olunmur (`press-release-cover` yoxdur) |
| H1 → tarix | 36 | 36 ✓ |
| Tarix | 14/400 lh28 | 540,368 · 14/400/28 |
| Tarix → mətn | 24 | 24 ✓ |
| Fotoqalereya | yoxdur | yoxdur |
| Breadcrumb | Ana səhifə › Media › Elanlar › başlıq | eyni, "Elanlar" aktiv |

Xəbər reqressiyası (`/az/press-releases/merkezi-bankin-sedri-dunya-bankinin-numayende-heyeti-ile-gorusub`,
çoxşəkilli): örtük 540,412 · 984×502, H1 → örtük 36, tarix → mətn 24, fotoqalereya var — 029
`visual-diff.md` ilə eyni, dəyişməyib.

## Qəbul edilmiş / ölçülməmiş fərqlər

1. **Kart hündürlüyü** — Figma 96 (desktop) / 120 (tablet, mobil) iki sətirli başlıq üçündür; real
   başlıqlar 3 sətirdir → 128 / 160. Hündürlük məzmundan asılıdır, sabitlənmir (xəbər kartı ilə eyni
   yanaşma).
2. **Şəkilli elan detalı** — test mühitində şəkil qoşmalı elan yoxdur; "örtük/qalereya yoxdur, şəkil
   qoşma siyahısında fayl sətridir" yalnız MSW testləri ilə yoxlanılıb
   (`views/press-release/press-release.test.tsx`). Redaktor belə elan yaradanda bu abzas yenilənir.
3. **Tarix rəngi** — `#787878` vs `text-muted-foreground` (029 ilə eyni qəbul).
