# Public API contract — `api-cbar` (spec 053)

Spec-first: `api-cbar/openapi/paths/fincert.yaml` + `openapi.yaml`-da istinad əvvəl yazılır (Redocly lint + bundle), sonra `FincertController`
(controller-only, EF projection → anonim DTO, `cbar_web_ro`). Mövcud endpoint-lər dəyişmir.

## `GET /api/v1/fincert?locale=az|en`

FinCERT səhifəsinin bütün məzmunu bir cavabda. `locale` default `az`, tanınmayan dəyər → `az` (mövcud controller-lər kimi). Cavab həmişə 200-dür
(boş FinCERT xəta deyil); keş yoxdur.

```json
{
  "mission": "Azərbaycan Respublikasının Mərkəzi Bankı tərəfindən yaradılmış … gücləndirməkdir.",
  "email": "fincert@cbar.az",
  "phone": "(+994 12) 437 00 97",
  "portal": {
    "title": "Vahid Elektron Hesabatlılıq Portalı",
    "description": "Yüksək kateqoriyalı insidentlər üzrə hesabatlar …",
    "url": "https://portal.e-cbar.az/"
  },
  "rfc": { "file": { "url": "/media/1234", "mimeType": "application/pdf", "sizeBytes": 183422 }, "url": null },
  "directions": [
    { "id": 1, "title": "İnsidentlər barədə məlumatların əldə olunması və paylaşılması", "body": "<p>FinCERT …</p><ul><li>…</li></ul>" }
  ],
  "memberships": [
    {
      "id": 1,
      "name": "Forum for Incident Response and Security Teams",
      "description": "İnsidentlərlə Mübarizə və Təhlükəsizlik Mərkəzlərinin Beynəlxalq Forumu",
      "badge": "2026-cı ildən tam hüquqlu üzv",
      "url": "https://www.first.org/",
      "logo": "/media/1301"
    }
  ]
}
```

- `mission`, `email`, `phone` — string və ya `null` (boş sətir `null` qaytarılır).
- `portal` — `url` və həmin dildə `title` doludursa obyekt, yoxsa `null`. `description` `null` ola bilər.
- `rfc` — həmin dildə silinməmiş media faylı (`file`) və/və ya xarici link (`url`) varsa obyekt, ikisi də yoxdursa `null`. Sayt `file`-ı üstün tutur.
- `directions`, `memberships` — görünürlük və sıra qaydaları `data-model.md`; boş massiv mümkündür. `body` HTML-dir, server-side sanitizer yoxdur
  (`PagesController` kimi), sayt `prepareCmsHtml` ilə hazırlayır.
- `logo` — `/media/{id}` (IFI `Logo` kimi) və ya `null`.
- `fincert_settings` sətri yoxdursa skalyar sahələr `null`, siyahılar yenə qaytarılır.

## Saytın istehlakı (web-cbar-new)

- `features/fincert/api/fincert.api.ts` (`server-only`): `getFincert(locale)`; Zod sxemi `features/fincert/model/schemas.ts`.
- MSW handler `shared/testing/handlers/fincert.ts`, fikstür `shared/testing/fixtures/fincert.ts` (seed-dən: 4 istiqamət, RFC xarici link, FIRST loqosuz;
  ikinci fikstür: yalnız bir neçə bölmə dolu; üçüncü: hamısı boş).
