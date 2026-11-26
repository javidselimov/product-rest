# Feature Specification: Şəkil və məlumat yüklənməsində boş yer

**Feature Branch**: `036-image-loading-states`

**Created**: 2026-11-06

**Status**: Implemented (test deploy və SC-001 yoxlaması gözləyir)

**Input**: Saytda şəkil yeri əvvəl boş görünür, sonra şəkil birdən çıxır; məlumat gözlənilərkən də hər yerdə eyni fırlanan
işarə görünür. Ziyarətçi tərəfdən bu səliqəsiz görünür. Yalnız ictimai sayt (`web-cbar-new`) dəyişir.

## Problemin ölçüsü

Test saytında (`temp.cbar.az`) 06.11.2026 tarixində ölçülüb:

| Ölçmə | Nəticə |
|---|---|
| Eyni şəkil variantı dörd dəfə üst-üstə istənir | Dördündə də server hazır nüsxəni tapmır, şəkli yenidən hazırlayır |
| Kart ölçülü şəkil (384 px) | 0,31–0,59 s, ikinci sorğuda sürətlənmir |
| Böyük şəkil (750 px) | 0,79–1,28 s, ikinci sorğuda sürətlənmir |
| Eyni faylın mənbədən gəlməsi | 0,07–0,19 s |

Beləliklə ziyarətçinin gözlədiyi vaxtın böyük hissəsi şəkli göndərmək yox, onu hər dəfə yenidən hazırlamaqdır. 9 kartlıq
siyahıda bu iş növbəyə düzülür. Bundan əlavə, sayt gözləmə zamanı heç nə göstərmir: qutu boz qalır, şəkil birdən çıxır.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Şəkillər tez gəlir (Priority: P1)

Ziyarətçi siyahı açanda şəkillər dərhal gəlməyə başlayır, çünki başqası artıq baxıbsa server şəkli yenidən hazırlamır.

**Why this priority**: Gözləmə vaxtının əsas səbəbi budur. Qalan işlər gözləməni gözəl göstərir, bu isə onu qısaldır.

**Independent Test**: Eyni şəkil variantını test saytından iki dəfə istəyin; ikinci cavab hazır nüsxədən gəlməlidir.

**Acceptance Scenarios**:

1. **Given** şəkil artıq bir dəfə hazırlanıb, **When** ikinci ziyarətçi eyni variantı istəyir, **Then** cavab hazır nüsxədən gəlir və 0,1 saniyədən tez başlayır.
2. **Given** yeni deploy olunub, **When** şəkil ilk dəfə istənir, **Then** normal hazırlanır və növbəti sorğular üçün saxlanılır.
3. **Given** server şəkli saxlaya bilmir, **When** şəkil istənir, **Then** şəkil yenə göstərilir, sadəcə hazır nüsxə olmur.

---

### User Story 2 - Şəkil yeri səliqəli dolur (Priority: P1)

Ziyarətçi şəkil gələnə qədər onun yerində yüklənmə animasiyası görür, şəkil birdən çıxmır, yumşaq açılır.

**Why this priority**: İstifadəçinin birbaşa şikayəti budur və bütün şəkilli səhifələrə təsir edir.

**Independent Test**: Yavaş şəbəkədə Xəbərlər siyahısını açın: hər kartda animasiya, sonra yumşaq açılan şəkil görünməlidir.

**Acceptance Scenarios**:

1. **Given** şəkil hələ gəlməyib, **When** səhifə görünür, **Then** şəklin qutusunda yüklənmə animasiyası var və qutu son ölçüsündədir.
2. **Given** şəkil gəlib, **When** yüklənmə bitir, **Then** animasiya itir və şəkil təxminən 200 ms-də açılır.
3. **Given** şəffaf fonlu şəkil (sikkə), **When** yüklənmə bitir, **Then** arxasında animasiya qalmır.
4. **Given** şəkil tapılmır, **When** yüklənmə uğursuz olur, **Then** animasiya dayanır, səliqəli boş qutu qalır, sınmış şəkil işarəsi görünmür.
5. **Given** ziyarətçi hərəkəti azaltmağı seçib, **When** şəkil yüklənir, **Then** animasiya və yumşaq açılma yoxdur, şəkil birbaşa görünür.
6. **Given** brauzerdə JavaScript sönülüdür və ya işləmir, **When** səhifə açılır, **Then** şəkillər yenə görünür.
7. **Given** şəkil brauzer keşindədir, **When** səhifə açılır, **Then** animasiya görünmür və ya dərhal itir.

---

### User Story 3 - Görünən şəkillər əvvəl yüklənir (Priority: P2)

Ziyarətçi ilk ekranda gördüyü şəkilləri əvvəl alır, slayderdə və foto qalereyada keçid edəndə boş yer görmür.

**Why this priority**: Gözləmə qısalır, amma User Story 1 və 2 olmadan da sayt işləyir.

**Independent Test**: Siyahını açıb ilk sıranın şəkillərinin aşağıdakılardan əvvəl istənildiyini, qalereyada növbəti şəklə keçidin ani olduğunu yoxlayın.

**Acceptance Scenarios**:

1. **Given** kart siyahısı, **When** səhifə açılır, **Then** ilk sıranın şəkilləri dərhal istənir, aşağıdakılar ekrana yaxınlaşanda.
2. **Given** ana səhifə slayderi, **When** növbəti slayda keçid olur, **Then** şəkil artıq hazırdır, boş rəngli fon görünmür.
3. **Given** foto qalereya, **When** ziyarətçi qonşu şəklə keçir, **Then** şəkil dərhal görünür.

---

### User Story 4 - Səhifə forması əvvəlcədən görünür (Priority: P2)

Ziyarətçi Media və Xəbərlər səhifələrinə keçəndə mərkəzdə fırlanan işarə yox, səhifənin gələcək formasını görür.

**Why this priority**: Məlumat gözləməsi qısadır, amma forma dəyişməsi səhifəni səliqəsiz göstərir.

**Independent Test**: Yavaş şəbəkədə menyudan Qalereyaya keçin: forma real səhifə ilə eyni olmalı, məlumat gələndə məzmun tullanmamalıdır.

**Acceptance Scenarios**:

1. **Given** siyahı səhifəsi yüklənir, **When** ziyarətçi keçid edir, **Then** sol sütun, başlıq və kart şəbəkəsinin forması görünür.
2. **Given** detal səhifəsi yüklənir, **When** ziyarətçi keçid edir, **Then** başlıq və məzmun qutusunun forması görünür.
3. **Given** məlumat gəlib, **When** real səhifə əvəz olunur, **Then** kartlar yerindən oynamır.
4. **Given** məlumat çox tez gəlir, **When** keçid edilir, **Then** yüklənmə forması yanıb-sönmür.
5. **Given** bu əhatəyə daxil olmayan səhifə, **When** yüklənir, **Then** əvvəlki kimi fırlanan işarə görünür.

### Edge Cases

- Kart şəkilsizdirsə animasiya yoxdur, boz qutu qalır.
- Foto qalereyada şəkil dəyişəndə yeni şəkil üçün yüklənmə vəziyyəti yenidən başlayır, köhnə şəkil yanlış adla qalmır.
- YouTube örtüyü xarici mənbədəndir, eyni yüklənmə davranışı işləyir.
- Üzərinə gəlmə effekti olan şəkillərdə (ana səhifə kartları) yumşaq açılma bu effekti pozmur.
- JavaScript yüklənsə də səhifə canlanmasa, şəkil bir neçə saniyədən sonra hər halda görünür.
- Məlumat xətası və boş siyahı vəziyyətləri dəyişmir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Server hazırlanmış şəkil variantını saxlamalı və eyni variant üçün təkrar istifadə etməlidir.
- **FR-002**: Şəkil saxlanıla bilməsə də ziyarətçiyə şəkil göstərilməlidir.
- **FR-003**: Sayt kontentinin bütün şəkilləri (kartlar, slayder, detal örtükləri, qalereya, heyət, ofislər, pul nişanları, video örtükləri, tarix fotoları) gələnə qədər ölçüsü sabit qutuda yüklənmə animasiyası göstərməlidir, ölçüsü qutuya bağlı olmayan şəkillər isə yalnız yumşaq açılmalıdır.
- **FR-004**: Şəkil gələndə animasiya itməli və şəkil təxminən 200 ms-də açılmalıdır.
- **FR-005**: Yüklənə bilməyən şəkildə animasiya dayanmalı, boş qutu qalmalı, sınmış şəkil işarəsi görünməməlidir.
- **FR-006**: Hərəkəti azaltma seçimi olan ziyarətçidə animasiya və yumşaq açılma olmamalıdır.
- **FR-007**: JavaScript işləmədikdə şəkil gizlədilməməlidir; səhifə canlanmasa belə şəkil ən geci 8 saniyəyə görünməlidir.
- **FR-008**: Kart siyahılarında ilk sıranın şəkilləri dərhal istənməlidir, qalanları gec yükləməlidir.
- **FR-009**: Slayderin növbəti slaydı və foto qalereyada seçilən şəklin iki qonşusu əvvəlcədən yüklənməlidir.
- **FR-010**: Foto və video siyahıları, Tədbirlər, Press relizlər siyahıları və onların detal səhifələri məlumat gözləyərkən səhifənin formasını göstərməlidir.
- **FR-011**: Yüklənmə forması real səhifə ilə eyni ölçüdə olmalı, məlumat gələndə məzmun tullanmamalıdır.
- **FR-012**: Yüklənmə forması qısa gecikmə ilə görünməli, sürətli keçiddə yanıb-sönməməlidir.
- **FR-013**: Əhatəyə daxil olmayan səhifələrin mövcud yüklənmə göstəricisi dəyişməməlidir.
- **FR-014**: Yüklənmə animasiyaları ekran oxuyucusu üçün məzmun kimi oxunmamalıdır, şəkillərin mövcud alt mətnləri dəyişməməlidir.
- **FR-015**: Azərbaycan və ingilis versiyaları, üç ekran ölçüsü (1728, 744, 390) eyni davranmalıdır.

### Key Entities

Yeni məlumat yoxdur. API və verilənlər bazası dəyişmir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Artıq hazırlanmış şəkil üçün cavab 0,1 saniyədən tez başlayır (indi 0,31–1,28 s).
- **SC-002**: Yavaş şəbəkədə heç bir kontent şəkli boş qutu kimi qalmır: gözləmənin əvvəlindən sonuna qədər yüklənmə animasiyası görünür.
- **SC-003**: Kart siyahılarında yüklənmə zamanı və yüklənmədən sonra məzmun tullanması sıfıra yaxındır (layout shift ≤ 0,01).
- **SC-004**: Yüklənmə forması ilə real səhifənin kart ölçüləri arasında fərq 1 pikseldən azdır.
- **SC-005**: Ziyarətçi qalereyada qonşu şəklə keçəndə boş qutu görmür.
- **SC-006**: JavaScript sönülü halda şəkil heç vaxt yüklənmə qaydası ilə gizlədilmir.

## Assumptions

- Şəkilin yüklənmə vəziyyəti üçün UI kit-in mövcud yüklənmə elementi işlədilir; Figma-da ayrıca dizayn tələb olunmur.
- Serverdə saxlanılan şəkil nüsxələri deploy-da sıfırlana bilər, bu qəbul olunur: ilk sorğu şəkli yenidən hazırlayır.
- Keş problemin səbəbi ehtimaldır, serverin özündə yoxlanmayıb. FR-001 yalnız test mühitinə deploy-dan sonra təsdiqlənə bilər. Təsdiqlənməzsa, səbəb server log-larından yenidən araşdırılır.
- Köhnə brauzerlərdə yumşaq açılma olmaya bilər, şəkil yenə görünür.
- JS-siz ziyarətçi `loading.tsx` olan route-larda məzmunu ümumiyyətlə görmür: məzmun axınla gizli `div`-ə gəlir və onu yerinə qoyan da skriptdir. Bu, spec 003-dən bəri `[locale]/loading.tsx`-lə bütün saytda belədir (əvvəl spinner qalırdı, indi skeleton). Bu spec onu dəyişmir.

## Out of Scope

- CMS mətninin içindəki şəkillər: ölçüləri məlum deyil, səhifə mətni ilə birlikdə gəlir.
- Şəklin bulanıq önizləməsi: API və köhnə şəkillər üçün emal tələb edir.
- Ana səhifənin yüklənmə forması: səhifə artıq tez gəlir (0,24 s).
- API və admin panel dəyişikliyi.
- `/media/galleries` səhifəsinin ümumi yüklənmə müddəti (2,05 s, oxşar səhifələr 0,4–0,6 s): ayrıca ölçülür.
- Mövcud olmayan səhifənin HTTP status məsələsi (spec 035): dəyişmir.
