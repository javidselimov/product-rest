/**
 * i18n qurğusu (guideline §14): react-i18next + browser detector,
 * `fallbackLng: 'az'`. Namespace-lər səhifə/feature üzrə `src/locales/<lng>/`
 * qovluğundadır. UI-də hardcoded mətn qadağandır — hər string açarla gəlir.
 * `scripts/check-i18n.mjs` az/en açar dəstlərinin bərabərliyini yoxlayır.
 */

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import azAuth from '@/locales/az/auth.json'
import azAzir from '@/locales/az/azir.json'
import azCommon from '@/locales/az/common.json'
import azCrud from '@/locales/az/crud.json'
import azCurrency from '@/locales/az/currency.json'
import azDashboard from '@/locales/az/dashboard.json'
import azCsrProjects from '@/locales/az/csrProjects.json'
import azReleaseSchedule from '@/locales/az/releaseSchedule.json'
import azFaq from '@/locales/az/faq.json'
import azFincert from '@/locales/az/fincert.json'
import azEvents from '@/locales/az/events.json'
import azGalleries from '@/locales/az/galleries.json'
import azHomepage from '@/locales/az/homepage.json'
import azIfiOrganizations from '@/locales/az/ifiOrganizations.json'
import azImagePopups from '@/locales/az/imagePopups.json'
import azInflation from '@/locales/az/inflation.json'
import azInfoLines from '@/locales/az/infoLines.json'
import azLaws from '@/locales/az/laws.json'
import azLiveStreams from '@/locales/az/liveStreams.json'
import azMeas from '@/locales/az/meas.json'
import azMedia from '@/locales/az/media.json'
import azMemorandums from '@/locales/az/memorandums.json'
import azMoneyMarks from '@/locales/az/moneyMarks.json'
import azMonthlyReports from '@/locales/az/monthlyReports.json'
import azNav from '@/locales/az/nav.json'
import azOrganization from '@/locales/az/organization.json'
import azPages from '@/locales/az/pages.json'
import azPressReleases from '@/locales/az/pressReleases.json'
import azRichText from '@/locales/az/richText.json'
import azSettings from '@/locales/az/settings.json'
import azUsers from '@/locales/az/users.json'
import azVideos from '@/locales/az/videos.json'
import azWorkingPapers from '@/locales/az/workingPapers.json'
import azYieldCurves from '@/locales/az/yieldCurves.json'
import enAuth from '@/locales/en/auth.json'
import enAzir from '@/locales/en/azir.json'
import enCommon from '@/locales/en/common.json'
import enCrud from '@/locales/en/crud.json'
import enCurrency from '@/locales/en/currency.json'
import enDashboard from '@/locales/en/dashboard.json'
import enCsrProjects from '@/locales/en/csrProjects.json'
import enReleaseSchedule from '@/locales/en/releaseSchedule.json'
import enFaq from '@/locales/en/faq.json'
import enFincert from '@/locales/en/fincert.json'
import enEvents from '@/locales/en/events.json'
import enGalleries from '@/locales/en/galleries.json'
import enHomepage from '@/locales/en/homepage.json'
import enIfiOrganizations from '@/locales/en/ifiOrganizations.json'
import enImagePopups from '@/locales/en/imagePopups.json'
import enInflation from '@/locales/en/inflation.json'
import enInfoLines from '@/locales/en/infoLines.json'
import enLaws from '@/locales/en/laws.json'
import enLiveStreams from '@/locales/en/liveStreams.json'
import enMeas from '@/locales/en/meas.json'
import enMedia from '@/locales/en/media.json'
import enMemorandums from '@/locales/en/memorandums.json'
import enMoneyMarks from '@/locales/en/moneyMarks.json'
import enMonthlyReports from '@/locales/en/monthlyReports.json'
import enNav from '@/locales/en/nav.json'
import enOrganization from '@/locales/en/organization.json'
import enPages from '@/locales/en/pages.json'
import enPressReleases from '@/locales/en/pressReleases.json'
import enRichText from '@/locales/en/richText.json'
import enSettings from '@/locales/en/settings.json'
import enUsers from '@/locales/en/users.json'
import enVideos from '@/locales/en/videos.json'
import enWorkingPapers from '@/locales/en/workingPapers.json'
import enYieldCurves from '@/locales/en/yieldCurves.json'

export const SUPPORTED_LANGUAGES = ['az', 'en'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const resources = {
  az: {
    common: azCommon,
    nav: azNav,
    auth: azAuth,
    dashboard: azDashboard,
    settings: azSettings,
    richText: azRichText,
    crud: azCrud,
    media: azMedia,
    pages: azPages,
    homepage: azHomepage,
    infoLines: azInfoLines,
    laws: azLaws,
    meas: azMeas,
    organization: azOrganization,
    moneyMarks: azMoneyMarks,
    csrProjects: azCsrProjects,
    ifiOrganizations: azIfiOrganizations,
    memorandums: azMemorandums,
    monthlyReports: azMonthlyReports,
    workingPapers: azWorkingPapers,
    releaseSchedule: azReleaseSchedule,
    faq: azFaq,
    fincert: azFincert,
    events: azEvents,
    galleries: azGalleries,
    videos: azVideos,
    liveStreams: azLiveStreams,
    imagePopups: azImagePopups,
    pressReleases: azPressReleases,
    currency: azCurrency,
    azir: azAzir,
    inflation: azInflation,
    yieldCurves: azYieldCurves,
    users: azUsers,
  },
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    dashboard: enDashboard,
    settings: enSettings,
    richText: enRichText,
    crud: enCrud,
    media: enMedia,
    pages: enPages,
    homepage: enHomepage,
    infoLines: enInfoLines,
    laws: enLaws,
    meas: enMeas,
    organization: enOrganization,
    moneyMarks: enMoneyMarks,
    csrProjects: enCsrProjects,
    ifiOrganizations: enIfiOrganizations,
    memorandums: enMemorandums,
    monthlyReports: enMonthlyReports,
    workingPapers: enWorkingPapers,
    releaseSchedule: enReleaseSchedule,
    faq: enFaq,
    fincert: enFincert,
    events: enEvents,
    galleries: enGalleries,
    videos: enVideos,
    liveStreams: enLiveStreams,
    imagePopups: enImagePopups,
    pressReleases: enPressReleases,
    currency: enCurrency,
    azir: enAzir,
    inflation: enInflation,
    yieldCurves: enYieldCurves,
    users: enUsers,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'az',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: 'common',
    interpolation: { escapeValue: false }, // React onsuz da escape edir
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'nexus-language',
    },
  })

export { default as i18n } from 'i18next'
