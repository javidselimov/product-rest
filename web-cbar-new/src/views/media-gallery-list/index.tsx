/**
 * Photo / video gallery list in the Media section shell (spec 035, Figma `1643:29161`,
 * `1647:32539`; tablet `1660:23914`, mobile `1660:24682`). Server component: the tabs are links
 * (as in the events list, spec 034), the filter is a GET form, the cards are the news card.
 *
 * Rhythm from tablet up: H1, 36, tabs (40 + 15 + 1 rule), 36, filter, 36, grid, 36, pagination;
 * on mobile the gaps under the tabs are 24 (Figma `1660:24818`).
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import Link from 'next/link'

import { getT } from '@/shared/i18n/server'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { ListFilter } from '@/widgets/list-filter'
import { ListPagination } from '@/widgets/list-pagination/list-pagination'
import { NewsGrid } from '@/widgets/news-grid'
import { SectionShell } from '@/widgets/section-shell'

import { GALLERY_EMPTY_KEY } from './constants'
import type { MediaGalleryListData } from './loader'

const TAB = 'flex h-10 items-center text-lg leading-6 font-semibold whitespace-nowrap'

function Results({ data }: Readonly<{ data: MediaGalleryListData }>) {
  const t = getT(data.locale, 'media')
  if (data.error || data.items === null) return <ErrorState kind="server" />
  if (data.items.length === 0) return <EmptyState title={t(data.hasFilters ? 'gallery.noResults' : GALLERY_EMPTY_KEY[data.kind])} />
  return <NewsGrid items={data.items} />
}

export function MediaGalleryListView({ data }: Readonly<{ data: MediaGalleryListData }>) {
  const t = getT(data.locale, 'media')

  return (
    <SectionShell shell={data.shell} title={data.title}>
      <section data-slot="media-gallery-list" data-kind={data.kind} aria-label={data.title} className="flex flex-col gap-6 tab:gap-9">
        <nav aria-label={t('gallery.tabs')} className="border-site-divider flex gap-8 overflow-x-auto border-b pb-[15px]">
          {data.tabs.map((tab) => (
            <Link
              key={tab.kind}
              href={tab.href}
              aria-current={tab.current ? 'page' : undefined}
              className={cn(TAB, tab.current ? 'text-primary' : 'text-muted-foreground hover:text-primary')}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <ListFilter
          action={data.basePath}
          filters={data.filters}
          clearHref={data.basePath}
          labels={{
            form: t('gallery.filter.form'),
            search: t('gallery.filter.search'),
            dateRange: t('gallery.filter.dateRange'),
            dateFrom: t('gallery.filter.dateFrom'),
            dateTo: t('gallery.filter.dateTo'),
            submit: t('gallery.filter.submit'),
            clear: t('gallery.filter.clear'),
          }}
        />

        <Results data={data} />

        <ListPagination
          basePath={data.basePath}
          params={data.filters}
          page={data.page}
          total={data.total}
          pageSize={data.pageSize}
          className="flex justify-end"
        />
      </section>
    </SectionShell>
  )
}
