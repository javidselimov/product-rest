# Feature Specification: "Tarix" səhifəsinin interaktiv dizaynı

**Feature Branch**: `026-history-interactive`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Haqqımızda → Tarix səhifəsinin yeni interaktiv dizaynı (Figma 1845:118772
"Haqqımızda - Tarix — interaktiv · Desktop", işləyən prototip: /tarix.html). Spec 024-ün history
layout-unu (şaquli timeline + il naviqasiyası) əvəz edir: bir dəfədə bir ilin kartı, üfüqi il oxu,
əvvəlki/növbəti düymələri, ←/→ klaviatura, mobil swipe, 5 s avtomatik keçid, URL #il, şəkil
lightbox. Məlumat mənbəyi dəyişmir: 024-ün CMS markup kontraktı. API/CMS/admin dəyişikliyi yoxdur.
JS-siz fallback lazımdır."

**Mənbə dizayn**: Figma faylı "cbar website (Copy)", frame **"Haqqımızda - Tarix — interaktiv ·
Desktop"** (`1845:118772`, 1728 en). Daxilində: `menu` `1845:118923`, `breadcrumb, social links`
`1845:118773`, `subcategories` `1845:118983`, səhifə başlığı `Tarix` `1845:118776` (32/600 lh44),
məzmun `Body` `1854:120014`.

**İşləyən prototip**: repo kökündəki `tarix.html`. Figma prototipinin davranışını (avtomatik keçid,
il oxu, lightbox, swipe, responsiv qaydalar 1279 / 1023 / 599 px) təkrarlayır. Dizayn və davranış
mübahisəsində **Figma ölçüləri, davranışda isə prototip** əsas götürülür. Prototipdəki mətn
nümunədir. Saytda mətn həmişə CMS-dən gəlir.

**Əhatə olunan proyektlər**:

- `web-cbar-new`: "Tarix" səhifəsinin (`history` layout-u) görünüşü və davranışı.
- `api-cbar`, `api-cbar-admin`: **dəyişmir**. Yeni API sahəsi, məzmun tipi, migration yoxdur.
- `web-cbar-admin-new`: kod dəyişikliyi gözlənilmir. Yalnız yoxlanılır ki, şəkil düzülüşü işarəsi
  (FR-004a) redaktorda qoyula bilir və saxlananda itmir (`npm run roundtrip`). İtirsə, bu ayrıca
  merge request olur.

**Asılılıq**: spec 024 ("Haqqımızda" redizaynı). Ondan bunlar dəyişmədən götürülür: ümumi şablon
(header, breadcrumb, paylaşma düymələri, sol alt-bölmə menyusu, footer), hero kart və
`contracts/cms-markup.md` §3 məzmun qaydaları (timeline cədvəli, il, gün-ay, başlıq, mətn,
şəkillər, vurğu). Bu spec yalnız 024-ün **şaquli timeline + il naviqasiyası** bloklarını əvəz edir.

**`product-host` istinadı (Konstitusiya Maddə I.2)**:

| Köhnə | Nə edir | Bu spec-dən sonra |
|---|---|---|
| `visitor/controllers/PagesController.php` `actionIndex`, `views/pages/*` (Tarix CMS səhifəsi) | Tarix mətnini adi CMS səhifəsi kimi göstərir | Eyni URL, eyni məzmun, interaktiv görünüş. URL və İA dəyişmir, ləğv edilən funksiya yoxdur |

**Hazırkı vəziyyət (spec 024-dən sonra)**:

- 024 reyestri `history` layout-unu `tarixi` / `history` və `tarix-copy` / `history-copy`
  slug-larına verir. Test mühitində (2026-10-22) isə slug-lar belədir: az əsas `tarix` (reyestrdə
  yoxdur, `tarixi` 404 qaytarır), az kopya `tarix-copy`, en əsas `history`, en kopya
  `history-copy-2`. Bundan əlavə, az "Haqqımızda (Kopya)"-nın slug-ı `history-copy`-dir və dilsiz
  reyestrdə səhvən Tarix layout-unu alır. Formaya salınmış məzmun "Tarix (Kopya)"-dadır.
- Bütün hadisələr şaquli siyahıda alt-alta göstərilir. Yanında il çipləri olan naviqasiya var,
  hər ilin ilk hadisəsinin `#year-{yyyy}` lövbəri var.

## Clarifications

### Session 2026-10-22

- Q: Bu iş spec 024-ə əlavə olunur, yoxsa yeni spec-dir? → A: Yeni spec (026). 024 bağlanıb.
- Q: Yeni görünüş hansı səhifələrə tətbiq olunur? → A: Hər ikisinə birdən: əsas səhifə
  (`/az/tarix`, `/en/history`) və kopya (`/az/tarix-copy`, `/en/history-copy`).
- Q: Avtomatik keçid və WCAG 2.2.2 ("Pause, Stop, Hide")? → A: Prototipdəki kimi qalır. Görünən
  "dayandır" düyməsi olmur, keçid yalnız müdaxilə ilə dayanır. Bu, qəbul edilmiş sapmadır.
  Riski "hərəkəti azalt" ayarına hörmət, hash ilə açılışda başlamamaq, sonuncu ildə dayanmaq və
  ilk müdaxilədə həmişəlik dayanmaq azaldır.
- Q: Şəkil düzülüşü necə seçilir? → A: Default olaraq avtomatik təyin olunur (şəkillərin sayı və
  istiqaməti). Redaktor istəsə, CMS markup-ında açıq işarə ilə düzülüşü dəyişə bilər. 024
  kontraktı bu işarə ilə genişlənir.
- (Plan, research R9) Ox nöqtəsinin adı "{il}-ci il" yox, il rəqəmidir: şəkilçi ahəngə görə dəyişir
  (1919-cu, 1936-cı, 1993-cü). Kontekstdən "İllər" naviqasiyası adı verilir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tarixi il-il vərəqləmək (Priority: P1)

Ziyarətçi "Tarix" səhifəsini açır. Hero kartın altında bir dəfədə **bir ilin kartı** görünür:
kartın fonunda böyük il rəqəmi, sağda dekorativ halqalar, solda il və həmin ilin hadisələri
(gün-ay, başlıq, mətn, şəkillər) var. Bir ildə bir neçə hadisə varsa, onlar şaquli xəttlə
birləşdirilmiş ardıcıllıqla göstərilir. Kartın altında bütün illərin nöqtələrindən ibarət
**üfüqi il oxu** var. Keçilmiş hissə rəngli irəliləmə xətti ilə göstərilir. Ziyarətçi oxda istənilən
ilə klikləyir və ya "əvvəlki/növbəti" düymələri ilə illər arasında keçir.

**Why this priority**: Feature-un əsas dəyəri budur. Uzun şaquli siyahının yerini qısa və
idarə olunan hekayə tutur. Qalan hekayələr bunun üzərində qurulur.

**Independent Test**: Test mühitində `/az/tarix-copy`-ni aç. Birinci ilin kartı görünür. Oxda
istənilən ilə klikləyəndə kartda həmin ilin bütün hadisələri görünür, "növbəti" düyməsi bir
sonrakı ilə keçir. Birinci ildə "əvvəlki", sonuncu ildə "növbəti" düyməsi deaktivdir.

**Acceptance Scenarios**:

1. **Given** CMS-də timeline cədvəlində N fərqli il var, **When** səhifə açılır, **Then** oxda
   cədvəl sırası ilə N nöqtə görünür və birinci ilin kartı aktivdir.
2. **Given** bir ildə 5 hadisə var (məs. 1992), **When** həmin il seçilir, **Then** kartda 5
   hadisənin hamısı cədvəl sırası ilə, aralarında birləşdirici xətlə görünür.
3. **Given** ildə yalnız bir hadisə var, **When** il seçilir, **Then** birləşdirici xətt
   göstərilmir.
4. **Given** aktiv il 3-cü ildir, **When** ziyarətçi oxa baxır, **Then** ilk iki nöqtə "keçilmiş",
   üçüncü "aktiv" görünür, irəliləmə xətti üçüncü nöqtəyə qədər uzanır.
5. **Given** il dəyişir, **When** yeni kart görünür, **Then** keçid yumşaq solma animasiyası ilə
   olur və ekran oxuyucusu yeni ilin məzmununu elan edir.
6. **Given** hadisə vurğuludur (CMS-də il qalın yazılıb), **When** kart göstərilir, **Then** vurğu
   024-dəki kimi fərqlənir.

---

### User Story 2 - Müəyyən ilə birbaşa keçid və paylaşma (Priority: P1)

Ziyarətçi il dəyişəndə səhifə ünvanının sonu həmin ilə (`#1992`) uyğun yenilənir. Bu linki
paylaşan və ya brauzerdə yeniləyən adam birbaşa həmin ilin kartına düşür. Spec 024-dən qalmış
`#year-1992` formalı köhnə linklər də eyni ili açır.

**Why this priority**: Səhifəni paylaşma və çap düymələri var. Konkret hadisəyə istinad etmək
(mətbuat, sosial şəbəkə) əsas istifadə ssenarisidir. Köhnə lövbərlər artıq paylaşılıb ola bilər.

**Independent Test**: `/az/tarix-copy#1998` aç → 1998 kartı aktivdir. Başqa ilə keç → ünvan
dəyişir, amma brauzer tarixçəsinə yeni addım düşmür ("geri" düyməsi əvvəlki səhifəyə qaytarır).

**Acceptance Scenarios**:

1. **Given** ünvan `#1998`-dir, **When** səhifə açılır, **Then** 1998 kartı aktivdir və avtomatik
   keçid başlamır.
2. **Given** ünvan `#year-1998`-dir, **When** səhifə açılır, **Then** nəticə `#1998` ilə eynidir.
3. **Given** ünvandakı il timeline-da yoxdur (`#1850`), **When** səhifə açılır, **Then** birinci il
   aktivdir, səhv göstərilmir.
4. **Given** ziyarətçi 3 dəfə il dəyişib, **When** brauzerin "geri" düyməsini basır, **Then**
   əvvəlki səhifəyə qayıdır (il keçidləri tarixçəni doldurmur).

---

### User Story 3 - Klaviatura, toxunma və əlçatanlıq (Priority: P2)

Klaviatura istifadəçisi il oxundakı nöqtələrə və düymələrə Tab ilə çatır, ←/→ oxları ilə illəri
dəyişir. Mobil istifadəçi kartı sola/sağa sürüşdürərək ili dəyişir. Ekran oxuyucusu aktiv ili və
düymələrin mənasını ("Əvvəlki il", "Növbəti il", "İllər" naviqasiyasında "1992") oxuyur.

**Why this priority**: Dövlət qurumunun saytıdır və əlçatanlıq tələbi var. Mobil trafik böyük
paydır. Bununla belə əsas dəyər (P1) bunsuz da göstərilə bilir.

**Independent Test**: Yalnız klaviatura ilə bütün illəri gəz. Mobil emulyatorda kartı sürüşdürərək
ili dəyiş. Ekran oxuyucusu ilə il dəyişikliyinin elan olunduğunu yoxla.

**Acceptance Scenarios**:

1. **Given** fokus səhifədədir (yazı sahəsində deyil), **When** → basılır, **Then** növbəti il
   aktiv olur. ← ilə əvvəlki il. Sərhəddə heç nə dəyişmir.
2. **Given** toxunma ekranı, **When** kart üfüqi olaraq 50 px-dən çox sürüşdürülür, **Then** sola
   sürüşdürmə növbəti, sağa sürüşdürmə əvvəlki ili açır. Şaquli səhifə sürüşdürülməsi bloklanmır.
3. **Given** il oxu ekrana sığmır (dar ekran və ya çox il), **When** il dəyişir, **Then** ox
   üfüqi sürüşür və aktiv nöqtə görünən sahənin ortasına gəlir.
4. **Given** il oxunun nöqtəsi, **When** ekran oxuyucusu onu oxuyur, **Then** "İllər" naviqasiyasında il rəqəmi kimi
   oxunur, aktiv olan "cari addım" kimi işarələnir.

---

### User Story 4 - Avtomatik keçid (Priority: P2)

Ziyarətçi səhifəni açıb heç nəyə toxunmursa, illər hər 5 saniyədən bir özü növbəti ilə keçir və
sonuncu ildə gözləyir. Ziyarətçinin öz keçidləri (düymə, nöqtə, klaviatura, swipe) avtomatik
keçidi dayandırmır — yalnız sayğacı sıfırlayır, seçilən il tam 5 s qalır, sonra hekayə oradan
davam edir. Fasilə verən hallar: siçan kartın üstündədir (oxumağa vaxt qalsın), klaviatura
fokusu timeline-ın içindədir, şəkil böyüdülüb; səbəb aradan qalxanda davam edir.

**Why this priority**: Figma prototipinin xarakterik davranışıdır və hekayənin özü-özünə
oynamasını təmin edir. Amma məzmun ona bağlı deyil və o olmadan da tam işləyir.

**Independent Test**: Səhifəni hash-siz aç və 15 saniyə gözlə → 2 dəfə il dəyişir. Siçanı karta
gətir → bundan sonra il dəyişmir.

**Acceptance Scenarios**:

1. **Given** ünvanda il yoxdur və əməliyyat sistemində "hərəkəti azalt" ayarı söndürülüb, **When**
   5 s keçir, **Then** növbəti il aktiv olur.
2. **Given** "hərəkəti azalt" ayarı açıqdır, **When** səhifə açılır, **Then** avtomatik keçid
   başlamır və solma animasiyası göstərilmir.
3. **Given** ünvanda il var (`#1992`), **When** səhifə açılır, **Then** avtomatik keçid başlamır.
4. **Given** avtomatik keçid gedir, **When** ziyarətçi istənilən formada müdaxilə edir, **Then**
   keçid dayanır və həmin səhifə baxışı ərzində yenidən başlamır.
5. **Given** sonuncu il aktivdir, **When** 5 s keçir, **Then** keçid dayanır (birinci ilə
   qayıtmır).

---

### User Story 5 - Şəkilləri böyütmək (Priority: P3)

Hadisədəki şəklə klikləyən ziyarətçi onu ekranın ortasında, tünd fon üzərində böyük ölçüdə görür.
Bağlamaq üçün "×" düyməsi, fona klik və Escape işləyir.

**Why this priority**: Kartdakı şəkillər kiçikdir (əskinaslar, binalar). Detala baxmaq istəyən
üçün faydalıdır, amma əsas axın deyil.

**Independent Test**: 1998 kartında şəklə klik → böyük şəkil açılır, fokus "×" düyməsinə keçir.
Escape → bağlanır, fokus kliklənən şəklə qayıdır.

**Acceptance Scenarios**:

1. **Given** hadisədə şəkil var, **When** şəklə klik edilir, **Then** böyüdülmüş görünüş açılır,
   şəklin alt mətni ona aid edilir, arxadakı səhifə ilə qarşılıqlı əlaqə bloklanır.
2. **Given** böyüdülmüş görünüş açıqdır, **When** Escape, "×" və ya fona klik, **Then** görünüş
   bağlanır və fokus açan şəklə qayıdır.
3. **Given** böyüdülmüş görünüş açıqdır, **When** ←/→ basılır, **Then** il dəyişmir.

---

### User Story 6 - Skriptsiz, axtarış sistemi və çap (Priority: P2)

JavaScript işləməyəndə (bloklanıb, xəta verib, axtarış robotu), həmçinin səhifə çap olunanda
**bütün illərin bütün hadisələri** oxunaqlı ardıcıl siyahı kimi görünür. Heç bir məzmun yalnız
klikdən sonra əlçatan olmur.

**Why this priority**: Tarix mətni axtarışda tapılmalıdır. Paylaşma panelində "Çap et" düyməsi
var və çap yalnız bir ili göstərməməlidir. Sayt server-rendered prinsipi ilə qurulub.

**Independent Test**: Brauzerdə JavaScript-i söndür və səhifəni aç → bütün hadisələr il-il
görünür, il oxunda nöqtələr həmin illərə lövbər linkidir. Çap önizləməsində bütün illər var,
düymələr və il oxu yoxdur.

**Acceptance Scenarios**:

1. **Given** JavaScript söndürülüb, **When** səhifə açılır, **Then** bütün hadisələrin mətni və
   şəkilləri görünür, "əvvəlki/növbəti" düymələri görünmür.
2. **Given** səhifənin ilk HTML cavabı, **When** onu axtarış robotu oxuyur, **Then** hər hadisənin
   başlığı və mətni orada var.
3. **Given** istənilən il aktivdir, **When** səhifə çap olunur, **Then** çapda bütün illər
   ardıcıl gəlir. Naviqasiya, düymələr və dekorativ elementlər çıxmır.

---

### Edge Cases

- **İli olmayan sətir** (024 qaydası ilə "adi məzmun"): əvvəlki ilin kartına, həmin ilin
  hadisələrindən sonra markersiz əlavə olunur. Cədvəlin ilk sətri ilsizdirsə, birinci ilin kartının
  əvvəlinə düşür. Heç bir mətn itmir.
- **Eyni il cədvəldə ardıcıl olmayan sətirlərdə** (məs. 1992, 1993, 1992): il oxunda il bir dəfə
  görünür, ilk rast gəlindiyi yerdə. Kartında o ilin bütün hadisələri cədvəl sırası ilə olur.
- **Yalnız bir il var**: kart göstərilir. Ox, düymələr və avtomatik keçid göstərilmir.
- **Timeline cədvəli yoxdur**: dəyişmir. Səhifə 024-dəki kimi `plain` göstərilir.
- **Cədvəldən sonrakı məzmun**: interaktiv blokdan sonra adi məzmun kimi qalır (024 kimi).
- **Çox il (≥ 30)**: ox nöqtələri sıxılmır, ox üfüqi sürüşür (US3-2).
- **Uzun hadisə mətni / çox hadisə**: kart məzmuna görə uzanır. Mətn kəsilmir və daxili
  sürüşdürmə yaranmır. İllərin kart hündürlüyü fərqlidir. İstifadəçi düymə və ya ox nöqtəsi ilə
  ili dəyişəndə kliklədiyi element ekranda yerində qalır (səhifə hündürlük fərqi qədər sürüşdürülür),
  belə ki ardıcıl "Növbəti" klikləri hədəfi itirmir (FR-007a).
- **İngilis versiyası** (`/en/history`, `/en/history-copy`): eyni davranış. Düymə və elan
  mətnləri ingiliscədir ("Previous year", "{year}"), ünvan `#1992` formasındadır.
- **Şəkil yüklənmir**: yeri fon rəngi ilə qalır, kartın tərtibatı dağılmır. Şəkil linki işləməyə
  davam edir, xəta göstərilmir.
- **Səhifə açıq ikən ünvanın `#` hissəsi əl ilə dəyişdirilir**: aktiv il dəyişmir (yalnız ilk
  açılışda oxunur). Qəbul edilmiş məhdudiyyətdir.
- **Səhifədə il oxu ilə başqa lövbər eyni ada malikdir**: ünvan lövbəri yalnız timeline illəri ilə
  uyğunlaşdırılır.

## Requirements *(mandatory)*

### Functional Requirements

**Məzmun və məlumat**

- **FR-001**: İllər, hadisələr, gün-ay, başlıq, mətn, şəkillər və vurğu spec 024
  `contracts/cms-markup.md` §3 qaydaları ilə CMS məzmunundan alınmalıdır. Redaktorun yazdığı
  markup-da dəyişiklik tələb olunmamalıdır. Hazırda test mühitində olan "Tarix (Kopya)" məzmunu
  dəyişmədən yeni dizaynda göstərilməlidir.
- **FR-002**: İllər il oxunda cədvəldə ilk rast gəlindiyi sıra ilə, hər il bir dəfə göstərilməlidir.
  Bir ilin bütün hadisələri onun kartında cədvəl sırası ilə olmalıdır.
- **FR-003**: Hero kart (024) və cədvəldən sonrakı məzmun dəyişməz qalmalıdır.
- **FR-004**: Hadisə şəkilləri Figma/prototipdəki dörd düzülüşdən biri ilə göstərilməlidir:
  `single` (bir şəkil), `note` (dar şaquli + enli, yan-yana), `hero2` (üstdə enli, altda iki),
  `tall` (solda hündür, sağda iki üst-üstə). Default düzülüş avtomatik seçilir:
  - 1 şəkil → `single`;
  - 2 şəkil → `note`;
  - 3 şəkil → birinci şəkil portret istiqamətlidirsə `tall`, əks halda (və ya istiqamət
    bilinmirsə) `hero2`;
  - 4+ şəkil → `hero2` qaydası ilə: birinci enli, qalanları iki sütunlu şəbəkə.
- **FR-004a**: Redaktor CMS markup-ında açıq işarə ilə hadisənin düzülüşünü dörd adlı
  düzülüşdən birinə dəyişə bilməlidir. İşarə olmadıqda və ya tanınmadıqda FR-004-ün avtomatik
  qaydası tətbiq olunmalıdır. İşarənin forması 024 `contracts/cms-markup.md` §3-ə əlavə olunmalıdır.
  O, redaktorun TipTap-da qoya biləcəyi və roundtrip-də itməyən formada olmalıdır. Redaktor
  bələdçisi (`web-cbar-new/docs/about-cms-guide.md`) yenilənməlidir.

**Kart və il oxu**

- **FR-005**: Eyni anda yalnız bir ilin kartı göstərilməlidir. Kartda il rəqəmi, fonunda böyük
  dekorativ il rəqəmi, dekorativ halqalar və həmin ilin hadisələri olmalıdır. Bir neçə hadisə
  şaquli birləşdirici xətlə göstərilməlidir.
- **FR-006**: Kartın altında bütün illərin nöqtələri, il etiketləri və keçilmiş hissəni göstərən
  irəliləmə xətti olan üfüqi ox olmalıdır. Hər nöqtə həmin ili açan idarəetmə elementi olmalıdır.
- **FR-007**: "Əvvəlki il" və "Növbəti il" düymələri olmalıdır. Sərhəd illərdə müvafiq düymə
  deaktiv olmalıdır.
- **FR-007a**: İstifadəçi düymə və ya ox nöqtəsi ilə ili dəyişəndə kartın hündürlüyü dəyişirsə,
  kliklənən element ekrandakı yerində qalmalıdır (±2 px). Avtomatik keçiddə səhifə
  sürüşdürülməməlidir.
- **FR-008**: İl dəyişəndə kart məzmunu solma animasiyası ilə yenilənməli və yeni məzmun köməkçi
  texnologiyalara nəzakətli (müdaxiləsiz) şəkildə elan olunmalıdır.
- **FR-009**: Ox ekrana sığmayanda üfüqi sürüşməli və aktiv il görünən sahənin ortasına
  gətirilməlidir.

**Naviqasiya və ünvan**

- **FR-010**: Aktiv il ünvanın lövbər hissəsində `#{yyyy}` kimi əks olunmalıdır. Bu, brauzer
  tarixçəsinə yeni addım əlavə etməməlidir.
- **FR-011**: Səhifə `#{yyyy}` və ya `#year-{yyyy}` lövbəri ilə açılanda həmin il aktiv olmalıdır.
  Tanınmayan lövbərdə birinci il aktiv olmalıdır.
- **FR-012**: ←/→ klaviatura düymələri ili dəyişməlidir. Fokus yazı sahəsindədirsə və ya şəkil
  böyüdülüb, bu baş verməməlidir.
- **FR-013**: Toxunma ekranında kartda 50 px-dən çox üfüqi sürüşdürmə ili dəyişməlidir. Şaquli
  sürüşdürmə səhifəni adi qaydada sürüşdürməlidir.

**Avtomatik keçid**

- **FR-014**: Ünvanda il yoxdursa və istifadəçi hərəkəti azaltmağı seçməyibsə, aktiv il hər 5 s-dən
  bir növbəti ilə keçməli və sonuncu ildə dayanmalıdır. Vaxt yalnız timeline ekranda (ən azı
  yarısı görünür) və brauzer tabı aktiv olanda sayılır. Ziyarətçi aşağı sürüşüb timeline-a
  çatanda hekayə ötüb keçmiş olmamalıdır. "Ünvanda il var" yalnız timeline-dakı ili göstərən
  lövbərə aiddir (`#1992`, `#year-1992`). Başqa lövbər avtomatik keçidi dayandırmır.
- **FR-015**: İstifadəçinin öz keçidi (nöqtə və ya düymə kliki, ←/→, swipe) avtomatik keçidi
  dayandırmamalı, yalnız sayğacı sıfırlamalıdır — seçilən il tam interval qədər qalır, sonra
  hekayə oradan davam edir. Sonuncu ilə çatanda gözləyir; istifadəçi geri qayıdarsa yenə davam
  edir. (Əvvəlki redaksiyada ilk müdaxilə həmişəlik dayandırırdı — 2026-10-23 dəyişikliyi,
  məhsul qərarı.) Görünən "dayandır" düyməsi olmur. Bu, WCAG 2.2.2-dən qəbul edilmiş sapmadır (bax:
  Clarifications) və plan-ın sapmalar cədvəlinə yazılmalıdır.
- **FR-015a**: Klaviatura fokusu kartın, il oxunun və ya düymələrin içində olduğu müddətdə
  avtomatik keçid fasilə verməlidir (ekran oxuyucusu istifadəçisi oxuduğu ilin altından
  sürüşməsin), fokus timeline-dan çıxanda davam edir. Siçan klikinin düyməyə gətirdiyi fokus
  fasilə vermir — fasilə yalnız son giriş klaviaturadan olanda tətbiq olunur.
- **FR-015b**: Siçan kartın üstündə olanda və şəkil böyüdülmüş (lightbox açıq) olanda avtomatik
  keçid fasilə verməli, səbəb aradan qalxanda davam etməlidir. (Əvvəlki redaksiyada `pointerenter` həmişəlik dayandırırdı;
  desktop-da sürüşdürən istifadəçinin siçanı onsuz da kartın üstündə olduğundan keçid heç
  başlamırdı — 2026-10-23 dəyişikliyi.)
- **FR-014a**: "Timeline ekrandadır" görünən hissənin timeline-ın öz hündürlüyünə **və ya**
  viewport-a (hansı kiçikdirsə) nisbəti ≥ 50 % deməkdir. Viewport-dan hündür kart (mobil, uzun
  il) təkcə `intersectionRatio` ilə heç vaxt 50 %-ə çatmazdı.

**Şəkil böyütmə**

- **FR-015c**: Avtomatik keçid ünvanı dəyişmir və ekran oxuyucusuna elan olunmur; istifadəçi
  keçidi hər ikisini edir (FR-009, US3). Elan atributu son keçidin kimdən gəldiyinə görə qoyulur.
- **FR-016**: Hadisə şəklinə klik onu modal görünüşdə böyütməlidir. Modal "×", fona klik və
  Escape ilə bağlanmalı, açıq olanda fokus onun içində qalmalı, bağlananda açan şəklə qayıtmalıdır.

**Skriptsiz, çap, dil**

- **FR-017**: Səhifənin ilk HTML cavabında bütün illərin bütün hadisələri (mətn və şəkillər)
  olmalıdır. JavaScript olmadan ardıcıl siyahı kimi oxunmalı, il oxunun nöqtələri lövbər linki
  kimi işləməli, skript tələb edən düymələr gizli olmalıdır.
- **FR-018**: Çapda bütün illər ardıcıl göstərilməli, il oxu, düymələr və dekorativ elementlər
  çıxarılmalıdır.
- **FR-019**: Bütün idarəetmə və elan mətnləri (düymə adları, böyütmə, bağlama)
  saytın az/en tərcümə fayllarından gəlməlidir.

**Görünüş**

- **FR-020**: Desktop (1728 kanvas) görünüşü Figma `1845:118772` ölçülərinə uyğun olmalıdır.
  Rənglər, şriftlər və boşluqlar kitin token-ləri ilə, 024-də qəbul edilmiş sapmalar
  saxlanılmaqla verilməlidir. Tablet və mobil görünüş prototipin responsiv qaydalarına uyğun
  olmalıdır (bax: Assumptions).
- **FR-021**: Əvəz olunan köhnə şaquli timeline və yan il naviqasiyası `history` layout-undan
  çıxarılmalıdır. Kodda istifadə olunmayan qalıq qalmamalıdır.

**Əhatə**

- **FR-022**: Yeni görünüş `history` layout-unun bütün səhifələrinə birdən tətbiq olunmalıdır:
  `/az/tarix` (legacy slug `tarixi` də), `/en/history`, `/az/tarix-copy`, `/en/history-copy`.
  Əsas səhifənin məzmunu timeline formasında deyilsə, 024 qaydası ilə `plain` göstərilir.
  Yarımçıq interaktiv görünüş yaranmamalıdır.
- **FR-022a**: Layout səhifənin **dili və slug-ı** ilə seçilməlidir. Bir dildəki slug başqa dilin
  layout-unu almamalıdır. Məsələn, az "Haqqımızda (Kopya)"-nın `history-copy` slug-ı Tarix
  layout-unu almır. `-2` kimi təsadüfi slug sonluqları reyestrə yazılmır. Onları redaktor
  düzəldir (quickstart §0).

### Key Entities

- **İl (Year)**: timeline-da unikal 4 rəqəmli il. Sırası cədvəldə ilk rast gəlinməsinə görədir. Bir
  və ya bir neçə hadisəni, eləcə də ona aid ilsiz "adi məzmunu" daşıyır. Ünvan lövbəri ilə
  eyniləşdirilir.
- **Hadisə (Event)**: 024 kontraktındakı kimi gün-ay (boş ola bilər), başlıq, mətn, şəkillər
  (0+) və vurğu. Bu spec yalnız onun göstərilməsini dəyişir.
- **Şəkil düzülüşü (Photo layout)**: hadisənin şəkillərinin kartdakı tərtibatı (`single`,
  `note`, `hero2`, `tall`). Default avtomatik seçilir (FR-004), redaktorun açıq işarəsi onu
  dəyişir (FR-004a).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Test mühitindəki "Tarix (Kopya)" məzmununun 100%-i (hər hadisənin başlığı, mətni və
  şəkli) yeni görünüşdə əlçatandır, həm il-il gəzəndə, həm də skriptsiz/çap rejimində. Yoxlama
  köhnə görünüşdəki hadisə siyahısı ilə tək-tək tutuşdurmaqla aparılır.
- **SC-002**: Ziyarətçi istənilən ilə ən çox 1 klik (oxda) və ya 1 link açılışı (`#il`) ilə çatır.
- **SC-003**: Desktop 1728 en-də kart, il oxu və düymələrin ölçüləri və mövqeləri Figma
  `1845:118772`-dən 2 px-dən çox fərqlənmir (brauzerdə element ölçüsü ilə Figma rəqəmi
  tutuşdurulur).
- **SC-004**: 390, 744, 1024 və 1728 px enlərində səhifədə üfüqi səhifə sürüşməsi yoxdur (il
  oxunun öz daxili sürüşməsi istisna).
- **SC-005**: Bütün funksiyalar yalnız klaviatura ilə əlçatandır. Brauzerin əlçatanlıq auditi
  (Chrome Lighthouse → Accessibility, manual icra) səhifədə 024 görünüşü ilə müqayisədə yeni xəta
  tapmır.
- **SC-006**: İl dəyişəndə yeni kart 300 ms-dən tez görünür. Səhifəni açmaq 024 görünüşü ilə
  müqayisədə hiss olunacaq qədər (100 ms-dən çox) yavaşlamır.
- **SC-007**: CMS-də timeline cədvəlinə yeni sətir əlavə edilir → kod dəyişikliyi və deploy
  olmadan növbəti səhifə açılışında il oxunda və kartda görünür.
- **SC-008**: Redaktor admin paneldə bir hadisəyə düzülüş işarəsi qoyur və saxlayır → işarə
  saxlandıqdan sonra itmir və saytda həmin hadisə seçilmiş düzülüşlə göstərilir. İşarəsiz
  hadisələrin düzülüşü dəyişmir.

## Assumptions

- Figma-da bu interaktiv dizaynın yalnız desktop frame-i məlum olub (`1845:118772`). Tablet və
  mobil görünüş üçün `tarix.html` prototipinin responsiv qaydaları (1279 / 1023 / 599 px) əsas
  götürülür. Plan mərhələsində Figma faylında tablet/mobil variant axtarılacaq. Tapılsa, prototipin
  yerinə o əsas olacaq.
- Avtomatik keçid intervalı 5 s (prototipdəki 6 s-dən qısaldılıb), swipe həddi 50 px prototipdən götürülüb.
- Ünvanda il yoxdursa, səhifə birinci ildən başlayır (ən son ildən yox).
- Səhifə məzmunu indiki kimi hər sorğuda CMS-dən oxunur (keşsiz). Yeni keşləmə yoxdur.
- Prototipdəki header, footer və sol menyu yalnız kontekst üçündür. Onlar 022/024-də artıq
  hazırdır və bu spec-ə daxil deyil.
- Yeni runtime asılılıq (karusel/lightbox kitabxanası) gözlənilmir. Lazım olsa, plan-da
  əsaslandırılmalıdır (Konstitusiya: yeni dependency yalnız spec vasitəsilə).
- Verifikasiya `npm run verify` (Node 22 də daxil olmaqla) və test mühitində real səhifə üzərindən
  aparılır.
