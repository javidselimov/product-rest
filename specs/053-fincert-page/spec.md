# Feature Specification: FinCERT səhifəsi — Figma dizaynı və ayrıca admin bölməsi

**Feature Branch**: `053-fincert-page`

**Created**: 2026-11-18

**Status**: Draft

**Input**: "indi istediyim yeni spec qurmaq ve fincert sehifesini figmadaki kimi hazirlamaqdir sehifenin icerisini edit etmeyi admin panelden
rahatlashdirmaq lazimdir bu cms kimi seliqeli olmur orda hazirlamaq. [...] Sehifenin editi admin panelde sol menuda gosterilir hemsihe bele etmishik
amma bu da cashdira bilir edit edeni bunulari ele edek ki sehifeye kecid edende o menu aktiv olsun ki redaktora rahat olsun. Bundan bashqa figmada
diger sehifelere bax mobil ve tab versiyani da hazirla orda akkrodionlar var onlari da uyugun shekilde hazilra kohne saytdaki funksionaliqlarada bax
cunki bu sayt bir miqrasiydir."

Qərarlar (2026-11-18, istifadəçi):

1. **Ayrıca məzmun növü** (spec 038/044/045/051/052 kimi): FinCERT məzmunu admin paneldə "FinCERT" bölməsində sahə-sahə və siyahı-siyahı
   redaktə olunur. Redaktor işarələmədən (`h2`, siyahı, cədvəl qaydaları) blok qurulmur. CMS səhifəsi 133 yalnız başlıq və ünvan verir (FAQ,
   spec 051 nümunəsi).
2. **Sol menyu aktivliyi**: redaktor "Səhifələr"-dən öz bölməsi olan səhifənin formasını açanda (FinCERT və mövcud bütün belə səhifələr:
   Memorandumlar 122, Maliyyə təşkilatları 121, KSM, Yayım qrafiki, Sual-cavab, aylıq hesabat səhifələri) sol menyuda həmin bölmə işarələnir və
   qrupu açılır. Formadakı "bu məzmun ... bölməsindədir" kartı qalır.
3. **Bölmə başlıqları sabitdir**: saytın az/en interfeys mətnlərindədir, admin-dən dəyişmir. Boş bölmə səhifədən düşür.
4. **"Bu səhifədə" bloku yoxdur** (2026-11-18, plan mərhələsi): Figma-da desktop "On this page" `2678:3940`, tablet `2685:3946` və mobil
   `2685:3983` anker zolaqları gizlidir (`visible: false`). Sayt görünən dizaynı izləyir: başlıqdan sonra birbaşa bölmələr, tam enlik. Bölmələrin
   sabit ankerləri (`#rfc-2350` …) linkləmək üçün qalır.

Agentin qəbul etdiyi defoltlar (istifadəçi düzəldə bilər):

5. İstiqamətlərin nömrəsi (1, 2, 3, 4) yazılmır: siyahıdakı sıradan gəlir.
6. Akkordionlar (istiqamətlər) gələndə hamısı bağlıdır, bir neçəsi eyni anda açıla bilər (spec 044 kartları kimi).
7. Üzvlük kartının nişanı ("2026-cı ildən tam hüquqlu üzv") hər dildə sərbəst mətndir. Azərbaycan dilində il şəkilçisi (-cı/-ci/-cu/-cü) ilə dəyişir,
   ona görə avtomatik qurulmur.
8. "Portala keçid" düyməsinin mətni sabit interfeys mətnidir. Portalın başlığı, təsviri və ünvanı redaktə olunur.
9. RFC-2350 faylı hər dil üçün ayrıdır (köhnə saytda az və en faylları fərqlidir). Həmin dildə fayl yoxdursa bölmə o dildə göstərilmir.

**Köhnə vəziyyət** (`product-host` və test API `api-cbar-test.cbar.az`, 2026-11-18):

- Köhnə saytda FinCERT üçün ayrıca Yii2 kodu yoxdur. Bu, adi CMS səhifəsidir: köhnə id 893, yeni bazada səhifə **133**, slug `fincert` (az/en),
  kök səhifə (`ParentId` boş). Altında "FinCERT (Kopya)" qaralaması var (479, `fincert-copy`).
- Səhifə mətni sadə HTML-dir: missiya, dörd fəaliyyət istiqaməti (paraqraf və siyahılar), əlaqə (e-poçt `fincert@cbar.az`, telefon
  `(+994 12) 4370097`), "Vahid Elektron Hesabatlılıq Portalı" (`https://portal.e-cbar.az/`) və RFC-2350 PDF linki. az mətnində başlıqlar bir
  bəndli `<ol>` içində qalın yazıdır, en mətnində `h2`/`h3`-dür. RFC faylları dillərə görə fərqlidir (`uploads.cbar.az/assets/…pdf`).
- "Beynəlxalq əməkdaşlıq" bölməsi köhnə səhifədə yoxdur. Figma onu 11 iyun 2026 press-relizinə (FinCERT FIRST-ə üzv olub) əsasən əlavə edir.

**Figma**: "cbar website (Copy)", səhifə "FinCERT" `2663:138955`: desktop `2678:3933` (1728), tablet `2683:99005` (744), mobil `2683:99847`
(390); komponent dəsti "FinCERT / Direction" `2678:3924` (Item 1–4, Open Yes/No, Device Desktop/Tablet/Mobile). Admin bölməsi üçün Figma kadrı
yoxdur: panelin standart CRUD ekranlarıdır.

**Hədəf proyektlər** (Konstitusiya I.2, II.3): `api-cbar-admin` (cədvəllər, admin endpoint-ləri, köçürmə), `api-cbar` (oxuma endpoint-i),
`web-cbar-admin-new` (FinCERT bölməsi, sol menyu aktivliyi), `web-cbar-new` (səhifə). Deploy sırası: api-cbar-admin → api-cbar → frontendlər.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi FinCERT səhifəsini Figma dizaynında görür (Priority: P1)

Ziyarətçi `/az/fincert` (və ya `/en/fincert`) açır. Breadcrumb (Ana səhifə › FinCERT), paylaşma düymələri və "FinCERT" başlığı görünür. Sonra
bölmələr gəlir: missiya mətni, "Fəaliyyətin əsas istiqamətləri" (nömrəli akkordionlar), "Əlaqə məlumatları" (e-poçt və telefon kartları),
"Yüksək kateqoriyalı insident üzrə hesabatın göndərilməsi" (portal kartı), "RFC-2350" (sənəd kartı) və "Beynəlxalq əməkdaşlıq" (üzvlük kartları).
Bölmələr tam enlikdədir, sol menyu və "Bu səhifədə" bloku yoxdur.

**Why this priority**: Spec-in əsas nəticəsi budur. Səhifə Figma ilə uyğun olmalı və köhnə saytdakı bütün məlumatı (missiya, istiqamətlər,
əlaqə, portal, RFC faylı) saxlamalıdır.

**Independent Test**: Köçürülmüş məlumatla səhifə üç enlikdə (1728, 744, 390) açılır, Figma ölçüləri ilə müqayisə olunur, akkordionlar açılıb
bağlanır, ankerli ünvan müvafiq bölməni açır.

**Acceptance Scenarios**:

1. **Given** FinCERT məlumatı doludur, **When** ziyarətçi desktop-da səhifəni açır, **Then** başlıq və altı bölmə (Missiya, Fəaliyyətin əsas
   istiqamətləri, Əlaqə məlumatları, Hesabat portalı, RFC-2350, Beynəlxalq əməkdaşlıq) Figma sırası ilə tam enlikdə görünür.
2. **Given** ziyarətçiyə `/az/fincert#rfc-2350` linki göndərilib, **When** onu açır, **Then** səhifə RFC-2350 bölməsindən açılır.
3. **Given** istiqamətlər bölməsində dörd bənd var, **When** səhifə açılır, **Then** dörd akkordion 1–4 nömrələri və başlıqları ilə bağlı
   görünür. Birinə klik onu açır və mətnini (paraqraf, siyahı) göstərir, digərləri öz vəziyyətində qalır.
4. **Given** e-poçt kartı, **When** ziyarətçi ona klik edir, **Then** poçt proqramı `fincert@cbar.az` ünvanı ilə açılır. Telefon kartı mobil
   cihazda zəng başladır.
5. **Given** portal kartı, **When** ziyarətçi "Portala keçid"-ə klik edir, **Then** `https://portal.e-cbar.az/` yeni vərəqdə açılır.
6. **Given** RFC-2350 kartı, **When** ziyarətçi ona klik edir, **Then** ziyarətçinin dilindəki PDF açılır və ya yüklənir. Kartda fayl növü
   nişanı (PDF) görünür.
7. **Given** tablet (744) və ya mobil (390) enlik, **When** səhifə açılır, **Then** kartlar Figma-dakı kimi bir sütuna düzülür (əlaqə kartları
   alt-alta, portal və üzvlük kartında məzmun şaquli), səhifə yana sürüşmür.
8. **Given** JavaScript söndürülüb, **When** səhifə açılır, **Then** bütün bölmələr görünür, akkordionlar açılıb bağlanır, linklər işləyir.

---

### User Story 2 — Redaktor FinCERT məzmununu admin bölməsində redaktə edir (Priority: P1)

Redaktor admin paneldə sol menyudan "FinCERT"-i açır. Bir ekranda ümumi məlumat (missiya, e-poçt, telefon, portalın başlığı, təsviri və ünvanı,
RFC-2350 faylı) hər dil üçün sahə-sahə, fəaliyyət istiqamətləri və beynəlxalq üzvlüklər isə sıralana bilən siyahılar kimi görünür. Redaktor HTML
qaydalarını bilmədən mətni dəyişir, istiqamət əlavə edir, sırasını dəyişir, faylı əvəz edir.

**Why this priority**: İstifadəçinin ikinci əsas tələbidir: indiki redaktə "CMS kimi səliqəli olmur". Səhv işarələmə saytdakı bloku sındıra
bilməməlidir.

**Independent Test**: Redaktor admin-də telefon nömrəsini dəyişir, yeni istiqamət əlavə edib onu ikinci yerə çəkir. Sayt növbəti açılışda yeni
nömrəni və beş akkordionu yeni sırada göstərir.

**Acceptance Scenarios**:

1. **Given** redaktor "FinCERT" bölməsini açır, **When** az tabında missiya mətnini dəyişib yadda saxlayır, **Then** az saytı yeni missiyanı
   göstərir, en saytı dəyişmir.
2. **Given** istiqamətlər siyahısında dörd bənd var, **When** redaktor "Yeni" ilə beşinci bəndi (başlıq və mətn) yaradır, **Then** saytda beşinci
   akkordion 5 nömrəsi ilə görünür.
3. **Given** istiqamətlər siyahısı, **When** redaktor dördüncü bəndi sürükləyir (və ya yuxarı düyməsi ilə) birinci yerə gətirir, **Then** sıra dərhal
   yadda saxlanılır və saytda nömrələr yeni sıraya görə 1–4 olur.
4. **Given** istiqamət formasında başlıq boşdur, **When** redaktor yadda saxlamağa çalışır, **Then** forma başlığın vacib olduğunu deyir.
5. **Given** ümumi formada e-poçt sahəsində `fincert(at)cbar.az` yazılıb, **When** redaktor yadda saxlamağa çalışır, **Then** forma e-poçtun
   yanlış olduğunu deyir. Portal ünvanı `http(s)://` ilə başlamırsa eyni qayda tətbiq olunur.
6. **Given** redaktor üzvlük əlavə edir (loqo, ad, təsvir, nişan mətni, istəyə bağlı link), **When** yadda saxlayır, **Then** saytda yeni üzvlük
   kartı siyahıdakı sırası ilə görünür.
7. **Given** forma dəyişdirilib və yadda saxlanılmayıb, **When** redaktor başqa menyuya keçmək istəyir, **Then** panel soruşur (bütün CRUD
   formaları kimi).
8. **Given** redaktor RFC-2350-nin en faylını media kitabxanasından seçir, **When** yadda saxlayır, **Then** en saytı yeni faylı, az saytı öz
   faylını göstərir.

---

### User Story 3 — Köhnə məzmun avtomatik köçürülür (Priority: P1)

Bölmə deploy olunanda redaktor heç nə yenidən yazmır. Səhifə 133-ün az və en mətnindəki missiya, dörd istiqamət, əlaqə, portal və RFC məlumatı
yeni bölməyə köçürülür. FIRST üzvlüyü Figma-dakı mətnlə əlavə olunur.

**Why this priority**: Köçürmə olmasa, sayt deploy günü FinCERT səhifəsini köhnə görünüşdə göstərər, redaktor isə iki dildə bütün mətni əllə daxil
etməli olar.

**Independent Test**: Boş FinCERT məlumatı olan bazada API işə düşür. Admin bölməsində dörd istiqamət (az və en), əlaqə, portal və FIRST
üzvlüyü görünür, sayt yeni dizaynda açılır.

**Acceptance Scenarios**:

1. **Given** səhifə 133-ün az mətnində dörd qalın başlıqlı istiqamət var, **When** köçürmə işləyir, **Then** dörd istiqamət həmin sıra ilə
   yaranır. Hər birinin az başlığı köhnə başlıqdır, mətni isə növbəti başlığa qədər olan paraqraf və siyahılardır. en başlıq və mətnlər en
   səhifənin `h3` bölmələrindən eyni sıra ilə götürülür.
2. **Given** köçürmə artıq işləyib və ya redaktor məlumatı dəyişib, **When** API yenidən başlayır, **Then** heç nə təkrarlanmır və dəyişmir.
3. **Given** başqa mühitdə səhifə 133 yoxdur və ya mətni gözlənilən formada deyil, **When** köçürmə işləyir, **Then** xəta olmadan yalnız
   tanınan hissələr yazılır və ya heç nə yazılmır. Sayt fallback-ə keçir (FR-016).
4. **Given** köçürmə, **When** işləyir, **Then** səhifə 133-ün öz mətni dəyişmir. Mətn fallback kimi saxlanılır.

---

### User Story 4 — Redaktor səhifə formasında olanda sol menyuda bölmə işarələnir (Priority: P2)

Redaktor köhnə vərdişlə "Səhifələr" ağacında FinCERT-i (və ya öz bölməsi olan başqa səhifəni) açır. Sol menyuda "Səhifələr" deyil, həmin
səhifənin məzmununu saxlayan bölmə ("FinCERT", "Memorandumlar", "Sual-cavab" …) işarələnir, qrupu açıq olur. Formadakı kart isə ora link verir.
Redaktor məzmunun harada redaktə olunduğunu menyuya baxıb anlayır.

**Why this priority**: Rahatlıq tələbidir. Funksionallıq onsuz da işləyir, amma ayrıca bölmə ilə səhifə formasının ikiliyi redaktoru çaşdırır.

**Independent Test**: `/pages/<FinCERT səhifəsinin id-si>` açılır. Sol menyuda "FinCERT" aktivdir. `/pages/<122>` açılanda "Beynəlxalq
əməkdaşlıq" qrupu açıq, "Memorandumlar" aktivdir.

**Acceptance Scenarios**:

1. **Given** redaktor "Səhifələr"-də FinCERT səhifəsini açır, **When** forma yüklənir, **Then** sol menyuda "FinCERT" aktiv görünür, "Səhifələr"
   aktiv deyil.
2. **Given** redaktor Memorandumlar səhifəsinin (122) formasını açır, **When** forma yüklənir, **Then** "Beynəlxalq əməkdaşlıq" qrupu açılır və
   "Memorandumlar" aktivdir. Mobil menyu pəncərəsində də eyni bənd aktivdir.
3. **Given** "(Kopya)" qaralaması (`fincert-copy`), **When** onun forması açılır, **Then** əsas səhifədəki kimi "FinCERT" aktivdir.
4. **Given** öz bölməsi olmayan adi səhifə və ya yalnız qeyd kartı olan səhifə (Beynəlxalq təşkilatlarda üzvlük, 554), **When** forması açılır,
   **Then** "Səhifələr" aktiv qalır (bugünkü kimi).
5. **Given** redaktor yeni səhifə yaradır və ya səhifələr siyahısındadır, **Then** "Səhifələr" aktivdir.

---

### User Story 5 — Köhnə ünvanlar işləyir, məlumat olmayanda səhifə boş qalmır (Priority: P3)

Köhnə saytın FinCERT ünvanı ilə gələn ziyarətçi yeni səhifəyə yönləndirilir. FinCERT məlumatı olmayan mühitdə (və ya API cavab vermədikdə)
səhifə bugünkü kimi öz CMS mətnini göstərir.

**Why this priority**: Miqrasiya qaydasıdır (Konstitusiya VII.2), amma gündəlik ziyarətçi axınına təsiri azdır.

**Independent Test**: Köhnə ünvan açılır və `/az/fincert`-ə yönləndirilir. FinCERT məlumatı silinmiş bazada səhifə 133-ün mətni göstərilir.

**Acceptance Scenarios**:

1. **Given** köhnə saytın FinCERT ünvanı (`page-893/...` formasında, dil `?language=` və ya yol prefiksindən), **When** ziyarətçi onu açır,
   **Then** daimi yönləndirmə ilə həmin dilin `/fincert` səhifəsinə gedir.
2. **Given** FinCERT məlumatı yoxdur, **When** səhifə açılır, **Then** başlıq və səhifə 133-ün öz mətni bugünkü görünüşdə göstərilir. Boş səhifə
   və xəta yoxdur.

---

### Edge Cases

- Bir bölmənin məlumatı boşdur (məs. üzvlük yoxdur, en-də RFC faylı yoxdur): bölmə səhifədən düşür. Qalan bölmələrin sırası dəyişmir.
- Bütün bölmələr boşdur, yalnız başlıq qalır: FinCERT məlumatı yox sayılır və fallback işləyir (FR-016).
- İstiqamətin az mətni var, en mətni yoxdur: en saytında həmin istiqamət göstərilmir, nömrələr qalan bəndlərə görə ardıcıl olur (1, 2, 3 —
  boşluq yoxdur).
- Redaktor istiqaməti və ya üzvlüyü gizlədir (dərc olunmamış): saytda yoxdur, admin-də qalır.
- Üzvlüyün loqosu yoxdur: kart loqosuz, mətn sola dayanaraq göstərilir. Linki yoxdursa kart klik olunmur.
- Telefon nömrəsi boşluq və mötərizə ilə yazılıb: kartda yazıldığı kimi görünür, zəng linki yalnız rəqəm və `+` ilə qurulur.
- Seçilmiş fayl media kitabxanasından silinib: RFC bölməsi saytda göstərilmir, admin formada fayl sahəsi "fayl yoxdur" vəziyyətindədir.
- Çox uzun istiqamət başlığı (mobil 390): sətrə keçir, nömrə dairəsi və ox ikonu sıxılmır.
- Ziyarətçi ankerli ünvanla gəlir (`/az/fincert#rfc-2350`): səhifə həmin bölmədən açılır. Ankerlər bölmə səviyyəsindədir, akkordion içində deyil.
- Ankerli ünvan boş (göstərilməyən) bölməyə aparır: səhifə yuxarıdan açılır, xəta yoxdur.
- Azaldılmış hərəkət ayarı: akkordion animasiyasız açılır.
- Çap: bütün bölmələr görünür, akkordionlar açıq çap olunur (spec 044 kartları kimi).

## Requirements *(mandatory)*

### Functional Requirements

**Məlumat və admin bölməsi**

- **FR-001**: Sistem FinCERT üçün tək ümumi qeyd saxlamalıdır: hər dil üçün missiya mətni, portalın başlığı, təsviri; dildən asılı olmayan
  e-poçt, telefon, portal ünvanı; hər dil üçün RFC-2350 sənədi: media kitabxanasından fayl və ya xarici link (ikisi də varsa fayl üstündür). Kim
  və nə vaxt dəyişdiyi saxlanılır.
- **FR-002**: Sistem fəaliyyət istiqamətlərini sıralı siyahı kimi saxlamalıdır: hər dil üçün başlıq və zəngin mətn (paraqraf, siyahı, qalın,
  link), sıra, dərc statusu.
- **FR-003**: Sistem beynəlxalq üzvlükləri sıralı siyahı kimi saxlamalıdır: loqo (şəkil, istəyə bağlı), hər dil üçün ad, təsvir və nişan
  mətni, istəyə bağlı xarici link, sıra, dərc statusu.
- **FR-004**: Admin paneldə "FinCERT" bölməsi olmalıdır: ümumi forma (az/en tabları), istiqamətlər siyahısı və üzvlüklər siyahısı (yaratma,
  redaktə, silmə, gizlətmə, sürükləmə və yuxarı/aşağı düymələri ilə sıralama; hər hərəkət dərhal yadda saxlanılır).
- **FR-005**: Forma yoxlamaları: istiqamət və üzvlük üçün ən azı bir dildə başlıq/ad vacibdir; e-poçt düzgün formatda, portal və üzvlük linki
  `http://` və ya `https://` ilə olmalıdır; RFC faylı yalnız sənəd (PDF və digər icazəli sənəd növləri) ola bilər.
- **FR-006**: Hər yazma əməliyyatı audit jurnalına düşür. Formalar yadda saxlanılmamış dəyişikliklə tərk edilərkən soruşur.
- **FR-007**: "FinCERT" sol menyuda ayrıca bənd kimi (tək ekranlı bölmə, qrupsuz) görünür. Yeri plan mərhələsində saytın bölmə sırasına görə
  seçilir (spec 046 qaydası).
- **FR-008**: FinCERT səhifəsinin (və onun "(Kopya)" qaralamasının) admin formasında məzmunun "FinCERT" bölməsində olduğu yazılır və ora link
  verilir (mövcud idarə olunan səhifə kartı).

**Sol menyu aktivliyi**

- **FR-009**: Admin paneldə öz bölməsi olan səhifənin formasında (bölməyə link verən idarə olunan səhifələrin hamısı, "(Kopya)" qaralamaları
  daxil) sol menyu, mobil menyu pəncərəsi və onların açıq qrupu həmin bölməni aktiv göstərir, "Səhifələr" bəndini yox.
- **FR-010**: Yalnız qeyd kartı olan səhifələrdə, adi səhifələrdə, səhifələr siyahısında və yeni səhifə formasında "Səhifələr" aktiv qalır.

**Saytda göstərmə**

- **FR-011**: Sayt FinCERT səhifəsini (CMS səhifəsi 133, slug `fincert`) FinCERT məlumatından qurur: başlıq səhifənin başlığıdır, bölmələr Figma
  sırası ilədir: Missiya, Fəaliyyətin əsas istiqamətləri, Əlaqə məlumatları, Yüksək kateqoriyalı insident üzrə hesabatın göndərilməsi, RFC-2350,
  Beynəlxalq əməkdaşlıq. Bölmə başlıqları, kart etiketləri ("Elektron poçt", "Əlaqə nömrəsi") və "Portala keçid" az/en interfeys mətnləridir.
- **FR-012**: Səhifədə sol menyu və "Bu səhifədə" bloku yoxdur (Figma-da gizlidir). Hər bölmənin sabit ankeri var, ankerlər hər iki dildə eynidir
  (`#missiya`, `#istiqametler`, `#elaqe`, `#hesabat-portali`, `#rfc-2350`, `#beynelxalq-emekdasliq`).
- **FR-013**: İstiqamətlər nömrəli akkordionlardır: nömrə saytda görünən sıradan gəlir, gələndə hamısı bağlıdır, hər biri müstəqil açılır.
  Akkordion JavaScript olmadan da işləyir.
- **FR-014**: Sayt yalnız dərc olunmuş, silinməmiş və ziyarətçinin dilində mətni olan istiqamət və üzvlükləri göstərir. Boş bölmə səhifədən
  düşür.
- **FR-015**: Redaktordan gələn zəngin mətn saytda digər CMS mətnləri ilə eyni təhlükəsizlik qaydası ilə hazırlanır.
- **FR-016**: FinCERT məlumatı yoxdursa (ümumi qeyd və siyahılar həmin dildə boşdur) və ya alına bilmirsə, səhifə 133 bugünkü kimi öz CMS mətni ilə
  göstərilir.
- **FR-017**: Məlumat olduqda səhifə 133-ün öz mətni göstərilmir (FAQ, spec 051 nümunəsi). Breadcrumb, paylaşma düymələri, səhifə metadata-sı
  (başlıq, təsvir) digər CMS səhifələri kimidir.
- **FR-018**: Bölmələr spec 049 qaydası ilə sürüşdürmədə görünür (iç-içə reveal yoxdur). JavaScript olmadan, çapda və azaldılmış hərəkətdə hər şey
  görünür.
- **FR-019**: Düzülüş Figma-nın üç kadrına uyğundur: desktop (1728), tablet (744), mobil (390). Aralıq enliklərdə düzülüş yaxın kadrın qaydası ilə
  axır, səhifə yana sürüşmür.

**Köçürmə və ünvanlar**

- **FR-020**: Deploy zamanı birdəfəlik köçürmə səhifə 133-ün az və en mətnindən missiyanı, dörd istiqaməti (başlıq və mətn), e-poçtu, telefonu,
  portal mətnini və ünvanını yazır. RFC: köhnə linkin faylı media kitabxanasında tapılırsa ona bağlanır, tapılmırsa köhnə link xarici link kimi
  yazılır (test mühitində fayl kitabxanada deyil). Təlimat redaktora faylı yükləyib linki əvəz etməyi deyir. FIRST üzvlüyü Figma mətni ilə (az; en qaralama tərcümə) loqosuz yazılır.
- **FR-021**: Köçürmə FinCERT məlumatı artıq varsa heç nə etmir, təkrar işlədikdə heç nəyi dəyişmir, səhifə 133 yoxdursa xəta vermir. Səhifə
  mətnlərinə toxunmur.
- **FR-022**: "FinCERT (Kopya)" qaralaması (479) saytın menyularından çıxarılır. Silinmir.
- **FR-023**: Köhnə saytın FinCERT ünvanı (`page-893/<slug>`, `product-host/visitor/config/rules.php` `page-<id>/<slug>` qaydası; dil
  `?language=` və ya yol prefiksindən) həmin dilin `/fincert` səhifəsinə daimi yönləndirilir.

**Sənədlər**

- **FR-024**: Redaktor təlimatı (`web-cbar-new/docs/fincert-cms-guide.md` və `dokumentasiyalar/` altında azərbaycanca təlimat), root `CLAUDE.md`,
  `business_logic/` sənədləri, hər iki API-nin OpenAPI spec-i və admin menyu yolları yazılan təlimatlar eyni dəyişiklikdə yenilənir.

### Key Entities

- **FinCERT ümumi məlumatı**: tək qeyd. Missiya (az/en), e-poçt, telefon, portal başlığı və təsviri (az/en), portal ünvanı, RFC-2350 sənədi
  (az/en; media faylı və ya xarici link).
- **Fəaliyyət istiqaməti**: başlıq və zəngin mətn (az/en), sıra, dərc statusu. Nömrəsi saxlanılmır, sıradan gəlir.
- **Beynəlxalq üzvlük**: loqo (media), ad, təsvir, nişan mətni (az/en), xarici link, sıra, dərc statusu.
- **CMS səhifəsi 133**: başlıq, slug və metadata verir. Mətni fallback-dir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: FinCERT səhifəsi üç Figma enliyində (1728, 744, 390) əsas ölçülərdə (bloklar arası məsafə, kart ölçüləri, başlıq ölçüləri) Figma ilə
  2 px-dən çox fərqlənmir və heç bir enlikdə yana sürüşmə yoxdur.
- **SC-002**: Köçürmədən sonra saytda köhnə səhifədəki bütün məlumat (missiya, 4 istiqamət və onların siyahı bəndləri, e-poçt, telefon, portal
  linki) az və en-də görünür: itən bənd 0.
- **SC-003**: Redaktor telefon nömrəsini və ya bir istiqamətin mətnini 1 dəqiqədən az vaxtda dəyişir: bir forma, HTML və ya işarələmə qaydası bilmək
  lazım deyil.
- **SC-004**: Redaktorun səhvi saytdakı bloku adi mətnə çevirə bilmir: yanlış e-poçt, link və ya başlıqsız bənd yadda saxlanılmır.
- **SC-005**: İdarə olunan səhifələrin hamısında (bölməyə link verən 9 səhifə və onların qaralamaları) forma açıq ikən sol menyuda müvafiq bölmə
  aktivdir.
- **SC-006**: Admin-də dərc olunan dəyişiklik sayt növbəti açılışda göstərir.
- **SC-007**: FinCERT məlumatı olmayan mühitdə səhifə boş açılmır: köhnə mətn göstərilir.

## Assumptions

- Tək FinCERT səhifəsi var. Başqa CERT və ya oxşar səhifə üçün ümumi "bloklu səhifə" qurucusu bu spec-in əhatəsində deyil.
- Telefon və e-poçt dildən asılı deyil. Lazım olsa, en etiketləri interfeys mətnlərindən gəlir.
- FIRST loqosu mühitlərdə fərqli media id-si alır, ona görə köçürmə loqo yazmır. Redaktor onu admin-də yükləyir (təlimatda yazılır).
- FIRST üzvlüyünün en mətni qaralama tərcümədir və redaktor tərəfindən yoxlanılır.
- Rollar və icazələr panelin digər məzmun bölmələri ilə eynidir.
- Figma-da gizli olan qatlar (desktop "On this page", tablet/mobil "Anchors", üçüncü əlaqə kartı "İnsident hesabatı") saytda qurulmur.
- Sol menyu aktivliyi dəyişikliyi panelin naviqasiya qaydasına toxunur və bütün idarə olunan səhifələrə şamil olunur; yeni idarə olunan səhifə
  əlavə olunanda əlavə iş tələb etmir.
- Frontend işləri spec-lərin məcburi skill qapısından keçir (senior-front, frontendpatterns, frontend-standards, ui-kit-usage) və spec 032 sabitlər
  standartına tabedir.
- Bölmələr redaktor işarələməsindən qurulmadığı üçün yeni `AboutLayoutKind` və layout fikstürü lazım deyil.
- Dəyişiklik dörd komponentə toxunur. Deploy sırası: api-cbar-admin → api-cbar → web-cbar-admin-new və web-cbar-new.

## Paritet cədvəli (Konstitusiya I.3)

| Köhnə sayt | Yeni qarşılıq | Status |
|---|---|---|
| FinCERT CMS səhifəsi (köhnə id 893), az/en | `/az/fincert`, `/en/fincert`, Figma dizaynı | Qalır, yenidən qurulur |
| Missiya və 4 istiqamət mətni | Missiya + istiqamət akkordionları | Köçürülür |
| E-poçt, telefon | Əlaqə kartları (`mailto:`, `tel:`) | Köçürülür |
| Vahid Elektron Hesabatlılıq Portalı linki | Portal kartı | Köçürülür |
| RFC-2350 PDF (az və en faylları ayrı, `uploads.cbar.az` linki) | RFC sənəd kartı, dil üzrə fayl və ya link | Köçürülür (köhnə link) |
| Köhnə ünvan `page-893/*` | `/{locale}/fincert`-ə 308 | Yönləndirilir |
| — | Beynəlxalq əməkdaşlıq (FIRST) | Yeni (Figma) |
