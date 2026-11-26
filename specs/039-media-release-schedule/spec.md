# Feature Specification: Məlumatların yayımlanması qrafiki — admin paneldən idarə olunan məzmun növü

**Feature Branch**: `039-media-release-schedule`

**Created**: 2026-11-11

**Status**: Draft

**Input**: "Figmada seçili olan səhifəni yaratmaq istəyirəm. product-host-da əvvəlcədən belə məntiq olub, indi istəyirəm onu yeni saytda da yaradım, amma funksionallıq olduğundan istəyirəm onu da necəsə admin paneldən idarə etmək olsun." Sonrakı qərarlar (2026-11-11): ayrıca məzmun növü; ayrıca ünvan; axtarış Figma-dakı kimi; dövrilik idarə olunan siyahıdır; müddət xanasına link qoşula bilər; "Son yenilənmə" göstərilmir; başlıq və giriş mətni CMS səhifəsindən gəlir; mövcud cədvəl köçürülür; Statistika altındakı PDF qrafiki əhatədən kənardır. Plan mərhələsində tapılan "Qrafik (modal)" frame-ləri üzrə qərarlar (2026-11-11): modaldakı tarixlər Tədbirlərdən ("Qərar" növü) gəlir; müddət xanasının üç rejimi var (adi mətn, xarici link, qərarlar qrafiki modalı); "Bütün qərarlar →" Tədbirlər səhifəsini "Qərar" növü ilə açır.

**Figma**: səhifə — desktop `1713:29377`, tablet `1718:30137`, mobil `1718:30583`. Qərarlar qrafiki modalı — desktop `1727:31563`, tablet `1727:32212`, mobil `1727:32597`. Ölçülər: `contracts/ui-contract.md`.

**Hazırkı vəziyyət** (2026-11-11): qrafik bir CMS səhifəsində (köhnə saytda səhifə 72, yeni bazada səhifə 130) əllə yazılmış cədvəldir: 3 sütun (Məzmun / Dövrilik / Təqdim olunma müddəti), 2 qrup başlığı, ~22 sətir. Redaktor cədvəli mətn redaktorunda dəyişir. Axtarış yoxdur, sətir səhvi bütün cədvəlin görünüşünü pozur.

**Əvəz edilən köhnə hissə** (Maddə I.2): `product-host`-da qrafik üçün xüsusi controller, model və ya view yoxdur. Bu, adi səhifə ağacındakı səhifədir (`PagesController` / `pages/index`, ünvan `page-72/{slug}`). Köhnə ünvan yeni səhifəyə yönləndirilir (Maddə VII.2), heç bir funksiya ləğv edilmir. Statistika altındakı "Statistik hesabatların yayımlanması qrafiki" (köhnə səhifə 103, yeni səhifə 60) dəyişmir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Redaktor qrafikin sətirlərini formadan idarə edir (Priority: P1)

Redaktor admin paneldə "Yayım qrafiki" bölməsini açır, sətrin məzmununu, dövriliyini və təqdim olunma müddətini dəyişir, yeni sətir əlavə edir və ya köhnəsini silir. Cədvəl, HTML və ya sətir birləşdirmə barədə heç nə bilmək lazım deyil.

**Why this priority**: Dəyişikliyin əsas səbəbi budur. Redaktorun səhvi cədvəlin görünüşünü pozmamalıdır.

**Independent Test**: Admin paneldə iki dildə sətir yaratmaq, dərc etmək və saytda həmin sətri seçilmiş qrupda görmək.

**Acceptance Scenarios**:

1. **Given** "Yayım qrafiki" bölməsi, **When** redaktor qrup və dövrilik seçib az və en mətnlərini doldurur və sətri dərc edir, **Then** sətir saytda hər iki dildə həmin qrupun altında görünür.
2. **Given** sətir qaralamadadır, **When** ziyarətçi səhifəni açır, **Then** həmin sətir görünmür.
3. **Given** bir qrupda bir neçə sətir, **When** redaktor sıra dəyərini dəyişir, **Then** sətirlər saytda yeni sıra ilə düzülür.
4. **Given** sətrin müddət rejimi "link"-dir, **When** ziyarətçi səhifəni açır, **Then** müddət mətni link kimi ↗ işarəsi ilə görünür; xarici ünvan yeni pəncərədə, saytın öz ünvanı eyni pəncərədə açılır.
5. **Given** məcburi sahə boşdur və ya link düzgün ünvan deyil, **When** redaktor saxlamağa çalışır, **Then** forma həmin sahəni göstərir və məlumat saxlanmır.
6. **Given** sətir silinir, **When** ziyarətçi səhifəni açır, **Then** sətir görünmür, qalan cədvəl dəyişmir.
7. **Given** sətir yalnız bir dildə görünən işarələnib, **When** səhifə digər dildə açılır, **Then** həmin sətir görünmür.

---

### User Story 2 - Ziyarətçi qrafiki görür və axtarır (Priority: P1)

Ziyarətçi Media bölməsində "Məlumatların yayımlanması qrafiki" səhifəsini açır, giriş mətnini və qruplara bölünmüş cədvəli görür, məzmun adına görə axtarır və filtri təmizləyir.

**Why this priority**: İctimai nəticə budur və Figma ilə uyğun olmalıdır.

**Independent Test**: Doldurulmuş qrafiklə səhifəni az və en dilində, üç ekran ölçüsündə açmaq, axtarış etmək və ölçüləri `contracts/ui-contract.md` ilə tutuşdurmaq.

**Acceptance Scenarios**:

1. **Given** iki qrupda dərc olunmuş sətirlər, **When** səhifə açılır, **Then** breadcrumb, paylaşma düymələri, sol Media menyusu, başlıq, giriş mətni, axtarış paneli və cədvəl Figma sırası ilə görünür; hər qrup qalın başlıq sətri ilə başlayır.
2. **Given** səhifə, **When** ziyarətçi axtarış sahəsinə "inflyasiya" yazıb "Axtar"-a basır, **Then** yalnız məzmununda bu söz olan sətirlər və onların qrup başlıqları qalır, ünvanda axtarış sözü görünür.
3. **Given** axtarış nəticəsi göstərilir, **When** ziyarətçi "Filtrləri təmizlə"-yə basır, **Then** bütün cədvəl yenidən görünür və axtarış sahəsi boşalır.
4. **Given** axtarışa uyğun sətir yoxdur, **When** nəticə göstərilir, **Then** cədvəlin yerində "heç nə tapılmadı" mesajı görünür.
5. **Given** axtarış sözü olan ünvan paylaşılıb, **When** başqa ziyarətçi onu açır, **Then** eyni nəticəni görür.
6. **Given** JavaScript söndürülüb, **When** ziyarətçi axtarış edir, **Then** axtarış eyni nəticə ilə işləyir.

---

### User Story 3 - Ziyarətçi pul siyasəti qərarlarının qrafikini modalda görür (Priority: P1)

Ziyarətçi "Pul siyasəti ilə bağlı qəbul olunan qərarlar" sətrində "Qrafikə uyğun ↗"-ya basır. Səhifədən çıxmadan modal açılır: cari ilin bütün qərar tarixləri, növbəti açıqlama ayrıca vurğulanıb, hər tarixdə press-reliz və ya press-reliz və mətbuat konfransı olduğu yazılır. Tarixləri redaktor ayrıca yazmır: onlar Tədbirlər bölməsindəki "Qərar" növlü tədbirlərdir.

**Why this priority**: Figma bu sətri modal kimi verir; köhnə saytda link ayrıca səhifəyə aparırdı və o səhifə hər il əllə yenilənirdi.

**Independent Test**: Tədbirlərdə cari il üçün bir neçə "Qərar" tədbiri (birinin günündə "Mətbuat konfransı" tədbiri) yaratmaq, səhifədə modalı açıb tarixləri, növləri və növbəti açıqlamanı yoxlamaq.

**Acceptance Scenarios**:

1. **Given** cari ildə 8 dərc olunmuş "Qərar" tədbiri, **When** ziyarətçi "Qrafikə uyğun ↗"-ya basır, **Then** modal başlıq, "{il}-cı il · Mərkəzi Bankın İdarə Heyəti" alt sətri, "Növbəti açıqlama" kartı və 8 tarix plitəsi ilə açılır.
2. **Given** qərar günündə "Mətbuat konfransı" tədbiri də var, **When** modal açılır, **Then** həmin plitədə və (növbəti olarsa) kartda "Press-reliz və mətbuat konfransı" yazılır; yoxdursa "Press-reliz".
3. **Given** bugünkü tarix (Bakı vaxtı), **When** modal açılır, **Then** keçmiş tarixlər boz, növbəti tarix vurğulanmış, sonrakılar haşiyəli ağ plitə kimi görünür.
4. **Given** cari ilin bütün qərarları keçib, növbəti il üçün qərar daxil edilib, **When** modal açılır, **Then** "Növbəti açıqlama" kartı növbəti ilin tarixini göstərir, plitələr cari ilindir.
5. **Given** modal açıqdır, **When** ziyarətçi "Bütün qərarlar →"-ya basır, **Then** Tədbirlər səhifəsi "Qərar" növü ilə süzülmüş açılır.
6. **Given** modal açıqdır, **When** ziyarətçi bağlama düyməsini, fonu və ya Escape-i basır, **Then** modal bağlanır və fokus düyməyə qayıdır.
7. **Given** JavaScript söndürülüb, **When** ziyarətçi "Qrafikə uyğun ↗"-ya basır, **Then** Tədbirlər səhifəsi "Qərar" növü ilə açılır.

---

### User Story 4 - Redaktor qrupları və dövrilik siyahısını idarə edir (Priority: P2)

Redaktor qrupları ("Pul və məzənnə siyasəti üzrə", "Normativ-hüquqi baza üzrə") və dövrilik dəyərlərini (İllik, Rüblük, Aylıq, Gündəlik, …) az və en adı və sıra ilə ayrıca siyahılarda saxlayır, sətirdə isə sadəcə seçir.

**Why this priority**: Eyni dövriliyin fərqli yazılmasının və qrup sırasının pozulmasının qarşısını alır, amma sətir idarəsi mövcud siyahılarla başlaya bilər.

**Independent Test**: Dövriliyin adını dəyişmək və ona bağlı bütün sətirlərdə yeni adı görmək; qrupların sırasını dəyişmək və saytda yeni sıranı görmək.

**Acceptance Scenarios**:

1. **Given** dövrilik dəyəri, **When** redaktor onun adını dəyişir, **Then** ona bağlı bütün sətirlərdə saytda yeni ad görünür.
2. **Given** iki qrup, **When** redaktor onların sırasını dəyişir, **Then** saytda qruplar yeni sıra ilə düzülür.
3. **Given** qrupa və ya dövriliyə bağlı sətir var, **When** redaktor onu silməyə çalışır, **Then** əməliyyat aydın mesajla rədd edilir.
4. **Given** qrup deaktiv edilib, **When** ziyarətçi səhifəni açır, **Then** həmin qrup və onun sətirləri görünmür.

---

### User Story 5 - Mövcud qrafik əl işi olmadan köçür və köhnə ünvanlar işləyir (Priority: P2)

Dəyişiklik yayımlananda səhifə 130-dakı cədvəlin bütün sətirləri qrupları və dövrilikləri ilə yeni bölməyə keçir. Köhnə saytın ünvanı yeni səhifəni açır. Redaktor heç nəyi yenidən yazmır.

**Why this priority**: Yayım günü səhifə boş qalmamalı, köhnə linklər qırılmamalıdır.

**Independent Test**: Köhnə məzmunlu bazaya köçürməni tətbiq edib səhifəni yoxlamaq, ikinci dəfə tətbiq edib dublikat olmadığını görmək, köhnə ünvanı açmaq.

**Acceptance Scenarios**:

1. **Given** köhnə məzmunlu baza, **When** köçürmə tətbiq olunur, **Then** cədvəlin bütün sətirləri hər iki dildə (en mətni olan yerdə) dərc olunmuş olur, qrup və sətir sırası köhnə cədvəldəki kimidir.
2. **Given** köçürmə artıq tətbiq olunub, **When** yenidən işləyir, **Then** dublikat sətir, qrup və ya dövrilik yaranmır.
3. **Given** köhnə ünvan `page-72/{slug}` (az və ya en), **When** ziyarətçi onu açır, **Then** həmin dildə yeni səhifəyə daimi yönləndirilir.
4. **Given** köçürmə tətbiq olunub, **When** səhifə açılır, **Then** CMS səhifəsinin mətni dəyişməyib, saytda giriş mətni görünür, köhnə əl cədvəli isə təkrar göstərilmir.

---

### Edge Cases

- Qrafik məlumatı alınmır (xidmət deploy olunmayıb və ya xəta verir) və ya dərc olunmuş sətir yoxdur: səhifə açılır, başlıq və CMS səhifəsinin bütün mətni (köhnə əl cədvəli daxil) göstərilir; axtarış paneli, yeni cədvəl, xəta və boş mesaj göstərilmir. Məzmun heç bir ara vəziyyətdə itmir (spec 038 qaydası).
- Qrupun dərc olunmuş sətri yoxdur: qrup başlığı göstərilmir.
- Sətrin dövriliyi seçilməyib: Dövrilik xanasında "—" göstərilir.
- Sətrin cari dildə mətni boşdur: həmin dildə sətir görünmür.
- Dövriliyin cari dildə adı boşdur: digər dilin adı yox, "—" göstərilir.
- Müddət rejimi link və ya modaldır, amma müddət mətni boşdur: ünvan yox, chrome etiketi göstərilir ("Keçid" / "Qrafikə uyğun").
- Cari ildə "Qərar" tədbiri yoxdur: modal açılır, plitələr yerində "Bu il üçün qrafik hələ dərc olunmayıb" mesajı, "Bütün qərarlar →" linki qalır.
- Növbəti qərar yoxdur (bütün tarixlər keçib və yeni il daxil edilməyib): "Növbəti açıqlama" kartı göstərilmir.
- Eyni gündə iki "Qərar" tədbiri var: bir plitə göstərilir.
- Qərar tədbirinin en tərcüməsi yoxdur: tarix yenə en səhifəsinin modalında görünür (tarix və növ etiketi chrome-dur, tədbirin adı modalda göstərilmir).
- Cari ildə qərar tarixi yoxdur və növbəti tarix də yoxdur: modal rejimli xana yenə modalı açır, modal boş il mesajını və "Bütün qərarlar →" linkini göstərir.
- Çox uzun məzmun mətni: xana sətrə bölünür, cədvəl üfüqi sürüşmür (desktop); dar ekranda sətirlər Figma-nın mobil görünüşü ilə göstərilir.
- Axtarış sözünün əvvəlində və sonunda boşluq var: boşluq nəzərə alınmır; boş axtarış bütün cədvəli göstərir.
- Axtarış böyük-kiçik hərfə və Azərbaycan hərflərinə həssas deyil ("İllik" = "illik").
- CMS səhifəsi 130 yoxdur və ya cari dildə gizlidir: başlıq chrome etiketindən gəlir, giriş mətni göstərilmir, cədvəl yenə görünür.
- Səhifə 130 menyuda Media bölməsinin altında deyil: səhifə yenə açılır, sol menyuda aktiv element olmur; redaktor səhifəni Media altına keçirir (`docs/media-cms-guide.md`).

## Requirements *(mandatory)*

### Functional Requirements

**Admin panel**

- **FR-001**: Redaktor qrafikin sətirlərini ayrıca bölmədə siyahı kimi görə, axtara, qrupa və dövriliyə görə süzə, yarada, redaktə edə və silə bilməlidir.
- **FR-002**: Hər sətrin az və en üçün məzmun və təqdim olunma müddəti mətni olmalıdır. Ən azı bir dil məcburidir; dolu dildə məzmun boş ola bilməz, müddət boş ola bilər.
- **FR-003**: Hər sətir bir qrupa bağlı olmalıdır (məcburi), dövrilik siyahıdan seçilir (istəyə bağlı).
- **FR-004**: Sətrin müddət xanası üç rejimdən biridir: adi mətn, link, qərarlar qrafiki modalı. Link rejimində ünvan məcburidir və yalnız tam `http`/`https` ünvanı və ya saytın öz yolu (`/` ilə başlayan) qəbul edilir; digər rejimlərdə ünvan saxlanmır.
- **FR-005**: Redaktor sətrin sırasını, dərc statusunu (qaralama / dərc olunub) və hər dildə görünüşünü təyin edə bilməlidir.
- **FR-006**: Redaktor qrupları az və en adı, sıra və aktivlik ilə idarə edə bilməlidir.
- **FR-007**: Redaktor dövrilik siyahısını az və en adı və sıra ilə idarə edə bilməlidir.
- **FR-008**: Sətri olan qrup və ya dövrilik silinə bilməz, redaktor aydın mesaj görməlidir.
- **FR-009**: Bu bölmələrə giriş və yazı mövcud rol-icazə qaydası ilə idarə olunmalı, hər dəyişiklik audit jurnalına düşməlidir.
- **FR-010**: Sətirlər, qruplar və dövriliklər bir menyu elementi altında üç tab kimi olmalıdır.

**Sayt**

- **FR-011**: Səhifə `/{locale}/media/release-schedule` ünvanında Media bölməsinin şablonunda (breadcrumb, paylaşma, sol Media menyusu) Figma görünüşü ilə göstərilməlidir (`contracts/ui-contract.md`).
- **FR-012**: Səhifə başlığı və giriş mətni CMS səhifəsindən (səhifə 130) gəlməlidir. Göstəriləcək sətir varsa, CMS səhifəsindəki köhnə əl cədvəli (ilk cədvəldən başlayaraq) saytda göstərilməməlidir; sətir yoxdursa (və ya məlumat alınmırsa) CMS mətni olduğu kimi göstərilir.
- **FR-013**: Cədvəlin üç sütunu olmalıdır: Məzmun, Dövrilik, Təqdim olunma müddəti. Sətirlər qruplara bölünür, hər qrup qalın başlıq sətri ilə başlayır.
- **FR-014**: Saytda yalnız dərc olunmuş, silinməmiş, cari dildə görünən və mətni olan sətirlər, aktiv qruplarda, əvvəlcə qrup sırası, sonra sətir sırası ilə göstərilməlidir.
- **FR-015**: Link rejimli xana link kimi ↗ işarəsi ilə göstərilməlidir; xarici ünvan yeni pəncərədə açılır.
- **FR-015a**: Modal rejimli xana link kimi ↗ işarəsi ilə göstərilməli (JavaScript varsa klik modalı açır, yoxdursa FR-015d) və pul siyasəti qərarlarının qrafikini modalda açmalıdır (`contracts/ui-contract.md` §Modal).
- **FR-015b**: Modal cari ilin (Bakı vaxtı) dərc olunmuş, silinməmiş "Qərar" növlü tədbirlərinin tarixlərini artan sıra ilə göstərməlidir; eyni gündə dərc olunmuş "Mətbuat konfransı" tədbiri varsa növ "Press-reliz və mətbuat konfransı", yoxdursa "Press-reliz"-dir.
- **FR-015c**: "Növbəti açıqlama" bu gündən (daxil) sonrakı ilk qərar tarixidir, növbəti ildə də ola bilər. Plitələr üç vəziyyətdədir: keçmiş, növbəti, gələcək.
- **FR-015d**: "Bütün qərarlar →" və JavaScript-siz fallback Tədbirlər səhifəsini "Qərar" növü ilə açmalıdır.
- **FR-016**: Axtarış məzmun mətnində işləməli, böyük-kiçik hərfə həssas olmamalı, nəticə ünvanda saxlanmalı və JavaScript-siz işləməlidir. "Filtrləri təmizlə" axtarışı sıfırlamalıdır.
- **FR-017**: Sətirlər var, amma axtarışa uyğun sətir yoxdursa, boş nəticə mesajı göstərilməlidir.
- **FR-018**: Qrafik məlumatı alınmayanda səhifə xəta verməməli, başlıq və CMS səhifəsinin mətni olduğu kimi göstərilməlidir (FR-012).
- **FR-019**: Sol Media menyusunda səhifə 130-a uyğun element bu səhifəyə aparmalı və bu səhifədə aktiv görünməlidir.
- **FR-020**: Köhnə `page-72/{slug}` ünvanı (az və en) və səhifə 130-un yeni saytdakı slug ünvanları (`/az/melumatlarin-yayimlanmasi-qrafiki`, `/en/information-disclosure-schedule`) həmin dildə yeni səhifəyə daimi yönləndirilməlidir.
- **FR-021**: Bütün chrome mətnlər (sütun başlıqları, axtarış placeholder-i, düymələr, boş nəticə və modal mesajları) az və en dilində olmalıdır; redaksiya mətni yalnız admin paneldən gəlməlidir.
- **FR-022**: "Son yenilənmə" tarixi göstərilmir.

**Köçürmə**

- **FR-023**: Səhifə 130-dakı cədvəlin qrupları, dövrilik dəyərləri və bütün sətirləri yayım zamanı avtomatik yaradılmalı, köhnə sıra saxlanmalıdır.
- **FR-024**: Köhnə cədvəldə "Qrafikə uyğun" linki olan sətir (pul siyasəti qərarları) modal rejimi ilə köçürülməlidir; köhnə saytın səhifə linki köçürülmür.
- **FR-025**: Köçürmə CMS səhifəsinin mətnini dəyişməməlidir.
- **FR-026**: Köçürmə təkrar işlədikdə dublikat yaratmamalıdır.

### Key Entities *(include if feature involves data)*

- **Qrafik qrupu**: sətirləri birləşdirən başlıq ("Pul və məzənnə siyasəti üzrə"). Sıra, aktivlik; dillər üzrə ad.
- **Dövrilik**: idarə olunan dəyər (İllik, Aylıq, "İnformasiyanın dəyişməsindən asılı olaraq" …). Sıra; dillər üzrə ad.
- **Qrafik sətri**: bir məlumat növü. Qrup, dövrilik, müddət rejimi və linki, sıra, dərc statusu, dillər üzrə görünüş; silinmə qeydi saxlanır.
- **Sətir tərcüməsi**: bir dil üçün məzmun və təqdim olunma müddəti mətni.
- **Qərar tarixi** (yeni entity deyil): Tədbirlər bölməsindəki "Qərar" növlü tədbir; "Mətbuat konfransı" növlü tədbir eyni gündədirsə, tarix mətbuat konfranslı sayılır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor yeni sətri 2 dəqiqədən az vaxtda dərc edə bilir, HTML və ya cədvəl yazmadan.
- **SC-002**: Redaktorun heç bir form daxiletməsi cədvəlin düzülüşünü pozmur.
- **SC-003**: Köçürmədən sonra köhnə cədvəlin bütün sətirləri (~22) əl işi olmadan, eyni sıra ilə görünür, heç biri təkrarlanmır.
- **SC-004**: Ziyarətçi axtarışla istədiyi sətri bir addımda tapır; axtarış nəticəsi səhifənin özü ilə eyni sayda məlumat sorğusu ilə açılır (axtarış üçün əlavə sorğu yoxdur).
- **SC-005**: Səhifənin görünüşü üç ekran ölçüsündə (1728, 744, 390) `contracts/ui-contract.md`-dəki ölçülərə uyğundur.
- **SC-006**: Admindəki dəyişiklik saytda 1 dəqiqədən az vaxtda görünür.
- **SC-007**: Köhnə ünvanların 100%-i yeni səhifəyə aparır.
- **SC-008**: Qrafik xidməti əlçatan olmayanda səhifə xətasız açılır və qrafik köhnə CMS mətni ilə oxuna bilir.
- **SC-009**: Yeni ilin qərar tarixləri Tədbirlərə daxil ediləndə modal heç bir əlavə redaktə olmadan onları göstərir (köhnə saytda hər il yeni səhifə yazılırdı).

## Assumptions

- Axtarış yalnız Figma-dakı mətn sahəsidir; dövriliyə və ya qrupa görə saytda filtr yoxdur.
- Axtarış yalnız məzmun mətnində aparılır (sahənin placeholder-i "Məzmun üzrə axtarış"-dır); qrup başlığı və müddət mətni axtarılmır.
- Sətirlər ümumi sayt axtarışına əlavə edilmir: onların ayrıca səhifəsi yoxdur, səhifə 130 isə artıq axtarışdadır.
- Səhifə 130-un hazırkı slug-ı saxlanır; onun öz ünvanı da yeni səhifəyə yönləndirilir, menyu elementi yeni ünvana aparır.
- Köhnə cədvəlin bütün sətirlərinin az və en mətni var, ikisi də köçürülür. Köhnə cədvəldə ikinci qrup başlığından sonra gələn və öz-özlüyündə qalın yazılmış sətirlər Figma-dakı kimi ikinci qrupun adi sətirləri olur; dövriliyi və müddəti boş olan sətirlərə Figma-dakı dəyərlər ("İnformasiyanın dəyişməsindən asılı olaraq" / "Dərhal") verilir, redaktor yoxlamalıdır.
- Giriş mətni CMS səhifəsinin cədvəldən əvvəlki hissəsidir. Figma-dakı yeni giriş cümləsini redaktor CMS-də yazır; kod mətni dəyişmir.
- Köhnə saytın "Qrafikə uyğun" linki ilin qərarlar səhifəsinə (köhnə `page-131`) aparırdı. O səhifə dəyişmir və ağacda qalır; modal onu əvəz edir.
- Modal ən çox bir il göstərir; əvvəlki illərin qərarları "Bütün qərarlar →" ilə Tədbirlərdədir.
- Bu səhifənin dərc tarixi və embarqo qaydası yoxdur: dərc olunan sətir dərhal görünür.
- Rol-icazə qaydası CSR və Tədbirlər kimidir: yeni icazələr moderator roluna verilir, admin paneldə ekranlar icazəyə görə gizlədilmir.
- Komponentlər ayrıca yayımlanır, sıra: `api-cbar-admin`, `api-cbar`, `web-cbar-admin-new`, `web-cbar-new`.
- Statistika altındakı PDF qrafiki (səhifə 60) və onun sınıq faylı bu spec-in əhatəsindən kənardır.
