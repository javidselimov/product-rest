# "İstehlakçıların və investorların hüquqları" bölməsi — redaktor qeydi (spec 050)

Bölmənin səhifələri bölmə şablonundadır: breadcrumb, paylaşma və solda bölmənin menyusu, Haqqımızda, Media, Beynəlxalq əməkdaşlıq və
Maliyyə savadlılığı kimi. Menyu adları, sırası və bütün mətnlər admin paneldə **Səhifələr** ağacındandır.

Görünüş **adi redaktor işarələməsindən** qurulur: akkordeonlar, cədvəllər, sitat, siyahılar və fayl linkləri. Yeganə istisna şikayət
indekslərinin və infoqrafikanın aylıq fayllarıdır: onlar spec 052-dən **Aylıq hesabatlar** bölməsindədir (aşağıda). Sayt bir bloku tanımasa, həmin hissəni adi mətn kimi göstərir, mətn itmir. Tam qayda
`../../specs/050-consumer-rights/contracts/cms-markup.md`-dədir. Redaktorlar üçün addım-addım təlimat:
`../../dokumentasiyalar/istehlakci-huquqlari-guide.md`.

| Səhifə (az / en slug) | Layout | Görünüş |
|---|---|---|
| Bölmənin özü — `istehlakcilarin-ve-investorlarin-huquqlari` / `consumer-and-investor-rights`; İnzibati işlər — `inzibati-islere-baxan-vezifeli-sexsler` / `officials-authorized-to-consider-cases-on-administrative-violations` | `consumer-text` | Birinci paraqraf lead, qalın sətir başlıq, siyahı nömrəli kartlar |
| Şikayət indeksləri — `bank-xidmetlerinden-istifade-uzre-sikayet-indeksi` / `complaint-index-on-bank-customers-use-of-bank-services` | `complaint-index` | Bank və Sığorta tabları (`?tab=insurance`), son məlumat, il → ay arxivi, metodologiya |
| Statistika — `vetendas-muracietlerine-dair-statistika` / `statistics-of-citizens-appeals` | `appeal-statistics` | Qısa icmal, kanal tabları + il (`?channel=&year=`), cədvəl, İnfoqrafika |
| Sənədlər — `kapital-bazari-3` / `capital-market-3` | `consumer-documents` | Akkordeon bölmələri, tək fayl linki sənəd kartı |
| Qalan səhifələr | `plain` | Adi mətn |

"(Kopya)" səhifələri (`-copy` slug) orijinalın görünüşünü alır.

## Yoldaş səhifələr

- **Sığorta indeksi** (`avto-icbari-sigorta-uzre-sikayet-indeksi` / `complaint-index-on-compulsory-mtpl-insurance`) Şikayət indekslərinin ikinci tabıdır.
  Öz ünvanı Sığorta tabına yönlənir.
- **İnfoqrafika** (`infoqrafika`, en-də yoxdur) statistikanın sonundakı blokdur. Öz ünvanı `…#infoqrafika`-ya yönlənir.
- **Fəaliyyət istiqamətləri** (`fealiyyet-istiqametleri` / `activity-directions`) bölmənin özünə yönlənir: mətni bölmənin səhifəsindədir.

Yoldaş səhifə açılmasa (xəta, dərc olunmayıb), host səhifə tabsız və ya İnfoqrafikasız göstərilir.

## İşarələmə, qısa

- **Arxiv** (93, 95, 96) spec 052-dən **İstehlakçı hüquqları → Aylıq hesabatlar** bölməsindədir (aşağıda). Səhifə mətnindəki il → ay
  akkordeonları yalnız fallback-dır: seriyanın dərc olunmuş sətri yoxdursa, sayt arxivi spec 050 qaydası ilə mətndən oxuyur (il
  **Accordion**-u `2026` → ay **Accordion**-u `May` → **Fayl əlavə et**, ay akkordeonları bir xanalı cədvəlin içində də ola bilər).
- **Metodologiya**: arxivdən sonra **Başlıq 2**. Dəqiq üç paraqraflı **Sitat** düstur olur (sol tərəf, surət, məxrəc). `Qeyd:` ilə başlayan
  paraqraf və ondan sonrakılar boz kiçik yazıdır.
- **Statistika**: kanal **Accordion**-u (`… üzrə statistika` / `Statistics of …`) → il **Accordion**-u → cədvəl. Birinci xana `Aylar`/`Months`,
  sətirlər ay adları, son sətir `Yekun`/`Total`, sütun `Cəmi`/`Total`. Başqa formalı cədvəl (Səyyar qəbul: şəhər × ay) olduğu kimi göstərilir.
- **Qısa icmal**: `Aylar` formalı bütün kanallarda doldurulmuş ən son ortaq ay. Boş əlavə olunmuş yeni il nəzərə alınmır.
- **Sənədlər**: hər **Accordion** bölmədir. Yalnız fayl linkindən ibarət paraqraf sənəd kartıdır.

Bu səhifələrin altında ayrıca fayl siyahısı göstərilmir. Səhifənin `assets` siyahısında başqa dilin faylları da var, fayllar arxivdə və
bölmələrdədir.

## Aylıq hesabatlar (spec 052)

Şikayət indekslərinin (Bank, Sığorta) və İnfoqrafikanın ayları **İstehlakçı hüquqları → Aylıq hesabatlar** bölməsindədir
(`GET /api/v1/monthly-reports`). Hər ay bir sətirdir: seriya, il, ay, hər dil üçün bir fayl, status. Başlıq yazılmır: sayt onu seriyanın
adı və dövrdən qurur, Sığorta indeksi 12 aylıq dövrdür («… (İyun 2025 – May 2026)»).

- Seriyanın həmin dildə dərc olunmuş sətri varsa, səhifə mətnindəki köhnə akkordeon arxivi göstərilmir. Arxivdən əvvəlki giriş mətni
  və sonrakı metodologiya göstərilir.
- Sətri yoxdursa (və ya API xəta verirsə), səhifə yuxarıdakı spec 050 qaydası ilə öz mətnindən qurulur.
- en faylı olmayan ay en saytında görünmür. İnfoqrafikanın en sətri yoxdursa, en statistika səhifəsində blok yoxdur.
- Yayımda köhnə arxivlər bir dəfə köçürülür (seed `0035`): Bank 32/32 ay, Sığorta 45/41, İnfoqrafika 65 (test mühiti, 2026-11-18).
  Sığortanın en arxivindəki 2 ay `uploads.cbar.az`-a link verdiyi üçün köçmür. Onları faylı yükləyib əl ilə əlavə etmək olar.
- Səhifə formunda (95, 96, 93) «Bu səhifənin məzmunu» kartı bölməyə, seriya süzgəci ilə aparır.
- Redaktor təlimatı: `../../dokumentasiyalar/ayliq-hesabatlar-guide.md`.

## Sol menyu

Figma-da dörd bənd var: Statistika, Şikayət indeksləri, İnzibati işlər, Sənədlər. Seed `0031` qalan səhifələrdə **"Sol menyuda göstər"** bayrağını
söndürür (spec 041). Paneldə bu, "Saytın menyusunda" kartında "Menyularda yox" seçimidir (spec 054).

"Ödəniş xidmətləri" və "Rəqəmsal fırıldaqçılıq statistikası" spec 054-də (seed `0041`) "Nəşrlər və tədqiqatlar" bölməsinə köçüb. Ünvanları slug-dır,
dəyişmir; breadcrumb və sol menyu indi o bölmənindir (`publications-cms-guide.md`). Səhifələr silinmir, ünvanla açılır, açıq olanda sol menyuda görünür. "İnzibati işlərə baxan vəzifəli şəxslər" Media-dan bu
bölməyə köçürülüb. Ünvanı slug-dır, dəyişmir.
