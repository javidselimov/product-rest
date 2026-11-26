<!--
Sync Impact Report
- Versiya dəyişikliyi: 1.3.0 → 1.4.0 (MINOR — yeni prinsip əlavə olunub; mövcud
  maddələr toxunulmayıb)
- Əlavə olunan bölmələr: Maddə XI — Sabitlər (spec 032 `../specs/032-frontend-constants-standard/`):
  magic number/magic string qadağası, `src/shared/constants/<mövzu>.ts` + slice
  `constants.ts` yerləşməsi, `@typescript-eslint/no-magic-numbers` lint gate-i,
  `shared/config/` ilə fərq, test qaydası.
- Dəyişən prinsiplər: yoxdur.
- Silinən bölmələr: yoxdur.
- Şablonlar: `CLAUDE.md` və `.claude/skills/frontend-standards/SKILL.md` eyni
  dəyişiklikdə yenilənib; `eslint.config.js` qaydanı icra edir.
- Təxirə salınmış TODO-lar: Maddə VIII.1-dəki runtime `/config.json` cümləsi
  köhnəlib (API ünvanı build-time-dır) — ayrıca amendment.

Əvvəlki amendment (1.2.0 → 1.3.0):
- Dəyişən prinsiplər: Maddə I — Dil qaydaları. Dil seçimi indi auditoriyaya görə
  bölünür: developer-ə yönəlik mətn (kod şərhləri, commit mesajları, MR təsvirləri)
  İngilis, istifadəçiyə və domain-ə yönəlik mətn (UI, i18n, error mesajları,
  domain terminologiyası) və layihə sənədləşməsi Azərbaycan dilində.
  Əvvəlki I.2–I.5 bəndləri məzmunca qorunub (nömrələr sürüşüb).
- Əlavə olunan bölmələr: yoxdur (Maddə II–X toxunulmayıb).
- Silinən bölmələr: yoxdur.
- Təxirə salınmış TODO-lar: yoxdur.
- Retroaktiv çevrilmə: tələb olunmur — qayda yeni yazılan şərhlərə tətbiq olunur,
  mövcud AZ şərhlər toxunulduqları fayl dəyişəndə tədricən çevrilir.
-->

# Constitution — project-nexus-main Frontend Template

> Bu sənəd layihənin **dəyişməz prinsiplərini** təyin edir. Hər `specs/NNN-*/spec.md`,
> `plan.md` və `tasks.md` bu sənədə zidd ola bilməz. Dəyişiklik yalnız açıq şəkildə
> "constitution amendment" kimi, ayrıca spec ilə edilə bilər.
>
> Mənbələr: `../../../specdd/guideline.md` (korporativ React frontend standartı — bölmə
> nömrələri ilə istinad olunur), `CLAUDE.md` (UI kit müqaviləsi),
> `../../../showcase-ui/docs/consumer-guide.md` (kit istehlakçı qaydaları).
> Guideline-dan sənədləşdirilmiş kənarlaşmalar `specs/001-template-reconstruction/spec.md`
> §"Kənarlaşmalar registri"ndə (D1–D6) saxlanılır.

---

## Əsas prinsiplər

### Maddə I — Dil qaydaları

Dil auditoriyaya görə seçilir: məhsulun istifadəçisi üçün yazılan hər şey
Azərbaycan, developer üçün yazılan hər şey İngilis dilindədir.

1. **Azərbaycan dilində** yazılır: UI mətnləri, domain etiketləri, istifadəçiyə
   göstərilən error mesajları, `src/locales/az/` dəyərləri, həmçinin layihə
   sənədləşməsi — `README.md`, `CLAUDE.md`, `specs/NNN-*/` artefaktları və bu
   constitution (guideline §14). `ə ı ğ ş ç ö ü` hərfləri düzgün yazılmalıdır.
2. **İngilis dilində** yazılır: bütün fayl növlərində kod şərhləri (TS/TSX,
   skriptlər, YAML, Dockerfile, CSS), commit mesajları və MR təsvirləri. Səbəb:
   bu mətnləri təkcə komanda deyil, kənar developer və alətlər də oxuyur; kod
   identifikatorları onsuz da İngilisdir, qarışıq cümlə oxunuşu çətinləşdirir.
3. UI-də görünən heç bir string hardcoded ola bilməz — hamısı i18n açarları ilə
   (`t('...')`) gəlir. Default və fallback dil: `az`.
4. Texniki terminlər tərcümə və ya transliterasiya edilmir (`query`, `hook`,
   `route`, `token` olduğu kimi qalır).
5. Backend-dən gələn error mesajları "gözəl ingilis dilinə" çevrilmir; yeni mesaj
   yazılanda domain-ə uyğun Azərbaycan terminologiyası istifadə olunur. Bu qayda
   istifadəçiyə göstərilən mesajlara aiddir; yalnız CI log-una düşən developer
   mesajları İngilis ola bilər.
6. Azərbaycan hərfləri olan heç bir fayl shell redirection və ya `Set-Content` ilə
   yazılmır — yalnız UTF-8 qoruyan alətlərlə (encoding korlanmasının qarşısı).
7. Bu qayda **yeni yazılan** mətnə tətbiq olunur. Mövcud Azərbaycan dilli şərhlərin
   kütləvi çevrilməsi tələb olunmur; fayl başqa səbəbdən dəyişdirilərkən toxunulan
   şərhlər İngilisə keçirilir.

### Maddə II — Texnologiya yığını (kilidli)

| Qat | Texnologiya | Mənbə |
| --- | --- | --- |
| Framework | React 19 + TypeScript (strict) + Vite | guideline §2.3 |
| Styling | Tailwind CSS v4 + `@cbar/lib-react-ui-kit` | §2.3, §7 |
| Routing | TanStack Router | kənarlaşma D2 (spec 001) |
| Server state | TanStack Query | §6.2 |
| Client state | Zustand | §2.2, §6.4 |
| HTTP | Axios | §10.2 |
| Form | React Hook Form + Zod | §2.2, §8 |
| i18n | react-i18next | §14.2 |
| Test | Vitest + React Testing Library + MSW | §13.2 |
| Format/lint | ESLint + Prettier (+ tailwind plugin) | §2.3 |

Yeni **runtime dependency** yalnız spec vasitəsilə (yeni `specs/NNN-*/`) əlavə oluna
bilər. Icon, chart, date və class-merge kitabxanaları qadağandır — kit onları ödəyir.

### Maddə III — UI Kit müqaviləsi

1. Hər UI control `@cbar/lib-react-ui-kit`-dəndir; hand-rolled control qadağandır.
2. Import yalnız **subpath** ilə (`@cbar/lib-react-ui-kit/button`); barrel import
   qadağandır.
3. Rənglər yalnız **semantik** qatdan: `bg-background`, `text-muted-foreground`,
   `border-border`… Heç bir `#hex`, `rgb()`, `oklch()`, `bg-blue-600` — heç yerdə.
4. `src/index.css`-dəki **route B bloku toxunulmazdır**: `tokens.css` + `theme.css` +
   `@source` + `@custom-variant dark` + `@layer base { * }` + `tw-animate-css`.
   `@cbar/lib-react-ui-kit/styles.css` **heç vaxt** import edilmir.
5. `TooltipProvider` və `Toaster` yalnız **bir dəfə**, root səviyyədə mount olunur.
6. Dark mode `.dark` class-ı ilə, yalnız `<html>` elementində idarə olunur.
7. Kit bug-ı tapılanda `node_modules` yamaqlanmır — `../showcase-ui`-yə report olunur.

### Maddə IV — Arxitektura (FSD)

1. Layer-lər: `app → pages → widgets → features → entities → shared`.
2. Import yalnız **aşağıya doğru** gedir; `shared` heç bir yuxarı layer-dən asılı
   deyil və business-specific kod saxlamır.
3. API çağırışı komponent daxilində **qadağandır** — yalnız feature/entity `api/`
   layer-i və query hook-ları vasitəsilə (guideline §10.6).
4. Hər feature öz `api/ model/ hooks/ components/ routes/` strukturunu saxlayır.
5. Path alias: `@/*` → `src/*`. Alias-dan kənar dərin nisbi import qadağandır.

### Maddə V — State ayrımı

Guideline §6.4 seçim matrisi məcburidir:

| State növü | Alət |
| --- | --- |
| Server state | TanStack Query |
| Paylaşılan client state | Zustand |
| Form state | React Hook Form + Zod |
| URL state | Router search params (Zod-typed `validateSearch`) |
| Lokal state | `useState` / `useReducer` |

Derived state ayrıca saxlanılmır — hesablanır. **Token localStorage-da saxlanılmır**
(guideline §16.13); access token yalnız yaddaşda (Zustand, persist-siz) yaşayır.

### Maddə VI — Test və verification

1. Hər feature üçün test yazılır; testlər **real istifadəçi davranışı** üzərindədir.
2. Mock davranışını assert etmək qadağandır; mock yalnız ağır dependency üçün.
3. Merge şərti — guideline §18.28 gate: **Lint → TypeCheck → Test → Build**.
   Hər hansı biri uğursuzdursa, merge edilmir.
4. "İşləyəcək" verification deyil — hər dəyişiklikdən sonra real əmrlər icra olunur.

### Maddə VII — Error handling

1. Global ErrorBoundary render error-ları tutur; API error-ları üçün istifadə edilmir.
2. API error axını: Axios Interceptor → `normalizeApiError` → `AppError` →
   TanStack Query → UI feedback (guideline §15.8).
3. Raw texniki error mesajı istifadəçiyə heç vaxt göstərilmir.
4. Hər query üçün loading / empty / error / success vəziyyətləri məcburidir.
5. Sensitive data (token, şəxsi məlumat) log-a düşmür.

### Maddə VIII — Konfiqurasiya

1. API ünvanı iki qatlıdır: build-time `VITE_API_URL` (fallback) + runtime
   `/config.json` (`{urls:{apiUrl}}` — `.ci-cd/*.yaml` kontraktı) override edir.
2. Runtime config `cache: 'no-store'` ilə oxunur — nginx onsuz da no-cache verir.
3. Secrets heç vaxt repo-da saxlanılmır; env və CI masked variable-lardadır.

### Maddə IX — Spec-driven proses

1. Hər yeni iş `specs/NNN-<slug>/{spec.md, plan.md, tasks.md}` ilə başlayır;
   nömrələmə ardıcıldır (`002-`, `003-`…).
2. `spec.md` NƏ/NİYƏ (tələblər), `plan.md` NECƏ (texniki dizayn), `tasks.md`
   fazalara bölünmüş, hər fazası Verification ilə bitən icra siyahısıdır.
3. Heç bir spec bu constitution-a zidd ola bilməz; guideline-dan hər kənarlaşma
   spec-in "Kənarlaşmalar" bölməsində nömrələnmiş qeydlə (D-nömrə) sənədləşdirilir.
4. Kod dəyişikliyi spec-siz başlanmır; spec → plan → tasks → icra ardıcıllığı pozulmur.

### Maddə X — Təhlükəsizlik və pentest qaydaları

1. **XSS müdafiəsi.** `dangerouslySetInnerHTML`, `eval`, `new Function` və string-dən
   DOM/JS yaratmaq qadağandır; React-in default escaping-i sıradan çıxarılmır. İstisna
   yalnız sanitizasiya olunmuş məzmun üçün, spec-də D-qeydlə sənədləşdirilərək mümkündür.
   Xarici mənbədən gələn URL render olunmazdan əvvəl protokola görə yoxlanılır
   (`javascript:` sxemi qadağandır).
2. **Giriş validasiyası.** Bütün xarici sərhədlər — API cavabı, URL search params, form
   input, runtime `/config.json` — Zod sxemi ilə yoxlanılır; yoxlanılmamış data tipə
   cast edilmir (guideline §8, Maddə V URL state qaydası ilə uyğun).
3. **Sensitive data.** Token, şifrə və şəxsi məlumat URL-də, localStorage /
   sessionStorage-da və log-larda görünmür (Maddə V, Maddə VII.5-in gücləndirilməsi).
   İstifadəçiyə göstərilən error mesajı daxili sistem detallarını (stack trace, daxili
   ünvan, SQL/API strukturu) sızdırmır.
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
   (`frame-ancestors` / `X-Frame-Options`) kimi başlıqlar nginx (`default.conf`)
   səviyyəsində tətbiq olunur; onları zəiflədən dəyişiklik yalnız sənədləşdirilmiş
   spec ilə mümkündür.

### Maddə XI — Sabitlər

1. **Magic number yoxdur.** Aplikasiya kodunda izahsız rəqəm literalı qadağandır —
   yalnız `0, 1, -1, 2, 100`, massiv indeksləri, enum/tip literalları istisnadır.
   Qayda `@typescript-eslint/no-magic-numbers` (`detectObjects: true`) ilə
   `eslint.config.js`-də icra olunur və `npm run verify`-in bir hissəsidir.
2. **Yerləşmə iki pillədir.** Cross-cutting sabitlər `src/shared/constants/<mövzu>.ts`
   (`pagination`, `timing`, `http`, `storage`, `files`, `limits`, `ui`) — barrel
   yoxdur, import fayl üzrə: `@/shared/constants/pagination`. Domen/slice sabitləri öz
   slice-ında `model/constants.ts` (`features/<x>/model/constants.ts`; `pages/<x>/` və
   `shared/<x>/` üçün qonşu `constants.ts`) — Maddə IV pozulmur; sabit slice-dan kənarda
   lazım olanda `shared/constants`-a qalxır.
3. **Adlandırma.** `SCREAMING_SNAKE_CASE`; obyekt sabitləri `as const`; vahid adın
   sonunda (`_MS`, `_PX`, `_MAX`); hər sabitin bir sətirlik İngilis şərhi var.
4. **`constants` ≠ `config`.** `shared/config/` məhsul/brend/mühit konfiqidir
   (brand, runtime-config) və olduğu kimi qalır; `shared/constants/` texniki
   literal-lardır (rəqəm, açar, kod, ad). Env-dən gələn dəyər konfiqdir, sabit deyil.
5. **Magic string-lər** lint ilə tutulmur, amma eyni qaydaya tabedir: HTTP status
   kodları (`HTTP_STATUS`), storage/channel/lock açarları, sorğu parametr adları, növ
   kodları (`PRESS_RELEASE_TYPE`, `STAFF_TYPE`), status sətirləri (`CONTENT_STATUSES`)
   sabitdən oxunur.
6. **Testlər.** Konfiqurasiya dəyərini yoxlayan test sabiti **import edir**
   (`DEFAULT_PAGE_SIZE`), literal yazmır; fikstür məlumatı (tarix, id, ölçü) literal qala
   bilər. `*.test.*`, `shared/testing/**`, `features/crud/fixtures/**` və sabit
   fayllarının özü lint-dən azaddır.
7. **Tailwind `[Npx]`** lint-dən kənardır: eyni ölçü ≥ 2 yerdə → `index.css` token-i;
   birdəfəlik Figma ölçüsü className-də qalır (Figma node istinadı ilə).

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
   (`/speckit-analyze` daxil olmaqla); guideline-dan kənarlaşmalar D-nömrə ilə
   sənədləşdirilir (Maddə IX.3). Merge üçün uyğunluq şərti Maddə VI gate-idir.

**Version**: 1.4.0 | **Ratified**: 2026-09-01 | **Last Amended**: 2026-11-03
