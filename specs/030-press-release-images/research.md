# Research: Xəbər şəkilləri — sıralama, örtük və fotoqalereya (spec 030)

Hər bənd: **Qərar**, **Səbəb**, **Alternativlər**. Mənbə — kod oxunuşu (2026-11-03).

## R1. Sıralama gövdəsi `mediaIds`, `imageIds` yox

- **Qərar**: `PUT …/assets/order` gövdəsi `{ mediaIds: int64[] }`. Qalereyada `imageIds`
  (`images[].id`, qalereya-şəkil sətrinin öz id-si) işlənir; press-reliz qoşmasının isə API-də öz
  id-si yoxdur — `AssetRef` yalnız `mediaId` daşıyır, `DELETE …/assets/{mediaId}` də media id ilə
  işləyir. Bu fərq `openapi.yaml`-ın baş izahında artıq qeyd olunub (sətir 43–44).
- **Səbəb**: Panelin əlində yalnız `mediaId` var; `PressReleaseAsset.Id`-ni cavaba çıxarmaq
  `AssetRef`-i (press-relizlər **və** qanunlar üçün ortaq) dəyişərdi — əhatədən kənar.
- **Alternativlər**: `AssetRef`-ə `id` əlavə etmək — iki resursun kontraktını dəyişir, fayda yoxdur
  (`(press_release_id, media_id)` onsuz da unikaldır).

## R2. Ortaq `AssetsSection`-a opsional genişlənmə, kopya yox

- **Qərar**: `features/assets/components/assets-section.tsx` `reorderable?`, `badgeFor?`,
  `descriptionKey?` prop-ları alır; hamısı defolt söndürülüb. Press-reliz sarğısı onları açır,
  qanun sarğısı toxunulmur.
- **Səbəb**: Bağla/ayır/seçici/dialoq məntiqi eynidir; kopya iki yerdə saxlanmalı olardı. Prop-lar
  opsional olduğundan qanunlar reqressiyasız qalır (test ilə qorunur).
- **Alternativlər**: `PressReleaseAssetsSection` adlı ayrıca komponent (200 sətir kopya);
  `GalleryImagesSection`-ı ümumiləşdirmək (gövdə `imageIds`/`id` fərqi, başqa i18n namespace).

## R3. Nişan qaydası: "şəkillər arasında birinci", mövqe yox

- **Qərar**: `badgeFor` şəkil olmayanlara `null`, şəkillər arasında birinciyə "Örtük", qalan
  şəkillərə "Qalereya" verir — siyahıdakı mövqedən asılı olmayaraq.
- **Səbəb**: Sayt (`web-cbar-new` detal loader-i) `assets.filter(isImage)[0]`-ı örtük götürür; PDF
  birinci dayansa belə ilk şəkil örtükdür. Panelin nişanı saytla eyni qaydanı göstərməlidir.
- **Alternativlər**: Yalnız 0-cı indeksə "Örtük" — PDF birinci olanda yalan məlumat verərdi.

## R4. Nişan üçün kit `Badge`

- **Qərar**: `@cbar/lib-react-ui-kit/badge`, `size="sm" variant="subtle" colorPalette="black"` —
  paneldə `cell.tsx`-dəki status nişanları ilə eyni görünüş.
- **Səbəb**: Kit komponenti var və işlənir (ui-kit-usage); əl ilə `text-xs` span lazım deyil.

## R5. Controller məntiqi `GalleriesController.ReorderImages`-dən

- **Qərar**: `Include(p => p.Assets)`, `HashSet.SetEquals` + say yoxlaması → `BadRequestProblem`,
  `SortOrder = i + 1`, `audit.Log("press_releases.reorder_assets", …, before, after)`, `NoContent()`.
  Route `{id:int}/assets/order` `{id:int}/assets/{mediaId:long}` ilə konflikt etmir — `long`
  məhdudiyyəti `"order"`-i qəbul etmir (route-diff və build ilə yoxlanıb).
- **Səbəb**: İşləyən, auditli nümunə; eyni xəta mətn üslubu (`imageIds must contain exactly…`).

## R6. Sayt ölçməsi yalnız deploy-dan sonra

- **Qərar**: Fotoqalereya test mühitində admin API deploy olunub bir xəbərə 4–5 şəkil bağlanandan
  sonra `local:testcbar` (:3002) ilə ölçülür. O vaxta qədər sübut MSW testləri və 029-un
  `photo-gallery.test.tsx`-idir.
- **Səbəb**: Lokal Docker işləmir (yaddaş), test API-də çoxşəkilli xəbər yoxdur; MSW-də piksel
  ölçmək mənasızdır (jsdom layout etmir).
- **Alternativlər**: Sayt fikstürü ilə lokal Next-də ölçmək — `web-cbar-new` server-side API-dən
  oxuyur, mock rejimi yoxdur.

## R7. Testlər funksionaldır (029 R12 davamı)

- **Qərar**: Press-reliz testləri: nişanların fayl sətrində görünməsi, "yuxarı" klik → MSW-də
  tutulan `PUT` gövdəsi + refetch-dən sonra nişanın köçməsi + siyahı sırası, uc düymələrin deaktiv
  olması, 400 `message`-in `Alert`-də görünməsi; qanun testinə "sıralama düyməsi yoxdur" iddiası.
- **Səbəb**: Hər biri davranış qırılanda düşür; render/snapshot testi yazılmır.
