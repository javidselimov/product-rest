# Ölçmə və yoxlama nəticələri — spec 018

Hər yoxlama task-ı nəticəsini bura yazır (Konstitusiya VIII.1).

## T001 — məhdudiyyət adları (`test` bazası)

⏳ Edilməyib — `test` bazasına çıxışı olan şəxs [quickstart.md §0](./quickstart.md) SQL-ini işlətməlidir.

## T002 — baseline (köhnə versiya, `1de2eb2`)

⏳ Edilməyib — yeni versiya `test`-ə push edilməzdən **əvvəl** [quickstart.md §1](./quickstart.md).

## Statik yoxlamalar (2026-10-06, lokal, build-siz)

| Yoxlama | Nəticə |
|---|---|
| `openapi`: `npm run lint` | ✅ valid (2 problem əvvəlcədən ignore-dadır) |
| `openapi`: `npm run bundle` | ✅ `dist/openapi.yaml`, `dist/openapi.json` |
| Bundle-da `application/json` gövdəli 4xx/5xx | ✅ 0 |
| `route-diff.mjs api-cbar-admin` | ✅ "no differences" (kod 162 / spec 163 əməliyyat — fərq əvvəlki, route dəyişməyib) |
| `grep "new { message" Controllers` | ✅ 0 |
| `grep ": ControllerBase" Controllers` (Cbar-sız) | ✅ 0; 32 sinif `CbarControllerBase`-dən törəyir |
| Əvəzlənən çağırışlar | 94 `BadRequestProblem`, 20 `ConflictProblem`, 3 `NotFoundProblem`, 5 `ErrorProblem` = 122 (+ media 415) |

`dotnet build` lokalda mümkün deyil (.NET SDK yoxdur) — GitLab pipeline-ında yoxlanılacaq.

## T033 — panel dəyişmədən

- `product-rest/web-cbar-admin-new`, heç bir dəyişiklik olmadan `npm run verify` (Node 24.13.0):
  lint ✅, tsc ✅, **54 test faylı / 455 test ✅**, build ✅. Node 22 bu maşında yoxdur — CI (node:22) yoxlayacaq.
- `src/shared/api/types.ts` `normalizeApiError` kodu oxunaraq yeni gövdələrə qarşı yoxlanılıb:
  - 401/403/500, `title` və `message` yoxdur → `message = i18n(errors.*)` — bu günkü kimi ✅
  - biznes 400/409 (`message` + `detail`) → `message` göstərilir, mətn eyni ✅
  - 409 `errors.Username` → `fieldErrors.username`; istifadəçi forması sahənin altında göstərir (yaxşılaşma) ✅
  - refresh 401 `code: refresh_stale` → `AppError.code = 'refresh_stale'`, `auth-bridge.ts:69` təkrar edir ✅
  - binding 400 (`ValidationProblemDetails`) — dəyişməyib ✅

## Deploy-dan sonra (T018–T021, T032, T034, T039)

⏳ GitLab `test`-ə push-dan sonra.
