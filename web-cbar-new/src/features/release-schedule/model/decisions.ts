/**
 * The tiles of the decisions dialog (spec 039 FR-015b, FR-015c; Figma `1727:32140`). The API marks
 * the next decision from today in Baku; everything before it is past, everything after it future.
 */
import type { DecisionDate, ReleaseScheduleDecisions } from './schemas'

export type DecisionTileState = 'past' | 'next' | 'future'

export type DecisionTile = {
  date: string
  day: number
  month: number
  withPressConference: boolean
  state: DecisionTileState
}

function parts(date: string): { day: number; month: number } {
  const [, month, day] = date.split('-').map(Number)
  return { day: day!, month: month! }
}

function stateOf(date: string, next: DecisionDate | null): DecisionTileState {
  if (next === null || date < next.date) return 'past'
  return date === next.date ? 'next' : 'future'
}

export function decisionTiles(decisions: ReleaseScheduleDecisions): DecisionTile[] {
  return decisions.dates.map((d) => ({
    date: d.date,
    ...parts(d.date),
    withPressConference: d.withPressConference,
    state: stateOf(d.date, decisions.next),
  }))
}
