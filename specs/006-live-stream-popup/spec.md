# Feature Specification: Canlı yayım (admin bölməsi + ictimai saytda popup)

**Feature Branch**: `006-live-stream-popup`

**Created**: 2026-09-25

**Status**: Approved

**Input**: User description: "prodda canlı yayım bölməsi var (başlıq az/en, YouTube url, tarix, aktiv). İstəyirəm bu funksionallığı web-cbar-admin-new-də də quraq, əlavə olaraq web-cbar-new-də istifadəçilər sayta ilk dəfə girəndə canlı yayım popup kimi çıxsın. Linklər adətən YouTube linki olacaq. Popup bağlananda səhifə refresh olanda yenidən görünməsin, başqa səhifədə açanda isə görünsün. Session storage-də bununla bağlı informasiya saxlayarıq."

**Əhatə olunan proyektlər**: `api-cbar-admin` (bir sətir DTO), `web-cbar-admin-new`, `web-cbar-new`.
`api-cbar` dəyişmir, çünki public endpoint artıq mövcuddur.

**`product-host` istinadı (Konstitusiya Maddə I.2)**:
- **Admin:** `admin/controllers/VideosStreamsController.php`, `admin/views/videos-streams/{index,manage}.php`, `common/models/VideosStreams.php`.
- **İctimai sayt:**
  - `visitor/widgets/LiveStreamWidget.php`: son aktiv yazı (`id DESC`), header düyməsi və gizli lightGallery elementi;
  - `visitor/web/js/custom.js:226-235`: yalnız ana səhifədə avtomatik açılır, bağlananda `sessionStorage.liveStreamClosed` yazılır, sessiya boyu bir daha açılmır.

**Köhnədən fərq (qəsdən)**:
- Popup yalnız ana səhifədə deyil, sessiyada **ilk açılan hansı səhifə olursa** orada çıxır.
- Bağlanma köhnədəki kimi sessiya boyu yadda saxlanılır, amma **yayıma görə**: yeni yayım əlavə olunanda əvvəlki bağlanmalar ona təsir etmir.
- (2026-10-22-yə qədər bağlanma səhifəyə görə idi — Session 2026-10-22-yə bax.)

**Hazırkı vəziyyət (ölçülüb)**:
- **Cədvəllər:** `video_streams` + `video_stream_translations`, `0001-initial-schema.sql:624`.
- **Admin CRUD:** `api/v1/video-streams`, `VideoStreamsController.cs`. Cavabda `createdAt` yox idi.
- **Public:** `GET api/v1/video-streams?locale=` yalnız `IsLive` yazılarını, `StartsAt DESC` sırası ilə qaytarır, `MediaContentController.cs:103`.
- **Admin panel:** modul `features/videos`-da "Yayımlar" tabı kimi var (`/videos/streams`). URL üçün YouTube yoxlaması yoxdur, placeholder `.m3u8`-dir.
- **Public sayt:**
  - `getVideoStreams`, `youtubeId`, `youtubeEmbedUrl` və CSP `frame-src` (YouTube) mövcuddur;
  - popup, header düyməsi və sessionStorage istifadəsi yoxdur.

## Clarifications

### Session 2026-09-25

- Q1 (admin yeri): **Sidebar-da ayrıca "Canlı yayımlar" bəndi.** Videolar bölməsinin tabı ləğv olunur.
- Q2 (yaradılma vaxtı): Admin API cavabına **`createdAt` əlavə olunur**. Build lokalda yoxlanıla bilmir (.NET SDK yoxdur).
- Q3 (header düyməsi): **Bəli.** Yalnız aktiv yayım olanda görünür, popup-ı açır.
- Q4 (autoplay): **Yoxdur.** Video yalnız ziyarətçi play-ə basanda başlayır.
- Q5 (Videolar link yoxlaması): **Köhnə yumşaq qayda qalır** (yalnız `http(s)://`). Sərt YouTube host yoxlaması yalnız canlı yayım üçündür.

### Session 2026-10-22

- Q6 (bağlanmanın əhatəsi): **Sessiya boyu, səhifədən asılı olmayaraq.** Popup hər yeni səhifədə yenidən açılırdı, bu narahatlıq yaradırdı. Bağlanandan sonra həmin sessiyada yalnız header düyməsi onu açır. Açar `<streamId>` ilə qalır, ona görə yeni yayım yenə avtomatik çıxır. Qeyd yalnız bağlananda yazılır: bağlamadan refresh edilsə popup yenidən çıxır. Şəkilli popup (spec 009) eyni qaydaya keçir.

## User Scenarios & Testing *(mandatory)*

### User Story 1: Redaktor canlı yayımı idarə edir (Priority: P1)

Redaktor admin paneldə sidebar-dan "Canlı yayımlar"-a keçir. Başlıq (az/en), YouTube URL və tarix daxil edib yazını aktiv edir. Siyahıda hər yazının başlığı, tarixi, yaradılma və yenilənmə vaxtı və statusu görünür. Status siyahıdan birbaşa dəyişdirilə bilir.

**Acceptance Scenarios**:
1. **Given** redaktor forma doldurur, **When** URL YouTube linki deyil, **Then** forma saxlanmır və xəta mesajı göstərilir.
2. **Given** siyahıda aktiv yazı var, **When** redaktor status düyməsini sıxır, **Then** yazı qeyri-aktiv olur və siyahı yenilənir.
3. **Given** köhnə `/videos/streams` ünvanı, **When** açılır, **Then** `/live-streams`-ə yönləndirilir.

### User Story 2: Ziyarətçi sayta girəndə canlı yayımı görür (Priority: P1)

Aktiv yayım olanda ziyarətçi hansı səhifəni açırsa açsın, YouTube pleyeri olan popup çıxır.

**Acceptance Scenarios**:
1. **Given** aktiv yayım var, **When** ziyarətçi səhifəni ilk dəfə açır, **Then** popup açılır.
2. **Given** ziyarətçi popup-ı bağlayıb, **When** eyni səhifəni refresh edir, **Then** popup açılmır.
3. **Given** ziyarətçi popup-ı bir səhifədə bağlayıb, **When** başqa səhifəyə keçir (link, birbaşa ünvan və ya dil dəyişdiricisi ilə), **Then** popup açılmır.
4. **Given** ziyarətçi popup-ı bağlayıb, **When** header-dəki "Canlı yayım" düyməsini sıxır, **Then** popup açılır.
5. **Given** yeni tab və ya yeni brauzer sessiyası, **When** səhifə açılır, **Then** popup yenidən açılır.
6. **Given** aktiv yayım yoxdur və ya URL YouTube linki deyil, **When** hər hansı səhifə açılır, **Then** nə popup, nə header düyməsi görünür.
7. **Given** popup bu sessiyada bağlanıb, **When** redaktor yeni yayım aktiv edir, **Then** yeni yayım üçün popup yenidən açılır.

### User Story 3: Header düyməsi (Priority: P2)

Aktiv yayım olanda header-də (mobil menyuda da) qırmızı "Canlı yayım" düyməsi görünür. Klik popup-ı açır, bağlanma qeydinə baxılmır.

### Edge Cases

- sessionStorage əlçatan deyil (private mode, bloklanmış storage): popup çıxır, bağlanır, amma yadda saxlanmır. Xəta atılmır.
- Bir neçə aktiv yayım: `startsAt`-ı ən böyük olan göstərilir (API sırasında ilk).
- API xətası: layout `[]`-a düşür, popup yoxdur, səhifə normal render olunur.
- YouTube `/@kanal/live` kimi ID-siz URL: popup göstərilmir. Admin yoxlaması belə URL-i qəbul edir; redaktor video linkini daxil etməlidir.

## Requirements *(mandatory)*

- **FR-001**: Admin paneldə sidebar bəndi "Canlı yayımlar" CRUD-u (`/live-streams`) olmalıdır.
- **FR-002** (yalnız canlı yayım): URL `http(s)://` ilə başlamalı və host-u `youtube.com`, `www.youtube.com`, `m.youtube.com` və ya `youtu.be` olmalıdır.
- **FR-003**: Siyahı sütunları: Başlıq, Tarix, Yaradılma, Yenilənmə, Status. Status siyahıdan dəyişdirilə bilər.
- **FR-004**: Public sayt ilk aktiv yayımı server tərəfdə alır. Brauzer API-yə müraciət etmir (Maddə XI.3).
- **FR-005**: Popup bağlananda `sessionStorage`-ə `cbar:live-stream:dismissed:<streamId>` = `1` yazılır. Popup yalnız bu açar yoxdursa avtomatik açılır — qeyd sessiya boyu bütün səhifələrə aiddir. Qeyd yalnız bağlananda yazılır.
- **FR-006**: Popup pleyeri `youtube-nocookie.com/embed/<id>` istifadə edir, autoplay-siz (Q4). `iframe` yalnız dialoq açıq olanda mount olunur, bağlananda video dayanır.
- **FR-007**: Bütün mətnlər i18n-dən gəlir (az/en paritet).

## Deviations

- **D-1 (Maddə V, sessionStorage)**: Maddə V-də `sessionStorage` qadağası sessiya və token saxlanması üçündür. Bu feature orada yalnız həssas olmayan "popup bu səhifədə bağlandı" bayrağını saxlayır. Maddə X.3 (həssas data saxlanmır) pozulmur. Başqa məqsədlə sessionStorage istifadəsinə bu D-qeyd icazə vermir.

## Success Criteria

- **SC-001**: US2 ssenarilərinin hamısı Vitest testləri ilə əhatə olunub və brauzerdə əl ilə təsdiqlənib.
- **SC-002**: Hər iki frontend-də `npm run verify` keçir.
- **SC-003**: Yayım yoxdursa, ana səhifə client JS-i dəyişməz qalır. Ancaq dialoq kodu layout-dadır, ona görə dəyişikliyin ölçüsü build-dən sonra qeyd olunur.
