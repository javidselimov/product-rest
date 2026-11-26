/**
 * Card text of the press photos (Figma `2037:4298`): "JPG · 4000×6000 px · 8,2 MB" and the size for
 * "Hamısını yüklə (ZIP, 21,9 MB)". Numbers are localised with `Intl` (az comma).
 */
import { formatFileSize } from '@/entities/content'
import type { Locale } from '@/shared/i18n'

import type { StaffPhoto } from './schemas'

const FORMAT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'image/gif': 'GIF',
  'image/tiff': 'TIFF',
  'image/heic': 'HEIC',
  'image/avif': 'AVIF',
}

/** Format label: from the MIME type, otherwise the file extension; empty when neither is known. */
export function photoFormatLabel(mimeType: string, originalName: string): string {
  const fromMime = FORMAT_BY_MIME[mimeType.toLowerCase()]
  if (fromMime) return fromMime
  const ext = originalName.split('.').pop()
  return ext && ext !== originalName ? ext.toUpperCase() : ''
}

/** "8,2 MB" / "21,9 MB" / "640 KB": the shared localised size (`formatFileSize`). */
export function formatPhotoSize(bytes: number, locale: Locale): string {
  return formatFileSize(bytes, locale)
}

/** The card's bottom line; unknown parts (size, format) are left out. */
export function photoMeta(photo: StaffPhoto, locale: Locale): string {
  const parts: string[] = []
  const format = photoFormatLabel(photo.mimeType, photo.originalName)
  if (format) parts.push(format)
  if (photo.width && photo.height) parts.push(`${photo.width}×${photo.height} px`)
  if (photo.sizeBytes > 0) parts.push(formatPhotoSize(photo.sizeBytes, locale))
  return parts.join(' · ')
}

/** The ZIP is stored uncompressed (api-cbar), so the archive is about the sum of the file sizes. */
export function photosTotalBytes(photos: readonly StaffPhoto[]): number {
  return photos.reduce((sum, photo) => sum + Math.max(0, photo.sizeBytes), 0)
}
