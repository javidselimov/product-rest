/**
 * "Cooperation with central banks" body (spec 045, Figma `2198:112842`): the page intro, then the
 * table of Memoranda of Understanding with its sort choice. Sizes: `contracts/ui-contract.md`.
 *
 * The table keeps its three columns at every width; a long organization name wraps instead of
 * scrolling. The rows are sorted here, not in the loader, so the cached page load stays the same
 * for every order.
 */
import type { MemorandumsBlock } from '@/features/about-content/model/types'
import { YEAR_SORT, orderByYear, type YearSort } from '@/features/about-content/model/year-sort'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import {
  TABLE_BODY_CELL,
  TABLE_BODY_ROW,
  TABLE_FRAME,
  TABLE_HEAD_CELL,
  TABLE_HEAD_ROW,
  TABLE_ORGANIZATION_CELL,
  TABLE_YEAR_CELL,
} from './constants'
import { YearSortMenu } from './year-sort-menu'

const TITLE_ID = 'memorandums-title'

/** Right-aligned on mobile, left-aligned from tablet, as drawn. */
const COUNTRY_CELL = 'pr-3 text-right tab:pr-6 tab:text-left'

type MemorandumsProps = Readonly<{ block: MemorandumsBlock; locale: Locale; sort?: YearSort }>

export function Memorandums({ block, locale, sort = YEAR_SORT.NEWEST }: MemorandumsProps) {
  const t = getT(locale, 'about')
  const rows = orderByYear(block.rows, (row) => row.year, sort)

  return (
    <div data-slot="memorandums" className="flex flex-col gap-8 tab:gap-7 desk:gap-9">
      {block.introHtml.trim() ? <CmsContent html={block.introHtml} variant="about" /> : null}
      {rows.length > 0 ? (
        <section aria-labelledby={TITLE_ID} className="flex flex-col gap-4">
          <h2 id={TITLE_ID} className="text-foreground text-lg leading-[26px] font-semibold tab:text-xl tab:leading-7">
            {t('memorandums.title')}
          </h2>
          <div className="flex flex-col gap-5">
            <div className="flex h-10 items-center justify-end">
              <YearSortMenu
                sort={sort}
                label={t('memorandums.sort.label')}
                optionLabel={(option) => t(`memorandums.sort.${option}`)}
              />
            </div>
            <div className={TABLE_FRAME}>
              <table aria-labelledby={TITLE_ID} className="text-foreground w-full table-fixed border-collapse">
                <colgroup>
                  <col />
                  <col className="w-[110px] tab:w-[154px] desk:w-[178px]" />
                  <col className="w-20 tab:w-22" />
                </colgroup>
                <thead>
                  <tr className={TABLE_HEAD_ROW}>
                    <th scope="col" className={`${TABLE_HEAD_CELL} ${TABLE_ORGANIZATION_CELL}`}>
                      {t('memorandums.columns.organization')}
                    </th>
                    <th scope="col" className={`${TABLE_HEAD_CELL} ${COUNTRY_CELL}`}>
                      {t('memorandums.columns.country')}
                    </th>
                    <th scope="col" className={`${TABLE_HEAD_CELL} ${TABLE_YEAR_CELL}`}>
                      {t('memorandums.columns.date')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className={TABLE_BODY_ROW}>
                      <td className={`${TABLE_BODY_CELL} ${TABLE_ORGANIZATION_CELL} font-semibold`}>{row.organization}</td>
                      <td className={`${TABLE_BODY_CELL} ${COUNTRY_CELL} font-semibold`}>{row.country}</td>
                      <td className={`${TABLE_BODY_CELL} ${TABLE_YEAR_CELL} font-medium`}>{row.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
