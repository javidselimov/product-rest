# Data Model: RBAC (1a) və məzənnə four-eyes (1b)

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

## 1. Mövcud cədvəllər (1a-da sxem dəyişmir)

`0001-initial-schema.sql:30-46`:

| Cədvəl | Sütunlar | Qeyd |
|---|---|---|
| `roles` | `id smallserial`, `code varchar(50) UNIQUE`, `name` | `admin`, `moderator`, `meas_manager` (`db/seed.sql`, yalnız Development) |
| `permissions` | `id serial`, `code varchar(100) UNIQUE`, `description varchar(255)` | Bu gün boşdur. 1a seed edir |
| `role_permissions` | `role_id → roles ON DELETE CASCADE`, `permission_id → permissions ON DELETE CASCADE`, PK `(role_id, permission_id)` | Bu gün boşdur. 1a seed edir |

EF modeli artıq var: `Role.Permissions` ↔ `Permission.Roles`, `UsingEntity("role_permissions")`.
1a-da `Cbar.Domain` dəyişmir.

**Migration `0009-rbac-permissions.sql`** (1a, append-only, `BEGIN/COMMIT` yoxdur):

1. `DO $$` blokunda `has_table_privilege(current_user, 'permissions', 'INSERT')` və eyni
   yoxlama `role_permissions` üçün aparılır. Hüquq yoxdursa, `RAISE WARNING` verilir və
   `RETURN` edilir (research R12).
2. `INSERT INTO permissions (code, description) VALUES … ON CONFLICT (code) DO NOTHING` — §2
   kataloqu.
3. `INSERT INTO role_permissions SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code = ANY(<siyahı>) WHERE r.code = '<rol>' ON CONFLICT DO NOTHING`.
   Bu, `moderator` və `meas_manager` üçün edilir. `admin` üçün sətir yazılmır (R2).

Yeni icazə əlavə edən gələcək migration eyni formada yazılır, **admin addımı olmur**.

## 2. İcazə kataloqu (`Authorization/Permissions.cs` ↔ `permissions`)

Format: `<modul>.<əməliyyat>`. Alt resurslar (asset-lər, şəkillər, `move`, `images/order`)
ana modulun `update` icazəsinə bağlanır, `GET`-lər isə `read` icazəsinə.

| Modul | Kodlar | Controller(lər) / route |
|---|---|---|
| `pages` | `read` `create` `update` `delete` **`delete_subtree`** | `PagesController` (`move`, `assets/*` → `update`) |
| `press_releases` | `read` `create` `update` `delete` | `PressReleasesController` (`assets/*` → `update`) |
| `banners` | `read` `create` `update` `delete` | `BannersController` |
| `galleries` | `read` `create` `update` `delete` | `GalleriesController` (`images/*` → `update`) |
| `homepage_links` | `read` `create` `update` `delete` | `HomepageLinksController` |
| `homepage_publications` | `read` `create` `update` `delete` | `HomepagePublicationsController` |
| `image_popups` | `read` `create` `update` `delete` | `ImagePopupsController` (spec 009 R13) |
| `info_lines` | `read` `create` `update` `delete` | `InfoLinesController` |
| `running_lines` | `read` `create` `update` `delete` | `RunningLinesController` |
| `news_slider` | `read` `create` `update` `delete` | `NewsSliderController` |
| `videos` | `read` `create` `update` `delete` | `VideosController` |
| `video_streams` | `read` `create` `update` `delete` | `VideoStreamsController` |
| `laws` | `read` `create` `update` `delete` | `LawsController` (`assets/*` → `update`) |
| `law_categories` | `read` `create` `update` `delete` | `LawCategoriesController` |
| `money_marks` | `read` `create` `update` `delete` | `MoneyMarksController.cs`-in 3 sinfi (kateqoriyalar, nişanlar, xəbərlər) |
| `organization` | `read` `create` `update` `delete` | `OrganizationController.cs`-in 3 sinfi (şöbələr, ofislər, əməkdaşlar) |
| `azir` | `read` `create` `delete` | `AzirController` (update endpoint-i yoxdur) |
| `inflation` | `read` `create` `update` `delete` | `InflationController` (`PUT settings` → `update`) |
| `yield_curves` | `read` `create` `update` `delete` | `YieldCurvesController` |
| `currencies` | `read` `update` | `CurrenciesController` (valyuta adları, homepage bayrağı) |
| `currency_rates` | `read` **`prepare`** **`approve`** | `CurrencyRatesController`, `CurrencyRateRequestsController` (1b). 1a-da `PUT/DELETE` `prepare` tələb edir |
| `meas` | `read` `create` `update` `delete` | `MeasDocumentsController`, `MeasLookupsController.cs`-in 2 sinfi |
| `media` | `read` `create` `delete` **`delete_own`** | `MediaController` (`preview` → `read`) |
| `settings` | `read` `update` **`delete`** | `SettingsController` (`DELETE` yenidir) |
| `users` | `read` `create` `update` `delete` | `UsersController` (`password` → `update`) |
| `roles` | `read` | `RolesController` (yeni, `GET /roles`) |
| `audit` | `read` | `AuditLogController` (yeni, `GET /audit-log`) |

**Cəmi: 98 kod** (16 məzmun modulu × 4 + `pages.delete_subtree` = 65; maliyyə 16; `meas` 4;
sistem 13).

İstisnalar (icazə kodu yoxdur):

- `auth/login|refresh|logout` — `[AllowAnonymous]`-un ekvivalenti, mövcud davranış.
- `GET /me/permissions` — `[AnyAuthenticatedUser]`.

## 3. Rol → icazə matrisi

`✓` = verilir, `—` = verilmir. `admin` hər sətirdə `✓`-dir və bu, kodda təmin olunur (R2).

| Modul / kod | moderator | meas_manager |
|---|---|---|
| 16 məzmun modulu: `read` `create` `update` `delete` | ✓ | — |
| `pages.delete_subtree` | — | — |
| `azir.*`, `inflation.*`, `yield_curves.*`, `currencies.*` | ✓ | — |
| `currency_rates.read`, `currency_rates.prepare` | ✓ | — |
| `currency_rates.approve` | — | — |
| `meas.*` | ✓ (legacy `meas/BaseController`, R6) | ✓ |
| `media.read`, `media.create` | ✓ | ✓ |
| `media.delete` | ✓ | — |
| `media.delete_own` | ✓ (`delete` onsuz da əhatə edir) | ✓ |
| `settings.*`, `users.*`, `roles.read`, `audit.read` | — | — |

**Effektiv icazə qaydası** (`PermissionHandler`):

```text
role claim yoxdur / naməlum rol          → heç bir icazə (login olur, hər action 403)
role == "admin"                           → hər kod ✓
digər                                     → kod ∈ PermissionMatrix[role]
media.delete_own                          → atribut "any-of" (media.delete | media.delete_own) keçirir;
                                            action daxilində: media.delete yoxdursa və created_by ≠ sub → 403 + authz.denied
```

`PermissionMatrix` singleton-dur. Xəritə ilk istifadədə `roles ⋈ role_permissions ⋈ permissions`-dan
yüklənir, TTL 5 dəqiqədir.

## 4. `currency_rate_requests` (1b, yeni cədvəl)

Migration `0010-currency-rate-requests.sql`:

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `bigserial PK` | Versiya rolunu da oynayır (R9) |
| `rate_date` | `date NOT NULL` | |
| `kind` | `varchar(10) NOT NULL CHECK (kind IN ('new','correction','delete'))` | Göndəriş anında müəyyən olunur: `DELETE` → `delete`. `PUT` olanda həmin gün üçün `currency_rates`-də sətir varsa `correction`, yoxdursa `new` (FR-016) |
| `status` | `varchar(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','returned','superseded'))` | |
| `payload` | `jsonb` | `new`/`correction`: `[{currencyCode, rate}]`. `delete`: `NULL`. `CHECK ((kind <> 'delete') = (payload IS NOT NULL))` |
| `before` | `jsonb` | Qərar anında `currency_rates`-dəki dəyərlər (FR-015). Göndəriş anında da snapshot götürülür, diff ekranı üçün |
| `prepared_by` | `integer NOT NULL REFERENCES users(id) ON DELETE RESTRICT` | Hazırlayan |
| `prepared_at` | `timestamptz NOT NULL DEFAULT now()` | |
| `decided_by` | `integer REFERENCES users(id) ON DELETE RESTRICT` | Təsdiqləyən və ya geri qaytaran |
| `decided_at` | `timestamptz` | |
| `return_reason` | `varchar(1000)` | `CHECK ((status='returned') = (return_reason IS NOT NULL AND length(trim(return_reason)) > 0))` |
| `superseded_by` | `bigint REFERENCES currency_rate_requests(id)` | |

Constraint və index-lər:

- `CHECK (decided_by IS NULL OR decided_by <> prepared_by)` — four-eyes DB səviyyəsində (FR-011).
- `CHECK ((status IN ('approved','returned')) = (decided_by IS NOT NULL AND decided_at IS NOT NULL))`.
- `CREATE UNIQUE INDEX … ON currency_rate_requests (rate_date) WHERE status = 'pending'` (FR-017).
- `CREATE INDEX … ON currency_rate_requests (status, prepared_at)` — gözləyənlərin siyahısı.

FK-lar haqqında: `users`-ə FK `ON DELETE RESTRICT`-dir. İstifadəçilər soft-delete olunur
(`deleted_at`), ona görə hazırlayanın kimliyi qalır (edge case "hesab silinib"). FK əlavə
etmək üçün `users` üzərində `REFERENCES` hüququ lazımdır. Bu, `0004`/`0007`-dəki kimi şərti
`DO $$` blokunda əlavə edilir, hüquq yoxdursa ötürülür. Belə olanda bütövlük kodda qalır.

`cbar_web_ro`-ya **GRANT verilmir** (R12): public tərəf tələbləri oxumamalıdır.

**EF** (`Cbar.Domain`, hər iki kopya, bayt-bayt eyni):

- `Entities/Currency.cs` → `CurrencyRateRequest` (yuxarıdakı sahələr; `Payload` və `Before` `string?` jsonb, `AuditLogEntry` kimi).
- `CbarDbContext.cs` → `DbSet<CurrencyRateRequest> CurrencyRateRequests` + `ToTable("currency_rate_requests")`.

### Vəziyyət keçidləri

```text
              PUT/DELETE (A)
                   │
                   ▼
   ┌───────── pending ─────────┐
   │ approve (B≠A)             │ return (B≠A, reason)
   ▼                           ▼
approved                    returned            (son vəziyyət — A yenidən göndərir → yeni sətir)
(currency_rates-ə tətbiq)

pending ──(eyni gün üçün yeni PUT/DELETE, istənilən istifadəçi)──▶ superseded  + yeni pending sətir
```

- `approved`, `returned` və `superseded` son vəziyyətlərdir, yalnız `pending` dəyişir.
- `approve`/`return` `WHERE id = @id AND status = 'pending'` şərti ilə gedir. 0 sətir dəyişsə,
  409 qaytarılır ("artıq qərar verilib və ya əvəz olunub"). Konkurent təsdiq (edge case) və
  köhnə versiya (FR-014) eyni yolla rədd olunur.
- `approve`-da hazırlayan özüdürsə (`prepared_by == sub`), 403 qaytarılır, admin olsa belə.
  Bu, UPDATE-dən əvvəl yoxlanılır. DB `CHECK`-i ikinci qatdır.
- `delete` tələbi göndəriləndə həmin gün üçün təsdiqlənmiş vərəq yoxdursa, 404 qaytarılır
  (bu günkü davranış).
- Təsdiq anında `new` və `correction` bu günkü `Upsert` semantikası ilə tətbiq olunur: payload-dakı kodlar
  əlavə və ya yenilənir, payload-da olmayan mövcud kodlar toxunulmaz qalır. Valyuta
  kodlarının yoxlanması göndəriş anında da, təsdiq anında da aparılır. Yalnız mövcudluq yoxlanılır, `is_active` yox (bugünkü `Upsert` kimi).
- Eyni gün üçün iki paralel göndəriş partial unique index-ə toxunur. İkincisi rollback olur və `DbExceptionHandler` onu 409-a çevirir.

## 5. Audit hərəkətləri

| `action` | `entity_type` / `entity_id` | `before` / `after` | Hissə |
|---|---|---|---|
| `authz.denied` | route resursu / `{id}` və ya 0 | `after = {permission, method, path}` | 1a |
| `pages.delete_subtree` | `page` / kök id | `after = {ids:[…]}` (yeni) | 1a |
| `settings.delete` | `setting` / 0 | `before = {key, value}` | 1a |
| `currency_rates.submit` | `currency_rate_request` / id | `after = {date, kind, payload}` | 1b |
| `currency_rates.supersede` | `currency_rate_request` / köhnə id | `after = {supersededBy}` | 1b |
| `currency_rates.approve` | `currency_rate_request` / id | `before` = köhnə dəyərlər, `after` = yeni dəyərlər, `preparedBy`, `preparedAt` | 1b |
| `currency_rates.return` | `currency_rate_request` / id | `after = {reason}` | 1b |
| `currency_rates.approve_denied` | `currency_rate_request` / id | `after = {reason:'preparer'}` | 1b |

Bu günkü `currency_rates.upsert` və `currency_rates.delete` hərəkətləri 1b-dən sonra
`approve` daxilində yazılmır, onları `currency_rates.approve` əvəz edir. Tarixi qeydlər
olduğu kimi qalır.
