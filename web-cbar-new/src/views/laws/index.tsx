import Link from 'next/link'

import { LAW_TYPES, LAW_TYPE_KEY } from '@/features/laws/model/schemas'
import { getT } from '@/shared/i18n/server'
import { ContentList } from '@/widgets/content-list/content-list'
import { FilterForm } from '@/widgets/filter-form/filter-form'
import { SelectField } from '@/widgets/filter-form/select-field'
import { ListPagination } from '@/widgets/list-pagination/list-pagination'
import { PageTitle } from '@/widgets/page-title/page-title'

import type { LawsViewData } from './loader'

export function LawsView({ data }: { data: LawsViewData }) {
  const { locale } = data
  const t = getT(locale, 'content')
  const basePath = `/${locale}/laws`

  return (
    <section data-slot="laws">
      <PageTitle
        title={t('laws')}
        actions={
          <Link href={`/${locale}/securities`} className="text-primary text-sm font-medium hover:underline">
            {t('securitiesLink')} <span aria-hidden="true">→</span>
          </Link>
        }
      />

      <FilterForm action={basePath} submitLabel={t('apply')} label={t('filter')}>
        <SelectField
          id="laws-category"
          name="categoryId"
          label={t('category')}
          allLabel={t('all')}
          value={data.categoryId?.toString()}
          options={data.categories.map((c) => ({ value: String(c.id), label: c.name ?? String(c.id) }))}
        />
        <SelectField
          id="laws-type"
          name="type"
          label={t('type')}
          allLabel={t('all')}
          value={data.type}
          options={LAW_TYPES.map((value) => ({ value, label: t(`lawTypes.${LAW_TYPE_KEY[value]}`) }))}
        />
      </FilterForm>

      <ContentList
        className="mt-6"
        items={data.items}
        error={data.error}
        emptyLabel={t('noItems')}
        errorLabel={t('loadError')}
      />

      <ListPagination
        basePath={basePath}
        params={{ categoryId: data.categoryId, type: data.type }}
        page={data.page}
        total={data.total}
        pageSize={data.pageSize}
        className="mt-8"
      />
    </section>
  )
}
