# Data Model: Admin API-nin OpenAPI sənədinin prod-da gizlədilməsi

**Verilənlər modeli dəyişmir.** Entity, `CbarDbContext`, sxem, migration və seed toxunulmur —
`Cbar.Domain`-in iki kopyası məsələsi yoxdur (Konstitusiya V.1).

Feature-in yeganə "modeli" mühit adından sənədin mövcudluğuna gedən qaydadır
(research R2):

| `ASPNETCORE_ENVIRONMENT` | Harada | `GET /openapi/v1.json` |
|---|---|---|
| `Development` | lokal (`launchSettings.json`) | **200**, generasiya olunmuş sənəd (bugünkü kimi) |
| `Staging` | dev, test (`.ci-cd/dev.yaml`, `test.yaml`) | **200**, generasiya olunmuş sənəd (bugünkü kimi) |
| `Production` | prod (`.ci-cd/prod.yaml`) | **404**, boş gövdə |
| təyin olunmayıb | platforma default-u = `Production` | **404** |
| istənilən başqa ad (`Test`, `Preprod`, …) | — | **404** |

Qayda müqayisəsi ASP.NET Core-un `IsDevelopment()`/`IsStaging()` semantikasına tabedir
(böyük-kiçik hərfə həssas deyil: `staging` = `Staging`).

Mühit adı tətbiq başlayanda bir dəfə oxunur; dəyişməsi üçün pod yenidən başlamalıdır — bu,
bugünkü `devSeedFile` qaydası ilə eynidir.
