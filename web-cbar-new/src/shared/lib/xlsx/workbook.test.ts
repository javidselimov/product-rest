// @vitest-environment node
import { inflateRawSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import { buildXlsx, columnName, escapeXml, excelDateSerial, type XlsxSheet } from './workbook'

/** Archive parts by name, decoded as UTF-8 (central directory walk). */
function readParts(zip: Uint8Array): Map<string, string> {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength)
  const eocd = zip.length - 22
  const count = view.getUint16(eocd + 10, true)
  const decoder = new TextDecoder()
  const parts = new Map<string, string>()

  let at = view.getUint32(eocd + 16, true)
  for (let i = 0; i < count; i++) {
    const compressedSize = view.getUint32(at + 20, true)
    const nameLength = view.getUint16(at + 28, true)
    const skip = nameLength + view.getUint16(at + 30, true) + view.getUint16(at + 32, true)
    const local = view.getUint32(at + 42, true)
    const name = decoder.decode(zip.subarray(at + 46, at + 46 + nameLength))

    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
    parts.set(name, decoder.decode(inflateRawSync(zip.subarray(start, start + compressedSize))))
    at += 46 + skip
  }
  return parts
}

const dataSheet: XlsxSheet = {
  name: '1D AZIR',
  header: ['Tarix', 'Faiz', 'Əqdlərin həcmi (mln. AZN)', 'Əqdlərin sayı'],
  rows: [
    [{ date: '2026-09-12' }, 7.25, 120.5, 14],
    [{ date: '2026-09-11' }, 7.2, null, null],
  ],
}

const notesSheet: XlsxSheet = {
  name: 'Qeydlər',
  header: ['Ehtiyat plan əsasında hesablanmış günlər'],
  rows: [[{ date: '2026-09-11' }], [null], ['*Ehtiyat plan əsasında hesablanmışdır']],
}

const BASE_PARTS = [
  '[Content_Types].xml',
  '_rels/.rels',
  'xl/workbook.xml',
  'xl/_rels/workbook.xml.rels',
  'xl/styles.xml',
]

describe('buildXlsx', () => {
  it('one-sheet workbook has exactly the contract parts', () => {
    const parts = readParts(buildXlsx({ sheets: [dataSheet] }))

    expect([...parts.keys()]).toEqual([...BASE_PARTS, 'xl/worksheets/sheet1.xml'])
    expect(parts.get('xl/workbook.xml')).toContain('<sheet name="1D AZIR" sheetId="1" r:id="rId1"/>')
    expect(parts.get('xl/workbook.xml')).not.toContain('sheetId="2"')
    expect(parts.get('[Content_Types].xml')).toContain('PartName="/xl/worksheets/sheet1.xml"')
    expect(parts.get('xl/_rels/workbook.xml.rels')).toContain('Target="styles.xml"')
  })

  it('two-sheet workbook registers both sheets', () => {
    const parts = readParts(buildXlsx({ sheets: [dataSheet, notesSheet] }))

    expect([...parts.keys()]).toEqual([
      ...BASE_PARTS,
      'xl/worksheets/sheet1.xml',
      'xl/worksheets/sheet2.xml',
    ])
    expect(parts.get('xl/workbook.xml')).toContain('<sheet name="Qeydlər" sheetId="2" r:id="rId2"/>')
    expect(parts.get('[Content_Types].xml')).toContain('PartName="/xl/worksheets/sheet2.xml"')
    expect(parts.get('xl/_rels/workbook.xml.rels')).toContain('Id="rId2"')
    expect(parts.get('xl/_rels/workbook.xml.rels')).toContain(
      '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
    )

    const notes = parts.get('xl/worksheets/sheet2.xml') ?? ''
    // Empty spacer row is omitted; the footnote keeps its row number.
    expect(notes).not.toContain('<row r="3"')
    expect(notes).toContain('<row r="4"><c r="A4" t="inlineStr">')
  })

  it('writes numbers as <v> with a dot decimal and skips null cells', () => {
    const sheet = readParts(buildXlsx({ sheets: [dataSheet] })).get('xl/worksheets/sheet1.xml') ?? ''

    expect(sheet).toContain('<c r="B2"><v>7.25</v></c>')
    expect(sheet).toContain('<c r="C2"><v>120.5</v></c>')
    expect(sheet).toContain('<c r="D2"><v>14</v></c>')
    expect(sheet).toContain('<c r="B3"><v>7.2</v></c>')
    expect(sheet).not.toContain('r="C3"')
    expect(sheet).not.toContain('r="D3"')
  })

  it('writes dates as 1900 serials with the dd.mm.yyyy style', () => {
    const parts = readParts(buildXlsx({ sheets: [dataSheet] }))

    expect(parts.get('xl/worksheets/sheet1.xml')).toContain('<c r="A2" s="2"><v>46277</v></c>')
    const styles = parts.get('xl/styles.xml') ?? ''
    expect(styles).toContain('<numFmt numFmtId="164" formatCode="dd.mm.yyyy"/>')
    // cellXfs[2] uses that format.
    const xfs = /<cellXfs count="3">(.*)<\/cellXfs>/.exec(styles)?.[1].match(/<xf [^>]*\/>/g) ?? []
    expect(xfs).toHaveLength(3)
    expect(xfs[2]).toContain('numFmtId="164"')
    expect(xfs[2]).toContain('applyNumberFormat="1"')
  })

  it('header row is bold', () => {
    const parts = readParts(buildXlsx({ sheets: [dataSheet] }))
    const sheet = parts.get('xl/worksheets/sheet1.xml') ?? ''

    expect(sheet).toContain(
      '<row r="1"><c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">Tarix</t></is></c>',
    )
    const styles = parts.get('xl/styles.xml') ?? ''
    const fonts = /<fonts count="2">(.*)<\/fonts>/.exec(styles)?.[1].match(/<font>.*?<\/font>/g) ?? []
    expect(fonts[1]).toContain('<b/>')
    const xfs = /<cellXfs count="3">(.*)<\/cellXfs>/.exec(styles)?.[1].match(/<xf [^>]*\/>/g) ?? []
    expect(xfs[1]).toContain('fontId="1"')
  })

  it('escapes inline strings and sheet names', () => {
    const parts = readParts(
      buildXlsx({
        sheets: [{ name: `A&B <"x"> 'y' and a much longer tail`, header: ['a & b < c'], rows: [] }],
      }),
    )

    expect(parts.get('xl/worksheets/sheet1.xml')).toContain(
      '<t xml:space="preserve">a &amp; b &lt; c</t>',
    )
    // Truncated to 31 characters before escaping.
    expect(parts.get('xl/workbook.xml')).toContain(
      'name="A&amp;B &lt;&quot;x&quot;&gt; &apos;y&apos; and a much longer"',
    )
  })

  it('an empty sheet still has the header row', () => {
    const sheet =
      readParts(buildXlsx({ sheets: [{ ...dataSheet, rows: [] }] })).get('xl/worksheets/sheet1.xml') ??
      ''

    expect(sheet).toContain('<sheetData><row r="1">')
    expect(sheet).not.toContain('<row r="2"')
  })

  it('rejects a workbook without sheets', () => {
    expect(() => buildXlsx({ sheets: [] })).toThrow()
  })
})

describe('xlsx helpers', () => {
  it('excelDateSerial', () => {
    expect(excelDateSerial('2026-09-12')).toBe(46277)
    expect(excelDateSerial('1900-03-01')).toBe(61)
    expect(() => excelDateSerial('2026-02-30')).toThrow()
    expect(() => excelDateSerial('12.09.2026')).toThrow()
  })

  it('escapeXml', () => {
    expect(escapeXml(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &apos;')
    expect(escapeXml('a\u0001b')).toBe('ab')
  })

  it('columnName', () => {
    expect([0, 3, 25, 26, 27, 701, 702].map(columnName)).toEqual([
      'A',
      'D',
      'Z',
      'AA',
      'AB',
      'ZZ',
      'AAA',
    ])
  })
})
