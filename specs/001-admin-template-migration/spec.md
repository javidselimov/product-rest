# Feature Specification: Admin panelinin `new-template` UI kiti üzərində yenidən qurulması

**Feature Branch**: `001-admin-template-migration`

**Created**: 2026-09-07

**Status**: Draft

**Input**: User description: "C:\Users\user01\Desktop\workspace\commonrabcds\commonrabc\new-template bu templatede isteyirem ki C:\Users\user01\Desktop\workspace\commonrabcds\commonrabc\web-cbar-admin burda olan funksionalliq tetbiq edilsin amma ui ucun templatenin icerisinde olan kit istifade edilsecek kitin dizaynina sabitlenmeyini isteyirem orda olan reng ve deyerler esasdir funksionalliqlar tam olaraq ishlek olsun"

## Məqsəd və əhatə

Mövcud CMS admin paneli (`web-cbar-admin`, Chakra UI əsaslı) **funksional olaraq
birə-bir** `new-template` starter template-inin üzərinə köçürülür. Görünüş qatı
yalnız template-in daxilindəki korporativ UI kitidir: kitin **rəng, ölçü, boşluq,
tipoqrafiya və tema dəyərləri sabit mənbədir** və dəyişdirilmir; köhnə panelin
Chakra görünüşü, rəng seçimləri və əl ilə yazılmış control-ları gətirilmir.
Nəticə: redaktor eyni işləri eyni API üzərində görür, amma panel kitin dizayn
sisteminə tam uyğun görünür.

**Hədəf proyekt**: `web-cbar-admin` (admin cütünün frontend tərəfi). İş
`new-template`-in kopyası olan yeni `web-cbar-admin-next` qovluğunda aparılır;
`new-template` və köhnə `web-cbar-admin` dəyişdirilmir (bax Assumptions, "İş yeri").
`api-cbar-admin` kontraktı dəyişmir; bu spec backend-ə heç bir dəyişiklik tələb etmir.

**Referans mənbə (konstitusiya Maddə I.2)**: `product-host/admin` (Yii2 admin
controller-ləri: `Pages`, `PressReleases`, `Currency`, `Azir`, `MonthlyInflation`,
`YieldCurve`, `InfoBlocks`, `Banners`, `NewsSlider`, `RunningLine`, `HomepageLinks`,
`HomepagePublications`, `Videos`, `VideosStreams`, `Users`, `Login`). Bu funksiyalar
artıq `web-cbar-admin`-də qarşılığını tapıb; bu spec həmin qarşılığı **itkisiz** yeni
UI qatına daşıyır. Yeni funksiya əlavə edilmir, mövcud funksiya ləğv edilmir.

**Əhatəyə daxil deyil**: backend dəyişikliyi, yeni məzmun tipləri, rol əsaslı
görünürlük məhdudiyyətləri (köhnə paneldə yoxdur), audit log ekranı, profil
səhifəsi, media qovluq/teq sistemi, köhnə panelin silinməsi (cutover ayrı qərardır).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Giriş və panel qabığı (Priority: P1)

Redaktor istifadəçi adı və şifrə ilə daxil olur, kitin dizaynında sidebar, üst
panel (dil seçici, işıqlı/qaranlıq tema, çıxış) və breadcrumb-lı qabıq görür; bütün
bölmələr naviqasiyadan əlçatandır. Sessiya bitəndə (401) avtomatik olaraq giriş
səhifəsinə yönləndirilir və əvvəlki ünvana qayıda bilir.

**Why this priority**: Heç bir digər ekran girişsiz və qabıqsız istifadə oluna
bilməz; bu, bütün digər hekayələrin təməlidir və tək başına "panel açılır" dəyəri
verir.

**Independent Test**: Real admin API işlədilir, `admin` istifadəçisi ilə giriş edilir,
sidebar-dakı hər bölməyə keçid edilir; token müddəti bitəndən sonra hər hansı sorğu
girişə yönləndirir və giriş sonrası əvvəlki ünvana qayıdır.

**Acceptance Scenarios**:

1. **Given** istifadəçi giriş etməyib, **When** qorunan ünvanı açır, **Then** giriş
   səhifəsinə yönləndirilir və uğurlu girişdən sonra həmin ünvana qaytarılır.
2. **Given** giriş səhifəsi, **When** yanlış şifrə daxil edilir, **Then** "istifadəçi
   adı və ya şifrə yanlışdır" mənalı mesaj görünür və digər texniki xətalardan
   fərqlənir.
3. **Given** daxil olmuş istifadəçi, **When** API 401 qaytarır, **Then** sessiya
   təmizlənir və istifadəçi tam səhifə yenilənməsi olmadan giriş səhifəsinə keçir.
4. **Given** daxil olmuş istifadəçi, **When** üst paneldə tema və dil dəyişdirilir,
   **Then** bütün panel kitin işıqlı/qaranlıq dəyərlərinə uyğun yenilənir və UI
   etiketləri seçilmiş dildə (az/en) görünür.
5. **Given** dar ekran (mobil), **When** panel açılır, **Then** naviqasiya template-in
   mobil çekmecəsində (drawer) əlçatandır.

---

### User Story 2 - Konfiqurasiya ilə yaradılan CRUD ekranları (Priority: P1)

Redaktor siyahı ekranında axtarış, filtr və səhifələmə ilə qeydləri tapır, yeni qeyd
yaradır, mövcud qeydi az/en tablarında redaktə edir, təsdiq dialoqu ilə silir. Bu
model aşağıdakı bütün bölmələri əhatə edir: Qanun kateqoriyaları, MEAS emitentləri
və məlumat tipləri, Təşkilat (heyət, şöbələr, ofislər), Pul nişanları (nişanlar,
kateqoriyalar, xəbərlər), Qalereyalar, Videolar və yayımlar, Ana səhifə blokları
(bannerlər, xəbər slayderi, sürüşən sətirlər, linklər, nəşrlər, məlumat sətirləri),
Qanunlar, MEAS sənədləri, Gəlirlik əyriləri siyahısı, İstifadəçilər siyahısı.

**Why this priority**: Panelin məzmun bölmələrinin böyük əksəriyyəti bu tək
mexanizmlə işləyir; o işləyəndə redaktor gündəlik işinin çoxunu görə bilir.

**Independent Test**: Hər bölmədə bir qeyd yaradılır (az və en doldurulur), siyahıda
tapılır, filtr/axtarışla daraldılır, redaktə edilib yadda saxlanılır, silinir; asılı
seçim siyahıları (məsələn qanun kateqoriyası) redaktədən sonra dərhal yenilənir.

**Acceptance Scenarios**:

1. **Given** səhifələnən siyahı, **When** axtarış mətni yazılır və ya filtr seçilir,
   **Then** nəticə birinci səhifədən başlayaraq daralır və "N qeyd · səhifə X / Y"
   göstəricisi düzgün olur.
2. **Given** yeni qeyd formu, **When** yalnız az tabı doldurulub en boş buraxılır,
   **Then** qeyd yalnız az tərcüməsi ilə saxlanılır və boş locale xəta sayılmır.
3. **Given** məcburi sahə boş, **When** "Yadda saxla" basılır, **Then** sahənin
   yanında aydın xəta görünür və sorğu göndərilmir.
4. **Given** siyahıdakı qeyd, **When** "Sil" basılır, **Then** qeydin adını və
   asılılıq xəbərdarlığını göstərən təsdiq dialoqu açılır; təsdiqdən sonra qeyd
   siyahıdan çıxır; xəta olarsa dialoq içində göstərilir.
5. **Given** media sahəsi olan form (banner, heyət, pul nişanı və s.), **When** "Seç"
   basılır, **Then** media seçici dialoqu axtarış və səhifələmə ilə açılır, seçilən
   fayl adı ilə formda görünür və "Təmizlə" ilə boşaldılır.
6. **Given** tarixi embarqolu qeyd (banner, sürüşən sətir), **When** başlama və bitmə
   tarixi daxil edilir, **Then** siyahıda hər ikisi düzgün formatda görünür.
7. **Given** siyahı yenilənir, **When** növbəti səhifəyə keçilir, **Then** əvvəlki
   məlumat yeni məlumat gələnə qədər saxlanılır və kiçik yüklənmə göstəricisi görünür.

---

### User Story 3 - Səhifə ağacı və zəngin mətn redaktoru (Priority: P1)

Redaktor CMS səhifələrini ağac şəklində görür, alt səhifə əlavə edir, səhifəni başqa
valideynin altına köçürür, silir; səhifə formunda az/en başlıq, slug, tam zəngin
mətn, status, menyu linki və 14 bayraq idarə olunur; səhifəyə sənədlər (qruplu, az/en
başlıqlı, sıralanan) əlavə olunur. Zəngin mətn redaktoru köhnə cbar.az markup-ını
(accordion, cədvəl, media linki, YouTube və ümumi iframe) açıb-saxlayanda itirmir.

**Why this priority**: Səhifələr saytın əsas məzmunudur; redaktorun markup itkisi
riski ən yüksək olan yer buradır və konstitusiya (Maddə VI.5) bunu açıq qoruyur.

**Independent Test**: Seed-lənmiş "Haqqımızda" və "Pul siyasəti" səhifələri açılır,
dəyişiklik edilmədən saxlanılır, struktur sayları (accordion, cədvəl, iframe, media
link, şəkil) əvvəl və sonra eyni qalır (`roundtrip-check` ekvivalenti ilə); ağacda
səhifə köçürülür, alt səhifə yaradılır, sənəd əlavə edilib sıralanır.

**Acceptance Scenarios**:

1. **Given** səhifə ağacı, **When** az/en keçid dəyişdirilir, **Then** ağac seçilmiş
   locale-in başlıq və slug-ları ilə yenidən yüklənir; hər sətirdə status, qeyri-aktiv
   və gizli nişanları görünür.
2. **Given** `removable` bayrağı olmayan səhifə, **When** sətrə baxılır, **Then** "Sil"
   əməli qeyri-aktivdir; `movable*` bayrağı olmayanda "Köçür" qeyri-aktivdir.
3. **Given** köçürmə dialoqu, **When** yeni valideyn seçilir, **Then** siyahıda
   səhifənin özü və bütün alt səhifələri seçilə bilməz (dövr yaranmır) və sıra
   nömrəsi daxil edilə bilir.
4. **Given** alt səhifələri olan səhifə, **When** "Sil" basılır, **Then** dialoq
   silinəcək alt səhifə sayını göstərir.
5. **Given** `readonly` və ya `disabled` bayraqlı səhifə, **When** form açılır, **Then**
   bütün məzmun sahələri kilidlidir və xəbərdarlıq görünür.
6. **Given** köhnə markup-lı səhifə, **When** redaktorda açılıb heç nə dəyişmədən
   saxlanılır, **Then** accordion, cədvəl, media linki, YouTube və iframe elementləri
   sayca və strukturca eyni qalır.
7. **Given** redaktor, **When** alət panelindən accordion, cədvəl, link, fayl, şəkil,
   rəng, hizalama, siyahı, başlıq, sitat əməlləri istifadə olunur, **Then** hər əməl
   köhnə paneldəki nəticəni verir; önizləmə, HTML mənbə rejimi və tam ekran işləyir.
8. **Given** səhifə sənədləri bölməsi, **When** sənəd əlavə edilir (az/en başlıq +
   qrup), sırası dəyişdirilir, başlıqları redaktə olunur, ayrılır, **Then** hər əməl
   dərhal siyahıda əks olunur və ayırma təsdiq tələb edir.

---

### User Story 4 - Maliyyə məlumat ekranları (Priority: P2)

Redaktor gündəlik valyuta məzənnə vərəqini (tarix üzrə) yaradır, redaktə edir və
silir; valyuta siyahısında sıra, aktivlik və ana səhifədə göstərilməni kütləvi
şəkildə dəyişir; AZIR indeks dəyərlərini və inflyasiya parametrlərini upsert edir və
filtrləyir; gəlirlik əyrisi formunda Nelson-Siegel parametrləri və gəlirlik sətirləri
daxil edir.

**Why this priority**: Bu ekranlar CMS-in "cədvəl redaktoru" tipli xüsusi
ekranlarıdır; standart CRUD-dan ayrı qurulur, amma məzmun redaktəsindən sonra gəlir.

**Independent Test**: Bugünkü tarixə yeni məzənnə vərəqi əvvəlki vərəqdən doldurulur,
bir valyuta əlavə olunur, biri çıxarılır, saxlanılır və tarixlər çekmecəsində görünür;
valyuta siyahısında 3 sətir dəyişdirilib "Dəyişiklikləri saxla (3)" ilə göndərilir;
AZIR-də eyni tarix+müddət ikinci dəfə saxlananda yenilənir; gəlirlik əyrisində təkrar
dövr xətası verilir.

**Acceptance Scenarios**:

1. **Given** məzənnə ekranı, **When** "Yeni vərəq" seçilir, **Then** cari vərəqdən
   doldurulmuş, "saxlanılmayıb" işarəli qaralama açılır; eyni koddan ikinci valyuta
   əlavə edilə bilmir.
2. **Given** qaralama vərəq, **When** boş və ya rəqəm olmayan məzənnə ilə saxlanılır,
   **Then** bütün vərəq yoxlanılır və sorğu göndərilmir.
3. **Given** valyuta siyahısı, **When** sıra/aktiv/ana səhifə dəyərləri dəyişdirilir,
   **Then** dəyişmiş sətirlər vurğulanır, düymədə say göstərilir və saxlama yalnız
   dəyişmiş sətirləri göndərir; başlıqda ana səhifə üçün seçilmiş say görünür.
4. **Given** AZIR / inflyasiya ekranı, **When** mövcud açar (tarix+müddət; il+ay+
   parametr) ilə saxlanılır, **Then** yeni sətir yaranmır, mövcud dəyər yenilənir.
5. **Given** gəlirlik əyrisi formu, **When** parametr qrupu söndürülür, **Then**
   parametrlər göndərilmir; tam boş gəlirlik sətirləri atılır, təkrar dövr xəta verir.

---

### User Story 5 - Media kitabxanası, istifadəçilər və parametrlər (Priority: P2)

Redaktor media kitabxanasında fayl yükləyir, axtarır, silir (məzmuna bağlı fayl
silinəndə anlaşılan xəbərdarlıq alır); admin istifadəçi yaradır, redaktə edir, şifrəni
sıfırlayır; sistem parametrlərini açar → JSON şəklində redaktə edir.

**Why this priority**: Dəstəkləyici ekranlardır; məzmun redaktəsi olmadan tək
başına az dəyər verir, amma paritet üçün məcburidir.

**Independent Test**: İcazəli formatda fayl yüklənir və kartda ölçü/ölçülər/tarixlə
görünür; məzmuna bağlı fayl silinmək istənəndə 409 mesajı banner kimi görünür; yeni
istifadəçi yaradılıb şifrəsi sıfırlanır; parametrə yanlış JSON yazılanda parser
xətası göstərilir.

**Acceptance Scenarios**:

1. **Given** media kitabxanası, **When** icazəli formatda fayl seçilir, **Then** fayl
   yüklənir, kartda ad, tip ikonu, ölçü, ölçülər və tarix görünür; icazəsiz format
   seçilə bilmir.
2. **Given** istifadəçi redaktə formu, **When** açılır, **Then** istifadəçi adı
   dəyişdirilə bilmir, şifrə sahəsi yoxdur, aktivlik seçimi var; yaratma formunda isə
   şifrə (siyasət göstərişi ilə) məcburidir, aktivlik yoxdur.
3. **Given** parametrlər cədvəli, **When** mövcud açar redaktə edilir, **Then** açar
   kilidlidir və JSON gözəl formatda göstərilir.

---

### Edge Cases

- Bir locale-də dolu, digərində boş qeyd siyahıda `az → en → "—"` sırası ilə göstərilir;
  boş locale tərcüməsi heç vaxt göndərilmir.
- API əlçatmazdır və ya 5xx qaytarır: siyahı və form daxilində anlaşılan mesaj, texniki
  detal sızmır, panel qabığı boşalmır.
- Sessiya müddəti (15 dəq) redaktə ortasında bitir: 401 girişə yönləndirir, itirilmiş
  iş barədə redaktor məlumatlandırılır.
- Seçim siyahıları (lookup) yüklənmir: asılı ekran yüklənmə/xəta vəziyyəti göstərir,
  formu yarımçıq açmır.
- Səhifələnməyən (tam massiv) siyahılarda səhifələmə control-u göstərilmir.
- Media seçicidə artıq bağlanmış fayllar seçilə bilməz (təkrar bağlama olmur).
- Zəngin mətndə heç bir extension-ın tanımadığı element saxlanılanda itirilməməlidir;
  itki aşkarlanarsa dəyişiklik qəbul edilmir.
- Səhifə ağacında kök səhifəni köçürmə və özünün altına köçürmə cəhdi mümkün deyil.
- Qaranlıq temada bütün ekranlar (dialoq, çekmecə, cədvəl, redaktor) kitin dəyərləri
  ilə oxunaqlı qalır; xüsusi rəng olan heç bir sahə yoxdur.
- Dar ekranda geniş cədvəllər öz konteynerində üfüqi sürüşür, səhifə üfüqi sürüşmür.

## Requirements *(mandatory)*

### Functional Requirements

**Paritet və əhatə**

- **FR-001**: Sistem köhnə `web-cbar-admin`-in bütün ünvanlarını və ekranlarını
  (aşağıdakı paritet cədvəli) yeni paneldə eyni məzmun və eyni əməllərlə təqdim
  etməlidir; heç bir ekran "hazır deyil" vəziyyətində qalmamalıdır.
- **FR-002**: Sistem mövcud `api-cbar-admin` kontraktını (ünvanlar, sorğu
  parametrləri, göndərilən və qəbul edilən məlumat formaları) dəyişmədən istifadə
  etməlidir; backend dəyişikliyi tələb olunmur.
- **FR-003**: Sistem üç siyahı formasını dəstəkləməlidir: səhifələnən (`page`,
  `pageSize`, ümumi say), tam massiv (səhifələmə control-suz) və qruplu massiv
  (məlumat sətirləri: qruplar sətirlərə açılır).

**Görünüş və dizayn sistemi**

- **FR-004**: Bütün görünən control-lar (düymə, sahə, seçim, cədvəl, dialoq, çekmecə,
  tab, nişan, yüklənmə göstəricisi, bildiriş, ağac, yükləmə) template-in korporativ
  UI kitindən olmalıdır; əl ilə yazılmış və ya köhnə paneldən gətirilmiş control
  qadağandır.
- **FR-005**: Rəng, boşluq, radius, tipoqrafiya və tema dəyərləri yalnız kitin
  semantik dəyərləri ilə verilməlidir; ekranlarda konkret rəng kodu, kənar rəng
  adı və ya köhnə panelin rəng seçimi ola bilməz. Status nişanları (qaralama /
  planlaşdırılıb / dərc olunub / arxiv; aktiv / qeyri-aktiv; canlı) kitin nişan
  variantları ilə ifadə olunur.
- **FR-006**: Panel işıqlı və qaranlıq temada tam işlək olmalı, tema seçimi template-in
  mövcud mexanizmi ilə idarə olunmalıdır.
- **FR-007**: Naviqasiya template-in qabığında (sidebar + mobil çekmecə + əmr paleti)
  yerləşməli və bölmələr məntiqi qruplarla verilməlidir: Məzmun (Səhifələr, Press
  relizlər, Qanunlar, MEAS, Təşkilat, Pul nişanları), Media (Kitabxana, Qalereyalar,
  Videolar), Ana səhifə (bloklar, məlumat sətirləri), Maliyyə (Məzənnələr, AZIR,
  İnflyasiya, Gəlirlik əyriləri), İdarəetmə (İstifadəçilər, Parametrlər). Alt
  bölmələr (məsələn Qanunlar / Kateqoriyalar) ekran daxilində tab kimi qalır.
- **FR-008**: Panelin bütün chrome etiketləri az (default) və en dillərində
  mövcud olmalı; redaksiya məzmunu yalnız API-dən gəlməlidir.

**Giriş və sessiya**

- **FR-009**: İstifadəçi istifadəçi adı və şifrə ilə daxil olmalı; giriş xətası
  (yanlış məlumat) digər xətalardan fərqləndirilməlidir.
- **FR-010**: Giriş tokeni yalnız yaddaşda saxlanılmalı; brauzer yaddaşına (local/
  session storage) yazılmamalıdır. Səhifə yenilənəndə istifadəçi yenidən daxil olur.
  *(Əvəzlənib: spec 005 — yenilənmədə sessiya httpOnly refresh cookie ilə bərpa
  olunur; access token yenə yalnız yaddaşdadır. FR-011-in 401 davranışı da orada
  "əvvəl səssiz refresh" ilə dəqiqləşdirilib.)*
- **FR-011**: Hər hansı sorğuya 401 cavabı sessiyanı təmizləyib istifadəçini tam
  səhifə yenilənməsi olmadan giriş səhifəsinə aparmalı və giriş sonrası əvvəlki
  ünvana qaytarmalıdır. Avtomatik çıxışın yalnız iki səbəbi var: 401 cavabı və
  girişdə alınan token müddətinin (`expiresAt`) bitməsi — ikincisi istifadəçiyə
  "sessiya bitdi" bildirişi ilə müşayiət olunur. Başqa heç bir HTTP status (403,
  5xx, şəbəkə xətası) avtomatik çıxışa səbəb olmur.
- **FR-012**: Üst paneldə göstərilən istifadəçi adı sabit mətn deyil, daxil olmuş
  istifadəçinin məlumatından gəlməlidir.

**Siyahı və form davranışı (konfiqurasiya ilə yaradılan ekranlar)**

- **FR-013**: Siyahı ekranı gecikməli (debounce) axtarış, deklarativ filtrlər (mətn,
  seçim, tarix, rəqəm), səhifələmə, "əvvəlki məlumatı saxla" davranışı, boş və xəta
  vəziyyətlərini təqdim etməlidir; axtarış/filtr dəyişəndə səhifə 1-ə qayıtmalıdır.
- **FR-014**: Siyahı hüceyrələri tarix, tarix-vaxt, nişan (rəng xəritəsi ilə), xüsusi
  render və düz mətn (boş → "—") rejimlərini, o cümlədən iç-içə açarları
  dəstəkləməlidir.
- **FR-015**: Form ekranı 8 sahə tipini dəstəkləməlidir: mətn, rəqəm, tarix,
  tarix-vaxt, işarə qutusu, seçim, zəngin mətn, media. Sahələr `az`/`en` tablarında
  (locale-ə görə) və ümumi bölmədə göstərilir.
- **FR-016**: Saxlamada bütün locale sahələri boş olan tərcümə göndərilməməlidir;
  köhnə panelin dəyər çevirmə qaydaları (boş rəqəm → 0 və ya null, boş tarix → null,
  tarix-vaxt → ISO, seçim → rəqəm və ya null, media → id və ya null) eyni qalmalıdır.
- **FR-017**: Uğurlu saxlamadan sonra əlaqəli siyahı, detal və seçim siyahısı
  keşləri yenilənməli və istifadəçi siyahıya qayıtmalıdır; uğur/xəta barədə kitin
  bildiriş (toast) mexanizmi ilə məlumat verilməlidir.
- **FR-018**: Hər silmə əməli qeydi adlandıran və asılılıq xəbərdarlığı göstərən
  təsdiq dialoqu ilə olmalıdır; xəta dialoq daxilində göstərilir.
- **FR-019**: Form validasiyası ən azı köhnə paneldəki qaydaları saxlamalıdır:
  məcburi sahələr, "ən azı bir dildə başlıq", rəqəm/təkrar yoxlamaları (gəlirlik,
  AZIR, inflyasiya, məzənnə), JSON yoxlaması (parametrlər); xəta sahənin yanında
  görünməli, sorğu göndərilməməlidir.
- **FR-020**: Modul konfiqurasiyasının genişlənmə nöqtələri saxlanılmalıdır: sətir
  əməlləri (məsələn şifrə sıfırlama), redaktə ekranına əlavə bölmələr (sənədlər,
  qalereya şəkilləri), ünvan və imkan override-ları.

**Media**

- **FR-021**: Media kitabxanası kart görünüşü, gecikməli axtarış, 24-lük səhifələmə,
  icazəli formatlarla yükləmə (jpg, jpeg, png, gif, webp, svg, pdf, xlsx, xls, docx,
  doc, zip, xml) və silmə təqdim etməli; məzmuna bağlı faylın silinməsi cəhdi
  anlaşılan xəbərdarlıqla rədd edilməlidir.
- **FR-022**: Media seçici dialoqu bütün media sahələrində və sənəd bölmələrində
  ortaq olmalı; artıq bağlanmış fayllar seçilə bilməməlidir.
- **FR-023**: Sənəd bölmələri üç formada işləməlidir: sadə bağla/ayır (qanunlar,
  press relizlər), az/en başlıqlı və qruplu, sıralanan (səhifələr), şəkil siyahısı
  əlavə/sil/sırala (qalereyalar).
- **FR-024**: Redaktora daxil edilən media və şəkil ünvanları mühitdən asılı olmayan
  nisbi formada (`/media/{id}`) saxlanılmalıdır.

**Zəngin mətn**

- **FR-025**: Zəngin mətn redaktoru köhnə cbar.az markup-ını itirmədən saxlamalıdır:
  accordion (`details`/`summary`/məzmun), cədvəllər, media linkləri, sətirdaxili
  şəkillər (bağlayıcı linki ilə), YouTube və ümumi `iframe` embed-ləri.
- **FR-026**: Redaktor alət paneli köhnə panelin bütün əməllərini təqdim etməlidir:
  qalın, kursiv, mətn və vurğu rəngi, hizalama (4), H2/H3, siyahılar, girinti,
  sitat, accordion, cədvəl və cədvəl əməlləri, link, fayl daxil etmə, şəkil daxil
  etmə, formatı təmizləmə, geri/irəli.
- **FR-027**: Redaktor önizləmə (ictimai saytın görünüşünə yaxın), HTML mənbə rejimi,
  tam ekran və yalnız-oxu rejimini dəstəkləməlidir.
- **FR-028**: Redaktora hər dəyişiklik seed-lənmiş səhifələr üzərində struktur
  müqayisəsi (round-trip yoxlaması) ilə təsdiqlənməlidir; struktur fərqi olan
  dəyişiklik qəbul edilmir.

**Xüsusi ekranlar**

- **FR-029**: Səhifə ağacı: az/en keçid, rekursiv göstərim, sətir əməlləri (alt
  səhifə, redaktə, köçür, sil) bayraqlara görə aktiv/qeyri-aktiv, dövrü istisna edən
  köçürmə dialoqu, alt səhifə sayını göstərən silmə dialoqu.
- **FR-030**: Səhifə formu: az/en başlıq, slug (yaratmada boş qalanda API-nin
  yaratdığı, adı dəyişəndə sabit qalan), zəngin mətn, status (qaralama/dərc/arxiv),
  sıra, menyu linki override, 4 qrupda 14 bayraq, `readonly`/`disabled` kilidi.
- **FR-031**: Məzənnə vərəqi: son və ya seçilmiş tarixin vərəqi, əvvəlki vərəqdən
  doldurulan "yeni vərəq" qaralaması, valyuta əlavə/çıxar (təkrar kod yoxlaması),
  bütöv vərəq validasiyası, vərəqi tam silmə, tarixlər çekmecəsi (say və səhifələmə).
- **FR-032**: Valyuta siyahısı: sıra, aktivlik, ana səhifə seçimi üçün seyrək
  "dəyişmiş sətirlər" modeli, vurğulanan sətirlər, sayı göstərən saxlama düyməsi,
  başlıqda ana səhifə üçün seçilmiş say.
- **FR-033**: AZIR və inflyasiya: upsert kartı (mövcud açar yenilənir), filtr paneli,
  siyahı və silmə dialoqu; AZIR 50-lik səhifələmə ilə, inflyasiya il filtri ilə.
- **FR-034**: Gəlirlik əyrisi formu: tarix, açılıb-bağlanan Nelson-Siegel parametr
  qrupu, dinamik gəlirlik sətirləri (əlavə/sil), rəqəm, boş dövr və təkrar dövr
  yoxlamaları.
- **FR-035**: İstifadəçi formu: yaratmada istifadəçi adı + e-poçt + şifrə (siyasət
  göstərişi) + rol; redaktədə istifadəçi adı kilidli, şifrəsiz, aktivlik seçimi ilə;
  siyahıda rol nişanı və şifrə sıfırlama sətir əməli.
- **FR-036**: Parametrlər: açar → JSON cədvəli, əlavə etmə (açar + JSON), redaktə (açar
  kilidli), müştəri tərəfində JSON yoxlaması.
- **FR-037**: Ana səhifə blokları hub-ı və idarə paneli köhnə paneldəki kimi
  naviqasiya/yer tutucu ekran olaraq qalır; idarə panelinə real məlumat bağlanması bu
  spec-in əhatəsində deyil.

**Keyfiyyət qapısı**

- **FR-038**: Panel template-in merge şərtini (lint → tip yoxlaması → test → build)
  keçməli; hər feature üçün real istifadəçi davranışı üzərində test olmalıdır.
- **FR-039**: Test və mock kontraktı real `api-cbar-admin` cavab formalarına uyğun
  olmalı; template-in demo domain kontraktı (layihələr, komanda) və uydurma giriş
  kontraktı bu spec ilə əvəz edilir.
- **FR-040**: Köhnə panel paritet təsdiqlənənə qədər işlək qalır; bu spec köhnə
  panelin silinməsini əhatə etmir.

### Key Entities *(include if feature involves data)*

- **Səhifə (Page)**: ağac düyünü; az/en başlıq, slug, məzmun; status, sıra, menyu
  linki; 14 bayraq (görünürlük, qoruma, hərəkət, admin ağac vəziyyəti); sənədlər
  (media + az/en başlıq + qrup + sıra).
- **Press reliz**: az/en başlıq və məzmun, status, dərc tarixi, sənədlər.
- **Qanun / Qanun kateqoriyası**: kateqoriya, tip (qanun/qayda), status, dərc tarixi,
  az/en başlıq və təsvir, sənədlər.
- **MEAS sənədi / Emitent / Məlumat tipi**: emitent, məlumat tipi, qeydiyyat tarixi,
  DQN, fayl, status (sənəd ikidilli deyil).
- **Təşkilat**: Şöbə (ad, təsvir, şəkil), Ofis (ad, ünvan, telefon), Heyət (ad, vəzifə,
  tip, qəbul günləri, bio, foto, telefon).
- **Pul nişanı / Kateqoriya / Xəbər**: tip (əskinas/sikkə), ön və arxa şəkil, az/en
  başlıq, təsvir, təhlükəsizlik elementləri.
- **Qalereya**: tədbir tarixi, az/en başlıq, sıralı şəkillər.
- **Video / Yayım**: YouTube ünvanı, dərc tarixi; yayım ünvanı, canlı bayrağı, başlama.
- **Ana səhifə blokları**: Banner, Xəbər slaydı, Sürüşən sətir, Link, Nəşr (hər biri
  aktivlik, sıra, tarix pəncərəsi, az/en mətn), Məlumat sətri (13 sabit alias, il,
  az/en başlıq və dəyər).
- **Məzənnə vərəqi / Valyuta**: tarix + valyuta sətirləri (kod, ad, nominal, məzənnə);
  valyuta (kod, ad, sıra, aktiv, ana səhifə).
- **AZIR dəyəri**: tarix, müddət (1D/1W/1M), faiz. **İnflyasiya parametri**: il, ay,
  parametr kodu, dəyər. **Gəlirlik əyrisi**: tarix, parametrlər, gəlirlik sətirləri.
- **Media faylı**: ad, tip, ölçü, ölçülər, tarix; məzmuna bağlılıq.
- **İstifadəçi**: ad, e-poçt, rol (admin / moderator / meas_manager), aktivlik.
- **Parametr**: açar, JSON dəyər, yenilənmə tarixi.

## Paritet cədvəli (köhnə panel → yeni panel)

| Köhnə ekran / ünvan | `product-host/admin` mənbəyi | Yeni paneldə | Status |
| --- | --- | --- | --- |
| Giriş `/login` | `LoginController` | Giriş (template auth axını, real kontrakt) | Saxlanılır |
| İdarə paneli `/` | `MainController` | Yer tutucu kartlar | Saxlanılır (məlumatsız) |
| Səhifələr `/pages`, `/pages/new`, `/pages/:id` | `PagesController` | Səhifə ağacı + forma | Saxlanılır |
| Press relizlər `/press-releases…` | `PressReleasesController` | Konfiqurasiya ilə CRUD + sənədlər | Saxlanılır (əl yazması mühərrikə qatılır) |
| Media kitabxanası | — (Yii2 fayl idarəsi) | Media kitabxanası | Saxlanılır |
| Qanunlar + kateqoriyalar | — (yeni CMS bölməsi) | CRUD + sənədlər | Saxlanılır |
| MEAS sənədlər/emitentlər/tiplər | — | CRUD | Saxlanılır |
| Təşkilat: heyət/şöbə/ofis | — | CRUD | Saxlanılır |
| Pul nişanları + kateqoriya + xəbər | — | CRUD | Saxlanılır |
| Qalereyalar | — | CRUD + şəkil bölməsi | Saxlanılır |
| Videolar / Yayımlar | `VideosController`, `VideosStreamsController` | CRUD | Saxlanılır |
| Ana səhifə: banner, slayder, sürüşən sətir, link, nəşr | `Banners`, `NewsSlider`, `RunningLine`, `HomepageLinks`, `HomepagePublications` | CRUD | Saxlanılır |
| Məlumat sətirləri | `InfoBlocksController` | CRUD (alias filtri, qruplu siyahı) | Saxlanılır |
| Məzənnələr / Valyutalar | `CurrencyController` | Vərəq redaktoru / valyuta siyahısı | Saxlanılır |
| AZIR | `AzirController` | Upsert + siyahı | Saxlanılır (əl yazması mühərrikə qatılır) |
| İnflyasiya | `MonthlyInflationController` | Upsert + siyahı | Saxlanılır (əl yazması mühərrikə qatılır) |
| Gəlirlik əyriləri | `YieldCurveController` | CRUD siyahı + xüsusi forma | Saxlanılır |
| İstifadəçilər | `UsersController` | CRUD + şifrə sıfırlama | Saxlanılır |
| Parametrlər | — | Açar/JSON redaktoru | Saxlanılır |
| `*` "hazır deyil" | — | Template 404 səhifəsi | Əvəz olunur |
| Template demo: layihələr, komanda, hesabatlar, komponent qalereyası | — | — | Ləğv edilir (demo domain silinir) |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Paritet cədvəlindəki "Saxlanılır" statuslu 20 ekranın hamısı yeni
  paneldə real admin API ilə tam işlək şəkildə əl ilə icra olunur; heç bir ekranda
  "hazır deyil" və ya yer tutucu davranış qalmır (idarə paneli istisna, o
  köhnədə də yer tutucudur).
- **SC-002**: Köhnə paneldə mümkün olan hər yaratma / redaktə / silmə / bağlama /
  sıralama əməli yeni paneldə eyni API sorğusunu göndərir; iki panel arasında
  göndərilən məlumat formasında fərq sıfırdır.
- **SC-003**: Seed-lənmiş səhifələr redaktorda açılıb saxlananda accordion, cədvəl,
  media link, şəkil, YouTube və iframe sayları %100 eyni qalır.
- **SC-004**: Panelin heç bir ekranında kitdən kənar rəng dəyəri və ya əl ilə yazılmış
  control yoxdur (statik yoxlama sıfır tapıntı ilə keçir); işıqlı və qaranlıq temada
  bütün ekranlar oxunaqlıdır.
- **SC-005**: Merge şərti (lint, tip yoxlaması, test, build) hər bölmə üçün keçir;
  hər feature-in ən azı bir real-davranış testi var.
- **SC-006**: Redaktor 3 saniyədən az müddətdə giriş edib istənilən bölməyə çatır;
  siyahı ekranı standart məlumat həcmində (50 qeyd) 1 saniyə içində görünür.
- **SC-007**: Sessiya bitəndə istifadəçi 100% hallarda tam səhifə yenilənməsi olmadan
  girişə yönləndirilir və giriş sonrası əvvəlki ünvana qayıdır.
- **SC-008**: Bütün chrome etiketləri az və en dillərində mövcuddur; tərcüməsiz
  açar sıfırdır.

## Assumptions

- **İş yeri (istifadəçi qərarı, 2026-09-07)**: Yeni panel `new-template`-in
  **kopyasından** ayrı qovluqda — `web-cbar-admin-next` — qurulur (konstitusiya
  Maddə VI.1/VI.6). `new-template` özü toxunulmaz qalır; köhnə `web-cbar-admin`
  paritet təsdiqlənib cutover qərarı verilənə qədər işlək qalır və o zaman yeni
  qovluq onun adını alır. `dev.ps1` / `dev.sh` yeni qovluğu eyni port (5173)
  altında alternativ olaraq qaldıra bilməlidir; port və start sırası dəyişmir
  (Maddə IV).
- Funksional həqiqətin mənbəyi mövcud `web-cbar-admin`-in davranışıdır; onun
  `product-host/admin`-ə pariteti artıq təsdiqlənmiş sayılır və bu spec yalnız
  UI qatını dəyişir.
- Template-in məcburi etdiyi davranış fərqləri paritet pozuntusu deyil, qəbul
  edilmiş yaxşılaşmadır: token yalnız yaddaşda (köhnə paneldə brauzer yaddaşındadır),
  401 zamanı router ilə keçid (köhnədə tam səhifə yenilənməsi), bildiriş (toast)
  sistemi (köhnədə yoxdur), qruplu sidebar və mobil çekmecə (köhnədə düz siyahı),
  az/en UI dili (köhnədə yalnız ingilis), üst paneldə real istifadəçi adı.
- Token müddətinin (15 dəq) avtomatik yenilənməsi (refresh) əhatəyə daxil deyil —
  backend bu imkanı vermir; müddət bitəndə 401 axını işləyir.
- Rol əsaslı görünürlük tətbiq edilmir (köhnə paneldə yoxdur); template-in icazə
  mexanizmi gələcək spec üçün açıq qalır, `user.role` müqayisəsi yazılmır.
- Ekran dili default `az`, ikinci `en`; bütün etiketlər hər iki dildə yazılır.
- Kit versiyası template-in `optionalDependencies`-dəki caret aralığındadır; kitdə
  olmayan imkan (zəngin mətn redaktoru) üçün aşağıdakı kənarlaşma qeydi tətbiq olunur.
- Deploy modeli template-in modelinə keçir: runtime `/config.json` + build-time
  fallback (konstitusiya Maddə III.5); `.env.*` və `.ci-cd` placeholder-ləri
  DevOps təsdiqinə qədər `TODO(devops)` saxlayır.
- Lokal verification real stack ilə olur: `dev.ps1` ilə admin API qaldırılır, panel
  ona qoşulur; MSW yalnız testlərdə işləyir.

## Kənarlaşmalar registri (template konstitusiyası Maddə IX.3)

- **D1 — Zəngin mətn redaktoru dependency-si**: Kit zəngin mətn redaktoru vermir.
  Köhnə panelin redaktor mühərriki və onun köhnə markup-ı qoruyan extension-ları
  yeganə runtime dependency əlavəsi kimi bu spec ilə icazəlidir (Maddə II). Redaktor
  qabığı (alət paneli, dialoqlar, düymələr) kit control-ları ilə qurulur; yalnız
  redaktə sahəsi mühərrikə məxsusdur.
- **D2 — Önizləmə üçün sanitizasiya olunmuş HTML render**: Redaktorun önizləmə
  rejimi və HTML mənbə rejimi saxlanılan HTML-i render edir (Maddə X.1 istisnası).
  Məzmun yalnız daxil olmuş redaktorun öz API-dən gələn məzmunudur; render öncəsi
  `javascript:` sxemi və skript elementləri süzülür.
- **D3 — Kitin "Əvvəlki/Növbəti" səhifələmə mətnləri**: Kitin məlum açıq
  problemi (i18n override yoxdur) bu spec-də həll edilmir; kit düzəlişi gözlənilir.
