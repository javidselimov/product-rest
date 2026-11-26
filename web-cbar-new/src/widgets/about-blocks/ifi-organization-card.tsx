/**
 * Accordion card of an international financial institution (spec 044, Figma `2172:3599`). Sizes are
 * in `specs/044-ifi-cooperation/contracts/ui-contract.md`.
 *
 * A native `<details>`: it opens without JS and the browser announces its state. `data-accordion`
 * and `data-type="details-content"` reuse the print rule in `globals.css`, so closed cards print open.
 * Empty fields leave their part out rather than show a blank box (spec Edge Cases).
 */
import { CaretDownIcon } from '@cbar/lib-react-ui-kit/icons'

import type { IfiOrganization } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { SiteImage } from '@/shared/ui/site-image'
import { CmsContent } from '@/widgets/cms-content/cms-content'

/** The logo box is 103×58 at every width (Figma `2174:56302`). */
const LOGO_SIZES = '103px'

type IfiOrganizationCardProps = Readonly<{ organization: IfiOrganization; locale: Locale }>

/** The card arrives closed; the visitor opens it. */
export function IfiOrganizationCard({ organization, locale }: IfiOrganizationCardProps) {
  const t = getT(locale, 'about')
  const { logo, memberSince, mission, membershipIntro, memberships, html, websiteUrl, websiteLabel } = organization

  return (
    <details
      data-slot="ifi-organization"
      data-accordion=""
      className="group border-site-divider bg-background rounded-xs border p-4"
    >
      <summary className="focus-visible:outline-ring flex cursor-pointer list-none items-center gap-3 rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        {logo ? (
          <span className="relative h-[58px] w-[103px] shrink-0">
            <SiteImage src={logo.src} alt={logo.alt} fill sizes={LOGO_SIZES} className="object-contain" />
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-1 tab:flex-row tab:items-center tab:gap-3">
          <span className="text-foreground flex-1 text-lg leading-6 font-semibold">{organization.name}</span>
          {memberSince ? (
            <span className="text-site-logo-muted shrink-0 text-sm leading-[18px]">{t('ifi.membership', { year: memberSince })}</span>
          ) : null}
        </span>
        <CaretDownIcon aria-hidden="true" className="text-site-accent size-5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>

      {/* A margin, not a gap on `<details>`: Chrome lays out the hidden body of a closed card as a flex item,
          so a gap would add 16 below its header. The inner box keeps the spacing when print shows it as a block. */}
      <div data-type="details-content" className="mt-4">
        <div className="flex flex-col gap-4">
          {mission ? (
            <div data-slot="ifi-mission" className="bg-site-on-accent-muted flex flex-col gap-2 rounded-xs p-5">
              <p className="text-primary text-base leading-[21px] font-semibold">{t('ifi.mission')}</p>
              <p className="text-foreground text-base leading-6">{mission}</p>
            </div>
          ) : null}

          {membershipIntro ? <p className="text-foreground text-base leading-6 font-semibold">{membershipIntro}</p> : null}

          {memberships.length > 0 ? (
            <ul data-slot="ifi-memberships" className="grid grid-cols-1 gap-4 tab:grid-cols-2 desk:grid-cols-3">
              {memberships.map((membership, index) => (
                <li
                  key={`${index}-${membership.date}`}
                  className="border-site-divider flex flex-col gap-2.5 rounded-xs border p-5 desk:min-h-[123px]"
                >
                  <p className="text-primary text-lg leading-[23px] font-semibold">{membership.date}</p>
                  <p className="text-foreground text-base leading-6">{membership.name}</p>
                </li>
              ))}
            </ul>
          ) : null}

          {html.trim() ? <CmsContent html={html} variant="about" className="[&_p]:leading-[26px]!" /> : null}

          {websiteUrl && websiteLabel ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-1.5 self-start text-base leading-[21px] font-semibold"
            >
              <span className="underline">{websiteLabel}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </details>
  )
}
