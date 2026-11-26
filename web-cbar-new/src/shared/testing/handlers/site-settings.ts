import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { accessibilityWidgetEnabled } from '../fixtures/site-settings'

export const siteSettingsHandlers = [
  http.get(`${API}/api/v1/site-settings/accessibility-widget`, () =>
    HttpResponse.json(accessibilityWidgetEnabled),
  ),
]
