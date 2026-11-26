/**
 * The RFC-2350 card (spec 053 ui-contract §6): the name and a file chip with the type badge and the download icon. The
 * whole card is one link: a media file downloads, the legacy external link opens in a new tab. Without a known type the
 * chip shows only the icon.
 */
import { DownloadIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'

import type { FincertPageModel } from '@/features/fincert/model/view'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'

import { CARD_CLASS, LINK_CARD_CLASS } from './constants'

type FincertDocumentProps = Readonly<{ rfc: NonNullable<FincertPageModel['rfc']>; locale: Locale }>

export function FincertDocument({ rfc, locale }: FincertDocumentProps) {
  const t = getT(locale, 'fincert')
  const type = rfc.fileType?.toUpperCase() ?? null
  const target = rfc.download ? { download: '' } : { target: '_blank', rel: 'noopener noreferrer' }

  return (
    <a
      href={rfc.href}
      {...target}
      data-slot="fincert-document"
      className={cn(CARD_CLASS, LINK_CARD_CLASS, 'flex items-center gap-4 px-5 py-4')}
    >
      <span className="text-foreground min-w-0 flex-1 text-base leading-[22px] font-semibold">{t('rfc.name')}</span>
      <span className="border-site-divider inline-flex shrink-0 items-center gap-2.5 rounded-xs border px-3 py-2">
        {type ? (
          <span className="bg-site-fincert-pdf rounded-[3px] px-1.5 py-0.5 text-[11px] leading-[14px] font-semibold text-site-fincert-on-pdf">{type}</span>
        ) : null}
        <DownloadIcon aria-hidden="true" className="text-primary size-3.5" />
        <span className="sr-only">
          {t('rfc.download')}
          {rfc.download ? '' : ` (${t('newTab')})`}
        </span>
      </span>
    </a>
  )
}
