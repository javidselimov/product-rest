# Data Model: Public sayt (`web-cbar-next`)

**Faza 1 çıxışı** | Tarix: 2026-09-14 | Spec: [spec.md](./spec.md) | Research: [research.md](./research.md)

Sayt heç nə yazmır; bütün modellər `api-cbar` cavablarının **oxunan** formalarıdır. Hər model
Zod sxemi kimi yazılır (`.passthrough()`, research R3), TypeScript tipi `z.infer` ilə çıxarılır.
Sahə adları və tipləri köhnə `web-cbar/src/lib/api.ts` interfeyslərindən birə-bir götürülür
(contracts/public-api.md endpoint-lərə bağlayır). Yerləşmə: `entities/*/model/schemas.ts`
(ortaq) və `features/<x>/model/schemas.ts` (feature-ə məxsus).

## 1. Ortaq tiplər (`entities/content`)

| Ad | Forma | Qeyd |
| --- | --- | --- |
| `Locale` | `'az' \| 'en'` | `localeSchema = z.enum` |
| `ListEnvelope<T>` | `{ items: T[]; total: number; page: number; pageSize: number }` | `listEnvelope(itemSchema)`; `totalPages` yoxdur — `max(ceil(total/pageSize),1)` hesablanır |
| `MediaAsset` | `{ mediaId: number; originalName: string; mimeType: string; sizeBytes: number; url: string }` | press reliz və qanun əlavələri |
| `PageAsset` | `{ mediaId: number; title: string; mimeType: string; sizeBytes: number; group: string \| null; url: string }` | CMS səhifə əlavəsi; `group` qruplaşdırma açarı |
| `MediaUrl` | `string \| null` | `mediaUrl(path)`: `null` → `null`; `http…` → olduğu kimi; əks halda `${API_URL}${path}` (serverdə) |

Helper-lər: `formatDate(iso, locale)` (`Intl.DateTimeFormat`, `az-AZ`/`en-GB`), `stripHtml`,
`excerpt(text, n)` (n simvolda kəsib `…` əlavə edir), `formatSize(bytes)` (B/KB/MB/GB),
`fileIcon(mimeType|name)` → `/site/{pdf|xlsx|xls|docx|doc|zip|rar|file}.svg`.

## 2. Səhifə ağacı və CMS səhifəsi (`entities/page-node`, `features/pages`)

| Ad | Forma |
| --- | --- |
| `PageNode` | `{ id: number; title: string; slug: string; navUrl: string \| null; children: PageNode[] }` (rekursiv `z.lazy`) |
| `PageDetail` | `{ id: number; title: string; slug: string; content: string \| null; assets?: PageAsset[] }` |

Qaydalar:
- Menyu: ilk 8 üst node görünür, qalanı "daha çox" altında; dərinlik ≤ 3.
- `navFor(node)`: `navUrl` mütləq (`^https?://`) → xarici; nisbi → `/${locale}${navUrl}`;
  yoxdursa `FEATURE_ROUTES[slug]` → `/${locale}/${route}`; əks halda `/${locale}/${slug}`.
- `findChain(tree, slug)` → kökdən node-a qədər massiv; `chain[0]` sol ağacın kökü;
  `hrefFor(chain)` slug-ları birləşdirir.
- Səhifə məzmunu boş və `children.length > 0` → alt səhifə kartları; əks halda `CmsContent`.
- Əlavələr: `mimeType.startsWith('image/')` → şəkil zolağı; qalanı `group` üzrə `Map`
  (hamısı rəqəmdirsə azalan sıra, əks halda daxil olma sırası); qrupsuz sonda; ≥1 qrup →
  accordion (ilk açıq), əks halda düz siyahı.

## 3. Məzmun siyahıları və detalları

| Ad | Forma |
| --- | --- |
| `PressReleaseListItem` | `{ id: number; title: string; slug: string; publishedAt: string; imageUrl?: string \| null }` |
| `PressReleaseDetail` | `PressReleaseListItem & { content: string \| null; assets: MediaAsset[] }` |
| `LawListItem` | `{ id: number; title: string; slug: string; publishedAt: string; categoryName: string \| null }` |
| `LawDetail` | `LawListItem & { description: string \| null; assets: MediaAsset[] }` |
| `LawCategory` | `{ id: number; name: string \| null }` |
| `MoneyMarkNewsListItem` | `{ id: number; title: string; slug: string; publishedAt: string }` |
| `MoneyMarkNewsDetail` | `MoneyMarkNewsListItem & { content: string \| null }` |

Qaydalar: press reliz `type` URL parametri `1` (reliz) \| `2` (elan); qanun `type` də köhnə
saytdakı kimi rəqəmdir — `1` (qanun) \| `2` (normativ akt) — və API-yə olduğu kimi ötürülür
(contracts/public-api.md); bir dildə boş məzmun detalı API 404 → `null` → `notFound()`.

## 4. Ana səhifə paketi (`features/homepage`)

| Ad | Forma |
| --- | --- |
| `HomepageBanner` | `{ title: string \| null; description: string \| null; link: string \| null; imageUrl: string \| null }` |
| `NewsSliderItem` | `{ title: string \| null; description: string \| null; link: string \| null; imageUrl: string \| null; newsDate: string }` |
| `HomepageLink` | `{ title: string \| null; url: string \| null }` |
| `HomepagePublication` | `{ title: string \| null; url: string \| null; imageUrl: string \| null; publishedAt: string }` |
| `InfoLineItem` | `{ title: string \| null; value: string \| null; year: number \| null }` |
| `InfoLineGroup` | `{ alias: string; items: InfoLineItem[] }` |
| `Homepage` | `{ banners: HomepageBanner[]; newsSlider: NewsSliderItem[]; runningLines: string[]; links: HomepageLink[]; publications: HomepagePublication[]; infoLines: InfoLineGroup[] }` |

`infoLines` alias-ları (kart xəritəsi, research R14): `corridor_min`, `corridor_max`,
`corridor_percent`, `cpi_yoy`, `target`, `money_reserve_usd`, `money_base`, `nots_volume`,
`nots_levels_28|84|168|252`, `bank_credit`, `bank_nation`. Banner `description` dolu → promo
banner; boş → faydalı keçid.

Loader çıxışı (`HomeViewData`): hər blok `{ data: T \| null; error: boolean }`; əlavə
`previousSheet: CurrencySheet \| null` (trend üçün), `featuredExcerpt: string \| null`.

## 5. Maliyyə modelləri (`features/currencies`, `features/stats`, `features/meas`)

| Ad | Forma |
| --- | --- |
| `CurrencyRate` | `{ code: string; nominal: number; name: string \| null; rate: number; showOnHomepage: boolean }` |
| `CurrencySheet` | `{ date: string; rates: CurrencyRate[] }` |
| `AzirValue` | `{ valueDate: string; term: string; rate: number }` |
| `InflationParameter` | `{ year: number; month: number; parameterCode: string; value: number }` |
| `YieldCurveParameters` | `{ beta0: number; beta1: number; beta2: number; lambda: number }` |
| `YieldCurvePoint` | `{ period: string; yield: number }` |
| `YieldCurve` | `{ curveDate: string; parameters: YieldCurveParameters \| null; yields: YieldCurvePoint[] }` |
| `MeasItem` | `{ id: number; regDate: string; dqn: string; emitentName: string \| null; infoTypeName: string \| null; fileUrl: string \| null }` |
| `MeasEmitent`, `MeasInfoType` | `{ id: number; name: string \| null }` |

Qaydalar: məzənnə dəyəri köhnə saytdakı kimi `rate.toFixed(4)` ilə göstərilir (vərəq və ana
səhifə kartı); trend = `rate - previousSheet.rate(code)` işarəsi; XML keçidi
`${API_URL}/currencies/${DD.MM.YYYY}.xml` (tarix `date`-dən çevrilir). AZIR: statistika
qrafiki API-nin qaytardığı bütün müddətləri ayrı xətt kimi çəkir (`getAzir()` parametrsiz),
ana səhifə kartı `1D|30D|90D|180D` dəyərlərini seçir; inflyasiya `getInflation(cariİl)`,
ay adları `dateLocale` ilə. Qrafik seriyası serializable
`ChartSeries = { name: string; points: [string, number | null][] }`.

## 6. Milli valyuta, təşkilat, media, axtarış

| Ad | Forma |
| --- | --- |
| `MoneyMarkListItem` | `{ id: number; title: string; slug: string; categoryName: string \| null; frontImageUrl: string \| null; rearImageUrl: string \| null }` |
| `MoneyMarkDetail` | `MoneyMarkListItem & { description: string \| null; securityFeatures: string \| null; type: number }` (1 əskinas, 2 sikkə) |
| `MoneyMarkCategory` | `{ id: number; name: string \| null }` |
| `StaffMember` | `{ id: number; type?: number; fullName: string \| null; position: string \| null; receptionDays?: string \| null; phone?: string \| null; bio: string \| null; photoUrl: string \| null }` (type 1 rəhbərlik, 2 idarə) |
| `Division` | `{ id: number; name: string \| null; description: string \| null }` |
| `Office` | `{ id: number; name: string \| null; address: string \| null; phone: string \| null }` |
| `GalleryListItem` | `{ id: number; title: string \| null; eventDate: string \| null; imageCount: number; coverUrl: string \| null }` |
| `GalleryImage` | `{ mediaId: number; url: string }` |
| `GalleryDetail` | `{ id: number; title: string \| null; eventDate: string \| null; images: GalleryImage[] }` |
| `VideoItem` | `{ id: number; title: string \| null; youtubeUrl: string \| null; publishedAt: string \| null }` |
| `VideoStream` | `{ id: number; title: string \| null; streamUrl: string \| null; startsAt: string \| null }` |
| `SearchResult` | `{ title: string; url: string; type: string; snippet: string }` (`page`, `press-release`, `law`, `money-mark`, `staff`) |
| `SearchResponse` | `{ results: SearchResult[] }` |

Qaydalar: `type` rəqəmləri `z.number()` + helper (`isBoard`, `isBanknote`) — yeni dəyər
sxem xətası deyil; axtarış nəticələri `type` üzrə qruplaşdırılır, naməlum tip "digər" qrupunda.

## 7. URL state modeli (siyahılar) — `shared/lib/search-params.ts`

| Route | Parametrlər (Zod) | Default |
| --- | --- | --- |
| `/press-releases` | `type: enum('1','2').optional`, `page: positiveInt.catch(1)` | hamısı, 1 |
| `/laws` | `categoryId: id.optional`, `type: enum('1','2').optional`, `page` | hamısı, 1 |
| `/securities` | `emitentId: id.optional`, `infoTypeId: id.optional`, `page` | hamısı, 1 |
| `/currencies` | `date: YYYY-MM-DD.optional` | bugün (API default) |
| `/statistics` | — (parametr oxunmur; AZIR hamısı, inflyasiya cari il, gəlirlik son) | — |
| `/national-currency` | `type: enum('1','2')` (həmişə göndərilir), `categoryId: id.optional` | 1 (əskinas) |
| `/organization` | `section: enum('board','management','divisions','offices')`, `copy` | board |
| `/national-currency/news` | `page` | 1 |
| `/media` | — (parametr oxunmur; üç bölmə default 10 qeydlə; tab yalnız görünüş vəziyyəti) | — |
| `/search` | `q: string.trim` | `''` (boş → mesaj, sorğu göndərilmir) |

Ümumi: `string[]` → ilk element; yanlış dəyər → default (`catch`), səhifə qırılmır;
`buildHref(base, params, {page})` mövcud parametrləri qoruyur.

## 8. Naviqasiya modeli (`shell/nav.ts`)

`NavSection = { key: string; title: string; href: string; external: boolean; children: NavSection[] }`
(dərinlik ≤ 3); `buildNavSections(tree, locale)` → `{ visible: NavSection[8]; overflow: NavSection[] }`.
Footer: `NAV_SECTION_TITLES` allowlist (`Haqqımızda/About us/About Us`, `Pul siyasəti/Monetary policy`,
`Media`, `İnsan resursları/Human Resources`, `Statistika/Statistics`, `Nəşrlər və tədqiqatlar/Publications
and research`) → uyğun üst node-lar, boşdursa ilk 6.

## 9. Konfiqurasiya modeli (`server/env.ts`)

`Env = { API_URL: string(url); NODE_ENV: 'development'|'test'|'production'; TZ: string; CSP_FRAME_SRC?: string }`
— contracts/runtime-config.md.

## 10. Test fikstürləri (`shared/testing/fixtures`)

Hər sxem üçün `make<Entity>(overrides)` factory; `fixtures/cms-html.ts` legacy markup nümunəsi
(accordion ×2, table ×1, media link ×1, img ×1, YouTube ×1, iframe ×1, `<script>` ×1, `onclick` ×1,
`javascript:` ×1); `handlers/<feature>.ts` fikstürləri `listEnvelope` ilə qaytarır.
