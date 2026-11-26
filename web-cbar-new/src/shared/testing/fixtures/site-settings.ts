import type { AccessibilityWidgetSetting } from '@/features/accessibility-widget/model/schemas'

/** Defolt cavab: menyu aktivdir (spec 007 contracts/public-api.md). */
export const accessibilityWidgetEnabled: AccessibilityWidgetSetting = { enabled: true }

export const accessibilityWidgetDisabled: AccessibilityWidgetSetting = { enabled: false }
