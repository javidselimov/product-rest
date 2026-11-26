/**
 * Gəlirlik əyrisi səhifələri — köhnə admin kimi üç ayrı bölmə (alt bölmə
 * tabları ilə): Əyri (`/yield-curves`), Parametrlər, Müddətlər. Hər biri
 * mühərrikin siyahısıdır; başlıqdakı "Excel-dən yüklə" həmin bölmənin öz
 * faylını import edir.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import { FileUploadIcon } from '@cbar/lib-react-ui-kit/icons'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { YieldCurveImportDialog } from '@/features/yield-curves/components/yield-curve-import-dialog'
import {
  yieldCurveParametersModule,
  yieldCurvePeriodsModule,
  yieldCurveYieldsModule,
} from '@/features/yield-curves/model/module'
import type { YieldCurveDataset } from '@/features/yield-curves/model/schemas'
import type { AnyRow, ModuleConfig } from '@/shared/crud/types'

function YieldCurveListPage<Row extends AnyRow>({
  dataset,
  config,
}: Readonly<{
  dataset: YieldCurveDataset
  config: ModuleConfig<Row, string>
}>) {
  const { t } = useTranslation('yieldCurves')
  const [importOpen, setImportOpen] = useState(false)

  return (
    <>
      <CrudListPage
        config={config}
        extraActions={
          <Button onClick={() => setImportOpen(true)}>
            <FileUploadIcon size={16} />
            {t('import.open')}
          </Button>
        }
      />
      {importOpen ? (
        <YieldCurveImportDialog
          dataset={dataset}
          onClose={() => setImportOpen(false)}
          onImported={(date) => {
            setImportOpen(false)
            toast.success(
              t('import.done', { date: date.split('-').reverse().join('.') }),
            )
          }}
        />
      ) : null}
    </>
  )
}

export function YieldCurveYieldsPage() {
  return <YieldCurveListPage dataset="yields" config={yieldCurveYieldsModule} />
}

export function YieldCurveParametersPage() {
  return (
    <YieldCurveListPage
      dataset="parameters"
      config={yieldCurveParametersModule}
    />
  )
}

export function YieldCurvePeriodsPage() {
  return (
    <YieldCurveListPage dataset="periods" config={yieldCurvePeriodsModule} />
  )
}
