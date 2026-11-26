/**
 * Konfiqdən yaradılan siyahı səhifəsi (B2–B4, B9): axtarış, filtrlər (kartda;
 * `type: 'tabs'` filtri isə cədvəlin üstündə tab çubuğu), kit `DataTable`,
 * səhifələmə (yalnız paged), sətir əməlləri, silmə dialoqu.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import {
  DataTable,
  type DataTableColumn,
} from '@cbar/lib-react-ui-kit/data-table'
import { DatePicker } from '@cbar/lib-react-ui-kit/date-picker'
import { Field, FieldLabel } from '@cbar/lib-react-ui-kit/field'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import {
  EditIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cbar/lib-react-ui-kit/select'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { Tabs, TabsList, TabsTrigger } from '@cbar/lib-react-ui-kit/tabs'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { SEARCH_DEBOUNCE_MS } from '@/shared/constants/timing'
import { ACTIONS_COLUMN_WIDTH } from '@/shared/constants/ui'
import { dateStringToDate, dateToDateString } from '@/shared/crud/date-io'
import { getRowKey, nsKey } from '@/shared/crud/path'
import { prefillValues } from '@/shared/crud/schema'
import type { AnyRow, FilterConfig, ModuleConfig } from '@/shared/crud/types'
import { useDebounced } from '@/shared/lib/debounce'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { ListPagination } from '@/shared/ui/list-pagination'
import { PageHeader } from '@/shared/ui/page-header'
import { SectionTabs } from '@/shared/ui/section-tabs'
import { useCrudDelete, useCrudList } from '../hooks/use-crud'
import { useListUrlState } from '../hooks/use-list-url-state'
import { resolveModule } from '../model/module-registry'
import { renderCellValue } from './cell'

interface CrudListPageProps<Row extends AnyRow> {
  config: ModuleConfig<Row, string>
  /** Başlıq altında əlavə məzmun (bölmə tabları, upsert kartı). */
  above?: ReactNode
  /** Başlıq düymələrinə əlavə. */
  extraActions?: ReactNode
}

export function CrudListPage<Row extends AnyRow>({
  config,
  above,
  extraActions,
}: CrudListPageProps<Row>) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const url = useListUrlState(config)
  const pageSize = config.pageSize ?? DEFAULT_PAGE_SIZE

  const [searchText, setSearchText] = useState(url.search)
  const debouncedSearch = useDebounced(searchText, SEARCH_DEBOUNCE_MS)
  useEffect(() => {
    if (debouncedSearch !== url.search) url.setSearch(debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const list = useCrudList(config, {
    page: config.listEnvelope === 'paged' ? url.page : undefined,
    pageSize: config.listEnvelope === 'paged' ? pageSize : undefined,
    search: url.search || undefined,
    filters: url.filters,
  })
  const remove = useCrudDelete(config)
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null)

  const canCreate = config.canCreate ?? true
  const canEdit = config.canEdit ?? true
  const canDelete = config.canDelete ?? true
  const RowActions = config.rowActions
  const rowLabel = (row: Row) =>
    config.rowLabel ? config.rowLabel(row) : String(getRowKey(config, row))

  const columns = useMemo<DataTableColumn<Row>[]>(() => {
    const cols: DataTableColumn<Row>[] = config.columns.map((column) => ({
      key: column.key,
      title: t(nsKey(config.ns, column.headerKey)),
      width: column.width,
      align: column.align,
      render: (_value, record) =>
        renderCellValue(column, record, t, config.ns, i18n.language),
    }))
    if (canEdit || canDelete || RowActions) {
      cols.push({
        key: '__actions',
        title: t('crud:actions'),
        align: 'right',
        width: ACTIONS_COLUMN_WIDTH,
        render: (_value, record) => (
          <div className="flex items-center justify-end gap-1">
            {RowActions ? <RowActions row={record} /> : null}
            {canEdit ? (
              <IconButton
                size="sm"
                variant="ghost"
                colorPalette="black"
                aria-label={`${t('crud:edit')}: ${rowLabel(record)}`}
                onClick={() =>
                  router.history.push(
                    `${config.basePath}/${getRowKey(config, record)}`,
                  )
                }
              >
                <EditIcon />
              </IconButton>
            ) : null}
            {canDelete ? (
              <IconButton
                size="sm"
                variant="ghost"
                colorPalette="red"
                aria-label={`${t('crud:delete')}: ${rowLabel(record)}`}
                onClick={() => {
                  remove.reset()
                  setDeleteTarget(record)
                }}
              >
                <TrashIcon />
              </IconButton>
            ) : null}
          </div>
        ),
      })
    }
    return cols
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, t, i18n.language, canEdit, canDelete, RowActions])

  const items = list.data?.items ?? []
  const total = list.data?.total ?? items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const title = t(nsKey(config.ns, config.titleKey))
  const tabFilters = (config.filters ?? []).filter((f) => f.type === 'tabs')
  const cardFilters = (config.filters ?? []).filter((f) => f.type !== 'tabs')
  const hasFilters = Boolean(config.supportsSearch || cardFilters.length)

  return (
    <>
      <PageHeader
        title={title}
        description={
          config.descriptionKey
            ? t(nsKey(config.ns, config.descriptionKey))
            : undefined
        }
        trail={(config.crumbs ?? []).map((c) => ({
          label: t(c.labelKey),
          path: c.path,
        }))}
        actions={
          <>
            {extraActions}
            {canCreate ? (
              <Button
                onClick={() => {
                  const query = new URLSearchParams({
                    ...prefillValues(config.prefillFromSearch, url.filters),
                    ...config.newSearch?.(items, url.filters),
                  }).toString()
                  router.history.push(
                    `${config.basePath}/new${query ? `?${query}` : ''}`,
                  )
                }}
              >
                <PlusIcon size={16} />
                {t('crud:new')}
              </Button>
            ) : null}
          </>
        }
      />

      {config.sectionTabs ? <SectionTabs tabs={config.sectionTabs} /> : null}
      {above}

      {hasFilters ? (
        <Card>
          <CardContent className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
            {config.supportsSearch ? (
              <Field>
                <FieldLabel htmlFor={`${config.id}-search`}>
                  {t('crud:search')}
                </FieldLabel>
                <Input
                  id={`${config.id}-search`}
                  placeholder={t('crud:searchPlaceholder')}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  startElement={<SearchIcon size={16} />}
                />
              </Field>
            ) : null}
            {cardFilters.map((filter) => (
              <FilterControl
                key={filter.name}
                ns={config.ns}
                id={`${config.id}-${filter.name}`}
                filter={filter}
                value={url.filters[filter.name] ?? ''}
                onChange={(v) => url.setFilter(filter.name, v)}
              />
            ))}
            {list.isFetching && !list.isPending ? (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Spinner className="size-4" />
                {t('crud:refreshing')}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {tabFilters.map((filter) => (
        <FilterTabs
          key={filter.name}
          ns={config.ns}
          filter={filter}
          value={url.filters[filter.name] ?? ''}
          onChange={(v) => url.setFilter(filter.name, v)}
        />
      ))}

      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      ) : !list.isPending && items.length === 0 ? (
        <EmptyState
          title={t(
            config.emptyKey ? nsKey(config.ns, config.emptyKey) : 'crud:empty',
          )}
          description={t('crud:emptyHint')}
        />
      ) : (
        <DataTable
          aria-label={title}
          columns={columns}
          data={items}
          rowKey={(record) => getRowKey(config, record)}
          loading={list.isPending}
          scroll={{ x: true }}
        />
      )}

      {config.listEnvelope === 'paged' && total > 0 ? (
        <ListPagination
          page={url.page}
          pageCount={pageCount}
          total={total}
          onPageChange={url.setPage}
        />
      ) : null}

      <DeleteDialog
        open={deleteTarget !== null}
        title={t('crud:deleteTitle')}
        description={
          deleteTarget
            ? t(
                config.deleteConfirmKey
                  ? nsKey(config.ns, config.deleteConfirmKey)
                  : 'crud:deleteConfirm',
                {
                  name: rowLabel(deleteTarget),
                },
              )
            : ''
        }
        isPending={remove.isPending}
        error={remove.error}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          remove.mutate(deleteTarget, {
            onSuccess: () => setDeleteTarget(null),
          })
        }}
      />
    </>
  )
}

interface FilterControlProps {
  ns: string
  id: string
  filter: FilterConfig
  value: string
  onChange: (value: string | undefined) => void
}

function FilterControl({
  ns,
  id,
  filter,
  value,
  onChange,
}: FilterControlProps) {
  const { t, i18n } = useTranslation()
  const label = t(nsKey(ns, filter.labelKey))
  const [text, setText] = useState(value)
  const debounced = useDebounced(text, SEARCH_DEBOUNCE_MS)
  useEffect(() => {
    if (
      filter.type !== 'select' &&
      filter.type !== 'date' &&
      debounced !== value
    )
      onChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  if (filter.type === 'select') {
    return (
      <Field>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Select value={value} onValueChange={(v) => onChange(v || undefined)}>
          <SelectTrigger id={id} clearable aria-label={label}>
            <SelectValue placeholder={t('crud:filterAll', { label })} />
          </SelectTrigger>
          <SelectContent>
            {(filter.options ?? []).map((o) => (
              <SelectItem key={String(o.value)} value={String(o.value)}>
                {o.labelKey
                  ? t(nsKey(ns, o.labelKey))
                  : (o.label ?? String(o.value))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    )
  }
  if (filter.type === 'date') {
    return (
      <Field>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <DatePicker
          id={id}
          value={dateStringToDate(value)}
          onChange={(d) => onChange(dateToDateString(d) || undefined)}
          format="dd.MM.yyyy"
          locale={i18n.language.startsWith('en') ? 'en-GB' : 'az-AZ'}
          aria-label={label}
        />
      </Field>
    )
  }
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={filter.type === 'number' ? 'number' : 'text'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </Field>
  )
}

/** `''` kit Tabs-da da rezervdir — "Hamısı" tabı üçün ayrıca dəyər. */
const ALL_TAB = '__all'

/**
 * `type: 'tabs'` filtri: "Hamısı" + hər option bir tab, cədvəlin üstündə.
 * Section tablarından fərqlənsin deyə `subtle` variantı; dəyər URL-dədir.
 */
function FilterTabs({
  ns,
  filter,
  value,
  onChange,
}: Omit<FilterControlProps, 'id'>) {
  const { t } = useTranslation()
  const label = t(nsKey(ns, filter.labelKey))
  return (
    <Tabs
      value={value || ALL_TAB}
      onValueChange={(v) => onChange(v === ALL_TAB ? undefined : v)}
    >
      <TabsList variant="subtle" aria-label={label}>
        <TabsTrigger value={ALL_TAB}>{t('crud:all')}</TabsTrigger>
        {(filter.options ?? []).map((o) => (
          <TabsTrigger key={String(o.value)} value={String(o.value)}>
            {o.labelKey
              ? t(nsKey(ns, o.labelKey))
              : (o.label ?? String(o.value))}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

/** Route komponenti: modulu cari yoldan tapır (`module-registry`). */
export function CrudListPageRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const config = resolveModule(pathname)
  if (!config) throw new Error(`CRUD modulu tapılmadı: ${pathname}`)
  return <CrudListPage config={config} />
}
