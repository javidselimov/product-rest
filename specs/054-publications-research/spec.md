# Feature Specification: "Nəşrlər və tədqiqatlar" bölməsi — Figma dizaynı, işçi məqalələri və ümumi arxiv qaydaları

**Feature Branch**: `054-publications-research`

**Created**: 2026-11-19

**Status**: Draft

**Input**: "bu sehifenin butun subpagelir yeni orda olan hamisnin dizyanin product-rest burada icra etmek isteyirem bunun ucun spec
yaradib ishe davam etmeyi planlayiram amma kohne saytin istifade etdiyi qaydalari da ummmileshdir"

"Bu səhifə" Figma faylı "cbar website (Copy)", səhifə "Publications and research" (`2698:5000`) deməkdir: bölmənin 15 ekranı, hər biri
desktop (1728), tablet (744) və mobil (390) kadrı ilə, üstəlik il dropdown-ları, sol menyu və mega menyu komponentləri.

Qərarlar (2026-11-19, istifadəçi):

1. **İşçi məqalələri ayrıca məzmun növüdür** (spec 044/045/051/052/053 kimi): admin paneldə öz bölməsi, saytda siyahı və hər məqalənin öz
   detal səhifəsi. "İşçi məqalələr silsiləsi" CMS səhifəsi başlıq, ünvan, giriş mətni və məlumat olmayanda fallback mətni verir.
2. **Köhnə məqalələr köçürülür**, ayrıca son fazada: köhnə saytda hər məqalə ayrıca səhifə idi (`page-NNN/<slug>`) və yeni bazaya
   köçməyib. Canlı cbar.az-dan oxunub seed olunur (spec 053 `seed/` nümunəsi). Həcmi böyükdür (~78 məqalə × 2 dil + PDF-lər), ona görə bu
   faza ayrıca qiymətləndirilir və istifadəçi onu təxirə sala bilər.
3. **Siyahı Figma Variant B-dir** (`2825:22947`, kompakt sətirlər). Kliklə məqalənin detal səhifəsi açılır (`2703:6295`). Variant A
   (`2707:8452`, böyük kartlar) qurulmur. İstifadəçi "biri ümumi, digəri detal" dedi və detal kadrını seçdi, bu belə anlaşılıb (Assumptions).
4. **Bölmə Figma-dakı kimidir, Figma-da olmayan altı köhnə səhifə menyulardan çıxır** (2026-11-19 düzəliş, ilk qərarı əvəz edir:
   "bu figmadaki kimi olmalidir figmada olmayani saxlamayaq"). Bu səhifələr: Maliyyə sabitliyi hesabatı, Bank sektoru üzrə makroprudensial
   siyasət çərçivəsi, İstehlakçıların hüquqlarının müdafiəsi və Maliyyə savadlılığı, Dayanıqlı Maliyyə üzrə Yol Xəritəsi, Kreditləşmə
   fəaliyyəti sorğusu, Maliyyə xidmətləri tənzimləyici çərçivə təhlili. Heç bir qrupa keçmir. Bölmənin bütün menyularında (sol menyu,
   mega menyu, hamburger paneli, mobil siyirtmə) görünmür. Silinmir, ünvanları işləyir (Konstitusiya I.3: səssiz itki yoxdur).
5. **Mega menyunun dizaynı bu spec-də dəyişmir** (2026-11-20, plan; ilk qərarı əvəz edir). Figma kadrı `2810:21571` yeni header dizaynının
   (`Header menu` `3195:2363`, Variant B) parçasıdır və orada "Maraqlı ola bilər" bloku ilə alt başlıqlar gizlidir. Header redizaynı bütün
   bölmələr üçün ayrıca **spec 055**-dir. Bu spec menyu qrupu etiketini (səhifəyə verilən, ağacın dördüncü səviyyəsi olmayan) yalnız **data kimi**
   saxlayır. Onu 055 göstərəcək. Ağac üç səviyyə qalır.
6. **Gizli Figma qatları qurulmur** (2026-11-20, plan; spec 053 qaydası). Detalda açar sözlər və JEL vergüllə bir sətir mətndir, çip deyil.
   İllik hesabatın gizli "şrift" qutusu qurulmur, şrift linki mətndə qalır.
7. **"Ödəniş xidmətləri" bu bölməyə köçür, yalnız açılan menyularda görünür** (2026-11-20, plan). Figma-da sol menyuda yoxdur, mega menyuda
   var. Bunun üçün səhifəyə yeni "yalnız açılan menyularda" seçimi verilir.
8. **Köhnə faylların ölçüsü düzəldilir** (2026-11-20, plan). Köhnə importdan gələn faylların bazadakı ölçüsü saxtadır (çoxu 1064 bayt).
   Admin API real ölçünü bir dəfə fayl anbarından oxuyub yazır. Bu, bütün saytda ölçüləri düzəldir.

Ümumiləşdirmə (istifadəçinin "köhnə saytın qaydalarını ümumiləşdir" tələbi): köhnə bölmədə hər səhifə iki formadan birində yazılıb. Bəzisi
**il arxividir** (il başlıqlı akkordionlar, içində fayl linkləri), bəzisi **tək sənəddir** (bir fayl linki olan paraqraf). Yeni sayt bu iki
formanı slug siyahısına görə deyil, **mətnin formasına görə** tanıyır. Bölmədə hər səhifə, sonradan əlavə olunan da, avtomatik doğru
şablonla görünür. Redaktor bu səhifələri adi səhifə redaktorunda yazmağa davam edir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi işçi məqalələrini tapır və oxuyur (Priority: P1)

Tədqiqatçı "Nəşrlər və tədqiqatlar → Tədqiqatlar → İşçi məqalələri" səhifəsini açır. Giriş mətnindən sonra axtarış sahəsi ("Məqalə adı,
müəllif və ya açar söz"), il seçimi ("İl: Hamısı"), "Axtar" düyməsi və "Filtrləri təmizlə" linki görünür. Altında "Bütün məqalələr" başlıqlı
siyahı var. Hər sətirdə məqalə nömrəsi ("№ 02/2026"), il ("Tarix: 2026"), başlıq, müəlliflər və məqalənin dili ("İngilis dili") yazılır.
Ən yeni məqalə birinci gəlir, siyahı səhifələnir. Sətrə klik məqalənin öz səhifəsini açır. Orada başlıq, dörd məlumat sahəsi
("Müəllif(lər)", "Nömrə", "Dil", "Tarix"), "Xülasə", "Açar sözlər", "JEL təsnifatı" (hər biri vergüllə bir sətir) və PDF kartı var.

**Why this priority**: Bölmənin yeganə dinamik və ən çox məzmunlu hissəsidir. Köhnə saytda məqalələr yalnız il akkordionlarında link
siyahısı idi, axtarış yox idi. Bu, Figma-nın əsas yeniliyidir.

**Independent Test**: Admin-də (və ya test datası ilə) bir neçə məqalə yaradılır. Saytda siyahı, axtarış, il filtri, səhifələmə və detal
səhifəsi üç enlikdə Figma ilə müqayisə olunur.

**Acceptance Scenarios**:

1. **Given** 25 dərc olunmuş məqalə, **When** ziyarətçi siyahını açır, **Then** məqalələr ildən və nömrədən azalan sırada görünür
   (02/2026, 01/2026, 03/2025 …), səhifələmə var, sətirdə nömrə, il, başlıq, müəlliflər və dil yazılıb.
2. **Given** siyahı, **When** ziyarətçi "Muradzadə" yazıb "Axtar"-a basır, **Then** yalnız başlığında, müəllifində və ya açar sözündə bu
   söz olan məqalələr qalır. Axtarış böyük-kiçik hərfə və Azərbaycan hərflərinə (İ/i, I/ı, Ə/ə) həssas deyil. Ünvan axtarışı saxlayır,
   link paylaşıla bilir.
3. **Given** siyahı, **When** ziyarətçi il seçimində "2025"-i seçir, **Then** yalnız 2025-ci il məqalələri qalır. "Filtrləri təmizlə"
   hər iki filtri sıfırlayır.
4. **Given** heç bir nəticə verməyən axtarış, **When** siyahı yüklənir, **Then** boş vəziyyət mətni və "Filtrləri təmizlə" görünür.
5. **Given** məqalə sətri, **When** ziyarətçi klikləyir, **Then** detal səhifəsi açılır: breadcrumb "Ana səhifə › Nəşrlər və
   Tədqiqatlar › Tədqiqatlar › İşçi məqalələri › <başlıq>", sol menyuda "İşçi məqalələri" aktivdir, dörd məlumat sahəsi, xülasə,
   açar sözlər və JEL kodları (vergüllə mətn), PDF kartı (fayl adı, "PDF" nişanı, bilinirsə ölçü) görünür.
6. **Given** açar sözü və ya JEL kodu olmayan məqalə, **When** detal açılır, **Then** həmin blok başlığı ilə birlikdə göstərilmir.
7. **Given** JavaScript söndürülüb, **When** ziyarətçi axtarır, il seçir və səhifə dəyişir, **Then** hər şey işləyir (forma və linklər
   adi gediş-gəlişdir).

---

### User Story 2 — Redaktor işçi məqalələrini admin paneldə idarə edir (Priority: P1)

Redaktor admin paneldə "Nəşrlər və tədqiqatlar → İşçi məqalələri" bölməsini açır. Siyahıda nömrə, il, başlıq və status görünür, il və
status üzrə filtr və axtarış var. Yeni məqalə formasında nömrə, il, məqalənin dili, hər iki dil üçün başlıq, müəlliflər, xülasə və açar
sözlər, ümumi JEL kodları və PDF fayl(lar)ı doldurulur. Dərc edilən məqalə saytda növbəti açılışda görünür.

**Why this priority**: Məzmun növü redaktor ekranı olmadan işə yaramır. Köhnə saytda yeni məqalə üçün redaktor yeni səhifə yaradıb
siyahı səhifəsinə əl ilə link əlavə edirdi. İndi bir forma kifayətdir.

**Independent Test**: Admin-də məqalə yaradılır, redaktə olunur, dərcdən çıxarılır, silinir. Hər addımdan sonra sayt yoxlanılır.

**Acceptance Scenarios**:

1. **Given** boş forma, **When** redaktor nömrəsiz, ilsiz və ya başlıqsız (hər iki dildə) yadda saxlayır, **Then** forma yadda saxlanmır,
   səhv sahədə göstərilir.
2. **Given** eyni il üçün artıq "02/2026" nömrəli məqalə, **When** redaktor ikinci "02/2026" yaradır, **Then** forma rədd edir:
   nömrə il daxilində unikaldır.
3. **Given** yalnız az başlığı olan məqalə, **When** dərc olunur, **Then** az saytında görünür, en saytında görünmür.
4. **Given** açar sözlər bir sahədə vergüllə yazılıb, **When** yadda saxlanır, **Then** hər açar söz ayrıca siyahı elementi kimi saxlanılır
   (boş və təkrar elementlər düşür), saytda vergüllə bir sətirdir və axtarışda tapılır. JEL kodları da eyni qaydadadır.
5. **Given** PDF yükləmək istəyən redaktor, **When** fayl seçicisini açır, **Then** yalnız sənəd faylları seçilə bilir (spec 053
   `mediaAccept: 'document'`).
6. **Given** dəyişiklik edilmiş forma, **When** redaktor saxlamadan çıxır, **Then** panel təsdiq soruşur. Hər yazma audit jurnalına
   düşür.
7. **Given** "İşçi məqalələr silsiləsi" səhifəsinin formasını açan redaktor, **When** forma açılır, **Then** sol menyuda "İşçi
   məqalələri" bölməsi işarələnir və formada "məqalələr bu bölmədədir" kartı ora link verir (spec 053 `MANAGED_SECTIONS`).

---

### User Story 3 — Ziyarətçi illik hesabatları və digər dövri nəşrləri il üzrə tapır (Priority: P1)

Ziyarətçi "İllik hesabat", "Sahələrarası maliyyə axınlarının təhlili" və ya "Rəqəmsal fırıldaqçılıq statistikası" səhifəsini açır.
Başlıq və (varsa) giriş mətnindən sonra "İl" seçimi var. Seçilmiş ilin başlığı altında həmin ilin faylları kart kimi düzülür. Hər kartda
sənədin adı, "PDF" nişanı və fayl ölçüsü var. Kart faylı açır. Köhnə saytda bunlar onlarla il akkordionu idi. İndi ziyarətçi bir il seçir.

**Why this priority**: Bölmənin ən çox baxılan sənədləri buradadır (illik hesabat 1996-cı ildən başlayır). Köhnə saytın il akkordionu
qaydası ümumiləşdirilib bir şablona çevrilir.

**Independent Test**: Mövcud səhifələrin (illik hesabat, sahələrarası, fırıldaqçılıq) mətni dəyişdirilmədən sayt yeni şablonla göstərir.
Redaktor səhifə redaktorunda yeni il akkordionu əlavə edir və o, dropdown-da peyda olur.

**Acceptance Scenarios**:

1. **Given** mətni il akkordionlarından ibarət səhifə, **When** ziyarətçi açır, **Then** il seçimində ən yeni il seçilidir və yalnız
   onun faylları görünür. Seçimdə bütün illər azalan sırada və "Hamısı" var.
2. **Given** "Hamısı" seçilib, **When** səhifə yenilənir, **Then** bütün illər, hər biri öz başlığı ilə, azalan sırada qruplaşmış görünür
   (Figma `2797:19903`).
3. **Given** il seçilib, **When** ünvan paylaşılır, **Then** açan şəxs eyni ili görür. JavaScript olmadan da seçim işləyir.
4. **Given** illik hesabat səhifəsi, **When** açılır, **Then** akkordionlardan əvvəlki "Hesabatların aydın oxunması üçün bu şrifti
   yükləyin" linki il seçiminin üstündə fayl linki kimi (ölçü ilə) qalır. Akkordionlardan kənar mətn itmir.
5. **Given** fayl kartı, **When** fayl ölçüsü bilinir, **Then** ölçü göstərilir ("886.56 kB"). Bilinmirsə ölçü yeri boş qalır, kart
   qalır.
6. **Given** redaktor səhifə redaktorunda "2027" akkordionu əlavə edib dərc edir, **When** ziyarətçi səhifəni açır, **Then** dropdown-da
   2027 görünür və default olaraq seçilir. Kod dəyişikliyi lazım deyil.

---

### User Story 4 — Ziyarətçi bölmədə Figma-dakı kimi gəzir (Priority: P2)

Ziyarətçi bölmənin kökünü, iki qrup səhifəsini ("Tədqiqatlar", "Nəşrlər, hesabatlar və sənədlər"), "Ekonometrik modellər" səhifəsini və
tək sənədli səhifələri (strategiyalar, konsepsiyalar, "Ödəniş xidmətləri") Figma-dakı kimi görür. Solda iki açılan qrupdan ibarət menyu
var ("Nəşrlər Menu"). Hər səhifədə breadcrumb, paylaşma düymələri, başlıq, giriş mətni və sənəd kartı(ları) var.

**Why this priority**: Səhifələrin çoxu sadə görünüşlüdür, amma bölmənin naviqasiyası (iki qrup, köçən səhifələr, sıra) yalnız bu
hekayədə düzəlir.

**Independent Test**: Hər Figma ekranı üç enlikdə saytla tutuşdurulur. Sol menyunun açılıb-bağlanması və aktiv bəndi yoxlanılır.

**Acceptance Scenarios**:

1. **Given** bölmə kökü, **When** açılır, **Then** başlıq "Nəşrlər və Tədqiqatlar", köhnə giriş mətni və sol menyuda iki qrup başlığı
   görünür.
2. **Given** "Tədqiqatlar" qrup səhifəsi, **When** açılır, **Then** sol menyuda bu qrup açıqdır ("Ekonometrik modellər", "İşçi
   məqalələri"), digər qrup bağlıdır.
3. **Given** "Nəşrlər, hesabatlar və sənədlər" qrupu, **When** açılır, **Then** Figma sırası ilə gəlir: İllik hesabat, Sahələrarası maliyyə
   axınlarının təhlili, Mikromaliyyə Modeli üzrə Strateji Çərçivə, Maliyyə bazarlarında kibertəhlükəsizlik Strategiyası, Risk əsaslı
   nəzarət üzrə Siyasət Konsepsiyası, Nəzarət Texnologiyaları üzrə Yol Xəritəsi, Rəqəmsal fırıldaqçılıq statistikası. Başqa səhifə
   yoxdur. "Ödəniş xidmətləri" ağacda bu qrupun sonundadır, amma sol menyuda görünmür. Yalnız açılan menyularda (mega menyu, mobil
   siyirtmə) görünür (qərar 7).
7. **Given** Figma-da olmayan köhnə səhifə (məs. "Kreditləşmə fəaliyyəti və maliyyələşmə mənbələrinə dair sorğu"), **When** ziyarətçi
   bölmənin istənilən menyusuna baxır, **Then** o səhifə yoxdur. **When** köhnə ünvanı ilə açır, **Then** səhifə açılır, breadcrumb
   bölməni göstərir, sol menyuda heç bir bənd aktiv deyil.
4. **Given** tək sənədli səhifə (məs. "Risk əsaslı nəzarət üzrə Siyasət Konsepsiyası"), **When** açılır, **Then** Figma-dakı giriş mətni
   və bir sənəd kartı (ad, PDF nişanı, ölçü) görünür.
5. **Given** "Ödəniş xidmətləri" və "Rəqəmsal fırıldaqçılıq statistikası", **When** ziyarətçi köhnə ünvanla gəlir, **Then** səhifə açılır
   (ünvan dəyişmir), amma breadcrumb və sol menyu artıq bu bölməni göstərir. "İstehlakçıların və investorların hüquqları" bölməsində bu
   iki səhifə görünmür.
6. **Given** tablet və mobil enlik, **When** səhifə açılır, **Then** sol menyu Figma-nın tablet/mobil kadrındakı kimi başlığın üstündə
   açılan blokdur, kartlar tam enlikdədir, yana sürüşmə yoxdur.

---

### User Story 5 — Ziyarətçi açılan menyulardan bölməyə keçir, redaktor menyu yerini idarə edir (Priority: P2)

Başlıqdakı "Nəşrlər və tədqiqatlar" menyusu saytın indiki mega menyu dizaynında açılır (qərar 5). Orada iki sütun var. "Tədqiqatlar"
sütununda Ekonometrik modellər və İşçi məqalələri linkləri görünür. "Nəşrlər, hesabatlar və sənədlər" sütununda Figma sırası ilə səkkiz link
var, "Ödəniş xidmətləri" daxil. Redaktor səhifə formasında səhifənin menyulardakı yerini seçir: bütün menyularda, yalnız açılan menyularda
və ya heç birində. Redaktor səhifəyə menyu qrupu etiketi də yaza bilir. Etiket saxlanılır, mega menyunun yeni dizaynında (spec 055)
görünəcək.

**Why this priority**: Naviqasiyanı tamamlayır, amma bölmə onsuz da istifadə olunur.

**Independent Test**: Mega menyu desktop-da, mobil siyirtmə 390-da açılır. Admin-də menyu seçimi dəyişdirilir və sayt yoxlanılır.

**Acceptance Scenarios**:

1. **Given** yeni ağac, **When** mega menyu açılır, **Then** "Tədqiqatlar" və "Nəşrlər, hesabatlar və sənədlər" sütunları US4 sırası ilə
   görünür. "Ödəniş xidmətləri" sonuncudur. Figma-da olmayan altı səhifə yoxdur.
2. **Given** "yalnız açılan menyularda" seçilmiş səhifə ("Ödəniş xidmətləri"), **When** ziyarətçi sol menyuya baxır, **Then** səhifə orada
   yoxdur. **When** mega menyunu və ya mobil siyirtməni açır, **Then** səhifə oradadır.
3. **Given** redaktor səhifəyə "Strategiyalar və konsepsiyalar" menyu qrupu etiketi yazır, **When** yadda saxlayır və formanı yenidən açır,
   **Then** etiket qalır və ağac endpoint-ində qaytarılır. Saytın görünüşü bu spec-də dəyişmir.
4. **Given** səhifə bölmənin köküdür, **When** redaktor menyu seçiminə baxır, **Then** "yalnız açılan menyularda" seçimi deaktivdir (bu
   qayda kökə şamil olmur).

---

### User Story 6 — Köhnə məzmun və ünvanlar itmir (Priority: P3)

Deploy zamanı bölmənin ağacı Figma-ya uyğun yenidən qurulur, Figma-dakı giriş mətnləri əlavə olunur, köhnə işçi məqalələri köçürülür.
Köhnə saytın məqalə ünvanları (`page-895/...`) yeni detal səhifəsinə yönlənir.

**Why this priority**: Kod hazır olmadan mənası yoxdur, amma onsuz bölmə boş açılar və xarici linklər qırılar.

**Independent Test**: Köçürmə boş, köhnə və artıq köçürülmüş bazada işlədilir. Nəticə sayılır, köhnə ünvanların bir neçəsi brauzerdə
açılır.

**Acceptance Scenarios**:

1. **Given** köhnə bazanın ağacı (kök + 14 düz uşaq), **When** köçürmə işləyir, **Then** iki qrup səhifəsi yaranır, Figma
   səhifələri Figma sırası ilə onların altına keçir, "Ödəniş xidmətləri" və "Rəqəmsal fırıldaqçılıq statistikası" istehlakçı bölməsindən
   bura köçür. Figma-da olmayan altı səhifə kökün altında qalır və menyulardan çıxır. Heç bir səhifənin ünvanı dəyişmir, heç biri
   silinmir.
2. **Given** köçürmə artıq işləyib, **When** təkrar işləyir, **Then** heç nə dəyişmir.
3. **Given** redaktor tək sənədli səhifənin mətnini dəyişib, **When** köçürmə işləyir, **Then** Figma giriş mətni həmin səhifəyə yazılmır.
   Köçürmə yalnız köhnə mətnin üzərinə yazır.
4. **Given** köhnə saytdakı məqalə ünvanı (`/page-895/nowcasting-household-consumption?language=az`), **When** ziyarətçi açır, **Then**
   həmin məqalənin yeni detal səhifəsinə (dilə uyğun) daimi yönləndirilir.
5. **Given** köçürülməmiş və ya tanınmayan köhnə məqalə ünvanı, **When** açılır, **Then** işçi məqalələri siyahısına yönləndirilir
   (404 yox).

---

### Edge Cases

- **İşçi məqalə yoxdur və ya API cavab vermir**: siyahı səhifəsi "İşçi məqalələr silsiləsi" səhifəsinin öz köhnə mətnini (il
  akkordionlarında linklər) bölmənin il arxivi şablonu ilə göstərir (FAQ/FinCERT nümunəsi).
- **Məqalə yalnız bir dildə**: digər dildə siyahıdan və axtarışdan düşür. Detal ünvanı o dildə 404 verir.
- **Məqalənin dili ilə saytın dili fərqlidir** (en məqalə, az sayt): sətirdə və detalda "İngilis dili" yazılır. Başlıq, xülasə və açar
  sözlər saytın dilində olan mətndir. Köhnə saytda da belə idi: az xülasə, "Dil: İngilis dili".
- **Səhifələmədə mövcud olmayan səhifə** (`?page=99`): son səhifə və ya boş vəziyyət göstərilir, xəta yox.
- **İl arxivində "Hamısı"dan başqa tək il var**: dropdown yenə göstərilir. "Hamısı" hər il arxivində var (Figma-da illik hesabat
  dropdown-unda yoxdur, ardıcıllıq üçün hər yerdə qoyulur).
- **İl başlığı il deyil** (köhnə 73-də boş `<summary>` var, "Arxiv" kimi mətnlər ola bilər): o qrup dropdown-da öz başlığı ilə
  qalır, illərdən sonra gəlir, boş başlıq "Digər" adlanır. Heç bir fayl itmir.
- **Akkordion içində fayl olmayan link** (başqa səhifəyə link): kart kimi deyil, adi link kimi göstərilir.
- **Mətn həm il akkordionu, həm də ardınca adi bloklar daşıyır**: akkordionlardan əvvəlki və sonrakı mətn öz yerində adi mətn kimi
  qalır. Şablon yalnız akkordion ardıcıllığını əvəz edir.
- **Tək sənəd səhifəsində bir neçə fayl linki var**: hamısı ardıcıl sənəd kartı olur. Fayl yoxdursa səhifə adi mətn kimi görünür.
- **Faylın dil versiyası**: en səhifəsində yalnız en mətnindəki linklər göstərilir. Səhifənin ümumi fayl siyahısı (iki dilin faylları
  qarışıqdır) bu bölmədə göstərilmir (spec 050 qaydası).
- **en mətni olmayan səhifə** (68, 72, 75, 103 en-də yoxdur): en menyularında görünmür, en ünvanı 404 verir. Bugünkü davranış qalır.
- **"(Kopya)" qaralama ağacı** (371 və altındakılar): saytın menyularında görünmür. Köçürmə ona toxunmur.
- **Redaktor menyu qrupu etiketini yalnız bir dildə yazıb**: digər dildə səhifə qrupsuz görünür.

## Requirements *(mandatory)*

### Functional Requirements

**İşçi məqalələri — məlumat və admin**

- **FR-001**: Sistem işçi məqaləsini saxlamalıdır. Dildən asılı olmayan sahələr: nömrə (il daxilində sıra, "02"), il, məqalənin yazıldığı
  dil (az / en / digər), JEL kodları (siyahı), dərc statusu, köhnə saytdakı səhifə nömrəsi (yönləndirmə üçün, istəyə bağlı). Hər dil
  üçün: başlıq, müəlliflər (siyahı), xülasə (mətn), açar sözlər (siyahı), PDF faylı.
- **FR-002**: Nömrə + il cütü unikaldır. Saytda göstərilən forma "NN/YYYY"-dir. Sıralama: il azalan, sonra nömrə azalan.
- **FR-003**: Admin paneldə "Nəşrlər və tədqiqatlar → İşçi məqalələri" bölməsi olmalıdır: siyahı (nömrə, il, başlıq, status; il və status
  filtri, axtarış), yaratma, redaktə, silmə. Forma az/en tablı, fayl seçicisi yalnız sənədləri qəbul edir.
- **FR-004**: Forma yoxlamaları: nömrə (1–99), il (1990 – gələn il), ən azı bir dildə başlıq vacibdir. Bir dildə başlıq varsa həmin dil
  üçün müəllif də vacibdir. JEL kodu hərf + 1–2 rəqəm formatındadır (E01, E2, C53). Xətalar müvafiq sahədə göstərilir.
- **FR-005**: Hər yazma audit jurnalına düşür. Forma saxlanmamış dəyişikliklə tərk ediləndə panel təsdiq soruşur.
- **FR-006**: "İşçi məqalələr silsiləsi" səhifəsinin admin formasında məzmunun "İşçi məqalələri" bölməsində olduğu yazılır və ora link
  verilir. Forma açıq ikən sol menyuda həmin bölmə işarələnir (spec 053 mexanizmi).

**İşçi məqalələri — sayt**

- **FR-007**: Sayt siyahını Figma Variant B (`2825:22947`, tablet `2828:23647`, mobil `2828:24595`) üzrə qurur: başlıq (CMS səhifəsinin
  başlığı), giriş mətni (CMS səhifəsinin mətnində ilk il akkordionundan əvvəlki hissə), axtarış forması, "Bütün məqalələr" başlığı,
  sətirlər, səhifələmə.
- **FR-008**: Axtarış başlıqda, müəlliflərdə və açar sözlərdə, ziyarətçinin dilində axtarır. Böyük-kiçik hərfə və Azərbaycan hərflərinin
  qatlanmasına (İ/i/ı/I, Ə/ə və s.) həssas deyil. Axtarış sözü, il və səhifə ünvanda saxlanılır.
- **FR-009**: İl seçimi yalnız ziyarətçinin dilində məqaləsi olan illəri azalan sırada və "Hamısı"nı göstərir (Figma `2724:6931`).
- **FR-010**: Sayt hər məqalə üçün detal səhifəsi qurur (Figma `2703:6295`, tablet `2743:8111`, mobil `2743:8913`). Səhifədə bunlar var:
  başlıq; məlumat sahələri (Müəllif(lər), Nömrə, Dil, Tarix); "Xülasə"; "Açar sözlər" və "JEL təsnifatı" (vergüllə mətn, Figma-da
  çiplər gizlidir); PDF kartı (başlıq, nişan, bilinirsə ölçü). Boş blok başlığı ilə birlikdə düşür. Breadcrumb və sol menyu "İşçi məqalələri"ni aktiv göstərir. Səhifə başlığı və təsviri
  (metadata) məqalənin başlığı və xülasəsindən qurulur.
- **FR-011**: Detal ünvanı hər iki dildə sabit və oxunaqlıdır, məqalənin nömrəsi və ilindən qurulur. Siyahı səhifəsinin ünvanının altında
  `NN-YYYY` formasındadır, nümunə `/az/isci-meqaleler-silsilesi/02-2025`.
- **FR-012**: Sayt yalnız dərc olunmuş, silinməmiş və ziyarətçinin dilində başlığı olan məqalələri göstərir.
- **FR-013**: Məqalə yoxdursa (həmin dildə) və ya alına bilmirsə, siyahı səhifəsi CMS səhifəsinin bugünkü mətnini göstərir. Məqalə olanda
  CMS mətnindəki köhnə il akkordionları (link siyahısı) göstərilmir.
- **FR-014**: Axtarış, il filtri və səhifələmə JavaScript olmadan işləyir.

**Ümumi bölmə şablonu (köhnə qaydaların ümumiləşdirilməsi)**

- **FR-015**: "Nəşrlər və tədqiqatlar" bölmə şablonudur (`section-shell`, spec 028). Kök başlığı az/en ilə tanınır ("Nəşrlər və
  tədqiqatlar" / "Publications and research"), digər bölmələr kimi.
- **FR-016**: Bölmədəki hər səhifənin mətni formasına görə üç şablondan biri ilə göstərilir, slug siyahısına baxılmadan:
  (a) **il arxivi**: mətndə il başlıqlı akkordionlar var, içində fayl linkləri;
  (b) **sənəd kartları**: mətndə fayl linki olan paraqraf(lar) var, akkordion yoxdur;
  (c) **adi mətn**: qalan hər şey.
  İşçi məqalələri siyahısı və öz məlumatı olan digər səhifələr bu qaydadan kənardadır.
- **FR-017**: İl arxivi (Figma `2748:10054`, `2762:11057`, `2797:19903` və dropdown-lar `2748:10921`, `2762:11841`, `2797:20705`):
  - akkordionlardan əvvəlki mətn başlıqdan sonra adi mətn kimi göstərilir (fayl linki kart kimi);
  - sonra "İl" seçimi gəlir, default ən yeni ildir, "Hamısı" bütün illəri qruplaşmış göstərir;
  - seçilmiş il(lər)in başlığı altında fayl kartları gəlir;
  - akkordionlardan sonrakı mətn sonda qalır;
  - seçim ünvanda saxlanılır.
- **FR-018**: Sənəd kartı Figma kartıdır: sənədin adı (linkin mətni), fayl növü nişanı, fayl ölçüsü (bilinirsə), bütün kart faylı açır.
  Bölmədə kart hər yerdə eynidir (il arxivi, tək sənəd, ekonometrik modellər, işçi məqaləsi).
- **FR-019**: Bu bölmədə səhifənin ümumi fayl siyahısı ayrıca göstərilmir. Fayllar mətndəki linklərdən gəlir, ona görə hər dil yalnız öz
  fayllarını göstərir.
- **FR-020**: Hər yeni şablon üçün redaktorun saxladığı formada fixture olur və həm saytın, həm admin redaktorunun yoxlamasından keçir
  (root `CLAUDE.md` "guard" qaydası). Redaktor səhifəni açıb saxlayanda il akkordionları və fayl linkləri itmir.
- **FR-021**: Düzülüş hər ekranın üç Figma kadrına uyğundur (1728 / 744 / 390). Aralıq enliklər yaxın kadrın qaydası ilə qurulur, heç bir
  enlikdə yana sürüşmə olmur. Bloklar spec 049 qaydası ilə sürüşdürmədə görünür. JavaScript olmadan, çapda və azaldılmış hərəkətdə hər
  şey görünür.

**Naviqasiya**

- **FR-022**: Bölmənin ağacı üç səviyyədir: kök → iki qrup səhifəsi ("Tədqiqatlar" / "Research"; "Nəşrlər, hesabatlar və sənədlər" /
  "Publications, reports and documents") → səhifələr. Qrup səhifələri adi CMS səhifələridir: başlıq və Figma-dakı giriş mətni.
- **FR-023**: Sol menyu Figma "Nəşrlər Menu" (`2804:21370`) üzrədir: iki açılan qrup, açıq səhifənin qrupu açıq, aktiv bənd işarəli.
  Tablet və mobil kadrlarındakı forma da buna daxildir.
- **FR-024**: Redaktor səhifə formasında səhifəyə hər dil üçün **menyu qrupu etiketi** verə bilir. Etiket saxlanılır və ağac endpoint-ində
  qaytarılır. Ağacın quruluşunu, sol menyunu, breadcrumb-u və footer-i dəyişmir. Saytda göstərilməsi (eyni etiketli bacı səhifələr açılan
  menyuda bir qrupda) mega menyunun yeni dizaynı ilə spec 055-dədir.
- **FR-025**: *(Ləğv edildi, 2026-11-20.)* "Maraqlı ola bilər" bloku Figma-da gizlidir və bu spec-də qurulmur. Yeni header dizaynında yenidən
  baxılacaq (spec 055).

**Köçürmə və ünvanlar**

- **FR-026**: Deploy zamanı birdəfəlik köçürmə:
  - iki qrup səhifəsini (az + en başlıq, Figma giriş mətni, en draft tərcümə) yaradır;
  - "Ekonometrik modellər" və "İşçi məqalələr silsiləsi"ni "Tədqiqatlar"ın altına keçirir;
  - Figma-dakı səhifələri "Ödəniş xidmətləri" və "Rəqəmsal fırıldaqçılıq statistikası" ilə birlikdə (istehlakçı bölməsindən)
    "Nəşrlər, hesabatlar və sənədlər"in altına keçirir, US4 ssenari 3-dəki sıra ilə;
  - Figma-da olmayan altı səhifəni kökün altında saxlayır və bölmənin bütün menyularından çıxarır (spec 041/048 "Sol menyuda göstər"
    bayrağı ilə, yəni dropdown menyulardan da);
  - "Ödəniş xidmətləri"ni yalnız açılan menyularda görünən edir (FR-031), "Rəqəmsal fırıldaqçılıq statistikası"nı bütün menyularda;
  - "Strategiyalar və konsepsiyalar" (dörd sənəd) və "Ödəniş sistemləri" (Ödəniş xidmətləri) menyu qrupu etiketlərini qoyur;
  - Figma başlıqlarını qoyur ("İşçi məqalələri"): yalnız başlıq köhnə başlıqdırsa;
  - Figma giriş mətnlərini yazır: yalnız mətn köhnə mətnlə eynidirsə.
  Səhifələr bazada başlıq və slug ilə tapılır, id ilə yox, çünki id-lər mühitlər arasında fərqlənə bilər.
- **FR-027**: Köçürmə təkrar işlədikdə heç nəyi dəyişmir. Gözlədiyi səhifə yoxdursa onu ötür, xəta vermir. "(Kopya)" ağacına toxunmur.
- **FR-028**: İşçi məqalələrinin köçürülməsi (son faza): köhnə saytın məqalə səhifələri az və en dilində oxunur. FR-001 sahələri
  çıxarılır, PDF-lər media anbarına yüklənir, nəticə təkrar işlənə bilən seed kimi saxlanılır. Bazada məqalə artıq varsa seed həmin il
  və nömrəni ötür. Köçürülən məqalə sayı köhnə siyahı səhifəsindəki linklərin sayı ilə tutuşdurulur.
- **FR-029**: Köhnə məqalə ünvanları (`page-<köhnə id>/<istənilən slug>`, `?language=az|en` ilə və ya onsuz) uyğun məqalənin detal
  səhifəsinə daimi yönlənir. Uyğun məqalə yoxdursa işçi məqalələri siyahısına yönlənir. Bölmənin digər köhnə ünvanları bugünkü kimi
  işləyir.
- **FR-031**: Redaktor səhifə formasında səhifənin menyulardakı yerini seçir: bütün menyularda / yalnız açılan menyularda (mega menyu, mobil
  siyirtmə; sol menyularda yox) / heç birində. Mövcud səhifələrin davranışı dəyişmir. Bölmə kökü üçün ikinci seçim yoxdur.
- **FR-032**: Admin API bütün media fayllarının saxlanılan ölçüsünü fayl anbarındakı real ölçü ilə bir dəfə tutuşdurur və fərqlisini düzəldir.
  Bu iş təkrar işə düşəndə yoxlanmış faylı yenidən yoxlamır, birdən çox instansda eyni anda işləmir, startu bloklamır. Yeni yüklənən fayl
  yoxlanmış sayılır.
- **FR-030**: Redaktor təlimatları (`web-cbar-new/docs/` altında bölmə təlimatı və `dokumentasiyalar/` altında azərbaycanca təlimat),
  root `CLAUDE.md`, `business_logic/` sənədləri və hər iki API-nin OpenAPI spec-i eyni dəyişiklikdə yenilənir.

### Key Entities

- **İşçi məqaləsi**: nömrə, il, məqalənin dili, JEL kodları, status, köhnə səhifə nömrəsi. Hər dil üçün başlıq, müəlliflər, xülasə, açar
  sözlər, PDF. Saytda siyahı sətri, detal səhifəsi və mega menyu linki olur.
- **Bölmə səhifəsi** (mövcud CMS səhifəsi): başlıq, slug, mətn, fayllar, menyu görünürlüyü. Mətnin formasına görə il arxivi, sənəd
  kartları və ya adi mətn kimi göstərilir.
- **Menyu qrupu etiketi** (yeni): səhifəyə hər dil üçün verilən qısa mətn. Saxlanılır, açılan menyularda göstərilməsi spec 055-dədir.
- **Menyu yeri** (yeni): səhifənin sol menyularda və açılan menyularda ayrıca görünməsi. "Yalnız açılan menyularda" mövcud "Sol menyuda göstər"
  bayrağına əlavədir.
- **Media ölçüsü yoxlaması** (yeni, texniki): faylın ölçüsünün anbarla nə vaxt tutuşdurulduğunu saxlayır.
- **İl qrupu** (məlumat deyil, görünüş): il arxivində bir akkordion. İl (və ya başqa başlıq) və fayl linkləri.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Bölmənin 15 Figma ekranının hər biri üç enlikdə (1728, 744, 390) əsas ölçülərdə (bloklar arası məsafə, kart ölçüləri,
  başlıq ölçüləri) Figma ilə 2 px-dən çox fərqlənmir. Heç bir enlikdə yana sürüşmə yoxdur.
- **SC-002**: Köhnə bölmənin bütün faylları (illik hesabat, sahələrarası, fırıldaqçılıq, tək sənədlər) yeni saytda az və en-də əlçatandır:
  itən fayl 0.
- **SC-003**: Ziyarətçi müəllif adı ilə məqaləni 3 klikdən az (axtarış yaz → Axtar → nəticə) tapır. Köhnə saytda bu, 13 il akkordionunu
  açıb gözlə axtarmaq idi.
- **SC-004**: Ziyarətçi istənilən ilin illik hesabatına 2 hərəkətlə (il seç → kart) çatır.
- **SC-005**: Redaktor yeni işçi məqaləsini bir formada, 3 dəqiqədən az vaxtda dərc edir. Ayrıca səhifə yaratmaq və siyahıya link əlavə
  etmək lazım deyil.
- **SC-006**: Redaktor il arxivinə yeni il əlavə edəndə və ya bölməyə yeni sənəd səhifəsi yaradanda düzgün görünüş üçün kod dəyişikliyi
  lazım olmur (0 deploy).
- **SC-007**: Köçürmədən sonra köhnə siyahıdakı işçi məqalələrinin 100%-i yeni siyahıda və axtarışda tapılır. Köhnə məqalə ünvanlarının
  100%-i 404 vermir.
- **SC-008**: Məlumat olmayan mühitdə (boş baza, API əlçatmaz) heç bir səhifə boş açılmır.

## Assumptions

- **Siyahı variantı B-dir.** İstifadəçi "biri ümumi, digəri detal" dedi və detal kadrını (`2703:6295`) seçdi. Bu belə anlaşılıb: ümumi
  siyahı + detal səhifəsi, siyahı üçün Figma-nın sonrakı iterasiyası (Variant B, "Axtar" düyməsi ilə). Variant A lazım olsa plan
  mərhələsində dəyişilə bilər. Hər iki variantda data eynidir.
- **Figma-dakı məqalə nümunələri** (02/2026, 01/2026, 03/2025) nümunə datadır. Köhnə saytın ən yeni məqaləsi 02/2025-dir. Köçürmə yalnız
  real məqalələri gətirir.
- **İl arxivinin default ili** ən yeni ildir (Figma illik hesabat: "2025" seçili). "Hamısı" ikinci vəziyyətdir (Figma fırıldaqçılıq). Bu,
  1996-dan başlayan illik hesabatlarda uzun səhifənin qarşısını alır.
- **Fayl ölçüsü** media anbarındakı fayldan gəlir. Plan mərhələsində yoxlanıldı: 1819 media faylının 1237-si 1064, ~480-i 2008/2009 bayt
  görünür, real fayllar MB-larladır. Ölçülər FR-032 ilə düzəldilir. Ölçü `0`-dırsa göstərilmir.
- **Qrup səhifələrinin en başlıqları və Figma giriş mətnlərinin en tərcümələri** draft-dır (spec 045/046 nümunəsi). Redaktor sonra
  düzəldir.
- **Məqalələrin en mətni**: köhnə saytda hər məqalə səhifəsinin en versiyası var (`?language=en`). Köçürmə ikisini də oxuyur. en
  versiyası boş və ya az ilə eynidirsə en başlığı boş qalır və məqalə en saytında görünmür.
- **Mega menyu alt başlıqları üçün yeni sahə** mövcud cədvələ sütun deyil, yoldaş cədvəldir (root `CLAUDE.md` migration qaydası).
- **Endpoint-lər spec-first-dir**: plan mərhələsində əvvəl OpenAPI yazılır və təsdiqlənir (`/api-endpoint`).
- **Figma-da olmayan altı səhifə menyudan çıxır, silinmir.** Ünvanla açılanda bölmənin ümumi şablonu ilə (mətnin formasına görə)
  görünürlər. Onları tamamilə ləğv etmək (404) ayrıca qərar tələb edir və bu spec-də edilmir. "Maliyyə sabitliyi hesabatı"nın "Maliyyə
  sabitliyi" bölməsinə köçməsi o bölmənin spec-inə qalır.
- **Bu spec-in əhatəsindən kənar**: "Dayanıqlı Maliyyə" kök bölməsi (113) və "Maliyyə sabitliyi" bölməsi; Figma-dakı "Ödəniş sistemləri
  Menu / Group" komponenti (`3681:3475`, başqa bölmənin menyusudur); köhnə saytın "Digər nəşrlər" adlanan bölməsi (köhnə mətndə adı
  çəkilir, ağacda yoxdur).

## Paritet cədvəli (Konstitusiya I.3)

| Köhnə sayt | Yeni qarşılıq | Status |
|---|---|---|
| "Nəşrlər və tədqiqatlar" kökü və 14 düz alt səhifə | Kök → 2 qrup → səhifələr, ünvanlar eyni | Qalır, yenidən qruplaşır |
| "İşçi məqalələr silsiləsi" səhifəsi (il akkordionlarında ~78 link) | Axtarışlı, filtrli, səhifələnən siyahı | Qalır, yenidən qurulur |
| Hər işçi məqaləsi ayrıca səhifə (`page-NNN/<slug>`, az/en): ad, nömrə, müəlliflər, dil, tarix, xülasə, açar sözlər, JEL, PDF | Məqalənin detal səhifəsi | Köçürülür, köhnə ünvan yönlənir |
| Yeni məqalə = yeni səhifə + siyahıya əl ilə link | Admin "İşçi məqalələri" bölməsi | Əvəz olunur |
| İl akkordionları + fayl linkləri (illik hesabat, sahələrarası, fırıldaqçılıq) | İl seçimi + fayl kartları | Qalır, yenidən qurulur |
| Bir fayl linkli səhifələr (strategiyalar, konsepsiyalar, ödəniş xidmətləri) | Giriş mətni + sənəd kartı | Qalır, yenidən qurulur |
| "Ödəniş xidmətləri", "Rəqəmsal fırıldaqçılıq statistikası" istehlakçı bölməsində | Bu bölmədə, ünvan eyni | Köçür |
| Figma-da olmayan 6 səhifə (64, 65, 68, 70, 71, 72) | Menyularda yoxdur, ünvanla açılır, ümumi şablonla | Menyudan çıxır, ünvan qalır |
| "(Kopya)" qaralama ağacı (371) | Toxunulmur, menyularda yoxdur | Qalır |
| Köhnə saytda fayl ölçüsü ("1.91 MB") | Real ölçü (FR-032) | Bərpa |
| — | Mega menyunun yeni dizaynı, "Maraqlı ola bilər", alt başlıqlar | Spec 055 |
