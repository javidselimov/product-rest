# Contract: `PUT /api/v1/users/{id}` — son admin halı

Route, sorğu gövdəsi (`UserUpdate`: `email`, `roleId`, `isActive`) və uğurlu cavab (`200 UserDetail`)
**dəyişmir**. Mənbə: `product-rest/api-cbar-admin/openapi/paths/users.yaml` (`updateUser`).

## Yeni hal

Hədəf hazırda aktiv admindirsə, sorğu onu aktiv admin statusundan çıxarırsa
(`isActive: false` və/və ya admin olmayan `roleId`) və başqa aktiv, silinməmiş admin yoxdursa:

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{ "message": "Cannot deactivate or demote the last active administrator." }
```

- Forma `components/schemas/common.yaml#/ErrorMessage` — `409` artıq `updateUser`-in cavab
  siyahısındadır (`responses.yaml#/Conflict`); yalnız `description` yenilənir.
- Yan təsir yoxdur: istifadəçi dəyişmir, audit qeydi yazılmır, refresh token-lər ləğv olunmur.
- Mövcud cavablar və sıra dəyişmir: 400 → 404 → 409 (email) → 409 (son admin).

## `updateUser.description` yeni mətni

```yaml
      The username cannot be changed. The body is validated (400) before the user is
      looked up (404). Deactivating a user revokes their refresh tokens (an access token
      already issued stays valid until it expires); a role change takes effect at their
      next refresh. Refused (409) if it would leave no active admin: the last active admin
      cannot be deactivated or demoted. Reactivating a user (`isActive` false → true) clears
      their login lock and failed-attempt count.
```

## `DELETE /api/v1/users/{id}` — dəyişmir

`409` özünü silmə və son aktiv admin üçün, mesajlar eyni ("You cannot delete your own account.",
"Cannot delete the last active administrator.").
