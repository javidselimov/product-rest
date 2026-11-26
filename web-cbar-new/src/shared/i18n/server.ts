/**
 * Server komponentləri üçün `t` (spec 002 research R6).
 *
 * `react-i18next` server komponentindən import edilə bilməz (`createContext`),
 * ona görə burada yalnız `i18next` nüvəsi ilə instansiya qurulur. Resurslar
 * statikdir, `initAsync: false` sayəsində `init` sinxron bitir və `getFixedT`
 * dərhal işləyir. İnstansiyalar locale üzrə keşlənir — hər render yeni init etmir.
 */
import { createInstance, type TFunction, type i18n as I18nInstance } from 'i18next'

import {
  NAMESPACES,
  SUPPORTED_LANGUAGES,
  defaultLocale,
  defaultNS,
  resources,
  type Locale,
  type Namespace,
} from './index'

const cache = new Map<Locale, I18nInstance>()

function instanceFor(locale: Locale): I18nInstance {
  const cached = cache.get(locale)
  if (cached) return cached

  const instance = createInstance()
  void instance.init({
    lng: locale,
    fallbackLng: defaultLocale,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: [...NAMESPACES],
    defaultNS,
    resources,
    // Sinxron init: resurslar statikdir, `getFixedT` dərhal işləyir.
    initAsync: false,
    interpolation: { escapeValue: false },
  })

  cache.set(locale, instance)
  return instance
}

/**
 * Verilmiş dil və namespace üçün `t`. Açar `ns:key` formasında da yazıla bilər —
 * client tərəfdəki `useTranslation` ilə eyni konvensiya.
 */
export function getT(locale: Locale, ns: Namespace | Namespace[] = defaultNS): TFunction {
  return instanceFor(locale).getFixedT(locale, ns)
}
