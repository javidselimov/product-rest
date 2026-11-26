/**
 * Tarix kartının sağındakı dekorativ halqalar — `tarix.html` prototipi (`.vis`), 360×360.
 * Yalnız desktop-da (ui-contract §1), ekran oxuyucusundan və çapdan gizli.
 */
import { HISTORY_RINGS, HISTORY_RINGS_CENTER_R, HISTORY_RINGS_SIZE } from './constants'

const CENTER = HISTORY_RINGS_SIZE / 2

export function HistoryRings() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-print="hide"
      viewBox={`0 0 ${HISTORY_RINGS_SIZE} ${HISTORY_RINGS_SIZE}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="text-site-history-accent hidden size-90 shrink-0 self-start desk:ml-auto desk:block"
    >
      {HISTORY_RINGS.map(({ r, opacity }) => (
        <circle key={r} cx={CENTER} cy={CENTER} r={r} strokeOpacity={opacity} />
      ))}
      <circle cx={CENTER} cy={CENTER} r={HISTORY_RINGS_CENTER_R} fill="currentColor" stroke="none" />
    </svg>
  )
}
