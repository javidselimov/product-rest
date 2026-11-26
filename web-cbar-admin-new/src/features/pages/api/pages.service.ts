/** Səhifə servisi — contracts/admin-api.md §4 (ağac, detail, move, sənədlər). */

import { ZodError, type ZodType } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import {
  pageAssetSchema,
  pageDetailSchema,
  pageTreeSchema,
  type PageAsset,
  type PageDetail,
  type PageNode,
  type PageUpsert,
} from '../model/schemas'

const parse = <T>(schema: ZodType<T>, raw: unknown, where: string): T => {
  try {
    return schema.parse(raw)
  } catch (error) {
    if (error instanceof ZodError) throw contractError(where)
    throw error
  }
}

export interface AssetTitles {
  translations: Record<string, { title: string }>
  groupLabel: string | null
}

export const pagesService = {
  tree: async (locale: string): Promise<PageNode[]> =>
    parse(
      pageTreeSchema,
      await apiClient.get('/pages/tree', { params: { locale } }),
      'pages.tree',
    ),

  detail: async (id: string | number): Promise<PageDetail> =>
    parse(
      pageDetailSchema,
      await apiClient.get(`/pages/${id}`),
      'pages.detail',
    ),

  create: async (payload: PageUpsert): Promise<PageDetail> =>
    parse(
      pageDetailSchema,
      await apiClient.post('/pages', payload),
      'pages.create',
    ),

  update: async (
    id: string | number,
    payload: PageUpsert,
  ): Promise<PageDetail> =>
    parse(
      pageDetailSchema,
      await apiClient.put(`/pages/${id}`, payload),
      'pages.update',
    ),

  move: (id: number, body: { newParentId: number | null; sortOrder: number }) =>
    apiClient.post<void>(`/pages/${id}/move`, body),

  remove: (id: number) => apiClient.delete<void>(`/pages/${id}`),

  attachAsset: async (
    pageId: string | number,
    body: {
      mediaId: number
      translations?: Record<string, { title: string }>
      groupLabel?: string | null
    },
  ): Promise<PageAsset> =>
    parse(
      pageAssetSchema,
      await apiClient.post(`/pages/${pageId}/assets`, body),
      'pages.attach',
    ),

  updateAsset: async (
    pageId: string | number,
    assetId: number,
    body: AssetTitles,
  ): Promise<PageAsset> =>
    parse(
      pageAssetSchema,
      await apiClient.put(`/pages/${pageId}/assets/${assetId}`, body),
      'pages.updateAsset',
    ),

  orderAssets: (pageId: string | number, assetIds: number[]) =>
    apiClient.put<void>(`/pages/${pageId}/assets/order`, { assetIds }),

  detachAsset: (pageId: string | number, assetId: number) =>
    apiClient.delete<void>(`/pages/${pageId}/assets/${assetId}`),
}
