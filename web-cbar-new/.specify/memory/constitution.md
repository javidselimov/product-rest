<!--
Sync Impact Report
- Versiya dəyişikliyi: 2.1.0 → 2.2.0 (MINOR — yeni maddə; Governance §3). Spec 032.
- Əlavə olunan bənd (2.2.0):
  * Maddə XII — Sabitlər və konfiqurasiya: magic number yoxdur; cross-cutting sabitlər
    `src/shared/constants/<mövzu>.ts`, slice sabitləri `<slice>/constants.ts`;
    `shared/config/` konfiqdir və toxunulmur; `@typescript-eslint/no-magic-numbers`
    `error` (`ignore [0,1,-1,2,100]`, `detectObjects`), testlər/`shared/testing`/
    `constants` faylları/`shared/lib/xlsx` istisna; magic string-lər konvensiya ilə.
  * Yenilənmiş artefaktlar: `eslint.config.mjs` (`konstitusiya/sabitler`) ✅,
    `scripts/lint-rules.test.mjs` ✅, `CLAUDE.md` ✅, `.claude/skills/frontend-standards` ✅;
    kontrakt `../specs/032-frontend-constants-standard/contracts/constants-contract.md`.

- Versiya dəyişikliyi: 2.0.0 → 2.1.0 (MINOR — yeni bənd; Governance §3).
- Əlavə olunan bənd (2.1.0):
  * Maddə IV.9 — paket yalnız adı ilə import olunur; `node_modules`-a nisbi yol ilə
    import (`'../../node_modules/react-i18next'`) qadağandır. Səbəb: IDE avto-importu
    15 faylda belə yol qoymuşdu; ESLint onu yalnız "dərin nisbi import" (IV.8) kimi,
    yanlış məsləhətlə tuturdu. İndi `eslint.config.mjs`-də ayrıca
    `NODE_MODULES_QADAGASI` pattern-i var (skriptlər və server testləri daxil).
  * Yenilənməli artefaktlar: `eslint.config.mjs` ✅; şablonlar dəyişmir.
- Prosedur qeydi (2.1.0): mövcud qaydanı genişləndirən gate düzəlişidir, yeni
  davranış gətirmir; layihə sahibinin birbaşa tələbi ilə ayrıca spec-siz edilib.

- Versiya dəyişikliyi: 1.0.0 → 2.0.0 (MAJOR — Maddə V-dəki sessiya prinsipi
  geri-uyğunsuz şəkildə yenidən təyin olunub; Governance §3).
- Dəyişən prinsiplər (2.0.0):
  * Maddə V — "access token yalnız yaddaşda (Zustand, persist-siz)" qaydası
    "sessiya httpOnly cookie-də, access token client JavaScript-inə heç vaxt
    çatmır" qaydası ilə əvəzlənib. Köhnə qaydaya görə yazılmış artefakt bu
    versiya ilə uyğun deyil — buna görə MAJOR.
  * Maddə IV.3 — FSD app-layer məzmunu `src/app/_*` private qovluqları yerinə
    `src/providers/` və `src/shell/` (src kökündə) saxlanılır.
  * Maddə VIII — tema və dil kimi sensitive olmayan UI seçimləri üçün cookie
    icazəlidir (§8.6); SSR-də ilk render bundan oxuyur.
  * Maddə X.3 — sensitive data qadağası cookie reallığına uyğunlaşdırılıb
    (httpOnly + Secure + SameSite şərtləri ilə).
  * Maddə XI.2 — sessiya modulu açıq şəkildə server-only siyahısına salınıb.
- Prosedur qeydi: Governance §2 amendment üçün ayrıca nömrələnmiş spec tələb
  edir. Bu amendment istisna olaraq spec 001 daxilində edilib, çünki
  constitution eyni gün (2026-09-08) ratifikasiya olunub, hələ heç bir kod
  yazılmayıb və dəyişiklik məhz 001-in dizayn qərarından doğur. Sonrakı hər
  amendment ayrıca spec tələb edir.
- 1.0.0 ilkin ratifikasiyasında (react-template v1.2.0-dan köçürülərkən)
  dəyişənlər: Maddə II (Vite → Next App Router, @tailwindcss/vite →
  @tailwindcss/postcss), Maddə IV (`pages` → `views`), Maddə V (URL state →
  Next `searchParams`), Maddə VIII (`/config.json` + nginx → server-side env,
  yeni placeholder bəndləri), Maddə X.6 (müdafiə başlıqları tətbiq
  səviyyəsində), yeni Maddə XI (Server/Client sərhədi).
- Silinən bölmələr: yoxdur.
- Təxirə salınmış TODO-lar: yoxdur.
-->

# Constitution — next-template Frontend Template

> Bu sənəd layihənin **dəyişməz prinsiplərini** təyin edir. Hər `specs/NNN-*/spec.md`,
> `plan.md` və `tasks.md` bu sənədə zidd ola bilməz. Dəyişiklik yalnız açıq şəkildə
> "constitution amendment" kimi, ayrıca spec ilə edilə bilər.
>
> Mənbələr: `../specdd/guideline.md` (korporativ frontend standartı — bölmə nömrələri
> ilə istinad olunur), `../react-template/.specify/memory/constitution.md` (qardaş
> template — v1.2.0), `../showcase-ui/docs/consumer-guide.md` (kit istehlakçı qaydaları),
> `CLAUDE.md` (UI kit müqaviləsi). Guideline-dan və qardaş template-dən kənarlaşmalar
> `specs/NNN-*/spec.md` §"Kənarlaşmalar registri"ndə D-nömrə ilə saxlanılır.

---

## Əsas prinsiplər

### Maddə I — Dil qaydaları

1. Bütün UI mətnləri, domain etiketləri, error mesajları və code comment-lər
   **Azərbaycan dilində** yazılır (guideline §14). `ə ı ğ ş ç ö ü` hərfləri düzgün
   yazılmalıdır.
2. UI-də görünən heç bir string hardcoded ola bilməz — hamısı i18n açarları ilə
   gəlir. Default və fallback dil: `az`.
3. Texniki terminlər tərcümə və ya transliterasiya edilmir (`query`, `hook`,
   `route`, `token`, `server component` olduğu kimi qalır).
4. Backend-dən gələn error mesajları "gözəl ingilis dilinə" çevrilmir; yeni mesaj
   yazılanda domain-ə uyğun Azərbaycan terminologiyası istifadə olunur.
5. Azərbaycan hərfləri olan heç bir fayl shell redirection və ya `Set-Content` ilə
   yazılmır — yalnız UTF-8 qoruyan alətlərlə (encoding korlanmasının qarşısı).

### Maddə II — Texnologiya yığını (kilidli)

| Qat | Texnologiya | Mənbə |
| --- | --- | --- |
| Framework | **Next.js (ən son stabil major) App Router** + React 19 + TypeScript (strict) | web-cbar formatı |
| Runtime çıxışı | `output: 'standalone'` — Node server, statik export deyil | web-cbar `next.config.ts` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) + `@cbar/lib-react-ui-kit` | guideline §2.3, §7 |
| Routing | **Next App Router** (`src/app/`) + `src/proxy.ts` locale yönləndirməsi | web-cbar formatı |
| Server state | TanStack Query | §6.2 |
| Client state | Zustand | §2.2, §6.4 |
| HTTP | Axios | §10.2 |
| Form | React Hook Form + Zod | §2.2, §8 |
| i18n | react-i18next (URL `[locale]` seqmenti ilə sürülür) | §14.2 |
| Test | Vitest + React Testing Library + MSW | §13.2 |
| Format/lint | ESLint (flat config, `eslint-config-next`) + Prettier (+ tailwind plugin) | §2.3 |

Yeni **runtime dependency** yalnız spec vasitəsilə (yeni `specs/NNN-*/`) əlavə oluna
bilər. Icon, chart, date və class-merge kitabxanaları qadağandır — kit onları ödəyir.
`next-intl`, `next-auth` və digər framework əvəzləyiciləri bu yığında yoxdur; onları
gətirmək constitution amendment tələb edir.

### Maddə III — UI Kit müqaviləsi

1. Hər UI control `@cbar/lib-react-ui-kit`-dəndir; hand-rolled control qadağandır.
2. Import yalnız **subpath** ilə (`@cbar/lib-react-ui-kit/button`); barrel import
   qadağandır.
3. Rənglər yalnız **semantik** qatdan: `bg-background`, `text-muted-foreground`,
   `border-border`… Heç bir `#hex`, `rgb()`, `oklch()`, `bg-blue-600` — heç yerdə.
4. Qlobal stil faylındakı (`src/app/globals.css`) **route B bloku toxunulmazdır**:
   `tokens.css` + `theme.css` + `@source` + `@custom-variant dark` +
   `@layer base { * }` + `tw-animate-css`.
   `@cbar/lib-react-ui-kit/styles.css` **heç vaxt** import edilmir.
5. `TooltipProvider` və `Toaster` yalnız **bir dəfə**, root client provider-də mount olunur.
6. Dark mode `.dark` class-ı ilə, yalnız `<html>` elementində idarə olunur; SSR-də
   ilk render ilə client arasında uyğunsuzluq (hydration mismatch) buraxılmır.
7. Kit paketi `optionalDependencies`-də, caret range ilə saxlanılır və Nexus-dan
   ayrıca install skripti ilə gətirilir; `npm link` istifadə edilmir.
8. Kit bug-ı tapılanda `node_modules` yamaqlanmır — `../showcase-ui`-yə report olunur.

### Maddə IV — Arxitektura (FSD, Next uyğunlaşdırması)

1. Layer-lər: `app → views → widgets → features → entities → shared`.
2. `src/app/` **yalnız Next routing qatıdır**: `layout.tsx`, `page.tsx`, `loading.tsx`,
   `error.tsx`, `not-found.tsx` və `[locale]` seqmentləri. Route faylları nazikdir —
   iş məntiqi saxlamır, `views` layer-indən komponent götürüb render edir.
3. FSD-nin `app` layer məzmunu (provider-lər, shell, error boundary) `src/app/`
   **daxilində saxlanılmır** — Next orada hər qovluğu route seqmenti kimi oxuyur.
   Bu məzmun `src/` kökündə ayrıca qovluqlardadır: `src/providers/` (provider stack,
   error boundary, sessiya körpüsü) və `src/shell/` (layout, sidebar, topbar).
   Layer ierarxiyasında hər ikisi `app` layer-i sayılır.
4. FSD-nin `pages` layer-i `src/views/` adlanır — `pages` adı Next tərəfindən
   ayrılmışdır və qarışıqlıq yaradır.
5. Import yalnız **aşağıya doğru** gedir; `shared` heç bir yuxarı layer-dən asılı
   deyil və business-specific kod saxlamır.
6. API çağırışı komponent daxilində **qadağandır** — yalnız feature/entity `api/`
   layer-i və query hook-ları vasitəsilə (guideline §10.6).
7. Hər feature öz `api/ model/ hooks/ components/` strukturunu saxlayır.
8. Path alias: `@/*` → `src/*`. Alias-dan kənar dərin nisbi import qadağandır.
9. Paket **yalnız adı ilə** import olunur (`react-i18next`,
   `@cbar/lib-react-ui-kit/button`). `node_modules`-a yol ilə import
   (`'../../node_modules/react-i18next'`, `'./node_modules/x'`) istənilən dərinlikdə və
   istənilən faylda — test və skriptlər daxil — qadağandır: o, modul həllini
   (package `exports`, Next/Vitest alias-ları, `server-only` marker-i) yan keçir, paketi
   iki nüsxədə bundle-a sala bilər (iki React context — məs. iki ayrı i18n instansiyası)
   və IDE-nin avto-importundan qalan təsadüfi yoldur. ESLint `no-restricted-imports`
   (`**/node_modules/**`) bunu gate-də tutur.

### Maddə V — State ayrımı

Guideline §6.4 seçim matrisi məcburidir:

| State növü | Alət |
| --- | --- |
| Server state | TanStack Query |
| Paylaşılan client state | Zustand |
| Form state | React Hook Form + Zod |
| URL state | Next `searchParams` / route params — Zod sxemi ilə parse olunur |
| Sessiya | httpOnly cookie (server tərəfdə oxunur) |
| Lokal state | `useState` / `useReducer` |

Derived state ayrıca saxlanılmır — hesablanır.

**Sessiya qaydası.** Access token client JavaScript-inə **heç vaxt** verilmir: o,
`HttpOnly` + `Secure` + `SameSite=Lax` cookie-də yaşayır və yalnız server tərəf onu
oxuyur. `localStorage`, `sessionStorage`, URL və JS-dən oxunan cookie qadağandır
(guideline §16.13). Client yalnız **istifadəçi profilini** və icazə dəstini görür —
token-i yox. Sessiyanın qurulması, yenilənməsi və silinməsi tək bir server-only
sessiya modulundan keçir (Maddə XI.2).

### Maddə VI — Test və verification

1. Hər feature üçün test yazılır; testlər **real istifadəçi davranışı** üzərindədir.
2. Mock davranışını assert etmək qadağandır; mock yalnız ağır dependency üçün.
3. Merge şərti — guideline §18.28 gate: **Lint → TypeCheck → Test → Build**.
   Hər hansı biri uğursuzdursa, merge edilmir. Bu gate `npm run verify` altındadır.
4. "İşləyəcək" verification deyil — hər dəyişiklikdən sonra real əmrlər icra olunur.

### Maddə VII — Error handling

1. Route səviyyəli `error.tsx` və global ErrorBoundary render error-larını tutur;
   API error-ları üçün istifadə edilmir.
2. API error axını: Axios Interceptor → `normalizeApiError` → `AppError` →
   TanStack Query → UI feedback (guideline §15.8).
3. Raw texniki error mesajı istifadəçiyə heç vaxt göstərilmir; server tərəfdəki
   stack trace və daxili ünvanlar response-a düşmür.
4. Hər query üçün loading / empty / error / success vəziyyətləri məcburidir;
   route səviyyəsində `loading.tsx` bunu əvəz etmir, tamamlayır.
5. Sensitive data (token, şəxsi məlumat) log-a düşmür.

### Maddə VIII — Konfiqurasiya

1. Runtime konfiqurasiya **server tərəfdə `process.env`-dən** oxunur (məs. `API_URL`);
   dəyərlər `.ci-cd/{base,dev,test,prod}.yaml`-dakı `env` siyahısı ilə verilir.
   Statik bundle-a bişirilən konfiqurasiya (build-time inject) qəbul edilmir.
2. Brauzerə çıxan konfiqurasiya yalnız `NEXT_PUBLIC_*` prefiksi ilə və yalnız
   həqiqətən client-də lazım olduqda verilir; secret heç vaxt `NEXT_PUBLIC_*` olmur.
3. Secrets heç vaxt repo-da saxlanılmır; env və CI masked variable-lardadır.
4. **Placeholder qaydası (template olduğu üçün).** Bu repo şablondur: heç bir
   deploy identifikatoru real dəyərlə commit olunmur. Hostname, API ünvanı, image
   adı, layihə adı, registry scope — hamısı aydın işarələnmiş placeholder-dir
   (məs. `<PROJECT_NAME>`, `https://<API_HOST>`) və `.ci-cd/*.yaml`-da `TODO(devops):`
   qeydi ilə müşayiət olunur.
5. Placeholder-lərin əvəzlənməsi **tək bir sənədləşdirilmiş prosedur** ilə olur
   (setup skripti/skill + README bölməsi); əvəzlənməmiş placeholder qalması
   verification tərəfindən aşkarlanabilən olmalıdır.
6. **Cookie siyasəti.** Sensitive olmayan UI seçimləri (tema, dil) cookie-də
   saxlanıla bilər ki, SSR ilk render-i düzgün versin (`SameSite=Lax`, `Secure`,
   `HttpOnly` **yox** — client onları oxumalıdır). Sessiya cookie-si isə həmişə
   `HttpOnly` (Maddə V). Cookie sayı və adları bir yerdə sənədləşdirilir; analitik
   və izləmə cookie-si qadağandır.

### Maddə IX — Spec-driven proses

1. Hər yeni iş `specs/NNN-<slug>/{spec.md, plan.md, tasks.md}` ilə başlayır;
   nömrələmə ardıcıldır (`002-`, `003-`…).
2. `spec.md` NƏ/NİYƏ (tələblər), `plan.md` NECƏ (texniki dizayn), `tasks.md`
   fazalara bölünmüş, hər fazası Verification ilə bitən icra siyahısıdır.
3. Heç bir spec bu constitution-a zidd ola bilməz; guideline-dan və qardaş
   template-dən hər kənarlaşma spec-in "Kənarlaşmalar" bölməsində nömrələnmiş
   qeydlə (D-nömrə) sənədləşdirilir.
4. Kod dəyişikliyi spec-siz başlanmır; spec → plan → tasks → icra ardıcıllığı pozulmur.

### Maddə X — Təhlükəsizlik və pentest qaydaları

1. **XSS müdafiəsi.** `dangerouslySetInnerHTML`, `eval`, `new Function` və string-dən
   DOM/JS yaratmaq qadağandır; React-in default escaping-i sıradan çıxarılmır. İstisna
   yalnız sanitizasiya olunmuş məzmun üçün, spec-də D-qeydlə sənədləşdirilərək mümkündür.
   Xarici mənbədən gələn URL render olunmazdan əvvəl protokola görə yoxlanılır
   (`javascript:` sxemi qadağandır).
2. **Giriş validasiyası.** Bütün xarici sərhədlər — API cavabı, route/search params,
   form input, server-side env — Zod sxemi ilə yoxlanılır; yoxlanılmamış data tipə
   cast edilmir (guideline §8, Maddə V URL state qaydası ilə uyğun).
3. **Sensitive data.** Token, şifrə və şəxsi məlumat URL-də, localStorage /
   sessionStorage-da, JS-dən oxunan cookie-də, server log-larında və client
   bundle-ında görünmür (Maddə V və Maddə VII.5-in gücləndirilməsi). Sessiya cookie-si
   `HttpOnly` + `Secure` + `SameSite=Lax` olmadan qurulmur. İstifadəçiyə göstərilən
   error mesajı daxili sistem detallarını (stack trace, daxili ünvan, SQL/API
   strukturu) sızdırmır.
4. **Dependency təhlükəsizliyi.** Yeni runtime dependency yalnız spec ilə (Maddə II);
   lockfile həmişə commit olunur. `npm audit`-in **critical/high** tapıntısı olan
   dependency merge edilmir; müstəsna hal yalnız spec-də D-qeydlə sənədləşdirilə bilər.
   Üçüncü tərəf runtime script (CDN `<script>`, analytics snippet) qadağandır.
5. **Pentest prosesi.** Təhlükəsizlik testləri yalnız icazəli mühitlərdə (dev/test,
   yaxud rəsmi razılaşdırılmış scope) aparılır. Pentest tapıntıları severity ilə
   (Critical / High / Medium / Low) qeydə alınır; **Critical/High** tapıntı ayrıca spec
   ilə (Maddə IX) düzəldilmədən release edilmir və hər düzəliş regressiya testi ilə
   müşayiət olunur. Tapıntı hesabatlarında real credential və exploit payload repo-da
   saxlanılmır.
6. **Müdafiə başlıqları.** CSP, `X-Content-Type-Options: nosniff`, frame qadağası
   (`frame-ancestors` / `X-Frame-Options`) kimi başlıqlar **tətbiq səviyyəsində**
   (`next.config.ts#headers()`) verilir — reverse proxy-nin mövcudluğuna güvənilmir;
   onları zəiflədən dəyişiklik yalnız sənədləşdirilmiş spec ilə mümkündür.

### Maddə XI — Server/Client sərhədi

1. `'use client'` **sərhəddir, adət deyil**: yalnız interaktivlik, browser API-si və ya
   kit komponenti tələb edən yerdə qoyulur və mümkün olan ən aşağı komponentə qoyulur.
   Root layout-u client-ə çevirmək qadağandır.
2. Server-only kod client bundle-ına düşmür və açıq şəkildə server-only kimi
   işarələnir. Bu siyahıya **hökmən** daxildir: env oxuyan modullar, gizli ünvan bilən
   modullar və **sessiya modulu** (cookie yazma/oxuma/silmə — Maddə V). Sessiya
   moduluna client komponentindən import qadağandır; sərhəd yalnız server route/action
   vasitəsilə keçilir.
3. Server komponenti heç vaxt Zustand store-a və ya TanStack Query cache-inə yazmır;
   server → client data ötürülməsi yalnız serializable props ilə.
4. `window`, `document`, `localStorage` yalnız client komponentində və effekt daxilində
   oxunur — modul səviyyəsində deyil (SSR-də crash və hydration mismatch qarşısı).
5. Hydration mismatch xəbərdarlığı "səs" sayılmır — səbəbi tapılıb düzəldilir və ya
   spec-də D-qeydlə sənədləşdirilir.

### Maddə XII — Sabitlər və konfiqurasiya (spec 032)

1. **Magic number yoxdur.** Kodun davranışını və ya ölçüsünü təyin edən hər rəqəm adlı
   sabitdir və `constants` faylındadır; çağırış yerində rəqəm yazılmır. Yalnız
   `0 1 -1 2 100`, massiv indeksi, enum üzvü və tip mövqeyi adsız qala bilər.
2. **İki pillə.** Bir neçə slice-da və ya `shared`/`server`/`app`/`providers` qatında işlənən
   sabit `src/shared/constants/<mövzu>.ts`-dədir (`pagination`, `time`, `timing`, `cache`,
   `http`, `headers`, `query-params`, `layout`, `text`, `files`, `limits`); yalnız bir
   slice-a məxsus sabit həmin slice-ın `constants.ts`-indədir (`features/<x>/model/`,
   `views/<x>/`, `widgets/<x>/`, `shell/`, `entities/<x>/lib/`). `shared` biznes adı
   daşımır (Maddə IV.5). Barrel yoxdur — import fayl üzrədir.
3. **Konfiq ≠ sabit.** `shared/config/` (brand, contacts, security-headers) məhsul/brend/
   mühit konfiqidir və bu maddədən kənardır; konfiq faylının öz içindəki rəqəm isə sabitdən gəlir.
4. **Ad və sənəd.** `SCREAMING_SNAKE_CASE`, vahid suffiksi (`_MS`, `_PX`, `_SECONDS`), qrup
   obyektləri `as const`; hər sabitin *niyə* bu dəyər olduğunu deyən bir sətirlik şərhi var.
   Köçürülən sabitin köhnə yerdə re-export-u qalmır.
5. **Gate.** `@typescript-eslint/no-magic-numbers: error` (`detectObjects` daxil) `verify`-nin
   lint addımındadır və `scripts/lint-rules.test.mjs` ilə qorunur. İstisna: testlər və
   `shared/testing` (fikstür rəqəmi məlumatdır), `shared/constants/**` və `**/constants.ts`,
   `shared/lib/xlsx/**` (bayt formatı — fayl başında səbəb). Konfiqurasiya dəyərini yoxlayan
   test sabiti import edir, literal yox.
6. **Magic string-lər** lint ilə tutulmur, amma eyni qaydaya tabedir: sorğu parametr adı,
   xüsusi header adı, storage/channel açarı, HTTP status, növ kodu (`'1' | '2'`) sabitdir.
   Tailwind `[Npx]` className dəyərləri bu maddədən kənardır; eyni ölçü ≥ 2 yerdə
   təkrarlananda `globals.css` `@theme` token-i olur.

## İdarəetmə (Governance)

1. **Üstünlük.** Bu constitution bütün digər praktika sənədlərindən üstündür —
   `CLAUDE.md`, skill-lər və hər `specs/NNN-*/` artefaktı ona zidd ola bilməz;
   ziddiyyət aşkarlananda constitution qalib gəlir və artefakt düzəldilir.
2. **Amendment proseduru.** Dəyişiklik yalnız açıq şəkildə "constitution amendment"
   kimi, ayrıca nömrələnmiş spec (`specs/NNN-*/`) ilə edilir və `/speckit-constitution`
   vasitəsilə **bu fayla** (`.specify/memory/constitution.md` — Spec Kit-in default
   kanonik yeri) yazılır.
3. **Versiya siyasəti.** Semantik versiyalama: **MAJOR** — prinsipin silinməsi və ya
   geri-uyğunsuz yenidən təyini; **MINOR** — yeni prinsip/bölmə və ya mahiyyətcə
   genişlənmiş qayda; **PATCH** — aydınlaşdırma, ifadə və format düzəlişləri.
   Hər amendment aşağıdakı versiya sətrini və faylın başındakı Sync Impact Report-u
   yeniləyir.
4. **Uyğunluq yoxlaması.** Hər spec/plan/tasks artefaktı bu sənədə qarşı yoxlanılır
   (`/speckit-analyze` daxil olmaqla); kənarlaşmalar D-nömrə ilə sənədləşdirilir
   (Maddə IX.3). Merge üçün uyğunluq şərti Maddə VI gate-idir.
5. **Qardaş template ilə əlaqə.** `../react-template` bu şablonun Vite/SPA qardaşıdır.
   Ona zidd olmayan hər qayda burada eyni saxlanılır; fərq yalnız Next reallığından
   doğduqda və D-qeydlə sənədləşdirildikdə yaranır.

**Version**: 2.2.0 | **Ratified**: 2026-09-08 | **Last Amended**: 2026-11-03
