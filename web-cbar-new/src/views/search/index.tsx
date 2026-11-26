import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import Link from 'next/link'

import { getT } from '@/shared/i18n/server'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { PageTitle } from '@/widgets/page-title/page-title'
import { isInternalHref } from '@/widgets/smart-link/smart-link'

import type { SearchViewData } from './loader'

export function SearchView({ data }: { data: SearchViewData }) {
  const { locale } = data
  const t = getT(locale, 'search')

  return (
    <section data-slot="search" className="mx-auto max-w-3xl">
      <PageTitle title={t('title')} description={data.query ? t('resultsFor', { query: data.query }) : undefined} />

      {!data.query ? (
        <EmptyState title={t('emptyQuery')} />
      ) : data.error || data.groups === null ? (
        <ErrorState kind="server" />
      ) : data.total === 0 ? (
        <EmptyState title={t('noResults')} />
      ) : (
        <div className="space-y-8">
          <p className="text-muted-foreground text-sm">{t('resultCount', { count: data.total })}</p>
          {data.groups.map((group) => (
            <section key={group.type} aria-label={t(`types.${group.type}`)}>
              <h2 className="text-foreground mb-3 text-lg font-semibold">{t(`types.${group.type}`)}</h2>
              <ul className="space-y-3">
                {group.items.map((result) => (
                  <li key={`${result.type}-${result.url}`}>
                    <Card className="hover:border-primary transition-colors">
                      <CardContent className="p-5">
                        <Badge variant="subtle" colorPalette="primary" size="sm" className="mb-1">
                          {t(`types.${group.type}`)}
                        </Badge>
                        <p>
                          {isInternalHref(result.url) ? (
                            <Link href={result.url} className="text-foreground text-base font-medium hover:underline">
                              {result.title}
                            </Link>
                          ) : (
                            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-foreground text-base font-medium hover:underline">
                              {result.title}
                            </a>
                          )}
                        </p>
                        {result.snippet && result.snippet !== result.title ? (
                          <p className="text-muted-foreground mt-1 text-sm">{result.snippet}</p>
                        ) : null}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
