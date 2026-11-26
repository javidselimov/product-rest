# diff_report_logic.md — köhnə sistemdə olub, yenidə olmayanlar

Müqayisə: [`old_businesslogic.md`](old_businesslogic.md) (köhnə, `product-host`, Yii2) ↔ [`new_business_logic.md`](new_business_logic.md) (yeni, `product-rest`, .NET + Next.js + React). Tarix: 2026-10-21.
Sync: `f542884` · 2026-10-21 · inkremental + işçi ağac · qismən: press-releases (spec 033) işçi ağac 2026-11-04, events (spec 034) işçi ağac 2026-11-04, multimedia (spec 035) işçi ağac 2026-11-05, pages (spec 044 maliyyə təşkilatları) işçi ağac 2026-11-13, pages (spec 045 memorandumlar) işçi ağac 2026-11-13, pages (spec 046 üzvlük) işçi ağac 2026-11-16, pages + navigation (spec 047 maliyyə savadlılığı) işçi ağac 2026-11-16, pages + navigation (spec 050 istehlakçı hüquqları) işçi ağac 2026-11-17, pages + navigation (spec 051 sual-cavab) işçi ağac 2026-11-17, pages + admin (spec 052 aylıq hesabatlar) işçi ağac 2026-11-18, pages + navigation + admin (spec 053 FinCERT) işçi ağac 2026-11-19, pages + media (spec 054 nəşrlər və tədqiqatlar, media ölçüsü) işçi ağac 2026-11-20, navigation (spec 056 header: "Maliyyə sabitliyi", hamburger paneli) işçi ağac 2026-11-23, homepage + navigation + data-model (spec 057 strategiya sənədləri) 2dd1929 2026-11-24, azir (spec 058 Excel importu) işçi ağac 2026-11-24, organization (spec 060 struktur sxemi) işçi ağac 2026-11-26

**Metod:** iki sənəd bölmə-bölmə tutuşdurulub; dəyişən modullarda ❓ maddələr kodda yoxlanılıb (2026-10-01: ana səhifə; 2026-10-08: AZIR, təhlükəsizlik, media, data modeli; 2026-10-20: valyuta məzənnələri; 2026-10-21: RBAC, ana səhifə redizaynı, "Haqqımızda"/təşkilat, naviqasiya və keş, gəlirlilik əyrisi; 2026-11-20: spec 054 — səhifə ağacı, media ölçüsü; 2026-11-24: spec 057 — ana səhifənin strategiya bloku, /pages/strategy; 2026-11-24: AZIR — spec 058 Excel importu, TFAI). Qalan ❓-lar hələ yalnız sənədlərə əsaslanır.

**İşarələr:**

| İşarə | Mənası |
|---|---|
| ❌ | yeni sistemdə **yoxdur** (yeni sənəd açıq şəkildə "yoxdur" deyir və ya funksiya tamamilə çatışmır) |
| ⚠️ | **qismən** var və ya fərqli/zəif formada |
| ❓ | yeni sənəddə **qeyd olunmayıb** — kodda yoxlamaq lazımdır |

**Prioritet:** K — kritik (xarici sistemlər, hüquqi/maliyyə dəqiqliyi, təhlükəsizlik), Y — yüksək (əsas biznes funksiyası), O — orta, A — aşağı.

Sənədin sonunda (§11) köhnə sənədin "Yeni sistemdə mütləq qorunmalı qaydalar" siyahısının maddə-maddə statusu var.

---

## Mündəricat

1. [Xülasə — ən vacib boşluqlar](#1-xülasə--ən-vacib-boşluqlar)
2. [Məlumat daxilolma kanalları](#2-məlumat-daxilolma-kanalları)
3. [Ümumi qaydalar](#3-ümumi-qaydalar)
4. [Maliyyə və statistika](#4-maliyyə-və-statistika)
5. [Kontent modulları](#5-kontent-modulları)
6. [Naviqasiya, axtarış, paylaşma, SEO](#6-naviqasiya-axtarış-paylaşma-seo)
7. [Admin panel və iş axınları](#7-admin-panel-və-iş-axınları)
8. [Təhlükəsizlik](#8-təhlükəsizlik)
9. [Data modeli](#9-data-modeli)
10. [Xarici inteqrasiyalar](#10-xarici-inteqrasiyalar)
11. [Köhnə §11 "mütləq qorunmalı qaydalar" — status](#11-köhnə-11-mütləq-qorunmalı-qaydalar--status)

---

## 1. Xülasə — ən vacib boşluqlar

| # | Prio | Nə çatışmır | Kimə təsir edir |
|---|---|---|---|
| 1 | K | **Məzənnədə əvvəlki iş gününə fallback yoxdur** (JSON və XML) — həftəsonu/bayram boş cədvəl və ya 404 | banklar, ERP-lər, mühasiblər |
| 2 | K | **XML feed kontraktı natamamdır**: `Description` atributu, tarixdən asılı nominallar yoxdur, valyuta sırası legacy-dən fərqlidir; prod ilə müqayisə olunmayıb. "Bank metalları" bloku və `SDR` 2026-10-20-də əlavə olunub | xarici IT sistemləri |
| 3 | K | **BankInfo XML push API** (`POST /api/bank-info`) və `/bankinfonew/*.xml` sabit URL-ləri yoxdur — kontentdə 54 link bu fayllara baxır | CB daxili sistemi, ziyarətçilər |
| 4 | K | **Köhnə URL-lərdən 301 redirect yoxdur** (`/page-{id}/{slug}`, `/press-release-{id}`, `/law-{id}`, `?language=en`, `uploads.cbar.az/...`) — ~6000 köhnə link. Yalnız `/indeks/rates` → 308 var (2026-10-08) və ayrı-ayrı spec-lərdə tək səhifələr (məs. FAQ `page-131`, FinCERT `page-893`; 2026-11-24 spec 057: `/pages/strategy`, `page-872`, `page-878`, kökdəki iki strategiya PDF-i) | SEO, xarici linklər |
| 5 | K | **Login qoruması** qismən: hesab kilidi (5 → 15 dəq) və username üzrə limit var (2026-10-08); **CAPTCHA, IP üzrə limit, artan kilid, max 3 sessiya, UA binding yoxdur** | təhlükəsizlik |
| 6 | K | **MEAS_MANAGER məhdudiyyəti** API-də 2026-10-09-dan var (spec 008 RBAC), amma **runtime-da yoxlanılmayıb** və EF join mapping riski var (new §12 #34) — işləməsə admin olmayan redaktorlar bloklanır; panel yönləndirmir | təhlükəsizlik |
| 7 | K | **QRadar (SIEM) audit ötürməsi yoxdur**; uğursuz login audit-ə yazılmır | CB SIEM tələbi |
| 8 | Y | ✅ həll olunub 2026-11-24 — "Strategiya və sənədlər" bloku admin-dən idarə olunur (spec 057, §5.8), "Təqvim" spec 034-də, Gəlirlilik əyrisinin 3 Excel importu 2026-10-21-də (§4.5). Ana səhifədə mock blok qalmayıb; deploy-dan sonra üz qabıqları redaktor tərəfindən yüklənməlidir | ziyarətçilər, media |
| 9 | Y | **Maliyyə bazarı iştirakçılarının reyestri** (canlı `api-registry-public.e-cbar.az`, 15 kateqoriya, XLSX yükləmə) yoxdur | əhali, biznes, banklar |
| 10 | Y | **Rəqəmsal ödənişlər statistikası** (`statsDB`, ~27 qrafik × 2 səhifə) yoxdur | fintech, tədqiqatçılar |
| 11 | Y | **AZIR statistika blokunda "son 1 il min/max faiz" yoxdur** — səhifənin qalanı (həcm/say, `*`, 60 günlük filtr, Excel, LAST MIN/MAX) 2026-10-08-də həll olunub, §4.2 | banklar |
| 12 | Y | **Info lines tarixçəsi**: köhnədə alias üzrə tarixli seriya və `/infoblocks/<alias>?year=` səhifəsi; yenidə tarix sahəsi yoxdur, yalnız cari dəyər | banklar, analitiklər |
| 13 | Y | **Valyuta Excel export-u və dövr üzrə tarixçə** (`/currency/rates?export`, `/currency/custom`) yoxdur | mühasiblər |
| 14 | Y | **RSS feed** (`/rss/releases`) yoxdur | media, RSS oxucuları |

---

## 2. Məlumat daxilolma kanalları

Köhnədə 4 kanal var idi, yenidə 2 qalıb (əl ilə daxiletmə və Excel yükləmə).

| Kanal (köhnə) | Status | Prio | Qeyd |
|---|---|---|---|
| Redaktor formları | ✅ | — | |
| Redaktor Excel yükləyir (məzənnə, YC) | ✅ | Y | həll olunub — məzənnə bülleteni 2026-10-20-dən (§4.1), gəlirlilik əyrisinin 3 faylı 2026-10-21-dən (§4.5) xlsx ilə |
| Xarici sistem push edir (BankInfo) | ❌ | K | §10 |
| Sayt xarici mənbədən canlı oxuyur (reyestr, `statsDB`) | ❌ | Y | reyestr yalnız `seed_market_actors.py` ilə köhnə HTML dump-dan statik səhifə kimi köçürülür — canlı deyil |

---

## 3. Ümumi qaydalar

| Köhnə qayda | Status | Prio | Yenidə vəziyyət |
|---|---|---|---|
| **Dil fallback-i**: EN başlıq boşdursa AZ göstərilir | ❌ | O | yenidə tərcüməsi olmayan qeyd həmin dildə görünmür (yeganə istisna — səhifə fayl başlığı) |
| Asset dil qaydası: `filename_{lang}`, yoxdursa `filename_az`; EN-də `filename_en`-siz sənədlər gizlənir | ❌ | O | yenidə bir media, yalnız başlıq dilə görədir |
| **Dil üzrə ayrı fayllar** (`filename_az/en` — səhifə/press-reliz assetləri, bölmə/ofis əsasnamələri; `icon_az/en` — nəşrlər) | ⚠️ | O | yenidə assetdə tək `media_id`; nəşr ikonu da tək (`homepage_publications.media_id`, §5.8). Şəkilli popup-da şəkil dilə görə ayrıdır; press-reliz qoşmasının dili var (spec 033, `press_release_asset_details`), hər dil üçün ayrı sətir |
| **"Clean cache" düyməsi** — CMS dəyişikliyini dərhal göstərmək | ⚠️ | A | düymə/webhook yoxdur (spec 023 təxirə salınıb); əvəzinə Next keşi 2026-10-14-dən **10 san**, stale-while-revalidate, pod-başına (`web-cbar-new/src/server/cached.ts:60-65`) → dəyişiklik ~10 san + bir yeniləmədən sonra görünür; tag-lər var, `revalidateTag` çağıran kod yoxdur |
| **Şəkil resize** sahəyə görə (40…1920 px) | ❌ | O | yenidə resize/emal yoxdur, `width/height` doldurulmur — orijinal ölçüdə verilir |
| **Fayl dəyişəndə public URL eyni qalır** | ❌ | O | yenidə məzmuna görə ünvanlama — yeni fayl = yeni `media_id` = yeni URL; köhnə linklər əl ilə yenilənməlidir |
| CMS-dən kənar sabit fayllar (`compounded_term.pdf` admin-dən yüklənir, `methodology_for_azir*.pdf`, `2024_2026_*.pdf`) | ❌ | O | `compounded_term.pdf` yükləmə action-u yoxdur; sabit yollu PDF-lər qeyd olunmayıb |
| Qalereya və videoda `date <= bu gün` embargo | ❌ | A | yenidə videoda embargo yoxdur, qalereyada `event_date` yalnız sıralama |

Yenidə **daha yaxşı olanlar** (boşluq deyil, məlumat üçün): real 404, dil URL-də, detal səhifələrində embargo, soft delete, audit log.

---

## 4. Maliyyə və statistika

### 4.1 Rəsmi valyuta məzənnələri

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| ~63 valyuta, o cümlədən **qiymətli metallar** (XAU, XAG, XPT, XPD), **SDR**, ləğv olunmuşlar (EEK, LVL, LTL) | ⚠️ | K | qismən həll olunub 2026-10-20 — migration `0010` ilə **42** kod: bugünkü bülletenin hamısı, SDR (`SDR` kodu ilə) və 4 metal daxil. Bülletendə olmayan 21 legacy kodu (ARS, BGN, BRL, ZAR, CLP, DZD, IDR, IRR, IQD, LBP, MYR, MXN, MAD, EGP, NGN, TJS, THB, TWD, VND, EEK, LVL, LTL) yoxdur — köhnə tarixlərin arxivi üçün lazımdır. Yeni valyuta hələ də **admin-dən əlavə olunmur** (yalnız DB) |
| **`getCurrencyByDate`**: D tarixində qüvvədə olan (≤ D ən son) məzənnə — həftəsonu/bayram üçün əvvəlki iş günü | ❌ | K | verilmiş tarixdə məzənnə yoxdursa JSON `200 + []`, XML `404`; default tarix `MAX(rate_date)` gələcəkdə ola bilər |
| **Excel import** xlsx `B7:G100` (B = ISO kod, G = məzənnə, `round 4`), `XDR` → `sdr` | ✅ | Y | həll olunub 2026-10-20 — spec 025: `POST /currency-rates/import` (`api-cbar-admin/.../CurrencyRatesController.cs:97`, `Validation/RateBulletinReader.cs`), panel "Excel-dən yüklə". Eyni aralıq və yuvarlaqlaşdırma (PHP `round` kimi), `XDR` → `SDR`; əlavə olaraq: mövcud tarixə 409 təsdiqi, xətalı faylda heç nə yazılmır, audit |
| Günün sətrini **aktiv/deaktiv etmək** (yoxlama addımı, dərcdən əvvəl) | ❌ | O | saxlanan cədvəl dərhal public-dir; qaralama/aktivlik yoxdur |
| **Tarixdən asılı nominal etiketləri** (`byn100` < 01.07.2016, `tmt100`, denominasiyadan əvvəl `1irr/1uzs/1lbp/1jpy`, 18.11.2024-dən əvvəl `2kzt` və s.) | ❌ | K | `Name = "{Nominal} {az adı}"` — hazırkı nominal bütün tarixlərə tətbiq olunur; köhnə tarixlər üçün səhv etiket |
| HTML-də `XDR`, XML-də `SDR` | ⚠️ | O | SDR 2026-10-20-dən var, kodu hər yerdə `SDR` — XML legacy ilə eynidir, public cədvəl isə `XDR` əvəzinə `SDR` göstərir |
| **Trend oxu** (↑/↓/dəyişməyib) `/currency/rates` cədvəlində | ⚠️ | A | yalnız ana səhifə kartında (D-1…D-5 müqayisəsi); `/currencies` səhifəsində qeyd olunmayıb ❓ |
| **Excel export** `/currency/rates?export=true` (`Code`, `Rate`, `AZN-Currencies - dd.mm.yyyy.xlsx`) | ❌ | Y | |
| **`/currency/custom`** — bir valyutanın dövr üzrə tarixçəsi + Excel (mühasiblər orta məzənnə üçün) | ❌ | Y | public API-də tarix aralığı endpoint-i də yoxdur |
| `/currency/today` — bugünkü XML proxy | ❌ | A | |
| 4 qeyd paraqrafı (`AZN-Currency-Note-*`) | ❓ | A | |

**XML feed (`/currencies/DD.MM.YYYY.xml`) fərqləri:**

| Köhnə davranış | Yenidə |
|---|---|
| `<ValType Type="Bank metalları">` bloku, sabit sıra XPD/XPT/XAG/XAU, `Nominal = 1 t.u.` | ✅ həll olunub 2026-10-20 — eyni sıra və format, "Xarici valyutalar"-dan əvvəl; metal yoxdursa blok yoxdur (`api-cbar/.../CurrenciesController.cs:77-99`) |
| `ValCurs` elementində `Description="...bülleteni"` atributu | ❌ yoxdur |
| `SDR` kodu | ✅ həll olunub 2026-10-20 — `Code="SDR"` |
| Tarixdən asılı nominal/ad | ❌ |
| Həftəsonu → əvvəlki iş gününün məzənnəsi | ❌ 404 |
| `Value` DB-dəki xam dəyər | ⚠️ yenidə həmişə 4 onluq formatlanır — xam dəyərlə eyni olub-olmadığı yoxlanmalıdır |
| Səhv tarix → ana səhifəyə redirect | ⚠️ yenidə 400 — HTTP davranışı dəyişib; müştəri sistemlərinin buna reaksiyası bilinmir |

### 4.2 AZIR

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **Əqd həcmi** (`eqd_hecm_az/en`), **USD ekvivalenti** (`eqd_hecm_usd`), **əqd sayı** (`eqd_say_az/en`) | ✅ | Y | həll olunub 2026-10-08 — `azir_index_value_details.deal_volume/deal_count` (miqrasiya 0008), admin upsert kartında; USD ekvivalenti saxlanmır, `GET /azir/summary`-də son həcmdən hesablanır (`api-cbar/.../StatsController.cs:85-95`) |
| **`*` işarəsi** — indeks ehtiyat plan əsasında hesablanıb + footnote | ✅ | Y | həll olunub 2026-10-08 — `is_reserve_plan`; `/statistics/azir` cədvəlində və ana səhifə kartında `*` + footnote |
| **AZIR TFAI** — faizsiz indeks səviyyəsi | ❌ | O | saxlanmır və göstərilmir. 2026-11-24 (spec 058): Excel importu `AZIR TFAI` sətrini tanıyır, amma **bilərəkdən yazmır** (`api-cbar-admin/src/Cbar.AdminApi/Validation/AzirSheetReader.cs`, `skipped: tfai`) — `/statistics` qrafiki bütün term-ləri bir `%` oxunda çəkir (`web-cbar-new/src/features/stats/model/series.ts` `azirSeries`); admin term siyahısı `1D/30D/90D/180D` (`web-cbar-admin-new/src/features/azir/model/schemas.ts`). TFAI üçün əvvəl saytın qrafik süzgəci, sonra saxlama lazımdır (axtarılıb: `TFAI` — `web-cbar-new/src`) |
| **LAST MIN RATE / LAST MAX RATE** sətirləri | ✅ | O | həll olunub 2026-10-08 — ayrıca sətir yox, dəyərin detalında `min_rate/max_rate` (`min ≤ max`); statistika blokunda son 1D-dən |
| **15.05.2025 metodologiya xəbərdarlığı** qrafikdə | ✅ | O | həll olunub 2026-10-08 — `/statistics/azir` səhifəsinin başında xəbərdarlıq (`web-cbar-new/src/views/azir/index.tsx:50`); `/statistics` qrafikində yoxdur |
| `home_view` (ana səhifədə göstər), `date_view` (tarix bu sətirdən), "hamısını çıxar" | ❌ | O | ana səhifə kartı son tarixin bütün term-lərini avtomatik göstərir |
| **`show_before_day`** — "Əvvəlki günün indeksinə görə hesablanmışdır" qeydi | ❌ | O | |
| **`compounded_term.pdf` yükləmə** | ❌ | O | |
| **`/indeks/rates` səhifəsi**: default son 60 gün, `dateFrom/dateTo` filtri, 1D cədvəli (tarix, faiz, həcm, say), yalnız `faiz > 0` | ✅ | Y | həll olunub 2026-10-08 — `/{locale}/statistics/azir`; köhnə URL (`?language=`, `d/m/Y` tarixlər, `export=true`) 308 ilə yönləndirilir (`web-cbar-new/src/proxy.ts` `legacyRedirect`). Fərq: köhnədə boş `dateTo` ana səhifəyə redirect edirdi, yenidə bu gün götürülür; səhv aralıq default + xəbərdarlıq |
| **Statistika bloku**: son faiz, aylıq/illik dəyişmə, son 1 il min/max, son həcm + dəyişmə, həcm min/max, USD ekvivalenti | ⚠️ | Y | `GET /api/v1/azir/summary` — 11 göstərici var; **son 1 il üzrə min/max faiz yoxdur**. Aylıq/illik dəyişmə son dəyərin tarixinə görə hesablanır (köhnədə "əvvəlki ayın son dəyəri"); həcm min/max köhnə qüsurla eyni (keçən ilin 1 yanvarından) |
| **Excel export** (sheet `1D AZIR`) | ✅ | O | həll olunub 2026-10-08 — `/{locale}/statistics/azir/export`, eyni 4 sütun; ehtiyat plan günləri ikinci sheet-də |
| Ana səhifə kartında metodologiya PDF-ləri düymələri | ❌ | A | kartda yalnız `/statistics/azir` düyməsi (`widgets/home-cards/money-market-card.tsx:78`); axtarılıb: `methodology`, `compounded` |

Yaxşılaşma: indeks növü yenidə ayrıca `term` sahəsindədir (köhnədə başlıq mətnindən tanınırdı); dəyərlər validasiya olunur (diapazon, onluq sayı, `min ≤ max`). 2026-11-24 (spec 058): köhnədə redaktor bankın Excel faylındakı ~7 sətri admin formasına əl ilə köçürürdü (az/en ayrı mətn sahələri, INSERT-də sütun yerdəyişməsi — `old` §10 #3); yenidə fayl birbaşa yüklənir (`POST /api/v1/azir/import`): sətirlər ada görə tanınır, faiz × 100 köhnə yuvarlaqlaşdırma ilə, `*` → ehtiyat plan, `LAST MIN/MAX RATE` → 1D-nin min/max-ı, mövcud tarix təsdiqlə əvəzlənir, bütöv tranzaksiya, audit (`new` §4.2). `30D/90D/180D` indi paneldən də daxil edilə bilir (əvvəl select `1D/1W/1M` idi və ana səhifənin bu qutuları boş qalırdı). Açıq: həcmin vahidi real faylla təsdiqlənməyib (`new` §12 #56).

### 4.3 İnformativ bloklar (info lines)

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **Tarixli seriya**: hər alias üçün `(date, value)` tarixçəsi | ❌ | Y | `info_lines (alias, year, title, value)` — tarix yoxdur, tarixçə saxlanmır; public cavabda yalnız son redaktə anı `updatedAt` var (`api-cbar/.../HomepageController.cs:85`) |
| Göstəricinin tarixi (qərar/hesabat tarixi) | ⚠️ | O | faiz dəhlizi kartında tarix = son redaktə anı (`web-cbar-new/src/views/home/loader.ts:215`); Monetar panelində tarix yoxdur (`widgets/home-cards/statistics-panels.tsx:108-112`) |
| **`/infoblocks/<alias>?year=`** — ilin bütün dəyərləri | ❌ | Y | |
| **Dedup qaydası** (01.08.2023-dən sonra yalnız dəyişən dəyərlər) | ❌ | O | |
| Başlıqda Azərbaycan sıra şəkilçisi ("2024-cü il") | ❌ | A | |
| Yeni alias DB-dən əlavə olunur, admin menyusu dinamikdir | ⚠️ | O | yenidə 13 sabit alias admin kodundadır — yeni göstərici = kod dəyişikliyi |
| **`show_7gunluk`** — 7 günlük CB notunu göstər/gizlət toggle | ❌ | O | |
| **CB notları qrafiki** (`/home/money-market-chart`, 4/5 nöqtə) | ⚠️ | O | ana səhifə "Mərkəzi Bankın notları" tabı: `nots_volume` + `nots_levels_28/84/168/252` rəqəm qutuları; qrafik yoxdur (`web-cbar-new/src/widgets/home-cards/statistics-panels.tsx:127-160`) |
| Ana səhifə kartlarından `/infoblocks/<alias>` linkləri | ❌ | O | hədəf səhifə yoxdur; bütün "Daha ətraflı" keçidləri `/statistics`-ə (`statistics-panels.tsx:115,139,174`) |
| Depozit hərracları (`deposit_*`) | ❌ | A | yoxdur (axtarılıb: `deposit` — `web-cbar-new/src`); köhnədə də ana səhifədə şərhdə idi |

### 4.4 Aylıq inflyasiya

Əsasən var (yenidə hətta yaxşılaşıb — seriya DB-dən, köhnədə JS-də hardcoded).

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| Ana səhifədə **növbəti yeniləmə tarixi** | ❌ | O | göstərilmir; `nextUpdateDate` səhvən "İllik inflyasiya"nın ayı kimi işlənir (`web-cbar-new/src/views/home/loader.ts:236-241`) |
| Ana səhifədə aylıq inflyasiya qrafiki | ⚠️ | A | spec 022 ilə ana səhifədən çıxıb (`widgets/home-cards/inflation-card.tsx:5-6`); seriya yalnız `/statistics`-də |

### 4.5 Gəlirlilik əyrisi

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **3 Excel importu** (yields B/C; params A–D; periods C2–C8) | ✅ | Y | həll olunub 2026-10-21 — 3 ayrı bölmə, hər biri öz `.xlsx`-i ilə, eyni xanalar (`api-cbar-admin/.../Controllers/YieldCurvesController.cs`, panel `web-cbar-admin-new/src/pages/yield-curves/index.tsx`). Köhnədən fərq: hər import tranzaksiyadır və bütün yoxlamalar yazmadan əvvəldir; mövcud tarix `overwrite` təsdiqi istəyir |
| **`yield_curve_periods`** — 7 standart müddət (3 ay…4 il) ayrıca cədvəl və "Yields %" cədvəli | ⚠️ | O | cədvəl həll olunub 2026-10-21 — `yc_periods` (miqrasiya `0011`), admin importu və public API-də `periods`; saytda **"Yields %" cədvəli hələ göstərilmir** (`web-cbar-new`-də `periods` istifadə olunmur — axtarılıb) |
| **Datepicker-də yalnız məlumatı olan günlər** | ❌ | O | public API-də tarixlərin siyahısı endpoint-i yoxdur (yalnız `latest` və `{date}`; `api-cbar/.../StatsController.cs`) |
| **Çox tarixin əyrilərini üst-üstə müqayisə** | ❌ | O | |
| **"Download data"** — tarixçə xlsx | ❌ | O | `web-cbar-new`-də yalnız AZIR export-u var (`app/[locale]/(content)/statistics/azir/export/route.ts`) |
| Metodologiya PDF-i dilə görə | ❓ | A | |

### 4.6 Rəqəmsal ödənişlər statistikası — ❌ tamamilə yoxdur (Y)

- İkinci baza `statsDB` (`mb_ovs_v01` yarımillik, `mb_ovs_v02` aylıq).
- `/pages/stats-monthly`, `/pages/stats-yearly` — hər birində ~27 ApexCharts qrafiki, 3 accordion.
- JSON endpoint-lər `first/second/third/<id>-<limit>` (seriya, iki seriya, pie).
- AZİPS, XÖHKS, AÖS, elektron bankçılıq, kartlar, POS, ATM göstəriciləri.

### 4.7 Maliyyə bazarı iştirakçılarının reyestri — ❌ yoxdur (Y)

- `/registry` — 15 kateqoriya (banklar, BOKT, kredit ittifaqları, investisiya şirkətləri, birjalar, klirinq, depozitarlar, fondlar, sığortaçılar, vasitəçilər, aktuarilər, poçt operatoru, valyuta mübadilə məntəqələri və s.).
- `/registry/detail?category=` — canlı `api-registry-public.e-cbar.az/api/OutToPublic/*`, `download=1` → XLSX.
- `/registry/download` — 6 əlavə siyahı.
- Yenidə yalnız `seed_market_actors.py` köhnə HTML dump-ını statik səhifə məzmunu kimi köçürür — **məlumat yenilənmir**.

### 4.8 BankInfo XML push API — ❌ yoxdur (K)

- `POST <admin-host>/api/bank-info`, Bearer token (366 gün), `xmlFiles[]` ≤ 3 fayl × 3 MB.
- Fayllar orijinal adla `/bankinfonew/` altına: `banks.xml`, `headoffices.xml`, `updatehistory.xml`, `NBPSP_headoffices.xml`.
- Kontentdə 54 link bu URL-lərə baxır. Yenidə nə endpoint, nə sabit URL var; çağıran sistemin sahibləri ilə razılaşdırılmalıdır.

---

## 5. Kontent modulları

### 5.1 Səhifə ağacı

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **İki kök: TOP menyu və LEFT menyu** (hamburger / "Digər") | ⚠️ | O | tək ağac; header ≥ 1360-da ilk 9 bölmə (1024–1359-da 8) + "Bütün bölmələr" hamburgeri. 2026-11-23 (spec 056): kök bölmə "menyularda yox" ilə geniş hamburger panelindən çıxır — LEFT menyunun bir hissəsini əvəz edir, amma ayrıca ağac deyil. Köhnə saytda olmayan "Maliyyə sabitliyi" (köhnə "Dayanıqlı Maliyyə" onun altındadır) və "Rəqəmsal maliyyə ekosistemi" (boş səhifələr) Figma-dan gəlib |
| URL `/page-{id}/{slug}` (ID həlledicidir) | ❌ | K | yeni URL `/{locale}/{slug}`; köhnədən redirect yoxdur |
| HtmlPurifier iframe whitelist (YouTube, Vimeo, Google Maps) | ⚠️ | O | `EmbedFrame` `src` yoxlamır; CSP `frame-src` YouTube + `CSP_FRAME_SRC` — Vimeo/Maps konfiqurasiyadan asılıdır |
| Asset **`cover=1`** — səhifənin üz şəkli | ❌ | A | |
| Asset **`visible`** bayrağı | ❌ | A | |
| Yükləmə blokunda uzantı ikonu + fayl ölçüsü | ⚠️ | A | 2026-11-20 (spec 054): köçürülmüş qeydlərin saxta `size_bytes`-ı admin API-nin `MediaSizeBackfillService`-i ilə bir dəfə real ölçüyə düzəlir (new §8.1; deploy-dan sonra logda yoxlanmalıdır). Ölçü + növ nişanı göstərilir: "Struktur bölmələr" sətirləri (`web-cbar-new/src/widgets/attachments/attachments.tsx`), istehlakçı sənədləri və "Nəşrlər və tədqiqatlar" sənəd kartları (`widgets/about-blocks/document-card.tsx`). Qalır: digər səhifələrin ümumi fayl siyahısında ölçü yoxdur |
| Admin-də **"Copy URL"** (asset linkini mətnə yapışdırmaq) | ❌ | O | media kitabxanasında URL kopyalama yoxdur |
| **`#asset-N` shortcode** (şəkil → thumbnail/lightGallery, sənəd → yükləmə linki) | ❌ | Y | seed skriptləri köçürülən HTML-i `/media/{id}`-yə çevirir, amma runtime shortcode yoxdur — köçürülməmiş məzmunda linklər ölü qalır |
| **Xüsusi səhifələr** (hardcoded ID): `contacts` — Google Maps; 898 — yan menyusuz məxfilik; 877 — org-chart; 146–164 — 100 illik yubiley menyusu/banneri/2700px "ətraflı oxu" | ❌ | O | yenidə `FEATURE_ROUTES` slug xəritəsi + "Haqqımızda" layout reyestri (əsas/tarix/missiya slug-ları, `web-cbar-new/src/features/about-content/model/layouts.ts`); 877 org-chart həll olunub — kartlardan qurulan sxem `/organization?section=divisions`-də (§5.6, spec 027/060); `contacts` xəritəsi, 898 yan menyusuz səhifə, 146–164 yubiley davranışı yoxdur |
| **`/pages/strategy`** — Maliyyə sektoru strategiyası 2024–2026 (hədəflər cədvəli, PDF-lər, desktop iframe) | ✅ | O | həll olunub 2026-11-24 (spec 057) — CMS səhifəsi 104 (`maliyye-sektorunun-inkisaf-strategiyasi` / `financial-sector-development-strategy`): sədr müraciəti (portret, mətn, imza, dilin PDF linki) `tools/media-backfill/import-strategy-page.mjs` ilə səhifə mətninə köçür (new §6), redaktor onu adi səhifə kimi dəyişir; köhnə `/pages/strategy` və kökdəki iki PDF yönlənir (new §7). Qeyd: köhnə view-da (`visitor/views/pages/strategy.php`) `<table>` yoxdur — "hədəflər" mətndir. Fərq: **desktop PDF lightbox-u (iframe) ləğv edilib** — PDF brauzerin öz görüntüləyicisində açılır, saytın digər PDF-ləri kimi. ⚠️ Test/prod-da alət hələ işlədilməyib (spec 057 T053/T054) |
| "Beynəlxalq təşkilatlarla əməkdaşlıq" (səhifə `page-<id>`, yeni id 121) — təşkilatlar adi səhifə mətnidir (`<p><strong>Ad</strong></p>` + mətn + link), mətn səhifə axtarışında tapılır | ⚠️ | A | 2026-11-13 (spec 044): ayrıca məzmun növü `ifi_organizations` + üzvlük tarixləri, panel "Maliyyə təşkilatları", saytda accordion kartlar (new §5.1a); təşkilatlar varsa köhnə siyahı saytda kəsilir. Qalır: **təşkilat mətnləri sayt axtarışında yoxdur** (`api-cbar` `SearchController`-də blok yoxdur) — axtarış hələ yalnız səhifənin CMS mətnini (köhnə siyahı daxil, redaktor silənə qədər) tapır; SECO kartı yaradılmayıb (Figma-da yoxdur), mətni CMS-də qalır |
| "Mərkəzi banklarla əməkdaşlıq" (səhifə `page-<id>`, yeni id 122) — dörd bankın (İsveçrə, Polşa, Türkiyə, Almaniya) axın mətni və sayt linkləri; memorandum siyahısı yoxdur | ⚠️ | A | 2026-11-13 (spec 045): yeni məzmun növü `memorandums`, panel "Memorandumlar", saytda giriş + çeşidlənən cədvəl (new §5.1b). **Köhnə bank mətnləri saytda göstərilmir** (memorandum olanda mətn ilk başlıq sətrindən kəsilir), CMS-də qalır; memorandumlar sayt axtarışında yoxdur; en adlar tərcümə qaralamasıdır |
| "Beynəlxalq təşkilatlarda üzvlük" — köhnə saytda **yoxdur** | ✅ | — | 2026-11-16 (spec 046): yeni CMS səhifəsi 554, mətnindəki cədvəldən üzvlük cədvəli (çeşidləmə ilə, new §5.1c); ayrıca məzmun növü və API yoxdur, Figma-dakı 14 sətir seed `0029` ilə; en adlar tərcümə qaralamasıdır |
| "Maliyyə savadlılığı" bölməsi — adi CMS səhifələri (`page-<id>`): Ümumi məlumat, Seminarlar/vebinarlar, Müsabiqələr, portal, Virtual Təhsil Platforması, məlumat-axtarış sistemi; mətn düz paraqraflardır, şəkillər səhifə faylları, sol menyuda altı bənd | ⚠️ | A | 2026-11-16 (spec 047): bölmə şablona keçib, kök və üç platforma səhifəsi Figma bloklarını redaktor işarələməsindən alır (new §5.1d); "Ümumi məlumat"ın mətni kökdədir, ünvanı köka yönlənir; seed `0030` mətni yalnız köhnə formadadırsa yazır. **Qəsdən fərq:** sol menyuda yalnız üç platforma bəndi (Ümumi məlumat, Seminarlar, Müsabiqələr gizlədilir, silinmir); en mətnin yeni hissələri tərcümə qaralamasıdır. Köhnə `page-<id>` ünvanlarından redirect yoxdur (§5.1 ümumi boşluq) |
| "İstehlakçıların və investorların hüquqları" bölməsi — adi CMS səhifələri (`page-<id>`, ümumi `pages/index.php`): şikayət indeksləri (il → ay akkordeonları, PDF linkləri), müraciət statistikası (kanal → il akkordeonlarında cədvəllər), infoqrafika, kapital bazarı, müraciət səhifələri; sol menyuda 16 bənd; "İnzibati işlərə baxan vəzifəli şəxslər" Media altında | ⚠️ | A | 2026-11-17 (spec 050): bölmə şablona keçib (new §5.1e). Bloklar eyni akkordeon/cədvəl mətnindən qurulur — köhnə saytın bütün faylları və cədvəlləri qalır (link sayı: Bank 32, Sığorta 45, İnfoqrafika 65). Bank və Sığorta bir səhifədə tabdır, statistika ilə infoqrafika bir səhifədədir; 88, 93, 96-nın ünvanları yönlənir. **Yeni:** son məlumat kartı, avtomatik qısa icmal, metodologiya (Figma mətni, seed `0031`), "İnformasiya sorğusu" bölməsi. **Qəsdən fərq:** sol menyuda yalnız 4 bənd (qalan 14 səhifə gizli, silinmir); 86 bu bölməyə köçüb (ünvanı eyni); bu səhifələrin altında ayrıca fayl siyahısı yoxdur. **Spec 052:** şikayət indekslərinin və infoqrafikanın ayları admin paneldə ayrıca bölmədədir ("Aylıq hesabatlar"), köçürmə `0035` bütün media linklərini köçürür (Sığortanın en-dəki 2 xarici `uploads.cbar.az` linki istisna — köhnə sayt onları göstərirdi, yeni sayt spec 050-dən göstərmir); başlıq seriya adı + dövrdür, köhnə əl ilə yazılmış link mətni yox. Açıq: "966 Qaydaları" PDF-i yoxdur; "Mərkəzi Banka müraciət imkanları" hub-ı qurulmayıb; köhnə `page-<id>` ünvanlarından redirect yoxdur (§5.1 ümumi boşluq) |
| "Sual − cavab" — adi CMS səhifəsi (`page-<id>`, slug `sual-cavab`): 8 mövzu altında 226 sual əl ilə yazılmış HTML siyahısıdır (`<ol>` + qalın sual, nömrələr mətndə), bir YouTube videosu və "Playlist-ə keçid" linki; mətn səhifə axtarışında tapılır | ⚠️ | A | 2026-11-17 (spec 051): ayrıca məzmun növü — mövzu, sual, video (new §5.1f), panel "Sual-cavab" (sıra sürüşdür-burax ilə, nömrə sıradan); saytda mövzu kartları, mövzunun ayrıca görünüşü (`?topic=`), sual + cavab mətnində axtarış, hər sualın linki (`#sual-<id>`), bağlı səhifələrdə keçid kartı. Seed `0033` köhnə səhifənin bütün 226 sualını köçürür (say mövzu-mövzu yoxlanıb). Köhnə `page-131` ünvanı yönlənir (id canlı bazada yoxlanmayıb). **Qəsdən fərq:** "Playlist-ə keçid" linki yoxdur (eyni videoya aparırdı). Açıq: **en suallar yoxdur** (tərcümə təxirə salınıb; en səhifə öz CMS mətnini göstərir); suallar **sayt axtarışında yoxdur** — axtarış yalnız səhifənin köhnə CMS mətnini (redaktor silənə qədər) tapır |
| "FinCERT" — adi CMS səhifəsi (`page-893/fincert`): missiya, dörd istiqamət (bir bəndli `<ol>` / `h3` başlıqlar), e-poçt, telefon, portal linki və dil üzrə RFC-2350 PDF linki (`uploads.cbar.az`) bir HTML mətnində; mətn səhifə axtarışında tapılır | ⚠️ | A | 2026-11-19 (spec 053): ayrıca məzmun növü (new §5.1h) — panel "FinCERT" (Ümumi forması, istiqamətlər və üzvlüklər siyahıları, sıra dialoqu); saytda Figma dizaynı: missiya, nömrəli akkordionlar, əlaqə, portal, RFC-2350 və üzvlük kartları, sabit ankerlər. Seed `0037` köhnə az/en mətnin bütün bəndlərini köçürür (istiqamət sayı və hər istiqamətin siyahı bəndləri baza xətti ilə tutuşdurulub, itən bənd 0). Köhnə `page-893` ünvanı yönlənir. **Yeni:** "Beynəlxalq əməkdaşlıq" bloku (FIRST). **Qəsdən fərq:** Figma-dakı gizli "Bu səhifədə" bloku qurulmayıb. Açıq: köhnə RFC PDF-ləri media kitabxanasında yoxdur — seed köhnə linki saxlayır, redaktor yükləyənə qədər kart köhnə sayta aparır; FIRST loqosu və en FIRST mətni redaktor işidir; FinCERT **sayt axtarışında yoxdur** |
| "Nəşrlər və tədqiqatlar" bölməsi — adi CMS səhifələri (`page-<id>`), düz siyahı; işçi məqalələri `page-895` altında əl ilə yazılmış link siyahısı + hər məqalənin öz səhifəsi (`page-<id>/<slug>`, `?language=en`); illik hesabat və il arxivləri il → PDF akkordionları, fayl ölçüsü yazılı ("1.91 MB"); mətnlər səhifə axtarışında tapılır | ⚠️ | A | 2026-11-20 (spec 054, new §5.1i): bölmə şablona keçib, seed `0041` Figma ağacını qurur (iki qrup, istehlakçı bölməsindən iki səhifə, köhnə səhifələr menyudan çıxır, silinmir); il arxivi/tək sənəd görünüşü mətnin formasından; işçi məqalələri ayrıca məzmun növü (panel "İşçi məqalələri", siyahı + axtarış + il + detal). Yeni: menyu yeri ("yalnız açılan menyularda") və menyu qrupu (göstərilmir, spec 055). **Qalır (US6 təxirə salınıb):** köhnə ~78 məqalə köçürülməyib — prod-da siyahı köhnə CMS mətnini göstərir; köhnə `page-895/*` məqalə ünvanları yeni detala yönlənmir; işçi məqalələri sayt axtarışında yoxdur |

### 5.2 Press-relizlər və elanlar

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **Tarix filtri** `dateFrom/dateTo` (default cari ayın 1-i) | ❌ | O | yalnız `type` və `page` |
| Asset **başlığı** (`title/title_en`) və **sırası** | ❌ | O | "fayl əlavə/sil (başlıqsız, sırasız)" |
| Asset dil üzrə ayrı fayl (`filename_az/en`) | ✅ | — | spec 033: bir qoşmada iki fayl yox, qoşmanın dili var (`az`, `en`, hər ikisi) |
| **Sorğu (poll)**: relizə 1–5 ballıq rəy sualı, baxış sayğacı, cavablar ekranı | ❌ | O | cədvəllər (`press_release_questions/votes`) var, API və UI yoxdur |
| URL `/press-release-{id}/{slug}` | ❌ | K | redirect yoxdur |
| `id DESC` tiebreak | ❌ | A | yenidə tiebreak yoxdur — səhifələr arası "atlama" |

### 5.3 Qanunvericilik bazası

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **8 növ**: Konstitusiya, Konstitusiya Qanunu, Qanun, Fərman, Sərəncam, Qərar, Qətnamə, digər orqanların aktları | ⚠️ | Y | yalnız 2 tip (1 = qanun, 2 = normativ akt) |
| **Açar söz axtarışı** — `searchType=1` başlıqda, `=2` **tam mətndə** (az+en, ILIKE) | ❌ | Y | `/laws`-da yalnız kateqoriya və tip select-ləri; qlobal axtarış qanunlarda yalnız başlığa baxır |
| **Qüvvədədir / qüvvədən düşüb** statusu | ❌ | O | `status` iş axını statusudur, hüquqi qüvvə anlayışı yoxdur |
| URL `/law-{id}/{slug}` | ❌ | K | redirect yoxdur |

### 5.4 MEAS / ESİD

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **Sənəd növü** `doc_type_id` (1 = İstiqraz, 2 = Səhm) | ❌ | Y | sahə yoxdur |
| Public filtrlər: **sənəd növü, DQN (dəqiq), `reg_date` aralığı** | ❌ | Y | public-də yalnız emitent və məlumat növü |
| **Yalnız PDF** məhdudiyyəti | ❌ | O | media istənilən icazəli uzantını qəbul edir |
| **MEAS_MANAGER yalnız MEAS-ı idarə edir**, login-dən sonra MEAS-a yönləndirilir | ⚠️ | K | API səviyyəsində həll olunub 2026-10-09 (§8); yönləndirmə yoxdur |
| Header-də MEAS dropdown + "Haqqında" (səhifə 182) | ❓ | A | |

### 5.5 Milli pul nişanları

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **`video_url`** və detal səhifəsində **Video tabı** | ❌ | O | |
| Kateqoriya **təsviri** (`description_az/en`) səhifədə | ❓ | A | |
| Yan panel: "Maraqlı pullar" (129), "Azərbaycan manatı" (130), `bizimpullar.az` | ❓ | A | |

### 5.6 Təşkilat

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| Bölmələr: **rəhbərin adı, vəzifəsi, email-i**; **əsasnamə faylı** (`filename_az/en`) | ⚠️ | O | ayrıca sahə yoxdur (`name`, `description`); rəhbər təsvirdə `Direktor: Ad` sətri kimi yazılır və şöbə səhifəsində məlumat kartına çevrilir (`web-cbar-new/src/features/about-content/model/parse.ts:306-323`, `views/division/loader.ts`); email yalnız mətndə link kimi; əsasnamələr şöbə başına deyil, "Struktur bölmələr" CMS səhifəsinin faylları kimi ümumi siyahıdır (`views/organization/loader.ts:69-84`) |
| Ərazi idarələri: **rəhbərin adı, foto, əsasnamə faylı** | ❌ | O | ad, ünvan, telefon |
| **Org-chart** (`/structure`, səhifə 877; inline SVG) | ✅ | O | həll olunub 2026-11-26 — kartlardan qurulan kliklənən sxem (`new` §5.6a): spec 027 (`org_chart_nodes`, panel "Təşkilat → Struktur sxemi", planşet/mobil ağac), spec 060 (desktop Figma düzülüşü koordinatsız, ağacdan — `web-cbar-new/src/entities/org-chart/model/layout.ts`; blokun açılan departament siyahısı). Kadr dəyişikliyi paneldən, deploy və şəkil yükləmə tələb etmir; kart əməkdaşın/şöbənin səhifəsinə aparır. Kart yoxdursa köhnə CMS şəkli göstərilir. Qalır: kart mətnləri sayt axtarışında yoxdur (`api-cbar` `SearchController`-də sxem bloku yoxdur); Figma-da olmayan quruluş koda qayda tələb edir |

Sədrin xüsusi göstərilməsi yenidə "İdarə Heyətinin ilk üzvü" ayrıca böyük kart kimi var ✅ (`features/organization/model/schemas.ts:42-45`; köhnədə `position=1`, yenidə sort üzrə birinci). Şöbə səhifəsi (`/organization/divisions/[id]`) və bioqrafiya başlıq kartı köhnədə olmayan əlavələrdir.

### 5.7 Multimedia

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| Qalereya/video siyahılarında `date <= bu gün` embargo | ❌ | A | |
| Siyahıların səhifələnməsi | ✅ | O | həll olunub 2026-11-05 — `/media/galleries`, `/media/videos`, 9 kart/səhifə, səhifələmə filtrləri saxlayır (spec 035, `web-cbar-new/src/views/media-gallery-list/`). Əlavə: ad üzrə axtarış və tarix aralığı (köhnədə yox idi) |
| Video lightGallery-də saytın içində açılır | ✅ | A | həll olunub 2026-11-05 — `/media/videos/{id}` detal səhifəsi, klikdə `youtube-nocookie` iframe (`widgets/video-player`); əvvəl kart YouTube-a aparırdı |
| Foto albomunda `content_az/en`, `slug` | ❌ | A | yenidə yalnız başlıq, URL id ilədir (→ notdoneyet §2.2) |

### 5.8 Ana səhifə

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **Qaçan sətir** (təcili elanlar — saxta saytlar, iş rejimi) | ❌ | Y | API qaytarır, sayt **göstərmir** |
| Qaçan sətirdə **link** (`link_{lang}`) | ❌ | O | `runningLines: string[]` — yalnız mətn |
| Nəşrlərdə dil üzrə ayrı ikon | ❌ | A | ikon `homepage_publications.media_id`-dədir (əsas cədvəl, tərcümədə yox) — hər iki dildə eyni şəkil (`api-cbar-admin/db/migrations/0001-initial-schema.sql:721`); nəşrlər bloku ana səhifədə ümumiyyətlə gizlidir (`web-cbar-new/src/views/home/blocks.ts`) |
| 100 illik yubiley banneri → `coin.e-cbar.az` | ⚠️ | A | CMS bannerinin linki `coin.e-cbar.az`-dırsa və şəkli yoxdursa statik `/site/home/coin-banner.png` (`views/home/loader.ts:133-135`); amma promo yalnız `description`-lu bannerdən qurulur (`loader.ts:349`), admin isə `description` saxlamır (`api-cbar-admin/.../BannersController.cs:11`) — praktikada görünmür |
| **Nəşrlər** bloku (illik hesabat, pul siyasəti icmalı, maliyyə sabitliyi) | ❌ | O | API qaytarır, ana səhifədə gizli (`views/home/blocks.ts`) |
| **Faydalı linklər (bannerlər)**, domen göstərilir | ❌ | O | gizli; bannerlərdən yalnız `description`-lu biri promo olur |
| **Sürətli keçidlər** | ❌ | O | gizli (`blocks.ts`) |
| Son video | ❌ | A | video tabı gizli, sorğu göndərilmir |
| Son press-relizlər, qalereya | ✅ | — | Media tabları: xəbər `type 1`, elan `type 2`, qalereya — hər biri 4 (`loader.ts:164-170`) |
| Xəbər slayderində **tarix** | ⚠️ | A | slayder var (6 san), tarix göstərilmir (`widgets/hero-slider/hero-slider.tsx`) |
| Maliyyə blokları (məzənnə, dəhliz, inflyasiya, pul bazarı, notlar, gəlirlilik əyrisi, bank sektoru) | ✅ | — | birinci ekran kartları + "İcmal göstəricilər" tabları; fərqlər §4.3–§4.5-də |
| — (köhnədə yoxdur) "Strategiya və sənədlər", "Təqvim" | ✅ | — | həll olunub 2026-11-24 — Strategiya sənədləri admin-dən (`/homepage-blocks/strategy-docs`, spec 057): status, səhifə və ya dil üzrə ünvan, dil üzrə üz qabığı, sıra dialoqu, soft delete; sayt `/homepage`-in `strategyDocs`-undan ilk üçünü göstərir (new §6). `mock.ts` silinib. Təqvim tədbirlərdəndir (spec 034). Qalır: üz qabıqları deploy-dan sonra əl ilə yüklənir. (Əvvəlki "faiz dəhlizi qərarı tarixləri kodda yazılıb" qeydi köhnəlib: tarix indi info-line-ın son redaktə anıdır, `views/home/loader.ts:233` — new §12 #40) |
| **Sorğu popup-ı** (kodda sabit, hər ana səhifə açılışında, hər iki dildə) | ✅ | — | həll olunub 2026-10-01 — CMS-dən idarə olunan **şəkilli popup** (`image_popups`, admin `/image-popups`, public `GET /api/v1/image-popups`): hər dil üçün öz şəkli/linki, aktivlik toggle-ı. Fərq: saytın hər səhifəsində çıxır və bağlandıqdan sonra həmin səhifədə sessiya ərzində təkrar çıxmır (köhnədə hər açılışda); canlı yayım varsa ondan sonra gəlir. Tarix pəncərəsi yoxdur. |

### 5.9 Əks əlaqə formu — ❌ (A)

`/feedback` (ad, email, mövzu, mesaj, 24 saatda 1 müraciət, `mail@cbar.az`-a email). Köhnədə də forma yetim idi (footer `contact.e-cbar.az`-a baxırdı); yenidə "Onlayn müraciət" düyməsi var. Şüurlu olaraq buraxıla bilər — təsdiqlənməlidir.

---

## 6. Naviqasiya, axtarış, paylaşma, SEO

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **HTML sayt xəritəsi** `/home/sitemap` | ❌ | A | `sitemap.xml` də yoxdur; footer-də link yeri var, amma `href: null` — render olunmur (`web-cbar-new/src/shared/config/contacts.ts:96-97`) |
| Footer: məxfilik siyasəti linki (səhifə 898) | ❌ | A | hədəf səhifə yoxdur, `href: null` (`contacts.ts:96`) |
| **RSS** `/rss/releases[/{lang}[/{count}]]` (RSS 2.0) | ❌ | Y | açıq şəkildə yoxdur |
| Axtarışda **highlight** (`url#sorğu` → hədəf səhifədə söz işarələnir) | ❌ | A | |
| Axtarış nəticələrinin səhifələnməsi | ⚠️ | A | yenidə max 30 nəticə, səhifələmə yoxdur |
| **Share/print paneli** (mail, LinkedIn, Facebook, X, WhatsApp, çap) | ⚠️ | O | yalnız "Haqqımızda" şablonunda (CMS "Haqqımızda" səhifələri, təşkilat, şöbə, əməkdaş): Facebook, LinkedIn, WhatsApp, e-poçt, çap (`web-cbar-new/src/widgets/about-shell/share-buttons.tsx`); **X yoxdur**; valyuta, qanun, press-reliz detalında yoxdur |
| **OpenGraph** teqləri | ❌ | O | açıq şəkildə yoxdur |
| Veb analitika (GA, Yandex Metrika + webvisor) | ❌ | O | yoxdur (axtarılıb: `gtag|googletagmanager|metrika|analytics` — `web-cbar-new/src`); analitik cookie konstitusiya ilə qadağandır (`docs/cookies.md`) — qəsdən. GA UA köhnədə də işləmirdi |
| A+/A− şrift ölçüsü, scroll-to-top | ⚠️ | A | CERT.az əlçatanlıq vidceti əvəz edə bilər |
| Mobil menyuda qaynar xətt, MEAS dropdown, E-CBAR linki; header-də dilə görə loqo | ⚠️ | A | qaynar xətt 966 və E-CBAR mobil çekmecədə (`web-cbar-new/src/shell/mobile-nav.tsx`), dilə görə loqo (`shared/config/contacts.ts:132-134`) ✅; **MEAS dropdown yoxdur** — MEAS yalnız footer "Faydalı linklər"-də |
| Google Maps (`contacts`) | ❌ | A | |

---

## 7. Admin panel və iş axınları

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| MEAS_MANAGER login-dən sonra MEAS moduluna yönləndirilir, digər bölmələr 403 | ⚠️ | K | 403 hissəsi həll olunub 2026-10-09 — API hər action-da icazə tələb edir (`api-cbar-admin/.../Authorization/PermissionGuardFilter.cs`, matris `0009-rbac-permissions.sql:138-145`); login-dən sonra MEAS-a yönləndirmə yoxdur, menyu hamısını göstərir, panel `/me/permissions`-ı oxumur; runtime-da yoxlanılmayıb |
| MODERATOR — istifadəçilərdən başqa hər şey | ⚠️ | O | yenidə **daha sərt**, bilərəkdən (spec 008): moderator parametrləri (`settings.*`), alt ağac silməni, audit-i də edə bilmir (`0009:127-135`) |
| **Profil**: istifadəçi öz username/email/avatarını dəyişir; **öz parolunu** cari parolla dəyişir | ❌ | O | yalnız admin başqasının parolunu sıfırlaya bilər; username dəyişmək olmur |
| "Clean cache" | ❌ | O | §3 |
| Info göstəriciləri üçün tarix + dəyər daxiletmə, 7 günlük not toggle | ❌ | Y | §4.3 |
| AZIR `home_view`/`date_view`, `compounded_term.pdf` yeniləmə | ❌ | O | §4.2 |
| YC — 3 Excel ilə yükləmə | ❌ | Y | §4.5 |
| Gündəlik məzənnə — xlsx yükləmə | ✅ | Y | həll olunub 2026-10-20 — §4.1 (spec 025) |
| Səhifə assetləri üçün "Copy URL" + `#asset-N` | ❌ | O | §5.1 |

Axtarış reindex addımı yenidə lazım deyil (canlı ILIKE) — boşluq sayılmır.

---

## 8. Təhlükəsizlik

| Köhnədə | Status | Prio | Yenidə |
|---|---|---|---|
| **CAPTCHA** — IP/email üzrə 2 uğursuz cəhddən sonra | ❌ | K | |
| **Rate limit** — IP 10/60 s, istifadəçi 10/120 s | ⚠️ | K | 2026-10-08: istifadəçi adı üzrə **10/120 s** var (429 + `Retry-After`, `LoginProtection.cs`), amma pod-başına yaddaşdadır; **IP üzrə limit yoxdur** |
| **Təsadüfi gecikmə** 0.3–0.8 s uğursuz cəhddə | ⚠️ | O | təsadüfi gecikmə yoxdur; əvəzinə naməlum istifadəçidə də BCrypt `DummyHash` ilə işləyir — vaxt istifadəçinin mövcudluğunu açmır (`PasswordHashing.cs`) |
| **Artan kilid** 5/10/15/20 → 60/180/300/900 s | ⚠️ | K | 2026-10-08: sabit kilid — 10 dəq ərzində 5 səhv → **15 dəq** (`AuthController.cs:98`), DB-də, bütün pod-lar üçün; artan pillələr yoxdur |
| Kilid anında bütün sessiyaların ləğvi | ⚠️ | O | refresh kilidli hesabı rədd edir (`RefreshTokenService.cs:92`), amma kilid security stamp-ı dəyişmir — mövcud access token ≤ 15 dəq işləyir |
| **Max 3 aktiv sessiya** istifadəçi başına | ❌ | O | refresh token ailələrinə limit qeyd olunmayıb |
| **User-Agent binding** | ❌ | O | `TODO(Phase 2)` "sessiya bağlama" |
| Yeni parol cari parolla eyni ola bilməz | ❓ | A | |
| **Rol əsaslı giriş** (MODERATOR istifadəçiləri idarə edə bilmir, MEAS_MANAGER yalnız MEAS) | ⚠️ | K | kod səviyyəsində həll olunub 2026-10-09 — 98 kodluq RBAC, default-deny (`api-cbar-admin/.../Authorization/PermissionMatrix.cs`, `UsersController.cs`, `0009-rbac-permissions.sql:127-145`). ⚠️ qalır: kod build/run olunmayıb (spec 008 T034), EF join mapping riski (`Cbar.Domain/CbarDbContext.cs:88-89` ↔ `0001:42-46`, new §12 #34), panel icazəni göstərmir |
| **QRadar audit** — LOGIN SUCCESS/FAILED, SIGN OUT, USER CREATED/UPDATED (diff), ENABLED/DISABLED, PROFILE EDIT; IP, UA, user sahələri | ❌ | K | `audit_log` DB-də var, QRadar-a ötürmə `TODO(Phase 2)`; **uğursuz login və kilid yalnız loglanır, audit-ə yazılmır**; audit log API var (`GET /audit-log`, yalnız admin), panel ekranı yoxdur; icazə rəddləri `authz.denied` kimi audit olunur |
| API token (BankInfo üçün, 366 gün) | ❌ | — | BankInfo ilə birlikdə |

Var olanlar: parol siyasəti ✅, parol sıfırlananda sessiyaların ləğvi ✅ (2026-10-08-dən access token-lər də dərhal — security stamp), 8 saat hərəkətsizlik limiti ✅, generik xəta mesajı ✅ (kilidli hesab da eyni 401 alır).

Yenidə **köhnədən yaxşı olanlar**: deaktivasiya/rol dəyişikliyi access token-i dərhal ləğv edir; son aktiv admini deaktiv etmək/endirmək mümkün deyil; yüklənən faylın məzmun imzası yoxlanılır, fayl adı bidi/idarəedici simvollardan təmizlənir; `/media/{id}` `nosniff` + sandbox CSP ilə verilir; hər admin action icazə tələb edir, bağlanmamış endpoint bağlı qalır (default-deny); 403-lər audit olunur; səhifə alt ağacını silmək ayrıca admin icazəsidir; yeni parametr açarı allowlist-lədir (2026-10-09).

---

## 9. Data modeli

Köhnədə olan, yenidə qarşılığı olmayan sahələr/cədvəllər:

| Köhnə | Yenidə | Prio |
|---|---|---|
| `currency_rates` metallar, SDR, ~51 əlavə valyuta | qismən — 42 valyuta (metallar və SDR daxil, migration `0010`, 2026-10-20); bülletendə olmayan 21 legacy kodu yoxdur | K |
| `currency_rates.active` (sətir səviyyəsində dərc) | yoxdur | O |
| `azir_indexses.eqd_hecm_*`, `eqd_say_*`, `home_view`, `date_view` | həcm/say/min-max/`*` → `azir_index_value_details` ✅ (2026-10-08); `eqd_hecm_usd` hesablanır; `home_view`, `date_view` yoxdur | O |
| `infolines.date` (tarixçə) | yoxdur (`year` var) | Y |
| `yield_curve_periods` | ✅ `yc_periods` (migration `0011`, 2026-10-21); saytda hələ göstərilmir (§4.5) | O |
| `settings_saf` (`show_before_day`, `show_7gunluk`) | yoxdur (ümumi `settings` jsonb var, bu açarlar istifadə olunmur) | O |
| `meas.doc_type_id` | yoxdur | Y |
| `laws.type` 1–8, `active` = qüvvədədir | tip 1–2 | Y |
| `money_marks.video_url` | yoxdur | O |
| `organization_divisions.director_*`, `filename_az/en` | yoxdur | O |
| `organization_offices.director_name`, `photo`, `filename_az/en` | yoxdur | O |
| `running_line.link_{lang}` | public-də ötürülmür | O |
| `pages_assets.cover`, `visible`, `filename_en` | yoxdur | A |
| `press_releases_assets` başlıq, sıra, `filename_en` | yoxdur | O |
| `press_reliz_question/statistics` | cədvəl var, istifadə olunmur | O |
| `statsDB` (`mb_ovs_v01/v02`) | yoxdur | Y |

---

## 10. Xarici inteqrasiyalar

| İnteqrasiya (köhnə) | Status | Prio |
|---|---|---|
| `api-registry-public.e-cbar.az` (reyestr, JSON + XLSX) | ❌ | Y |
| CB daxili sistemi → `/api/bank-info` (push) | ❌ | K |
| Bankların/ERP-lərin `/currencies/*.xml` idxalı | ⚠️ (endpoint var, kontrakt natamam — §4.1) | K |
| RSS oxucuları → `/rss/releases` | ❌ | Y |
| `statsDB` (ikinci baza) | ❌ | Y |
| SMTP → `mail@cbar.az` (feedback) | ❌ (Mailpit docker-da var, kodda istifadə olunmur) | A |
| QRadar (`/var/log/cbar_app`) | ❌ | K |
| Google Maps | ❌ | A |
| Google Analytics / Yandex Metrika | ❓ | O |
| `uploads.cbar.az` köhnə fayl URL-ləri | ❌ redirect/xəritələmə yoxdur | K |
| `coin.e-cbar.az`, `bizimpullar.az` linkləri | ⚠️ (kodda sabit link yoxdur — axtarılıb: `coin.e-cbar`, `bizimpullar`; CMS məzmunu/menyu ilə əlavə oluna bilər) | A |

`api-license-registry.e-cbar.az` (`MarketActorsController`) köhnədə də köhnəlmiş idi — boşluq sayılmır.

---

## 11. Köhnə §11 "mütləq qorunmalı qaydalar" — status

| # | Qayda | Status | Qeyd |
|---|---|---|---|
| 1 | Məzənnə: `date <= D` üzrə ən son (id-yə görə yox), 4 onluq | ⚠️ | 4 onluq ✅, id problemi yoxdur ✅; **`<= D` fallback yoxdur** ❌ |
| 2 | XML feed kontraktı (metallar, `SDR`, tarixə görə nominallar, əvvəlki iş günü) | ⚠️ | metallar bloku və `SDR` ✅ (2026-10-20); tarixə görə nominallar və əvvəlki iş günü ❌ |
| 3 | Excel import formatları (valyuta, YC × 3) | ⚠️ | valyuta ✅ (2026-10-20, spec 025); YC × 3 ❌ |
| 4 | AZIR: 60 gün, `faiz > 0`, `*`, TFAI, 15.05.2025, statistika; növ ayrıca sahədə | ⚠️ | 60 gün, `faiz > 0`, `*`, 15.05.2025, növ ✅ (2026-10-08); statistika ⚠️ (son 1 il min/max faiz yoxdur); TFAI ❌ (2026-11-24: Excel importu onu tanıyır, bilərəkdən yazmır — `/statistics` qrafiki, §4.2) |
| 5 | Info lines: tarixçə, il seçimi, dedup | ❌ | |
| 6 | `show_7gunluk`, `show_before_day` | ❌ | |
| 7 | YC: məlumatlı tarixlər, çox tarix müqayisəsi, parametrlər, 7 müddət, Excel | ⚠️ | parametrlər ✅, qalanı ❌ |
| 8 | BankInfo API və `/bankinfonew/*.xml` | ❌ | |
| 9 | Menyu (TOP/LEFT), `visible` + `show_{lang}`, `url` override | ⚠️ | bayraqlar və `navUrl` ✅; TOP/LEFT ayrımı yoxdur |
| 10 | Press-reliz: tip 1/2, qaralama, embargo detal və RSS-də | ⚠️ | tip, qaralama, detal embargo ✅; RSS yoxdur |
| 11 | `#asset-N` və asset dil fallback-i | ❌ | |
| 12 | Qanun növləri 1–8, başlıq/mətn axtarışı, qüvvədə statusu | ❌ | |
| 13 | MEAS filtrləri (5 ədəd), yalnız PDF | ⚠️ | 2 filtr ✅, sənəd növü/DQN/tarix aralığı/PDF ❌ |
| 14 | Pul nişanı: təhlükəsizlik elementləri, ön/arxa şəkil, video | ⚠️ | video ❌ |
| 15 | Sədrin xüsusi göstərilməsi, qəbul günləri | ✅ | |
| 16 | Qaçan sətir (linklə), slayder, canlı yayım, dil üzrə nəşr ikonları | ⚠️ | slayder ✅, canlı yayım ✅; qaçan sətir göstərilmir ❌; dil üzrə nəşr ikonları ❌ |
| 17 | Köhnə URL-lərdən 301 redirect, ~6000 köhnə link | ❌ | yalnız `/indeks/rates` → 308 (2026-10-08) |
| 18 | MEAS_MANAGER yalnız MEAS | ⚠️ | API ✅ (MEAS + media yükləmə / öz faylını silmə, `0009-rbac-permissions.sql:138-145`, 2026-10-09); panel yönləndirməsi ❌; runtime yoxlanılmayıb |
| 19 | CAPTCHA, rate limit, artan kilid, gecikmə, 3 sessiya, UA binding, parol siyasəti, parol dəyişəndə sessiya ləğvi | ⚠️ | parol siyasəti və sessiya ləğvi ✅; username limiti və sabit kilid ⚠️ (2026-10-08); CAPTCHA, IP limiti, 3 sessiya, UA binding ❌ |
| 20 | QRadar audit | ❌ | |

**Cəmi:** 20 qaydadan 1-i tam (✅), 9-u qismən (⚠️), 10-u heç (❌) yerinə yetirilir.
