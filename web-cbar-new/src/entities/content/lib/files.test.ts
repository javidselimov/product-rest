import { describe, expect, it } from 'vitest'

import { fileFormatLabel, formatFileSize } from './files'

describe('formatFileSize', () => {
  it('localises the fraction from MB up', () => {
    expect(formatFileSize(1_258_291, 'az')).toBe('1,2 MB')
    expect(formatFileSize(1_258_291, 'en')).toBe('1.2 MB')
    expect(formatFileSize(2_516_582, 'az')).toBe('2,4 MB')
  })

  it('keeps KB and B whole', () => {
    expect(formatFileSize(48 * 1024, 'az')).toBe('48 KB')
    expect(formatFileSize(512, 'en')).toBe('512 B')
  })

  it('is empty for an impossible size', () => {
    expect(formatFileSize(-1, 'az')).toBe('')
    expect(formatFileSize(Number.NaN, 'az')).toBe('')
  })
})

describe('fileFormatLabel', () => {
  it('names logo formats by MIME type', () => {
    expect(fileFormatLabel('image/svg+xml')).toBe('SVG')
    expect(fileFormatLabel('image/png')).toBe('PNG')
    expect(fileFormatLabel('application/postscript')).toBe('EPS')
    expect(fileFormatLabel('application/zip')).toBe('ZIP')
  })

  it('falls back to the extension of the name', () => {
    expect(fileFormatLabel('application/octet-stream', 'cbar-logo.ai')).toBe('AI')
    expect(fileFormatLabel(null, 'logo')).toBe('')
  })
})
