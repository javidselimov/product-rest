/**
 * AZIR table rows → workbook description (spec 021 contracts/xlsx.md, research R7).
 *
 * Sheet 1 keeps the legacy `IndeksExportHelper::exportRates` layout: four columns,
 * header + data rows only, no `%`/`*` markers. Reserve-plan days go to a second
 * sheet, which exists only when at least one row is flagged.
 */
import type { XlsxCell, XlsxSheet } from '@/shared/lib/xlsx'

export type AzirExportRow = {
  /** `YYYY-MM-DD` */
  date: string
  rate: number
  dealVolume: number | null
  dealCount: number | null
  isReservePlan: boolean
}

export type AzirExportLabels = {
  /** `1D AZIR` */
  sheetName: string
  headers: [string, string, string, string]
  notesSheetName: string
  notesHeader: string
  footnote: string
}

export function toAzirWorkbook(
  rows: AzirExportRow[],
  labels: AzirExportLabels,
): { sheets: XlsxSheet[] } {
  const data: XlsxSheet = {
    name: labels.sheetName,
    header: [...labels.headers],
    rows: rows.map((row): XlsxCell[] => [
      { date: row.date },
      row.rate,
      row.dealVolume ?? null,
      row.dealCount ?? null,
    ]),
  }

  const reserve = rows.filter((row) => row.isReservePlan)
  if (reserve.length === 0) return { sheets: [data] }

  const notes: XlsxSheet = {
    name: labels.notesSheetName,
    header: [labels.notesHeader],
    rows: [...reserve.map((row): XlsxCell[] => [{ date: row.date }]), [null], [labels.footnote]],
  }
  return { sheets: [data, notes] }
}
