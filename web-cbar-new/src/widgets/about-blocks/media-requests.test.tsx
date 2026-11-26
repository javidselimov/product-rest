/**
 * What a journalist sees on the "Media requests" page (spec 037 US1).
 */
import { describe, expect, it } from 'vitest'

import { parseAbout } from '@/features/about-content/model/parse'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { renderApp, screen, within } from '@/shared/testing/render'

import { AboutBlocks } from './about-blocks'

const html =
  '<p>Mərkəzi Bank şəffaf kommunikasiya aparır.</p><h3>Media ilə əməkdaşlıq</h3><table><tbody>' +
  '<tr><td><p>E-mail</p></td><td><p><a href="mailto:press@cbar.az">press@cbar.az</a></p></td><td><p></p></td></tr>' +
  '<tr><td><p>Telefon</p></td><td><p><a href="tel:966">(+994 12) 966</a></p></td><td><p>Daxili nömrə: 2243</p></td></tr>' +
  '</tbody></table>'

const render = (content: string) =>
  renderApp(<AboutBlocks blocks={parseAbout(prepareCmsHtml(content), 'media-requests')} locale="az" />, { locale: 'az' })

describe('Media requests page', () => {
  it('shows the text and one card per table row', () => {
    render(html)

    expect(screen.getByText('Mərkəzi Bank şəffaf kommunikasiya aparır.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Media ilə əməkdaşlıq' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    const [email, phone] = screen.getAllByRole('listitem')
    expect(within(email!).getByText('E-mail')).toBeInTheDocument()
    expect(within(phone!).getByText('Daxili nömrə: 2243')).toBeInTheDocument()
  })

  it('the value is a working link', () => {
    render(html)

    expect(screen.getByRole('link', { name: 'press@cbar.az' })).toHaveAttribute('href', 'mailto:press@cbar.az')
    expect(screen.getByRole('link', { name: '(+994 12) 966' })).toHaveAttribute('href', 'tel:966')
  })

  it('a value without a link is plain text', () => {
    render('<table><tbody><tr><td>Ünvan</td><td>Bakı</td></tr></tbody></table>')

    expect(screen.getByText('Bakı')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('a table that does not match stays a table', () => {
    render('<table><tbody><tr><td>tək xana</td></tr></tbody></table>')

    expect(screen.getByRole('table')).toHaveTextContent('tək xana')
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })
})
