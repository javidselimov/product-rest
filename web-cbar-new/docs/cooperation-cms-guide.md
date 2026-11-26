# "Beynəlxalq əməkdaşlıq" bölməsi — redaktor qeydi (specs 043, 044, 045, 046)

Bölmənin səhifələri Haqqımızda və Media kimi bölmə şablonundadır: breadcrumb, paylaşma, solda bölmənin menyusu (spec 043).
Menyu adları, sırası və mətnlər admin paneldəki səhifə ağacındandır. Kodda ad yazılmır.
Səhifəni bölmənin sol menyusundan çıxarmaq üçün səhifə formunun **"Saytın menyusunda"** kartında **"Menyularda yox"** seçin (spec 054-ə qədər "Sol menyuda göstər" bayrağı): səhifə hamburger panelindən və mobil
menyudan da çıxır (spec 048), ünvanla açılır və breadcrumb-u qalır.

Admin panelin sol menyusunda bölmənin ayrıca idarə ekranları **Beynəlxalq əməkdaşlıq** qrupundadır (spec 046). Səhifə ağacında
"Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq" və ya "Mərkəzi banklarla əməkdaşlıq" səhifəsini açanda formada həmin ekrana keçid görünür.

## Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq (spec 044)

Səhifə: `beynelxalq-teskilatlarla-emekdasliq` / `cooperation-with-international-organizations` (və "(Kopya)" nüsxəsi `-copy`).
Ünvan dəyişmir. Səhifədə başlıq və giriş mətni, altında "Əməkdaşlıq edilən təşkilatlar" başlığı və hər təşkilat üçün açılan kart görünür.
Bütün kartlar bağlı gəlir. Ziyarətçi istənilən kartı açıb bağlaya bilir, JavaScript olmadan da.

### Nə haradan gəlir

| Saytda | Harada redaktə olunur |
|---|---|
| Səhifənin başlığı və giriş mətni | Səhifə ağacı → həmin səhifə, "Mətn" |
| Kartlar | **Beynəlxalq əməkdaşlıq → Maliyyə təşkilatları** (sol menyunun qrupu və bəndi) |
| "Əməkdaşlıq edilən təşkilatlar", "Üzvlük:", "Əsas missiya" | Sabit etiketlərdir, kodda (az/en) |

Təşkilatlar varsa, səhifə mətnində **ilk qalın başlıq sətrindən** (`<p><strong>Ad</strong></p>` və ya H2–H4) sonrakı hər şey saytda
göstərilmir. Bu, köhnə saytın təşkilat siyahısıdır: kartlar onun yerini tutur, mətn isə ehtiyat kimi qalır. İstəsəniz admin paneldə
silə bilərsiniz. Giriş mətnində qalın başlıq sətri yazmayın, yoxsa ondan sonrası görünməz. Təşkilat yoxdursa və ya xidmət cavab
vermirsə, səhifənin bütün mətni göstərilir.

### Kartın sahələri

| Sahə | Saytda | Qeyd |
|---|---|---|
| Ad (az/en) | Kartın başlığı | Dili doldurulubsa məcburidir |
| Loqo | Başlıqda solda, 103×58 | Şəkil olmalıdır. Şəffaf fonlu PNG/SVG, eni hündürlüyünün ~1,8 qatı. Boş qalsa, ad sola keçir |
| Üzvlük ili | Başlıqda sağda "Üzvlük: 1992" | 1900–2100, boş qala bilər |
| Əsas missiya (az/en) | Açılan kartın yuxarısında göy qutu | Boş qalsa, qutu yoxdur |
| Üzvlük tarixlərinin başlığı (az/en) | Tarix kartlarının üstündəki qalın sətir | Boş qala bilər |
| Üzvlük tarixləri | Tarix kartları (gün.ay.il + qurumun adı), sətirdə 3 | Aşağıya baxın |
| Mətn (az/en) | Tarixlərdən sonra | Adi zəngin mətn |
| Sayt ünvanı | Ən altda link, yeni pəncərədə | `http://` və ya `https://` ilə. Linkin mətni ünvanın host hissəsidir (`www.worldbank.org`) |
| Sıra | Kartların sırası, kiçikdən böyüyə | |
| Status, "… dilində göstər" | Yalnız dərc olunmuş və həmin dildə görünən kart çıxır | |

### Üzvlük tarixləri

Təşkilatı bir dəfə yadda saxlayandan sonra formanın altında **Üzvlük tarixləri** bölməsi görünür. "Tarix əlavə et" ilə tarixi və
qurumun adını (az/en) yazın. Ad hansı dildə boşdursa, həmin dildə o tarix saytda göstərilmir. Sıranı oxlarla dəyişin, saytda kartlar
bu sıra ilə düzülür.

### Yayım günü (seed)

Yayımda dörd təşkilat özü yaranır: Dünya Bankı Qrupu (beş üzvlük tarixi ilə), Beynəlxalq Valyuta Fondu, Asiya İnkişaf Bankı,
Avropa Yenidənqurma və İnkişaf Bankı. Səhifənin az başlığı "Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq" olur və mətnin əvvəlinə
giriş paraqrafı əlavə olunur, əgər başlıq hələ köhnə "Beynəlxalq təşkilatlarla əməkdaşlıq" idisə. Siz başlığı əvvəlcədən dəyişmisinizsə,
səhifəyə toxunulmur.

Redaktorun işi:

1. Dörd təşkilatın **loqosunu** yükləyin (seed fayl yükləyə bilmir).
2. **İngiliscə mətnləri** yoxlayın: Avropa Yenidənqurma və İnkişaf Bankı və bütün "Main mission" mətnləri tərcümə qaralamasıdır.
3. Köhnə səhifədə olan İsveçrə SECO Figma-da yoxdur, yaradılmayıb. Lazımdırsa bölmədə əlavə edin.
4. Sol menyunun adları spec 043-dəki kimi səhifə ağacındandır.

## Mərkəzi banklarla əməkdaşlıq (spec 045)

Səhifə: `merkezi-banklarla-emekdasliq` / `cooperation-with-central-banks` (və "(Kopya)" nüsxəsi `-copy`). Ünvan dəyişmir.
Səhifədə başlıq və giriş mətni, altında "Xarici ölkələrin mərkəzi bankları və nəzarət qurumları ilə imzalanmış Anlaşma Memorandumları"
başlığı, çeşidləmə seçimi və üç sütunlu cədvəl (Təşkilat | Ölkə | Tarix) görünür.

### Nə haradan gəlir

| Saytda | Harada redaktə olunur |
|---|---|
| Səhifənin başlığı və giriş mətni | Səhifə ağacı → həmin səhifə, "Mətn" |
| Cədvəlin sətirləri | **Beynəlxalq əməkdaşlıq → Memorandumlar** (sol menyunun qrupu və bəndi) |
| Cədvəlin başlığı, sütun adları, "Tarix: əvvəlcə yenilər / əvvəlcə köhnələr" | Sabit etiketlərdir, kodda (az/en) |

Memorandum varsa, səhifə mətnində **ilk qalın başlıq sətrindən** (`<p><strong>Ad</strong></p>` və ya H2–H4) sonrakı hər şey saytda
göstərilmir. Bu, köhnə saytın bank mətnləridir (İsveçrə Milli Bankı, Polşa Milli Bankı, Türkiyə Cümhuriyyəti Mərkəzi Bankı, Almaniya
Bundesbankı): dizaynda yoxdur, mətn isə ehtiyat kimi səhifədə qalır. İstəsəniz admin paneldə silə bilərsiniz. Giriş mətnində qalın başlıq
sətri yazmayın, yoxsa ondan sonrası görünməz. Memorandum yoxdursa və ya xidmət cavab vermirsə, səhifənin bütün mətni göstərilir.

### Memorandumun sahələri

| Sahə | Saytda | Qeyd |
|---|---|---|
| Təşkilat (az/en) | Birinci sütun | Dili doldurulubsa məcburidir, ən çox 500 simvol |
| Ölkə (az/en) | İkinci sütun | Dili doldurulubsa məcburidir. Sərbəst mətndir, yazıldığı kimi görünür ("BƏƏ") |
| İmzalanma ili | "Tarix" sütunu | Məcburidir, 1991-dən gələn ilə qədər. Cədvəl bu ilə görə çeşidlənir |
| Sıra | Eyni ilin sətirlərinin sırası, kiçikdən böyüyə | Hər iki çeşidləmədə il daxilində eyni qalır |
| Status, "… dilində göstər" | Yalnız dərc olunmuş və həmin dildə görünən sətir çıxır | Dili boş qalan sətir o dildə görünmür |

Eyni təşkilatla iki memorandum iki ayrı sətirdir (məsələn, Rusiya Federasiyasının Mərkəzi Bankı — 2026 və 2006).

### Çeşidləmə

Ziyarətçi sağdakı "Tarix:" seçimi ilə sıranı dəyişir: "əvvəlcə yenilər" (standart) və "əvvəlcə köhnələr" (`?sort=oldest`). Seçim
ünvanda saxlanır, JavaScript olmadan işləyir, çapda görünmür.

### Yayım günü (seed)

Yayımda Figma-dakı 28 memorandum az və en dilində, dərc olunmuş halda özü yaranır. Səhifənin mətni hələ birbaşa qalın başlıq sətri ilə
başlayırsa, əvvəlinə giriş paraqrafı əlavə olunur (az və en ayrı-ayrı). Mətni əvvəlcədən dəyişmisinizsə, səhifəyə toxunulmur.

Redaktorun işi:

1. **İngiliscə adları və ölkələri** yoxlayın: hamısı tərcümə qaralamasıdır (Figma-da və köhnə saytda ingiliscə yoxdur).
2. **İngiliscə giriş paraqrafını** yoxlayın: o da tərcümə qaralamasıdır.
3. Köhnə bank mətnləri saytda görünmür. Lazım deyilsə səhifədən silin.

## Beynəlxalq təşkilatlarda üzvlük (spec 046)

Səhifə: `beynelxalq-teskilatlarda-uzvluk` / `membership-in-international-organizations` (və "(Kopya)" nüsxəsi `-copy`). Ünvan dəyişmir.
Səhifədə başlıq, sağda çeşidləmə seçimi ("Üzvlük tarixi: əvvəlcə yenilər") və iki sütunlu cədvəl (Təşkilat | Üzvlük tarixi) görünür.

Bu cədvəlin ayrıca admin bölməsi **yoxdur**: sətirlər səhifənin öz mətnindəki adi cədvəldir. Yeni üzvlük üçün səhifəni açıb cədvələ sətir
əlavə etmək kifayətdir.

### Nə haradan gəlir

| Saytda | Harada redaktə olunur |
|---|---|
| Səhifənin başlığı | Səhifə ağacı → həmin səhifə, "Başlıq" |
| Cədvəlin sətirləri | Həmin səhifənin "Mətn"-indəki **birinci cədvəl** |
| Cədvəldən əvvəlki / sonrakı mətn | Eyni "Mətn" — cədvəldən əvvəl və sonra görünür |
| Sütun adları, "Üzvlük tarixi: əvvəlcə yenilər / əvvəlcə köhnələr" | Sabit etiketlərdir, kodda (az/en) |
| "Azərbaycan Respublikası Mərkəzi Bankının üzv olduğu təşkilatlar" | Sabit, ekranda görünmür (dizaynda gizlidir), yalnız ekran oxuyucusu üçündür |

### Cədvəlin qaydası

1. Səhifədəki **birinci** cədvəl üzvlük cədvəlidir. Başqa cədvəl yazsanız, o adi məzmun kimi aşağıda qalır.
2. **Birinci sütun** təşkilatın adıdır, **ikinci sütun** üzvlük ilidir. Üçüncü və sonrakı sütunlar saytda göstərilmir.
3. Redaktorun "Cədvəl əlavə et" düyməsi birinci sətri başlıq sətri kimi yaradır ("Təşkilat | Üzvlük tarixi" yazın) — o saytda görünmür,
   saytın öz sütun adları var. Başlıq sətrini adi sətir kimi yazsanız da, ikinci xanasında il yoxdursa başlıq sayılır.
4. İl xanasına **dörd rəqəmli il** yazın ("2025"). Xana necə yazılıbsa elə görünür ("2025-ci il" də olar); sıralama ondakı birinci ilə
   görədir. İl yoxdursa sətir göstərilir, amma hər iki sırada ən sonda durur.
5. **Sıranı sayt özü qurur**: standart olaraq ən yeni il yuxarıda, ziyarətçi "əvvəlcə köhnələr" seçə bilir (`?sort=oldest`). Eyni ilin
   sətirləri cədvəldə yazdığınız sıra ilə qalır. Ona görə yeni sətri cədvəlin istənilən yerinə əlavə edə bilərsiniz.
6. Təşkilatın adına `https://` linki qoysanız, ad saytda link olur və yeni pəncərədə açılır. Başqa linklər (daxili, `mailto:`) atılır.
7. Hər iki xanası boş sətir göstərilmir. Cədvəl yoxdursa, səhifə adi mətn kimi görünür, çeşidləmə olmur.

İngiliscə səhifənin öz cədvəli var: ingiliscə mətni ayrıca redaktə edin.

### Yayım günü (seed)

Səhifənin mətni hələ boşdursa və ya yalnız "Beynəlxalq təşkilatlarda üzvlük" sözlərindən ibarətdirsə, yayımda Figma-dakı **14 sətirlik**
cədvəl yazılır. İngiliscə tərcümə yoxdursa və ya hələ azərbaycanca başlığın surətidirsə, ingiliscə başlıq "Membership in international
organizations", slug `membership-in-international-organizations` və ingiliscə cədvəl yazılır. Mətni əvvəlcədən dəyişmisinizsə, toxunulmur.

Redaktorun işi:

1. **İngiliscə adları** yoxlayın: hamısı tərcümə qaralamasıdır (Figma-da ingiliscə yoxdur).
2. "İqtisadi Əməkdaşlıq və İnkişaf Təşkilatının Beynəlxalq Maliyyə Savadlılığı Şəbəkəsi" (2025) və "Maliyyə Savadlılığı üzrə Beynəlxalq
   Şəbəkə" (2011) Figma-da ayrı sətirlərdir, seed onları olduğu kimi yazır. Biri artıqdırsa silin.
