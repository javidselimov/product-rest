/**
 * Name of the downloaded PDF (spec 033 research R6). Migrated files are stored under a hash, so
 * the browser saves the file with the title instead.
 */
import { PDF_EXTENSION, PDF_FALLBACK_NAME, PDF_FILE_NAME_MAX_LENGTH } from './constants'

/** Characters Windows does not allow in a file name, and control characters. */
const UNSAFE_FILE_NAME_CHARS = /[/\\:*?"<>|\p{Cc}]/gu

export function pdfFileName(title: string): string {
  const name = title.replace(UNSAFE_FILE_NAME_CHARS, '').trim().slice(0, PDF_FILE_NAME_MAX_LENGTH).trimEnd()
  return `${name || PDF_FALLBACK_NAME}${PDF_EXTENSION}`
}
