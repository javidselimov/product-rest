# Feature Specification: "Haqqımızda" bölməsinin Figma dizaynına keçidi

**Feature Branch**: `024-about-us-redesign`

**Created**: 2026-10-14

**Status**: Draft

**Input**: User description: "web-cbar-new public saytında "Haqqımızda" bölməsinin bütün alt səhifələri Figma
"cbar website (Copy)" faylının "About us" səhifəsinə (`600:2508`) uyğunlaşdırılır, hamısı bir spec-də.
Yalnız frontend. Bütün mətn CMS/API-dən gəlməyə davam edir."

**Mənbə dizayn**: Figma faylı "cbar website (Copy)", səhifə "About us" (`600:2508`). Frame-lər
(desktop 1728 / tablet 744 / mobil 390):

| Səhifə | Desktop | Tablet | Mobil |
|---|---|---|---|
| Haqqımızda (əsas) | `1186:14873` | `1345:24722` | `1342:22407` |
| Tarix | `898:3060` | `1400:28042` | `1400:23720` |
| Missiya və dəyərlər | `968:822` | `1396:18475` | `1396:15392` |
| Pul Siyasəti və Maliyyə Sabitliyi Komitəsi | `1284:16521` | `1463:19539` | `1444:27323` |
| İdarə Heyəti | `1189:15956` (variant `1148:13724`) | — | — |
| Rəhbərlik | `986:4734` | — | — |
| Struktur və əsasnamələr | `996:8542` (= `1401:44660`) | — | `1415:28874` |
| Şöbə səhifəsi (Maliyyə idarəetməsi departamenti) | `996:9576` | `1424:28788` | `1419:17448` |
| Bioqrafiya | `1199:17024` (= `1488:57427`) | — | `1494:25151` |

Komponentlər: `management` `1146:13693`, `Leadership` `1488:57396` / `1488:57379`, `Accordion Item`
`1186:14850`, `breadcrumb` `1272:11367`, `circle history` `1113:9834`, il çipi `1919` `1272:15578`.
Gizli frame-lər (`600:3572`, `983:2716`, `986:3993`, `986:3338`, `1039:16624` "Əlaqə") əhatəyə
daxil deyil. Tablet/mobil frame-i olmayan səhifələr üçün ümumi şablonun tablet/mobil qaydası tətbiq
olunur.

**Əhatə olunan proyektlər**:

- `web-cbar-new`: "Haqqımızda" ağacındakı bütün səhifələr və onların ümumi şablonu.
- `api-cbar`, `api-cbar-admin`, `web-cbar-admin-new`: **dəyişmir**. Yeni API sahəsi, məzmun tipi və
  migration yoxdur.

**Asılılıq**: spec 022 (header, footer, 1320 konteyner, DM Sans, 390/744/1728 breakpoint-ləri, tünd
temanın ləğvi). 022 "About us" səhifəsini açıq şəkildə öz əhatəsindən çıxarıb.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: bu feature aşağıdakıların görünüşünü əvəz edir.
URL-lər və informasiya arxitekturası dəyişmir.

| Köhnə | Nə edir |
|---|---|
| `visitor/controllers/PagesController.php` `actionIndex`, `views/pages/*` | Haqqımızda, Tarix, Missiya, Komitə, Əlaqə CMS səhifələri |
| `visitor/controllers/StructureController.php` `actionIndex`, `views/structure/*` | İdarə Heyəti, Rəhbərlik, struktur bölmələr, ərazi idarələri, əməkdaş bioqrafiyası |

**Hazırkı vəziyyət (test mühitindən ölçülüb, 2026-10-14)**:

- CMS ağacında "Haqqımızda" (id 1) altında: `tarixi`, `teskilati-struktur-ve-idareetme` (altında
  `idare-heyeti` → `/organization?section=board`, `rehberlik` → `management`, `struktur-bolmeler` →
  `divisions`, `erazi-idareler` → `offices`, `pul-siyaseti-ve-maliyye-sabitliyi-komitesi`),
  `missiya-ve-deyerler`, `elaqe`. Eyni məzmunlu "Haqqımızda (Kopya)" alt ağacı da var.
- CMS səhifələri ümumi CMS görünüşü ilə göstərilir: sol ağac, mavi başlıq zolağı, düz mətn.
  Təşkilat səhifələri `?section=` tab düymələri ilə dəyişir. Bioqrafiya ayrıca səhifədir.
- CMS məzmunu sadə paraqraf, qalın mətn və siyahıdır. Tarix mətni Figma-dakı hadisə siyahısından
  fərqlidir. Strukturlu blok (timeline, dəyər, kart) markup-ı yoxdur.
- Əməkdaş datası: ad, vəzifə, qəbul günləri, telefon, bio (tək HTML), foto, tip (1 İdarə Heyəti,
  2 Rəhbərlik). "Sədr / Sədr müavinləri" bölgüsü yoxdur; sıralamada birinci sədrdir.
- Şöbə datası: ad və açıqlama (HTML; direktor adı bu HTML-in içindədir). 42 şöbə. Şöbənin ayrıca
  səhifəsi, faylı, struktur sxemi yoxdur. Səhifə datasında yenilənmə tarixi yoxdur.

## Clarifications

### Session 2026-10-14

- Q: Bir spec, yoxsa bir neçə? → A: Bütün alt səhifələr bir spec-də.
- Q: Strukturlu blokların (Tarix timeline-ı, Missiya dəyərləri, Haqqımızda tarix kartları, məqsədlər
  bloku, funksiyalar siyahısı) data mənbəyi? → A: Yalnız frontend, CMS HTML. Redaktor blokları CMS
  mətnində razılaşdırılmış formada yazır, sayt onları Figma dizaynında göstərir. Formaya uyğun
  olmayan məzmun oxunaqlı adi mətn kimi göstərilir. Yeni API sahəsi və məzmun tipi yoxdur.
- Q: Figma-da olmayan "Ərazi idarələr" və `?section=` tab düymələri? → A: Ərazi idarələr qalır, yeni
  ümumi şablonla göstərilir. Tab düymələrinin yerini sol alt-bölmə menyusu tutur.
- Q: "Struktur və əsasnamələr" səhifəsindəki təşkilati sxem? → A: CMS-ə yüklənmiş şəkil kimi gəlir,
  əsasnamələr isə səhifəyə əlavə edilmiş PDF fayllarıdır. Backend dəyişmir.
- Q: Kitdə olmayan rəng və kölgələr (timeline xətti, ikon fonu, foto fonu, hero gradienti, kart
  kölgəsi)? → A: Kitə və D-2 sapmasına dəyişiklik edilmir. Ən yaxın kit token-ləri işlədilir,
  fərq qəbul edilmiş fərq kimi qeyd olunur. Kit dəyişikliyi sonraya qalır.
- Q: İdarə Heyəti üçün hansı Figma variantı? → A: `1189:15956` (sədr kartı mərkəzdə). "Sədr" və
  "Sədr müavinləri" başlıqları yalnız ekran oxuyucu üçündür.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi "Haqqımızda" səhifələrini vahid yeni şablonda görür (Priority: P1)

Ziyarətçi "Haqqımızda" bölməsinin istənilən səhifəsini açır. Header altında solda breadcrumb
("Ana səhifə › Haqqımızda › …"), sağda paylaşma düymələri (Facebook, LinkedIn, WhatsApp, e-poçt,
çap) görünür. Solda boz fonlu alt-bölmə menyusu, sağda böyük başlıq və məzmun var.

**Why this priority**: Bütün alt səhifələr bu şablonu paylaşır. O olmadan heç bir səhifə Figma-ya
uyğun gəlmir. Tək başına da dəyərlidir: mövcud məzmun dərhal yeni görünüşdə çıxır.

**Independent Test**: "Komitə" səhifəsi (yalnız başlıq və mətn) 1728, 744 və 390 enlərində
açılır və `1284:16521` / `1463:19539` / `1444:27323` ilə yanaşı müqayisə olunur.

**Acceptance Scenarios**:

1. **Given** ziyarətçi "Pul Siyasəti və Maliyyə Sabitliyi Komitəsi" səhifəsini açır, **When** səhifə
   yüklənir, **Then** breadcrumb 4 səviyyəni göstərir. Son səviyyə cari səhifədir və link deyil.
   Əvvəlki səviyyələr müvafiq səhifələrə aparır.
2. **Given** desktop en, **When** səhifə açılır, **Then** solda 312px alt-bölmə menyusu, sağda
   984px məzmun sütunu, aralarında 24px boşluq var. Başlıq 32px, qalın (600) şriftlədir.
3. **Given** alt-bölmə menyusu, **When** cari səhifə "Təşkilati struktur və idarəetmə" altındadır,
   **Then** həmin qrup açıq göstərilir və cari səhifə vurğulanır.
4. **Given** ziyarətçi paylaşma düymələrindən birini basır, **When** Facebook/LinkedIn/WhatsApp
   seçilir, **Then** cari səhifənin ünvanı ilə həmin şəbəkənin paylaşma pəncərəsi yeni tabda açılır.
   E-poçt düyməsi mövzu və link ilə poçt proqramını, çap düyməsi çap dialoqunu açır.
5. **Given** planşet (744) və ya mobil (390) en, **When** səhifə açılır, **Then** breadcrumb və
   paylaşma düymələri alt-alta, alt-bölmə menyusu isə başlıqdan əvvəl tam enli boz qutu kimi görünür
   (Figma `1345:24722`, `1342:22407`). Başlıq mobildə 22/600, mətn 14/400-dür. Üfüqi sürüşmə yoxdur.

---

### User Story 2 — Ziyarətçi "Haqqımızda" əsas səhifəsini və "Missiya və dəyərlər"-i Figma-dakı kimi görür (Priority: P1)

Əsas səhifədə giriş mətni, yan-yana üç tarix kartı (11.02.1992 Fərman, 10.12.2004 Qanun,
18.03.2009 Referendum Aktı), açıq mavi fonlu "Mərkəzi Bankın məqsədləri" bloku, accordion
şəklində "Mərkəzi Bankın funksiyaları" (birincisi açıq) və digər bölmələr görünür. "Missiya və dəyərlər"-də tünd
mavi missiya banneri və ayırıcı xətlərlə bölünmüş dəyər sətirləri (solda ikon və ad, sağda mətn)
var.

**Why this priority**: Bölmənin giriş səhifələridir və ən çox ziyarət olunur.

**Independent Test**: Redaktor test mühitində bu iki səhifənin məzmununu razılaşdırılmış formaya
salır. Səhifələr `1186:14873` və `968:822` ilə yanaşı müqayisə olunur. Sonra forma pozulur
(məsələn bir kart silinir) və səhifənin yenə oxunaqlı qaldığı yoxlanılır.

**Acceptance Scenarios**:

1. **Given** əsas səhifənin CMS mətnində üç tarix kartı razılaşdırılmış formada yazılıb, **When**
   səhifə açılır, **Then** desktop-da 3 kart bir sırada (hər biri 312×160, 24px aralıq), planşet
   və mobildə Figma-dakı düzülüşdə göstərilir.
2. **Given** "Mərkəzi Bankın məqsədləri" bloku razılaşdırılmış formadadır, **When** səhifə açılır,
   **Then** blok `#d6eaf4` fonlu, 4px radiuslu, 20px daxili boşluqlu qutu kimi görünür.
3. **Given** funksiyalar CMS-də accordion kimi yazılıb, **When** səhifə açılır, **Then** hər funksiya
   ağ, `#e5e5e5` haşiyəli, 16px boşluqlu accordion elementidir. Qrupda birincisi açıqdır, digərləri
   klikdə (JavaScript-siz də) açılır.
4. **Given** missiya mətni razılaşdırılmış formadadır, **When** "Missiya və dəyərlər" açılır,
   **Then** missiya `#004976` fonlu, 8px radiuslu, 40px daxili boşluqlu bannerdə ağ 22px mətnlə
   göstərilir. Hər dəyər ayrıca sətirdir: solda 200px sütunda ikon və ad, sağda mətn. Sətirlər
   arasında ayırıcı xətt var.
5. **Given** dəyər üçün ikon şəkli yüklənməyib, **When** səhifə açılır, **Then** dəyər ikonsuz,
   amma eyni düzülüşdə göstərilir.
6. **Given** səhifə mətni razılaşdırılmış formada deyil (bugünkü vəziyyət), **When** səhifə
   açılır, **Then** mətn Figma tipoqrafiyası ilə (başlıqlar 20/600, mətn 16/400) adi məzmun kimi
   göstərilir. Heç nə itmir, səhifə sınmır.

---

### User Story 3 — Ziyarətçi Mərkəzi Bankın tarixini timeline şəklində izləyir (Priority: P2)

"Tarix" səhifəsində yuxarıda "Bir əsrdən artıq mərkəzi bankçılıq tarixi" kartı, altında şaquli
timeline var. Hər hadisədə solda il (böyük) və gün-ay, ortada dairəvi marker, sağda başlıq, mətn
və istəyə görə bir-iki şəkil olur. Əsas mərhələlər vurğulanmış markerlə göstərilir. Sağda illər
siyahısı ekranla birlikdə hərəkət edir. İl seçiləndə səhifə həmin hadisəyə sürüşür.

**Why this priority**: Ən mürəkkəb vizual blokdur, amma məzmunu tək səhifəyə aiddir. Şablon və
əsas səhifələr olmadan da sonradan çatdırıla bilər.

**Independent Test**: Redaktor test mühitində Tarix mətnini razılaşdırılmış formaya salır
(Figma-dakı 19 hadisə). Səhifə `898:3060` / `1400:28042` / `1400:23720` ilə müqayisə olunur, il
naviqasiyası klaviatura və siçanla yoxlanılır.

**Acceptance Scenarios**:

1. **Given** Tarix mətnində N hadisə razılaşdırılmış formadadır, **When** səhifə açılır, **Then**
   N hadisə yazıldığı sırada timeline-da, sağ naviqasiyada isə hadisələrin unikal illəri
   göstərilir (eyni ildə bir neçə hadisə varsa il bir dəfə).
2. **Given** hadisə "vurğulanmış" kimi işarələnib, **When** səhifə açılır, **Then** onun markeri
   `#4bc7b5` halqalı formada, digərləri sadə ağ marker kimi görünür.
3. **Given** hadisədə bir və ya iki şəkil var, **When** səhifə açılır, **Then** hadisə 20px daxili
   boşluqlu kartda, şəkillər 360px hündürlükdə (iki şəkil yan-yana) göstərilir.
4. **Given** ziyarətçi sağdakı ildən birini seçir, **When** klik və ya klaviatura ilə seçim olur,
   **Then** səhifə həmin ilin ilk hadisəsinə sürüşür, il aktiv (`#e9faf7` fon) göstərilir və
   ünvanda həmin hadisənin lövbəri olur.
5. **Given** ziyarətçi səhifəni sürüşdürür, **When** başqa ilin hadisəsi görünüş sahəsinə gəlir,
   **Then** sağ naviqasiyada aktiv il dəyişir.
6. **Given** JavaScript söndürülüb, **When** il seçilir, **Then** səhifə yenə də həmin hadisəyə
   keçir (adi lövbər linki).
7. **Given** planşet və ya mobil en, **When** səhifə açılır, **Then** timeline `1400:28042` /
   `1400:23720`-dəki düzülüşə keçir. İl naviqasiyası timeline-ın üstündə üfüqi sürüşən illər sırası
   olur.

---

### User Story 4 — Ziyarətçi İdarə Heyətini, Rəhbərliyi və bioqrafiyaları yeni kartlarla görür (Priority: P2)

"İdarə Heyəti" səhifəsində əvvəlcə "Sədr" başlığı altında böyük kart (foto, ad, vəzifə), sonra
"Sədr müavinləri" başlığı altında 3 sütunlu kart şəbəkəsi var. "Rəhbərlik" 3 sütunlu kart
şəbəkəsidir. Karta klik bioqrafiya səhifəsini açır: yuxarıda foto, ad, vəzifə və əlaqə məlumatlı
başlıq kartı, altında "Doğum tarixi", "Təhsil", "Peşəkar fəaliyyəti", "Ailə vəziyyəti" bölmələri.

**Why this priority**: Data artıq API-dən strukturlu gəlir, risk azdır. Amma əsas səhifələrdən
sonra gəlir.

**Independent Test**: Test mühitinin real əməkdaş datası ilə üç səhifə `1189:15956`, `986:4734`,
`1199:17024` ilə müqayisə olunur.

**Acceptance Scenarios**:

1. **Given** İdarə Heyətində 6 aktiv üzv var, **When** səhifə açılır, **Then** sıralamada birinci
   üzv "Sədr" bölməsində böyük kartda (foto 424×264, ad 20/600, vəzifə 18/500), qalan 5 üzv "Sədr
   müavinləri" bölməsində 3 sütunlu şəbəkədə (kart 312 en, foto 312×250) göstərilir.
2. **Given** Rəhbərlikdə 16 əməkdaş var, **When** səhifə açılır, **Then** onlar 3 sütunlu, 24px
   aralıqlı şəbəkədə (kart 312×362, foto 312×250, ad 18/600, vəzifə 16/400) göstərilir.
3. **Given** əməkdaşın fotosu yoxdur, **When** kart göstərilir, **Then** foto yerində boz fonda
   inisiallar olur, kartın ölçüsü dəyişmir.
4. **Given** ziyarətçi karta klik edir, **When** bioqrafiya açılır, **Then** başlıq kartında foto
   (312×272), ad, vəzifə, qəbul günləri və telefon (varsa), altında bio mətni Figma tipoqrafiyası
   ilə göstərilir. Bio-dakı başlıqlar 20/600 bölmə başlığı kimi görünür.
5. **Given** bioqrafiya səhifəsi, **When** breadcrumb göstərilir, **Then** o "Ana səhifə ›
   Haqqımızda › Təşkilati struktur və idarəetmə › İdarə Heyəti (və ya Rəhbərlik) › Ad" formasındadır.

---

### User Story 5 — Ziyarətçi struktur sxemini, əsasnamələri, şöbələri və ərazi idarələrini görür (Priority: P3)

"Struktur bölmələr" səhifəsində yuxarıda CMS-ə yüklənmiş təşkilati sxem şəkli, onun altında
"* Kuratora birbaşa tabe olan şöbə" qeydi və əsasnamə PDF-ləri (ad, ölçü, yükləmə) var. Altında
şöbələrin siyahısı gəlir. Şöbəyə klik Figma-dakı şöbə səhifəsini açır: başlıq, direktor və əlaqə
məlumatı kartı, varsa PDF faylı. "Ərazi idarələr" eyni ümumi şablonla, ad/ünvan/telefon kartları
şəklində göstərilir.

**Why this priority**: Bu hissənin datası ən az strukturludur və redaktorun CMS-də hazırlıq işi
tələb edir. Digər hekayələrdən asılı deyil.

**Independent Test**: Redaktor test mühitində "Struktur bölmələr" CMS səhifəsinə sxem şəkli və
iki PDF əlavə edir. Səhifə `996:8542`, şöbə səhifəsi `996:9576` ilə müqayisə olunur. Ərazi
idarələr ümumi şablon üzrə yoxlanılır.

**Acceptance Scenarios**:

1. **Given** "Struktur bölmələr" CMS səhifəsinin mətnində sxem şəkli və əlavələrində PDF-lər var,
   **When** səhifə açılır, **Then** sxem 713px enində (kiçik ekranlarda ekran eninə sığaraq),
   PDF-lər Figma-dakı fayl sətirləri kimi (72px hündürlük, ağ fon, 20px boşluq) göstərilir.
2. **Given** sxem şəkli, **When** ziyarətçi ona klik edir, **Then** şəkil tam ölçüdə yeni tabda
   açılır.
3. **Given** CMS səhifəsində sxem yoxdur, **When** səhifə açılır, **Then** yalnız şöbə siyahısı
   göstərilir, boş yer qalmır.
4. **Given** ziyarətçi şöbəyə klik edir, **When** şöbə səhifəsi açılır, **Then** başlıq 28/600,
   şöbənin açıqlaması (direktor, əlaqə) məlumat kartında göstərilir. Breadcrumb "… › Struktur
   bölmələr › Şöbə adı" formasındadır.
5. **Given** mövcud olmayan şöbə nömrəsi ilə ünvan açılır, **When** səhifə yüklənir, **Then**
   saytın standart "tapılmadı" səhifəsi göstərilir.
6. **Given** "Ərazi idarələr" açılır, **When** səhifə yüklənir, **Then** idarələr ümumi şablonda
   ad, ünvan və (varsa) zəng edilə bilən telefonla kartlarda göstərilir.

---

### Edge Cases

- **Məzmun yalnız bir dildə doludur**: səhifə digər dildə də açılır, boş bloklar göstərilmir
  (Konstitusiya Maddə V.3).
- **Razılaşdırılmış forma qismən pozulub** (məsələn timeline hadisəsinin tarixi yoxdur): həmin
  hissə adi mətn kimi göstərilir, qalan hadisələr timeline-da qalır. Səhifə xəta vermir.
- **Tarixdə eyni ilə aid bir neçə hadisə**: il naviqasiyasında il bir dəfə görünür və ilk
  hadisəyə aparır.
- **Çox uzun ad və ya vəzifə** (məsələn "Abdulla Kərim oğlu Məlik-Aslanov"): kartda sətir
  keçidi olur, şəbəkənin düzülüşü pozulmur.
- **İdarə Heyətində yalnız bir üzv**: yalnız "Sədr" bölməsi göstərilir, "Sədr müavinləri" başlığı
  gizlənir.
- **Test datasında "(Kopya)" qeydləri**: CMS-də aktivdirsə adi qeyd kimi göstərilir. Bu, data
  məsələsidir, sayt onu süzmür.
- **"Haqqımızda (Kopya)" ağacı**: alt-bölmə menyusu bu gün olduğu kimi yalnız əsl "Haqqımızda"
  bölməsini göstərir. `copy=1` parametri ilə bugünkü davranış qorunur.
- **API xətası** (əməkdaş, şöbə, ərazi idarəsi sorğusu uğursuz olur): şablon (breadcrumb, menyu,
  başlıq) qalır, məzmun yerində saytın standart xəta vəziyyəti görünür.
- **Köhnə `?section=` ünvanları**: əvvəlki kimi işləyir. Xarici linklər və axtarış nəticələri
  sınmır.
- **Çap**: çap versiyasında header, footer, menyu və paylaşma düymələri gizlənir, məzmun tam
  enlidir.

## Requirements *(mandatory)*

### Functional Requirements

**Ümumi şablon**

- **FR-001**: "Haqqımızda" ağacındakı bütün səhifələr (CMS səhifələri, təşkilat səhifələri,
  bioqrafiya, şöbə səhifəsi) eyni şablonu istifadə etməlidir: breadcrumb və paylaşma düymələri
  sırası, sol alt-bölmə menyusu, başlıq, məzmun. Ölçülər Figma-dan götürülür (sıra 100px, menyu
  312px, məzmun 984px, aralıq 24px, başlıq 32/600).
- **FR-002**: Breadcrumb CMS ağacındakı yoldan qurulmalıdır. Təşkilat, bioqrafiya və şöbə
  səhifələrində yol uyğun CMS qovşağından davam edir. Son element link deyil və cari səhifə
  kimi işarələnir.
- **FR-003**: Paylaşma düymələri (Facebook, LinkedIn, WhatsApp, e-poçt, çap) cari səhifənin tam
  ünvanını paylaşmalıdır. Düymələrin oxunaqlı adları (ekran oxuyucu üçün) az/en dillərindədir.
  Paylaşma üçün kənar skript yüklənmir.
- **FR-004**: Sol alt-bölmə menyusu "Haqqımızda" alt ağacını göstərməli, cari qrupu açıq və cari
  səhifəni vurğulanmış saxlamalıdır. Təşkilat bölmələrinə (`?section=`) keçid bu menyudan olur.
  Köhnə tab düymələri silinir.
- **FR-005**: Planşet (744) və mobil (390) enlərində şablon Figma-dakı formaya keçməlidir:
  breadcrumb və paylaşma alt-alta, alt-bölmə menyusu başlıqdan əvvəl tam enli qutu.

**Strukturlu bloklar (CMS mətnindən)**

- **FR-006**: Sayt CMS mətnindəki razılaşdırılmış formaları tanıyıb Figma bloklarına çevirməlidir:
  (a) tarix kartları sırası, (b) vurğulanmış qutu ("Məqsədlər"), (c) funksiyalar accordion-u
  (birincisi açıq), (d) missiya banneri, (e) ikonlu dəyər sətirləri, (f) timeline hadisəsi (il, gün-ay,
  başlıq, mətn, şəkillər, vurğu), (g) tarix səhifəsinin giriş kartı.
- **FR-007**: Razılaşdırılmış formalar **yalnız CMS redaktorunun artıq qoruduğu elementlərdən**
  qurulmalıdır (başlıqlar, paraqraflar, siyahılar, şəkillər və s.). Redaktorun səssizcə sildiyi
  class və elementlərə əsaslanan forma qəbul edilmir. Hər forma admin panelinin mövcud
  "roundtrip" yoxlaması ilə (aç-saxla-müqayisə et) itkisiz olduğu sübut olunur.
- **FR-008**: Razılaşdırılmış formaya uyğun gəlməyən məzmun Figma tipoqrafiyası ilə adi mətn kimi
  göstərilməlidir. Heç bir məzmun itməməli, səhifə xəta verməməlidir.
- **FR-009**: Formaların redaktorlar üçün qısa təlimatı (azərbaycan dilində, nümunələrlə) bu
  feature-un çıxışıdır.
- **FR-010**: Tarix səhifəsinin il naviqasiyası hadisələrdən avtomatik qurulmalı, desktop-da
  ekranla birlikdə hərəkət etməli, görünən hadisəyə görə aktiv ili dəyişməli və JavaScript-siz də
  lövbər linki kimi işləməlidir.
- **FR-011**: CMS mətni bu gün olduğu kimi təhlükəsiz hazırlanmalıdır (yalnız icazəli HTML).
  Yeni bloklar HTML-in təhlükəsizlik qaydalarını zəiflətməməlidir.

**Təşkilat səhifələri**

- **FR-012**: İdarə Heyəti səhifəsi sıralamada birinci üzvü "Sədr" bölməsində böyük kartla, qalanını
  "Sədr müavinləri" bölməsində 3 sütunlu şəbəkədə göstərməlidir. Bölmə başlıqları sayt
  etiketləridir (az/en).
- **FR-013**: Rəhbərlik səhifəsi əməkdaşları 3 sütunlu kart şəbəkəsində göstərməlidir. Planşetdə
  2, mobildə 1 sütun (Figma tablet/mobil frame-i olmayan səhifələr üçün ümumi qayda).
- **FR-014**: Bioqrafiya səhifəsi Figma başlıq kartını (foto, ad, vəzifə, qəbul günləri, telefon)
  və bio mətnini Figma tipoqrafiyası ilə göstərməlidir. Kart sırasına qayıtmaq breadcrumb
  vasitəsilə olur.
- **FR-015**: "Struktur bölmələr" səhifəsi "Struktur bölmələr" CMS səhifəsinin mətnini (sxem
  şəkli, qeyd) və əlavələrini (əsasnamə PDF-ləri) şöbə siyahısının üstündə göstərməlidir. CMS
  səhifəsi boşdursa bu hissə göstərilmir.
- **FR-016**: Hər şöbənin ayrıca səhifəsi olmalıdır (Figma `996:9576`). Data mövcud şöbə
  siyahısından götürülür, yeni API sorğusu tipi yaranmır. Mövcud olmayan şöbə "tapılmadı" verir.
- **FR-017**: "Ərazi idarələr" yeni şablonda kart şəklində göstərilməlidir (ad, ünvan, zəng
  edilə bilən telefon).
- **FR-018**: Fayl sətirləri (PDF) Figma `pdf file` komponentinə uyğun olmalıdır: fayl tipi, ad,
  ölçü, yükləmə. Saytın mövcud əlavələr bloku eyni görünüşə keçir.

**Ümumi**

- **FR-019**: Bütün mövcud ünvanlar (`/{locale}/{slug}`, `/{locale}/organization?section=…`,
  `/{locale}/organization/staff/detail/{id}`) eyni qalmalıdır. Yeni ünvan yalnız şöbə səhifəsi
  üçün əlavə olunur.
- **FR-020**: Bütün yeni etiketlər ("Sədr", "Sədr müavinləri", "Paylaş", "Çap et", breadcrumb
  "Ana səhifə" və s.) az və en dillərində olmalıdır. Redaksiya mətni kodda yazılmır, CMS/API-dən
  gəlir (Konstitusiya Maddə V.4).
- **FR-021**: Səhifələr bu gün olduğu kimi serverdə tam render olunmalı, CMS dəyişiklikləri
  saytda dərhal görünməlidir. Strukturlu bloklar əlavə API sorğusu yaratmamalıdır.
- **FR-022**: Şəkillərin alternativ mətni, başlıq iyerarxiyası (bir H1, bölmələr H2) və klaviatura
  ilə idarəetmə hər səhifədə qorunmalıdır.

### Key Entities

- **"Haqqımızda" səhifə qovşağı**: CMS ağacında başlıq, slug, alt qovşaqlar, istəyə görə
  xüsusi ünvan. Breadcrumb və alt-bölmə menyusu bundan qurulur.
- **Strukturlu blok (CMS mətnindən çıxarılan)**: tarix kartı (tarix, başlıq), vurğulanmış qutu
  (başlıq, mətn), funksiya (nömrə, başlıq, mətn), missiya (mətn), dəyər (ikon, ad, mətn),
  timeline hadisəsi (il, gün-ay, başlıq, mətn, 0–2 şəkil, vurğu). Ayrıca saxlanmır, hər sorğuda
  CMS mətnindən alınır.
- **Əməkdaş**: ad, vəzifə, qəbul günləri, telefon, bio, foto, tip (İdarə Heyəti / Rəhbərlik),
  sıra. İdarə Heyətində sırada birinci = sədr.
- **Şöbə**: ad, açıqlama (direktor, əlaqə daxil), sıra.
- **Ərazi idarəsi**: ad, ünvan, telefon.
- **Fayl əlavəsi**: ad, tip, ölçü, ünvan.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cədvəldəki 9 səhifə 1728, 744 və 390 enlərində Figma frame-ləri ilə yanaşı müqayisədə
  blok sırası, ölçü (±2px) və rəng baxımından uyğundur. Hər fərq sənədləşdirilib və təsdiqlənib.
- **SC-002**: 320–1920px aralığında heç bir "Haqqımızda" səhifəsində üfüqi sürüşmə yoxdur.
- **SC-003**: Razılaşdırılmış formada yazılmış məzmun admin paneldə açılıb saxlanandan sonra 100%
  dəyişməz qalır (roundtrip yoxlaması keçir).
- **SC-004**: Bugünkü (formaya salınmamış) CMS məzmunu ilə bütün səhifələr açılır, məzmunun 100%-i
  görünür, heç bir səhifə xəta vermir.
- **SC-005**: Redaktor təlimata baxaraq Tarix səhifəsinə yeni hadisə əlavə edir və o, kod
  dəyişikliyi olmadan timeline-da və il naviqasiyasında görünür.
- **SC-006**: Bütün mövcud "Haqqımızda" ünvanları əvvəlki kimi açılır (sınmış link 0).
- **SC-007**: Səhifələrin hər biri əvvəlkindən artıq API sorğusu göndərmir. İki istisna var:
  "Struktur bölmələr" sxem və əsasnamələr üçün öz CMS səhifəsini bir dəfə oxuyur, yeni şöbə
  səhifəsi isə bir siyahı sorğusu edir.
- **SC-008**: Bütün interaktiv elementlərə (menyu, paylaşma, il naviqasiyası, kartlar) yalnız
  klaviatura ilə çatmaq olur. Frontend gate (`verify`) yaşıldır, test əhatəsi azalmır.

## Assumptions

- Figma "cbar website (Copy)" faylı yekun dizayndır. Rəng və ölçülər node-lardan götürülür, 022-nin
  token faylı (sapma D-2) genişləndirilir.
- Tablet/mobil frame-i olmayan səhifələr (İdarə Heyəti, Rəhbərlik, bioqrafiyanın tablet versiyası)
  üçün ümumi qayda: 744-də 2 sütun, 390-da 1 sütun, şablon digər səhifələrin tablet/mobil
  frame-lərindəki kimi.
- Figma-dakı statik nümunə mətnləri (məsələn Rəhbərlikdə hamının vəzifəsi "Mərkəzi Bankın baş
  direktoru", "Son yenilənmə: xx.xx.xxxx") dizayn yer tutucusudur. Real dəyərlər API/CMS-dən gəlir.
- "Son yenilənmə" tarixi üçün API-də sahə yoxdur. Redaktor onu CMS mətnində yazırsa göstərilir,
  avtomatik hesablanmır.
- CMS məzmununun razılaşdırılmış formaya salınması (xüsusən Tarix-in 19 hadisəsi və Figma-dakı
  yeni mətnlər) redaksiya işidir və bu feature-un kodundan ayrıdır. O edilənə qədər səhifələr adi
  mətn formasında (FR-008) işləyir.
- Dəyər ikonları CMS-ə yüklənmiş şəkillərdir. Figma ikonları redaktora fayl kimi verilir.
- Struktur sxemi Figma-dakı sxemin şəkil ixracıdır və CMS-ə redaktor yükləyir. Sxemin interaktiv
  (kodla qurulmuş) versiyası əhatədə deyil.
- "Əlaqə" səhifəsi (Figma-da gizli frame) ümumi şablonla adi CMS səhifəsi kimi göstərilir.
- Paylaşma düymələri yalnız link açır, kənar SDK yüklənmir, CSP dəyişmir.
- Branch: `feature/024-about-us-redesign` (GitLab konvensiyası), 022-nin branch-indən ayrılır.
  022 merge olunmadan bu iş merge oluna bilməz.
- Backend və admin panel üçün gələcək spec (strukturlu "Tarix hadisəsi", "Dəyər", şöbə faylı,
  "Sədr" bayrağı kimi sahələr) bu feature-un əhatəsindən kənardadır.
