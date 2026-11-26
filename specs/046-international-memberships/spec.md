# Feature Specification: Beynəlxalq təşkilatlarda üzvlük səhifəsi və admin menyusunun bölmələr üzrə qruplaşdırılması

**Feature Branch**: `046-international-memberships`

**Created**: 2026-11-16

**Status**: Draft

**Input**: "Beynəlxalq təşkilatlarda üzvlük bu səhifənin düzəldilməsi üçün spec hazırlanmasını planlayaq və Figma-da kliklədiyim səhifəyə uyğun dizayn
edək. Əgər API-də dəyişiklik lazımdırsa onları da nəzərə alaq. Bundan əlavə admin paneldə səhifələrin içərisini edit edən CRUD menyusu sol tərəfdə
səpələnmiş haldadır, onları qruplaşdırıb necə səhifələrin alt menyusu kimi eləməyi planlayıram … bu spec-də nəzərə alaq." Əlavə: "Səhifənin içərisini
kontent kimi düzəltmək daha rahatdırsa o formada da nəzərə almağı razılaşdıra bilərik."

Qərarlar (2026-11-16, istifadəçi):
1. Üzvlük cədvəli **redaktorun səhifə mətnindəki adi cədvəlidir**, ayrıca məzmun növü (panel bölməsi, API, cədvəl) deyil. Sayt həmin cədvəli Figma
   görünüşünə salır və çeşidləmə əlavə edir.
2. Admin panelin sol menyusu **saytın bölmələri üzrə** açılıb-bağlanan qruplara bölünür; səhifə redaktorunda ayrıca bölmədən gələn məzmun üçün
   həmin bölməyə keçid göstərilir.

**Figma** (fayl "cbar website (Copy)", səhifə "International Cooperation"): desktop kadr `2224:7200` (sol menyu `2224:7201`, məzmun `2224:7202`,
cədvəl `2287:120701` "Membership table"). Başlıq "Beynəlxalq təşkilatlarda üzvlük"; cədvəl başlığı "Azərbaycan Respublikası Mərkəzi Bankının üzv
olduğu təşkilatlar" Figma-da **gizlidir**; çeşidləmə "Üzvlük tarixi: əvvəlcə yenilər"; sütunlar "Təşkilat | Üzvlük tarixi"; 14 sətir (2025 → 1997).
Tablet və mobil kadrlar plan mərhələsində tapılır və ölçülər `contracts/ui-contract.md`-yə yazılır.

**Köhnə versiya** (`product-host`): bu səhifə köhnə saytda yoxdur — məzmun tamamilə yenidir.

**Hazırkı vəziyyət** (test mühiti, 2026-11-16): redaktor "Beynəlxalq əməkdaşlıq" (id 120) altında səhifə 554 yaradıb, az slug
`beynelxalq-teskilatlarda-uzvluk`, sol menyuda görünür. Məzmun yer tutucudur (`<p>Beynəlxalq təşkilatlarda üzvlük</p>`). En tərcümə sətri
var, amma az başlıq, az slug və eyni yer tutucu ilə doldurulub (en sayt az mətnini göstərir). Sayt səhifəni adi məzmun kimi (`plain`) göstərir. Qonşu səhifələr: 121 (spec 044, accordion kartlar), 122 (spec 045,
memorandum cədvəli — eyni cədvəl və çeşidləmə görünüşü).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ziyarətçi üzvlük cədvəlini görür və çeşidləyir (Priority: P1)

Ziyarətçi "Beynəlxalq əməkdaşlıq" bölməsində "Beynəlxalq təşkilatlarda üzvlük" səhifəsini açır: başlıq, çeşidləmə seçimi və Təşkilat | Üzvlük tarixi
sütunlu cədvəl görür. Sətirlər ilə görə düzülüb, ən yenilər yuxarıdadır. Çeşidləmə ilə sıranı "əvvəlcə köhnələr"ə çevirir.

**Why this priority**: İctimai nəticə budur və Figma ilə uyğun olmalıdır.

**Independent Test**: Seed olunmuş səhifəni az və en dilində desktop, tablet və mobil endə açmaq, ölçüləri `contracts/ui-contract.md` ilə
tutuşdurmaq, çeşidləməni dəyişib sıranı yoxlamaq.

**Acceptance Scenarios**:

1. **Given** səhifənin mətnində 14 sətirlik üzvlük cədvəli, **When** səhifə açılır, **Then** başlıq, çeşidləmə seçimi və 14 sətir Figma görünüşündə göstərilir; sətirlər ilə görə azalan sıradadır, eyni ilin sətirləri redaktorun yazdığı sıra ilə.
2. **Given** açıq səhifə, **When** ziyarətçi "əvvəlcə köhnələr" seçir, **Then** sətirlər ilə görə artan sıraya keçir, seçim ünvanda saxlanır və ünvanı paylaşan şəxs eyni sıranı görür.
3. **Given** ünvanda tanınmayan çeşidləmə dəyəri, **When** səhifə açılır, **Then** standart sıra tətbiq olunur, xəta olmur.
4. **Given** redaktor cədvəldən əvvəl giriş mətni yazıb, **When** səhifə açılır, **Then** giriş mətni başlıqla cədvəl arasında, cədvəldən sonrakı mətn isə cədvəldən sonra göstərilir.
5. **Given** tablet və mobil ekran, **When** səhifə açılır, **Then** cədvəl iki sütunlu qalır, Figma ölçüləri ilə; uzun təşkilat adı sətir keçir, üfüqi sürüşmə yaranmır.
6. **Given** səhifə en dilində açılır, **Then** en başlıq, en slug və en cədvəl göstərilir (az mətn yox).

---

### User Story 2 - Redaktor üzvlükləri səhifə redaktorunda idarə edir (Priority: P1)

Redaktor admin paneldə səhifəni açır və adi cədvəldə sətir əlavə edir, düzəldir və ya silir (təşkilat adı və il). Ayrıca bölmə öyrənmək lazım deyil;
sıra çeşidləməni sayt özü edir.

**Why this priority**: Yeni üzvlük ildə bir-iki dəfə olur; siyahı proqramçısız yenilənməlidir.

**Independent Test**: Paneldə cədvələ yeni sətir əlavə edib saxlamaq, saytda sətrin ilinə uyğun yerdə göründüyünü yoxlamaq; səhifəni açıb dəyişmədən
saxlamaq və mətnin bayt-bayt eyni qaldığını yoxlamaq.

**Acceptance Scenarios**:

1. **Given** cədvəl, **When** redaktor sonuna "Yeni təşkilat | 2026" sətri əlavə edib saxlayır, **Then** saytda sətir standart sırada birinci görünür.
2. **Given** redaktor səhifəni açıb dəyişmədən saxlayır, **Then** cədvəlin işarələməsi dəyişmir (redaktor cədvəli itirmir və pozmur).
3. **Given** redaktor təlimatı (`cooperation-cms-guide.md`), **Then** cədvəlin qaydası (birinci cədvəl, iki sütun, birinci sətir başlıq, ikinci sütunda dörd rəqəmli il) orada yazılıb.

---

### User Story 3 - Redaktor admin menyusunda bölməni saytın quruluşu ilə tapır (Priority: P1)

Redaktor sol menyuda uzun düz siyahı əvəzinə saytın bölmələrinə uyğun qruplar görür ("Haqqımızda", "Media", "Beynəlxalq əməkdaşlıq" …). Qrupu açanda
həmin bölmənin idarə ekranları görünür. Səhifə redaktorunda ayrıca bölmədən məzmun alan səhifəni (məsələn "Mərkəzi banklarla əməkdaşlıq") açanda
"Cədvəl 'Memorandumlar' bölməsindən gəlir — aç" keçidi görür.

**Why this priority**: Bölmələrin sayı artır (son iki həftədə dörd yeni bölmə); redaktor hansı səhifənin hansı ekrandan idarə olunduğunu təxmin etməli olmamalıdır.

**Independent Test**: Paneli açmaq, qrupları açıb-bağlamaq, hər bəndin düzgün qrupda olduğunu yoxlamaq; daxil olunan ekranın qrupunun avtomatik açıq
olduğunu yoxlamaq; səhifə 121 və 122-ni redaktorda açıb keçidlə müvafiq bölməyə getmək.

**Acceptance Scenarios**:

1. **Given** panel açılır, **Then** sol menyuda "İdarə paneli", "Səhifələr" və "Media kitabxanası" qruplardan əvvəl, qalan bəndlər `Assumptions`-dakı bölgüyə uyğun qruplarda görünür.
2. **Given** bağlı qrup, **When** redaktor qrup başlığına klikləyir və ya klaviatura ilə açır, **Then** qrup açılır; yenidən bağlana bilir.
3. **Given** redaktor birbaşa ünvanla `/memorandums/5` ekranına gəlir, **Then** "Beynəlxalq əməkdaşlıq" qrupu açıqdır və "Memorandumlar" bəndi aktiv işarələnib.
4. **Given** redaktor qrupları açıb-bağlayıb, **When** paneli yeniləyir, **Then** qrupların vəziyyəti həmin brauzerdə saxlanır.
5. **Given** mobil menyu və ⌘K paleti, **Then** onlar eyni qruplaşdırmanı göstərir; paletdə axtarış bütün bəndləri qrupundan asılı olmayaraq tapır.
6. **Given** səhifə redaktorunda səhifə 121, 122, KSM səhifəsi və ya yayım qrafiki səhifəsi (130), **Then** formada müvafiq bölməyə keçid görünür; digər səhifələrdə görünmür.

---

### User Story 4 - Figma məzmunu əl işi olmadan gəlir (Priority: P2)

Dəyişiklik yayımlananda səhifənin yer tutucu məzmunu Figma-dakı 14 sətirlik cədvəllə əvəz olunur, en tərcümə yoxdursa en başlıq, slug və cədvəl yaranır.

**Why this priority**: Yayım günü səhifə boş qalmamalıdır, amma görünüş onsuz da əl ilə yazılmış cədvəllə yoxlana bilər.

**Independent Test**: Yer tutuculu, artıq redaktə olunmuş və səhifəsi olmayan bazalara seed tətbiq etmək; təkrar tətbiq etmək.

**Acceptance Scenarios**:

1. **Given** səhifənin az məzmunu boşdur və ya hələ yer tutucudur, **When** seed tətbiq olunur, **Then** az məzmun Figma-dakı 14 sətirlik cədvəl olur.
2. **Given** səhifənin en tərcüməsi yoxdur, ya da var, amma hələ az başlığı və yer tutucu/boş məzmunu daşıyır, **When** seed tətbiq olunur, **Then** en başlıq "Membership in international organizations", en slug və en cədvəl yazılır.
3. **Given** redaktor məzmunu artıq dəyişib, **When** seed tətbiq olunur, **Then** heç nə dəyişmir.
4. **Given** bazada `beynelxalq-teskilatlarda-uzvluk` səhifəsi yoxdur, **When** seed tətbiq olunur, **Then** heç nə yaranmır, yayım dayanmır.
5. **Given** seed artıq tətbiq olunub, **When** yenidən işləyir, **Then** dublikat və dəyişiklik yoxdur.

---

### Edge Cases

- Səhifə mətnində cədvəl yoxdur: məzmun adi mətn kimi tam göstərilir, çeşidləmə görünmür.
- Bir neçə cədvəl: yalnız birincisi üzvlük cədvəlidir, qalanları adi məzmun kimi yerində qalır.
- Cədvəlin birinci sətri başlıqdır (redaktorda başlıq xanası və ya adi xana): sütun adları saytda kodun az/en mətnindən gəlir, redaktorun başlığı göstərilmir.
- İl xanasında dörd rəqəmli il yoxdur (boş, "2025-ci il", "1997/1998"): sətir göstərilir, xanada yazılan mətn olduğu kimi; sıralamada ilin ilk dörd rəqəmli ədədi götürülür, heç biri yoxdursa sətir hər iki sırada sonda qalır.
- Sətirdə ikidən çox xana və ya birləşdirilmiş xana (`colspan`/`rowspan`): birinci xana təşkilat, ikinci xana il sayılır, qalanlar göstərilmir.
- Təşkilat xanasında link: link saxlanır, yeni pəncərədə açılır.
- Boş sətir (iki xana da boş): göstərilmir.
- JavaScript yoxdur: çeşidləmə işləyir. Çap: cədvəl tam, çeşidləmə çap olunmur.
- "(Kopya)" səhifəsi (`-copy` slug): eyni görünüşü alır.
- Səhifənin faylları varsa cədvəldən sonra adi qaydada göstərilir.
- Bölmənin qalan səhifələri (121, 122, 123, 124) dəyişmir.
- Admin menyusu: menyu bu gün bəndləri icazəyə görə gizlətmir (icazəni ekran və API yoxlayır); bu spec bunu dəyişmir.
- Admin menyusunda tək bəndlik bölmə (məsələn "Hüquqi aktlar" → Qanunlar): qrup başlığı olmadan birbaşa bənd kimi göstərilir, saytın sırası ilə.
- Admin menyusu dar ekranda (mobil menyu): qruplar eyni qaydada açılıb-bağlanır.
- Brauzer yaddaşı əlçatan deyil (gizli pəncərə): qruplar standart vəziyyətdə (yalnız aktiv qrup açıq) açılır, xəta olmur.

## Requirements *(mandatory)*

### Functional Requirements

**Sayt — üzvlük səhifəsi**

- **FR-001**: Səhifə Figma görünüşündə olmalıdır: bölmə şablonu (spec 043), başlıq, çeşidləmə seçimi və iki sütunlu cədvəl — desktop, tablet və mobil üçün (`contracts/ui-contract.md`). Cədvəl, sətir və çeşidləmə görünüşü spec 045-in memorandum cədvəli ilə eyni üslubdadır.
- **FR-002**: Cədvəlin sətirləri səhifə mətnindəki birinci cədvəldən oxunmalıdır: birinci xana təşkilat, ikinci xana üzvlük ili; birinci sətir başlıq sayılır və göstərilmir. Cədvəldən əvvəlki mətn giriş, sonrakı mətn cədvəldən sonra göstərilir.
- **FR-003**: Standart sıra ilə görə azalandır; "əvvəlcə köhnələr" ilə görə artandır. Hər iki halda eyni ilin sətirləri redaktorun yazdığı sıra ilə qalır; ili oxunmayan sətirlər sondadır.
- **FR-004**: Çeşidləmə seçimi ünvanda saxlanmalı, JavaScript olmadan işləməli, tanınmayan dəyərdə standart sıraya qayıtmalıdır.
- **FR-005**: Cədvəl ekran oxuyucusu üçün həqiqi cədvəl olmalıdır (sütun başlıqları, gizli cədvəl başlığı "Azərbaycan Respublikası Mərkəzi Bankının üzv olduğu təşkilatlar" ad kimi); çeşidləmə klaviatura ilə idarə olunmalı və etiketli olmalıdır.
- **FR-006**: Chrome mətnləri ("Təşkilat", "Üzvlük tarixi", "Üzvlük tarixi:", "əvvəlcə yenilər", "əvvəlcə köhnələr", gizli cədvəl başlığı) az və en dilində olmalıdır; təşkilat adı və il yalnız səhifə mətnindən gəlməlidir.
- **FR-007**: Görünüş bu səhifənin az və en slug-larına və `-copy` qaralamalarına bağlıdır; cədvəlsiz və ya oxunmayan məzmunda səhifə adi məzmun kimi göstərilir.
- **FR-008**: Yeni görünüş mövcud "redaktor işarələməsindən qurulan səhifələr" qoruyucusuna qoşulmalıdır: redaktorun saxladığı formada nümunə, saytın gözlənilən blokları və panelin bayt-bayt saxlama yoxlaması.

**Admin panel — menyu**

- **FR-009**: Sol menyu "İdarə paneli", "Səhifələr" və "Media kitabxanası"ndan sonra saytın bölmələrinə uyğun qruplar göstərməlidir (bölgü `Assumptions`-dadır); qruplar açılıb-bağlanmalı, klaviatura ilə idarə olunmalı və açıq/bağlı vəziyyəti ekran oxuyucusuna bildirilməlidir.
- **FR-010**: Redaktor ekrana gələndə (o cümlədən birbaşa ünvanla) həmin ekranın qrupu açılmalıdır; redaktor sonra onu bağlaya bilər. Qrupların vəziyyəti həmin brauzerdə yadda qalmalıdır.
- **FR-011**: Mobil menyu, ⌘K paleti, breadcrumb və səhifə başlığı eyni bölgünü istifadə etməlidir; paletdə bəndlər qrup adı ilə göstərilir.
- **FR-012**: Bəndlərin ünvanları, icazə qaydaları və ekranların özü dəyişməməlidir — yalnız menyunun quruluşu dəyişir.
- **FR-013**: Səhifə redaktorunda məzmununun bir hissəsi ayrıca bölmədən gələn səhifələr üçün (121 → Maliyyə təşkilatları, 122 → Memorandumlar, KSM səhifəsi → KSM layihələri, 130 → Yayım qrafiki, həmçinin onların `-copy` nüsxələri) həmin bölməyə keçid göstərilməlidir; üzvlük səhifəsi üçün isə cədvəlin qaydasını izah edən qısa qeyd.

**Seed**

- **FR-014**: Yayım zamanı `beynelxalq-teskilatlarda-uzvluk` səhifəsinin az məzmunu boş və ya yer tutucu (`<p>Beynəlxalq təşkilatlarda üzvlük</p>`) olduqda Figma-dakı 14 sətirlik cədvəllə əvəz olunmalıdır.
- **FR-015**: Həmin səhifənin en tərcüməsi yoxdursa, ya da en məzmunu boş/yer tutucudur və en başlıq az başlıqla eynidirsə (redaktorun surəti), en başlıq, slug `membership-in-international-organizations` (en dilində boşdursa) və en cədvəl yazılmalıdır.
- **FR-016**: Seed təkrar işlədikdə və ya redaktor məzmunu dəyişdikdən sonra heç nəyi dəyişməməli, səhifə yoxdursa heç nə yaratmamalıdır.

**Sənədlər**

- **FR-017**: Redaktor təlimatı (`cooperation-cms-guide.md`), `CLAUDE.md` qeydləri (kök, `web-cbar-new`, `web-cbar-admin-new`) və `business_logic` sənədləri eyni dəyişiklikdə yenilənməlidir.
- **FR-018**: Admin menyusunun yeni quruluşu menyuya istinad edən bütün sənədlərdə eyni dəyişiklikdə əks olunmalıdır (istifadəçi tələbi, 2026-11-16):
  - redaktor təlimatları (`web-cbar-new/docs/about-cms-guide.md`, `media-cms-guide.md`, `cooperation-cms-guide.md`, `how-to-use.md`): bölmə adları qrup yolu ilə yazılır, məsələn "**Media → Tədbirlər**", "**Beynəlxalq əməkdaşlıq → Memorandumlar**", "**Haqqımızda → Təşkilat → Şöbələr**";
  - `web-cbar-admin-new/CLAUDE.md` (`sidebar (5 qrup)` qeydi, yeni bölmə resepti: bəndin hansı qrupa düşdüyü və qrup seçmə qaydası) və `web-cbar-admin-new/docs/how-to-use.md` (yeni bölmə addımları);
  - kök `CLAUDE.md`-dəki panel bölmələrinin adları (spec 034, 038, 039, 044, 045 qeydləri) və `business_logic/new_business_logic.md`-dəki admin naviqasiyası təsviri.
  Spec-in qəbulu üçün bu sənədlərdə köhnə düz menyu təsviri qalmamalıdır.

### Key Entities *(include if feature involves data)*

- **Üzvlük sətri** (saxlanılan obyekt deyil, səhifə mətnindəki cədvəlin bir sətri): təşkilatın adı (link ola bilər), üzvlük ili, cədvəldəki sırası.
- **Menyu qrupu**: saytın bir bölməsinə uyğun ad (az/en), sırası və tərkibindəki idarə ekranları.
- **Səhifə → bölmə keçidi**: səhifənin slug-ı ilə onun ayrıca məzmununu idarə edən panel bölməsi arasındakı uyğunluq.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desktop, tablet və mobil endə başlıq, çeşidləmə, cədvəl, aralıqlar və tipoqrafiya `contracts/ui-contract.md` ilə 1px dəqiqliklə üst-üstə düşür.
- **SC-002**: Redaktor yeni üzvlüyü 1 dəqiqədən az vaxtda əlavə edib dərc edir, HTML yazmadan və yeni bölmə öyrənmədən.
- **SC-003**: Yayımdan sonra 14 üzvlük hər iki dildə əl işi olmadan görünür (səhifə mövcud və redaktə olunmamışdırsa).
- **SC-004**: Çeşidləmə dəyişəndə bütün sətirlər düzgün sırada qalır, heç biri itmir.
- **SC-005**: Sol menyunun ilk görünüşündə (qruplar bağlı) 12-dən çox sətir yoxdur (əvvəl 25 bənd + 5 başlıq); hər idarə ekranına menyudan ən çox iki kliklə çatılır.
- **SC-006**: Redaktor ayrıca bölmədən gələn səhifənin idarə ekranını səhifə redaktorundan bir kliklə tapır.
- **SC-007**: Seed-in təkrar tətbiqi heç bir dəyişiklik və ya dublikat yaratmır, redaktor dəyişikliklərini əzmir.
- **SC-008**: Hər iki frontend-in `verify` yoxlaması (layout qoruyucusu daxil) yaşıl keçir.
- **SC-009**: Redaktor təlimatlarında adı çəkilən hər panel bölməsi menyuda təlimatda yazılan qrup yolu ilə tapılır (100%, əl ilə yoxlama).

## Assumptions

- **API dəyişikliyi yoxdur.** Heç bir endpoint, cavab forması və ya OpenAPI dəyişmir; `api-cbar` dəyişmir. `api-cbar-admin`-ə yalnız seed migration-u (yeni fayl, mövcud cədvəllərə `ALTER TABLE` yoxdur) əlavə olunur. Deploy sırası: `api-cbar-admin` (seed), sonra `web-cbar-new`; `web-cbar-admin-new` istənilən vaxt.
- **Admin menyusunun bölgüsü** — qrup adları saytın üst menyusundakı bölmə adlarıdır, sıra da saytın sırasıdır (test mühitinin səhifə ağacı ilə
  tutuşdurulub, 2026-11-16; [research.md](./research.md) R7):
  - qrupsuz, yuxarıda: İdarə paneli, Səhifələr, Media kitabxanası;
  - "Haqqımızda": Təşkilat, KSM layihələri;
  - "Bazar iştirakçıları" → MEAS (tək bənd, başlıqsız);
  - "Hüquqi aktlar" → Qanunlar (tək bənd, başlıqsız);
  - "Milli pul nişanları" → Pul nişanları (tək bənd, başlıqsız);
  - "Statistika": Məzənnələr, AZIR, İnflyasiya, Gəlirlik əyriləri;
  - "Media": Press relizlər, Tədbirlər, Yayım qrafiki, Qalereyalar, Videolar;
  - "Beynəlxalq əməkdaşlıq": Maliyyə təşkilatları, Memorandumlar;
  - "Ana səhifə": Ana səhifə blokları, Məlumat sətirləri, Canlı yayımlar, Şəkilli popup-lar;
  - "İdarəetmə": İstifadəçilər, Parametrlər.
- Menyu qruplarının ilk vəziyyəti: yalnız aktiv ekranın qrupu açıqdır. Vəziyyət yalnız həmin brauzerdə saxlanır, istifadəçilər arasında paylaşılmır.
- "Səhifələrin alt menyusu" ideyası belə həll olunur: menyu saytın bölmələrini əks etdirir və səhifə redaktorundan bölməyə keçid var. Səhifə ağacının özünə idarə ekranlarını qoşmaq (ağacda səhifənin altında bölmə bəndi) bu spec-ə daxil deyil.
- Seed-in az məzmunu Figma-dandır. En təşkilat adları Figma-da yoxdur: tərcümə qaralamasıdır, redaktor yoxlamalıdır.
- Gizli cədvəl başlığı (Figma-da `visible: false`) yalnız ekran oxuyucusu üçündür, ekranda görünmür.
- Səhifələmə və axtarış yoxdur: Figma bütün sətirləri bir cədvəldə göstərir. Üzvlük mətnləri sayt axtarışında səhifənin adi mətni kimi tapılır.
- Üzvlük tarixi yalnız ildir (Figma); tam tarix tələb olunmur.
- Legacy URL yönləndirməsi lazım deyil: köhnə saytda bu səhifə yoxdur.
