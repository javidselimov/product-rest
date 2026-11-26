import type {
  AzirSummary,
  AzirValue,
  InflationParameter,
  InflationSettings,
  YieldCurve,
} from '@/features/stats/model/schemas'

const TERMS = ['1D', '1W', '1M', '30D', '90D', '180D']
const DATES = ['2026-09-10', '2026-09-11', '2026-09-14']

type AzirSeed = {
  valueDate: string
  term: string
  rate: number
  dealVolume?: number | null
  dealCount?: number | null
  minRate?: number | null
  maxRate?: number | null
  isReservePlan?: boolean
}

/** API həmişə bütün sahələri qaytarır; detal sətri yoxdursa `null` / `false`. */
function azirRow(seed: AzirSeed): AzirValue {
  return {
    dealVolume: null,
    dealCount: null,
    minRate: null,
    maxRate: null,
    isReservePlan: false,
    ...seed,
  }
}

export const azirFixture: AzirValue[] = DATES.flatMap((valueDate, d) =>
  TERMS.map((term, i) =>
    azirRow({
      valueDate,
      term,
      rate: Number((7 + i * 0.1 + d * 0.01).toFixed(2)),
    }),
  ),
)

/**
 * Spec 021 quickstart §4 istinad dəsti (yalnız 1D): `2026-09-11` rate 0-dır
 * (cədvəldə görünmür), `2026-08-31` ehtiyat plan əsasındadır.
 */
export const azirReferenceFixture: AzirValue[] = [
  azirRow({ valueDate: '2024-12-31', term: '1D', rate: 6, dealVolume: 500, dealCount: 30 }),
  azirRow({ valueDate: '2025-01-15', term: '1D', rate: 6.2, dealVolume: 80, dealCount: 9 }),
  azirRow({ valueDate: '2025-06-10', term: '1D', rate: 6.4, dealVolume: 420, dealCount: 27 }),
  azirRow({ valueDate: '2025-12-31', term: '1D', rate: 6.5, dealVolume: 200, dealCount: 15 }),
  azirRow({
    valueDate: '2026-08-31',
    term: '1D',
    rate: 7,
    dealVolume: 220,
    dealCount: 18,
    isReservePlan: true,
  }),
  azirRow({ valueDate: '2026-09-11', term: '1D', rate: 0 }),
  azirRow({
    valueDate: '2026-09-12',
    term: '1D',
    rate: 7.25,
    dealVolume: 250,
    dealCount: 21,
    minRate: 6.9,
    maxRate: 7.6,
  }),
]

/**
 * MSW-nin `/api/v1/azir` cavabı: istinad dəsti + çoxmüddətli fixture (`2026-09-11`
 * 1D istinad dəstindədir). API kimi tarix, sonra müddət üzrə artan sırada.
 */
export const azirDataset: AzirValue[] = [
  ...azirReferenceFixture,
  ...azirFixture.filter(
    (v) => !(v.term === '1D' && v.valueDate === '2026-09-11'),
  ),
].sort(
  (a, b) =>
    a.valueDate.localeCompare(b.valueDate) || a.term.localeCompare(b.term),
)

/** Summary hesablamasında istifadə olunan USD məzənnəsi (quickstart §4): 250 / 1,7 = 147,06. */
export const azirUsdRateFixture = {
  code: 'USD',
  nominal: 1,
  rate: 1.7,
  rateDate: '2026-09-12',
} as const

/** `GET /api/v1/azir/summary` — istinad dəstinin gözlənilən nəticəsi (bu gün 2026-10-08). */
export const azirSummaryFixture: AzirSummary = {
  lastDate: '2026-09-12',
  lastRate: 7.25,
  rateChangeSinceMonthEnd: 0.25,
  rateChangeSinceYearEnd: 0.75,
  lastMinRate: 6.9,
  lastMaxRate: 7.6,
  lastVolume: 250,
  volumeChangeSinceMonthEnd: 30,
  volumeMinSincePrevYearStart: 80,
  volumeMaxSincePrevYearStart: 420,
  lastVolumeUsd: 147.06,
}

export const inflationSettingsFixture: InflationSettings = {
  currentInflation: 5.7,
  targetInflation: '4 (±2)',
  nextUpdateDate: '2026-08-16',
}

export const inflationFixture: InflationParameter[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    year: 2026,
    month: i + 1,
    parameterCode: 'cpi_yoy',
    value: 5 + i * 0.1,
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    year: 2025,
    month: i + 1,
    parameterCode: 'cpi_yoy',
    value: 4 + i * 0.1,
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    year: 2026,
    month: i + 1,
    parameterCode: 'core_yoy',
    value: 4.5 + i * 0.05,
  })),
  { year: 2026, month: 1, parameterCode: 'target', value: 4 },
]

export const yieldCurveFixture: YieldCurve = {
  curveDate: '2026-09-12',
  parameters: { beta0: 0.0812, beta1: -0.0123, beta2: 0.0045, lambda: 1.2345 },
  yields: [
    { period: '3M', yield: 6.9 },
    { period: '6M', yield: 7.1 },
    { period: '1Y', yield: 7.4 },
    { period: '2Y', yield: 7.8 },
    { period: '5Y', yield: 8.2 },
  ],
}
