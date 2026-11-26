/**
 * Tarix interaktiv timeline-ı — spec 026, Figma `1845:119481` (`tarix/Timeline`).
 *
 * Server komponenti: hər ilin kartını burada render edib `HistoryStepper`-ə panel kimi
 * ötürür — CMS HTML-i client bundle-ına JSON kimi ikinci dəfə düşmür (research R5).
 * Etiketlər də burada hazırlanır, client-də i18n lazım olmur.
 */
import type { AboutBlock } from '@/features/about-content/model/types'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

import { HistoryStepper } from './history-stepper'
import { HistoryYearPanel } from './history-year-panel'

type HistoryTimelineProps = Readonly<{ block: Extract<AboutBlock, { kind: 'timeline' }>; locale: Locale }>

export function HistoryTimeline({ block, locale }: HistoryTimelineProps) {
  const t = getT(locale, 'about')
  const zoomLabel = (alt: string) => (alt ? t('history.zoomWithAlt', { alt }) : t('history.zoom'))

  return (
    <HistoryStepper
      years={block.years.map(({ year, anchorId }) => ({ year, anchorId }))}
      panels={block.years.map((year) => (
        <HistoryYearPanel key={year.anchorId} year={year} zoomLabel={zoomLabel} />
      ))}
      labels={{ nav: t('history.yearNav'), prev: t('history.prev'), next: t('history.next'), zoom: t('history.zoom') }}
    />
  )
}
