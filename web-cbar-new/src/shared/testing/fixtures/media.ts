import type { ImagePopup } from '@/features/image-popup/model/image-popup'
import type {
  GalleryDetail,
  GalleryListItem,
  VideoItem,
  VideoStream,
} from '@/features/media/model/schemas'

export const galleryItems: GalleryListItem[] = Array.from(
  { length: 14 },
  (_, i) => ({
    id: 300 + i,
    title: `Qalereya ${i + 1}`,
    eventDate: `2026-08-${String(28 - i).padStart(2, '0')}`,
    imageCount: 6 + i,
    coverUrl: `/media/${900 + i}`,
  }),
)

export const galleryDetailFixture: GalleryDetail = {
  id: 300,
  title: 'Qalereya 1',
  eventDate: '2026-08-28',
  images: [
    { mediaId: 901, url: '/media/901' },
    { mediaId: 902, url: '/media/902' },
    { mediaId: 903, url: '/media/903' },
  ],
}

export const videoItems: VideoItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: 400 + i,
  title: `Video ${i + 1}`,
  youtubeUrl:
    i % 4 === 3 ? null : `https://www.youtube.com/watch?v=video${i + 1}abc`,
  publishedAt: `2026-07-${String(20 - i).padStart(2, '0')}`,
}))

export const videoStreams: VideoStream[] = [
  {
    id: 1,
    title: 'İdarə Heyətinin brifinqi',
    streamUrl: 'https://www.youtube.com/watch?v=live12345',
    startsAt: '2026-09-15T11:00:00',
  },
]

/** `GET /api/v1/image-popups` — ən çox bir element (spec 009 contracts/public-api.md). */
export const imagePopups: Record<'az' | 'en', ImagePopup[]> = {
  az: [{ id: 1, imageUrl: '/media/1', link: 'https://www.cbar.az/az/page-40', altText: 'Maliyyə savadlılığı həftəsi' }],
  en: [{ id: 1, imageUrl: '/media/2', link: '/en/page-40', altText: null }],
}
