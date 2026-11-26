/**
 * Sətir əməli: "Formaya yüklə" (spec 021 R14) — sətrin bütün sahələrini upsert
 * kartına köçürür. Etiket "Redaktə et:" deyil: ayrıca redaktə forması yoxdur.
 */

import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { EditIcon } from '@cbar/lib-react-ui-kit/icons'
import { useTranslation } from 'react-i18next'

import { useAzirPrefill } from '../model/prefill'
import { azirRowLabel, type AzirItem } from '../model/schemas'

export function AzirPrefillAction({ row }: { row: AzirItem }) {
  const { t } = useTranslation('azir')
  const prefill = useAzirPrefill()
  return (
    <IconButton
      size="sm"
      variant="ghost"
      colorPalette="black"
      aria-label={t('actions.prefill', { label: azirRowLabel(row) })}
      onClick={() => prefill.set(row)}
    >
      <EditIcon />
    </IconButton>
  )
}
