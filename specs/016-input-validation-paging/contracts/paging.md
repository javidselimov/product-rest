# Contract: list endpoint-lərində səhifələmə (8a)

**Əhatə**: [data-model.md §1](../data-model.md)-dəki 13 `GET` endpoint-i. Route, query
parametrlərinin adı və cavab zərfi **dəyişmir**; dəyişən yalnız hədlərdir.

## Sorğu

| Parametr | Tip | Default | Bu gün | Bu spec-dən sonra |
|---|---|---|---|---|
| `page` | int32 | 1 | `< 1` → mənfi OFFSET, 500 | `< 1` → 1; `> 100000` → 100000 |
| `pageSize` | int32 | endpoint-ə xas (20 / 24 / 50) | hədsiz; `0` → boş səhifə | `< 1` → default; `> 100` → 100 |

Rəqəm olmayan və ya `int32`-ni aşan dəyər — **bugünkü kimi** 400 `ValidationProblemDetails`
(model binding).

## Cavab (200)

```json
{ "items": [ … ], "total": 500, "page": 1, "pageSize": 100 }
```

`page` və `pageSize` — **tətbiq olunan** dəyərlərdir, sorğudakı deyil.

| Sorğu | `page` | `pageSize` | `items` |
|---|---|---|---|
| `?pageSize=1000000` | 1 | 100 | ≤ 100 |
| `?page=0` | 1 | default | 1-ci səhifə |
| `?page=-1&pageSize=-5` | 1 | default | 1-ci səhifə |
| `?pageSize=0` | 1 | default | 1-ci səhifə |
| (parametrsiz) | 1 | default | bugünkü ilə eyni |
| `?page=999999` | 100000 | default | `[]`, `total` düzgün |

## OpenAPI dəyişikliyi (spec-first, FR-017)

- `components/parameters.yaml#/Page`: "Not clamped… 500" təsviri → "Values below 1 are treated
  as 1, above 100000 as 100000."; `maximum: 100000`.
- `components/parameters.yaml#/PageSize20` və endpoint-lərdəki öz `pageSize` tərifləri
  (24, 50): `maximum: 100`; təsvir "Values below 1 use the default, above 100 are capped at 100."
- `components/schemas/common.yaml#/PageMeta`: "echo the request as-is (no clamping…)" →
  "the values actually applied".
- `openapi.yaml` `info.x-known-issues`: ilk iki bənd (`page`, `pageSize`) silinir.
- Route dəyişmir — spec-first hook-u (`.claude/hooks/spec-first.mjs`) keçir.
