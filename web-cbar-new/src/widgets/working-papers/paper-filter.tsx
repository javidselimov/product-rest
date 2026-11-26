/**
 * Search and year filter of the working paper list (spec 054 US1, ui-contract §3; Figma `2825:22947`, tablet `2828:23647`).
 *
 * A plain GET form, so it works without JavaScript (FR-014): it submits `q` and the chosen year as a hidden field, and no
 * `page`, which starts the result at page 1. The year choice is a menu of links (`YearMenu`) that keeps the search in the
 * address. A server component: the kit `Input` and `Button` are rendered as elements, nothing here runs in the browser.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { SearchIcon } from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import Link from 'next/link'

import { QUERY_MAX_LENGTH } from '@/shared/constants/limits'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { buildHref } from '@/shared/lib/search-params'
import { YearMenu, type YearMenuOption } from '@/widgets/year-menu'

import { FILTER_FIELD_CLASS } from './constants'

type PaperFilterProps = Readonly<{
  locale: Locale
  basePath: string
  q: string
  year: number | undefined
  years: readonly number[]
}>

const SEARCH_ID = 'working-paper-search'

export function PaperFilter({ locale, basePath, q, year, years }: PaperFilterProps) {
  const t = getT(locale, 'workingPapers')
  const options: YearMenuOption[] = [
    { key: 'all', label: t('year.all'), href: buildHref(basePath, { q }), selected: year === undefined },
    ...years.map((y) => ({ key: String(y), label: String(y), href: buildHref(basePath, { q, year: y }), selected: y === year })),
  ]

  return (
    <form
      method="get"
      action={basePath}
      role="search"
      aria-label={t('search.label')}
      data-slot="paper-filter"
      className="flex items-center justify-between gap-6 max-desk:flex-col max-desk:items-stretch max-desk:gap-4"
    >
      <div className="flex items-center gap-6 max-desk:flex-col max-desk:items-stretch max-desk:gap-4">
        <label htmlFor={SEARCH_ID} className="sr-only">
          {t('search.label')}
        </label>
        <Input
          id={SEARCH_ID}
          type="search"
          name={QUERY_PARAM.QUERY}
          defaultValue={q}
          maxLength={QUERY_MAX_LENGTH}
          placeholder={t('search.placeholder')}
          startElement={<SearchIcon aria-hidden="true" className="size-5 opacity-70" />}
          className={`h-11 rounded-xs max-desk:h-12 ${FILTER_FIELD_CLASS}`}
        />
        {year === undefined ? null : <input type="hidden" name={QUERY_PARAM.YEAR} value={year} />}
        <YearMenu
          summary={year === undefined ? t('year.summaryAll') : t('year.summary', { year })}
          label={t('year.label')}
          options={options}
          // The list filter's fields are 48 high on tablet too (ui-contract §3); the archive year menu keeps 44 there (§5).
          className={`${FILTER_FIELD_CLASS} max-desk:[&>summary]:h-12`}
        />
      </div>
      <div className="flex items-center gap-6 max-desk:justify-end">
        <Link href={basePath} className="text-primary px-1 text-sm leading-5 font-medium underline underline-offset-2">
          {t('search.clear')}
        </Link>
        <Button type="submit" variant="solid" colorPalette="secondary" className="h-11 w-36 rounded-xs text-base font-medium max-desk:w-84 max-tab:flex-1">
          {t('search.submit')}
        </Button>
      </div>
    </form>
  )
}
