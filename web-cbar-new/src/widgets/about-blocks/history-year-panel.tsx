/**
 * Tarix timeline-ının bir ilinin kartı — Figma `1845:119481` (`Card`), ui-contract §2.
 *
 * Server komponentidir: bütün illər ilk HTML-də olur (FR-017), göstərilməsini
 * `HistoryStepper` idarə edir. Hadisə mətni yalnız `CmsContent` ilə render olunur.
 */
import type { HistoryYear, TimelineEvent } from '@/features/about-content/model/types'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { HistoryPhotos } from './history-photos'
import { HistoryRings } from './history-rings'

type Event = Extract<TimelineEvent, { kind: 'event' }>

/** Rail: 12 nöqtə + növbəti hadisəyə qədər 2 en xətt (ui-contract "Hadisə"). Qutuda nöqtə aşağı enir. */
function Rail({ boxed, last }: Readonly<{ boxed: boolean; last: boolean }>) {
  return (
    <span aria-hidden="true" className="relative w-3 shrink-0">
      <span className={`bg-site-history-accent absolute left-0 size-3 rounded-full ${boxed ? 'top-4 tab:top-5' : 'top-1'}`} />
      {last ? null : <span className="bg-site-history-accent/35 absolute top-[18px] -bottom-6 left-[5px] w-0.5" />}
    </span>
  )
}

function EventBody({ event, zoomLabel }: Readonly<{ event: Event; zoomLabel: (alt: string) => string }>) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-1.5 ${
        event.boxed ? 'border-site-history-accent/60 rounded-xs border bg-primary-foreground/5 p-3 tab:p-4' : ''
      }`}
    >
      {event.dayMonth ? (
        <p className="text-site-history-accent text-sm leading-7 font-medium">
          {event.dayMonth} {event.year}
        </p>
      ) : null}
      {event.title ? <h3 className="text-primary-foreground text-base leading-7 font-semibold">{event.title}</h3> : null}
      <CmsContent html={event.html} variant="history" />
      {event.photoLayout ? (
        <div className={event.boxed ? 'pt-1.5' : ''}>
          <HistoryPhotos images={event.images} layout={event.photoLayout} zoomLabel={zoomLabel} />
        </div>
      ) : null}
    </div>
  )
}

type HistoryYearPanelProps = Readonly<{ year: HistoryYear; zoomLabel: (alt: string) => string }>

export function HistoryYearPanel({ year, zoomLabel }: HistoryYearPanelProps) {
  const multi = year.items.filter((item) => item.kind === 'event').length > 1
  return (
    <div className="from-site-history-card-from to-site-history-card-to relative flex flex-col gap-5 overflow-hidden rounded-xs bg-linear-to-r px-5 py-6 text-primary-foreground tab:p-8 desk:flex-row desk:gap-10 desk:py-10 desk:pr-8 desk:pl-10 print:bg-none print:p-0 print:text-foreground">
      {/* Fondakı böyük il — dekorasiya; il mətnin özündə də var. */}
      <span
        aria-hidden="true"
        data-print="hide"
        className="pointer-events-none absolute -right-2 -bottom-7 text-[140px] leading-none font-bold whitespace-nowrap text-primary-foreground/6 select-none tab:text-[200px] desk:-right-2.5 desk:text-[220px]"
      >
        {year.year}
      </span>
      <div className="relative flex min-w-0 flex-col gap-4 desk:max-w-128 desk:flex-[0_1_512px]">
        <p className="text-5xl leading-none font-bold tab:text-[64px] desk:text-7xl">{year.year}</p>
        <ol className="flex flex-col gap-5">
          {year.items.map((item, i) => {
            const last = i === year.items.length - 1
            if (item.kind === 'loose') {
              return (
                <li key={`loose-${i}`} className={multi ? 'pl-7' : ''}>
                  <CmsContent html={item.html} variant="history" />
                </li>
              )
            }
            return (
              <li key={`${item.year}-${i}`} className="flex gap-4">
                {multi ? <Rail boxed={item.boxed} last={last} /> : null}
                <EventBody event={item} zoomLabel={zoomLabel} />
              </li>
            )
          })}
        </ol>
      </div>
      <HistoryRings />
    </div>
  )
}
