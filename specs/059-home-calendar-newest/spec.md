# Feature Specification: Ana səhifənin "Təqvim" bloku — tarixə görə ən yeni 3 tədbir

**Feature Branch**: `059-home-calendar-newest`

**Created**: 2026-11-25

**Status**: Draft

**Input**: "seçilmiş calendar frame-inə bax və mənə web-cbar-new-də qurmaq lazımdır, oranı tədbirin ən son daxil edilmiş 3 tədbiri görünsün, klik
ediləndə tədbirlərə keçid olsun. Bunun üçün bir spec yaradaq və icrasına başlayaq" (Figma `813:25284`, "calendar").

Qərarlar (2026-11-25, istifadəçi):

1. **"Ən son 3" = tədbir tarixinə görə ən yeni 3 tədbir**, keçmiş və ya gələcək fərq etmir. Tədbirin panelə əlavə olunma vaxtı nəzərə alınmır.
2. **Klik tədbirin öz səhifəsini açır**: bütün sətir kliklənir. Blokun "Təqvim" başlığı isə tədbirlər siyahısına (`/media/events`) keçiddir.

Agentin qəbul etdiyi defoltlar (istifadəçi düzəldə bilər):

3. Eyni gündə olan tədbirlərdən saatı gec olan əvvəl gəlir, saatı olmayan sonra, sonra başlığa görə. Çoxgünlük tədbir başlama gününə görə sıralanır.
4. Sətirdə ayrıca "Ətraflı" düyməsi və ya "Bütün tədbirlər" linki yoxdur (Figma-da yoxdur). Siyahıya keçid başlıqdır.
5. Keçmiş tədbir də sətirdə eyni görünür (tarix qutusu, etiket, başlıq, saat). "Keçmiş" nişanı yoxdur.

**Köhnə vəziyyət** (`product-host`, `web-cbar-new`, `api-cbar`, 2026-11-25):

- Köhnə saytın ana səhifəsində tədbir bloku **yoxdur** (`product-host/visitor/views/home/index.php`). Blok Figma redizaynının yeni hissəsidir (spec 022
  FR-014). Spec 034-dən bəri məlumatı tədbirlər API-sindən gəlir.
- Yeni saytda blok qurulub və Figma-ya uyğundur: 424 px qutu, üç sətir (74 px tarix qutusu: gün + ay, etiketlər, başlıq, saat). Amma yalnız **ən yaxın
  gələcək** 3 tədbiri göstərir. Gələcək tədbir yoxdursa blok tamamilə gizlənir, halbuki keçmiş tədbirlər var.
- Sətirdə yalnız başlıq linkdir. Tarix qutusu və etiketlər klikə cavab vermir. "Təqvim" başlığı link deyil.
- İctimai tədbirlər siyahısı sırası ya artan tarixdir (bütün tədbirlər və ya yalnız gələcəklər), ya da azalan tarixdir (yalnız keçmişlər). **Bütün
  tədbirləri azalan tarixlə** almaq mümkün deyil, ona görə blok "ən yeni 3"-ü özü hesablaya bilmir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi ana səhifədə tarixə görə ən yeni 3 tədbiri görür (Priority: P1)

Ziyarətçi ana səhifəni açır. "Təqvim" blokunda tədbir tarixinə görə ən yeni üç tədbir görünür. Sırada ən yeni birinci gəlir. Gələcək tədbirlər varsa
onlar əvvəldədir, sonra keçmişlər. Gələcək tədbir olmasa da blok boş qalmır: son keçmiş tədbirlər görünür.

**Why this priority**: Bu, tələbin özüdür. Bugünkü blok gələcək tədbir olmayanda yox olur, redaktorun son əlavə etdiyi keçmiş tədbirlər isə ana
səhifəyə heç düşmür.

**Independent Test**: Tarixləri müxtəlif olan (keçmiş və gələcək) beşdən çox dərc olunmuş tədbiri olan bazada ana səhifəni açmaq. Blokda
tarixi ən böyük üç tədbir azalan sırada görünür.

**Acceptance Scenarios**:

1. **Given** dərc olunmuş tədbirlər 2026-12-10, 2026-11-28, 2026-11-20, 2026-10-15 tarixlidir (bu gün 2026-11-25), **When** ziyarətçi ana səhifəni
   açır, **Then** blokda 10 Dekabr, 28 Noyabr, 20 Noyabr tədbirləri bu sırada görünür, 15 Oktyabr görünmür.
2. **Given** bütün tədbirlər keçmişdədir, **When** ana səhifə açılır, **Then** blok görünür və ən son üç keçmiş tədbiri azalan sırada göstərir.
3. **Given** eyni gündə saat 15:00 və 11:00 olan iki tədbir var, **When** onlar ən yeni üçlüyə düşür, **Then** 15:00 olan əvvəl gəlir.
4. **Given** tədbir ziyarətçinin dilində dərc olunmayıb (o dildə başlığı yoxdur və ya dildə gizlidir), **When** ana səhifə həmin dildə açılır,
   **Then** o tədbir sayılmır və növbəti tədbir onun yerini tutur.
5. **Given** cəmi bir və ya iki tədbir var, **When** ana səhifə açılır, **Then** blok yalnız onları göstərir.

---

### User Story 2 — Ziyarətçi tədbirə klik edib onun səhifəsinə keçir (Priority: P1)

Ziyarətçi blokdakı sətrin istənilən yerinə (tarix qutusu, etiket, başlıq, saat) klik edir və həmin tədbirin səhifəsi açılır. Blokun "Təqvim"
başlığına klik etdikdə bütün tədbirlərin siyahısı açılır.

**Why this priority**: Tələbin ikinci yarısıdır. Bloku kliklənən etmədən ziyarətçi tədbir haqqında ətraflı məlumata çata bilmir.

**Independent Test**: Ana səhifədə hər sətrə ayrı-ayrılıqda (tarix qutusu, başlıq) klik etmək və klaviatura ilə Tab + Enter. Hər biri düzgün
tədbir səhifəsini açır. Başlıq siyahını açır.

**Acceptance Scenarios**:

1. **Given** sətir yeni tədbirə aiddir, **When** ziyarətçi sətrin tarix qutusuna klik edir, **Then** `/{dil}/media/events/{slug}` açılır.
2. **Given** sətir köhnə saytdan gələn (CMS səhifəsinə bağlı) tədbirə aiddir, **When** ziyarətçi klik edir, **Then** həmin CMS səhifəsi öz köhnə
   ünvanında açılır.
3. **Given** ziyarətçi klaviatura ilə gəzir, **When** Tab-a basır, **Then** hər sətir bir dəfə fokus alır (sətir başına bir fokus nöqtəsi), fokus
   görünür və Enter tədbiri açır.
4. **Given** ziyarətçi "Təqvim" başlığına klik edir, **Then** `/{dil}/media/events` siyahısı açılır.
5. **Given** ekran oxuyucu istifadəçisi, **When** sətrin linkinə çatır, **Then** linkin adı tədbirin başlığıdır, tarix və saat ayrıca oxunur.

---

### Edge Cases

- Tədbirlər API-si cavab vermir və ya xəta qaytarır: blok gizlənir, ana səhifənin qalanı açılır (spec 034 US5 davranışı qalır).
- Heç bir dərc olunmuş tədbir yoxdur: blok gizlənir. "Strategiya və sənədlər" bloku tək qalırsa öz yerində qalır.
- Çoxgünlük tədbir (məs. 20–22 Noyabr): başlama gününə görə sıralanır, tarix qutusunda başlama günü görünür (bugünkü kimi).
- Uzaq gələcəkdə tədbir (məs. növbəti ilin) varsa o birinci gəlir. Bu, "tarixə görə ən yeni" qərarının nəticəsidir.
- Saytın yeni versiyası tədbirlər API-sinin yeni sırası olmadan yayımlanırsa: API naməlum parametri nəzərə almır və blok ən **köhnə** üç tədbiri
  göstərər. Ona görə API əvvəl yayımlanır (FR-008).
- Sıralama parametrinin səhv dəyəri: API 400 qaytarır, səssizcə başqa sıra seçmir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ana səhifənin "Təqvim" bloku ziyarətçinin dilində dərc olunmuş tədbirlər arasından tədbir tarixinə görə ən yeni **3** tədbiri
  göstərməlidir: keçmiş və gələcək birlikdə, başlama tarixi azalan sırada.
- **FR-002**: Eyni başlama günü olan tədbirlər daha gec saat əvvəl, saatı olmayan sonra, sonra başlığa görə sıralanmalıdır.
- **FR-003**: Blok yalnız ictimai tədbirləri saymalıdır: dərc olunmuş, silinməmiş, ziyarətçinin dilində görünən və başlığı olan.
- **FR-004**: Sətrin bütün sahəsi (tarix qutusu, etiketlər, başlıq, saat) bir keçid olmalı və tədbirin öz səhifəsini açmalıdır: CMS səhifəsinə
  bağlı köhnə tədbir həmin səhifəni, qalanları tədbir səhifəsini.
- **FR-005**: Hər sətirdə klaviatura üçün tək fokus nöqtəsi olmalıdır. Keçidin əlçatan adı tədbirin başlığıdır, fokus görünür olmalıdır.
- **FR-006**: Blokun "Təqvim" başlığı ziyarətçinin dilində tədbirlər siyahısına keçid olmalıdır. Başlığın səviyyəsi və görünüşü (Figma) dəyişmir.
- **FR-007**: İctimai tədbirlər siyahısı tədbirləri **tarixə görə azalan** sırada vermək seçimini təklif etməlidir. Bu seçim mövcud filtrlərlə
  (gələcək/keçmiş, axtarış, tarix aralığı, növ, kateqoriya) birləşə bilir. Səhv seçim dəyəri xəta qaytarır. Seçim verilməyəndə bugünkü sıra
  dəyişmir, ona görə tədbirlər səhifəsi və digər istifadəçilər təsirlənmir.
- **FR-008**: Yayım sırası: əvvəl ictimai API, sonra sayt. Spec bunu tasks-da ayrıca addım kimi yazır.
- **FR-009**: Heç bir tədbir olmayanda və ya API xətasında blok gizlənir. Ana səhifənin qalanı təsirlənmir.
- **FR-010**: Blokun görünüşü Figma `813:25284`-ə uyğun qalır: 424 px qutu, 20 px daxili boşluq, sətirlər arası 16 px, 74 px tarix qutusu.
  Kliklənən sətir üzərinə gələndə başlıq vurğulanır (bugünkü hover kimi).
- **FR-011**: Admin panel, verilənlər bazası sxemi və tədbirlər səhifəsi (`/media/events`) dəyişmir.

### Key Entities

- **Tədbir** (spec 034, dəyişmir): başlama və bitmə tarixi, istəyə bağlı saat, növ (etiket), dil üzrə başlıq və slug, köhnə tədbir üçün CMS
  səhifəsi. Blok bunlardan tarix, saat, etiket, başlıq və keçidi götürür.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Hər iki dildə ana səhifədə görünən üç tədbir test mühitindəki tədbirlər arasında tarixə görə ən yeni üçlükdür (siyahı səhifəsi ilə
  əl ilə müqayisə, 100% uyğunluq).
- **SC-002**: Ziyarətçi tədbir səhifəsinə bir klikdə çatır: sətrin istənilən nöqtəsinə klik və ya Tab + Enter (3 sətrin hamısında).
- **SC-003**: Gələcək tədbir olmayan bazada blok yenə görünür (bu gün gizlənir).
- **SC-004**: Tədbirlər səhifəsinin (`/media/events`) cavabı və sırası dəyişiklikdən əvvəlki ilə eynidir.
- **SC-005**: Blokun ölçüləri Figma ilə 1 px dəqiqliklə uyğun qalır (desktop, 1440 px).

## Assumptions

- "Ən son daxil edilmiş" istifadəçinin seçimi ilə **tədbir tarixi** mənasındadır, panelə əlavə olunma vaxtı yox (Qərar 1).
- Etiket bugünkü kimi tədbirin növüdür (məs. "Mətbuat konfransı"). Figma-dakı ikinci etiket ("Press-reliz") verilənlərdə ayrıca sahə deyil və
  qurulmur.
- Ayın adı ziyarətçinin dilində yazılır (bugünkü kimi). İl göstərilmir (Figma-da yoxdur).
- Tədbirlər API-si hər sorğuda bazadan oxuyur, ona görə redaktorun yeni tədbiri ana səhifədə dərhal (keşin ömrü qədər) görünür.

## Paritet cədvəli (Konstitusiya I.3)

| Köhnə sayt | Yeni qarşılıq | Status |
|---|---|---|
| Ana səhifədə tədbir/təqvim bloku | — | Köhnə saytda yoxdur. Figma-nın yeni blokudur (spec 022, spec 034) |
| — | "Təqvim" bloku: tarixə görə ən yeni 3 tədbir, sətir tədbirə aparır | Dəyişir (əvvəl: ən yaxın gələcək 3) |
| — | İctimai tədbirlər siyahısında "tarixə görə azalan" sıra seçimi | Əlavə olunur (mövcud sıralar dəyişmir) |
