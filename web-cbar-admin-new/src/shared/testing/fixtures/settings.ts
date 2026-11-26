export interface SettingMockItem {
  key: string
  value: unknown
  updatedAt: string
}

/** Seed-ə bənzər parametrlər: obyekt, boolean və mətn dəyərləri. */
export const settingFixtures: SettingMockItem[] = [
  {
    key: 'site.contact',
    value: { phone: '+994 12 493 11 22', email: 'info@cbar.az' },
    updatedAt: '2026-02-10T09:15:00+00:00',
  },
  {
    key: 'homepage.showBanner',
    value: true,
    updatedAt: '2026-01-20T12:00:00+00:00',
  },
  {
    key: 'rates.footnote',
    value: 'Məzənnələr növbəti iş gününə qədər qüvvədədir.',
    updatedAt: '2026-02-01T08:00:00+00:00',
  },
]

/**
 * Müyəssərlik menyusu ayarının variantları (spec 007). Defolt siyahıya daxil deyil —
 * açar yoxdursa menyu deaktivdir; test lazım olanı `settingsStore.upsert` ilə qoyur.
 */
export const accessibilityWidgetFixtures = {
  enabled: {
    key: 'accessibility.widget',
    value: { enabled: true },
    updatedAt: '2026-09-20T10:00:00+00:00',
  },
  disabled: {
    key: 'accessibility.widget',
    value: { enabled: false },
    updatedAt: '2026-09-20T10:00:00+00:00',
  },
  malformed: {
    key: 'accessibility.widget',
    value: { enabled: 'yes' },
    updatedAt: '2026-09-20T10:00:00+00:00',
  },
} satisfies Record<string, SettingMockItem>
