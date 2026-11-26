import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'
import { parseBlocks } from '@/shared/lib/html-blocks'

import { monthNumber, parseYearArchive } from './year-archive'

const nodes = (html: string) => parseBlocks(html) ?? []

const month = (label: string, id: number) =>
  `<details data-accordion=""><summary>${label}</summary><div data-type="details-content"><p><a target="_blank" rel="noopener noreferrer nofollow" href="/media/${id}" data-media-link="">Index (${label})</a></p></div></details>`

/** The editor's form: the month accordions sit in a one-cell table. */
const year = (value: string, months: string) =>
  `<details data-accordion=""><summary>${value}</summary><div data-type="details-content"><table style="min-width: 25px;"><colgroup><col style="min-width: 25px;"></colgroup><tbody><tr><td colspan="1" rowspan="1">${months}</td></tr></tbody></table></div></details>`

/** The legacy import as the test environment has it (api-cbar-test, page 95, 2026-11-17). */
const LEGACY = `<div>
 <details data-accordion=""><summary>
    2026
   </summary><div data-type="details-content">
  <div>
   <table>
    <tbody>
     <tr>
      <td>
       <div>
        <details data-accordion=""><summary>
           May
          </summary><div data-type="details-content">
         <div>
          <a data-media-link="" href="/media/1179">Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi (2026-cı ilin may ayı üzrə)</a>
         </div>
        </div></details>
        <details data-accordion=""><summary>
           Aprel
          </summary><div data-type="details-content">
         <div>
          <a data-media-link="" href="/media/1180">Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi (2026-cı ilin aprel ayı üzrə)</a>
         </div>
        </div></details>
       </div>
      </td>
     </tr>
    </tbody>
   </table>
  </div>
 </div></details>
</div>`

describe('monthNumber', () => {
  it('reads az and en month names, whatever the case and the dotted/dotless i', () => {
    expect(monthNumber('Yanvar')).toBe(1)
    expect(monthNumber('İYUN')).toBe(6)
    expect(monthNumber('Iyul')).toBe(7)
    expect(monthNumber(' september ')).toBe(9)
    expect(monthNumber('Rüb I')).toBeNull()
  })
})

describe('parseYearArchive', () => {
  it('reads the editor form: years and months newest first, the latest file', () => {
    const html = year('2025', month('Dekabr', 3) + month('Noyabr', 4)) + year('2026', month('Aprel', 2) + month('May', 1))
    const parsed = parseYearArchive(nodes(html))

    expect(parsed?.archive.years.map((y) => [y.year, y.months.map((m) => m.label)])).toEqual([
      [2026, ['May', 'Aprel']],
      [2025, ['Dekabr', 'Noyabr']],
    ])
    expect(parsed?.archive.latest).toMatchObject({ year: 2026, month: { label: 'May', month: 5, file: { id: 1, url: '/media/1' } } })
  })

  it('reads the legacy import: wrapper div, table cell and whitespace', () => {
    const parsed = parseYearArchive(nodes(LEGACY))

    expect(parsed?.archive.years).toHaveLength(1)
    expect(parsed?.archive.years[0]?.months.map((m) => [m.label, m.file.id])).toEqual([
      ['May', 1179],
      ['Aprel', 1180],
    ])
  })

  it('takes the title and type from the page assets, the link text otherwise', () => {
    const files: AttachmentFile[] = [{ id: 1, title: 'Asset title', mimeType: 'application/pdf', sizeBytes: 10, group: null, url: '/media/1' }]
    const parsed = parseYearArchive(nodes(year('2026', month('May', 1) + month('Aprel', 2))), files)
    const [may, april] = parsed?.archive.years[0]?.months ?? []

    expect(may?.file).toEqual({ id: 1, title: 'Asset title', url: '/media/1', mimeType: 'application/pdf', sizeBytes: 10 })
    expect(april?.file).toEqual({ id: 2, title: 'Index (Aprel)', url: '/media/2', mimeType: null })
  })

  it('keeps an unknown label at the end and drops a month without a file', () => {
    const empty = '<details data-accordion=""><summary>Mart</summary><div data-type="details-content"><p>soon</p></div></details>'
    const parsed = parseYearArchive(nodes(year('2026', month('Rüb I', 9) + empty + month('Fevral', 8))))

    expect(parsed?.archive.years[0]?.months.map((m) => [m.label, m.month])).toEqual([
      ['Fevral', 2],
      ['Rüb I', null],
    ])
  })

  it('keeps the text around the archive', () => {
    const parsed = parseYearArchive(nodes(`<p>Intro</p>${year('2026', month('May', 1))}<h2>Method</h2>`))

    expect(parsed?.before.map((n) => n.outer)).toEqual(['<p>Intro</p>'])
    expect(parsed?.after.map((n) => n.outer)).toEqual(['<h2>Method</h2>'])
  })

  it('is null without a year accordion', () => {
    expect(parseYearArchive(nodes('<p>Text</p><details data-accordion=""><summary>Other</summary><div data-type="details-content"></div></details>'))).toBeNull()
  })
})
