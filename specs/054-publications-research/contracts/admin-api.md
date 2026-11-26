# Admin API contract — `api-cbar-admin` (spec 054)

İş spec-first gedir: əvvəl `api-cbar-admin/openapi/paths/working-papers.yaml`, `components/schemas/working-papers.yaml` və `pages.yaml` dəyişikliyi yazılır, lint +
bundle edilir, sonra controller.

Ümumi qaydalar:
- Hamısı JWT ilə qorunur və `[RequirePermission]` tələb edir.
- Hər yazma `AuditService.Log` çağırır.
- Xətalar `problem+json`-dur (`BadRequestProblem` / `ConflictProblem` / `NotFoundProblem`).
- Unikal açar pozuntusunu `DbExceptionHandler` 409-a çevirir, `try/catch` yoxdur.

## `/api/v1/working-papers` (`WorkingPapersController`)

| Metod | Yol | İcazə | Qeyd |
|---|---|---|---|
| GET | `/api/v1/working-papers?page=&pageSize=&year=&status=&search=` | `working_papers.read` | `{ items, total, page, pageSize }`, `paging.Resolve(20)`, sıra `year DESC, number DESC`; `search` başlıqda (hər iki dil) `ILIKE` (mövcud `Search` parametri) |
| GET | `/api/v1/working-papers/{id}` | `working_papers.read` | detal, hər iki dil |
| POST | `/api/v1/working-papers` | `working_papers.create` | 201 + detal; audit `working_papers.create` |
| PUT | `/api/v1/working-papers/{id}` | `working_papers.update` | detal; audit `working_papers.update` (before/after) |
| DELETE | `/api/v1/working-papers/{id}` | `working_papers.delete` | soft-delete, 204; audit `working_papers.delete` |

Siyahı sətri:

```json
{ "id": 78, "number": 2, "year": 2025, "code": "02/2025", "title": "Likvidlik şəraitindən …", "status": "published",
  "locales": ["az", "en"], "updatedAt": "2026-11-20T10:00:00Z" }
```

`title` az başlığıdır, yoxdursa en. `locales` başlığı dolu olan dillərdir.

Detal və input (POST/PUT body):

```json
{
  "number": 2,
  "year": 2025,
  "paperLanguage": "en",
  "jelCodes": ["C22", "E53", "E58", "G21"],
  "legacyPageId": 895,
  "status": "published",
  "translations": {
    "az": { "title": "…", "authors": ["Elmir Muxtarov", "Əli Hacılı"], "abstract": "…",
            "keywords": ["məcburi ehtiyatlar"], "mediaId": 2210 },
    "en": { "title": "…", "authors": ["Elmir Mukhtarov", "Ali Hajili"], "abstract": "…",
            "keywords": ["reserve requirements"], "mediaId": 2211 }
  }
}
```

Tərcümələr layihənin konvensiyası ilə dil açarlı obyektdir (`PageUpsert`, `MonthlyReportUpsert` kimi). Detalda bunlar da var: `id`, `code`, `createdAt`, `updatedAt` və hər tərcümədə `media: { id, originalName, mimeType, sizeBytes } | null`.

Yoxlamalar `errors` obyektinə sahə adı ilə yazılır, panel onları sahənin altında göstərir:

| Sahə | Qayda | Status |
|---|---|---|
| `number` | 1–99 | 400 |
| `year` | 1990 – cari il + 1 | 400 |
| `number`+`year` | silinməmiş məqalələr arasında unikal | 409 (`DbExceptionHandler`) |
| `paperLanguage` | `az` / `en` / `other` | 400 |
| `jelCodes[i]` | `^[A-Z][0-9]{1,2}$` (böyük hərfə çevrilib yoxlanılır) | 400 |
| `translations` | ən azı bir dildə `title` | 400 |
| `translations.<locale>.authors` | `title` doludursa ən azı bir müəllif | 400 |
| `translations.<locale>.mediaId` | mövcud, silinməmiş, sənəd mime-ı (`MediaRules.DocumentMimeTypes`, research R16) | 400 |
| `legacyPageId` | müsbət tam ədəd və ya `null`; unikal | 400 / 409 |

Siyahılar serverdə trim edilir, boş element və təkrar silinir. Göndərilməyən dilin tərcüməsi silinir (mövcud `translations` qaydası).

## `/api/v1/pages` — əlavə sahələr

- `flags`-a `showInDropdownNav: boolean | null` əlavə olunur (`showInSideNav` ilə eyni qayda). Göndərilməyən və ya `null` olan dəyər update-də saxlanılan dəyəri
  saxlayır, create-də "sol menyunu izlə" deməkdir. Panelin radio-su həmişə iki boolean göndərir, ona görə "izlə" vəziyyəti yalnız heç vaxt seçilməmiş
  səhifələrdə qalır. `page_nav_details` sətri yalnız dəyər effektiv sol menyu dəyərindən fərqlidirsə və ya sətir artıq varsa yazılır.
- `PageTranslationDto`-ya `menuGroup: string | null` əlavə olunur, `navUrl` qaydası ilə: göndərilməyən və ya `null` saxlanılan dəyəri saxlayır, `""` silir. Trim
  edilir, maksimum 120 simvoldur.
- Detal DTO hər iki sahəni qaytarır. Audit before/after onları daxil edir.

## Media ölçüsü

Yeni endpoint yoxdur.
- `MediaSizeBackfillService` (hosted) `MigrationRunner`-dən sonra başlayır və `pg_try_advisory_lock` ilə yalnız bir instansda işləyir. Gedişatı loglayır:
  partiya, düzəldilən say, tapılmayan obyekt.
- `MediaStorage.UploadAsync` yeni media sətri ilə birlikdə `media_asset_details` sətrini yazır.
