/**
 * The AZIR import dialog's steps (spec 058, data-model §3): pick a file → (409) confirm the
 * overwrite → done with the written values. Pending and error come from the mutation, not from here.
 */

import { isAppError } from '@/shared/api/types'
import { HTTP_STATUS } from '@/shared/constants/http'
import {
  AZIR_IMPORT_CONFLICT_CODE,
  AZIR_IMPORT_ERROR_CODES,
  type AzirImportErrorCode,
  type AzirImportResult,
} from './schemas'

export type AzirImportState =
  | { step: 'pick' }
  | { step: 'confirm'; valueDate: string; terms: string[] }
  | { step: 'done'; result: AzirImportResult }

/** `yyyy-MM-dd` → `dd.MM.yyyy`. */
export const formatDay = (date: string) => date.split('-').reverse().join('.')

const stringList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []

/** The 409 `date_exists` of an import as the confirm step, or null for any other error. */
export function conflictOf(
  error: unknown,
): Extract<AzirImportState, { step: 'confirm' }> | null {
  if (
    !isAppError(error) ||
    error.status !== HTTP_STATUS.CONFLICT ||
    error.code !== AZIR_IMPORT_CONFLICT_CODE
  )
    return null
  const valueDate = error.details?.valueDate
  return {
    step: 'confirm',
    valueDate: typeof valueDate === 'string' ? valueDate : '',
    terms: stringList(error.details?.terms),
  }
}

export interface ImportErrorText {
  /** `import.errors.<code>` when the code has a translation, otherwise null (use `message`). */
  key: string | null
  values: { row?: unknown; column?: unknown; date?: string }
  message: string | null
}

const isKnownCode = (code: string | undefined): code is AzirImportErrorCode =>
  (AZIR_IMPORT_ERROR_CODES as readonly string[]).includes(code ?? '')

/** What the dialog says for a failed import; `null` message + key means an unexpected error. */
export function importErrorText(error: unknown): ImportErrorText {
  if (!isAppError(error)) return { key: null, values: {}, message: null }
  const valueDate = error.details?.valueDate
  return {
    key: isKnownCode(error.code) ? `import.errors.${error.code}` : null,
    values: {
      row: error.details?.row,
      column: error.details?.column,
      date: typeof valueDate === 'string' ? formatDay(valueDate) : undefined,
    },
    message: error.message,
  }
}
