# Feature Specification: Public saytın (`web-cbar`) `nextjs-template` UI kiti üzərində yenidən qurulması

**Feature Branch**: `002-public-site-template-migration`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "C:\Users\user01\Desktop\workspace\commonrabcdr\commonrabc\nextjs-template bu templateni istifa et mene yeni bir web-cbar-next adinda yeni bir proyekt hazirla proyektde C:\Users\user01\Desktop\workspace\commonrabcdr\commonrabc\web-cbar burda olan butun proyektler olsun amma ui kit yeni cbar istifade edilsin. funksionalliq ucun C:\Users\user01\Desktop\workspace\commonrabcdr\commonrabc\product-host burada baxa bilersen. amma menim meqsedim C:\Users\user01\Desktop\workspace\commonrabcdr\commonrabc\web-cbar bu sayti yeniden yeni ui kitle hazirlamaqdir"

## Məqsəd və əhatə

Mövcud public sayt (`web-cbar`: əl ilə yazılmış Tailwind komponentləri, sabit hex
rəng palitrası, yalnız işıqlı tema) **funksional olaraq birə-bir** `nextjs-template`
starter template-inin üzərinə köçürülür. Görünüş qatı yalnız template-in daxilindəki
korporativ UI kitidir: kitin **rəng, ölçü, boşluq, tipoqrafiya və tema dəyərləri
sabit mənbədir** və dəyişdirilmir; köhnə saytın öz palitrası, əl ilə yazılmış
control-ları və `globals.css`-dəki 500 sətirlik xüsusi stil bloku gətirilmir. Nəticə:
ziyarətçi eyni səhifələri eyni public API üzərində görür, amma sayt kitin dizayn
sisteminə tam uyğun görünür və template-in keyfiyyət qapısından (lint, tip, test,
build) keçir.

**Hədəf proyekt**: `web-cbar` (client cütünün frontend tərəfi). İş `nextjs-template`-in
kopyası olan yeni **`web-cbar-next`** qovluğunda aparılır; `nextjs-template` və köhnə
`web-cbar` dəyişdirilmir (bax Assumptions, "İş yeri"). `api-cbar` kontraktı dəyişmir;
bu spec backend-ə heç bir dəyişiklik tələb etmir. Yeni sayt köhnəsi ilə yanaşı,
ayrı portda işləyir; cutover (köhnənin silinməsi, adın dəyişməsi) ayrı qərardır.

**Referans mənbə (konstitusiya Maddə I.2)**: `product-host/visitor` (Yii2 public
sayt controller-ləri: `Home`, `Pages`, `PressReleases`, `Laws`, `Currency`, `Indeks`,
`Stats*`, `InfoBlocks`, `Meas`, `Videos`, `Structure`, `Search` və `organization`,
`gallery`, `moneymarks` modulları). Bu funksiyalar artıq `web-cbar`-də qarşılığını
tapıb; bu spec həmin qarşılığı **itkisiz** yeni UI qatına daşıyır. Funksional
həqiqətin mənbəyi mövcud `web-cbar`-in davranışıdır; `product-host` yalnız davranış
şübhəsi yarananda (məsələn, filtr semantikası, sıralama, boş vəziyyət mətni) baxılan
referansdır. Yeni funksiya əlavə edilmir; `product-host`-da olub `web-cbar`-də olmayan
hissələr aşağıdakı paritet cədvəlində **açıq şəkildə** qeyd olunur (səssiz itki
qadağandır, Maddə I.3).

**Əhatəyə daxil deyil**: backend dəyişikliyi, yeni məzmun tipləri və ya bölmələr,
keşləmə/revalidasiya strategiyası (köhnədə də hər sorğu təzədir), RSS/XML sitemap
kimi `web-cbar`-də olmayan kanallar (paritet cədvəlində "təxirə salınır"), köhnə
`web-cbar`-in silinməsi və `dev.ps1`-dəki port sırasının dəyişməsi.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sayt qabığı, naviqasiya və dil (Priority: P1)

Ziyarətçi saytı açır, prefikssiz ünvan avtomatik `az` dilinə yönləndirilir; kitin
dizaynında başlıq (loqo, axtarış, qaynar xətt, dil seçici, E-CBAR düyməsi), CMS
səhifə ağacından qurulan çoxsəviyyəli menyu, altlıq (naviqasiya, əlaqə, sosial
şəbəkələr, müəlliflik) görür. Dil dəyişəndə eyni səhifənin digər dildəki versiyasına
keçir, sorğu parametrləri qorunur. Mövcud olmayan səhifə üçün kitin dizaynında 404
görür; dar ekranda menyu çekmecədə açılır.

**Why this priority**: Heç bir səhifə qabıqsız və naviqasiyasız istifadə oluna bilməz;
bu, bütün digər hekayələrin təməlidir və tək başına "sayt açılır, gəzilir" dəyəri verir.

**Independent Test**: Real public API işlədilir (`dev.ps1`), sayt yeni portda açılır;
`/` → `/az` yönləndirməsi, menyudan hər üst bölməyə keçid, dil dəyişikliyi, məlum
olmayan ünvan (`/az/yoxdur`) və dar ekranda çekmecə əl ilə yoxlanılır.

**Acceptance Scenarios**:

1. **Given** ziyarətçi `/` və ya `/press-releases` kimi prefikssiz ünvan açır, **When**
   səhifə yüklənir, **Then** eyni yol `az` prefiksi ilə açılır (`/az/press-releases`);
   `/en/...` ünvanları olduğu kimi qalır; dəstəklənməyən locale (`/ru`) 404 verir.
2. **Given** CMS səhifə ağacında ən azı 9 üst bölmə var, **When** başlıq render olunur,
   **Then** ilk 8 bölmə görünür, qalanı "daha çox" menyusunda toplanır; hər bölmə 3
   səviyyəyədək alt səhifələrini açır və admin-də təyin olunmuş `navUrl` keçidi üstünlük
   alır.
3. **Given** ziyarətçi `/az/laws?type=law&page=2` səhifəsindədir, **When** dil seçicidə
   `EN` seçir, **Then** `/en/laws?type=law&page=2` açılır və yalnız digər dil seçim kimi
   göstərilir.
4. **Given** başlıqdakı axtarış sahəsi, **When** sorğu yazılıb göndərilir, **Then**
   `/{locale}/search?q=...` açılır və nəticələr səhifələr / press relizlər üzrə görünür.
5. **Given** dar ekran (mobil), **When** menyu düyməsi basılır, **Then** naviqasiya kitin
   çekmecəsində (drawer/sheet) tam ağacla açılır; səhifə üfüqi sürüşmür.
6. **Given** ziyarətçi işıqlı/qaranlıq tema seçir (template mexanizmi), **When** hər hansı
   səhifə açılır, **Then** bütün səhifə kitin tema dəyərlərində oxunaqlı qalır; seçim
   səhifələr arasında və yenidən yükləmədə qorunur.

---

### User Story 2 - Ana səhifə (Priority: P1)

Ziyarətçi ana səhifədə xəbər slayderini, rəsmi məzənnə kartını (trend oxları ilə),
manat dəhlizi, inflyasiya, pul bazarı və gəlirlik əyrisi kartlarını (qrafiklərlə),
xəbər tablarını (press relizlər / elanlar), media tablarını (qalereya / video /
yayım), məlumat vidjetlərini, nəşrləri, sürətli və faydalı keçidləri görür — hamısı
admin-də idarə olunan məzmundan.

**Why this priority**: Ana səhifə saytın ən çox ziyarət olunan ekranıdır və
`product-host`-un bütün ana səhifə vidjetlərinin (`AZIRBlock`, `CurrencyBlock`,
`PressReleases`, `Gallery`, `Video`, `HomepageLinks` və s.) qarşılığını daşıyır.

**Independent Test**: Seed-lənmiş məzmunla `/az` açılır; hər blokun məzmunu admin
panelindəki müvafiq bölmə ilə (bannerlər, slayder, linklər, nəşrlər, məlumat
sətirləri) müqayisə edilir; slayder, tablar və qrafiklər əl ilə yoxlanılır.

**Acceptance Scenarios**:

1. **Given** admin-də 3 aktiv slayder qeydi var, **When** ana səhifə açılır, **Then** slayder
   üçünü sıra ilə göstərir; keçidlər müvafiq press relizə/ünvana aparır.
2. **Given** bugünkü məzənnə vərəqi mövcuddur, **When** məzənnə kartı render olunur,
   **Then** əsas valyutalar dəyər və dünənlə müqayisədə trend işarəsi ilə görünür;
   kart "hamısı" keçidi ilə `/{locale}/currencies`-ə aparır.
3. **Given** inflyasiya / pul bazarı / gəlirlik məlumatı var, **When** kartlar render
   olunur, **Then** qrafik kitin rəng dəyərləri ilə çəkilir, ölçü dəyişəndə uyğunlaşır və
   məlumat olmayanda anlaşılan boş vəziyyət mesajı görünür.
4. **Given** xəbər tabları, **When** "Elanlar" tabı seçilir, **Then** yalnız elan tipli
   qeydlər görünür və "hamısı" keçidi `/{locale}/press-releases?type=...` aparır.
5. **Given** API-nin bir bloku (məsələn, gəlirlik) xəta qaytarır, **When** ana səhifə
   açılır, **Then** yalnız həmin kart daxilində xəta mesajı görünür, qalan səhifə
   tam render olunur.

---

### User Story 3 - CMS səhifələri və məzmun bölmələri (Priority: P1)

Ziyarətçi menyudan istənilən CMS səhifəsini açır: solda bölmə ağacı (aktiv zəncir
açıq), sağda zəngin mətn məzmunu (accordion, cədvəl, şəkil, YouTube/iframe, media
keçidləri legacy markup-dan itkisiz) və ya alt səhifə kartları, aşağıda qruplaşdırılmış
əlavə faylların accordion-ları. Press relizlər, qanunvericilik və pul nişanı xəbərləri
siyahılarında filtr və səhifələmə ilə qeyd tapır, detala keçir, əlavə faylları yükləyir.

**Why this priority**: Saytın məzmun həcminin böyük hissəsi bu bölmələrdədir
(`Pages`, `PressReleases`, `Laws` — `product-host`-un əsas controller-ləri) və legacy
markup-ın itkisiz göstərilməsi ən yüksək riskli tələbdir.

**Independent Test**: Seed-lənmiş "Haqqımızda" və "Pul siyasəti" səhifələri açılır,
accordion/cədvəl/şəkil/YouTube/iframe sayları köhnə saytdakı ilə müqayisə edilir;
press reliz, qanun və pul nişanı xəbər siyahılarında filtr + səhifələmə + detal
keçidi əl ilə icra olunur.

**Acceptance Scenarios**:

1. **Given** çoxseqmentli ünvan (`/az/bank/haqqimizda`), **When** səhifə açılır, **Then**
   son seqment slug kimi həll olunur, kodlanmış (`%C9%99`) seqmentlər düzgün deşifrə
   olunur və mövcud olmayan slug 404 verir.
2. **Given** məzmunda `<details>` accordion, cədvəl, `/media/{id}` şəkli və YouTube
   iframe var, **When** səhifə render olunur, **Then** accordion açılıb-bağlanır, cədvəl
   öz konteynerində üfüqi sürüşür, şəkil və media keçidi mütləq API ünvanına çevrilir
   (media keçidi yeni pəncərədə), video 16:9 nisbətində oynayır.
3. **Given** səhifənin öz məzmunu boşdur, amma alt səhifələri var, **When** açılır,
   **Then** alt səhifələr kart siyahısı kimi göstərilir.
4. **Given** press reliz siyahısı `?type=announcement&page=3`, **When** açılır, **Then**
   yalnız elanlar, 3-cü səhifə, səhifələmə control-u düzgün cari səhifə ilə görünür;
   səhifə diapazondan kənardırsa boş vəziyyət mesajı görünür.
5. **Given** qanunvericilik siyahısı, **When** kateqoriya və tip (qanun / normativ akt)
   filtri seçilir, **Then** siyahı və ünvan sorğu parametrləri eyni vaxtda yenilənir,
   filtr seçimi dil dəyişəndə qorunur.
6. **Given** press reliz yalnız `az` dilində doldurulub, **When** `/en/press-releases/{slug}`
   açılır, **Then** 404 (məzmun həmin dildə görünmür) — köhnə sayt və API ilə eyni
   davranış.

---

### User Story 4 - Maliyyə məlumat ekranları (Priority: P2)

Ziyarətçi rəsmi məzənnə vərəqini seçdiyi tarix üçün görür və tarixi XML feed-i
yükləyir; statistika səhifəsində AZIR, inflyasiya və gəlirlik əyrisi qrafiklərini
izləyir (köhnə saytdakı kimi seçici yoxdur); qiymətli kağızlar (MEAS) bazasında emitent və məlumat
tipi ilə açıqlamaları süzüb faylları yükləyir.

**Why this priority**: Bu ekranlar xarici sistemlərin və peşəkar istifadəçilərin
istifadə etdiyi rəqəmsal məlumatdır (`Currency`, `Indeks`, `Stats*`, `Meas`
controller-ləri); vizual dəyişiklik rəqəm formatını və keçidləri dəyişməməlidir.

**Independent Test**: `/az/currencies?date=...` üçün cədvəl köhnə saytla sətir-sətir
müqayisə edilir; XML keçidi köhnə ilə eyni ünvana aparır; statistika qrafikləri və
MEAS filtrləri əl ilə icra olunur.

**Acceptance Scenarios**:

1. **Given** tarix seçilib, **When** məzənnə vərəqi açılır, **Then** valyutalar API-nin
   sıralaması ilə, nominal, kod, ad və dəyər sütunları ilə görünür; tarix üçün vərəq
   yoxdursa anlaşılan mesaj çıxır; "XML" keçidi `{API}/currencies/DD.MM.YYYY.xml`
   ünvanına dəyişməz formatda aparır.
2. **Given** statistika səhifəsi, **When** açılır, **Then** AZIR qrafiki bütün müddətləri
   ayrı xətlərlə, inflyasiya qrafiki cari ilin aylarını, gəlirlik əyrisi son tarixi göstərir
   (köhnə saytdakı kimi seçici yoxdur); qrafiklər kitin rəng dəyərləri ilə çəkilir və
   məlumat olmayan kart boş vəziyyət göstərir.
3. **Given** MEAS siyahısı, **When** emitent və məlumat tipi seçilir, **Then** cədvəl
   səhifələnmiş nəticə və fayl keçidləri ilə yenilənir; nəticə yoxdursa boş vəziyyət
   mesajı görünür.

---

### User Story 5 - Milli valyuta, təşkilat, media və axtarış (Priority: P2)

Ziyarətçi pul nişanları kataloqunu (əskinas / sikkə, kateqoriya filtri) və nişan
detalını (ön/arxa şəkil, təsvir, mühafizə elementləri) görür; təşkilati strukturu
(rəhbərlik, şöbələr, regional ofislər) və əməkdaş kartını açır; media mərkəzində
qalereya / video / canlı yayım tablarını gəzir, qalereya detalında şəkil torunu
görür; sayt axtarışında nəticələri tapır.

**Why this priority**: Bu bölmələr məzmunca sabit, texniki riski aşağı, amma paritet
üçün məcburidir (`moneymarks`, `organization`, `gallery` modulları, `Videos`,
`Search`).

**Independent Test**: Hər bölmə seed məzmunla açılır, filtr/tab/səhifələmə və detal
keçidləri əl ilə icra olunur; axtarış ən azı bir səhifə və bir press reliz tapır.

**Acceptance Scenarios**:

1. **Given** pul nişanları, **When** "Sikkələr" tipi və kateqoriya seçilir, **Then** yalnız
   uyğun nişanlar görünür; detalda ön/arxa şəkil və mühafizə elementləri zəngin mətn
   kimi render olunur.
2. **Given** təşkilat səhifəsi, **When** açılır, **Then** rəhbərlik və idarə heyəti
   ayrı-ayrı, şöbələr təsvirləri ilə, ofislər ünvanları ilə görünür; əməkdaş kartı
   foto, vəzifə, qəbul günləri, əlaqə və tərcümeyi-hal göstərir.
3. **Given** media mərkəzi, **When** "Video" tabına keçilir, **Then** videolar oynanabilir,
   qalereya tabında qalereyalar, canlı yayım tabında aktiv yayımlar görünür; üç bölmə
   bir-birindən asılı olmadan yüklənir (biri xəta verəndə digərləri qalır), tab seçimi
   JS-siz də mümkündür.
4. **Given** axtarış `?q=manat`, **When** açılır, **Then** nəticələr tip üzrə
   qruplaşdırılıb keçidlərlə görünür; boş sorğu və ya nəticəsiz sorğu anlaşılan mesaj
   verir.

---

### Edge Cases

- API əlçatmazdır və ya 5xx qaytarır: siyahı və vidjet səhifələri öz daxilində
  anlaşılan mesaj göstərir, qabıq (başlıq/altlıq) boşalmır; detal səhifəsi route
  xəta sərhədində "yenidən cəhd" ilə görünür; texniki detal sızmır.
- Səhifə ağacı yüklənmir: menyu boş qalır, amma səhifə məzmunu və altlıq render
  olunur.
- Bir dildə dolu, digərində boş məzmun: siyahıda görünmür, detalı 404 verir; menyu
  yalnız həmin dildə görünən səhifələri göstərir.
- Sorğu parametrləri massiv kimi gəlir (`?type=a&type=b`) və ya yanlış tiplidir:
  ilk/default dəyər götürülür, səhifə qırılmır.
- Slug-da Azərbaycan hərfləri və URL kodlaması: deşifrə olunub API-yə göndərilir;
  kodlanmamış hərflər də işləyir.
- Zəngin mətndə heç bir stil qaydasının tanımadığı element: olduğu kimi render olunur,
  itirilmir; skript elementləri və `javascript:` keçidləri render olunmur.
- Qrafik məlumatı boş və ya bir nöqtəlidir: kart boş vəziyyət göstərir, qrafik xəta
  atmır.
- Məzənnə vərəqində sıfır və ya çox kiçik dəyərlər: API-nin verdiyi rəqəm olduğu kimi,
  yuvarlaqlaşdırılmadan göstərilir.
- JavaScript söndürülüb və ya hələ yüklənməyib: səhifə məzmunu, menyu keçidləri və
  dil keçidləri işləyir (server render); yalnız slayder/qrafik/çekmecə interaktivliyi
  JS tələb edir.
- Dar ekranda geniş cədvəllər (məzənnə, MEAS, CMS cədvəlləri) öz konteynerində üfüqi
  sürüşür; səhifə üfüqi sürüşmür.
- Qaranlıq temada CMS məzmunundakı inline rənglər (varsa) oxunaqlı qalmalıdır —
  məzmun konteyneri kitin fon/mətn dəyərlərini tətbiq edir.

## Requirements *(mandatory)*

### Functional Requirements

**Paritet və əhatə**

- **FR-001**: Sistem köhnə `web-cbar`-in bütün ünvanlarını (aşağıdakı paritet
  cədvəli, 18 route + locale layout + xəta sərhədi) yeni saytda eyni ünvan
  strukturu, eyni məzmun və eyni keçidlərlə təqdim etməlidir; heç bir səhifə "hazır
  deyil" vəziyyətində qalmamalıdır.
- **FR-002**: Sistem hər səhifə üçün köhnə saytın çağırdığı public API resurslarını
  **eyni yol və eyni sorğu parametrləri** ilə çağırmalıdır (30 tipli funksiya, bax
  Key Entities); yeni endpoint tələb edilmir, mövcud endpoint atlanmır.
- **FR-003**: Sistem `product-host`-da olub `web-cbar`-də olmayan public ünvanları
  (RSS, HTML sitemap, əks-əlaqə forması, reyestr, aylıq/illik statistika səhifələri,
  çap/paylaş) paritet cədvəlində göstərilən statusla saxlamalıdır: bu spec onları
  **təkrar etmir və ləğv etmir**, gələcək spec-ə təxirə salır; kodda onlar üçün yer
  tutucu yaradılmır.
- **FR-004**: Template-in demo domeni (layihələr, komanda, hesabatlar, parametrlər,
  komponent qalereyası, giriş səhifəsi, sessiya API-si, demo MSW fikstürləri)
  silinməlidir; yekun proyektdə demo ünvanı və demo mətn qalmamalıdır.

**Qabıq, naviqasiya və dil**

- **FR-005**: Prefikssiz hər ünvan `az` prefiksinə yönləndirilməlidir; `az` və `en`
  dəstəklənir; digər locale 404 verir; statik fayllar və daxili yollar yönləndirilmir.
- **FR-006**: Başlıq menyusu CMS səhifə ağacından qurulmalıdır: ilk 8 üst bölmə
  görünür, qalanı əlavə menyuda; 3 səviyyəyədək alt səhifələr; hər iki dildəki
  xüsusi slug-lar (məsələn, press relizlər, qanunvericilik, məzənnələr) müvafiq
  feature ünvanına xəritələnir; admin-də təyin olunmuş `navUrl` üstünlük alır.
- **FR-007**: Altlıq CMS ağacındakı sabit bölmə siyahısı (icazə verilmiş slug-lar),
  əlaqə məlumatları, onlayn müraciət / sorğu düymələri, 6 sosial şəbəkə keçidi və
  müəlliflik sətrini göstərməlidir.
- **FR-008**: Dil seçici cari yolun digər dildəki versiyasına keçməli, sorğu
  parametrlərini qorumalı və yalnız digər dili seçim kimi göstərməlidir.
- **FR-009**: Bütün interfeys etiketləri (chrome) `az` və `en` dillərində template-in
  i18n mexanizmi ilə saxlanmalıdır; kodda hardcoded etiket olmamalıdır; köhnə
  saytın `t.ts` (50 açar) və hər səhifədəki daxili `content` obyektləri bu mexanizmə
  köçürülməlidir; redaksiya məzmunu həmişə API-dən gəlir.
- **FR-010**: Dar ekranda naviqasiya kitin çekmecəsində açılmalı, geniş ekranda
  hover/fokus ilə açılan çoxsəviyyəli menyu klaviatura ilə də əlçatan olmalıdır.
- **FR-011**: Mövcud olmayan səhifə, slug və locale üçün kitin dizaynında, hər iki
  dildə 404 səhifəsi göstərilməlidir; route xətası üçün "yenidən cəhd" imkanlı xəta
  sərhədi qalmalıdır.
- **FR-012**: Səhifə başlıqları (`<title>`, təsvir) hər səhifə üçün köhnə saytdakı
  kimi məzmundan formalaşmalıdır; dil `<html lang>`-da əks olunmalıdır.

**Məzmun render**

- **FR-013**: CMS zəngin mətni (`Pages`, qanun, press reliz, pul nişanı təsviri və
  mühafizə elementləri, pul nişanı xəbəri, şöbə təsviri, əməkdaş tərcümeyi-halı — 7
  yer) legacy cbar.az markup-ını itkisiz göstərməlidir: `<details>` accordion, cədvəl
  (sürüşən konteyner), `/media/{id}` şəkil və keçidləri mütləq API ünvanına çevirmək
  (keçid yeni pəncərədə), YouTube və ümumi `<iframe>` 16:9, xüsusi siyahı işarələri.
- **FR-014**: Zəngin mətn render öncəsi skript elementləri, hadisə atributları
  (`on*`) və `javascript:` sxemi süzülməlidir; digər elementlər dəyişdirilmir
  (kənarlaşma D2).
- **FR-015**: CMS səhifəsi sol bölmə ağacını aktiv zəncir açıq halda, məzmunu və ya
  alt səhifə kartlarını, sonra qruplaşdırılmış əlavə faylları accordion-larda
  göstərməlidir.
- **FR-016**: Detal səhifələri (press reliz, qanun, pul nişanı, pul nişanı xəbəri,
  əməkdaş, qalereya) API 404 qaytaranda saytın 404 səhifəsini göstərməlidir; siyahı
  səhifələri öz sorğu xətasını daxili mesajla göstərməlidir.

**Siyahılar, filtrlər və maliyyə ekranları**

- **FR-017**: Siyahı səhifələrində filtr, tab və səhifə seçimi ünvanın sorğu
  parametrlərində saxlanmalıdır (press relizlər: `type`, `page`; qanunlar:
  `categoryId`, `type`, `page`; MEAS: `emitentId`, `infoTypeId`, `page`; pul nişanları:
  `type`, `categoryId`; məzənnə: `date`; axtarış: `q`); massiv və yanlış tipli
  parametrlər normallaşdırılır. Media mərkəzi və statistika səhifələri köhnə saytdakı
  kimi sorğu parametri oxumur (tab seçimi yalnız görünüş vəziyyətidir).
- **FR-018**: Səhifələmə kitin control-u ilə göstərilməli, cari səhifə, ümumi say və
  keçidlər server tərəfindən render olunmalıdır (JS-siz işləyir).
- **FR-019**: Məzənnə vərəqi seçilmiş tarix üçün valyutaları API sıralaması və
  dəyərləri ilə dəyişməz göstərməli, tarix seçimi kitin tarix control-u ilə olmalı,
  XML keçidi `{API}/currencies/DD.MM.YYYY.xml` formatında qalmalıdır (Maddə VII.1).
- **FR-020**: Statistika səhifəsi və ana səhifə kartları AZIR (bütün müddətlər),
  inflyasiya (cari il), pul bazarı və gəlirlik əyrisi (son tarix) qrafiklərini kitin rəng
  dəyərləri ilə çəkməli, konteyner ölçüsünə uyğunlaşmalı, boş məlumatda boş
  vəziyyət göstərməlidir (kənarlaşma D1).
- **FR-021**: Ana səhifə köhnə saytın bütün bloklarını (slayder, məzənnə, dəhliz,
  inflyasiya, pul bazarı, gəlirlik, xəbər tabları, media tabları, məlumat vidjetləri,
  nəşrlər, sürətli və faydalı keçidlər) eyni məlumat mənbəyindən göstərməli; bir
  blokun xətası digərlərini bloklamamalıdır.

**Dizayn sistemi**

- **FR-022**: Bütün interfeys elementləri (düymə, kart, tab, accordion, cədvəl,
  səhifələmə, çekmecə, dialoq, breadcrumb, tarix seçici, skeleton, bildiriş) kitin
  komponentləri ilə qurulmalıdır; kitdə olmayan kompozit elementlər (slayder,
  çoxsəviyyəli menyu, qrafik kartı) kit primitivlərindən və kitin token-larından
  yığılmalıdır.
- **FR-023**: Kodda kitdən kənar rəng dəyəri (hex, rgb, oklch, xam Tailwind rəng
  sinifi) və köhnə saytın palitrası olmamalıdır; işıqlı və qaranlıq tema kitin
  dəyərləri ilə işləməlidir; template-in `globals.css` toxunulmaz bloku dəyişdirilmir.
- **FR-024**: Kitin i18n imkanı olan komponentləri (səhifələmə, tarix seçici) cari
  dilə uyğun mətn göstərməlidir; kit dəstəkləmirsə kənarlaşma registrinə yazılır.

**Render modeli, konfiqurasiya və keyfiyyət**

- **FR-025**: Bütün səhifələr server tərəfindən render olunmalı və hər sorğuda təzə
  məlumat göstərməlidir (keş yoxdur — köhnə sayt kimi); məzmun JS yüklənmədən HTML-də
  mövcud olmalıdır (SEO və əlçatanlıq).
- **FR-026**: Public API ünvanı yalnız serverdə, runtime mühit dəyişəni ilə
  oxunmalıdır (bir image bütün mühitlərə); brauzerə API ünvanı və heç bir sirr
  sızmamalıdır; media ünvanları server tərəfində mütləq ünvana çevrilir.
- **FR-027**: Template-in sessiya/giriş modeli (cookie, sessiya API-si, giriş
  yönləndirməsi) public saytda olmamalıdır — sayt anonimdir; yönləndirmə qatı yalnız
  locale və təhlükəsizlik başlıqlarını idarə edir (kənarlaşma D3).
- **FR-028**: Yeni sayt `web-cbar-next` qovluğunda, köhnə `web-cbar` ilə yanaşı, ayrı
  portda (`3001`) işləməlidir; `dev.ps1`, `dev.sh`, `GUIDE.md`, root `CLAUDE.md` eyni
  dəyişiklikdə yenilənir; start sırası dəyişmir (Maddə IV).
- **FR-029**: Deploy faylları (`Dockerfile`, `.gitlab-ci.yml`, `.ci-cd/*.yaml`) template
  modelində qalmalı, köhnə `web-cbar`-in mühit dəyərləri (`API_URL`, hostname) ilə
  doldurulmalı, DevOps təsdiqinə qədər `TODO(devops)` markeri saxlamalıdır; template
  placeholder qalığı (`<PROJECT_NAME>` və s.) olmamalıdır.
- **FR-030**: Template-in keyfiyyət qapısı (`npm run verify`: setup yoxlaması,
  özünü-təmin yoxlaması, lint, tip, test, build) keçməlidir; hər səhifə bölməsi üçün
  ən azı bir real-davranış testi (server render + mock API) olmalıdır; legacy markup
  render-i üçün fikstür əsaslı struktur sayı testi olmalıdır.

### Key Entities *(include if feature involves data)*

Bütün entity-lər `api-cbar` public API-nin oxunan modelləridir; sayt heç nə yazmır.

- **Səhifə ağacı / Səhifə**: slug (locale üzrə), başlıq, `navUrl`, alt səhifələr,
  zəngin mətn məzmunu, qruplaşdırılmış əlavə fayllar; menyu və sol ağacın mənbəyi.
- **Ana səhifə paketi**: slayder elementləri, bannerlər, məlumat sətirləri, nəşrlər,
  sürətli və faydalı keçidlər — bir sorğuda gələn tərkib.
- **Press reliz**: tip (reliz / elan), başlıq, tarix, xülasə, məzmun, əlavə fayllar.
- **Qanun / Qanun kateqoriyası**: tip (qanun / normativ akt), kateqoriya, başlıq,
  tarix, məzmun, əlavə fayllar.
- **MEAS açıqlaması / Emitent / Məlumat tipi**: emitent, tip, tarix, fayl keçidləri.
- **Məzənnə vərəqi**: tarix, valyuta (kod, ad, nominal, dəyər, dünənlə fərq).
- **AZIR dəyəri / İnflyasiya parametri / Gəlirlik əyrisi**: tarix və ya il-ay, müddət,
  dəyər sıraları — qrafiklərin mənbəyi.
- **Pul nişanı / Kateqoriya / Pul nişanı xəbəri**: tip (əskinas / sikkə), kateqoriya,
  ön/arxa şəkil, təsvir, mühafizə elementləri; xəbər: başlıq, tarix, məzmun.
- **Əməkdaş / Şöbə / Ofis**: tip (rəhbərlik / idarə), foto, vəzifə, qəbul günləri,
  əlaqə, tərcümeyi-hal; şöbə təsviri; ofis ünvanı.
- **Qalereya / Video / Canlı yayım**: başlıq, tarix, şəkillər / video mənbəyi / yayım
  ünvanı.
- **Axtarış nəticəsi**: tip (səhifə / press reliz), başlıq, xülasə, keçid.
- **Media faylı**: `/media/{id}` — hər zaman mütləq API ünvanına çevrilir.

## Paritet cədvəli (köhnə sayt → yeni sayt)

| Köhnə ünvan (`web-cbar`) | `product-host/visitor` mənbəyi | Yeni saytda | Status |
| --- | --- | --- | --- |
| `/[locale]` ana səhifə | `home/index` + ana səhifə vidjetləri | Ana səhifə (US2) | Saxlanılır |
| `/[locale]/press-releases`, `/[slug]` | `press-releases/index`, `detail` | Siyahı + detal | Saxlanılır |
| `/[locale]/laws`, `/[slug]` | `laws/index`, `detail` | Siyahı + detal | Saxlanılır |
| `/[locale]/securities` | `meas/index` | MEAS bazası | Saxlanılır |
| `/[locale]/currencies` | `currency/rates` (+ `currencies/<date>.xml` keçidi) | Məzənnə vərəqi | Saxlanılır (XML keçidi dəyişməz) |
| `/[locale]/statistics` | `home/chart`, `indeks/*`, `stats/*` | Qrafik kartları | Saxlanılır |
| `/[locale]/national-currency`, `/[slug]` | `moneymarks/banknotes|coins` | Kataloq + detal | Saxlanılır |
| `/[locale]/national-currency/news`, `/[slug]` | `moneymarks/news` | Siyahı + detal | Saxlanılır |
| `/[locale]/organization`, `/staff/detail/[id]` | `structure/index`, `organization/*` | Struktur + əməkdaş | Saxlanılır |
| `/[locale]/media`, `/galleries/[id]` | `videos/index`, `gallery/photos` | Media mərkəzi + qalereya | Saxlanılır |
| `/[locale]/search` | `search/index` | Axtarış | Saxlanılır |
| `/[locale]/[...slug]` | `pages/index` (`page-<id>/<slug>`) | CMS səhifəsi | Saxlanılır |
| Locale layout, `error.tsx`, prefikssiz yönləndirmə | `LanguageBehavior` (sessiya) | Layout + xəta sərhədi + yönləndirmə | Saxlanılır |
| (yoxdur — Next default 404) | `error/error` | Kitin dizaynında 404, az/en | Əlavə olunur (template-dən) |
| (yoxdur) | — | İşıqlı/qaranlıq tema seçimi | Əlavə olunur (kit/template mexanizmi) |
| (yoxdur) | `rss/releases` | — | Təxirə salınır (ayrı spec; ləğv deyil) |
| (yoxdur) | `home/sitemap` (HTML) | — | Təxirə salınır (ayrı spec) |
| (yoxdur) | `feedback/index` | — | Təxirə salınır (xarici `contact.e-cbar.az` keçidi altlıqda qalır) |
| (yoxdur) | `registry/*` (xarici reyestr API) | — | Təxirə salınır (backend dəstəyi yoxdur) |
| (yoxdur) | `pages/stats-monthly`, `stats-yearly`, `currency/custom` (Excel) | — | Təxirə salınır (backend dəstəyi yoxdur) |
| (yoxdur) | çap / sosial paylaşım bloku | — | Təxirə salınır |
| Template demo: layihələr, komanda, hesabatlar, parametrlər, komponentlər, giriş | — | — | Ləğv edilir (demo domain silinir) |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Paritet cədvəlindəki "Saxlanılır" statuslu bütün ünvanlar (18 route)
  yeni saytda real public API ilə tam işlək şəkildə əl ilə icra olunur; heç bir
  səhifədə yer tutucu və ya "hazır deyil" davranışı qalmır.
- **SC-002**: Hər səhifə üçün yeni saytın göndərdiyi API sorğularının çoxluğu (yol +
  sorğu parametrləri) köhnə saytınki ilə eynidir; fərq sıfırdır.
- **SC-003**: Seed-lənmiş "Haqqımızda" və "Pul siyasəti" səhifələrində accordion,
  cədvəl, şəkil, media keçidi, YouTube və iframe sayları köhnə saytın render-i ilə
  %100 eyni qalır.
- **SC-004**: Saytın heç bir faylında kitdən kənar rəng dəyəri və ya əl ilə yazılmış
  control yoxdur (statik yoxlama sıfır tapıntı ilə keçir); işıqlı və qaranlıq temada
  bütün səhifələr oxunaqlıdır.
- **SC-005**: `npm run verify` (altı addım) hər bölmə üçün keçir; hər səhifə
  bölməsinin ən azı bir real-davranış testi var; az/en açar pariteti testi keçir.
- **SC-006**: Ana səhifə və istənilən siyahı səhifəsi standart məlumat həcmi ilə
  (50 qeyd) 3 saniyə içində istifadəyə yararlı görünür; JS-siz sorğuda məzmun HTML-də
  mövcuddur.
- **SC-007**: Prefikssiz ünvanların 100%-i `az` prefiksinə yönləndirilir; dil
  dəyişikliyi bütün səhifələrdə sorğu parametrlərini qoruyur.
- **SC-008**: Bütün chrome etiketləri az və en dillərində mövcuddur; tərcüməsiz açar
  və hardcoded etiket sıfırdır.
- **SC-009**: Köhnə sayt (`3000`) və yeni sayt (`3001`) `dev.ps1` / `dev.sh` ilə eyni
  anda qalxır və eyni API-yə qoşulur.

## Assumptions

- **İş yeri (istifadəçi qərarı, 2026-09-14)**: Yeni sayt `nextjs-template`-in
  **kopyasından** ayrı qovluqda — `web-cbar-next` — qurulur. `nextjs-template` özü
  toxunulmaz qalır; köhnə `web-cbar` paritet təsdiqlənib cutover qərarı verilənə
  qədər işlək qalır və o zaman yeni qovluq onun adını alır. Yanaşı işləmə üçün yeni
  port `3001` əlavə olunur (Maddə IV.3 üzrə `dev.ps1`, `dev.sh`, `GUIDE.md`,
  `CLAUDE.md` eyni dəyişiklikdə); start sırası dəyişmir.
- Funksional həqiqətin mənbəyi mövcud `web-cbar`-in davranışıdır; onun
  `product-host/visitor`-a pariteti (və orada olmayan hissələrin təxirə salınması)
  bu spec-in paritet cədvəli ilə açıq qeyd olunur. `product-host` yalnız oxunur.
- Template-in məcburi etdiyi davranış fərqləri paritet pozuntusu deyil, qəbul
  edilmiş yaxşılaşmadır: işıqlı/qaranlıq tema (köhnədə yalnız işıqlı), dizaynlı 404
  (köhnədə Next default), bölmə i18n faylları (köhnədə `t.ts` + daxili obyektlər),
  klaviatura ilə əlçatan menyu, təhlükəsizlik başlıqları (CSP) və test yığını.
- Public sayt anonimdir: template-in cookie sessiyası, giriş səhifəsi və sessiya API-si
  silinir; icazə mexanizmi (`hasPermission`) istifadə edilmir.
- Render modeli köhnə sayt kimi tam server render və hər sorğuda təzə məlumatdır;
  keşləmə/revalidasiya bu spec-in əhatəsinə daxil deyil. Template-in brauzer
  tərəfli sorğu mexanizmi (query client) yalnız interaktiv yenilənmə tələb edən
  kartlarda (qrafik dövr seçimi) istifadə oluna bilər; ilkin render həmişə serverdən
  gəlir.
- Ekran dili default `az`, ikinci `en`; bütün etiketlər hər iki dildə yazılır;
  redaksiya məzmunu yalnız API-dən.
- Kit versiyası template-in `optionalDependencies`-dəki versiyadır (vendorlanmış
  paket); kitdə olmayan imkanlar (qrafik, slayder) üçün aşağıdakı kənarlaşmalar
  tətbiq olunur.
- Deploy modeli template-in modelidir: runtime mühit dəyişəni (`API_URL`) serverdə
  Zod ilə yoxlanır, bir image bütün mühitlərə; `.ci-cd/*.yaml` dəyərləri köhnə
  `web-cbar`-dən köçürülür və `TODO(devops)` markeri saxlayır.
- Lokal verification real stack ilə olur: `dev.ps1` ilə `api-cbar-admin` → `api-cbar`
  qaldırılır, sayt ona qoşulur; mock API yalnız testlərdə işləyir.
- Cutover, köhnə `web-cbar`-in silinməsi və portun `3000`-ə qaytarılması ayrı spec-dir.

## Kənarlaşmalar registri (template konstitusiyası üzrə)

- **D1 — Qrafik kitabxanası**: Kit qrafik komponenti vermir (export siyahısında
  yoxdur), template konstitusiyası isə qrafik kitabxanasını qadağan edir. Köhnə saytın
  istifadə etdiyi qrafik mühərriki (ECharts) **yeganə runtime dependency əlavəsi**
  kimi bu spec ilə icazəlidir. Qrafik yalnız brauzerdə, tənbəl yüklənən tək
  wrapper komponentdə qurulur; rənglər kitin token-larından oxunur; kart qabığı,
  seçicilər və boş vəziyyət kit control-larıdır.
- **D2 — CMS HTML render**: Zəngin mətn məzmunu saxlanılan HTML-dən render olunur
  (template Maddə X.1 istisnası, 7 yer). Məzmun yalnız admin panelindən gələn,
  redaktorun nəzarətində olan məzmundur; render öncəsi skript elementləri, `on*`
  atributları və `javascript:` sxemi süzülür; legacy markup elementləri (accordion,
  cədvəl, iframe) saxlanılır. Sanitizasiya kitabxanası əlavə edilmir.
- **D3 — Sessiya modelinin çıxarılması**: Template-in cookie əsaslı sessiya, giriş
  və icazə qatı public saytda tətbiq olunmur (sayt anonimdir); yönləndirmə qatı
  yalnız locale və təhlükəsizlik başlıqlarını saxlayır. Bu, template Maddəsinin
  pozulması yox, tətbiq sahəsindən çıxarılmasıdır; template-in `verify` gate-i
  bunu nəzərə alaraq uyğunlaşdırılır (sessiya route testləri silinir).
- **D4 — Kitdə olmayan kompozit elementlər**: Xəbər slayderi və çoxsəviyyəli
  başlıq menyusu kitdə hazır komponent kimi yoxdur; kit primitivlərindən
  (kart, düymə, popover/dropdown, sheet) və token-lardan yığılır; xarici
  slayder/menyu kitabxanası əlavə edilmir. Kitə tələb kimi bildirilir.
- **D5 — Yeni port**: Yanaşı işləmə üçün `3001` portu əlavə olunur (root Maddə
  IV.3); cutover-də yeni sayt `3000`-ə qayıdır və `3001` silinir.
