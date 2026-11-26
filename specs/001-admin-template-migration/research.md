# Research: Admin panelinin `new-template` üzərində yenidən qurulması

**Faza 0 çıxışı** | Tarix: 2026-09-07 | Spec: [spec.md](./spec.md)

Mənbələr: `new-template/src` (api client, auth store, interceptors, runtime config, testing setup),
`@cbar/lib-react-ui-kit@0.3.0` `dist/**/*.d.ts` (komponent API-ləri), `web-cbar-admin/src`
(`crud/types.ts`, `crud/utils.ts`, `CrudListPage`, `CrudFormPage`, `RichTextEditor.tsx`,
`roundtrip-check.mjs`), `api-cbar-admin/src/Cbar.AdminApi/Controllers/*` (DTO-lar, envelope-lər,
error formaları, CORS), `REDESIGN-PLAN.md`.

---

## R1 — İş qovluğu və başlanğıc

**Decision**: `new-template` → `web-cbar-admin-next` (git tarixçəsiz kopya, `docs/how-to-use.md`
§1 prosedurunu izləyərək). Template-in "Sil" cədvəlindəki artefaktlar (`artifacts/`, `coverage/`,
`lighthouse-report.json`, `specs/002…006`, `.claude/skills/template-setup`, `.mcp.json` +
`figma-page`) və demo domain (`pages/{projects,team,reports,components}`, `features/{projects,team}`,
`widgets/*`, `entities/{project,member}`, `handlers/{projects,team}.ts`, müvafiq locale JSON-ları)
silinir. `specs/001-template-reconstruction/` **saxlanılır** (konstitusiya D1–D6 registri ona
istinad edir). `brand.ts`: `shortName: 'CBAR'`, `appName: 'CBAR Admin'`, `templateInfo.enabled: false`.
Root repo bir dənədir; `web-cbar-admin-next/.git` yoxdur — husky `prepare` skripti `.git`-siz
qovluqda səssiz ötürür (CLAUDE.md), git hook gate-i işləmir; CI eyni gate-i (`app:check`) işlədir.

**Rationale**: Root konstitusiya VI.1/VI.6 və istifadəçi qərarı (Option A). Köhnə panel toxunulmaz.

**Alternatives considered**: `new-template`-in içində qurmaq (template yenidən istifadə edilməz olur,
amendment tələb edir); birbaşa `web-cbar-admin`-i əvəz etmək (cutover-ə qədər işlək panel qalmır).

## R2 — API ünvanı, proxy və `/api/v1` prefiksi

**Decision**: Servis yolları API kökünə nisbi yazılır (`/laws`, `/pages/tree`), `/api/v1`
**prefiksi `apiUrl`-dədir**. Lokal: `.env.development` → `VITE_API_URL=/api/v1`,
`VITE_API_PROXY_TARGET=http://localhost:5253`; Vite `server.proxy['/api']` → `:5253` (template-in
mövcud mexanizmi, `changeOrigin`). `public/config.json` (dev/preview) → `{"urls":{"apiUrl":"/api/v1"}}`.
Deploy: `.ci-cd/{dev,test,prod}.yaml` configMap `apiUrl: https://<api-host>/api/v1`
(sonda `/`-sız; axios `baseURL` + `/laws` düzgün birləşir). Köhnə panelin `.ci-cd` dəyərləri
`…/api/` ilə bitirdi və kod onları oxumurdu — bu uyğunsuzluq burada bağlanır.

**Rationale**: `api-cbar-admin`-də versiya hər controller-də literaldır (`[Route("api/v1/…")]`);
prefiksi bir yerdə saxlamaq gələcək `v2` keçidini config dəyişikliyinə endirir. Proxy CORS-u
tamamilə aradan qaldırır (API `Cors:Origins`-də `localhost:5173` var, amma proxy ilə ehtiyac qalmır).
Deploy-da isə sorğu cross-origin-dir və API `AllowCredentials` vermir — ona görə template-in
`withCredentials: true` dəyəri `false` edilir (T016); auth yalnız `Authorization: Bearer`.

**Alternatives**: `VITE_API_URL=http://localhost:5253/api/v1` birbaşa (CORS-a bağlı, template
konvensiyasından kənar); prefiksi hər servisdə yazmaq (26 yerdə təkrar).

## R3 — Xəta normalizasiyası (üç error forması)

**Decision**: `shared/api/types.ts#normalizeApiError` genişlənir:
`message = body.message ?? body.title ?? (body.errors ? ilk error mesajı : default)`;
`fieldErrors = body.errors` (ValidationProblemDetails — açarlar C# property adları, `camelCase`-ə
çevrilir: `Translations` → `translations`, `$.status` → `status`); `code = body.code ?? (status ilə
xəritə: 401 AUTH, 403 FORBIDDEN, 404 NOT_FOUND, 409 CONFLICT, 400 VALIDATION)`; `traceId =
body.traceId ?? header`. 401 boş gövdəli gəlir (JWT middleware) — mesaj i18n `errors.unauthorized`.
500 boş gövdə → `errors.unexpected`.

**Rationale**: API üç fərqli forma qaytarır (`{message}`, ProblemDetails, ValidationProblemDetails)
— contracts/admin-api.md §2. Template VII.3: raw texniki mesaj göstərilmir.

**Alternatives**: Hər servisdə ayrıca `catch`: təkrar; API-ni dəyişmək: bu spec-in əhatəsində deyil.

## R4 — Auth: JWT-dən istifadəçi, sessiya müddəti, 401

**Decision**: `POST /auth/login` `{username, password}` → `{accessToken, expiresAt}`. `/auth/me`
yoxdur → `AuthUser` **JWT payload-dan** çıxarılır (`shared/lib/jwt.ts`: base64url decode, Zod
sxemi: `sub`, `preferred_username`, rol açarı `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`
və ehtiyat `role`, `exp`). `AuthUser = { id, username, name: username, roleCode, permissions }`;
`permissions` rol kodundan xəritə ilə (`admin` → tam dəst; `moderator`/`meas_manager` → hazırda eyni
tam dəst — spec: rol əsaslı gizlətmə tətbiq edilmir; `users.manage` icazəsi yalnız `admin`-ə
verilir, amma bu spec-də `<Can>` ilə heç bir ekran bağlanmır, xəritə gələcək spec üçün hazırdır).
Store: `login(accessToken, user, expiresAt)`; `auth-bridge` `expiresAt`-a **taymer** qurur — müddət
bitəndə `performLogout()` + toast `auth:sessionExpired` (istifadəçi xəbərdar edilir, spec edge
case). Token yalnız yaddaşda; refresh yoxdur (API-də yoxdur). Səhifə yeniləməsi: template-in
`restore()` user snapshot-ı bərpa edir, token yox → ilk sorğu 401 → login (`redirect` search param
ilə geri qayıdış, template mexanizmi). Interceptor 401-i `/auth/login` üçün ötürür (mövcud).
Giriş formu: username + password (template-in `email` sahəsi `username` olur), 401-də
`auth:invalidCredentials`, digər xətalarda `AppError.message`.

**Rationale**: contracts/admin-api.md §1 — `me`/`refresh`/`roles` endpoint-i yoxdur; template V
(token yaddaşda) və III.5. `user.role === '…'` müqayisəsi qadağandır → `permissions`.

**Alternatives**: Sessiya üçün `sessionStorage`-da token (X.3 qadağan); `expiresAt`-ı
görməzdən gəlmək (köhnə panel belə edirdi — redaktor niyə çıxarıldığını anlamır).

## R5 — Tərcümə semantikası və boş-locale qaydası

**Decision**: Köhnə mühərrikin qaydası qorunur: payload-da bir locale yalnız o zaman göndərilir ki,
onun **hər hansı** per-locale sahəsi boş olmasın (`defaultBuildPayload`). Səhifə və press reliz
formalarında köhnə "yalnız başlıq" qaydası da mühərrikin ümumi qaydasına keçirilir (başlıq
məcburi olduğundan nəticə eynidir). API PUT-da tərcümələr tam əvəzlənir → boş locale silinir; bu
gözlənilən davranışdır. Validasiya: "ən azı bir locale-də məcburi per-locale sahələr dolu" (Zod
`superRefine`) — köhnə mühərrik per-locale `required`-i yoxlamırdı, API 400 qaytarırdı; indi
müştəri tərəfində tutulur (FR-019).

**Rationale**: contracts/admin-api.md §3; spec FR-016.

## R6 — Siyahı: `DataTable` + `pagination` + URL state

**Decision**: Kit `DataTable` (Ant-formalı `columns/dataIndex/render`, səhifələmə yoxdur) +
`shared/ui/list-pagination.tsx` (kit `Pagination*` primitivləri, `page/pageCount/onChange`,
"N qeyd · səhifə X / Y" mətni i18n). Siyahı vəziyyəti URL search-də: `createCrudRoutes(config)`
`validateSearch`-i `FilterConfig[]`-dən Zod ilə qurur (`page: int≥1`, `search: string`, hər filtr
`string`); `.catch(undefined)` ilə yanlış dəyər səssiz atılır. Axtarış/filtr 400 ms debounce ilə
URL-ə yazılır (`replace: true`) və `page`-i silir. `placeholderData: keepPreviousData` +
`isFetching` spinner. Üç envelope: `paged` (`{items,total,page,pageSize}`), `items` (`{items}`),
`array` (bare) — `ModuleConfig.listEnvelope` üç dəyər alır; `transformItems` qruplu cavab üçün
qalır (info-lines). Sütun sortu **yoxdur** (API dəstəkləmir; köhnədə də yox) — `sort`
props verilmir. Sətir əməlləri `render` sütunu: Edit/Delete `IconButton` + `rowActions` slotu.
Kit `PaginationPrevious/Next` mətnləri ingiliscədir — bilinən kit problemi (spec D3), `aria-label`
i18n ilə verilir, görünən mətn kit düzəlişini gözləyir.

**Rationale**: Kit reference (data-table pagination yoxdur; `sort` yalnız controlled). Template D3
(URL state). API `pageSize` clamp etmir — panel `pageSize`-ı konfiqdən sabit göndərir.

**Alternatives**: `@tanstack/react-table` (root VI.3 qadağan); kit `VirtualList` (cədvəl deyil).

## R7 — Form: RHF + Zod dinamik sxem, sahə tipi → kit control

**Decision**: `CrudFormPage` `useForm` + `zodResolver(buildSchema(config))`; dəyərlər köhnə
konvensiya ilə **string** (checkbox boolean) saxlanılır, payload-da `coerceFieldValue` (eyni
cədvəl: number → 0/null, date → null, datetime → ISO, select → Number/null, media → Number/null).
Sahə tipi → control (kit `form` subpath: `FormField/FormItem/FormLabel/FormControl/FormMessage`):

| Tip | Control | Qeyd |
| --- | --- | --- |
| text | `Input` | |
| number | `InputNumber` və ya `Input type=number step=any` | dəyər string saxlanılır |
| date | `DatePicker` (`Date ↔ 'yyyy-MM-dd'`, kit `formatDate/parseDate`, `locale` i18n-dən) | |
| datetime | `Input type="datetime-local"` | kit `DatePicker` saat seçmir; kit `Input` native tipi dəstəkləyir; `isoToLocalInput/localInputToIso` qorunur |
| checkbox | `Checkbox` (`FormItem orientation=horizontal`) | |
| select | `Select` + `SelectTrigger clearable={nullable}`; `''` yalnız "seçilməyib" | seçim dəyəri həmişə string; option `value:''` qadağan |
| richtext | `RichTextEditor` (lazy) | R10 |
| media | `MediaIdField` | R8 |

Filtr `select`-ləri: `clearable` + placeholder `"{label}: hamısı"`. Locale tabları kit `Tabs`
(`az`/`en`, hər ikisi mount, `defaultValue='az'`); tab başlığında locale-də validasiya xətası varsa
`Badge colorPalette="red"`. Form reset route id dəyişəndə `key={id ?? 'new'}` ilə (köhnə model).
Ümumi xəta (`AppError.message`) `Alert variant="destructive"`; `fieldErrors` `setError` ilə sahəyə.
Uğur: `toast.success`, `invalidateQueries({queryKey: [config.id]})`, `navigate(basePath)`.

**Rationale**: Template V/VIII; kit `''` rezervi (Select/Combobox d.ts); kit `date-picker` yalnız
`date|month|year`. Icon-lar: kit `icons` (264) əksəriyyəti ödəyir; redaktor üçün çatışmayanlar
(bold, italic, link, undo, redo, table*, code, fullscreen…) kit `Icon` bazası + yerli path
(`features/rich-text/ui/editor-icons.tsx`) — Complexity Tracking.

**Alternatives**: Sentinel `__all__` dəyəri (clearable var, lazım deyil); `Combobox` (axtarışlı,
amma lookup siyahıları qısadır — yalnız gələcəkdə böyük lookup-lar üçün).

## R8 — Media: `Upload` `customRequest`, seçici, URL-siz kitabxana

**Decision**: `MediaPickerDialog` (kit `Dialog`, debounce axtarış, `pageSize=24`, `disabledIds`,
kart görünüşü mime ikonu ilə — API `url` vermir, önizləmə yoxdur; köhnə panel də ikon göstərirdi).
Yükləmə: kit `Upload variant="button"` `accept` ilə (jpg…xml siyahısı) və `customRequest` →
`mediaService.upload(file, onProgress)` (`axios` `FormData`, sahə adı `file`, `onUploadProgress`);
`onSuccess` → `invalidate(['media'])` + toast. `DELETE` 409 → `Alert` banner (mesaj API-dən).
`MediaIdField`: `#id · ad` + Dəyiş/Təmizlə; ad detail DTO-dan `mediaNameKey` (dot path) ilə.
Redaktora daxil edilən ünvanlar `/media/{id}` (nisbi, FR-024) — ictimai sayt bu yolu həll edir.

**Rationale**: Kit `Upload` HTTP-ni özü edir; `customRequest` `Authorization` header-i və
`AppError` axınını qoruyur. API `width/height` heç vaxt dolmur → "—".

## R9 — Sənəd bölmələri: üç açar konvensiyası

**Decision**: `features/assets`: (a) `AssetsSection` — press-releases/laws: `POST {mediaId}` (204),
`DELETE /{mediaId}`; (b) `PageAttachmentsSection` — `POST {mediaId, translations?, groupLabel?}`
(200 + DTO), `PUT /{assetId}` başlıqlar, `PUT /order {assetIds: tam siyahı}` (204),
`DELETE /{assetId}`; (c) `GalleryImagesSection` — `POST {mediaId}` (200), `PUT /order {imageIds}`,
`DELETE /{imageId}`. Sıralama yuxarı/aşağı `IconButton` ilə indeks dəyişimi → tam siyahı PUT.
Hər biri `onChanged` → valideyn detail invalidasiyası (`[config.id,'detail',id]`).

**Rationale**: contracts/admin-api.md §4, §9 — üç fərqli açar (mediaId / assetId / imageId) və
yalnız pages/galleries order endpoint-i verir.

## R10 — Rich text: TipTap 3.26, extension pariteti, sanitizasiya, CSS

**Decision**: `features/rich-text/model/extensions.ts` (React-siz) köhnə 4 xüsusi extension-ı
birə-bir daşıyır: `AccordionDetails` (Details + `data-accordion`, node view `open=true`),
`DetailsSummary`, `AccordionContent` (`details-content` + `detailsContent` parse, `details-content`
render, görünən node view), `MediaLink` (`data-media-link` boolean atribut), `EmbedFrame`
(`iframe`, 10 atribut, `priority: 40`), + `StarterKit({link:false})`, `TableKit({resizable:false})`,
`Image({inline:true})`, `Youtube({nocookie, 640×360})`, `TextAlign`, `TextStyleKit`; sıra eynidir.
`RichTextEditor` props `{value, onChange, editable?}` qorunur; xarici `value` sinxronu
`setContent(value, {emitUpdate:false})` ilə. Alət paneli kit `IconButton` + `Tooltip` +
`Separator`; rəng seçimi kit-də yoxdur → `Input type="color"` (kit `Input`, native). Link
`window.prompt` əvəzinə kit `Dialog` + `Input`. Önizləmə: kit `Dialog` + `sanitizeHtml(html)`
(`shared/lib/sanitize-html.ts`: DOMParser; `script/style/object/embed` silinir, `on*` atributları
silinir, `href/src` `javascript:`/`data:` (şəkil `data:image` istisna) təmizlənir; `iframe` saxlanılır)
→ `dangerouslySetInnerHTML` (spec D2). HTML mənbə rejimi kit `Textarea` (mono). Tam ekran
`fixed inset-0 z-[var(--ui-z-modal)] bg-background`. ProseMirror və önizləmə stilləri
`features/rich-text/ui/editor.css` — yalnız semantik tokenlər (`var(--border)`, `var(--muted)`,
`text-foreground`…), hex yoxdur. Editor komponenti `lazy` — TipTap chunk-ı yalnız richtext
form-larında yüklənir.

**Rationale**: Root VI.5; kit-də redaktor yoxdur (spec D1); template X.1 (D2).

**Alternatives**: DOMPurify (yeni dependency); önizləməni iframe `srcdoc` sandbox ilə (CSP
`frame-ancestors`/nginx qaydaları ilə toqquşur, stil paylaşımı çətinləşir).

## R11 — Round-trip gate: iki səviyyə

**Decision**: (1) `features/rich-text/roundtrip.test.ts` — vitest/jsdom; `fixtures/legacy-content.ts`
(köhnə cbar.az səhifələrindən götürülmüş 6 nümunə: accordion, cədvəl, media link, inline şəkil
linkli, YouTube, Google Maps iframe); hər nümunə `new Editor({extensions, content})` →
`getHTML()`; sayğaclar `details/table/tr/data-media-link/img/iframe` bərabər olmalıdır. `npm run
verify`-də işləyir — merge gate. (2) `scripts/roundtrip-check.mjs` — köhnə skript yol/credential
dəyişikliyi ilə (`API_URL`, `ADMIN_USER`, `ADMIN_PASSWORD` env, default lokal seed), extension-ları
öz içində saxlayır (`.mjs` TS import edə bilmir); `package.json` `roundtrip` skripti; uğursuzluqda
`process.exit(1)` (köhnədə yox idi). Cutover-dən əvvəl seed-lənmiş "Haqqımızda", "Pul siyasəti"
üzərində əl ilə işlədilir (quickstart).

**Rationale**: Root VIII.1–VIII.2, VI.5; `jsdom` artıq devDependency-dir.

## R12 — Səhifə ağacı: `DataTable` ilə düzləşdirilmiş sətirlər

**Decision**: `/pages/tree?locale=` bare array → `flattenTree(nodes)` (`depth`, `hasChildren`,
`descendantCount`) → kit `DataTable` (`rowKey=id`), başlıq sütunu `depth * 1.25rem` girinti +
`ChevronRightIcon` (uşaqlı) + başlıq + slug (`text-muted-foreground`) + `Badge` (status, qeyri-aktiv,
gizli); əməllər sütunu `DropdownMenu` (Alt səhifə, Redaktə, Köçür, Sil — `flags` ilə `disabled`).
Locale keçidi kit `Tabs` (`az`/`en`) URL search-də (`?locale=`). Köçürmə dialoqu: valideyn seçimi
kit `TreeSelect` (`treeData` = ağac, düyünün özü və nəsilləri `disabled`, `allowClear` = kök) +
`InputNumber` sıra → `POST /move {newParentId, sortOrder}`. Silmə dialoqu `descendantCount`
göstərir; 409 mesajı dialoqda.

**Rationale**: Kit `Tree` per-node render slotu və drag/drop vermir, badge/əməl yerləşdirmək üçün
`title: ReactNode`-a interaktiv element qoymaq klaviatura naviqasiyası ilə toqquşur; köhnə panel də
düz sətirlərlə işləyirdi. `TreeSelect` isə valideyn seçimi üçün ideal uyğundur.

**Alternatives**: Kit `Tree` (yuxarıdakı məhdudiyyətlər); iç-içə `Accordion` (cədvəl sütunları itir).

## R13 — Naviqasiya, bölmə tabları, breadcrumb

**Decision**: `nav.ts` `NavItem`-ə `group: 'content'|'media'|'homepage'|'finance'|'admin'` əlavə
olunur; `Sidebar` qrup başlığı (`nav:groups.*`, `text-muted-foreground uppercase text-xs`) ilə
render edir; `CommandPalette` eyni siyahını oxuyur. Aktivlik `pathname.startsWith(item.path)`
(alt route-lar üçün). Alt bölmələr (Qanunlar | Kateqoriyalar; MEAS ×3; Təşkilat ×3; Pul nişanları
×3; Videolar ×2; Ana səhifə ×7; Məzənnələr ×2) pathless layout route + `widgets/section-tabs`
(kit `Tabs variant="line"` + `TabsTrigger asChild → Link`). Breadcrumb: `useMatches()` +
`staticData: { crumb: 'nav:laws.label' }` hər route-da; `createCrudRoutes` list/new/:id üçün
avtomatik `crumb` verir (`crud:new`, `crud:edit`).

**Rationale**: Spec FR-007; template "yeni səhifə = dörd addım" konvensiyası genişlənir.

## R14 — Test strategiyası və MSW kontraktı

**Decision**: `shared/testing/handlers/<resource>.ts` (26 resurs) `contracts/admin-api.md`-yə
uyğun — envelope, status kodları, error gövdələri, `pageSize` default-ları, translations obyekt
forması; `fixtures/*.ts` + `factories.ts` seed-ə bənzər nümunələr (az/en). Handler-lər sadə
in-memory store ilə (yaratma → siyahıda görünür; silmə → yox olur) ki, testlər real axını yoxlasın.
Testlər: `renderApp('/laws')` səviyyəsində (router + providers + MSW): siyahı yüklənir, axtarış
URL-ə düşür, forma yaradır və toast görünür, silmə dialoqu təsdiqlə silir; mühərrik testləri bir
nümunə modul üzərində dərin, hər modul üçün ən azı "siyahı render + yaratma" smoke testi;
`sanitizeHtml`, `jwt`, `coerce`, `payload`, `normalizeApiError` unit testləri; `roundtrip.test.ts`.
`onUnhandledRequest: 'error'` qorunur — hər istifadə olunan endpoint-in handler-i olmalıdır.
Brauzer MSW yalnız `VITE_ENABLE_MSW=true` (dev default real API).

**Rationale**: Template VI; root VIII.2; kontrakt fixture-larda kodlaşır → backend dəyişəndə test
qırılır, səssiz itki olmur.

---

## Həll olunmuş qeyri-müəyyənliklər (xülasə)

| Sual | Cavab |
| --- | --- |
| İstifadəçi adı haradan? | JWT `preferred_username` (R4) |
| `/api/v1` harada? | `apiUrl`-də (R2) |
| Səhifələmə control-u? | `shared/ui/list-pagination` (R6) |
| Datetime sahəsi? | kit `Input type=datetime-local` (R7) |
| Select "hamısı"/"—"? | `clearable`, `''` = boş (R7) |
| Redaktor ikonları? | kit `Icon` bazası + yerli path (R7) |
| Media önizləmə? | Yoxdur — API URL vermir, ikon (R8) |
| Ağac komponenti? | `DataTable` düz sətirlər + `TreeSelect` köçürmə (R12) |
| Round-trip gate? | vitest fixture testi + canlı skript (R11) |
| Roles endpoint? | Yoxdur — `admin=1, moderator=2, meas_manager=3` sabit xəritə (data-model.md) |
