/**
 * Ortaq köməkçilər (spec 002 data-model.md §1).
 */
import { describe, expect, it } from 'vitest'

import { formatDate, monthName, shiftIsoDate, toFeedDate } from './dates'
import { fileIcon, formatSize, isImageMime } from './files'
import { mediaUrl } from './media-url'
import { excerpt, stripHtml } from './text'

describe('mediaUrl', () => {
  it('null və boş dəyəri null qaytarır', () => {
    expect(mediaUrl(null)).toBeNull()
    expect(mediaUrl('')).toBeNull()
  })

  it('mütləq ünvanı olduğu kimi saxlayır', () => {
    expect(mediaUrl('https://cdn.example.az/a.png')).toBe('https://cdn.example.az/a.png')
  })

  it('nisbi yolu same-origin yol kimi qaytarır — API ünvanı ilə birləşdirmir', () => {
    // spec 003 D1: fayllar `/media/[id]` proxy marşrutundan keçir, brauzer
    // `api-cbar` origin-ini görmür.
    expect(mediaUrl('/media/12')).toBe('/media/12')
    expect(mediaUrl('media/12')).toBe('/media/12')
  })
})

describe('tarix', () => {
  it('formatDate locale-ə görə formatlayır', () => {
    expect(formatDate('2026-09-14T10:00:00Z', 'az')).toBe('14.09.2026')
    expect(formatDate('2026-09-14', 'en')).toBe('14/09/2026')
  })

  it('yanlış tarixdə boş sətir qaytarır', () => {
    expect(formatDate('yoxdur', 'az')).toBe('')
    expect(formatDate(null, 'az')).toBe('')
  })

  it('monthName ay adını dilə görə verir', () => {
    expect(monthName(2026, 1, 'en')).toBe('January')
    expect(monthName(2026, 1, 'az').toLowerCase()).toContain('yanvar')
  })

  it('toFeedDate DD.MM.YYYY verir (XML kontraktı)', () => {
    expect(toFeedDate('2026-09-04')).toBe('04.09.2026')
    expect(toFeedDate('2026-09-04T00:00:00')).toBe('04.09.2026')
  })

  it('shiftIsoDate ay sərhədini keçir', () => {
    expect(shiftIsoDate('2026-03-01', -1)).toBe('2026-02-28')
    expect(shiftIsoDate('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('mətn', () => {
  it('stripHtml teqləri və entity-ləri təmizləyir', () => {
    expect(stripHtml('<p>Manat &amp; <b>valyuta</b>&nbsp;bazarı</p>')).toBe('Manat & valyuta bazarı')
    expect(stripHtml('<script>alert(1)</script>Mətn')).toBe('Mətn')
  })

  it('excerpt söz sərhədində kəsir', () => {
    expect(excerpt('Azərbaycan Respublikasının Mərkəzi Bankı', 20)).toBe('Azərbaycan…')
    expect(excerpt('qısa', 20)).toBe('qısa')
  })
})

describe('fayllar', () => {
  it('formatSize vahidləri düzgün seçir', () => {
    expect(formatSize(512)).toBe('512 B')
    expect(formatSize(2048)).toBe('2.0 KB')
    expect(formatSize(15 * 1024 * 1024)).toBe('15 MB')
  })

  it('fileIcon mime və ya addan ikon seçir, naməlumda file.svg', () => {
    expect(fileIcon('application/pdf')).toBe('/site/pdf.svg')
    expect(fileIcon('application/octet-stream', 'hesabat.xlsx')).toBe('/site/xlsx.svg')
    expect(fileIcon('application/octet-stream', 'naməlum.bin')).toBe('/site/file.svg')
  })

  it('isImageMime yalnız image/* üçün doğrudur', () => {
    expect(isImageMime('image/png')).toBe(true)
    expect(isImageMime('application/pdf')).toBe(false)
    expect(isImageMime(null)).toBe(false)
  })
})
