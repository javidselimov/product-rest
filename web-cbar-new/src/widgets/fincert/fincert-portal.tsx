/**
 * The reporting portal card (spec 053 ui-contract §5): icon, title and description, and the kit button that opens the
 * portal in a new tab. Horizontal on desktop, stacked below it; the button is full width on mobile.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { DesktopIcon, ShareBoxIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'

import type { FincertPageModel } from '@/features/fincert/model/view'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'

import { CARD_CLASS } from './constants'

type FincertPortalProps = Readonly<{ portal: NonNullable<FincertPageModel['portal']>; locale: Locale }>

export function FincertPortal({ portal, locale }: FincertPortalProps) {
  const t = getT(locale, 'fincert')

  return (
    <div
      data-slot="fincert-portal"
      className={cn(CARD_CLASS, 'flex flex-col gap-4 p-5 tab:p-6 desk:flex-row desk:items-center desk:gap-6 desk:px-7')}
    >
      <span aria-hidden="true" className="bg-site-fincert-tint flex size-11 shrink-0 items-center justify-center rounded-full">
        <DesktopIcon className="text-primary size-[22px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-foreground text-lg leading-[26px] font-semibold">{portal.title}</p>
        {portal.description ? <p className="text-site-fincert-faint text-base leading-7">{portal.description}</p> : null}
      </div>
      <Button asChild className="h-auto w-full gap-2 px-5 py-3 text-base leading-[22px] font-semibold tab:w-fit">
        <a href={portal.url} target="_blank" rel="noopener noreferrer">
          {t('portal.open')}
          <span className="sr-only"> ({t('newTab')})</span>
          <ShareBoxIcon aria-hidden="true" className="size-[18px]" />
        </a>
      </Button>
    </div>
  )
}
