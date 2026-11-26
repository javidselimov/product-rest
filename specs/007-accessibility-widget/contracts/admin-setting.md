# Contract: `web-cbar-admin-new` → `api-cbar-admin` (mövcud, dəyişmir)

Mövcud `SettingsController`-dən istifadə olunur. Bütün endpoint-lər JWT tələb edir (`[Authorize]`).

## Oxuma: `GET /api/v1/settings`

```json
{ "items": [ { "key": "accessibility.widget", "value": { "enabled": true }, "updatedAt": "2026-09-29T10:00:00Z" } ] }
```

Kart `items`-dən `key === 'accessibility.widget'` elementini tapır. Tapılmırsa, keçid deaktivdir.

## Yazma: `PUT /api/v1/settings/accessibility.widget`

Sorğu:

```json
{ "value": { "enabled": false } }
```

Cavab `200`, yuxarıdakı element formasında. Uğurdan sonra `settingsKeys.all` invalidasiya olunur.

| Kod | Kartın davranışı |
| --- | --- |
| 200 | `toast.success`, siyahı yenilənir |
| 400 / 5xx / şəbəkə | `toast.error`, keçid server vəziyyətində qalır (optimistik deyil) |
| 401 | mövcud axın: token yenilənir, alınmasa login-ə |

Audit: `settings.create` / `settings.update`, `before`/`after` dəyərləri ilə (`AuditService`).

**Frontend sxemi**: `accessibilityWidgetValueSchema = z.object({ enabled: z.boolean() })`. Bu sxem `settingItemSchema.value` (`z.unknown()`) üzərində `safeParse` ilə tətbiq olunur. Uğursuz olsa, keçid deaktiv sayılır (data-model cədvəli).
