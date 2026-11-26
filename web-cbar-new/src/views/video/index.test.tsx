import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { videoItems } from '@/shared/testing/fixtures/media'
import { renderApp, screen } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { VideoView } from './index'
import { loadVideo } from './loader'

describe('Video detail (spec 035)', () => {
  it('H1 is the video title; the cover plays the nocookie embed on click', async () => {
    const user = userEvent.setup()
    const data = await loadVideo('az', '400')
    renderApp(<VideoView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'Video 1' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Səhifənin yeri' }).textContent).toContain('Video 1')
    expect(document.querySelector('iframe')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Videonu oynat: Video 1' }))

    const frame = screen.getByTitle('Video: Video 1')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/video1abc?autoplay=1')
    expect(screen.queryByRole('button', { name: /Videonu oynat/ })).toBeNull()
  })

  it('a link that is not a YouTube video gets no player, only the link', async () => {
    server.use(
      http.get(`${API}/api/v1/videos/:id`, () => HttpResponse.json({ ...videoItems[0], youtubeUrl: 'https://vimeo.com/123' })),
    )
    const data = await loadVideo('az', '400')
    renderApp(<VideoView data={data!} />, { locale: 'az' })

    expect(screen.queryByRole('button', { name: /Videonu oynat/ })).toBeNull()
    expect(screen.getByRole('link', { name: 'YouTube-da izlə' })).toHaveAttribute('href', 'https://vimeo.com/123')
  })

  it('a bad id or a video missing in the locale is a 404', async () => {
    await expect(loadVideo('az', 'abc')).resolves.toBeNull()
    await expect(loadVideo('az', '999')).resolves.toBeNull()
  })
})
