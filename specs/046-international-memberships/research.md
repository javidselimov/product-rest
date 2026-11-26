# Research — spec 046

Hamısı 2026-11-16-da kodda, test mühitində (`api-cbar-test`) və Figma-da (bridge) yoxlanılıb.

## R1. Səhifənin hazırkı vəziyyəti

- **Decision**: Səhifə yaradılmır, mövcud CMS səhifəsi 554 istifadə olunur (`beynelxalq-teskilatlarda-uzvluk`, valideyn 120, `showInSideNav: true`).
- **Faktlar**: az məzmun `<p>Beynəlxalq təşkilatlarda üzvlük</p>`. En tərcümə sətri **var**, amma az başlıq və az slug ilə (`GET /pages/tree?locale=en` → `554 Beynəlxalq təşkilatlarda üzvlük beynelxalq-teskilatlarda-uzvluk`), məzmun eyni yer tutucudur. `-copy` nüsxəsi yoxdur.
- **Nəticə**: seed en sətri yoxdursa INSERT, varsa və hələ az surətidirsə UPDATE edir (R6). Layout xəritəsinə az slug, gələcək en slug və hər ikisinin `-copy`-si yazılır.

## R2. Məzmun modeli: redaktor cədvəli

- **Decision**: Yeni `AboutLayoutKind` `'memberships'`; sətirlər səhifə mətnindəki **birinci `<table>`**-dan `parseAbout` ilə oxunur (spec 040 `brand-logos` kimi). API, DB sxemi, admin bölməsi yoxdur.
- **Rationale**: İstifadəçi qərarı. 14 sətir, ildə 1–2 dəyişiklik; redaktor cədvəli onsuz da tanıyır. Bir komponent (`web-cbar-new`) + fikstür + seed.
- **Alternatives**: spec 045 kimi ayrıca məzmun növü — rədd edildi (4 komponent, ~3× iş).

## R3. Cədvəlin oxunma qaydası

- **Decision**:
  - `tableRows()` (`features/about-content/model/table-rows.ts`) təkrar istifadə olunur: yalnız `th`-dan ibarət sətir atılır. Redaktorun "Cədvəl əlavə et" düyməsi `withHeaderRow: true` ilə işləyir (`rich-text/ui/toolbar.tsx:319`), yəni birinci sətir standart olaraq `th`-dır.
  - Əlavə: **birinci** sətir `td`-dirsə və ikinci xanasında 4 rəqəmli il yoxdursa, o da başlıq sayılır (redaktor başlığı adi xana ilə yazıb).
  - Xana 1 → təşkilat (mətn; xanada `http(s)` link varsa birinci linkin `href`-i); xana 2 → il mətni (`textOf`), `year` = ilk `\b(1[89]|20)\d{2}\b` uyğunluğu və ya `null`. 3-cü və sonrakı xanalar atılır. İki xanası da boş sətir atılır. 1 xanalı sətir: il boş.
  - Cədvəldən əvvəlki düyünlər → `introHtml`, sonrakılar → `restHtml` (`outerOf`). Cədvəl yoxdursa və ya `tableRows` `null` qaytarırsa, ya da heç bir sətir qalmırsa → bütün məzmun `introHtml`, `rows: []` (səhifə adi mətn kimi görünür, çeşidləmə yoxdur).
- **Rationale**: `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-dədir; təşkilat xanası düz mətn + ayrıca `href` kimi daşınır, React `<a>` ilə render olunur. Mürəkkəb xana HTML-i (qalın, kursiv) itir — Figma-da yalnız düz ad var.

## R4. Çeşidləmə: memorandum məntiqinin ümumiləşdirilməsi

- **Decision**: `MEMORANDUM_SORT`/`parseMemorandumSort`/`orderMemorandums` (`model/memorandums.ts`) yeni `model/year-sort.ts`-ə köçür: `YEAR_SORT`, `parseYearSort`, `orderByYear(rows, yearOf, sort)`. Memorandum və üzvlük hər ikisi onu çağırır. URL parametri eyni: `?sort=oldest` (`QUERY_PARAM.SORT`).
  - Üzvlükdə sətirlər redaktorun sırası ilə gəlir (API kimi əvvəlcədən sıralanmayıb), ona görə `orderByYear` **sabit** sıralamadır: il azalan (`newest`) və ya artan (`oldest`), eyni ildə redaktor sırası, `year: null` həmişə sonda.
  - Memorandumda API artıq azalan sıra verir; ümumi funksiya eyni nəticəni verir (sabit sort) — `memorandums.test.ts`/`sort` testləri dəyişmədən keçməlidir.
- **Decision**: `MemorandumSortMenu` → `widgets/about-blocks/year-sort-menu.tsx` (`YearSortMenu`, `label` prop: "Tarix:" / "Üzvlük tarixi:"). `AboutBlocks`/`CmsPageView`-dakı `memorandumSort` prop-u `yearSort` adlanır.
- **Alternatives**: kopyalamaq — rədd (iki eyni `<details>` menyusu, `senior-front` "duplicated logic" smell).

## R5. Görünüş: memorandum cədvəlinin üslubu, iki sütun

- **Decision**: Yeni `widgets/about-blocks/memberships.tsx`; cədvəl xanalarının sinifləri memorandumla ortaq sabitlərə çıxarılır (`widgets/about-blocks/constants.ts`: `TABLE_HEAD_CELL`, `TABLE_BODY_CELL`, zebra). Ölçülər: [contracts/ui-contract.md](./contracts/ui-contract.md).
- Fərqlər memorandumdan: 2 sütun; tarix sütunu desk/tablet 164 (140 + sağ padding 24), mobil 80 (68 + 12); mobil başlıq sətri 56 ("Üzvlük / tarixi" iki sətir); mobil çeşidləmə düyməsinin sağ padding-i 0; cədvəl başlığı (H2) **vizual gizli** (`sr-only`), cədvəlin adı olaraq qalır.

## R6. Seed

- **Decision**: `api-cbar-admin/db/migrations/0029-international-memberships-seed.sql` — yalnız `page_translations` UPDATE/INSERT, sxem dəyişmir. `0028` nümunəsi: `has_table_privilege('page_translations','UPDATE'/'INSERT')` yoxlaması, yoxdursa `RAISE WARNING` + çıxış (paylaşılan mühitdə sahib başqa roldur — `no-alter-existing-tables` qaydası).
  - Səhifə az slug ilə tapılır; yoxdursa `NOTICE` + çıxış.
  - az: `content` boşdur və ya `<p>Beynəlxalq təşkilatlarda üzvlük</p>` (boşluqlar normallaşdırılaraq) → cədvəl.
  - en: sətir yoxdursa INSERT (title, slug, content); varsa və `title = az.title` və məzmun boş/yer tutucudursa → UPDATE title + content; slug yalnız `membership-in-international-organizations` en dilində boşdursa dəyişir (`UNIQUE (locale, slug)`).
  - Hər iki şərt idempotentdir: ikinci işləmədə məzmun artıq yer tutucu deyil.
- **Ad**: `0029` hər iki API-də istifadə olunmayıb (`api-cbar/db/migrations` yoxdur, `api-cbar-admin` son `0028`).
- Boş bazada (dev, səhifə yoxdur) seed heç nə etmir — dev üçün səhifəni redaktor yaradır və ya quickstart-dakı addım.

## R7. Admin menyu: qruplar və sıra

- **Decision**: Qrup adları saytın kök səhifələrinin başlıqları, sıra saytın ağac sırasıdır (test ağacı: Haqqımızda 1, Bazar iştirakçıları 12, Hüquqi aktlar 20, Milli pul nişanları 40, Statistika 52, Media 77, Beynəlxalq əməkdaşlıq 120). Saytda olmayan qruplar sonda: "Ana səhifə", "İdarəetmə". Media kitabxanası qrupsuzdur (hər bölmə istifadə edir).
  - MEAS → "Bazar iştirakçıları": saytda `/securities` ("Məlumatların Elektron Açıqlanması Sistemi"), emitent açıqlamaları bazar iştirakçılarına aiddir.
  - Məzənnələr/AZIR/İnflyasiya/Gəlirlik əyriləri → "Statistika" (saytda `/currencies`, `/statistics`).
  - Yayım qrafiki → "Media" (saytda `/media/release-schedule`, spec 039), CMS-də kök səhifə 130 olsa da.
- **Tək bəndlik bölmə** qrup başlığı olmadan birbaşa bənd kimi göstərilir: başlıq + bir bənd iki sətir tutur və klik sayını artırır.
- **Hesab** (SC-005): bağlı halda İdarə paneli, Səhifələr, Media kitabxanası, Haqqımızda, MEAS, Qanunlar, Pul nişanları, Statistika, Media, Beynəlxalq əməkdaşlıq, Ana səhifə, İdarəetmə = **12** sətir.

## R8. Admin menyu: komponent və vəziyyət

- **Decision**: `nav.ts` düz `navItems` + `group` sahəsini saxlayır (route tipləri, `findNavItem`, palet dəyişmir), yeni `NAV_GROUPS` siyahısı açar + sıra verir, yeni `navEntries()` qrupsuz bənd / tək bənd / qrup ardıcıllığını qaytarır ([contracts/admin-nav.md](./contracts/admin-nav.md)).
  - Qrup UI-si: native `<details>`/`<summary>` deyil, `button[aria-expanded]` + `aria-controls` ilə öz bölməsi (kit-in `Accordion`-u Radix-dir, amma `type="multiple"` + idarə olunan dəyər + aktiv qrupun məcburi açıq qalması onu mürəkkəbləşdirir). Klaviatura: `Enter`/`Space` açır-bağlayır, fokus halqası mövcud nav bəndi ilə eyni.
  - Vəziyyət: mövcud persist olunan `useUiStore`-a (`shared/model/ui-store.ts`, açar `UI_STORE_KEY = 'nexus-ui'`) `openNavGroups: NavGroup[]` + `toggleNavGroup(group)` əlavə olunur — ayrıca storage açarı yaratmır, saxlama xətasını zustand `persist` özü udur (gizli pəncərədə vəziyyət yalnız yaddaşda qalır). Aktiv qrup render zamanı birləşdirilir, store-a yazılmır. Token deyil, gizli məlumat deyil — spec 005 qaydasını pozmur.
  - ⌘K palet: `Command.Group heading` artıq qrup adı göstərir; yeni qruplarla avtomatik uyğunlaşır, tək bəndlik qrupların bəndləri qrup başlığı ilə qalır (axtarışda kontekst).
  - Breadcrumb/başlıq: `findNavItem` dəyişmir.
- **Alternatives**: bəndləri "Səhifələr"in altına qoymaq — istifadəçi rədd etdi; səhifə ağacına bənd qoşmaq — spec-dən kənar.

## R9. Səhifə redaktorunda bölmə keçidi

- **Decision**: `features/pages/model/managed-sections.ts`: az slug → `{ navKey, path }` xəritəsi (`beynelxalq-teskilatlarla-emekdasliq` → `/ifi-organizations`, `merkezi-banklarla-emekdasliq` → `/memorandums`, `korporativ-sosial-mesuliyyet` → `/csr-projects`, `melumatlarin-yayimlanmasi-qrafiki` → `/release-schedule`; `-copy` suffiksi kəsilərək); üzvlük slug-ı → "cədvəl qaydası" qeydi (keçid yox). Yeni `ManagedSectionCard` `page-form.tsx`-də `MenuVisibilityCard`-ın yanında, yalnız xəritədə olan səhifədə. Slug saytdakı `COOPERATION_LAYOUTS`-dan **kopyalanmır** (ayrı repo) — admin testində sabit siyahı.
- **Rationale**: id mühitlər arasında fərqlənə bilər, az slug seed-lərin də istifadə etdiyi açardır (0026, 0028).

## R10. Sənədlər (FR-017, FR-018)

- **Decision**: Grep siyahısı (2026-11-16): `web-cbar-new/docs/media-cms-guide.md` (Tədbirlər, KSM layihələri, Yayım qrafiki), `about-cms-guide.md` (Səhifələr, Təşkilat → Şöbələr), `cooperation-cms-guide.md` (Maliyyə təşkilatları, Memorandumlar + yeni üzvlük bölməsi), `how-to-use.md`; `web-cbar-admin-new/CLAUDE.md:27,29,49`, `docs/how-to-use.md:83`; kök `CLAUDE.md` (spec 034/038/039/044/045 bəndləri + yeni 046 bəndi); `business_logic/new_business_logic.md` (`/sync-business-logic`). Bitirmə yoxlaması: köhnə "sidebar (5 qrup)" və qrupsuz bölmə adlarının grep-i ([quickstart.md](./quickstart.md) §4).
