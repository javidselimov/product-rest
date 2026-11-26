/**
 * "Membership in international organizations" body (spec 046, Figma `2224:7202`): the editor's intro,
 * the year order choice and the two-column membership table, then the text after the table.
 * Sizes: `specs/046-international-memberships/contracts/ui-contract.md`.
 *
 * The rows come from the editor's own table (`model/memberships.ts`); the column names are ours. The
 * table title is hidden in the design, so it only names the table for screen readers. The rows are
 * sorted here, not in the loader, so the cached page load stays the same for every order.
 */
import type { MembershipsBlock } from '@/features/about-content/model/types'
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

const TITLE_ID = 'memberships-title'

type MembershipsProps = Readonly<{ block: MembershipsBlock; locale: Locale; sort?: YearSort }>

export function Memberships({ block, locale, sort = YEAR_SORT.NEWEST }: MembershipsProps) {
  const t = getT(locale, 'about')
  const rows = orderByYear(block.rows, (row) => row.year, sort)

  return (
    <div data-slot="memberships" className="flex flex-col gap-8 tab:gap-7 desk:gap-9">
      {block.introHtml.trim() ? <CmsContent html={block.introHtml} variant="about" /> : null}
      {rows.length > 0 ? (
        <section aria-labelledby={TITLE_ID} className="flex flex-col gap-5">
          <h2 id={TITLE_ID} className="sr-only">
            {t('memberships.title')}
          </h2>
          <div className="flex h-10 items-center justify-end">
            {/* Figma: no right padding on mobile (`2224:7817`), 12 from tablet. */}
            <YearSortMenu
              sort={sort}
              label={t('memberships.sort.label')}
              optionLabel={(option) => t(`memberships.sort.${option}`)}
              className="pr-0 tab:pr-3"
            />
          </div>
          <div className={TABLE_FRAME}>
            <table aria-labelledby={TITLE_ID} className="text-foreground w-full table-fixed border-collapse">
              <colgroup>
                <col />
                {/* Year 68 + 12 on mobile, 140 + 24 from tablet. */}
                <col className="w-20 tab:w-41" />
              </colgroup>
              <thead>
                <tr className={TABLE_HEAD_ROW}>
                  <th scope="col" className={`${TABLE_HEAD_CELL} ${TABLE_ORGANIZATION_CELL}`}>
                    {t('memberships.columns.organization')}
                  </th>
                  <th scope="col" className={`${TABLE_HEAD_CELL} ${TABLE_YEAR_CELL}`}>
                    {t('memberships.columns.year')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  // Rows have no id of their own; the position in the editor's table is stable per render.
                  <tr key={`${index}-${row.organization}`} className={TABLE_BODY_ROW}>
                    <td className={`${TABLE_BODY_CELL} ${TABLE_ORGANIZATION_CELL} font-semibold`}>
                      {row.href ? (
                        <a href={row.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {row.organization}
                        </a>
                      ) : (
                        row.organization
                      )}
                    </td>
                    <td className={`${TABLE_BODY_CELL} ${TABLE_YEAR_CELL} font-medium`}>{row.yearLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {block.restHtml.trim() ? <CmsContent html={block.restHtml} variant="about" /> : null}
    </div>
  )
}
