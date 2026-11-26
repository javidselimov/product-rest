# Contract: `POST /api/v1/media` (api-cbar-admin)

Route, request forması və uğurlu cavab **dəyişmir**. Dəyişən: bir yeni 400 halı, `originalName`-in
təmizlənməsi, təsvir mətni. Spec-first: bu dəyişiklik `openapi/`-da koddan **əvvəl** edilir
(`/api-endpoint`); route dəyişmədiyi üçün `spec-first.mjs` hook-u keçir.

## Rədd halları (hamısı `application/problem+json`, spec 018 forması)

| Hal | Status | `message` | Bu gün |
|---|---|---|---|
| Boş fayl | 400 | `Empty file.` | var |
| Extension whitelist-də deyil (təmizlənmiş ad üzrə) | 400 | `File type '.exe' is not allowed.` | var |
| Məzmun extension-a uyğun deyil | 400 | `File content does not match type '.pdf'.` | **YENİ** |
| `file` hissəsi yoxdur | 400 | (binding, `ValidationProblemDetails`) | var |
| Gövdə > 250 MB | 400 / proxy 413 | — | var |

Nümunə:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "File content does not match type '.pdf'.",
  "message": "File content does not match type '.pdf'.",
  "traceId": "00-…"
}
```

Forma spec 018-in `BadRequestProblem` köməkçisindən gəlir (`detail` = `message`, `title` = status ifadəsi) — panel `message`-i
dəyişiklik olmadan göstərir (FR-006).

## 200 cavabı

Dəyişmir (`MediaUploadResult`). Yalnız yeni qeydlərdə `originalName` [data-model.md §3](../data-model.md#3-fayl-adı-qaydası-fr-007-fr-008)
qaydası ilə təmizlənmiş addır. Dedup hitində əvvəlki kimi **mövcud** qeydin adı qayıdır.

## OpenAPI dəyişikliyi (`product-rest/api-cbar-admin/openapi/`)

| Fayl | Dəyişiklik |
|---|---|
| `paths/media.yaml` → `collection.post.description` | "The whole file is buffered in memory." silinir; yerinə: fayl diskdə buferlənir, yaddaş ölçüdən asılı deyil; məzmun imzası yoxlanır (siyahı); orijinal ad təmizlənir (qayda qısa). 400 siyahısına "content does not match the extension" əlavə |
| `paths/media.yaml` → `collection.post.responses.400` | `BusinessRule` qalır; təsvirə yeni hal |
| `components/schemas/media.yaml` → `MediaUploadResult.originalName` | təsvir: "sanitised; ≤ 255 characters" |
| `openapi.yaml` → `x-known-issues` | `'Media upload buffers the file fully in memory (up to 250 MB).'` sətri **silinir** |
| `openapi.yaml` → `# Sync:` sətri | spec 019 commit-i ilə yenilənir (sync-openapi konvensiyası) |
| `dist/` | `npm run lint` + `npm run bundle` |
