/**
 * International memberships (spec 053 ui-contract §7): logo, name, description and badge. The badge sits on the right
 * on desktop and under the text below it; the card stacks on mobile. With a `url` the whole card is an external link;
 * without a logo no room is kept for one.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'

import type { FincertMembershipView } from '@/features/fincert/model/view'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { SiteImage } from '@/shared/ui/site-image'

import { CARD_CLASS, LINK_CARD_CLASS, MEMBERSHIP_LOGO_SIZES } from './constants'

type FincertMembershipsProps = Readonly<{ memberships: FincertMembershipView[]; locale: Locale }>

function MembershipBody({ membership }: Readonly<{ membership: FincertMembershipView }>) {
  return (
    <>
      {membership.logo ? (
        <span className="relative h-12 w-[120px] shrink-0">
          <SiteImage src={membership.logo} alt="" fill sizes={MEMBERSHIP_LOGO_SIZES} className="object-contain" />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-1.5 desk:flex-row desk:items-center desk:gap-6">
        <span className="flex min-w-0 flex-1 flex-col gap-1.5 desk:gap-1">
          <span className="text-foreground text-lg leading-[26px] font-semibold">{membership.name}</span>
          {membership.description ? <span className="text-site-fincert-faint text-base leading-7">{membership.description}</span> : null}
        </span>
        {membership.badge ? (
          <span className="bg-site-surface-muted text-site-fincert-muted self-start rounded-xs px-3 py-1.5 text-[13px] leading-[18px] font-semibold desk:self-center">
            {membership.badge}
          </span>
        ) : null}
      </span>
    </>
  )
}

export function FincertMemberships({ memberships, locale }: FincertMembershipsProps) {
  const t = getT(locale, 'fincert')
  const layout = 'flex flex-col gap-4 p-5 tab:flex-row tab:items-center tab:gap-6 tab:p-6 desk:px-7'

  return (
    <ul data-slot="fincert-memberships" className="flex flex-col gap-4">
      {memberships.map((membership) => (
        <li key={membership.id}>
          {membership.url ? (
            <a href={membership.url} target="_blank" rel="noopener noreferrer" className={cn(CARD_CLASS, LINK_CARD_CLASS, layout)}>
              <MembershipBody membership={membership} />
              <span className="sr-only"> ({t('newTab')})</span>
            </a>
          ) : (
            <div className={cn(CARD_CLASS, layout)}>
              <MembershipBody membership={membership} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
