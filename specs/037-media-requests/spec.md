# Feature Specification: Media sorğuları — Figma görünüşü, məzmun admin paneldən

**Feature Branch**: `037-media-requests`

**Created**: 2026-11-06

**Status**: Implemented

**Input**: "Media sorğuları hissəsində adminkadan uyğun dəyişiklikləri də nəzərə alaq, səhifəni əlavə edəndə kontentə
ediləcək dəyişiklikləri də nəzərə alaq, adminkadan editləmək olmalıdır. Kontent dizaynı HTML kimi nəzərdə tutulursa,
onu ayrıca root folderdə ver, kopyalayıb adminkanın editoruna ataram."

**Figma**: `Media - Media sorğuları` `1308:29839` (desktop, 1728). Məzmun frame-i `1599:27017`, 984 en:

- H1 `1308:29850`: 32/600, lh44. Başlıqdan gövdəyə 36.
- Gövdə mətni `1599:27006`: iki abzas, 16/400, lh28, rəng `#222222`.
- Bölmə `1792:6720`: başlıq "Media ilə əməkdaşlıq" 18/500 lh24, izah mətni 16/400 lh28, aralarında 20.
- Kontakt kartları `1792:6701`: iki kart yan-yana, gap 24, hər biri 480×196, padding 24, gap 16, radius 4,
  haşiyə `#D4D4D4` (INSIDE), ağ fon. İkon qutusu 48×48, dairə, `#F5F5F5`. Ad 14/600, dəyər 18/500 lh24,
  əlavə mətn 14/400 lh28, mətn sətirləri arası 6.
- Sol menyu `1709:62728` və breadcrumb mövcud bölmə şablonundandır.

Gizli (`visible:false`) elementlər **saytda yoxdur**: mavi giriş qutusu `1599:27004`, "Son yenilənmə" `1308:29846`,
xətt `1308:29845`, "Media request CTA" `1792:6743`.

**Hazırkı vəziyyət** (test API, 2026-11-06): səhifə artıq CMS-də var: id `519`, Media kökünün uşağı, az və en slug
`media-sorgulari`, başlıqlar "Media Sorğuları" / "Media sorgulari", məzmun placeholder-dir (`Media sorgulari`, `test`).
Şablon, breadcrumb və sol menyu işləyir, kontakt kartları yoxdur. Redaktorun mənbə rejimi var, lakin `class` və `div`
saxlanmır, ona görə kartlar yalnız redaktorun qoruduğu elementdən, cədvəldən qurula bilər.

**Tablet və mobil**: tablet `1660:28772`, mobil `1660:29307`. Ölçülər `contracts/ui-contract.md`-dədir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jurnalist əlaqə kanalını tapır (Priority: P1)

Jurnalist Media bölməsində "Media sorğuları" səhifəsini açır, Mərkəzi Bankın media siyasətini oxuyur və sorğunu hara
göndərəcəyini iki kartdan görür.

**Why this priority**: Səhifənin əsas məqsədi budur. Bu gün orada yalnız placeholder mətn var.

**Independent Test**: Hazır məzmunu olan səhifəni az və en dilində açmaq, kartları Figma ölçüləri ilə tutuşdurmaq.

**Acceptance Scenarios**:

1. **Given** məzmun doldurulub, **When** səhifə açılır, **Then** başlıq, iki abzas, "Media ilə əməkdaşlıq" bölməsi və iki kontakt kartı Figma sırası ilə görünür.
2. **Given** e-poçt kartı, **When** istifadəçi ünvana klikləyir, **Then** poçt proqramı həmin ünvanla açılır.
3. **Given** telefon kartı mobil cihazda, **When** istifadəçi nömrəyə toxunur, **Then** zəng başlanır və daxili nömrə kartda görünür.
4. **Given** en dili, **When** səhifə açılır, **Then** bütün mətn, o cümlədən kart adları, en məzmunundan gəlir.

---

### User Story 2 - Redaktor məzmunu admin paneldən dəyişir (Priority: P1)

Redaktor kod dəyişikliyi olmadan mətni, başlığı, e-poçtu, telefonu və daxili nömrəni admin panelin səhifə redaktorunda
dəyişir, dəyişiklik saytda görünür.

**Why this priority**: İstifadəçinin açıq tələbidir: heç bir mətn və kontakt kodda yazılmamalıdır.

**Independent Test**: Admin paneldə telefon nömrəsini dəyişib yadda saxlamaq, saytda kartda yeni nömrəni görmək.

**Acceptance Scenarios**:

1. **Given** redaktor açılıb, **When** cədvəlin bir xanası dəyişdirilib yadda saxlanır, **Then** uyğun kart yeni mətni göstərir.
2. **Given** redaktor cədvələ yeni sətir əlavə edir, **When** yadda saxlayır, **Then** saytda yeni kart görünür.
3. **Given** hazır HTML mənbə rejiminə yapışdırılıb, **When** səhifə yadda saxlanıb yenidən açılır, **Then** cədvəl, keçidlər və başlıq itmir.

---

### User Story 3 - Hazır məzmunun yerləşdirilməsi (Priority: P2)

İstifadəçi hər dil üçün hazır HTML faylını kopyalayıb redaktora yapışdırır və placeholder-i əvəz edir.

**Why this priority**: İlkin doldurma bir dəfəlikdir, amma ona görə səhifə əl ilə yığılmadan dərhal Figma görünüşünü alır.

**Independent Test**: Faylın məzmununu test mühitində səhifəyə yapışdırıb yadda saxlamaq və saytı açmaq.

**Acceptance Scenarios**:

1. **Given** repo kökündəki `media-sorgulari-html/`, **When** `az.html` və `en.html` yapışdırılır, **Then** hər iki dildə səhifə Figma görünüşündədir.

---

### Edge Cases

- Cədvəl yoxdur və ya qaydaya uymur (sətirdə 2–3 xana deyil, ad və ya dəyər boşdur): bütün cədvəl adi cədvəl kimi qalır, mətn itmir.
- Səhifədə ikinci cədvəl var: yalnız birincisi kart olur, qalanı adi məzmundur.
- Əlavə mətn sütunu boşdur: kartda həmin sətir yoxdur, kartlar eyni hündürlükdə qalır.
- Dəyər nə e-poçt, nə telefondur: kart ikonsuz göstərilir.
- Tək sətir: bir kart solda, Figma enində. Tək sayda sətir: son kart sətirdə tək qalır.
- Kart sayı 4-dən çoxdur: cədvəl adi cədvəl kimi qalır.
- Uzun e-poçt ünvanı kartdan çıxmır, sətrə bölünür.
- Bir dil boşdur: mövcud ümumi davranış qalır, xüsusi hal yoxdur.
- Redaktor slug-ı dəyişib: kart qaydası işləmir, səhifə adi məzmun kimi qalır, mətn itmir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Səhifə mövcud Media bölmə şablonunda (breadcrumb, paylaşma, sol menyu) və mövcud ünvanında qalmalıdır.
- **FR-002**: Başlıq, mətn, bölmə başlığı, kart adı, dəyər və əlavə mətn yalnız CMS məzmunundan gəlməlidir. Kodda heç biri yazılmamalıdır.
- **FR-003**: Yuxarı səviyyədəki birinci cədvəl, hər sətri 2–3 xanalı və sətir sayı 1–4 olduqda, kontakt kartlarına çevrilməlidir: 1-ci xana ad, 2-ci dəyər, 3-cü əlavə mətn.
- **FR-004**: Qaydaya uymayan cədvəl tam olaraq adi məzmun kimi qalmalıdır, heç bir mətn atılmamalıdır.
- **FR-005**: Kart ikonu dəyərdən seçilməlidir: e-poçt keçidi və ya `@` olan mətn üçün poçt, telefon keçidi və ya yalnız nömrədən ibarət mətn üçün telefon, qalan hallarda ikon yoxdur. Redaktor ikon seçmir.
- **FR-006**: Dəyərdəki keçid kartda işlək keçid kimi qalmalıdır.
- **FR-007**: Qayda yalnız bu səhifəyə tətbiq olunmalıdır (az və en slug-ı ilə). Media bölməsinin digər səhifələrində cədvəllər dəyişməməlidir.
- **FR-008**: Kartlardan əvvəlki bölmə başlığı və mətn Figma tipoqrafiyasını almalıdır, kartların görünüşü Figma `1792:6701`-ə uymalıdır. Gizli Figma elementləri göstərilməməlidir.
- **FR-009**: Görünüş tablet və mobildə Figma-nın həmin frame-lərinə uymalıdır, dar ekranda kartlar bir sütuna düşməlidir.
- **FR-010**: Admin redaktoru bu səhifənin cədvəlini, keçidlərini və başlığını yadda saxlama zamanı itirməməlidir, bu avtomatik yoxlama ilə qorunmalıdır.
- **FR-011**: Hər iki dil üçün hazır HTML repo kökündə `media-sorgulari-html/`-də olmalıdır, redaktora yapışdırma addımları ilə birlikdə.
- **FR-012**: Redaktor təlimatı (`docs/media-cms-guide.md`, `dokumentasiyalar/`) kart cədvəlinin qaydasını izah etməlidir.
- **FR-013**: API, verilənlər bazası və admin panel kodunda funksional dəyişiklik edilməməlidir, yalnız roundtrip testi əlavə olunur.

### Key Entities

- **Kontakt kartı**: redaktorun cədvəl sətrindən alınan görüntü. Ad, dəyər (keçidlə), istəyə bağlı əlavə mətn. Ayrıca saxlanmır.
- **Media sorğuları səhifəsi**: mövcud CMS səhifəsi `519`, az və en tərcüməsi ilə.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desktop-da kart, ikon qutusu, aralıqlar və şrift ölçüləri Figma rəqəmləri ilə 1 px dəqiqliyində uyğundur.
- **SC-002**: Redaktor telefon nömrəsini kod dəyişikliyi olmadan 1 dəqiqədən az vaxtda dəyişə bilir.
- **SC-003**: Saytda görünən məzmun mətnlərinin 100%-i admin paneldən dəyişdirilə bilir.
- **SC-004**: Hazır HTML yapışdırılıb yadda saxlandıqdan sonra cədvəl sətirlərinin, keçidlərin və başlıqların 100%-i qalır.
- **SC-005**: Digər səhifələrdəki cədvəllərin görünüşü dəyişmir.

## Assumptions

- Mövcud `519` səhifəsi işlədilir, yenisi yaradılmır. Slug-lar `media-sorgulari` olaraq qalır, başlıq dəyişəndə slug dəyişmir.
- EN mətni Figma-da yoxdur, `media-sorgulari-html/en.html`-dəki qaralama tərcümədir və redaksiya yoxlamasından keçməlidir.
- Telefon keçidi saytın başlığındakı kimi qısa `966` nömrəsinə gedir.
- "İnformasiya sorğusu" (`85`) Figma menyusunda yoxdur, amma hüquqi məzmun daşıyır. Ona toxunulmur, saxlamaq və ya gizlətmək redaksiya qərarıdır.
- Menyudakı digər fərqlər ("Məlumatların yayımlanması qrafiki", "Mərkəzi Bankın loqosu") bu spec-ə daxil deyil.
- Canlı CMS məzmununu istifadəçi özü yapışdırır, spec-in icrası məzmunu yazmır.
