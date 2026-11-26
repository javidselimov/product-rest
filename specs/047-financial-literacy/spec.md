# Feature Specification: Maliyyə savadlılığı bölməsinin Figma redizaynı

**Feature Branch**: `047-financial-literacy`

**Created**: 2026-11-16

**Status**: Draft

**Input**: "seçilən hissəni istəyirəm düzəldək, speckit ilə qurmaq istəyirəm. Əvvəlcə yoxla köhnə saytda nə var və yeni nə əlavə edilib,
ümumiləşdirək, Figma-dakı formada hazırlayaq."

Qərarlar (2026-11-16, istifadəçi):
1. Bloklar **redaktorun adi işarələməsindən** qurulur (spec 024, 044–046 kimi): API, sxem və admin panel dəyişmir.
2. Bölmənin sol menyusu Figma kimi **yalnız üç bənddir**: Maliyyə Savadlılığı portalı, Virtual Təhsil Platforması, Maliyyə məhsul və xidmətlərinin
   məlumat-axtarış sistemi. "Seminarlar/vebinarlar" və "Müsabiqələr" sol menyudan çıxır (spec 041), silinmir.
3. Figma mətni bazaya **seed migration** ilə yazılır, yalnız mətn hələ köhnə formadadırsa (0026/0028/0029 nümunəsi).
4. Əhatə **bütün bölmədir**: dörd Figma səhifəsi, hər biri desktop, tablet və mobil.
5. Bölmənin kök ünvanı "Ümumi məlumat"ın məzmununu Figma görünüşündə göstərir; "Ümumi məlumat"ın öz ünvanı köka yönlənir və sol menyuda görünmür.
6. "Maliyyə savadlılığı (Kopya)" səhifəsi seed ilə sol menyudan çıxarılır, silinmir.

**Figma** (fayl "cbar website (Copy)", səhifə "Financial Literacy" `2230:66160`):

| Section | Desktop 1728 | Tablet 744 | iPhone 390 |
|---|---|---|---|
| Maliyyə savadlılığı `2236:70088` | `2230:66161` (məzmun `2236:67755`) | `2248:2976` | `2248:3454` |
| Maliyyə Savadlılığı portalı `2412:92740` | `2261:4608` | `2416:81969` | `2416:82737` |
| Virtual Təhsil Platforması `2426:94160` | `2421:2284` | `2421:84435` | `2421:85108` |
| Məlumat-axtarış sistemi `2432:8299` | `2430:4707` | `2430:5349` | `2430:5995` |

Ölçülər plan mərhələsində `contracts/ui-contract.md`-yə yazılır.

**Köhnə vəziyyət** (DB dump `schema-new/cbar-schema-and-data-20260914.sql`; test mühiti plan mərhələsində yoxlanır):

| id | Səhifə (az slug) | Məzmun | Figma |
|---|---|---|---|
| 106 | Maliyyə savadlılığı (`maliyye-savadliligi`) | bölmə kökü; mətni və 7 şəkli 107-nin bayt-bayt surətidir (redaktorlar köçürüb, research R1) | "Maliyyə savadlılığı" |
| 107 | Ümumi məlumat (`umumi-melumat`) | 12 adi paraqraf, `mmpi@cbar.az`, 7 şəkil linki (`/media/1380–1386`); en tam | kökün məzmunu |
| 108 | Seminarlar/vebinarlar | illik akkordeon + tarix/link cədvəli; en-də gizli | yoxdur |
| 109 | Müsabiqələr | tarix/link cədvəli; en-də gizli | yoxdur |
| 110 | Maliyyə Savadlılığı portalı | adi paraqraflar, bizimpullar.az | öz səhifəsi |
| 111 | Virtual Təhsil Platforması | adi paraqraflar, edu.e-cbar.az, YouTube linkləri | öz səhifəsi |
| 112 | Maliyyə məhsul və xidmətlərinin məlumat-axtarış sistemi | adi paraqraflar, infobank.az, `infobank@cbar.az`, 3 şəkil linki | öz səhifəsi |
| 452 | Maliyyə savadlılığı (Kopya) (`maliyye-savadliligi-copy`) | bölmənin qaralama alt ağacı: altında 107–112-nin "(Kopya)" surətləri (453–458); dərc olunub, görünür | yoxdur |

Yeni saytda bu bölmə üçün xüsusi heç nə yoxdur: səhifələr adi məzmun kimi göstərilir.

**Köhnədən yeniyə nə dəyişir** (məzmun eynidir, quruluş yenidir):

- *Ümumi məlumat*: bölmə başlıqları ("İnsan maliyyə cəhətdən necə sağlam ola bilər?", "Maliyyə savadlılığı nədir?", "Maliyyə sağlamlığının dörd
  prinsipi", "Mərkəzi Bankın fəaliyyəti"); İƏİT tərifi mənbəli sitat kimi; köhnədə bir cümlədə sadalanan dörd vərdiş **4 prinsip kartı** (Dayanıqlı
  gəlir, Səmərəli xərcləmə, Effektiv qənaət, Rasional sərmayə, hər birinə qısa təsvir — Figma-da yeni mətn); köhnədə bir cümlədə sadalanan hədəf
  qrupları **7 etiket** ("Əsas hədəf qrupları"); "Maarifləndirmə formatları" alt başlığı; 7 şəkil **foto qalereya**; son üç paraqraf **CTA banneri**
  ("Sizi də bu təşəbbüslərə qoşulmağa dəvət edirik!", "Maliyyə sağlamlığınızın qayğısına birlikdə qalaq!", ünvan sətri, "mmpi@cbar.az-a yazın" düyməsi).
- *Üç platforma səhifəsi* — eyni şablon: giriş paraqrafları, bir **vurğulanmış cümlə** ("…heç bir qeydiyyat tələb olunmur", "…bütün resurslar
  ödənişsizdir", "…mütəmadi olaraq monitorinq olunur…"), **foto qalereya** (Virtual 3, infobank 3; portalda yoxdur), **alt başlıqlı bölmələr**
  (portal: Maliyyə xidmətləri, Mərkəzi Bank, Pullar, "Mərkəzi Bank" oyun simulyatoru, Xəbərlər, Digər bölmələr; Virtual: Distant tədris modulları,
  Qeydiyyat, Sertifikat, Uşaqlar üçün kurslar, Əlaqə; infobank: Necə işləyir, Əlaqə) və sonda **platformaya keçid** sətri ("Portala keçid:
  www.bizimpullar.az", "Platformaya keçid: edu.e-cbar.az", "Sistemə keçid: infobank.az"). Virtual səhifəsində yeni əlaqə ünvanı var: `edu@cbar.az`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ziyarətçi "Maliyyə savadlılığı" səhifəsini Figma görünüşündə oxuyur (Priority: P1)

Ziyarətçi üst menyudan "Maliyyə savadlılığı"nı açır: breadcrumb, paylaşma düymələri, solda üç bəndli bölmə menyusu, sağda başlıq, giriş, bölmə
başlıqları, İƏİT sitatı, dörd prinsip kartı, hədəf qrupu etiketləri, foto qalereya və sonda CTA banneri görür. Banner düyməsi poçt proqramını
`mmpi@cbar.az` ünvanı ilə açır.

**Why this priority**: Bölmənin giriş səhifəsidir və Figma-nın əsas kadrıdır.

**Independent Test**: Seed olunmuş bazada kök ünvanı az və en dilində desktop, tablet və mobil endə açmaq, ölçüləri `contracts/ui-contract.md` ilə
tutuşdurmaq; qalereyada şəkli açmaq; CTA düyməsini yoxlamaq.

**Acceptance Scenarios**:

1. **Given** seed tətbiq olunub, **When** ziyarətçi `/az/maliyye-savadliligi` açır, **Then** Figma `2236:67755`-dəki bloklar həmin sırada göstərilir: başlıq, giriş, "Necə sağlam olmaq", "Tərif" (sitat + mətn), "Prinsiplər" (giriş + 4 kart + yekun), "Mərkəzi Bankın fəaliyyəti" (mətn + 7 etiket + "Maarifləndirmə formatları" + qalereya), CTA.
2. **Given** açıq səhifə, **When** ziyarətçi qalereyada şəklə klikləyir, **Then** şəkil böyüdülmüş baxışda açılır və digər şəkillərə keçmək olur (saytın mövcud qalereya davranışı).
3. **Given** açıq səhifə, **When** ziyarətçi CTA düyməsinə klikləyir, **Then** `mailto:mmpi@cbar.az` açılır.
4. **Given** tablet və mobil ekran, **When** səhifə açılır, **Then** kartlar, etiketlər, qalereya və banner Figma tablet/iPhone kadrlarındakı düzülüşdə göstərilir, üfüqi sürüşmə yaranmır.
5. **Given** səhifə en dilində açılır, **Then** en mətn eyni bloklarla göstərilir (az mətn yox).
6. **Given** ziyarətçi köhnə ünvanla `/az/maliyye-savadliligi/umumi-melumat` (və ya en `general-information`) açır, **Then** kök ünvana daimi yönləndirilir.

---

### User Story 2 - Ziyarətçi platforma səhifələrini Figma görünüşündə oxuyur (Priority: P1)

Ziyarətçi sol menyudan "Maliyyə Savadlılığı portalı", "Virtual Təhsil Platforması" və ya "Maliyyə məhsul və xidmətlərinin məlumat-axtarış sistemi"ni
açır: giriş, vurğulanmış cümlə, (varsa) foto qalereya, alt başlıqlı bölmələr və platformaya keçid sətri görür.

**Why this priority**: Figma-da bölmənin qalan üç səhifəsidir; sol menyu yalnız bunlara aparır.

**Independent Test**: Seed olunmuş bazada üç səhifəni az/en, üç endə açmaq və Figma ilə tutuşdurmaq; xarici keçidin yeni pəncərədə açıldığını yoxlamaq.

**Acceptance Scenarios**:

1. **Given** seed tətbiq olunub, **When** portal səhifəsi açılır, **Then** giriş, vurğulanmış cümlə, altı alt başlıqlı bölmə və "Portala keçid: www.bizimpullar.az" sətri Figma kimi göstərilir; qalereya yoxdur.
2. **Given** Virtual Təhsil Platforması səhifəsi, **Then** giriş, vurğulanmış cümlə, 3 şəkilli qalereya, beş bölmə (Əlaqə daxil) və "Platformaya keçid" sətri göstərilir.
3. **Given** məlumat-axtarış sistemi səhifəsi, **Then** giriş, vurğulanmış cümlə, 3 şəkilli qalereya, "Necə işləyir" və "Əlaqə" bölmələri və "Sistemə keçid" sətri göstərilir.
4. **Given** hər hansı keçid sətri, **When** ziyarətçi klikləyir, **Then** platforma yeni pəncərədə açılır.
5. **Given** sol menyu, **Then** üç bənd göstərilir və açıq səhifənin bəndi aktiv işarələnib; breadcrumb "Ana səhifə › Maliyyə savadlılığı › <səhifə>".

---

### User Story 3 - Bölmə naviqasiyası Figma ilə uyğundur (Priority: P1)

Ziyarətçi bölmənin hansı səhifəsində olursa olsun, sol menyuda yalnız üç platforma bəndini görür; "Seminarlar/vebinarlar", "Müsabiqələr", "Ümumi
məlumat" və "(Kopya)" orada yoxdur. Üst menyu, hamburger menyu, footer və breadcrumb dəyişmir (spec 041 qaydası).

**Why this priority**: Figma-nın menyusu budur; gizlədilən səhifələr isə hələ birbaşa ünvanla açılmalıdır.

**Independent Test**: Bölmənin hər səhifəsini açıb sol menyunu yoxlamaq; Seminarlar və Müsabiqələr səhifələrini birbaşa ünvanla açmaq.

**Acceptance Scenarios**:

1. **Given** seed tətbiq olunub, **When** bölmənin istənilən səhifəsi açılır, **Then** sol menyuda üç bənd var, sırası Figma kimi: Portal, Virtual Təhsil Platforması, Məlumat-axtarış sistemi.
2. **Given** ziyarətçi `/az/maliyye-savadliligi/seminarlar-vebinarlar` açır, **Then** səhifə bölmə şablonunda mövcud məzmunla açılır (akkordeon və cədvəl işləyir); sol menyuda üç bəndə əlavə olaraq yalnız açıq səhifənin özü görünür (spec 041).
3. **Given** redaktor paneldə "Sol menyuda göstər" bayrağını yenidən yandırır, **Then** səhifə sol menyuya qayıdır (seed redaktorun sonrakı seçimini əzmir).

---

### User Story 4 - Redaktor bölməni adi redaktorla idarə edir (Priority: P2)

Redaktor paneldə səhifəni açır və adi alətlərlə (başlıq, sitat, siyahı, cədvəl, şəkil linki) mətni dəyişir: kartı, etiketi və ya bölməni əlavə edir,
silir. Ayrıca bölmə öyrənmək lazım deyil; qayda redaktor təlimatında yazılıb.

**Why this priority**: Məzmun gələcəkdə proqramçısız yenilənməlidir, amma ilk görünüş seed ilə gəlir.

**Independent Test**: Panel redaktorunda nümunə səhifəni açıb dəyişmədən saxlamaq (bayt-bayt eyni); bir prinsip kartı və bir etiket əlavə edib saytda görmək.

**Acceptance Scenarios**:

1. **Given** redaktor səhifəni açıb dəyişmədən saxlayır, **Then** işarələmə dəyişmir (heç bir blok itmir).
2. **Given** redaktor prinsiplər siyahısına beşinci kart əlavə edir, **Then** saytda beş kart göstərilir, düzülüş pozulmur.
3. **Given** redaktor hədəf qrupu siyahısından bir etiketi silir, **Then** saytda altı etiket göstərilir.
4. **Given** redaktor təlimatı, **Then** hər blokun işarələmə qaydası (hansı başlıq, sitat, siyahı, şəkil linkləri, CTA) nümunə ilə yazılıb və menyu yolu panelin cari menyusuna uyğundur.

---

### User Story 5 - Figma məzmunu əl işi olmadan gəlir (Priority: P2)

Dəyişiklik yayımlananda dörd səhifənin köhnə mətni Figma quruluşunda yenidən yazılır (az + en qaralama), naviqasiya bayraqları qoyulur.

**Why this priority**: Yayım günü səhifələr Figma kimi görünməlidir; görünüşü onsuz da əl ilə yazılmış nümunə ilə yoxlamaq olar.

**Independent Test**: Köhnə mətnli, artıq redaktə olunmuş və səhifələri olmayan bazalara seed tətbiq etmək; təkrar tətbiq etmək.

**Acceptance Scenarios**:

1. **Given** səhifələrin az/en mətni hələ köhnə formadadır, **When** seed tətbiq olunur, **Then** mətn Figma quruluşunda yazılır; şəkil linkləri (`/media/1380–1386`, `/media/1393–1395`) saxlanır.
2. **Given** redaktor mətni artıq dəyişib, **When** seed tətbiq olunur, **Then** həmin səhifənin mətni dəyişmir.
3. **Given** bazada bu səhifələr yoxdur (slug ilə tapılmır), **When** seed tətbiq olunur, **Then** heç nə yaranmır, yayım dayanmır.
4. **Given** seed artıq tətbiq olunub, **When** yenidən işləyir, **Then** dəyişiklik və dublikat yoxdur.
5. **Given** seed tətbiq olunub, **Then** Ümumi məlumat, Seminarlar/vebinarlar, Müsabiqələr və (Kopya) səhifələri sol menyudan çıxıb; heç bir səhifə silinməyib və ya görünməz edilməyib.

---

### Edge Cases

- Kök Figma görünüşünü **öz mətnindən** alır. Mətn 107-dən oxunmur, çünki bütün mühitlərdə kökün mətni artıq Ümumi məlumatın surətidir (research R1). Kökün mətni boş olsa, bu günkü davranış qalır: alt səhifə kartları göstərilir.
- "Ümumi məlumat" silinib və ya dərcdən çıxarılıb: kök dəyişmir; köhnə ünvan yenə köka yönlənir.
- "(Kopya)" alt ağacı (452–458) sol menyudan çıxır, amma qaralama səhifələri birbaşa ünvanla açılır və orijinalın görünüşünü alır.
- Mətndə gözlənilən blok yoxdur (sitat, kart siyahısı, etiket siyahısı, şəkil linkləri, CTA): həmin blok göstərilmir, qalan mətn adi məzmun kimi yerində qalır.
- Prinsip kartı və ya etiket sayı Figma-dan fərqlidir (0, 1, 9): olduğu qədər göstərilir; 0 olduqda blokun başlığı da çıxır.
- Kartın təsviri yoxdur: yalnız başlıq göstərilir.
- Qalereyada şəkil linki işləmir (media silinib): şəkil yerində saytın mövcud xəta/boş vəziyyəti göstərilir, digər şəkillər işləyir.
- CTA-da poçt ünvanı yoxdur və ya link deyil: banner mətnlə göstərilir, düymə çıxır.
- Platforma səhifəsində keçid sətri yoxdur: sətir göstərilmir.
- En mətnində bəzi bloklar yoxdur: en səhifə öz mətnindəki blokları göstərir, az-dan götürmür.
- Seminarlar və Müsabiqələr en dilində gizlidir (`show_en=false`): en dilində bölmədə görünməmək davam edir.
- "(Kopya)" (`-copy`) slug-ı: digər `-copy` qaralamaları kimi orijinalın görünüşünü alır (spec 044–046 qaydası).
- JavaScript yoxdur: bütün bloklar oxunur, CTA və keçidlər işləyir; qalereya şəkilləri link kimi açılır.
- Çap: bloklar tam çap olunur, paylaşma düymələri və menyu çap olunmur (bölmə şablonunun mövcud qaydası).
- Footer-dəki "Faydalı linklər" (bizimpullar.az, edu.e-cbar.az, infobank.az) xarici sayta aparmağa davam edir; bu spec onları dəyişmir.

## Requirements *(mandatory)*

### Functional Requirements

**Sayt — bölmə şablonu və naviqasiya**

- **FR-001**: "Maliyyə savadlılığı" bölməsinin bütün səhifələri bölmə şablonunda (breadcrumb, paylaşma, sol menyu — spec 028/043) göstərilməlidir.
- **FR-002**: Bölmənin kök ünvanı (az `maliyye-savadliligi`, en `financial-literacy`) "Ümumi məlumat"ın məzmununu "Maliyyə savadlılığı" başlığı ilə göstərməlidir. Bu məzmun kökün öz mətnidir (research R1).
- **FR-003**: "Ümumi məlumat"ın öz ünvanları (az və en slug-lar, həmçinin köhnə saytın uyğun ünvanı varsa) kök ünvana daimi yönləndirilməlidir.
- **FR-004**: Sol menyu bölmənin səhifə ağacından qurulmalı və seed-dən sonra yalnız Portal, Virtual Təhsil Platforması və Məlumat-axtarış sistemini göstərməlidir; gizlədilən səhifələr spec 041 qaydası ilə yalnız açıq olduqda görünür.

**Sayt — "Maliyyə savadlılığı" görünüşü**

- **FR-005**: Səhifə Figma `2236:67755` (və tablet/iPhone kadrları) görünüşündə olmalıdır: bölmə başlıqları, mənbəli sitat, prinsip kartları (başlıq + təsvir, ikonla), hədəf qrupu etiketləri, foto qalereya və CTA banneri (`contracts/ui-contract.md`).
- **FR-006**: Hər blok redaktorun adi işarələməsindən oxunmalıdır; qayda `contracts/cms-markup.md`-də yazılır (spec 024 nümunəsi). Tanınmayan və ya qaydaya uymayan hissə adi məzmun kimi yerində göstərilir, heç bir mətn itmir.
- **FR-007**: Foto qalereya mətndəki şəkil linklərindən qurulmalı və saytın mövcud şəkil baxışı ilə açılmalıdır.
- **FR-008**: CTA banneri mətndəki son dəvət paraqraflarından və poçt linkindən qurulmalıdır; düymə həmin poçt ünvanını açır.

**Sayt — platforma səhifələri**

- **FR-009**: Portal, Virtual Təhsil Platforması və Məlumat-axtarış sistemi səhifələri eyni Figma şablonunda olmalıdır: giriş, vurğulanmış cümlə, (varsa) foto qalereya, alt başlıqlı bölmələr, keçid sətri.
- **FR-010**: Keçid sətri və mətndəki xarici linklər yeni pəncərədə açılmalıdır (`rel` təhlükəsiz).

**Ümumi**

- **FR-011**: Chrome mətnləri (məsələn qalereya və CTA düyməsi üçün etiketlər, ekran oxuyucusu adları) az və en dilində olmalıdır; redaksiya mətni yalnız səhifə məzmunundan gəlməlidir.
- **FR-012**: Bloklar ekran oxuyucusu üçün semantik olmalıdır: başlıqlar ardıcıl səviyyədə, sitat sitat kimi, kartlar və etiketlər siyahı kimi, qalereya şəkilləri alternativ mətnlə, CTA düyməsi klaviatura ilə əlçatan.
- **FR-013**: Görünüş(lər) bölmənin səhifələrinə slug ilə (az, en və `-copy`) bağlanmalıdır; digər səhifələrə təsir etməməlidir.
- **FR-014**: Hər yeni görünüş mövcud "redaktor işarələməsindən qurulan səhifələr" qoruyucusuna qoşulmalıdır: redaktorun saxladığı formada nümunə (sayt və panel nüsxəsi eyni), saytın gözlənilən blokları və panelin bayt-bayt saxlama yoxlaması.
- **FR-015**: API, verilənlər bazası sxemi və admin panelin ekranları dəyişməməlidir.

**Seed**

- **FR-016**: Yayım zamanı 106, 110, 111, 112 səhifələrinin az və en mətni yalnız köhnə formada olduqda (dump-dakı mətnlə eyni) Figma quruluşunda yenidən yazılmalıdır; en mətnin yeni hissələri qaralama tərcümədir. 107 dəyişmir, çünki ünvanı köka yönləndirilir.
- **FR-017**: Seed Ümumi məlumat, Seminarlar/vebinarlar, Müsabiqələr və "(Kopya)" səhifələrini sol menyudan çıxarmalıdır (spec 041 bayrağı), yalnız bayraq hələ standart vəziyyətdədirsə; səhifələri silməməli, görünməz etməməli və dərcdən çıxarmamalıdır.
- **FR-018**: Seed səhifələri slug ilə tapmalı, tapmadıqda heç nə yaratmamalı, təkrar işlədikdə heç nəyi dəyişməməli, mövcud cədvəllərin quruluşunu dəyişməməlidir.

**Sənədlər**

- **FR-019**: Yeni redaktor təlimatı (`web-cbar-new/docs/financial-literacy-cms-guide.md`) yazılmalı; kök və `web-cbar-new` `CLAUDE.md`, `business_logic` sənədləri eyni dəyişiklikdə yenilənməlidir.

### Key Entities *(include if feature involves data)*

- **Bölmə səhifəsi** (mövcud CMS səhifəsi): başlıq, slug, məzmun (az/en), sol menyu bayrağı; yeni saxlanılan obyekt yoxdur.
- **Prinsip kartı** (məzmundakı siyahı elementi): başlıq, təsvir.
- **Hədəf qrupu** (məzmundakı siyahı elementi): ad.
- **Qalereya şəkli** (məzmundakı şəkil linki): media istinadı, ad.
- **CTA**: dəvət mətni, başlıq, ünvan sətri, poçt linki.
- **Platforma bölməsi** (alt başlıq + mətn) və **keçid sətri** (etiket + xarici link).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dörd səhifənin hər biri desktop, tablet və mobil endə `contracts/ui-contract.md` ilə 1px dəqiqliklə üst-üstə düşür.
- **SC-002**: Yayımdan sonra dörd səhifə hər iki dildə Figma quruluşunda, əl işi olmadan görünür (səhifələr mövcud və redaktə olunmamışdırsa).
- **SC-003**: Bölmənin istənilən səhifəsində sol menyu 3 bənd göstərir (açıq gizli səhifə istisna).
- **SC-004**: Köhnə mətndəki hər paraqraf, link və şəkil yeni görünüşdə tapılır (0 itki), CTA və keçidlərin 100%-i düzgün ünvana aparır.
- **SC-005**: Redaktor prinsip kartı və ya hədəf qrupunu 1 dəqiqədən az vaxtda, HTML yazmadan əlavə edir.
- **SC-006**: Seed-in təkrar tətbiqi heç bir dəyişiklik yaratmır, redaktor dəyişikliklərini əzmir.
- **SC-007**: Hər iki frontend-in `verify` yoxlaması (layout qoruyucusu daxil) yaşıl keçir.
- **SC-008**: Seminarlar/vebinarlar və Müsabiqələr səhifələri yayımdan sonra da birbaşa ünvanla açılır.

## Assumptions

- **API dəyişikliyi yoxdur.** Endpoint, cavab forması və OpenAPI dəyişmir; `api-cbar` dəyişmir. `api-cbar-admin`-ə yalnız seed migration-u əlavə
  olunur: yeni fayl (növbəti nömrə, `0030-financial-literacy-seed.sql` kimi; ad hər iki API repo üzrə unikal), yalnız `page_translations` və
  `page_details` sətirləri, `ALTER TABLE` yoxdur. Deploy sırası: `api-cbar-admin` (seed), sonra `web-cbar-new`; `web-cbar-admin-new` yalnız
  roundtrip nümunəsi üçün dəyişir.
- Seed Figma-dakı az mətni götürür; Figma-da olmayan hissələr (məsələn köhnədə "Bu səbəbdən…" girişi) köhnə mətndən saxlanır və ya Figma ifadəsi
  ilə əvəz olunur — fərq `research.md`-də sətir-sətir yazılır. Prinsip kartlarının təsvirləri Figma-dadır və yenidir. En mətn köhnə en tərcümədən
  götürülür, yeni hissələr qaralama tərcümədir və redaktor yoxlamalıdır.
- Prinsip kartlarının ikonları dizayn elementidir (redaktor seçmir): sıra ilə dörd sabit ikon; beşinci və sonrakı kartlar ümumi ikon alır. Plan
  mərhələsində Figma-dan dəqiqləşir.
- Qalereya saytın mövcud şəkil/qalereya komponentini istifadə edir; yeni qalereya sistemi yaradılmır.
- Seminarlar/vebinarlar və Müsabiqələr səhifələrinin görünüşü bu spec-də dəyişmir (Figma-da dizaynları yoxdur); yalnız sol menyudan çıxır.
- "(Kopya)" alt ağacı redaktorun qaralamasıdır, silinməsi redaktorun qərarıdır.
- Figma ilə məzmun arasındakı iki fərq dizayner ilə dəqiqləşdirilir, icranı bloklamır (research R6):
  - Virtual Təhsil səhifəsinin tablet/mobil kadrlarındakı "Facts" sırası edilmir.
  - Portal səhifəsinin mətnindəki 3 şəkil foto sırası kimi göstərilir.
- Köhnə saytın (`product-host`) bu bölmə üçün xüsusi ünvanları varsa `legacyRedirect()`-ə plan mərhələsində əlavə olunur; köhnə sayt yalnız
  referansdır, dəyişmir.
- Test mühitinin cari vəziyyəti (səhifə id-ləri, redaktə olunub-olunmaması) plan mərhələsində API ilə yoxlanır; dump 2026-09-14 tarixlidir.
