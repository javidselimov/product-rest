/**
 * Platform pages of "Financial literacy" (spec 047 US2): note, photos, sections and the button.
 */
import { describe, expect, it } from 'vitest'

import { parseAbout } from '@/features/about-content/model/parse'
import type { LiteracyPlatformBlock } from '@/features/about-content/model/types'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { portalAz, virtualAz, virtualEn } from '@/shared/testing/fixtures/literacy-section'
import { renderApp, screen, within } from '@/shared/testing/render'

import { LiteracyPlatform } from './literacy-platform'

const blockOf = (html: string) => parseAbout(prepareCmsHtml(html), 'literacy-platform')[0] as LiteracyPlatformBlock
const TITLE = 'Virtual Təhsil Platforması'

describe('LiteracyPlatform', () => {
  it('shows the intro, the note, the section headings and their text', () => {
    renderApp(<LiteracyPlatform block={blockOf(virtualAz.content!)} locale="az" title={TITLE} />, { locale: 'az' })

    expect(screen.getByText(/2017-ci ildə fəaliyyətə başlamışdır/)).toBeInTheDocument()
    expect(screen.getByText('Platformada yerləşdirilən bütün resurslar ödənişsizdir.')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Distant tədris modulları',
      'Qeydiyyat',
      'Sertifikat',
      'Uşaqlar üçün kurslar',
      'Əlaqə',
    ])
    expect(screen.getByRole('link', { name: 'edu@cbar.az' })).toHaveAttribute('href', 'mailto:edu@cbar.az')
  })

  it('every photo opens its file in a new tab', () => {
    renderApp(<LiteracyPlatform block={blockOf(virtualAz.content!)} locale="az" title={TITLE} />, { locale: 'az' })

    const photos = within(screen.getByRole('list', { name: 'Fotoşəkillər' })).getAllByRole('link')
    expect(photos.map((link) => link.getAttribute('href'))).toEqual(['/media/1390', '/media/1391', '/media/1392'])
    expect(photos[0]).toHaveAccessibleName(`${TITLE} — şəkil 1`)
    expect(photos[0]).toHaveAttribute('target', '_blank')
    expect(photos[0]).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('the button goes to the platform in a new window and says so', () => {
    renderApp(<LiteracyPlatform block={blockOf(virtualAz.content!)} locale="az" title={TITLE} />, { locale: 'az' })

    const button = screen.getByRole('link', { name: /^Platformaya keçid: edu\.e-cbar\.az\s+\(yeni pəncərədə açılır\)$/ })
    expect(button).toHaveAttribute('href', 'https://edu.e-cbar.az/')
    expect(button).toHaveAttribute('target', '_blank')
  })

  it('in English the sections and the button are English', () => {
    renderApp(<LiteracyPlatform block={blockOf(virtualEn.content!)} locale="en" title="Virtual Education Platform" />, { locale: 'en' })

    expect(screen.getByRole('heading', { level: 2, name: 'Courses for children' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Go to the platform: edu\.e-cbar\.az\s+\(opens in a new window\)$/ })).toBeInTheDocument()
  })

  it('the portal shows its photos too, and six sections', () => {
    renderApp(<LiteracyPlatform block={blockOf(portalAz.content!)} locale="az" title="Maliyyə Savadlılığı portalı" />, { locale: 'az' })

    expect(within(screen.getByRole('list', { name: 'Fotoşəkillər' })).getAllByRole('link')).toHaveLength(3)
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(6)
  })
})
