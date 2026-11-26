/**
 * Code-based route tree (file-based plugin yox — template specs/001 plan.md §6).
 * Struktur:
 *   root (layout-suz, 404 burada)
 *   ├── /login              — public
 *   └── authed (pathless)   — guard + AppShell; bütün səhifələr bunun altında
 * Hər səhifə lazy yüklənir ki, ilkin bundle-a düşməsin.
 *
 * Konfiqurasiya ilə yaradılan CRUD bölmələri `createCrudRoutes` ilə (siyahı,
 * `/new`, `/$id`); lookup tələb edənlər `list`/`form` override-ları ilə səhifə
 * komponentləri verir. `registerModule` lazy route komponentlərinin konfiqi
 * cari yoldan tapması üçündür.
 */

import {
  createRoute,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'

import { AppShell } from '@/app/shell/app-shell'
import { safeRedirect } from '@/features/auth/lib/safe-redirect'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { azirModule } from '@/features/azir/model/module'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import {
  eventCategoriesModule,
  eventsModuleBase,
} from '@/features/events/model/module'
import {
  csrCategoriesModule,
  csrProjectsModuleBase,
} from '@/features/csr-projects/model/module'
import {
  releaseScheduleGroupsModule,
  releaseScheduleItemsModuleBase,
  releaseSchedulePeriodicitiesModule,
} from '@/features/release-schedule/model/module'
import {
  faqQuestionsModuleBase,
  faqTopicsModule,
  faqVideosModule,
} from '@/features/faq/model/module'
import {
  fincertDirectionsModule,
  fincertMembershipsModule,
} from '@/features/fincert/model/module'
import { galleriesModule } from '@/features/galleries/model/module'
import {
  bannersModule,
  homepageLinksModule,
  newsSliderModule,
  publicationsModule,
  runningLinesModule,
} from '@/features/homepage/model/modules'
import { strategyDocsModuleBase } from '@/features/homepage/model/strategy-docs'
import { ifiOrganizationsModule } from '@/features/ifi-organizations/model/module'
import { imagePopupsModule } from '@/features/image-popups/model/module'
import { memorandumsModule } from '@/features/memorandums/model/module'
import { monthlyReportsModuleBase } from '@/features/monthly-reports/model/module'
import { infoLinesModule } from '@/features/info-lines/model/module'
import { inflationModule } from '@/features/inflation/model/module'
import {
  lawCategoriesModule,
  lawsModuleBase,
} from '@/features/laws/model/module'
import { liveStreamsModule } from '@/features/live-streams/model/module'
import {
  measDocumentsModuleBase,
  measEmitentsModule,
  measInfoTypesModule,
} from '@/features/meas/model/module'
import {
  moneyMarkCategoriesModule,
  moneyMarkNewsModule,
  moneyMarksModuleBase,
} from '@/features/money-marks/model/modules'
import {
  divisionsModule,
  officesModule,
  staffModule,
} from '@/features/organization/model/modules'
import { pressReleasesModule } from '@/features/press-releases/model/module'
import { usersModule } from '@/features/users/model/module'
import { videosModule } from '@/features/videos/model/modules'
import { workingPapersModule } from '@/features/working-papers/model/module'
import {
  yieldCurveParametersModule,
  yieldCurvePeriodsModule,
  yieldCurveYieldsModule,
} from '@/features/yield-curves/model/module'
import { listSearchSchema } from '@/shared/crud/schema'
import type { AnyRow, ModuleConfig } from '@/shared/crud/types'
import { rootRoute } from './root'

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: z.object({
    /** Uğurlu girişdən sonra qayıdılacaq ünvan. */
    redirect: z.string().optional().catch(undefined),
  }),
  // Sessiya bərpa olunubsa (spec 005) login forması göstərilmir — hədəfə keç.
  beforeLoad: ({ search }) => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ href: safeRedirect(search.redirect) })
    }
  },
  component: lazyRouteComponent(
    () => import('@/features/auth/routes/login-page'),
    'LoginPage',
  ),
})

/** Qorunan layout (guideline §4.8): auth-suz giriş login-ə yönləndirilir. */
export const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authed',
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: AppShell,
})

const dashboardRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/',
  staticData: { crumb: 'nav:dashboard.label' },
  component: lazyRouteComponent(
    () => import('@/pages/dashboard'),
    'DashboardPage',
  ),
})

// ---- Səhifələr (US3) ----
const pagesListRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/pages',
  validateSearch: z.object({
    locale: z.enum(['az', 'en']).optional().catch(undefined),
  }),
  staticData: { crumb: 'nav:pages.label' },
  component: lazyRouteComponent(() => import('@/pages/pages'), 'PagesPage'),
})
const pagesNewRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/pages/new',
  validateSearch: z.object({
    parentId: z.number().int().optional().catch(undefined),
  }),
  staticData: { crumb: 'crud:new' },
  component: lazyRouteComponent(() => import('@/pages/pages'), 'PageFormPage'),
})
const pagesEditRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/pages/$id',
  staticData: { crumb: 'crud:edit' },
  component: lazyRouteComponent(() => import('@/pages/pages'), 'PageFormPage'),
})

// ---- Bölmə kökləri və yönləndirmələr ----
const homepageBlocksRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/homepage-blocks',
  staticData: { crumb: 'nav:homepageBlocks.label' },
  component: lazyRouteComponent(
    () => import('@/pages/homepage-blocks'),
    'HomepageBlocksPage',
  ),
})
const infoLinesRedirectRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/info-lines',
  beforeLoad: () => {
    throw redirect({ to: '/homepage-blocks/info-lines' })
  },
})
/** Canlı yayımlar Videolar tabından ayrıca bölməyə köçüb (spec 006) — köhnə əlfəcinlər üçün. */
const videoStreamsRedirectRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/videos/streams',
  beforeLoad: () => {
    throw redirect({ to: '/live-streams' })
  },
})
const organizationRedirectRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/organization',
  beforeLoad: () => {
    throw redirect({ to: '/organization/staff' })
  },
})
/** Org chart (spec 027, spec 060): the node tree and the site's chart preview, not a CRUD module. */
const orgChartRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/organization/chart',
  validateSearch: z.object({
    view: z.enum(['list', 'chart']).optional().catch(undefined),
    locale: z.enum(['az', 'en']).optional().catch(undefined),
  }),
  staticData: { crumb: 'organization:tabs.chart' },
  component: lazyRouteComponent(
    () => import('@/pages/org-chart'),
    'OrgChartPage',
  ),
})
/** FinCERT "Ümumi" (spec 053): the single settings record, not a CRUD module; its tabs list the two modules. */
const fincertSettingsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/fincert',
  staticData: { crumb: 'fincert:tabs.general' },
  component: lazyRouteComponent(
    () => import('@/pages/fincert'),
    'FincertSettingsPage',
  ),
})

// ---- Maliyyə (US4) ----
const currencyRatesRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/currency-rates',
  validateSearch: z.object({ date: z.string().optional().catch(undefined) }),
  staticData: { crumb: 'nav:currencyRates.label' },
  component: lazyRouteComponent(
    () => import('@/pages/currency-rates'),
    'CurrencyRatesPage',
  ),
})
const currenciesRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/currency-rates/currencies',
  staticData: { crumb: 'currency:tabs.currencies' },
  component: lazyRouteComponent(
    () => import('@/pages/currencies'),
    'CurrenciesPage',
  ),
})

/**
 * Gəlirlik əyrisi: üç ayrı data dəsti, yalnız siyahı + import — `createCrudRoutes`
 * yox, çünki `/new` və `/$id` yoxdur (`/yield-curves/$id` digər iki bölməni də tutardı).
 */
const yieldCurveRoute = <Row extends AnyRow, Path extends string>(
  config: ModuleConfig<Row, Path>,
  page:
    | 'YieldCurveYieldsPage'
    | 'YieldCurveParametersPage'
    | 'YieldCurvePeriodsPage',
  crumb: string,
) =>
  createRoute({
    getParentRoute: () => authLayoutRoute,
    path: registerModule(config).basePath,
    validateSearch: listSearchSchema(config),
    staticData: { crumb },
    component: lazyRouteComponent(() => import('@/pages/yield-curves'), page),
  })
const yieldCurveYieldsRoute = yieldCurveRoute(
  yieldCurveYieldsModule,
  'YieldCurveYieldsPage',
  'nav:yieldCurves.label',
)
const yieldCurveParametersRoute = yieldCurveRoute(
  yieldCurveParametersModule,
  'YieldCurveParametersPage',
  'yieldCurves:tabs.parameters',
)
const yieldCurvePeriodsRoute = yieldCurveRoute(
  yieldCurvePeriodsModule,
  'YieldCurvePeriodsPage',
  'yieldCurves:tabs.periods',
)

const mediaLibraryRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/media-library',
  validateSearch: z.object({
    page: z.number().int().min(1).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
  }),
  staticData: { crumb: 'nav:mediaLibrary.label' },
  component: lazyRouteComponent(
    () => import('@/pages/media-library'),
    'MediaLibraryPage',
  ),
})

const settingsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/settings',
  staticData: { crumb: 'nav:settings.label' },
  component: lazyRouteComponent(
    () => import('@/pages/settings'),
    'SettingsPage',
  ),
})

export const routeTree = rootRoute.addChildren([
  loginRoute,
  authLayoutRoute.addChildren([
    dashboardRoute,
    // Məzmun
    pagesListRoute,
    pagesNewRoute,
    pagesEditRoute,
    ...createCrudRoutes(authLayoutRoute, registerModule(pressReleasesModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(eventsModuleBase), {
      list: lazyRouteComponent(() => import('@/pages/events'), 'EventsPage'),
      form: lazyRouteComponent(
        () => import('@/pages/events'),
        'EventsFormPage',
      ),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(eventCategoriesModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(csrProjectsModuleBase), {
      list: lazyRouteComponent(
        () => import('@/pages/csr-projects'),
        'CsrProjectsPage',
      ),
      form: lazyRouteComponent(
        () => import('@/pages/csr-projects'),
        'CsrProjectsFormPage',
      ),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(csrCategoriesModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(ifiOrganizationsModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(memorandumsModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(monthlyReportsModuleBase), {
      list: lazyRouteComponent(() => import('@/pages/monthly-reports'), 'MonthlyReportsPage'),
      form: lazyRouteComponent(() => import('@/pages/monthly-reports'), 'MonthlyReportsFormPage'),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(workingPapersModule), {
      list: lazyRouteComponent(() => import('@/pages/working-papers'), 'WorkingPapersPage'),
      form: lazyRouteComponent(() => import('@/pages/working-papers'), 'WorkingPapersFormPage'),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(releaseScheduleItemsModuleBase), {
      list: lazyRouteComponent(
        () => import('@/pages/release-schedule'),
        'ReleaseScheduleItemsPage',
      ),
      form: lazyRouteComponent(
        () => import('@/pages/release-schedule'),
        'ReleaseScheduleItemsFormPage',
      ),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(releaseScheduleGroupsModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(releaseSchedulePeriodicitiesModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(faqQuestionsModuleBase), {
      list: lazyRouteComponent(() => import('@/pages/faq'), 'FaqQuestionsPage'),
      form: lazyRouteComponent(() => import('@/pages/faq'), 'FaqQuestionsFormPage'),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(faqTopicsModule), {
      list: lazyRouteComponent(() => import('@/pages/faq'), 'FaqTopicsPage'),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(faqVideosModule), {
      list: lazyRouteComponent(() => import('@/pages/faq'), 'FaqVideosPage'),
    }),
    fincertSettingsRoute,
    ...createCrudRoutes(authLayoutRoute, registerModule(fincertDirectionsModule), {
      list: lazyRouteComponent(() => import('@/pages/fincert'), 'FincertDirectionsPage'),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(fincertMembershipsModule), {
      list: lazyRouteComponent(() => import('@/pages/fincert'), 'FincertMembershipsPage'),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(lawsModuleBase), {
      list: lazyRouteComponent(() => import('@/pages/laws'), 'LawsPage'),
      form: lazyRouteComponent(() => import('@/pages/laws'), 'LawsFormPage'),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(lawCategoriesModule)),
    ...createCrudRoutes(
      authLayoutRoute,
      registerModule(measDocumentsModuleBase),
      {
        list: lazyRouteComponent(
          () => import('@/pages/meas'),
          'MeasDocumentsPage',
        ),
        form: lazyRouteComponent(
          () => import('@/pages/meas'),
          'MeasDocumentsFormPage',
        ),
      },
    ),
    ...createCrudRoutes(authLayoutRoute, registerModule(measEmitentsModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(measInfoTypesModule)),
    organizationRedirectRoute,
    orgChartRoute,
    ...createCrudRoutes(authLayoutRoute, registerModule(staffModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(divisionsModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(officesModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(moneyMarksModuleBase), {
      list: lazyRouteComponent(
        () => import('@/pages/money-marks'),
        'MoneyMarksPage',
      ),
      form: lazyRouteComponent(
        () => import('@/pages/money-marks'),
        'MoneyMarksFormPage',
      ),
    }),
    ...createCrudRoutes(
      authLayoutRoute,
      registerModule(moneyMarkCategoriesModule),
    ),
    ...createCrudRoutes(authLayoutRoute, registerModule(moneyMarkNewsModule)),
    // Media
    mediaLibraryRoute,
    ...createCrudRoutes(authLayoutRoute, registerModule(galleriesModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(videosModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(liveStreamsModule)),
    videoStreamsRedirectRoute,
    ...createCrudRoutes(authLayoutRoute, registerModule(imagePopupsModule)),
    // Ana səhifə
    homepageBlocksRoute,
    ...createCrudRoutes(authLayoutRoute, registerModule(bannersModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(newsSliderModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(runningLinesModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(homepageLinksModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(publicationsModule)),
    ...createCrudRoutes(authLayoutRoute, registerModule(strategyDocsModuleBase), {
      list: lazyRouteComponent(() => import('@/pages/homepage-blocks/strategy-docs'), 'StrategyDocsPage'),
      form: lazyRouteComponent(() => import('@/pages/homepage-blocks/strategy-docs'), 'StrategyDocsFormPage'),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(infoLinesModule)),
    infoLinesRedirectRoute,
    // Maliyyə
    currencyRatesRoute,
    currenciesRoute,
    ...createCrudRoutes(authLayoutRoute, registerModule(azirModule), {
      list: lazyRouteComponent(() => import('@/pages/azir'), 'AzirPage'),
    }),
    ...createCrudRoutes(authLayoutRoute, registerModule(inflationModule), {
      list: lazyRouteComponent(
        () => import('@/pages/inflation'),
        'InflationPage',
      ),
    }),
    yieldCurveYieldsRoute,
    yieldCurveParametersRoute,
    yieldCurvePeriodsRoute,
    // İdarəetmə
    ...createCrudRoutes(authLayoutRoute, registerModule(usersModule), {
      list: lazyRouteComponent(() => import('@/pages/users'), 'UsersPage'),
      form: lazyRouteComponent(() => import('@/pages/users'), 'UserFormPage'),
    }),
    settingsRoute,
  ]),
])
