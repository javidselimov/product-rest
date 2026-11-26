# "Sual-cavab" (FAQ) — redaktor qeydi (spec 051)

"Sual-cavab" **ayrıca məzmun növüdür**: mövzular, suallar və videolar admin paneldə **Sual-cavab** bölməsindədir (tablar: Suallar, Mövzular,
Videolar). Suallar səhifənin mətnində HTML siyahı kimi yazılmır. Səhifənin özü (`sual-cavab` / `faq`) yalnız başlığı və ünvanı verir. Redaktorlar
üçün addım-addım təlimat: `../../dokumentasiyalar/sual-cavab-guide.md`. Spec: `../../specs/051-faq-page/`.

| Saytda | Haradan gəlir |
|---|---|
| Başlıq (H1), ünvan | CMS səhifəsi `sual-cavab` / `faq` (`FAQ_SLUG`, `entities/page-node`) |
| Mövzu kartları, suallar, cavablar | `GET /api/v1/faq?locale=` (`features/faq`) |
| "Video sual-cavab" kartları | Eyni cavabın `videos` hissəsi |
| Bölmə səhifəsindəki keçid kartı | `GET /api/v1/faq/topics?pageId=&locale=` — mövzunun "Bağlı səhifələri" |
| Axtarış, "Mövzu", "Bax", "N sual" kimi etiketlər | Saytın sabit mətnləri, `locales/{az,en}/faq.json` |

## İki görünüş, bir səhifə

- **A — bütün mövzular** (`/az/sual-cavab`): mövzu kartları bağlı gəlir (native `<details>`). Açılan kartda nömrələnmiş suallar və "Ayrıca aç"
  linki var. Mövzu seçimi yoxdur.
- **B — bir mövzu** (`?topic=<açar>`): mövzunun adı başlıqdır, suallar düz siyahıdır, yanında mövzu seçimi var. "Bütün mövzular" A-ya qaytarır.
  Tanınmayan açar A-nı açır.
- **Axtarış** (`?q=`): sual mətnində **və** cavabın mətnində axtarır. Böyük-kiçik hərf və İ/ı fərqi nəzərə alınmır ("inflyasiya" =
  "İNFLYASİYA"), ə/e isə fərqli hərflərdir (`shared/lib/search-fold.ts`).
  Uyğun suallar açıq gəlir. Heç nə tapılmasa "«…» üzrə sual tapılmadı" yazılır və "Axtarışı təmizlə" linki çıxır, videolar qalır.
- Hamısı GET forması və linkdir, JS-siz də işləyir. Paylaşılan ünvan axtarışı və mövzunu saxlayır.

Sualın nömrəsi mövzudakı yeridir: saytda "1. Pul siyasəti nədir?". Nömrəni mətnə yazmayın, sıra dəyişəndə özü dəyişir. Axtarış nəticəsində də nömrə
eyni qalır.

## Sualın linki

Hər sualın görünməz ankoru var: `#sual-<id>` (məs. `/az/sual-cavab#sual-101`). Ankor hər iki dildə eynidir. Link açılanda brauzer mövzunu açır,
kiçik client komponenti (`widgets/faq/faq-hash-opener.tsx`) sualın özünü açıb ona sürüşdürür. JS-siz brauzerdə ən azı mövzu açılır. Sual id-si
paneldə sualın ünvanındadır (`/faq/101`).

## Cavabın mətni

Cavab adi rich-text redaktorudur: paraqraf, siyahı, cədvəl, link, şəkil, YouTube. Sayt onu digər CMS mətnləri kimi `prepareCmsHtml` ilə süzür və
`widgets/cms-content` ilə göstərir. Boş paraqraf (`<p></p>`) boş cavab sayılır.

## Görünmə qaydası

- **Mövzu**: "Dərc olunub", həmin dildə adı var **və** həmin dildə ən azı bir görünən sualı var.
- **Sual**: "Dərc olunub" və həmin dildə həm sual, həm cavab yazılıb.
- **Video**: "Dərc olunub" və həmin dildə başlığı var. Kart YouTube-un önizləmə şəklidir, klikdə video YouTube-da yeni pəncərədə açılır.
- Sıra paneldəkidir: mövzular və videolar "Sıranı dəyiş" dialoqundan, suallar mövzunun formundan.

FAQ boşdursa və ya API cavab vermirsə, səhifə öz CMS mətnini göstərir (köhnə əl ilə yazılmış siyahı). Suallar heç vaxt tamamilə itmir.

## Bölmə səhifəsindən keçid kartı

Mövzunun formunda **"Bağlı səhifələr"**-ə səhifə əlavə olunanda həmin səhifənin mətnindən sonra, fayllardan əvvəl kart görünür:
"Pul siyasəti üzrə sual-cavab · 23 sual · Bax →". Bütün kart bir linkdir və B görünüşünü açır (`?topic=`). Bir səhifəyə bir neçə mövzu bağlana
bilər, kartlar bağlama sırası ilədir. Mövzunun həmin dildə görünən sualı yoxdursa kart çıxmır. FAQ səhifəsinin özündə kart yoxdur. Seed (`0033`)
yalnız "Pul siyasəti" mövzusunu `pul-siyaseti` səhifəsinə bağlayır.

## İngilis dili

Seed suallarını yalnız az dilində yaradır. Mövzuların en adları var, amma en sualı olmayan mövzu görünmür, yəni en FAQ boşdur və `/en/faq` öz CMS
mətnini göstərir (en səhifəsi varsa). En tərcümə paneldə hər sualın **EN** tabına yazılır. Siyahıdakı **"EN yoxdur"** süzgəci qalan işi göstərir.
İlk en sual dərc olunan kimi en FAQ kod dəyişmədən işləyir. Mövzu açarı (`?topic=`) və sual ankoru dillərdə eynidir, dil dəyişdiricisi onları
saxlayır. Footer-in "Naviqasiya" sütununda "FAQ" linki yalnız en FAQ səhifəsi olanda görünür.

## Köhnə ünvanlar

- Köhnə saytın `page-131/…` ünvanı (`?language=en` ilə də) `/{dil}/sual-cavab` və ya `/en/faq`-a yönlənir (`src/proxy.ts`, `LEGACY_FAQ_PAGE`).
  Canlı bazada id başqadırsa, regex deploy-dan əvvəl düzəldilir (spec 051 T088).
- Köhnə səhifənin "Playlist-ə keçid" linki köçürülməyib: eyni videoya aparırdı.
