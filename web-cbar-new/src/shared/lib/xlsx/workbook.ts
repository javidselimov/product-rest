/**
 * Minimal SpreadsheetML (OOXML) writer (spec 021 research R6, contracts/xlsx.md).
 *
 * Supports only what the AZIR export needs: 1+ sheets, a bold header row, inline
 * string, number and date cells. No shared strings, formulas or merged cells.
 * Server-only — the ZIP container relies on `node:zlib`.
 */
import { DAY_MS } from '@/shared/constants/time'

import { createZip } from './zip'

/** `{ date: 'YYYY-MM-DD' }` is written as an Excel serial with a `dd.mm.yyyy` format. */
export type XlsxCell = string | number | { date: string } | null

export type XlsxSheet = { name: string; header: string[]; rows: XlsxCell[][] }

const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const NS_PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships'
const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'

/** `cellXfs` indices in `styles.xml`. */
const STYLE_HEADER = 1
const STYLE_DATE = 2

/** Excel 1900 system day 0 (accounts for the fictitious 1900-02-29). */
const EXCEL_EPOCH = Date.UTC(1899, 11, 30)

const SHEET_NAME_MAX = 31
const DATE_COLUMN_WIDTH = 12
const MAX_COLUMN_WIDTH = 60

// Characters not allowed in XML 1.0 documents.
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g

export function escapeXml(value: string): string {
  return value
    .replace(INVALID_XML_CHARS, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** `2026-09-12` → `46277`. Throws on anything that is not a real calendar date. */
export function excelDateSerial(isoDate: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (match) {
    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
    const time = Date.UTC(year, month - 1, day)
    const parsed = new Date(time)
    if (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    ) {
      return Math.round((time - EXCEL_EPOCH) / DAY_MS)
    }
  }
  throw new Error(`xlsx: invalid date "${isoDate}"`)
}

/** 0 → `A`, 25 → `Z`, 26 → `AA`. */
export function columnName(index: number): string {
  let name = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name
  }
  return name
}

/** Excel rejects `[]:*?/\` in sheet names and caps them at 31 characters. */
function sheetName(name: string): string {
  const clean = Array.from(name.replace(/[[\]:*?/\\]/g, '_').trim())
    .slice(0, SHEET_NAME_MAX)
    .join('')
  return clean || 'Sheet'
}

function cellXml(ref: string, cell: XlsxCell, style?: number): string {
  if (cell === null) return ''
  const s = style === undefined ? '' : ` s="${style}"`
  if (typeof cell === 'number') {
    return Number.isFinite(cell) ? `<c r="${ref}"${s}><v>${String(cell)}</v></c>` : ''
  }
  if (typeof cell === 'string') {
    return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell)}</t></is></c>`
  }
  return `<c r="${ref}" s="${STYLE_DATE}"><v>${excelDateSerial(cell.date)}</v></c>`
}

function rowXml(rowNumber: number, cells: XlsxCell[], style?: number): string {
  const body = cells
    .map((cell, col) => cellXml(`${columnName(col)}${rowNumber}`, cell, style))
    .join('')
  return body ? `<row r="${rowNumber}">${body}</row>` : ''
}

function cellWidth(cell: XlsxCell): number {
  if (cell === null) return 0
  if (typeof cell === 'string') return cell.length
  if (typeof cell === 'number') return String(cell).length
  return DATE_COLUMN_WIDTH
}

/** Column widths so dates do not render as `#####` at Excel's default width. */
function colsXml(sheet: XlsxSheet): string {
  const widths: number[] = []
  for (const cells of [sheet.header, ...sheet.rows]) {
    cells.forEach((cell, col) => {
      widths[col] = Math.max(widths[col] ?? 0, cellWidth(cell))
    })
  }
  if (widths.length === 0) return ''
  const cols = Array.from(widths, (w, i) => {
    const width = Math.min(Math.max((w ?? 0) + 2, 10), MAX_COLUMN_WIDTH)
    return `<col min="${i + 1}" max="${i + 1}" width="${width}" customWidth="1"/>`
  })
  return `<cols>${cols.join('')}</cols>`
}

function worksheetXml(sheet: XlsxSheet): string {
  const rows = [rowXml(1, sheet.header, STYLE_HEADER)]
  sheet.rows.forEach((cells, i) => rows.push(rowXml(i + 2, cells)))
  return (
    `${XML_DECL}<worksheet xmlns="${NS_MAIN}" xmlns:r="${NS_REL}">` +
    `${colsXml(sheet)}<sheetData>${rows.join('')}</sheetData></worksheet>`
  )
}

const STYLES_XML =
  `${XML_DECL}<styleSheet xmlns="${NS_MAIN}">` +
  '<numFmts count="1"><numFmt numFmtId="164" formatCode="dd.mm.yyyy"/></numFmts>' +
  '<fonts count="2">' +
  '<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>' +
  '<font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font>' +
  '</fonts>' +
  '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="3">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
  '</cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>'

function contentTypesXml(sheetCount: number): string {
  const sheets = Array.from(
    { length: sheetCount },
    (_, i) =>
      `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
  )
  return (
    `${XML_DECL}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    `${sheets.join('')}</Types>`
  )
}

const ROOT_RELS_XML =
  `${XML_DECL}<Relationships xmlns="${NS_PKG_REL}">` +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
  '</Relationships>'

function workbookXml(sheets: XlsxSheet[]): string {
  const entries = sheets.map(
    (sheet, i) =>
      `<sheet name="${escapeXml(sheetName(sheet.name))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
  )
  return `${XML_DECL}<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_REL}"><sheets>${entries.join('')}</sheets></workbook>`
}

function workbookRelsXml(sheetCount: number): string {
  const rels = Array.from(
    { length: sheetCount },
    (_, i) =>
      `<Relationship Id="rId${i + 1}" Type="${NS_REL}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
  )
  rels.push(`<Relationship Id="rId${sheetCount + 1}" Type="${NS_REL}/styles" Target="styles.xml"/>`)
  return `${XML_DECL}<Relationships xmlns="${NS_PKG_REL}">${rels.join('')}</Relationships>`
}

/** Builds the `.xlsx` bytes. At least one sheet is required. */
export function buildXlsx(input: { sheets: XlsxSheet[] }): Uint8Array {
  const { sheets } = input
  if (sheets.length === 0) throw new Error('xlsx: a workbook needs at least one sheet')

  const encoder = new TextEncoder()
  const parts: [string, string][] = [
    ['[Content_Types].xml', contentTypesXml(sheets.length)],
    ['_rels/.rels', ROOT_RELS_XML],
    ['xl/workbook.xml', workbookXml(sheets)],
    ['xl/_rels/workbook.xml.rels', workbookRelsXml(sheets.length)],
    ['xl/styles.xml', STYLES_XML],
    ...sheets.map((sheet, i): [string, string] => [
      `xl/worksheets/sheet${i + 1}.xml`,
      worksheetXml(sheet),
    ]),
  ]
  return createZip(parts.map(([name, xml]) => ({ name, data: encoder.encode(xml) })))
}
