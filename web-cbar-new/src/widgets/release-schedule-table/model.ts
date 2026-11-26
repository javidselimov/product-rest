/**
 * Class names of the schedule table (spec 039, `contracts/ui-contract.md` §Cədvəl, §Mobil kartlar).
 * Figma: desktop `1713:29919`, tablet `1718:30415`, mobile `1718:30740`.
 */

export const FRAME_CLASS = 'border-site-schedule-border overflow-hidden rounded-xs border'

/** Desktop 440 / 260 / rest (282), tablet 300 / 160 / rest (202). The tablet header is 14/18 (Figma `1718:30416`). */
export const COLUMN_CLASS = {
  content: 'tab:w-75 desk:w-110',
  periodicity: 'tab:w-40 desk:w-65',
} as const

export const HEAD_CELL_CLASS =
  'bg-site-schedule-head text-primary-foreground px-5 py-3.5 text-left align-top text-sm leading-[18px] font-semibold desk:text-base desk:leading-7'
export const GROUP_CELL_CLASS =
  'bg-site-surface-muted border-site-schedule-border text-site-text-strong border-b px-5 py-4 text-left text-base leading-7 font-semibold'
export const CELL_CLASS = 'border-site-schedule-border text-site-text-strong border-b px-5 py-4 align-top text-base leading-7'

export const LINK_CLASS = 'text-site-text-strong hover:text-primary leading-6 underline underline-offset-2'
