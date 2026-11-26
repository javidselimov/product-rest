# Public API contract — `api-cbar` (spec 054)

İş spec-first gedir:
1. Əvvəl `api-cbar/openapi/paths/working-papers.yaml`, `components/schemas/working-papers.yaml` və `openapi.yaml`-dakı istinadlar yazılır.
2. PageNode sxemi `components/schemas/pages.yaml`-da yenilənir.
3. Redocly lint + bundle işlədilir.
4. Sonra controller yazılır: controller-only, EF projection → anonim DTO, `cbar_web_ro` rolu.

Mövcud endpoint-lər geriyə uyğun qalır, yalnız sahə əlavə olunur (Konstitusiya VII.3).

## `GET /api/v1/working-papers?locale=az|en`

Həmin dildə görünən bütün işçi məqalələri. Sıra: `year DESC, number DESC`.
- `locale` default `az`-dır, tanınmayan dəyər `az` olur.
- Cavab həmişə 200-dür, boş massiv xəta deyil.
- Səhifələmə və axtarış yoxdur (research R3).

```json
{
  "items": [
    {
      "id": 78,
      "number": 2,
      "year": 2025,
      "code": "02/2025",
      "key": "02-2025",
      "language": "en",
      "title": "Likvidlik şəraitindən asılı overnayt banklararası faiz dərəcəsinin dəyişkənliyi: əsas determinantlar və siyasət tövsiyələri",
      "authors": ["Elmir Muxtarov", "Əli Hacılı", "Aygün Qarayeva", "Vüqar Əhmədov"],
      "keywords": ["banklararası pul bazarında overnayt faizlər", "məcburi ehtiyatlar", "Markov rejim dəyişmə modeli", "likvidlik şəraiti"]
    }
  ]
}
```

- Görünürlük: `published`, `deleted_at IS NULL`, həmin dildə başlıq boş deyil.
- `language` dəyərləri: `az` | `en` | `other`. Saytda adı chrome etiketi ilə yazılır ("İngilis dili").
- Xülasə, JEL və fayl yoxdur, onlar detaldadır. Cavab kiçik qalır.

## `GET /api/v1/working-papers/{key}?locale=az|en`

`key` = `NN-YYYY` (`^\d{2}-\d{4}$`). Format səhvdirsə və ya məqalə həmin dildə görünmürsə cavab 404 olur (`problem+json`, mövcud controller-lər kimi).

```json
{
  "id": 78,
  "number": 2,
  "year": 2025,
  "code": "02/2025",
  "key": "02-2025",
  "language": "en",
  "title": "Likvidlik şəraitindən asılı overnayt …",
  "authors": ["Elmir Muxtarov", "Əli Hacılı", "Aygün Qarayeva", "Vüqar Əhmədov"],
  "abstract": "Effektiv pul siyasətinin həyata keçirilməsi üçün …",
  "keywords": ["məcburi ehtiyatlar", "likvidlik şəraiti"],
  "jelCodes": ["C22", "E53", "E58", "G21"],
  "file": { "mediaId": 2210, "originalName": "c404c319f12b7d12586dae457.pdf", "mimeType": "application/pdf", "sizeBytes": 2002780, "url": "/media/2210" }
}
```

- `abstract`: string və ya `null`.
- `file`: həmin dilin silinməmiş media faylıdır, yoxdursa `null`. Forması `AssetFile`-dır (`common.yaml`).
- `sizeBytes` bazadakı dəyərdir. Köhnə fayllarda o, `MediaSizeBackfillService`-dən (admin API) sonra düzgün olur.

## `GET /api/v1/pages/tree?locale=` — əlavə sahələr

`PageNode`-a iki sahə əlavə olunur (required, nullable):

```json
{ "id": 102, "title": "Ödəniş xidmətləri", "slug": "odenis-xidmetleri", "navUrl": null,
  "showInSideNav": false, "showInDropdownNav": true, "menuGroup": "Ödəniş sistemləri", "children": [] }
```

- `showInDropdownNav`: `page_nav_details` sətri və dəyəri varsa boolean, yoxsa `null`. `null` olanda sayt `showInSideNav`-ı izləyir.
- `menuGroup`: `page_translation_details.menu_group` həmin dildə. Boşdursa `null`.
- `showInSideNav` dəyişmir. Köhnə sayt versiyası yeni sahələri görməzdən gəlir (`.passthrough()`).

## Saytın istehlakı (web-cbar-new)

- `features/working-papers/api/working-papers.api.ts` (`server-only`):
  - `getWorkingPapers(locale)` → `cachedJson`;
  - `getWorkingPaper(key, locale)` → `cachedJsonOrNull`;
  - Zod sxemləri `model/schemas.ts`-dədir.
- `entities/page-node/model/schemas.ts`: `showInDropdownNav: z.boolean().nullable().optional()`, `menuGroup: z.string().nullable().optional()`.
  `optional` ona görədir ki, köhnə API versiyası da işləsin (sayt API-dən sonra deploy olunur, amma test API gecikə bilər).
- MSW:
  - handler `shared/testing/handlers/working-papers.ts`;
  - fikstür `shared/testing/fixtures/working-papers.ts`: 25 məqalə 2013–2026, biri yalnız az, biri açar sözsüz və JEL-siz, biri faylsız;
  - `pages` fikstürünə yeni bölmə ağacı əlavə olunur.
