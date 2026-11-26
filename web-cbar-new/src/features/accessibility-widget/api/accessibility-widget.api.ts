/**
 * Müyəssərlik menyusunun aktivliyi — spec 007 contracts/public-api.md. 10 s keşlənir:
 * admində dəyişiklik saytda ən gec 1 dəqiqəyə görünür (SC-001).
 */
import 'server-only'

import { cachedJson } from '@/server/cached'

import {
  accessibilityWidgetSettingSchema,
  type AccessibilityWidgetSetting,
} from '../model/schemas'

const fetchSetting = cachedJson(accessibilityWidgetSettingSchema, {
  keyPrefix: 'accessibility-widget',
  tag: 'settings',
})

/** Xəta (şəbəkə, 404, sxem) → deaktiv: ayar oxunmasa səhifə sınmır (FR-010, research R5). */
export function getAccessibilityWidgetSetting(): Promise<AccessibilityWidgetSetting> {
  return fetchSetting('/api/v1/site-settings/accessibility-widget').catch(() => ({
    enabled: false,
  }))
}
