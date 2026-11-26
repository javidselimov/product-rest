import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'
import { renderApp, screen, within } from '@/shared/testing/render'

import { Attachments, groupAttachments } from './attachments'

const files: AttachmentFile[] = [
  { id: 1, title: 'Hesabat 2024', mimeType: 'application/pdf', sizeBytes: 1024, group: '2024', url: 'http://api/media/1' },
  { id: 2, title: 'Hesabat 2025', mimeType: 'application/pdf', sizeBytes: 2048, group: '2025', url: 'http://api/media/2' },
  { id: 3, title: 'Qrupsuz', mimeType: 'application/vnd.ms-excel', sizeBytes: 512, group: null, url: 'http://api/media/3' },
  { id: 4, title: 'Şəkil', mimeType: 'image/png', sizeBytes: 999, group: null, url: 'http://api/media/4' },
  { id: 5, title: 'Digər 2025', mimeType: 'application/pdf', sizeBytes: 100, group: ' 2025 ', url: 'http://api/media/5' },
]

describe('groupAttachments', () => {
  it('rəqəm qrupları azalan sıralayır, boşluqları kəsir, qrupsuzları ayırır', () => {
    const { groups, ungrouped } = groupAttachments(files.filter((f) => f.mimeType !== 'image/png'))

    expect(groups.map(([k, v]) => `${k}:${v.length}`)).toEqual(['2025:2', '2024:1'])
    expect(ungrouped.map((f) => f.id)).toEqual([3])
  })

  it('rəqəm olmayan qruplar daxil olma sırasını saxlayır', () => {
    const { groups } = groupAttachments([
      { ...files[0], group: 'Bəta' },
      { ...files[1], group: 'Alfa' },
    ])

    expect(groups.map(([k]) => k)).toEqual(['Bəta', 'Alfa'])
  })
})

describe('Attachments', () => {
  it('şəkil zolağı, accordion qrupları və qrupsuz siyahı render olunur', () => {
    renderApp(<Attachments locale="az" files={files} />, { locale: 'az' })

    expect(within(screen.getByRole('list', { name: 'Şəkillər' })).getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'Sənədlər' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /2025/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /2024/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: /Qrupsuz/ })).toHaveAttribute('href', 'http://api/media/3')
    expect(screen.getByText('2.0 KB')).toBeInTheDocument()
  })

  it('qrup yoxdursa düz siyahı, accordion yoxdur', () => {
    renderApp(<Attachments locale="en" files={[files[2]]} />, { locale: 'en' })

    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByRole('region', { name: 'Documents' })).toBeInTheDocument()
  })

  it('boş siyahıda render olunmur', () => {
    const { container } = renderApp(<Attachments locale="az" files={[]} />)

    expect(container.querySelector('[data-slot="attachments"]')).toBeNull()
  })

  it('about variantı: qrupsuz sənədlər yeni tabda açılan sətirlərdir', () => {
    const flat = files.filter((f) => f.group === null && f.mimeType !== 'image/png')
    renderApp(<Attachments locale="az" files={flat} variant="about" />, { locale: 'az' })

    const region = screen.getByRole('region', { name: 'Sənədlər' })
    const link = within(region).getByRole('link', { name: /Qrupsuz/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('about variantı qruplu sənədlərdə adi görünüşə qayıdır', () => {
    renderApp(<Attachments locale="az" files={files} variant="about" />, { locale: 'az' })

    expect(screen.getByRole('button', { name: /2025/ })).toBeInTheDocument()
  })
})
