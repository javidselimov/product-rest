# Spec 001 — Demo aplikasiyadan enterprise template-ə rekonstruksiya

| | |
| --- | --- |
| Status | Təsdiqlənib |
| Tarix | 2026-08-31 |
| Mənbələr | `../../../specdd/guideline.md`, `../constitution.md`, `CLAUDE.md` |
| Sonrakı sənədlər | [plan.md](plan.md) · [tasks.md](tasks.md) |

---

## 1. Xülasə

`project-nexus-main` hazırda `@cbar/lib-react-ui-kit`-i nümayiş etdirən 6 səhifəlik demo
aplikasiyadır. Bu spec onu korporativ frontend standartına (`specdd/guideline.md`)
uyğun **enterprise starter template**-ə çevirir: real router, auth scaffold, API
layer, state management, i18n, test infrastrukturu və error handling ilə. Məqsəd —
gələcək CBAR frontend layihələrinin bu template-dən başlaya bilməsidir.

## 2. Motivasiya və mövcud vəziyyət

Mövcud boşluqlar:

| Sahə | İndiki vəziyyət |
| --- | --- |
| Routing | ~30 sətirlik hash router (`src/app/router.tsx`); deep-link `#/` ilə, lazy loading yoxdur |
| Data | Hamısı hardcoded fixture (`src/data/`); API layer yoxdur |
| Auth | Yoxdur — nə login, nə guard, nə permission |
| State | Yalnız lokal `useState` + `theme.ts`; server/client state ayrımı yoxdur |
| i18n | Yoxdur — bütün mətnlər ingiliscə hardcoded |
| Test | Yoxdur — nə runner, nə bir test faylı |
| Error handling | Yoxdur — nə ErrorBoundary, nə error state-lər |
| Config | `.env.*`, `/config.json` kontraktı, nginx, `.ci-cd/` mövcuddur, amma **kodda heç nə onları oxumur** |

Deploy scaffolding-in "ölü" olması ən konkret sübutdur: `default.conf` və
`.ci-cd/dev.yaml` `/config.json` runtime-config kontraktı təsvir edir, `src/`-də isə
istehlakçısı yoxdur.

## 3. İstifadəçi ssenariləri

1. **Template istifadəçisi (developer):** repo-nu clone edir, `npm ci && npm run dev`
   ilə işə salır, `.specify/memory/constitution.md`-i oxuyur və yeni feature-i hazır FSD
   skeleti üzərində — auth, API layer, i18n və test nümunələrinə baxaraq — qurur.
2. **Son istifadəçi:** `/login`-də daxil olur → qorunan shell-ə düşür → səhifələr
   arasında URL ilə gəzir → dili dəyişir (az/en) → dark mode-u dəyişir → sessiya
   bitəndə Azərbaycanca mesajla login-ə qaytarılır.
3. **DevOps:** eyni Docker image-i bütün mühitlərə deploy edir; API ünvanı yalnız
   mühitin `/config.json`-u ilə dəyişir, rebuild tələb olunmur.

## 4. Funksional tələblər

| ID | Tələb |
| --- | --- |
| FR-01 | URL-əsaslı routing (history/path, hash yox): hər səhifə deep-link ilə açılır, geri/irəli düymələri işləyir, tanınmayan URL 404 səhifəsi göstərir |
| FR-02 | Bütün səhifə route-ları lazy yüklənir (code-split) |
| FR-03 | Auth scaffold: login səhifəsi (RHF+Zod validasiyalı form), qorunan layout (auth-suz giriş `/login`-ə redirect + qayıdış ünvanı), logout (state + query cache təmizlənir) |
| FR-04 | Permission-əsaslı rendering: `<Can permission="...">` komponenti və ən azı bir real istifadə nümunəsi; `user.role === "ADMIN"` müqayisəsi qadağandır (guideline §5.8) |
| FR-05 | API layer: bütün data query hook-larından gəlir (UI → Query Hooks → Services → API Client — guideline §10.3); komponentdə birbaşa HTTP çağırışı yoxdur |
| FR-06 | Runtime config: boot zamanı `/config.json` oxunur və axios `baseURL`-i təyin edir; tapılmasa `VITE_API_URL` fallback işləyir |
| FR-07 | i18n: az (default) + en; dil runtime-da dəyişir, seçim persist olunur, bütün UI mətnləri açarlardan gəlir |
| FR-08 | Mövcud 6 demo səhifə FSD strukturunda yenidən qurulur; data mock API-dən (MSW) gəlir, fixture birbaşa import edilmir |
| FR-09 | Hər query üçün loading / empty / error vəziyyətləri UI-də görünür (guideline §15) |
| FR-10 | Global ErrorBoundary + route səviyyəsində error fallback; süni runtime error istifadəçiyə Azərbaycanca fallback göstərir |
| FR-11 | Mutation-lar toast ilə nəticə bildirir (uğur/xəta), xəta mesajı normalize olunmuş `AppError`-dən gəlir |
| FR-12 | Dark mode mövcud davranışını saxlayır (`.dark` class `<html>`-də) |

## 5. Qeyri-funksional tələblər

| ID | Tələb |
| --- | --- |
| NFR-01 | TypeScript strict; `npm run build` (tsc -b + vite) xəbərdarlıqsız keçir |
| NFR-02 | ESLint + Prettier (+ `prettier-plugin-tailwindcss`) konfiqurasiya olunub; `npm run verify` = lint + typecheck + test + build |
| NFR-03 | Route-lar ayrı chunk-lara bölünür; ilkin bundle-a bütün səhifələr düşmür |
| NFR-04 | Test infrastrukturu işlək: unit + component + MSW inteqrasiya nümunələri; coverage report yaranır (rəqəmsal threshold yox — guideline §13.19 kvalitativdir) |
| NFR-05 | A11y: kit standartı pozulmur (icon-only control-larda `aria-label` və s.) |
| NFR-06 | Sənədləşmə: `CLAUDE.md` yeni struktura uyğun yenidən yazılır, `README.md` yenilənir |

## 6. Kənarlaşmalar registri (guideline-dan)

| # | Guideline deyir | Biz edirik | Əsaslandırma |
| --- | --- | --- | --- |
| D1 | §2.5: flat struktur `app/features/shared` | FSD: `app/pages/widgets/features/entities/shared` | Komanda qərarı; §2.5-in hər məsuliyyətinin FSD-də yeri var — uyğunluq cədvəli plan.md §2-də |
| D2 | §4.2–4.3, §2.2: React Router (`createBrowserRouter`) | TanStack Router | Komanda qərarı; §4-ün prinsipləri (mərkəzi route-lar, sabitlər→typed route-lar, protected route-lar, layout-lar, lazy loading) TanStack-də daha güclü ödənilir |
| D3 | §6.4: URL state → React Router search params | TanStack `validateSearch` (Zod-typed) | D2-nin nəticəsi; mandatdan güclüdür |
| D4 | §16.13: token localStorage-da qadağan; `specdd/example/skills/SKILL.md` isə localStorage tələb edir | **Guideline qalib gəlir**: access token yalnız yaddaşda (Zustand, persist-siz); yalnız qeyri-həssas user snapshot persist oluna bilər | §16 korporativ security standartıdır və nümunə skill-dən üstündür |
| D5 | `CLAUDE.md`: "No routing … dependency, and none may be added" | Template fazası bu qaydanı ləğv edir; CLAUDE.md Faza 8-də yenidən yazılır | Repo-nun məqsədi kit-demo-dan template-ə dəyişir |
| D6 | §14.4: az/en/ru | Yalnız az + en | Əhatə qərarı; ru §14.7 üzrə drop-in qovluqdur, sonradan əlavə oluna bilər |

## 7. Əhatə xarici (Out of scope)

- Real backend və real login endpoint-i — auth endpoint-ləri (`/auth/login`,
  `/auth/me`) **uydurma kontraktdır**, MSW ilə mock olunur və real API spec gələnə
  qədər belə işarələnir
- Sentry hesabı/DSN — yalnız no-op adapter interfeysi qurulur
- Rus dili (D6)
- Playwright E2E — guideline §13.2 mandatıdır, amma bu feature-də yalnız gələcək iş
  kimi qeyd olunur
- MFA UI, refresh-token axını (backend tələb edir)
- `.ci-cd/prod.yaml`-ın TEST API-yə baxması — açıq sual kimi ötürülür, burada düzəlmir

## 8. Qəbul meyarları

- [x] `npm run verify` (lint + typecheck + test + build) təmiz keçir — guideline §18.28 gate
- [x] Auth-suz istifadəçi qorunan URL-ə girəndə `/login`-ə redirect olunur, login-dən sonra həmin URL-ə qayıdır *(auth-flow testləri)*
- [x] Dil keçidi bütün görünən mətnləri dəyişir və reload-dan sonra qalır *(mexanizm: i18next detector localStorage cache; brauzer smoke testi istifadəçi ilə)*
- [ ] `public/config.json`-da `apiUrl` dəyişdirilib `npm run preview` edildikdə API ünvanı rebuild-siz dəyişir *(manual brauzer yoxlaması — kod yolu runtime-config testi ilə təsdiqlənib)*
- [x] Bütün səhifələr MSW datası ilə render olunur; loading/empty/error ssenariləri göstərilə bilir *(router + projects testləri; error state 500 testi)*
- [x] Tanınmayan URL 404 səhifəsi göstərir *(router testi)*
- [x] `src/`-də hardcoded UI mətni qalmır (i18n açarları; istisna: kit qalereyası — tasks T4.4), hex/rgb rəng qalmır *(grep audit)*
- [x] Süni runtime error ErrorBoundary fallback-ı, süni 500 cavabı Azərbaycanca mesaj göstərir *(projects 500 testi; boundary brauzer smoke testi istifadəçi ilə)*

## 9. Asılılıqlar və risklər

1. **Backend yoxdur** — MSW yeganə dev/test data mənbəyidir; axios qatı realdır və
   canlı API-yə keçid yalnız `/config.json` ilə olur (kod dəyişmir).
2. **In-memory token (D4)** — hard refresh-də yenidən login tələb olunur; "yadda
   saxla" UX-i refresh-cookie axını (backend) gələndə mümkün olacaq. Bu, şüurlu
   security qərarıdır və sənədləşdirilir.
3. **Hash → path URL keçidi** köhnə `#/route` bookmark-larını sındırır — template
   kontekstində qəbul edilir (nginx `try_files` artıq path routing-ə hazırdır).
4. **Vitest ↔ Vite 8 uyğunluğu** — Faza 0-da uyğun major yoxlanılır.
5. **UTF-8** — i18n JSON-ları heç vaxt shell redirection ilə yazılmır (Maddə I.5).
