/**
 * AZIR page (tasks T105): upsert card + list. The prefill context ties the list's "Load into form"
 * action to the card (spec 021 R14). The header's "Import from Excel" opens the daily workbook
 * import (spec 058). Like the card it is shown to everyone: the panel has no per-section
 * permissions, the API answers 403 to a user without `azir.create` and the dialog shows it.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import { FileUploadIcon } from '@cbar/lib-react-ui-kit/icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AzirImportDialog } from '@/features/azir/components/azir-import-dialog'
import { AzirUpsertCard } from '@/features/azir/components/azir-upsert-card'
import { azirModule } from '@/features/azir/model/module'
import { AzirPrefillProvider } from '@/features/azir/model/prefill-context'
import { CrudListPage } from '@/features/crud/components/crud-list-page'

export function AzirPage() {
  const { t } = useTranslation('azir')
  const [importOpen, setImportOpen] = useState(false)

  return (
    <AzirPrefillProvider>
      <CrudListPage
        config={azirModule}
        above={<AzirUpsertCard />}
        extraActions={
          <Button onClick={() => setImportOpen(true)}>
            <FileUploadIcon size={16} />
            {t('import.open')}
          </Button>
        }
      />
      {importOpen ? (
        <AzirImportDialog onClose={() => setImportOpen(false)} />
      ) : null}
    </AzirPrefillProvider>
  )
}
