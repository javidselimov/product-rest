import { describe, expect, it } from 'vitest'

import { sanitizeHtml, sanitizeHtmlToFragment } from '@/shared/lib/sanitize-html'
import { resolvePreviewMedia } from './preview-media'

const render = (html: string, mediaBaseUrl: string) => {
  const container = document.createElement('div')
  container.append(sanitizeHtmlToFragment(html))
  resolvePreviewMedia(container, mediaBaseUrl)
  return container.innerHTML
}

describe('resolvePreviewMedia', () => {
  it('yalnız img src="/media/…" ünvanlarını kök ilə tamamlayır', () => {
    const html =
      '<p><a href="/media/3">fayl</a> <img alt="a" src="/media/4"> <img src="https://x.y/b.png"></p>'
    expect(render(html, 'https://api-cbar-test.cbar.az')).toBe(
      '<p><a href="/media/3">fayl</a> <img alt="a" src="https://api-cbar-test.cbar.az/media/4"> <img src="https://x.y/b.png"></p>',
    )
  })

  it('boş kök ilə HTML-ə toxunmur', () => {
    const html = '<img src="/media/4">'
    expect(render(html, '')).toBe(sanitizeHtml(html))
  })
})
