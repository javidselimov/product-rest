/**
 * Statistika (contracts/routes.md #8): parametr oxunmur — `getAzir()`, `getInflation(cari il)`,
 * `getYieldCurveLatest()` hər biri müstəqil (köhnə `Promise.allSettled`).
 */
import 'server-only'

import { formatLongDate } from '@/entities/content'
import { getAzir, getInflation, getYieldCurveLatest } from '@/features/stats/api/stats.api'
import { azirSeries, inflationSeries, yieldSeries, type ChartData } from '@/features/stats/model/series'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

import { NS_PARAM_DECIMALS } from './constants'

export type StatisticsViewData = {
  locale: Locale
  year: number
  azir: { data: ChartData | null; error: boolean }
  inflation: { data: ChartData | null; error: boolean }
  yieldCurve: { data: ChartData | null; error: boolean; caption: string | null }
}

export async function loadStatistics(locale: Locale): Promise<StatisticsViewData> {
  const t = getT(locale, 'finance')
  const year = new Date().getFullYear()

  const [azir, inflation, curve] = await Promise.allSettled([getAzir(), getInflation(year), getYieldCurveLatest()])

  const parameterLabel = (code: string) => {
    const key = `parameters.${code}`
    const label = t(key)
    return label === key ? code : label
  }

  const curveValue = curve.status === 'fulfilled' ? curve.value : null
  const parameters = curveValue?.parameters
  const caption = curveValue
    ? [
        formatLongDate(curveValue.curveDate, locale),
        parameters
          ? `${t('nsParams')}: β₀ = ${parameters.beta0.toFixed(NS_PARAM_DECIMALS)}, β₁ = ${parameters.beta1.toFixed(NS_PARAM_DECIMALS)}, β₂ = ${parameters.beta2.toFixed(NS_PARAM_DECIMALS)}, λ = ${parameters.lambda.toFixed(NS_PARAM_DECIMALS)}`
          : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : null

  return {
    locale,
    year,
    azir: {
      data: azir.status === 'fulfilled' && azir.value.length > 0 ? azirSeries(azir.value) : null,
      error: azir.status === 'rejected',
    },
    inflation: {
      data:
        inflation.status === 'fulfilled' && inflation.value.length > 0
          ? inflationSeries(inflation.value, locale, parameterLabel)
          : null,
      error: inflation.status === 'rejected',
    },
    yieldCurve: {
      data: curveValue && curveValue.yields.length > 0 ? yieldSeries(curveValue, t('yieldCurve')) : null,
      error: curve.status === 'rejected',
      caption,
    },
  }
}
