# Research: spec 061 — Statistika bölməsi, faza 1

Mənbələr (2026-11-27): Figma bridge ("cbar website" → "Statistics"), test API (`https://api-cbar-test.cbar.az`, `GET /api/v1/pages/tree`,
`GET /api/v1/pages/{slug}`), kod (`web-cbar-new`, `api-cbar`, `api-cbar-admin`), `business_logic/*`, `product-host` (yalnız oxundu).

## R1 — `/statistics` ünvanı və qrafik səhifəsi

**Decision**: `src/app/[locale]/(content)/statistics/page.tsx` silinir, eyni məzmunla `statistics/charts/page.tsx` yaranır
(`views/statistics` adı `views/statistics-charts` olur, loader dəyişmir). `/{locale}/statistics` bundan sonra CMS catch-all-a düşür:
en-də slug `statistics` kök səhifəsini açır; az-da `statistics` slug-u yoxdur və catch-all-ın mövcud `findLocaleCounterpart` addımı
en səhifənin az ünvanına (`/az/statistika`) yönləndirir. Proxy-yə yeni qayda lazım deyil.

**Yoxlama (tasks-da ilk iş)**: `statistics/azir` qovluğu qaldığı üçün `statistics` seqmenti fayl sistemində qalır, amma `page.tsx`-siz.
Next App Router marşrutu page faylı olan yollardan qurur, ona görə `/en/statistics` catch-all-a düşməlidir. Bu, build + sorğu ilə
yoxlanır. Düşməzsə ehtiyat yol: `statistics/page.tsx` catch-all-ın `default` və `generateMetadata`-sını `slug: ['statistics']` ilə
çağıran nazik fayl olur.

**Nəticə (T001, 2026-11-27, `npm run local:testcbar`)**: `statistics/page.tsx` köçürüləndən sonra `/en/statistics` 200, `cms-page` +
`section-sidebar`, en giriş mətni; `/az/statistics` → `NEXT_REDIRECT;replace;/az/statistika` (axın başladığı üçün dev-də 200 + meta refresh,
bütün CMS səhifələrinin `findLocaleCounterpart` davranışı ilə eyni); `/az/statistics/charts` və `/az/statistics/azir` 200. Ehtiyat yol lazım
deyil.

**Alternatives**: proxy-də `/statistics` → `/statistika` (en-də işləmir, slug elə `statistics`-dir); kök slug-unu dəyişmək (DB-yə
yazmaq, köhnə linkləri qırır) — rədd edildi.

## R2 — Bölmə açarı

**Decision**: `SectionKey` `'statistics'`, `SECTION_TITLES.statistics = {'Statistika', 'Statistics'}`. Bölmə `section-shell`-dən istifadə
edir (breadcrumb, paylaşma, sol menyu, mobil menyu) — spec 054 ilə eyni. `statisticsLayoutFor` slug-a görə layout seçir (R3).

## R3 — Layout-lar

| Layout | Səhifələr (az / en slug) | Mənbə |
|---|---|---|
| `statistics-files` (yeni) | `makroiqtisadi-statistika` / `macroeconomic-indicators`, `pul-kredit-statistikasi` / `monetary-indicators`, `odenis-sistemlerinin-statistikasi` / `payment-system-indicators` | səhifə faylları + qrup adı |
| `statistics-datasets` (yeni) | en `statistical-data-for-nsdp` | səhifə faylları, eyni başlıq = bir dataset |
| `document-list` (mövcud, spec 054) | `metodologiya` / `methodology`, `melumatlarin-reviziyasi-siyaseti` / `data-revision-policy` | səhifə faylları |
| `plain` | kök, `maliyye-sektorunun-statistikasi`, faza 2 səhifələri | CMS mətni |

Slug-la seçim (spec 044/045 modeli), çünki bu səhifələrin mətni boşdur — forma görə seçim (spec 054) işləməz. Slug-lar sabitlərdə,
`-copy` qaralamaları `withCopies` ilə. İki yeni `AboutLayoutKind` qoruma tələb edir (CLAUDE.md): fikstür `<layout>.html` iki
komponentdə, `EXPECTED_BLOCKS`, admin `roundtrip.test.ts`. Fikstür bu səhifələrin redaktor mətnidir (boş və ya bir abzas); blokların
əsası fayllardır, ona görə `EXPECTED_BLOCKS` mətn blokunu yoxlayır, fayl qrupları ayrıca model testindədir.

**Alternatives**: yeni məzmun növü (API + admin + cədvəl) — istifadəçi qərarı 5 ilə rədd; `document-list`-i qruplarla genişləndirmək —
başqa bölmələrin görünüşünə toxunur, rədd.

## R4 — Kateqoriya seçimi (çiplər / mobil menyu)

**Decision**: ünvanda `?group=<slug>`: çip mətninin `foldForSearch` + `-` ilə slug-u (`real-sektor-ve-qiymetler`). Sıra nömrəsi
(spec 050 kanalı kimi) rədd edildi: redaktor qrup əlavə edəndə paylaşılmış link başqa qrupu açardı. Naməlum və ya boş dəyər "Hamısı"dır.
Desktop və tablet: link çipləri (`<nav aria-label>` + `<a aria-current="page">`), Figma `Makro / Cədvəllər` və `· Tablet`. Mobil: mövcud
`YearMenu` (native `<details>` + linklər, server komponenti), Figma `Makro / Cədvəllər · Mobile` (`Menu=Yes` açıq hal). JS lazım deyil.

**Alternatives**: client filter (`useState`) — JS-siz işləməz, paylaşılan ünvan yoxdur (FR-009) — rədd; `<select>` — Figma panelini verə
bilməz (spec 054 R-qeydi).

## R5 — Qrup adı formatı

**Decision**: `page_assets.group_label` mətni `Başlıq | Çip` ola bilər (Qərar 13); `|` yoxdursa ikisi eynidir. Ayrılma və trim
`features/statistics/model/groups.ts` saf funksiyasındadır. Köhnə `widgets/attachments` (spec 002 görünüşü) bu formatı bilmir, amma bu
səhifələr artıq onu işlətmir; redaktor təlimatı `|`-ı yalnız Statistika fayl səhifələri üçün yazır.

## R6 — "Yenilənib" tarixi

**Decision**: (1) az/en fayl başlığının sonundakı ` (dd.mm.yyyy)` etibarlı tarixdirsə o; (2) yoxsa API-nin yeni `uploadedAt` sahəsi
(`media_assets.created_at`); (3) heç biri yoxdursa sətir yoxdur. Kart başlığı (1)-dəki hissə atılmış başlıqdır. "Son yenilənmə" =
səhifə fayllarının ən böyük tarixi, `formatLongDate` ilə.

**Səbəb**: köhnə importla gələn faylların `created_at`-ı import günüdür; eyni baytların təkrar yüklənməsi köhnə qeydi saxlayır
(2026-10-27 qərarı). Başlıqdakı tarix redaktorun dediyi tarixdir. `page_assets`-də tarix yoxdur və sxem dəyişmir (Qərar 2).

## R7 — Public API: `uploadedAt`

**Decision**: `GET /api/v1/pages/{slug}` cavabında hər `assets[]` elementinə `uploadedAt` (ISO 8601, `date-time`, nullable deyil) —
`a.Media.CreatedAt`. Yalnız əlavə sahə; `PageAsset` sxemi əvvəl `openapi/components/schemas/pages.yaml`-də (spec-first, `/api-endpoint`
skill-i — route dəyişmir, ona görə hook yalnız xatırladır). Sayt sxemində sahə `optional()` — köhnə API ilə işləyir (FR-024). Admin API
dəyişmir. Deploy: `api-cbar` saytdan əvvəl, amma sıra kritik deyil.

## R8 — ZIP

**Decision**: route handler `src/app/[locale]/(content)/statistics/files/[slug]/route.ts` → `GET /{locale}/statistics/files/{slug}`.
`statistics` seqmenti R1-dən sonra page-siz qalır, route handler orada catch-all ilə toqquşmur; ünvan bölməyə aiddir və locale daşıyır.
Catch-all-ın altında (`[...slug]/files.zip`) route mümkün deyil. Axın: `getPage(locale, slug)` (mövcud server API) → yalnız `statistics-files` layout-lu slug-lar
(başqa səhifə 404) → hər fayl `mediaUpstreamUrl(id)` ilə ardıcıl çəkilir → `createZip` (`shared/lib/xlsx/zip.ts`, spec 021) → `application/zip`,
`Content-Disposition: attachment; filename*=UTF-8''<slug>.zip`. Limitlər: ən çox 60 fayl, cəmi 50 MB (sabitlər); aşanda və ya bir fayl
alınmayanda 502/413 + loglama, yarımçıq arxiv yox. Adlar: kart başlığı + mime-dan uzantı, Windows-da qadağan simvollar `_`, təkrar →
` (2)`.

**Yeni asılılıq yoxdur**: `createZip` hazırdır. Fayllar artıq sıxılmış (xlsx) olduğu üçün deflate qazanc vermir; `createZip`-ə `store`
seçimi əlavə etmək (method 0) CPU-nu azaldır — kiçik, testli dəyişiklik.

**Alternatives**: API-də ZIP endpoint (iki komponent, admin deyil public API yazmır, amma MinIO çəkir) — sayt artıq media proxy-sidir,
rədd; brauzerdə ZIP (JS, CSP) — rədd.

## R9 — Seed: ağac

**Decision**: `api-cbar-admin/db/migrations/0046-statistics-section-seed.sql`, generator `specs/061-statistics-redesign/seed/build-seed.mjs`
(`tree.json` + `file-groups.json` → SQL; spec 054 modeli). Qaydalar `contracts/seed-contract.md`-dədir: hüquq yoxlaması, slug ilə
axtarış, sıra yalnız köhnə nisbi sıra tanınanda, başlıq yalnız köhnə başlığın üstünə, iki yeni səhifə yalnız yoxdursa, "(Kopya)" kökü
yalnız `page_details` sətri yoxdursa menyudan çıxır, heç bir `DELETE`/`ALTER`/`CREATE TABLE`.

Figma sırası (az `2846:137973`, en `3071:32085`): Statistik bülleten, Makroiqtisadi statistika, Pul-kredit statistikası, Maliyyə sektorunun
statistikası, Ödəniş sistemlərinin statistikası, Xarici sektorun statistikası, İnteraktiv statistik məlumat bazası, Statistik məlumatların
yayımlanması qrafiki, Metodologiya, Məlumatların reviziyası siyasəti, Statistical Data for NSDP (yalnız en), "(Kopya)" sonda.

Köhnə sıra (test): bülleten, makro, pul-kredit, xarici, maliyyə, ödəniş, interaktiv, kopya, qrafik, NSDP.

## R10 — Seed: başlıqlar

| Səhifə (az slug) | az köhnə → yeni | en köhnə → yeni (Figma en menyusu) |
|---|---|---|
| `makroiqtisadi-statistika` | — | Macroeconomic indicators → Macroeconomic statistics |
| `pul-kredit-statistikasi` | — (D1) | Monetary indicators → Monetary statistics |
| `maliyye-sektorunun-statistikasi` | — | Financial market indicators → Financial sector statistics |
| `odenis-sistemlerinin-statistikasi` | — | Payment system indicators → Payment systems statistics |
| `interaktiv-statistik-melumat-bazasi` | — | Interactive Statistic Database → Interactive statistical database |
| `statistik-hesabatlarin-yayimlanmasi-qrafiki` | Statistik hesabatların… → Statistik məlumatların yayımlanması qrafiki | Schedule of statistical releases → Statistical data release calendar |
| `sigorta-3` | Sığorta → Sığorta sektoru | Insurance → Insurance sector (qaralama) |
| yeni | Metodologiya | Methodology |
| yeni | Məlumatların reviziyası siyasəti | Data revision policy (qaralama) |

## R11 — Seed: fayllar

`seed/file-groups.json` (generasiya olunub): 43 fayl, hər biri `legacy` (az başlıq, tarixsiz), `figma`, `group`. 8 başlıq düzəlişi (2 Makro,
6 Pul-kredit: `kredıt` xətası, durğu, böyük hərf, iki "(şəhər və rayonlar)" yerdəyişməsi). Ödənişdə qrup sırası köhnə fayl sırasından
gəlmir → yalnız orada `sort_order` Figma sırasına, yalnız `legacyOrder` tam tanınanda.

## R12 — Yayım qrafiki keçidi (ləğv edildi, implementasiyada 2026-11-27)

Figma-da "Yayım qrafiki →" gizli qatdır (`2910:20963`), qurulmur; aşağıdakı ilk qərar tarix üçün qalır.

"Yayım qrafiki →" `nodeHref` ilə səhifə ağacındakı `statistik-hesabatlarin-yayimlanmasi-qrafiki` / `schedule-of-statistical-releases`
düyününə gedir (slug sabiti `STATISTICS_RELEASE_SCHEDULE_SLUG`). Ağacda tapılmasa keçid göstərilmir.

## R13 — Rəqəmlər və ölçülər

Figma ölçüləri `contracts/ui-contract.md`-dədir. Hər ekran implementasiyada Figma rəqəmi + brauzerdə `getBoundingClientRect` ilə
tutuşdurulur (layihə qaydası, "Əvvəl ölç, sonra iddia et").
