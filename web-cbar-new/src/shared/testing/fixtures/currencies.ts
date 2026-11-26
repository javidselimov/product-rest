import type { CurrencySheet } from '@/features/currencies/model/schemas'

export const TODAY = '2026-09-14'
/** 13-ü bazar günüdür — vərəq yoxdur (404); 12-si əvvəlki vərəqdir. */
export const PREVIOUS_DAY = '2026-09-12'

export const currencySheetToday: CurrencySheet = {
  date: TODAY,
  rates: [
    {
      code: 'USD',
      nominal: 1,
      name: '1 ABŞ dolları',
      rate: 1.7,
      showOnHomepage: true,
    },
    {
      code: 'EUR',
      nominal: 1,
      name: '1 Avro',
      rate: 1.985,
      showOnHomepage: true,
    },
    {
      code: 'RUB',
      nominal: 100,
      name: '100 Rusiya rublu',
      rate: 1.8123,
      showOnHomepage: true,
    },
    {
      code: 'TRY',
      nominal: 1,
      name: '1 Türk lirəsi',
      rate: 0.0412,
      showOnHomepage: true,
    },
    {
      code: 'GBP',
      nominal: 1,
      name: '1 İngilis funt sterlinqi',
      rate: 2.2901,
      showOnHomepage: false,
    },
  ],
}

export const currencySheetPrevious: CurrencySheet = {
  date: PREVIOUS_DAY,
  rates: [
    {
      code: 'USD',
      nominal: 1,
      name: '1 ABŞ dolları',
      rate: 1.7,
      showOnHomepage: true,
    },
    {
      code: 'EUR',
      nominal: 1,
      name: '1 Avro',
      rate: 1.99,
      showOnHomepage: true,
    },
    {
      code: 'RUB',
      nominal: 100,
      name: '100 Rusiya rublu',
      rate: 1.8,
      showOnHomepage: true,
    },
    {
      code: 'TRY',
      nominal: 1,
      name: '1 Türk lirəsi',
      rate: 0.0412,
      showOnHomepage: true,
    },
    {
      code: 'GBP',
      nominal: 1,
      name: '1 İngilis funt sterlinqi',
      rate: 2.28,
      showOnHomepage: false,
    },
  ],
}
