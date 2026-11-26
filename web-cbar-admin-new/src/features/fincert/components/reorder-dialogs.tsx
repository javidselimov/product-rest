/** "Sıranı dəyiş" over the FinCERT directions and memberships lists (spec 053), on the shared CRUD reorder dialog. */

import { useTranslation } from 'react-i18next'

import { ReorderDialog } from '@/features/crud/components/reorder-dialog'
import { FINCERT_DIRECTIONS_MODULE_ID, FINCERT_MEMBERSHIPS_MODULE_ID, fincertKeys } from '../api/fincert.keys'
import { fincertService } from '../api/fincert.service'
import { directionLabel, membershipLabel } from '../model/module'
import type { FincertDirectionRow, FincertMembershipRow } from '../model/schemas'

export function DirectionsReorderDialog() {
  const { t } = useTranslation('fincert')
  return (
    <ReorderDialog<FincertDirectionRow>
      title={t('directions.reorderTitle')}
      queryKey={fincertKeys.allDirections()}
      load={fincertService.directions}
      save={fincertService.reorderDirections}
      getLabel={directionLabel}
      moduleId={FINCERT_DIRECTIONS_MODULE_ID}
    />
  )
}

export function MembershipsReorderDialog() {
  const { t } = useTranslation('fincert')
  return (
    <ReorderDialog<FincertMembershipRow>
      title={t('memberships.reorderTitle')}
      queryKey={fincertKeys.allMemberships()}
      load={fincertService.memberships}
      save={fincertService.reorderMemberships}
      getLabel={membershipLabel}
      moduleId={FINCERT_MEMBERSHIPS_MODULE_ID}
    />
  )
}
