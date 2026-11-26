/**
&
 * Announcements use the text card variant (spec 031, contracts/ui-contract.md); interviews and
 * speeches (spec 033) are photo cards like news.
 */
import { PRESS_RELEASE_TYPE } from '@/features/press-releases/model/constants'
import { getT } from '@/shared/i18n/server'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { ListFilter } from '@/widgets/list-filter'
import { ListPagination } from '@/widgets/list-pagination/list-pagination'
import { NewsGrid } from '@/widgets/news-grid'
import { SectionShell } from '@/widgets/section-shell'

import type { PressReleasesViewData } from './loader'

function NewsResults({ data, emptyLabel }: Readonly<{ data: PressReleasesViewData; emptyLabel: string }>) {
  if (data.error || data.items === null) return <ErrorState kind="server" />
  if (data.items.length === 0) return <EmptyState title={emptyLabel} />
  // Announcements (spec 031): text cards without the photo box.
  return <NewsGrid items={data.items} variant={data.type === PRESS_RELEASE_TYPE.ANNOUNCEMENT ? 'text' : 'photo'} />
}

export function PressReleasesView({ data }: Readonly<{ data: PressReleasesViewData }>) {
  const t = getT(data.locale, 'content')

  return (
    <SectionShell shell={data.shell} title={data.title}>
      <section data-slot="press-releases" aria-label={data.title}>
        <ListFilter
          action={data.basePath}
          filters={data.filters}
          clearHref={data.clearHref}
          labels={{
            form: t('newsList.filterLabel'),
            search: t('newsList.searchLabel'),
            dateRange: t('newsList.dateRange'),
            dateFrom: t('newsList.dateFrom'),
            dateTo: t('newsList.dateTo'),
            submit: t('newsList.submit'),
            clear: t('newsList.clear'),
          }}
        >
          <input type="hidden" name="type" value={data.type} />
        </ListFilter>

        <div className="mt-15">
          <NewsResults data={data} emptyLabel={t(data.hasFilters ? 'newsList.noResults' : 'newsList.empty')} />
        </div>

        <ListPagination
          basePath={data.basePath}
          params={{ type: data.type, ...data.filters }}
          page={data.page}
          total={data.total}
          pageSize={data.pageSize}
          className="mt-15 flex justify-end"
        />
      </section>
    </SectionShell>
  )
}
