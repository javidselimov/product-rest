/** İnflyasiya səhifəsi (tasks T106): ana səhifə xülasəsi + upsert kartı + siyahı. */

import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { InflationSettingsCard } from '@/features/inflation/components/inflation-settings-card'
import { InflationUpsertCard } from '@/features/inflation/components/inflation-upsert-card'
import { inflationModule } from '@/features/inflation/model/module'

export function InflationPage() {
  return (
    <CrudListPage
      config={inflationModule}
      above={
        <div className="space-y-4">
          <InflationSettingsCard />
          <InflationUpsertCard />
        </div>
      }
    />
  )
}
