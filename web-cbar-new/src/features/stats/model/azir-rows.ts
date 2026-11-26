/**
 * AZIR cədvəlinin sətirləri (spec 021 FR-010, data-model §6): yalnız 1D, `rate > 0`,
 * tarix azalan. Export eyni funksiyanı işlədir — fayl ekranla eynidir (SC-003).
 */
import type { AzirValue } from './schemas'

export const AZIR_TABLE_TERM = '1D'

export type AzirTableRow = {
  /** `YYYY-MM-DD` */
  date: string
  rate: number
  dealVolume: number | null
  dealCount: number | null
  isReservePlan: boolean
}

/** Qrafik və cədvəl üçün ortaq süzgəc: 1D və müsbət dərəcə. */
export function isAzirTableValue(value: AzirValue): boolean {
  return value.term === AZIR_TABLE_TERM && value.rate > 0
}

export function toAzirTableRows(values: AzirValue[]): AzirTableRow[] {
  return values
    .filter(isAzirTableValue)
    .map((v) => ({
      date: v.valueDate,
      rate: v.rate,
      dealVolume: v.dealVolume ?? null,
      dealCount: v.dealCount ?? null,
      isReservePlan: v.isReservePlan,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

/** Footnote yalnız göstərilən sətirlərdən biri işarəlidirsə çıxır (FR-013). */
export function hasReservePlan(rows: AzirTableRow[]): boolean {
  return rows.some((row) => row.isReservePlan)
}
