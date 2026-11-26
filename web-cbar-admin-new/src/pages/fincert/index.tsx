/**
 * "FinCERT" pages (spec 053): the general form, and the directions and memberships lists with "Sıranı dəyiş" in the
 * header. The direction and membership forms are registry routes with no page file.
 */

import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { DirectionsReorderDialog, MembershipsReorderDialog } from '@/features/fincert/components/reorder-dialogs'
import { SettingsForm } from '@/features/fincert/components/settings-form'
import { fincertDirectionsModule, fincertMembershipsModule } from '@/features/fincert/model/module'

export function FincertSettingsPage() {
  return <SettingsForm />
}

export function FincertDirectionsPage() {
  return <CrudListPage config={fincertDirectionsModule} extraActions={<DirectionsReorderDialog />} />
}

export function FincertMembershipsPage() {
  return <CrudListPage config={fincertMembershipsModule} extraActions={<MembershipsReorderDialog />} />
}
