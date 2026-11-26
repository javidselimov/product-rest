# Feature Specification: Admin paneldə şəkillərin önizləməsi (preview)

**Feature Branch**: `010-admin-image-preview`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "product-rest/web-cbar-admin-new — burada adminkada şəkillərə preview funksionallığı əlavə etmək istəyirəm. Əlavə olunan və edit olunan zaman şəkilləri görə bilməlidir."

**Əhatə olunan proyektlər**: `web-cbar-admin-new` (önizləmənin göstərilməsi) və
`api-cbar-admin` (admin panelə şəklin özünü verən qorunan oxuma imkanı). Hazırda admin
API yalnız media metadata-sını qaytarır (id, ad, mime, ölçü), faylın özünü yox.
Admin panel public `api-cbar`-a müraciət edə bilməz (Konstitusiya Maddə III.1), ona görə
şəkil admin API üzərindən gəlməlidir. Sxem dəyişikliyi gözlənilmir. `Cbar.Domain`
toxunulmur. Bunlar iki ayrı upstream merge request-dir. Deploy sırası:
`api-cbar-admin` → `web-cbar-admin-new` (Maddə II.3, IV.2).

**`product-host` istinadı (Konstitusiya Maddə I.2)**: Yii2 admin-də (`product-host/admin/views`)
formalarda şəkil önizləməsi **yoxdur**. Bu, yeni admin panelin rahatlığı üçün təkmilləşdirmədir
və heç bir Yii2 controller və ya model-i əvəz etmir. Public sayt və onun davranışı dəyişmir.

**Hazırkı vəziyyət (2026-10-01)**: Şəkil sahəsi olan formalarda (ana səhifə blokları,
şəkilli popup-lar, MEAS, pul nişanları, təşkilat/rəhbərlik və s.) seçilmiş şəkil yalnız
`#id · fayl adı` mətni kimi görünür. Media seçmə pəncərəsi, qalereya şəkilləri,
əlavə edilmiş fayllar siyahısı və media kitabxanası şəkil əvəzinə fayl tipi ikonu göstərir.
Nəticədə redaktor düzgün şəkli seçdiyini yalnız public saytda yoxlaya bilir.

## User Scenarios & Testing *(mandatory)*

### User Story 1: Redaktor formada seçilmiş şəkli görür (Priority: P1)

Redaktor şəkil sahəsi olan istənilən qeydi **yaradanda** və ya **redaktə edəndə**
seçilmiş şəklin kiçik önizləməsini sahənin yanında görür. Mövcud qeyd açılanda
saxlanılmış şəkil dərhal görünür. Yeni şəkil seçiləndə önizləmə saxlamadan əvvəl
yenilənir. "Təmizlə" basılanda önizləmə yox olur. İkidilli sahələrdə (məsələn
şəkilli popup-un az/en şəkilləri) hər dil tabı öz şəklini göstərir.

**Why this priority**: İstifadəçinin istəyinin özü budur. Redaktor yanlış şəkli
yalnız public saytda görüb sonra düzəltməli olmamalıdır.

**Independent Test**: Şəkli olan mövcud qeydi redaktə üçün açın. Şəklin görünməsini
yoxlayın. Başqa şəkil seçin. Önizləmənin saxlamadan dəyişdiyini yoxlayın. Yeni qeyd
yaradıb şəkil seçin. Önizləmənin göründüyünü yoxlayın.

**Acceptance Scenarios**:

1. **Given** şəkli olan qeyd mövcuddur, **When** redaktor onun redaktə formasını açır, **Then** şəkil sahəsində saxlanılmış şəklin önizləməsi görünür.
2. **Given** yeni qeyd forması açıqdır, **When** redaktor media seçmə pəncərəsindən şəkil seçir, **Then** önizləmə saxlamadan dərhal göstərilir.
3. **Given** formada önizləmə görünür, **When** redaktor başqa şəkil seçir və ya sahəni təmizləyir, **Then** önizləmə yeni şəklə dəyişir və ya yox olur.
4. **Given** ikidilli formada az və en üçün fərqli şəkillər seçilib, **When** redaktor dil tabları arasında keçir, **Then** hər tabda həmin dilin şəkli görünür.
5. **Given** sahəyə şəkil olmayan fayl (məsələn PDF) bağlanıb, **When** forma açılır, **Then** önizləmə əvəzinə fayl tipi ikonu və fayl adı göstərilir, sınıq şəkil görünmür.

---

### User Story 2: Redaktor şəkli seçərkən və bağlayarkən onları görür (Priority: P2)

Media seçmə pəncərəsində, qalereyanın şəkillər bölməsində və səhifə/qanun/press-reliz
kimi qeydlərin əlavə faylları siyahısında şəkil olan fayllar fayl tipi ikonu əvəzinə
kiçik önizləmə ilə göstərilir. Redaktor oxşar adlı fayllar arasından lazım olanı
gözlə tanıyıb seçir.

**Why this priority**: Önizləmə yalnız seçimdən sonra görünsə, redaktor düzgün şəkli
tapmaq üçün yenə sınaq-xəta ilə seçməli olur. Formadakı önizləmə (P1) olmadan da bu
hekayə ayrıca dəyər verir.

**Independent Test**: Şəkil sahəsində media seçmə pəncərəsini açın. Şəkil fayllarının
önizləmə ilə, digər faylların ikonla göründüyünü yoxlayın. Qalereyanı redaktə üçün açın.
Bağlanmış şəkillərin önizləmə ilə göründüyünü yoxlayın.

**Acceptance Scenarios**:

1. **Given** media kitabxanasında şəkil və sənəd faylları var, **When** redaktor media seçmə pəncərəsini açır, **Then** şəkil faylları önizləmə ilə, sənədlər fayl tipi ikonu ilə göstərilir.
2. **Given** qalereyaya şəkillər bağlanıb, **When** redaktor qalereyanı redaktə üçün açır, **Then** hər bağlanmış şəkil önizləmə ilə siyahıda görünür.
3. **Given** qeydə əlavə fayllar bağlanıb, **When** redaktor qeydi redaktə edir, **Then** şəkil olan əlavələr önizləmə ilə, digərləri ikonla görünür.

---

### User Story 3: Redaktor şəkli böyük ölçüdə açır (Priority: P3)

Redaktor istənilən önizləməyə klik edib şəkli tam ölçüdə (ekrana sığacaq qədər)
ayrıca pəncərədə görür. Bu, kiçik önizləmədə görünməyən mətni, keyfiyyəti və
kəsilmə xətalarını yoxlamaq üçündür. Pəncərə "×" düyməsi, Esc və ya arxa fona klik
ilə bağlanır. Media kitabxanası səhifəsində də şəkillər önizləmə ilə göstərilir.

**Why this priority**: Kiçik önizləmə əksər hallarda kifayətdir. Böyük baxış
yoxlamanı tamamlayır, amma P1 və P2 olmadan dəyəri azdır.

**Independent Test**: Formada önizləməyə klik edin. Şəklin böyük ölçüdə açıldığını
və hər üç üsulla bağlandığını yoxlayın. Formanın vəziyyətinin dəyişmədiyini yoxlayın.

**Acceptance Scenarios**:

1. **Given** formada önizləmə görünür, **When** redaktor ona klik edir, **Then** şəkil tam ölçüdə pəncərədə açılır və formadakı məlumat dəyişmir.
2. **Given** böyük baxış açıqdır, **When** redaktor "×", Esc və ya arxa fona basır, **Then** pəncərə bağlanır və fokus önizləməyə qayıdır.
3. **Given** media kitabxanası səhifəsi açılır, **When** siyahıda şəkil faylları var, **Then** onlar önizləmə ilə göstərilir.

---

### Edge Cases

- **Şəkil yüklənmir** (fayl silinib, saxlama xidməti cavab vermir, şəbəkə xətası): sınıq şəkil ikonu əvəzinə "Önizləmə əlçatan deyil" kimi neytral yer tutucu və fayl adı göstərilir. Forma işləməyə və saxlanmağa davam edir.
- **Sessiya bitib**: önizləmə sorğusu icazəsiz cavab alanda panelin ümumi davranışı tətbiq olunur (yenidən giriş). Önizləmə ayrıca xəta pəncərəsi açmır.
- **Çox böyük şəkil** (məsələn 20 MB foto): kiçik önizləmə formanın düzülüşünü pozmur, sabit çərçivəyə proporsiyanı saxlayaraq sığır.
- **Uzun və ya çox enli/hündür şəkil** (banner, portret): kəsilmədən, proporsiya qorunaraq çərçivəyə sığır.
- **SVG fayllar** (məsələn mock `placeholder-1.svg`): önizləmədə şəkil kimi görünür. Faylın içindəki skript icra olunmur.
- **Şəkil olmayan, amma şəkil sahəsinə bağlanmış fayl** (PDF, DOCX): önizləmə cəhd edilmir, ikon və ad göstərilir.
- **Çoxlu önizləmə** (seçmə pəncərəsində 50+ şəkil): səhifə donmur. Görünməyən önizləmələr ekrana gələnə qədər yüklənməyə bilər.
- **Eyni şəkil bir neçə yerdə**: eyni məzmun təkrar-təkrar endirilmir.
- **Şəkil başqa dildə var, bu dildə yoxdur**: həmin dilin tabında önizləmə yoxdur, boş vəziyyət göstərilir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Şəkil seçilən hər form sahəsi (yaratma və redaktə rejimində) seçilmiş şəklin önizləməsini göstərməlidir.
- **FR-002**: Redaktə formasında saxlanılmış şəklin önizləməsi forma açılan kimi, əlavə hərəkət tələb etmədən görünməlidir.
- **FR-003**: Önizləmə şəkil seçiləndə, dəyişdiriləndə və təmizlənəndə saxlamadan əvvəl dərhal yenilənməlidir.
- **FR-004**: İkidilli formalarda hər dil tabı yalnız həmin dil üçün seçilmiş şəklin önizləməsini göstərməlidir.
- **FR-005**: Önizləmə yalnız şəkil tipli fayllar üçün göstərilməlidir. Digər fayllar üçün mövcud fayl tipi ikonu və fayl adı saxlanılmalıdır.
- **FR-006**: Önizləmənin yanında fayl adı və id görünməyə davam etməlidir. Önizləmə mövcud mətn məlumatını əvəz etmir, tamamlayır.
- **FR-007**: Media seçmə pəncərəsi şəkil faylları üçün fayl tipi ikonu əvəzinə önizləmə göstərməlidir.
- **FR-008**: Qalereya şəkilləri bölməsi və qeydlərin əlavə faylları siyahısı şəkil faylları üçün önizləmə göstərməlidir.
- **FR-009**: Media kitabxanası səhifəsi şəkil faylları üçün önizləmə göstərməlidir.
- **FR-010**: Redaktor istənilən önizləməni böyük ölçüdə ayrıca pəncərədə aça bilməlidir. Pəncərə klaviatura ilə (Esc) bağlanmalı, bağlananda fokus əvvəlki yerə qayıtmalıdır. Pəncərə formanın vəziyyətini dəyişməməlidir.
- **FR-011**: Şəkil yüklənə bilmədikdə sınıq şəkil əvəzinə neytral yer tutucu və fayl adı göstərilməlidir. Bu, formanın istifadəsinə və saxlanmasına mane olmamalıdır.
- **FR-012**: Önizləmələr yalnız admin panelə daxil olmuş istifadəçiyə əlçatan olmalıdır. Şəkillər qeyd public saytda dərc olunmamış olsa belə (qaralama) önizləmədə görünməlidir.
- **FR-013**: Admin panel şəkilləri yalnız admin API vasitəsilə almalıdır. Public sayt API-sinə müraciət olmamalıdır (Maddə III.1).
- **FR-014**: Önizləmə şəklin içindəki aktiv məzmunu (məsələn SVG daxilindəki skript) icra etməməlidir.
- **FR-015**: Kiçik önizləmə sabit ölçülü çərçivədə, şəklin proporsiyası qorunaraq və kəsilmədən göstərilməlidir. Formanın düzülüşü şəklin real ölçüsündən asılı olmamalıdır.
- **FR-016**: Önizləmələrin alternativ mətni (fayl adı) olmalıdır. Böyük baxış pəncərəsinin bağlama düyməsinin hər iki dildə (az/en) etiketi olmalıdır.
- **FR-017**: Eyni şəkil bir səhifədə bir neçə dəfə göstərilsə, məzmun təkrar endirilməməlidir.
- **FR-018**: Mövcud davranış dəyişməməlidir: şəkil seçimi, dəyişdirmə, təmizləmə, saxlanılan dəyər və public sayt əvvəlki kimi işləməlidir.

### Key Entities

- **Media faylı**: Media kitabxanasına yüklənmiş fayl. Id, orijinal ad, fayl tipi (mime) və ölçüsü var. Önizləmə yalnız şəkil tipli fayllar üçün göstərilir. Yeni atribut əlavə olunmur.
- **Şəkil sahəsi**: Qeydin (ana səhifə bloku, popup, MEAS, pul nişanı, təşkilat və s.) bir media faylına istinad edən sahəsi. Bəzi qeydlərdə dil üzrə ayrıdır (az/en).
- **Bağlanmış fayl**: Qalereya şəkli və ya qeydin əlavə faylı. Bir qeydə bir neçə media faylı bağlanır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Şəkil sahəsi olan bütün admin formalarının 100%-də seçilmiş şəkil həm yaratma, həm redaktə rejimində önizləmə ilə görünür.
- **SC-002**: Mövcud qeyd redaktə üçün açılandan sonra saxlanılmış şəklin önizləməsi adi daxili şəbəkədə 1 saniyə ərzində görünür.
- **SC-003**: Yeni şəkil seçiləndən sonra önizləmə 1 saniyə ərzində yenilənir.
- **SC-004**: Redaktor public saytı açmadan, yalnız admin paneldə qeydin düzgün şəkillə saxlandığını yoxlaya bilir.
- **SC-005**: Yüklənə bilməyən şəkil heç bir ekranda sınıq şəkil ikonu kimi görünmür (0 hal).
- **SC-006**: 50 şəkilli media seçmə pəncərəsi önizləmələrlə birlikdə 2 saniyə ərzində istifadəyə hazır olur.
- **SC-007**: Bu dəyişiklikdən sonra şəkil seçmə, dəyişdirmə və saxlama ilə bağlı mövcud yoxlamaların hamısı keçir (regressiya yoxdur).

## Assumptions

- **Əhatə dairəsi**: "Əlavə olunan və edit olunan zaman" ifadəsi şəkil seçilən və ya bağlanan bütün admin ekranları kimi başa düşülür: generic CRUD formalarındakı şəkil sahələri, media seçmə pəncərəsi, qalereya şəkilləri, əlavə fayllar siyahısı. Media kitabxanası səhifəsi uyğunluq üçün P3 kimi daxil edilib.
- **Rich-text editor xaricdədir**: Mətn redaktorunun (TipTap) içinə qoyulmuş şəkillər bu spec-ə daxil deyil. Onların görünüşü `roundtrip` qoruması ilə ayrıca idarə olunur.
- **Yalnız `web-cbar-admin-new`**: Köhnə `web-cbar-admin` paneli parity bağlanana qədər toxunulmur (CLAUDE.md).
- **Şəkil tipləri**: Önizləmə brauzerin göstərə bildiyi ümumi şəkil formatları üçündür (JPEG, PNG, GIF, WebP, SVG). Digər formatlar (TIFF, HEIC və s.) şəkil olmayan fayl kimi ikonla göstərilir.
- **Ölçü və dəyişdirmə yoxdur**: Server tərəfdə kiçildilmiş versiya (thumbnail) yaradılmır. Önizləmə orijinal faylı kiçik çərçivədə göstərir. Şəkli kəsmə və ya redaktə etmə daxil deyil.
- **Önizləmə yükləmədən əvvəl yoxdur**: Yüklənmə prosesi dəyişmir. Önizləmə fayl media kitabxanasına yükləndikdən və seçildikdən sonra görünür.
- **Giriş və icazələr**: Önizləmə mövcud admin girişi ilə qorunur. Rol üzrə əlavə məhdudiyyət yoxdur: media kitabxanasını görən istifadəçi önizləməni də görür (spec 008 rol modeli dəyişmir).
- **Keşləmə**: Media faylının məzmunu id üzrə dəyişmir (məzmun SHA-256 ilə ünvanlanır). Ona görə brauzerin önizləməni yadda saxlaması təhlükəsizdir.
- **Lokal yoxlama**: Lokalda .NET SDK yoxdur. API hissəsi deploy olunmuş test mühitində, frontend hissəsi isə testlər (MSW) və test API-yə qarşı yoxlanılır.
