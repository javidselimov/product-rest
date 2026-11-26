# "Maliyyə savadlılığı" bölməsi — redaktor qeydi (spec 047)

Bölmənin səhifələri bölmə şablonundadır: breadcrumb, paylaşma və solda bölmənin menyusu. Haqqımızda, Media və Beynəlxalq əməkdaşlıq bölmələri də
bu şablondadır. Menyu adları, sırası və bütün mətnlər admin paneldə **Səhifələr** ağacındandır. Kodda ad yazılmayıb.

Səhifələrin Figma görünüşü **adi redaktor işarələməsindən** qurulur: başlıqlar, sitat, siyahılar və media linkləri. Ayrıca sahə və ya bölmə yoxdur.
Sayt bir bloku tanımasa, həmin hissəni adi mətn kimi göstərir, mətn itmir.

| Səhifə (az / en slug) | Görünüş |
|---|---|
| Maliyyə savadlılığı — `maliyye-savadliligi` / `financial-literacy` (bölmənin özü) | Ümumi məlumat: bölmələr, tərif, prinsip kartları, hədəf qrupları, qalereya, sonda dəvət banneri |
| Maliyyə Savadlılığı portalı, Virtual Təhsil Platforması, Maliyyə məhsul və xidmətlərinin məlumat-axtarış sistemi | Platforma səhifəsi: giriş, qeyd qutusu, foto sırası, xətli bölmələr, platformaya keçid düyməsi |
| Seminarlar/vebinarlar, Müsabiqələr | Adi mətn (akkordeon və cədvəllər olduğu kimi) |

"(Kopya)" səhifələri (`-copy` slug) orijinalın görünüşünü alır. Yeni mətni orada hazırlayıb sonra əsas səhifəyə köçürə bilərsiniz.

## Ümumi məlumat və bölmənin özü

"Ümumi məlumat"ın mətni bölmənin özündədir (**Maliyyə savadlılığı** səhifəsi). Ziyarətçi `…/umumi-melumat` ünvanını açanda bölmənin səhifəsinə
yönləndirilir. Mətni **Maliyyə savadlılığı** səhifəsində redaktə edin. "Ümumi məlumat" səhifəsi ağacda qalır, amma ziyarətçi onu görmür.

## Sol menyu

Figma-da sol menyuda üç bənd var: portal, Virtual Təhsil Platforması və məlumat-axtarış sistemi. Yayım günü "Ümumi məlumat", "Seminarlar/vebinarlar",
"Müsabiqələr" və "Maliyyə savadlılığı (Kopya)" səhifələrində **"Sol menyuda göstər"** bayrağı söndürülür (spec 041). Paneldə bu, "Saytın menyusunda" kartında "Menyularda yox" seçimidir (spec 054).

- Səhifələr silinmir: breadcrumb-da qalırlar, birbaşa ünvanla da açılırlar.
- Hamburger panelində və mobil menyuda da yalnız sol menyudakı üç bənd görünür (spec 048): bayraq söndürülmüş səhifə orada yoxdur.
- Bayraq söndürülmüş səhifəni ziyarətçi açanda, o səhifə sol menyuda görünür (hamburgerdə yox).
- Bayrağı yenidən yandırsanız, səhifə sol menyuya qayıdır.

## "Maliyyə savadlılığı" səhifəsinin blokları

Redaktorda bloklar bu sıra ilə yazılır. Saytda da eyni sıra ilə göstərilir, banner isə həmişə ən sondadır.

| Redaktorda | Saytda |
|---|---|
| Birinci **Başlıq 2**-dən əvvəlki paraqraflar | Giriş mətni |
| **Başlıq 2** | Yeni bölmə. Altındakı hər şey növbəti Başlıq 2-yə qədər həmin bölmədədir |
| **Başlıq 3** (və ya tək qalın sətirdən ibarət paraqraf) | Alt başlıq ("Əsas hədəf qrupları") |
| **Sitat**, iki paraqraf: mətn, sonra mənbə | Tərif qutusu. Sonuncu paraqraf mənbədir ("İƏİT …, 2012") |
| **Nöqtəli siyahı**, hər bəndin birinci sətri qalın: `Dayanıqlı gəlir`, sonra təsvir | Prinsip kartları (4 sütun). Təsvir boş qala bilər |
| **Başlıq 3**-dən dərhal sonra gələn adi nöqtəli siyahı | Hədəf qrupu etiketləri |
| Yalnız **Media** düyməsi ilə qoyulmuş şəkil linklərindən ibarət paraqraf | Foto qalereya |
| **Sitat**, içində **poçt linki** olan: 1) dəvət sətri, 2) başlıq, 3) ünvan sətri və link | Göy banner və "…-a yazın" düyməsi |

Qeydlər:

- **Kartlar.** Siyahının bir bəndində də qalın başlıq yoxdursa, siyahı kart kimi deyil, adi siyahı kimi göstərilir.
- **İkonlar.** Kartların və etiketlərin ikonları dizaynın hissəsidir və sıra ilə verilir. Kart və ya etiket əlavə etsəniz, ikonlar təkrarlanır. Sırasını dəyişsəniz, ikonlar yerində qalır.
- **Qalereya.** Qalereyanın şəkilləri səhifənin faylları siyahısında təkrar göstərilmir. Paraqrafa adi link və ya mətn yazsanız, qalereya tanınmır.
- **Banner.** Banner yalnız **birinci** poçt linkli sitatdır. Düymənin ünvanı həmin linkdən götürülür.

## Platforma səhifələrinin blokları

| Redaktorda | Saytda |
|---|---|
| Birinci **Başlıq 2**-dən əvvəlki paraqraflar | Giriş mətni |
| **Sitat** (birincisi) | Göy fonlu qeyd qutusu ("Platformada yerləşdirilən bütün resurslar ödənişsizdir.") |
| Yalnız şəkil linklərindən ibarət paraqraf (birincisi) | Foto sırası. Hər şəkil yeni pəncərədə böyük açılır |
| **Başlıq 2** | Üst xətli bölmə ("Qeydiyyat", "Əlaqə" …) |
| Mətnin **ən sonunda**, yalnız bir veb linkdən ibarət paraqraf | Platformaya keçid düyməsi. Düymənin yazısı linkin mətnidir |

Qeydlər:

- Qeyd qutusu və foto sırası mətnin harasında olursa olsun girişdən sonra göstərilir. İkinci sitat və ya ikinci şəkil paraqrafı yazıldığı yerdə adi mətn kimi qalır.
- Düymə yalnız `http://` və ya `https://` linkidir və mətnin sonuncu paraqrafı olmalıdır. Paraqrafda linkdən başqa mətn olsa, adi paraqraf kimi qalır.

## Yayım günü (seed)

`api-cbar-admin` migration-u `0030-financial-literacy-seed.sql` dörd səhifənin az və en mətnini Figma quruluşunda yazır: bölmənin özü və üç platforma
səhifəsi. Mətn yalnız hələ köhnə saytdan gələn formadadırsa dəyişdirilir. Redaktə etdiyiniz mətnə toxunulmur. EN mətnin yeni hissələri (başlıqlar,
kartlar, etiketlər, düymələr) tərcümə qaralamasıdır, yoxlayın.
