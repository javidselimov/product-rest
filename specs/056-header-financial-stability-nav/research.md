# Research: spec 056 — header naviqasiyası

Mənbələr: test API ağacı (`https://api-cbar-test.cbar.az/api/v1/pages/tree?locale=az|en`, 2026-11-23), Figma `I813:25657;9:29`
(nav zolağı), `1088:26873` (hamburger), kod (`web-cbar-new/src/shell`, `web-cbar-admin-new/src/features/pages`,
`api-cbar-admin/db/migrations/0041`).

## R1. "Maliyyə sabitliyi" bölməsinin quruluşu

- **Decision**: yeni kök səhifə (`maliyye-sabitliyi` / `financial-stability`). Altında sıra ilə: "Maliyyə sabitliyi hesabatı" (64),
  "Bank sektoru üzrə makroprudensial siyasət çərçivəsi" (65), "Dayanıqlı Maliyyə" (113, alt ağacı ilə). Kökün mətni boşdur.
- **Rationale**: istifadəçinin qərarı (spec, qərar 1). Ünvanlar slug-dır (`/{locale}/{slug}`), valideyn dəyişəndə dəyişmir. 64 və 65
  spec 054-də "Nəşrlər və tədqiqatlar"ın menyusundan çıxarılmışdı və spec 054 onların bu bölməyə köçməsini bu bölmənin spec-inə
  saxlamışdı (054 spec, "Əhatədən kənar").
- **Alternatives**: 113-ün adını dəyişmək (istifadəçinin ilk fərziyyəsi). Rədd edildi: mövzular fərqlidir və "Dayanıqlı Maliyyə" adı
  ilə axtarılan səhifə itərdi.
- **Səviyyələr**: 113-ün alt səhifələri 3-cü səviyyəyə düşür. `MAX_DEPTH = 3` onları saxlayır. 113-ün 4-cü səviyyəsi yoxdur
  (test API).

## R2. Nav zolağında 9 bölmə: en problemi

Figma zolağı 1320px-dir, `space-between`, mətn enləri (az, 14px semibold) 80+76+109+115+91+118+112+65+147 = 913, hamburger
ikonu 24. Kodda zolaq `gap-5` (20px), `desk`-dən aşağı `px-4`.

| En | Məzmun eni | 9 bölmə (az) | 8 bölmə (az, 9-cusuz) |
|---|---|---|---|
| ≥1360 (`desk`) | 1320 | 913 + 24 + 9·20 = 1117 ✅ | — |
| 1280 | 1248 | 1117 ✅ | — |
| 1024 (`lg`) | 992 | 1117 ❌ | 766 + 24 + 8·20 = 950 ✅ |

en başlıqları daha uzundur ("Publications and research", "National Currency"). Təxmini en eni 9 bölmə üçün ~1230, 1320-yə
sığır.

- **Decision**: `VISIBLE_SECTIONS = 9` (`desk`-dən), `VISIBLE_SECTIONS_NARROW = 8` (`lg`–`desk`). 9-cu bölmə zolaqda `max-desk:hidden`,
  hamburger panelində isə `desk:hidden`dır. Onda `lg`–`desk` arası panelin içindədir. Sərhəd `desk`-dir, çünki üst zolaq və spec 042
  qaydası da `desk`-dəndir. Bu sərhəd ölçmə ilə təsdiqlənir (quickstart §3). en 8 bölmə `lg`-də sığmasa 7-yə endirilir və
  `VISIBLE_SECTIONS_NARROW` dəyişir.
- **Rationale**: bir sabit dəyişikliyi və iki sinif. Siyahının özü serverdə qalır, JS ilə ölçmə yoxdur (progressive enhancement).
  Zolaq heç bir endə iki sətirə düşmür.
- **Alternatives**: (a) JS ilə "sığmayanı paneldə göstər" (priority+ nav). Rədd edildi: client komponenti və hidratasiyadan sonrakı
  sıçrayış lazım olur. (b) `lg`-də şrifti kiçiltmək. Rədd edildi: Figma-dan sapmadır. (c) 9-u `xl`-dən (1280) göstərmək. Rədd
  edildi: en eni 1248-ə yaxındır (təxmini 1230).

## R3. Kök bölməni hamburger panelindən çıxarmaq: hansı bayraq

- **Decision**: yeni sahə yoxdur. Kök bölmə üçün effektiv dəyər `isInDropdownNav(root)` = `showInDropdownNav ?? showInSideNav !== false`
  (`entities/page-node/lib/tree.ts`). `false` olan kök `desk`-dən hamburger panelində `desk:hidden` alır. Admin-in "Menyularda yox"
  seçimi (`showInSideNav: false, showInDropdownNav: false`) bunu verir. API `page_nav_details` sətrini yazmır, çünki `false` izlədiyi
  dəyərlə eynidir. Seed yalnız `page_details.show_in_side_nav = false` yazır.
- **Rationale**: istifadəçinin qərarı 3. Bayraq kök bölmələrdə indiyə qədər heç nəyə təsir etmirdi:
  - `isInSideNav` yalnız bölmənin uşaqlarına tətbiq olunur (`section-shell/model.ts`, `section-sidebar.tsx`);
  - `toSection` də yalnız uşaqları süzür.

  Ona görə yeni məna köhnə davranışı pozmur. Ağacda bayraqlar kök üçün də gəlir (test API: `showInSideNav`, `showInDropdownNav`
  hər node-da var), API və OpenAPI dəyişmir.
- **Risk**: hər hansı mühitdə kök bölmədə bayraq artıq söndürülübsə, o bölmə paneldən çıxar. Test API-də belə kök yoxdur. Prod
  deploy-dan əvvəl SQL ilə yoxlanır (quickstart §5).
- **Alternatives**: (a) spec 042 kimi saytda ünvan siyahısı. İstifadəçi rədd etdi. (b) Kök üçün ayrıca `showInHamburger` sütunu.
  Rədd edildi: yeni yoldaş cədvəl, API sahəsi və OpenAPI dəyişikliyi tələb edir, mövcud bayraq isə eyni işi görür.

## R4. Panelin sütun bölgüsü

Panel CSS `columns-4`-dür (`OverflowPanel`), bölmə `break-inside-avoid`, gizli bölmə `display:none`-dur və sütun hesabına girmir.
`desk`-də 6 bölmə qalır. Hündürlüklər (28px sətir, başlıqdan sonra 16, bəndlər arası 8, bölmədən sonra 24) təxminən belədir:

| Bölmə | Hündürlük |
|---|---|
| İstehlakçı | ≈240 (2 sətir başlıq + 4 bənd) |
| Rəqəmsal | ≈404 (8 bənd, ikisi 2 sətir) |
| Beynəlxalq | ≈196 |
| Savadlılıq | ≈224 |
| FinCERT | ≈52 |
| Naxçıvan | ≈80 |

Brauzerin balansı ən hündür bölməyə (≈404) bərabərləşdirir. Nəticə 1) İstehlakçı, 2) Rəqəmsal, 3) Beynəlxalq, 4) Savadlılıq + FinCERT
+ Naxçıvan olur, Figma ilə eynidir.

- **Decision**: layout dəyişmir, bölgü brauzerdə ölçülür (quickstart §3). Uyğun gəlməsə ehtiyat yol `desk`-də `grid grid-cols-4` +
  bölmə başına sütun nömrəsidir. Bu tasks-da şərti tapşırıqdır.
- **Rationale**: əvvəl ölç, sonra dəyiş. Hesab Figma bölgüsünü verir.

## R5. Seed: nömrə, şərtlər, təkrar icra

- **Decision**: `api-cbar-admin/db/migrations/0042-financial-stability-nav-seed.sql`, 0041 nümunəsi ilə bir `DO` bloku:
  - imtiyaz yoxlaması (`has_table_privilege`), yoxdursa `WARNING` + çıxış;
  - səhifələr az slug ilə tapılır (id-lər mühitlərə görə fərqlidir);
  - mərhələ A: "Maliyyə sabitliyi" yoxdursa yaradılır. 64 və 65 yalnız hələ "Nəşrlər və tədqiqatlar"ın altındadırsa, 113 yalnız
    hələ kökdürsə köçür. Köçən səhifənin `path`-i alt ağacı ilə yenilənir (0041 kimi);
  - mərhələ B: "Rəqəmsal maliyyə ekosistemi" yoxdursa 8 uşağı ilə yaradılır. Slug tutulubsa `-2` alır (SlugService kimi,
    "Açıq bankçılıq" → `aciq-bankciliq-2`, en `open-banking-2` lazım olsa);
  - mərhələ C (yalnız A və ya B bu icrada nəsə yaradıbsa): kök bölmələrin `sort_order`-i Figma sırası ilə yenidən nömrələnir,
    siyahıda olmayan köklər axırda öz sırası ilə qalır. 4 bölmə `page_details.show_in_side_nav = false` alır
    (`ON CONFLICT DO UPDATE`). "Dayanıqlı Maliyyə (Kopya)" (459) menyulardan çıxır (`DO NOTHING`);
  - hər addım `RAISE NOTICE` ilə sayını yazır.
- **Rationale**: root `CLAUDE.md` migration qaydaları:
  - append-only, `BEGIN/COMMIT` yoxdur;
  - mövcud cədvəllərə `ALTER` yoxdur, yalnız DML;
  - fayl adı hər iki API-də təkdir (`api-cbar`-da migration yoxdur).

  Redaktorun sonrakı dəyişikliyi ikinci icrada toxunulmaz qalır, çünki C yalnız yaradılış icrasında işləyir.
- **Nömrə**: spec 054-ün `0042-working-papers-seed.sql`-ı "o vaxt növbəti boş nömrə" kimi planlaşdırılıb (054 research R13). Runner
  açarı tam fayl adıdır, ona görə ad toqquşması olmur. 054 US6 `0043`-ü götürür, bunu 054-ün tasks-ına qeyd etmək lazımdır.
- **Alternatives**: seed-i Node generatoru ilə qurmaq (0041 kimi). Rədd edildi: 10 sabit səhifə üçün generator artıqdır.

## R6. Admin kartı kök bölmə üçün

- **Decision**: `menuVisibility` kök üçün "Üst menyu" sətrini əvvəlki kimi "Görünəcək" saxlayır: nav zolağı, planşet paneli, mobil
  çekmecə və footer bölməni göstərir. Kök "Menyularda yox"dursa sətrə qeyd əlavə olunur: "Geniş ekranın hamburger panelində
  görünməyəcək. Nav zolağındakı ilk 9 bölməyə təsir etmir." Kök üçün "Menyularda yox" seçiminin izahı (`noneRoot`) ayrıca mətndir.
  `MENU_BAR_SECTIONS = 9` admin modelində saytın `VISIBLE_SECTIONS`-unun güzgüsüdür, faylın başlıq şərhində bağlantı yazılır (mövcud
  `MENU_MAX_DEPTH` nümunəsi).
- **Rationale**: FR-013, US3 §3–4. Bölmənin ictimai ağacdakı sırasını admin-də hesablamaq (dildə görünən köklər, sıra) iki yerdə
  eyni qaydanı tələb edərdi. Qeyd sırasız da doğrudur.
- **Alternatives**: üçüncü "Hamburger paneli" sətri. Rədd edildi: bu sətir yalnız kök üçün mənalıdır, qalan səhifələrdə boş qalardı.

## R7. Deploy sırası

- **Decision**: əvvəl `api-cbar-admin` (seed), sonra `web-cbar-new`, `web-cbar-admin-new` istənilən vaxt.
- **Rationale**: yeni sayt seed-dən əvvəlki ağacda 9-cu bölmə kimi "Media"nı zolağa qoyardı. Seed-dən sonra köhnə sayt kök
  bayraqlarına baxmır və 8 bölmə göstərir ("Nəşrlər" hamburgerə keçir). Bu, qısa və zərərsiz aralıq vəziyyətdir.

## R8. Boş səhifələrin görünüşü

- **Decision**: kod dəyişmir. Ümumi CMS səhifəsi (`views/cms-page`, şablonsuz bölmə) uşaqları olan səhifədə `ChildPageCards`, boş
  yarpaqda boş `CmsContent` + sol menyu (`SectionSidebar`) göstərir. Hər iki yeni kök uşaqlıdır, ona görə uşaq kartları görünür.
  Səkkiz boş alt səhifə başlıq və sol menyu ilə açılır.
- **Rationale**: FR-012. Yeni `SectionKey` lazım deyil, çünki Figma şablonu yoxdur.

## Ölçmə nəticələri (2026-11-23, T011/T019)

Ölçmə şəraiti: headless Edge (CDP), `next start` :3012, test API + seed-in ağacını qaytaran proxy (`.tmp-056/proxy.mjs`,
ağacın forması PGlite-də 0042-nin nəticəsi ilə eynidir).

| En | az zolaq | en zolaq | Sətir | Zolaqda sürüşmə / səhifədə sürüşmə |
|---|---|---|---|---|
| 1440, 1360 | 9 (Figma ilə 9/9) | 9 | 1 | 0 / 0 |
| 1359, 1280, 1024 | 8 (9-cu paneldə) | 8 | 1 | 0 / 0 |

- **R2 təsdiqləndi.** en 1024-də 8 bölmə sığır, `VISIBLE_SECTIONS_NARROW = 8` qalır.
- **R4 təsdiqlənmədi.** Balans az-da "Maliyyə savadlılığı"nı 3-cü sütuna qoydu, Figma-da isə o, 4-cü sütundadır. Ehtiyat yol
  (T020) grid yox, `columns-4` + `desk`-də 2–4-cü görünən bölmədən əvvəl `break-before: column` oldu (`OVERFLOW_PANEL_COLUMNS`). DOM
  dəyişmir. Firefox multicol-da sütun keçidini dəstəkləmir və balansda qalır. Sonra az 1440-da sütunların `x`-i 120 / 433 / 745 /
  1058 oldu, Figma-dan hesablanan 120 / 432.7 / 745.3 / 1058 ilə eynidir. en-də bölgü də Figma formasındadır.
- **Fərq: bəndlər arası məsafə.** Figma bu ölçüdə özü ilə uyğun deyil: İstehlakçı və Beynəlxalq sütunlarında 8px, Rəqəmsal-da 10px,
  Savadlılıq-da 16px. Kodun `gap-2`-si (8px, spec 022) əksəriyyətə uyğundur və dəyişmədi. Ona görə 4-cü sütunda FinCERT Figma-dan
  16px yuxarıdadır (226 / 242).
