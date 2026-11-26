# API kontraktı: KSM layihələri

Bu sənəd icmaldır. Mənbə hər API-nin `openapi/` qovluğudur: əvvəl orada yazılır, lint + bundle olunur, təsdiqlənir, sonra controller (`/api-endpoint`).

## api-cbar (public)

`openapi/paths/csr-projects.yaml`

### `GET /api/v1/csr-projects?locale=az|en`

Səhifələmə yoxdur. Sıra: `sortOrder`, sonra `id`. Filtr: `data-model.md` "Public görünüş".

```json
{
  "items": [
    {
      "id": 2,
      "category": "Təhsil",
      "cardTitle": "Biləsuvar lisey-məktəb kompleksi",
      "summary": "Mərkəzi Bankın dəstəyi ilə ...",
      "title": "Biləsuvar şəhərində ...",
      "content": "<p>...</p>",
      "cover": "/media/1567",
      "images": [{ "mediaId": 1567, "url": "/media/1567" }]
    }
  ]
}
```

- `cover` nullable: yalnız `cover_media_id`. Fallback (ilk foto) saytdadır.
- Foto alt mətni yoxdur: `media_assets`-də belə sütun yoxdur. Sayt `galleryImageAlt` işlədir (`{başlıq} — şəkil {n}`).

### `GET /api/v1/search` (mövcud, dəyişiklik)

Yeni nəticə tipi `csr-project`, ünvan KSM səhifəsidir. Geriyə uyğundur.

## api-cbar-admin

`openapi/paths/csr-projects.yaml`. Hamısı JWT, `x-permission: csr.*`, yazma əməliyyatları audit-ə düşür, xətalar `problem+json`.

| Metod | Yol | İcazə |
|---|---|---|
| GET | `/api/v1/csr-projects` (`page`, `pageSize`, `q`, `status`, `categoryId`) | `csr.read` |
| GET | `/api/v1/csr-projects/{id}` | `csr.read` |
| POST | `/api/v1/csr-projects` | `csr.create` |
| PUT | `/api/v1/csr-projects/{id}` | `csr.update` |
| DELETE | `/api/v1/csr-projects/{id}` | `csr.delete` |
| POST | `/api/v1/csr-projects/{id}/assets` | `csr.update` |
| PUT | `/api/v1/csr-projects/{id}/assets/order` | `csr.update` |
| DELETE | `/api/v1/csr-projects/{id}/assets/{mediaId}` | `csr.update` |
| GET | `/api/v1/csr-categories` | `csr.read` |
| GET | `/api/v1/csr-categories/{id}` | `csr.read` |
| POST | `/api/v1/csr-categories` | `csr.create` |
| PUT | `/api/v1/csr-categories/{id}` | `csr.update` |
| DELETE | `/api/v1/csr-categories/{id}` | `csr.delete` |

`/assets` marşrutları press-relizlərlə eyni formadadır, `AssetsSection` onları dəyişmədən işlədir. Locale marşrutu yoxdur.

Layihə gövdəsi:

```json
{
  "categoryId": 2,
  "coverMediaId": null,
  "sortOrder": 20,
  "status": "published",
  "showAz": true,
  "showEn": true,
  "translations": {
    "az": { "cardTitle": "...", "summary": "...", "title": "...", "content": "<p>...</p>" },
    "en": { "cardTitle": "...", "summary": "...", "title": "...", "content": "<p>...</p>" }
  }
}
```

Tərcümə formasının dəqiq şəkli `EventsController` DTO-su ilə eyni olur, OpenAPI yazılanda yoxlanılır.
