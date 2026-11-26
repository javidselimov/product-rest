# Contract: RBAC (1a) — `api-cbar-admin`

Spec-first (CLAUDE.md, `/api-endpoint`). Kod dəyişikliyindən **əvvəl** `openapi/` yenilənir,
`npm run lint` + `bundle` işlədilir. Yalnız bundan sonra controller-ə toxunulur, çünki
`.claude/hooks/spec-first.mjs` yeni route-u bundle-da tapmasa, redaktəni bloklayır.

## 1. Bütün qorunan endpoint-lər üçün ümumi semantika

| Vəziyyət | Status | Gövdə |
|---|---|---|
| Token yoxdur, etibarsızdır, ləğv olunub | 401 | Mövcud (spec 018/020), dəyişmir |
| Token etibarlıdır, icazə yoxdur | **403** | `application/problem+json`, `status: 403`, `traceId`. `title` və `message` **yoxdur** (`ProblemDetailsSetup`, panel öz mətnini göstərir) |
| Rolun bu action üçün icazəsi bağlanmayıb (R3) | 403 | Eyni |

Invariantlar:

- 403 alan sorğu heç bir verilənə toxunmur, çünki action icra olunmur. `audit_log`-a
  `authz.denied` yazılır.
- 403 ilə 401 heç vaxt qarışmır. Panel 401-də refresh edir, 403-də isə etmir.

**OpenAPI**: `components/responses.yaml#/Forbidden` artıq mövcuddur. Təsviri yenilənir:
"Authenticated, but the caller's role lacks the permission this operation requires. No data
was changed." Bütün qorunan əməliyyatlara `'403': $ref Forbidden` əlavə olunur. Hər
əməliyyata `x-permission: <kod>` vendor extension-ı yazılır, bu, matrisin spec-də görünməsi
üçündür. `openapi/README.md`-də konvensiya kimi qeyd olunur.

## 2. `GET /api/v1/me/permissions` (yeni)

Hər login olmuş istifadəçi üçündür. İcazə kodu yoxdur.

```json
200 { "role": "moderator", "permissions": ["banners.create", "banners.delete", "…"] }
```

- `permissions` əlifba sırası ilə gəlir və təkrar yoxdur. `admin` üçün tam kataloq qaytarılır
  (data-model §2).
- Naməlum və ya boş rol üçün cavab `{ "role": "<kod>", "permissions": [] }`-dir.
- Panel bu gün icazələri roldan hesablayır (`permissionsForRole`). Bu endpoint gələcək panel
  spec-i üçündür, bu spec onu çağırmağı tələb etmir.

## 3. `GET /api/v1/roles` (yeni) — `roles.read`

```json
200 [
  { "id": 1, "code": "admin", "name": "Administrator", "permissions": ["…tam kataloq…"] },
  { "id": 2, "code": "moderator", "name": "Moderator", "permissions": ["…"] },
  { "id": 3, "code": "meas_manager", "name": "MEAS Manager", "permissions": ["…"] }
]
```

Sıralama `id` üzrədir. `admin.permissions` kodda hesablanır (R2), digər rollar üçün siyahı
`role_permissions`-dan gəlir.

## 4. `GET /api/v1/audit-log` (yeni) — `audit.read`

Query parametrləri (hamısı ixtiyari):

| Parametr | Tip | Məna |
|---|---|---|
| `action` | string | Prefiks uyğunluğu: `authz.` → rədd edilmiş cəhdlər, `currency_rates.` → məzənnə tarixçəsi |
| `actorId` | int | |
| `entityType` | string | Dəqiq uyğunluq |
| `entityId` | long | |
| `from`, `to` | date-time | `created_at` aralığı, `[from, to)` |
| `page`, `pageSize` | int | Mövcud `PagingQuery` (spec 016), default 50 |

```json
200 { "items": [ { "id": 123, "action": "authz.denied", "actorId": 7, "actorUsername": "mod1",
                   "entityType": "settings", "entityId": 0,
                   "before": null, "after": { "permission": "settings.update", "method": "PUT", "path": "/api/v1/settings/x" },
                   "ip": "10.0.0.5", "userAgent": "…", "createdAt": "2026-10-10T08:00:00Z" } ],
      "total": 1, "page": 1, "pageSize": 50 }
```

Sıralama `created_at DESC`-dir. `before`/`after` JSON obyekti kimi qaytarılır.

## 5. Dəyişən mövcud endpoint-lər

| Endpoint | Dəyişiklik |
|---|---|
| Bütün qorunan endpoint-lər | `x-permission` + 403 cavabı (§1) |
| `DELETE /pages/{id}` | Alt ağac budağında `pages.delete_subtree` olmadan 403 qaytarılır, heç nə silinmir. Audit `after.ids` |
| `PUT /settings/{key}` | Açar bazada yoxdursa və `KnownSettings`-də deyilsə: **400** `message: "Unknown setting key '<key>'."`. Mövcud açarın yenilənməsi dəyişmir |
| `DELETE /settings/{key}` (**yeni**) — `settings.delete` | 204, yoxdursa 404 (`NotFoundProblem`). Audit `settings.delete` |
| `DELETE /media/{id}` | `media.delete`, və ya `media.delete_own` + `created_by == sub`. Başqa hallarda 403 |
| `PUT /currency-rates`, `DELETE /currency-rates` | 1a-da `currency_rates.prepare` tələb edir, semantika dəyişmir (hələ dərhal dərc olunur). 1b-də dəyişir ([currency-rate-requests.md](./currency-rate-requests.md)) |
| `/users/*` | `Roles = "admin"` əvəzinə `users.*`. Cavablar dəyişmir |

## 6. OpenAPI faylları

| Fayl | Dəyişiklik |
|---|---|
| `paths/auth.yaml` və ya yeni `paths/rbac.yaml` | `me/permissions`, `roles`, `audit-log` |
| `paths/settings.yaml` | `DELETE` + 400 təsviri |
| `paths/pages.yaml` | `DELETE` 403 təsviri |
| `components/responses.yaml` | `Forbidden` təsviri |
| `components/schemas/` | `MePermissions`, `RoleWithPermissions`, `AuditLogPage` |
| `openapi.yaml` | Yeni path-lər, `x-permission` konvensiyası `info.description`-da, `# Sync:` sətri |
