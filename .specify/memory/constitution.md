<!--
Sync Impact Report
- Versiya dəyişikliyi: (şablon) → 1.0.0 (ilk ratifikasiya)
- Dəyişən prinsiplər: yoxdur — ilk versiya.
- Əlavə olunan bölmələr:
  - Core Principles: Maddə I–VIII
  - Texnologiya yığını və proyekt xəritəsi
  - İş axını və keyfiyyət qapıları
  - Governance
- Silinən bölmələr: yoxdur.
- Şablon placeholder-ləri: hamısı doldurulub; qalan bracket token yoxdur.
- Təxirə salınmış TODO-lar: yoxdur.
- Asılı sənədlər: `.specify/templates/plan-template.md` "Constitution Check" bölməsi bu
  sənədi runtime-da oxuyur — əlavə dəyişiklik tələb olunmur. `CLAUDE.md` (root) və
  `new-template/.specify/memory/constitution.md` bu sənədin istinad etdiyi mənbələrdir.
-->

# cbar.az Yenidənqurma Workspace Constitution

> Bu sənəd `commonrabc` workspace-inin **dəyişməz prinsiplərini** təyin edir. Hər
> `specs/NNN-*/spec.md`, `plan.md` və `tasks.md` bu sənədə zidd ola bilməz.
>
> Workspace-in məqsədi: **`product-host`** (hal-hazırda hostda işləyən Yii2 cbar.az)
> referans götürülərək dörd yeni proyektin — `api-cbar`, `api-cbar-admin`, `web-cbar`,
> `web-cbar-admin` — ona funksional uyğunluğunu təmin etmək, texnologiyanı dəyişmək,
> admin və client-i ayrı proyektlərə bölmək, proyektlər arası əlaqəni və birlikdə
> run olunmasının idarə edilməsini həll etmək. `web-cbar-admin` **`new-template`**
> əsasında yenidən qurulur.
>
> Mənbələr: `CLAUDE.md` (root — arxitektura və əməliyyat qaydaları), `GUIDE.md`
> (lokal quraşdırma), `new-template/CLAUDE.md` və
> `new-template/.specify/memory/constitution.md` (template müqaviləsi),
> `REDESIGN-PLAN.md` (redizayn inventarı).

## Core Principles

### Maddə I — `product-host` referans mənbədir

1. `product-host/` köhnə cbar.az-ın **Yii2 mənbə kodudur** və hal-hazırda hostda
   işləyən sistemdir. O, **funksional həqiqətin mənbəyidir**: yeni proyektlərin nə
   etməli olduğu ona baxılaraq müəyyən edilir.
2. `product-host/admin` (Yii2 admin) → `web-cbar-admin` + `api-cbar-admin`;
   `product-host/visitor` (Yii2 public sayt) → `web-cbar` + `api-cbar`;
   `product-host/common` (paylaşılan model/migration) → hər iki API-nin `Cbar.Domain`
   kopyası. Hər yeni feature spec-i **hansı Yii2 controller/model-i əvəz etdiyini**
   açıq göstərməlidir.
3. `product-host`-da mövcud olan hər public URL, RSS/XML feed və admin funksiyası ya
   yeni sistemdə **birə-bir qarşılığını** tapmalı, ya da spec-də **açıq şəkildə
   "ləğv edilir"** deyə qeyd olunmalıdır. Səssiz itki qadağandır.
4. `product-host` **yalnız oxunur**: ona heç bir dəyişiklik edilmir, o build və run
   olunmur, ondan kod köçürülmür — yalnız davranış, məlumat strukturu və URL/İA
   inventarı çıxarılır.
5. Texnologiya dəyişir, **informasiya arxitekturası dəyişmir**: menyu strukturu,
   məzmun tipləri və iki dilli (az/en) model `product-host`-dan miras qalır.

### Maddə II — Dörd müstəqil proyekt, bir workspace

1. `api-cbar`, `api-cbar-admin`, `web-cbar`, `web-cbar-admin` — hər biri upstream-də
   **ayrı GitLab repo-sudur**: öz `.gitlab-ci.yml`, `Dockerfile`, `.ci-cd/` və README-si
   ilə. Root-da paylaşılan kod **yoxdur** və yaradılmır.
2. Root-da yalnız orkestrasiya yaşayır: `dev.ps1` / `dev.sh`, `GUIDE.md`, `CLAUDE.md`,
   `.specify/`, `specs/` və istinad materialları (`product-host/`, `new-template/`,
   `REDESIGN-PLAN.md`).
3. İki proyektə toxunan dəyişiklik = **iki ayrı upstream merge request**; spec və
   plan bunu ayrı-ayrı iş paketləri kimi göstərməlidir və deploy sırasını yazmalıdır.
4. Proyektlər arası yeganə qanuni əlaqə **HTTP API kontraktı** və **paylaşılan
   PostgreSQL sxemidir**. Fayl sistemi üzərindən import, symlink, paylaşılan
   `node_modules` və ya paylaşılan NuGet qadağandır.
5. Hər proyekt öz `README`/`CLAUDE.md`-sini saxlayır; root `CLAUDE.md` yalnız
   proyektlərarası qaydaları yazır.

### Maddə III — Admin və client sərt ayrılıqdadır

1. **Admin cütü**: `web-cbar-admin` ↔ `api-cbar-admin`. **Client cütü**: `web-cbar` ↔
   `api-cbar`. Çarpaz çağırış (`web-cbar` → `api-cbar-admin`, `web-cbar-admin` →
   `api-cbar`) qadağandır.
2. `api-cbar-admin` sxemin **yeganə sahibi və yeganə yazanıdır**. `api-cbar`
   PostgreSQL-ə `cbar_web_ro` (SELECT-only) rolu ilə qoşulur; read-only **database
   grant-ları** ilə təmin olunur, konvensiya ilə yox.
3. Public tərəfə çıxan hər sorğu **filtrlənir**: `Status == Published`, soft-delete
   bayraqları, `ShowAz`/`ShowEn` lokal görünürlüyü və tarixli məzmun üçün
   `PublishedAt` embarqosu. Filtrsiz public endpoint qəbul edilmir.
4. Admin API-də hər endpoint JWT ilə qorunur (`auth/login` istisna); hər yazma
   əməliyyatı `AuditService` vasitəsilə `audit_log`-a düşür.
5. `web-cbar-admin` üçün API ünvanı **build-time** (`BUILD_ENV` → `.env.*`), `web-cbar`
   üçün **runtime** (`API_URL`) təyin olunur. `new-template`-ə keçiddən sonra admin
   panel template-in iki qatlı modelinə keçir: `/config.json` runtime override +
   `VITE_API_URL` fallback (Maddə VI).

### Maddə IV — Run və start sırası idarə olunur

1. Bütün stack-in lokal işə salınması üçün **vahid giriş nöqtəsi** `dev.ps1`
   (Windows) və `dev.sh` (macOS/Linux)-dır. Yeni proyekt və ya port əlavə olunanda
   **hər iki skript** eyni dəyişiklikdə yenilənir.
2. Start sırası **sabitdir və dəyişmir**: Docker infra → `api-cbar-admin` (migration
   + seed, `cbar_web_ro` rolunu yaradır) → `api-cbar` → `web-cbar-admin` → `web-cbar`.
   Deploy sırası eynidir. Bu sıranı pozan dəyişiklik qəbul edilmir.
3. Portlar sabitdir: `5253` (api-admin), `5139` (api-web), `5173` (web-admin), `3000`
   (web-public), Postgres `5433`, MinIO `9002/9003`. Port dəyişikliyi `dev.ps1`,
   `dev.sh`, `GUIDE.md`, `CREDENTIALS.md` və proyektlərin default API URL-lərində
   eyni anda edilir.
4. Hər serverin çıxışı `logs/{api-admin,api-web,web-admin,web-public}.log`-a yazılır.
   Skriptlər idempotentdir: portları tutan prosesləri öldürüb yenidən başladır.
5. Boş bazadan işə salma reproduksiya olunandır: `db/seed.sql` (reference data) +
   iki addımlı mock content (`placeholder-1.svg`/`placeholder-2.svg` upload →
   `mock-content.sql`). Addım sırası pozulanda **xəta çıxmır, şəkillər 404 verir** —
   sıra sənədləşdirilmiş və skriptləşdirilmiş qalmalıdır.

### Maddə V — Sxem, migration və ikidillilik konsistensiyası

1. `src/Cbar.Domain` `api-cbar` və `api-cbar-admin`-də **bayt-bayt eynidir**. Entity
   və ya `CbarDbContext` dəyişikliyi **hər iki kopyada eyni commit-dəki** iş
   paketində edilir; diff sıfır olmalıdır.
2. Migration-lar **append-only**: tətbiq olunmuş fayl redaktə edilmir; içində
   `BEGIN`/`COMMIT` yoxdur; `IF NOT EXISTS` ilə mövcud bazaya qarşı yazılır;
   fayl adı **hər iki API repo-su üzrə unikaldır** (paylaşılan `schema_migrations`
   təkrar adı səssiz ötürür). `api-cbar` yalnız öz sahib olduğu cədvəllər üçün
   migration yaza bilər (hazırda heç biri).
3. Məzmun **ikidillidir** (az/en): tərcümə olunan entity-lərin `<entity>_translations`
   cədvəli `(entity_id, locale)` açarı ilə, slug hər locale üzrə unikaldır. Bir
   qeyd bir dildə dolu, digərində boş ola bilər — UI və API bunu xəta saymır.
4. Chrome etiketləri (`t.ts`, `locales/*.json`) hər iki dildə **məcburidir**;
   redaksiya məzmunu **həmişə API-dən** gəlir, kodda hardcoded editorial mətn
   qadağandır.
5. Azərbaycan hərfləri olan heç bir fayl shell redirection və ya `Set-Content` ilə
   yazılmır — yalnız UTF-8 qoruyan alətlərlə.

### Maddə VI — `web-cbar-admin` `new-template` əsasında yenidən qurulur

1. Yeni admin paneli `new-template`-in **kopyasından** başlayır və template-in
   `.specify/memory/constitution.md` sənədi (Maddə I–X) **bu workspace-də də
   məcburidir**. Ziddiyyət halında template konstitusiyası admin panel daxilində,
   bu sənəd proyektlərarası məsələlərdə üstündür.
2. Texnologiya yığını template ilə **kilidlidir**: React 19 + TypeScript strict +
   Vite, Tailwind v4 + `@cbar/lib-react-ui-kit` (yalnız subpath import, semantik
   rənglər), TanStack Router + Query, Zustand, Axios, React Hook Form + Zod,
   react-i18next, Vitest + RTL + MSW, FSD arxitektura
   (`app → pages → widgets → features → entities → shared`).
3. Mövcud `web-cbar-admin`-dən (Chakra UI 3) **konsepsiyalar** köçürülür, kod yox:
   deklarativ CRUD modul konfiqi (`src/modules/` → FSD `features/*`), az/en tab
   modeli, JWT + 401 → logout körpüsü. Chakra UI, TanStack Table-ın mövcud istifadəsi
   və hand-rolled control-lar template-ə **gətirilmir**.
4. Template-in MSW handler-ləri `api-cbar-admin`-in **real kontraktı** ilə əvəz
   olunur: hər feature üçün əvvəlcə `features/<x>/api` və `handlers/<x>.ts` real
   endpoint-ə uyğunlaşdırılır, sonra UI yazılır. Uydurma auth kontraktı
   `auth/login` (15 dəqiqəlik access token) ilə əvəzlənir; token yalnız yaddaşda.
5. **Rich-text miras qorunur**: `RichTextEditor` legacy cbar.az markup-ını
   (`<details>` accordion, table, media link, YouTube və ümumi `<iframe>`) itirmədən
   saxlamalıdır. TipTap heç bir extension-ın sahiblənmədiyi elementi **səssiz
   silir**; editor dəyişikliyi `roundtrip-check.mjs` (və ya onun template
   ekvivalenti) ilə yoxlanmadan merge edilmir.
6. Köhnə `web-cbar-admin` **cutover-ə qədər işlək qalır**; yeni panel ayrı qovluqda
   qurulur, paritet təsdiqlənəndən sonra köhnəsi silinir. `REDESIGN-PLAN.md`-də admin
   üçün nəzərdə tutulan "shadcn/ui birbaşa" istiqaməti bu maddə ilə **əvəz olunur**:
   UI qatı template-in `@cbar/lib-react-ui-kit`-idir.

### Maddə VII — Xarici kontraktlar dəyişməzdir

1. `GET /currencies/{DD.MM.YYYY}.xml` tarixi cbar.az feed-ini birə-bir təkrarlayır:
   element adları, sıralama və rəqəm formatı **kontraktdır** (`TODO(compat)`
   markerləri `CurrenciesController`-də). Dəyişdirilmir.
2. `product-host`-dan miras qalan public URL-lər ya eyni saxlanılır, ya da **301
   xəritəsi** ilə yeni ünvana yönləndirilir; xəritə spec-in bir hissəsidir.
3. `api-cbar`-ın `web-cbar` tərəfindən istehlak olunan endpoint-ləri (`lib/api.ts`-də
   tipli funksiyalar) geriyə uyğun qalır; breaking dəyişiklik yeni route/versiya ilə
   edilir, mövcudu silinməklə yox.
4. `.ci-cd/*.yaml`, `Dockerfile` və `.gitlab-ci.yml` paylaşılan CBAR pipeline-ına
   (`devops-linux-team/ci-cd`) uyğun qalır; branch → environment xəritəsi
   (`feature/*|bugfix/*` MR → dev, `test` → test, `master` → prod) dəyişdirilmir.
5. Hər credential bu repo-da **yalnız lokal development üçündür**; deploy mühitləri
   Vault-dan oxuyur, `cbar_web_ro` rolu out-of-band yaradılır. Hostname və Vault
   yolları DevOps təsdiqinə qədər `TODO(devops)` markerini saxlayır.

### Maddə VIII — Verification real icra ilə olur

1. API-lərdə və `web-cbar`-da **avtomatik test yığını yoxdur**; verification =
   `dotnet build` / `npm run build` + `npm run lint` + stack-in `dev.ps1` ilə
   qaldırılması + təsirlənən endpoint və ya ekranın **əl ilə icrası**. "İşləyəcək"
   verification deyil.
2. Yeni admin panel (`new-template` əsaslı) üçün merge şərti template gate-idir:
   `npm run verify` = lint → `tsc -b` → test → build. Hər biri keçməlidir.
3. Bir dəyişiklik iki proyektə toxunursa, verification **hər ikisini birlikdə**
   işlədərək edilir (məsələn entity dəyişikliyi: hər iki API build olur, `api-cbar`
   read-only rol ilə qoşulur, public sorğu filtrlənmiş nəticə qaytarır).
4. Boş public sayt **xəta deyil, boş baza** ehtimalıdır — bug hesabatından əvvəl
   seed vəziyyəti yoxlanılır.
5. `TODO(compat)`, `TODO(devops)` markerləri silinmir; yalnız kontrakt təsdiqlənəndə
   müvafiq spec ilə həll olunur.

## Texnologiya yığını və proyekt xəritəsi

| Proyekt | Rol | Stack | Port | Referans (`product-host`) |
| --- | --- | --- | --- | --- |
| `api-cbar-admin` | CMS API, sxem sahibi, yeganə yazan | .NET, EF Core, PostgreSQL, MinIO, Redis, Meilisearch | 5253 | `admin/controllers`, `common/models`, `common/migrations` |
| `api-cbar` | Public read-only API | .NET, EF Core (projection → DTO), rate-limit 1000/dəq/IP | 5139 | `visitor/controllers` |
| `web-cbar` | Public sayt (SSR) | Next.js 16 App Router, TypeScript, Tailwind 4, ECharts | 3000 | `visitor/views`, `visitor/web` |
| `web-cbar-admin` | CMS paneli (yenidən qurulur) | `new-template` stack-i (Maddə VI) | 5173 | `admin/views`, `admin/web` |
| `new-template` | Enterprise starter template | React 19, Vite, FSD, `@cbar/lib-react-ui-kit` | — | yalnız oxunur, kopyalanır |
| `product-host` | Hostda işləyən köhnə sayt | Yii2, PHP ≥ 7 | — | yalnız oxunur |

Əlavə məhdudiyyətlər:

- `web-cbar` Next.js 16-nın **breaking konvensiyalarına** tabedir: `web-cbar/AGENTS.md`
  və `node_modules/next/dist/docs/` avtoritetdir (middleware = `src/proxy.ts` →
  `proxy()`). Bütün fetch `src/lib/api.ts` üzərindən, `cache: "no-store"` ilə.
- `api-cbar` controller-only-dir (service layer yoxdur); `api-cbar-admin`
  `AuditService`, `MediaStorage` (SHA-256 content-addressed), `SlugService` ilə.
- Yeni runtime dependency **yalnız spec vasitəsilə** əlavə olunur.

## İş axını və keyfiyyət qapıları

1. Hər iş **spec ilə başlayır**: `/speckit-specify` → `specs/NNN-<ad>/spec.md`. Spec
   **hədəf proyekt(lər)i** və `product-host`-da əvəz etdiyi hissəni açıq yazır
   (Maddə I.2). Bir spec bir neçə proyektə toxuna bilər, amma tasks hər proyekt
   üçün ayrı bölmədə, deploy sırası ilə verilir (Maddə II.3, IV.2).
2. `/speckit-plan` "Constitution Check" bölməsində Maddə I–VIII üzrə uyğunluq
   yoxlanılır; pozuntu **əsaslandırılmadan** plan qəbul edilmir.
3. Branch və commit qaydaları upstream repo-nun `.gitlab-ci.yml`-i və (yeni admin
   üçün) template-in husky hook-ları ilə tənzimlənir; `--no-verify` yalnız təcili hal.
4. Keyfiyyət qapısı proyekt tipinə görə: API → `dotnet build` + stack run + endpoint
   icrası; `web-cbar` → `npm run lint` + `npm run build` + səhifə icrası; yeni admin →
   `npm run verify` + `roundtrip-check` (editor toxunulubsa).
5. Paritet qapısı: `product-host` ilə müqayisə cədvəli (URL/funksiya → yeni
   qarşılıq → status) hər spec-in çıxışıdır; "ləğv edilir" yalnız açıq qərarla.
6. Sirlər, port və start sırası dəyişikliyi `CLAUDE.md`, `GUIDE.md`, `dev.ps1`,
   `dev.sh` və `CREDENTIALS.md`-də **eyni dəyişiklikdə** sinxronlaşdırılır.

## Governance

1. Bu konstitusiya root `CLAUDE.md`, proyekt `README`-ləri və `REDESIGN-PLAN.md`
   daxil olmaqla bütün digər praktikalardan **üstündür**. Ziddiyyət halında bu sənəd
   qalib gəlir; `web-cbar-admin` daxilində isə `new-template` konstitusiyası
   (Maddə VI.1) tətbiq olunur.
2. Dəyişiklik yalnız açıq **"constitution amendment"** kimi edilir: səbəb, təsirlənən
   maddələr və (lazımdırsa) miqrasiya planı yazılır; `/speckit-constitution` ilə
   yenilənir və Sync Impact Report doldurulur.
3. Versiya semantikdir: **MAJOR** — maddənin silinməsi və ya mənasının dəyişməsi;
   **MINOR** — yeni maddə/bölmə və ya əhəmiyyətli genişlənmə; **PATCH** — ifadə,
   düzəliş, aydınlaşdırma.
4. Uyğunluq yoxlaması hər `plan.md`-nin "Constitution Check" bölməsində və hər merge
   request-in review-sunda aparılır. Mürəkkəblik (yeni dependency, yeni proyekt,
   yeni port, yeni paylaşılan cədvəl) **əsaslandırılmalıdır**.
5. Runtime development guidance üçün root `CLAUDE.md` və hər proyektin öz
   `CLAUDE.md`/`AGENTS.md`-si istifadə olunur; onlar bu sənədi təkrarlamır,
   ona istinad edir.

**Version**: 1.0.0 | **Ratified**: 2026-09-06 | **Last Amended**: 2026-09-06
