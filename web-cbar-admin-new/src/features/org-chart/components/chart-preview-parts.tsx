/**
 * Building blocks of the panel's chart preview (spec 060, US4) — a port of web-cbar-new
 * `widgets/org-chart/chart-parts.tsx`. Keep the two in step: same classes, same structure, so the preview looks
 * like the site. The differences: a card is a button that opens its form (no links), colours are the panel's
 * `org-*` tokens (the site's `site-org-*` values, `index.css`), and the edit handler comes from context.
 *
 * Lines are 1 px `Seg`s placed inside the element they leave or pass, so they move with it when a dropdown opens or
 * a name wraps. Figma strokes are INSIDE, so a bordered card (director, department) takes 1 px off its padding.
 */

import { CaretDownIcon } from '@cbar/lib-react-ui-kit/icons'
import { use, type CSSProperties, type ReactNode } from 'react'

import { CHART, ORG_CHART_KIND } from '../chart/constants'
import type { ChartBlock, ChartCard, ChartColumn, ColumnItem } from '../chart/model/layout'
import { ChartEditContext, lineLeft } from './chart-preview-context'

const { governor, deputy, director, block, group } = ORG_CHART_KIND

const FOCUS = 'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
const CARD_STATE = `cursor-pointer transition-shadow hover:ring-2 hover:ring-org-line ${FOCUS}`

/** A line segment; numbers are px from the positioned parent. */
export function Seg({ style }: Readonly<{ style: CSSProperties }>) {
  return <span aria-hidden="true" className="bg-org-line pointer-events-none absolute" style={style} />
}

const LINE = 1
const HALF = '50%'

const KIND_CLASS: Record<number, string> = {
  [governor]: 'bg-org-governor text-white p-4 gap-3.5 items-center text-center',
  [deputy]: 'bg-org-deputy text-white p-2 gap-2.5 items-center text-center',
  [director]: 'bg-org-director border border-org-director-border text-org-text p-[3px] gap-2 items-center text-center',
  [block]: 'bg-org-block text-white p-1 tracking-[-0.04em] items-center text-center',
  [group]: 'bg-org-block text-white p-1 tracking-[-0.04em] items-center text-center',
}
const DEPARTMENT_CLASS = 'border border-org-block/50 text-org-text p-[3px]'

const NAME_CLASS: Record<number, string> = {
  [governor]: 'text-sm leading-[1.3] font-bold',
  [deputy]: 'text-xs leading-[1.3] font-bold',
  [director]: 'text-[10px] leading-[1.3] font-bold',
}
const ROLE_CLASS: Record<number, string> = {
  [governor]: 'text-xs leading-[1.4] font-medium',
  [deputy]: 'text-[10px] leading-[1.4] font-medium',
  [director]: 'text-[9px] leading-[13px] font-medium',
}
const SMALL_TEXT = 'text-[9px] leading-[13px] font-medium'

const label = (card: ChartCard) => `${card.name}${card.curatorDirect ? ' *' : ''}`

function CardText({ card }: Readonly<{ card: ChartCard }>) {
  if (card.kind <= director)
    return (
      <>
        <span className={NAME_CLASS[card.kind]}>{label(card)}</span>
        {card.role ? <span className={ROLE_CLASS[card.kind]}>{card.role}</span> : null}
      </>
    )
  return <span className={SMALL_TEXT}>{label(card)}</span>
}

function cardClass(card: ChartCard, wide: boolean): string {
  const base = KIND_CLASS[card.kind]
  if (base) return `flex flex-col ${base}`
  const curator = card.curatorDirect ? 'bg-org-block/20' : ''
  return `flex flex-col ${DEPARTMENT_CLASS} ${curator} ${wide ? 'justify-center text-left' : 'items-center text-center'}`
}

/** A card: a button that opens the node's form. */
export function OrgCard({ card, style, wide = false }: Readonly<{ card: ChartCard; style?: CSSProperties; wide?: boolean }>) {
  const editing = use(ChartEditContext)
  return (
    <button
      type="button"
      className={`${cardClass(card, wide)} ${CARD_STATE}`}
      style={style}
      aria-label={editing?.label(card.name)}
      onClick={() => editing?.onEdit(card.id)}
    >
      <CardText card={card} />
    </button>
  )
}

const COLUMN_CARD: CSSProperties = { width: CHART.columnWidth }

/** A vertical list of department cards; `riserLeft` draws the deputy's side line on their right (L7). */
function DepartmentList({ cards, gap, riserLeft }: Readonly<{ cards: ChartCard[]; gap: number; riserLeft?: number }>) {
  return (
    // shrink-0: an always-open block's row (its departments + the side departments) is wider than its 68 px column.
    <ul className="flex shrink-0 flex-col" style={{ gap, width: CHART.columnWidth }}>
      {cards.map((card, i) => (
        <li key={card.id} className="relative flex flex-col">
          <OrgCard card={card} />
          {riserLeft === undefined ? null : (
            <>
              <Seg style={{ left: CHART.columnWidth, top: HALF, width: riserLeft - CHART.columnWidth, height: LINE }} />
              <Seg style={{ left: riserLeft, top: 0, width: LINE, ...(i === cards.length - 1 ? { height: HALF } : { bottom: -gap }) }} />
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

/** Riser of the side line, relative to the side column: 7 px right of its 68 px cards. */
const SIDE_RISER = CHART.columnWidth + CHART.sideLineOffset - LINE

/** L9 dropdown (native `<details>`, toggles like on the site), L10 always open, or a plain block. */
export function BlockView({ value, riserLeft }: Readonly<{ value: ChartBlock; riserLeft?: number }>) {
  const { card, mode, departments, side } = value
  if (mode === 'dropdown')
    return (
      <details className="group flex flex-col" style={COLUMN_CARD}>
        <summary className={`${cardClass(card, false)} relative list-none pb-5 [&::-webkit-details-marker]:hidden ${CARD_STATE}`}>
          <CardText card={card} />
          <CaretDownIcon aria-hidden="true" className="absolute right-1 bottom-1 size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div style={{ marginTop: CHART.dropdownGap }}>
          <DepartmentList cards={departments} gap={CHART.dropdownItemGap} />
        </div>
      </details>
    )
  if (mode === 'open') {
    const joined = side.length > 0
    return (
      <div className="flex flex-col" style={{ gap: CHART.openRowGap }}>
        <div className="relative flex flex-col" style={COLUMN_CARD}>
          <OrgCard card={card} style={{ minHeight: CHART.openBlockMinHeight }} />
          {joined && riserLeft !== undefined ? <Seg style={{ left: riserLeft, top: 0, bottom: -CHART.openRowGap, width: LINE }} /> : null}
        </div>
        <div className="flex items-start" style={{ gap: CHART.sideGap }}>
          <DepartmentList cards={departments} gap={CHART.openListGap} />
          {joined ? <DepartmentList cards={side} gap={CHART.openListGap} riserLeft={SIDE_RISER} /> : null}
        </div>
      </div>
    )
  }
  return <OrgCard card={card} style={COLUMN_CARD} />
}

/** The deputy's side departments as a column of their own (L7, no always-open block to join). */
export function SideColumn({ cards }: Readonly<{ cards: ChartCard[] }>) {
  return <DepartmentList cards={cards} gap={CHART.openListGap} riserLeft={SIDE_RISER} />
}

type Row = { key: number | string; node: ReactNode }

function rowsOf(items: readonly ColumnItem[], riserLeft: number | undefined, last: boolean): Row[] {
  return items.flatMap((item, i) => {
    const isLast = last && i === items.length - 1
    if (item.type === 'block')
      return [{ key: item.block.card.id, node: <BlockView value={item.block} riserLeft={isLast ? riserLeft : undefined} /> }]
    return [{ key: item.card.id, node: <OrgCard card={item.card} style={COLUMN_CARD} /> }, ...rowsOf(item.children, riserLeft, isLast)]
  })
}

/**
 * A 68 px column (L6, L8): a director general and the blocks under them, or a block of its own under a spacer.
 * `riserLeft` (px from the column's left edge) carries the deputy's side line down to the always-open block whose
 * row the side departments join.
 */
export function ColumnView({ column, riserLeft }: Readonly<{ column: ChartColumn; riserLeft?: number }>) {
  const rows: Row[] = [
    column.head
      ? { key: 'head', node: <OrgCard card={column.head} style={{ ...COLUMN_CARD, minHeight: CHART.directorMinHeight }} /> }
      : {
          key: 'spacer',
          node: (
            <div style={{ height: CHART.directorMinHeight }}>
              <Seg style={{ left: lineLeft(CHART.columnWidth / 2), top: 0, bottom: -CHART.columnItemGap, width: LINE }} />
            </div>
          ),
        },
    ...rowsOf(column.items, riserLeft, true),
  ]
  return (
    <div className="flex flex-col" style={{ width: CHART.columnWidth, gap: CHART.columnItemGap }}>
      {rows.map((row, i) => (
        <div key={row.key} className="relative flex flex-col">
          {row.node}
          {riserLeft !== undefined && i < rows.length - 1 ? (
            <Seg style={{ left: riserLeft, top: 0, bottom: -CHART.columnItemGap, width: LINE }} />
          ) : null}
        </div>
      ))}
    </div>
  )
}
