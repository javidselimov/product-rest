/**
 * i18n konfiqurasiyası (spec 002 research R6, contracts/routes.md §6).
 *
 * Aktiv dil **URL-dən** gəlir (`/{locale}/…`) — `i18next-browser-languagedetector`
 * gətirilmir, çünki mənbə ikiləşərdi və SSR ilə uyğunsuzluq riski yaranardı.
 * Resurslar build-ə statik daxil edilir (dəst kiçikdir, kod bölünməsi yoxdur).
 *
 * **Bu modul təmizdir**: `react-i18next` burada import edilmir, ona görə server
 * komponentləri (root layout, route faylları, `proxy.ts`) onu sərbəst oxuya bilir.
 * Client instansiyası `./create-i18n`, server tərəfli `t` isə `./server`-dədir
 * (Maddə XI.1–2).
 */
import azAbout from '@/locales/az/about.json'
import azCommon from '@/locales/az/common.json'
import azContent from '@/locales/az/content.json'
import azErrors from '@/locales/az/errors.json'
import azFaq from '@/locales/az/faq.json'
import azFincert from '@/locales/az/fincert.json'
import azWorkingPapers from '@/locales/az/workingPapers.json'
import azFinance from '@/locales/az/finance.json'
import azFooter from '@/locales/az/footer.json'
import azHome from '@/locales/az/home.json'
import azMedia from '@/locales/az/media.json'
import azNav from '@/locales/az/nav.json'
import azOrganization from '@/locales/az/organization.json'
import azSearch from '@/locales/az/search.json'
import azSection from '@/locales/az/section.json'
import enAbout from '@/locales/en/about.json'
import enCommon from '@/locales/en/common.json'
import enContent from '@/locales/en/content.json'
import enErrors from '@/locales/en/errors.json'
import enFaq from '@/locales/en/faq.json'
import enFincert from '@/locales/en/fincert.json'
import enWorkingPapers from '@/locales/en/workingPapers.json'
import enFinance from '@/locales/en/finance.json'
import enFooter from '@/locales/en/footer.json'
import enHome from '@/locales/en/home.json'
import enMedia from '@/locales/en/media.json'
import enNav from '@/locales/en/nav.json'
import enOrganization from '@/locales/en/organization.json'
import enSearch from '@/locales/en/search.json'
import enSection from '@/locales/en/section.json'

export const SUPPORTED_LANGUAGES = ['az', 'en'] as const
export type Locale = (typeof SUPPORTED_LANGUAGES)[number]

export const defaultLocale: Locale = 'az'

/**
 * Dilin öz adı (endonim) — tərcümə olunmur, ona görə i18n açarı deyil.
 * Dil dəyişdiricisi digər dili həmişə öz adı ilə göstərir.
 */
export const LANGUAGE_ENDONYM: Record<Locale, string> = {
  az: 'Azərbaycanca',
  en: 'English',
}

/** `Intl` API-ləri üçün BCP 47 dəyəri (tarix, rəqəm, kit `DatePicker`). */
export const INTL_LOCALE: Record<Locale, string> = {
  az: 'az-AZ',
  en: 'en-GB',
}

export const NAMESPACES = [
  'common',
  'nav',
  'footer',
  'home',
  'content',
  'finance',
  'organization',
  'about',
  'section',
  'faq',
  'fincert',
  'workingPapers',
  'media',
  'search',
  'errors',
] as const
export type Namespace = (typeof NAMESPACES)[number]

export const defaultNS: Namespace = 'common'

export const resources = {
  az: {
    common: azCommon,
    nav: azNav,
    footer: azFooter,
    home: azHome,
    content: azContent,
    finance: azFinance,
    organization: azOrganization,
    about: azAbout,
    section: azSection,
    faq: azFaq,
    fincert: azFincert,
    workingPapers: azWorkingPapers,
    media: azMedia,
    search: azSearch,
    errors: azErrors,
  },
  en: {
    common: enCommon,
    nav: enNav,
    footer: enFooter,
    home: enHome,
    content: enContent,
    finance: enFinance,
    organization: enOrganization,
    about: enAbout,
    section: enSection,
    faq: enFaq,
    fincert: enFincert,
    workingPapers: enWorkingPapers,
    media: enMedia,
    search: enSearch,
    errors: enErrors,
  },
} as const

/** Naməlum locale səssiz defolt-a düşmür — çağıran tərəf `notFound()` verir. */
export function isSupportedLocale(value: string | undefined): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}

/** Cari dilin əksi — dil dəyişdiricisi yalnız onu göstərir (spec FR-008). */
export function otherLocale(locale: Locale): Locale {
  return locale === 'az' ? 'en' : 'az'
}
