import { DocumentIcon, FileIcon, ImageIcon } from '@cbar/lib-react-ui-kit/icons'
import { describe, expect, it } from 'vitest'

import {
  ACCEPT_ATTRIBUTE,
  formatBytes,
  iconForMime,
  mediaItemSchema,
  mediaUrl,
  resolveMediaSrc,
} from './types'

describe('media entity', () => {
  it('formatBytes B/KB/MB və boş dəyər üçün "—"', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB')
    expect(formatBytes(null)).toBe('—')
  })

  it('iconForMime mime tipinə görə kit ikonu seçir', () => {
    expect(iconForMime('image/png')).toBe(ImageIcon)
    expect(iconForMime('application/pdf')).toBe(DocumentIcon)
    expect(iconForMime('text/xml')).toBe(FileIcon)
    expect(iconForMime(null)).toBe(FileIcon)
  })

  it('mediaUrl nisbi ünvan qaytarır, accept siyahısı xml ilə bitir', () => {
    expect(mediaUrl(7)).toBe('/media/7')
    expect(ACCEPT_ATTRIBUTE.endsWith('.xml')).toBe(true)
  })

  it('mediaItemSchema API cavabını (width/height null) qəbul edir', () => {
    const parsed = mediaItemSchema.parse({
      id: 88,
      originalName: 'report.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 240113,
      width: null,
      height: null,
      createdAt: '2025-09-01T10:22:31.114+00:00',
    })
    expect(parsed.id).toBe(88)
  })
})

describe('resolveMediaSrc', () => {
  it('nisbi /media ünvanını kök ilə tamamlayır, qalanını dəyişmir', () => {
    expect(resolveMediaSrc('/media/7', 'https://api-cbar-test.cbar.az')).toBe(
      'https://api-cbar-test.cbar.az/media/7',
    )
    expect(resolveMediaSrc('/media/7', '')).toBe('/media/7')
    expect(resolveMediaSrc('https://x.y/a.png', 'https://api')).toBe(
      'https://x.y/a.png',
    )
    expect(resolveMediaSrc('/assets/a.png', 'https://api')).toBe('/assets/a.png')
  })
})
