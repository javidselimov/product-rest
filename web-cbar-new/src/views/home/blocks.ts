/**
 * Which homepage blocks are shown, in one place (spec 022 FR-015, research R6).
 *
 * A `false` block is **hidden, not removed**: its component, data function and tests stay.
 * Bringing one back, for example as a tab of a main block, starts here and in `index.tsx`.
 * With `videosTab` off the loader sends no `/videos` request.
 */
export const HOME_BLOCKS = {
  publications: false,
  usefulLinks: false,
  quickLinks: false,
  videosTab: false,
  strategyDocs: true,
  calendar: true,
  announcementsTab: true,
} as const

export type HomeBlock = keyof typeof HOME_BLOCKS
