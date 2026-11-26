/**
 * Status sütunu — prod panelindəki kimi düymədir: klik yazını aktiv/qeyri-aktiv
 * edir (spec 006 FR-003). Uğurdan sonra modulun bütün sorğuları yenilənir.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { firstTranslation } from '@/entities/content/model/types'
import { isAppError } from '@/shared/api/types'
import { liveStreamsKeys } from '../api/live-streams.keys'
import { liveStreamsService } from '../api/live-streams.service'
import type { LiveStreamRow } from '../model/schemas'

export function LiveStatusToggle({ row }: { row: LiveStreamRow }) {
  const { t } = useTranslation('liveStreams')
  const queryClient = useQueryClient()
  const name = firstTranslation(row.translations, 'title')
  const toggle = useMutation({
    mutationFn: () => liveStreamsService.setLive(row, !row.isLive),
    onSuccess: async () => {
      toast.success(
        t(row.isLive ? 'toggle.deactivated' : 'toggle.activated', { name }),
      )
      await queryClient.invalidateQueries({ queryKey: liveStreamsKeys.all })
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
      colorPalette={row.isLive ? 'green' : 'black'}
      disabled={toggle.isPending}
      aria-label={t('toggle.action', {
        name,
        status: t(row.isLive ? 'common:status.active' : 'common:status.inactive'),
      })}
      onClick={() => toggle.mutate()}
    >
      {t(row.isLive ? 'common:status.active' : 'common:status.inactive')}
    </Button>
  )
}
