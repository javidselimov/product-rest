'use client'

/**
 * Başlıqdakı "Canlı yayım" düyməsi (spec 006 US3) — prod-dakı `.btn_live`.
 *
 * Yalnız aktiv yayım olanda render olunur (qərarı server başlığı verir). Klik
 * dialoqu bağlanma qeydinə baxmadan açır: popup bağlanandan sonra da ziyarətçi
 * yayıma buradan qayıda bilir. Yanıb-sönən nöqtə `motion-safe` ilədir —
 * azaldılmış hərəkət seçimində sabit qalır.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'

import { useLiveStreamStore } from '@/features/live-stream/model/store'

/**
 * Prop-lar ötürülür ki, `SheetClose asChild` öz `onClick`/`ref`-ini birləşdirə
 * bilsin (mobil menyuda əvvəl çekmecə bağlanır, sonra dialoq açılır).
 */
type LiveStreamButtonProps = Omit<ComponentProps<typeof Button>, 'children'>

export function LiveStreamButton({ onClick, ...props }: LiveStreamButtonProps) {
  const { t } = useTranslation('media')
  const setOpen = useLiveStreamStore((s) => s.setOpen)

  return (
    <Button
      type="button"
      variant="solid"
      colorPalette="red"
      size="sm"
      aria-haspopup="dialog"
      data-slot="live-stream-button"
      {...props}
      onClick={(event) => {
        onClick?.(event)
        setOpen(true)
      }}
    >
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full rounded-full bg-current opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex size-2 rounded-full bg-current" />
      </span>
      {t('streams')}
    </Button>
  )
}
