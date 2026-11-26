# old_businesslogic.md — köhnə cbar.az-ın (product-host) biznes məntiqi

Mənbə: `product-host/` — canlıdakı Yii2 PHP sayt və admin panel. Tarix: 2026-09-30.
Kod dəyişdirilməyib, yalnız oxunub. Bütün yollar `product-host/`-a nisbətəndir. Sətir nömrələri təxminidir (±2).

Bu sənəd **nə edilir və niyə** sualına cavab verir. **Nə çatışmır** sualının cavabı [`notdoneyet.md`](notdoneyet.md)-dədir.
Hər bölmənin sonunda "→ notdoneyet §X" qeydi yeni stack-dəki boşluğa istinad edir.

---

## Mündəricat

1. [Sistem nədir və kim istifadə edir](#1-sistem-nədir-və-kim-istifadə-edir)
2. [Hamı üçün keçərli qaydalar](#2-hamı-üçün-keçərli-qaydalar)
3. [Maliyyə və statistika məlumatları](#3-maliyyə-və-statistika-məlumatları)
4. [Kontent modulları](#4-kontent-modulları)
5. [Naviqasiya, axtarış, paylaşma](#5-naviqasiya-axtarış-paylaşma)
6. [Admin panel: rollar və iş axınları](#6-admin-panel-rollar-və-iş-axınları)
7. [Təhlükəsizlik](#7-təhlükəsizlik)
8. [Data modeli](#8-data-modeli)
9. [Xarici inteqrasiyalar və asılılıqlar](#9-xarici-inteqrasiyalar-və-asılılıqlar)
10. [Məlum buglar və risklər](#10-məlum-buglar-və-risklər)
11. [Yeni sistemdə mütləq qorunmalı qaydalar](#11-yeni-sistemdə-mütləq-qorunmalı-qaydalar)

---

## 1. Sistem nədir və kim istifadə edir

### 1.1 Üç tətbiq, bir baza

| Tətbiq | Qovluq | Rolu |
|---|---|---|
| Public sayt | `visitor/` | www.cbar.az — ziyarətçinin gördüyü hər şey |
| Admin panel | `admin/` | redaktorların məzmunu idarə etdiyi CMS + BankInfo push API |
| Ortaq qat | `common/` | modellər (DB), təhlükəsizlik komponentləri, tərcümələr, konsol komandaları |

- Stack: Yii2 (~2.0.5), PHP ≥ 7, **PostgreSQL**. Sorğularda Postgres-ə xas SQL var (`NOW() - INTERVAL`, `DATE_TRUNC`).
- İkinci baza bağlantısı: `statsDB`. Ödəniş statistikası ETL cədvəllərini (`mb_ovs_v01`, `mb_ovs_v02`) oxuyur.
- Real konfiqurasiya repoda yoxdur (gitignore): `common/config/db.php`, `common/config/params.php`, `visitor/config/statsDb.php`, `*/web/index.php`.

### 1.2 Kim istifadə edir və nə üçün

| Auditoriya | Nə axtarır | Sistemdə harada |
|---|---|---|
| **Banklar, maliyyə institutları** | rəsmi məzənnə, AZIR, faiz dəhlizi, notların gəlirliliyi, gəlirlilik əyrisi, normativ aktlar | valyuta, AZIR, infoblocks, yield curve, qanunlar |
| **Biznes, mühasiblər** | gündəlik və dövri məzənnə (uçot, gömrük, vergi), Excel yükləmə | `/currency/rates`, `/currency/custom` |
| **Xarici IT sistemləri** (ERP, bank sistemləri) | maşın oxuya bilən məzənnə feed-i | `/currencies/DD.MM.YYYY.xml` — **illərlə istifadə olunan kontrakt** |
| **İnvestorlar, kapital bazarı** | emitentlərin məcburi açıqlamaları | MEAS (ESİD) |
| **Əhali** | məzənnə, pul nişanlarının təhlükəsizlik əlamətləri, xəbərlər, rəhbərliyin qəbul günləri, lisenziyalı qurumlar | valyuta, pul nişanları, təşkilat, reyestr |
| **Media** | press-relizlər (uçot dərəcəsi qərarları), RSS, canlı yayım | press-relizlər, RSS, video |
| **Redaktorlar** (CB əməkdaşları) | məzmunu dərc etmək, Excel ilə məlumat yükləmək | admin panel |
| **MEAS menecerləri** | yalnız emitent açıqlamalarını yükləmək | admin `meas` modulu |
| **CB-nin daxili sistemi** | bank məlumatı XML-lərini saytda dərc etmək | `POST /api/bank-info` |

### 1.3 Məlumat sayta necə daxil olur

Köhnə sistemdə **cron və planlı iş yoxdur**. Hər şey dörd kanalla gəlir:

1. **Redaktor əl ilə daxil edir** — formlar (səhifələr, press-relizlər, AZIR, infolines, inflyasiya və s.).
2. **Redaktor Excel yükləyir** — valyuta məzənnələri (xlsx) və gəlirlilik əyrisinin 3 faylı.
3. **Xarici sistem push edir** — BankInfo XML faylları (`/api/bank-info`).
4. **Sayt xarici API-dən canlı oxuyur** — reyestr (`api-registry-public.e-cbar.az`), ödəniş statistikası (`statsDB`).

---

## 2. Hamı üçün keçərli qaydalar

### 2.1 İki dil (az/en), dil sessiyada

- Yalnız `az` və `en`. Rus dili yoxdur (yeganə iz: `meas_info_type.name_ru`).
- Məzmun sütunları cüt-cütdür: `title_az`/`title_en`, `content_az`/`content_en` və s.
- **Dil URL-də deyil, sessiyadadır.** `?language=en` gəlirsə, sessiyaya yazılır (`visitor/behaviors/LanguageBehavior.php`). Eyni URL iki dildə fərqli məzmun qaytarır.
- Fallback: EN başlıq boşdursa, AZ göstərilir (`Pages::getPageLinkByID`, `FileHelper::checkAssetLanguage`).
- Səhifə/menyu görünürlüyü dilə görə: `show_az`, `show_en`.
- Tərcümə faylları biznes lüğətidir: `common/messages/{az,en}/other.php` (valyuta adları və nominalları, infoline adları, statistika etiketləri, rollar), `structure.php` (org-chart).

### 2.2 Görünürlük bayraqları

| Bayraq | Mənası | Harada |
|---|---|---|
| `active` | dərc olunub / olunmayıb | demək olar hər cədvəl |
| `visible` | menyuda görünür | `pages`, assetlər |
| `show_az`, `show_en` | bu dildə göstər | `pages` |
| `show_footer` | footer menyusunda göstər | `pages` (hazırda effekti yoxdur — footer widget şərhdədir) |
| `readonly` | kartik-də redaktə kilidi; **public-də aktivlik və dil yoxlamasından yan keçir** | `pages` |
| `is_active` / `activity` | slayder / qaçan sətir aktivdir | `news_slider`, `running_line` |
| `home_view`, `date_view` | AZIR sətri ana səhifədə göstərilir / tarix bu sətirdən götürülür | `azir_indexses` |

### 2.3 Embargo və qaralama

- **Press-reliz yeni yaradılanda `active = 0`-dır** (`common/models/PressReleases.php:17-23`). Redaktor ayrıca aktivləşdirməlidir — dərcdən əvvəl yoxlama addımı.
- **`date <= bu gün` embargo:** gələcək tarixli press-reliz, qalereya və video siyahıda görünmür, tarix gələndə avtomatik görünür. Uçot dərəcəsi qərarı kimi bazara təsir edən xəbər üçün vacibdir.
- ⚠️ Embargo **yalnız siyahılarda** işləyir. Detal səhifələri (`findOne($id)`) və **RSS** qaralama və embargolu relizləri də göstərir (bax §10).

### 2.4 Sıralama

- `PositionBehavior` (`admin/behaviors/PositionBehavior.php`) — `position` sütunu, qrup daxilində (məs. `page_id`, `type`, `type + category_id`). Yeni yazı qrupun sonuna düşür; qrup dəyişəndə yeni qrupun sonuna keçir; silinəndə boşluq qalmır.
- Siyahıların çoxu tarixə görə azalan (`date DESC, id DESC`).

### 2.5 Keş

- DB sorğularının çoxu `params['dbCacheTimeout']` müddətinə FileCache-də saxlanılır (menyular, bannerlər, son məzənnə, son infoline dəyəri).
- **CMS-də dəyişiklik keş bitənə qədər görünməyə bilər.** Admin-də "Clean cache" düyməsi (`admin/controllers/HomeController.php`, `clean-cache`) public saytın bütün keşini silir.

### 2.6 Tarix saxlanması (qarışıqdır)

- `currency_rates.date`, `infolines.date` — **Unix timestamp** (int).
- Digər cədvəllər — `Y-m-d`. `meas.reg_date` — **string**.
- Formlarda istifadəçi `d/m/Y` daxil edir (`DateHelper::DEFAULT_FORMAT`), ekranda `d.m.Y`.

### 2.7 Xəta səhifəsi yoxdur

- Prod-da istənilən xəta (404, 500) **ana səhifəyə redirect** olur (`visitor/controllers/ErrorController.php:16-25`). Real 404 yoxdur.

### 2.8 Fayllar

- Upload-lar `params['uploadsDirectory']/<qovluq>/` altına 25 simvolluq md5 adla yazılır (`common/components/uploader/UploadBehavior.php`). Public URL `uploads.cbar.az/...`.
- Şəkillər yükləmə zamanı sahəyə görə **enə görə resize** olunur (kiçik şəkil böyüdülür):

  | Sahə | En (px) |
  |---|---|
  | homepage link ikonu | 40 |
  | avatar | 128 |
  | banner | 240 |
  | homepage publication | 510 |
  | pul nişanı (ön/arxa) | 800 |
  | qalereya, təşkilat fotoları | 1200 |
  | xəbər slayderi | 1920 |

- Sənədlər (PDF, xlsx, doc, zip...) `UploadAssetsBehavior` ilə re-encode olunmadan saxlanılır. Faylı dəyişəndə **köhnə ad saxlanılır**, yəni public URL eyni qalır.
- Bəzi fayllar CMS-dən kənar, sabit yollardadır: `visitor/web/compounded_term.pdf` (admin-dən yüklənir), `2024_2026_*.pdf`, `methodology_for_azir*.pdf`, `bankinfonew/*.xml` (API ilə gəlir).

---

## 3. Maliyyə və statistika məlumatları

Saytın əsas biznes dəyəri buradadır. Bu məlumatlara banklar, biznes və xarici sistemlər gündəlik istinad edir.

### 3.1 Rəsmi valyuta məzənnələri

**Nə üçün vacibdir:** AZN-in rəsmi məzənnəsi mühasibatda xarici valyuta aktivlərinin yenidən qiymətləndirilməsi, gömrük və vergi hesablamaları üçün hüquqi istinaddır. Xarici sistemlər XML feed-i avtomatik idxal edir.

**Məlumat modeli** — `common/models/CurrencyRates.php`, cədvəl `currency_rates` (tarixi adı `aznrates`):
- **Geniş cədvəl:** hər sətir bir tarixdir, ~63 valyuta sütunu **string** kimi (`usd`, `eur`, `rub`, `try`, `gbp`, ..., `sdr`, qiymətli metallar `xau`, `xag`, `xpt`, `xpd`, ləğv olunmuş `eek`, `lvl`, `ltl`).
- Yeni valyuta = `ALTER TABLE` + kod dəyişikliyi.

**Daxil edilmə (admin)** — `admin/controllers/CurrencyController.php`, `admin/behaviors/UploadCurrencyBehavior.php`:
1. Redaktor tarix və xlsx faylı yükləyir.
2. Fayl `B7:G100` aralığından oxunur: **B = 3 hərfli ISO kod, G = məzənnə** (`round(…, 4)`). Sətir 1–6 və C–F sütunları nəzərə alınmır.
3. **`XDR` kodu `sdr` sütununa** yazılır. Tanınmayan kodlar səssizcə atlanır.
4. Sonra bütün sütunlar əl ilə düzəldilə bilər; sətri aktiv/deaktiv etmək və silmək olar.

**Məzənnə seçimi qaydaları:**

| Metod | Məntiq | Qeyd |
|---|---|---|
| `getLastCurrency` (L137) | `active=1`, `ORDER BY id DESC` | ⚠️ tarixə görə yox, **id-yə görə** "son" |
| `getPreviousCurrency` (L145) | eyni, `OFFSET 1` | trend oxları üçün |
| `getCurrencyByDate` (L153) | `date <= D`, `active=1`, `ORDER BY date DESC` | **D tarixində qüvvədə olan** məzənnə — həftəsonu/bayram üçün əvvəlki iş günü |
| `getCurrencyBetweenDates` (L160) | `date BETWEEN`, bir valyuta | dövr üzrə tarixçə |

**Public səhifələr** (`visitor/controllers/CurrencyController.php`):

- **`/currency/rates`** — günün məzənnələri:
  - Cədvəl: kod, nominal+ad, məzənnə (**həmişə 4 onluq rəqəm**), trend oxu (↑/↓/dəyişməyib, əvvəlki sətirlə müqayisə).
  - Sıra və nominal/ad `Yii::t('other','currencies')` massivindən gəlir (`common/messages/az/other.php:19-82`). Boş məzənnəli valyuta göstərilmir.
  - HTML-də `sdr` → **`XDR`** yazılır.
  - Tarix seçmək olur (`?date=dd/mm/yyyy`).
  - Excel export (`?export=true`, `visitor/helpers/CurrencyExportHelper.php:90`): sütunlar `Code`, `Rate`; fayl `AZN-Currencies - dd.mm.yyyy.xlsx`.
  - 4 qeyd paraqrafı (`AZN-Currency-Note-*` açarları) və XML feed linki.
- **`/currency/custom`** — bir valyutanın dövr üzrə tarixçəsi (dateFrom, dateTo, kod) + Excel (`Date`, `<valyuta adı>`). Mühasiblər dövr üzrə orta məzənnə üçün istifadə edir.
- **`/currency/today`** — bugünkü XML-i saytın öz prod URL-indən proxy edir.
- **Ana səhifə kartları:** 1 USD, 1 EUR, 100 RUB, 1 TRY + trend oxu.

**Tarixdən asılı nominal etiketləri** (`visitor/views/currency/rates.php:70-102`, `xml.php:50-105` — iki yerdə təkrarlanır). Denominasiya və nominal dəyişikliklərini tarixi baxımdan düzgün göstərir:

| Şərt | Etiket | Mənası |
|---|---|---|
| `byn`, tarix < 01.07.2016 | `byn100` | Belarus rublunun denominasiyasından əvvəl |
| `tmt`, 02.10.2005 ≤ tarix < 12.01.2009 | `tmt100` | TMT nominalı 100 |
| `irr`, `uzs`, `lbp`, `jpy`, tarix < 02.10.2005 | `1irr` və s. | AZN denominasiyasından əvvəl nominal 1 |
| `kzt`, `rub`, `irr`, tarix < 18.11.2024 | `2kzt` və s. | köhnə nominallar |
| digər | cari etiket | 100 RUB, 100 KZT, 10000 IRR... |

**XML feed — `/currencies/DD.MM.YYYY.xml`** (`CurrencyController::actionXml`, L87–103; şablon `visitor/views/currency/xml.php`):

```xml
<ValCurs Date="dd.mm.yyyy" Name="AZN məzənnələri" Description="...bülleteni">
  <ValType Type="Bank metalları">
    <Valute Code="XAU"><Nominal>1 t.u.</Nominal><Name>…</Name><Value>…</Value></Valute>  <!-- XPD, XPT, XAG, XAU -->
  </ValType>
  <ValType Type="Xarici valyutalar">
    <Valute Code="USD"><Nominal>1</Nominal><Name>1 ABŞ dolları</Name><Value>1.7000</Value></Valute>
  </ValType>
</ValCurs>
```

- Seçim `getCurrencyByDate` ilə — bazar günü üçün cümənin məzənnəsi.
- Metallar ayrıca blokda, sırası hardcoded, nominal `1 t.u.` (troya unsiyası).
- **XML-də `SDR` saxlanılır** (HTML-dən fərqli olaraq `XDR` yox).
- `Nominal` etiketdən rəqəmlər çıxarılaraq alınır; `Value` DB-dəki xam dəyərdir.
- Səhv tarix və ya məlumat yoxdursa — **ana səhifəyə redirect** (404 yox).
- **Bu format kontraktdır**: element adları, sıra və rəqəm formatı dəyişdirilməməlidir.

→ notdoneyet §1.2, §2.1 (xlsx import), §4.3 (`currency_rates`)

### 3.2 AZIR — Azərbaycan Banklararası Faiz Dərəcəsi

**Nədir:** Bloomberg platformasında banklar arasında manatla bağlanan əqdlərin orta çəkili faiz dərəcəsinə əsaslanan indekslər. Pul siyasətinin əsas əməliyyat göstəricisidir; üzən faizli kreditlər üçün etalon kimi istifadə olunur.

| İndeks | Mənası |
|---|---|
| **1D AZIR** | overnight — bankların bir günlük manat likvidliyinin qiyməti (əsas göstərici) |
| **TF AZIR 30D / 90D / 180D** | 1D AZIR-in dövr üzrə mürəkkəb faizlə yığılmış ortası (compounded term). Metodologiya `compounded_term.pdf` |
| **AZIR TFAI** | yığılmış indeks səviyyəsi — faiz deyil, ona görə `%` olmadan göstərilir |
| **LAST MIN RATE / LAST MAX RATE** | ayrıca sətir kimi daxil edilən son min/max dərəcə |
| **`*` (ulduz)** | başlıqda `*` varsa, indeks **ehtiyat plan əsasında** hesablanıb (məs. əqd olmayıb); footnote göstərilir |
| **15.05.2025** | yeni metodologiyanın başlama tarixi (qrafikdə xəbərdarlıq) |

**Məlumat modeli** — `common/models/Azir.php`, cədvəl `azir_indexses` (migration-da yoxdur):
- `title_az/en`, `faiz_az/en` (faiz), `eqd_hecm_az/en` (əqd həcmi), `eqd_hecm_usd`, `eqd_say_az/en` (əqd sayı), `date`, `order_column`, `home_view`, `date_view`.
- **İndeks növü başlığın mətnindən tanınır** (`title_az LIKE '1D AZIR%'`, `'TF AZIR 30D%'`, `'AZIR TFAI%'`...). Redaktor başlığı dəyişsə, qrafik və statistika qırılır.

**Admin** (`admin/controllers/AzirController.php`):
- Əlavə/redaktə formu. `date_view=1` seçiləndə digər sətirlərdən bu bayraq silinir — tarixi yalnız bir sətir daşıyır.
- "Ana səhifədən hamısını çıxar" (`clean`: `home_view = null`).
- `show_before_day` bayrağını dəyişmək (`before`) — "Əvvəlki günün indeksinə görə hesablanmışdır" qeydi.
- `compounded_term.pdf` yükləmə (`upload`, L292–324) — sabit yola `visitor/web/compounded_term.pdf`.
- ⚠️ SQL string birləşdirmə ilə qurulur (SQL injection) və INSERT-də sütun sırası səhvdir (bax §10).

**Public — `/indeks/rates`** (`visitor/controllers/IndeksController.php:32`):
1. AZIR qrafiki (son 60 gün, `/indeks/chart-data` AJAX, L62).
2. Filtr: `dateFrom` default **bu gün − 60 gün**; `dateTo` boşdursa ana səhifəyə redirect.
3. 1D AZIR cədvəli: Tarix, Faiz, Əqd həcmi, Əqd sayı. Yalnız `faiz_az > 0` sətirlər. Ulduzlu sətirlərdə `*`.
4. Statistika bloku (`Azir::collectData`, L26):

   | Göstərici | Hesablama |
   |---|---|
   | Son tarix, son faiz | `MAX(date)` üzrə 1D |
   | Aylıq dəyişmə | son faiz − əvvəlki ayın son dəyəri |
   | İllik dəyişmə | son faiz − keçən ilin 31 dekabr dəyəri |
   | Son 1 il min/max faiz | `NOW() - INTERVAL '1 year'` |
   | Son min/max dərəcə | `LAST MIN RATE` / `LAST MAX RATE` sətirləri |
   | Son əqd həcmi + aylıq dəyişmə | 1D həcmi |
   | Həcm min/max | ⚠️ "son 1 il" yazılır, faktiki keçən il + cari il |
   | USD ekvivalenti | son həcm / son USD məzənnəsi, 2 onluq |

5. Excel export (`visitor/helpers/IndeksExportHelper.php:76`), sheet `1D AZIR`.

**Ana səhifə "Pul Bazarı" kartı:** 1D (ulduzlu ola bilər), TF 30D/90D/180D faizləri, TFAI (faizsiz), qrafik; düymələr `/indeks/rates`, `/compounded_term.pdf`, `/methodology_for_azir_{az|en}.pdf`.

`/indeks/all` (bütün indekslər bir tarixə) söndürülüb — ana səhifəyə redirect ("Irada ask me closed").

→ notdoneyet §1.5, §2.1, §2.2 (AZIR modeli)

### 3.3 İnformativ bloklar (infolines) — pul siyasəti və makro göstəriciləri

**Nədir:** dövri yenilənən tək-dəyərli göstəricilərin tarixçəsi. Hər göstəricinin bir `alias`-ı var. Model `common/models/InfoLines.php`, cədvəl `infolines` (migration-da yaradılmır).

| Alias | Mənası | Niyə vacibdir |
|---|---|---|
| `corridor_percent` | **Uçot faiz dərəcəsi** — əsas pul siyasəti faizi | müqavilələrdə, cərimə hesablamalarında istinad olunur |
| `corridor_min` | faiz dəhlizinin aşağı həddi (CB-nin likvidlik cəlbetmə faizi) | pul bazarında faizlərin döşəməsi |
| `corridor_max` | faiz dəhlizinin yuxarı həddi (likvidlik təminetmə faizi) | pul bazarında faizlərin tavanı |
| `money_reserve_usd` | strateji valyuta ehtiyatları, mln USD | makro analiz |
| `money_base` | pul bazası, mln AZN | makro analiz |
| `bank_credit`, `bank_nation`, `bank_capital`, `bank_actives` | bank sektoru: kredit portfeli, əhalinin əmanətləri (IMF metodologiyası footnote-u), kapital, aktivlər | sektor sağlamlığı |
| `nots_volume` | dövriyyədəki CB notlarının həcmi | likvidlik sterilizasiyası |
| `nots_levels_7/28/84/168/252` | CB notlarının 7–252 günlük gəlirliliyi (%) | qısamüddətli gəlirlilik etalonu |
| `deposit_volume`, `deposit_levels_14/28` | CB depozit hərracları | (ana səhifədə şərhə alınıb) |

**CB notları:** Mərkəzi Bankın qısamüddətli qiymətli kağızları. Bank sistemindəki artıq manat likvidliyini çəkmək üçün hərracda satılır. `nots_levels_*` hərracda formalaşan orta çəkili gəlirlilikdir.

**Qaydalar:**
- Sahələr: `alias`, `date` (Unix timestamp), `value` (**string** — `'6.03%'`, `'—'`, `'none'` ola bilər).
- **Yeni alias yalnız DB-yə birbaşa yazı ilə** yaranır; admin menyusu `SELECT DISTINCT alias`-dan dinamik qurulur.
- Ana səhifədəki "son dəyər" `getLastValueByAlias` ilə — ⚠️ **id-yə görə**, tarixə görə yox.
- **7 günlük not** yalnız `settings_saf.show_7gunluk = 1` olanda göstərilir (instrument müvəqqəti buraxılmaya bilər). Admin-də toggle: `InfoBlocksController::actionActive`.

**Public — `/infoblocks/<alias>?year=`** (`visitor/controllers/InfoBlocksController.php:24`):
- Alias DB-dəki DISTINCT siyahıda yoxdursa, ana səhifəyə redirect.
- İl default cari il; ilin bütün dəyərləri cədvəldə.
- **Dedup qaydası:** 01.08.2023-dən əvvəlki dəyərlər olduğu kimi; sonrakılardan yalnız dəyəri əvvəlkindən **fərqli** olanlar — redaktorlar hər gün eyni dəyəri təkrar daxil edir, ekranda yalnız dəyişiklik anları görünür.
- Başlıqda il Azərbaycan dilinin sıra şəkilçisi ilə ("2024-cü il") — son rəqəmə görə -ci/-cü/-cı/-cu.

**Ana səhifədə istifadə:**
- Faiz dərəcələri kartı: dəhlizin həddləri + uçot dərəcəsi, hər biri `/infoblocks/<alias>`-a link.
- Monetar göstəricilər: ehtiyatlar, pul bazası.
- CB notları: həcm və səviyyələr + notlar qrafiki (`/home/money-market-chart`, 7 günlük bayrağa görə 4 və ya 5 nöqtə).
- Bank sektoru: kredit, əmanətlər.

→ notdoneyet §1.3, §1.6, §4.3 (`infolines` tarixçəsi)

### 3.4 Aylıq inflyasiya

- Model `common/models/MonthlyInflationParameters.php` — **tək sətir** (`id=1`): `current_inflation` (rəqəm), `target_inflation` (string, məs. "4±2%"), `next_update_date`.
- Ana səhifədə cari və hədəf inflyasiya, növbəti yeniləmə tarixi — pul siyasətinin əsas kommunikasiya elementi.
- ⚠️ **Qrafik hardcoded-dur:** `visitor/web/plugins/chart-js/init.js` — 2025–2026 aylıq dəyərləri JS-də yazılıb. Hər ay developer faylı əl ilə dəyişməlidir; mətn və qrafik uyğun gəlməyə bilər.

### 3.5 Gəlirlilik əyrisi (Yield Curve, Nelson–Siegel)

**Nədir:** dövlət qiymətli kağızlarının müddətə görə gəlirliliyi (X — gün, Y — %). CB bazar məlumatını Nelson–Siegel modeli ilə hamarlaşdırır:

y(τ) = β₀ + β₁·[(1−e^(−λτ))/(λτ)] + β₂·[(1−e^(−λτ))/(λτ) − e^(−λτ)]

- **β₀** — uzunmüddətli səviyyə; **β₁** — meyl (qısa və uzun faiz fərqi); **β₂** — əyrilik ("donqar"); **λ** — əyriliyin maksimumunun müddəti.
- **Niyə vacibdir:** istiqrazların qiymətləndirilməsi, diskont faizləri, risksiz faiz etalonu (banklar, investorlar, sığortaçılar, aktuarilər).

**Məlumat modeli:**

| Model | Cədvəl | Sahələr |
|---|---|---|
| `YCYields` | `yield_curve_yields` | `date`, `period` (gün), `profitability` (%) — əyrinin nöqtələri |
| `YCParams` | `yield_curve_parametrs` | `date`, `beta_0`, `beta_1`, `beta_2`, `lambda` |
| `YCPeriods` | `yield_curve_periods` | `date`, `three_month` … `four_year` — 7 standart müddət |

**Admin — 3 Excel importu** (`admin/controllers/YieldCurveController.php`). Hər biri **həmin tarixin köhnə datasını əvvəlcə silir**, sonra yazır (tranzaksiya və validasiya yoxdur):

| Import | Excel strukturu (1-ci sətir başlıq) |
|---|---|
| Yields (L75–124) | hər sətir bir nöqtə: **B = period, C = gəlirlilik** |
| Parametrlər (L133–185) | **A = β₀, B = β₁, C = β₂, D = λ** |
| Periodlar (L195–248) | tək yazı: **C2 = 3 ay, C3 = 6 ay, C4 = 9 ay, C5 = 1 il, C6 = 2 il, C7 = 3 il, C8 = 4 il** |

Tarixə görə silmə action-ları da var.

**Public — `/home/chart`** (`visitor/controllers/HomeController.php:98`, məntiq view-dadır: `visitor/views/home/chart.php`):
- nvd3 əyri qrafiki; X tick-ləri 3 ay … 5 il.
- **Datepicker-də yalnız məlumatı olan günlər aktivdir.**
- **Çox tarix seçib əyriləri üst-üstə müqayisə** etmək olur (AJAX `/home/yield`).
- Parametrlər paneli (β₀, β₁, β₂, λ) və "Yields %" cədvəli (7 standart müddət).
- "Download data" — bütün `YCPeriods` tarixçəsi xlsx (⚠️ seçilmiş tarixlər nəzərə alınmır, fayl diskə `download.xlsx` yazılır).
- Metodologiya PDF-i dilə görə.
- Ana səhifədə mini əyri (son tarix) → "Daha çox" `/home/chart`.

→ notdoneyet §1.4, §2.1, §2.2

### 3.6 Rəqəmsal ödənişlər statistikası

**Nədir:** Milli Ödəniş Sistemi göstəriciləri — AZİPS (real vaxt banklararası hesablaşma, iri məbləğlər), XÖHKS (xırda ödənişlər klirinqi), AÖS (ani ödənişlər), elektron bankçılıq, ödəniş kartları, POS, ATM. Fintech-lər, banklar, tədqiqatçılar, media üçün.

- Mənbə: ikinci baza `statsDB`, ETL cədvəlləri `mb_ovs_v01` (yarımillik) və `mb_ovs_v02` (aylıq); sütunlar `parent_id`, `part_year`, `year`, `lvl_id`, `lvl_nm`, `amount`, `etl_dt_tm`. `common/models/AnnualStats.php`.
- Səhifələr: `/pages/stats-monthly`, `/pages/stats-yearly` — hər birində ~27 ApexCharts qrafiki, 3 accordion bölməsi (`PagesController.php:120-125`).
- JSON endpoint-lər (`StatsController`, `StatsMonthlyController`):

  | Endpoint | Məntiq |
  |---|---|
  | `first/<id>-<limit>` | bir seriya, `parent_id = id`, son N dövr (yarımillik default 9; aylıq: son 13 ay, `amount > 0.7`) |
  | `second/<id>-<limit>` | iki seriya, `lvl_id`-yə görə bölünür |
  | `third/<id>-<limit>` | pie qrafik; yarımillikdə `year < 2022` hardcoded |

- Qrafik ↔ `parent_id` xəritəsi yalnız JS-dədir (`init-monthly.js`, `init-yearly.js`), sənədləşdirilməyib.

→ notdoneyet §1.7

### 3.7 Maliyyə bazarı iştirakçılarının reyestri

**Nədir:** CB-nin lisenziyalaşdırdığı subyektlərin rəsmi siyahısı. Əhali və biznes kontragentin lisenziyalı olub-olmadığını yoxlayır; banklar due diligence edir.

- `/registry` — 15 kateqoriya: banklar, BOKT-lar (bank olmayan kredit təşkilatları), kredit ittifaqları, investisiya şirkətləri, fond birjaları, klirinq təşkilatları, depozitarlar, investisiya fondları, sığortaçılar, sığorta vasitəçiləri, törəmə və ekspertlər, xarici sığortaçılar, aktuarilər, poçt operatoru, valyuta mübadilə məntəqələri.
- `/registry/detail?category=` — məlumat **canlı olaraq** `api-registry-public.e-cbar.az/api/OutToPublic/*` JSON-dan alınır; `download=1` → `OutToPublicXLSX/*`.
- `/registry/download` — 6 əlavə yüklənən siyahı (fərdi/hüquqi agentlər və brokerlər, xarici bank nümayəndəlikləri, bank filialları).
- Kod: `visitor/controllers/RegistryController.php`, `visitor/helpers/RegistryHelper.php`, `visitor/viewmodels/RegistryViewModel.php`, `visitor/providers/ApiDataProvider.php`.
- ⚠️ `RegistryHelper::getApiUrl`-da prod xəritəsində yalnız `banks` var; `legal-brokers` və `foreign-banks` səhv URL-ə gedir. Xəta emalı yoxdur.

→ notdoneyet §1.11

### 3.8 BankInfo XML push API

**Nədir:** CB-nin daxili sistemi bank məlumatlarını (banklar, baş ofislər, yeniləmə tarixçəsi, NBPSP) XML faylları kimi sayta göndərir; sayt onları statik fayl kimi dərc edir. Kontent səhifələrindəki linklər bu sabit URL-lərə baxır.

- Endpoint: `POST <admin-host>/api/bank-info` (`admin/modules/api/controllers/BankInfoController.php`, `models/BankInfoModel.php`).
- **Auth:** `Authorization: Bearer <access_token>`; token `users.access_token`, `active=1` və `expire_at > now` yoxlanır. Token login zamanı yaranır, **366 gün** etibarlıdır. Rol yoxlanmır.
- **Limitlər:** multipart `xmlFiles[]`, maksimum 3 fayl, hər biri ≤ 3 MB, `.xml`, MIME `application/xml`/`text/xml`.
- **Davranış:** fayl **orijinal adı ilə** `visitor/web/bankinfonew/`-ə yazılır, köhnənin üstünə. Public URL-lər: `/bankinfonew/banks.xml`, `headoffices.xml`, `updatehistory.xml`, `NBPSP_headoffices.xml`.
- Cavab JSON `{"<fayl>": "Success"}` (⚠️ yazma nəticəsi yoxlanmadan); xətada `{"errorMessage": [...]}` HTTP 200 ilə.
- Kontentdə 54 link `bankinfonew`-a baxır.

→ notdoneyet §0, §2.1

---

## 4. Kontent modulları

### 4.1 Səhifə ağacı (CMS səhifələri)

**Niyə vacibdir:** saytın bütün statik bölmələri (Haqqımızda, Pul siyasəti, Maliyyə sabitliyi, Statistika, Qanunvericilik...) və yüklənən PDF/Excel hesabatları buradadır. Saytın ən böyük kontent həcmi (dump-da 479 səhifə, 2226 asset).

**Model** — `common/models/Pages.php` (public), `admin/models/Pages.php` (kartik Tree):
- Nested set: `parent_id` (**kök id-si**, valideyn deyil), `left_position`, `right_position`, `depth`.
- **Kök 1 = TOP menyu, kök 2 = LEFT menyu** (hamburger / "Digər").
- `title_az/en`, `content_az/en`, `slug` (`title_en`-dən avtomatik), `url` (doldurularsa səhifə linkə çevrilir), `active`, `visible`, `show_az`, `show_en`, `show_footer`, `readonly`.
- Admin-də yeni kök yaratmaq olmaz (`allowNewRoots=false`); silmə fizikidir, uşaqlarla birlikdə.

**Public qaydalar:**
- URL `/page-{id}/{slug}` — **slug yoxlanmır**, ID həlledicidir.
- `getPageByID` (L126–137): `active=1 AND show_{lang}=1` **VƏ YA** `readonly=1`.
- Menyu: `visible=1 AND show_{lang}=1`, `left_position` üzrə (keşlənir).
- Link: `url` doludursa o, deyilsə `/page-{id}/{slug}`.
- Məzmun HtmlPurifier-dən keçir (iframe whitelist: YouTube, Vimeo, Google Maps).

**Səhifə assetləri** (`common/models/PagesAssets.php`, admin `PagesController::actionAssets`):
- `title_az/en`, `filename_az` (məcburi), `filename_en`, `position`, `cover`, `visible`.
- Səhifənin altında yükləmə bloku: uzantı ikonu, cari dildə başlıq, fayl ölçüsü.
- `cover=1` olan ilk şəkil — səhifənin üz şəkli.
- **Dil qaydası** (`common/helpers/FileHelper.php`): `filename_{lang}`, yoxdursa `filename_az`; lakin EN-də `filename_en`-i olmayan **şəkil-olmayan** fayllar gizlənir.
- Admin-də "Copy URL" — redaktorlar linki səhifə mətninə yapışdırır (sənəd kitabxanası kimi).

**`#asset-N` shortcode** (`visitor/web/js/custom.js:36-75`):
- Redaktor mətndə `<a href="#asset-3">` yazır → JS 3-cü mövqedəki asseti tapır:
  - şəkildirsə — 200px thumbnail (lightGallery) linkin yerinə qoyulur;
  - sənəddirsə — yükləmə linki klonlanır.
- Asset yükləmə blokundan çıxarılır. Qalan şəkillər qalereyaya çevrilir.
- Köhnə səhifələrdə geniş istifadə olunur.

**Xüsusi səhifələr (hardcoded ID-lər):**

| ID / slug | Davranış |
|---|---|
| `contacts` | Google Maps qoşulur |
| 898 | məxfilik siyasəti — yan menyu yoxdur |
| 877 | org-chart (`visitor/views/structure/_orgchart.php`) render olunur (əvvəl 900 idi) |
| 146–164 (154 xaric) | 100 illik yubiley: xüsusi yan menyu (`TempMenuWidget`), banner, "ətraflı oxu" 2700px (`visitor/helpers/AnniversaryHelper.php`) |
| 27, 129, 130 | pul nişanları bölməsi |
| 182 | ESİD (MEAS) haqqında |
| 3, 11, 39, 46, 56, 723 | footer linkləri |

**Maliyyə sektoru strategiyası** — `/pages/strategy` (`PagesController::actionStrategy`, L88–113): 2024–2026 strategiyası; mətn, hədəflər cədvəli və PDF-lər kodda hardcoded; desktop-da iframe, mobildə birbaşa link.

→ notdoneyet §1.1, §1.10, §2.2 (assetlər), §4.2 (kontentdəki linklər)

### 4.2 Press-relizlər və elanlar

**Niyə vacibdir:** CB-nin rəsmi bəyanatları (uçot dərəcəsi qərarları — bazara təsir edən məlumat) və elanlar (tenderlər, vakansiyalar).

**Model** — `common/models/PressReleases.php`:
- `type`: **1 = press-reliz, 2 = elan**.
- `title_az/en`, `content_az/en`, `date`, `active` (yeni yazıda 0), `slug`.
- Assetlər `PressReleasesAssets` (`title`, `title_en`, `filename_az/en` — ikisi də məcburi, `position DESC`).

**Public:**
- **`/press-releases/{type}?dateFrom=&dateTo=`** (`visitor/controllers/PressReleasesController.php:30-51`):
  - `active=1 AND type AND date <= bu gün`.
  - Tarix filtri default: **cari ayın 1-i**-ndən.
  - `date DESC, id DESC`, səhifədə 8.
- **`/press-release-{id}/{slug}`** (L95–114): məzmun, assetlər (`#asset-N` işləyir), tarix. ⚠️ active/tarix yoxlanmır.

**Sorğu (poll) — press-relizə rəy sualı:**
- Admin (`admin/controllers/PressReleasesController.php`, `question*` action-ları): yalnız type=1 relizə sual (az/en mətn, aktiv) bağlanır; yeni sual deaktiv yaranır; cavablar ekranı (`val` + `note`).
- Public detal səhifəsində: hər baxışda sualın `visit` sayğacı artır; 1–5 bal ("1-çox pis, 5-mükəmməl") + qeyd formu.
- Səs: `GET /press-releases/pass?id&value&note` → `press_reliz_statistics`-ə yazılır; `question-{id}` session cookie-si təkrar səsi bloklayır.
- ⚠️ `press_reliz_id` sütunu əslində **sual id-sini** saxlayır. GET ilə yazma, validasiya yoxdur.

→ notdoneyet §1.8, §1.9, §2.1, §2.2

### 4.3 Qanunvericilik bazası

**Niyə vacibdir:** CB-nin fəaliyyətini tənzimləyən normativ aktların ictimai açıqlığı; hüquqi əhəmiyyət daşıyır.

- Model `common/models/Laws.php`: `category_id`, `type`, `title_az/en`, `description_az/en` (tam mətn), `slug`, `active`.
- **Növlər:** 1 Konstitusiya, 2 Konstitusiya Qanunu, 3 Qanun, 4 Fərman, 5 Sərəncam, 6 Qərar, 7 Qətnamə, 8 Müxtəlif orqanların aktları.
- `active` mənası: **qüvvədədir (1) / qüvvədən düşüb (0)** — amma public-də filtrlənmir və göstərilmir.
- `/laws/index` (`visitor/controllers/LawsController.php`, `visitor/viewmodels/LawsViewModel.php`):
  - açar söz (ILIKE): `searchType=1` başlıqda, `=2` mətndə (az və en birlikdə);
  - növ filtri; default sıralama başlığa görə; səhifədə 8.
- `/law-{id}/{slug}` — tam mətn.
- Kateqoriyalar (`LawsCategories`) public-də göstərilmir.

→ notdoneyet §1.8

### 4.4 MEAS / ESİD — emitentlərin məlumatlarının açıqlanması

**Niyə vacibdir:** qiymətli kağız emitentlərinin məcburi açıqlamaları (maliyyə hesabatları, əhəmiyyətli faktlar) kapital bazarının şəffaflığı və investorların qorunması üçün. CB bazar tənzimləyicisidir. Bu işi ayrıca şöbə görür, ona görə **ayrıca rol (MEAS_MANAGER)** var.

- Modellər: `Meas` (sənəd), `MeasEmitent` (emitent: `name_az/en`), `MeasInfoType` (məlumat növü: `name_az/en/ru`).
- Sənəd sahələri: `emitent_id`, `info_type_id`, `doc_type_id` (**1 = İstiqraz, 2 = Səhm**), `reg_date` (string), `dqn` (dövlət qeydiyyat nömrəsi), `file_path` (**yalnız PDF**), `active` (default 1 — dərhal public).
- Admin: `admin/modules/meas/` — sənəd, emitent, məlumat növü CRUD.
- Public `/meas/index` (`visitor/controllers/MeasController.php`, `visitor/viewmodels/MeasViewModel.php`):
  - filtrlər: emitent, məlumat növü, sənəd növü, DQN (dəqiq), `reg_date` aralığı (hər iki tarix veriləndə);
  - `reg_date DESC, id DESC`, səhifədə 8;
  - cədvəl: emitent, PDF yükləmə, məlumat növü, sənəd növü, tarix, DQN.
- Header-də MEAS dropdown: `/meas/index` və "Haqqında" `/page-182/about-esid`.

→ notdoneyet §1.8, §2.2, §3

### 4.5 Milli pul nişanları (əskinas və sikkələr)

**Niyə vacibdir:** CB emissiya orqanıdır. Əskinas və sikkələrin rəsmi təsviri və **təhlükəsizlik əlamətləri** saxta pulla mübarizə üçün ictimaiyyətə açıqlanır.

- **Kateqoriyalar** (`MoneyMarksCategories`) — emissiya seriyaları: `title_az/en`, `description_az/en`, `slug`.
- **Pul nişanları** (`MoneyMarks`): `type` (**1 = əskinas, 2 = sikkə**), `category_id`, `title_az/en`, `front_image`, `rear_image` (800px), `description_az/en`, **`secure_az/en`** (təhlükəsizlik elementləri), `video_url`, `position` (`type + category_id` qrupunda).
- **Xəbərlər** (`MoneyMarksNews`): `title/content az/en`, `date`, `active`.
- Public (`visitor/modules/moneymarks/`):
  - `/moneymarks/banknotes/index?category=N`, `/moneymarks/coins/index?category=N` — kateqoriya təsviri + nişanlar;
  - `detail/{id}` — ön və arxa şəkil, tablar: Əsas xüsusiyyətlər / Təhlükəsizlik elementləri / Video;
  - `/moneymarks/news` — xəbərlər;
  - yan panel: "Maraqlı pullar" (129), "Azərbaycan manatı" (130), `bizimpullar.az`.

→ notdoneyet §2.2

### 4.6 Təşkilat — rəhbərlik, bölmələr, ərazi idarələri

**Niyə vacibdir:** idarəetmə şəffaflığı, vətəndaş qəbulu günləri, regional şəbəkə.

| Bölmə | Model | Sahələr | Public URL |
|---|---|---|---|
| İdarə Heyəti (type 1), Rəhbərlik (type 2) | `OrganizationStaff` | `name`, `job`, `about`, `reception_days` (az/en), `phone`, `photo`, `position` | `/organization/management-{1\|2}`, `/organization/staff/detail/{id}` |
| Struktur bölmələri | `OrganizationDivisions` | `title`, `director_name`, `director_position` (az/en), `director_email`, `filename_az/en` (əsasnamə) | `/organization/divisions` |
| Ərazi idarələri | `OrganizationOffices` | `title`, `director_name`, `adress` (az/en), `phone`, `photo`, `filename_az/en` | `/organization/offices` |

- **Sədr xüsusi göstərilir:** `type=1 AND position=1` olan şəxs böyük kartda.
- Bölmələrdə "Empty" sehrli sətri — hər iki ad "Empty"-dirsə rəhbər sətri gizlənir. Əsasnamə yalnız az dilində.
- **Org-chart** (`/structure` və səhifə 877): `visitor/views/structure/_orgchart.php` (403 sətir) — inline SVG, mətnlər `common/messages/{az,en}/structure.php`-də. **Kadr dəyişikliyi kod deploy-u tələb edir.**

→ notdoneyet §1.11, §2.2

### 4.7 Multimedia

- **Fotoqalereya** (`Gallery`, `GalleryImages`): albom (`date`, `title/content az/en`, `slug`), şəkillər 1200px. Public `/gallery/photos` (`active AND date <= bu gün`), `/gallery/photos/detail/{id}`. Ana səhifədə son 6 albom.
- **Videolar** (`Videos`): YouTube URL, `date`, başlıq. Public `/videos` (`active AND date <= bu gün`, `date DESC`), lightGallery. Ana səhifədə son 6.
- **Canlı yayım** (`VideosStreams`): pul siyasəti mətbuat konfransları. Aktiv stream varsa header-də "Canlı yayım" düyməsi və popup (`visitor/widgets/LiveStreamWidget.php`).

→ notdoneyet §1.8, §2.2

### 4.8 Ana səhifə elementləri

| Element | Model | Qayda | Məqsəd |
|---|---|---|---|
| **Qaçan sətir** | `RunningLine` | tək qeyd `id=1`, `activity=true`; `line_text_{lang}`, `link_{lang}` | təcili elanlar (saxta saytlar, iş rejimi) |
| **Xəbər slayderi** | `NewsSlider` | `is_active`, `ordering`; şəkil 1920px, tarix, başlıq, təsvir, link; 6 s-dən bir keçir | əsas xəbərlər |
| **Faydalı linklər (bannerlər)** | `Banners` | `position`; şəkil 240px, URL, domen göstərilir | xarici resurslar |
| **Sürətli keçidlər** | `HomepageLinks` | ikon 40px, `url_az/en` | tez-tez istifadə olunan bölmələr |
| **Nəşrlər** | `HomepagePublications` | **dil üzrə ayrı ikon** `icon_az/en` 510px, `date_publication` | illik hesabat, pul siyasəti icmalı, maliyyə sabitliyi hesabatı |
| Maliyyə blokları | bax §3 | məzənnə, faiz dəhlizi, inflyasiya, pul bazarı, notlar, gəlirlilik əyrisi, bank sektoru | |
| Son press-relizlər, qalereya, video | | hər birindən 4–6 | |
| 100 illik yubiley banneri | | → `coin.e-cbar.az` | |
| **Sorğu popup-ı** | — (kodda hardcoded, `visitor/views/home/index.php`) | hər ana səhifə açılışında göstərilir (cookie yoxdur), hər iki dildə; şəkil `/images/survey_banner_{az,en}.jpg`, link `e-cbar.az/Survey/Info/203`; CMS-dən idarə olunmur | ictimai sorğuya cəlb etmək |

Qeyd: `visitor/widgets/blocks/*` vidcetləri import olunub, amma çağırılmır — eyni məntiq `visitor/views/home/index.php`-da (1961 sətir) yenidən yazılıb. Hər qayda iki yerdə yaşayır.

→ notdoneyet §1.3, §2.2

### 4.9 Əks əlaqə formu

- `/feedback` (`visitor/controllers/FeedbackController.php`, `visitor/models/FeedbackForm.php`): ad, email, mövzu, mesaj (HtmlPurifier).
- Anti-spam: yalnız cookie — 24 saatda bir müraciət. CAPTCHA yoxdur.
- SwiftMailer ilə `mail@cbar.az`-a göndərilir; ⚠️ **From = istifadəçinin emaili**, ⚠️ **CC şəxsi Gmail ünvanına**. DB-də saxlanmır.
- Footer artıq `contact.e-cbar.az`-a link verir — forma yetim qalıb, URL işləyir.

→ notdoneyet §1.11

---

## 5. Naviqasiya, axtarış, paylaşma

### 5.1 Menyular (`visitor/widgets/menu/`)

- **Desktop üst menyu** (`CombinedMenuWidget`): ilk element hamburger (içində LEFT ağacı), sonra TOP ağacı.
- **Mobil menyu** (`CombinedMobileMenuWidget`): TOP ağacı, "Digər" (LEFT ağacı), qaynar xətt `966`, MEAS dropdown, E-CBAR linki.
- **Səhifənin yan menyusu** (`PagesMenuWidget`): cari səhifənin depth-1 əcdadı və onun uşaqları.
- **Aktiv element** JS ilə işarələnir (`custom.js:4-24`).
- **Header:** qaçan sətir, loqo (dilə görə), canlı yayım, MEAS, axtarış, qaynar xətt 966, dil keçidi, E-CBAR.
- **Footer:** hardcoded səhifə linkləri, telefonlar ((+994 12) 966, 493 5058), `contact.e-cbar.az`, `e-cbar.az/Survey`, sosial şəbəkələr, məxfilik siyasəti (898), sayt xəritəsi.
- **HTML sayt xəritəsi** `/home/sitemap` (`SitemapWidget`): TOP + LEFT ağacı.

### 5.2 Saytdaxili axtarış (Zend Lucene)

- İki fayl indeksi: `siteSearch` (səhifələr, `active=1 AND visible=1`) və `newsSearch` (press-relizlər, `active=1 AND date <= bu gün` — **indeksləmə anında**).
- **İndeks yalnız əl ilə** yenilənir: admin `HomeController::actionIndexSearch`. Yeni reliz reindex edilməyincə axtarışda çıxmır.
- `/search/{type}/{query}`: tip `pages` və ya `press-releases`; sorğu max 40 simvol; nəticələr `pageID DESC` (relevantlığa görə yox), səhifədə 4.
- Nəticə linki `url#sorğu` — hədəf səhifədə söz highlight olunur (`custom.js:33-35`).

### 5.3 RSS

- `/rss/releases[/{language}[/{count}]]` (`visitor/controllers/RssController.php`): RSS 2.0, ttl 40, count ≤ 50, default 10.
- Element: başlıq, **tam HTML** məzmun, detal linki, `pubDate = created_at`.
- ⚠️ `active`/tarix/type filtri yoxdur — qaralama və embargolu relizlər feed-ə düşür.

### 5.4 Paylaşma, analitika, SEO

- Share/print paneli (`visitor/views/layouts/social.php`): mail, LinkedIn, Facebook, X, WhatsApp, çap — valyuta, qanun, səhifə, press-reliz detalında.
- OpenGraph teqləri (`og:url/type/title/description/image`) ~9 view-da.
- Google Analytics `UA-131131414-1` (UA artıq işləmir), Yandex Metrika `51059498` + webvisor.
- Klient əlavələri (`custom.js`): A+/A− şrift ölçüsü (20–28px), "ətraflı oxu", scroll-to-top.

→ notdoneyet §1.1, §1.11

---

## 6. Admin panel: rollar və iş axınları

### 6.1 Rollar

`common/components/identity/UserIdentity.php:19-21`:

| Rol | Dəyər | Nəyə çıxışı var | Harada tətbiq olunur |
|---|---|---|---|
| **ADMIN** | 1 | hər şey, istifadəçilər daxil | `UsersController::behaviors` (L23–40) |
| **MODERATOR** | 2 | istifadəçilərdən başqa hər şey | `MainController::behaviors` (L42–61) — yalnız 1 və 2 |
| **MEAS_MANAGER** | 3 | **yalnız MEAS modulu** (+ öz profili) | `HomeController` onu `/meas/default/index`-ə yönləndirir; `admin/modules/meas/controllers/BaseController.php` istənilən daxil olmuş istifadəçiyə açıqdır |

- Menyuda rol yalnız "Users" üçün yoxlanır — MEAS_MANAGER digər bəndləri görür, klikləyəndə 403 alır.
- ⚠️ kartik `NodeController` (səhifə ağacı əməliyyatları) `MainController`-dən törəmir — rol yoxlaması yoxdur, yalnız hash imza.

### 6.2 Admin menyusu (`admin/views/layouts/menu.php`)

Home · Users · Videos Streams · Currency-Rates · AZIR INDEX · YC YIELDS · YC PARAMETRS · YC PERIODS · Press Reliz Question · Homepage-Links · Publications · Banners · Pages · Press-Releases (type 1) · Announcements (type 2) · Milli pul nişanları · Photo-Gallery · Video-Gallery · Mərkəzi Bank (İdarə Heyəti, Rəhbərlik, bölmələr, ofislər) · MEAS · News-Slider · Running Line · Monthly Inflation · İnformativ bloklar (DB-dən dinamik) · Laws-Page

### 6.3 Ümumi admin davranışı (`common/models/MainModel.php`)

- `created_at`, `updated_at` avtomatik.
- `creator_id` hər save-də cari istifadəçi ilə üzərinə yazılır — **yaradanı yox, son dəyişəni** saxlayır. Ayrıca kontent audit jurnalı yoxdur (yalnız istifadəçi əməliyyatları QRadar-a gedir).
- Grid-lər `id DESC`, səhifədə 8.
- Ssenarilər: `add` (yaratma — fayl məcburi), `default` (redaktə — fayl opsional).

### 6.4 Əsas iş axınları

| İş | Addımlar | Kod |
|---|---|---|
| **Gündəlik məzənnə** | xlsx yüklə (B7:G100) → yoxla/düzəlt → aktiv | `CurrencyController`, `UploadCurrencyBehavior` |
| **AZIR** | hər indeks üçün sətir əlavə et → `home_view`/`date_view` işarələ → lazım olsa `compounded_term.pdf` yenilə | `AzirController` |
| **İnfo göstəriciləri** | alias seç → tarix + dəyər əlavə et; 7 günlük notu aç/bağla | `InfoBlocksController` |
| **Gəlirlilik əyrisi** | tarix seç → 3 Excel (yields, params, periods) yüklə | `YieldCurveController` |
| **İnflyasiya** | tək forma: cari, hədəf, növbəti yeniləmə | `MonthlyInflationController` |
| **Press-reliz** | yarat (deaktiv) → mətn, tarix (embargo üçün gələcək tarix) → assetlər → aktivləşdir → lazım olsa sual əlavə et → **axtarış reindex** → lazım olsa **keşi təmizlə** | `PressReleasesController`, `HomeController` |
| **Səhifə** | ağacda node əlavə et → bayraqlar (active, visible, show_az/en, show_footer) → assetlər (copy URL, `#asset-N`) | `PagesController`, kartik TreeView |
| **MEAS** | emitent və məlumat növü siyahısı → PDF sənəd + DQN + tarix | `admin/modules/meas/` |
| **İstifadəçi** (yalnız admin) | yarat (username, email, rol, parol, avatar məcburi) → aktiv/deaktiv | `UsersController` |
| **Profil** (hamı) | username, email, avatar; yeni parol üçün cari parol tələb olunur; parol dəyişəndə bütün sessiyalar ləğv olunur | `UsersController::actionProfile` |

→ notdoneyet §2

---

## 7. Təhlükəsizlik

### 7.1 Login axını (`admin/controllers/LoginController.php`, `admin/viewmodels/LoginViewModel.php`)

1. **Giriş email ilədir** (`findByUsername` əslində email üzrə axtarır, `active=1`).
2. Kilid yoxlaması (`login_lock_{email}` keşdə).
3. **CAPTCHA:** IP və ya email üzrə 2 uğursuz cəhddən sonra — rəqəmli, 4–5 rəqəm (`common/components/NumericCaptchaAction.php`).
4. **Rate limit:** IP üzrə 60 s-də 10, istifadəçi üzrə 120 s-də 10.
5. **Uğursuz cəhddə** təsadüfi 0.3–0.8 s gecikmə + QRadar `LOGIN FAILED`.
6. **Artan kilid** (sayğac 10 dəqiqə yaşayır):

   | Uğursuz cəhd | Kilid |
   |---|---|
   | 5 | 60 s |
   | 10 | 180 s |
   | 15 | 300 s |
   | 20 | 900 s |

   Kilid anında istifadəçinin **bütün sessiyaları ləğv olunur**.
7. **Uğurlu login:** session ID yenilənir (fixation qoruması), sayğaclar sıfırlanır, sessiya qeydə alınır, QRadar `LOGIN SUCCESS`. `rememberMe` default **true**, 366 gün. Xəta mesajı generikdir.
8. **Çıxış:** QRadar `SIGN OUT`, cari sessiya ləğv.

### 7.2 Sessiyalar (`common/models/UserSession.php`, cədvəl `user_sessions`)

- Hər sessiya: `sha256(session_id)`, user, IP, User-Agent, `last_activity`, `is_revoked`.
- **İstifadəçi başına maksimum 3 aktiv sessiya** — ən köhnəsi ləğv olunur.
- **User-Agent binding:** UA dəyişsə sessiya ləğv olunur (IP binding yoxdur).
- Hər admin sorğusunda yoxlanır (`MainController::beforeAction`).
- `authTimeout` 8 saat (remember-me cookie ilə faktiki yan keçilir).

### 7.3 Parol siyasəti (`common/models/Users.php:36-62`)

- Minimum 8 simvol, kiçik hərf + böyük hərf + rəqəm + `!@#$%^&*` simvolu.
- Köhnə (cari) parolla eyni ola bilməz.
- Hash: Yii `$2y$` bcrypt.

### 7.4 QRadar audit (`common/components/qradar/QradarLogger.php`)

- Fayl `/var/log/cbar_app`, kateqoriya `qradar`.
- Hadisələr: LOGIN SUCCESS / FAILED, SIGN OUT, USER CREATED / UPDATED (dəyişən sahələrin diff-i, parol maskalanır), USER ENABLED / DISABLED, PROFILE EDIT.
- Sahələr: başlıq, dəyişən atribut, təsvir, IP, User-Agent, user id, username, email.
- **Niyə vacibdir:** CB-nin SIEM tələbi — kimin nə vaxt daxil olduğu və istifadəçi hüquqlarını dəyişdiyi izlənməlidir.

### 7.5 API token

- `users.access_token` + `expire_at` — BankInfo API üçün Bearer token, login zamanı yaranır/yenilənir (366 gün).
- Eyni token həm də remember-me cookie-nin auth key-idir.

→ notdoneyet §3

---

## 8. Data modeli

### 8.1 Biznes sahələri üzrə cədvəllər

| Sahə | Cədvəllər |
|---|---|
| Kontent | `pages`, `pages_assets` |
| Mətbuat | `press_releases`, `press_releases_assets`, `press_reliz_question`, `press_reliz_statistics` |
| Qanunlar | `laws`, `laws_categories` |
| MEAS | `meas`, `meas_emitent`, `meas_info_type` |
| Pul nişanları | `money_marks`, `money_marks_categories`, `money_marks_news` |
| Təşkilat | `organization_staff`, `organization_divisions`, `organization_offices` |
| Media | `gallery`, `gallery_images`, `videos`, `videos_streams` |
| Ana səhifə | `banners`, `homepage_links`, `homepage_publications`, `news_slider`, `running_line` |
| Maliyyə | `currency_rates`, `azir_indexses`, `infolines`, `monthly_inflation_parameters`, `yield_curves`, `yield_curve_yields`, `yield_curve_parametrs`, `yield_curve_periods` |
| Statistika (`statsDB`) | `mb_ovs_v01`, `mb_ovs_v02` |
| İstifadəçilər | `users`, `user_sessions` |
| Ayarlar | `settings_saf` (key/value: `show_before_day`, `show_7gunluk`) |

### 8.2 Vacib qeydlər

- **Sxemin təxminən yarısı migration-larda yoxdur** (`common/migrations/` — 39 fayl, 2018–2024): `users`, `currency_rates`, `infolines`, `azir_indexses`, `meas*`, `homepage_publications`, `news_slider`, `running_line`, `settings_saf`, `user_sessions`, `monthly_inflation_parameters`, `press_reliz_*`, `mb_ovs_*`. Bəziləri controller action-larından yaradılıb (`AzirController::actionMigrate`). **Sxemin yeganə etibarlı mənbəyi canlı bazadır.**
- **`users`-ə FK-ların çoxu `ON DELETE CASCADE`** — istifadəçini silmək onun yaratdığı məzmunu silir. İstifadəçi silinməməli, deaktiv edilməlidir.
- **Dil üzrə ayrı fayllar:** `pages_assets.filename_az/en`, `press_releases_assets.filename_az/en`, bölmə/ofis `filename_az/en`, `homepage_publications.icon_az/en`.
- **Dəyişən sxemlər:** `organization_*` 2018-də ikidilli sütunlara köçürülüb; `nots_levels` → `nots_levels_28`.
- Konsol komandaları (`common/controllers/`): `SequenceController` (import sonrası Postgres sequence-lərini `max(id)+1`-ə düzəldir), `MarketActorsController` (köhnəlmiş reyestr yükləyicisi, vaxtı keçmiş JWT ilə).

→ notdoneyet §4

---

## 9. Xarici inteqrasiyalar və asılılıqlar

| Nə | İstiqamət | Harada |
|---|---|---|
| `api-registry-public.e-cbar.az` | sayt → API (JSON, XLSX) | reyestr |
| `api-license-registry.e-cbar.az` | konsol → API (köhnəlib) | `MarketActorsController` |
| CB daxili sistemi → `/api/bank-info` | sistem → admin (push) | BankInfo |
| Bankların/ERP-lərin məzənnə idxalı | xarici → sayt | `/currencies/*.xml` |
| RSS oxucuları | xarici → sayt | `/rss/releases` |
| `statsDB` | sayt → ikinci baza | ödəniş statistikası |
| Google Maps (açar kodda) | brauzer | `contacts` səhifəsi |
| Google Analytics, Yandex Metrika | brauzer | layout |
| YouTube | embed, thumbnail | video, səhifə məzmunu |
| cdnjs (toastr) | brauzer | |
| `uploads.cbar.az` | fayl hostu | bütün upload-lar |
| `e-cbar.az`, `contact.e-cbar.az`, `e-cbar.az/Survey`, `coin.e-cbar.az`, `bizimpullar.az` | linklər | header, footer, ana səhifə |
| SMTP → `mail@cbar.az` | sayt → mail | feedback |
| QRadar (`/var/log/cbar_app`) | admin → SIEM | audit |

Asılılıqlar (`composer.json`): phpspreadsheet 1.8.2 (Excel import/export), kartik tree-manager və grid (`@dev`), himiklab search + zendsearch (Lucene), zelenin rss, codemix excelexport, flysystem-sftp, swiftmailer. Frontend: gulp ilə `core.min.css`/`core.min.js` (jquery, lightgallery, swiper, chart.js, printJS, metrika).

---

## 10. Məlum buglar və risklər

Yeni sistemdə **təkrarlanmamalı** olanlar. Ciddilik sırası ilə.

| # | Ciddilik | Problem | Yer |
|---|---|---|---|
| 1 | Kritik | AZIR formu SQL-i string birləşdirmə ilə qurur (SQL injection) | `admin/controllers/AzirController.php:85-87, 100-101` |
| 2 | Kritik | Dərc olunmamış/embargolu press-relizlər detal URL-də və **RSS-də** açıqdır — bazara həssas məlumatın sızma riski | `visitor/controllers/PressReleasesController.php:95`, `RssController.php` |
| 3 | Yüksək | AZIR INSERT-də sütun sırası səhv: `eqd_hecm_usd`, `eqd_say_az`, `eqd_say_en` yerini dəyişir — köhnə datanı import edərkən yoxlanmalıdır | `AzirController.php:85-87` |
| 4 | Yüksək | BankInfo API rol yoxlamır; istənilən aktiv istifadəçinin tokeni ilə public qovluğa XML yazıla bilər; "Success" yazmadan əvvəl qaytarılır | `BankInfoController.php:49-65` |
| 5 | Yüksək | Feedback vətəndaş müraciətlərini şəxsi Gmail-ə CC edir; From = istifadəçi girişi | `visitor/models/FeedbackForm.php` |
| 6 | Yüksək | `index2.php` ziyarətçi IP-lərini web root-dakı `user_ip_log_final.txt`-ə yazır | `visitor/web/index2.php` |
| 7 | Yüksək | GET ilə DDL (`migrate`) və `TRUNCATE settings_saf` (`remove`), CSRF-siz | `AzirController.php:138-225, ~243` |
| 8 | Yüksək | YC importları əvvəlcə silir, tranzaksiya və validasiya yoxdur | `YieldCurveController.php:75-248` |
| 9 | Yüksək | İnflyasiya qrafiki JS-də hardcoded | `visitor/web/plugins/chart-js/init.js` |
| 10 | Yüksək | Reyestr prod-da yalnız banklar üçün URL-ə malikdir; 2 yükləmə səhv URL-ə gedir | `visitor/helpers/RegistryHelper.php` |
| 11 | Orta | "Son" məzənnə və infoline dəyəri **id-yə görə** seçilir — keçmiş tarix gec yüklənsə, səhv dəyər "cari" görünür | `CurrencyRates.php:137-150`, `InfoLines.php:66` |
| 12 | Orta | Tarix seçiləndə məzənnə trend oxu əvvəlki günlə yox, bu günlə müqayisə edir | `CurrencyController::actionRates` |
| 13 | Orta | Deaktiv edilmiş istifadəçi sessiyada qalır (`findIdentity` `active` yoxlamır) | `UserIdentity.php:~30` |
| 14 | Orta | `access_token` profil formunda safe atributdur — istifadəçi öz tokenini seçə bilər | `Users.php:36-62` |
| 15 | Orta | Login kilidi başqasının hesabını bloklamaq (və sessiyalarını öldürmək) üçün istifadə oluna bilər; FileCache node-lar arasında paylaşılmır | `LoginController.php:163-181` |
| 16 | Orta | `UserSession::validateCurrent` naməlum sessiyanı avtomatik qeydə alır | `UserSession.php:95-100` |
| 17 | Orta | kartik `NodeController` rol yoxlamır | `admin/config/modules.php:12-32` |
| 18 | Orta | Poll: GET ilə yazma, validasiya yoxdur, session cookie → təkrar səs | `PressReleasesController.php:53-94` |
| 19 | Orta | `readonly` səhifələr deaktiv olsa da açılır | `common/models/Pages.php:135` |
| 20 | Orta | Axtarış indeksi əl ilə, `show_{lang}` nəzərə alınmır, sıralama relevantlığa görə deyil | `common/models/Pages.php:23-49`, `SearchController` |
| 21 | Aşağı | `InfoLines::getValuesByYear` 31 dekabrı itirir | `InfoLines.php:79` |
| 22 | Aşağı | AZIR "son 1 il" həcm min/max faktiki 9–21 aydır; `getUSDEqual` sıfıra bölə bilər | `Azir.php:206, 226` |
| 23 | Aşağı | Real 404 yoxdur; dil URL-də deyil; slug yoxlanmır | `ErrorController.php`, `LanguageBehavior.php` |
| 24 | Aşağı | Hardcoded sirlər: `cookieValidationKey`, Google Maps açarı, JWT | `admin/config/components.php`, `visitor/config/components.php`, `GoogleMapsAsset.php:16` |
| 25 | Aşağı | IRR nominalının 01.10.2025 dəyişikliyi qeyd mətnində var, kodda yoxdur | `rates.php`, `xml.php` |

---

## 11. Yeni sistemdə mütləq qorunmalı qaydalar

**Maliyyə:**
1. Məzənnə: D tarixi üçün `date <= D AND active` üzrə ən son tarix (id-yə görə yox). HTML-də 4 onluq rəqəm.
2. **XML feed kontraktı** — struktur, metallar bloku (`1 t.u.`), `SDR` kodu (HTML-də `XDR`), tarixdən asılı nominallar, həftəsonu üçün əvvəlki iş günü.
3. Excel import formatları — redaktorların mövcud şablonları: valyuta B7:G100 (`XDR`→`sdr`); YC yields B/C; params A–D; periods C2–C8. Dəyişəcəksə, redaktorlara bildirilməlidir.
4. AZIR: default son 60 gün, yalnız `faiz > 0`, `*` = ehtiyat plan (footnote), TFAI faizsiz, 15.05.2025 metodologiya xəbərdarlığı, statistika bloku. İndeks növü başlıq mətnindən yox, ayrıca sahədən gəlməlidir.
5. İnfolines: alias üzrə tarixçə, il seçimi, 01.08.2023-dən sonra yalnız dəyişiklik nöqtələri.
6. `show_7gunluk` və `show_before_day` bayraqları.
7. Gəlirlilik əyrisi: yalnız məlumatı olan tarixlər, çox tarixin müqayisəsi, Nelson–Siegel parametrləri, 7 standart müddət, Excel yükləmə.
8. BankInfo: `POST /api/bank-info` (Bearer, `xmlFiles[]`, 3×3 MB) və `/bankinfonew/*.xml` sabit URL-ləri — ya qorunmalı, ya da çağıran sistemin sahibləri ilə birlikdə dəyişdirilməlidir.

**Kontent:**
9. Menyu ağacları (TOP və LEFT), `visible` + `show_{lang}`, `url` override.
10. Press-relizlər: tip 1/2, yeni yazı qaralama, `date <= bu gün` embargo — **detal və RSS-də də**.
11. `#asset-N` shortcode və asset dil fallback qaydası.
12. Qanun növləri (1–8), başlıq/mətn axtarışı, qüvvədə/qüvvədən düşüb statusu.
13. MEAS filtrləri (emitent, məlumat növü, sənəd növü, DQN, tarix aralığı), yalnız PDF.
14. Pul nişanlarında təhlükəsizlik elementləri, ön/arxa şəkil, video.
15. İdarə Heyəti sədrinin (`type=1, position=1`) xüsusi göstərilməsi, qəbul günləri.
16. Qaçan sətir (link ilə), xəbər slayderi, canlı yayım düyməsi, dil üzrə ayrı nəşr ikonları.
17. Köhnə URL-lərdən 301 redirect (`page-<id>/<slug>`, `press-release-<id>`, `law-<id>`, `?language=en` və s.) və kontentdəki ~6000 köhnə link.

**Təhlükəsizlik:**
18. Rollar: MEAS_MANAGER **yalnız** MEAS modulunu idarə etməlidir.
19. CAPTCHA (2 uğursuzluqdan sonra), rate limit, artan kilid (5/10/15/20 → 60/180/300/900 s), təsadüfi gecikmə, max 3 sessiya, UA binding, parol siyasəti, parol dəyişəndə sessiyaların ləğvi.
20. QRadar audit hadisələri və sahələri.

Bu siyahıdakı maddələrin yeni stack-dəki statusu → [`notdoneyet.md`](notdoneyet.md).
