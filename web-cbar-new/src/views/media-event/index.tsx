/**
 * Event detail in the Media section shell (spec 034, contracts/ui-contract.md §4, Figma
 * `2306:84019` past, `2312:5089` upcoming). The link to the press release is the one addition to
 * the design (§6).
 */
import Link from 'next/link'

import { getT } from '@/shared/i18n/server'
import { CmsContent } from '@/widgets/cms-content/cms-content'
import { EventTags } from '@/widgets/event-tags'
import { PhotoGallery } from '@/widgets/photo-gallery'
import { SectionShell } from '@/widgets/section-shell'

import type { MediaEventData } from './loader'

function Fact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground text-[13px] leading-[18px]">{label}</dt>
      <dd className="text-foreground text-base leading-6 font-semibold">{value}</dd>
    </div>
  )
}

export function MediaEventView({ data }: Readonly<{ data: MediaEventData }>) {
  const t = getT(data.locale, 'media')
  const content = getT(data.locale, 'content')

  return (
    <SectionShell shell={data.shell} title={data.title}>
      <div data-slot="media-event" className="flex flex-col gap-6">
        <h2 className="text-foreground text-lg leading-[26px] font-semibold tab:text-xl tab:leading-7">{data.eventTitle}</h2>

        {/* Figma `2306:84063`: 20 between the meta row, the facts, the text and the gallery. */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <EventTags tags={data.tags} />
            <p className="text-muted-foreground text-sm leading-5">{[data.date, data.time, data.location].filter(Boolean).join(' · ')}</p>
          </div>

          {data.upcoming ? (
            <dl data-slot="event-facts" className="bg-site-surface flex flex-wrap gap-x-6 gap-y-4 rounded-xs p-4 tab:gap-x-10 tab:px-6 tab:py-5">
              <Fact label={t('events.date')} value={data.date} />
              {data.time ? <Fact label={t('events.time')} value={data.time} /> : null}
              {data.location ? <Fact label={t('events.location')} value={data.location} /> : null}
            </dl>
          ) : null}

          {data.hasText ? <CmsContent html={data.html} variant="about" /> : data.upcoming ? <p className="text-foreground text-base leading-7">{t('events.comingSoon')}</p> : null}

          {data.pressReleaseHref ? (
            <Link href={data.pressReleaseHref} data-slot="event-press-release" className="text-primary self-start text-base leading-7 font-medium underline">
              {t('events.pressRelease')}
            </Link>
          ) : null}

          {data.gallery.length > 0 ? (
            <div className="mt-4">
              <PhotoGallery
                images={data.gallery}
                labels={{
                  label: content('newsList.gallery.label'),
                  prev: content('newsList.gallery.prev'),
                  next: content('newsList.gallery.next'),
                  // The client fills these placeholders, so they are passed through as literals.
                  position: content('newsList.gallery.position', { current: '{{current}}', total: '{{total}}' }),
                  thumb: content('newsList.gallery.thumb', { n: '{{n}}' }),
                  open: content('newsList.gallery.open'),
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  )
}
