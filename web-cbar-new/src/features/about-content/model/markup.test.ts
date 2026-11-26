/**
 * Shared markup rules of spec 047: media paragraphs and mail links (`contracts/cms-markup.md`, general definitions).
 */
import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'
import { parseBlocks } from '@/shared/lib/html-blocks'

import { mailtoIn, mediaParagraphIds } from './markup'

const first = (html: string) => parseBlocks(html)![0]!
const link = (id: number) => `<a target="_blank" rel="noopener noreferrer nofollow" href="/media/${id}" data-media-link="">${id}</a>`
const file = (id: number, mimeType: string): AttachmentFile => ({ id, title: String(id), mimeType, sizeBytes: 1, group: null, url: `/media/${id}` })

describe('mediaParagraphIds', () => {
  it('reads the ids of a paragraph of media links, in order', () => {
    expect(mediaParagraphIds(first(`<p>${link(3)}${link(1)} <br>${link(2)}</p>`))).toEqual([3, 1, 2])
  })

  it('a paragraph with text or an ordinary link is not a media paragraph', () => {
    expect(mediaParagraphIds(first(`<p>Şəkillər: ${link(1)}</p>`))).toBeNull()
    expect(mediaParagraphIds(first('<p><a href="/media/1">1</a></p>'))).toBeNull()
    expect(mediaParagraphIds(first('<p><a data-media-link="" href="https://x.az/1">1</a></p>'))).toBeNull()
    expect(mediaParagraphIds(first('<p></p>'))).toBeNull()
    expect(mediaParagraphIds(first(`<div>${link(1)}</div>`))).toBeNull()
  })

  it('a page file that is not an image breaks the rule; an unlisted id counts as an image', () => {
    const files = [file(1, 'image/jpeg'), file(2, 'application/pdf')]
    expect(mediaParagraphIds(first(`<p>${link(1)}${link(2)}</p>`), files)).toBeNull()
    expect(mediaParagraphIds(first(`<p>${link(1)}${link(9)}</p>`), files)).toEqual([1, 9])
  })
})

describe('mailtoIn', () => {
  it('gives the first mail address in lower case, without the query', () => {
    expect(mailtoIn('<p>Ünvan: <a href="mailto:MMPI@cbar.az?subject=x">mmpi@cbar.az</a></p>')).toBe('mmpi@cbar.az')
    expect(mailtoIn('<a href="https://cbar.az">x</a><a href="mailto:edu@cbar.az">y</a>')).toBe('edu@cbar.az')
  })

  it('keeps an address with a stray `%` as typed instead of failing the page', () => {
    expect(mailtoIn('<a href="mailto:100%@cbar.az">x</a>')).toBe('100%@cbar.az')
  })

  it('null without a mail link', () => {
    expect(mailtoIn('<p><a href="https://cbar.az">cbar.az</a> mailto:x@y.az</p>')).toBeNull()
  })
})
