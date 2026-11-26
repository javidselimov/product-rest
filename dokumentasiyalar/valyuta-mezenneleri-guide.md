# Valyuta məzənnələri — idarəetmə təlimatı

Bu sənəd cbar.az-ın **rəsmi valyuta məzənnələrini** admin paneldən necə daxil etməyi (Excel
bülletenindən yükləmə və əl ilə redaktə), ana səhifə kartında hansı valyutaların görünəcəyini necə
seçməyi və dəyişikliyin saytda harada görünəcəyini izah edir.

> Məzənnələr yalnız sayta düşmür. Eyni rəqəmlər **`/currencies/GG.AA.İİİİ.xml`** ünvanındakı köhnə
> XML lentinə də düşür — banklar və digər sistemlər illərdir bu lenti avtomatik oxuyur. Paneldə
> saxladığınız hər dəyər dərhal o lentdə də dərc olunur.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel — məzənnələr** | Sol menyu → **Maliyyə** → **Məzənnələr** (`/currency-rates`) |
| **Admin panel — valyutalar** | Eyni səhifədə yuxarıdakı tab **Valyutalar** (`/currency-rates/currencies`) |
| **Sayt (AZ)** | `https://<sayt>/az/currencies` — istənilən tarix: `…/az/currencies?date=2026-10-13` |
| **Sayt (EN)** | `https://<sayt>/en/currencies` |
| **Ana səhifə** | «**AZN məzənnəsi**» kartı — başlığı məzənnələr səhifəsinə keçiddir |
| **XML lenti** | `https://<api>/currencies/13.10.2026.xml` (saytdakı «XML formatında yüklə» düyməsi də bura aparır) |

İki anlayış var:

- **Vərəq** — bir tarixin məzənnələri (valyuta → məzənnə). Hər gün bir vərəqdir.
- **Valyuta** (master) — kodların siyahısı: kod, ad (AZ/EN), nominal, sıra, «Ana səhifə» bayrağı.
  Vərəqə yalnız bu siyahıda olan valyuta daxil edilə bilər.

Saytda dəyişiklik **ən geci ~10 saniyəyə** görünür (sayt API cavabını 10 saniyə saxlayır). XML
lentində **dərhal** görünür.

---

## 2. Hazırlıq

- Bülletenlə yükləmək üçün Mərkəzi Bankın gündəlik **«Resmi Mezenne GG AA İİİİ.xlsx»** faylı
  lazımdır (yalnız `.xlsx`, köhnə `.xls` qəbul olunmur, 5 MB-a qədər).
- Faylda bütün kodlar **Valyutalar** siyahısında olmalıdır — hazırda siyahıda bülletenin 42 kodu var
  (38 valyuta + 4 bank metalı: XAU, XAG, XPT, XPD). Yeni valyuta **paneldən əlavə etmək olmur** —
  texniki komandaya müraciət edin (bax «Əlavə: developerlər üçün»).
- Məzənnə yazmaq üçün istifadəçinizin «məzənnə hazırlama» icazəsi olmalıdır (`admin` və
  `moderator` rollarında var). İcazə yoxdursa, saxlama/yükləmə xəta ilə rədd olunur.

---

## 3. Admin paneldə əməliyyatlar

**Maliyyə → Məzənnələr** səhifəsi:

- yuxarıda düymələr: **Tarixlər**, **Vərəqi sil** (vərəq yüklənibsə), **Excel-dən yüklə**, **Yeni vərəq**;
- **Vərəq tarixi** seçici — boşdursa «Son vərəq» yazılır və ən son tarixli vərəq göstərilir;
- aşağıda vərəqin cədvəli: **Kod · Ad (AZ) · Nominal · Məzənnə**, altında **Valyuta seç…** və
  **Vərəqi saxla**.

### 3.1. Günün bülletenini Excel-dən yükləmək (əsas yol)

1. **Excel-dən yüklə** → «Bülleteni yüklə» dialoqu açılır.
2. **Tarix** — vərəqin tarixi. Default olaraq açıq olan vərəqin tarixi (vərəq yoxdursa bu gün)
   gəlir; **mütləq yoxlayın**. Tarix yalnız buradan götürülür — faylın içindəki tarix oxunmur.
3. **Bülleten faylı** — faylı sahəyə atın və ya klikləyib seçin (qeyd: «Yalnız .xlsx, 5 MB-a qədər»).
4. **Yüklə**.

Nəticə dərhal yazılır, ayrıca baxış addımı yoxdur. Uğurda bildiriş çıxır — «**N valyutanın
məzənnəsi yazıldı**», lazım gələrsə altında «Tanınmayan kodlar ötürüldü: …» — və səhifə həmin
tarixin vərəqinə keçir. Rəqəmlərdən biri səhvdirsə, onu burada əl ilə düzəldin (§3.2).

**Fayl necə oxunur** (köhnə cbar.az ilə eyni qayda):

| Nə | Qayda |
|---|---|
| Vərəq | Faylın **aktiv** (açılanda seçilmiş) vərəqi, **7–100-cü sətirlər** |
| Kod | **B** sütunu — düz 3 hərf (`USD`, `EUR`, … `XAU`). Boşluq və kiçik hərf düzəldilir. 3 hərf olmayan sətirlər (başlıqlar, «Bank metalları», imza) səssiz ötürülür |
| Məzənnə | **G** sütunu — 4 onluq rəqəmə yuvarlaqlaşdırılır (`0.56379999…` → `0.5638`) |
| `XDR` | **SDR** kimi saxlanılır (lentdə `Code="SDR"`) |
| Nominal (A), ad (C), ikinci kod (D), faylın tarixi (C2) | **oxunmur** |
| Siyahıda olmayan kod | ötürülür, bildirişdə göstərilir; qalanlar yazılır |

Nümunə fayl («Resmi Mezenne 13 10 2026.xlsx»): valyutalar 7–44-cü sətirlərdə (USD 1.7000, EUR
1.8992 …), bank metalları 48–51-də (XAU 7133.2510, XAG 102.9575, XPT 2887.9685, XPD 1950.8605).

**Həmin tarixdə artıq məzənnə varsa** dialoq sarı xəbərdarlıq göstərir: «GG.AA.İİİİ tarixi üçün
artıq N məzənnə var. Fayldakı valyutaların dəyəri yenilənsin? Faylda olmayanlara toxunulmayacaq.»
**Üstünə yaz** → fayldakı kodlar yenilənir, faylda olmayan kodların mövcud dəyəri qalır.
**Ləğv et** → heç nə dəyişmir, dialoq formaya qayıdır.

Dialoqun verə biləcəyi xətalar (heç bir halda **heç nə yazılmır**):

| Mesaj | Səbəb / nə etməli |
|---|---|
| «Tarix seçin» / «Fayl seçin» | Sahə boşdur |
| «Yalnız .xlsx formatlı bülleten yükləmək olar» | Fayl `.xlsx` deyil (uzantısı dəyişdirilmiş fayl da rədd olunur) və ya Excel kitabı kimi oxunmur |
| «Fayl çox böyükdür» | 5 MB-dan böyük fayl, ya da içi həddən artıq böyük açılan fayl |
| «Faylda məzənnə tapılmadı — B7:G100 aralığında tanınan valyuta kodu yoxdur» | Boş və ya başqa cədvəl; bülletenin düzgün vərəqi aktiv deyil |
| «Sətir N, USD: məzənnə boşdur və ya müsbət rəqəm deyil» | Həmin sətirdə G xanası boş, mətn, 0 və ya mənfidir — faylı düzəldib yenidən yükləyin |
| «Sətir N: USD faylda təkrarlanır» | Eyni kod iki dəfə var |

### 3.2. Məzənnəni əl ilə düzəltmək

1. Vərəqi açın: **Vərəq tarixi** seçicidə tarixi seçin, ya da **Tarixlər** → tarixə klikləyin.
2. **Məzənnə** sütununda rəqəmi dəyişin. Onluq ayırıcı nöqtədir (`1.7001`).
3. **Vərəqi saxla** → «Vərəq yadda saxlanıldı».

Saxlamada hər sətir yoxlanılır; xəta olan sətirin altında səbəb yazılır, yuxarıda isə «Bəzi
sətirlərdə xəta var — məzənnələri yoxlayın»:

| Mesaj | Səbəb |
|---|---|
| «Məzənnə boş ola bilməz» | Sahə boşdur |
| «Məzənnə rəqəm olmalıdır» | Rəqəm deyil |
| «Məzənnə sıfırdan böyük olmalıdır» | 0 və ya mənfi |
| «Ən azı bir məzənnə lazımdır» | Vərəqdə sətir yoxdur |
| «Əvvəlcə tarix seçin» | Tarix boşdur |

Dəyər bazada **4 onluq rəqəmlə** saxlanılır (`1.70005` → `1.7001`); saytda və lentdə həmişə 4 rəqəm
görünür (`1.7000`).

**Vərəqə valyuta əlavə etmək:** cədvəlin altındakı **Valyuta seç…** siyahısından (axtarış: «Kod və ya
ad…») valyutanı seçin — sətir dərhal əlavə olunur, məzənnəsini yazın, **Vərəqi saxla**. Siyahıda yalnız
bu vərəqdə hələ olmayan valyutalar var.

> **Açıq vərəqdən sətir silmək olmur** — saxlama yalnız göndərilən kodları yazır/yeniləyir, qalanlara
> toxunmur. Bir valyutanı həmin tarixdən çıxarmaq lazımdırsa: vərəqi silin (§3.5) və yenidən
> yükləyin, ya da texniki komandaya müraciət edin.

### 3.3. Yeni vərəq əl ilə yaratmaq (bülletensiz)

**Yeni vərəq** düyməsi **qaralama** açır: tarix bu günə qoyulur, sətirlər **açıq olan vərəqdən**
köçürülür (sarı qeyd: «Yeni vərəq hələ saxlanılmayıb — sətirlər son yüklənmiş vərəqdən götürülüb»).

- **Vərəq tarixi** seçicidə lazımi tarixi seçin.
- Məzənnələri yeniləyin; yalnız qaralamada sətirin sağında **zibil qutusu** var — lazımsız valyutanı
  çıxarın; **Valyuta seç…** ilə yenisini əlavə edin.
- **Vərəqi saxla** → vərəq həmin tarixə yazılır və səhifə ona keçir.

Qaralama açıq ikən **Excel-dən yüklə** və **Yeni vərəq** düymələri bağlıdır. Qaralamadan çıxmaq
üçün **Tarixlər** panelindən bir tarixə klikləyin — saxlanmamış sətirlər itir.

> Qaralamanı **artıq məzənnəsi olan tarixə** saxlasanız, Excel yükləməsi kimi **birləşdirmə** olur:
> qaralamadakı kodlar yazılır/yenilənir, qaralamadan sildiyiniz amma o tarixdə mövcud olan kodlar
> **silinmir**.

Alternativ: seçicidə məzənnəsi olmayan tarixi seçin — boş cədvəl («Bu tarix üçün məzənnə yoxdur»)
açılır, **Valyuta seç…** ilə sətirləri əlavə edib saxlayın.

### 3.4. Tarixlər paneli

**Tarixlər** düyməsi sağdan «Vərəq tarixləri» panelini açır: **Tarix · Valyuta sayı**, ən yenidən
köhnəyə, səhifədə 20 tarix. Tarixə klikləyin — həmin vərəq yüklənir. Boş bazada «Hələ vərəq yoxdur».

### 3.5. Vərəqi silmək

Vərəq açıq ikən **Vərəqi sil** → dialoq: «GG.AA.İİİİ tarixli bütün məzənnələr silinsin? Bu əməliyyat
geri qaytarıla bilməz.» → təsdiq → «Vərəq silindi», səhifə son vərəqə qayıdır.

Həmin tarix **saytdan və XML lentindən dərhal itir** (lent o tarix üçün «tapılmadı» qaytarır).
Silinmiş vərəqi geri qaytarmaq olmur — bülleteni yenidən yükləyin.

### 3.6. Valyutalar — ana səhifə kartı və sıra

**Valyutalar** tabı bütün kodların cədvəlidir: **Kod · Ad (AZ) · Ad (EN) · Nominal · Sıra · Aktiv ·
Ana səhifə**. Başlığın altında «N valyuta ana səhifədə göstərilir» yazılır.

| Sütun | Dəyişir? | Saytda təsiri |
|---|---|---|
| **Kod, Ad (AZ/EN), Nominal** | Xeyr (yalnız oxunur) | Saytdakı cədvəldə və lentdə ad/nominal buradan gəlir; dəyişmək üçün texniki komanda |
| **Sıra** | Rəqəm (0-dan) | Valyutaların ardıcıllığı **hər yerdə**: panel vərəqində, saytın cədvəlində, ana səhifə kartında və lentin «Xarici valyutalar» blokunda. Kiçik rəqəm yuxarıda, bərabər olanda kod əlifba sırası |
| **Aktiv** | ✔ / boş | Hazırda **saytda və lentdə təsiri yoxdur** — qeyri-aktiv valyutanın məzənnəsi də göstərilir (yoxlanılmalıdır, bax §8) |
| **Ana səhifə** | ✔ / boş | ✔ olanlar ana səhifənin «AZN məzənnəsi» kartında çıxır; yanında yaşıl «Ana səhifə» nişanı |

Dəyişdirilmiş sətir sarımtıl olur, düymə «**Dəyişiklikləri saxla (N)**» yazır. Saxla → «Valyuta
dəyişiklikləri yadda saxlanıldı». Bir sətir saxlanmasa, o dəyişdirilmiş qalır və xəta bildirişi
«USD: …» şəklində çıxır — qalanlar yazılır.

> Ana səhifə kartında ikon yalnız **USD, EUR, RUB, TRY** üçün var; başqa valyutanı seçsəniz sətir
> ikonsuz çıxır. Kartda neçə sətir olacağına məhdudiyyət yoxdur — çox seçməyin.

---

## 4. Saytda nə və necə görünür

### 4.1. Məzənnələr səhifəsi (`/az/currencies`)

Başlıq «Rəsmi məzənnələr», altında **Məzənnə tarixi** sahəsi və **Göstər** düyməsi. Tarix
seçilməyibsə **ən son vərəq** göstərilir.

- Tarix (uzun formatda) və sağda **XML formatında yüklə** düyməsi — həmin günün XML lentini yeni
  tabda açır.
- Cədvəl: **Kod · Valyuta · Nominal · Məzənnə (AZN)**, Valyutalar tabındakı **Sıra** ilə. Məzənnə
  4 rəqəmlə.
- Altda qeyd: «Məzənnələr Azərbaycan Respublikası Mərkəzi Bankının rəsmi məzənnələridir.»

Seçilmiş tarixdə vərəq yoxdursa: «**Seçilmiş tarix üçün məzənnə vərəqi yoxdur**» — səhifə **əvvəlki
günə keçmir**. Həftə sonu və bayram üçün vərəq yoxdursa, həmin tarixi seçən ziyarətçi boş səhifə
görür (köhnə saytdakı kimi).

Bank metalları (XAU, XAG, XPT, XPD) bu cədvəldə valyutalarla **bir siyahıda**, Sıra-ya görə
göstərilir — ayrıca blok yoxdur.

### 4.2. Ana səhifə — «AZN məzənnəsi» kartı

- **Ən son vərəqdən** yalnız **Ana səhifə** ✔ olan valyutalar, Sıra ilə: «1 USD 1.7000», sağda ox.
- Ox **əvvəlki vərəqlə** müqayisədir: ən çox 5 gün geriyə baxılır, ən yaxın tapılan vərəq götürülür
  (həftə sonu atlanır). Yaşıl yuxarı ox — artıb, qırmızı aşağı — azalıb, nöqtə — dəyişməyib və ya
  müqayisə üçün vərəq yoxdur.
- Kartın tarixi son vərəqin tarixidir; başlıq `/currencies`-ə keçiddir.
- Son vərəqdə «Ana səhifə» valyutalarından heç biri yoxdursa (və ya heç vərəq yoxdursa) kart
  **göstərilmir**.

### 4.3. XML lenti (`/currencies/13.10.2026.xml`)

Tarix **GG.AA.İİİİ** formatındadır. Həmin gün üçün vərəq varsa, lent dərhal onu qaytarır:

- əvvəl **«Bank metalları»** bloku — XPD, XPT, XAG, XAU **sabit sırada**, nominal «1 t.u.» (vərəqdə
  metal yoxdursa blok heç çıxmır);
- sonra **«Xarici valyutalar»** — Sıra ilə, ad «1 ABŞ dolları» / «100 Yapon yeni» şəklində, dəyər
  4 rəqəmlə.

Vərəq yoxdursa lent «tapılmadı» qaytarır. Bu lentin **quruluşu dəyişdirilə bilməz** — xarici
sistemlər onu olduğu kimi oxuyur.

---

## 5. Dil görünüşü

Məzənnələr dildən asılı deyil — AZ və EN səhifələrdə eyni vərəq, eyni rəqəmlər. Fərq yalnız
**valyutanın adında**: `/az` — Ad (AZ), `/en` — Ad (EN). Hansısa valyutanın EN adı boşdursa, ingilis
cədvəldə ad xanası boş qalır (sətir yenə görünür). XML lenti həmişə AZ addadır.

---

## 6. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] Paneldə **Vərəq tarixi** düzgün gündür; bülletenin tarixi ilə eynidir.
- [ ] Bildirişdə yazılan say gözlənilən qədərdir (tam bülleten üçün **42**), «Tanınmayan kodlar» yoxdur.
- [ ] Vərəqdə USD, EUR və bir neçə kodu bülletenlə tutuşdurun.
- [ ] `https://<sayt>/az/currencies` — yeni tarix və rəqəmlər görünür (10 saniyə gözləyin, yeniləyin).
- [ ] Ana səhifə kartı — rəqəmlər və oxlar məntiqlidir.
- [ ] `https://<api>/currencies/GG.AA.İİİİ.xml` açılır, «Bank metalları» və «Xarici valyutalar» blokları var.
- [ ] `/en/currencies` — ingilis adlar düzgündür.

## 7. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| «Faylda məzənnə tapılmadı» | Fayl bülleten deyil, boş vərəq aktivdir, ya kodlar B sütununda deyil | Excel-də düzgün vərəqi seçib saxlayın, faylı yenidən yükləyin |
| «Tanınmayan kodlar ötürüldü: XXX» | Bülletendə Valyutalar siyahısında olmayan kod var | Texniki komandaya kodu əlavə etdirin, sonra faylı **Üstünə yaz** ilə yenidən yükləyin |
| Yükləmə «Yalnız .xlsx…» deyir | Fayl `.xls`, `.pdf` və ya adı dəyişdirilmiş fayldır | Excel-də «Fayl → Fərqli saxla → .xlsx» |
| Saytda hələ köhnə rəqəm | Saytın 10 saniyəlik keşi | Gözləyib səhifəni yeniləyin |
| Saytda tarix səhifəsi boşdur | Həmin gün üçün vərəq yoxdur (həftə sonu/bayram) | Lazımdırsa həmin tarixə vərəq yükləyin |
| Ana səhifə kartı yoxdur | Son vərəqdə «Ana səhifə» ✔ olan valyuta yoxdur | Valyutalar tabında bayraqları yoxlayın; vərəqdə həmin kodların olduğuna baxın |
| Kartda ox hamısı nöqtədir | Son 5 gündə əvvəlki vərəq yoxdur | Normaldır; əvvəlki günün vərəqi yüklənəndə oxlar çıxar |
| Vərəqdə artıq valyutanı silə bilmirəm | Açıq vərəqdən sətir silinmir | §3.2 qeydi — vərəqi silib yenidən yükləyin |
| Səhv tarixə yüklədim | Tarix dialoqda yoxlanmayıb | Səhv tarixin vərəqini silin (§3.5), düzgün tarixə yenidən yükləyin |
| Saxlama/yükləmə icazə xətası verir | İstifadəçidə məzənnə hazırlama icazəsi yoxdur | Administratora müraciət edin |

---

## Əlavə: developerlər üçün

Spec: `specs/025-currency-rates-xlsx-import/` (spec, quickstart, `contracts/admin-api-import.md`,
`contracts/public-xml-feed.md`). Deploy sırası: **api-cbar-admin** (miqrasiya `0010`) → **api-cbar**
→ **web-cbar-admin-new**.

| Qat | Yer |
|---|---|
| DB | `currencies` (`code` PK, `nominal`, `sort_order`, `is_active`, `show_on_homepage` — `0002`), `currency_translations` (`name` per locale), `currency_rates` (`rate_date`, `currency_code`, `rate numeric(12,4) CHECK > 0`, `UNIQUE(rate_date, currency_code)`). Master-in 42 kodu: `db/seed.sql` (12) + `0010-currency-bulletin-master.sql` (30, SDR və metallar) |
| Admin API | `CurrencyRatesController`: `GET /api/v1/currency-rates[?date]` (boş → son vərəq), `GET /dates` (20/səhifə), `PUT` (merge, naməlum/təkrar kod → 400), `POST /import` (multipart `date`, `file`, `overwrite`; 5 MB; `RateBulletinReader` → `XlsxSheetReader`: aktiv vərəq, B7:G100, 4 onluq; xəta `code`-ları `date_required/file_required/not_xlsx/file_too_large/no_rates/invalid_rate/duplicate_code`, `409 sheet_exists{count}`), `DELETE ?date`. `CurrenciesController`: `GET /api/v1/currencies`, `PUT /{code}` (`showOnHomepage`, `sortOrder`, `isActive`). İcazələr `currency_rates.read/prepare`, `currencies.read/update`; audit `currency_rates.upsert/import/delete`, `currencies.update` |
| Public API | `api-cbar` `CurrenciesController`: `GET /api/v1/currencies?date&locale` (tarix verilməyəndə son vərəq; verilən tarixdə vərəq yoxdursa `rates: []`), `GET /currencies/{dd.MM.yyyy}.xml` — **kontrakt**, `TODO(compat)` markerləri; metallar `MetalCodes = XPD, XPT, XAG, XAU` sabit |
| Sayt | `web-cbar-new`: `app/[locale]/(content)/currencies/page.tsx` (`force-dynamic`) → `views/currencies/{loader,index}.tsx`; `features/currencies/api/currencies.api.ts` (`cachedJsonOrNull`, 10 s, `previousSheet` 5 gün paralel), `model/schemas.ts` (`formatRate` 4 onluq, `CURRENCY_ICON_BY_CODE`); ana səhifə `views/home/loader.ts` (`showOnHomepage` filtr, `rateTrend`) → `widgets/home-cards/currency-card.tsx` |
| Admin panel | `web-cbar-admin-new`: `pages/currency-rates`, `pages/currencies`; `features/currency/` — `components/{rate-sheet-editor,rate-import-dialog,sheet-dates-panel,currency-master-grid}.tsx`, `api/currency.service.ts`, `hooks/use-currency.ts`, `model/schemas.ts`; lokalizasiya `locales/az/currency.json`; nav `app/routes/nav.ts` (`finance` qrupu); MSW `shared/testing/handlers/currency.ts`; testlər `features/currency/currency.test.tsx` |

**Davranış qeydləri:**

- `PUT /currency-rates` və import eyni `MergeRatesAsync`-dir: yalnız göndərilən kodlar
  insert/update olunur, tarixin digər kodları qalır. Sətir silmə endpoint-i yoxdur — yalnız bütün
  vərəq `DELETE`.
- Import XDR → SDR çevirir; master-də olmayan kod `skipped`-ə düşür; tanınan kodun səhv dəyəri
  bütün importu dayandırır (yazıdan əvvəl yoxlama, yazı bir tranzaksiyada). Fayl saxlanılmır.
- Public tərəf `sort_order`-ə görə sıralayır; `is_active` **heç yerdə süzülmür** (nə public JSON,
  nə XML, nə admin siyahıları). Spec 025 «public tərəfdə görünməsini master bayrağı idarə edir»
  deyir — kodda belə deyil.
- Spec FR-001 «icazəsiz istifadəçiyə yükləmə düyməsi görünmür» deyir; paneldə düymələr icazəyə görə
  gizlədilmir, yalnız API 403 qaytarır.
- Public `GET /api/v1/currencies?date=` vərəqi olmayan tarixdə əvvəlki günə **düşmür**; sayt
  «vərəq yoxdur» göstərir. Həftəsonu fallback ayrıca məsələdir (`diff_report_logic.md`).
- `currency_rates.approve` icazəsi var, təsdiq axını yoxdur — import və saxlama birbaşa yazır.
- Panel: qaralamada silinmiş sətri **Valyuta seç…** ilə geri qaytarmaq olmur (siyahı yüklənmiş
  vərəqin kodlarını çıxarır) — qaralamanı yenidən açmaq lazımdır. Boş tarixdə **Vərəqi sil** düyməsi
  görünür və 404 verir.
