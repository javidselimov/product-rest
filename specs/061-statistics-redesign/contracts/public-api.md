# Public API contract: `api-cbar`, spec 061

Spec-first: əvvəl `product-rest/api-cbar/openapi/components/schemas/pages.yaml` → lint + bundle → təsdiq → controller.
Route dəyişmir, ona görə `.claude/hooks/spec-first.mjs` yalnız xatırladır; forma əl ilə yoxlanır.

## `GET /api/v1/pages/{slug}?locale=` — `PageAsset`

Əlavə sahə (mövcud sahələr və onların mənası dəyişmir):

```yaml
PageAsset:
  required: [mediaId, title, mimeType, sizeBytes, group, uploadedAt, url]
  properties:
    uploadedAt:
      type: string
      format: date-time
      description: |
        When the media file was uploaded (`media_assets.created_at`, spec 061). Files imported from the legacy site carry the
        import time; a re-upload of identical bytes keeps the first upload's time (content-addressed storage). The site prefers
        a date written at the end of the file title.
```

Controller: `PagesController.GetBySlug` proyeksiyasına `uploadedAt = a.Media.CreatedAt` və son `Select`-ə `a.uploadedAt`.
`Cbar.Domain` dəyişmir (sahə artıq var). Admin API dəyişmir.

## Sayt tərəfi

`entities/content/model/schemas.ts` asset sxemi: `uploadedAt: z.iso.datetime({ offset: true }).optional()` — sahəsiz köhnə API
qəbul olunur (FR-024). MSW handler-ləri və fikstürlər yeni sahə ilə yenilənir (real kontrakt).

## Saytın yeni ünvanı (API deyil, kontrakt üçün)

`GET /{locale}/statistics/files/{slug}` (route handler, `web-cbar-new`):

| Hal | Cavab |
|---|---|
| slug `statistics-files` layout-lu səhifədir, fayllar alındı | 200 `application/zip`, `Content-Disposition: attachment; filename*=UTF-8''<slug>.zip`, `Cache-Control: no-store` |
| slug başqa səhifədir, səhifə yoxdur və ya faylı yoxdur | 404 |
| fayl sayı > `ZIP_MAX_FILES` (60) və ya cəm > `ZIP_MAX_BYTES` (50 MB) | 413 |
| bir fayl alınmadı (upstream xəta) | 502, log `statistics zip: upstream failed`, arxiv verilmir |
