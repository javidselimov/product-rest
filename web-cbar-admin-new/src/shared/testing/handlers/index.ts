/**
 * MSW handler-ləri — `api-cbar-admin`-in REAL kontraktını əks etdirir
 * (specs/001-admin-template-migration/contracts/admin-api.md). Testlərdə node
 * server, brauzerdə (`VITE_ENABLE_MSW=true`) worker eyni siyahını işlədir.
 */

import { authHandlers } from './auth'
import { azirHandlers } from './azir'
import { currencyHandlers } from './currency'
import { csrProjectsHandlers } from './csr-projects'
import { eventsHandlers } from './events'
import { faqHandlers } from './faq'
import { fincertHandlers } from './fincert'
import { galleriesHandlers } from './galleries'
import { homepageHandlers } from './homepage'
import { ifiOrganizationsHandlers } from './ifi-organizations'
import { imagePopupsHandlers } from './image-popups'
import { infoLinesHandlers } from './info-lines'
import { inflationHandlers } from './inflation'
import { lawsHandlers } from './laws'
import { liveStreamsHandlers } from './live-streams'
import { measHandlers } from './meas'
import { mediaHandlers } from './media'
import { memorandumsHandlers } from './memorandums'
import { monthlyReportsHandlers } from './monthly-reports'
import { moneyMarksHandlers } from './money-marks'
import { orgChartHandlers } from './org-chart'
import { organizationHandlers } from './organization'
import { pagesHandlers } from './pages'
import { pressReleasesHandlers } from './press-releases'
import { releaseScheduleHandlers } from './release-schedule'
import { settingsHandlers } from './settings'
import { usersHandlers } from './users'
import { videosHandlers } from './videos'
import { workingPapersHandlers } from './working-papers'
import { yieldCurvesHandlers } from './yield-curves'

export const handlers = [
  ...authHandlers,
  ...mediaHandlers,
  ...pagesHandlers,
  ...pressReleasesHandlers,
  ...eventsHandlers,
  ...csrProjectsHandlers,
  ...ifiOrganizationsHandlers,
  ...memorandumsHandlers,
  ...monthlyReportsHandlers,
  ...workingPapersHandlers,
  ...releaseScheduleHandlers,
  ...faqHandlers,
  ...fincertHandlers,
  ...lawsHandlers,
  ...measHandlers,
  ...organizationHandlers,
  ...orgChartHandlers,
  ...moneyMarksHandlers,
  ...galleriesHandlers,
  ...videosHandlers,
  ...liveStreamsHandlers,
  ...imagePopupsHandlers,
  ...homepageHandlers,
  ...infoLinesHandlers,
  ...currencyHandlers,
  ...azirHandlers,
  ...inflationHandlers,
  ...yieldCurvesHandlers,
  ...usersHandlers,
  ...settingsHandlers,
]
