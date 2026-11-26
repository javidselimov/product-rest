import { describe, expect, it } from 'vitest'

import { formatPhotoSize, photoFormatLabel, photoMeta, photosTotalBytes } from './photos'

const photo = {
  mediaId: 7,
  originalName: 'portret.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 8_598_323,
  width: 4000,
  height: 6000,
  url: '/media/7',
}

describe('mətbuat fotosu mətni', () => {
  it('format MIME-dən, sonra uzantıdan', () => {
    expect(photoFormatLabel('image/jpeg', 'x.bin')).toBe('JPG')
    expect(photoFormatLabel('application/octet-stream', 'scan.TIF')).toBe('TIF')
    expect(photoFormatLabel('application/octet-stream', 'noext')).toBe('')
  })

  it('ölçü lokala görə: az vergül, en nöqtə; 10-dan böyük kəsrsiz', () => {
    expect(formatPhotoSize(8_598_323, 'az')).toBe('8,2 MB')
    expect(formatPhotoSize(8_598_323, 'en')).toBe('8.2 MB')
    expect(formatPhotoSize(22_963_814, 'az')).toBe('21,9 MB')
    expect(formatPhotoSize(640 * 1024, 'az')).toBe('640 KB')
    expect(formatPhotoSize(512, 'az')).toBe('512 B')
  })

  it('kart sətri Figma nümunəsi kimi; naməlum hissələr buraxılır', () => {
    expect(photoMeta(photo, 'az')).toBe('JPG · 4000×6000 px · 8,2 MB')
    expect(photoMeta({ ...photo, width: null, height: null, sizeBytes: 0 }, 'az')).toBe('JPG')
  })

  it('ZIP ölçüsü = fayl ölçülərinin cəmi', () => {
    expect(photosTotalBytes([photo, { ...photo, sizeBytes: 100 }])).toBe(8_598_423)
  })
})
