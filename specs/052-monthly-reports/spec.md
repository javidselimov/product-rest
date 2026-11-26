# Feature Specification: "Aylıq hesabatlar" — şikayət indeksləri və infoqrafika üçün ayrıca məzmun növü

**Feature Branch**: `052-monthly-reports`

**Created**: 2026-11-18

**Status**: Draft

**Input**: "bunu biz spek ile duzletmishik 050 speci bununla bagli olmalidir amma bu sehifenin admin panelden editlenmesi editor ucun olduqca
cetin nezere alinib onu necese sadeleshdire bilerik belke senin alternativ teklifin ola biler" (Figma: "Şikayət indeksləri" `2453:4111`). Agent üç
yol təklif etdi (A — ayrıca məzmun növü, B — redaktorda köməkçi düymə, C — düz siyahı). İstifadəçi: "A ilə davam et, infoqrafikanı da daxil et".

Qərarlar (2026-11-18, istifadəçi):
1. **Ayrıca məzmun növü** (spec 038/044/045/051 kimi): admin paneldə öz bölməsi, aylıq fayllar sətir-sətir saxlanılır, redaktor akkordeon qurmur.
2. **Üç seriya**: Bank xidmətləri üzrə şikayət indeksi (səhifə 95), Avto-icbari sığorta üzrə şikayət indeksi (səhifə 96, 95-in ikinci tabı),
   İnfoqrafika (səhifə 93, Statistika səhifəsinin 94 sonundakı blok).
3. **Metodologiya** (95/96-da `h2`, üç paraqraflı düstur sitatı, `Qeyd:` kiçik yazısı) redaktor işarələməsi olaraq qalır, dəyişmir.
4. **Statistika cədvəlləri** (səhifə 94-ün rəqəmləri) bu spec-in əhatəsindən kənardır.

Agentin qəbul etdiyi defoltlar (istifadəçi düzəldə bilər):
5. Bir ay = bir sətir = bir fayl (hər dil üçün). Köhnə arxivdə də hər ayda tam bir fayl linki var.
6. Sətrin başlığı yazılmır: seriyanın adı + ay + il-dən qurulur (Figma: "Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi
   (Sentyabr 2026)"). Seriyanın az/en adı bir yerdə saxlanılır. Sığorta indeksi bir ayı yox, həmin ayla bitən 12 ayı əhatə edir (köhnə link
   mətnləri: "1 iyun 2025 – 31 may 2026"), ona görə onun başlığında dövr göstərilir: "… (İyun 2025 – May 2026)" (plan, research R3).
7. az faylı adi haldır, en faylı istəyə bağlıdır. en saytında yalnız en faylı olan aylar görünür (bugünkü kimi: en səhifənin öz faylları var).
   İnfoqrafikanın en səhifəsi yoxdur: en faylı olmayan seriya en-də göstərilmir.
8. Saytın görünüşü spec 050-dəki kimi qalır (tablar, "Son məlumat", il → ay arxivi, metodologiya, İnfoqrafika bloku). Dəyişən yalnız məlumatın
   mənbəyidir.
9. Köhnə akkordeon HTML-i səhifə mətnindən silinmir. Seriyanın həmin dildə görünən sətri olduğu müddətcə sayt onu göstərmir (spec 044/045
   nümunəsi). Sətir yoxdursa, səhifə spec 050-dəki kimi öz HTML-indən oxunur. Bu dəyişiklik geri qaytarıla bilər.

**Köhnə vəziyyət** (test API `api-cbar-test.cbar.az`, 2026-11-18):

| id | Səhifə | az | en |
|---|---|---|---|
| 95 | Bank xidmətlərindən istifadə üzrə şikayət indeksi | 4 il (2023–2026), 32 ay, hər ayda 1 fayl | 4 il, 32 ay |
| 96 | Avto-icbari sığorta üzrə şikayət indeksi | 5 il (2022–2026), 45 ay | 5 il, 41 ay |
| 93 | İnfoqrafika | 6 il (2021–2026), 65 ay | səhifə yoxdur |

Səhifənin `assets` siyahısında hər iki dilin faylları var (95: 64 = 32 az + 32 en). Ay akkordeonları köhnə importda bir xanalı cədvəlin içindədir.

**Figma**: "cbar website (Copy)", səhifə "Consumer and Investor Rights" `2445:16785`, kadr "Şikayət indeksləri" `2453:4111`. Saytın görünüşü
dəyişmədiyi üçün yeni Figma kadrı yoxdur. Admin bölməsi panelin standart CRUD ekranlarıdır və onun üçün Figma kadrı yoxdur.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Redaktor yeni ayın faylını əlavə edir (Priority: P1)

Hər ay Mərkəzi Bank yeni şikayət indeksini və infoqrafikanı dərc edir. Redaktor admin paneldə "Aylıq hesabatlar" bölməsini açır, "Yeni" düyməsini
basır, seriyanı, ili və ayı seçir, az faylını (və varsa en faylını) yükləyir və yadda saxlayır. Akkordeon qurmur, başlıq yazmır, iki dildə iki
səhifəni ayrıca redaktə etmir.

**Why this priority**: Spec-in səbəbi budur: indiki iş axını redaktor üçün çətindir. Bir qaydanın pozulması isə sayt blokunu səssizcə adi mətnə
çevirir.

**Independent Test**: Boş seriyada bir sətir yaradılır, sonra saytda həmin səhifə açılır. "Son məlumat" həmin faylı göstərir, arxivdə il və ay
görünür.

**Acceptance Scenarios**:

1. **Given** Bank seriyasında ən yeni sətir Avqust 2026-dır, **When** redaktor siyahını Bank seriyasına süzüb "Yeni" basır, **Then** forma
   seriya = Bank, il = 2026, ay = Sentyabr ilə açılır.
2. **Given** forma doldurulub, az faylı yüklənib, **When** redaktor yadda saxlayır, **Then** sətir siyahıda "Bank müştərilərinin bank
   xidmətlərindən istifadəsi üzrə şikayət indeksi (Sentyabr 2026)" başlığı ilə görünür.
3. **Given** Bank seriyasında Sentyabr 2026 artıq var, **When** redaktor eyni seriya, il və ay ilə ikinci sətir yaratmağa çalışır, **Then** panel
   yadda saxlamır və bu seriyada həmin ayın artıq mövcud olduğunu deyir (seriya, ay və il mesajdadır; redaktor sətri siyahıda tapır).
4. **Given** heç bir fayl seçilməyib, **When** redaktor yadda saxlamağa çalışır, **Then** forma faylın vacib olduğunu deyir.
5. **Given** sətir dərc olunub, **When** redaktor onun az faylını yenisi ilə əvəz edir, **Then** sayt növbəti açılışda yeni faylı göstərir.

---

### User Story 2 — Ziyarətçi şikayət indekslərini görür (Priority: P1)

Ziyarətçi "Şikayət indeksləri" səhifəsini açır və spec 050-dəki kimi Bank və Sığorta tablarını görür. Hər tabda ən son ayın faylı ("Son məlumat"),
il → ay arxivi və metodologiya var. Məlumat artıq admin bölməsindəki sətirlərdən gəlir.

**Why this priority**: Saytın ictimai görünüşü dəyişməməlidir. Yeni mənbəyə keçid ziyarətçiyə görünməməlidir.

**Independent Test**: Seed-dən sonra səhifənin hər iki tabı əvvəlki ilə eyni il, ay və faylları göstərir. Redaktor sətri gizlədəndə həmin ay
saytdan çıxır.

**Acceptance Scenarios**:

1. **Given** Bank seriyasında 2023–2026 üzrə 32 dərc olunmuş sətir var, **When** ziyarətçi `/az/…/bank-xidmetlerinden-istifade-uzre-sikayet-indeksi`
   açır, **Then** arxivdə dörd il, ən yenisi birinci görünür. Hər ilin içində aylar ən yenisi birinci düzülür, "Son məlumat" isə ən yeni ilin ən
   yeni ayıdır.
2. **Given** Sığorta seriyasında sətir var, **When** ziyarətçi `?tab=insurance` açır, **Then** Sığorta tabı öz arxivini və metodologiyasını
   göstərir.
3. **Given** Sığorta seriyasının en faylı olan sətri yoxdur, **When** ziyarətçi en səhifəsini açır, **Then** Sığorta tabı en səhifə
   96-nın öz HTML arxivi ilə göstərilir (fallback). Bu da yoxdursa, tab göstərilmir.
4. **Given** Bank seriyasının görünən sətirləri var, **When** səhifə açılır, **Then** səhifə mətnindəki köhnə akkordeon arxivi göstərilmir.
   Metodologiya (`h2` və ondan sonrası) və arxivdən əvvəlki giriş mətni göstərilir.
5. **Given** sətir qaralamadır (dərc olunmayıb), **When** ziyarətçi səhifəni açır, **Then** həmin ay arxivdə və "Son məlumat"da yoxdur.

---

### User Story 3 — Ziyarətçi infoqrafikanı görür (Priority: P2)

Statistika səhifəsinin (94) sonundakı "İnfoqrafika" bloku il → ay faylları kimi spec 050-dəki görünüşdə qalır, məlumatı isə İnfoqrafika
seriyasından gəlir.

**Why this priority**: İnfoqrafika eyni çətin akkordeon sxemindədir və hər ay yenilənir. Bloku sonda olduğu və tək dildə (az) olduğu üçün P2-dir.

**Independent Test**: Seed-dən sonra az Statistika səhifəsinin İnfoqrafika bloku 2021–2026 üzrə 65 ay göstərir. en-də blok yoxdur (bugünkü kimi).

**Acceptance Scenarios**:

1. **Given** İnfoqrafika seriyasında dərc olunmuş sətirlər var, **When** ziyarətçi az Statistika səhifəsini açır, **Then** İnfoqrafika bloku
   həmin sətirlərdən il → ay ardıcıllığı ilə qurulur.
2. **Given** İnfoqrafika seriyasında sətir yoxdur, **When** səhifə açılır, **Then** blok spec 050-dəki kimi səhifə 93-ün HTML-indən qurulur.
3. **Given** en saytı, **When** Statistika səhifəsi açılır, **Then** en faylı olan sətir yoxdursa İnfoqrafika bloku göstərilmir.

---

### User Story 4 — Mövcud fayllar avtomatik köçürülür (Priority: P1)

Bölmə deploy olunanda redaktor heç nə yenidən yükləmir. Səhifə 95, 96 və 93-ün az və en arxivlərindəki bütün aylar öz faylları ilə sətirlərə
köçürülür.

**Why this priority**: Köçürmə olmasa, yeni bölmə boş açılar və redaktor 140-dan çox ayı əllə daxil etməli olar.

**Independent Test**: Köçürmədən sonra hər seriya üzrə sətir sayı köhnə arxivin ay sayına bərabərdir (Bank 32, Sığorta 45, İnfoqrafika 65). en
faylları (Bank 32, Sığorta 41) uyğun az sətrinə bağlanıb.

**Acceptance Scenarios**:

1. **Given** səhifə 95-in az arxivində "2026 → May" ayında `/media/1179` faylı var, **When** köçürmə işləyir, **Then** Bank seriyasında 2026/5
   sətri az faylı 1179 ilə yaranır. en arxivindəki "2026 → May" faylı həmin sətrin en faylı olur.
2. **Given** köçürmə artıq işləyib, **When** API yenidən başlayır, **Then** təkrar sətir yaranmır.
3. **Given** bir ayın başlığı ay adı deyil (məs. səhv yazılıb), **When** köçürmə işləyir, **Then** həmin ay köçürülmür. Köhnə HTML-də qalır və
   təlimatda yoxlama yolu göstərilir.
4. **Given** başqa mühitdə səhifə 95 yoxdur və ya arxivi boşdur, **When** köçürmə işləyir, **Then** heç bir xəta olmadan heç nə yaranmır.

---

### User Story 5 — Redaktor səhifə formasından bölməyə keçir (Priority: P3)

Redaktor köhnə vərdişlə "Səhifələr" ağacında 95, 96 və ya 93-ü açır. Formada arxivin artıq "Aylıq hesabatlar" bölməsində olduğu yazılır və ora
link verilir. Metodologiya və giriş mətni burada redaktə olunur.

**Why this priority**: Yönləndirmə rahatlığıdır. Funksionallıq onsuz da işləyir.

**Independent Test**: Səhifə 95-in formasında bölməyə keçid görünür və seriya süzgəci ilə açılır.

**Acceptance Scenarios**:

1. **Given** redaktor səhifə 95-in formasını açır, **Then** "Bu səhifənin aylıq faylları Aylıq hesabatlar bölməsindədir" qeydi və bölməyə
   (Bank seriyası süzülmüş) link görünür.

---

### Edge Cases

- Seriyanın sətirləri yalnız az faylı ilə doludur: az səhifə yeni mənbədən qurulur, en səhifə öz HTML arxivinə qayıdır (fallback).
- Bir ayın az faylı silinib, yalnız en faylı qalıb: az saytında həmin ay görünmür, en-də görünür.
- Media kitabxanasında fayl silinib (sətir mövcud olmayan fayla istinad edir): sayt həmin ayı göstərmir, panel siyahısı sətri "fayl yoxdur"
  qeydi ilə göstərir.
- Gələcək ay (məs. bu gün Noyabr 2026, sətir Dekabr 2026 üçün): icazə verilir, sayt göstərir. Dərc vaxtını redaktor dərc statusu ilə idarə edir.
- İl 2000-dən kiçik və ya cari ildən 1-dən çox böyük: panel qəbul etmir.
- Seriyanın bütün sətirləri gizlədilib: səhifə köhnə HTML arxivini göstərir (fallback). Bu gözlənilən davranışdır və təlimatda yazılır.
- Köhnə akkordeon arxivindən sonra metodologiya `h2`-si yoxdur: arxiv kəsilir, qalan mətn adi mətn kimi göstərilir.
- API əlçatmazdır: səhifə spec 050-dəki kimi öz HTML-indən qurulur.

## Requirements *(mandatory)*

### Functional Requirements

**Məlumat və admin**

- **FR-001**: Sistem aylıq hesabatı ayrıca qeyd kimi saxlamalıdır: seriya, il, ay, az faylı, en faylı (istəyə bağlı), dərc statusu, yaradan və
  dəyişən istifadəçi, vaxtlar.
- **FR-002**: Seriyalar sabit siyahıdır: Bank şikayət indeksi, Sığorta şikayət indeksi, İnfoqrafika. Hər seriyanın az və en adı bir yerdə
  saxlanılır və sətrin başlığı bu addan qurulur. Seriya əlavə etmək bu spec-in əhatəsində deyil.
- **FR-003**: Eyni seriyada eyni il + ay üçün yalnız bir sətir ola bilər. Təkrar cəhd aydın mesajla rədd edilir.
- **FR-004**: Sətir ən azı bir fayl (az və ya en) olmadan yadda saxlanılmır. Fayl media kitabxanasından seçilir və ya yüklənir.
- **FR-005**: Admin paneldə "Aylıq hesabatlar" bölməsi olmalıdır: siyahı (seriya və il süzgəci; ən yenisi birinci; başlıq, az/en fayl
  göstəricisi, status), yaratma, redaktə və silmə. Bölmə sidebar-da İstehlakçıların və investorların hüquqları qrupunda, saytın bölmə sırası ilə
  yerləşir (spec 046 qaydası).
- **FR-006**: "Yeni" düyməsi aktiv seriya süzgəcini formaya keçirir, il və ay isə həmin seriyanın ən yeni sətrindən sonrakı aya qoyulur
  (Dekabrdan sonra növbəti ilin Yanvarı).
- **FR-007**: Forma yadda saxlanılmamış dəyişikliklə tərk edilərkən soruşur (panelin bütün CRUD formaları kimi).
- **FR-008**: Hər yazma əməliyyatı audit jurnalına düşür.
- **FR-009**: Səhifə 95, 96 və 93-ün admin formasında arxivin "Aylıq hesabatlar" bölməsində olduğu yazılır və müvafiq seriya ilə süzülmüş
  bölməyə link verilir.

**Saytda göstərmə**

- **FR-010**: İctimai sayt yalnız dərc olunmuş, silinməmiş və ziyarətçinin dilində faylı olan sətirləri görür. Fayl həmin dilin faylıdır.
- **FR-011**: Şikayət indeksləri səhifəsinin Bank tabı Bank seriyasından, Sığorta tabı Sığorta seriyasından qurulur. İllər və aylar ən yenisi
  birinci, "Son məlumat" ən yeni ilin ən yeni ayıdır. Görünüş spec 050 ilə eynidir.
- **FR-012**: Statistika səhifəsinin İnfoqrafika bloku İnfoqrafika seriyasından qurulur, görünüş spec 050 ilə eynidir.
- **FR-013**: Seriyanın həmin dildə görünən sətri olduqda müvafiq səhifənin mətnindəki köhnə il → ay akkordeon arxivi göstərilmir. Arxivdən əvvəlki
  giriş mətni və arxivdən sonrakı metodologiya dəyişmədən göstərilir.
- **FR-014**: Seriyanın həmin dildə görünən sətri yoxdursa və ya məlumat alına bilmirsə, səhifə spec 050-dəki kimi öz HTML-indən qurulur.
- **FR-015**: Fayl kartında göstərilən başlıq seriyanın adı + "(Ay İl)" formasındadır, ay adı ziyarətçinin dilindədir. Bir neçə ayı əhatə edən
  seriyada (Sığorta indeksi, 12 ay) dövr göstərilir: "(İyun 2025 – May 2026)".
- **FR-016**: Saytın mövcud ünvanları, tab və yönləndirmələri (`?tab=insurance`, 96 → Sığorta tabı, 93 → `#infoqrafika`) dəyişmir.

**Köçürmə**

- **FR-017**: Deploy zamanı birdəfəlik köçürmə səhifə 95, 96 və 93-ün az və en mətnlərindəki il → ay arxivini oxuyur. Hər ay üçün seriyada
  bir sətir yaradır, az faylını az mətnindən, en faylını en mətnindəki eyni il + aydan götürür. Sətirlər dərc olunmuş statusda yaranır.
- **FR-018**: Köçürmə təkrar işlədikdə sətirləri təkrarlamır və mövcud sətirləri dəyişmir. Mühitdə səhifə yoxdursa, xəta vermir.
- **FR-019**: Köçürmə səhifə mətnlərini dəyişmir. Köhnə arxiv HTML-də qalır, saytda FR-013 ilə gizlənir.
- **FR-020**: Başlığı tanınan il və ya ay adı olmayan akkordeonlar köçürülmür. Təlimat redaktora onları necə tapıb əl ilə əlavə etməyi göstərir.

**Sənədlər**

- **FR-021**: Redaktor təlimatları (`web-cbar-new/docs/consumer-rights-cms-guide.md`, `dokumentasiyalar/istehlakci-huquqlari-guide.md`),
  `CLAUDE.md` və `business_logic/` sənədləri eyni dəyişiklikdə yenilənir. Təlimatda yeni iş axını və fallback davranışı yazılır.

### Key Entities

- **Hesabat seriyası**: üç sabit seriyadan biri (Bank şikayət indeksi, Sığorta şikayət indeksi, İnfoqrafika). Saytda hansı səhifə və blokda
  göstərildiyini müəyyən edir, az/en adı sətrin başlığıdır.
- **Aylıq hesabat**: bir seriyanın bir ayı. Seriya, il, ay (1–12), az faylı, en faylı, dərc statusu. Seriya + il + ay unikaldır. Faylları media
  kitabxanasındadır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor yeni ayın faylını admin paneldə 1 dəqiqədən az vaxtda əlavə edir: bir forma, ən çoxu 4 seçim və bir fayl. Akkordeon
  qurmaq, başlıq yazmaq və ikinci dildə ayrıca səhifə redaktə etmək lazım deyil.
- **SC-002**: Köçürmədən sonra saytın Şikayət indeksləri (hər iki tab, az və en) və İnfoqrafika blokları köçürmədən əvvəlki ilə eyni il, ay və
  faylları göstərir: Bank 32/32, Sığorta 45/41, İnfoqrafika 65 ay (az/en). Fərq 0-dır.
- **SC-003**: Redaktorun səhvi saytdakı bloku adi mətnə çevirə bilmir: səhv sətir (təkrar ay, faylsız sətir, mümkün olmayan il) yadda saxlanılmır.
- **SC-004**: Admin paneldə yeni sətir dərc olunduqdan sonra sayt onu növbəti açılışda göstərir.
- **SC-005**: Seriyanın sətri olmayan mühitdə səhifələr bugünkü kimi göstərilir: heç bir səhifə boş açılmır.

## Assumptions

- Hər ay üçün hər dildə tam bir fayl var. Köhnə arxivdə bir ayda birdən çox fayl yoxdur (test API-də hər üç səhifədə link sayı ay sayına
  bərabərdir).
- Statistika cədvəlləri (94), Sənədlər (101) və metodologiya mətni redaktor işarələməsində qalır.
- Seriya adları seed ilə yazılır: Bank — "Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi" / en ekvivalenti; Sığorta və
  İnfoqrafika adları plan mərhələsində köhnə link mətnlərindən götürülür. Adları dəyişmək üçün admin ekranı bu spec-də yoxdur.
- Rollar və icazələr panelin digər məzmun bölmələri ilə eynidir.
- Saytın vizual görünüşü dəyişmir, yeni Figma kadrı lazım deyil. Admin bölməsi panelin standart CRUD şablonundadır.
- Spec 050-nin `complaint-index` layout guard-ı (fikstür və `EXPECTED_BLOCKS`) qalır, çünki fallback yolu həmin parser-dir.
- Dəyişiklik dörd komponentə toxunur (api-cbar-admin: cədvəl, endpoint-lər, köçürmə; api-cbar: oxuma endpoint-i; web-cbar-admin-new: bölmə;
  web-cbar-new: loader). Deploy sırası: api-cbar-admin → api-cbar → frontendlər.
