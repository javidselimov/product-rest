/**
 * Homepage strategy document requests beyond the CRUD engine (spec 057, `contracts/admin-api.md`): the full list for
 * ordering and the order endpoint. Every response is parsed (B13).
 */

import { z, ZodError } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import { STRATEGY_DOCS_FULL_LIST_SIZE, STRATEGY_DOCS_MODULE_ID } from '../model/constants'
import { strategyDocRowSchema, type StrategyDocRow } from '../model/strategy-docs'

const API_PATH = '/homepage-strategy-docs'

const listSchema = z.object({
  items: z.array(strategyDocRowSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})

/** Under the module root, so a change in the list refreshes the order dialog. */
export const strategyDocsKeys = {
  all: () => [STRATEGY_DOCS_MODULE_ID, 'all'] as const,
  /** The page tree the form's page choices come from. */
  pageChoices: () => [STRATEGY_DOCS_MODULE_ID, 'page-choices'] as const,
}

export const strategyDocsService = {
  all: async (): Promise<StrategyDocRow[]> => {
    const data = await apiClient.get(API_PATH, { params: { pageSize: STRATEGY_DOCS_FULL_LIST_SIZE } })
    try {
      return listSchema.parse(data).items
    } catch (error) {
      if (error instanceof ZodError) throw contractError(`homepage.strategyDocs: ${error.issues[0]?.path.join('.') ?? ''}`)
      throw error
    }
  },

  reorder: (ids: number[]) => apiClient.put<void>(`${API_PATH}/order`, { ids }),
}
