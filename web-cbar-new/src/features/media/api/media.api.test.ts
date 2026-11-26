import { describe, expect, it } from 'vitest'

import { youtubeEmbedUrl, youtubeId } from '../model/youtube'
import { server } from '@/shared/testing/server'

import { getGalleries, getGallery, getVideo, getVideoStreams, getVideos } from './media.api'

/** Records list request query strings. */
function spyQueries(): URLSearchParams[] {
  const seen: URLSearchParams[] = []
  server.events.on('request:start', ({ request }) => {
    seen.push(new URL(request.url).searchParams)
  })
  return seen
}

describe('media api', () => {
  it('a gallery list is 10 records by default', async () => {
    const list = await getGalleries('az')

    expect(list.items).toHaveLength(10)
    expect(list.total).toBe(14)
  })

  it('6 records for the homepage', async () => {
    const [galleries, videos] = await Promise.all([getGalleries('az', { pageSize: 6 }), getVideos('az', { pageSize: 6 })])

    expect(galleries.items).toHaveLength(6)
    expect(videos.items).toHaveLength(6)
  })

  it('sends q, from and to only when set (spec 035)', async () => {
    const seen = spyQueries()

    await getGalleries('az', { page: 2, q: 'Qalereya 1', from: '2026-08-01' })
    await getVideos('en', { q: '', to: '2026-07-15' })

    expect(Object.fromEntries(seen[0]!)).toEqual({ locale: 'az', page: '2', pageSize: '10', q: 'Qalereya 1', from: '2026-08-01' })
    expect(Object.fromEntries(seen[1]!)).toEqual({ locale: 'en', page: '1', pageSize: '10', to: '2026-07-15' })
  })

  it('a single video; 404 → null (spec 035)', async () => {
    expect((await getVideo('az', 400))?.title).toBe('Video 1')
    await expect(getVideo('az', 999)).resolves.toBeNull()
  })

  it('gallery detail; 404 → null', async () => {
    expect((await getGallery('az', 300))?.images).toHaveLength(3)
    await expect(getGallery('az', 999)).resolves.toBeNull()
  })

  it('live streams', async () => {
    expect(await getVideoStreams('az')).toHaveLength(1)
  })
})

describe('youtubeId', () => {
  it('recognises watch, youtu.be, embed and shorts links', () => {
    expect(youtubeId('https://www.youtube.com/watch?v=abc123xyz')).toBe('abc123xyz')
    expect(youtubeId('https://youtu.be/abc123xyz')).toBe('abc123xyz')
    expect(youtubeId('https://www.youtube.com/embed/abc123xyz')).toBe('abc123xyz')
    expect(youtubeId('https://m.youtube.com/shorts/abc123xyz?x=1')).toBe('abc123xyz')
  })

  it('rejects wrong and short ids', () => {
    expect(youtubeId('https://vimeo.com/123')).toBeNull()
    expect(youtubeId('https://youtu.be/ab')).toBeNull()
    expect(youtubeId('yoxdur')).toBeNull()
    expect(youtubeId(null)).toBeNull()
  })

  it('the embed address is on the nocookie host', () => {
    expect(youtubeEmbedUrl('abc123xyz')).toBe('https://www.youtube-nocookie.com/embed/abc123xyz')
  })
})
