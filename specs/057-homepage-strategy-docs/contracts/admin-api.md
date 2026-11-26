# Admin API kontraktı — `api-cbar-admin` (spec 057)

Baza: `/api/v1/homepage-strategy-docs`, JWT, `problem+json` xətaları (spec 018). Controller `HomepageStrategyDocsController :
CbarControllerBase`, `AuditService` ilə. Forma `FincertMembershipsController`-dir. OpenAPI: `api-cbar-admin/openapi/paths/homepage.yaml`
(`strategyDocs`, `strategyDoc`, `strategyDocsOrder`) + `components/schemas/homepage.yaml`.

| Metod və yol | İcazə | Uğur | Xəta |
|---|---|---|---|
| `GET /homepage-strategy-docs?page=&pageSize=&search=&status=` | `homepage_strategy_docs.read` | 200 səhifəli siyahı | 400 (`search` çox uzun) |
| `GET /homepage-strategy-docs/{id}` | `.read` | 200 detal | 404 |
| `POST /homepage-strategy-docs` | `.create` | 201 detal, `Location` | 400 |
| `PUT /homepage-strategy-docs/{id}` | `.update` | 200 detal | 400, 404 |
| `DELETE /homepage-strategy-docs/{id}` | `.delete` | 204 (soft delete) | 404 |
| `PUT /homepage-strategy-docs/order` | `.update` | 204 | 400 (tam permutasiya deyil) |

## Upsert body (`POST`, `PUT`)

```jsonc
{
  "status": "published",              // "published" | "draft"; "scheduled" → 400
  "pageId": 104,                      // int | null
  "translations": {
    "az": { "title": "…", "summary": null, "coverMediaId": 812, "url": null },
    "en": { "title": "…", "summary": "…", "coverMediaId": null, "url": "https://…" }
  }
}
```

- Başlığı boş olan dil saxlanılmır, mövcud sətri silinir.
- Sıra body-də deyil: yaratmada `max + 1` verilir, sonra `PUT …/order` ilə dəyişir.
- Yoxlamalar və `errors` açarları: `data-model.md` → "Validasiya".

## Siyahı cavabı

```jsonc
{
  "items": [
    {
      "id": 1,
      "sortOrder": 1,
      "status": "published",
      "title": "2024-2026-cı illərdə …",     // az, else en
      "pageId": 104,
      "pageTitle": "Maliyyə sektorunun inkişaf Strategiyası",   // az title of the linked page | null
      "urls": { "en": "https://…" },        // filled locales only
      "cover": { "mediaId": 812, "originalName": "…", "mimeType": "image/png", "sizeBytes": 48211 } ,  // az, else en | null
      "locales": ["az", "en"],
      "linkBroken": false,                   // no locale has a working link (public rule)
      "updatedAt": "2026-11-23T10:00:00Z"
    }
  ],
  "total": 3, "page": 1, "pageSize": 20
}
```

Sıra `sortOrder`, sonra `id`. `search` başlıqda `ILIKE` ilə axtarır (`LikePattern`). `status` filtri isteğe bağlıdır.

## Detal cavabı

```jsonc
{
  "id": 1, "sortOrder": 1, "status": "published", "pageId": 104,
  "page": { "id": 104, "title": "Maliyyə sektorunun inkişaf Strategiyası" },     // null without a page
  "createdAt": "…", "updatedAt": "…",
  "translations": {
    "az": {
      "title": "…", "summary": null, "url": null, "coverMediaId": 812,
      "cover": { "mediaId": 812, "originalName": "…", "mimeType": "image/png", "sizeBytes": 48211 }
    }
  }
}
```

`page.title` select-in siyahıdan kənar dəyərinin adıdır (`mediaNameKey: 'page.title'`, events nümunəsi). `translations.<dil>.cover.originalName`
media sahəsinin göstərdiyi addır.

## Sıra

`PUT /homepage-strategy-docs/order`, body `{ "ids": [3, 1, 2] }`. Silinməmiş bütün id-lər bir dəfə olmalıdır. Audit
`homepage.strategy_doc_reorder`, entity `homepage_strategy_doc`, id 0.

## Audit hadisələri

`homepage.strategy_doc_create`, `homepage.strategy_doc_update` (before/after), `homepage.strategy_doc_delete`, `homepage.strategy_doc_reorder`.
