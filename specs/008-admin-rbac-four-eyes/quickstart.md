# Quickstart: RBAC (1a) və məzənnə four-eyes (1b) yoxlaması

Lokalda .NET SDK yoxdur. Build GitLab pipeline-da gedir, yoxlama isə `test` mühitində
(`https://api-cbar-admin-test.cbar.az`, `https://api-cbar-test.cbar.az`) aparılır. Grafana:
`Namespace cbar`, `App api-cbar-admin`. Kontraktlar: [rbac.md](./contracts/rbac.md),
[currency-rate-requests.md](./contracts/currency-rate-requests.md).

```bash
ADMIN=https://api-cbar-admin-test.cbar.az/api/v1
login() { curl -s -X POST "$ADMIN/auth/login" -H 'Content-Type: application/json' \
  -d "{\"username\":\"$1\",\"password\":\"$2\"}" | jq -r .accessToken; }
```

## §0 Ön şərtlər (deploy-dan **əvvəl**)

1. **Test istifadəçiləri.** Admin ilə hər rol üçün bir istifadəçi yaradılır: `qa_admin2`
   (admin, four-eyes üçün ikinci admin), `qa_mod`, `qa_meas`. `GET /users` cavabında
   `roleCode`-lar `admin|moderator|meas_manager`-dir. Fərqli kod çıxsa, dayanmaq lazımdır
   (research R12).
2. **Baseline.** Deploy-dan əvvəl bu gün daxil olmaqla son 30 günün feed-i saxlanılır:

   ```bash
   for d in $(seq 0 29); do D=$(date -d "-$d day" +%d.%m.%Y); \
     curl -s -o "baseline/$D.xml" "https://api-cbar-test.cbar.az/currencies/$D.xml"; done
   ```

3. **Kataloq inventarı** (lokal, SDK-sız): `node product-rest/api-cbar-admin/scripts/permission-inventory.mjs`
   exit 0 qaytarmalı və "0 unbound actions" yazmalıdır (SC-001).

## §1 1a — matrisin razılaşdırılması (kod yazılmazdan əvvəl)

[data-model.md §3](./data-model.md) cədvəli məzmun və maliyyə sahibləri ilə təsdiqlənir. Açıq
nöqtə: moderatorun `meas.*` hüququ (legacy paritet, research R6).

## §2 1a — deploy-dan sonra startup

- Grafana loglarında `Permission catalog: 98 codes, 0 missing` görünür, `Error` yoxdur.
- Migration `0009-rbac-permissions.sql` `schema_migrations`-da olur. Log-da
  `RAISE WARNING … no INSERT privilege` varsa, seed tətbiq olunmayıb: qeyri-adminlər 403
  alır, admin işləyir. Bu halda R12 fallback-ı tətbiq olunur.

## §3 1a — rol × əməliyyat matrisi (US1, SC-002)

Hər rol üçün `GET /me/permissions` cavabı data-model §3-dəki sətirlə **eyni** olmalıdır:

```bash
for u in qa_admin2 qa_mod qa_meas; do T=$(login $u '…'); \
  curl -s -H "Authorization: Bearer $T" "$ADMIN/me/permissions" | jq -c '{role, n: (.permissions|length)}'; done
# gözlənilən: admin 98, moderator 87, meas_manager 7
```

Ardınca hər rol üçün nümunə ssenarilər:

| # | İstifadəçi | Sorğu | Gözlənilən |
|---|---|---|---|
| 3.1 | qa_meas | `PUT /pages/{id}`, `PUT /settings/accessibility.widget`, `PUT /currency-rates` | 403 ×3, verilənlər dəyişmir |
| 3.2 | qa_meas | `POST /meas-documents` | 201 |
| 3.3 | qa_meas | `GET /banners` | 403 (oxuma da bağlıdır) |
| 3.4 | qa_mod | `POST /press-releases`, `PUT` (status = published) | 201, 200 |
| 3.5 | qa_mod | `GET /users`, `PUT /settings/accessibility.widget` | 403, 403 |
| 3.6 | qa_mod | `POST /meas-documents` | 201 (legacy paritet) |
| 3.7 | qa_admin2 | Yuxarıdakıların hamısı | 2xx |
| 3.8 | — | 3.1–3.5-dəki rədd edilmiş cəhdlər: `GET /audit-log?action=authz.` (admin) | Hər 403 üçün actor, `permission`, `path`, IP |
| 3.9 | qa_mod | Admin `qa_mod`-un rolunu `meas_manager`-ə dəyişir, `qa_mod` köhnə token ilə `POST /press-releases` göndərir | 401, refresh-dən sonra 403 (FR-005, növbəti sorğu). Sonda rolu `moderator`-a qaytar, §4–§5 ona əsaslanır |

403 gövdəsi: `{"type":…,"status":403,"traceId":…}`. `title` və `message` olmur.

## §4 1a — dağıdıcı və sistem əməliyyatları (US3)

| # | İstifadəçi | Sorğu | Gözlənilən |
|---|---|---|---|
| 4.1 | qa_mod | Alt səhifəsi olan, `removableAll` səhifə: `DELETE /pages/{id}` | 403, `GET /pages/tree`-də alt ağac yerindədir |
| 4.2 | qa_mod | Alt səhifəsi olmayan, `removable` səhifə | 204 |
| 4.3 | qa_admin2 | 4.1-dəki səhifə | 204. `audit-log?action=pages.delete_subtree` → `after.ids` bütün alt səhifələri ehtiva edir |
| 4.4 | qa_admin2 | `PUT /settings/qa.unknown {value:1}` | 400 "Unknown setting key" |
| 4.5 | qa_admin2 | `PUT /settings/accessibility.widget` | 200 |
| 4.6 | qa_admin2 | Bazada artıq olan naməlum açar: `DELETE /settings/qa.probe` (T003-də yaradılıb) | 204, `GET /settings/qa.probe` → 404. Audit-də `settings.delete` köhnə dəyərlə görünür |
| 4.7 | qa_meas | Başqasının yüklədiyi media: `DELETE /media/{id}` | 403. Öz yüklədiyi media üçün 204 |

## §5 1b — four-eyes (US2)

`D=2026-12-31` kimi gələcək tarix seçilir (public feed-ə təsir etməsin).

| # | İstifadəçi | Sorğu | Gözlənilən |
|---|---|---|---|
| 5.1 | qa_mod | `PUT /currency-rates {date:D, rates:[USD 1.7]}` | 202, `status: pending`. `curl api-cbar-test/currencies/31.12.2026.xml`-də USD yoxdur |
| 5.2 | qa_mod | `POST /currency-rate-requests/{id}/approve` | 403 (moderatorda `approve` yoxdur) |
| 5.3 | qa_admin2 | `PUT` D üçün yeni dəyərlə (5.1-i əvəz edir) | 202, `supersedes = 5.1.id`. 5.1-in statusu `superseded` olur |
| 5.4 | qa_admin2 | 5.3-ün `approve`-u (öz tələbi) | **403** + `message` (admin olsa belə, SC-003) |
| 5.5 | admin | 5.1-in `approve`-u (əvəz olunub) | 409 (FR-014) |
| 5.6 | admin | 5.3-ün `approve`-u | 200. Feed-də dəyər görünür. `audit-log?action=currency_rates.approve`-da hazırlayan, təsdiqləyən və hər iki vaxt var |
| 5.7 | qa_mod | D üçün düzəliş göndərilir: `PUT` USD 1.8 | 202. Feed hələ **1.7** göstərir (US2 AS5) |
| 5.8 | admin | 5.7-nin `return {reason:"yoxla"}` | 200. `qa_mod` `GET /currency-rate-requests/{id}`-də `returnReason`-u görür. Feed 1.7 göstərir |
| 5.9 | admin | `return {reason:"  "}` | 400 |
| 5.10 | qa_mod | `DELETE /currency-rates?date=D` | 202. Feed hələ 1.7 göstərir |
| 5.11 | admin + qa_admin2 | 5.10 üçün eyni anda iki `approve` (`&` ilə paralel curl) | Biri 200, digəri 409. Feed-də D boşdur |
| 5.12 | — | `GET /currency-rate-requests` (pending) | Siyahı `preparedAt ASC` sıralanıb, növ, hazırlayan və vaxt göstərilir |

## §6 1b — public tərəf və compat (SC-004, SC-005)

```bash
for f in baseline/*.xml; do d=$(basename $f); \
  curl -s "https://api-cbar-test.cbar.az/currencies/$d" | cmp -s - "$f" || echo "DIFF $d"; done
# gözlənilən: heç bir DIFF yoxdur
```

## §7 Bağlanış

- `diff -r product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` boş olur (1b).
- Test istifadəçiləri deaktiv edilir. D tarixi üçün qalan tələblər `return` ilə bağlanır.
- `/sync-openapi api-cbar-admin` drift göstərmir. `business_logic/` `/sync-business-logic` ilə yenilənir.
