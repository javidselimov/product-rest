# Research: Admin API RBAC (1a) və məzənnə four-eyes (1b)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-09

Bütün faktlar 2026-10-09-da kodda yoxlanılıb (`test` branch, `c14d78f`). Spec-də açıq sual
qalmayıb (Clarifications 2026-10-09). Bu sənəd texniki qərarları bağlayır.

---

## R1 — İcazə necə yoxlanılır: tokendə claim yox, serverdə rol → icazə xəritəsi

**Decision**: Giriş tokeni bu gün olduğu kimi yalnız **rol** claim-ini daşıyır. İcazələr
tokenə yazılmır. Server hər sorğuda rol kodunu `role_permissions`-dan yüklənmiş, yaddaşda
saxlanan xəritə ilə icazə dəstinə çevirir. `[RequirePermission("<kod>")]` atributu
(`AuthorizeAttribute`-dan törəyir, policy adı `perm:<kod>`) dinamik policy provider və bir
`AuthorizationHandler` ilə yoxlanılır.

**Rationale**:

- **Rolun aktuallığı artıq təmin olunub.** Spec 020-dən sonra rol dəyişikliyi stamp-i
  yeniləyir (`UsersController.Update` → `RotateAsync`), köhnə token növbəti sorğuda 401 alır,
  refresh isə yeni rolla token verir. Rol claim-i həmişə cari roldur, deməli rol → icazə
  çevrilməsi də cari olur. FR-005 əlavə iş tələb etmir.
- **İcazə claim-ləri köhnəlir.** Matris dəyişsə (yeni migration), tokendəki icazələr 15
  dəqiqəyə qədər köhnə qalar, çünki matrisin dəyişməsi stamp-i yeniləmir. Serverdə çevrilmə
  ilə yeni matris deploy anından qüvvədədir.
- **Token ölçüsü.** Kataloqda 98 kod var (data-model §2), orta uzunluq ~18 simvoldur.
  Admin tokeni ~2,5 KB böyüyər (base64-dən sonra) və bu, hər sorğuda göndərilər. Rol claim-i ilə ölçü dəyişmir.
- **Panel sınmır.** Panel JWT payload-unu `z.looseObject` ilə oxuyur, rol isə
  `z.enum(['admin','moderator','meas_manager'])`-dir. Yeni rol yaratmırıq (Clarifications Q1),
  claim formatı dəyişmir.

**Alternatives considered**:

- *Permission claim-ləri JWT-yə* (ilkin 1a təsviri). Yuxarıdakı iki səbəbə görə rədd
  edildi: matris dəyişəndə köhnəlir, token böyüyür. Panelin icazə siyahısına ehtiyacı
  `GET /api/v1/me/permissions` ilə ödənilir (R7).
- *Hər sorğuda `role_permissions` sorğusu.* Spec 020 artıq hər sorğuya bir sorğu əlavə edib.
  Matris yalnız deploy ilə dəyişir, ona görə ikinci sorğu lazımsız xərcdir.

## R2 — Matrisin mənbəyi: `permissions` + `role_permissions` (migration), admin isə kodda

**Decision**:

- İcazə kodları C#-da sabitlər kimi bir yerdə yaşayır: `Authorization/Permissions.cs`.
  Atributlar yalnız bu sabitlərə istinad edir.
- Migration `0009-rbac-permissions.sql` kataloqu `permissions`-a, moderator və meas_manager
  sətirlərini `role_permissions`-a yazır. Bütün yazılar `ON CONFLICT DO NOTHING` ilə gedir,
  rolları isə `code` ilə tapır (id ilə yox).
- **`admin` rolu kodda bütün icazələrə malikdir**: handler `role == "admin"` olanda uğur
  qaytarır, `role_permissions`-da admin sətirləri saxlanılmır. Four-eyes qaydası icazə deyil,
  ayrıca biznes yoxlamasıdır (R9), ona görə admin-ə də tətbiq olunur.
- `PermissionMatrix` (singleton) xəritəni ilk istifadədə yükləyir və 5 dəqiqə yaddaşda
  saxlayır.
- Startup-da kataloq yoxlaması aparılır: koddakı hər kod `permissions`-da olmalıdır.
  Olmayan kodlar `Error` səviyyəsində loglanır. Belə kod heç bir qeyri-admin rola verilmir
  (fail-closed).

**Rationale**:

- Spec FR-002 "versiyalanmış, hər mühitdə eyni" tələb edir, migration bunu verir. Review-un
  iradı ("cədvəllər var, istifadə olunmur") da bağlanır.
- **Admin kodda olur, çünki admin heç vaxt kilidlənməməlidir.** Seed tətbiq olunmasa və ya
  gələcək migration admin üçün sətir əlavə etməyi unutsa, admin yenə də işləyir və problemi
  düzəldə bilir. Bundan başqa, gələcəkdə hər yeni icazə üçün "admin-ə də ver" addımı itir.
- Rollar `code` ilə tapılır. Panel id-ləri `1/2/3` kimi sabit qəbul edir. Paylaşılan
  mühitlərdə id-lər fərqli olsa, migration yenə də düzgün işləyir.
- 5 dəqiqəlik TTL, matrisi DB-də əl ilə dəyişsələr (fövqəladə hal), bunun deploy olmadan
  qüvvəyə minməsi üçündür. Normal yol migration-dır.

**Alternatives considered**:

- *Matris yalnız kodda* (cədvəllərsiz). Ən sadə yoldur, amma FR-007-nin "admin matrisi
  oxuyur" tələbi üçün yenə də bir mənbə lazımdır, cədvəllər isə istifadəsiz qalır. Fallback
  kimi saxlanılır (R12).
- *Admin üçün də `role_permissions` sətirləri.* Gələcək hər migration-da unutmaq riski
  yaradır, unudulanda isə admin kilidlənir.

## R3 — Default-deny: icazəsi bağlanmamış action qeyri-admin üçün qadağandır

**Decision**: İki qat qoruma:

1. **Runtime.** Qlobal `IAsyncAuthorizationFilter` (`PermissionGuardFilter`) yalnız
   `[RequirePermission]` daşımayan action-larda işləyir. Bunlara `[AllowAnonymous]`
   (`auth/*`) və açıq `[AnyAuthenticatedUser]` aid deyil. Belə action qeyri-admin üçün 403
   verir və `Warning` loglanır. Bu, FR-001-in "default olaraq qadağandır" hissəsidir.
2. **Statik inventar.** `api-cbar-admin/scripts/permission-inventory.mjs` (Node, .NET SDK
   tələb etmir) controller fayllarını oxuyur. Hər `[Http*]` action üçün effektiv icazəni
   (action və ya sinif atributu) çıxarır, icazəsi olmayanları göstərir və exit 1 qaytarır.
   SC-001 bununla ölçülür. Route çıxarışı `.claude/skills/sync-openapi/scripts/routes.mjs`
   ilə paylaşılır (spec-first hook-unun istifadə etdiyi modul).

**Rationale**: Lokalda .NET SDK yoxdur, ona görə startup refleksiya testini burada işlətmək
olmur. Node skripti istənilən maşında və CI-dan kənarda da işləyir.

**Alternatives considered**: `AuthorizationOptions.FallbackPolicy`. Rədd edildi, çünki o,
yalnız *heç bir* authorization metadata-sı olmayan endpoint-lərə tətbiq olunur. Bizim bütün
controller-lərdə `[Authorize]` var, ona görə fallback heç vaxt işə düşməzdi.

## R4 — Rədd cavabı və audit

**Decision**:

- İcazəsiz sorğu **403** alır. Gövdə spec 018 problem details formasındadır, `message`
  olmur. Mövcud `ProblemDetailsSetup` 403-ün `title`-ını silir və panel öz lokal mətnini
  göstərir (CLAUDE.md: "Keep that until the panel is adapted"). 401 ilə fərq FR-003-ü ödəyir.
- Audit üçün xüsusi `IAuthorizationMiddlewareResultHandler` (`AuditingAuthorizationResultHandler`)
  `Forbidden` nəticəsində `audit_log`-a sətir yazır:
  - `action = 'authz.denied'`
  - `entity_type` = route-dan götürülən resurs (`pages`, `currency_rates`, …)
  - `entity_id` = route-dakı `{id}`, yoxdursa 0
  - `after = { permission, method, path }`
  - actor, IP və UA `AuditService` ilə yazılır

  Sonra default handler 403-ü yazır. `PermissionGuardFilter` (R3) eyni audit yolunu
  istifadə edir. Rədd heç bir verilənə toxunmur, çünki action-a qədər çatmır.
- Self-approval (R9) action daxilində yoxlanılır. O da 403 verir, amma `message` ilə və
  `audit_log`-a `currency_rates.approve_denied` kimi düşür.

**Rationale**: FR-004 kim, nə, hansı obyekt, nə vaxt və haradan sualına cavab tələb edir.
`audit_log` sxemi bunların hamısını daşıyır. Spec 020-də 401 rəddi loga yazılırdı, audit-ə
yox. Onun səbəbi token problemi idi. 403 isə **məlum istifadəçinin** qadağan əməliyyat
cəhdidir və təhlükəsizlik baxımından audit-ə layiqdir.

**Risk**: Login olmuş istifadəçi 403-ləri təkrarlayaraq `audit_log`-u şişirdə bilər. Bunu
yalnız etibarlı tokeni olan şəxs edə bilər, ona görə qəbul edilir. Monitorinq üçün Grafana
log axtarışında `authz.denied` istifadə olunur.

## R5 — Kataloqun forması və "dərc" icazəsi

**Decision**: Hər modul üçün `read`, `create`, `update`, `delete` (endpoint harada varsa).
Bunlardan başqa xüsusi kodlar var:

- `pages.delete_subtree`
- `currency_rates.prepare`, `currency_rates.approve`
- `media.delete_own`
- `settings.delete`
- `audit.read`
- `roles.read`

Ayrıca `*.publish` kodu **yaradılmır**. Dərc `Status` sahəsi ilə `update` daxilində olur,
moderatorda isə həm redaktə, həm dərc hüququ var (FR-006). Bu halda ayrıca kod yalnız
payload yoxlaması tələb edərdi, heç bir rolu isə fərqləndirməzdi.

Alt resurslar (səhifə asset-ləri, qalereya şəkilləri, qanun faylları, `move`) ana modulun
`update` icazəsinə bağlanır. Tam siyahı [data-model.md §2](./data-model.md)-dədir.

**Alternatives considered**: hər endpoint üçün ayrı kod. ~150 kod yaradardı, matrisin
razılaşdırılmasını isə (1a-nın əsas vaxt xərci) çətinləşdirərdi.

## R6 — Rol → icazə matrisi (legacy paritet ilə)

**Decision**: [data-model.md §3](./data-model.md). Qısaca:

- **admin** — hamısı (kodda, R2).
- **moderator** — `product-host`-da `MainController`-dən törəyən hər şey: məzmun, maliyyə
  modulları (AZIR, inflyasiya, gəlirlilik əyriləri, valyuta adları), MEAS, media.
  Məzənnədə `currency_rates.read` + `prepare` var, `approve` yoxdur (Clarifications Q1).
  İstifadəçilər, ayarlar, `pages.delete_subtree`, `audit.read` və `roles.read` moderatorda
  yoxdur.
- **meas_manager** — `meas_documents.*`, `meas_emitents.*`, `meas_info_types.*`, eləcə də
  `media.read`, `media.create`, `media.delete_own`.

**Legacy istinadı**:

- `admin/controllers/MainController.php:52` (admin + moderator).
- `admin/modules/meas/controllers/BaseController.php`: istənilən login olmuş istifadəçi,
  yəni moderator da MEAS-a girə bilirdi.
- `HomeController.php:19`: meas_manager yalnız MEAS-a yönləndirilir.
- `UsersController.php:34`: istifadəçiləri yalnız admin idarə edir.

**Spec ilə fərq**: FR-006 moderatorun MEAS hüququnu açıq yazmır. Legacy paritetinə görə
(Maddə I.3, səssiz itki qadağandır) moderator MEAS-ı saxlayır. 1a-da matris razılaşdırılanda
bu nöqtə ayrıca təsdiqlənməlidir (quickstart §1).

## R7 — Yeni oxuma endpoint-ləri (US4)

**Decision** (hamısı spec-first, [contracts/rbac.md](./contracts/rbac.md)):

- `GET /api/v1/me/permissions` → `{ role, permissions: string[] }`. İstənilən login olmuş
  istifadəçi üçündür (`[AnyAuthenticatedUser]`). Admin üçün tam kataloq qaytarılır.
- `GET /api/v1/roles` → `[{ id, code, name, permissions[] }]`. Tələb olunan icazə
  `roles.read` (admin) — FR-007.
- `GET /api/v1/audit-log?action=&actorId=&entityType=&from=&to=&page=&pageSize=`. Tələb
  olunan icazə `audit.read` (admin) — US4 AS3. Hazırda audit-i oxuyan heç bir endpoint
  yoxdur. Prefiks filtri `action=authz.` rədd edilmiş cəhdləri, `action=currency_rates.`
  isə təsdiq tarixçəsini verir.

## R8 — Dağıdıcı və sistem əməliyyatları (US3)

**Decision**:

- `DELETE /pages/{id}` `pages.delete` tələb edir. Alt ağac budağına girəndə action daxilində
  `IAuthorizationService` ilə əlavə olaraq `pages.delete_subtree` yoxlanılır. İcazə yoxdursa,
  heç nə silinmədən 403 qaytarılır və audit-ə yazılır (R4 yolu ilə).
- Alt ağac silinəndə `UPDATE … RETURNING id` ilə silinən id-lər toplanır və
  `audit_log.after = { ids: [...] }`-ə yazılır (US3 AS3). Bu gün yalnız kök id yazılır.
- **Ayarlar**:
  - `PUT /settings/{key}` `settings.update` tələb edir.
  - **Yeni** açar yalnız `KnownSettings.Keys` siyahısından yaradıla bilər. Hazırda siyahıda
    yalnız `accessibility.widget` var, onu `api-cbar` `SiteSettingsController` oxuyur.
    Naməlum yeni açar 400 ilə rədd edilir ("Unknown setting key").
  - Bazada artıq olan naməlum açarlar oxunur və redaktə oluna bilir.
  - **Yeni** `DELETE /settings/{key}` (`settings.delete`, admin) əlavə olunur, çünki spec-in
    edge case-i silməyi tələb edir, bu gün isə silmə endpoint-i yoxdur.
- `UsersController`-də `[Authorize(Roles = "admin")]` əvəzinə `users.read|create|update|delete`
  istifadə olunur. Davranış dəyişmir (FR-021), last-admin guard (spec 015) toxunulmaz qalır.

## R9 — Four-eyes: gözləyən dəyişiklik ayrıca tələb cədvəlindədir, `currency_rates` dəyişmir

**Decision**: Yeni cədvəl `currency_rate_requests` yaradılır ([data-model.md §4](./data-model.md)).
`currency_rates` **yalnız təsdiqlənmiş** məlumatı saxlamağa davam edir.

- `PUT /currency-rates` və `DELETE /currency-rates` artıq cədvələ birbaşa yazmır. Onlar
  `kind = 'new'|'correction'|'delete'`, `status = 'pending'` olan tələb yaradır və cavabda **202** +
  tələb qaytarır.
- `POST /currency-rate-requests/{id}/approve`, eyni tranzaksiyada:
  - `UPDATE … SET status='approved' WHERE id=@id AND status='pending'`. 0 sətir dəyişsə, 409
    qaytarılır.
  - Əvvəlki dəyərlər `before`-a yazılır.
  - Payload `currency_rates`-ə tətbiq olunur: `new`/`correction` bu günkü merge semantikası ilə, `delete`
    isə günün bütün sətirlərini silir.
  - Audit qeydi yazılır.
- `POST /currency-rate-requests/{id}/return { reason }` — tələbi geri qaytarır, səbəb məcburidir.
- **Hazırlayan ≠ təsdiqləyən** iki yerdə yoxlanılır: action-da (403 + `message`) və DB-də
  `CHECK (decided_by IS NULL OR decided_by <> prepared_by)` ilə.
- **Versiya = tələb id-si.** Eyni gün üçün yeni göndəriş (kim göndərməsindən asılı olmayaraq)
  köhnə gözləyən tələbi `superseded` edir və yeni sətir yaradır. Təsdiqləyən konkret id-ni
  təsdiqləyir. Arada vərəq dəyişibsə, həmin id artıq `pending` deyil və 409 qaytarılır
  (FR-014, US2 AS8). Hər gün üçün ən çox bir `pending` tələb olur, bunu partial unique index
  təmin edir (FR-017).

**Rationale**:

- **`api-cbar`-a və XML feed-ə toxunulmur.** Public tərəf bu gün olduğu kimi `currency_rates`-i
  oxuyur, gözləyən dəyər ora heç vaxt düşmür. Bu, FR-013-ü və SC-005-i (feed bayt-bayt eyni)
  konstruktiv olaraq təmin edir. `api-cbar`-da filtr yazmağa ehtiyac yoxdur.
- **`ALTER TABLE currency_rates` yoxdur.** Paylaşılan mühitlərdə mövcud cədvəllərin sahibi
  başqa roldur (`0004`, `0007`, `0008` şərhləri). Yeni cədvəl bu riski aradan qaldırır.
- **FR-018 pulsuz alınır.** Mövcud bütün sətirlər tərifə görə təsdiqlənmişdir, data
  miqrasiyası lazım deyil.
- **Düzəliş zamanı köhnə dəyər public-də qalır** (US2 AS5), çünki düzəliş təsdiqə qədər yalnız
  tələb cədvəlində yaşayır.

**Alternatives considered**:

- *`currency_rates`-ə `status` sütunu* (ilkin 1b təsviri: "yeni status draft → approved").
  Rədd edildi, çünki:
  - `ALTER` riski var;
  - `api-cbar`-ın 4 sorğusuna filtr lazım olardı (Maddə III.3, iki MR);
  - düzəliş zamanı köhnə və yeni dəyəri eyni `(rate_date, currency_code)` unique açarında
    saxlamaq mümkün deyil.

  "Status" anlayışı qalır, sadəcə tələb sətrində yaşayır.
- *Yerində redaktə + versiya sütunu.* Kim redaktə etdisə preparer o olmalıdır, bu da A-nın
  vərəqini B dəyişəndə four-eyes-i bulandırır. Supersede modeli hər göndərişi ayrıca və
  audit oluna bilən edir.

## R10 — Gözləyən tələblərin oxunması (FR-015, FR-016)

**Decision**:

- `GET /currency-rate-requests?status=pending|approved|returned|superseded&page=&pageSize=`.
  Siyahı sahələri: id, gün, növ, hazırlayan, göndərilmə vaxtı, status, qərar verən, qərar
  vaxtı. Default filtr `pending`, sıralama `prepared_at` üzrə (ən köhnə əvvəl), ki
  gözləmə müddəti görünsün (edge case "təsdiqləyən yoxdursa").
- `GET /currency-rate-requests/{id}` — payload, cari təsdiqlənmiş dəyərlər (diff üçün),
  qaytarılma səbəbi.
- Hər ikisi `currency_rates.read` tələb edir: moderator öz tələbini və qaytarılma səbəbini
  görməlidir (US2 AS4).
- `GET /currency-rates` (mövcud) yalnız təsdiqlənmiş vərəqi göstərir. Panelin bu günkü
  ekranı dəyişmədən işləyir.

## R11 — Panel üçün keçid dövrü

**Decision**: Panel bu spec-in əhatəsində deyil.

- `PUT /currency-rates` 204 əvəzinə 202 qaytarır. Panel `apiClient.put<void>` istifadə edir
  və cavabı parse etmir (`features/currency/api/currency.service.ts:42`). 2xx-i uğur sayır,
  ona görə sınmır. Amma "saxlanıldı" göstərər, dəyər isə hələ public-də olmaz. Spec bunu
  qəbul edib: hazırlayanları xəbərdar etmək lazımdır.
- 1b deploy olunanda təsdiq ekranı hələ yoxdur. Təsdiq bu endpoint-lərlə (curl və ya
  Swagger/Redoc test mühitində) edilə bilər. Ona görə **1b-nin prod deploy-u panelin təsdiq
  ekranı ilə eyni vaxta planlaşdırılmalıdır**. `test`-ə isə ayrıca gedə bilər.
- 403 üçün panelin mövcud xəta idarəsi lokal "icazə yoxdur" mətnini göstərir.

## R12 — Risklər və yoxlamalar (ölç, sonra iddia et)

| Risk | Yoxlama | Fallback |
|---|---|---|
| Paylaşılan mühitdə tətbiq rolunun `permissions`/`role_permissions`-a INSERT hüququ yoxdur | Migration-un ilk sətri `has_table_privilege(current_user, 'role_permissions', 'INSERT')`-dir. Hüquq yoxdursa, `RAISE WARNING` verilir və seed ötürülür, deploy bloklanmır. Startup kataloq yoxlaması (R2) `Error` loglayır və Grafana-da görünür | Admin işləməyə davam edir (kodda). Qeyri-adminlər 403 alır (fail-closed). DevOps-dan grant istənir, və ya matris kodda saxlanılır (R2 alternativi) |
| Test mühitində rollar başqa id/kodla mövcuddur | Deploy-dan əvvəl `GET /users` cavabında `roleCode`-lar yoxlanılır (quickstart §0) | Migration `code` ilə işləyir. Naməlum kod heç bir icazə almır |
| `currency_rate_requests` `cbar_web_ro`-ya lazım deyil | — | Grant **verilmir**: public tərəf tələbləri görməməlidir |
| 1b 8 SP-yə sığmır | research §SP | Clarifications Q2: plan mərhələsində yenidən qiymətləndirmə |

## SP qiymətləndirməsi

| Hissə | İlkin | Plan | Səbəb |
|---|---|---|---|
| 1a | 13 | **13** | Atribut yayılması ~150 action-dır, amma mexanikidir. Yeni olanlar: 3 oxuma endpoint-i (`me/permissions`, `roles`, `audit-log`), `DELETE /settings/{key}`, inventar skripti, audit handler-i. Vaxtın çoxu matrisin razılaşdırılmasına və 3 rolun `test`-də yoxlanmasına gedir |
| 1b | 8 | **13** | Yeni cədvəl + entity hər iki `Cbar.Domain` kopyasında (`api-cbar` MR-ı). 5 endpoint (PUT/DELETE semantikası dəyişir, 4 yeni). Supersede + konkurent təsdiq + self-approval (kod və DB). OpenAPI. Q2-də "hamısı 1b-də" seçildi |
