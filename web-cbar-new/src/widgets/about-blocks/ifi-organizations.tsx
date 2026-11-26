/**
 * "Cooperation with international financial institutions" body (spec 044, Figma `2172:112149`): the
 * page intro, then the section title and the organization cards, 32 apart; cards are 16 apart. Every card
 * arrives closed.
 */
import type { IfiOrganizationsBlock } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { IfiOrganizationCard } from './ifi-organization-card'

export function IfiOrganizations({ block, locale }: Readonly<{ block: IfiOrganizationsBlock; locale: Locale }>) {
  const t = getT(locale, 'about')

  return (
    <div data-slot="ifi-organizations" className="flex flex-col gap-8">
      {block.introHtml.trim() ? <CmsContent html={block.introHtml} variant="about" /> : null}
      {block.organizations.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-foreground text-xl leading-[26px] font-semibold">{t('ifi.sectionTitle')}</h2>
          <ul className="flex flex-col gap-4">
            {block.organizations.map((organization) => (
              <li key={organization.id}>
                <IfiOrganizationCard organization={organization} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
