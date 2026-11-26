# Feature Specification: Media → Tədbirlər

**Branch**: `main` (istifadəçi qərarı, ayrıca branch açılmır)

**Created**: 2026-11-04

**Status**: Draft

**Input**: Media bölməsinin "Tədbirlər" bəndini yeni Figma dizaynına keçirmək, mövcud datanı itirmədən.
Tədbirlər admin paneldən idarə olunmalıdır. Press-relizlərlə əlaqəsi araşdırılıb, nəticə aşağıdadır.

**Figma** (`cbar website (Copy)`, səhifə `Media`, bölmə `2293:2349`; köhnə bölmə `1643:29160` gizlidir):

| Ekran | Desktop | Tablet 744 | Mobile 390 |
|---|---|---|---|
| Gələcək tədbirlər | `2291:37473` | `2735:117934` | `2735:118886` |
| Keçmiş tədbirlər | `2297:6340` | `2739:121695` | `2739:122643` |
| Detal, keçmiş, uzun mətn | `2306:84019` | `2741:36630` | `2741:37415` |
| Detal, keçmiş, qısa mətn | `2308:3022` | — | — |
| Detal, gələcək | `2312:5089` | `2742:37548` | `2742:38309` |

Komponentlər: `Events / Agenda` `2291:37452`, `Events / Archive` `2297:6319`,
`Events / Select · Tədbir növü` `2303:4901`, `Bölmə filtri — çox kateqoriya olduqda` `2323:124130`.

- **Siyahı**: H1 "Tədbirlər", "Gələcək tədbirlər" / "Keçmiş tədbirlər" tabları, axtarış ("Tədbirin adı üzrə
  axtarış"), tarix aralığı, "Tədbir növü" seçimi, "Axtar", bölmə tabları, "Filtrləri təmizlə". Tədbirlər aylara
  görə qruplaşır. Sətir: tarix qutusu (gün + ay, çoxgünlükdə `4–5`), bölmə və növ nişanı, başlıq, alt sətir, ox.
- **Fərq**: gələcək sətirdə saat + məkan (`11:00 · Mərkəzi Bank, Bakı`), keçmiş sətirdə tarix + məkan
  (`4–5 iyun 2026 · Bakı`) var. "Daha çox göstər" yalnız keçmiş tədbirlərdədir.
- **Boş vəziyyət**: "Bu bölmə üzrə gələcək tədbir yoxdur" + "Keçmiş tədbirlərə baxa bilərsiniz".
- **Bölmə filtri**: "Hamısı" + 5 bölmə + "Digər" menyusu; mobildə üfüqi sürüşmə; 10+ bölmədə axtarışlı
  açılan siyahı.
- **Detal, keçmiş**: H1 "Tədbirlər", başlıq (20/600), nişanlar, tarix · məkan, mətn, fotoqalereya.
- **Detal, gələcək**: başlıq, nişanlar, Tarix / Vaxt / Məkan qutuları, "Tədbir haqqında ətraflı məlumat və
  proqram tezliklə dərc olunacaq."

**Hazırkı vəziyyət** (test mühiti, 2026-11-04, ölçülüb; test bazası kiçikdir, prod ölçülməyib):

- `product-host`-da tədbir modeli yoxdur: tədbirlər CMS səhifə ağacıdır.
- `Tədbirlər` (`#84`, `tedbirler`): 6 kök, 17 alt səhifə. COP29 (`#209`), 105 il (`#212`), 100 il (`#215`),
  Heydər Əliyev 100 il (`#223`), 90 il (`#224`), AMB 20 il (`#225`). Yüzdən çox şəkil, 33 KB-lıq məqalə var.
- Bu səhifələrdə tədbir tarixi, növü, bölməsi, məkanı yoxdur.
- `#84`-ün öz mətni var (COP29 mətni, 1065 simvol). Ağacda `Media (Kopya)` `#406` surəti də var.
- Ana səhifənin "Təqvim" bloku kodda yazılmış 3 tədbirdir. 23.12.2026-dan sonra blok yox olur
  (`business_logic/new_business_logic.md`, açıq problem 39).
- Press-reliz (46), qalereya (14), video (27) bir-birinə bağlı deyil. Eyni hadisə üç yerdədir: TDT toplantısı
  reliz `#75`, qalereya `#3`, video `#4`. Figma TDT detalının mətni relizin mətninə oxşayır.

**Press-reliz əlaqəsi — nəticə**: bağlılıq var, amma tədbir press-reliz növü deyil.

- Press-reliz gələcək tarixlə gizlənir, tədbir isə məhz gələcəkdə görünməlidir.
- Tarix aralığı, saat, məkan, bölmə press-relizdə yoxdur.
- Hər tədbirin relizi yoxdur: Figma-dakı ödəniş ekspertləri toplantısı və 2014 konfransı test bazasında relizlərdə
  tapılmadı. Tədbir relizdən əvvəl də mövcuddur.

**İstifadəçi qərarları (2026-11-04)**:

1. Yeni, ayrıca **Tədbirlər** bölməsi (press-reliz tipi və ya CMS markup-ı yox).
2. Köhnə 6 tədbir **səhifəyə bağlı** olur: məzmun və ünvanlar yerində qalır, kart CMS səhifəsini açır.
3. Tədbir mövcud **qalereyanı** və istəyə bağlı **press-relizi** seçir. Video seçimi yoxdur.
4. **Bölmələr paneldən** idarə olunur, **növ sabitdir**: Qərar, Mətbuat konfransı, Konfrans, Seminar.
5. Ana səhifə Təqvimi saxta siyahıdan real tədbirlərə keçir.
6. Köhnə 6 tədbir **ilkin tarixlə avtomatik yaradılır**, tarixlər panelin adi formunda redaktə olunur:

| Tədbir | İlkin tarix | Mənbə | Etibarlılıq |
|---|---|---|---|
| COP29 (`#209`) | 14.11.2024 | Mətndə "Noyabr ayının 14-də", il COP29-un Bakıda keçirildiyi ildir | Yüksək |
| Mərkəzi bankçılıq - 105 il (`#212`) | 30.09.2024 | `#213`: "30 sentyabr 2024-cü il, Bakı" | Yüksək |
| Mərkəzi bankçılıq - 100 il (`#215`) | 28.09.2019 | Prezident Sərəncamının tarixi, tədbirin özünün yox | Orta |
| Heydər Əliyev - 90 il (`#224`) | 08.05.2013 | "8 may 2013-cü il tarixində ... tədbir" | Yüksək |
| Heydər Əliyev - 100 il (`#223`) | 10.05.2023 | Mətndə dəqiq gün yoxdur: yubiley günü götürülüb, il 2023-dür | Təxmini |
| AR Mərkəzi Bankı – 20 il (`#225`) | 16.01.2012 | Mərasim tarixi yoxdur: yubiley müsabiqəsinin başlanğıcı | Təxmini |

**Əhatə olunan proyektlər** (Konstitusiya Maddə II — hər biri ayrıca MR):

- `api-cbar-admin`: yeni cədvəllər, icazələr, CRUD, OpenAPI, `Cbar.Domain`.
- `api-cbar`: siyahı, detal, bölmələr, sayt axtarışı, OpenAPI, `Cbar.Domain` (bayt-bayt eyni).
- `web-cbar-admin-new`: Tədbirlər və Bölmələr ekranları.
- `web-cbar-new`: siyahı, detal, ana səhifə Təqvimi.

**Deploy sırası**: `api-cbar-admin` (miqrasiya) → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new` →
redaktor məzmunu. Menyu bəndi sayt deploy-u ilə avtomatik yeni ünvana keçir, redaktor addımı lazım deyil.

**`product-host` istinadı (Konstitusiya Maddə I.2)**:

| Köhnə | Nə edir | Yenidə |
|---|---|---|
| Səhifə ağacı `865`, `861`, `156…164`, `813`, `65`, `66` (`common/models/Pages.php`) | Tədbirlər adi CMS səhifələridir | Səhifələr qalır, tədbir onlara bağlanır |
| `visitor/views/pages/index.php` | Səhifə + qoşmalar | Bağlı tədbir kartından eyni səhifəyə keçid |
| `common/models/Gallery.php`, `Videos.php` | Tədbirdən asılı olmayan qalereya, video | Tədbir qalereyanı seçir; video dəyişmir |
| Yoxdur | Gələcək tədbir, təqvim | Yeni funksiya |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Redaktor tədbirləri paneldən idarə edir (Priority: P1)

Redaktor panelin yeni "Tədbirlər" bölməsində tədbir yaradır: növ, bölmə, tarix(lər), saat, status, hər dil üçün
başlıq, məkan və mətn. Qalereya, press-reliz və ya CMS səhifəsini istəyə görə bağlayır. "Bölmələr" ekranında
bölmə əlavə edir, adını dəyişir, sırasını və aktivliyini idarə edir.

**Why this priority**: Məlumat mənbəyi budur: bu olmadan saytda göstəriləcək heç nə yoxdur.

**Independent Test**: Panelin testləri real kontraktla: yaratmaq, redaktə, silmək, filtrləmək, bağlılıq seçmək,
səhvli form, icazəsiz istifadəçi.

**Acceptance Scenarios**:

1. **Given** icazəli redaktor, **When** tədbiri tələb olunan sahələrlə saxlayır, **Then** tədbir siyahıda görünür
   və kim-nə-vaxt dəyişdi audit-də qalır.
2. **Given** bitmə tarixi başlanğıcdan əvvəl, **When** saxlanır, **Then** sahənin yanında səhv göstərilir,
   tədbir saxlanmır.
3. **Given** hər iki dildə eyni başlıq, **When** başqa tədbir eyni başlıqla yaradılır, **Then** ünvan
   toqquşmur, sistem unikal ünvan verir.
4. **Given** bölməyə bağlı tədbir var, **When** bölmə silinir, **Then** əməliyyat rədd olunur, səbəb göstərilir.
5. **Given** siyahı, **When** axtarış, status, növ və ya bölmə filtri tətbiq olunur, **Then** nəticə buna görə daralır.
6. **Given** `events.*` icazəsi olmayan istifadəçi, **Then** API sorğunu rədd edir. Panelin sol menyusu icazəyə görə süzülmür,
   digər bölmələr kimi.

---

### User Story 2 — Ziyarətçi gələcək tədbirləri görür (Priority: P1)

Ziyarətçi Media → Tədbirlər açır və yaxın tədbirləri aylara bölünmüş, tarixə görə artan sıra ilə görür, bölmə, növ,
ad və tarix üzrə süzür.

**Why this priority**: Yeni dizaynın əsas ekranıdır və köhnə saytda olmayan dəyəri verir.

**Independent Test**: Saxta API cavabları ilə: aylara qruplaşma, sıra, hər filtr, təmizləmə, boş vəziyyət, JS-siz GET.

**Acceptance Scenarios**:

1. **Given** `/az/media/events`, **Then** "Gələcək tədbirlər" tabı aktivdir, yalnız bu gün və sonrası görünür,
   artan sıra ilə, ay başlıqları altında.
2. **Given** sətir, **Then** tarix qutusu, bölmə nişanı, növ nişanı, başlıq, saat · məkan və ox görünür; dəyəri
   olmayan nişan və ya hissə buraxılır.
3. **Given** bölmə tabı seçilir, **Then** yalnız həmin bölmə qalır və seçim ünvanda saxlanır.
4. **Given** seçilmiş bölmədə gələcək tədbir yoxdur, **Then** Figma boş vəziyyəti və "Keçmiş tədbirlər"ə keçid görünür.
5. **Given** 7 bölmə, **Then** "Hamısı" + 5 + "Digər" görünür; "Digər"dən seçilən bölmə onun yerinə keçir.
6. **Given** 10+ bölmə, **Then** tablar yerinə axtarışlı açılan siyahı görünür. **Given** mobil, **Then** tablar üfüqi sürüşür.
7. **Given** "Filtrləri təmizlə", **Then** bütün filtrlər sıfırlanır, aktiv tab qalır.

---

### User Story 3 — Ziyarətçi keçmiş tədbirlər arxivinə baxır (Priority: P1)

Ziyarətçi "Keçmiş tədbirlər" tabında tədbirləri yenidən köhnəyə görür. Köhnə saytın 6 tədbiri də buradadır və
kartı əvvəlki səhifəni açır.

**Why this priority**: Köhnə datanın itməməsi şərtinin görünən hissəsidir.

**Independent Test**: Saxta cavablarla: sıra, "Daha çox göstər", bağlı tədbirin kartının ünvanı, bütün filtrlər.

**Acceptance Scenarios**:

1. **Given** keçmiş tab, **Then** azalan sıra ilə aylara qruplaşmış tədbirlər, hər sətirdə tarix · məkan görünür.
2. **Given** növbəti tədbirlər var, **When** "Daha çox göstər" basılır, **Then** əvvəlkilər qalaraq yeniləri əlavə
   olunur; JavaScript söndürülübsə də işləyir. Qalan yoxdursa düymə görünmür.
3. **Given** CMS səhifəsinə bağlı tədbir, **When** kart basılır, **Then** həmin səhifə əvvəlki ünvanında açılır.
4. **Given** çoxgünlük tədbir, **Then** tarix qutusunda `4–5`, alt sətirdə `4–5 iyun 2026` yazılır; iki aya düşən
   tədbir başlanğıc ayında qruplaşır.

---

### User Story 4 — Ziyarətçi tədbirin detalını oxuyur (Priority: P2)

Ziyarətçi tədbiri açır. Keçmişdə mətn və fotoqalereya, gələcəkdə Tarix / Vaxt / Məkan görür.

**Why this priority**: Siyahı olmadan da faydalıdır, amma Figma-nın tam axını üçün lazımdır.

**Independent Test**: Saxta cavablarla keçmiş və gələcək vəziyyətlərin hər kombinasiyası.

**Acceptance Scenarios**:

1. **Given** keçmiş tədbir, mətn + qalereya, **Then** başlıq, nişanlar, tarix · məkan, mətn, qalereya görünür.
2. **Given** gələcək tədbir, **Then** Tarix / Vaxt / Məkan qutuları görünür; mətn yoxdursa "tezliklə dərc olunacaq"
   mesajı, varsa mətn göstərilir.
3. **Given** bağlı press-reliz dərc olunub, **Then** mətndən sonra relizə sadə link görünür (Figma-da yoxdur,
   təsdiqlənmiş sapma). Dərc olunmayıbsa link yoxdur.
4. **Given** qalereya silinib və ya deaktivdir, **Then** blok görünmür, səhifə açılır.
5. **Given** CMS səhifəsinə bağlı tədbirin birbaşa ünvanı, **Then** ziyarətçi həmin səhifəyə yönləndirilir.
6. **Given** detal, **Then** H1 "Tədbirlər", breadcrumb, paylaşma və sol menyu Media şablonundadır.

---

### User Story 5 — Ana səhifə Təqvimi real tədbirləri göstərir (Priority: P2)

Ana səhifənin "Təqvim" bloku redaktorun daxil etdiyi yaxın tədbirləri göstərir və hər biri detala aparır.

**Why this priority**: Mərkəzi Bankın saytında kodda yazılmış tarix yanıldıcıdır və blok 23.12.2026-dan sonra yox olur.

**Independent Test**: Saxta cavablarla: 0, 1, 3, 5 gələcək tədbir.

**Acceptance Scenarios**:

1. **Given** 5 gələcək tədbir, **Then** ən yaxın 3-ü görünür, hər biri tədbirin detalına link olur.
2. **Given** gələcək tədbir yoxdur, **Then** blok görünmür, ana səhifənin qalanı dəyişmir.
3. **Given** tədbirlər xidməti cavab vermir, **Then** ana səhifə açılır, yalnız bu blok düşür.

---

### User Story 6 — Köhnə data itkisiz keçirilir (Priority: P2)

6 köhnə tədbir səhifələrə bağlı şəkildə, ilkin tarixlərlə avtomatik yaranır. Redaktor tarixləri yoxlayıb lazım olanı
redaktə edir, bölmələri yaradıb təyin edir. Menyu sayt deploy-u ilə avtomatik yeni siyahıya keçir.

**Why this priority**: İstifadəçinin açıq şərtidir; görünən nəticəsi US3-dür, amma ayrıca yoxlanmalıdır.

**Independent Test**: Keçiddən əvvəl və sonra 18 səhifənin ünvanı, mətni və şəkil sayı tutuşdurulur.

**Acceptance Scenarios**:

1. **Given** keçid tamamlanıb, **Then** 6 kök və 17 alt səhifənin hamısı əvvəlki ünvanda, eyni məzmunla açılır.
2. **Given** sayt deploy olunub, **Then** "Tədbirlər" yeni siyahını açır, siyahıda sol menyu Figma-dakı kimi alt ağacsızdır.
3. **Given** kod deploy olunub, redaktor işi başlamayıb, **Then** 6 tədbir arxivdə görünür, 18 səhifə açılır, gələcək tabı
   boş vəziyyəti göstərir.
4. **Given** ilkin yaradılmış tədbir, **When** redaktor tarixi dəyişib saxlayır, **Then** saytda yeni tarix görünür və
   sonrakı deploy-lar bu dəyişikliyin üzərinə yazmır.
5. **Given** mühitdə köhnə səhifə tapılmır (məs. boş baza), **Then** həmin tədbir yaradılmır, deploy dayanmır.

---

### Edge Cases

- Bu gün bitən tədbir hələ "gələcək"dir; ertəsi gün "keçmiş"ə keçir. Gün Bakı vaxtı ilə hesablanır.
- Başlamış, bitməmiş çoxgünlük tədbir "gələcək"də qalır.
- Tərcüməsi olmayan dildə tədbir həmin dilin siyahısında, axtarışında və Təqvimində görünmür.
- Saat və ya məkan boşdursa alt sətirdə ayırıcı qalmır; gələcək detalda həmin qutu görünmür.
- Keçmiş tədbirdə mətn və qalereya yoxdursa başlıq və nişanlar qalır, boş blok görünmür.
- Bölmə deaktivdirsə tablarda yoxdur, ona bağlı tədbirlər "Hamısı"da nişanı ilə görünür.
- Ünvanda tanınmayan `when`, `type`, bölmə və ya səhv tarix: filtr sayılmır, səhifə xətasız açılır.
- Mövcud olmayan və ya dərc olunmamış tədbir ünvanı 404 verir.
- Bağlı CMS səhifəsi silinib və ya gizlidirsə kart tədbirin öz detalını açır.
- Eyni gündə bir neçə tədbir: başlanğıc saatına, sonra başlığa görə sıralanır.
- `#84`-ün mətni COP29 `#209`-un mətni ilə eynidir (ölçülüb), menyunun dəyişməsi mətn itirmir. `/az/tedbirler` ünvanı açıq qalır.

## Requirements *(mandatory)*

### Functional Requirements

**Admin**

- **FR-001**: Sistem MUST tədbirin növünü, bölməsini, başlanğıc və bitmə tarixini, saatını, statusunu, hər dil üçün
  başlığını, məkanını, mətnini saxlamalıdır.
- **FR-002**: Yalnız başlanğıc tarixi, status və ən azı bir dildə başlıq məcburidir. Növ və bölmə boş ola bilər (yubileylər).
- **FR-003**: Sistem MUST bitmə tarixinin başlanğıcdan əvvəl olmasını rədd etməlidir.
- **FR-004**: Növ yalnız 4 sabit dəyərdən biri ola bilər: Qərar, Mətbuat konfransı, Konfrans, Seminar.
- **FR-005**: Redaktor MUST bölməni yarada, redaktə edə, sıralaya, deaktiv edə bilməlidir; istifadədə olan bölmə silinmir.
- **FR-006**: Redaktor MUST tədbirə mövcud qalereya, press-reliz və CMS səhifəsi bağlaya bilməlidir; hamısı istəyə bağlıdır.
- **FR-007**: Hər dil üçün ünvan başlıqdan avtomatik yaranır və həmin dildə unikaldır.
- **FR-008**: Tədbir silinəndə soft-delete olunur; dəyişikliklər audit-ə yazılır.
- **FR-009**: Tədbir və bölmə əməliyyatları ayrıca oxuma/yaratma/redaktə/silmə icazələri ilə qorunur.
- **FR-010**: Panel mətnləri az/en-dir; rəngli status və növ nişanları mövcud modullarla eynidir.

**İctimai görünürlük**

- **FR-011**: Saytda yalnız dərc olunmuş, silinməmiş, ziyarətçinin dilində tərcüməsi olan tədbirlər görünür. Gələcək tarix tədbiri gizlətmir.
- **FR-012**: Bitmə tarixi (yoxdursa başlanğıc) Bakı günü ilə bu gün və sonradırsa tədbir gələcək, əks halda keçmişdir.

**Siyahı**

- **FR-013**: `/[locale]/media/events` Figma-dakı kimi iki tabı, axtarışı, tarix aralığını, növü, bölmə filtrini verir.
- **FR-014**: Gələcək tədbirlər artan, keçmiş tədbirlər azalan sıra ilə, başlanğıc ayına görə qruplaşır.
- **FR-015**: Filtrlər və tab ünvanda saxlanır, JavaScript olmadan işləyir, paylaşılan link eyni nəticəni verir.
- **FR-016**: Keçmiş tədbirlər "Daha çox göstər" ilə, hissə-hissə yüklənir. Gələcək tədbirlərdə bu düymə yoxdur.
- **FR-017**: Bölmə filtri bölmə sayına görə Figma-nın üç variantından birini göstərir; bölmələr və adları paneldəndir.
- **FR-018**: CMS səhifəsinə bağlı, açıq olan tədbirin kartı həmin səhifəyə aparır.

**Detal**

- **FR-019**: `/[locale]/media/events/[slug]` keçmiş və gələcək vəziyyəti tarixə görə seçir (Figma `2306:84019`, `2312:5089`).
- **FR-020**: Qalereya mövcud fotoqalereya komponenti ilə göstərilir; aktiv olmayan qalereya buraxılır.
- **FR-021**: Dərc olunmuş bağlı press-relizə link göstərilir. Video və ya başqa material bu spec-də yoxdur.
- **FR-022**: Bağlı səhifəsi olan tədbirin detal ünvanı həmin səhifəyə yönləndirir.
- **FR-023**: Siyahı və detal mövcud Media şablonundadır: breadcrumb, paylaşma, sol menyu.
- **FR-024**: Redaktor HTML-i mövcud CMS süzgəcindən keçir, ayrıca istisna yoxdur.

**Digər**

- **FR-025**: Ana səhifə Təqvimi ən yaxın 3 gələcək tədbiri göstərir, kodda yazılmış siyahı silinir. Xəta və ya boş cavab blokun gizlənməsidir.
- **FR-026**: Sayt axtarışı tədbirləri də tapır və düzgün ünvana aparır.
- **FR-027**: Mövcud səhifə, qalereya, video, press-reliz datası və davranışı dəyişmir; xarici kontraktlar toxunulmazdır.
- **FR-028**: Köhnə 6 tədbir hər mühitdə bir dəfə, səhifənin ünvanına görə tapılıb yaradılır: başlıq səhifədən, tarix
  yuxarıdakı cədvəldən, status dərc olunub. Mövcud səhifələrə yazılmır. Yaradılan tədbir adi tədbir kimi redaktə olunur
  və təkrar yaradılmır. Tapılmayan səhifə üçün tədbir buraxılır.
- **FR-030**: Köhnə Tədbirlər alt ağacı üst menyuda və siyahı/detal səhifələrinin sol menyusunda görünmür. Köhnə səhifənin
  özü açılanda sol menyu və breadcrumb əvvəlki kimi işləyir.
- **FR-029**: Dəyişikliklər hər mühitə tətbiq oluna bilməlidir: yeni cədvəllər mövcud cədvəlləri dəyişmir, oxuma rolu da yeni cədvəlləri görür.

### Key Entities *(include if feature involves data)*

- **Tədbir**: tarixli hadisə. Növ, bölmə, başlanğıc/bitmə tarixi, saat, status; istəyə bağlı qalereya, press-reliz, CMS səhifəsi.
- **Tədbir tərcüməsi**: dil üzrə başlıq, ünvan, məkan, mətn.
- **Bölmə**: panel siyahısı, sıra və aktivlik. Bir tədbirin ən çox bir bölməsi olur. Dil üzrə ad.
- **Mövcud varlıqlar**: Qalereya, Press-reliz, CMS səhifəsi dəyişmir, tədbirdən istinad alırlar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Keçiddən sonra 18 köhnə səhifənin 18-i əvvəlki ünvanda, eyni mətn və şəkil sayı ilə açılır.
- **SC-002**: 6 köhnə tədbirin 6-sı "Keçmiş tədbirlər"də görünür və kartı öz səhifəsini açır.
- **SC-003**: Redaktor sadə tədbiri 3 dəqiqədən az vaxtda developer köməyi olmadan dərc edir.
- **SC-004**: Panelə əlavə olunan tədbir növbəti səhifə açılışında saytda görünür.
- **SC-005**: 1728, 744, 390 enlərində ölçülən əsas ölçülər Figma-dan 1px-dən çox fərqlənmir.
- **SC-006**: Ana səhifədə kodda yazılmış tədbir tarixi qalmır; Təqvim 23.12.2026-dan sonra da redaktor datası ilə işləyir.
- **SC-007**: Bütün filtrlər JavaScript söndürülmüş halda eyni nəticəni verir.
- **SC-008**: Bölmə əlavə etmək üçün proqram dəyişikliyi və ya deploy lazım olmur.

## Assumptions

- Köhnə 6 tədbirin ilkin tarixi yuxarıdakı cədvəldəndir (istifadəçi qərarı 6). Təxmini sətirləri redaktor yoxlamalıdır.
- Köhnə tədbirlərin növünü və bölməsini redaktorlar verir, ilkin olaraq boşdur.
- Köhnə tədbirlərin saatı və məkanı yoxdur, ona görə həmin sətirlər yalnız tarix göstərir.
- Yalnız "dərc olunub" görünür. Planlı dərc yoxdur: "Scheduled" statusu tədbir formunda təklif olunmur.
- "Daha çox göstər" hər dəfə 10 tədbir əlavə edir. Figma sayı vermir.
- Gələcək tədbirlər siyahısında limit düyməsi yoxdur: belə tədbirlərin sayı azdır.
- Saat Bakı vaxtıdır və daxil edildiyi kimi göstərilir, vaxt qurşağı çevrilmir.
- Press-reliz linkinin mətni "Press-reliz" kimi sadə etiketdir; dizayn sonradan dəqiqləşə bilər.
- Təqvimin köhnə etiketləri (mətbuat konfransı, press-reliz) tədbir növünün etiketi ilə əvəzlənir.
- Mock-dakı 3 tarix real qrafik sayılmır: real tarixləri redaktor daxil edir. Köhnə 6 tədbirin hamısı keçmişdə olduğu
  üçün Təqvimə düşmür.
- Köhnə səhifələr menyu ağacında qalır, yalnız Tədbirlər alt ağacı menyularda göstərilmir. Səhifələri gizlətmək olmaz: API
  gizli valideynin uşaqlarını kök kimi qaytarır, onlar üst menyuya çıxardı.
- `Media (Kopya)` `#406` və onun alt səhifələri bu spec-ə daxil deyil.
- Bu maşında Docker işləmir: API canlı yoxlaması test mühitində deploy-dan sonra aparılır.
