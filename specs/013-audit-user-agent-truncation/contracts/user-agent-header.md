# Contract: `User-Agent` başlığı və audit olunan endpoint-lər

**HTTP kontraktı dəyişmir** (FR-006): route, sorğu gövdəsi, cavab forması eynidir;
`openapi/` yenilənmir, `/sync-openapi` lazım deyil, spec-first hook route dəyişmədiyi üçün keçir.

Dəyişən yeganə şey — `User-Agent` başlığının uzunluğundan asılı **status kodu invariantıdır**.

## Əhatə

`api-cbar-admin`-də `AuditService.Log` çağıran hər endpoint (27 controller), xüsusilə:

- `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/refresh`
- bütün audit olunan `POST` / `PUT` / `PATCH` / `DELETE` endpoint-ləri

## İnvariant

| `User-Agent` uzunluğu | Bu gün | Bu feature-dən sonra |
|---|---|---|
| yoxdur / boş | adi cavab | adi cavab (dəyişmir) |
| 1–500 simvol | adi cavab | adi cavab (dəyişmir) |
| 501 simvol – ingress limiti | **500 Internal Server Error**, dəyişiklik saxlanmır | adi cavab, eyni status və gövdə ilə |
| ingress limitindən uzun (~8 KB) | ingress 400, tətbiqə çatmır | eyni (əhatədən kənar, research R6) |

"Adi cavab" = eyni sorğunun qısa `User-Agent` ilə aldığı status kodu və gövdə.

## Saxlanan dəyər (daxili, klientə qaytarılmır)

`audit_log.user_agent` və `admin_refresh_tokens.user_agent` — [data-model.md](../data-model.md)-dəki
kəsmə qaydası. Eyni sorğu üçün iki dəyər eynidir (FR-003).
