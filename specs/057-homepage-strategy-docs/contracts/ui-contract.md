# Sayt kontraktı — `web-cbar-new` (spec 057)

Görünüş **dəyişmir**: `widgets/home-cards/strategy-docs.tsx` spec 022 FR-014 + tablet düzəlişi ilə qalır (Figma `813:25097`, `831:4378`). Dəyişən
yalnız məlumat mənbəyidir.

## Axın

```text
GET /api/v1/homepage (cachedJson, 10 s)  ──▶  features/homepage/model/schemas.ts  homepageSchema.strategyDocs (default [])
                                         ──▶  views/home/loader.ts  toStrategyDoc(), slice(0, STRATEGY_DOCS_MAX)
                                         ──▶  views/home/index.tsx  <StrategyDocs docs> | Təqvim
```

- `homepageStrategyDocSchema`: `{ id: number, title: string, summary: nullableString, coverUrl: nullableString, href: string }`, `.passthrough()`.
- `toStrategyDoc(doc, locale)` → `StrategyDoc`:
  - `key` = `String(doc.id)`;
  - `href` = `localizeHref(doc.href, locale, …)`;
  - `coverUrl` = `mediaUrl(doc.coverUrl)`;
  - `summary` = olduğu kimi.
- `HOME_BLOCKS.strategyDocs === false` → `[]` (bugünkü kimi).
- `/homepage` xətası → `strategyDocs: []`, blok gizlənir, Təqvim tək qalır (bugünkü `data.strategyDocs.length > 0 || data.calendar.length > 0`
  şərti).

## Widget dəyişiklikləri

- Böyük kartın başlıq linki və "Daha ətraflı" düyməsi, dar kartın başlıq linki daxili ünvanda `next/link`, xarici ünvanda `target="_blank"
  rel="noopener noreferrer"` olur. Bunun üçün mövcud `widgets/smart-link` `SmartLink` işlədilir. Kit `Button asChild` ilə `SmartLink` uşağı kimi
  işləyir. Bu, yoxlanılmalıdır, çünki `SmartLink` `className` və `...rest`-i ötürür.
- Widget-in doc-comment-indəki "mock" qeydi düzəldilir (kod şərhləri ingiliscə, yaddaş `code-comments-english`).
- Yeni `'use client'` yoxdur.

## Silinənlər

- `views/home/mock.ts` və onun `loader.ts`-dəki importu, `loader.test.ts`-dəki mock fərziyyələri.
- `public/site/home/risk-based-supervision.png`, `public/site/home/microfinance.png` → `specs/057-homepage-strategy-docs/assets/` (redaktor üçün).

## Testlər

- `features/homepage/api/homepage.api.test.ts` / MSW `handlers/homepage`: fikstürdə `strategyDocs` (daxili və xarici `href`, `coverUrl: null`, 4
  sənəd).
- `views/home/loader.test.ts`: 4-dən 3-ü götürülür, sıra saxlanılır, daxili `href` `/az/...`, xarici olduğu kimi, `/homepage` xətası → `[]`.
- `views/home/index.test.tsx`: xarici `href`-li kart `target="_blank"` ilə açılır. Mövcud blok testləri qalır.
