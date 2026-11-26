/**
 * "Təqvim" (Figma `813:25280`, `382:1551`, spec 022 FR-014), a server component.
 *
 * Each event: a date box (day + month), then tags, title and time. The events come from the API
 * (spec 034), newest by start date (spec 059). The month name is localised by `entities/content` `monthName`.
 *
 * The whole row is one link: the title link is stretched over the row, so a row has one tab stop and the
 * link is named by the title alone. The heading links to the events list.
 */
import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { ClockIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'

import { monthName } from '@/entities/content'
import type { Locale } from '@/shared/i18n'

export type CalendarEvent = {
  key: string
  /** ISO `YYYY-MM-DD`. */
  date: string
  time: string | null
  /** Translated labels. */
  tags: string[]
  title: string
  /** Always set: `eventHref` gives a legacy event its CMS page and the rest their detail page. */
  href: string
}

type EventCalendarProps = {
  locale: Locale
  title: string
  /** The events list (`/{locale}/media/events`), linked from the heading. */
  listHref: string
  events: CalendarEvent[]
}

/** `2026-10-15` → `{ day: '15', month: 'Oktyabr' }` — read from the ISO parts, so the time zone does not matter. */
function dayAndMonth(iso: string, locale: Locale): { day: string; month: string } {
  const [year, month, day] = iso.split('-').map(Number)
  const name = monthName(year, month, locale)
  return { day: String(day), month: name.charAt(0).toLocaleUpperCase(locale) + name.slice(1) }
}

export function EventCalendar({ locale, title, listHref, events }: EventCalendarProps) {
  if (events.length === 0) return null

  return (
    <section aria-label={title} data-slot="event-calendar" className="flex flex-col gap-9 desk:w-106 desk:shrink-0">
      <h2 className="text-foreground text-[32px]/11 font-semibold">
        <Link
          href={listHref}
          className="focus-visible:outline-ring rounded-xs outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {title}
        </Link>
      </h2>
      {/* Figma `813:25284`: the box is as tall as the strategy cards (it stretches from desk up). */}
      <ul className="border-site-divider flex flex-col gap-4 rounded-xs border p-5 desk:flex-1">
        {events.map((event) => {
          const { day, month } = dayAndMonth(event.date, locale)
          return (
            <li key={event.key} className="group relative flex min-h-[107px] gap-4">
              <time
                dateTime={event.date}
                className="bg-site-surface flex w-18.5 shrink-0 flex-col items-center justify-center gap-2 rounded-xs p-2 text-center"
              >
                <span className="text-foreground text-2xl/7 font-extrabold">{day}</span>
                <span className="text-muted-foreground text-sm font-medium">{month}</span>
              </time>
              {/* Figma: the text column is 204px (`813:25293`). */}
              <div className="flex w-51 min-w-0 flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} colorPalette="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-foreground group-hover:text-primary text-base/7 font-semibold group-hover:underline">
                  {/* Stretched over the row (the li is relative); the focus ring is drawn on the same pseudo-element. */}
                  <Link
                    href={event.href}
                    className="focus-visible:after:outline-ring outline-none after:absolute after:inset-0 after:rounded-xs after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2"
                  >
                    {event.title}
                  </Link>
                </h3>
                {event.time ? (
                  <p className="text-muted-foreground flex h-[15px] items-center gap-1 text-xs">
                    <ClockIcon className="size-4" aria-hidden="true" />
                    {event.time}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
