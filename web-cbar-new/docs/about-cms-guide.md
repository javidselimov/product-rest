# "Haqqımızda" səhifələrini yeni dizayna salmaq — redaktor təlimatı

Saytın "Haqqımızda" bölməsi yeni dizayndadır: tarix kartları, rəngli qutular, açılan
siyahılar, tarix xətti (timeline), missiya banneri. Bunlar üçün admin paneldə ayrıca forma
yoxdur. Sayt bu blokları adi redaktorda yazdığınız **cədvəl, sitat, accordion və
başlıqlardan** özü qurur.

Bu təlimat hansı düyməni harada işlətməyi göstərir. Qayda tanınmasa da heç nə itmir: mətn
saytda adi mətn kimi görünür. Sadəcə xüsusi dizayn alınmır.

> Texniki mənbə: `specs/024-about-us-redesign/contracts/cms-markup.md`. Təlimat ilə kontrakt
> fərqlənsə, kontrakt doğrudur.

## Əvvəlcə: "(Kopya)" səhifələrində hazırlayın

Səhifə ağacında "Haqqımızda" altında "(Kopya)" səhifələri var: "Haqqımızda (Kopya)",
"Tarix (Kopya)", "Missiya və dəyərlər (Kopya)", "Struktur bölmələr (Kopya)". Bunlar orijinal
səhifə ilə eyni dizaynla göstərilir.

1. Məzmunu əvvəl "(Kopya)" səhifəsində formaya salın və yadda saxlayın.
2. Saytda həmin səhifəni açıb yoxlayın (masaüstü və telefon).
3. Hər şey düzgündürsə, eyni məzmunu orijinal səhifəyə köçürün.

Beləliklə saytın əsas səhifəsi hazırlıq zamanı yarımçıq görünmür.

## Hamısı üçün ümumi qaydalar

- **Başlıq** üçün `Başlıq 2` və ya `Başlıq 3` düyməsini işlədin. Yalnız `Qalın` ilə yazılmış
  ayrıca sətir də başlıq sayılır, amma başlıq düyməsi daha etibarlıdır.
- **Rəng vermə.** `Mətn rəngi` düyməsini bu səhifələrdə işlətməyin, rənglər dizayndan gəlir.
- **Cədvəldə hücrə birləşdirmə.** Cədvəl qaydaları hər sətirdə tam iki hücrə gözləyir.
  Birləşdirilmiş və ya üçüncü hücrəli cədvəl adi cədvəl kimi göstərilir.
- **Başqa formatdan yapışdırma** (Word, sayt) əlavə boş sətirlər və gizli formatlar
  gətirə bilər. Yapışdırandan sonra boş paraqrafları silin.
- Qaydalar səhifənin **ən üst səviyyəsinə** baxır. Cədvəl içində cədvəl, sitat içində cədvəl
  kimi iç-içə quruluşlar tanınmır.

## Sol menyu

Sol menyu "Haqqımızda" səhifəsinin uşaqlarından, ağacdakı sıra ilə qurulur. Bəndi menyudan
çıxarmaq üçün iki bayraq və menyu yeri seçimi var, təsirləri fərqlidir (spec 041, spec 054):

| Bayraq (söndürülüb) və ya seçim | Üst menyu, mobil, footer | Sol menyu | Breadcrumb | Ünvanla açılır | Alt səhifələr |
|---|---|---|---|---|---|
| Aktiv | yox | yox | — | yox (404) | üst səviyyəyə qalxır |
| Menyuda görünür | yox | yox | qısa: Ana səhifə › Bölmə › Səhifə | bəli | üst səviyyəyə qalxır |
| Menyudakı yeri: «Menyularda yox» | footer: bəli; açılan menyular: yox (kök bölmə qalır) | yalnız səhifənin özü və ya alt səhifəsi açıq olanda | bəli | bəli | menyularda gizlənir, üst səviyyəyə qalxmır |
| Menyudakı yeri: «Yalnız açılan menyularda» (spec 054) | footer və açılan menyular: bəli | yalnız səhifənin özü və ya alt səhifəsi açıq olanda | bəli | bəli | sol menyuda gizlənir |

Səhifəni menyulardan çıxarmaq, amma ünvanını və breadcrumb-unu saxlamaq lazımdırsa səhifə formunun **"Saytın menyusunda"** kartında
**"Menyudakı yeri" → "Menyularda yox"** seçin (spec 054-ə qədər bu, "Sol menyuda göstər" bayrağı idi). Spec 048-dən bəri belə səhifə sol menyu ilə yanaşı nav çubuğunun açılan menyusunda, hamburger panelində
və mobil menyuda da görünmür (açıq olanda da). "Menyuda görünür" isə səhifəni bütün saytın naviqasiyasından
çıxarır, alt səhifələrini üst menyuya qaldırır.
Səhifə formasındakı "Saytın menyusunda" kartı hər dil üçün üst və sol menyunun nəticəsini
səbəbi ilə göstərir.

## 1. "Haqqımızda" əsas səhifəsi

| Dizaynda | Redaktorda necə yazılır |
|---|---|
| Giriş mətni | Adi paraqraflar |
| **Tarix kartları** (tarix + qısa mətn) | `Cədvəl əlavə et` → **2 sütun**. Hər sətir bir kartdır: sol hücrə tarix (`11.02.1992`), sağ hücrə mətn. 1–6 sətir. Başlıq sətri lazım deyil, varsa nəzərə alınmır |
| **Rəngli qutu** ("Mərkəzi Bankın məqsədləri") | Mətni seçib `Sitat` düyməsini basın. Sitatın ilk sətri `Başlıq 3` olsa, qutunun başlığı olur |
| **Açılan siyahı** ("Funksiyalar") | Bölmə başlığı `Başlıq 2`, altında hər funksiya üçün bir `Accordion`. Başlıq hissəsinə funksiyanın adı, içinə izahı. Ardıcıl accordion-lar bir qrup olur, birincisi açıq göstərilir |

Nümunə ardıcıllıq: giriş paraqrafı → 2 sütunlu cədvəl → sitat (başlıq + mətn) →
`Başlıq 2` "Mərkəzi Bankın funksiyaları" → accordion-lar.

Səhifədə yalnız **ilk** cədvəl tarix kartlarına çevrilir. Sonrakı cədvəllər adi cədvəldir.

## 2. "Tarix" səhifəsi

| Dizaynda | Redaktorda necə yazılır |
|---|---|
| **Böyük başlıq kartı** (göy fonlu) | Cədvəldən **əvvəl** bir `Başlıq 2`: "Bir əsrdən artıq mərkəzi bankçılıq tarixi". Vurğulanacaq sözləri seçib `Kursiv` edin, onlar başqa rəngdə görünür |
| **Tarix xətti** (timeline) | `Cədvəl əlavə et` → **2 sütun**. Hər sətir bir hadisədir |
| Sol hücrə | Tarix: `7 mart 1919`, `fevral 1992` və ya yalnız `1992`. İçində **4 rəqəmli il** olmalıdır |
| Sağ hücrə | Birinci sətir `Başlıq 3` (hadisənin başlığı), sonra mətn. Şəkil lazımdırsa `Şəkil əlavə et` ilə ayrıca sətirdə |
| **Əsas mərhələ** (çərçivəli qutu) | Sol hücrədə **yalnız ili** seçib `Qalın` edin: `11 fevral` **`1992`** |
| Altdakı illər oxu | Avtomatik qurulur, ayrıca yazmaq lazım deyil |

Saytda tarix bir-bir il kartı kimi göstərilir. Ziyarətçi oxdakı ilə klikləyir və ya oxlarla
vərəqləyir. Eyni ilin bütün sətirləri **bir kartda** toplanır.

**Şəkillərin düzülüşü** avtomatik seçilir:

| Şəkil sayı | Görünüş |
|---|---|
| 1 | bir böyük şəkil (`single`) |
| 2 | yan-yana: solda dar şaquli, sağda enli (`note`) — əskinasın ön və arxa üzü üçün |
| 3 | üstdə bir enli, altda iki kiçik (`hero2`) |
| 4 və daha çox | üstdə bir enli, qalanları iki sütunda |

Başqa düzülüş istəyirsinizsə, sağ hücrənin sonuna **ayrıca sətirdə** yazın:

| Yazın | Görünüş |
|---|---|
| `[foto: single]` | bir böyük şəkil |
| `[foto: note]` | dar + enli yan-yana |
| `[foto: hero2]` | üstdə enli, altda iki |
| `[foto: tall]` | solda bir hündür, sağda iki üst-üstə (məs. bina + iki detal) |

Bu sətir saytda görünmür. Səhv yazılıbsa (məs. `[foto: böyük]`), saytda olduğu kimi görünür,
belə ki səhvi dərhal görəcəksiniz.

- İli olmayan sətir silinmir: onun mətni əvvəlki hadisənin kartında markersiz göstərilir.
- İllər oxda **cədvəldəki sıra ilə** düzülür. Yoxlama üçün əlavə etdiyiniz sətirləri (məs.
  `13 fevral 2026 / ffgfgf`) mütləq silin, yoxsa həmin il oxda yanlış yerdə görünəcək.
- Cədvəldən sonra yazılan mətn tarix kartlarından sonra adi mətn kimi gəlir.

## 3. "Missiya və dəyərlər" səhifəsi

| Dizaynda | Redaktorda necə yazılır |
|---|---|
| **Missiya banneri** (göy zolaq) | Missiya cümləsini seçib `Sitat` düyməsini basın. Səhifənin ilk sitatı banner olur. Teal rəngdə görünəcək sözləri ("cavabdehliyi", "dürüstlüyü", "inkişafı") seçib `Kursiv` edin |
| **Dəyər sətri** (sol tərəfdə ad və ikon, sağda mətn) | Hər dəyər üçün `Başlıq 3` ("Dürüstlük"), altında mətn. Növbəti başlığa qədər hər şey o dəyərin mətnidir |
| Dəyərin ikonu | Başlıqdan sonra ayrıca sətirdə `Şəkil əlavə et` ilə kiçik ikon (kvadrat, sadə). Saytda adın yanına keçir |

Sitat yoxdursa banner göstərilmir, dəyər sətirləri yenə qurulur.

## 4. "Struktur bölmələr" səhifəsi

- **Təşkilati sxem**: interaktiv sxem qurulubsa (**Təşkilat → Təşkilati struktur**), saytda
  o göstərilir. Qurulmayıbsa, səhifənin məzmununa `Şəkil əlavə et` ilə bir şəkil qoyun.
  Saytda tam enə uyğunlaşır, kliklə tam ölçüdə yeni tabda açılır. Kiçik yazılar oxunsun deyə
  yüksək keyfiyyətli şəkil yükləyin.
- **Əsasnamələr**: sxemin altındakı fayl sətirləri (dizaynda "Mərkəzi Bankın təşkilatı
  strukturu", "Mərkəzi Bankda vətəndaşların qəbulu cədvəli") səhifənin **Sənədlər**
  hissəsindən gəlir — addım-addım aşağıda.
- Şöbələrin siyahısı və hər şöbənin səhifəsi **Haqqımızda → Təşkilat → Şöbələr** bölməsindən gəlir (admin panelin sol menyusunda "Haqqımızda" qrupu).

### Əsasnamə fayllarını əlavə etmək

Sənədlər masaüstündə sxemdən sonra, telefon və planşetdə sxemdən əvvəl görünür. Sənəd
bağlanmayıbsa həmin hissə sadəcə göstərilmir — saytda fayl yoxdursa, səbəb budur, xəta
deyil.

1. Admin paneldə **Səhifələr** bölməsini açın, ağacda "Haqqımızda" altından **"Struktur
   bölmələr"** səhifəsini seçin (əvvəl "(Kopya)" variantında sınayın, bax yuxarı).
2. Formanın ən aşağısında **Sənədlər** kartı var — yalnız mövcud səhifəni redaktə edəndə
   görünür, yeni səhifə yaradanda yox. **Sənəd əlavə et** düyməsini basın.
3. Açılan media pəncərəsində PDF-i seçin. Fayl hələ yüklənməyibsə, əvvəl **Media** bölməsinə
   yükləyin, sonra burada seçin.
4. **Başlıq (AZ)** və **Başlıq (EN)** yazın — saytda fayl sətrində görünən ad budur, faylın öz
   adı yox. Məsələn `Mərkəzi Bankın təşkilatı strukturu` / `Organisational structure of the
   Central Bank`. Bir dildə başlıq boş qalsa, o dildə digər dilin başlığı göstərilir.
5. **Qrup etiketi**-ni **boş saxlayın**. Boşdursa sənədlər dizayndakı kimi sətir-sətir
   göstərilir. Etiket yazılsa (məsələn il), sənədlər həmin etiketlə açılan siyahıya
   (accordion) yığılır — bu səhifədə lazım deyil.
6. **Bağla** düyməsini basın. Növbəti fayl üçün 2–6-nı təkrarlayın.
7. Sıranı sətirdəki **yuxarı/aşağı** oxları ilə dəyişin; adı **qələm**, səhifədən ayırmağı
   **zibil qabı** ikonu ilə edin. **Ayır** faylı Media kitabxanasından silmir.
8. Saytda `/az/organization?section=divisions` (ingiliscə `/en/…`) səhifəsini açıb yoxlayın.

## 5. Şöbə səhifəsi (Təşkilat → Şöbələr → Təsvir)

Rəhbəri belə yazın, saytda "Direktor" başlığı altında ad kimi göstərilir:

```
Direktor: Rzayev Samir Eyvaz oğlu
```

Hər məlumat ayrıca paraqrafdadır (`Şöbə rəisi: …` də olar). Paraqrafda link (məs. e-poçt
linki) varsa, o paraqraf adi mətn kimi qalır.

### Şöbənin əsasnaməsi

Dizaynda şöbə səhifəsində məlumat kartının altında bir fayl sətri var — "Əsasnamə". Bu,
şöbənin öz formasındakı **Əsasnamə** sahəsindən gəlir; §4-dəki Sənədlər kartı ilə qarışdırmayın
(o, "Struktur bölmələr" ümumi səhifəsinə aiddir).

1. Admin paneldə **Haqqımızda → Təşkilat → Şöbələr** bölməsini açın, şöbəni seçin.
2. Formada **Əsasnamə (AZ)** və **Əsasnamə (EN)** media sahələri var — hər dil üçün ayrı fayl
   seçilir. Fayl hələ yüklənməyibsə, əvvəl **Media** bölməsinə yükləyin, sonra burada seçin
   (adətən PDF).
3. **Yadda saxla**. Saytda `/az/organization/divisions/{id}` səhifəsində kartın altında
   "Əsasnamə" sətri görünür; sətrin adı sabitdir (faylın adı yox), klik faylı yeni tabda açır.
4. Bir dildə fayl seçilməyibsə həmin dildə sətir sadəcə göstərilmir — xəta deyil. Faylı
   çıxarmaq üçün media sahəsini təmizləyib yadda saxlayın; bu, faylı Media kitabxanasından
   silmir.

## 6. Əməkdaşın tərcümeyi-halı (Təşkilat → Heyət → Tərcümeyi-hal)

Bölmələri `Başlıq 3` ilə ayırın: "Doğum tarixi", "Təhsil", "Peşəkar fəaliyyəti", "Ailə
vəziyyəti". Hər başlığın altında adi mətn. Başlıqsız tərcümeyi-hal da göstərilir, amma
bölmələrə ayrılmır.

**Sıra vacibdir:** İdarə Heyəti siyahısında **birinci** əməkdaş saytda Sədr kartı kimi
ayrıca göstərilir, qalanları müavinlərdir.

## Nə etməməli

- Rəngli və ya fərqli ölçülü mətn (dizayn öz rənglərini verir).
- Cədvəldə hücrə birləşdirmə, 3 sütunlu tarix cədvəli.
- Başlığı böyük hərflərlə və ya ayrıca qalın paraqrafla "taklid" etmək. `Başlıq` düyməsini
  işlədin.
- Missiya bannerini və ya qutunu şəkil kimi yükləmək (mətn axtarışda və ekran oxuyucuda
  itir).
