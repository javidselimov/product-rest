/**
 * i18next instansiyasının fabriki — **client tərəfdir**.
 *
 * `react-i18next` `createContext` işlədir, ona görə server komponentindən
 * (root layout, route faylları) import edilə bilməz. Dil sabitləri ayrıca,
 * təmiz `@/shared/i18n` modulundadır və hər iki tərəfdən oxunur
 * (konstitusiya Maddə XI.1–2).
 */
import { createInstance, type i18n as I18nInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { NAMESPACES, SUPPORTED_LANGUAGES, defaultLocale, defaultNS, resources } from './index'
import type { Locale } from './index'

/** Verilmiş dil üçün müstəqil i18next instansiyası qurur (qlobal singleton yoxdur). */
export function createI18n(locale: Locale): I18nInstance {
  const instance = createInstance()

  void instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: defaultLocale,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: [...NAMESPACES],
    defaultNS,
    resources,
    // React onsuz da escape edir; ikiqat escape mətni korlayır.
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

  return instance
}
