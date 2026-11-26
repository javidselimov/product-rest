# Feature Specification: Mərkəzi banklarla əməkdaşlıq — Anlaşma Memorandumları cədvəli

**Feature Branch**: `045-central-banks-cooperation`

**Created**: 2026-11-13

**Status**: Implemented

**Input**: "Figmada olan səhifəni düzəltmək istəyirəm, speckit ilə planlayaq, sualların varsa ver və o səhifəni hazırlayaq. Admin paneldə və DB-da
işlər görmək lazımdırsa onu da nəzərə alaq." Qərarlar (2026-11-13, istifadəçi): memorandumlar ayrıca məzmun növüdür (panel bölməsi), tarix yalnız
ildir, çeşidləmə iki seçimlidir (əvvəlcə yenilər / əvvəlcə köhnələr), Figma-dakı 28 sətir az və en dilində seed ilə yüklənir.

**Figma** (fayl "cbar website (Copy)", səhifə "International Cooperation"): bölmə `2220:58130`. Desktop 1728 `2198:112838` (məzmun frame-i
`2210:56798`: sol menyu `2198:112848`, məzmun `2198:112842`, cədvəl bloku `2208:77938`), tablet 744 `2216:6616`, iPhone 390 `2216:7341`.
Ölçülər: `contracts/ui-contract.md` (plan mərhələsində yazılır).

**Köhnə versiya** (`product-host`, Maddə I.2): xüsusi controller, model və ya cədvəl yoxdur. Bu adi CMS səhifəsidir (`pages`, yeni bazada id 122,
az `merkezi-banklarla-emekdasliq`, en `cooperation-with-central-banks`). Məzmun axın mətnidir: hər bank üçün `<p><strong>Ad</strong></p>`,
paraqraflar və sayt linki (İsveçrə Milli Bankı, Polşa Milli Bankı, Türkiyə Cümhuriyyəti Mərkəzi Bankı, Almaniya Bundesbankı). Giriş mətni yoxdur:
məzmun birbaşa birinci bankın başlıq sətri ilə başlayır. Memorandum siyahısı, ölkə və il köhnə səhifədə yoxdur — Figma-dakı cədvəl tamamilə yeni məzmundur.

**Hazırkı vəziyyət** (yeni stack, 2026-11-13, test mühiti): spec 043 bölməni `section-shell` şablonuna keçirib; səhifə 122 köhnə axın mətnini adi
məzmun kimi göstərir. Spec 044 qonşu səhifəni (id 121) ayrıca məzmun növünə keçirib — bu spec eyni yanaşmanı təkrarlayır.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ziyarətçi memorandumlar cədvəlini görür və çeşidləyir (Priority: P1)

Ziyarətçi "Beynəlxalq əməkdaşlıq" bölməsində "Mərkəzi banklarla əməkdaşlıq" səhifəsini açır: başlıq, giriş mətni, "Xarici ölkələrin mərkəzi
bankları və nəzarət qurumları ilə imzalanmış Anlaşma Memorandumları" başlığı və Təşkilat | Ölkə | Tarix sütunlu cədvəl görür. Sətirlər ilə görə
düzülüb, ən yenilər yuxarıdadır. Sağdakı çeşidləmə seçimi ilə sıranı "əvvəlcə köhnələr"ə çevirir.

**Why this priority**: İctimai nəticə budur və Figma ilə uyğun olmalıdır.

**Independent Test**: Seed olunmuş bazada səhifəni az və en dilində 1728, 744 və 390px endə açmaq, ölçüləri `contracts/ui-contract.md` ilə
tutuşdurmaq, çeşidləməni dəyişib sıranı yoxlamaq.

**Acceptance Scenarios**:

1. **Given** 28 dərc olunmuş memorandum, **When** səhifə açılır, **Then** başlıq, giriş mətni, cədvəl başlığı və 28 sətir görünür; sətirlər ilə görə azalan sıradadır, eyni ilin sətirləri redaktorun sırası ilə.
2. **Given** açıq səhifə, **When** ziyarətçi çeşidləmədə "əvvəlcə köhnələr" seçir, **Then** sətirlər ilə görə artan sıraya keçir, seçim səhifənin ünvanında saxlanır və ünvanı paylaşan şəxs eyni sıranı görür.
3. **Given** ünvanda tanınmayan çeşidləmə dəyəri, **When** səhifə açılır, **Then** standart sıra ("əvvəlcə yenilər") tətbiq olunur, xəta olmur.
4. **Given** memorandum yalnız bir dildə doldurulub və ya yalnız bir dildə görünən işarələnib, **When** səhifə digər dildə açılır, **Then** həmin sətir görünmür.
5. **Given** memorandumlar var, **When** səhifə açılır, **Then** CMS məzmunundakı köhnə bank mətnləri göstərilmir, yalnız onlardan əvvəlki giriş mətni göstərilir.
6. **Given** 744px və 390px ekran, **When** səhifə açılır, **Then** cədvəl üç sütunlu qalır, Figma-nın tablet və mobil ölçüləri ilə; uzun təşkilat adı sətir keçir, üfüqi sürüşmə yaranmır.

---

### User Story 2 - Redaktor memorandumları paneldən idarə edir (Priority: P1)

Redaktor admin paneldə "Memorandumlar" bölməsini açır, yeni memorandum əlavə edir (təşkilat adı və ölkə az/en, il), mövcud olanı düzəldir, sırasını
dəyişir və ya silir. HTML cədvəli redaktə etmək lazım deyil.

**Why this priority**: Yeni memorandum ildə bir neçə dəfə imzalanır; siyahı proqramçısız yenilənməlidir.

**Independent Test**: Paneldə iki dildə yeni memorandum yaratmaq, dərc etmək və saytda yeni sətri düzgün yerdə görmək.

**Acceptance Scenarios**:

1. **Given** "Memorandumlar" bölməsi, **When** redaktor az və en sahələrini və ili doldurub dərc edir, **Then** sətir saytda hər iki dildə, ilinə uyğun yerdə görünür.
2. **Given** memorandum qaralamadadır və ya silinib, **When** ziyarətçi səhifəni açır, **Then** həmin sətir görünmür.
3. **Given** eyni ilin bir neçə memorandumu, **When** redaktor sıra dəyərini dəyişir, **Then** onlar saytda həmin sıra ilə düzülür (hər iki çeşidləmədə il daxilində eyni sıra).
4. **Given** il boşdur, dörd rəqəmli deyil və ya dolu dildə təşkilat adı yaxud ölkə boşdur, **When** redaktor saxlamağa çalışır, **Then** forma həmin sahəni göstərir və məlumat saxlanmır.
5. **Given** bölmənin siyahısı, **Then** redaktor təşkilat adını, ölkəni, ili və statusu görür və ada görə axtara bilir.

---

### User Story 3 - Figma məzmunu əl işi olmadan gəlir (Priority: P2)

Dəyişiklik yayımlananda Figma-dakı 28 memorandum az və en dilində yeni bölmədə olur və səhifə Figma-dakı giriş mətnini alır.

**Why this priority**: Yayım günü səhifə boş qalmamalıdır, amma görünüş və idarə onsuz da yoxlana bilər.

**Independent Test**: Boş və köhnə məzmunlu bazaya seed-i tətbiq etmək, səhifəni yoxlamaq, sonra seed-i təkrar işlədib dublikat olmadığını görmək.

**Acceptance Scenarios**:

1. **Given** memorandum cədvəli boşdur, **When** seed tətbiq olunur, **Then** 28 memorandum az və en dilində dərc olunmuş olur, Figma-dakı sıra ilə.
2. **Given** səhifənin məzmunu hələ köhnə haldadır (birbaşa bank başlıq sətri ilə başlayır), **When** seed tətbiq olunur, **Then** Figma-dakı giriş paraqrafı məzmunun əvvəlinə əlavə olunur (az və en), köhnə mətn silinmir.
3. **Given** redaktor səhifənin məzmununu artıq dəyişib (başqa mətnlə başlayır), **When** seed tətbiq olunur, **Then** səhifənin məzmunu dəyişmir.
4. **Given** seed artıq tətbiq olunub və ya redaktor memorandum əlavə edib, **When** seed yenidən işləyir, **Then** dublikat yaranmır.

---

### Edge Cases

- Memorandum xidməti hələ deploy olunmayıb və ya xəta verir: səhifə açılır, CMS məzmunu tam (köhnə bank mətnləri ilə) göstərilir, cədvəl başlığı, çeşidləmə və cədvəl görünmür.
- Dərc olunmuş memorandum yoxdur: cədvəl bloku göstərilmir, CMS məzmunu tam göstərilir.
- CMS məzmununda `<p><strong>` başlıq sətri yoxdur: məzmun tam giriş sayılır və cədvəldən əvvəl göstərilir.
- CMS məzmunu birbaşa başlıq sətri ilə başlayır (seed-dən əvvəlki hal) və memorandumlar var: giriş boşdur, başlıqdan sonra birbaşa cədvəl bloku gəlir.
- Eyni təşkilatla iki memorandum (Figma-da Rusiya Federasiyasının Mərkəzi Bankı 2026 və 2006): iki ayrı sətirdir, birləşdirilmir.
- Uzun təşkilat adı (Figma-da iki sətirlik Qırğızıstan sətri): ad sətir keçir, ölkə və il öz sütununda qalır.
- JavaScript yoxdur: çeşidləmə yenə işləyir.
- Çap: cədvəl tam çap olunur, çeşidləmə düyməsi çap olunmur.
- Çeşidləmə dəyişəndə səhifə sol menyunu, breadcrumb-ı və dili saxlayır.
- "(Kopya)" səhifəsi (`…-copy` slug): eyni görünüşü alır, sətirlər eyni bölmədən gəlir.
- Səhifənin faylları (qoşmalar) varsa, cədvəldən sonra adi qaydada göstərilir.
- Bölmədəki digər səhifələr (Beynəlxalq maliyyə təşkilatları, Beynəlxalq təşkilatlarda üzvlük) dəyişmir.

## Requirements *(mandatory)*

### Functional Requirements

**Admin panel**

- **FR-001**: Redaktor memorandumları ayrıca bölmədə ("Memorandumlar") siyahı kimi görə, yarada, redaktə edə və silə bilməlidir.
- **FR-002**: Hər memorandumun az və en üçün təşkilat adı və ölkəsi olmalıdır. Ən azı bir dil məcburidir; dolu dildə hər iki sahə məcburidir.
- **FR-003**: Hər memorandumun imzalanma ili (dörd rəqəm, 1991-dən cari ildən bir il sonraya qədər) məcburidir.
- **FR-004**: Redaktor memorandumun sırasını, dərc statusunu və hər dildə görünüşünü təyin edə bilməlidir.
- **FR-005**: Bölməyə giriş və yazı mövcud rol-icazə qaydası ilə idarə olunmalı, dəyişikliklər audit jurnalına düşməlidir.
- **FR-006**: Siyahıda təşkilat adı, ölkə, il və status görünməli, ada görə axtarış olmalıdır.

**Sayt**

- **FR-007**: Səhifə Figma görünüşündə olmalıdır: bölmə şablonu (spec 043), başlıq, giriş, cədvəl başlığı, çeşidləmə seçimi və cədvəl — 1728, 744 və 390px üçün (`contracts/ui-contract.md`).
- **FR-008**: Başlıq, giriş mətni və fayllar CMS səhifəsindən, cədvəlin sətirləri yeni bölmədən gəlməlidir.
- **FR-009**: Saytda yalnız dərc olunmuş, silinməmiş və cari dildə görünən (həmin dildə adı olan) memorandumlar göstərilməlidir.
- **FR-010**: Standart sıra ilə görə azalandır; "əvvəlcə köhnələr" seçimi ilə görə artandır. Hər iki halda eyni ilin sətirləri redaktorun sırası, sonra əlavə olunma sırası ilə düzülür.
- **FR-011**: Çeşidləmə seçimi səhifənin ünvanında saxlanmalı, JavaScript olmadan işləməli, tanınmayan dəyərdə standart sıraya qayıtmalıdır.
- **FR-012**: Memorandumlar göstərilərkən CMS məzmunu ilk başlıq sətrindən (`<p><strong>…</strong></p>`) kəsilməlidir; memorandum yoxdursa və ya alınmırsa məzmun tam göstərilir.
- **FR-013**: Cədvəl ekran oxuyucusu üçün həqiqi cədvəl olmalıdır (sütun başlıqları, başlıqla əlaqələnmiş ad); çeşidləmə seçimi klaviatura ilə idarə olunmalı və etiketli olmalıdır.
- **FR-014**: Chrome mətnləri (cədvəl başlığı, "Təşkilat", "Ölkə", "Tarix", "Tarix:", "əvvəlcə yenilər", "əvvəlcə köhnələr") az və en dilində olmalıdır; təşkilat adı və ölkə yalnız admin paneldən gəlməlidir.
- **FR-015**: Görünüş bu səhifənin az və en slug-larına (və `-copy` qaralamalarına) bağlıdır; bölmənin digər səhifələri dəyişmir.

**Seed**

- **FR-016**: Figma-dakı 28 memorandum (təşkilat, ölkə, il) az və en dilində, dərc olunmuş halda yayım zamanı yaradılmalıdır, yalnız memorandum cədvəli boşdursa.
- **FR-017**: Seed Figma-dakı giriş paraqrafını səhifənin az və en məzmununun əvvəlinə əlavə etməlidir, yalnız məzmun hələ birbaşa başlıq sətri ilə başlayırsa; mövcud mətn silinmir.

**Sənədlər**

- **FR-018**: Redaktor təlimatı (`cooperation-cms-guide.md`), hər iki API-nin OpenAPI spec-i, `CLAUDE.md` qeydləri və `business_logic` sənədləri eyni dəyişiklikdə yenilənməlidir.

### Key Entities *(include if feature involves data)*

- **Memorandum**: imzalanma ili, sıra, dərc statusu, dillər üzrə görünüş; silinmə qeydi saxlanır.
- **Memorandum tərcüməsi**: bir dil üçün təşkilatın adı və ölkəsi.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 1728, 744 və 390px endə cədvəl, başlıq sətri, çeşidləmə seçimi, aralıqlar və tipoqrafiya `contracts/ui-contract.md` ilə 1px dəqiqliklə üst-üstə düşür.
- **SC-002**: Redaktor yeni memorandumu 1 dəqiqədən az vaxtda dərc edə bilir, HTML yazmadan.
- **SC-003**: Yayımdan sonra 28 memorandum hər iki dildə əl işi olmadan görünür.
- **SC-004**: Admindəki dəyişiklik saytda növbəti səhifə açılışında görünür.
- **SC-005**: Memorandum xidməti əlçatan olmayanda səhifə xətasız açılır və köhnə məzmunu göstərir.
- **SC-006**: Seed-in təkrar tətbiqi heç bir dublikat yaratmır və redaktor dəyişikliklərini əzmir.
- **SC-007**: Çeşidləmə dəyişəndə bütün 28 sətir düzgün sırada qalır və heç biri itmir.

## Assumptions

- **Köhnə bank mətnləri saytdan çıxır.** Səhifədəki dörd bankın (İsveçrə, Polşa, Türkiyə, Almaniya) axın mətni Figma-da yoxdur. Memorandumlar olanda sayt onu göstərmir (spec 044-dəki SECO kimi); mətn CMS-də qalır və redaktor istəsə silə bilər. Bu, istifadəçinin təsdiqləməli olduğu məzmun qərarıdır.
- Seed-in az məzmunu Figma-dandır. En təşkilat adları, ölkələr və en giriş paraqrafı Figma-da və köhnə saytda yoxdur: tərcümə qaralamasıdır, redaktor yoxlamalıdır.
- Ölkə sərbəst mətndir (az/en), ölkə sorğu kitabçası yoxdur: 28 sətir üçün ayrıca cədvəl artıqdır, Figma-da "BƏƏ" kimi qısaltmalar da var.
- Memorandumun sənəd faylı, linki və ya təsviri yoxdur: Figma-da sətir yalnız üç xanadır.
- Səhifələmə və axtarış yoxdur: Figma bütün sətirləri bir cədvəldə göstərir.
- Çeşidləmə seçimi JavaScript-siz də işləməli olduğu üçün layihənin mövcud filtr qaydası ilə (ünvan parametri, server render) qurulur; Figma-dakı görünüşü saxlayır.
- Cədvəl başlığı chrome mətnidir (kodda az/en), redaktor onu paneldən dəyişmir.
- Memorandum mətnləri sayt axtarışında indekslənmir; səhifə öz CMS məzmunu ilə tapılır.
- Komponentlər ayrıca yayımlanır, sıra: `api-cbar-admin`, `api-cbar`, `web-cbar-new`; `web-cbar-admin-new` `api-cbar-admin`-dən sonra istənilən vaxt.
- Legacy URL yönləndirməsi lazım deyil: səhifənin ünvanı dəyişmir.
- İki redaktor eyni memorandumu eyni anda redaktə edərsə son saxlanan qalır (paneldə ümumi qayda), dəyişikliklər audit jurnalında görünür.
