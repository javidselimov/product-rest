# Feature Specification: Struktur sxemi — koordinatsız düzülüş və blokların açılan departament siyahısı

**Feature Branch**: `060-org-chart-auto-layout`

**Created**: 2026-11-25

**Status**: Draft

**Input**: "bloklara klik edəndə dropdown açılmalı və içindəki departamentlər görünməlidir. Amma admin paneldə bu funksionallıq deyəsən nəzərə
alınmayıb… fərqli branch-da bunun 3. Koordinatsız, ağacdan avtomatik düzülüş variantını icra edək, Figma ilə eyni olsun. 40 kartı mən daxil
etmişəm və canvas-da qurmuşam." Spec 027-nin (struktur sxemi) desktop hissəsini əvəz edir.

Qərarlar (2026-11-25, istifadəçi):

1. **Koordinatsız düzülüş.** Desktop sxemi kartların əllə verilmiş koordinatlarından yox, ağacın özündən qurulur: valideyn, sıra və kartın
   növü. Redaktor piksel, ölçü və xətt nöqtəsi vermir.
2. **Figma ilə eyni.** Desktop görünüşü Figma ilə eyni olmalıdır (spec 027-nin desktop qərarı qüvvədə qalır). Fərq yalnız yerləşdirmənin
   mənbəyindədir.
3. **Mövcud məlumat qalır.** İstifadəçinin test mühitində daxil etdiyi 40 kartın ağacı və mətnləri qalır. Yalnız onların koordinatları artıq
   istifadə olunmur.

4. **Bloka klik departamentləri açır** (2026-11-25, Q1). Departamentləri olan blokun öz səhifəsinə desktop-da hələlik keçid yoxdur:
   açılan siyahıda blok üçün sətir olmur, Figma-nın açıq halı ilə eynidir.
5. ~~**Paneldə önizləmə bu spec-də yoxdur** (2026-11-25, Q2).~~ **Dəyişdi 2026-11-26:** panel sxemi də göstərir (US4). Səhifədə
   "Siyahı | Sxem" görünüşləri var; sxem saytın desktop görünüşüdür, saytın süzgəci ilə, AZ/EN seçimi ilə; karta klik onun redaktə formunu
   açır. Sayt iframe-də açılmır (`X-Frame-Options: DENY`, `frame-ancestors 'none'`), ona görə panel düzülüşü öz datasından qurur.

Agentin qəbul etdiyi defoltlar (istifadəçi düzəldə bilər):

6. Bloklar bir-birindən asılı olmadan açılıb-bağlanır: bir neçəsi eyni anda açıq ola bilər. Səhifə açılanda hamısı bağlıdır.
7. Planşet və mobil görünüş (spec 027-nin ağac görünüşü) dəyişmir, blokun səhifəsi orada siyahının birinci sətri olaraq qalır.
8. Redaktorun hər kart üçün yeganə görünüş seçimi "blokun departamentləri: açılan siyahı / həmişə açıq"-dır. Qalan bütün yerləşmə qaydaları
   kartın və valideyninin növündən çıxır (FR-003).

**Köhnə vəziyyət** (`product-host`, spec 027, test mühiti, Figma; 2026-11-25):

- Köhnə saytda (`product-host`) sxem CMS-ə yüklənmiş şəkil idi. Klik, açılan siyahı və redaktə yox idi. Yeni sistemin qarşılığı spec 027-dir.
- Spec 027-də desktop sxemi (≥1360) hər kartın panelin canvas redaktorunda əllə qoyulmuş yeri, ölçüsü və əl ilə çəkilmiş xətləri ilə
  qurulur. Canvas-da yeri olmayan departament desktop-da **görünmür**. Belə departamentləri olan blokda caret ikonu var, amma ona klik heç nə
  açmır: blok kartı ya blokun səhifəsinə keçiddir, ya da klikə cavab vermir.
- Panelin canvas redaktorunda açıq/bağlı anlayışı yoxdur. Açılan siyahının harada görünəcəyini və altdakı kartların necə sürüşəcəyini vermək
  mümkün deyil.
- Planşet və mobildə blok artıq açılan siyahıdır. Blokun səhifəsi siyahının birinci sətridir.
- Test mühitində 40 kart var: 1 sədr, 5 müavin, 10 baş direktor, 13 blok, 11 departament. Hamısı canvas-da yerləşdirilib. Bəzi kartların
  valideyni canvas-da düzgün görünsün deyə seçilib, mənaya görə yox. Məsələn, "Təşkilati inkişaf bloku"nun altında görünən 4 departament
  ağacda blokun yox, müavinin (Gülər Paşayeva) uşağıdır.
- Figma-nın desktop sxemi (`2007:86378`) özü auto-layout ilə qurulub: hər müavinin qrupu şaquli stack-dir, baş direktor və blok 68 px enində
  sütundur, kartlar arası aralıq 10 px (baş direktor → blok) və 8 px (blok → blok). Bloklar kartın komponentidir (`1965:*`), açıq və bağlı
  halları var. İstifadəçinin göndərdiyi ekran şəklində "Kredit təşkilatlarının fəaliyyətinin tənzimlənməsi bloku" açıqdır: altında 3
  departament görünür, "Maliyyə monitorinqi bloku" isə aşağı itələnib.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi bloka klik edib departamentlərini görür (Priority: P1)

Ziyarətçi desktop-da "Struktur və əsasnamələr" səhifəsində sxemə baxır. Departamentləri olan blokun sağ-altında caret var. Bloka klik
edəndə altında departamentlərin siyahısı açılır. Eyni sütunda altda olan kartlar (məsələn, "Maliyyə monitorinqi bloku") siyahının hündürlüyü
qədər aşağı düşür və heç nə üst-üstə minmir. Yenidən klik siyahını bağlayır. Departamentə klik onun səhifəsini açır.

**Why this priority**: İstifadəçinin qaldırdığı problem budur. Bu gün desktop-da bu departamentləri görmək ümumiyyətlə mümkün deyil.

**Independent Test**: Departamentləri olan blok olan bazada desktop enində səhifəni açmaq, bloka klik etmək. Siyahı açılır, altdakı blok
aşağı düşür, departament linkləri işləyir.

**Acceptance Scenarios**:

1. **Given** "Kredit təşkilatlarının fəaliyyətinin tənzimlənməsi bloku"nun 3 departamenti var və bağlıdır, **When** ziyarətçi bloka klik edir,
   **Then** blokun altında 3 departament görünür, caret yuxarı baxır, "Maliyyə monitorinqi bloku" departamentlərin altına düşür.
2. **Given** blok açıqdır, **When** ziyarətçi yenidən bloka klik edir, **Then** siyahı bağlanır və "Maliyyə monitorinqi bloku" əvvəlki yerinə
   qayıdır.
3. **Given** iki fərqli sütunda iki blok var, **When** ziyarətçi hər ikisini açır, **Then** hər ikisi açıq qalır və hər sütunda yalnız öz
   altındakı kartlar sürüşür.
4. **Given** klaviatura ilə işləyən ziyarətçi, **When** Tab ilə bloka gəlib Enter və ya Space basır, **Then** siyahı açılır. Ekran oxuyucu
   blokun açıq və ya bağlı olduğunu bildirir.
5. **Given** brauzerdə JavaScript söndürülüb, **When** ziyarətçi bloka klik edir, **Then** siyahı yenə açılır və bağlanır.
6. **Given** departamentin səhifəsi ziyarətçinin dilində var, **When** ziyarətçi açılan siyahıda departamentə klik edir, **Then** departamentin
   səhifəsi açılır.

---

### User Story 2 — Desktop sxemi koordinatsız qurulur və Figma ilə eynidir (Priority: P1)

Redaktor sxemdə heç bir kartın yerini, ölçüsünü və ya xəttini vermir. Ziyarətçi desktop-da Figma-dakı sxemi görür: sədr və onun
departamentləri, müavinlər, onların altında baş direktorlar və bloklar, birləşdirici xətlər. Hamısı ağacdan qurulur.

**Why this priority**: Açılan siyahı (US1) yalnız kartlar axında düzüləndə etibarlı işləyir. Bu, həm də redaktorun ən ağır işini (≈50 kartı
piksel-piksel yerləşdirmək) aradan qaldırır.

**Independent Test**: Figma-dakı ağaca uyğun məlumatla səhifəni 1728 px enində açıb kartların və xətlərin yerini Figma rəqəmləri ilə
ölçmək. Kartların heç birinin koordinatı daxil edilməyib.

**Acceptance Scenarios**:

1. **Given** heç bir kartın koordinatı yoxdur, **When** ziyarətçi desktop-da səhifəni açır, **Then** bütün aktiv kartlar sxemdə görünür.
   "Canvas-da olmadığı üçün görünməyən" kart yoxdur.
2. **Given** Figma-dakı strukturu əks etdirən ağac, **When** səhifə 1728 px enində açılır, **Then** hər kartın yeri və ölçüsü, hər xəttin
   başlanğıcı və sonu Figma-dakı ilə ±1 px uyğun gəlir (bütün bloklar bağlı halda).
3. **Given** redaktor müavinin altına yeni baş direktor əlavə edir, **When** səhifə yenilənir, **Then** yeni sütun həmin müavinin sırasında
   öz yerində görünür, qonşu sütunlar və xətlər buna uyğun düzülür. Redaktor heç bir əlavə yerləşdirmə etmir.
4. **Given** kartın adı uzundur və bir neçə sətrə keçir, **When** səhifə açılır, **Then** kart hündürləşir, altındakı kartlar və xətlər
   ona görə aşağı düşür, heç nə üst-üstə minmir.

---

### User Story 3 — Redaktor sxemi yalnız ağacla idarə edir (Priority: P2)

Redaktor paneldə "Təşkilat → Struktur sxemi" bölməsində kartları əlavə edir, redaktə edir, silir, valideynini dəyişir və qardaşlar arasında
sıranı rəqəm yazmadan dəyişir. Blok üçün departamentlərin "açılan siyahı" və ya "həmişə açıq" görünəcəyini seçir. Canvas redaktoru
(sürükləmə, ölçü, xətt nöqtələri, "canvas-da olmayanlar" siyahısı) yoxdur.

**Why this priority**: Struktur dəyişəndə redaktorun işi bir neçə klikə enir. Lakin US1 və US2 mövcud sıra rəqəmləri ilə də işləyir, ona görə
bu ikinci prioritetdir.

**Independent Test**: Paneldə bir blokun iki departamentinin yerini dəyişmək və bir bloku "həmişə açıq" etmək. Saytda sıra və görünüş
dəyişir. Heç bir koordinat sahəsi görünmür.

**Acceptance Scenarios**:

1. **Given** blokun üç departamenti var, **When** redaktor üçüncünü birinci yerə gətirir, **Then** dəyişiklik dərhal saxlanır və saytın
   açılan siyahısında yeni sırada görünür.
2. **Given** "Təşkilati inkişaf bloku"nun departamentləri var, **When** redaktor bu blok üçün "həmişə açıq" seçir, **Then** saytda blokun
   departamentləri klik olmadan görünür, blokda caret olmur, blok kartı öz səhifəsinə keçid olaraq qalır.
3. **Given** redaktor kartın valideynini dəyişir, **When** saxlayır, **Then** kart saytda yeni valideyninin altında, onun növünə uyğun
   yerdə görünür.
4. **Given** panel bölməsi açılır, **When** redaktor ona baxır, **Then** x/y/en/hündürlük, xətt nöqtələri və "canvas-da olmayanlar"
   siyahısı yoxdur.
5. **Given** redaktor kartın sıra yerini dəyişdi, **When** saxlama alınmır (şəbəkə, server xətası), **Then** panel xətanı göstərir və sıra
   əvvəlki vəziyyətinə qayıdır.

---

### User Story 4 — Redaktor sxemi paneldə görür və oradan redaktə edir (Priority: P2)

Redaktor "Struktur sxemi" səhifəsində "Sxem" görünüşünə keçir və saytın desktop sxemini paneldə görür: eyni düzülüş, eyni ölçülər, eyni
xətlər, saytda görünməyən kartlar olmadan. AZ və EN arasında keçir. Karta klik edəndə həmin kartın redaktə formu açılır; saxlayandan sonra
sxem dərhal yenilənir.

**Why this priority**: Redaktor dəyişikliyin nəticəsini saytı açmadan və keşi gözləmədən görür, səhv valideyni sxemdə tapıb oradan düzəldir.
US1–US3 onsuz da işləyir.

**Independent Test**: "Sxem"-ə keçmək, bir departamentə klik edib valideynini dəyişmək, saxlamaq. Departament sxemdə yeni yerində görünür.

**Acceptance Scenarios**:

1. **Given** sxemdə kartlar var, **When** redaktor "Sxem"-ə keçir, **Then** saytın desktop sxemi ilə eyni düzülüş görünür (eyni qaydalar,
   eyni ölçülər); deaktiv kart, deaktiv əməkdaşa/şöbəyə bağlı kart və seçilmiş dildə adı olmayan kart nəsli ilə birlikdə görünmür.
2. **Given** "Sxem" açıqdır, **When** redaktor EN seçir, **Then** sxem ingiliscə adlarla, EN süzgəci ilə qurulur.
3. **Given** "Sxem" açıqdır, **When** redaktor departament, baş direktor, müavin, sədr və ya açılan siyahısı olmayan bloka klik edir,
   **Then** həmin kartın redaktə formu açılır. Açılan siyahılı blokda klik saytdakı kimi siyahını açır.
4. **Given** redaktor formdan saxladı, **When** form bağlanır, **Then** sxem yeni vəziyyəti göstərir.
5. **Given** redaktor səhifəni yenidən açır və ya linki paylaşır, **When** səhifə yüklənir, **Then** seçilmiş görünüş və dil ünvandan bərpa olunur.

---

### Edge Cases

- **Departamenti olmayan blok:** caret yoxdur, açılan siyahı yoxdur. Blok kartı öz səhifəsinə keçiddir (səhifəsi o dildə varsa), yoxsa
  sadə kartdır.
- **Departamentləri olan, amma öz səhifəsi olan blok:** desktop-da blokun səhifəsinə keçid yoxdur (FR-006). Planşet və mobildə keçid
  siyahının birinci sətridir (spec 027).
- **Bütün departamentləri bu dildə filtrdən düşən blok** (deaktiv, adı yoxdur): blok departamentsiz blok kimi davranır, caret olmur.
- **Figma-da olmayan növ birləşməsi** (məsələn, baş direktorun altında departament, sədrin altında blok, müavinin altında qrup): kart
  valideyninin altında adi sütun uşağı kimi göstərilir və itmir (FR-003, son bənd).
- **Qrup (növ 6):** bloka bərabər tutulur: departamentləri varsa açılan siyahıdır, "həmişə açıq" seçimi ona da aiddir.
- **Sxem desktop konteynerindən enlidir** (çoxlu sütun): sxem kəsilmir və səhifəni üfüqi sürüşdürmür. Sxemin öz sahəsi üfüqi sürüşür və
  bu sahə klaviatura ilə də sürüşdürülə bilir.
- **Çox uzun departament siyahısı:** açılan siyahı tam açılır, sxem aşağı uzanır. Daxili sürüşmə yoxdur.
- **Çap:** bağlı siyahılar çapda da bağlı qalır (brauzerin standart davranışı). Bu spec çap üçün ayrıca qayda qoymur.
- **Sxem boşdur və ya sorğu yıxılır:** spec 027-nin fallback-i dəyişmir (CMS şəkli və şöbə siyahısı).
- **Planşet/mobil:** "həmişə açıq" seçimi planşet və mobil ağacına təsir etmir. Orada bloklar spec 027-dəki kimi açılan siyahı olaraq qalır.

## Requirements *(mandatory)*

### Functional Requirements

**Sayt — desktop sxemi (≥1360 px)**

- **FR-001**: Desktop sxemi yalnız ağacdan qurulmalıdır: valideyn, qardaşlar arası sıra, kartın növü və FR-005-dəki "həmişə açıq" seçimi.
  Kartlar üçün saxlanmış koordinatlar və xətt nöqtələri nəzərə alınmamalıdır.
- **FR-002**: Hər aktiv kart (spec 027-nin public filtrlərindən keçən) desktop sxemində görünməlidir. "Yeri olmadığı üçün görünməyən" kart
  olmamalıdır. Bağlı blokun departamentləri bu tələbə daxildir: onlar açılan siyahıda görünür.
- **FR-003**: Kartın yeri valideyninin və özünün növündən aşağıdakı qaydalarla çıxmalıdır. Hər qayda Figma-nın desktop sxemindəki bir
  quruluşu əks etdirir. Kart ölçüləri, aralıqlar və xətlərin yeri Figma rəqəmlərinə uyğun olmalıdır.
  - Sədr yuxarıdadır.
  - Sədrin departamentləri sədr kartının sağında, alt-alta siyahıdır. Sədrdən onlara xətt gedir.
  - Sədrin baş direktorları (Figma-da "Azər Ələsgərov") baş direktorlar sırasında, ən solda sütundur. Sədrdən onlara xətt gedir.
  - Sədrin müavinləri sədrin altında bir sırada düzülür və ortaq üfüqi xətlə sədrə bağlanır.
  - Müavinin uşaq müavinləri (Figma-da birinci müavin "Əliyar Məmmədyarov"un altındakı "Toğrul Əliyev" və "Əli Əhmədov") digər müavinlər
    sırasında düzülür və öz valideyn müavininə xəttlə bağlanır. Bu halda valideyn müavin sıradan yuxarıda dayanır.
  - Müavinin baş direktorları və müavinə birbaşa tabe blokları (Figma-da "Ödəniş xidmətləri… bloku") müavinin altında sütunlardır,
    ortaq üfüqi xətlə müavinə bağlanır.
  - Müavinin departamentləri (Figma-da "İnsan resursları", "Strategiya və layihə idarəedilməsi") müavinin sonuncu sütununun sağında
    alt-alta siyahıdır. Onlara müavin kartının yanından gələn xətt bağlanır.
  - Baş direktorun blokları onun altında, eyni sütunda alt-alta düzülür.
  - Blokun departamentləri FR-004/FR-005-ə görə açılan siyahı və ya həmişə açıq sütundur.
  - Bu siyahıya düşməyən birləşmə valideyninin altında adi sütun uşağıdır.
- **FR-004**: Departamentləri olan blok susmaya görə bağlı olmalıdır. Sağ-altında caret olmalı, kartın açılması onu yuxarı çevirməlidir.
  Açılanda departamentlər blokun altında, blokun enində, Figma-nın açıq halı kimi alt-alta görünməlidir. Eyni sütunda altdakı kartlar
  siyahının hündürlüyü qədər aşağı düşməlidir, xətlər onlarla birlikdə hərəkət etməlidir. Başqa sütunlar yerindən tərpənməməlidir.
- **FR-005**: Redaktor "həmişə açıq" seçdiyi blokun departamentləri klik olmadan, blokun altında sütun kimi görünməlidir. Bu blokda caret
  olmamalıdır.
- **FR-006**: Departamentləri olan bağlı və ya açıq blokda kartın istənilən yerinə klik siyahını açıb-bağlamalıdır. Belə blokun öz
  səhifəsinə desktop-da keçid olmamalıdır: açılan siyahıda yalnız departamentlər görünür. Departamentləri olmayan və ya "həmişə açıq"
  blok spec 027-dəki kimi öz səhifəsinə keçiddir (səhifəsi o dildə varsa).
- **FR-007**: Açılan siyahı JavaScript-siz işləməlidir. Klaviatura ilə açılıb-bağlanmalı və yardımçı texnologiyaya açıq/bağlı halını
  bildirməlidir. Bloklar bir-birindən asılı olmadan açılmalıdır.
- **FR-008**: Kartların keçidləri, kuratora birbaşa tabe kartların `*` qeydi və alt qeyd, kart rəngləri və yazı stilləri spec 027-dəki kimi
  qalmalıdır.
- **FR-009**: Sxem konteynerdən enli olduqda səhifə üfüqi sürüşməməlidir. Sxemin öz sahəsi üfüqi sürüşməli və klaviatura ilə əlçatan
  olmalıdır.

**Panel — Struktur sxemi bölməsi**

- **FR-010**: Panel canvas redaktorunu (sürükləmə, ölçü, x/y/en/hündürlük sahələri, xətt nöqtələri, "canvas-da olmayanlar" siyahısı,
  "Yerləşməni saxla") göstərməməlidir.
- **FR-011**: Redaktor qardaş kartların sırasını rəqəm yazmadan dəyişə bilməlidir: siyahıda sürükləmə və ya yuxarı/aşağı düymələri ilə.
  Hər dəyişiklik dərhal saxlanmalıdır. Uğursuz saxlama xəta göstərməli və sıranı geri qaytarmalıdır.
- **FR-012**: Blok (və qrup) formunda "Departamentlər" seçimi olmalıdır: "açılan siyahı" (susmaya görə) və ya "həmişə açıq". Seçim
  saxlanmalı, panelə yenidən açılanda görünməli və sayta ötürülməlidir.
- **FR-013**: Bölmədə saytın struktur səhifəsinə yeni pəncərədə açılan "Saytda bax" keçidi olmalıdır. Desktop düzülüşünün panel daxilində
  önizləməsi bu spec-in əhatəsində deyil.

**Məlumat və API**

- **FR-014**: "Həmişə açıq" seçimi hər kart üçün saxlanmalıdır. Mövcud kartlar üçün susmaya görə "açılan siyahı"dır. Panel API-si onu
  oxuyub yazmalı, public API sayta ötürməlidir.
- **FR-015**: Kartların mövcud koordinatları və xətt nöqtələri silinməməlidir. Sayt və panel onları istifadə etməsə də, geri qayıtmaq
  lazım olarsa itməməlidir.
- **FR-016**: Komponentlər və deploy sırası: `api-cbar-admin` (yeni seçimin saxlanması) → `api-cbar` (seçimi sayta ötürür) →
  `web-cbar-new` və `web-cbar-admin-new`. Köhnə API-yə qarşı işləyən yeni sayt seçimi "açılan siyahı" kimi qəbul etməlidir.

**Məlumatın düzəldilməsi**

- **FR-017**: Test mühitindəki ağacda yalnız canvas üçün seçilmiş valideynlər mənaya görə düzəldilməlidir. Məsələn, "Maliyyə idarəetməsi",
  "Risklərin idarə edilməsi", "İnzibati işlər" və "Satınalmalar" departamentləri "Təşkilati inkişaf bloku"nun uşağı olmalıdır və blok
  "həmişə açıq" olmalıdır. Düzəlişlərin siyahısı plan mərhələsində Figma ilə tutuşdurularaq çıxarılır. Düzəlişi redaktor paneldən edir.

**Paneldə sxem (US4, 2026-11-26)**

- **FR-018**: Panelin "Struktur sxemi" səhifəsində iki görünüş olmalıdır: "Siyahı" (indiki ağac) və "Sxem". Seçim və sxemin dili ünvanda
  saxlanmalıdır.
- **FR-019**: "Sxem" saytın desktop sxeminin düzülüş qaydalarını (FR-003) və ölçülərini **eyni kodla** tətbiq etməlidir. Düzülüş kodu iki
  frontendə köçürülür və bayt-bayt eyni qalmalıdır; fərq `verify`-də aşkarlanmalıdır (iki komponent yanaşı olanda).
- **FR-020**: "Sxem" saytın süzgəcini təkrarlamalıdır: deaktiv kart, deaktiv əməkdaşa və ya şöbəyə bağlı kart, seçilmiş dildə adı olmayan kart
  (öz adı da, bağlı qeydin adı da yoxdur) bütün nəsli ilə birlikdə göstərilmir. Ad və vəzifə saytdakı kimi seçilir (öz mətni, yoxsa bağlı qeydin).
- **FR-021**: Karta klik onun redaktə formunu açmalıdır. Açılan siyahılı blokun kartı siyahını açır (FR-006 kimi), onun departamentlərinə
  klik onların formunu açır. Saxlanmış dəyişiklik sxemdə səhifəni yeniləmədən görünür.
- **FR-022**: Sxemin rəngləri saytdakı kimidir və panelin qaranlıq temasında da açıq fonda qalır (oxunaqlı qalsın).

### Key Entities

- **Sxem kartı** (mövcud, spec 027): valideyn, qardaşlar arası sıra, növ (sədr, müavin, baş direktor, blok, departament, qrup), bağlı
  əməkdaş və ya şöbə, kuratora birbaşa tabe bayrağı, aktivlik, iki dildə ad/vəzifə override-ı. Yeni: **departamentlərin görünüşü**
  (açılan siyahı / həmişə açıq), yalnız blok və qrup üçün mənalıdır. Köhnə: yer/ölçü və xətt nöqtələri saxlanır, istifadə olunmur.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desktop-da bütün aktiv kartların 100%-i görünür, o cümlədən hazırda canvas-da yeri olmadığı üçün görünməyən blok
  departamentləri.
- **SC-002**: Figma-nın strukturunu əks etdirən ağacda 1728 px enində kartların yeri və ölçüsü, xətlərin uc nöqtələri Figma ilə ±1 px
  uyğun gəlir (bütün bloklar bağlı). Açıq blok Figma-nın açıq halı ilə də ±1 px uyğundur.
- **SC-003**: Hər hansı bloku açmaq və ya bağlamaq heç bir kartın başqa kartla üst-üstə düşməsinə səbəb olmur. Bütün blokların hər
  açıq/bağlı birləşməsində yoxlanılır.
- **SC-004**: Redaktor sxemə yeni baş direktor və onun blokunu əlavə edib saytda düzgün yerdə görməyi 2 dəqiqədən az vaxtda edir. Bu iş
  heç bir yerləşdirmə addımı tələb etmir (bu gün hər kart üçün canvas-da yer, ölçü və xətt lazımdır).
- **SC-005**: Açılan siyahı JavaScript söndürülmüş brauzerdə və yalnız klaviatura ilə işləyir.
- **SC-006**: Planşet və mobil görünüş bu dəyişiklikdən əvvəlki ilə eynidir (mövcud testlər dəyişmədən keçir).
- **SC-007**: Eyni məlumatla paneldəki sxemin kart yerləri saytın desktop sxemi ilə eynidir (eyni düzülüş kodu; `check:chart-layout` təmiz).

## Assumptions

- Desktop həddi (≥1360 px) və sxemin konteyner eni (984 px) spec 027-dəki kimi qalır.
- Kart enləri, aralıqlar və xətt yerləri Figma-dan götürülür, redaktordan yox. Kartın hündürlüyü onun mətnindən asılıdır (Figma-da da
  kartlar mətnə görə uzanır).
- Bir blokun departamentləri açılan siyahıda redaktorun verdiyi sırada göstərilir.
- Figma-da olmayan yeni quruluş (məsələn, ikinci "birinci müavin") lazım olsa, o, FR-003-ə yeni qayda kimi ayrıca əlavə olunur. Redaktor
  bunu paneldən həll edə bilmir: bu, koordinatsız yanaşmanın qəbul edilmiş qiymətidir.
- Test mühitindəki 40 kartın koordinatları plan mərhələsində Figma ilə tutuşdurmaq üçün istinad kimi istifadə oluna bilər.
- Prod mühitində sxem məlumatının vəziyyəti (daxil edilib, yoxsa yox) planda yoxlanılır. Daxil edilibsə, FR-017-dəki düzəlişlər orada
  da redaktor tərəfindən edilir.
- Panel bölməsinin yeri və adı ("Təşkilat → Struktur sxemi") dəyişmir, ona görə menyu sənədlərində yol dəyişikliyi yoxdur. Spec 027-nin
  canvas redaktoru haqqında redaktor təlimatları yenilənir.

## Nəticə və qiymətləndirmə (2026-11-26)

İcra commit `00fba1d`-dir (T001–T053; T043–T044 deploydan sonradır). Canvas versiyası tag `org-chart-canvas` (`b7d066d`) ilə saxlanır.

**Qazanılan:**

- Desktop-da bütün aktiv kartlar görünür (SC-001). Canvas versiyasında canvas-a qoyulmamış departament görünmürdü, blokun caret-i heç nə
  açmırdı — bu xəta aradan qalxıb. Blok kliklə, klaviatura ilə və JS-siz açılır (SC-003, SC-005).
- Redaktor piksel, ölçü və xətt vermir: yeni kart valideyn seçilən kimi yerinə düşür (SC-004), sıra sürükləməklə dəyişir.
- Kart yerləri Figma ilə tutuşdurulub (`measure/report-2026-11-26.md`); fərqlər yalnız R5-dədir və qaydaya görədir (SC-002).
  Ölçmə üç render xətasını tapıb düzəltdi (haşiyəli kart padding-i və 13 px sətir, açıq blokun sıxılması, uşaq müavin xəttinin artıq ucu).
- Paneldə "Sxem" görünüşü saytın düzülüşünü eyni kodla göstərir; 40 kartın hamısı saytla eyni yerdədir (SC-007). Panel kitin DM Sans
  şriftinə keçib (əvvəl sistem şriftinə düşürdü).
- Geri qayıtmaq mümkündür: koordinatlar və `PUT /chart/layout` qalıb (FR-015).

**Verilən qiymət:**

- Figma-da olmayan quruluşu redaktor paneldən qura bilmir — koda qayda əlavə olunur (Assumptions). Canvas-da hər şeyi əl ilə qoymaq olurdu.
- Düzülüş kodu iki frontenddə nüsxədir (`check:chart-layout` qoruyur); panelin render-i saytınkının əl portudur və yoxlanmır.
- Deploy sırası məcburidir (`api-cbar-admin` → `api-cbar`), yoxsa saytda sxem itir və CMS şəkli görünür.
- Test datası (FR-017) redaktor tərəfindən düzəldilməyincə sxem Figma-dan fərqli görünür.
- DM Sans bütün panelin görünüşünü dəyişib — bu spec-in əsas mövzusundan kənar, istifadəçi qərarıdır.

**Hələ sübut olunmayan:** hər şey lokalda yoxlanıb (verify, Node 22, PGlite, Edge ölçmələri). Test mühitində işə düşmə, Grafana logları və
redaktorun real istifadəsi T043-dədir; qiymət ondan sonra təsdiqlənir.

**Qərar:** canvas versiyasının xətasını (görünməyən departamentlər, işləməyən caret) və redaktor yükünü aradan qaldırdığı üçün yaxşılaşdırmadır;
çevikliyin bir hissəsi şüurlu şəkildə verilib.
