/** "Sıranı dəyiş" over the homepage strategy documents (spec 057), on the shared CRUD reorder dialog. */

import { useTranslation } from 'react-i18next'

import { ReorderDialog } from '@/features/crud/components/reorder-dialog'
import { strategyDocsKeys, strategyDocsService } from '../api/strategy-docs.service'
import { STRATEGY_DOCS_MODULE_ID } from '../model/constants'
import { strategyDocLabel, type StrategyDocRow } from '../model/strategy-docs'

export function StrategyDocsReorderDialog() {
  const { t } = useTranslation('homepage')
  return (
    <ReorderDialog<StrategyDocRow>
      title={t('strategyDocs.reorderTitle')}
      queryKey={strategyDocsKeys.all()}
      load={strategyDocsService.all}
      save={strategyDocsService.reorder}
      getLabel={strategyDocLabel}
      moduleId={STRATEGY_DOCS_MODULE_ID}
    />
  )
}
