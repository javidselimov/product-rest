/**
 * File helpers: size, format and icon (`formatSize`/`fileIcon` of the old `[...slug]/page.tsx`).
 */

import { BYTES_PER_KB, FILE_SIZE_UNITS, FRACTION_FROM_UNIT, WHOLE_NUMBER_FROM } from '@/shared/constants/files'
import type { Locale } from '@/shared/i18n'

import { formatNumber } from './numbers'

export type FileSizeParts = { value: number; unit: (typeof FILE_SIZE_UNITS)[number]; unitIndex: number }

/** Scales `bytes` to the largest unit below 1024 (binary); `null` for a negative or non-finite value. */
export function splitFileSize(bytes: number): FileSizeParts | null {
  if (!Number.isFinite(bytes) || bytes < 0) return null
  let value = bytes
  let unitIndex = 0
  while (value >= BYTES_PER_KB && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= BYTES_PER_KB
    unitIndex += 1
  }
  return { value, unit: FILE_SIZE_UNITS[unitIndex]!, unitIndex }
}

export function formatSize(bytes: number): string {
  const parts = splitFileSize(bytes)
  if (!parts) return ''
  const { value, unit, unitIndex } = parts
  const rounded = unitIndex === 0 ? String(Math.round(value)) : value.toFixed(value >= WHOLE_NUMBER_FROM ? 0 : 1)
  return `${rounded} ${unit}`
}

/**
 * Localised size: "8,2 MB" (az) / "8.2 MB" (en), 1024-based. One fractional digit from MB up, whole
 * numbers below (Figma `2037:4298`, `2071:2815`). Empty for a negative or non-finite value.
 */
export function formatFileSize(bytes: number, locale: Locale): string {
  const parts = splitFileSize(bytes)
  if (!parts) return ''
  return `${formatNumber(parts.value, locale, { maxFraction: parts.unitIndex >= FRACTION_FROM_UNIT ? 1 : 0 })} ${parts.unit}`
}

/** Format names a download is labelled with; wider than `MIME_EXTENSION`, which also picks an icon. */
const FORMAT_BY_MIME: Record<string, string> = {
  'image/svg+xml': 'SVG',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/webp': 'WEBP',
  'application/postscript': 'EPS',
  'application/eps': 'EPS',
  'application/pdf': 'PDF',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
}

/** "SVG", "EPS", "ZIP"…: from the MIME type, otherwise the name's extension; empty when neither tells. */
export function fileFormatLabel(mimeType: string | null | undefined, name?: string | null): string {
  const fromMime = mimeType ? FORMAT_BY_MIME[mimeType.toLowerCase()] : undefined
  if (fromMime) return fromMime
  const ext = name?.split('.').pop()
  return ext && ext !== name ? ext.toUpperCase() : ''
}

const KNOWN_EXTENSIONS =new Set(['pdf', 'xlsx', 'xls', 'docx', 'doc', 'zip', 'rar'])

const MIME_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'application/vnd.rar': 'rar',
  'application/x-rar-compressed': 'rar',
}

/** Known file type from the MIME type, otherwise from the name's extension. */
export function fileExtension(mimeType: string | null | undefined, name?: string | null): string | undefined {
  const fromMime = mimeType ? MIME_EXTENSION[mimeType.toLowerCase()] : undefined
  const fromName = name?.split('.').pop()?.toLowerCase()
  return fromMime ?? (fromName && KNOWN_EXTENSIONS.has(fromName) ? fromName : undefined)
}

/** `/site/{pdf|xlsx|xls|docx|doc|zip|rar|file}.svg` — static icon path. */
export function fileIcon(mimeType: string | null | undefined, name?: string | null): string {
  return `/site/${fileExtension(mimeType, name) ?? 'file'}.svg`
}

export function isImageMime(mimeType: string | null | undefined): boolean {
  return Boolean(mimeType?.toLowerCase().startsWith('image/'))
}
