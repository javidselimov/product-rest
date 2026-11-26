/**
 * In-memory CRUD mock fabriki (research R14): real `api-cbar-admin` envelope və
 * status kodlarını təkrarlayır ki, testlər real axını yoxlasın (yaratma →
 * siyahıda görünür, silmə → yox olur). `server.resetHandlers()` store-u
 * sıfırlamır — testlər `store.reset()` çağırır.
 */

import { HttpResponse, http } from 'msw'

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { message, noContent, problem404 } from './errors'

export type MockRow = Record<string, unknown> & { id: number }

export interface CrudStoreOptions<Row extends MockRow> {
  /** API kökünə nisbi yol: "/laws". Handler-lər `/api/v1${path}` ilə qeyd olunur. */
  path: string
  envelope: 'paged' | 'items' | 'array'
  seed: Row[]
  pageSize?: number
  /** Axtarış sahələri (dot path dəstəklənir, məs. "translations.az.title"). */
  searchFields?: string[]
  searchParam?: string
  /** Query param → sətir sahəsi (String müqayisəsi). */
  filterFields?: string[]
  /** Siyahı elementinin düz forması (list DTO ≠ detail DTO olanda). */
  listItem?: (row: Row) => Record<string, unknown>
  /** POST/PUT gövdəsini sətirə çevirir (default: id saxlanmaqla merge). */
  applyBody?: (
    body: Record<string, unknown>,
    existing: Row | null,
    id: number,
  ) => Row
  /** POST → 201 cavab gövdəsi (default: sətir). */
  createResponse?: (row: Row) => Record<string, unknown>
  /** Sıralama (default: id artan). */
  sort?: (a: Row, b: Row) => number
}

const readPath = (row: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((cur, part) => {
    if (cur === null || cur === undefined || typeof cur !== 'object')
      return undefined
    return (cur as Record<string, unknown>)[part]
  }, row)

export function createCrudStore<Row extends MockRow>(
  options: CrudStoreOptions<Row>,
) {
  const {
    path,
    envelope,
    pageSize: defaultPageSize = DEFAULT_PAGE_SIZE,
    searchFields = [],
    searchParam = 'search',
    filterFields = [],
    listItem = (row: Row) => row,
    createResponse = (row: Row) => row,
    sort = (a: Row, b: Row) => a.id - b.id,
  } = options
  const applyBody =
    options.applyBody ??
    ((body, existing, id) => ({ ...(existing ?? {}), ...body, id }) as Row)

  let rows: Row[] = structuredClone(options.seed)
  const base = `/api/v1${path}`

  const store = {
    all: () => rows,
    get: (id: number) => rows.find((r) => r.id === id) ?? null,
    reset: () => {
      rows = structuredClone(options.seed)
    },
    nextId: () => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1,
    insert: (row: Row) => {
      rows = [...rows, row]
      return row
    },
    replace: (row: Row) => {
      rows = rows.map((r) => (r.id === row.id ? row : r))
      return row
    },
    remove: (id: number) => {
      rows = rows.filter((r) => r.id !== id)
    },
  }

  const list = http.get(base, ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get(searchParam)?.toLowerCase().trim() ?? ''
    let result = [...rows].sort(sort)
    if (search) {
      result = result.filter((row) =>
        searchFields.some((f) =>
          String(readPath(row, f) ?? '')
            .toLowerCase()
            .includes(search),
        ),
      )
    }
    for (const filter of filterFields) {
      const value = url.searchParams.get(filter)
      if (value !== null && value !== '') {
        result = result.filter(
          (row) => String(readPath(row, filter) ?? '') === value,
        )
      }
    }
    const items = result.map(listItem)
    if (envelope === 'array') return HttpResponse.json(items)
    if (envelope === 'items') return HttpResponse.json({ items })
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(
      url.searchParams.get('pageSize') ?? String(defaultPageSize),
    )
    const start = (page - 1) * pageSize
    return HttpResponse.json({
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
    })
  })

  const detail = http.get(`${base}/:id`, ({ params }) => {
    const row = store.get(Number(params.id))
    return row ? HttpResponse.json(row) : problem404()
  })

  const create = http.post(base, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    if (
      body.translations &&
      Object.keys(body.translations as object).length === 0
    ) {
      return message(400, 'At least one translation is required.')
    }
    const row = store.insert(applyBody(body, null, store.nextId()))
    return HttpResponse.json(createResponse(row), { status: 201 })
  })

  const update = http.put(`${base}/:id`, async ({ params, request }) => {
    const existing = store.get(Number(params.id))
    if (!existing) return problem404()
    const body = (await request.json()) as Record<string, unknown>
    const row = store.replace(applyBody(body, existing, existing.id))
    return HttpResponse.json(row)
  })

  const remove = http.delete(`${base}/:id`, ({ params }) => {
    const existing = store.get(Number(params.id))
    if (!existing) return problem404()
    store.remove(existing.id)
    return noContent()
  })

  return { handlers: [list, detail, create, update, remove], store, base }
}
