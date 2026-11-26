/**
 * Status sütunu — canlı yayımlardakı kimi düymədir: klik popup-ı aktiv/deaktiv
 * edir (spec 009 FR-008). Uğurdan sonra modulun bütün sorğuları yenilənir.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { imagePopupsKeys } from '../api/image-popups.keys'
import { imagePopupsService } from '../api/image-popups.service'
import type { ImagePopupRow } from '../model/schemas'

export function ImagePopupStatusToggle({ row }: { row: ImagePopupRow }) {
  const { t } = useTranslation('imagePopups')
  const queryClient = useQueryClient()
  const name = row.title
  const toggle = useMutation({
    mutationFn: () => imagePopupsService.setActive(row, !row.isActive),
    onSuccess: async () => {
      toast.success(
        t(row.isActive ? 'toggle.deactivated' : 'toggle.activated', { name }),
      )
      await queryClient.invalidateQueries({ queryKey: imagePopupsKeys.all })
    },
    onError: (error) => {
      toast.error(
        isAppError(error) ? error.message : t('common:errors.unexpected'),
      )
    },
  })

  return (
    <Button
      size="sm"
      variant="subtle"
      colorPalette={row.isActive ? 'green' : 'black'}
      disabled={toggle.isPending}
      aria-label={t('toggle.action', {
        name,
        status: t(
          row.isActive ? 'common:status.active' : 'common:status.inactive',
        ),
      })}
      onClick={() => toggle.mutate()}
    >
      {t(row.isActive ? 'common:status.active' : 'common:status.inactive')}
    </Button>
  )
}
