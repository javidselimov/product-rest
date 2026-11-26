# Feature Specification: Beynəlxalq maliyyə təşkilatları — admin paneldən idarə olunan məzmun növü

**Feature Branch**: `044-ifi-cooperation`

**Created**: 2026-11-13

**Status**: Implemented (2026-11-13, commit olunmayıb)

**Input**: "Figmada klik etdiyim yeri hazırlamaq istəyirəm, bunu speckit ilə işləyək, amma əvvəlcə köhnə versiyada necə implement olub ona baxaq,
sonra planlayaq. Admin paneldə və DB-da dəyişiklik etmək lazımdırsa nəzərə alaq. Sonda dokumentasiya da yazaq." Qərarlar (2026-11-13):
ayrıca məzmun növü, Figma məzmunu seed ilə yüklənir, bütün sənədlər yazılır. Dəyişiklik (2026-11-13, istifadəçi): səhifə açılanda **bütün kartlar bağlıdır** (əvvəl birinci açıq idi).

**Figma** (fayl "cbar website (Copy)", səhifə "International Cooperation"): məzmun frame-i `2189:3133` (sol menyu `2172:112179`, məzmun
`2172:112149`). Komponent seti `IFI accordion` `2172:3599` (səhifə "Components"): Org = DB / BVF / AİB / AYİB × State = Collapsed / Expanded.
Açıq nümunə: `2172:3489` (DB). Ölçülər: `contracts/ui-contract.md`.

**Köhnə versiya** (`product-host`, Maddə I.2): xüsusi controller, model və ya cədvəl yoxdur. Bu adi CMS səhifəsidir (`pages`, yeni bazada id 121,
az `beynelxalq-teskilatlarla-emekdasliq` "Beynəlxalq təşkilatlarla əməkdaşlıq", en `cooperation-with-international-organizations`),
`visitor/views/pages/index.php` məzmunu olduğu kimi çap edir. Məzmun axın mətnidir: hər təşkilat üçün `<p><strong>Ad</strong></p>`, paraqraflar,
siyahı, sayt linki. Loqo, ayrıca üzvlük ili və açılan bölmə yoxdur. Təşkilatlar: Dünya Bankı, BVF, Asiya İnkişaf Bankı, İsveçrə SECO.
Avropa Yenidənqurma və İnkişaf Bankı (Figma-da 4-cü kart) bu səhifədə yoxdur. BVF üzvlük tarixi az-da 18 sentyabr, en-də 18 October 1992.

**Hazırkı vəziyyət** (yeni stack, 2026-11-13): spec 043 "Beynəlxalq əməkdaşlıq" bölməsini `section-shell` şablonuna keçirib, bütün səhifələri adi
CMS məzmunu kimi göstərir. Səhifə 121 köhnə axın mətnini göstərir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ziyarətçi təşkilat kartlarını görür və açır (Priority: P1)

Ziyarətçi "Beynəlxalq əməkdaşlıq" bölməsində "Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq" səhifəsini açır: başlıq, giriş mətni,
"Əməkdaşlıq edilən təşkilatlar" başlığı və hər təşkilat üçün loqo, ad və üzvlük ili olan kart görür. Bütün kartlar bağlıdır. Kartı açanda
təşkilatın əsas missiyasını, Azərbaycanın üzv olduğu qurumların tarixlərini, əməkdaşlıq mətnini və saytının linkini oxuyur.

**Why this priority**: İctimai nəticə budur və Figma ilə uyğun olmalıdır.

**Independent Test**: Seed olunmuş bazada səhifəni az və en dilində 1728px endə açmaq, ölçüləri `contracts/ui-contract.md` ilə tutuşdurmaq.

**Acceptance Scenarios**:

1. **Given** dörd dərc olunmuş təşkilat, **When** səhifə açılır, **Then** başlıq, giriş, "Əməkdaşlıq edilən təşkilatlar" başlığı və dörd kart redaktorun sırası ilə görünür, hamısı bağlıdır.
2. **Given** bağlı kart, **When** ziyarətçi onun başlıq sətrinə klikləyir və ya klaviatura ilə açır, **Then** kart açılır, ox yuxarı dönür; təkrar klik onu bağlayır.
3. **Given** açıq kart, **Then** sıra ilə "Əsas missiya" qutusu, üzvlük giriş sətri, tarix kartları (tarix `DD.MM.YYYY` və qurum adı), mətn və yeni pəncərədə açılan sayt linki görünür.
4. **Given** başqa kart açılır, **Then** əvvəl açılmış kartlar açıq qalır (hər kart müstəqildir).
5. **Given** təşkilat yalnız bir dildə görünən işarələnib, **When** səhifə digər dildə açılır, **Then** həmin kart görünmür.
6. **Given** təşkilatlar var, **When** səhifə açılır, **Then** CMS məzmunundakı köhnə təşkilat siyahısı göstərilmir, yalnız ondan əvvəlki giriş mətni göstərilir.

---

### User Story 2 - Redaktor təşkilatları formadan idarə edir (Priority: P1)

Redaktor admin paneldə "Beynəlxalq maliyyə təşkilatları" bölməsini açır, təşkilatın loqosunu, adını, üzvlük ilini, missiyasını, üzvlük tarixlərini,
mətnini və saytını dəyişir və ya yeni təşkilat əlavə edir. HTML və başlıq sırası barədə bilmək lazım deyil.

**Why this priority**: Köhnə saytda bu məlumat yalnız axın mətnində idi. Strukturlu sahələr olmadan Figma görünüşü qurulmur.

**Independent Test**: Admin paneldə iki dildə yeni təşkilat yaratmaq, iki üzvlük tarixi əlavə etmək, dərc etmək və saytda yeni kartı görmək.

**Acceptance Scenarios**:

1. **Given** "Beynəlxalq maliyyə təşkilatları" bölməsi, **When** redaktor az və en sahələrini doldurub təşkilatı dərc edir, **Then** kart saytda hər iki dildə görünür.
2. **Given** təşkilat qaralamadadır və ya silinib, **When** ziyarətçi səhifəni açır, **Then** həmin kart görünmür.
3. **Given** təşkilatın üzvlük tarixləri, **When** redaktor tarix əlavə edir, silir və ya sırasını dəyişib saxlayır, **Then** saytda tarix kartları yeni siyahı və sıra ilə görünür.
4. **Given** bir neçə təşkilat, **When** redaktor sıra dəyərini dəyişir, **Then** kartlar saytda həmin sıra ilə düzülür.
5. **Given** məcburi sahə boşdur və ya il düzgün deyil, **When** redaktor saxlamağa çalışır, **Then** forma həmin sahəni göstərir və məlumat saxlanmır.
6. **Given** redaktor loqo yükləyir, **When** saxlayır, **Then** kartda loqo görünür; loqo olmayan kartda ad sola sürüşür, boş yer qalmır.

---

### User Story 3 - Figma məzmunu əl işi olmadan gəlir (Priority: P2)

Dəyişiklik yayımlananda Figma-dakı dörd təşkilat (Dünya Bankı Qrupu, Beynəlxalq Valyuta Fondu, Asiya İnkişaf Bankı, Avropa Yenidənqurma və
İnkişaf Bankı) mətn, il, tarix və linkləri ilə yeni bölmədə olur, səhifə Figma başlığını və giriş mətnini alır. Redaktor yalnız loqoları yükləyir.

**Why this priority**: Yayım günü səhifə boş qalmamalıdır, amma görünüş və idarə onsuz da yoxlana bilər.

**Independent Test**: Boş və köhnə məzmunlu bazaya seed-i tətbiq etmək, səhifəni yoxlamaq, sonra seed-i təkrar işlədib dublikat olmadığını görmək.

**Acceptance Scenarios**:

1. **Given** təşkilat cədvəli boşdur, **When** seed tətbiq olunur, **Then** dörd təşkilat az və en dilində dərc olunmuş olur, Dünya Bankının beş üzvlük tarixi ilə.
2. **Given** səhifənin başlığı hələ köhnə dəyərdədir ("Beynəlxalq təşkilatlarla əməkdaşlıq"), **When** seed tətbiq olunur, **Then** başlıq "Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq" olur və giriş mətni köhnə siyahıdan əvvələ əlavə olunur.
3. **Given** redaktor başlığı artıq dəyişib, **When** seed tətbiq olunur, **Then** səhifənin başlığı və mətni dəyişmir.
4. **Given** seed artıq tətbiq olunub və ya redaktor təşkilat əlavə edib, **When** seed yenidən işləyir, **Then** dublikat yaranmır.

---

### Edge Cases

- Təşkilat xidməti hələ deploy olunmayıb və ya xəta verir: səhifə açılır, CMS məzmunu tam (köhnə siyahı ilə) göstərilir, başlıq və kartlar görünmür.
- Dərc olunmuş təşkilat yoxdur: "Əməkdaşlıq edilən təşkilatlar" başlığı göstərilmir, CMS məzmunu tam göstərilir.
- Təşkilatın missiyası boşdur: "Əsas missiya" qutusu göstərilmir. Üzvlük tarixi yoxdur: giriş sətri və tarix şəbəkəsi göstərilmir. Sayt linki boşdur: link göstərilmir.
- Üzvlük ili boşdur: başlıqda "Üzvlük: …" yazısı göstərilmir.
- Uzun təşkilat adı: başlıqda sətir keçir, il və ox sağda qalır.
- CMS məzmununda `<p><strong>` başlıq sətri yoxdur: məzmun tam giriş sayılır.
- JavaScript yoxdur: kartlar yenə açılıb bağlanır, bütün mətn səhifədə oxunur.
- Çap: bütün kartlar açıq çap olunur.
- Kiçik ekranlar: tarix kartları 744px-də iki, 390px-də bir sütuna düşür; il başlıq sətrində adın altına keçir.
- "(Kopya)" səhifəsi (`…-copy` slug): eyni görünüşü alır, kartlar eyni bölmədən gəlir.
- Loqo media kitabxanasından silinmək istənir: fayl istifadədə olduğu üçün rədd edilir.
- Yeni təşkilat: üzvlük tarixləri ilk saxlamadan sonra əlavə olunur (KSM fotoları kimi).
- Bölmədəki digər səhifələr (Mərkəzi banklarla əməkdaşlıq və s.) dəyişmir.

## Requirements *(mandatory)*

### Functional Requirements

**Admin panel**

- **FR-001**: Redaktor təşkilatları ayrıca bölmədə siyahı kimi görə, yarada, redaktə edə və silə bilməlidir.
- **FR-002**: Hər təşkilatın az və en üçün adı, əsas missiyası, üzvlük giriş sətri və zəngin mətni olmalıdır. Ən azı bir dil məcburidir; dolu dildə ad boş ola bilməz, qalanları boş ola bilər.
- **FR-003**: Təşkilatın istəyə görə loqosu, sayt ünvanı və üzvlük ili (dörd rəqəm) olmalıdır.
- **FR-004**: Redaktor təşkilata üzvlük tarixləri əlavə edə, silə və sıralaya bilməlidir; hər tarixin günü və az/en qurum adı olur.
- **FR-005**: Redaktor təşkilatın sırasını, dərc statusunu və hər dildə görünüşünü təyin edə bilməlidir.
- **FR-006**: Bölməyə giriş və yazı mövcud rol-icazə qaydası ilə idarə olunmalı, dəyişikliklər audit jurnalına düşməlidir.
- **FR-007**: (çıxarıldı — `research.md` R1: panelin heç bir bölməsində konkurens yoxlaması yoxdur; son saxlayan qalib gəlir, audit jurnalı qalır.)
- **FR-008**: Təşkilatın loqosu media kitabxanasından silinməkdən qorunmalıdır.

**Sayt**

- **FR-009**: Səhifə Figma görünüşündə olmalıdır: bölmə şablonu (spec 043), başlıq, giriş, bölmə başlığı, accordion kartlar (`contracts/ui-contract.md`).
- **FR-010**: Başlıq, giriş mətni və fayllar CMS səhifəsindən, kartlar yeni bölmədən gəlməlidir.
- **FR-011**: Saytda yalnız dərc olunmuş, silinməmiş və cari dildə görünən təşkilatlar redaktorun sırası ilə göstərilməlidir.
- **FR-012**: Bütün kartlar bağlı gəlməlidir (2026-11-13 dəyişikliyi); kartlar bir-birindən asılı olmadan açılıb bağlanmalıdır.
- **FR-013**: Təşkilatlar göstərilərkən CMS məzmunu ilk təşkilat başlıq sətrindən (`<p><strong>…</strong></p>`) kəsilməlidir; təşkilat yoxdursa və ya alınmırsa məzmun tam göstərilir.
- **FR-014**: Sayt linki yeni pəncərədə açılmalı, mətni ünvanın host hissəsi olmalıdır.
- **FR-015**: Tarixlər `DD.MM.YYYY` formatında göstərilməlidir.
- **FR-016**: Kartlar klaviatura ilə açılmalı, açıq/bağlı vəziyyəti ekran oxuyucusuna bildirilməli, JavaScript olmadan işləməlidir.
- **FR-017**: Chrome mətnləri ("Əməkdaşlıq edilən təşkilatlar", "Üzvlük:", "Əsas missiya") az və en dilində olmalıdır, redaksiya mətni yalnız admin paneldən gəlməlidir.
- **FR-018**: Görünüş bu səhifənin az və en slug-larına (və `-copy` qaralamalarına) bağlıdır; bölmənin digər səhifələri adi CMS məzmunu qalır.

**Seed**

- **FR-019**: Figma-dakı dörd təşkilat, illəri, missiyaları, mətnləri, linkləri və Dünya Bankının beş üzvlük tarixi yayım zamanı yaradılmalıdır, yalnız təşkilat cədvəli boşdursa.
- **FR-020**: Seed səhifənin az başlığını Figma başlığına dəyişməli və giriş mətnini əlavə etməlidir, yalnız başlıq hələ köhnə dəyərdədirsə.
- **FR-021**: Loqolar seed edilmir; redaktor admin paneldən yükləyir.

### Key Entities *(include if feature involves data)*

- **Beynəlxalq maliyyə təşkilatı**: loqo, sayt ünvanı, üzvlük ili, sıra, dərc statusu, dillər üzrə görünüş; silinmə qeydi saxlanır.
- **Təşkilat tərcüməsi**: bir dil üçün ad, əsas missiya, üzvlük giriş sətri, zəngin mətn.
- **Üzvlük tarixi**: təşkilata bağlı, gün və sıra.
- **Üzvlük tarixi tərcüməsi**: bir dil üçün qurumun adı.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 1728px endə kart, tarix kartı, aralıqlar və tipoqrafiya `contracts/ui-contract.md` ilə 1px dəqiqliklə üst-üstə düşür.
- **SC-002**: Redaktor yeni təşkilatı üzvlük tarixləri ilə birlikdə 5 dəqiqədən az vaxtda dərc edə bilir, HTML yazmadan.
- **SC-003**: Yayımdan sonra dörd təşkilatın bütün mətni hər iki dildə əl işi olmadan görünür; redaktorun yeganə məcburi işi loqo yükləməkdir.
- **SC-004**: Admindəki dəyişiklik saytda növbəti səhifə açılışında görünür.
- **SC-005**: Təşkilat xidməti əlçatan olmayanda səhifə xətasız açılır və köhnə məzmunu göstərir.
- **SC-006**: Seed-in təkrar tətbiqi heç bir dublikat yaratmır və redaktor dəyişikliklərini əzmir.

## Assumptions

- Figma yalnız desktop görünüşünü verir; tablet və mobil üçün bölmə şablonunun mövcud qaydaları və Edge Cases-dəki sütun sayı tətbiq olunur.
- Seed-in az mətni Figma-dandır. En mətni Figma-da yoxdur: köhnə en məzmunundan götürülür, AYİB üçün tərcümə qaralamasıdır — redaktor yoxlamalıdır.
- DB-dən başqa təşkilatlar üçün Figma-da üzvlük tarixi şəbəkəsi yoxdur, seed onlara tarix əlavə etmir.
- SECO köhnə səhifədə var, Figma-da yoxdur: seed onu yaratmır, köhnə mətni CMS-də qalır (saytda kəsilir); redaktor istəsə panel ilə əlavə edir.
- Təşkilat mətnləri sayt axtarışında indekslənmir (bu spec-in əhatəsindən kənardır); səhifə öz CMS məzmunu ilə tapılır.
- Sol menyu adları və bölmənin digər səhifələri spec 043-dəki kimi redaktor işidir.
- Komponentlər ayrıca yayımlanır, sıra: `api-cbar-admin`, `api-cbar`, `web-cbar-new`; `web-cbar-admin-new` `api-cbar-admin`-dən sonra istənilən vaxt.
- Legacy URL yönləndirməsi lazım deyil: səhifənin ünvanı dəyişmir.
- İki redaktor eyni təşkilatı eyni anda redaktə edərsə son saxlanan qalır (paneldə ümumi qayda), dəyişikliklər audit jurnalında görünür.
