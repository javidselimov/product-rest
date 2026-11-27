# Feature Specification: "Statistika" bölməsi — Figma şablonu, giriş və fayl səhifələri (faza 1)

**Feature Branch**: `061-statistics-redesign`

**Created**: 2026-11-27

**Status**: Draft

**Input**: "figma bridge yoxla men plan edirdim statistika sehifesini web-cbar-new burda redesign etmek ui da hal hazirda olan sehife ve onun
etrafindaki sehifeleri nezereden kecir umumi databaza ve api speci analiz et lazimdirsa product-host bunun da analiz et" → təhlildən sonra:
"tövsiyələrinlə razıyam, spec-ə başla amma bir mesele var ki onu da nezere al biz figmaya uygun hereket etmeliyik ve melumat bazasini
korlamali deyilik".

Figma: fayl "cbar website", səhifə "Statistics" (`2681:158285`). Bölmənin 13 ekranı var, hər biri desktop (1728), tablet (744) və mobil
(390) kadrı ilə. Bu spec bunlardan səkkizini qurur:

| Ekran | Figma bölməsi | CMS səhifəsi (az slug, test id) |
|---|---|---|
| Statistika (giriş) | `2852:138958` | `statistika` (52) |
| Makroiqtisadi statistika | `2910:20935` (+ komponentlər `2910:20904`) | `makroiqtisadi-statistika` (54) |
| Pul-kredit statistikası | `2931:24174` (+ `2931:24173`) | `pul-kredit-statistikasi` (55) |
| Ödəniş sistemlərinin statistikası | `2939:26629` (+ `2939:26628`) | `odenis-sistemlerinin-statistikasi` (58) |
| Maliyyə sektorunun statistikası | `3487:293975` | `maliyye-sektorunun-statistikasi` (57) |
| Statistical Data for NSDP (yalnız en) | `3071:32077` | en `statistical-data-for-nsdp` (61) |
| Metodologiya | `3067:58867` | **yoxdur, yaradılır** |
| Məlumatların reviziyası siyasəti | `3374:61131` | **yoxdur, yaradılır** |

Qalan beş ekran **spec 062**-dir (faza 2): Statistik bülleten (`2881:5767`), Kredit təşkilatları (`2943:34317`), Sığorta sektoru
(`3037:37374`), Kapital bazarı (`3044:39352`), Xarici sektorun statistikası (`3056:59606`) və Statistik məlumatların yayımlanması qrafiki
(`2865:140796`). Bu spec-dən sonra onlar yeni bölmə şablonunda (breadcrumb, sol menyu) açılır, amma məzmunları hələ köhnə görünüşdədir.

Qərarlar (2026-11-27, istifadəçi təhlildəki tövsiyələrlə razılaşdı):

1. **Figma-ya uyğun hərəkət edirik.** Figma-da görünən hər şey qurulur, gizli qatlar qurulmur (spec 053 qaydası). Figma-nın özü ziddiyyətli
   olanda (məs. menyu etiketi ilə səhifə başlığı fərqli) qərar və səbəbi "Figma-dan qəsdən fərqlər" bölməsində yazılır.
2. **Məlumat bazası korlanmır.** Bu spec heç bir mövcud cədvəli dəyişmir (`ALTER TABLE` yoxdur), heç bir sətri silmir və redaktorun
   dəyişdiyi məzmunun üstünə yazmır. Seed yalnız köhnə vəziyyəti tanıdıqda işləyir, təkrar işə düşəndə heç nə dəyişmir (FR-030…FR-038).
3. **`/statistics` qrafik səhifəsi `/statistics/charts`-a köçür.** Figma-da belə səhifə yoxdur, amma ana səhifə kartları ona link verir. Onun
   yerində bölmənin giriş səhifəsi açılır, en ünvan toqquşması aradan qalxır.
4. **İki spec.** Bu spec şablonu, girişi, fayl siyahılarını, iki yeni səhifəni və ağacın seed-ini verir; arxivlər və yayım qrafikinin
   cədvəlləri spec 062-dir.
5. **Məzmun redaktor datasından qurulur**, yeni məzmun növü yaradılmır (spec 054 modeli). Fayl qrupları üçün səhifə fayllarının mövcud
   "qrup" sahəsi işlədilir: o, artıq admin paneldə redaktə olunur və public API onu göndərir.
6. **"Hamısını yüklə (ZIP)" qurulur.** Təhlildə onu birinci fazada çıxarmağı təklif etmişdim, amma istifadəçinin "Figma-ya uyğun" şərti
   ilə bu tövsiyə geri götürülür: düymə Figma-dadır.
7. **"Yenilənib" tarixi** faylın başlığındakı `(dd.mm.yyyy)` tarixidir; başlıqda tarix yoxdursa faylın yüklənmə tarixidir. İkincisi üçün
   public API faylın yüklənmə tarixini göndərməyə başlayır (yalnız əlavə sahə, spec-first).
8. **Qrup adları birdillidir.** Səhifə faylının qrup sahəsi dilə görə ayrılmır, ona görə en səhifədə qruplar (çiplər və başlıqlar)
   göstərilmir, fayllar bir siyahıdır. Dilə görə qrup adı sonrakı işdir.
9. **"İnteraktiv statistik məlumat bazası"** xarici link olaraq qalır (`https://navigation.e-cbar.az/`).
10. **Rəqəmsal ödəniş statistikası** (köhnə saytın `statsDB` qrafikləri, diff_report #10) Figma-da yoxdur və bu spec-in xaricindədir.
11. **Giriş mətni yalnız Figma-da görünən yerdədir** (plan, 2026-11-27). Figma-da Makro, Pul-kredit, Ödəniş, NSDP, Metodologiya və
    Reviziya səhifələrinin giriş abzası **gizli qatdır** (`visible: false`); görünən giriş yalnız kök səhifədə və "Maliyyə sektorunun
    statistikası"ndadır. Ona görə seed həmin altı səhifəyə mətn yazmır: dördünün mətni indi boşdur, ikisi boş yaradılır. Redaktor
    sonradan mətn yazarsa sayt onu başlıqdan sonra göstərir. En qaralama tərcüməsi yalnız Maliyyə sektorunun bir cümləsi və yeni
    səhifələrin başlıqları üçündür.
12. **"Son yenilənmə" fayl siyahısından sonra tam enli zolaqdır** (Figma `2910:20959`, 984 × 78), sağ sütun deyil.
13. **Makroda çip qısa addır.** Figma-da qrup başlığı "Daşınar əmlak reyestri", çipi "Reyestr"dir. Qrup adı bir sahə olduğu üçün redaktor
    ona `Daşınar əmlak reyestri | Reyestr` yazır: `|`-dan əvvəl başlıq, sonra çip. `|` yoxdursa ikisi eynidir (D2).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi Statistika bölməsinə girir və onda Figma-dakı kimi gəzir (Priority: P1)

Ziyarətçi başlıqdakı "Statistika" keçidinə və ya ana səhifədən bölməyə keçir. Giriş səhifəsində breadcrumb ("Ana səhifə › Statistika"),
paylaşma düymələri, solda bölmə menyusu, sağda "Statistika" başlığı və üç abzaslıq giriş mətni görür. Menyu Figma sırasındadır, "Maliyyə
sektorunun statistikası" altında üç alt səhifə açılır, "İnteraktiv statistik məlumat bazası" xarici sayta aparır. Bölmənin hər səhifəsində,
faza 2 səhifələri daxil, eyni şablon görünür.

**Why this priority**: bölmənin bütün səhifələri bu şablona söykənir; ondan sonra hər səhifə ayrıca çatdırıla bilər.

**Independent Test**: `/az/statistika` və `/en/statistics` açılır, menyu, breadcrumb və mətn Figma kadrları `2846:137396`, `2848:173141`,
`2848:173907` ilə üç enlikdə tutuşdurulur.

**Acceptance Scenarios**:

1. **Given** bölmə seed-dən keçib, **When** ziyarətçi `/az/statistika` açır, **Then** sol menyuda bu sıra görünür: Statistik bülleten,
   Makroiqtisadi statistika, Pul-kredit statistikası, Maliyyə sektorunun statistikası, Ödəniş sistemlərinin statistikası, Xarici sektorun
   statistikası, İnteraktiv statistik məlumat bazası, Statistik məlumatların yayımlanması qrafiki, Metodologiya, Məlumatların reviziyası
   siyasəti.
2. **Given** ziyarətçi en dilindədir, **When** `/en/statistics` açır, **Then** qrafik səhifəsi yox, bölmənin giriş səhifəsi açılır və
   menyuda əlavə olaraq "Statistical Data for NSDP" görünür.
3. **Given** ziyarətçi "Kredit təşkilatları" səhifəsindədir, **When** menyuya baxır, **Then** "Maliyyə sektorunun statistikası" açıqdır və
   cari səhifə işarələnib.
4. **Given** "Statistika (Kopya)" qaralama ağacı bazada var, **When** ziyarətçi hər hansı menyuya baxır, **Then** qaralama görünmür, amma
   ünvanı açılır.
5. **Given** ziyarətçi `/az/statistics` yazır, **When** səhifə açılır, **Then** `/az/statistika`-ya yönləndirilir.

---

### User Story 2 — Ziyarətçi statistik cədvəli kateqoriya üzrə tapıb yükləyir (Priority: P1)

Ziyarətçi "Makroiqtisadi statistika", "Pul-kredit statistikası" və ya "Ödəniş sistemlərinin statistikası" səhifəsini açır. Başlıqdan
sonra kateqoriya çipləri ("Hamısı", sonra qruplar) və qruplanmış fayl kartları görür. Hər kartda cədvəlin adı, "Yenilənib:
dd.mm.yyyy" və XLS düyməsi var. Siyahıdan sonra "Son yenilənmə" zolağı: "Son yenilənmə: 27 oktyabr 2026" və "Hamısını yüklə (ZIP)"
düyməsi. Bir çip seçiləndə yalnız o qrup qalır.

**Why this priority**: bu üç səhifə bölmənin ən çox istifadə olunan, mütəmadi yenilənən cədvəlləridir (43 fayl).

**Independent Test**: üç səhifə üç enlikdə Figma kadrları ilə tutuşdurulur; hər çip seçilir, hər fayl yüklənir, ZIP açılıb fayl sayı
yoxlanır.

**Acceptance Scenarios**:

1. **Given** Makro səhifəsinin 9 faylının qrupu var, **When** ziyarətçi səhifəni açır, **Then** çiplər "Hamısı, Real sektor və qiymətlər,
   Dövlət maliyyəsi, Xarici sektor, Məzənnə, Reyestr" görünür, "Hamısı" seçilidir, fayllar beş başlıq altında Figma sırasındadır.
2. **Given** ziyarətçi "Məzənnə" çipini seçir, **When** səhifə yenilənir, **Then** yalnız "Məzənnə" qrupunun iki faylı qalır, ünvanda seçim
   görünür və həmin ünvan paylaşılanda eyni görünüş açılır.
3. **Given** faylın başlığı "Pul icmalı (25.05.2026)"-dir, **When** kart göstərilir, **Then** kartda "Pul icmalı" və "Yenilənib: 25.05.2026"
   yazılır.
4. **Given** faylın başlığında tarix yoxdur, **When** kart göstərilir, **Then** "Yenilənib" faylın yüklənmə tarixini göstərir.
5. **Given** ziyarətçi "Hamısını yüklə (ZIP)" basır, **When** yükləmə bitir, **Then** arxivdə səhifənin həmin dildə görünən bütün faylları
   var, adları kartlardakı başlıqlardır.
6. **Given** səhifə mobil enlikdədir, **When** ziyarətçi kateqoriya seçmək istəyir, **Then** Figma mobil kadrındakı kimi seçim açılan menyu
   şəklindədir.
7. **Given** JavaScript işləmir, **When** ziyarətçi çip seçir və ya fayl yükləyir, **Then** hər ikisi işləyir.

---

### User Story 3 — Redaktor fayl səhifələrini admin paneldən idarə edir (Priority: P2)

Redaktor yeni ayın cədvəlini yükləyir: səhifənin fayl siyahısında köhnə faylı yenisi ilə əvəz edir və ya yeni fayl əlavə edib ona qrup
verir. Saytda kart, "Yenilənib" və "Son yenilənmə" dərhal yenilənir. Redaktor faylın qrupunu dəyişərək onu başqa kateqoriyaya keçirir,
fayl sırasını dəyişərək kartların sırasını dəyişir.

**Why this priority**: yeni admin ekranı yoxdur, amma redaktorun mövcud alətlərlə nə edəcəyi aydın yazılmalıdır, yoxsa səhifə köhnələr.

**Independent Test**: admin paneldə bir faylın qrupu və sırası dəyişdirilir, saytda nəticə yoxlanır; redaktor təlimatındakı addımlar
təkrarlanır.

**Acceptance Scenarios**:

1. **Given** redaktor faylın qrupunu "Kreditlər"-dən "Depozitlər"-ə dəyişir, **When** sayt yenilənir, **Then** kart "Depozitlər" başlığı
   altına keçir.
2. **Given** redaktor yeni qrup adı yazır, **When** sayt yenilənir, **Then** yeni çip və başlıq yaranır, qrupların sırası faylların sırasına
   görədir.
3. **Given** redaktor yeni fayl yükləyir və başlığa tarix yazmır, **When** sayt yenilənir, **Then** kartda yüklənmə tarixi görünür və
   "Son yenilənmə" həmin tarixə keçir.

---

### User Story 4 — Ziyarətçi NSDP, Metodologiya, Reviziya və Maliyyə sektoru səhifələrini Figma-dakı kimi görür (Priority: P2)

Ziyarətçi en dilində "Statistical Data for NSDP" səhifəsində altı dataset görür, hər birinin bir kartında XML və XLS düymələri var.
"Metodologiya" səhifəsində metodika sənədlərinin kartları (PDF), "Məlumatların reviziyası siyasəti" səhifəsində "Reviziya qaydası" kartı
(DOC) görünür. "Maliyyə sektorunun statistikası" səhifəsi yalnız giriş mətnidir, alt səhifələr menyudadır.

**Why this priority**: kiçik səhifələrdir, eyni kart komponentini işlədir; ikisi bölməyə yeni əlavə olunur.

**Independent Test**: dörd səhifə üç enlikdə Figma kadrları ilə tutuşdurulur.

**Acceptance Scenarios**:

1. **Given** NSDP səhifəsinin 12 faylı cüt-cüt eyni başlıqlıdır, **When** səhifə açılır, **Then** 6 kart görünür, hər birində XML və XLS.
2. **Given** Metodologiya səhifəsinə hələ fayl bağlanmayıb, **When** səhifə açılır, **Then** yalnız başlıq görünür, boş qutu və xəta
   yoxdur.
3. **Given** "Maliyyə sektorunun statistikası" səhifəsinin mətni köhnə importdan qalıb (Kredit təşkilatları səhifəsinin mətninin eynisidir),
   **When** seed işləyir, **Then** onun mətni Figma giriş cümləsi olur; Kredit təşkilatları səhifəsinin mətni olduğu kimi qalır.

---

### User Story 5 — Qrafik səhifəsi və köhnə linklər itmir (Priority: P3)

AZIR, inflyasiya və gəlirlilik əyrisi qrafikləri `/statistics/charts` ünvanında açılır. Ana səhifə statistika kartlarının "Daha ətraflı"
keçidləri oraya aparır. `/statistics/azir` və onun Excel ixracı dəyişmir.

**Why this priority**: mövcud funksiyanın itməməsi (Konstitusiya I.3), amma yeni dizaynın hissəsi deyil.

**Independent Test**: üç ünvan və ana səhifənin bütün "Daha ətraflı" keçidləri açılır.

**Acceptance Scenarios**:

1. **Given** ziyarətçi ana səhifədə "Daha ətraflı" basır, **When** səhifə açılır, **Then** `/{locale}/statistics/charts` qrafikləri göstərir.
2. **Given** ziyarətçi `/az/statistics/azir` açır, **When** səhifə yüklənir, **Then** AZIR səhifəsi əvvəlki kimidir.

---

### Edge Cases

- Fayl səhifəsində heç bir faylın qrupu yoxdur: çiplər göstərilmir, fayllar bir siyahıdır.
- Bəzi faylların qrupu var, bəzilərinin yoxdur: qrupsuz fayllar qruplardan sonra başlıqsız siyahıdadır, "Hamısı" onları da göstərir, qrup
  çipi seçiləndə görünmür.
- Ünvandakı kateqoriya mövcud deyil və ya qrupsuzdur: "Hamısı" görünüşü açılır, xəta yoxdur.
- Səhifənin heç faylı yoxdur: "Son yenilənmə" kartı və ZIP düyməsi göstərilmir, səhifə başlıq və mətnlə açılır.
- En səhifədə faylların az qrup adları var: qruplar göstərilmir (Qərar 8).
- Faylın başlığındakı tarix yanlışdır (məs. `31.02.2026`): tarix kimi qəbul edilmir, başlıq olduğu kimi qalır, yüklənmə tarixi işlədilir.
- ZIP üçün faylların cəmi limiti aşır və ya bir fayl alınmır: ziyarətçi aydın xəta səhifəsi görür, yarımçıq arxiv verilmir.
- Eyni adlı iki fayl ZIP-ə düşür: arxivdə adlar bir-birini əvəz etmir (ikincisi nömrə alır).
- NSDP-də bir datasetin yalnız bir faylı var: kartda yalnız o düymə görünür.
- Seed işləyəndə bölmə yoxdur, səhifə başqa yerə köçürülüb, başlıq və ya mətn redaktor tərəfindən dəyişdirilib, ağac sırası artıq fərqlidir:
  həmin hissə toxunulmadan ötürülür və logda qeyd olunur.
- Seed-in rolu cədvəllərə yazma hüququna malik deyil: seed heç nə yazmadan xəbərdarlıqla ötür, deploy bloklanmır.
- Seed ikinci dəfə işləyir: heç bir sətir dəyişmir.
- Public API köhnədir və yüklənmə tarixini göndərmir: kartlarda yalnız başlıqdakı tarix göstərilir, tarixsiz kartda "Yenilənib" sətri yoxdur.

## Requirements *(mandatory)*

### Functional Requirements

**Bölmə şablonu**

- **FR-001**: Statistika bölməsinin kökü və bütün alt səhifələri bölmə şablonunda açılmalıdır: breadcrumb (səhifə ağacından), paylaşma
  düymələri, sol bölmə menyusu, məzmun sütunu; ölçülər və aralıqlar Figma kadrlarına uyğun, üç enlikdə (desktop, tablet, mobil).
- **FR-002**: Sol menyu, açılan menyular və footer bölmənin ağacını ağacdakı sıra ilə göstərməlidir; menyuda görünüş qaydaları (sol menyuda
  göstər / yalnız açılan menyularda / heç birində) bu bölmədə də işləməlidir.
- **FR-003**: Xarici ünvanlı menyu bəndi ("İnteraktiv statistik məlumat bazası") xarici keçid kimi işləməlidir.
- **FR-004**: Faza 2 səhifələri (Bülleten, Kredit təşkilatları, Sığorta, Kapital bazarı, Xarici sektor, Yayım qrafiki) şablonda köhnə
  məzmunları ilə açılmalıdır; heç bir mətn və ya fayl itməməlidir.

**Giriş səhifəsi**

- **FR-005**: Kök səhifə başlığı və mətnini CMS-dən göstərməlidir (az `/az/statistika`, en `/en/statistics`).
- **FR-006**: `/{locale}/statistics` ünvanı bölmənin giriş səhifəsini açmalıdır: en-də birbaşa (slug budur), az-da `/az/statistika`-ya
  daimi yönləndirmə ilə.

**Fayl səhifələri (Makro, Pul-kredit, Ödəniş)**

- **FR-007**: Səhifə başlıq, kateqoriya seçimi, qruplanmış fayl kartları və onlardan sonra "Son yenilənmə" zolağını Figma düzülüşü ilə
  göstərməlidir; səhifənin CMS mətni yalnız boş deyilsə başlıqdan sonra görünür (Qərar 11).
- **FR-008**: Kateqoriyalar səhifə fayllarının qrup adlarıdır, faylların sırasında ilk görünmə sırası ilə; birinci seçim "Hamısı"dır.
  Qrup adında `|` varsa ondan əvvəlki hissə qrup başlığı, sonrakı hissə çipin mətnidir (Qərar 13).
- **FR-009**: Seçilmiş kateqoriya ünvanda saxlanmalıdır, JavaScript olmadan işləməlidir və ünvan paylaşılanda eyni görünüşü açmalıdır.
- **FR-010**: Mobil enlikdə kateqoriya seçimi Figma mobil kadrındakı açılan menyu şəklində olmalıdır.
- **FR-011**: Hər fayl kartı başlığı, "Yenilənib: dd.mm.yyyy" sətrini və format nişanını (XLS, PDF, DOC, XML, ZIP) göstərməli, kartın
  düyməsi faylı yükləməlidir.
- **FR-012**: Kartdakı başlıq faylın başlığından sondakı `(dd.mm.yyyy)` atılaraq alınmalıdır; o tarix "Yenilənib" tarixidir. Başlıqda
  etibarlı tarix yoxdursa "Yenilənib" faylın yüklənmə tarixidir; heç biri yoxdursa sətir göstərilmir.
- **FR-013**: "Son yenilənmə" zolağı səhifə fayllarının ən son "Yenilənib" tarixini ("Son yenilənmə: 27 oktyabr 2026") və "Hamısını yüklə
  (ZIP)" düyməsini göstərməlidir. Figma-da zolağın "SON YENİLƏNMƏ" etiketi, "N statistik cədvəl · Excel formatında" sətri və "Yayım qrafiki
  →" keçidi gizli qatlardır (`2910:20961`, `2910:21864`, `2910:20963`, `visible: false`) və qurulmur (Qərar 1; implementasiyada, 2026-11-27).
- **FR-014**: "Hamısını yüklə (ZIP)" səhifənin həmin dildə görünən bütün fayllarını bir arxivdə verməlidir; fayl adları kart başlıqları və
  öz uzantıları olmalı, təkrarlanan adlar nömrələnməlidir.
- **FR-015**: ZIP yalnız dərc olunmuş səhifənin public fayllarını əhatə etməli, ölçü və fayl sayı limitinə malik olmalı, limit aşanda və ya
  fayl alınmayanda yarımçıq arxiv verməməlidir.
- **FR-016**: En səhifədə kateqoriya seçimi və qrup başlıqları göstərilməməlidir (Qərar 8).

**NSDP, Metodologiya, Reviziya, Maliyyə sektoru**

- **FR-017**: NSDP səhifəsi eyni başlıqlı faylları bir dataset kartında birləşdirməli, kartda hər format üçün ayrıca düymə göstərməlidir
  (Figma sırası: XML, sonra XLS).
- **FR-018**: Metodologiya və Reviziya səhifələri başlıq və səhifə fayllarının sənəd kartlarını (format nişanı ilə) göstərməlidir;
  CMS mətni yalnız boş deyilsə görünür; faylsız və mətnsiz səhifə yalnız başlıqla açılmalıdır.
- **FR-019**: "Maliyyə sektorunun statistikası" səhifəsi başlıq və giriş mətnini göstərməlidir.

**Qrafik səhifəsi və ana səhifə**

- **FR-020**: AZIR, inflyasiya və gəlirlilik əyrisi qrafikləri `/{locale}/statistics/charts` ünvanında, indiki davranışla açılmalıdır.
- **FR-021**: Ana səhifənin indi `/statistics`-ə aparan bütün keçidləri `/statistics/charts`-a aparmalıdır.
- **FR-022**: `/{locale}/statistics/azir` və onun ixracı dəyişməməlidir.

**Public API**

- **FR-023**: Səhifə cavabındakı hər fayl yüklənmə tarixini də göndərməlidir; bu, yalnız əlavə sahədir, mövcud sahələr və onların mənası
  dəyişmir, köhnə sayt versiyası onu nəzərə almadan işləyir. Dəyişiklik əvvəl API spec-ində təsdiqlənir.
- **FR-024**: Sayt bu sahəni göndərməyən köhnə API ilə də işləməlidir (FR-012-nin son halı).

**Sənədlər**

- **FR-025**: Redaktor təlimatı yazılmalıdır: hansı səhifənin hansı görünüşü var, faylın qrupu və sırası nə edir, tarixi başlığa necə
  yazmaq lazımdır, yeni ay faylı necə əvəz olunur, ZIP nəyi əhatə edir.
- **FR-026**: Naviqasiya təlimatı, layihə `CLAUDE.md`-si və business-logic sənədləri eyni dəyişiklikdə yenilənməlidir.

**Seed (məlumat bazasının qorunması)**

- **FR-030**: Seed yeni miqrasiya faylıdır, unikal adla; mövcud miqrasiyalar redaktə olunmur, heç bir cədvələ `ALTER TABLE` edilmir, yeni
  cədvəl yaradılmır, heç bir sətir silinmir.
- **FR-031**: Seed səhifələri az slug ilə tapmalıdır (id-lər mühitə görə fərqlidir); tapmadığı səhifəni ötməli və logda qeyd etməlidir.
- **FR-032**: Seed cədvəllərə lazım olan hüquqları əvvəlcə yoxlamalı, hüquq yoxdursa heç nə yazmadan xəbərdarlıqla bitməli və deploy-u
  bloklamamalıdır.
- **FR-033**: Kökün alt səhifələrinin sırası Figma sırasına yalnız indiki sıra köhnə import sırası ilə eyni olduqda dəyişdirilməlidir;
  redaktor sıranı dəyişibsə toxunulmamalıdır.
- **FR-034**: Başlıqlar yalnız köhnə başlığın üstünə yazılmalıdır: "Statistik hesabatların yayımlanması qrafiki" → "Statistik məlumatların
  yayımlanması qrafiki", "Sığorta" → "Sığorta sektoru"; en-də müvafiq Figma/qaralama adları. Slug-lar, deməli ünvanlar dəyişmir.
- **FR-035**: Seed yalnız bir mətn yazır: "Maliyyə sektorunun statistikası"nın Figma giriş cümləsi (az + en qaralama), yalnız onun indiki
  mətni Kredit təşkilatları səhifəsinin mətni ilə **eyni** olduqda (köhnə importun dublikatı; o mətn Kredit təşkilatlarında qalır, heç nə
  itmir). Kök səhifənin mətni Figma ilə eynidir, toxunulmur; Figma-da gizli olan giriş mətnləri yazılmır (Qərar 11).
- **FR-036**: "Metodologiya" və "Məlumatların reviziyası siyasəti" səhifələri yalnız kökün altında belə səhifə yoxdursa yaradılmalıdır, az
  və en tərcüməsi ilə, Figma sırasında, boş mətnlə; slug başqa səhifədə tutulubsa seed onu ötür və logda yazır; fayllar redaktor işidir.
- **FR-037**: Makro, Pul-kredit və Ödəniş fayllarının qrup adı yalnız qrupu boş olan fayla, az başlığının (sondakı tarix atılmaqla) köhnə
  başlıqlar siyahısı ilə dəqiq uyğunluğuna görə yazılmalıdır; uyğun gəlməyən fayl qrupsuz qalır və logda sayılır.
- **FR-041**: Faylın az başlığı Figma mətninə yalnız indiki başlıq köhnə başlığın eynisi olduqda düzəldilməlidir (məs. "kredıt" →
  "kredit", durğu işarələri); sondakı tarix saxlanır, en başlıqlarına toxunulmur. Düzəliş cütləri seed mənbəyində açıq siyahıdır.
- **FR-042**: Faylların sırası yalnız Ödəniş səhifəsində dəyişdirilməlidir (Figma qrup sırası: Milli Ödəniş Sistemləri, Ödəniş kartları,
  Ödəniş xidməti şəbəkəsi, Hesablar və köçürmələr), yalnız səhifənin bütün fayllarının indiki sırası köhnə import sırası ilə eyni olduqda.
  Makro və Pul-kreditdə köhnə sıra Figma sırasını onsuz da verir, onlara toxunulmur.
- **FR-038**: "Statistika (Kopya)" qaralama ağacının kökü bütün menyulardan çıxarılmalıdır, yalnız onun menyu qeydi hələ yoxdursa; qaralama
  səhifələri, mətnləri və ünvanları qalır.
- **FR-039**: Seed təkrar işə düşəndə heç bir sətri dəyişməməlidir və logda nə etdiyini (yaradılan, dəyişən, ötülən say) yazmalıdır.
- **FR-040**: Seed boş bazada (Statistika bölməsi olmayan) xətasız ötməlidir.

### Key Entities

- **Bölmə səhifəsi**: CMS ağacında Statistika kökü altındakı səhifə; başlıq, slug, mətn, menyu bayraqları və sırası var, iki dilli.
- **Səhifə faylı**: səhifəyə bağlanmış media; başlıq (dilə görə), sıra, qrup adı (birdilli), format, ölçü və yüklənmə tarixi.
- **Kateqoriya**: bir səhifənin eyni qrup adlı faylları; ayrıca saxlanmır, faylların qrup adından əmələ gəlir.
- **NSDP dataset**: eyni başlıqlı faylların (XML + XLS) birləşməsi; ayrıca saxlanmır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Bu spec-in səkkiz ekranının hər biri üç enlikdə Figma ölçüləri ilə tutuşdurulub; hər fərq ya düzəldilib, ya da "Figma-dan
  qəsdən fərqlər" bölməsində səbəbi ilə yazılıb.
- **SC-002**: Ziyarətçi fayl səhifəsində istədiyi cədvəli ən çox iki kliklə (kateqoriya + yükləmə) endirir.
- **SC-003**: Test mühitində Makro, Pul-kredit və Ödəniş səhifələrinin 43 faylının hamısı kartda görünür və yüklənir; seed-dən sonra
  hamısının kateqoriyası Figma-dakı kimidir.
- **SC-004**: Seed test mühitində iki dəfə işlədildikdə ikinci işləmə sıfır sətir dəyişir; seed-dən əvvəl və sonra səhifə, mətn və fayl
  sətirlərinin sayı azalmır, seed-in hədəfi olmayan heç bir sətir dəyişmir.
- **SC-005**: Bölmənin seed-dən əvvəl açılan bütün ünvanları seed-dən sonra da açılır (yönləndirmə daxil), heç biri 404 vermir.
- **SC-006**: ZIP arxivi səhifədəki fayl sayı qədər fayl saxlayır və hər biri açılır.
- **SC-007**: Bölmənin hər səhifəsi JavaScript-siz də oxunur və fayllar yüklənir.

## Assumptions

- Səhifələr id ilə yox, az slug ilə tapılır; test mühitindəki id-lər (52–61, 237–239, 359–370) yalnız istinad üçündür.
- Fayl səhifələrinin kateqoriya siyahısı və sırası Figma kadrlarından götürülür:
  - Makro: Real sektor və qiymətlər (3), Dövlət maliyyəsi (1), Xarici sektor (2), Məzənnə (2), Reyestr — başlıq "Daşınar əmlak reyestri" (1);
  - Pul-kredit: Pul göstəriciləri (5), Kreditlər (8), Depozitlər (5), Faiz dərəcələri (3), Valyuta bazarı (3);
  - Ödəniş: Milli Ödəniş Sistemləri (2), Ödəniş kartları (4), Ödəniş xidməti şəbəkəsi (2), Hesablar və köçürmələr (2).

  Makroda çip "Reyestr", başlıq "Daşınar əmlak reyestri"dir (Qərar 13).
- Figma-dakı kart sayları test bazasındakı fayl sayları ilə üst-üstə düşür (9 / 24 / 10); iki köhnə `.xls` faylı (`Regionlar (şəhər və
  rayonlar)…`) da XLS nişanı alır. Başlıq uyğunluğu planda fayl-fayl yoxlanır.
- Test mühitinin faylları placeholder-dir (eyni bir neçə media); real fayllar və tarixlər köhnə canlı sayt və ya prod dump ilə yoxlanır.
- Köhnə importla gələn faylların yüklənmə tarixi import günü ola bilər; buna görə başlıqdakı tarix üstündür (Qərar 7).
- Eyni baytlı faylın təkrar yüklənməsi köhnə media qeydinə bağlanır və köhnə tarixi saxlayır (2026-10-27 qərarı, dəyişmir); bu, "Yenilənib"
  tarixinə təsir edə bilər və redaktor təlimatında yazılır.
- ZIP faylları serverdə saytın özü toplayır; brauzer API-yə birbaşa getmir. Arxiv qurmaq üçün yeni runtime asılılıq lazım olarsa, plan onu
  əsaslandırır (Konstitusiya: yeni asılılıq yalnız spec ilə).
- Metodologiya səhifəsinin faylları ("Nominal və Real Effektiv Məzənnənin hesablanması metodologiyası", "Tədiyə Balansının tərtibi haqqında
  metodoloji izahat") və Reviziya qaydası redaktor tərəfindən bağlanır; metodika faylı Xarici sektor səhifəsindən çıxarılmır (spec 062).
- NSDP az səhifəsi Figma-da gizlidir və qurulmur; səhifə yalnız en-də var.
- Admin paneldə yeni ekran yoxdur; fayl qrupu və sırası mövcud səhifə formasından redaktə olunur.

## Figma-dan qəsdən fərqlər

| # | Figma | Bu spec | Səbəb |
|---|---|---|---|
| D1 | Sol menyuda "Pul və kredit statistikası", səhifə başlığında "Pul-kredit statistikası" | Başlıq və menyu "Pul-kredit statistikası" | Figma ziddiyyətlidir; menyu səhifə başlığından qurulur, başlıq və breadcrumb ilə eyni qalır |
| D2 | Makroda çip "Reyestr", qrup başlığı "Daşınar əmlak reyestri" | Fərq yoxdur: qrup adı `Daşınar əmlak reyestri \| Reyestr` (Qərar 13) | Qrup adı bir sahədir |
| D3 | En kadrı yoxdur (NSDP-dən başqa) | En-də qruplar göstərilmir | Qrup adı birdillidir (Qərar 8) |

## Paritet cədvəli (Konstitusiya I.3)

| Köhnə sayt (`product-host`) / indiki sayt | Yeni qarşılıq | Status |
|---|---|---|
| Statistika CMS səhifələri (`visitor` PagesController, static pages) | Eyni slug-larla, bölmə şablonunda | saxlanır |
| `/az/statistika`, `/en/statistics` | Bölmə girişi | saxlanır (en qrafik səhifəsi əvəzinə CMS) |
| `/{locale}/statistics` qrafik səhifəsi (yeni saytın öz səhifəsi) | `/{locale}/statistics/charts` | köçür |
| `/{locale}/statistics/azir`, `/export` | dəyişmir | saxlanır |
| Səhifə faylları (PDF/XLS/XML) | Fayl kartları + ZIP | saxlanır |
| İnteraktiv statistik məlumat bazası (xarici link) | Xarici link | saxlanır |
| Rəqəmsal ödəniş statistikası (`statsDB`) | — | bu spec-in xaricində (diff_report #10) |
| Bülleten, Kredit, Sığorta, Kapital, Xarici, Yayım qrafiki görünüşləri | spec 062 | faza 2 |

## Hədəf proyektlər və deploy sırası

1. `api-cbar-admin`: yalnız seed miqrasiyası (sxem dəyişmir). Birinci deploy olunur.
2. `api-cbar`: fayl cavabına yüklənmə tarixi (spec-first, əlavə sahə).
3. `web-cbar-new`: şablon, səhifələr, ZIP, qrafik səhifəsinin köçməsi, yönləndirmələr, təlimatlar.
4. `web-cbar-admin-new`: kod dəyişikliyi gözlənilmir; yalnız menyu yollarının sənədlərdə yoxlanması.
