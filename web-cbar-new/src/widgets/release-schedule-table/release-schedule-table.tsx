/**
 * The information disclosure schedule (spec 039 FR-013..FR-015a). Server component.
 *
 * From the tablet up it is one table, a bold row heading each group. Below it the Figma turns each
 * row into a card with labelled fields, so the phone view is a list. Both render and CSS hides one;
 * the hidden one is out of the accessibility tree too.
 */
import type { ReleaseScheduleGroup, ReleaseScheduleItem } from '@/features/release-schedule/model/schemas'
import { TIMING_MODE } from '@/features/release-schedule/model/constants'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { DecisionsDialog, type DecisionsDialogData } from '@/widgets/decisions-dialog'

import { CELL_CLASS, COLUMN_CLASS, FRAME_CLASS, GROUP_CELL_CLASS, HEAD_CELL_CLASS, LINK_CLASS } from './model'

type Props = Readonly<{
  locale: Locale
  caption: string
  groups: ReleaseScheduleGroup[]
  decisions: DecisionsDialogData
}>

const EXTERNAL = /^https?:\/\//i

function Arrow() {
  return <span aria-hidden="true"> ↗</span>
}

function Timing({ item, locale, decisions }: Readonly<{ item: ReleaseScheduleItem; locale: Locale; decisions: DecisionsDialogData }>) {
  const t = getT(locale, 'media')

  if (item.timingMode === TIMING_MODE.DECISIONS) {
    return (
      <DecisionsDialog data={decisions} className={LINK_CLASS}>
        {item.timing ?? t('releaseSchedule.decisionsFallback')}
        <Arrow />
      </DecisionsDialog>
    )
  }
  if (item.timingMode === TIMING_MODE.LINK && item.timingUrl) {
    const external = EXTERNAL.test(item.timingUrl)
    return (
      <a
        href={external ? item.timingUrl : `/${locale}${item.timingUrl}`}
        className={LINK_CLASS}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {item.timing ?? t('releaseSchedule.linkFallback')}
        <Arrow />
        {external ? <span className="sr-only"> {t('releaseSchedule.newWindow')}</span> : null}
      </a>
    )
  }
  return <>{item.timing ?? t('releaseSchedule.noValue')}</>
}

export function ReleaseScheduleTable({ locale, caption, groups, decisions }: Props) {
  const t = getT(locale, 'media')
  const noValue = t('releaseSchedule.noValue')

  return (
    <div data-slot="release-schedule">
      <div className={`${FRAME_CLASS} max-tab:hidden`}>
        <table className="w-full table-fixed border-collapse [&_tbody:last-child_tr:last-child>*]:border-b-0">
          <caption className="sr-only">{caption}</caption>
          <colgroup>
            <col className={COLUMN_CLASS.content} />
            <col className={COLUMN_CLASS.periodicity} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={HEAD_CELL_CLASS}>{t('releaseSchedule.columns.content')}</th>
              <th scope="col" className={HEAD_CELL_CLASS}>{t('releaseSchedule.columns.periodicity')}</th>
              <th scope="col" className={HEAD_CELL_CLASS}>{t('releaseSchedule.columns.timing')}</th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.id}>
              <tr>
                <th scope="colgroup" colSpan={3} className={GROUP_CELL_CLASS}>
                  {group.name}
                </th>
              </tr>
              {group.items.map((item) => (
                <tr key={item.id} data-slot="release-schedule-row">
                  <td className={CELL_CLASS}>{item.title}</td>
                  <td className={CELL_CLASS}>{item.periodicity ?? noValue}</td>
                  <td className={CELL_CLASS}>
                    <Timing item={item} locale={locale} decisions={decisions} />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <div className={`${FRAME_CLASS} tab:hidden`}>
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`release-schedule-group-${group.id}`}>
            <h2 id={`release-schedule-group-${group.id}`} className="bg-site-surface-muted border-site-schedule-border text-site-text-strong border-b px-4 pt-[13px] pb-3 text-base leading-7 font-semibold">
              {group.name}
            </h2>
            <ul>
              {group.items.map((item) => (
                <li key={item.id} className="border-site-schedule-border flex flex-col gap-2.5 border-b p-4">
                  <p className="text-site-text-strong text-sm leading-[22px] font-semibold">{item.title}</p>
                  <dl className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground text-xs leading-4 tracking-[0.25px]">{t('releaseSchedule.columns.periodicity')}</dt>
                      <dd className="text-site-text-strong text-sm leading-7">{item.periodicity ?? noValue}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground text-xs leading-4 tracking-[0.25px]">{t('releaseSchedule.columns.timing')}</dt>
                      <dd className="text-site-text-strong text-sm leading-7">
                        <Timing item={item} locale={locale} decisions={decisions} />
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
