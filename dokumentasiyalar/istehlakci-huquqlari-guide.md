# İstehlakçıların və investorların hüquqları — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«İstehlakçıların və investorların hüquqları»** bölməsini izah edir: beş səhifə admin paneldən necə
idarə olunur və dəyişiklik saytda harada, necə görünür.

> Köhnə saytda bu bölmənin xüsusi görünüşü yox idi: hər səhifə adi mətn, akkordeon və cədvəllərdən ibarət idi. Yeni saytda
> **şikayət indekslərinin və infoqrafikanın aylıq faylları** ayrıca admin bölməsindədir: **İstehlakçı hüquqları → Aylıq
> hesabatlar** (§3.1). Qalan hər şey (giriş mətnləri, metodologiya, statistika cədvəlləri, sənədlər) **Səhifələr**-dədir: sayt
> mətndəki akkordeonları və cədvəlləri tanıyıb onları Figma görünüşündə göstərir. Ona görə aşağıdakı **yazılış qaydalarına**
> əməl etmək vacibdir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Səhifələr** → «İstehlakçıların və investorların hüquqları» və onun altındakı səhifələr; aylıq fayllar: sol menyu → **Aylıq hesabatlar** |
| **Sayt (AZ)** | `https://<sayt>/az/istehlakcilarin-ve-investorlarin-huquqlari` |
| **Sayt (EN)** | `https://<sayt>/en/consumer-and-investor-rights` |
| **Saytda yolu** | Üst menyu → **İstehlakçıların və investorların hüquqları** → sol menyuda dörd səhifə |

Bölmənin sol menyusunda Figma kimi **dörd səhifə** var. Saytdakı hər görünüş bir və ya iki CMS səhifəsindən qurulur:

| Saytda | Admin paneldə səhifə (az ünvanı) | Nə göstərilir |
|---|---|---|
| Bölmənin giriş səhifəsi | «İstehlakçıların və investorların hüquqları» (`istehlakcilarin-ve-investorlarin-huquqlari`) | Giriş mətni, nömrələnmiş fəaliyyət istiqamətləri |
| **Vətəndaş müraciətlərinə dair statistika** | «Vətəndaş müraciətlərinə dair statistika» (`vetendas-muracietlerine-dair-statistika`) **və** «İnfoqrafika» (`infoqrafika`) | Qısa icmal kartları, kanal üzrə cədvəllər, infoqrafika arxivi |
| **Şikayət indeksləri** | «Şikayət indeksləri» (`bank-xidmetlerinden-istifade-uzre-sikayet-indeksi`) **və** «Avto-icbari sığorta üzrə şikayət indeksi» (`avto-icbari-sigorta-uzre-sikayet-indeksi`) | Bank və Sığorta tabları, son məlumat, il üzrə arxiv, metodologiya |
| **İnzibati işlərə baxan vəzifəli şəxslər** | Eyni adlı səhifə (`inzibati-islere-baxan-vezifeli-sexsler`) | Giriş, başlıqlar, nömrələnmiş siyahı |
| **Sənədlər** | «Sənədlər» (`kapital-bazari-3`) | Akkordeon bölmələri: Səhmdarlar, Emitentlər, İnformasiya sorğusu |

Dəyişiklik saytda **təsdiqsiz, dərhal** görünür: səhifəni yeniləmək kifayətdir.

**Səhifələrin ünvanını (slug) dəyişməyin.** Sayt bu beş görünüşü ünvana görə tanıyır, ünvan dəyişsə səhifə adi mətn kimi
görünəcək. Başlığı dəyişmək olar, bu ünvana təsir etmir.

---

## 2. Yayımdan sonra bir dəfəlik hazırlıq

Yeni sayt ilk dəfə yayımlananda bazada bunlar **avtomatik** edilir. Hər biri yalnız səhifə hələ köhnə halındadırsa olur, sizin
dəyişdirdiyiniz mətnə toxunulmur:

- «İnzibati işlərə baxan vəzifəli şəxslər» **Media** bölməsindən bu bölməyə köçür. Ünvanı eyni qalır, köhnə linklər işləyir.
- «Bank xidmətlərindən istifadə üzrə şikayət indeksi» başlığı **«Şikayət indeksləri»**, «Kapital bazarı» başlığı **«Sənədlər»** olur.
- Giriş səhifəsinin birinci paraqrafı ikiyə bölünür: giriş cümləsi və «Bununla əlaqədar…».
- Bank və Sığorta şikayət indekslərinin sonuna **metodologiya** mətni əlavə olunur (Figma-dakı düstur və izahlar).
- «Sənədlər»ə **«İnformasiya sorğusu»** bölməsi əlavə olunur.
- Şikayət indekslərinin (Bank, Sığorta) və infoqrafikanın bütün ayları faylları ilə **Aylıq hesabatlar** bölməsinə köçür (spec 052).
  Səhifələrin mətni dəyişmir: köhnə akkordeonlar mətndə qalır, sayt onları göstərmir (§3.1). Ay adı tanınmayan akkordeon və
  media kitabxanasında olmayan fayl köçmür (§6).
- Figma-da olmayan səhifələr **sol menyudan çıxır**, silinmir: Fəaliyyət istiqamətləri, Müraciətlərə baxılması, Vətəndaşların
  qəbulu, Bizimlə əlaqə, Əks əlaqə, İnfoqrafika, Avto-icbari sığorta üzrə şikayət indeksi, Tədbirlər, Təkliflər, Ərazi idarələrinə
  müraciət, Tətbiq edilmiş nəzarət tədbirləri, Ödəniş xidmətləri, Rəqəmsal fırıldaqçılıq statistikası və «(Kopya)» qaralaması.

Aşağıdakıları bir dəfə özünüz edin:

### 2.1. «966» Qaydalarının faylını yükləyin

Figma-da «İnformasiya sorğusu» bölməsində bu sənəd var: «Azərbaycan Respublikasının Mərkəzi Bankında istehlakçıların və
investorların müraciətlərinə baxılması, qəbulu, müraciətlərin təhlili və “966” Çağrı Mərkəzinin istifadəsinə dair Qaydalar».
Bu fayl media kitabxanasında **tapılmadı**.

1. **Səhifələr** → «Sənədlər» → az dili.
2. «İnformasiya sorğusu» akkordeonunu açın, paraqrafdan sonra yeni sətirdə **Fayl əlavə et** ilə PDF-i yükləyin.
3. Faylın linki **ayrıca paraqrafda tək** olmalıdır (bax §3.6). Sayt onu sənəd kartı kimi göstərəcək.
4. en dili üçün də eyni şeyi edin (ingiliscə fayl varsa).

### 2.2. İngiliscə mətnləri yoxlayın

Metodologiyanın, «Information request» bölməsinin və yeni başlıqların («Complaint indices», «Documents») ingiliscə mətni
**tərcümə qaralamasıdır**. Hər birini rəsmi mətnlə tutuşdurun.

---

## 3. Admin paneldə əməliyyatlar

Bütün dəyişikliklər **Səhifələr** → səhifəni açın → dil tabı → mətn redaktorunda edilir. Redaktorda lazım olan düymələr:
**Accordion**, **Cədvəl əlavə et**, **Fayl əlavə et**, **Sitat**, **Başlıq 2**. Mürəkkəb dəyişiklikdə **HTML mənbəyi**
rejimindən də istifadə etmək olar.

### 3.1. Şikayət indeksinə və infoqrafikaya yeni ay əlavə etmək (Aylıq hesabatlar)

Hər ay bir sətirdir: seriya, il, ay və hər dil üçün bir fayl. Akkordeon qurmaq və başlıq yazmaq lazım deyil. Üç seriya var:
**Bank indeksi**, **Sığorta indeksi**, **İnfoqrafika**. Bölmənin tam təlimatı: [Aylıq hesabatlar](ayliq-hesabatlar-guide.md). Aşağıda qısa forması verilib.

1. Sol menyu → **İstehlakçı hüquqları → Aylıq hesabatlar** (menyuda tək bənddir: **Aylıq hesabatlar**).
2. Yuxarıdakı tablardan seriyanı seçin (məsələn, **Bank indeksi**) və **Yeni** düyməsini basın. Forma həmin seriya ilə və **son
   aydan sonrakı ayla** açılır (son ay May 2026-dırsa, İyun 2026).
3. **Fayl**: az tabında **Seç** ilə faylı media kitabxanasından seçin və ya yükləyin. İngiliscə fayl varsa, en tabında da seçin.
4. **Status**: saytda görünməsi üçün **Dərc olunub**. Qaralama saytda görünmür.
5. **Yadda saxla**.

Saytda:
- «SON MƏLUMAT» kartı **avtomatik** yeni aya keçir;
- arxivdə ay sənəd kartı kimi görünür («İyun 2026»), ilin akkordeonu özü yaranır;
- faylın başlığı avtomatik qurulur: seriyanın adı + dövr, məsələn «Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət
  indeksi (İyun 2026)». **Sığorta indeksi** 12 ayı əhatə etdiyi üçün başlığında dövr yazılır: «… (İyul 2025 – İyun 2026)».

Qaydalar:
- Bir seriyada bir ay **bir dəfə** ola bilər. Eyni ayı ikinci dəfə əlavə etsəniz, panel «Bu seriyada İyun 2026 üçün hesabat artıq var»
  deyir: mövcud sətri siyahıda tapıb redaktə edin.
- Ən azı bir dildə fayl olmalıdır. **İngiliscə faylı olmayan ay ingilis saytında görünmür.**
- Faylı dəyişmək: sətri açın, **Dəyiş** ilə yeni faylı seçin, yadda saxlayın.
- Ayı saytdan çıxarmaq: statusu **Arxiv** edin və ya sətri silin. Silinmiş ayı sonra yenidən əlavə etmək olar.
- Siyahıda **«Fayl silinib»** nişanı: sətrin faylı media kitabxanasından silinib, bu ay həmin dildə saytda görünmür. Yeni faylı seçin.

> **Köhnə akkordeonlar.** Səhifələrin («Şikayət indeksləri», «Avto-icbari sığorta üzrə şikayət indeksi», «İnfoqrafika») mətnində
> köhnə il → ay akkordeonları qalır, amma seriyanın ən azı bir dərc olunmuş ayı olduqca **sayt onları göstərmir**. Yeni ayı
> mətnə yazmayın: saytda görünməyəcək. Akkordeonları mətndən silmək olar, səhifənin giriş mətni və metodologiyası yerində qalır.
> Seriyanın bütün sətirləri silinsə və ya qaralamaya keçsə, sayt yenidən mətndəki arxivi göstərir.

### 3.2. Sığorta tabı

Sığorta indeksi ayrıca səhifədir, saytda isə «Şikayət indeksləri» səhifəsinin **ikinci tabıdır**. Onun öz ünvanı açılanda ziyarətçi
avtomatik həmin taba yönləndirilir (`…?tab=insurance`). Sığorta səhifəsini sol menyuda göstərməyin. Tabın ayları **Aylıq hesabatlar**
→ **Sığorta indeksi**-ndədir (§3.1), metodologiyası isə Sığorta səhifəsinin mətnindədir.

### 3.3. Metodologiya

Hər tabın metodologiyası **öz səhifəsinin sonundadır** (Bank — Bank səhifəsində, Sığorta — Sığorta səhifəsində). Qaydalar:

| Redaktorda | Saytda |
|---|---|
| Arxivdən sonra **Başlıq 2**: «Şikayət indeksinin metodologiyası» | Çərçivəli metodologiya qutusunun başlığı |
| **Sitat** — dəqiq **üç paraqraf**: `Şikayət indeksi =`, surət, məxrəc | Düstur: sol tərəf və kəsr |
| Adi paraqraflar | Adi mətn |
| `Qeyd:` ilə başlayan paraqraf və ondan sonrakılar | Kiçik, boz yazı |

Sitatda üç paraqrafdan az və ya çox olsa, düstur kimi yox, adi sitat kimi göstərilir.

### 3.4. Statistika cədvəlinə yeni ay

Quruluş: **kanal akkordeonu** («Yazılı müraciətlər üzrə statistika») → **il akkordeonu** (`2026`) → **cədvəl**.

1. **Səhifələr** → «Vətəndaş müraciətlərinə dair statistika» → kanalın və ilin akkordeonunu açın.
2. Cədvəldə ayın sətrindəki xanaları **yalnız rəqəmlə** doldurun (boşluq və nöqtə olar: `1 510`).
3. Sağdakı «Cəmi» sütununu və «Yekun» sətrini də yeniləyin: sayt rəqəmləri hesablamır, yazdığınızı göstərir.

**Qısa icmal avtomatik yenilənir**, amma yalnız **dörd kanalın hamısında** (Yazılı müraciətlər, Vətəndaş qəbulu, Daxil olan
zənglər, WhatsApp) həmin ay doldurulanda. Məsələn, zənglər İyuna qədər, qalanları Maya qədər doludursa, icmal «May 2026»
göstərir. Səyyar qəbul icmala daxil deyil.

Cədvəlin birinci sətri başlıqdır: birinci xana **«Aylar»** (en: **«Months»**), sonra sektorlar, sonda **«Cəmi»**. Bu forma
dəyişsə, cədvəl yenə göstərilir, amma icmala düşmür.

**Yeni il:** kanal akkordeonunun içində yeni **Accordion** (`2027`) yaradın, keçən ilin cədvəlini kopyalayıb rəqəmləri silin.

**Yeni kanal:** ən yuxarı səviyyədə yeni **Accordion**, başlığı «… üzrə statistika» (en: «Statistics of …»). Saytda tab adı
«üzrə statistika» hissəsi olmadan göstərilir. Cədvəli «Aylar» forması ilədirsə, icmala avtomatik düşür.

### 3.5. İnfoqrafika

İnfoqrafika saytda statistika səhifəsinin **sonundakı blokdur**. Yeni ay §3.1-dəki kimi **Aylıq hesabatlar** → **İnfoqrafika**
tabından əlavə olunur. «İnfoqrafika» səhifəsinin öz ünvanı açılanda ziyarətçi statistika səhifəsindəki bloka yönləndirilir.
İngiliscə faylı olan ay yoxdursa, ingiliscə statistika səhifəsində bu blok görünmür (bugünkü kimi).

### 3.6. Sənədlər

Hər **Accordion** bir bölmədir (Səhmdarlar, Emitentlər, İnformasiya sorğusu). Sayt onları bağlı göstərir, ziyarətçi açır.

- Bölmənin içində adi mətn, siyahı və qalın yazı olduğu kimi göstərilir.
- **Sənəd kartı**: faylın linki **ayrıca paraqrafda tək** olmalıdır (**Fayl əlavə et** ilə yeni sətrə). Mətnin içindəki fayl linki
  adi link kimi qalır.
- **Yeni bölmə**: səhifənin sonuna yeni **Accordion**.

### 3.7. Giriş səhifəsi və «İnzibati işlərə baxan vəzifəli şəxslər»

| Redaktorda | Saytda |
|---|---|
| Birinci paraqraf | İri giriş mətni (lead). Qalın yazılıbsa da adi iri mətn kimi görünür |
| Yalnız qalın yazıdan ibarət paraqraf və ya **Başlıq 2** | Bölmə başlığı |
| Nöqtəli və ya nömrəli siyahı | Nömrələnmiş kartlar (1, 2, 3 …) |
| Qalan paraqraflar | Adi mətn |

### 3.8. Sol menyu

Sol menyuda hansı səhifələrin görünəcəyini səhifə formasındakı **«Saytın menyusunda»** kartının **«Menyudakı yeri»** seçimi idarə edir. «Menyularda yox» seçilmiş səhifə:
- **silinmir**, ünvanı işləyir;
- açıq olanda sol menyuda özü görünür;
- footer-də və breadcrumb-da qalır.

Səhifəni bütün menyulardan çıxarmaq üçün **«Görünən»** işarəsini götürməyin: onda səhifənin alt səhifələri yuxarı səviyyəyə qalxır.

---

## 4. Saytda nə görünür

- **Bölmə şablonu**: breadcrumb, paylaşma düymələri, sol menyuda dörd səhifə Figma sırası ilə: Statistika, Şikayət indeksləri,
  İnzibati işlər, Sənədlər.
- **Şikayət indeksləri**:
  - iki tab var: Bank və Sığorta;
  - «SON MƏLUMAT» kartı ən yeni ayın faylını açır;
  - «Arxiv»də illər ən yenisi yuxarıda, hamısı bağlı göstərilir;
  - ili açanda aylar sənəd kartlarıdır, altda metodologiya qutusu var;
  - aylar və fayllar **Aylıq hesabatlar**-dandır, giriş mətni və metodologiya səhifənin mətnindən;
  - seçilmiş tab ünvandadır (`?tab=insurance`), linki göndərdiyiniz şəxs eyni tabı görür.
- **Statistika**:
  - «<Ay İl> — qısa icmal» kartları;
  - «Müraciətlər üzrə statistika»: kanal tabları, «İl:» düymələri və cədvəl;
  - seçim ünvanda qalır (`?channel=2&year=2025`);
  - telefonda cədvəl öz çərçivəsində yana sürüşür;
  - sonda «İnfoqrafika».
- **Fayl siyahısı**: Şikayət indeksləri, Statistika və Sənədlər səhifələrinin altında ayrıca fayl siyahısı **yoxdur**. Fayllar
  arxivdə və bölmələrdə göstərilir. Səhifəyə yüklənib mətndə heç yerdə linklənməyən fayl saytda görünmür.
- **Köhnə ünvanlar**: «Fəaliyyət istiqamətləri» giriş səhifəsinə, «İnfoqrafika» statistikadakı bloka, «Avto-icbari sığorta…» Sığorta
  tabına yönləndirilir.
- **JavaScript olmadan** da tablar, kanal və il seçimi, akkordeonlar işləyir; çapda akkordeonlar açıq çap olunur.

---

## 5. Yoxlama siyahısı

- [ ] Sol menyuda dörd səhifə var, Figma sırası ilə.
- [ ] Şikayət indekslərində «SON MƏLUMAT» ən yeni ayın faylıdır, Sığorta tabı açılır.
- [ ] Metodologiya hər tabda öz düsturu ilə görünür.
- [ ] Statistikanın icmal ayı cədvəldəki son dolu ayla eynidir, rəqəmlər üst-üstə düşür.
- [ ] Sənədlərdə üç bölmə var, PDF kartları açılır, «966» Qaydalarının faylı yüklənib (§2.1).
- [ ] İngiliscə qaralamalar yoxlanıb (§2.2).

---

## 6. Tez-tez rast gəlinən hallar

| Vəziyyət | Səbəb və həll |
|---|---|
| Yeni ay arxivdə yoxdur | Sətrin statusu **Qaralama**-dır və ya ay səhifənin mətninə yazılıb, **Aylıq hesabatlar**-a yox (§3.1) |
| Ay ingilis saytında yoxdur | Sətrin en faylı seçilməyib (siyahıda «EN yoxdur»). Sətri açıb en faylını seçin |
| Ay saytda görünmür, siyahıda «Fayl silinib» | Fayl media kitabxanasından silinib. Sətri açıb yeni faylı seçin |
| «Bu seriyada … üçün hesabat artıq var» | Həmin ay artıq var. Siyahıda tapıb redaktə edin |
| Köhnə ay köçməyib | Köhnə akkordeonun başlığı ay adı deyildi və ya fayl media kitabxanasında yox idi (məsələn, Sığortanın ingiliscə arxivindəki 2 ay `uploads.cbar.az`-a link verirdi). Faylı media kitabxanasına yükləyib ayı **Aylıq hesabatlar**-a əl ilə əlavə edin |
| Saytda yenə köhnə arxiv görünür | Seriyanın dərc olunmuş sətri yoxdur (hamısı qaralama və ya silinib). Sayt onda səhifənin mətnindəki arxivi göstərir |
| Qısa icmal köhnə ayı göstərir | Dörd kanaldan biri həmin ay doldurulmayıb (§3.4) və ya bir xanada rəqəm əvəzinə mətn var (`-`, `yox`) |
| Qısa icmal ümumiyyətlə görünmür | Kanallardan birində heç bir ay tam doldurulmayıb (bütün xanalar rəqəm olmalıdır). Yeni ili əvvəlcədən boş yaratmaq problem deyil: icmal əvvəlki ilin son ayını göstərir |
| Kanalın cədvəli var, amma icmalda yoxdur | Cədvəlin birinci xanası «Aylar»/«Months» deyil |
| Tablar yoxdur, yalnız Bank görünür | Sığorta səhifəsi dərc olunmayıb və ya ünvanı dəyişib |
| Sənəd kartı yox, adi link görünür | Fayl linki mətnin içindədir. Onu ayrıca paraqrafa çıxarın |
| Səhifə adi mətn kimi görünür | Səhifənin ünvanı (slug) dəyişib və ya akkordeonlar silinib. Ünvanı qaytarın |

---

## 7. Developerlər üçün əlavə

- Spec: `specs/050-consumer-rights/` (spec, plan, research R1–R16, `contracts/cms-markup.md`, `contracts/ui-contract.md`).
- Aylıq hesabatlar: `specs/052-monthly-reports/` — cədvəllər `monthly_report_series`, `monthly_reports`, `monthly_report_translations`
  (`0034`), köçürmə `0035`; API `GET /api/v1/monthly-reports` (api-cbar), `/api/v1/monthly-reports` CRUD + `/series` (api-cbar-admin);
  panel `web-cbar-admin-new` `features/monthly-reports`; sayt `features/monthly-reports` + `features/about-content/model/report-archive.ts`.
  Seriyanın sətri olanda `parseComplaintIndex`/`parseAppealStatistics` arxivi sətirlərdən qurur, mətndəki arxivi kəsir, yoxdursa
  spec 050 yolu qalır.
- Sayt: `web-cbar-new` `features/about-content/model/` — `consumerLayoutFor` (layout cədvəli), parser-lər `year-archive.ts`,
  `consumer-text.ts`, `complaint-index.ts`, `appeal-statistics.ts`, `consumer-documents.ts`, seçim `consumer-select.ts`.
  Widget-lər `widgets/about-blocks/{consumer-parts,consumer-text,complaint-index,appeal-statistics,consumer-documents}.tsx`.
  Yoldaş səhifə (Sığorta, İnfoqrafika) `views/cms-page/loader.ts` `loadCompanion`-dadır. Yönləndirmələr `src/proxy.ts`
  `consumerRedirect`-dədir.
- Seed: `api-cbar-admin/db/migrations/0031-consumer-rights-seed.sql`.
- Layout fixture-ləri: `consumer-text`, `complaint-index`, `appeal-statistics`, `consumer-documents` — saytda və admin paneldə
  eyni fayl (`check:layout-fixtures`). Admin redaktoru onları bayt-bayt saxlayır (`roundtrip.test.ts`).
- İşarələmə qaydasının qısa forması: `web-cbar-new/docs/consumer-rights-cms-guide.md`.
- «Mərkəzi Banka müraciət imkanları» hub-ı (Müraciətlərə baxılması, Vətəndaşların qəbulu, Bizimlə əlaqə, Əks əlaqə, Təkliflər,
  Ərazi idarələrinə müraciət) Figma-da gizlidir və ayrıca spec-də görüləcək. Həmin səhifələr indi adi mətn kimi açılır.
