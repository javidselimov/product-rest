# Feature Specification: "Sual-cavab" (FAQ) — ayrıca məzmun növü, Figma redizaynı, en versiyası və bölmə bloku

**Feature Branch**: `051-faq-page`

**Created**: 2026-11-17

**Status**: Draft

**Input**: "yeni spec qurub bu figmadaki deyishiklikleri de etmek isteyirem … figmada secdiyim yerin yaninda olan diger menu hisseleri ucun
dezerde tutulmush dizaynlara bax … cbar ui kit istifade ederek … kohne saytin ve evvelki mentiqe de bax cunki biz burda miqrasiya etmeyi
planlayiriq." Sonra: "en variantini da duzeldek … faq ferqli hisselerde pul siyaseti ve valyuta ehtiyatlari ile bagli olaraq figmada iki
ferqli gosterilib … bunu admin panelden idare etmek cox rahat olmalidir editor cetinlik cekmesin."

Qərarlar (2026-11-17, istifadəçi):
1. **İki görünüş birlikdə.** Default görünüş A-dır (bütün mövzular akkordeon kartları). Mövzu seçiləndə B görünüşü açılır: seçilmiş mövzunun
   başlığı və suallarının düz siyahısı. Seçim ünvandadır, link paylaşıla bilər.
2. **Ayrıca "Sual-cavab" məzmun növü** (spec 038/044 kimi): admin paneldə öz bölməsi — mövzular, suallar, videolar. Köhnə səhifədəki 8 mövzu və
   bütün suallar seed ilə köçürülür. Redaktorun rahatlığı əsas tələbdir (bax User Story 6).
3. **en versiyası iki mərhələlidir** (2026-11-17, istifadəçi: "çox token gedəcəksə hələlik saxlayaq"): bu spec-də sistem tam ikidillidir (admin en
   sahələri, saytın en şablonu və etiketləri, `/en/faq`), seed yalnız 8 mövzunun en adını yazır. Sual/cavabların en tərcüməsi (~190 KB) **təxirə
   salınır** — ayrıca tapşırıq (redaktor və ya sonrakı spec). en FAQ səhifəsi en məzmun dolana qədər açılmır (bugünkü kimi yoxdur).
4. **Axtarış serverdədir**, JavaScript olmadan işləyir (spec 039 kimi).
5. **Videolar** kart kimi göstərilir, klik YouTube-da yeni tabda açır. Playlist linki göstərilmir (clarify 2026-11-17, Figma kimi).
6. **Bölmə səhifələrində FAQ bloku**: mövzu admin paneldə bir və ya bir neçə CMS səhifəsinə bağlanır (məs. "Pul siyasəti" mövzusu → "Pul siyasəti"
   səhifəsi, "Valyuta ehtiyatlarının idarə olunması" → valyuta ehtiyatları səhifəsi); həmin səhifənin altında mövzunun sualları və "Bütün suallar"
   linki (`…?topic=…`, B görünüşü) göstərilir.

Agentin qəbul etdiyi defoltlar (istifadəçi düzəldə bilər):
7. FAQ səhifəsində sol menyu yoxdur (Figma məzmunu 1320 px tam endədir); breadcrumb "Ana səhifə › Sual-cavab" və paylaşma düymələri var.
8. Axtarış sualın həm mətnində, həm cavabında axtarır; ilk açılışda bütün mövzular və suallar bağlıdır.
9. (Clarify ilə əvəz olundu) Bölmə bloku yalnız keçid kartıdır — bax Clarifications.

## Clarifications

### Session 2026-11-17

- Q: Mövzu seçimi (select) A görünüşündə də olsun? → A: Yox, yalnız B-də (Figma kimi). A-da axtarış tam endədir; B-yə açıq mövzu kartının
  içindəki "Ayrıca aç" linki, bölmə səhifəsindəki keçid kartı və paylaşılan `?topic=` ünvanı aparır; B-dəki seçimdə "Bütün mövzular" A-ya qaytarır.
- Q: Footer-ə "Sual-cavab" linki əlavə olunsun? → A: Bəli, Figma kimi — footer-in "Naviqasiya" sütununda "Nəşrlər və tədqiqatlar"-dan sonra; en-də
  yalnız en FAQ səhifəsi olanda ("FAQ").
- Q: Hər sualın öz linki olsun? → A: Bəli, görünməz anchor (`#sual-<id>`), vizual düymə yoxdur. Fraqment serverə getmir: brauzerin öz
  "ancestor details reveal" davranışı mövzunu açır, kiçik client leaf sualın özünü açıb ona sürüşdürür (JS-siz brauzerdə ən azı mövzu açılır).
- Q: "Video sual-cavab" blokunda playlist linki harada olsun? → A: Göstərilməsin — Figma kimi yalnız video kartları; playlist ayarı admin-də, API-də
  və seed-də yaranmır. Köhnə səhifənin "Playlist-ə keçid" linki ləğv edilir (eyni videoya aparırdı).
- Q: Bölmə səhifəsinin altındakı FAQ bloku necə görünsün? → A: Yalnız keçid kartı — "<Mövzu> üzrə N sual-cavab" + "Bax →", B görünüşünə aparır;
  suallar bölmə səhifəsində göstərilmir.

**Figma** (fayl "cbar website (Copy)", səhifə "FAQ" `2631:114021`). Hər iki bölmənin breadcrumb-u "Ana səhifə › Sual-cavab"-dır: bunlar bir
səhifənin iki vəziyyətidir.

| Bölmə | Desktop 1728 | Tablet 744 | iPhone 390 |
|---|---|---|---|
| A — "Sual Cavab - Pul siyasəti" `2657:126157` (bütün mövzular akkordeonu) | `2642:3479` | `2646:5395` | `2646:6436` |
| B — "Valyuta ehtiyatları" `2657:123087` (mövzu seçimi + düz siyahı) | `2647:6937` | `2647:7710` | `2647:8476` |

Komponentlər: "Sual-cavab — komponentlər" `2633:2298` — `FAQ / Item` `2633:2299` (Open=No/Yes: sual 17 px — mobil 16, açıqda qalın və əsas mavi;
cavab 16 px; alt xətt), `FAQ / Mövzu · …` səkkiz mövzu üçün (`3516:5975`, `3516:6033`, `3516:6050`, `3516:6067`, `3516:6084`, `3516:6101`,
`3516:6118`, `3516:6135`; Open=No/Yes: başlıq 18 px — mobil 17, "N sual" sayı, caret; açıqda "1. …" nömrələnmiş suallar). Video kartı: 424 × 239
önizləmə, 56 px play, başlıq 16/600. Gizli köhnə kadrlar `2633:2302`, `2636:3866` və "moodboard" `2660:138954` əhatədən kənardır. B kadrındakı
"Hamısı" + mövzu çipləri qatı (`2647:6952`) gizlidir — çiplər qurulmur. Bölmə səhifəsindəki FAQ bloku üçün Figma kadrı yoxdur: o, `FAQ / Item`
komponentindən qurulur. Ölçülər plan mərhələsində `contracts/ui-contract.md`-yə yazılır.

**Köhnə vəziyyət** (test API `api-cbar-test.cbar.az`, 2026-11-17). Köhnə Yii2 saytda FAQ üçün xüsusi kod yoxdur: səhifə ümumi CMS şablonudur
(`visitor/views/pages/index.php`, ünvan `page-<id>/<slug>`), bütün məntiq redaktorun HTML-indədir. Canlı cbar.az-da EN FAQ yoxdur
(`page-131?language=en` orada başqa səhifəni açır — canlı və test bazasında id-lər fərqlidir).

| id (test) | az başlıq (slug) | en | Məzmun |
|---|---|---|---|
| 131 | Sual − cavab (`sual-cavab`), ağacın kök səviyyəsində | **yoxdur** | 8 mövzu akkordeonu (`<details>`), hər birində `<ol><li><strong>Sual</strong></li></ol>` + cavab; sonda "Video sual-cavab" başlığı, bir YouTube videosu, playlist linki |
| 477 | Sual − cavab (Kopya) — 131-in alt səhifəsi | — | redaktor qaralaması |
| 6 | Pul siyasəti (`pul-siyaseti`), kök bölmə | var | bölmə səhifəsi |
| — | "Valyuta ehtiyatları" səhifəsi | — | test bazasında yoxdur |

Mövzular və sual sayları (az): Pul siyasəti 23, Valyuta ehtiyatlarının idarə olunması 6, Kredit təşkilatlarının fəaliyyəti 39, Ödəniş xidmətləri və
ödəniş sistemləri 29, Kapital bazarları ~18, Sığorta ~83, Milli pul nişanları 20, Mərkəzi Banka müraciət və qəbul məsələlərinə dair 6 (dəqiq saylar
plan mərhələsində sabitlənir). Cavablarda paraqraf, siyahı, alt siyahı, cədvəl, şəkil və link var.

Yeni saytda bu səhifə üçün xüsusi heç nə yoxdur: o, adi CMS mətni kimi göstərilir; admin paneldə redaktor 200+ sualı bir böyük rich-text sahəsində
akkordeon və nömrəli siyahı işarələməsi ilə saxlamalıdır.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ziyarətçi mövzunu açıb sualın cavabını oxuyur (Priority: P1)

Ziyarətçi "Sual-cavab" səhifəsini açır: breadcrumb, paylaşma düymələri, "Sual-cavab" başlığı, tam enli axtarış sahəsi və mövzu kartları
(ad + "N sual"). Mövzu kartını açır, içində nömrələnmiş sualları görür, suala klik edib cavabı oxuyur.

**Why this priority**: Səhifənin əsas işidir; köhnə saytdakı bütün suallar əlçatan qalmalıdır.

**Independent Test**: Seed olunmuş bazada səhifəni üç endə açmaq, Figma `2642:3479` / `2646:5395` / `2646:6436` ilə tutuşdurmaq; mövzu və sual
saylarını köhnə HTML ilə tutuşdurmaq.

**Acceptance Scenarios**:

1. **Given** seed tətbiq olunub, **When** ziyarətçi `/az/sual-cavab` açır, **Then** səkkiz mövzu kartı admin sırası ilə, hər birində ad və sual sayı ("23 sual") göstərilir; hamısı bağlıdır.
2. **When** ziyarətçi "Pul siyasəti" kartını açır, **Then** 23 sual "1. Pul siyasəti nədir?" formasında nömrələnmiş, bağlı akkordeon kimi görünür.
3. **When** ziyarətçi suala klik edir, **Then** sual Figma açıq vəziyyətində (qalın, əsas mavi) göstərilir və cavab bütün işarələməsi ilə (paraqraf, siyahı, cədvəl, link, şəkil) açılır.
4. **Given** JavaScript işləmir, **Then** mövzu və sual akkordeonları yenə açılıb bağlanır; çapda açılmış məzmun görünür.
5. **Given** klaviatura və ekran oxuyucusu, **Then** hər mövzu və sual Tab ilə fokuslanır, Enter/Space ilə açılır, açıq/bağlı vəziyyət bildirilir.
6. **Given** admin paneldə deaktiv edilmiş mövzu və ya sual, **Then** saytda görünmür, nömrələmə və say yalnız aktivləri sayır.
7. **Given** ziyarətçi `/az/sual-cavab#sual-101` linki ilə gəlir, **Then** həmin sualın mövzusu və sualın özü açıq olur və səhifə ona sürüşür; link
   `?q=`/`?topic=` ilə birlikdə də işləyir (sual həmin görünüşdə varsa).

---

### User Story 2 - Ziyarətçi sualını axtarışla tapır (Priority: P1)

Ziyarətçi axtarış sahəsinə "inflyasiya", "REPO" və ya "məzənnə" yazıb göndərir; yalnız uyğun sualları olan mövzular qalır, uyğun suallar açıq gəlir.

**Why this priority**: 200+ sualda axtarışsız lazım olanı tapmaq çətindir; Figma axtarışı səhifənin başında verir.

**Independent Test**: `?q=` ilə səhifəni açmaq; nəticələrin sualda və cavabda uyğunluğu tapdığını, böyük/kiçik hərf və İ/ı fərqinin nəzərə
alınmadığını yoxlamaq; JavaScript-siz göndərmək.

**Acceptance Scenarios**:

1. **When** ziyarətçi "REPO" axtarır, **Then** yalnız mətnində və ya cavabında "REPO" olan suallar qalır; onların mövzusu açıq, sayı uyğun sualların sayıdır, uyğun suallar açıqdır və öz nömrələrini saxlayır.
2. **When** "İNFLYASİYA" və ya "inflyasiya" axtarılır, **Then** nəticə eynidir (İ/i, I/ı və böyük/kiçik hərf fərqi nəzərə alınmır).
3. **Given** heç bir sual uyğun deyil, **Then** boş vəziyyət mesajı və axtarışı təmizləmək linki göstərilir; video bloku qalır.
4. **Given** axtarış boşdur və ya yalnız boşluqdur, **Then** səhifə ilk vəziyyətdədir.
5. **Given** JavaScript işləmir, **Then** forma göndərilir, nəticə serverdən gəlir, ünvan `?q=` daşıyır.

---

### User Story 3 - Ziyarətçi bir mövzunu seçir (Priority: P1)

Ziyarətçi açıq "Valyuta ehtiyatlarının idarə olunması" kartındakı "Ayrıca aç" linkinə (və ya bölmə blokunun linkinə) klik edir: səhifə B görünüşünə
keçir — axtarışın yanında mövzu seçimi, mövzunun başlığı və altında nömrələnmiş sualların düz akkordeon siyahısı. B-də seçimlə başqa mövzuya keçir.

**Why this priority**: Figma B kadrıdır və bölmə səhifələrindəki blokun "Bütün suallar" linki buraya aparır (User Story 5).

**Independent Test**: Seçimi dəyişmək; ünvanın mövzunu daşıdığını, linkin həmin görünüşü açdığını, "Bütün mövzular"ın A-ya qaytardığını yoxlamaq;
JavaScript-siz.

**Acceptance Scenarios**:

1. **When** ziyarətçi açıq mövzu kartında "Ayrıca aç"-a klik edir, **Then** yalnız həmin mövzunun başlığı və sualları B kadrı (`2647:6937`) kimi göstərilir; ünvan mövzunu daşıyır.
2. **When** B-də seçimdən başqa mövzu və ya "Bütün mövzular" seçilir, **Then** həmin mövzunun B görünüşü və ya A görünüşü açılır.
6. **Given** A görünüşü, **Then** mövzu seçimi göstərilmir; axtarış sahəsi Figma A kimi tam endədir.
3. **Given** mövzu və axtarış birlikdə, **Then** hər iki şərt tətbiq olunur; uyğunluq yoxdursa boş vəziyyət.
4. **Given** ünvandakı mövzu tanınmır və ya deaktivdir, **Then** A görünüşü göstərilir, xəta yoxdur.
5. **Given** JavaScript işləmir, **Then** seçim bir düymə ilə göndərilir; JavaScript varsa seçim dərhal tətbiq olunur.

---

### User Story 4 - İngiliscə ziyarətçi FAQ-ı oxuyur (Priority: P3)

Redaktor en sualları doldurub FAQ səhifəsinin en tabını (başlıq, slug `faq`) əlavə edəndən sonra ziyarətçi `/en/faq` açır: eyni şablon ingiliscə
interfeys etiketləri və en məzmunla açılır. Bu spec-də en məzmun seed edilmir (qərar 3) — hekayə sistemin hazır olmasını yoxlayır.

**Why this priority**: Köhnə saytda en FAQ yox idi; en tərcümə təxirə salınıb, amma sonra kod dəyişikliyi tələb etməməlidir.

**Independent Test**: Testdə (MSW fikstürü) və ya admin paneldə bir mövzuya en sual əlavə edib en səhifəni açmaq; dil dəyişdiricisini yoxlamaq.

**Acceptance Scenarios**:

1. **Given** en səhifə tərcüməsi və en sualları var, **When** ziyarətçi `/en/faq` açır, **Then** en mövzular, suallar və cavablar en etiketləri ilə göstərilir.
2. **When** ziyarətçi az səhifədə dili en-ə dəyişir, **Then** en FAQ səhifəsi açılır (və əksinə), səhifə A görünüşündə açılır.
3. **Given** sual yalnız az dilində yazılıb, **Then** o, en səhifədə görünmür və en sayına daxil deyil; en-də sualı olmayan mövzu göstərilmir.
4. **Given** en səhifə tərcüməsi yoxdur (seed-dən sonrakı vəziyyət), **Then** `/en/faq` bugünkü kimi "tapılmadı"dır, az↔en dəyişdiricisi en-ə link vermir — boş en səhifə yayılmır.
5. **Given** en axtarış ("inflation"), **Then** en mətnlərdə axtarılır.

---

### User Story 5 - Ziyarətçi bölmə səhifəsindən mövzunun suallarına keçir (Priority: P2)

Ziyarətçi "Pul siyasəti" bölmə səhifəsini açır; səhifənin mətnindən sonra keçid kartı göstərilir: "Pul siyasəti üzrə 23 sual-cavab" və "Bax →".
Kart FAQ səhifəsinin həmin mövzu görünüşünə (B) aparır. Suallar bölmə səhifəsində göstərilmir.

**Why this priority**: Figma-da FAQ "Pul siyasəti" və "Valyuta ehtiyatları" kontekstində göstərilib; mövzunun öz səhifəsindən onun suallarına bir kliklə çatmaq lazımdır.

**Independent Test**: Admin paneldə mövzunu səhifəyə bağlamaq, səhifəni açmaq, bloku və linki yoxlamaq; bağlantını silmək — blok yox olur.

**Acceptance Scenarios**:

1. **Given** "Pul siyasəti" mövzusu "Pul siyasəti" səhifəsinə bağlıdır, **When** ziyarətçi həmin səhifəni açır, **Then** səhifə mətnindən sonra bir keçid kartı (mövzu adı + görünən sual sayı + "Bax →") göstərilir; bütün kart bir linkdir.
2. **When** kart klik edilir, **Then** `/az/sual-cavab?topic=…` B görünüşü açılır.
3. **Given** bir səhifəyə iki mövzu bağlıdır, **Then** iki kart admin sırasında göstərilir.
4. **Given** heç bir aktiv mövzu səhifəyə bağlı deyil və ya mövzunun o dildə görünən sualı yoxdur, **Then** kart göstərilmir; səhifə əvvəlki kimidir.

---

### User Story 6 - Redaktor FAQ-ı admin paneldə rahat idarə edir (Priority: P1)

Redaktor admin paneldə "Sual-cavab" bölməsini açır: mövzular siyahısı (sual sayı, aktivlik, bağlı səhifələr), mövzunun içində sualların siyahısı,
ayrıca "Videolar" siyahısı. Yeni sual yazır, sırasını sürüşdürüb dəyişir, sualı başqa mövzuya keçirir, deaktiv edir — heç bir HTML işarələməsi
bilmədən.

**Why this priority**: İstifadəçinin açıq tələbidir: "redaktor çətinlik çəkməsin". Köhnə üsulda bir böyük mətndə səhv işarələmə saytı pozur.

**Independent Test**: Redaktor rolu ilə: mövzu yaratmaq, iki dildə sual + cavab yazmaq, sıranı dəyişmək, sualı başqa mövzuya keçirmək, deaktiv
etmək, video əlavə etmək, mövzunu səhifəyə bağlamaq; hər addımdan sonra saytda nəticəni görmək.

**Acceptance Scenarios**:

1. **Given** redaktor "Sual-cavab" bölməsini açır, **Then** mövzular sayt sırası ilə, hər birinin az/en adı, aktiv sual sayı, aktivliyi və bağlı səhifələri görünür; mövzuya klik onun suallarını açır.
2. **When** redaktor mövzu və ya sualın sırasını sürüşdürüb buraxır (və ya klaviatura ilə yuxarı/aşağı düymələri), **Then** yeni sıra dərhal saxlanır və saytdakı nömrələmə ona uyğun dəyişir.
3. **When** redaktor sual yaradır, **Then** forma az və en sahələrini yan-yana (və ya tablarla) göstərir: sual mətni (adi sətir), cavab (rich-text redaktoru: qalın, siyahı, link, cədvəl, şəkil), mövzu seçimi, aktivlik; boş en sahəsi icazəlidir və siyahıda "en yoxdur" nişanı ilə görünür.
4. **When** redaktor sualın mövzusunu dəyişir, **Then** sual yeni mövzunun sonuna keçir, hər iki mövzunun sayı yenilənir.
5. **When** redaktor sualların siyahısında axtarış edir, **Then** mövzu daxilində və ya bütün mövzularda sual mətni ilə süzülür.
6. **When** redaktor video əlavə edir, **Then** YouTube linki yoxlanır, önizləmə şəkli formada dərhal görünür, az/en başlıq və sıra saxlanır; səhv link aydın Azərbaycanca xəta ilə rədd edilir.
7. **When** redaktor mövzuya CMS səhifəsi bağlayır, **Then** səhifə axtarışlı seçimdən (başlıqla) seçilir və həmin səhifədə blok görünür; səhifə formasında "Bu səhifədə FAQ bloku var" qeydi ilə mövzuya keçid görünür (spec 046 `managed-sections` kimi).
8. **Given** redaktor yadda saxlanmamış dəyişikliklə formadan çıxmaq istəyir, **Then** xəbərdarlıq görür.
9. **Given** silmə, **Then** təsdiq soruşulur; silinən mövzunun sualları varsa, silmədən əvvəl bu deyilir (sualları ilə birlikdə silinir və ya əvvəl köçürülməlidir — plan seçir).
10. **Given** hər dəyişiklik, **Then** audit jurnalına kim, nə vaxt, nəyi dəyişdi yazılır.
11. **Given** redaktor köhnə "Sual − cavab" CMS səhifəsini açır, **Then** səhifə formasında FAQ bölməsinə keçid görünür, səhifənin köhnə mətni FAQ olduğu müddətdə saytda göstərilmir.

### Edge Cases

- Heç bir aktiv mövzu yoxdur (və ya API əlçatan deyil): FAQ səhifəsi CMS səhifəsinin öz mətnini göstərir (köhnə akkordeonlar adi məzmun kimi) — məlumat itmir.
- Mövzunun o dildə aktiv sualı yoxdur: mövzu kartı göstərilmir.
- Sualın o dildə cavabı boşdur, sualı doludur: sual göstərilmir (yarımçıq məzmun yayılmır); admin siyahısında xəbərdarlıq nişanı.
- Cavab HTML-i saytın digər CMS mətnləri kimi təhlükəsizlik süzgəcindən keçir (skript, `on*`, `javascript:` atılır).
- Seed köhnə məzmunu bölə bilmədiyi sual (məs. cavabın öz nömrəli siyahısı) sual sayılmır; seed köçürülmüş sual saylarını yoxlayır.
- Seed yalnız FAQ cədvəlləri boşdursa işləyir (təkrar işlədilə bilir, redaktorun işini ezmir); səhifə tapılmırsa (slug fərqli) səhifəyə toxunmur.
- Mövzu adı dəyişir: ünvan açarı (slug) dəyişmir, köhnə linklər işləyir; açar admin paneldə ayrıca, avtomatik yaradılır.
- Bağlı CMS səhifəsi silinir və ya gizlədilir: bağlantı blok göstərmir, mövzu FAQ-da qalır.
- Uzun cədvəllər mobil ekranda səhifəni üfüqi sürüşdürmür: cədvəl öz qabında sürüşür.
- Axtarış sorğusu çox uzundur və ya xüsusi simvollar daşıyır: təhlükəsiz emal olunur.
- "(Kopya)" qaralaması (477): FAQ şablonu ona tətbiq olunmur; menyularda adi qaydalarla.

## Requirements *(mandatory)*

### Functional Requirements

**Məzmun növü və API**

- **FR-001**: Sistem FAQ-ı ayrıca məzmun kimi saxlamalıdır: **mövzu** (az/en ad, dəyişməz ünvan açarı, sıra, aktivlik, bağlı CMS səhifələri),
  **sual** (mövzu, az/en sual mətni, az/en cavab — formatlı mətn, sıra, aktivlik), **video** (YouTube linki, az/en başlıq, sıra, aktivlik).
  Sxem mövcud cədvəllərə toxunmur (yeni cədvəllər, append-only migration, hər iki `Cbar.Domain` nüsxəsi eyni).
- **FR-002**: İctimai API dərc olunmuş FAQ-ı dilə görə qaytarmalıdır: aktiv mövzular sırası ilə, hər birinin həmin dildə dolu aktiv sualları sırası
  ilə, aktiv videolar; bir səhifəyə bağlı mövzular üçün də sorğu olmalıdır. Endpoint-lər spec-first qaydası ilə (OpenAPI əvvəl) əlavə olunur.
- **FR-003**: Admin API mövzu, sual və video üçün tam CRUD, sıra dəyişmə (toplu), sualın mövzusunu dəyişmə və mövzu–səhifə bağlantısını verməlidir;
  bütün xətalar `problem+json`, bütün dəyişikliklər audit jurnalına yazılır.

**Admin panel (redaktor rahatlığı)**

- **FR-004**: Admin paneldə sayt sırasına uyğun yerdə "Sual-cavab" bölməsi olmalıdır (menyu qrupu plan mərhələsində, spec 046 qaydası ilə); içində
  Mövzular → Suallar və Videolar.
- **FR-005**: Sıra sürüşdür-burax ilə və klaviatura ilə (yuxarı/aşağı) dəyişməli, dərhal saxlanmalıdır.
- **FR-006**: Sual forması az və en sahələrini bir ekranda verməli; cavab üçün saytın digər rich-text redaktoru (cədvəl, link, siyahı, şəkil) işlədilməli;
  en boşluğu siyahıda nişanla görünməlidir; yadda saxlanmamış dəyişiklik xəbərdarlığı olmalıdır.
- **FR-007**: Siyahılarda sual sayı, aktivlik, dil tamlığı və axtarış olmalıdır; sualın mövzusu formada dəyişdirilə bilməlidir.
- **FR-008**: Video formasında link yoxlanmalı və önizləmə göstərilməlidir.
- **FR-009**: Mövzu formasında CMS səhifələri axtarışlı seçimlə bağlanmalı; CMS səhifə formasında bağlı FAQ mövzularına keçid görünməlidir (FAQ
  səhifəsinin özündə — FAQ bölməsinə keçid).
- **FR-010**: Bütün admin mətnləri az/en i18n-dədir, kit komponentləri ilə; menyu dəyişikliyi CMS təlimatlarında eyni dəyişiklikdə yenilənir.

**Sayt — FAQ səhifəsi**

- **FR-011**: FAQ səhifəsi (az `sual-cavab`, en `faq`) breadcrumb, paylaşma, başlıq, axtarış, mövzular (B-də mövzu seçimi), video bloku ilə göstərilir; sol
  menyu yoxdur. Başlıq və ünvan CMS səhifəsindəndir, mövzu və suallar FAQ məzmunundan. FAQ məzmunu olduğu müddətdə səhifənin köhnə mətni göstərilmir.
- **FR-012**: A görünüşü (default): tam enli axtarış (mövzu seçimi yoxdur), mövzu kartları (ad, "N sual", caret), açılanda nömrələnmiş sual
  akkordeonları və "Ayrıca aç" linki (`?topic=`) — Figma `2642:3479`, `FAQ / Mövzu`, `FAQ / Item`.
- **FR-013**: B görünüşü: axtarış + mövzu seçimi ("Bütün mövzular" + mövzular), seçilmiş mövzunun başlığı və sualları düz akkordeon siyahısı — Figma
  `2647:6937`. Seçim ünvandadır (dəyişməz açar); tanınmayan dəyər A-ya düşür.
- **FR-014**: Axtarış serverdə, sual və cavab mətnində, böyük/kiçik hərf və İ/ı qatlanması ilə; uyğun suallar və mövzuları açıq, sayı uyğunların sayı;
  nəticə yoxdursa boş vəziyyət və təmizləmə linki.
- **FR-015**: Video bloku aktiv videolardan kart qurur (önizləmə, play, başlıq), klik YouTube-da yeni tabda; video yoxdursa blok yoxdur. Playlist linki
  göstərilmir və saxlanmır (köhnə "Playlist-ə keçid" ləğv edilir — clarify 2026-11-17, Maddə I.3 açıq qərarı).
- **FR-016**: Akkordeon, axtarış, seçim JavaScript olmadan işləməli, klaviatura və ekran oxuyucusu üçün düzgün semantikalı olmalıdır.
- **FR-016a**: Hər sualın sabit fraqment id-si (`sual-<id>`, hər iki dildə eyni) olmalıdır; fraqmentlə gələndə sual və mövzusu açılır və görünən sahəyə
  sürüşür. Vizual "link kopyala" elementi yoxdur.

**Sayt — bölmə bloku və en**

- **FR-017**: Bir CMS səhifəsinə bağlı hər görünən mövzu üçün səhifə mətnindən sonra keçid kartı göstərilir: mövzu adı, görünən sual sayı, "Bax →";
  kart B görünüşünə (`?topic=`) aparır. Suallar bölmə səhifəsində göstərilmir. Kartı olmayan səhifələr dəyişmir.
- **FR-017a**: Footer-in "Naviqasiya" sütununda "Nəşrlər və tədqiqatlar"-dan sonra FAQ səhifəsinə link olmalıdır (Figma footer `3613:5734`); başlıq
  və ünvan CMS səhifəsindən, en-də yalnız en FAQ səhifəsi mövcud olanda.
- **FR-018**: en: sayt və admin tam ikidillidir (en sahələri, en şablonu, interfeys etiketləri az/en, dil dəyişdiricisi az↔en FAQ-ı bağlayır);
  redaksiya mətni yalnız məlumatdandır. en FAQ səhifəsi en səhifə tərcüməsi (redaktor əlavə edir) olanda açılır; seed onu yaratmır.

**Miqrasiya, seed, keçidlər**

- **FR-019**: Seed köhnə FAQ səhifəsinin (slug `sual-cavab`) məzmunundan 8 mövzunu, bütün sualları (sıra və mətn olduğu kimi, az) və videonu köçürür,
  8 mövzunun en adını yazır, "Pul siyasəti" mövzusunu "Pul siyasəti" səhifəsinə bağlayır. Seed yalnız FAQ cədvəlləri boşdursa işləyir, səhifəni slug
  ilə tapır (id ilə yox), mövcud cədvəllərdə yalnız az başlığı köhnə ("Sual − cavab") olduqda "Sual-cavab" edir. Sual/cavabların en tərcüməsi bu
  spec-ə daxil deyil (qərar 3).
- **FR-020**: Köhnə ünvan (`page-131/sual-cavab`, `?language=` ilə və ya dil prefiksi ilə) bir daimi yönləndirmə ilə yeni FAQ ünvanına çatır.
- **FR-021**: Görünüş CBAR UI kit komponentləri və semantik token-larla, dark mode-da düzgün; spec 049 reveal qaydası (iç-içə yox); spec 032 sabitlər
  standartı; layihənin frontend skill qaydası (`senior-front`, `frontendpatterns`, `frontend-standards`, `ui-kit-usage`).
- **FR-022**: Redaktor təlimatları (`web-cbar-new/docs/faq-cms-guide.md`, `dokumentasiyalar/` idarəetmə təlimatı), kök CLAUDE.md,
  `business_logic/new_business_logic.md`, hər iki OpenAPI spec eyni dəyişiklikdə yenilənir.

### Key Entities *(include if feature involves data)*

- **FAQ mövzusu**: dəyişməz ünvan açarı, az/en ad, sıra, aktivlik, bağlı CMS səhifələri (0..n).
- **FAQ sualı**: mövzu, sıra, aktivlik, az/en sual mətni, az/en cavab (formatlı mətn). Nömrə saytda sıradan hesablanır, saxlanmır.
- **FAQ videosu**: YouTube linki (video identifikatoru ondan), az/en başlıq, sıra, aktivlik.
- **CMS səhifəsi** (mövcud): FAQ səhifəsi (başlıq, ünvan, en tərcümə) və mövzu bloku göstərən bölmə səhifələri.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A və B görünüşləri, en səhifə və bölmə bloku üç endə (1728, 744, 390) açılır; ölçülər `contracts/ui-contract.md`-dən 2 px-dən çox fərqlənmir;
  səhifə səviyyəsində üfüqi sürüşmə yoxdur.
- **SC-002**: Köhnə məzmundakı bütün suallar köçürülüb — itən sual sayı 0; hər mövzunun sayı köhnə HTML-dəki sual sətirlərinin sayı ilə eynidir; köhnə
  cavablardakı linklərin, cədvəllərin və şəkillərin hamısı qalır.
- **SC-003**: en məzmun əlavə olunanda (test fikstürü ilə yoxlanır) en FAQ kod dəyişikliyi olmadan işləyir; seed-dən sonra boş en səhifə yayılmır.
- **SC-004**: Redaktor yeni sualı (iki dildə) 2 dəqiqədən az vaxtda, HTML bilmədən əlavə edir və o, səhifəni yeniləyən kimi saytda görünür.
- **SC-005**: Redaktor sualın sırasını bir hərəkətlə dəyişir; saytdakı nömrələmə avtomatik yenilənir.
- **SC-006**: Ziyarətçi tanınmış açar sözlə bir göndərişlə uyğun sualı tapır; mövzu linki paylaşılanda eyni görünüş açılır.
- **SC-007**: Səhifə və blok JavaScript söndürüləndə bütün funksiyaları ilə işləyir.
- **SC-008**: Köhnə ünvan bir yönləndirmə ilə yeni səhifəyə çatır.
- **SC-009**: `api-cbar` və `api-cbar-admin` build olunur, yeni endpoint-lər OpenAPI ilə üst-üstə düşür (route-diff təmiz); hər iki frontendin
  `npm run verify`-ı keçir.

## Assumptions

- Test mühitindəki FAQ məzmunu (2026-11-17) produksiyadakı ilə eyni quruluşdadır; canlı bazada id-lər fərqli olduğu üçün seed səhifəni slug ilə tapır.
  Plan mərhələsində dump ilə tutuşdurulur.
- Sual/cavabların en tərcüməsi təxirə salınıb (qərar 3); onu redaktor admin paneldən və ya sonrakı spec (generatorun `faq-en.json`-u ilə yeni seed)
  edir. Admin "Suallar" siyahısındakı "EN yoxdur" nişanı və filtri bu işi izləməyə kömək edir.
- Video başlığı köhnə məzmunda yoxdur; seed başlığı YouTube-dakı adla və ya bölmə başlığı ilə doldurur, redaktor sonra düzəldir.
- "Valyuta ehtiyatları" səhifəsi test bazasında yoxdur; mövzu səhifə yarananda admin paneldən bağlanır. Seed yalnız "Pul siyasəti" bağlantısını qurur.
- Deploy ardıcıllığı: `api-cbar-admin` (migration + seed) → `api-cbar` → `web-cbar-admin-new` və `web-cbar-new`.
- Footer-in "Əlaqə" bloku və "Onlayn müraciət" / "Sorğu platforması" düymələri bu spec-də dəyişmir; yalnız naviqasiyaya "Sual-cavab" əlavə olunur (FR-017a).
