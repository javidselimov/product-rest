/**
 * Shared helpers for test and mock data.
 *
 * Feature fixtures live in `fixtures/<feature>.ts`; this file keeps only the envelope
 * and general builders.
 */
import type { ListEnvelope, MediaAsset, PageAsset } from '@/entities/content'
import type { PageNode } from '@/entities/page-node'

/** Paginated response envelope, in the contracts/public-api.md format. */
export function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 10,
): ListEnvelope<T> {
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}

export function makeMediaAsset(
  overrides: Partial<MediaAsset> = {},
): MediaAsset {
  return {
    mediaId: 101,
    originalName: 'hesabat.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 245_760,
    url: '/media/101',
    ...overrides,
  }
}

export function makePageAsset(overrides: Partial<PageAsset> = {}): PageAsset {
  return {
    mediaId: 201,
    title: 'İllik hesabat 2025',
    mimeType: 'application/pdf',
    sizeBytes: 1_048_576,
    group: '2025',
    url: '/media/201',
    ...overrides,
  }
}

/** A copy of the tree with the given pages left out of the left menu (spec 041). */
export function hideInSideNav(tree: PageNode[], ids: readonly number[]): PageNode[] {
  return tree.map((node) => ({
    ...node,
    ...(ids.includes(node.id) ? { showInSideNav: false } : {}),
    children: hideInSideNav(node.children, ids),
  }))
}
