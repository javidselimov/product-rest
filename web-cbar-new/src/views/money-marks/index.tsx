import { Button } from '@cbar/lib-react-ui-kit/button'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import Link from 'next/link'

import { IMAGE_SIZES } from '@/shared/constants/layout'
import { getT } from '@/shared/i18n/server'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { FilterForm } from '@/widgets/filter-form/filter-form'
import { SelectField } from '@/widgets/filter-form/select-field'
import { PageTitle } from '@/widgets/page-title/page-title'
import { SiteImage } from '@/shared/ui/site-image'

import type { MoneyMarksViewData } from './loader'

export function MoneyMarksView({ data }: { data: MoneyMarksViewData }) {
  const { locale } = data
  const t = getT(locale, 'content')
  const basePath = `/${locale}/national-currency`
  const isCoin = data.type === 2
  const withCategory = (type: 1 | 2) => `${basePath}?type=${type}${data.categoryId ? `&categoryId=${data.categoryId}` : ''}`

  return (
    <section data-slot="money-marks">
      <PageTitle
        title={data.title ?? t('nationalCurrency')}
        actions={
          <Link href={`${basePath}/news`} className="text-primary text-sm font-medium hover:underline">
            {t('moneyMarkNews')} <span aria-hidden="true">→</span>
          </Link>
        }
      />

      <nav aria-label={t('type')} className="mb-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant={isCoin ? 'outline' : 'solid'} colorPalette="primary">
          <Link href={withCategory(1)} aria-current={isCoin ? undefined : 'page'}>
            {t('banknotes')}
          </Link>
        </Button>
        <Button asChild size="sm" variant={isCoin ? 'solid' : 'outline'} colorPalette="primary">
          <Link href={withCategory(2)} aria-current={isCoin ? 'page' : undefined}>
            {t('coins')}
          </Link>
        </Button>
      </nav>

      <FilterForm action={basePath} submitLabel={t('apply')} label={t('filter')}>
        <input type="hidden" name="type" value={data.type} />
        <SelectField
          id="money-mark-category"
          name="categoryId"
          label={t('category')}
          allLabel={t('allCategories')}
          value={data.categoryId?.toString()}
          options={data.categories.map((c) => ({ value: String(c.id), label: c.name ?? String(c.id) }))}
        />
      </FilterForm>

      {data.error || data.items === null ? (
        <ErrorState kind="server" className="mt-6" />
      ) : data.items.length === 0 ? (
        <EmptyState title={t('noItems')} className="mt-6" />
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((mark) => (
            <li key={mark.id}>
              <Card className="hover:border-primary h-full overflow-hidden transition-colors">
                <Link href={mark.href} className="block">
                  <div className={`bg-muted w-full overflow-hidden ${isCoin ? 'aspect-square p-6' : 'aspect-[2/1]'}`}>
                    {mark.imageUrl ? (
                      // `fill` needs its own `relative` box: on a coin it stays inside `p-6`,
                      // so the padding is kept as before.
                      <div className="relative h-full w-full">
                        <SiteImage
                          src={mark.imageUrl}
                          alt={mark.title}
                          fill
                          sizes={IMAGE_SIZES.GRID_THIRD}
                          className={isCoin ? 'object-contain' : 'object-cover'}
                        />
                      </div>
                    ) : null}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-foreground text-center font-medium">{mark.title}</p>
                  </CardContent>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
