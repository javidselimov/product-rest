# Research: KSM layihələri (spec 038)

## R1. Məzmun modeli

- **Decision**: Yeni məzmun növü: layihələr, tərcümələr, fotolar və kateqoriyalar üçün ayrıca cədvəllər.
- **Rationale**: Etiket, xülasə, cover və sıra üçün real sahə lazımdır. Redaktorun səhvi düzülüşü poza bilməz.
- **Alternatives**:
  - Səhifə markup-ı (ilk iterasiya): kövrək, spec-in səbəbi.
  - KSM səhifəsinin uşaq səhifələri: `Page`-də xülasə, cover, etiket yoxdur, onlar yenə `content` markup-ında qalardı. Public API uşaqları qaytarmır. Görünən uşaq Media menyusuna düşür, gizli uşaq ağacdan və axtarışdan itir.

## R2. Fotolar: mövcud `Gallery` yox, öz cədvəli

- **Decision**: `csr_project_images`.
- **Rationale**: Layihə qalereyası yalnız `IsActive` olanda qaytarılır, aktiv qalereya isə `/media/galleries` siyahısına düşür: FR-017 pozulardı. Adminin `AssetsSection`-u artıq sıralamanı dəstəkləyir.
- **Alternatives**: `Event.GalleryId` kimi FK (yuxarıdakı səbəbdən rədd).

## R3. Kateqoriyalar: öz cədvəli

- **Decision**: `csr_categories`, `EventCategory`-nin kopyası.
- **Rationale**: Hər aktiv tədbir kateqoriyası Tədbirlər filtrində tab olur (`api-cbar` `EventsController.cs:146-157`) və `events.*` icazəsinə bağlıdır. FR-018.
- **Alternatives**: `event_categories`-i paylaşmaq (rədd), sadə mətn (istifadəçi rədd etdi).

## R4. Cover ayrıca sahədir

- **Decision**: `csr_projects.cover_media_id` nullable. Saytda: cover, yoxdursa ilk foto, yoxdursa boş sahə.
- **Rationale**: Figma-da Maliyyə və Ekologiya kartında şəkil var, modalında qalereya yoxdur. Press-reliz qaydası (ilk şəkil cover) bunu verə bilmir.

## R5. Public endpoint

- **Decision**: Bir endpoint: `GET /api/v1/csr-projects?locale=`, səhifələmə yoxdur, kart və modal məlumatı birlikdə.
- **Rationale**: Modalın ayrıca ünvanı yoxdur, səhifə SSR-dir və `noscript` üçün mətn onsuz da lazımdır. Layihə sayı azdır.
- **Alternatives**: Siyahı + `{id}` detal: modal açılanda brauzer API-yə getməli olardı, sayt isə brauzerdən API çağırmır.

## R6. Dil görünüşü

- **Decision**: `show_az`, `show_en` + cari dildə tərcümə sətri olmalıdır.
- **Rationale**: Konstitusiya III.3 və `0001`-dəki press-reliz modeli ilə eyni. Tədbirlərdə bu sütunlar yoxdur, amma spec FR-007 tələb edir.

## R7. Seed miqrasiyası

- **Decision**: `0021-csr-projects-seed.sql`, `0019` üsulu ilə. Mətn ilk iterasiyanın hazır HTML-indən skriptlə köçürülüb, Azərbaycan mətni Figma-dandır.
  - Səhifə az slug ilə tapılır, id ilə yox. Səhifə yoxdursa layihələr yenə yaradılır, fotolar atlanır: boş baza deploy-u bloklamır.
  - Fotolar `page_assets` + `page_asset_translations`-dan az başlığa görə: `bilesuvar-nba-%`, `qanverme_%`, `sort_order` ilə. Tapılmayanda `RAISE NOTICE`.
  - Kateqoriya və ya layihə artıq varsa bütün seed atlanır. Runner faylı bir dəfə işlədir, bu ikinci qoruyucudur (FR-026).
  - `page_assets`-ə toxunulmur: media istifadədə qalır, layout onsuz da səhifənin fayl blokunu göstərmir.

## R8. Köhnə layihə mətni

- **Decision**: CMS mətninə toxunulmur. `parseCsrProjects` layihələr gələndə köhnə siyahı başlığından sonrakı node-ları göstərmir, layihə yoxdursa hamısını saxlayır. Başlıqlar `LEGACY_CSR_LIST_HEADINGS`-dədir, hər iki forma tanınır: köhnə qalın sətir və ilk iterasiyanın `<h2>Layihələrimiz</h2>` forması (2026-11-06-da test mühitində AZ səhifəsi ikinci formadadır, EN birinci).
- **Rationale**: İstifadəçi komponentləri əl ilə başqa layihəyə köçürüb bir dəfəyə deploy edir (2026-11-06), ona görə ikinci yayım mümkün deyil. Bu yol ardıcıllıqdan asılı deyil: heç bir ara vəziyyətdə mətn nə itir, nə təkrarlanır, sayt yayımı alınmasa da bazada heç nə dəyişməyib.
- **Alternatives**: Mətni miqrasiya ilə kəsmək, `web-cbar-new`-dən sonra ayrıca `0022` yayımı ilə (ikinci yayım tələb edir, rədd edildi); `0021`-də kəsmək (yayımlar arasında layihələr itərdi, rədd edildi).
- **Qalan fərq**: Köhnə mətn CMS-də qalır və axtarış onu səhifə nəticəsi kimi tapmağa davam edir. Redaktor istəsə əl ilə silir.

## R9. Axtarış

- **Decision**: `SearchController`-ə blok: `card_title`, `title`, `summary` üzrə `ILike`, cari dildə görünən dərc olunmuş layihələr. Nəticə ünvanı: `/{locale}/media/korporativ-sosial-mesuliyyet` və ya `/{locale}/media/corporate-social-responsibility`, tip `csr-project`.
- **Rationale**: Mətn səhifədən çıxanda axtarışda itər. Ünvan kodda sabitdir: `layouts.ts` slug-ları da belədir. Zəngin mətn üzrə axtarılmır, digər bloklar da yalnız başlıqla işləyir.

## R10. Saytda səhifə tərəfi

- **Decision**: `csr-projects` layout-u və `mediaLayoutFor` slug-ları qalır. Parser giriş mətnini və `linkedFile`-ı ayırır, köhnə siyahını R8 ilə kəsir. Layihələri `views/cms-page/loader.ts` yükləyir, xəta `[]` olur. Layout həmişə fayl blokunu gizlədir, çünki səhifənin `assets`-ində layihə fotoları və hər iki dilin PDF-i var.
- **Rationale**: Köhnə `page_assets` qalır (R7). EN səhifəsində AZ PDF-in görünməməsi üçün faylın yeri mətndəki keçiddir.
- **Alternatives**: Layout-u silib adi səhifə + `Attachments`: bütün fotolar səhifənin altına düşərdi.
- **Köhnə markup**: Cədvəl məntiqi silinir, köhnə siyahı R8-ə görə göstərilmir.

## R11. Xülasə sahəsi

- **Decision**: Admində yeni `textarea` `FieldType`. Kit-in `Textarea` komponenti istifadə olunur.
- **Rationale**: `text` bir sətirlikdir (`shared/crud/types.ts:38-47`), FR-003.

## R12. Yoxlama mühiti

- **Decision**: Docker işləmir: API-lər PGlite + socket ilə, sayt fikstür proxy + headless Edge ilə yoxlanılır. `next dev --webpack` yararsızdır (eval + nonce CSP), production build lazımdır.
- **Rationale**: 2026-11-06 ölçməsində təsdiqləndi.
