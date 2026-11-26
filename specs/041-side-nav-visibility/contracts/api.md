# API kontraktı (spec 041)

Spec-first: aşağıdakı dəyişikliklər əvvəl `openapi/`-yə yazılır, lint + bundle olunur, sonra controller dəyişir. Yeni marşrut
yoxdur, yalnız sahə əlavə olunur. Ona görə `spec-first.mjs` hook-u controller redaktəsini bloklamır, sahəni əl ilə tutuşdurmaq
lazımdır.

## api-cbar — `GET /api/v1/pages/tree?locale={az|en}`

`openapi/components/schemas/pages.yaml` `PageNode`:

```yaml
PageNode:
  type: object
  required: [id, title, slug, navUrl, showInSideNav, children]
  properties:
    # … mövcud sahələr dəyişmir
    showInSideNav:
      type: boolean
      description: >-
        Shown in its section's left menu. When false, the page stays in the tree (top menu, footer,
        breadcrumb) and the site leaves it out of the left menu unless it, or a page under it, is open.
```

Nümunə:

```json
[{ "id": 7, "title": "Media", "slug": "media", "navUrl": null, "showInSideNav": true, "children": [
  { "id": 85, "title": "İnformasiya sorğusu", "slug": "informasiya-sorgusu", "navUrl": null,
    "showInSideNav": false, "children": [] }
]}]
```

Süzgəc (`Published`, `Active`, `Visible`, `ShowAz/ShowEn`, tərcümə) və kökə qaldırma qaydası dəyişmir. Dəyişiklik geriyə
uyğundur: sahə əlavə olunur, heç nə silinmir (konstitusiya VII.3).

## api-cbar-admin — səhifə bayraqları

`openapi/components/schemas/pages.yaml`:

- `PageFlags` (cavab: `GET /pages/tree`, `GET /pages/{id}`, `POST`/`PUT` cavabı): `required`-ə və `properties`-ə
  `showInSideNav: boolean` əlavə olunur. Təsvir: "Shown in its section's left menu on the public site (spec 041)."
- `PageFlagsInput` (`POST /pages`, `PUT /pages/{id}` → `flags`):

```yaml
    showInSideNav:
      type: [boolean, 'null']
      description: >-
        Shown in its section's left menu. Unlike the other fields, omitting it (or sending null)
        keeps the stored value on update and means true on create, so a client that does not know
        the field cannot reset it.
```

`PageFlagsInput` ümumi təsvirinə bir cümlə əlavə olunur: "`showInSideNav` is the exception, see the field."

Xəta halları yeni deyil: `flags.showInSideNav` boolean deyilsə ASP.NET model binding mövcud 400 `problem+json`-u qaytarır.

## Uyğunluq matrisi

Bax `research.md` R9.
