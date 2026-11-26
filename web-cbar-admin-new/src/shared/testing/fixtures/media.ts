import type { MediaItem } from '@/entities/media/model/types'

/** Seed-ə bənzər media nümunələri; 1 və 2 placeholder şəkillərdir (GUIDE.md). */
export const mediaFixtures: MediaItem[] = [
  {
    id: 1,
    originalName: 'placeholder-1.svg',
    mimeType: 'image/svg+xml',
    sizeBytes: 2048,
    width: null,
    height: null,
    createdAt: '2026-01-10T09:00:00+00:00',
  },
  {
    id: 2,
    originalName: 'placeholder-2.svg',
    mimeType: 'image/svg+xml',
    sizeBytes: 2100,
    width: null,
    height: null,
    createdAt: '2026-01-10T09:01:00+00:00',
  },
  {
    id: 3,
    originalName: 'hesabat-2025.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 240113,
    width: null,
    height: null,
    createdAt: '2026-02-01T10:22:31+00:00',
  },
  {
    id: 4,
    originalName: 'mezenne.xlsx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeBytes: 51200,
    width: null,
    height: null,
    createdAt: '2026-02-03T08:00:00+00:00',
  },
  {
    id: 5,
    originalName: 'qanun.docx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sizeBytes: 30720,
    width: null,
    height: null,
    createdAt: '2026-02-05T08:00:00+00:00',
  },
  {
    id: 6,
    originalName: 'arxiv.zip',
    mimeType: 'application/zip',
    sizeBytes: 1048576,
    width: null,
    height: null,
    createdAt: '2026-02-06T08:00:00+00:00',
  },
]

/**
 * `GET /media/:id/preview` baytları (spec 010). Siyahıda olmayan şəkil id-si
 * (məs. yeni yüklənmiş) handler-də ümumi 1×1 SVG alır.
 */
export const mediaPreviewBytes: Record<number, string> = {
  1: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="#ccc"/></svg>',
  2: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40"><circle cx="15" cy="20" r="10" fill="#999"/></svg>',
}

/** Məzmuna bağlı fayllar — DELETE 409 verir. */
export const attachedMediaIds = [1, 3]
