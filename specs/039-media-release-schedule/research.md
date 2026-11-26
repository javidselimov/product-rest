# Research: Məlumatların yayımlanması qrafiki

Mənbələr: Figma `1713:29377`, `1718:30137`, `1718:30583`, `1727:31563`, `1727:32212`, `1727:32597`; dump
`schema-new/cbar-schema-and-data-20260914.sql` (səhifə 130, sətir 18206–18207); spec 034 (Tədbirlər), 038 (KSM) kodu.

## R1. Ayrıca məzmun növü, CMS markup-ı yox

**Decision**: Yeni cədvəllər `release_schedule_groups`, `release_schedule_periodicities`, `release_schedule_items` (+ `_translations`), CRUD `CsrProjectsController` / `CsrCategoriesController` nümunəsi ilə.

**Rationale**: İstifadəçi qərarı 1-A. Axtarış, dövrilik siyahısı və müddət rejimi sahə tələb edir; redaktorun cədvəl səhvi görünüşü pozmamalıdır (038-in eyni problemi).

**Alternatives considered**: Səhifə 130-un cədvəlini parse etmək (`parseAbout` + layout guard) — backend dəyişmir, amma dövrilik siyahısı və modal rejimi markup qaydası ilə ifadə olunmur.

## R2. Modal tarixləri Tədbirlərdən, eyni public endpoint-də

**Decision**: `GET /api/v1/release-schedule` cavabında `decisions` bloku: cari Bakı ilinin `events.type = 1` tarixləri (unikal, artan), hər biri üçün `withPressConference` (eyni gündə dərc olunmuş `type = 2` tədbiri), `next` (bu gündən sonrakı ilk `type = 1`, növbəti ildə də ola bilər). Hesablama `api-cbar`-dadır.

**Rationale**: İstifadəçi qərarı Q1-A (tarixlər bir yerdə). Bir sorğu, Bakı günü və etiket qaydası bir yerdə. Tədbirin tərcüməsi tələb olunmur, ona görə en səhifəsində tarix itmir (mövcud `GET /events` yalnız tərcüməsi olan tədbiri verir). Dekabrın sonunda `next` növbəti ilə düşə bilər, ayrıca sorğu lazım deyil.

**Alternatives considered**: Saytın `getEvents(type=1, from, to)` + `type=2` + `when=upcoming` ilə 3 sorğu göndərməsi — yuxarıdakı tərcümə və il sərhədi problemləri. Ayrıca "Qərar tarixləri" cədvəli — Q1-B, rədd edilib.

## R3. Bakı günü

**Decision**: `EventsController.BakuToday()` (private, `UTC + 4`) `Cbar.WebApi/Time/BakuClock.cs`-ə köçür (`BakuClock.Today()`), `EventsController` və `ReleaseScheduleController` onu çağırır. Davranış dəyişmir.

**Rationale**: Eyni qayda iki controller-də kopyalanmasın; `PressReleasesController.BakuOffset` də eyni sabitdir, sonradan ora keçə bilər (bu spec-də toxunulmur).

## R4. Axtarış saytın loader-ində

**Decision**: Endpoint bütün dərc olunmuş sətirləri verir; `q` `views/media-release-schedule/loader.ts`-də süzülür: hər iki tərəf `normalize('NFC')` → `toLocaleLowerCase('az')` → `ı` → `i` (və `en` lokalda da eyni qatlama), sonra `includes`. Boş qalan qruplar atılır.

**Rationale**: 20–40 sətir; Postgres `ILIKE` Azərbaycan `İ/ı` cütünü ICU-suz düzgün qatlamır, JS-də isə nəticə proqnozlaşdırılır və testlə kilidlənir (spec edge case "İllik" = "illik", "INFLYASIYA" = "inflyasiya"). API sadə qalır, keş açarı bir dənədir.

**Alternatives considered**: `?q=` API-də `ILike` ilə — hərf qatlama problemi, hər axtarış ayrıca keş açarı.

## R5. Müddət rejimi

**Decision**: `timing_mode smallint NOT NULL DEFAULT 1 CHECK (timing_mode BETWEEN 1 AND 3)` — 1 `text`, 2 `link`, 3 `decisions`; `timing_url varchar(1000)`, `CHECK ((timing_mode = 2) = (timing_url IS NOT NULL))`. Domain-də `enum ReleaseTimingMode { Text = 1, Link = 2, Decisions = 3 }` (`HasConversion<short>()`). Admin JSON-da camelCase string (`JsonStringEnumConverter` artıq qoşulub), public cavabda proyeksiya string-i (`"text" | "link" | "decisions"`).

**Rationale**: İstifadəçi qərarı Q2. `events.type` kimi `smallint` + CHECK; JSON-da oxunaqlı.

**Link qaydası**: `http(s)://…` və ya `/` ilə başlayan sayt yolu (`//` yox) — admin panelin mövcud `isAllowedLink` qaydası (`features/image-popups/model/link-rule.ts`). Sayt yolu locale prefiksi ilə açılır (`/{locale}{path}`), xarici ünvan yeni pəncərədə.

## R6. Admin formasında şərti sahə

**Decision**: CRUD mühərrikinə `visibleWhen` əlavə edilmir. `timingUrl` sahəsi həmişə görünür, `helpKey` "yalnız Link rejimində" deyir; `superRefine` link rejimində ünvanı məcburi edir və qaydanı yoxlayır, `buildPayload` digər rejimlərdə `timingUrl: null` göndərir. Server eyni qaydanı `InvalidAsync`-də təkrarlayır, DB `CHECK` son sərhəddir.

**Rationale**: Şərti görünüş bütün modullara toxunan mühərrik dəyişikliyidir (`crud-form-page.tsx`, `field-control.tsx`); bu spec üçün bir sahəyə görə lazım deyil.

**Alternatives considered**: `FieldConfig.visibleWhen(values)` + `useWatch` — gələcək spec-də, bir neçə modul eyni ehtiyacı göstərəndə.

## R7. Route və menyu

**Decision**: Route `app/[locale]/(content)/media/release-schedule/`. `entities/page-node/lib/tree.ts`: `RELEASE_SCHEDULE_PATH = '/media/release-schedule'`, `RELEASE_SCHEDULE_SLUGS = {'melumatlarin-yayimlanmasi-qrafiki', 'information-disclosure-schedule'}`, `isReleaseScheduleNode()`; `nodeHref` və `isCurrentNode` Tədbirlər kimi bu node-u xüsusi tanıyır. `shell/nav.ts` `FEATURE_ROUTES`-a iki slug → `media/release-schedule`. Loader `current: { href: RELEASE_SCHEDULE_PATH }` ötürür.

**Rationale**: 034-ün sınanmış yolu; redaktor `navUrl` yazmasa da hər üç menyu yeni ünvana aparır.

**Qeyd**: Dump-da səhifə 130 kök səhifədir (`parent_id` null), Media altında deyil. Miqrasiya `pages`-ə yazmır (034/038 qaydası); redaktor səhifəni Media altına keçirir (`docs/media-cms-guide.md`). O vaxta qədər səhifə açılır, sol menyuda aktiv element olmur, breadcrumb "Ana səhifə › Media › başlıq"-dır (spec edge case).

## R8. Köhnə ünvanlar

**Decision**: `src/proxy.ts` `legacyRedirect()`-ə iki qayda, 308, locale yönləndirməsindən əvvəl:
- `/(az|en/)?page-72(/…)?` → `/{lang}/media/release-schedule` (`lang` `?language=`-dən, sonra prefiksdən, sonra `az` — mövcud `legacyLocale`).
- `/(az|en)/melumatlarin-yayimlanmasi-qrafiki` və `/(az|en)/information-disclosure-schedule` (sonda `/` ola bilər) → həmin dilin yeni route-u.

**Rationale**: Maddə VII.2. Bu gün səhifə 130 catch-all ilə `/{locale}/{slug}`-da açılır, `page-72/{slug}` isə catch-all-ın son seqmenti ilə eyni səhifəyə düşür; yönləndirmə hər ikisini yeni səhifəyə aparır.

## R9. Giriş mətni

**Decision**: Loader `getPage(locale, slug)` ilə dilə görə slug-u (`az` → `melumatlarin-yayimlanmasi-qrafiki`, `en` → `information-disclosure-schedule`) yükləyir. Başlıq: menyu node-u → CMS səhifəsinin adı → chrome `releaseSchedule.title`. Giriş: `features/release-schedule/model/intro.ts` `introHtml(content, hasRows)` — `parseBlocks` ilə ilk `<table>` blokundan (və `wrapTables` sarğısından) əvvəlki hissə; sətir yoxdursa məzmun olduğu kimi qalır. Nəticə `prepareCmsHtml` → `CmsContent`.

**Sətir yoxdursa (istifadəçi qərarı 2026-11-11, analiz I1-A)**: API xətası, köhnə `api-cbar` və ya boş qrafik eyni haldır — CMS mətni olduğu kimi (köhnə cədvəl daxil) göstərilir; axtarış paneli, yeni cədvəl, xəta və boş mesaj render olunmur. Boş nəticə mesajı yalnız sətirlər var, amma `q` heç birinə uyğun deyilsə çıxır.

**Rationale**: 038-in "köhnə siyahını sətirlər gələndə gizlət" qaydası; heç bir ara vəziyyətdə məzmun itmir; CMS mətni dəyişmir (FR-025). Yeni `AboutLayoutKind` deyil, layout fixture guard-ı tələb olunmur.

**Alternatives considered**: köhnə cədvəli həmişə kəsib xəta mesajı göstərmək (I1-B) — yayım ara vəziyyətində və xəta zamanı ziyarətçi qrafiki görmür.

## R10. Cədvəl və mobil görünüş

**Decision**: Yeni server widget `widgets/release-schedule-table`: tablet+ (`≥744`) semantik `<table>` (`<thead>`, qrup sətri `<th scope="colgroup" colSpan={3}>`), mobil (`<744`) `<ul>` kartlar (Figma `1718:30752`: başlıq 14/600, "Dövrilik" və "Təqdim olunma müddəti" etiketləri 12). Hər görünüş digər ölçüdə `hidden` ilə gizlənir. Rənglər `--site-table-*` tokenlərindən.

**Rationale**: Mövcud `widgets/data-table` qrup sətri və mobil kart vermir; Figma mobil ölçüdə cədvəli kartlara çevirir.

## R11. Modal

**Decision**: `widgets/decisions-dialog` (`'use client'`): kit `Dialog` (`@cbar/lib-react-ui-kit/dialog`), idarə olunan `open`. Trigger adi `<a href="/{locale}/media/events?type=1">` linkidir; hidratasiyadan sonra `onClick` `preventDefault` edib modalı açır. JS yoxdursa link Tədbirlərə aparır (spec US3-7). Mobil: aşağıya yapışıq vərəq, yuxarı radius 8, tutacaq; tablet+: mərkəzdə 560. "Növbəti/keçmiş/gələcək" vəziyyəti serverdə hesablanmış `next` tarixinə görə render olunur.

**Rationale**: 038 dialoq nümunəsi; `<noscript>` əvəzinə progressive enhancement, çünki trigger artıq mənalı linkdir. `web-cbar-new/CLAUDE.md` §2 `'use client'` siyahısına əlavə olunur.

## R12. Axtarış forması

**Decision**: `widgets/list-filter`-ə `dates?: boolean` (default `true`) və istəyə bağlı `labels.placeholder` əlavə olunur; bu səhifə `dates={false}` ilə çağırır. Düzülüş Figma-dakı kimi: desktop bir sətir (sahə 672, sağda "Filtrləri təmizlə" + "Axtar" 144), tablet/mobil sahə tam en, düymələr altda sağa.

**Rationale**: Mövcud GET forması, etiketlər `media.json`-da artıq var (`gallery.filter.submit/clear`). Qalereya və Tədbirlər dəyişmir (default `true`).

## R13. Admin bölməsi

**Decision**: Bir nav elementi `releaseSchedule` (`group: 'content'`), üç `sectionTabs`: `/release-schedule` (Sətirlər), `/release-schedule/groups`, `/release-schedule/periodicities`. Sətirlər modulu `listEnvelope: 'paged'`, filtrlər qrup / dövrilik / status (select); qrup və dövrilik seçimləri `LookupGate` + `useLookupOptions` (`pages/csr-projects`, iki lookup üçün `pages/events` nümunəsi). Qrup və dövrilik modulları `listEnvelope: 'items'`.

**Rationale**: 034/038 ilə eyni quruluş; statik seqment (`/groups`) TanStack-də dinamik `$id`-dən üstündür (Tədbirlərdə `/events/categories` kimi).

## R14. Tarix formatları

**Decision**: Plitədə gün + `events.monthShort.{n}` (mövcud açarlar, "fev"); kartda `formatLongDate` ("29 oktyabr 2026"). Alt sətir `releaseSchedule.decisions.subtitle` = `"{{year}}-{{suffix}} il · Mərkəzi Bankın İdarə Heyəti"`; şəkilçi `features/release-schedule/model/year-suffix.ts` (az): son sıfırdan fərqli rəqəm qrupunun oxunuşuna görə — 1,2,5,7,8 → `ci`; 3,4 → `cü`; 6 → `cı`; 9 → `cu`; onluqlar 10 `cu`, 20 `ci`, 30 `cu`, 40 `cı`, 50 `ci`, 60 `cı`, 70 `ci`, 80 `ci`, 90 `cı`; yüzlük `cü`; minlik `ci` (2026 → `cı`, 2027 → `ci`, 2030 → `cu`). en: `"{{year}} · Board of the Central Bank"`.

**Qeyd (əhatədən kənar)**: `locales/az/finance.json` `inflationYear` `"{{year}}-ci il"` sabit şəkilçi ilə yazılıb, 2026 üçün səhv formadır. Bu spec onu dəyişmir; helper hazır olandan sonra ayrıca düzəliş edilə bilər.

## R15. Seed

**Decision**: `0023-release-schedule-seed.sql`: cədvəllər boş deyilsə atlanır (038 qaydası). 2 qrup, 7 dövrilik (köhnə cədvəldəki az/en dəyərlər; Figma-dakı "—" ayrıca dəyər deyil, dövriliksiz sətirdir), 22 sətir az+en (siyahı `data-model.md` §Seed), sıra köhnə cədvəldəki kimi, hamısı `published`. "Pul siyasəti ilə bağlı qəbul olunan qərarlar" `timing_mode = 3`. Dövriliyi/müddəti boş olan köhnə sətirlərə Figma dəyərləri. Səhifə 130 tapılmasa da seed işləyir (mətn sabitdir, səhifəyə istinad yoxdur).

**Rationale**: FR-023..026; köhnə linkin hədəfi (`page-131`) modalla əvəzlənir (FR-024).
