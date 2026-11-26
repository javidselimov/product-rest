/**
 * Contact cards (spec 053 ui-contract §4): e-mail and phone. Two columns on desktop with the icon above the text, one
 * column with the icon on the left below it. The whole card is the `mailto:` or `tel:` link: one focus stop.
 */
import { EnvelopeIcon, PhoneIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'

import type { FincertContactView } from '@/features/fincert/model/view'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'

import { CARD_CLASS, LINK_CARD_CLASS } from './constants'

const ICON = { email: EnvelopeIcon, phone: PhoneIcon } as const

type FincertContactsProps = Readonly<{ contacts: FincertContactView[]; locale: Locale }>

export function FincertContacts({ contacts, locale }: FincertContactsProps) {
  const t = getT(locale, 'fincert')

  return (
    <ul data-slot="fincert-contacts" className="grid grid-cols-1 gap-3 desk:grid-cols-2 desk:gap-6">
      {contacts.map((contact) => {
        const Icon = ICON[contact.kind]
        return (
          <li key={contact.kind}>
            <a
              href={contact.href}
              className={cn(
                CARD_CLASS,
                LINK_CARD_CLASS,
                'flex min-h-[90px] items-center gap-4 p-5 desk:h-full desk:flex-col desk:items-start desk:p-6',
              )}
            >
              <span aria-hidden="true" className="bg-site-surface-muted flex size-12 shrink-0 items-center justify-center rounded-full">
                <Icon className="text-primary size-6" />
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="text-site-fincert-muted text-sm leading-5 font-semibold">{t(`contacts.${contact.kind}`)}</span>
                <span className="text-primary text-lg leading-6 font-medium break-words">{contact.value}</span>
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
