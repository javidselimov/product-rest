/**
 * Müyəssərlik menyusu ayarı — spec 007 contracts/public-api.md.
 */
import { z } from 'zod'

export const accessibilityWidgetSettingSchema = z.object({ enabled: z.boolean() })

export type AccessibilityWidgetSetting = z.infer<typeof accessibilityWidgetSettingSchema>
