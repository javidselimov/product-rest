# Contract: `api-cbar-admin` — media önizləməsi

**Feature**: [../spec.md](../spec.md) | **Research**: R1–R4

Mövcud endpoint-lər (`GET/POST /api/v1/media`, `DELETE /api/v1/media/{id}`) **dəyişmir**.
Yalnız bir route əlavə olunur.

## `GET /api/v1/media/{id}/preview`

Media faylının baytlarını qaytarır. Yalnız şəkil tipli fayllar üçündür.

**Auth**: `Authorization: Bearer <accessToken>` (`[Authorize]`, controller səviyyəsində mövcuddur).
Rol üzrə əlavə məhdudiyyət yoxdur. Audit yazılmır, çünki bu oxuma əməliyyatıdır (Maddə III.4 yalnız yazmaları tələb edir).

**Path**: `id` — `long`, `media_assets.id`.

**Request headers (ixtiyari)**: `If-None-Match: "<sha256>"`.

### Cavablar

| Status | Nə vaxt | Body | Headers |
| --- | --- | --- | --- |
| `200` | Fayl var, `mime_type` `image/` ilə başlayır | Faylın baytları (chunked, `Content-Length` yoxdur) | aşağıdakı cədvəl |
| `304` | `If-None-Match` `ETag`-a uyğundur | boş | `ETag`, `Cache-Control` |
| `401` | Token yoxdur və ya etibarsızdır | boş | — |
| `404` | Sətir yoxdur, soft-delete olunub, və ya obyekt MinIO-da yoxdur | `{ "message": "Not found." }` | `Cache-Control: no-store` |
| `415` | Fayl var, amma şəkil deyil. **Baytlar oxunmur** | `{ "message": "Preview is available for images only.", "mimeType": "<mime>" }` | `Cache-Control: private, max-age=31536000, immutable` |

### 200 headers

| Header | Dəyər | Səbəb |
| --- | --- | --- |
| `Content-Type` | `media_assets.mime_type` | |
| `Content-Disposition` | `inline; filename*=UTF-8''<original_name>` | |
| `ETag` | `"<checksum_sha256>"` | Güclü validator (R2) |
| `Cache-Control` | `private, max-age=31536000, immutable` | Məzmun id üzrə dəyişmir. `private` paylaşılan keşə qoymur |
| `X-Content-Type-Options` | `nosniff` | R4 |
| `Content-Security-Policy` | `default-src 'none'; style-src 'unsafe-inline'; sandbox` | Birbaşa açılan SVG skript icra etmir (R4) |

### Qeydlər (implementasiya üçün məhdudiyyətlər)

- Stream `MediaStorage.GetAsync(key, callback)` vasitəsilə gedir. Header-lər callback daxilində qoyulur ki, olmayan obyekt təmiz, keşlənməyən 404 qaytarsın (`ObjectNotFoundException`/`BucketNotFoundException`). Bu, `api-cbar` `MediaController`-ın davranışıdır.
- `Content-Length` qoyulmur, çünki miqrasiya olunmuş sətirlərdə `size_bytes` yanlışdır.
- CORS dəyişmir. Panel deploy mühitində API-yə mövcud CORS siyasəti ilə, lokalda Vite proxy ilə gedir.
- `MediaStorageOptions` dəyişmir, ona görə `api-cbar` ilə sinxronlaşdırma tələb olunmur.

### Nümunə

```bash
curl -i -H "Authorization: Bearer $TOKEN" http://localhost:5253/api/v1/media/1/preview
# HTTP/1.1 200 OK
# Content-Type: image/svg+xml
# ETag: "…"
# Cache-Control: private, max-age=31536000, immutable

curl -i -H "Authorization: Bearer $TOKEN" http://localhost:5253/api/v1/media/3/preview
# HTTP/1.1 415 Unsupported Media Type
# {"message":"Preview is available for images only.","mimeType":"application/pdf"}
```
