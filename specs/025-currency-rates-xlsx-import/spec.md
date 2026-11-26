# Feature Specification: Rəsmi məzənnə bülleteninin Excel faylından importu

**Feature Branch**: `025-currency-rates-xlsx-import`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Məzənnə Excel importu (köhnə cbar.az ilə eyni məntiq). Admin paneldə
(web-cbar-admin-new) redaktor tarix seçib "Resmi Mezenne DD MM YYYY.xlsx" formatında rəsmi məzənnə
bülleteni faylını yükləyir; api-cbar-admin faylın aktiv vərəqindən B7:G100 aralığını oxuyur: B
sütunu 3 hərfli ISO kod, G sütunu məzənnə (4 rəqəmə yuvarlaq), XDR kodu SDR kimi saxlanılır;
tanınmayan kodlar ötürülür; nominal (A sütunu) və faylın öz tarixi (C2) nəzərə alınmır, tarix
formadan gəlir. Nəticədə həmin tarix üçün məzənnələr yaradılır. Mövcud tarixin dəyərləri sonra
grid/edit ekranında əl ilə düzəldilə bilər (köhnədə olduğu kimi)."

**Legacy referans** (Maddə I — davranış mənbəyi, redaktə olunmur):

- `product-host/admin/behaviors/UploadCurrencyBehavior.php` — import məntiqi (`B7:G100`, `round 4`, `XDR → sdr`)
- `product-host/common/models/CurrencyRates.php` — fayl yalnız `add` ssenarisində məcburidir
- `product-host/admin/views/currency/add.php` — forma: tarix + xlsx faylı
- `product-host/admin/views/currency/edit.php` — mövcud tarixin hər valyutası əl ilə redaktə olunur

**Nümunə fayl**: repo kökündə `Resmi Mezenne 13 10 2026.xlsx` — bu spec-in **istinad formatıdır**.

**Əhatə olunan proyektlər**:

- `api-cbar-admin`: faylı qəbul edən və oxuyan import əməliyyatı (spec-first, `/api-endpoint`).
- `web-cbar-admin-new`: "Məzənnələr" ekranında fayl yükləmə axını.
- `api-cbar`: XML feed-də bank metalları legacy kimi ayrıca "Bank metalları" blokunda çıxır,
  "Xarici valyutalar" blokuna düşmür (plan R5; kontrakt formatı dəyişmir, Maddə VII.1).
- `web-cbar-new`: kod dəyişmir; yeni valyutalar public cədvəldə avtomatik görünür.

## Clarifications

### Session 2026-10-20

- Q: Master-də olmayan bülleten kodları? → A: 30 çatışmayan kod (SDR və 4 metal daxil) master-ə
  əlavə olunur (FR-010a); import özü master-ə yazmır.
- Q: Seçilmiş tarixdə artıq məzənnə var? → A: Təsdiqdən sonra fayldakı kodlar yenilənir, faylda
  olmayanlar toxunulmaz qalır.
- Q: Dərhal saxlama, yoxsa əvvəl baxış? → A: Dərhal saxlama (legacy kimi).

## Bülletenin formatı (istinad)

| Xana / aralıq | Məzmun | Import-da istifadəsi |
|---|---|---|
| `A1`–`A4` | Başlıq ("Azərbaycan Respublikasının Mərkəzi Bankı", "RƏSMİ MƏZƏNNƏLƏRİ BÜLLETENİ") | oxunmur |
| `C2` | Bülletenin tarixi (Excel tarix rəqəmi, məs. `46308` = 13.10.2026) | oxunmur (legacy kimi) |
| `A6`, `A47` | Bölmə başlıqları ("Xarici valyutalar", "Bank metalları") | B-də kod olmadığı üçün ötürülür |
| `A7:A100` | Nominal (`1`, `100`, `1 t.u.`) | oxunmur |
| `B7:B100` | 3 hərfli kod (`USD`, `EUR`, … `XDR`, `XAU`, `XAG`, `XPT`, `XPD`) | **açar** |
| `C`, `D` | Az adı, ikinci kod (`RUB` sətrində `RUR`) | oxunmur |
| `G7:G100` | Məzənnə (manatla, nominal üzrə) | **dəyər**, 4 rəqəmə yuvarlaqlaşdırılır |
| `B56`, `G56` | İmza ("Baş direktor", ad) | B-də 3 hərfli kod olmadığı üçün ötürülür |

Nümunə faylda 38 valyuta (`B7`–`B44`, `XDR` daxil) və 4 bank metalı (`B48`–`B51`) var, cəmi 42 kod.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Redaktor günün bülletenini fayl ilə yükləyir (Priority: P1)

Məzənnə hazırlayan redaktor "Məzənnələr" ekranında tarixi seçir, Mərkəzi Bankın gündəlik
bülletenini (xlsx) seçib yükləyir. Sistem fayldakı bütün tanınan valyutaların məzənnəsini həmin
tarix üçün yazır və redaktora nəticəni göstərir: neçə valyuta yazıldı, hansı kodlar tanınmadı.

**Why this priority**: Redaktorların gündəlik əsas işidir. Yeni stack-də hazırda ~42 rəqəmi əl
ilə köçürmək lazımdır — səhv riski yüksəkdir, köhnə saytda isə bu bir klikdir.

**Independent Test**: Nümunə faylı 13.10.2026 tarixi ilə yükləmək; sonra həmin tarixin vərəqini
açıb USD = 1.7000, EUR = 1.8992, XDR = 2.3005, XAU = 7133.2510 olduğunu görmək.

**Acceptance Scenarios**:

1. **Given** 13.10.2026 üçün məzənnə yoxdur, **When** redaktor tarixi seçib nümunə faylı yükləyir,
   **Then** həmin tarix üçün fayldakı hər tanınan kodun məzənnəsi yaranır və redaktor yazılan
   valyutaların sayını görür.
2. **Given** faylda `G` dəyəri `0.56379999999999997` (BYN), **When** import olunur, **Then**
   saxlanan dəyər `0.5638`-dir.
3. **Given** faylda `XDR` sətri var, **When** import olunur, **Then** dəyər SDR (BVF-nin xüsusi
   borcalma hüquqları) məzənnəsi kimi saxlanılır və public saytda/XML feed-də SDR yerində görünür.
4. **Given** faylda master-də olmayan kod var, **When** import olunur, **Then** həmin sətir
   ötürülür, qalan sətirlər yazılır, ötürülən kodlar nəticədə siyahı ilə göstərilir.
5. **Given** redaktor tarix seçməyib və ya fayl seçməyib, **When** yükləməyə cəhd edir, **Then**
   sorğu getmir və müvafiq sahədə xəta görünür.

---

### User Story 2 - Import-dan sonra dəyəri əl ilə düzəltmək (Priority: P2)

Fayldakı bir rəqəm səhv olarsa (və ya bank sonradan düzəliş göndərərsə), redaktor import olunmuş
tarixin vərəqini açır və istənilən valyutanın məzənnəsini əl ilə dəyişib saxlayır — köhnə saytın
"Edit" ekranı kimi.

**Why this priority**: Legacy-də bu mövcuddur və import-un təhlükəsizlik toru rolunu oynayır.
Yeni stack-in mövcud vərəq redaktoru bunu artıq edir, ona görə yalnız import olunmuş vərəqlə
birlikdə işləməsi təsdiqlənməlidir.

**Independent Test**: Nümunə faylı import etdikdən sonra USD-ni 1.7001 edib saxlamaq, vərəqi
yenidən açıb dəyəri görmək.

**Acceptance Scenarios**:

1. **Given** import olunmuş tarix, **When** redaktor vərəqdə bir məzənnəni dəyişib saxlayır,
   **Then** yalnız həmin valyutanın dəyəri dəyişir, qalanlar import-dakı kimi qalır.

---

### User Story 3 - Səhv faylın rədd edilməsi (Priority: P2)

Redaktor səhvən başqa fayl (pdf, köhnə xls, başqa cədvəl, boş bülleten) seçərsə, sistem heç nə
yazmır və anlaşılan səbəb göstərir.

**Why this priority**: Rəsmi məzənnə maliyyə məlumatıdır; yarımçıq və ya zibil yazı public
sayta və XML feed-ə istifadə edən banklara gedir.

**Independent Test**: `.pdf`, `.xls`, boş `.xlsx` və B7:G100-də heç bir tanınan kod olmayan
`.xlsx` yükləmək — hər birində xəta, bazada dəyişiklik yoxdur.

**Acceptance Scenarios**:

1. **Given** fayl `.xlsx` deyil, **When** yüklənir, **Then** "yalnız xlsx" xətası, heç nə yazılmır.
2. **Given** `.xlsx` faylında B7:G100 aralığında heç bir tanınan kod yoxdur, **When** yüklənir,
   **Then** "faylda məzənnə tapılmadı" xətası, heç nə yazılmır.
3. **Given** tanınan kodun G xanası boş, mətn, sıfır və ya mənfidir, **When** yüklənir, **Then**
   import bütövlükdə rədd olunur və xəta sətir nömrəsi və kodu göstərir; heç nə yazılmır.

---

### Edge Cases

- **Tarixdə artıq məzənnə var**: panel yükləmədən əvvəl "bu tarix üçün məzənnələr artıq var,
  üstünə yazılsın?" təsdiqini istəyir. Təsdiqdən sonra fayldakı kodların dəyəri yenilənir, faylda
  olmayan kodların mövcud dəyəri toxunulmaz qalır (mövcud vərəq saxlaması ilə eyni məntiq).
- **Faylın tarixi (C2) formadakı tarixdən fərqlidir**: legacy-də yoxlanılmır; yenidə də import-u
  bloklamır (bax Assumptions).
- **Eyni kod faylda iki dəfə**: import rədd olunur (hansı dəyərin düzgün olduğu bilinmir).
- **Kod kiçik hərflə və ya boşluqla** (`usd`, ` USD `): kənar boşluqlar atılır, böyük hərfə
  çevrilir, sonra uyğunlaşdırılır.
- **`RUB` / `RUR`**: B sütunu (`RUB`) oxunur, D sütunu (`RUR`) nəzərə alınmır.
- **Sətir 100-dən sonra**: oxunmur (legacy sərhədi). Nümunə faylda məlumat 51-ci sətirdə bitir.
- **Bir neçə vərəqli fayl**: yalnız aktiv (açılışda seçilmiş) vərəq oxunur, legacy kimi.
- **Çox böyük fayl**: ölçü həddi aşılırsa oxunmadan rədd olunur.
- **Düstur (formula) olan xana**: düsturun hesablanmış (keşlənmiş) dəyəri götürülür.
- **Qeyri-aktiv valyuta** (master-də `is_active = false`): tanınan kod sayılır və yazılır;
  public tərəfdə görünməsini master bayrağı idarə edir.

## Requirements *(mandatory)*

### Functional Requirements

**Fayl qəbulu**

- **FR-001**: Sistem `currency_rates.prepare` icazəsi olan istifadəçiyə tarix + bir `.xlsx`
  faylı ilə məzənnə importu etməyə imkan verməlidir. İcazəsiz istifadəçiyə yükləmə düyməsi
  görünmür və birbaşa sorğu rədd olunur.
- **FR-002**: Sistem yalnız `.xlsx` (Office Open XML) formatını qəbul etməlidir; məzmunu xlsx
  olmayan fayl (uzantısından asılı olmayaraq) rədd olunur.
- **FR-003**: Fayl ölçüsü 5 MB-dan böyükdürsə, oxunmadan rədd olunmalıdır.
- **FR-004**: Tarix məcburidir və formadan gəlir; faylın öz tarix xanası (`C2`) oxunmur.

**Oxuma qaydası (legacy ilə eyni)**

- **FR-005**: Sistem faylın aktiv vərəqindən yalnız `B7:G100` aralığını oxumalıdır.
- **FR-006**: Sətir yalnız `B` xanası (boşluqlar atılıb, böyük hərfə çevrilib) düz 3 hərfdən
  ibarət olduqda məzənnə sətri sayılır; qalan sətirlər (başlıqlar, boş sətirlər, imza) səssiz
  ötürülür.
- **FR-007**: Məzənnə `G` xanasının hesablanmış dəyəridir və 4 onluq rəqəmə yuvarlaqlaşdırılır
  (yarım yuxarı — `0.12345 → 0.1235`).
- **FR-008**: `XDR` kodu SDR valyutası kimi saxlanılır (legacy `XDR → sdr`).
- **FR-009**: `A` (nominal), `C`, `D` sütunları oxunmur; saxlanan dəyər bülletendəki kimidir
  (nominal üzrə, məsələn 100 KRW üçün `0.1266`).
- **FR-010**: Master-də olmayan kodlar ötürülür və nəticədə siyahı ilə qaytarılır. Import özü
  master-ə heç vaxt valyuta əlavə etmir.
- **FR-010a**: Valyuta master-i bülletendəki bütün kodlarla tamamlanmalıdır, belə ki nümunə fayl
  import olunanda heç bir kod ötürülməsin. Hazırkı 12 valyutaya əlavə olunacaq 30 kod (nominal
  bülletenin `A` sütunundan, az adı `C` sütunundan; en adı ISO 4217 rəsmi adı):
  AUD, BYN, KRW (100), CZK, DKK, HKD, INR, SEK, ILS, CAD, KWD, QAR, KGS, HUF (100), MDL, NOK,
  UZS (100), PKR (100), PLN, RON, RSD, SGD, SDR (faylda `XDR`), TMT, UAH, NZD — valyutalar;
  XAU, XAG, XPT, XPD — bank metalları (nominal "1 troy unsiyası" = 1).
  Mövcud 12 valyutanın nominalı bülletenlə üst-üstə düşür (RUB, JPY, KZT = 100).
  Yeni valyutalar aktiv əlavə olunur, ana səhifə kartında göstərilmir; sıra bülletendəki
  sıraya uyğundur (metallar sonda).

**Validasiya və yazı**

- **FR-011**: Tanınan kodun məzənnəsi boş, rəqəm olmayan və ya `≤ 0` olarsa, import bütövlükdə
  rədd olunmalı, xəta sətir nömrəsini və kodu göstərməlidir.
- **FR-012**: Eyni kod faylda bir dəfədən çox gələrsə, import rədd olunmalıdır.
- **FR-013**: Heç bir tanınan kod tapılmazsa, import rədd olunmalıdır.
- **FR-014**: Import ya bütövlükdə yazılır, ya heç yazılmır — yarımçıq vərəq qalmır.
- **FR-015**: Artıq məzənnəsi olan tarixə import Edge Cases-dəki "Tarixdə artıq məzənnə var"
  qərarına uyğun işləyir.
- **FR-016**: Fayl oxunan kimi məzənnələr dərhal saxlanılır (legacy kimi, ayrıca baxış addımı
  yoxdur); düzəliş lazım olarsa import-dan sonra vərəq redaktorunda edilir (FR-021).
- **FR-017**: Hər uğurlu import audit jurnalına yazılmalıdır: kim, nə vaxt, hansı tarix, faylın
  adı və yazılan dəyərlər.
- **FR-018**: Yüklənmiş fayl import-dan sonra saxlanılmır (legacy də müvəqqəti faylı silirdi).

**Nəticə**

- **FR-019**: Uğurlu import-dan sonra redaktor görməlidir: tarix, yazılan valyutaların sayı,
  ötürülən (tanınmayan) kodların siyahısı; vərəq siyahısı və redaktor yenilənir.
- **FR-020**: Bütün xəta mesajları admin panelin dillərində (az/en) göstərilir.

**Əl ilə düzəliş**

- **FR-021**: Import olunmuş tarixin hər məzənnəsi mövcud vərəq redaktorunda əl ilə dəyişdirilə
  bilməlidir (mövcud davranış saxlanılır, import onu dəyişmir).

### Key Entities

- **Məzənnə bülleteni (fayl)**: Mərkəzi Bankın gündəlik xlsx faylı; sətir = nominal, kod, ad,
  məzənnə. Sistemdə saxlanılmır, yalnız oxunur.
- **Valyuta (master)**: ISO kod, nominal, sıra, aktivlik, az/en adı. Import yalnız master-də olan
  kodları tanıyır.
- **Məzənnə vərəqi**: bir tarix üçün valyuta → məzənnə dəstəsi; tarix + valyuta unikaldır.
- **Import nəticəsi**: tarix, yazılan say, ötürülən kodlar, (xəta halında) səbəb və sətir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor günün bülletenini 1 dəqiqədən az müddətdə sistemə daxil edir (hazırda ~42
  dəyər əl ilə köçürülür).
- **SC-002**: Nümunə fayl (`Resmi Mezenne 13 10 2026.xlsx`) import olunduqda saxlanan hər dəyər
  `G` sütununun 4 rəqəmə yuvarlaqlaşdırılmış dəyəri ilə 100% üst-üstə düşür.
- **SC-003**: Eyni faylı legacy sistemə və yeni sistemə import etdikdə, hər iki sistemdə olan
  bütün valyutalar üçün nəticə eynidir.
- **SC-004**: Səhv fayl (format, boş, səhv dəyər) heç bir halda bazada qismən və ya tam yazı
  yaratmır.
- **SC-005**: Import olunmuş məzənnələr public saytda və XML feed-də heç bir əlavə addım olmadan
  görünür.

## Assumptions

- Bülletenin formatı (kodlar `B`, məzənnə `G`, məlumat 7-ci sətirdən) Mərkəzi Bankın daxili
  şablonudur və illərdir dəyişməyib; nümunə fayl bunu təsdiqləyir.
- Faylın tarixi (`C2`) ilə formadakı tarixin uyğunluğu yoxlanılmır — legacy-də də yoxlanılmırdı;
  bu, gələcəkdə ayrıca təkmilləşdirmə ola bilər.
- Nominal (`A`) oxunmur; master-dəki nominal bülletendəki ilə eyni olmalıdır (KRW, KZT, HUF, UZS,
  PKR, RUB, JPY = 100). Uyğunsuzluq import-da yoxlanılmır.
- `currency_rates.approve` icazəsi mövcuddur, amma təsdiq axını hələ yoxdur; bu spec onu əlavə
  etmir — import birbaşa yazır (mövcud əl ilə saxlama kimi).
- Köhnə `.xls` (Excel 97–2003) dəstəklənmir — legacy də yalnız `xlsx` qəbul edirdi.
- Excel-in yalnız aktiv vərəqi oxunur; nümunə faylda bir vərəq var.
- Import endpoint-i spec-first əlavə olunur (`openapi/` əvvəl, controller sonra) — CLAUDE.md qaydası.
