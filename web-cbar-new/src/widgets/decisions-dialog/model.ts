/**
 * Data of the monetary policy decisions dialog (spec 039). Built on the server, so the client
 * component receives finished strings and no locale logic. Kept out of the `'use client'` module so
 * loaders can import the type.
 */
import type { DecisionTileState } from '@/features/release-schedule/model/decisions'

export type DecisionsDialogTile = {
  key: string
  day: number
  month: string
  type: string
  state: DecisionTileState
  /** Spoken in full for screen readers: "4 fevral 2026, Press-reliz, keçib". */
  label: string
}

export type DecisionsDialogData = {
  title: string
  subtitle: string
  next: { label: string; date: string; type: string } | null
  tiles: DecisionsDialogTile[]
  empty: string
  allLabel: string
  /** The events list filtered to decisions; also where the trigger leads without JavaScript. */
  allHref: string
}

/** Figma `1727:32140` / `1727:32788`; sizes in `contracts/ui-contract.md` §Modal. */
export const DIALOG_CLASS = [
  'flex flex-col gap-4 overflow-y-auto rounded-none rounded-t-[8px] border-0 px-6 pt-3 pb-8 shadow-[0_8px_32px_rgb(0_0_0/0.16)]',
  'top-auto bottom-0 left-0 w-full max-w-full max-h-[calc(100dvh-3.5rem)] translate-x-0 translate-y-0 sm:max-w-full',
  'tab:top-1/2 tab:bottom-auto tab:left-1/2 tab:-translate-x-1/2 tab:-translate-y-1/2 tab:rounded-[8px]',
  'tab:w-140 tab:max-w-[calc(100%-2.5rem)] tab:max-h-[calc(100dvh-2.5rem)] tab:gap-5 tab:px-6 tab:py-7',
  '[&_[data-slot=dialog-close]]:top-7 [&_[data-slot=dialog-close]]:right-6 [&_[data-slot=dialog-close]]:opacity-100',
  'max-tab:[&_[data-slot=dialog-close]]:top-8 [&_[data-slot=dialog-close]_svg]:size-6!',
].join(' ')

export const TILE_STATE_CLASS: Record<DecisionTileState, string> = {
  past: 'bg-site-surface-muted text-site-text-strong',
  next: 'bg-site-schedule-head text-primary-foreground',
  future: 'border border-site-schedule-border bg-background text-site-text-strong',
}
