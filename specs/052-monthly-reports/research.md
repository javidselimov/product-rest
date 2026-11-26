# Research: spec 052 — Aylıq hesabatlar

Mənbələr: test API (`api-cbar-test.cbar.az`, 2026-11-18), spec 050 kodu (`web-cbar-new/src/features/about-content/model/{year-archive,
complaint-index,appeal-statistics}.ts`, `views/cms-page/loader.ts`), spec 045 (`memorandums`) və spec 009 (`image-popups`, dil üzrə media sahəsi)
nümunələri, admin CRUD mühərriki (`shared/crud/types.ts`).

## R1 — Məlumat modeli: seriya cədvəli + hesabat + dil üzrə fayl

**Decision**: Üç cədvəl:
- `monthly_report_series`: sabit üç sətir, `key`, `period_months`, `sort_order`.
- `monthly_report_series_translations`: seriyanın az/en adı.
- `monthly_reports`: seriya, il, ay, status, audit sütunları, soft delete.

Bundan əlavə `monthly_report_translations (report_id, locale, media_id)` cədvəli: hər dilin öz faylı. Unikallıq `(series_id, year, month)` üzrədir,
yalnız silinməmiş sətirlər arasında (partial unique index).

**Rationale**:
- Seriyanın adı redaksiya mətnidir (saytda sənədin başlığıdır). Kök `CLAUDE.md`-yə görə redaksiya mətni API-dən gəlir, saytın `locales`-ində
  saxlanmır.
- Dil üzrə fayl `<entity>_translations (entity_id, locale)` konvensiyasına uyğundur (konstitusiya V.3). Gələcəkdə üçüncü dil əlavə olunsa, sütun
  əlavə etmək lazım deyil.
- Partial unique index silinmiş ayın yenidən yaradılmasına icazə verir.

**Alternatives considered**:
- Seriyanı kodda enum, adını saytın `locales`-ində saxlamaq: redaksiya mətnini koda salır və admin siyahısı ilə sayt adları ayrılır.
- `media_az_id`/`media_en_id` sütunları: konvensiyadan kənardır və en-only sətir üçün `CHECK` lazımdır.
- Ümumi "fayl seriyası" (istənilən səhifəyə bağlana bilən): bu spec-də üç seriya var, üçüncü istifadə olmadan ümumiləşdirmə erkəndir.

## R2 — Görünürlük: `ShowAz`/`ShowEn` yerinə faylın olması

**Decision**: `show_az`/`show_en` sütunları yoxdur. Sətir həmin dildə yalnız o dildə faylı olduqda görünür. Bundan əlavə `status = published`,
`deleted_at IS NULL` və faylın `media_assets.deleted_at IS NULL` olması şərtdir.

**Rationale**: Bu sətirdə dil üzrə mətn yoxdur, yalnız fayl var. Ayrıca bayraq "en faylı var, amma gizli" kimi mənasız bir vəziyyət yaradardı.
Konstitusiya III.3 lokal görünürlüyü tələb edir: o, faylın varlığı ilə təmin olunur.

**Alternatives considered**: Bayraqlar (memorandum kimi). Redaktora artıq bir seçim verir və dəyəri yoxdur.

## R3 — Başlıq: seriyanın adı + dövr; Sığorta 12 aylıqdır

**Decision**: Başlıq saxlanılmır, göstərən tərəf qurur: `"{seriyanın adı} ({dövr})"`.
- `period_months = 1` olan seriyada dövr `"{Ay} {İl}"` olur.
- `period_months = 12` olan seriyada dövr `"{Ay−11} {İl'} – {Ay} {İl}"` olur.

Ay adları göstərən tərəfin dilindədir: saytda `MONTHS_AZ`/`MONTHS_EN` (spec 050 sabitləri), az-da ilk hərf böyük (`İyun`). Admin siyahısında
dövr `nav`/modul i18n-indəki ay adları ilə göstərilir.

**Rationale**: Test məlumatında Sığorta indeksinin 45 linkinin hamısı həmin ayla bitən 12 aylıq dövrdür ("Oktyabr 2021 - Sentyabr 2022" …
"1 iyun 2025 – 31 may 2026"). Bank və İnfoqrafika bir aylıqdır. `period_months` seriyanın xassəsidir, sətir üzrə yazılmır.

**Alternatives considered**:
- Sətir üzrə istəyə bağlı başlıq: redaktora yenə mətn yazdırır, spec-in məqsədinə ziddir.
- Sığortada da yalnız "(May 2026)": arxivdə ay başlığı ilə eyni məlumatdır, amma dövrün 12 ay olduğu itir.
- Başlığı API-də qurmaq: ay adları C#-da da təkrarlanardı (iki dil, iki API).

## R4 — İctimai API: bir endpoint, seriyalar üzrə qruplu

**Decision**: `GET /api/v1/monthly-reports?locale=az|en[&series=key,key]`.
- Cavab: seriyalar (`key`, `name`, `periodMonths`, `reports`) seriyanın sırası ilə.
- Hesabatlar il və ay üzrə azalan sırayla gəlir.
- Həmin dildə görünən hesabatı olmayan seriya cavabda yoxdur.
- Səhifələmə yoxdur: üç seriya cəmi ~140 sətirdir, ildə ~36 artır.

**Rationale**: Şikayət indeksləri səhifəsi iki seriyanı, Statistika bir seriyanı istəyir: hər səhifə bir sorğu edir. "Boş seriya yoxdur" qaydası
saytın fallback qərarını sadələşdirir: seriya yoxdursa, HTML-dən oxu.

**Alternatives considered**: Seriya üzrə ayrı endpoint, yəni `/monthly-reports/{key}`. Şikayət səhifəsi iki sorğu edərdi və heç bir üstünlük
qazanılmazdı.

## R5 — Saytda inteqrasiya: `ParseContext.reports`, köhnə arxiv kəsilir

**Decision**:
- Loader (`views/cms-page/loader.ts`) `complaint-index` üçün `bank` + `insurance`, `appeal-statistics` üçün `infographics` seriyasını yükləyir.
  DTO-nu `about-content`-in öz tipinə (`ReportSeries`) çevirir, `toMemorandum`/`toCsrProject` nümunəsi ilə.
- `parseComplaintIndex`/`parseAppealStatistics` seriya varsa arxivi sətirlərdən qurur (`archiveFromReports`). Səhifə HTML-indən isə yalnız
  giriş və metodologiya götürülür: `parseYearArchive` köhnə arxivi tapırsa, onun `before`/`after` hissələri işlənir, tapmırsa bütün mətn.
- Seriya yoxdursa (boşdur, xəta, en faylı yoxdur), spec 050 yolu dəyişmir.
- Yoldaş səhifə (96, 93) yalnız onun seriyası yoxdursa yüklənir.

**Rationale**:
- Spec 044/045 nümunəsidir. Saytın görünüşü və `AboutLayoutKind` dəyişmir, ona görə layout guard-ı (fikstür, `EXPECTED_BLOCKS`) yeni iş tələb
  etmir.
- Köhnə arxivi olmayan səhifə də işləyir: redaktor sonradan akkordeonları silsə belə Bank tabı qalır.
- Yoldaş səhifənin sorğusu artıq lazım olmayanda edilmir.

**Alternatives considered**:
- Köhnə akkordeonları seed ilə mətndən silmək: geri qaytarıla bilmir və redaktorun mətninə toxunur (spec, defolt 9).
- Yeni layout növü (`complaint-index-v2`): eyni görünüş üçün ikinci parser və fikstür olardı.

## R6 — Köçürmə: dinamik SQL, slug ilə, mühitdən asılı olmayan

**Decision**: `0035-monthly-reports-seed.sql` səhifələri az/en slug-ı ilə tapır (`page_translations`): mühitlər arasında id-lər fərqlidir
(`managed-sections.ts` qeydi).
1. Mətni `<summary>` ili ilə hissələrə bölür.
2. Hər hissədə ay `<summary>`-sindən sonrakı ilk `href="/media/N"` linkini götürür. Arada başqa `<summary>` olmamalıdır (lookahead).
3. Ay adını az/en ay adları cədvəlinə qarşı tutuşdurur: kiçik hərf, `ı → i`, boşluqlar sıxılır.
4. az keçidi sətir və az faylı yaradır, en keçidi eyni il + aya en faylını əlavə edir, sətir yoxdursa yaradır.

Media kitabxanasında olmayan fayl (`media_assets`-də yoxdur və ya silinib) buraxılır. Seriyada artıq sətir varsa (silinmiş də daxil), seriya
ötürülür.

**Rationale**:
- Bu yanaşma test məlumatında Node ilə simulyasiya olundu: Bank 32/32, Sığorta 45/43, İnfoqrafika 65/–. Ay adlarının hamısı tanındı, təkrar ay
  yoxdur.
- Sığorta en-də 2 ay `https://uploads.cbar.az/assets/…pdf` xarici linkidir, media kitabxanasına aid deyil. Sayt onları bugün də göstərmir:
  `mediaLinksIn` `data-media-link` + `/media/N` tələb edir. Ona görə köçürülmür, en Sığorta 41 ay olur (spec SC-002).
- 5 Sığorta en ayı az ilə eyni faylı göstərir: hər iki dil eyni `media_id`-ni alır, bu xəta deyil.
- Statik SQL (test media id-ləri ilə) prod-da səhv fayllara aparardı.

**Alternatives considered**:
- `specs/052/seed/`-də Node generatoru ilə statik SQL (spec 051 nümunəsi): media id-ləri mühitdən asılıdır.
- Admin API-də birdəfəlik endpoint: əl ilə addım tələb edir və unudula bilər.

## R7 — Admin: CRUD modulu, seriya tabları, "növbəti ay" prefill

**Decision**:
- `features/monthly-reports` bir `ModuleConfig` (`/monthly-reports`).
- Siyahı süzgəcləri: seriya tab çubuğu (`type: 'tabs'`, seçimlər `GET /monthly-reports/series`-dən, `LookupGate`), il (`number`), status.
- Siyahı sütunları: seriya, dövr, fayllar (az/en nişanları), status, dəyişmə vaxtı.
- Forma sahələri: seriya (`select`), il (`number`), ay (`select`, 12 ay), fayl (`media`, `perLocale`, `required`, image-popups nümunəsi), status.
- CRUD mühərrikinə bir generik, opsional genişlənmə: `ModuleConfig.newSearch?: (rows, filters) => Record<string, string>`. Siyahının "Yeni"
  düyməsi onun nəticəsini `prefillFromSearch` sorğusuna əlavə edir. Bu modulda seriya süzülübsə, ilk sətirdən (ən yeni) sonrakı ay `year`/`month`
  kimi ötürülür. Dekabrdan sonra növbəti ilin Yanvarı gəlir.

**Rationale**:
- `prefillFromSearch` (spec 051) seriya üçün artıq kifayətdir. İl və ay üçün mühərrikin form tərəfi dəyişmir, yalnız "Yeni"-nin URL-i
  zənginləşir.
- Siyahı il/ay azalan sıradadır, ona görə ilk sətir ən yenidir. Seriya süzülməyibsə prefill yoxdur.

**Alternatives considered**:
- Async `createDefaults` (forma açılmazdan əvvəl API sorğusu): mühərrikə yükləmə vəziyyəti əlavə edir.
- Əl ilə yazılmış səhifə: Duplicate Code (senior-front), CRUD mühərriki bunu ifadə edir.

## R8 — Təkrar ay: 409, mesajda seriya və dövr

**Decision**: `POST`/`PUT` əvvəlcə eyni seriya + il + ay üzrə silinməmiş sətri yoxlayır. Varsa
`ConflictProblem("Bu seriyada {Ay} {İl} üçün hesabat artıq var.")` qaytarır. Partial unique index yarışma halında son qorumadır və
`DbExceptionHandler` onu 409-a çevirir.

**Rationale**: Panelin form mühərriki `problem+json`-un `message`-ini göstərir. Mesajda mövcud sətrə link vermək mühərrikdə yeni xəta formatı
tələb edərdi. Spec-in qəbul ssenarisi buna uyğun düzəldildi (US1 №3).

## R9 — Validasiya

**Decision**:
- `year`: 2000 … cari il + 1 (API). DB `CHECK (year BETWEEN 2000 AND 2100)`.
- `month`: 1 … 12 (API + DB `CHECK`).
- Ən azı bir dildə fayl olmalıdır (API, panelin `required` per-locale sahəsi). `mediaId` mövcud, silinməmiş `media_assets` sətri olmalıdır.
- `status ≠ scheduled`. `PublishedAt` embarqosu yoxdur: dövr tarixdir, dərc vaxtı deyil. Redaktor qaralama ilə gözləyir.
- Fayl tipi məhdudlaşdırılmır (köhnə arxivdə hamısı PDF-dir, amma şəkil infoqrafika da mümkündür).

## R10 — Admin menyusu və səhifə formundakı keçid

**Decision**:
- Yeni `NavGroup` `consumer` ("İstehlakçı hüquqları" / "Consumer rights"), `cooperation`-dan sonra, `faq`-dan əvvəl. Saytın üst menyusunda
  və footer-ində bu bölmənin dəqiq yeri yoxdur (CMS ağacındadır). Yer agentin seçimidir, istifadəçi düzəldə bilər.
- Bənd `monthlyReports` ("Aylıq hesabatlar"). Tək bəndlik qrup başlıqsız göstərilir (spec 046 qaydası).
- `managed-sections.ts`-ə üç slug əlavə olunur (95, 96, 93). `ManagedSection` `link` növünə opsional `search` əlavə olunur ki, keçid seriya
  süzgəci ilə açılsın.

## R11 — İcazələr və audit

**Decision**: `monthly_reports.read/create/update/delete` icazələri, `moderator` rolu (0027 nümunəsi, `permissions` INSERT hüququ yoxdursa
WARNING). Seriya siyahısı `read` icazəsi ilədir. Audit hərəkətləri `monthly_reports.create/update/delete`, entity `monthly_report`.

## R12 — Migration adları

**Decision**: `0034-monthly-reports.sql` (sxem, icazələr, seriyaların seed-i) və `0035-monthly-reports-seed.sql` (köçürmə). Son fayl `0033`-dür.
`api-cbar`-da migration yoxdur, adlar unikaldır. Mövcud cədvəllərə `ALTER TABLE` edilmir.

## R13 — Admin `LocaleBadges`

**Decision**: `features/faq/components/locale-badges.tsx` `entities/content/ui/locale-badges.tsx`-ə köçürülür (implementasiyada: `shared` `entities`-dən `LOCALES` import edə bilmir, plandakı `shared/ui` FSD-ni pozardı); etiketlər `faq:languages.*`-dən `common:languages.*`-ə keçdi. FSD-də `features → features` importu
qadağandır, bu isə ikinci istifadədir (FAQ + aylıq hesabatlar). Köçürmə mexanikidir, FAQ testləri dəyişmir.

## R14 — Silinmiş media

**Decision**:
- Ictimai API faylı `media_assets.deleted_at IS NULL` olanda qaytarır. Belə faylı olmayan dil üçün sətir həmin dildə görünmür.
- Admin siyahısında `missingFile` bayrağı var: faylın sətri silinib. Sətir xəbərdarlıq nişanı ilə göstərilir.

## R15 — Frontend skill-lərinin nəticəsi

**Sayt**:
- Yeni client komponenti yoxdur.
- Yeni `dangerouslySetInnerHTML` yoxdur: arxiv məlumatdır, HTML deyil.
- Sorğu xətası səhifəni sındırmır, fallback HTML yoludur (Resilience: graceful degradation).

**Admin**:
- `ModuleConfig`, kit `Badge` istifadə olunur.
- Seçimlərin yüklənməsi, xəta və boş vəziyyəti `LookupGate` ilə idarə olunur.
- Bütün mətnlər i18n az/en-dədir.
- Magic number yoxdur: il hədləri, ay sayı və period dəyərləri `model/constants.ts`-dədir.
