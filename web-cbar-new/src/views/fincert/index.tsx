/**
 * FinCERT page (spec 053), Figma `2663:138955`. Sizes: `specs/053-fincert-page/contracts/ui-contract.md`.
 *
 * Breadcrumb and share row, the title, then the sections in the Figma order, each only when it has content. Full width:
 * FinCERT has no section menu. The hidden Figma layers ("On this page", the third contact card) are not built; the
 * sections keep fixed anchors instead.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import type { ReactNode } from 'react'

import { FINCERT_ANCHORS, type FincertSectionKey } from '@/features/fincert/model/constants'
import { fincertSections, type FincertPageModel } from '@/features/fincert/model/view'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { FincertContacts, FincertDirections, FincertDocument, FincertMemberships, FincertPortal, FincertSection } from '@/widgets/fincert'
import { PageTools, SHELL_CLASS } from '@/widgets/section-shell'

import type { FincertViewData } from './loader'

type FincertViewProps = Readonly<{ data: FincertViewData }>

/** The body of each section; a key is rendered only when `fincertSections` lists it, so the values are there. */
function sectionBody(key: FincertSectionKey, view: FincertPageModel, locale: Locale): ReactNode {
  switch (key) {
    case 'mission':
      return (
        <div className="flex flex-col gap-4">
          {view.mission?.map((paragraph, index) => (
            // A static list from one text field: the place is the identity (two equal paragraphs must not collide).
            <p key={index} className="text-foreground text-lg leading-7 font-medium tab:text-xl tab:leading-8">
              {paragraph}
            </p>
          ))}
        </div>
      )
    case 'directions':
      return <FincertDirections directions={view.directions} />
    case 'contacts':
      return <FincertContacts contacts={view.contacts} locale={locale} />
    case 'portal':
      return view.portal ? <FincertPortal portal={view.portal} locale={locale} /> : null
    case 'rfc':
      return view.rfc ? <FincertDocument rfc={view.rfc} locale={locale} /> : null
    case 'cooperation':
      return <FincertMemberships memberships={view.memberships} locale={locale} />
  }
}

export function FincertView({ data }: FincertViewProps) {
  const { locale, view, shell } = data
  const t = getT(locale, 'fincert')

  return (
    <div data-slot="fincert-page" className={cn(SHELL_CLASS, 'pb-16 tab:pb-20 desk:pb-30')}>
      <PageTools shell={shell} />

      <div className="mt-8 tab:mt-6 desk:mt-0">
        <h1 className="text-foreground mb-6 text-2xl leading-8 font-semibold tab:mb-9 tab:text-[32px] tab:leading-11">{view.title}</h1>

        <div className="flex flex-col gap-10 tab:gap-12 desk:gap-14">
          {fincertSections(view).map((key) => (
            <FincertSection key={key} id={FINCERT_ANCHORS[key]} title={t(`sections.${key}`)} showTitle={key !== 'mission'}>
              {sectionBody(key, view, locale)}
            </FincertSection>
          ))}
        </div>
      </div>
    </div>
  )
}
