# Contract: Deklarativ CRUD modul konfiqi (`ModuleConfig`)

Yer: `src/shared/crud/types.ts` (tiplər, React-siz), `src/features/crud/*` (render).
Köhnə `web-cbar-admin/src/crud/types.ts`-in **konsepsiya** varisidir; fərqlər §4-də.

## 1. Tiplər

```ts
export type AnyRow = Record<string, unknown>
export type Locale = 'az' | 'en'
export const DEFAULT_LOCALES: readonly Locale[] = ['az', 'en']

export interface SelectOption { value: string | number; labelKey?: string; label?: string }
//   labelKey → t(labelKey); label yalnız API-dən gələn (lookup) mətn üçün

export type ColumnRender = 'badge' | 'date' | 'datetime' | 'custom'

export interface ColumnConfig<Row extends AnyRow = AnyRow> {
  key: string                      // dot path dəstəklənir: "translations.az.title"
  headerKey: string                // i18n açarı (namespace: config.ns)
  render?: ColumnRender
  badgePalette?: Record<string, ColorPalette>   // kit colorPalette: primary|secondary|tertiary|black|red|green|yellow
  badgeLabelKey?: Record<string, string>        // String(value) → i18n açarı
  renderCell?: (row: Row) => ReactNode          // render: 'custom'
  width?: number | string
  align?: 'left' | 'center' | 'right'
}

export type FieldType = 'text' | 'number' | 'date' | 'datetime' | 'checkbox' | 'select' | 'richtext' | 'media'

export interface FieldConfig {
  name: string
  labelKey: string
  type: FieldType
  options?: SelectOption[]         // select
  valueAsNumber?: boolean          // select → Number(value)
  perLocale?: boolean              // translations[locale][name]
  required?: boolean               // text/number/date/datetime/select/media; per-locale üçün "ən azı bir locale"
  placeholderKey?: string
  helpKey?: string
  nullable?: boolean               // select: '' → null; number: '' → null (default: number/date/datetime null)
  defaultValue?: string | boolean
  mediaNameKey?: string            // media: detail-də ad yolu, məs. "media.originalName"
  min?: number; max?: number; step?: number | 'any'   // number
}

export interface FilterConfig {
  name: string                     // query param
  labelKey: string
  type: 'text' | 'select' | 'date' | 'number' | 'tabs'   // tabs: kartda yox, cədvəl üstündə tab çubuğu ("Hamısı" + options)
  options?: SelectOption[]
}

export type FormValues = Record<string, string | boolean>
export type FormTranslations = Record<Locale, Record<string, string>>

export interface ModuleConfig<Row extends AnyRow = AnyRow> {
  id: string                       // query key kökü VƏ invalidasiya hədəfi: [id]
  ns: string                       // i18n namespace (labelKey/headerKey bu namespace-dədir)
  apiPath: string                  // API kökünə nisbi: "/laws"
  basePath: string                 // "/laws" — list; "/laws/new"; "/laws/$id"
  titleKey: string                 // siyahı başlığı
  entityKey?: string               // tək ad (düymə/dialoq), default titleKey

  // ---- list ----
  columns: ColumnConfig<Row>[]
  listEnvelope: 'paged' | 'items' | 'array'
  pageSize?: number                // default 20 (media 24, azir/info-lines 50)
  supportsSearch?: boolean
  searchParam?: string             // default 'search'
  filters?: FilterConfig[]
  transformItems?: (items: unknown[]) => Row[]
  rowKey?: (row: Row) => string | number      // default row.id
  rowActions?: ComponentType<{ row: Row }>    // öz dialoq/mutation-larını saxlayır
  emptyKey?: string

  // ---- validation (template konstitusiyası Maddə X.2) ----
  rowSchema?: ZodType<Row>          // siyahı elementi; default z.record(z.unknown()) — envelope forması həmişə yoxlanır
  detailSchema?: ZodType<AnyRow>    // detail DTO; default rowSchema
  lookupSchema?: ZodType<AnyRow>    // useLookupOptions üçün; default { id, translations? }

  // ---- form ----
  fields: FieldConfig[]
  locales?: readonly Locale[]
  translationsKey?: string         // default 'translations'
  detailPath?: (id: string) => string
  updatePath?: (id: string) => string
  buildPayload?: (values: FormValues, translations: FormTranslations) => unknown
  parseDetail?: (detail: AnyRow) => { values: FormValues; translations: FormTranslations }
  editExtras?: ComponentType<{ id: string; detail: AnyRow }>   // form-dan kənar, öz invalidasiyası
  schema?: (base: ZodObject) => ZodTypeAny                     // əlavə validasiya (superRefine)

  // ---- capabilities ----
  canCreate?: boolean; canEdit?: boolean; canDelete?: boolean   // default true
  deletePath?: (row: Row) => string
  deleteConfirmKey?: string        // i18n açarı; interpolyasiya {{name}} = rowLabel(row)
  rowLabel?: (row: Row) => string  // dialoq/toast-da qeydin adı
}
```

## 2. Davranış kontraktı (mühərrik bunları TƏMİN EDİR)

| # | Qayda |
| --- | --- |
| B1 | Query açarları: `[id, 'list', { page, search, ...filters }]`, `[id, 'detail', rowId]`, `[id, 'options']`. Uğurlu save/delete → `invalidateQueries({ queryKey: [id] })` — lookup-lar da yenilənir |
| B2 | `listEnvelope`: `paged` → `{items,total}` + səhifələmə control-u; `items` → `{items}`, control yoxdur; `array` → bare, control yoxdur. `transformItems` unwrap-dan sonra |
| B3 | Siyahı vəziyyəti URL search-dədir (Zod `validateSearch`); axtarış/filtr dəyişəndə `page` silinir; 400 ms debounce; `placeholderData: keepPreviousData` |
| B4 | Hüceyrə: `custom` → `renderCell(row)`; `date` → `formatDate`; `datetime` → `formatDateTime`; `badge` → kit `Badge variant="subtle" colorPalette=badgePalette[v] ?? 'black'` + `t(badgeLabelKey[v]) ?? String(v)`; null/undefined/'' → `—` |
| B5 | Form dəyərləri string (checkbox boolean); route id dəyişəndə `key` ilə reset; detail `parseDetail ?? defaultParseDetail` (datetime → local input, date → `slice(0,10)`) |
| B6 | Payload `buildPayload ?? defaultBuildPayload`: qeyri-locale sahələr `coerceFieldValue` ilə; per-locale: locale yalnız hər hansı sahəsi dolu olanda daxil edilir (`translations` obyekti); `coerceFieldValue` cədvəli köhnə ilə eynidir |
| B7 | Validasiya (Zod, `zodResolver`): `required` text/select/media → `min(1)`; number → rəqəm; date/datetime → format; per-locale `required` → "ən azı bir locale-də dolu" (`superRefine`, xəta `translations` kökündə və tab nişanı); `schema` hook əlavə qaydalar |
| B8 | Xəta: `AppError.fieldErrors` → `setError(field)`; ümumi → `Alert destructive`; save uğuru → `toast.success(t('crud:saved'))` + navigate `basePath` |
| B9 | Silmə: `widgets/delete-dialog` (`Dialog showCloseButton=false`, `role` alert), mətn `t(deleteConfirmKey ?? 'crud:deleteConfirm', { name })`, xəta dialoq içində, uğur → toast + invalidate |
| B10 | Etiketlər: bütün `*Key` sahələri `t(key, { ns })` ilə; konfiqdə hardcoded mətn yoxdur; locale sahə etiketi `t(labelKey) + ' (AZ)'` |
| B11 | `rowActions` və `editExtras` slotları köhnə ilə eyni interfeysdə; `editExtras` form-dan kənar, `detail` alır |
| B12 | `canCreate/canEdit/canDelete` yalnız UI görünürlüyü; icazə yoxlaması backend-dədir |
| B13 | Hər API cavabı Zod ilə yoxlanır: `crud.service.list` envelope sxemini (`paged`: `{items, total, page, pageSize}`; `items`: `{items}`; `array`: massiv) `listEnvelope`-a görə, elementləri `rowSchema` ilə (`.passthrough()` — əlavə sahə xəta deyil), `detail` → `detailSchema`, lookup → `lookupSchema`; uyğunsuzluq `AppError{code:'CONTRACT'}` olur və siyahının error state-ində görünür (səssiz cast yoxdur) |

## 3. Route generatoru

```ts
createCrudRoutes(parent, config, { list?: Component, form?: Component }) → [
  Route(basePath,        validateSearch: listSearchSchema(config), component: list ?? CrudListPage, staticData: { crumb: titleKey }),
  Route(basePath+'/new', component: form ?? CrudFormPage, staticData: { crumb: 'crud:new' }),
  Route(basePath+'/$id', component: form ?? CrudFormPage, staticData: { crumb: 'crud:edit' }),
]
```
`list`/`form` override xüsusi ekranlar üçün (users form, yield-curves form, pages).

## 4. Köhnə `ModuleConfig`-dən fərqlər

| Köhnə | Yeni | Səbəb |
| --- | --- | --- |
| `label`, `header`, `title` mətn | `labelKey`, `headerKey`, `titleKey` (+ `ns`) | Template I.2 — hardcoded string qadağan |
| `badgeColors: Record<string,string>` (Chakra palitrası: gray/orange/purple) | `badgePalette: Record<string, ColorPalette>` (kit 7 palitra) | Kit III.3 |
| `listEnvelope: 'paged'\|'array'` + `transformItems(unwrapItems)` | `'paged'\|'items'\|'array'` | API üç envelope verir; unwrap trick-i lazım deyil |
| `deleteConfirmText(row)` | `deleteConfirmKey` + `rowLabel(row)` | i18n |
| Validasiya yalnız qeyri-locale `required` | Zod sxemi + per-locale "ən azı bir" + `schema` hook | FR-019 |
| `apiPath: '/api/v1/laws'` | `'/laws'` | prefiks `apiUrl`-də (research R2) |
| `basePath: '/laws/:id'` (React Router) | `'/laws/$id'` (TanStack) | Router |
| Filtrlər lokal state | URL search | Template D3 |

## 5. Nümunə (laws)

```ts
export const lawsModule = (categories: SelectOption[]): ModuleConfig => ({
  id: 'laws', ns: 'laws', apiPath: '/laws', basePath: '/laws', titleKey: 'title', entityKey: 'entity',
  listEnvelope: 'paged', supportsSearch: true,
  filters: [
    { name: 'categoryId', labelKey: 'fields.category', type: 'select', options: categories },
    { name: 'status', labelKey: 'fields.status', type: 'select', options: CONTENT_STATUS_OPTIONS },
  ],
  columns: [
    { key: 'id', headerKey: 'columns.id', width: 72 },
    { key: 'title', headerKey: 'columns.title' },
    { key: 'categoryId', headerKey: 'columns.category', render: 'custom', renderCell: (r) => optionLabel(categories, r.categoryId) },
    { key: 'type', headerKey: 'columns.type', render: 'badge', badgeLabelKey: { 1: 'type.law', 2: 'type.regulation' } },
    { key: 'status', headerKey: 'columns.status', render: 'badge', badgePalette: STATUS_PALETTE, badgeLabelKey: STATUS_LABEL_KEYS },
    { key: 'publishedAt', headerKey: 'columns.publishedAt', render: 'datetime' },
  ],
  fields: [
    { name: 'categoryId', labelKey: 'fields.category', type: 'select', options: categories, valueAsNumber: true, required: true },
    { name: 'type', labelKey: 'fields.type', type: 'select', options: LAW_TYPE_OPTIONS, valueAsNumber: true },
    { name: 'status', labelKey: 'fields.status', type: 'select', options: CONTENT_STATUS_OPTIONS },
    { name: 'publishedAt', labelKey: 'fields.publishedAt', type: 'datetime' },
    { name: 'title', labelKey: 'fields.title', type: 'text', perLocale: true, required: true },
    { name: 'description', labelKey: 'fields.description', type: 'richtext', perLocale: true },
  ],
  editExtras: LawAttachmentsSection,
  rowLabel: (r) => String(r.title ?? r.id),
  rowSchema: lawListItemSchema,      // z.object({ id, categoryId, type, status, publishedAt, updatedAt, title }).passthrough()
  detailSchema: lawDetailSchema,     // + translations, assets
})
```
