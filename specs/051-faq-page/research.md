# Research — 051 Sual-cavab (FAQ)

Mənbələr: test API (`api-cbar-test.cbar.az`, 2026-11-17), Figma "cbar website (Copy)" › "FAQ", `product-host`, mövcud kod (spec 038/039/044/046
nümunələri). Frontend qərarları `senior-front`, `frontendpatterns`, `frontend-standards`, `ui-kit-usage` skill-ləri ilə verilib (layihə qaydası).

## R1. Məlumat modeli: ayrıca məzmun növü, mövcud cədvəllərə toxunmadan

- **Decision**: Yeni cədvəllər `faq_topics` (+ `_translations`), `faq_topic_pages`, `faq_questions` (+ `_translations`), `faq_videos`
  (+ `_translations`); `content_status` + soft-delete, spec 044 (`0025-ifi-organizations.sql`) şablonu ilə: FK-lar yalnız `REFERENCES` icazəsi
  varsa, `set_updated_at` trigger-i, `cbar_web_ro`-ya `GRANT SELECT`, `faq.*` icazələri. Playlist linki saxlanmır (clarify 2026-11-17: göstərilmir).
- **Rationale**: İstifadəçi redaktor rahatlığını əsas tələb etdi; 200+ sualı bir rich-text sahəsində işarələmə ilə saxlamaq səhvə açıqdır. Ayrıca
  sətirlər sıranı, aktivliyi, dil tamlığını və axtarışı mümkün edir. `ALTER TABLE` yoxdur (paylaşılan mühitdə "must be owner").
- **Alternatives**: (a) CMS markup parse (ilk spec versiyası) — redaktor üçün çətin, istifadəçi rədd etdi. (b) Mövcud `videos` cədvəlinə kateqoriya
  sütunu — `ALTER TABLE` tələb edir və Media → Videolar siyahısını qarışdırır. (c) `ShowAz/ShowEn` bayraqları — dil görünürlüyü artıq tərcümənin
  dolu olmasından çıxır (spec FR-002); əlavə bayraq redaktora ikinci açar verir, çaşdırır.

## R2. Dil görünürlüyü və nömrələmə

- **Decision**: Public API sualı bir dildə yalnız həmin dilin `question` və `answer` sahələri dolu olanda qaytarır; mövzunu yalnız həmin dildə adı və
  ən azı bir görünən sualı olanda. Nömrə saxlanmır — sayt sıradan hesablayır (1-dən).
- **Rationale**: Yarımçıq tərcümə yayılmır (spec edge case); en qaralaması seed ilə tam doludur, sonradan yalnız az yazılmış sual en-də görünmür.
- **Alternatives**: Boş en-də az mətnini göstərmək (fallback) — dil qarışığı yaradır, Maddə V.3 bir dilin boş qalmasına icazə verir.

## R3. Mövzunun ünvan açarı

- **Decision**: `faq_topics.slug` (ASCII, unikal, dilsiz) yaradılanda az addan `SlugService` ilə qurulur və sonra dəyişmir; admin formda yalnız oxunur.
  Saytda `?topic=<slug>` hər iki dildə eynidir.
- **Rationale**: Ad dəyişəndə paylaşılan linklər qırılmır; dil dəyişdiricisi sorğunu saxlamasa da açar dilsizdir.
- **Alternatives**: Dilə görə slug — iki dəyər saxlamaq, dil dəyişəndə uyğunlaşdırmaq lazım olur; id ilə — oxunmaz URL.

## R4. Saytda FAQ səhifəsinin yeri

- **Decision**: FAQ CMS səhifəsinin öz ünvanında qalır (az `sual-cavab`, en `faq` — seed en tərcüməni yaradır). Catch-all route son seqmenti
  `FAQ_SLUG` (`entities/page-node`, `LITERACY_ROOT_SLUG` kimi) ilə tutuşdurur və `views/faq`-ı render edir; başlıq/SEO CMS səhifəsindən, mövzular
  `GET /api/v1/faq`-dən. FAQ məlumatı yoxdursa (və ya API xətası) səhifə adi CMS səhifəsi kimi göstərilir (köhnə akkordeon mətni — məlumat itmir).
- **Rationale**: Ünvan, menyu, footer və dil dəyişdiricisi (`findLocaleCounterpart`) mövcud ağac mexanizmi ilə işləyir; ayrıca route (spec 039
  kimi) `FEATURE_ROUTES` xəritəsi və iki yönləndirmə tələb edərdi. CMS səhifəsinin köhnə mətni FAQ olduğu müddətdə göstərilmir (FR-011).
- **Alternatives**: `/faq` ayrıca route — menyu node-unu xəritələmək, köhnə slug-ı yönləndirmək lazımdır; əlavə fayda yoxdur.

## R5. Axtarış

- **Decision**: Sayt loader-i bütün FAQ-ı bir sorğu ilə alır və `q`-nu özü süzür: sual mətni + cavabın düz mətni (`stripHtml`), `foldForSearch`
  (İ/ı, böyük/kiçik hərf). `foldForSearch` `features/release-schedule/model/search.ts`-dən `shared/lib/search-fold.ts`-ə köçür (FSD: bir feature
  digərini import etmir; köhnə yerdə re-export qalmır — spec 032).
- **Rationale**: ~250 sual, ~190 KB mətn — server render-də süzmək ucuzdur; Postgres `ILIKE` İ/ı qatlamır (spec 039 R4).
- **Alternatives**: API-də axtarış — ICU collation tələb edir; Meilisearch indeksi — bu həcm üçün artıqdır.

## R6. Görünüş A/B və JS-siz işləmə (frontendpatterns: Progressive Enhancement, Disclosure)

- **Decision**: Hər mövzu və sual native `<details>`/`<summary>`dır (spec 044 `ifi-organization-card` kimi, `data-accordion` çapda açır). Axtarış və
  mövzu seçimi bir GET formasıdır: kit `inputVariants` ilə `<input type="search" name="q">`, native `<select name="topic">` (kit stilində — layihə
  qaydası: kit `Select` GET-də dəyər göndərmir), və "Göstər" düyməsi. Yeganə client komponenti `faq-topic-select.tsx`: `change`-də
  `form.requestSubmit()` çağırır və hidratasiyadan sonra düyməni vizual gizlədir (`sr-only` deyil — JS-siz də görünür).
- **Rationale**: Bütün funksiyalar JS-siz işləyir (SC-007); client JS ~1 KB; server state URL-dədir (`frontend-standards`: URL = searchParams + Zod).
- **Wrong choice rejected**: kit `Accordion` (client komponenti, JS-siz açılmır, 250 elementi hidratasiya edir); client-side filtr (bütün cavabları
  client-ə göndərir, SSR nəticəsi ilə uyğunsuzluq).

## R7. Video kartı

- **Decision**: `faq_videos.youtube_url`; sayt `youtubeId`/`youtubeThumbnail` ilə önizləmə qurur, link `https://www.youtube.com/watch?v=<id>`,
  `target="_blank" rel="noopener noreferrer"`. `features/media/model/youtube.ts` `shared/lib/youtube.ts`-ə köçür (2 importer). Şəkil `SiteImage` ilə
  (spec 036), CSP `img-src https:` icazə verir.
- **Rationale**: Spec qərarı (YouTube-da açılır); iframe və CSP `frame-src` dəyişikliyi lazım deyil.
- **Alternatives**: `VideoPlayer` facade (spec 035) — istifadəçi YouTube-da açmağı seçdi.

## R8. Bölmə səhifəsi bloku

- **Decision**: `faq_topic_pages (topic_id, page_id, sort_order)`; public `GET /api/v1/faq/topics?pageId=&locale=` (yüngül: `slug, name, questionCount`) səhifəyə bağlı görünən mövzuları
  sualları ilə qaytarır. `loadCmsPage` səhifə yüklənəndən sonra bunu çağırır (xəta → `[]`, səhifə dəyişmir) və `CmsPageView` həm şablon
  bölmələrində (`ShellPage`), həm köhnə görünüşdə mətndən sonra `widgets/faq/faq-topic-link-card` göstərir: hər mövzu üçün keçid kartı
  (ad + say + "Bax →") → `/{locale}/{FAQ_SLUG}?topic=<slug>` (clarify 2026-11-17: suallar bölmə səhifəsində göstərilmir).
- **Rationale**: Hər CMS səhifəsi bir əlavə yüngül sorğu edir (rate limit 1000/dəq, SSR fan-out artıq 3–5 sorğudur). Səhifə DTO-suna sahə əlavə etmək
  `GET /pages/{slug}` kontraktını dəyişərdi (Maddə VII.3 — geriyə uyğun olardı, amma iki API-ni bağlayardı).
- **Alternatives**: Bütün FAQ-ı hər səhifədə almaq — ~190 KB hər səhifə yüklənməsində.

## R9. Seed: köhnə məzmunun köçürülməsi və en qaralaması

- **Decision**: İki migration: `0032-faq.sql` (sxem, icazələr) və `0033-faq-seed.sql` (məzmun). Seed generator skripti
  `specs/051-faq-page/seed/` altındadır (repo-da yalnız tooling, upstream komponentə düşmür): (1) `extract-faq.mjs` test API-dən səhifənin az HTML-ini
  oxuyur, `<details>` → mövzu, tək bəndli `<ol><li><strong>` → sual, növbəti suala qədər elementlər → cavab, `data-youtube-video` → video; JSON çıxarır
  və sayları yoxlayır; (2) `topic-names-en.json` — yalnız 8 mövzunun en adı; (3) `build-seed.mjs` SQL yazır; `faq-en.json` (sual/cavab tərcüməsi)
  verilərsə onu da qəbul edir — gələcək en seed-i üçün eyni generator. SQL: `IF NOT EXISTS (SELECT FROM faq_topics)` DO bloku; HTML `$faq$…$faq$`
  dollar-quote ilə; səhifə slug ilə tapılır (id-lər mühitə görə fərqlidir); az başlıq yalnız "Sual − cavab"-dırsa "Sual-cavab"; "Pul siyasəti" mövzusu
  → slug `pul-siyaseti` səhifəsi.
- **en tərcümə təxirə salınıb** (istifadəçi, 2026-11-17: ~190 KB tərcümə çox token aparır). FAQ səhifəsinin en tərcüməsi seed edilmir: sualsız en
  səhifə boş görünərdi. en məzmun dolanda redaktor səhifənin en tabını (başlıq, slug `faq`) əlavə edir; `FAQ_SLUG.en = 'faq'` sayt tərəfində hazırdır.
  Admin suallar siyahısında `missingLocale=en` filtri tərcümə işini izləyir.
- **Rationale**: Seed bir dəfə işləyir və redaktorun işini ezmir; generator təkrar istehsalı mümkün edir (canlı dump fərqli olsa yenidən qurulur).
- **Video başlığı**: köhnə məzmunda yoxdur; generator YouTube oEmbed-dən oxuyur, alınmasa Figma başlığı ("Sığorta hadisəsi zamanı zərərlərin birbaşa
  tənzimlənməsi") qaralama kimi yazılır.
- **Alternatives**: Startup-da HTML-i C#-da parse edən import — runtime kodu bir dəfəlik iş üçün; admin "import" düyməsi — redaktora lazımsız.

## R10. Admin UX (redaktor rahatlığı)

- **Decision**: Bir menyu bəndi "Sual-cavab" (`/faq`), üç bölmə tabı (spec 029 `sectionTabs`): **Suallar** (`/faq`), **Mövzular** (`/faq/topics`),
  **Videolar** (`/faq/videos`) — hamısı `ModuleConfig` (CRUD şablonu; əl ilə səhifə yazmaq Duplicate Code olardı). Əlavələr:
  - `ModuleConfig.listExtras?: ComponentType` — siyahının üstündə modul bloku (sıralama düyməsi + dialoq). Generic, kiçik.
  - `ModuleConfig.initialValues?: (search) => Partial<FormValues>` — `/faq/new?topicId=3` mövzunu əvvəlcədən seçir.
  - `shared/ui/sortable-list.tsx` — native HTML5 drag & drop + hər sətirdə yuxarı/aşağı `IconButton` (klaviatura yolu) + `aria-live` elanı
    ("2-ci yerə keçdi"). Kit-də sortable yoxdur; yeni dependency yoxdur. Mövcud beş yuxarı/aşağı siyahı (qalereya, IFI, CSR, işçi şəkilləri, səhifə
    faylları) bu spec-də köçürülmür — ayrıca refaktor (follow-up, `research` qeydi).
  - Suallar siyahısı: mövzu tabları (`FilterConfig type: 'tabs'`, "Hamısı" + mövzular), axtarış, sütunlar: №, sual (az), mövzu, dillər (az/en nişanları,
    boş en → "en yoxdur"), status.
  - Mövzu formu: az/en ad, açar (yalnız oxunur), status, bağlı səhifələr (kit `Combobox` çoxseçimli — səhifə başlığı ilə axtarış), `editExtras`:
    mövzunun sualları `SortableList` ilə (sürüşdür/düymə), hər birinə redaktə linki, "Yeni sual" (`?topicId=`).
  - Sual formu: mövzu (select), az/en tablarında sual (textarea, 1–3 sətir) + cavab (`richtext` — saytın rich-text redaktoru, TipTap; cədvəl/link/şəkil
    dəstəklənir), status. Yadda saxlanmamış dəyişiklik xəbərdarlığı CRUD şablonunda mövcuddur (yoxlanacaq, yoxdursa `useBlocker` ilə əlavə).
  - Videolar: link (Zod + API YouTube id yoxlaması, səhv linkdə Azərbaycanca xəta), az/en başlıq, status; önizləmə siyahıda kiçik şəkil sütunu və
    redaktə formunda `editExtras` kartı; siyahının üstündə (`listExtras`) sıralama.
  - Səhifə formu: `managed-sections.ts`-də `sual-cavab` → `/faq` linki; digər səhifələr üçün `GET /faq/topics?pageId=` ilə "Bu səhifədə FAQ bloku:
    Pul siyasəti" kartı.
- **Rationale**: Mövcud CRUD şablonu az/en tabları, rich-text, validasiya, səhv mesajları və silmə dialoqunu artıq verir — redaktor tanış ekran görür.
- **Alternatives**: Tam əl ilə yazılmış iki panelli ekran — daha çox kod, CRUD qaydalarından kənar; mövcud yuxarı/aşağı düymələri — 23 sualda yavaşdır,
  istifadəçi sürüşdürməni istədi.

## R11. Silmə qaydası

- **Decision**: Sualları olan mövzu silinmir: admin API `409` + Azərbaycanca mesaj ("Mövzuda N sual var — əvvəl onları köçürün və ya silin"); soft-delete.
- **Rationale**: Səhvən 87 sualı silmək mümkün olmamalıdır.
- **Alternatives**: Kaskad silmə — geri qaytarılmaz itki riski.

## R12. Köhnə URL

- **Decision**: `proxy.ts` `legacyRedirect()`-ə `^/(az|en/)?page-131(/.*)?$` → `/{locale}/{FAQ_SLUG[locale]}` (308; `?language=` dili seçir), spec 039
  `page-72` nümunəsi. Qeyd: canlı saytda `page-131` id-si test bazası ilə üst-üstə düşməyə bilər — canlı köhnə FAQ ünvanı deploy-dan əvvəl
  `product-host` dump-ı ilə yoxlanır (quickstart addımı); fərqlidirsə regex dəyişir.

## R13. Frontend skill qaydasının nəticələri (senior-front)

- Server Component default; `'use client'` yalnız `faq-topic-select.tsx`. Derived state saxlanmır: görünən mövzular, saylar, nömrələr loader-də
  bir dəfə hesablanır (`model/select.ts`, saf funksiya, test olunur).
- Kəşf olunan qoxular və həlli: `foldForSearch` və `youtube` helper-ləri feature-lərə bağlıdır (Feature Envy/yanlış qat) → `shared/lib`-ə köçür;
  admin-də beş təkrarlanan yuxarı/aşağı siyahı (Duplicate Code) → `SortableList` yaranır, köçürmə follow-up.
- Boş/xəta vəziyyətləri ayrı: FAQ boş → CMS mətni; axtarış boş → boş vəziyyət + təmizləmə linki; API xətası → CMS mətni (səhifə boş qalmır).
