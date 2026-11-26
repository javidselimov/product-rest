import { describe, expect, it } from 'vitest'

import type { ArchiveFile } from '@/features/about-content/model/types'
import { renderApp, screen } from '@/shared/testing/render'

import { DocumentCard } from './document-card'

const pdf: ArchiveFile = {
  id: 947,
  title: 'Azərbaycan Respublikası Mərkəzi Bankının 31 dekabr 2025-ci il tarixinə Konsolidasiya edilmiş Maliyyə Hesabatları',
  url: '/media/947',
  mimeType: 'application/pdf',
  sizeBytes: 2_961_312,
}

describe('DocumentCard (spec 054 ui-contract §6)', () => {
  it('is one link that opens the file in a new tab, with the name, the size and a PDF badge', () => {
    renderApp(<DocumentCard file={pdf} locale="az" />, { locale: 'az' })

    const link = screen.getByRole('link', { name: new RegExp(pdf.title.slice(0, 30)) })
    expect(link).toHaveAttribute('href', '/media/947')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(link).toHaveTextContent('2,8 MB')
    expect(link).toHaveTextContent('PDF')
  })

  it('formats the size in the page locale', () => {
    renderApp(<DocumentCard file={pdf} locale="en" />, { locale: 'en' })
    expect(screen.getByRole('link')).toHaveTextContent('2.8 MB')
  })

  it('shows no size line when the size is unknown or zero', () => {
    const { unmount } = renderApp(<DocumentCard file={{ ...pdf, sizeBytes: 0 }} locale="az" />, { locale: 'az' })
    expect(screen.getByRole('link').querySelector('[data-slot="document-size"]')).toBeNull()
    unmount()

    renderApp(<DocumentCard file={{ ...pdf, sizeBytes: undefined }} locale="az" />, { locale: 'az' })
    expect(screen.getByRole('link').querySelector('[data-slot="document-size"]')).toBeNull()
  })

  it('names an unknown type with the generic "File" badge', () => {
    renderApp(<DocumentCard file={{ ...pdf, title: 'Sənəd', mimeType: null }} locale="az" />, { locale: 'az' })
    expect(screen.getByRole('link')).toHaveTextContent('Fayl')
    expect(screen.getByRole('link')).not.toHaveTextContent('PDF')
  })

  it('the consumer rights card (spec 050) has no size line, the same link and badge', () => {
    renderApp(<DocumentCard file={pdf} locale="az" variant="consumer" />, { locale: 'az' })
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/media/947')
    expect(link).toHaveTextContent('PDF')
    expect(link).not.toHaveTextContent('2,8 MB')
  })

  it('takes a visible label and keeps the file title for screen readers', () => {
    renderApp(<DocumentCard file={pdf} locale="az" label="Mart" />, { locale: 'az' })
    expect(screen.getByRole('link', { name: /Mart/ })).toHaveTextContent(pdf.title)
  })
})
