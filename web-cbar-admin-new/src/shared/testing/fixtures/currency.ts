/** Məzənnə mock-ları üçün seed: 8 ISO valyuta və 3 tarixli vərəq. */

export interface CurrencyMasterMock {
  code: string
  nominal: number
  sortOrder: number
  isActive: boolean
  showOnHomepage: boolean
  nameAz: string | null
  nameEn: string | null
}

export interface RateSheetMock {
  date: string
  /** kod → məzənnə */
  rates: Record<string, number>
}

export const currencyMasterFixtures: CurrencyMasterMock[] = [
  {
    code: 'USD',
    nominal: 1,
    sortOrder: 1,
    isActive: true,
    showOnHomepage: true,
    nameAz: 'ABŞ dolları',
    nameEn: 'US dollar',
  },
  {
    code: 'EUR',
    nominal: 1,
    sortOrder: 2,
    isActive: true,
    showOnHomepage: true,
    nameAz: 'Avro',
    nameEn: 'Euro',
  },
  {
    code: 'GBP',
    nominal: 1,
    sortOrder: 3,
    isActive: true,
    showOnHomepage: false,
    nameAz: 'İngilis funt sterlinqi',
    nameEn: 'British pound',
  },
  {
    code: 'RUB',
    nominal: 100,
    sortOrder: 4,
    isActive: true,
    showOnHomepage: true,
    nameAz: 'Rusiya rublu',
    nameEn: 'Russian ruble',
  },
  {
    code: 'TRY',
    nominal: 1,
    sortOrder: 5,
    isActive: true,
    showOnHomepage: false,
    nameAz: 'Türk lirəsi',
    nameEn: 'Turkish lira',
  },
  {
    code: 'CHF',
    nominal: 1,
    sortOrder: 6,
    isActive: true,
    showOnHomepage: false,
    nameAz: 'İsveçrə frankı',
    nameEn: 'Swiss franc',
  },
  {
    code: 'JPY',
    nominal: 100,
    sortOrder: 7,
    isActive: false,
    showOnHomepage: false,
    nameAz: 'Yapon yeni',
    nameEn: 'Japanese yen',
  },
  {
    code: 'CNY',
    nominal: 1,
    sortOrder: 8,
    isActive: true,
    showOnHomepage: false,
    nameAz: 'Çin yuanı',
    nameEn: 'Chinese yuan',
  },
]

/** Yeni → köhnə; ilk element son vərəqdir. */
export const rateSheetFixtures: RateSheetMock[] = [
  {
    date: '2026-01-15',
    rates: { USD: 1.7, EUR: 1.9425, RUB: 2.1234, TRY: 0.0512 },
  },
  { date: '2026-01-14', rates: { USD: 1.7, EUR: 1.9388, RUB: 2.1102 } },
  { date: '2026-01-13', rates: { USD: 1.7, EUR: 1.9401 } },
]
