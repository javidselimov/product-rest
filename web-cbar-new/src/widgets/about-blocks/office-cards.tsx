/**
 * Regional office card, Figma `2046:3531` ("Ərazi idarələri", `content` → `Offices`).
 *
 * Card 984 wide, white, 1px neutral-300 border, r4, horizontal: photo 340 on the left (cropped, full card
 * height), details on the right p28/32, gap 18. Title 22/30 600 primary with a 1px line below;
 * "Address / Phone / Head" in three equal columns (gap 24): label 14/600 neutral-500, value 16/28.
 * "Regulation" is an outline primary button (height 48, file icon 24) that opens the document in a new window.
 * 20 between cards. Mobile: photo on top (200), columns stacked. Without a photo a grey placeholder,
 * an empty field drops its line, no document means no button.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { FileIcon } from '@cbar/lib-react-ui-kit/icons'
import type { ReactNode } from 'react'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { SiteImage } from '@/shared/ui/site-image'

export type OfficeCardData = {
  id: number
  name: string | null
  address: string | null
  phone: string | null
  /** Number cleaned for `tel:`; null when `phone` is empty. */
  tel: string | null
  directorName: string | null
  photoUrl: string | null
  regulation: { url: string; fileName: string } | null
}

function Detail({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="text-muted-foreground text-sm leading-[18px] font-semibold">{label}</dt>
      <dd className="text-foreground text-base leading-7 break-words">{children}</dd>
    </div>
  )
}

export function OfficeCard({ office, locale }: Readonly<{ office: OfficeCardData; locale: Locale }>) {
  const t = getT(locale, 'organization')
  const tAbout = getT(locale, 'about')
  const hasDetails = Boolean(office.address || office.phone || office.directorName)

  return (
    <article data-slot="office-card" className="border-site-divider bg-background flex flex-col overflow-hidden rounded-xs border tab:flex-row">
      <div className="bg-site-photo-placeholder relative h-[200px] shrink-0 tab:h-auto tab:w-[340px]">
        {office.photoUrl ? (
          <SiteImage
            src={office.photoUrl}
            alt={tAbout('staff.photoAlt', { name: office.name ?? '' })}
            fill
            sizes="(min-width: 46.5rem) 340px, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[18px] px-6 py-6 tab:px-8 tab:py-7">
        <h2 className="text-primary text-[22px] leading-[30px] font-semibold">{office.name}</h2>
        <span aria-hidden="true" className="bg-site-divider block h-px w-full" />
        {hasDetails ? (
          <dl className="grid grid-cols-1 gap-6 tab:grid-cols-3">
            {office.address ? <Detail label={t('office.address')}>{office.address}</Detail> : null}
            {office.phone ? (
              <Detail label={t('phone')}>
                {office.tel ? (
                  <a href={`tel:${office.tel}`} className="hover:text-primary hover:underline">
                    {office.phone}
                  </a>
                ) : (
                  office.phone
                )}
              </Detail>
            ) : null}
            {office.directorName ? <Detail label={t('office.director')}>{office.directorName}</Detail> : null}
          </dl>
        ) : null}
        {office.regulation ? (
          <div>
            <Button asChild variant="outline" colorPalette="primary" className="h-12 gap-2.5 px-5 text-base font-medium">
              <a href={office.regulation.url} target="_blank" rel="noopener noreferrer" title={office.regulation.fileName}>
                <FileIcon aria-hidden="true" className="size-6" />
                {t('office.regulation')}
                <span className="sr-only">
                  {' '}
                  — {office.name} ({tAbout('share.newTab')})
                </span>
              </a>
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function OfficeCards({ offices, locale }: Readonly<{ offices: OfficeCardData[]; locale: Locale }>) {
  return (
    <ul className="flex flex-col gap-5">
      {offices.map((office) => (
        <li key={office.id}>
          <OfficeCard office={office} locale={locale} />
        </li>
      ))}
    </ul>
  )
}
