/**
 * Information disclosure schedule in the Media section shell (spec 039, Figma `1713:29377`,
 * `1718:30137`, `1718:30583`). Server component: the search is a GET form, the table is static, and
 * only the decisions dialog runs on the client.
 */
import { getT } from '@/shared/i18n/server'
import { CmsContent } from '@/widgets/cms-content/cms-content'
import { ListFilter } from '@/widgets/list-filter/list-filter'
import { ReleaseScheduleTable } from '@/widgets/release-schedule-table'
import { SectionShell } from '@/widgets/section-shell'

import type { ReleaseScheduleData } from './loader'

export function ReleaseScheduleView({ data }: Readonly<{ data: ReleaseScheduleData }>) {
  const t = getT(data.locale, 'media')
  const { schedule } = data

  return (
    <SectionShell shell={data.shell} title={data.title}>
      <div data-slot="media-release-schedule" className="flex flex-col gap-5 tab:gap-6">
        {data.intro ? <CmsContent html={data.intro} variant="about" /> : null}

        {schedule ? (
          <>
            <ListFilter
              action={data.basePath}
              filters={{ q: data.q, from: undefined, to: undefined }}
              clearHref={data.clearHref}
              dates={false}
              labels={{
                form: t('releaseSchedule.filter.form'),
                search: t('releaseSchedule.filter.search'),
                dateRange: '',
                dateFrom: '',
                dateTo: '',
                submit: t('releaseSchedule.filter.submit'),
                clear: t('releaseSchedule.filter.clear'),
              }}
            />
            {schedule.groups.length > 0 ? (
              <ReleaseScheduleTable
                locale={data.locale}
                caption={t('releaseSchedule.caption')}
                groups={schedule.groups}
                decisions={schedule.decisions}
              />
            ) : (
              <p role="status" className="text-muted-foreground text-base leading-7">
                {t('releaseSchedule.empty')}
              </p>
            )}
          </>
        ) : null}
      </div>
    </SectionShell>
  )
}
