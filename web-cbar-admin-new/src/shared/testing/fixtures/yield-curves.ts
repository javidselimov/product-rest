/** Gəlirlik əyrisi mock-ları — üç müstəqil, tarixə bağlı data dəsti (nümunə fayllardan bir hissə). */

export interface YieldPointsMock {
  curveDate: string
  points: { period: number; yield: number }[]
  updatedAt: string
}

export interface YieldParametersMock {
  curveDate: string
  beta0: number
  beta1: number
  beta2: number
  lambda: number
  updatedAt: string
}

export interface YieldPeriodsMock {
  curveDate: string
  threeMonth: number
  sixMonth: number
  nineMonth: number
  oneYear: number
  twoYear: number
  threeYear: number
  fourYear: number
  updatedAt: string
}

/** 2026-10-05 üçün yalnız nöqtələr var — data dəstlərinin müstəqil olduğunu göstərir. */
export const yieldPointsFixtures: YieldPointsMock[] = [
  {
    curveDate: '2026-10-12',
    points: [
      { period: 90, yield: 6.9 },
      { period: 91, yield: 6.89 },
      { period: 92, yield: 6.87 },
    ],
    updatedAt: '2026-10-12T10:00:00+00:00',
  },
  {
    curveDate: '2026-10-05',
    points: [
      { period: 90, yield: 6.8 },
      { period: 91, yield: 6.79 },
    ],
    updatedAt: '2026-10-05T10:00:00+00:00',
  },
]

export const yieldParametersFixtures: YieldParametersMock[] = [
  {
    curveDate: '2026-10-12',
    beta0: 7.2654,
    beta1: 5.3365,
    beta2: -9.5262,
    lambda: 0.0199,
    updatedAt: '2026-10-12T10:00:00+00:00',
  },
]

export const yieldPeriodsFixtures: YieldPeriodsMock[] = [
  {
    curveDate: '2026-10-12',
    threeMonth: 6.9,
    sixMonth: 6.39,
    nineMonth: 6.53,
    oneYear: 6.7,
    twoYear: 6.98,
    threeYear: 7.07,
    fourYear: 7.12,
    updatedAt: '2026-10-12T10:00:00+00:00',
  },
]
