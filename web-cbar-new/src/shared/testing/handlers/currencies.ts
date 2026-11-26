import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import {
  PREVIOUS_DAY,
  TODAY,
  currencySheetPrevious,
  currencySheetToday,
} from '../fixtures/currencies'

export const currenciesHandlers = [
  http.get(`${API}/api/v1/currencies`, ({ request }) => {
    const date = new URL(request.url).searchParams.get('date')
    if (!date || date === TODAY) return HttpResponse.json(currencySheetToday)
    if (date === PREVIOUS_DAY) return HttpResponse.json(currencySheetPrevious)
    return new HttpResponse(null, { status: 404 })
  }),
]
