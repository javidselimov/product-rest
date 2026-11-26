/**
 * Contact cards — Figma `1792:6701` (desktop 480×196, tablet 324×196, mobile full width).
 * Sizes: `specs/037-media-requests/contracts/ui-contract.md`.
 */
import { EnvelopeIcon, PhoneIcon } from '@cbar/lib-react-ui-kit/icons'

import type { ContactCard } from '@/features/about-content/model/types'

/** Figma mixes the families here: the envelope is outline, the phone is solid. */
const ICONS = {
  email: <EnvelopeIcon className="size-6" aria-hidden="true" />,
  phone: <PhoneIcon variant="solid" className="size-6" aria-hidden="true" />,
} as const

const VALUE_CLASS = 'text-primary text-lg leading-6 font-medium wrap-anywhere'

function Card({ card }: Readonly<{ card: ContactCard }>) {

  return (
    <li className="border-site-divider bg-background flex flex-col gap-4 rounded-xs border p-6">
      {card.kind ? (
        <span className="bg-site-surface-muted text-primary flex size-12 items-center justify-center rounded-full">{ICONS[card.kind]}</span>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <p className="text-muted-foreground text-sm leading-[18px] font-semibold">{card.label}</p>
        {card.href ? (
          <a href={card.href} className={`${VALUE_CLASS} hover:underline`}>
            {card.value}
          </a>
        ) : (
          <p className={VALUE_CLASS}>{card.value}</p>
        )}
        {card.note ? <p className="text-site-text-strong text-sm leading-7">{card.note}</p> : null}
      </div>
    </li>
  )
}

export function ContactCards({ cards }: Readonly<{ cards: ContactCard[] }>) {
  return (
    <ul data-slot="contact-cards" className="grid grid-cols-1 gap-4 tab:grid-cols-2 desk:gap-6">
      {cards.map((card, index) => (
        <Card key={`${index}-${card.label}`} card={card} />
      ))}
    </ul>
  )
}
