/** Shared pieces of the chart preview (spec 060, US4), kept out of the component files for fast refresh. */

import { createContext } from 'react'

/** Opens a card's form; `label` is the card button's accessible name. */
export interface ChartEditing {
  onEdit: (id: number) => void
  label: (name: string) => string
}

export const ChartEditContext = createContext<ChartEditing | null>(null)

/** Left edge of a 1 px vertical line centred on `x`. */
export const lineLeft = (x: number) => Math.floor(x)
