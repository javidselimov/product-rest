# web-cbar-next — gündəlik iş

Bu sənəd `README.md` və `CLAUDE.md`-ni tamamlayır: yeni səhifə necə əlavə olunur, data
necə axır, gate nəyi tutur. Qaydaların mənbəyi `.specify/memory/constitution.md`.

## 1. Başlanğıc

```bash
npm run install:public && npm run install:offline
npm run dev                      # http://localhost:3001 → /az (real api-cbar lazımdır: ../dev.ps1)
npm run verify                   # merge gate
```

## 2. Yeni səhifə — 4 addım

Nümunə: `/[locale]/vacancies`.

1. **Feature api + model** — `src/features/vacancies/model/schemas.ts` (Zod, `.passthrough()`),
   `src/features/vacancies/api/vacancies.api.ts` (`import 'server-only'`, `getJson`/`getJsonOrNull`
   `@/server/api-client`-dən). MSW handler `src/shared/testing/handlers/vacancies.ts` + fikstür,
   `handlers/index.ts`-ə əlavə.
2. **Loader** — `src/views/vacancies/loader.ts`: `searchParams` `@/shared/lib/search-params`
   sxemləri ilə parse, API çağırışı, view üçün serializable data; detal üçün `cache()`.
3. **View** — `src/views/vacancies/index.tsx`: prop-lu, mümkün qədər server komponenti;
   mətnlər `getT(locale, 'ns')` ilə; kit komponentləri subpath ilə; boş/xəta vəziyyəti
   (`EmptyState`, `ErrorState`).
4. **Route** — `src/app/[locale]/vacancies/page.tsx`: `dynamic = 'force-dynamic'`,
   `generateMetadata`, `loadVacancies` + `<VacanciesView>`. `src/app/metadata.test.ts`-dəki
   route siyahısına əlavə et.

Tərcümələr: `src/locales/az/<ns>.json` və `src/locales/en/<ns>.json` — açar dəstləri
eyni olmalıdır (`key-parity.test.ts`). Yeni namespace `src/shared/i18n/index.ts`-də qeyd olunur.

Menyu CMS ağacından gəlir — kod dəyişikliyi tələb etmir; xüsusi route-a xəritələnən slug
`src/shell/nav.ts#FEATURE_ROUTES`-a əlavə olunur.

## 3. Data necə gəlir

```text
route page.tsx → views/<x>/loader.ts → features/<x>/api (server-only) → src/server/api-client (axios, Zod)
                                    ↘ view (prop) → widgets → kit
```

- Brauzer heç vaxt API-yə müraciət etmir; interaktiv seçim GET forması / `Link` ilə URL-ə
  düşür və server yenidən render edir.
- Sxem uyğunsuzluğu `AppError{kind:'schema'}` → siyahıda `ErrorState`, detalda route `error.tsx`;
  404 → `null` → `notFound()`.
- Media ünvanları serverdə `mediaUrl(path, env.API_URL)` ilə mütləq olur; CMS HTML
  `prepareCmsHtml` ilə hazırlanıb `CmsContent`-ə verilir.

## 4. Tema və dil

- Sayt yalnız açıq temadadır: tema seçimi və `ui-theme` cookie-si spec 022 ilə ləğv olunub.
- Dil yalnız URL seqmentidir; `LanguageSwitcher` sorğu parametrlərini qoruyaraq seqmenti dəyişir.
- Server komponentində `getT(locale, ns)`, client komponentində `useTranslation`.

## 5. Gate nəyi tutur

`npm run lint`: hardcoded rəng · kit barrel import · qadağan paket · prezentasiya qatında
birbaşa HTTP · qat istiqaməti · hardcoded UI mətni · client-dən `@/server/*` ·
`NEXT_PUBLIC_*` · `dangerouslySetInnerHTML` (yalnız `widgets/cms-content` istisna) · `eval`.

`npm run test:run`: view/loader testləri, `cms-html` struktur sayları, proxy yönləndirmə
cədvəli, CSP, i18n pariteti, UTF-8 mühafizəsi, route metadata müqaviləsi.

## 6. Git hook-ları

`scripts/git-hooks/*` — `prepare` ilə quraşdırılır; workspace-də `.git` kökdə olduğu üçün
bu qovluqda hook işləmir, CI eyni gate-i (`npm run verify`) işlədir.
