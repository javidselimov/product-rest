# api-cbar OpenAPI kontraktı

`api-cbar`-ın (public, read-only API) əl ilə saxlanılan OpenAPI 3.1 spec-i.

## Niyə əl ilə?

`Program.cs`-də `AddOpenApi()` + `MapOpenApi()` var və `/openapi/v1.json` işləyir, amma
controller-lər anonim tip qaytarır (`IActionResult` + `new { … }`). Ona görə generasiya
olunan sənəddə **cavab sxemi yoxdur** — frontend onunla heç nə edə bilmir. Bu spec
həmin boşluğu doldurur; runtime sənəd isə yalnız path siyahısının mənbəyi kimi
istifadə olunur (`npm run drift`).

Spec **mövcud davranışı** təsvir edir, arzu olunanı yox. Uyğunsuzluqlar (məsələn,
bir endpoint-in 404-ü ProblemDetails əvəzinə `{message}` qaytarır) `x-known-issues`
ilə qeyd olunur; düzəliş API-də ayrıca MR-dır, sonra spec yenilənir.

## Struktur

```
openapi.yaml                 info, servers, tags, path → fayl xəritəsi
paths/<resurs>.yaml          əməliyyatlar (bir faylda bir neçə path, açarla)
components/parameters.yaml   locale, page, pageSize, slug, id
components/responses.yaml    NotFound, BadRequest, TooManyRequests
components/schemas/*.yaml    common (ProblemDetails, PageMeta, AssetFile…) + hər resurs
scripts/contract-check.mjs   işləyən API-yə qarşı cavab yoxlaması
scripts/drift-check.mjs      spec ↔ runtime /openapi/v1.json path fərqi
GAP-product-host.md          köhnə saytın (product-host) funksiyaları ↔ bu API
```

## Əmrlər

```bash
npm ci
npm run lint        # Redocly (recommended + operationId/summary/4xx/tag məcburi)
npm run bundle      # dist/openapi.yaml + dist/openapi.json (tək fayl, frontend üçün)
npm run preview     # brauzerdə sənəd
npm run contract    # test API-yə real sorğular + ajv sxem yoxlaması
npm run drift       # spec-də olmayan / API-dən silinmiş endpoint-lər
```

`contract` və `drift` default olaraq `https://api-cbar-test.cbar.az`-a gedir; başqa
mühit üçün `API_URL=http://localhost:5139 npm run contract`.

> Korporativ şəbəkədə `npm ci` `SELF_SIGNED_CERT_IN_CHAIN` ilə düşürsə, npm sizin
> `~/.npmrc`-ni oxumur (məs. IDE-nin daxili npm-i) — `NPM_CONFIG_USERCONFIG=~/.npmrc npm ci`.

## Endpoint dəyişəndə

1. Controller-i dəyiş.
2. Uyğun `paths/*.yaml` və `components/schemas/*.yaml`-ı yenilə. Nullability-ni
   entity-dən yox, **proyeksiyadan** götür: `.FirstOrDefault()` ilə gələn tərcümə sahəsi
   sorğuda `Translations.Any(locale)` filtri yoxdursa null ola bilər.
3. `npm run lint`.
4. Dəyişiklik test-ə deploy olunandan sonra `npm run contract && npm run drift`.

## Konvensiyalar

- `operationId`: camelCase, `list*` (kolleksiya), `get*` (tək obyekt), `get*BySlug`.
- Tag = controller-in məntiqi qrupu; hər tag-ın təsviri var.
- Nullable: `type: [string, 'null']` (3.1), `$ref` üçün `anyOf: [$ref, {type: 'null'}]`.
- Media sahələri `MediaUrl` / `NullableMediaUrl` (`/media/{id}`, API-nin öz origin-i).
- Hər əməliyyatda `429` (rate limit); tək obyektdə `404` (ProblemDetails); tipli query
  parametri olanda `400` (ValidationProblemDetails).
