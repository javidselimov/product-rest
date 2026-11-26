/**
 * Deklarativ CRUD modul kontraktı (contracts/module-config.md §1). React-siz:
 * tiplər burada, render `features/crud`-dadır. Bütün mətnlər i18n AÇARIDIR —
 * konfiqdə hardcoded string yoxdur (template konstitusiyası Maddə I.2).
 */

import type { ColorPalette } from '@cbar/lib-react-ui-kit/lib'
import type { ComponentType, ReactNode } from 'react'
import type { ZodType } from 'zod'

import type { Locale, SelectOption } from '@/entities/content/model/types'

export type { Locale, SelectOption }

/** Generic sətir — API siyahı elementləri düz JSON obyektləridir. */
export type AnyRow = Record<string, unknown>

export const DEFAULT_LOCALES: readonly Locale[] = ['az', 'en']

export type ColumnRender = 'badge' | 'date' | 'datetime' | 'custom'

export interface ColumnConfig<Row extends AnyRow = AnyRow> {
  /** Sətir sahəsi; dot path dəstəklənir ("translations.az.title"). */
  key: string
  /** i18n açarı (namespace `config.ns`, və ya `ns:key` tam forma). */
  headerKey: string
  render?: ColumnRender
  /** render: 'badge' — String(value) → kit colorPalette. */
  badgePalette?: Record<string, ColorPalette>
  /** render: 'badge' — String(value) → i18n açarı. */
  badgeLabelKey?: Record<string, string>
  /** render: 'custom'. */
  renderCell?: (row: Row) => ReactNode
  width?: number | string
  align?: 'left' | 'center' | 'right'
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'time'
  | 'checkbox'
  | 'select'
  | 'richtext'
  | 'media'

/** The kind of file a media field takes: an image (logo) or a document (PDF, Word, Excel, archive). */
export type MediaAccept = 'image' | 'document'

export interface FieldConfig {
  name: string
  labelKey: string
  type: FieldType
  /** type: 'select'. */
  options?: SelectOption[]
  /** type: 'select' — a searchable list (`Combobox`), for lists too long to scan. */
  searchable?: boolean
  /** Select dəyərini payload-da rəqəmə çevir. */
  valueAsNumber?: boolean
  /** Sahə `translations[locale]` içindədir. */
  perLocale?: boolean
  /** Per-locale sahədə: ən azı bir locale-də dolu olmalıdır. */
  required?: boolean
  placeholderKey?: string
  helpKey?: string
  /** Boş select → null; number: `nullable === false` → 0 (default null). */
  nullable?: boolean
  /** Yaratma formunun ilkin dəyəri (input üçün string, checkbox üçün boolean). */
  defaultValue?: string | boolean
  /**
   * type: 'media' — detail DTO-da fayl adının dot path-ı ("media.originalName").
   * A searchable select uses it the same way: the name of a value outside `options`.
   * Per-locale sahədə `{locale}` tabın dili ilə əvəz olunur
   * ("translations.{locale}.mediaName").
   */
  mediaNameKey?: string
  /** type: 'media' — only these files can be picked (spec 053); the API refuses the others anyway. */
  mediaAccept?: MediaAccept
  min?: number
  max?: number
  step?: number | 'any'
}

export interface FilterConfig {
  /** Query-string parametri. */
  name: string
  labelKey: string
  /**
   * 'tabs' — seçimlər filtr kartında yox, cədvəlin üstündə tab çubuğu kimi
   * ("Hamısı" + hər option bir tab); dəyər yenə URL search param-ındadır.
   */
  type: 'text' | 'select' | 'date' | 'number' | 'tabs'
  options?: SelectOption[]
}

export interface CrumbConfig {
  labelKey: string
  path: string
}

/** Alt bölmə tabı (Qanunlar | Kateqoriyalar) — siyahı səhifəsinin üstündə. */
export interface SectionTabConfig {
  to: string
  labelKey: string
}

/** Form state: input-lar string, checkbox boolean. */
export type FormValues = Record<string, string | boolean>
export type FormTranslations = Record<string, Record<string, string>>

export interface FormShape {
  values: FormValues
  translations: FormTranslations
}

/** Form sxemi — giriş və çıxış tipi eynidir (RHF resolver üçün). */
export type FormSchema = ZodType<FormShape, FormShape>

export type ListEnvelope = 'paged' | 'items' | 'array'

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | undefined>
}

export interface ModuleConfig<
  Row extends AnyRow = AnyRow,
  Path extends string = string,
> {
  /** Unikal id — TanStack Query açar kökü VƏ invalidasiya hədəfi (B1). */
  id: string
  /** i18n namespace — `labelKey`/`headerKey` bu namespace-dədir. */
  ns: string
  /** API kökünə nisbi yol: "/laws". */
  apiPath: string
  /** Frontend baza route-u: "/laws" — siyahı; "/laws/new"; "/laws/$id". */
  basePath: Path
  titleKey: string
  /** Tək ad (düymə/dialoq); default titleKey. */
  entityKey?: string
  descriptionKey?: string
  /** Breadcrumb zənciri (bölmə səhifələri üçün valideyn bölmə). */
  crumbs?: CrumbConfig[]
  /** Siyahı səhifəsinin üstündəki alt bölmə tabları. */
  sectionTabs?: SectionTabConfig[]

  // ---- validation (B13) ----
  rowSchema?: ZodType<Row>
  detailSchema?: ZodType<AnyRow>
  lookupSchema?: ZodType<AnyRow>

  // ---- list ----
  columns: ColumnConfig<Row>[]
  listEnvelope: ListEnvelope
  pageSize?: number
  supportsSearch?: boolean
  searchParam?: string
  filters?: FilterConfig[]
  /** Envelope açıldıqdan sonra elementləri sətirlərə çevirir (qruplu cavablar). */
  transformItems?: (items: unknown[]) => Row[]
  /** Unikal açar + redaktə/silmə URL-lərində istifadə olunan id. Default row.id. */
  rowKey?: (row: Row) => string | number
  /** Əlavə sətir əməlləri (öz dialoq/mutation-larını saxlayır). */
  rowActions?: ComponentType<{ row: Row }>
  emptyKey?: string

  // ---- form ----
  fields: FieldConfig[]
  locales?: readonly Locale[]
  translationsKey?: string
  detailPath?: (id: string) => string
  updatePath?: (id: string) => string
  /**
   * The request body; `detail` is the loaded record on an edit form (null on create), for API fields the form does
   * not show but a save must send back (spec 054: a working paper's `legacyPageId`).
   */
  buildPayload?: (
    values: FormValues,
    translations: FormTranslations,
    detail: AnyRow | null,
  ) => unknown
  parseDetail?: (detail: AnyRow) => FormShape
  /**
   * Non-locale fields the create form fills from the URL (`/faq/new?topicId=3`). The list's
   * "new" button carries the active list filters of the same names, so a filtered list opens a
   * form with that choice made (spec 051).
   */
  prefillFromSearch?: readonly string[]
  /**
   * Extra query for the list's "new" button, derived from the rows on screen and the active filters; merged over the
   * `prefillFromSearch` values. The monthly reports open the form on the month after the newest one (spec 052).
   */
  newSearch?: (
    rows: Row[],
    filters: Record<string, string | undefined>,
  ) => Record<string, string>

  /**
   * The general field a 409 without field errors belongs to: its message shows under that field instead of the banner
   * (spec 054: a working paper's number taken in its year).
   */
  conflictField?: string

  /** Redaktə ekranında form-dan kənar bölmə (sənədlər, şəkillər). */
  editExtras?: ComponentType<{ id: string; detail: AnyRow }>
  /** Əlavə validasiya — baza sxemi genişləndirir. */
  schema?: (base: FormSchema) => FormSchema

  // ---- capabilities ----
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  deletePath?: (row: Row) => string
  /** i18n açarı; `{{name}}` = rowLabel(row). Default `crud:deleteConfirm`. */
  deleteConfirmKey?: string
  rowLabel?: (row: Row) => string
}

/** Literal `basePath` tipini saxlayan köməkçi — route tree ilə tiplənmə üçün. */
export function defineModule<Row extends AnyRow, Path extends string>(
  config: ModuleConfig<Row, Path>,
): ModuleConfig<Row, Path> {
  return config
}
