/**
 * **Tək** handler barrel-i (spec 002 contracts/public-api.md §5).
 *
 * Hər feature öz `<feature>.ts` faylını bura əlavə edir; MSW node server-i
 * (Vitest) yalnız bu siyahını oxuyur. `onUnhandledRequest: 'error'` — kontraktdan
 * kənar sorğu testi uğursuz edir. Handler faylları bazanı `../api-base`-dən
 * oxuyur (bu barrel-dən yox — dövri import olmasın).
 */
import type { RequestHandler } from 'msw'

import { csrProjectsHandlers } from './csr-projects'
import { currenciesHandlers } from './currencies'
import { eventsHandlers } from './events'
import { faqHandlers } from './faq'
import { fincertHandlers } from './fincert'
import { workingPaperHandlers } from './working-papers'
import { homepageHandlers } from './homepage'
import { ifiOrganizationsHandlers } from './ifi-organizations'
import { lawsHandlers } from './laws'
import { measHandlers } from './meas'
import { memorandumsHandlers } from './memorandums'
import { monthlyReportsHandlers } from './monthly-reports'
import { mediaHandlers } from './media'
import { moneyMarksHandlers } from './money-marks'
import { organizationHandlers } from './organization'
import { pagesHandlers } from './pages'
import { pressReleasesHandlers } from './press-releases'
import { releaseScheduleHandlers } from './release-schedule'
import { searchHandlers } from './search'
import { siteSettingsHandlers } from './site-settings'
import { statsHandlers } from './stats'

export { API } from '../api-base'

export const handlers: RequestHandler[] = [
  ...pagesHandlers,
  ...homepageHandlers,
  ...currenciesHandlers,
  ...csrProjectsHandlers,
  ...ifiOrganizationsHandlers,
  ...faqHandlers,
  ...fincertHandlers,
  ...workingPaperHandlers,
  ...memorandumsHandlers,
  ...monthlyReportsHandlers,
  ...releaseScheduleHandlers,
  ...pressReleasesHandlers,
  ...eventsHandlers,
  ...statsHandlers,
  ...mediaHandlers,
  ...lawsHandlers,
  ...moneyMarksHandlers,
  ...measHandlers,
  ...organizationHandlers,
  ...searchHandlers,
  ...siteSettingsHandlers,
]
