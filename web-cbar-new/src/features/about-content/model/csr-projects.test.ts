import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'

import { mediaLayoutFor } from './layouts'
import { parseAbout } from './parse'
import type { CsrProject, CsrProjectsBlock } from './types'

const concept: AttachmentFile = { id: 1566, title: 'KSM Konsepsiyası', mimeType: 'application/pdf', sizeBytes: 2048, group: null, url: '/media/1566' }
const photo: AttachmentFile = { id: 1567, title: 'foto', mimeType: 'image/jpeg', sizeBytes: 2048, group: null, url: '/media/1567' }
const project: CsrProject = { id: 1, category: 'Təhsil', cardTitle: 'Lisey', summary: 'Təsvir', title: 'Biləsuvar liseyi', html: '<p>Mətn</p>', cover: null, gallery: [] }

function parsed(html: string, files: AttachmentFile[] = []): CsrProjectsBlock {
  const [block] = parseAbout(html, 'csr-projects', { files, projects: [project] })
  if (block?.kind !== 'csr-projects') throw new Error(`unexpected block: ${block?.kind}`)
  return block
}

describe('mediaLayoutFor', () => {
  it.each(['korporativ-sosial-mesuliyyet', 'corporate-social-responsibility', 'korporativ-sosial-mesuliyyet-copy', 'corporate-social-responsibility-copy'])(
    '%s gets the CSR layout',
    (slug) => {
      expect(mediaLayoutFor(slug)).toBe('csr-projects')
    },
  )
})

describe('parseAbout csr-projects', () => {
  it('keeps the page text as the intro and passes the projects through', () => {
    const block = parsed('<p>Giriş</p><p>İkinci abzas</p>')

    expect(block.introHtml).toBe('<p>Giriş</p><p>İkinci abzas</p>')
    expect(block.files).toEqual([])
    expect(block.projects).toEqual([project])
  })

  it('turns a document linked alone on its line into a file row', () => {
    const block = parsed('<p>Giriş</p><p><a href="/media/1566">KSM</a></p>', [concept])

    expect(block.files).toEqual([concept])
    expect(block.introHtml).toBe('<p>Giriş</p>')
  })

  it('keeps a link in the intro when it is unknown, an image or inside a sentence', () => {
    const unknown = '<p><a href="/media/5">Fayl</a></p>'
    const image = '<p><a href="/media/1567">Foto</a></p>'
    const sentence = '<p>Bax: <a href="/media/1566">KSM</a></p>'
    const block = parsed(`${unknown}${image}${sentence}`, [concept, photo])

    expect(block.files).toEqual([])
    expect(block.introHtml).toBe(`${unknown}${image}${sentence}`)
  })

  it.each([
    ['the bold heading', '<p><strong>Korporativ sosial məsuliyyət layihələrimiz</strong></p><p>Köhnə mətn</p>'],
    ['the table markup', '<h2>Layihələrimiz</h2><table><tbody><tr><td><p>x</p></td></tr></tbody></table><h3>Lisey</h3>'],
    ['the English heading', '<p><strong>Our Corporate Social Responsibility projects</strong></p><p>Old text</p>'],
  ])('leaves out an old project list after %s once projects arrive', (_, oldList) => {
    expect(parsed(`<p>Giriş</p>${oldList}`).introHtml).toBe('<p>Giriş</p>')
  })

  it('keeps the old project list while there are no projects', () => {
    const html = '<p>Giriş</p><p><strong>Korporativ sosial məsuliyyət layihələrimiz</strong></p><p>Köhnə mətn</p>'
    const [block] = parseAbout(html, 'csr-projects', { projects: [] })

    expect(block).toMatchObject({ kind: 'csr-projects', introHtml: html })
  })

  it('shows an empty page with its projects', () => {
    const [block] = parseAbout('', 'csr-projects', { projects: [project] })

    expect(block).toMatchObject({ kind: 'csr-projects', introHtml: '', projects: [project] })
  })
})
