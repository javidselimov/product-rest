---
name: api-endpoint
description: >-
  api-cbar və ya api-cbar-admin-də endpoint əlavə etmək, dəyişmək və ya silmək üçün
  spec-first iş axını: əvvəl product-rest/<api>/openapi/ spec-i yazılır, lint + bundle
  olunur, istifadəçi təsdiqləyir, yalnız sonra controller kodu yazılır və route-diff ilə
  yoxlanılır. Use when the user asks to add/change/remove an API endpoint, route, request
  body, response shape or status code in api-cbar or api-cbar-admin.
---

# /api-endpoint <api-cbar|api-cbar-admin> <nə dəyişir>

Məqsəd: endpoint dəyişikliyi **spec-dən başlayır**. Kod spec-ə uyğun yazılır, əksinə yox.

`.claude/hooks/spec-first.mjs` (PreToolUse hook) bunu məcburi edir: controller-ə yeni route
əlavə edən və ya route silən Edit/Write, bundle olunmuş spec (`openapi/dist/openapi.json`) həmin
dəyişikliyi hələ əks etdirmirsə, **rədd edilir**. Route dəyişməyən redaktələr keçir, amma
cavab formasının spec-də yenilənməsi xatırladılır — onu hook yoxlaya bilmir, bu skill yoxlayır.

| API | Spec | Controller-lər |
|---|---|---|
| `api-cbar` | `product-rest/api-cbar/openapi/` | `src/Cbar.WebApi/Controllers/*` |
| `api-cbar-admin` | `product-rest/api-cbar-admin/openapi/` | `src/Cbar.AdminApi/Controllers/*` |

## Qəti qaydalar

- **Sıra dəyişmir:** spec → lint/bundle → istifadəçi təsdiqi → kod → yoxlama. Hook rədd edirsə,
  onu keçməyə çalışma (Bash ilə fayl yazmaq, route-u başqa formada yazmaq) — spec-i düzəlt.
- Spec konvensiyaları hər API-nin `openapi/README.md`-sindədir — **əvvəl onu oxu**. Yeni əməliyyat
  qonşu resursların əməliyyatlarına bənzəməlidir (operationId, cavab kodu cədvəli, nullability,
  translations map, siyahı forması, public API-də 429).
- Spec mətnləri ingiliscə; istifadəçiyə hesabat Azərbaycan dilində.
- **Commit edilmir.** Spec və kod iki ayrı API reposundadırsa (məs. `Cbar.Domain` hər ikisində),
  deploy sırası CLAUDE.md-dəki kimidir: əvvəl `api-cbar-admin`.
- Bu maşında .NET SDK yoxdur — `dotnet build` işlətmək mümkün deyil; hesabatda bunu qeyd et.

## Addım 1 — dəyişikliyi müəyyənləşdir

İstifadəçidən (və ya tapşırıqdan) aydınlaşdır:
- `METHOD path` siyahısı (əlavə / dəyişən / silinən);
- request body sahələri, query/path parametrləri, cavab forması, status kodları, auth;
- hansı controller-ə düşür (mövcud və ya yeni) və spec-də hansı `paths/<resurs>.yaml`-a.

Aid controller-i, `openapi.yaml`-dakı `paths:` xəritəsini və qonşu əməliyyatların YAML-ını oxu.
DB dəyişikliyi lazımdırsa (yeni cədvəl/sütun) — migrasiya + hər iki `Cbar.Domain` nüsxəsi də
plana daxildir (CLAUDE.md → Migrations), amma əvvəl spec.

## Addım 2 — spec-i yaz

`product-rest/<api>/openapi/`-də:

1. `paths/<resurs>.yaml` — path item (path parametri path item səviyyəsində, ortaq
   `parameters.yaml` parametrləri), əməliyyat(lar): `tags`, `operationId`, `summary`, lazım olsa
   qısa `description`, parametrlər, `requestBody`, bütün cavab kodları.
2. `components/schemas/<resurs>.yaml` — cavab və request sxemləri.
3. `openapi.yaml` — `paths:` xəritəsinə `$ref`; yeni tag-dırsa `tags:`-a təsviri ilə.
4. Endpoint silinirsə: xəritədən, path faylından və artıq istinad olunmayan sxemlərdən sil
   (`$ref`-ləri Grep et).

## Addım 3 — lint + bundle

```bash
cd product-rest/<api>/openapi
[ -d node_modules ] || npm ci     # korporativ CA → NODE_EXTRA_CA_CERTS; lockfile dəyişməsin
npm run lint      # 0 error, 0 warning (və ya .redocly.lint-ignore.yaml-da səbəbli istisna)
npm run bundle
```

## Addım 4 — istifadəçi təsdiqi

İstifadəçiyə qısa göstər: əlavə/dəyişən/silinən `METHOD path`, request və cavab sxemləri (YAML
parçaları və ya xülasə), status kodları. **Təsdiq gözlə** — kodu bu mərhələdə yazma. Düzəliş
istənirsə Addım 2-yə qayıt.

## Addım 5 — controller-i yaz

Spec-ə uyğun: route atributları, DTO `record`-ları (sahə adları və nullability spec-dəki kimi),
proyeksiya (`Select(x => new { … })` sahələri cavab sxemi ilə eyni), hər status kodu üçün
`return` yolu. Mövcud controller-lərin üslubunu izlə (api-cbar: servis qatı yoxdur, public filtrlər —
`Published`, soft-delete, `ShowAz`/`ShowEn`, `PublishedAt` embargo; admin: `[Authorize]`,
`AuditService`, `SlugService`).

Hook route-u rədd edirsə — spec ilə kod arasında `METHOD path` uyğun gəlmir (route constraint,
prefiks, `[controller]` adı); spec-i yenidən yoxla, bundle et, təkrar cəhd et.

## Addım 6 — yoxlama və sync markeri

```bash
node .claude/skills/sync-openapi/scripts/route-diff.mjs <api>    # root-dan, 0 fərq olmalıdır
```

Sonra əl ilə tutuşdur: hər sahə spec ↔ proyeksiya/DTO, hər `return` ↔ spec-dəki cavab kodu.
Hamısı uyğundursa `openapi.yaml`-ın ilk sətrini yenilə:
`# Sync: <git rev-parse --short HEAD> · YYYY-MM-DD · inkremental + işçi ağac`.

`npm run drift` test API-yə qarşıdır — yeni endpoint deploy olunmayana qədər orada
`- in spec, not in API` görünəcək; bu gözləniləndir.

## Addım 7 — hesabat (istifadəçiyə)

Qısa, Azərbaycan dilində: dəyişən `METHOD path`-lar, toxunulan spec və kod faylları, `lint` /
`route-diff` nəticəsi, yoxlanmayanlar (.NET build, runtime), lazım olan deploy sırası,
dəyişikliklərin commit olunmadığı.
