/**
 * Müyəssərlik menyusu ayarı (spec 007, contracts/admin-setting.md): ümumi
 * parametrlər cədvəlindəki `accessibility.widget` açarı, dəyəri `{ enabled }`.
 * Açar yoxdursa və ya forma səhvdirsə menyu deaktiv sayılır — public API ilə eyni qayda.
 */

import { z } from 'zod'

import type { SettingItem } from './schemas'

export const ACCESSIBILITY_WIDGET_KEY = 'accessibility.widget'

export const accessibilityWidgetValueSchema = z.object({
  enabled: z.boolean(),
})

export const findAccessibilityWidgetSetting = (
  items: SettingItem[],
): SettingItem | undefined =>
  items.find((item) => item.key === ACCESSIBILITY_WIDGET_KEY)

export function readAccessibilityWidgetEnabled(items: SettingItem[]): boolean {
  const parsed = accessibilityWidgetValueSchema.safeParse(
    findAccessibilityWidgetSetting(items)?.value,
  )
  return parsed.success && parsed.data.enabled
}
