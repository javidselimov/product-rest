# Data Model: Admin panelinin `new-template` üzərində yenidən qurulması

**Faza 1** | Spec: [spec.md](./spec.md) | Kontrakt: [contracts/admin-api.md](./contracts/admin-api.md)

Panel məlumat saxlamır; bu sənəd **frontend domain modelini** (entity tipləri, form dəyər
modeli, validasiya, vəziyyət keçidləri) təsvir edir. Server sxemi `api-cbar-admin`-dədir və
dəyişmir.

## 1. Ortaq tiplər (`entities/content`)

```ts
type Locale = 'az' | 'en'
type Translations<T> = Partial<Record<Locale, T>>
type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived'
const STATUS_PALETTE: Record<ContentStatus, ColorPalette> = { draft: 'black', scheduled: 'yellow', published: 'green', archived: 'secondary' }
const ACTIVE_PALETTE = { true: 'green', false: 'black' }
```

Qaydalar: bir qeyd bir locale-də dolu, digərində boş ola bilər (siyahı `az → en → "—"`);
status keçidləri sərbəstdir (API iş axını tətbiq etmir); `scheduled` yalnız tarixli məzmunda
(pages-də yoxdur).

## 2. Auth (`entities/user`, `features/auth`)

```ts
type RoleCode = 'admin' | 'moderator' | 'meas_manager'
type Permission = 'content.manage' | 'media.manage' | 'finance.manage' | 'users.manage' | 'settings.manage'
interface AuthUser { id: string; username: string; name: string; roleCode: RoleCode; permissions: Permission[] }
interface Session { accessToken: string; expiresAt: string /* ISO */ }
```

JWT payload sxemi (Zod): `sub: string`, `preferred_username: string`,
`'http://schemas.microsoft.com/ws/2008/06/identity/claims/role' | role: RoleCode`, `exp: number`.
Rol → icazə xəritəsi: `admin` → hamısı; `moderator`, `meas_manager` → `users.manage` istisna
hamısı (bu spec-də heç bir ekran `<Can>` ilə bağlanmır — spec Assumptions).
Rol id xəritəsi (form üçün): `admin=1, moderator=2, meas_manager=3`.

**Vəziyyət**: `anonymous` → (`login` 200) → `authenticated{expiresAt}` → (`exp` taymeri | 401 |
logout) → `anonymous`. Səhifə yeniləməsi: `restore()` snapshot → ilk 401 → `anonymous`
(`redirect` ilə geri qayıdış).

## 3. Məzmun entity-ləri

| Entity | Sahələr (detail) | Tərcümə sahələri | Validasiya (müştəri) | Alt-resurs |
| --- | --- | --- | --- | --- |
| **Page** | `id, parentId?, sortOrder, status(draft\|published\|archived), showInFooter, navUrl?, flags: PageFlags(14)` | `title*, slug?, content?` | ən azı bir locale-də `title`; `readonly\|disabled` → sahələr kilidli | `assets: PageAsset[]` (başlıq az/en, `groupLabel`, sıra) |
| **PageNode** (ağac) | `id, parentId, sortOrder, status, title?, slug?, navUrl?, flags, children[]` — törəmə: `depth, descendantCount` | | köçürmə: hədəf ≠ özü və nəsilləri (UI-də disabled) | |
| **PressRelease** | `id, status, publishedAt?` | `title*, content?` | ən azı bir `title` | `assets` (mediaId) |
| **Law** | `id, categoryId*, type(1\|2), status, publishedAt?` | `title*, description?` | `categoryId` məcburi | `assets` (mediaId) |
| **LawCategory** | `id, sortOrder, isActive` | `name*` | | |
| **MeasDocument** | `id, emitentId*, infoTypeId*, regDate*, dqn, mediaId?, status` | — | üç məcburi sahə | tək fayl `mediaId` |
| **MeasEmitent / MeasInfoType** | `id, isActive` | `name*` | | |
| **Division** | `id, sortOrder, isActive, mediaId?` | `name*, description?(rich)` | | |
| **Office** | `id, sortOrder, isActive` | `name*, address?, phone?` | | |
| **StaffMember** | `id, type(1\|2), sortOrder, isActive, phone?, mediaId?` | `fullName*, position?, receptionDays?, bio?(rich)` | | |
| **MoneyMark** | `id, categoryId*, type(1\|2), frontMediaId?, rearMediaId?, sortOrder, status` | `title*, description?(rich), securityFeatures?(rich)` | | |
| **MoneyMarkCategory** | `id, sortOrder, isActive` | `name*` | | |
| **MoneyMarkNews** | `id, status, publishedAt?` | `title*, content?(rich)` | | |
| **Gallery** | `id, eventDate?, sortOrder, isActive` | `title*` | | `images: [{id, mediaId, originalName, sortOrder}]` |
| **Video** | `id, youtubeUrl*, publishedAt?, sortOrder, isActive` | `title*` | URL formatı | |
| **VideoStream** | `id, streamUrl*, isLive, startsAt?` | `title*` | | |
| **Banner** | `id, mediaId?, sortOrder, isActive, startsAt?, endsAt?` | `title?, link?` | tərcümə optional (şəkil-only ola bilər) | |
| **NewsSlide** | `id, newsDate*, mediaId?, sortOrder, isActive` | `title*, description?, link?` | | |
| **RunningLine** | `id, isActive, startsAt?, endsAt?` | `text*` | | |
| **HomepageLink** | `id, sortOrder, isActive` | `title*, url*` | | |
| **HomepagePublication** | `id, mediaId?, publishedAt?, sortOrder, isActive` | `title*, url?` | | |
| **InfoLine** | `id, alias*(13 sabit), year?, sortOrder, isActive` | `title*, value?` | alias siyahıdan | siyahı qruplu gəlir → düzləşdirilir |

`*` = məcburi. `(rich)` = zəngin mətn HTML.

## 4. Media (`entities/media`)

```ts
interface MediaItem { id: number; originalName: string; mimeType: string; sizeBytes: number; width: null; height: null; createdAt: string }
interface AttachedAsset { mediaId: number; originalName?: string; mimeType?: string; sizeBytes?: number }
```
Törəmə: `formatBytes(sizeBytes)`, `iconForMime(mimeType)` (kit ikonları: image → `ImageIcon`, pdf/doc
→ `DocumentIcon`, sheet → `ColumnsIcon`, zip → `FolderIcon`, xml → `FileIcon`, else `FileIcon`).
İcazəli uzantılar: jpg jpeg png gif webp svg pdf xlsx xls docx doc zip xml (+ API rar qəbul edir;
UI köhnə siyahını saxlayır). Vəziyyət: `uploading{percent}` → `done` | `error`.
Silmə: `attached` (409) → banner; `free` → silinir.

## 5. Maliyyə modelləri

| Entity | Sahələr | Validasiya | Vəziyyət |
| --- | --- | --- | --- |
| **CurrencyRateSheet** | `date, rates: [{currencyCode, nominal, nameAz, rate}]` | hər `rate` rəqəm > 0; kod unikal; vərəq boş deyil | `loaded(date)` → `draft(newDate, dirty)` → (PUT) → `loaded`; `deleteSheet(date)` |
| **Currency** | `code, nominal, sortOrder, isActive, showOnHomepage, nameAz, nameEn` | `sortOrder` tam ədəd | seyrək `dirty: Map<code, Partial<{sortOrder,isActive,showOnHomepage}>>`; saxla → ardıcıl PUT; uğurda `dirty` təmizlənir |
| **AzirValue** | `id, valueDate, term(1D\|1W\|1M), rate` | tarix, term, rate rəqəm | upsert (eyni tarix+term → yenilənir) |
| **InflationParam** | `id, year, month(1–12), parameterCode(cpi_yoy\|target), value` | il 4 rəqəm, ay 1–12, dəyər rəqəm | upsert |
| **YieldCurve** | `id, curveDate, parameters?: {beta0,beta1,beta2,lambda}, yields: [{period, yield}]` | parametr qrupu aktivdirsə 4-ü də rəqəm; `period` boş deyil və unikal; `yield` rəqəm; tam boş sətirlər atılır | `parameters: null` → parametr silinir |

## 6. İdarəetmə

| Entity | Sahələr | Validasiya |
| --- | --- | --- |
| **User** | `id, username, email, roleId, roleCode, isActive, createdAt` | create: `username*`, `email*` (format), `password*` (≥8, böyük, kiçik, rəqəm, xüsusi — API siyasəti ilə eyni, göstəriş i18n), `roleId*`; update: `email*, roleId*, isActive` (username kilidli) |
| **PasswordReset** | `newPassword` | eyni siyasət |
| **Setting** | `key, value: JsonValue, updatedAt` | `key` boş deyil (yeni), `value` `JSON.parse` keçir; xəta mesajı parser-dən |

## 7. Form dəyər modeli (mühərrik)

```ts
FormValues       = Record<string, string | boolean>   // input-lar string; checkbox boolean
FormTranslations = Record<Locale, Record<string, string>>
```
Coercion (payload): `number: '' → nullable===false ? 0 : null, else Number`; `date: '' → null`;
`datetime: localInputToIso`; `select: '' && nullable → null; valueAsNumber → Number`; `media: '' →
null, else Number`; `checkbox → boolean`; `text → string`. Detail → form: `datetime → isoToLocalInput`,
`date → slice(0,10)`, null → `''`.

## 8. Naviqasiya modeli

```ts
interface NavItem { path: To; key: string; icon: Icon; group: 'content'|'media'|'homepage'|'finance'|'admin' }
interface SectionTab { to: To; labelKey: string }
staticData: { crumb: string /* i18n açarı */ }
```

## 9. URL state modeli (siyahılar)

`{ page?: int≥1, search?: string, [filter.name]?: string }` — Zod `validateSearch`, `.catch(undefined)`;
səhifə ağacı: `{ locale?: 'az'|'en' }`; giriş: `{ redirect?: string }`.
