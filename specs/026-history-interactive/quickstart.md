# Quickstart: spec 026 yoxlaması

Bu bələdçi implementasiyanın spec-ə uyğunluğunu real icra ilə yoxlayır (WS VIII). Detallar:
[contracts/cms-markup.md](./contracts/cms-markup.md), [contracts/ui-contract.md](./contracts/ui-contract.md),
[data-model.md](./data-model.md).

## 0. Test məzmununun hazırlanması (redaktor, bir dəfə)

Test mühitinin admin panelində:

1. **"Tarix (Kopya)"** (`tarix-copy`): `13 fevral 2026 / ffgfgf` sınaq sətrini sil (research R3).
2. 1998 hadisəsinə `<p>[foto: tall]</p>` əlavə et (FR-004a yoxlaması üçün). Başqa bir hadisəyə
   (məs. 1992 "Manat dövriyyəyə buraxılıb") 1 şəkil əlavə et (`single`).
3. **en "History (copy)"**: slug `history-copy-2` → `history-copy` (research R2).
4. az **"Haqqımızda (Kopya)"**: slug `history-copy` səhvdir, `haqqimizda-copy` olmalıdır
   (research R2). Kod dəyişikliyindən sonra bu səhifə onsuz da `history` layout-u almayacaq.

## 1. Avtomatik yoxlama

```bash
cd product-rest/web-cbar-new
npm run verify                       # setup:check → self-contained → lint → typecheck → test:run → build
npx -y node@22 node_modules/vitest/vitest.mjs run src/features/about-content src/widgets/about-blocks   # CI Node 22
```

Gözlənilən: hamısı yaşıl. Yeni testlər bunlardır: `groupByYear`, foto düzülüşü və işarə (V1–V4),
`layoutFor(slug, locale)`, `HistoryStepper` (düymə, nöqtə, ←/→, hash, avtomatik keçid
`vi.useFakeTimers`, reduced-motion, lightbox).

Admin redaktoru üçün (işarənin roundtrip-də qaldığını yoxlayır):

```bash
cd product-rest/web-cbar-admin-new
npm run roundtrip -- "Tarix (Kopya)"
```

Gözlənilən: fərq yoxdur, `[foto: tall]` paraqrafı dəyişməyib.

## 2. Test API-yə qarşı lokal

```bash
cd product-rest/web-cbar-new && npm run local:testcbar     # :3002
```

| # | Addım | Gözlənilən | Spec |
|---|---|---|---|
| 1 | `/az/tarix-copy` aç | Hero, altında birinci ilin (1919) kartı, 2 hadisə rail ilə. Oxda bütün illər, 1919 aktiv | US1-1, US1-2 |
| 2 | Oxda 1998-ə klik | 1998 kartı, 3 şəkil `tall` düzülüşündə. Ünvan `#1998`. 1919…1995 nöqtələri "keçilmiş" | US1-4, US2, FR-004a |
| 3 | "Növbəti" düyməsini sonuncu ilə qədər bas | Sonuncu ildə "Növbəti" deaktivdir. "Geri" düyməsi əvvəlki səhifəyə qaytarır | US1, US2-4 |
| 4 | `/az/tarix-copy#year-1992` aç | 1992 kartı (5 hadisə), avtomatik keçid yoxdur | US2-2, US4-3 |
| 5 | `/az/tarix-copy#1850` aç | 1919 kartı, xəta yoxdur | US2-3 |
| 6 | Hash-siz aç, 13 s gözlə (timeline ekranda) | 2 dəfə il dəyişir | US4-1 |
| 7 | 6-dan sonra siçanı karta gətir, 10 s gözlə | İl dəyişmir | US4-4 |
| 8 | OS-də "hərəkəti azalt" aç, səhifəni yenilə | Avtomatik keçid və solma yoxdur | US4-2 |
| 9 | Yalnız klaviatura: Tab ilə oxa, ←/→ | İl dəyişir, fokus halqası görünür | US3-1 |
| 10 | 1998 şəklinə klik → Escape | Dialog açılır, fokus "×"-dadır. Bağlananda fokus şəklə qayıdır. Açıq ikən ←/→ il dəyişmir | US5 |
| 11 | DevTools → JavaScript söndür, yenilə | Bütün illər alt-alta, düymələr yoxdur, ox nöqtəsi lövbərə sürüşdürür, şəkil yeni tabda açılır | US6-1 |
| 12 | `view-source:` | Bütün hadisə başlıqları HTML-dədir | US6-2 |
| 13 | Çap önizləməsi (1998 aktivkən) | Bütün illər var. Ox, düymələr, halqalar yoxdur | US6-3 |
| 14 | Mobil emulyator 390: kartı sola sürüşdür | Növbəti il. Şaquli sürüşdürmə səhifəni sürüşdürür. Ox aktiv ili ortaya gətirir | US3-2, US3-3 |
| 15 | `/en/history-copy` | Eyni davranış, ingilis etiketləri | Edge Cases |
| 16 | `/az/tarix`, `/en/history` | Məzmun cədvəl deyil → 024 `plain` görünüşü, xəta yoxdur | FR-022 |
| 17 | `/az/history-copy` ("Haqqımızda (Kopya)", slug düzəlməyibsə) | `about-main` layout-u, timeline deyil | R2 |

## 3. Vizual (Figma ilə tutuşdurma)

Figma-da "CBAR Figma bridge" plugin-i açıq olmalıdır. 1728, 744 və 390 enlərində brauzerdə
`getBoundingClientRect` ilə kart, ox, düymə və foto ölçülərini ui-contract-dakı dəyərlərlə
tutuşdur (SC-003: ±2 px). Fərqləri `visual-diff.md`-yə yaz (024-ün formatı ilə).

SC-004 üçün hər enlikdə `document.documentElement.scrollWidth === innerWidth` olmalıdır.

## 4. Redaktor ssenarisi (SC-007, SC-008)

1. Admin paneldə "Tarix (Kopya)"-ya yeni sətir əlavə et: `<p>4 aprel 2027</p>` | başlıq + mətn.
2. Saxla → `/az/tarix-copy`-ni yenilə → oxda 2027, kartda yeni hadisə var. Deploy lazım olmayıb.
3. Bir hadisəyə `[foto: hero2]` yaz → saxla → yenidən aç: paraqraf yerindədir, saytda düzülüş dəyişib.
