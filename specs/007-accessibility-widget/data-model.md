# Data Model: Müyəssərlik menyusu

Yeni cədvəl, sütun və ya migration **yoxdur**. `Cbar.Domain` hər iki kopyada dəyişmir.

## `settings` cədvəlində bir sətir (mövcud cədvəl, `0001-initial-schema.sql:743`)

| Sütun | Dəyər | Qeyd |
| --- | --- | --- |
| `key` | `accessibility.widget` | PK. Sabit, kodda bir yerdə təyin olunur (admin + api-cbar). |
| `value` | `{"enabled": true}` və ya `{"enabled": false}` | `jsonb`. Obyekt saxlanılır ki, gələcəkdə sahə əlavə etmək formanı sındırmasın. |
| `updated_by` | admin istifadəçisinin id-si | `SettingsController` JWT `sub`-dan yazır. |
| `updated_at` | yazma vaxtı | Trigger və ya default ilə. Admin kartında göstərilir. |

### Validasiya və şərh qaydaları

| Hal | Admin kartı | Public API | Sayt |
| --- | --- | --- | --- |
| Sətir yoxdur | keçid **deaktiv** | `{ "enabled": false }` | teq yoxdur |
| `value.enabled === true` | aktiv | `{ "enabled": true }` | teq var |
| `value.enabled === false` | deaktiv | `false` | teq yoxdur |
| `value` başqa formadadır (ümumi JSON redaktoru ilə yazılıb) | deaktiv göstərilir, keçid onu düzgün formaya yazır | `false` | teq yoxdur |
| Public API xətası və ya 404 (deploy sırası) | — | — | deaktiv (`.catch`) |

### Vəziyyət keçidləri

```
(yoxdur) ──PUT {enabled:true}──▶ aktiv ──PUT {enabled:false}──▶ deaktiv
                                  ▲                                │
                                  └────────PUT {enabled:true}──────┘
```

Hər keçid `audit_log`-a `settings.create` (ilk dəfə) və ya `settings.update` kimi düşür. `before`/`after` JSON-u açarı və dəyəri saxlayır.

## Ziyarətçi tərəfi (sistemin idarə etmədiyi data)

| Ad | Yer | Məzmun | Ömür |
| --- | --- | --- | --- |
| `accw` | cookie, `path=/` | widget-in görünüş seçimləri (JSON) | brauzer sessiyası (research R9) |

Server bu cookie-ni oxumur və yazmır.
