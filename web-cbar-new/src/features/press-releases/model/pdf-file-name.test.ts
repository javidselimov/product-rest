import { describe, expect, it } from 'vitest'

import { PDF_FILE_NAME_MAX_LENGTH } from './constants'
import { pdfFileName } from './pdf-file-name'

describe('pdfFileName', () => {
  it('keeps the title, Azerbaijani letters and quotes-free punctuation included', () => {
    expect(pdfFileName('Mərkəzi Bankın sədri ilə müsahibə, 2024')).toBe('Mərkəzi Bankın sədri ilə müsahibə, 2024.pdf')
  })

  it('removes characters a file name cannot hold', () => {
    expect(pdfFileName('a/b\\c:d*e?f"g<h>i|j\tk')).toBe('abcdefghijk.pdf')
  })

  it('trims the edges', () => {
    expect(pdfFileName('  Çıxış  ')).toBe('Çıxış.pdf')
  })

  it('cuts a long title but keeps the extension', () => {
    const name = pdfFileName('ə'.repeat(PDF_FILE_NAME_MAX_LENGTH + 30))

    expect(name).toHaveLength(PDF_FILE_NAME_MAX_LENGTH + '.pdf'.length)
    expect(name.endsWith('.pdf')).toBe(true)
  })

  it('a cut title does not end in a space', () => {
    const name = pdfFileName(`${'a'.repeat(PDF_FILE_NAME_MAX_LENGTH - 1)} bbb`)

    expect(name).toBe(`${'a'.repeat(PDF_FILE_NAME_MAX_LENGTH - 1)}.pdf`)
  })

  it('a title with nothing usable falls back to a neutral name', () => {
    expect(pdfFileName('???')).toBe('document.pdf')
  })
})
