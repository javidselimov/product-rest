import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { accessibilityWidgetDisabled } from '@/shared/testing/fixtures/site-settings'
import { server } from '@/shared/testing/server'

import { getAccessibilityWidgetSetting } from './accessibility-widget.api'

const ENDPOINT = `${API}/api/v1/site-settings/accessibility-widget`

describe('accessibility widget api', () => {
  it('aktiv ayarı qaytarır', async () => {
    await expect(getAccessibilityWidgetSetting()).resolves.toEqual({ enabled: true })
  })

  it('deaktiv ayarı qaytarır', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json(accessibilityWidgetDisabled)))

    await expect(getAccessibilityWidgetSetting()).resolves.toEqual({ enabled: false })
  })

  // Menyu köməkçi funksiyadır: ayar oxunmasa səhifə sınmır, menyu sadəcə görünmür (FR-010).
  it.each([500, 404])('%i → deaktiv, xəta atılmır', async (status) => {
    server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status })))

    await expect(getAccessibilityWidgetSetting()).resolves.toEqual({ enabled: false })
  })

  it('kontrakta uymayan cavab → deaktiv', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json({ enabled: 'yes' })))

    await expect(getAccessibilityWidgetSetting()).resolves.toEqual({ enabled: false })
  })
})
