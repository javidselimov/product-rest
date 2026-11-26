# Vizual müqayisə — 024 "Haqqımızda" (SC-001)

Ölçmə: headless Chrome + CDP, `getBoundingClientRect` / `getComputedStyle`, test API
(`npm run local:testcbar`, :3002). Figma: "cbar website (Copy)" → About us. Tolerans ±2px.
Tarixlər: 2026-10-14 (mərhələ 2–5), 2026-10-15 (mərhələ 6, yekun).

## Uyğun gələn ölçülər (1728)

| Səhifə | Element | Figma | Sayt |
|---|---|---|---|
| Ümumi şablon | Alətlər sırası | y 188, h 100 | y 188, h 100 |
| Ümumi şablon | Paylaşma düymələri | 220×36 | 1304,220 · 220×36 |
| Ümumi şablon | Sol menyu | w 312 | 204,288 · w 312 |
| Ümumi şablon | H1 | 32/600, lh 44 | 540,288 · 32/600/44 |
| Ümumi şablon | Məzmun | w 984, 16/400/28 | 540,368 · w 984, 16/400/28 |
| Ümumi şablon | Kənar boşluq 744 / 390 | 40 / 24 | 40 / 24 |
| Ümumi şablon | H1 və mətn (390) | 22/600, 14/400/24 | 22/600, 14/400/24 |
| Missiya | Dəyər sətri: sol sütun / mətn | 200 / 760 | 200 / 760 |
| Tarix (kontrakt nümunəsi) | Marker / xətt / gövdə | 672 / 678 (4) / 708 w 704 | 672 / 678 (4) / 708 w 704 |
| Tarix (kontrakt nümunəsi) | İl çipləri | 1444, 72×28, aralıq 28 | 1444, 72×28, aralıq 28 |
| Tarix (kontrakt nümunəsi) | Hadisələr arası | 60 | 60 |
| Tarix (390) | Marker / xətt / tarix | 24 / 31 (2) / 56 | 24 / 31 (2) / 56 |
| İdarə Heyəti | Sədr kartı | 820,368 · w 424, foto 424×264 | 820,368 · w 424, foto 424×264 |
| İdarə Heyəti | Müavin kartı | 312×414, aralıq 24 | 312×414, aralıq 24 |
| Rəhbərlik | Kart | 312×362 | 312×362 |
| Şöbə | H1 | 28/600/44 | 540,288 · 28/600/44 |
| Şöbə | Məlumat kartı | w 984, 1px, p24, aralıq 32 | 540,368 · w 984, 1px, p24, aralıq 32, r4 |
| Şöbə | Etiket / dəyər | 18/600/32 · 16/400/28 | 18/600/32 · 16/400/28 |

## Fərqlər və qərarlar

| Səhifə | En | Element | Figma | Sayt | Qərar |
|---|---|---|---|---|---|
| Hamısı | hamısı | Rənglər | Figma palitra hex-ləri | Ən yaxın kit semantik token-ləri (`contracts/ui-contract.md` §4) | Qəbul (research R11, kitə və D-2-yə dəyişiklik yoxdur) |
| Hamısı | hamısı | Kart kölgəsi | Figma kölgəsi | `--ui-shadow-md` | Qəbul (R11) |
| Ümumi şablon | 1728 | Breadcrumb eni | 707 | 683 | Qəbul — Figma krumb düymələrində qeyri-ardıcıl 8px boşluq var |
| İdarə Heyəti | hamısı | "Sədr" / "Sədr müavinləri" başlıqları | Görünür | `sr-only` | Qəbul (R9, Figma `1189:15956`) |
| Tarix | 1728 | Hero hündürlüyü | 206 | 206 | Bağlandı 2026-10-23 — başlıq Lora-ya keçirildi (self-host), 36px (kit `text-4xl` 44 idi), mətn eni 404; 16px artıq `.cms-content p` margin-i idi (`m-0!`). Mobil 342×120 ✓ |
| Tarix | hamısı | Vurğulu marker halqaları | `#4BC7B5` | Token rənginin 20% / 40%-i | Qəbul (R11) |
| Tarix | hamısı | Hero naxışı | Fon naxışı | Yalnız gradient | Qəbul — naxış SVG exportuna düşmür |
| Bio | 1728 | Başlıq kartı hündürlüyü | 272 | 275 | Qəbul (±3, şrift sətir hündürlüyü) |
| Bio | 1728 | Bölmə başlığı → mətn | 24 | 16 | Açıq — `cms-content.css` qatsızdır, utility ilə dəyişmir. Lazım olsa `cms-content.css`-ə bio qaydası |

## Real məzmunla yoxlanılmayanlar (⛔ redaktor)

Tarix kartları, məqsədlər qutusu, funksiyalar accordion-u, missiya banneri və timeline yalnız
kontrakt nümunəsi ilə (jsdom testləri + müvəqqəti önizləmə route-u, commit olunmayıb)
yoxlanılıb. Test API-də "(Kopya)" səhifələri hələ formaya salınmayıb. "Struktur bölmələr"
səhifəsinin sxemi və əsasnamələri test API-də boşdur (`struktur-bolmeler`, `-copy`: content 0,
assets 0), ona görə orada yalnız şöbə siyahısı göstərilir.

Redaktor doldurandan sonra: quickstart §3 (roundtrip, T045) və bu cədvəlin "kontrakt nümunəsi"
sətirləri real səhifələrdə təkrar ölçülür.

## Roundtrip sübutu (T045, research R15)

**Kontrakt nümunəsi ilə — edildi (2026-10-15).** `contracts/cms-markup.md` §6 nümunəsi
(`aboutContractHtml`) admin panelin `buildExtensions()` ilə TipTap-dan keçirildi (müvəqqəti
test, commit olunmayıb, silinib). Nəticə:

- TipTap çıxışı ikinci keçiddə dəyişmir (sabitdir).
- Çıxışın düz mətni girişlə eynidir — heç nə atılmır.
- Çıxış `parseAbout`-dan keçəndə bloklar girişlə eynidir (növ və elementlərin sayı):
  - about-main: `html, date-cards, highlight, html, accordion-group, html`
  - history: `history-hero, timeline, html`
  - mission: `mission, values`

**Real "(Kopya)" səhifələri ilə — ⛔ bloklanıb.** Redaktor səhifələri formaya salandan sonra:
`npm run roundtrip -- "Haqqımızda (Kopya)" "Tarix (Kopya)" "Missiya və dəyərlər (Kopya)"`.

## UI kit yoxlaması (T048, `ui-kit-review`)

Əhatə: 024-ün dəyişdirdiyi 41 mənbə faylı (`git diff dc8c2c6`, testlər və fikstürlər xaric).

| Növ | Say | Qeyd |
|---|---|---|
| Əl ilə yazılmış kontrol (`<button>`, `<input>`, `aria-expanded`) | 0 | Paylaşma və çap kit `IconButton`-dur |
| Literal / palitra rəngi | 0 | 4 hex yalnız şərhlərdə Figma istinadı kimidir |
| Barrel import, ikinci kitabxana | 0 | |
| `!important` | 2, qəsdən | `BreadcrumbItem` `px-0!` — kitin `px-4`-ü `group-data` variantıdır, adi utility onu üstələmir. `globals.css` çap qaydası `display: none !important` |
| Client sərhədi | 0 | `attachments.tsx` kit `Accordion`-u 024-dən əvvəl də import edirdi, build keçir |
| Yeni dependency | 0 | `package.json` və lockfile dəyişməyib |

## Quickstart §5 (2026-10-15)

| Yoxlama | Nəticə |
|---|---|
| Üfüqi sürüşmə, 12 səhifə × 390 / 744 / 1024 / 1280 / 1728 / 1920 | Yoxdur |
| Üfüqi sürüşmə, 320 | `scrollWidth` 352 **bütün** səhifələrdə, o cümlədən `/az` və `/az/statistics`. Daşan element `main`-dən kənardadır (022 shell-i). 024 deyil, 022 mərhələ 5-in açıq işidir |
| Hər səhifədə bir H1 | Bəli (12 səhifə × 7 en) |
| Klaviatura sırası (`/az/tarixi`, bio) | "Məzmuna keç" → header → breadcrumb → paylaşma (5) → bölmə menyusu → məzmun → footer |
| Çap | header, footer, alətlər (paylaşma, çap), bölmə menyusu gizlidir; breadcrumb və məzmun qalır. Accordion-un açıq çapı `globals.css` qaydası ilə təmin olunur, real səhifədə accordion olmadığı üçün brauzerdə yoxlanılmayıb |
| Server sorğuları | CMS səhifəsi: səhifə + ağac. Təşkilat: bölmə siyahısı + ağac (əvvəlki kimi); "Struktur bölmələr" +1 (CMS intro, `Promise.all` ilə paralel, T039). Şöbə: siyahı + ağac (`cache()` metadata ilə bölüşür). Bio: əməkdaş + ağac |
| `notFound()` (`/az/organization/divisions/999999`) | "Səhifə tapılmadı" + `noindex`, amma dev-də HTTP 200. Staff və qalereya route-larında da eynidir — 024-dən deyil |
