# Contract: `POST /api/v1/auth/login` — dəyişməz kontrakt + vaxt invariantı

Mənbə spec: `product-rest/api-cbar-admin/openapi/paths/auth.yaml#/login`. Bu feature
**OpenAPI spec-də heç nəyi dəyişmir** — route, `security: []`, `LoginRequest`, `LoginResponse`,
`400`, `401` cavabları eyni qalır. `/sync-openapi` və `openapi/` bundle yenilənməsi lazım deyil.

## Dəyişməyən davranış (FR-003, FR-005, FR-006)

| Sorğu | Status | Gövdə |
|---|---|---|
| Ad yoxdur / deaktiv / silinib / parol səhv | `401` | `{"message":"Invalid credentials."}` |
| Parol doğru, hesab kilidli | `401` | `{"message":"Account temporarily locked."}` *(oracle — #2 həll edəcək)* |
| Parol doğru | `200` | `{"accessToken":"…","expiresAt":"…"}` + `Set-Cookie: cbar_admin_rt=…` |
| Gövdə validasiyadan keçmir | `400` | ValidationFailed (dəyişmir) |

Uğursuz cəhdin server logu bugünkü kimi qalır: `Login failure for {Username} from {Ip}` (Warning).

## Yeni invariant (FR-001, FR-002)

> İlk dörd uğursuz halın hər biri üçün server **eyni miqdarda bcrypt işi** görür (bir `Verify`,
> iş faktoru 12). Nəticədə "ad yoxdur / deaktiv / silinib" və "ad var + parol səhv" qruplarının
> median cavab vaxtı fərqi < 25 ms olur (SC-001, SC-002).

Bu invariant OpenAPI-də ifadə olunmur (vaxt sxemin hissəsi deyil); onu
[quickstart.md](../quickstart.md)-dəki ölçüm yoxlayır. İstəyə görə `auth.yaml`-dakı `login`
təsvirinə bir cümlə əlavə etmək olar ("Failure responses take the same time whether or not the
username exists"), amma bu, spec-first hook-unu tetikləmir və məcburi deyil.
