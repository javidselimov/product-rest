# Research: AZIR səhifəsi (spec 021)

**Tarix**: 2026-10-08 · **Mənbə**: 5 paralel read-only araşdırma: backend məlumat modeli, public API + Excel, `web-cbar-new`, `web-cbar-admin-new`, köhnə `product-host` davranışı. Yollar repo kökünə nisbətəndir.

Hər bölmə **Decision / Rationale / Alternatives** formatındadır. Kodla təsdiqlənməyən məqam **⚠ Yoxlanmalı** kimi işarələnib.

---

## R1 — Saxlama: yoldaş cədvəl `azir_index_value_details`, migration `0008`

**Decision (istifadəçi qərarı, 2026-10-08)**: `azir_index_values` **dəyişmir**. Yeni migration `product-rest/api-cbar-admin/db/migrations/0008-azir-index-value-details.sql` 1:1 yoldaş cədvəl yaradır. Spec 020-dəki `admin_user_security_stamps` (`0007`) və `0005`-dəki grant nümunəsi əsas götürülür:

1. `CREATE TABLE IF NOT EXISTS azir_index_value_details (azir_index_value_id bigint PRIMARY KEY, deal_volume, deal_count, min_rate, max_rate, is_reserve_plan, updated_at)`. 5 CHECK birbaşa `CREATE TABLE`-ın içindədir, çünki cədvəl bizimdir.
2. FK `azir_index_values(id) ON DELETE CASCADE` **şərtlidir**: yalnız `has_table_privilege('azir_index_values','REFERENCES')` və `pg_constraint`-də yoxdursa yaradılır (`0007:15-25` nümunəsi). Migration heç vaxt deploy-u bloklamır.
3. `cbar_web_ro` mövcuddursa, `GRANT SELECT ON azir_index_value_details TO cbar_web_ro` verilir (`0005:16-23` nümunəsi). `api-cbar` bu cədvəli **oxuyur**, default privileges isə cədvəl sahibi fərqli olan mühitləri örtmür.

Sütunlar [data-model.md](./data-model.md) §1-dədir.

**Rationale**:
- `ALTER TABLE` "must be owner of table" riskini (`users`-də baş verib: `0004:5-6`, `0007:5-6`, spec 020 R1) tamamilə aradan qaldırır. Ona görə test bazasında sahiblik sorğusuna ehtiyac qalmır, Faza 0 gate-i ləğv olunur.
- Yeni cədvəli migration rolu yaradır, deməli onun sahibidir. CHECK, trigger və grant öz cədvəlimizdə problemsizdir.
- Detal sətri **ixtiyaridir**: olmaması = bütün sahələr `null`, `is_reserve_plan = false`. Mövcud AZIR sətirləri üçün backfill lazım deyil (FR-002).
- Ad konvensiyası `UseSnakeCaseNamingConvention()`-dir (`Cbar.AdminApi/Program.cs:26`). Ən böyük nömrə admin-də `0007`-dir, `api-cbar/db/migrations/`-də migration yoxdur, ona görə `0008-azir-index-value-details.sql` hər iki repo üzrə unikaldır.

**Nəticələr (implementasiya qaydaları)**:
- **FK olmaya bilər**, ona görə cascade-ə güvənilmir. `AzirController.Delete` detal sətrini eyni `SaveChangesAsync`-də **açıq silir**. FK varsa, cascade sadəcə ikinci qoruyucudur. Yetim detal sətri public tərəfə çıxmır, çünki oxu həmişə `azir_index_values`-dan başlayır.
- **Bir upsert, bir tranzaksiya**: ana sətir və detal sətri birlikdə yazılır. Detal yoxdursa yaradılır, varsa bütün sahələri əvəz olunur.
- **`updated_at`**: yalnız detal dəyişəndə ana cədvəlin trigger-i işləmir. Controller ana sətrin `UpdatedAt`-ını açıq yeniləyir, admin siyahısında "yenilənib" düzgün göstərilsin. Detal cədvəlinin öz `updated_at`-ı EF tərəfindən təyin olunur, trigger əlavə olunmur.
- **Oxu**: EF `LEFT JOIN` istifadə edir (`v.Details == null ? null : v.Details.DealVolume`, `v.Details != null && v.Details.IsReservePlan`). Mövcud `UNIQUE (value_date, term)` indeksi və detal PK-sı kifayətdir.

**Alternatives**:
- `azir_index_values`-a `ALTER TABLE ADD COLUMN` (bir cədvəl, JOIN yoxdur). Rədd edildi: sahiblik riski və bunu yoxlamaq üçün DevOps-dan asılılıq.
- `jsonb` sahəsi: CHECK və tip təhlükəsizliyi itir.

## R2 — Validasiya: controller-də sahə xətaları + DB CHECK backstop

**Decision**:
- `AzirController.Upsert` bütün xətaları `errors: { dealVolume: [...], … }` lüğətinə yığır və `ErrorProblem(400, firstMessage, extensions: { errors })` qaytarır (`CbarControllerBase.cs:18-37`).
- Mövcud `Term` yoxlaması da bu struktura keçir.
- `CbarControllerBase`-ə kiçik `FieldValidationProblem(IDictionary<string,string[]>)` köməkçisi əlavə oluna bilər.
- Bazada adlı CHECK-lər də olur.

**Rationale**:
- Kodda FluentValidation və DataAnnotations yoxdur. İdiom action-ın başında imperativ yoxlamadır (`InflationController.cs:87-93`).
- `errors` extension artıq `DbErrorMapping.cs:79-86`-da istifadə olunur.
- Panel onu `normalizeApiError` ilə `fieldErrors`-a çevirir (`web-cbar-admin-new/src/shared/api/types.ts:57-98`). `message` saxlanılır, panel onu oxuyur (root `CLAUDE.md`, spec 018).
- CHECK pozuntusu artıq 400 `value-rejected`-ə map olunur (`DbErrorMapping.cs:52-53`), ona görə backstop heç vaxt 500 vermir.
- Controller yoxlaması CHECK-lərdən ən azı o qədər sərtdir. Kəsr yoxlaması CHECK-də yoxdur, yalnız controller-dədir: `decimal.Round(v, 2) == v`.

**Alternatives**: yalnız CHECK (sahə mesajı olmur, panel sahəni qırmızı göstərə bilmir); FluentValidation (yeni NuGet, lokal build yoxdur).

## R3 — Public sətirlər: `/api/v1/azir` additiv genişlənir

**Decision**:
- `GET /api/v1/azir`-in proyeksiyasına `dealVolume`, `dealCount`, `minRate`, `maxRate` (nullable) və `isReservePlan` (bool) əlavə olunur.
- Route, query parametrləri və artan sıralama dəyişmir.
- Cədvəl üçün Next `?term=1D&from&to` ilə çağırır. `rate > 0` filtri və azalan sıra Next-də tətbiq olunur.

**Rationale**:
- Yeganə istehlakçı `web-cbar-new/src/features/stats/api/stats.api.ts:42-52`-dir.
- `azirValueSchema` passthrough-dur (`schemas.ts:6-8`), əlavə sahələr onu qırmır.
- Konstitusiya VII.3 additiv dəyişikliyə icazə verir.
- `/statistics` qrafiki artan sıradan asılıdır, ona görə default sıralama dəyişməməlidir.

**Alternatives**: `/azir/daily` (mövcud filtri təkrarlayır, yeni route + spec); sıralamanı server parametri ilə (lazımsız).

## R4 — Statistika bloku API-də hesablanır: `GET /api/v1/azir/summary`

**Decision**:
- Yeni endpoint `StatsController`-də olur.
- Filtrsizdir və 11 nullable sahəli düz obyekt qaytarır ([contracts/public-api.md](./contracts/public-api.md)).
- Hər göstərici bir neçə `OrderByDescending().FirstOrDefaultAsync()` / `Min/Max` sorğusu ilə hesablanır.
- Service layer yoxdur, private helper-lər controller-də qalır (`CurrenciesController`-dəki `LatestRateDateAsync` presedenti).

**Rationale**:
- 3, 4, 8, 11-ci göstəricilər "X tarixinə qədər olan son dəyər" axtarışı tələb edir.
- USD üçün bunu public endpoint-lərlə etmək olmur: `/currencies?date=` yalnız dəqiq tarixə uyğun gəlir (`CurrenciesController.cs:16-30`).
- Bir kiçik sorğu, filtrdən asılı deyil, 60 s keşlənir.
- Göstəricilərin semantikası bir yerdə müəyyən olunur və OpenAPI ilə sənədləşir.

**Risk**: .NET lokal build/test olunmur (memory: .NET SDK yoxdur). Ona görə [quickstart.md](./quickstart.md) §4-də SC-002 üçün **istinad test dəsti** və gözlənilən 11 rəqəm verilib. Bu yoxlama test mühitində `contract-check` + əl ilə müqayisə ilə aparılır.

**Alternatives**: Next-də təmiz funksiyalarla hesablama (lokal test olunur, amma USD "≤ tarix" axtarışı gündən-günə geri dövrəyə çevrilir, `PREVIOUS_SHEET_DAYS` kimi); hər göstərici üçün ayrı endpoint (fan-out, rate limit).

## R5 — Göstəricilərin dəqiq qaydaları (köhnə ilə müqayisə)

Spec FR-015 qüvvədədir. Köhnədən **şüurlu fərqlər** (xəta düzəlişləri; spec Assumptions və Clarifications ilə uyğundur):

| Məqam | Köhnə (`Azir.php`) | Yeni |
|---|---|---|
| "Son" sətir | sətir id-sinə görə (`ORDER BY id DESC`) | ən böyük `value_date` |
| Rəqəm müqayisəsi | sütunlar ehtimal ki `TEXT`dir, `MIN/MAX` leksikoqrafikdir (`'420' < '80'`) | rəqəmsal |
| `lastFaiz` | `>= 0` filtri yoxdur | `rate > 0` (vahid qayda) |
| Həcm aylıq dəyişmə bazası | ötən təqvim ayındakı istənilən sətir (son id); baza yoxdursa cari dəyəri qaytarır | ötən ayın son gününə qədər olan son sətir; yoxdursa `null` |
| Həcm min/max dövrü | keçən ilin 1 yanvarından | **eyni**: keçən ilin 1 yanvarından bu günə (Clarifications Q2) |
| USD | `currency_rates`-də id-yə görə son `usd`, sıfıra bölmə mümkündür | son həcm tarixinə qədər olan son rəsmi USD (`rate / nominal`); yoxdursa `null` |
| Dəyişmənin işarəsi | `0.25%` / `-0.25%`, `+` yoxdur | `+0,25` / `−0,10` (spec US3, yeni tələb) |
| Yuvarlaqlaşdırma | `roundIfNeeded`: 4 onluqdan çox olanda `round(x,4)` | API 4 onluq qaytarır, USD 2 onluq; ekranda locale formatı |

**USD**: `currency_rates (rate_date, currency_code, rate numeric(12,4))` və `currencies.nominal`. Spec 008 (four-eyes) hələ yalnız spec-dir; public `CurrenciesController` sətirləri filtrsiz oxuyur. Gələcəkdə gözləyən vərəqlər yaranarsa, summary sorğusu eyni filtri almalıdır (plan, Risks).

## R6 — Excel: `web-cbar-new`-də dependency-siz xlsx yazıcı, route handler ilə

**Decision**:
- `src/app/[locale]/statistics/azir/export/route.ts` route handler-i əlavə olunur.
- O, səhifə ilə **eyni** range parser-i və eyni sətir funksiyasını istifadə edir.
- Faylı `src/shared/lib/xlsx/` altında kiçik, dependency-siz yazıcı yaradır: OOXML SpreadsheetML XML hissələri + ZIP konteyneri. ZIP `node:zlib`-in `deflateRawSync` və `crc32` funksiyaları ilə qurulur (Node ≥ 22.2; CI node:22).

**Rationale**:
- Yeni dependency yoxdur. `web-cbar-new`-də ECharts **yeganə** əlavə runtime dependency-dir (`web-cbar-new/CLAUDE.md:64`, spec 002 D1). Paketlər vendor tarball ilə offline quraşdırılır, `check:self-contained` + `audit` qapıları var.
- Lokal test oluna bilir: Vitest faylı `inflateRawSync` ilə açır, XML-i yoxlayır.
- az/en başlıqlar artıq Next i18n-dədir.
- SC-003 (fayl = ekran) eyni loader-in paylaşılması ilə təmin olunur.
- `media/[id]/route.ts` same-origin route handler presedentidir.
- CSP `connect-src 'self'` yükləmə linkinə təsir etmir, amma same-origin həm də prod hostname uyğunsuzluğundan qoruyur: `web-cbar-new/.ci-cd/prod.yaml:14` `api-cbar.e-cbar.az`, `api-cbar/.ci-cd/prod.yaml:3` `api-cbar.cbar.az`.

**Həcm**: yazıcı yalnız lazım olanı dəstəkləyir: `workbook.xml`, `styles.xml` (qalın başlıq + `DD.MM.YYYY` tarix formatı), 1–2 vərəq, inline string və rəqəm xanaları, `[Content_Types].xml`, `_rels`. Paylaşılan string cədvəli, formula və birləşdirilmiş xana yoxdur. Təxminən 200 sətir.

**Alternatives**:
- `exceljs` (MIT, amma geniş dependency ağacı, offline vendor və audit qapısı ilə ağırdır).
- SheetJS (npm versiyası 0.18.5-də qalıb, məlum zəifliklər var).
- EPPlus (kommersiya lisenziyası).
- ClosedXML / OpenXml və ya .NET `ZipArchive` ilə `api-cbar`-da (lokal build yoxdur, NuGet korporativ şəbəkədən yoxlanmayıb, başlıqlar üçün API-yə `locale` lazım olardı).
- Excel 2003 XML (`.xls` uzantılı SpreadsheetML; zip lazım deyil, amma Excel uzantı uyğunsuzluğu xəbərdarlığı verir).

## R7 — Fayl strukturu (Clarifications Q4)

**Decision**:
- **Vərəq 1** `1D AZIR`: sətir 1 başlıqlardır (az: `Tarix | Faiz | Əqdlərin həcmi (mln. AZN) | Əqdlərin sayı`; en: `Date | Interest rate | Value of transactions (mln. AZN) | Number of transactions`). Başlıqlar qalındır.
- Sonra yalnız məlumat sətirləri gəlir, tarixə görə azalan sırada, ekrandakı ilə eyni.
- Tarix xanası **rəqəm + `DD.MM.YYYY` formatı** olur, faiz/həcm/say xanaları rəqəm olur, `%` və `*` yazılmır.
- **Vərəq 2** `Qeydlər` / `Notes` yalnız işarəli sətir olanda yaranır: A sütununda tarixlər, sonda footnote mətni.
- Fayl adı: `AZIR-1D_{dateFrom}_{dateTo}.xlsx` (ASCII). `Content-Disposition: attachment; filename=…; filename*=UTF-8''…`.

**Rationale**:
- Köhnə fayl (`IndeksExportHelper.php:76-95`) 4 sütun yazır. Tarix orada `showDate` mətnidir, rəqəmlər xam mətndir; kitabxana çox güman ki rəqəmə çevirirdi, `7,25` isə mətn qalırdı.
- Spec rəqəm xanası tələb edir (US5-in 2-ci ssenarisi). Tarixi rəqəm + format kimi yazmaq Excel-də sıralamanı düzgün edir və görünüşü köhnə ilə eyni saxlayır.
- Köhnə fayl adı ("…AZIR (Azerbaijan Interbank Rate) .xlsx", sonunda boşluq) qorunmur. Bu kontrakt deyil, ASCII ad daha etibarlıdır.

## R8 — Public marşrut və köhnə URL yönləndirməsi

**Decision**:
- Səhifə `src/app/[locale]/statistics/azir/page.tsx` → `views/azir/loader.ts` + `views/azir/index.tsx` olur (mövcud `statistics` nümunəsi).
- `/indeks/rates` üçün `src/proxy.ts`-də step 1-dən (locale redirect) **əvvəl** təmiz `legacyRedirect(url)` funksiyası çağırılır ([contracts/web-routes.md](./contracts/web-routes.md)).
- Status 308.

**Rationale**:
- Köhnə URL dil prefiksi daşımır, dil sessiyadadır və `?language=az|en` ilə dəyişir (`LanguageBehavior.php:26-46`).
- Bu gün yeni saytda `/indeks/rates` → `/az/indeks/rates` → CMS catch-all `rates` slug-ı → 404.
- `next.config.ts`-də redirect yoxdur, legacy redirect xəritəsi də yoxdur. Bu ilk qeyddir, Konstitusiya VII.2-nin "301 xəritəsi" tələbi bu contract faylı ilə ödənir.

**Alternatives**: `next.config.ts` `redirects()` (query çevirmə, `d/m/Y` → ISO, mümkün deyil); CMS səhifəsi (redaktordan asılı olardı).

## R9 — Tarix filtri və parametr formatı

**Decision**:
- Yeni URL-lər ISO `YYYY-MM-DD` istifadə edir: `?dateFrom=2026-01-01&dateTo=2026-01-31`.
- Forma JS-siz GET `<form>`-dur: `FilterForm` + iki `DateField` (native `<input type="date">`), valyuta səhifəsindəki analoq.
- Yeni `features/stats/model/azir-range.ts` parser-i `{ from, to, error: null | 'format' | 'order' | 'tooLong' }` qaytarır. `shared/lib/search-params.ts`-dəki `dateParam` səhv dəyəri səssiz `undefined` edir, ona görə xəta göstərmək üçün yaramır.
- Default: `from = bu gün − 60`, `to = bu gün` (`TZ=Asia/Baku`). Gələcək `to` bu günə endirilir.
- Maksimum aralıq 10 il (3653 gün). Bundan uzun aralıq → `tooLong` xətası, default görünüş saxlanılır.
- Sətirlər həmişə `value_date` azalan sırada.

**Rationale**:
- Köhnədə `dateTo` boş qalırdı və `BETWEEN x AND NULL` boş cədvəl verirdi; səhv format ana səhifəyə yönləndirirdi. Spec bunları düzəldir (US4).
- Sıralama köhnədə id-yə görə idi.
- 10 il həddi SC-005 və export ölçüsü üçündür: ~2 500 sətir, < 1 MB.

## R10 — Qrafik

**Decision**: qrafik cədvəlin aralığı ilə qurulur (FR-009): yalnız 1D, `rate > 0`, artan sıra. `azirDailySeries`-ə tam tarix etiketi seçimi əlavə olunur, çünki indiki `MM.DD` etiketi ilin keçidində qarışıqdır.

**Köhnədən fərq**: köhnə qrafik həmişə son 60 günü göstərirdi, filtrə tabe deyildi (`IndeksRatesViewModel.php:49-58`). Spec FR-009 qrafikin cədvəllə eyni aralıqda olmasını tələb edir.

## R11 — Ədəd formatı

**Decision**:
- `entities/content/lib/numbers.ts`-də `formatNumber(value, locale, {min,max fraction})` və `formatSigned(...)` olur: `Intl.NumberFormat(INTL_LOCALE[locale])` (az-AZ / en-GB), null → `—`, işarə `+` / `−`.
- Faiz 2–4 onluq, həcm 2 onluq, say tam ədəd.

**Rationale**: sayt hazırda faizi xam (`money-market-card.tsx:47`) və ya `toFixed(4)` ilə çap edir, locale köməkçisi yoxdur.

**⚠ Yoxlanmalı**: Intl çıxışı Node 22 və 24 arasında fərqli ola bilər (memory: testləri Node 22 ilə də işlət). Testlər hər iki versiyada işlədilməlidir.

## R12 — Keşləmə və SC-004

**Decision**: AZIR sətirləri və summary mövcud `cachedJson` (60 s, tag `stats`, `server/cached.ts:57`) ilə oxunur. Export eyni keşlənmiş sətirləri istifadə edir.

**Nəticə**: redaktorun dəyişikliyi public saytda **ən gec 60 saniyə** sonra görünür. Spec SC-004-dəki "dərhal (yenidən yükləmədən sonra)" ifadəsi bu mövcud qərarla (spec 003 performans) dəqiqləşdirilir: SC-004 = "≤ 60 saniyə" (plan, Complexity Tracking-də qeyd olunub).

## R13 — Rate limit riski

`api-cbar` limiti 1000/dəq/IP-dir və birinci `X-Forwarded-For`-a görə hesablanır (`Program.cs:82-99`). Next-in server-side sorğuları ziyarətçinin XFF-ini ötürmür. Ona görə public saytın bütün trafiki ehtimal ki **pod IP-sinə görə bir kvotanı** bölüşür.

Bu səhifə 2 sorğu əlavə edir: sətirlər + summary; export keşdən oxuyur. Ana səhifə kartının sorğusu `?term=1D&from=` ilə kiçildilir.

**⚠ Yoxlanmalı**: test mühitində kvotanın necə hesablandığı ölçülməlidir. Problem bu feature-dan əvvəl də var, ayrıca işdir.

## R14 — Admin panel UX

**Decision**:
- Upsert kartına ikinci sıra əlavə olunur: həcm, say, min, max, ehtiyat plan checkbox.
- Zod `superRefine` ilə `min ≤ max` yoxlanır. Boş sətir → `null` (`shared/crud/form-model.ts:29-32` nümunəsi).
- Server `fieldErrors` → `form.setError` (`crud-form-page.tsx:144-155` nümunəsi).
- Siyahıya sütunlar əlavə olunur: həcm, say, ehtiyat plan badge-i, min/max.
- Yeni **sətir əməliyyatı "Formaya yüklə"**: `rowActions` + feature-lokal prefill konteksti kartı sətrin dəyərləri ilə doldurur. `canEdit: false` qalır, çünki `GET/PUT /azir/{id}` yoxdur.

**Rationale**: əlavə sahələrlə mövcud sətri düzəltmək (məs. ehtiyat plan işarəsini götürmək, US2-nin 2-ci ssenarisi) hamısını yenidən yazmadan mümkün olmalıdır.

**Qeyd**: `azir.test.tsx:79-81` "Redaktə et:" düyməsinin olmamasını yoxlayır. Yeni əməliyyatın etiketi "Formaya yüklə: …" olmalıdır.

## R15 — Ana səhifə kartı

**Decision**:
- `azirLatest` 1D üçün `isReservePlan`-ı da qaytarır.
- `money-market-card.tsx:47`-də 1D dəyərinin yanında `*` çıxır, kartın altında footnote olur.
- Düymə (`:68`) `/{locale}/statistics/azir`-ə aparır.
- `home-cards.test.tsx:129` yenilənir.

**Köhnədən fərq**: köhnə canlı ana səhifə (`views/home/index.php:1283`) `*` göstərmirdi. Bunu göstərən `AZIRBlockWidget` ölü koddur. Spec US6 bunu tələb etdiyi üçün yeni davranışdır, paritet deyil.

## R16 — Mətnlər

Köhnə az mətnləri saxlanılır. Köhnə en tərcümələrinin çoxu **yoxdur**: açar mətni göstərilirdi. Yeni en mətnləri [contracts/web-routes.md](./contracts/web-routes.md) §i18n-dədir.

Səhv tərcümə düzəldilir: `*The reserve was calculated based on the plan` → `*Calculated on the basis of the contingency plan`. Final mətni redaksiya təsdiqləməlidir (spec Assumptions).

Səhifə başlığı: az `Banklararası Təminatsız Pul Bazarında İstinad Faiz Dərəcəsi - AZIR`, en `Benchmark rate in the unsecured interbank money market – AZIR`.
