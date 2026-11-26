# Contract: `api-cbar-admin` — `api/v1/image-popups`

`[Authorize]` (JWT). Cavablar camelCase-dir. Forma `BannersController` və `VideoStreamsController` ilə eynidir.

## DTO

```jsonc
// ImagePopupUpsertDto (POST / PUT body)
{
  "title": "Strategiya 2025 icra statusu",   // tələb olunur, ≤ 500
  "isActive": true,
  "translations": {
    "az": { "mediaId": 41, "link": "/az/pages/strategiya", "altText": "2024-2026 Strategiyası…" },
    "en": { "mediaId": 42, "link": "https://example.org/x", "altText": null }
  }
}
```

```jsonc
// Detail (GET list elementi, GET {id}, POST/PUT cavabı)
{
  "id": 3,
  "title": "Strategiya 2025 icra statusu",
  "isActive": true,
  "activatedAt": "2026-09-30T08:12:00+00:00",
  "createdAt": "2026-09-29T14:00:00+00:00",
  "updatedAt": "2026-09-30T08:12:00+00:00",
  "translations": {
    "az": { "mediaId": 41, "mediaName": "strategiya-az.png", "link": "/az/pages/strategiya", "altText": "…" },
    "en": { "mediaId": 42, "mediaName": "strategy-en.png", "link": "https://example.org/x", "altText": null }
  }
}
```

`mediaName` = `Media?.OriginalName`, yalnız oxunur. Panel onu fayl adı kimi göstərir (R5, R6).

## Endpoint-lər

| Metod | Yol | Uğur | Qeyd |
| --- | --- | --- | --- |
| GET | `/api/v1/image-popups` | `200 { items: Detail[] }` | Sıra `id DESC`. Paging yoxdur (VideoStreams kimi) |
| GET | `/api/v1/image-popups/{id:int}` | `200 Detail` | `404` |
| POST | `/api/v1/image-popups` | `201 Detail` (`CreatedAtAction`) | `isActive` true-dursa `activatedAt = now` |
| PUT | `/api/v1/image-popups/{id:int}` | `200 Detail` | Tam DTO, PATCH yoxdur. `false → true` olanda `activatedAt = now` |
| DELETE | `/api/v1/image-popups/{id:int}` | `204` | Hard delete |

## Validasiya: `400 { message }`

| Şərt | message |
| --- | --- |
| `title` boşdur | `Title is required.` |
| Heç bir tərcümədə `mediaId` yoxdur | `At least one locale must have an image.` |
| `mediaId` mövcud deyil və ya silinib | `Media asset not found.` |
| Media `image/*` deyil | `Media asset must be an image.` |
| `link` qaydaya uyğun deyil (R7) | `Link must start with http://, https:// or /.` |
| Naməlum locale açarı | `Unknown locale.` |

## Audit

- `image_popups.create`, `image_popups.update` (before/after), `image_popups.delete`.
- Entity tipi: `"image_popup"`.
- Create əməliyyatı Banners kimi tranzaksiyada gedir: əvvəl save olunur (Id üçün), sonra log yazılır, sonra yenidən save.

## Əlaqəli dəyişiklik

`MediaController.Delete` media-nın istifadədə olub-olmadığını yoxlayan siyahıya `image_popup_translations.media_id`-ni əlavə edir. Nəticədə istifadədə olan şəkil silinmir. Qaytarılan cavab digər istinadlarla eynidir: `409 { message: "File is attached to content; detach it first." }`.
