/** Layout classes shared by `SectionShell` and its skeleton, so the two cannot drift apart (spec 036). */
export const SHELL_CLASS = '-mt-4 px-2 pb-14 tab:-mt-2 tab:px-6 desk:-mt-8 desk:px-0 desk:pb-22'
export const SHELL_BODY_CLASS =
  'mt-8 flex flex-col gap-8 tab:mt-6 desk:mt-0 desk:grid desk:grid-cols-[312px_minmax(0,984px)] desk:items-start desk:gap-6'
/**
 * The publications section's Figma (spec 054 ui-contract §1) on top of `SHELL_BODY_CLASS`: 40 from the menu to the title on tablet
 * (32 on mobile and the 24 desktop gap stay).
 */
export const PUBLICATIONS_BODY_CLASS = 'tab:gap-10 desk:gap-6'
export const PAGE_TOOLS_CLASS = 'flex flex-col items-start gap-3 tab:gap-2.5 desk:h-25 desk:flex-row desk:items-center desk:justify-between'
