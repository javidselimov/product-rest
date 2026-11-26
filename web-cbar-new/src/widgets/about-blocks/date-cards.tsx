/**
 * Tarix kartları — Figma `1186:14884` (desktop 312×160), `Key dates` (planşet 211, mobil tam en).
 */
import { CmsContent } from '@/widgets/cms-content/cms-content'

type DateCardsProps = Readonly<{ cards: { date: string; html: string }[] }>

export function DateCards({ cards }: DateCardsProps) {
  return (
    <ul data-slot="date-cards" className="grid grid-cols-1 gap-3 tab:grid-cols-3 tab:gap-4 desk:gap-6">
      {cards.map((card, index) => (
        <li
          key={`${index}-${card.date}`}
          className="border-site-divider flex flex-col gap-2.5 rounded-xs border p-5 tab:p-4 desk:min-h-40 desk:p-5"
        >
          <p className="text-primary text-lg leading-6 font-semibold">{card.date}</p>
          <CmsContent html={card.html} variant="about" />
        </li>
      ))}
    </ul>
  )
}
