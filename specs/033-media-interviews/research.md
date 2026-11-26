# Research: 033 Müsahibələr və çıxışlar

Hər ölçü test mühitindədir (`api-cbar-test.cbar.az`, 2026-11-04), yalnız oxuma sorğuları ilə.

## R1. 44 qoşmanın mənası və 404 sətirləri

- **Tapıntı**: `1538–1552` 15 AZ PDF-dir (200). `1792–1806` 15 sətirdir (404), `en` tərcüməsi EN başlığı
  daşıyır. `1553–1565` və `930` 14 EN PDF-dir (200). Hər 404 sətrinin EN başlığı dəqiq uyğunluqla
  işlək EN sətrinə bağlandı: 15-dən 14-ü tapıldı, çoxmənalı uyğunluq 0, kənarda qalan fayl 0.
- **Səbəb**: API `mimeType` və `originalName` qaytarır, yəni `media_assets` sətri var. 404 faylın
  saxlamada olmamasıdır (`ObjectNotFoundException`). Niyə köçmədiyi yoxlanılmayıb, nəticəyə təsiri yoxdur.
- **Qərar**: 14 sətir ignor olunur. Yalnız Global Finance-in EN faylı (`1795`) yenidən yüklənir.
- **Risk**: Prod-da eyni id-lər və fayllar təsdiqlənməyib. İnventar köçürmədən əvvəl prod-da yoxlanılır.

## R2. Qoşma dilinin saxlanması

- **Qərar**: Yoldaş cədvəl `press_release_asset_details (asset_id PK, locale varchar(5) NULL)`. Sətir yoxdursa
  və ya `locale` `NULL`-dursa fayl hər iki dildədir.
- **Rationale**: Paylaşılan mühitlərdə mövcud cədvəllərin sahibi başqa roldur, `ALTER TABLE` "must be owner of
  table" verir və miqrasiya deployu bloklayır (`0007`, `0008`, `0014`, `0016`; `0013` məhz buna görə heç tətbiq
  olunmayıb). Mövcud sətirlər toxunulmadan "hər iki dil" olur, Xəbər və Elan görünüşü dəyişmir.
- **Düzəliş (implementasiya, 2026-11-04)**: İlk qərar `press_release_assets.locale` sütunu idi, T006-da bu risk
  tapıldı. API kontraktı dəyişmədi.
- **Alternativlər**: `PageAssetTranslation` kimi tərcümə cədvəli: başlıq daşıyır, burada başlıq yoxdur.
  Ayrı `filename_az/en`: bir qoşmada iki media, sıralama və dedup mürəkkəbləşir.

## R3. Dil harada süzülür

- **Qərar**: `api-cbar` serverdə süzür: detal `assets` və siyahı `imageUrl`,
  `a.Details!.Locale == null || a.Details.Locale == locale` (LEFT JOIN, sətir yoxdursa null). Cavab forması dəyişmir.
- **Rationale**: Sayt başqa dilin faylını heç almır, kart şəkli və qoşma siyahısı eyni qaydaya tabedir.
  Yeni API köhnə saytla işləyir (Maddə VII.3).
- **Alternativ**: `locale` sahəsini göndərib saytda süzmək: hər istehlakçıda təkrar qayda, ana səhifə
  `imageUrl`-i üçün işləmir. Spec-in ilk versiyasındakı bu yanaşma rədd edildi.

## R4. Admin API-də dil dəyişmə forması

- **Qərar**: Yalnız yeni `PUT /press-releases/{id}/assets/{mediaId}/locale`. `POST .../assets` dəyişmir.
- **Rationale**: Panel faylı əvvəl qoşur, dili sonra sətirdə seçir. `AttachAssetDto`-nu `LawsController`
  də işlədir, ona sahə əlavə etmək Qanunlar kontraktını səssiz dəyişərdi.
- **Alternativ**: Qoşma əlavə edəndə dil soruşmaq: media seçicisi bütün modullarda ortaqdır.

## R5. Sayt detalının üç rejimi

- **Qərar**: `splitPressReleaseAssets(assets, layout)`, `layout: 'photos' | 'files' | 'document'`.
  `layoutFor(type)` tipdən rejim verir, `views`-də `type === '2'` budaqları qalmır.
- **`document`**: ilk şəkil heç yerə düşmür (kart üçündür), ilk PDF `pdf`-dir, qalanı `attachments`.
- **Alternativ**: Mövcud `{ photos: boolean }`-a ikinci bayraq: mümkünsüz kombinasiya yaradır.

## R6. `Save as PDF` necə yükləyir

- **Faktlar**: `/media/{id}` same-origin proxy-dir, API `Content-Disposition: inline; filename=<hash>.pdf`
  qaytarır. Mövcud fayl sətirləri `target="_blank"` ilə açır. Köçürülmüş faylların adı hash-dir.
- **Qərar**: Kit `Button asChild` + `<a href="/media/{id}" download="{başlıq}.pdf">`. API dəyişmir.
- **Rationale**: "Save" yükləmədir. Köhnə sayt da `download` işlədirdi. Same-origin olduğuna görə atribut
  işləyir, JS tələb etmir.
- **Məhdudiyyət**: `inline` cavabda bəzi brauzerlər başlıqdakı adı üstün tuta bilər. Quickstart-da Chrome
  və Firefox-da yoxlanılır. Fayl yenə yüklənir, yalnız ad hash ola bilər.
- **Başlıq təmizlənməsi**: `/ \ : * ? " < > |` və idarəetmə simvolları çıxarılır, 120 simvola kəsilir.

## R7. Tip məntiqinin yeri

- **Qərar**: Saytda `PRESS_RELEASE_TYPE = { NEWS: '1', ANNOUNCEMENT: '2', INTERVIEW: '3' }`;
  `typeSchema` `3`-ü saxlayır, naməlum dəyər xəbərdir. Adminə `INTERVIEW: 3`.
- **Sxem**: `type` üzərində CHECK yoxdur (miqrasiyalarda axtarılıb), tip üçün miqrasiya lazım deyil.
  `0001`-dəki şərh yalnız köhnə sxem sənədidir, append-only qaydası ilə toxunulmur.

## R8. Menyu və bölmə adı

- **Faktlar**: `isCurrentNode` `navUrl` ilə `current.href`-i müqayisə edir; `pressReleasesListHref` tipə görə
  işləyir. Node `80`-ə `navUrl` verməklə aktiv bənd, H1 və breadcrumb kod dəyişikliyi olmadan işləyir.
- **Qərar**: Menyu redaktor işidir (FR-040). Kod yalnız fallback etiketi saxlayır.

## R9. Köhnə URL

- **Tapıntı**: `legacyRedirect` yalnız qalereya, video və AZİR-i əhatə edir, `/page-{id}` yoxdur.
- **Qərar**: Bu spec-də həll olunmur, ümumi boşluqdur (`diff_report_logic.md` #4). Plan Complexity
  Tracking-də əsaslandırılıb.

## R10. Verification imkanları

- **Fakt**: Bu maşında Docker işləmir, .NET 10 SDK var. Miqrasiya və EF sorğusu lokalda real baza ilə
  yoxlana bilməz; `dotnet build` işləyir. Tam yoxlama test deployundan sonradır (`quickstart.md`).
- **Qərar**: Frontend işi MSW ilə, API işi build + route-diff + test mühitində endpoint icrası ilə.
