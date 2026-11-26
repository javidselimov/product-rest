# Mərkəzi banklarla əməkdaşlıq — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Mərkəzi banklarla əməkdaşlıq»** səhifəsini izah edir: xarici ölkələrin mərkəzi bankları və nəzarət
qurumları ilə imzalanmış Anlaşma Memorandumlarının cədvəli admin paneldən necə idarə olunur və dəyişiklik saytda harada,
necə görünür.

> Köhnə saytda bu səhifə adi CMS mətni idi: dörd bankın (İsveçrə Milli Bankı, Polşa Milli Bankı, Türkiyə Cümhuriyyəti Mərkəzi
> Bankı, Almaniya Bundesbankı) əməkdaşlıq tarixçəsi. Memorandumların siyahısı yox idi. Yeni saytda **hər memorandum admin
> paneldə ayrıca qeyddir** (təşkilat, ölkə, il), HTML cədvəli yazmaq lazım deyil. Səhifənin başlığı və giriş mətni isə
> əvvəlki kimi **Səhifələr** bölməsindədir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Məzmun** → **Memorandumlar** (`/memorandums`) |
| **Sayt (AZ)** | `https://<sayt>/az/merkezi-banklarla-emekdasliq` |
| **Sayt (EN)** | `https://<sayt>/en/cooperation-with-central-banks` |
| **Saytda yolu** | **Beynəlxalq əməkdaşlıq** → sol menyuda bu səhifə |
| **Ünvan** | Dəyişməyib, köhnə səhifənin slug-ıdır. Yönləndirmə lazım deyil |

Səhifə **iki yerdən** qurulur:

| Saytda | Haradan gəlir | Admin paneldə |
|---|---|---|
| Başlıq və giriş mətni | CMS səhifəsi `merkezi-banklarla-emekdasliq` / `cooperation-with-central-banks` | **Səhifələr** → Beynəlxalq əməkdaşlıq → bu səhifə |
| Cədvəlin sətirləri | Memorandumlar | **Memorandumlar** |
| Cədvəlin başlığı, «Təşkilat», «Ölkə», «Tarix», «Tarix: əvvəlcə yenilər» | Saytın sabit etiketləri (az/en) | Dəyişdirilmir |

Dəyişiklik saytda **təsdiqsiz, ən geci ~10 saniyə** sonra görünür (saytın qısa keşi var). Saxladıqdan sonra səhifəni bir-iki
dəfə yeniləmək kifayətdir.

**Kim redaktə edə bilər:** **admin** və **moderator** rolları. Başqa rolun istifadəçisi bölməni açanda «icazə yoxdur» xətası görür.

---

## 2. Yayımdan sonra bir dəfəlik hazırlıq

Yeni sayt ilk dəfə yayımlananda dizayndakı **28 memorandum avtomatik** yaradılır, az və en dilində, dərc olunmuş halda
(2026-cı ildən 1996-cı ilə qədər). Eyni anda səhifənin mətninin əvvəlinə dizayndakı giriş paraqrafı əlavə olunur —
**yalnız** mətn hələ köhnə haldadırsa (birbaşa qalın bank adı ilə başlayırsa). Mətni əvvəlcədən özünüz dəyişmisinizsə,
səhifəyə toxunulmur. Paneldə artıq memorandum varsa, heç nə təkrar yaradılmır.

Aşağıdakıları bir dəfə edin:

### 2.1. İngiliscə mətnləri yoxlayın

Dizaynda və köhnə saytda ingiliscə variant yoxdur. Bütün ingiliscə **təşkilat adları, ölkələr və giriş paraqrafı tərcümə
qaralamasıdır**. Hər memorandumu açıb «Təşkilat (EN)» və «Ölkə (EN)» sahələrini rəsmi adla tutuşdurun. Giriş paraqrafını
**Səhifələr** bölməsində, səhifənin ingiliscə mətnində yoxlayın.

### 2.2. Köhnə bank mətnlərinə qərar verin

Dörd bankın köhnə mətni səhifədə qalır, amma **saytda göstərilmir**: dizaynda yalnız giriş və cədvəl var. Mətn lazım deyilsə,
**Səhifələr** bölməsində silin. Lazımdırsa, olduğu kimi saxlayın — sayta təsir etmir.

---

## 3. Memorandum əlavə etmək

1. **Memorandumlar** → **Yeni**.
2. Sahələri doldurun:

| Sahə | Nə yazılır | Saytda |
|---|---|---|
| **Status** | «Dərc olunub» seçin. «Qaralama» saytda görünmür | — |
| **İmzalanma ili** | Dörd rəqəm, 1991-dən gələn ilə qədər. Məcburidir | «Tarix» sütunu |
| **Sıra** | Eyni ilin memorandumları arasında yer: kiçik rəqəm yuxarıda. Addımı 10 götürün (10, 20, 30) ki, araya sətir salmaq asan olsun | Sətrin il daxilində yeri |
| **Azərbaycan / İngilis dilində göstər** | İşarəni götürsəniz, sətir o dildə görünmür | — |
| **Təşkilat (AZ / EN)** | Qurumun tam adı | Birinci sütun |
| **Ölkə (AZ / EN)** | Ölkənin adı. Saytda yazdığınız kimi görünür, qısaltma da olar («BƏƏ») | İkinci sütun |

3. **Yadda saxla**.

Bir dili tam boş saxlaya bilərsiniz: sətir o dildə saytda görünməyəcək. Amma dilə başlamısınızsa (məsələn, yalnız təşkilatı
yazmısınız), həm təşkilat, həm ölkə məcburidir — forma boş sahəni göstərəcək.

Eyni təşkilatla iki memorandum imzalanıbsa (məsələn, Rusiya Federasiyasının Mərkəzi Bankı — 2026 və 2006), **iki ayrı qeyd**
yaradın.

---

## 4. Düzəltmək, sıranı dəyişmək, silmək

- **Düzəltmək:** siyahıda sətri açın, sahəni dəyişin, **Yadda saxla**.
- **Sıranı dəyişmək:** eyni ilin sətirlərində «Sıra» rəqəmini dəyişin. Başqa ilin sətirlərinə təsir etmir.
- **Müvəqqəti gizlətmək:** statusu «Qaralama» edin.
- **Silmək:** siyahıda sil düyməsi → təsdiq. Sətir saytdan və siyahıdan çıxır.

Siyahıda təşkilat və ya ölkə adına görə axtarış, statusa görə süzgəc var. Siyahı saytdakı kimi düzülüb: ən yeni il yuxarıda.

---

## 5. Saytda necə görünür

- Başlıq, giriş mətni, cədvəlin başlığı, sağda çeşidləmə seçimi, sonra cədvəl: **Təşkilat | Ölkə | Tarix**.
- Standart sıra: **ən yeni il yuxarıda**, eyni ilin sətirləri paneldəki «Sıra» ilə.
- Ziyarətçi «Tarix:» seçimindən **«əvvəlcə köhnələr»**i seçə bilər. Onda illər tərsinə düzülür, amma eyni ilin sətirləri öz
  aralarında əvvəlki sıranı saxlayır. Seçim ünvanda qalır (`?sort=oldest`), yəni linki göndərdiyiniz şəxs eyni sıranı görür.
- Telefonda və planşetdə cədvəl yenə üç sütunludur, uzun ad sətirdən sətrə keçir.
- Çapda çeşidləmə seçimi görünmür, cədvəl tam çap olunur.

---

## 6. Tez-tez rast gəlinən hallar

| Vəziyyət | Səbəb və həll |
|---|---|
| Yeni sətir saytda yoxdur | Status «Qaralama»dır, həmin dil boşdur və ya «… dilində göstər» işarəsi götürülüb. ~10 saniyə gözləyib səhifəni yeniləyin |
| Sətir ingiliscə səhifədə yoxdur | «Təşkilat (EN)» və «Ölkə (EN)» doldurulmayıb |
| Cədvəl ümumiyyətlə yoxdur, köhnə bank mətnləri görünür | Dərc olunmuş memorandum yoxdur və ya xidmət müvəqqəti cavab vermir. Sayt belə halda səhifənin bütün mətnini göstərir |
| Giriş mətninin bir hissəsi saytda görünmür | Girişdə qalın başlıq sətri (yalnız qalın yazıdan ibarət paraqraf və ya başlıq) var. Sayt mətni ilk belə sətirdən kəsir. Girişdə qalın başlıq yazmayın |
| «İl … arasında olmalıdır» xətası | İl 1991-dən əvvəl və ya gələn ildən sonradır |
| Səhifənin ünvanını (slug) dəyişdim, cədvəl itdi | Cədvəl səhifənin ünvanına bağlıdır. Ünvanı əvvəlki halına qaytarın və ya proqramçıya müraciət edin |
