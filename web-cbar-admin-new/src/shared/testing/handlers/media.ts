/** Media mock-ları — real kontrakt (contracts/admin-api.md §5). */

import { HttpResponse, http } from 'msw'

import type { MediaItem } from '@/entities/media/model/types'
import {
  attachedMediaIds,
  mediaFixtures,
  mediaPreviewBytes,
} from '../fixtures/media'
import { message, noContent } from './lib/errors'

let items: MediaItem[] = structuredClone(mediaFixtures)

export const mediaStore = {
  all: () => items,
  reset: () => {
    items = structuredClone(mediaFixtures)
  },
}

export const mediaHandlers = [
  http.get('/api/v1/media', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '24')
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const filtered = items
      .filter((m) => !search || m.originalName.toLowerCase().includes(search))
      .sort((a, b) => b.id - a.id)
    const start = (page - 1) * pageSize
    return HttpResponse.json({
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    })
  }),

  http.post('/api/v1/media', async ({ request }) => {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return message(400, 'Empty file.')
    }
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (
      ![
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.svg',
        '.pdf',
        '.xlsx',
        '.xls',
        '.docx',
        '.doc',
        '.zip',
        '.rar',
        '.xml',
      ].includes(ext)
    ) {
      return message(400, `File type '${ext}' is not allowed.`)
    }
    const item: MediaItem = {
      id: items.reduce((max, m) => Math.max(max, m.id), 0) + 1,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
    }
    items = [...items, item]
    // Upload cavabında width/height yoxdur (contracts/admin-api.md §5).
    return HttpResponse.json({
      id: item.id,
      originalName: item.originalName,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
      createdAt: item.createdAt,
    })
  }),

  // spec 010 contracts/admin-api.md: şəkil → baytlar, digər mime → 415, yoxdur → 404.
  http.get('/api/v1/media/:id/preview', ({ params }) => {
    const id = Number(params.id)
    const item = items.find((m) => m.id === id)
    if (!item) return message(404, 'Not found.')
    const mimeType = item.mimeType ?? ''
    if (!mimeType.startsWith('image/')) {
      return HttpResponse.json(
        { message: 'Preview is available for images only.', mimeType },
        { status: 415 },
      )
    }
    return new HttpResponse(
      mediaPreviewBytes[id] ??
        '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
      { headers: { 'Content-Type': mimeType } },
    )
  }),

  http.delete('/api/v1/media/:id', ({ params }) => {
    const id = Number(params.id)
    if (attachedMediaIds.includes(id)) {
      return message(409, 'File is attached to content; detach it first.')
    }
    if (!items.some((m) => m.id === id)) return message(404, 'Not found.')
    items = items.filter((m) => m.id !== id)
    return noContent()
  }),
]
