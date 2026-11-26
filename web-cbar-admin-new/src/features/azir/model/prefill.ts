/**
 * "Formaya yüklə" konteksti (spec 021 R14): sətir əməli siyahıdakı sətri upsert
 * kartına ötürür. `GET/PUT /azir/{id}` olmadığı üçün redaktə forması yoxdur —
 * mövcud sətir kartda doldurulub eyni tarix + müddətlə yenidən saxlanılır.
 * Dinləyici modelidir (state deyil): eyni sətri ikinci dəfə yükləmək də işləyir.
 * Provider `prefill-context.tsx`-dədir (react-refresh: tsx yalnız komponent ixrac edir).
 */

import { createContext, useContext } from 'react'

import type { AzirItem } from './schemas'

/** Kartın form dəyərləri — rəqəm sahələri sətirdir, boş sətir → `null`. */
export interface AzirFormValues {
  valueDate: string
  term: string
  rate: string
  dealVolume: string
  dealCount: string
  minRate: string
  maxRate: string
  isReservePlan: boolean
}

export const AZIR_EMPTY_FORM_VALUES: AzirFormValues = {
  valueDate: '',
  term: '1D',
  rate: '',
  dealVolume: '',
  dealCount: '',
  minRate: '',
  maxRate: '',
  isReservePlan: false,
}

const toInput = (value: number | null) => (value === null ? '' : String(value))

export function rowToFormValues(row: AzirItem): AzirFormValues {
  return {
    valueDate: row.valueDate,
    term: row.term,
    rate: String(row.rate),
    dealVolume: toInput(row.dealVolume),
    dealCount: toInput(row.dealCount),
    minRate: toInput(row.minRate),
    maxRate: toInput(row.maxRate),
    isReservePlan: row.isReservePlan,
  }
}

export type PrefillListener = (row: AzirItem) => void

export interface AzirPrefill {
  set: (row: AzirItem) => void
  subscribe: (listener: PrefillListener) => () => void
}

export function createAzirPrefill(): AzirPrefill {
  const listeners = new Set<PrefillListener>()
  return {
    set: (row) => listeners.forEach((listener) => listener(row)),
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

/** Provider-siz (kartsız siyahı) əməl heç nə etmir. */
export const AzirPrefillContext = createContext<AzirPrefill>({
  set: () => {},
  subscribe: () => () => {},
})

export function useAzirPrefill() {
  return useContext(AzirPrefillContext)
}
