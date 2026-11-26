/**
 * Generic CRUD servisi (B13): hər cavab Zod ilə parse olunur — envelope
 * `listEnvelopeSchema`, sətir `rowSchema`, detail `detailSchema`, lookup
 * `lookupSchema`. Forma uyğunsuzluğu `AppError{code:'CONTRACT'}` olur.
 */

import { ZodError, type ZodType } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import {
  DEFAULT_LOOKUP_SCHEMA,
  DEFAULT_ROW_SCHEMA,
  listEnvelopeSchema,
  type ListResult,
} from '@/shared/crud/envelope-schema'
import { getRowKey } from '@/shared/crud/path'
import type { AnyRow, ListParams, ModuleConfig } from '@/shared/crud/types'

function parseOr<T>(schema: ZodType<T>, raw: unknown, where: string): T {
  try {
    return schema.parse(raw)
  } catch (error) {
    if (error instanceof ZodError) {
      throw contractError(`${where}: ${error.issues[0]?.path.join('.') ?? ''}`)
    }
    throw error
  }
}

const toQuery = (params: ListParams): Record<string, string | number> => {
  const query: Record<string, string | number> = {}
  if (params.page) query.page = params.page
  if (params.pageSize) query.pageSize = params.pageSize
  if (params.search) query.search = params.search
  for (const [key, value] of Object.entries(params.filters ?? {})) {
    if (value !== undefined && value !== '') query[key] = value
  }
  return query
}

export const crudService = {
  async list<Row extends AnyRow>(
    config: ModuleConfig<Row, string>,
    params: ListParams,
  ): Promise<ListResult<Row>> {
    const query = toQuery(params)
    if (
      params.search &&
      config.searchParam &&
      config.searchParam !== 'search'
    ) {
      delete query.search
      query[config.searchParam] = params.search
    }
    const raw = await apiClient.get<unknown>(config.apiPath, { params: query })
    const rowSchema = (config.rowSchema ?? DEFAULT_ROW_SCHEMA) as ZodType<Row>
    const result = parseOr(
      listEnvelopeSchema(config.listEnvelope, rowSchema),
      raw,
      `${config.id}.list`,
    )
    const items = config.transformItems
      ? config.transformItems(result.items)
      : result.items
    return { items, total: result.total }
  },

  async detail<Row extends AnyRow>(
    config: ModuleConfig<Row, string>,
    id: string,
  ): Promise<AnyRow> {
    const path = config.detailPath?.(id) ?? `${config.apiPath}/${id}`
    const raw = await apiClient.get<unknown>(path)
    const schema = (config.detailSchema ??
      config.rowSchema ??
      DEFAULT_ROW_SCHEMA) as ZodType<AnyRow>
    return parseOr(schema, raw, `${config.id}.detail`)
  },

  create<Row extends AnyRow>(
    config: ModuleConfig<Row, string>,
    payload: unknown,
  ) {
    return apiClient.post<unknown>(config.apiPath, payload)
  },

  update<Row extends AnyRow>(
    config: ModuleConfig<Row, string>,
    id: string,
    payload: unknown,
  ) {
    return apiClient.put<unknown>(
      config.updatePath?.(id) ?? `${config.apiPath}/${id}`,
      payload,
    )
  },

  remove<Row extends AnyRow>(config: ModuleConfig<Row, string>, row: Row) {
    return apiClient.delete<void>(
      config.deletePath?.(row) ?? `${config.apiPath}/${getRowKey(config, row)}`,
    )
  },

  /** Lookup siyahısı: `array` və ya `{items}` — hər ikisi qəbul olunur. */
  async lookup(path: string, schema: ZodType<AnyRow> = DEFAULT_LOOKUP_SCHEMA) {
    const raw = await apiClient.get<unknown>(path)
    const envelope = Array.isArray(raw) ? 'array' : 'items'
    return parseOr(listEnvelopeSchema(envelope, schema), raw, `lookup ${path}`)
      .items
  },
}
