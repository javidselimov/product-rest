# Tasks: Mərkəzi Bankın loqosu

**Input**: `specs/040-media-logo/` (plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

**Tests**: Layout guard (FR-012) və davranış testləri layihə qaydasıdır (root CLAUDE.md), ona görə daxildir.

Yollar: `site/` = `product-rest/web-cbar-new/`, `admin/` = `product-rest/web-cbar-admin-new/`.

## Phase 1: Setup

- [x] T001 Kit primitivlərində #2E9C8C, #CCD1D6, #787878 dəyərlərini yoxla və spec 040 token blokunu əlavə et (`--site-logo-border`, `-dark`, `-download`, `-download-text`, `-chip-border`, `-muted` + `@theme inline` adları) in site/src/app/globals.css

## Phase 2: Foundational

- [x] T002 `formatFileSize(bytes, locale)` və `fileFormatLabel(mimeType, name)` əlavə et, `entities/content/index.ts`-dən ixrac et in site/src/entities/content/lib/files.ts
- [x] T003 `formatPhotoSize`-ı `formatFileSize`-a köçür (təkrar silinir, davranış eyni) in site/src/features/organization/model/photos.ts
- [x] T004 [P] `formatFileSize`/`fileFormatLabel` testləri in site/src/entities/content/lib/files.test.ts
- [x] T005 `'brand-logos'` layout növü, `LogoVersion`, `LogoDownload`, `BrandLogosBlock` tipləri, `AboutBlock` birliyinə əlavə in site/src/features/about-content/model/types.ts
- [x] T006 [P] `MIN_LOGO_CELLS`=3, `MAX_LOGO_CELLS`=4, `MAX_LOGO_VERSIONS`=8, `DARK_LOGO_BACKGROUNDS` in site/src/features/about-content/model/constants.ts

## Phase 3: User Story 1 + 2 — loqonu görmək/yükləmək, redaktor idarəsi (P1)

**Goal**: Səhifə Figma görünüşündə, bütün məzmun və fayllar admin paneldən.

**Independent Test**: Fikstür HTML + 3 fayl ilə view testi: Hero, 4 kart, tünd fon, 3 yükləmə kartı ölçü ilə, `Attachments` yoxdur.

- [x] T007 [US1] Parser `parseBrandLogos(nodes, files)` (contracts/cms-markup.md qaydaları 1–9) in site/src/features/about-content/model/brand-logos.ts
- [x] T008 [US1] `parseAbout`-da `brand-logos` dispatch-i (`context.files`) in site/src/features/about-content/model/parse.ts
- [x] T009 [US1] `MEDIA_LAYOUTS`-a 4 slug in site/src/features/about-content/model/layouts.ts
- [x] T010 [P] [US1] Parser testləri (uyğun cədvəl, fon sözləri, şəkilsiz sətir, 2 xanalı sətir → adi məzmun, 9 sətir, ikinci cədvəl, fayl adı/uzantı, `mediaLayoutFor`) in site/src/features/about-content/model/brand-logos.test.ts
- [x] T011 [US1] Widget `BrandLogos`: Hero, intro, versiya şəbəkəsi, rest, yükləmə kartları (contracts/ui-contract.md) in site/src/widgets/about-blocks/brand-logos.tsx
- [x] T012 [US1] `case 'brand-logos'` in site/src/widgets/about-blocks/about-blocks.tsx
- [x] T013 [US1] Bu blokda `Attachments` göstərilməsin in site/src/views/cms-page/index.tsx
- [x] T014 [P] [US1] "Yüklə"/"Download" və aria etiketi in site/src/locales/az/media.json, site/src/locales/en/media.json
- [x] T015 [P] [US1] Widget testi (rol, keçid `download`, aria-label, tünd fon, şəkilsiz kart, fayl yoxdursa sətir yoxdur) in site/src/widgets/about-blocks/brand-logos.test.tsx
- [x] T016 [US1] Loader + view testi MSW ilə (`/pages/merkezi-bankin-logosu`, assets) in site/src/views/cms-page/brand-logos.test.tsx

## Phase 4: User Story 2 guard — redaktor markup-ı itirmir (P1)

- [x] T017 [US2] Guard fikstürü (redaktorun saxladığı forma, `colspan`/`rowspan`, 4 sətir, şəkillər) in site/src/features/about-content/fixtures/brand-logos.html
- [x] T018 [US2] `EXPECTED_BLOCKS`-a `'brand-logos': ['brand-logos:4']` və `blockShape` case in site/src/features/about-content/model/layout-fixtures.test.ts
- [x] T019 [P] [US2] Eyni fikstürü kopyala in admin/src/features/rich-text/fixtures/layouts/brand-logos.html
- [x] T020 [US2] Siyahıya `'brand-logos'` in admin/src/features/rich-text/roundtrip.test.ts

## Phase 5: User Story 3 — hazır məzmun (P2)

- [x] T021 [P] [US3] Hazır HTML və yapışdırma addımları in merkezi-bankin-logosu-html/az.html, en.html, README.md

## Phase 6: Polish

- [x] T022 [P] Redaktor təlimatı in dokumentasiyalar/merkezi-bankin-logosu-guide.md
- [x] T023 [P] Media bələdçisinə bölmə in site/docs/media-cms-guide.md
- [x] T024 [P] Qeydlər: site/CLAUDE.md §3 Media, root CLAUDE.md Media siyahısı
- [x] T025 `npm run verify` site və admin-də (Node 24 və Node 22), nəticəni qeyd et
- [x] T026 quickstart.md §2–3: test API ilə real səhifə və Figma ölçüləri (1728/744/390)

## Əlavə (2026-11-12): format arxivləri

- [x] T027 [US2] FR-016: spec-ə ssenari, edge case və fərziyyə; kod dəyişmir (yükləmə kartı artıq istənilən faylı, o cümlədən ZIP-i verir)
- [x] T028 [US2] Təlimat: dokumentasiyalar/merkezi-bankin-logosu-guide.md-də "Format arxivləri" bölməsi, site/docs/media-cms-guide.md-də qeyd, merkezi-bankin-logosu-html/README.md addım 5

## Dependencies

- T001 → T011. T002 → T003, T004, T011. T005, T006 → T007 → T008 → T010, T016–T018.
- T011 → T012 → T013 → T015, T016. T017 → T019 (eyni bayt). T018, T020 → T025.
- US3 və Polish US1/US2-dən sonra (məzmun qaydası sabit olmalıdır).

## Parallel

- T004, T006 birlikdə; T010, T014, T015 parser və widget hazır olandan sonra; T019, T021–T024 bir-birindən asılı deyil.

## Implementation Strategy

MVP = Phase 1–4 (site + guard), sonra hazır HTML və sənədlər. Hər addımda `vitest run` həmin fayl üçün, sonda tam `verify`.

## İcra qeydi (2026-11-11)

- `npm run verify`: web-cbar-new 129 fayl / 1224 test, build keçir; web-cbar-admin-new 60 / 550, build keçir. Admin-də
  `organization.test.tsx` iki verify paralel gedəndə bir dəfə timeout oldu, tək işlədəndə və təkrar verify-da keçdi.
- Node 22: təsirlənən testlər (sayt 199, admin rich-text 26) keçir.
- Ölçmə (fikstür proxy + headless Edge, 1728/744/390): Hero, aralıqlar (36/32/28), başlıq (24/22/20), kartlar, önizləmə,
  yükləmə kartları, çip və düymə Figma ilə 1 px daxilində. Desktop kartı 262 idi, `min-h` ilə 282 edildi.
- Admin API EPS/AI qəbul etmir: təlimat ZIP göstərir, backend dəyişmədi.
