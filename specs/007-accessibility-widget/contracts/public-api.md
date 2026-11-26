# Contract: `api-cbar` → `web-cbar-new`

## `GET /api/v1/site-settings/accessibility-widget`

Anonimdir, ümumi `public` rate-limit siyasətinə tabedir. Parametr yoxdur, dildən asılı deyil.

**200 OK** (həmişə, ayar olmasa da):

```json
{ "enabled": true }
```

| Sahə | Tip | Qayda |
| --- | --- | --- |
| `enabled` | `boolean` | Yalnız `settings.key = 'accessibility.widget'` sətri varsa və `value.enabled` JSON `true`-dursa `true`. Qalan bütün hallarda `false`. |

- Cavabda başqa sahə yoxdur. `updatedBy` və `updatedAt` ictimai tərəfə çıxmır.
- 404 qaytarılmır. Endpoint deploy olunmayıbsa, `web-cbar-new` 404-ü xəta sayır və `.catch` ilə `false`-a düşür.
- Başqa ayar açarlarını oxuyan public endpoint **əlavə olunmur** (spec FR-005).

**Frontend sxemi (`web-cbar-new`)**: `z.object({ enabled: z.boolean() })`. Uyğunsuz cavab `AppError`-dur, layout-da `false`-a düşür.

**MSW handler**: `shared/testing/handlers/` altında, fixture standart olaraq `{ enabled: true }`. Testlər `server.use(...)` ilə `false`, 500 və 404 hallarını yoxlayır.
