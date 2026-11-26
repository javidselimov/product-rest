/**
 * The panel's "Sxem" view (spec 060, US4) — a port of web-cbar-new `widgets/org-chart/org-chart-chart.tsx` over the
 * same layout code (`../chart`, a byte copy of the site's, `check:chart-layout`). Keep the two renders in step. The
 * chart sits on a light "paper" surface in both themes (FR-022) and scrolls inside itself when wider than the page.
 */

import { useMemo } from 'react'

import {
  CHART,
  COLUMN_STEP,
  DIRECTORS_SPACER,
  RAISE,
} from '../chart/constants'
import { buildChartLayout, type ChartLayout, type DeputyGroup, type DirectorsGroup, type OrgChartInput } from '../chart/model/layout'
import { ChartEditContext, lineLeft, type ChartEditing } from './chart-preview-context'
import { ColumnView, OrgCard, Seg, SideColumn } from './chart-preview-parts'

const LINE = 1
const HALF = '50%'

function GovernorRow({ layout }: Readonly<{ layout: ChartLayout }>) {
  const governor = layout.governor!
  const centers = layout.leftLink?.centers ?? []
  const leftmost = centers.length > 0 ? Math.min(...centers) : null
  const { departments } = governor
  return (
    <div className="flex items-stretch" style={{ paddingLeft: governor.left }}>
      <div className="relative flex flex-col" style={{ width: CHART.governorWidth }}>
        <div className="flex-1" />
        <OrgCard card={governor.card} style={{ minHeight: CHART.governorMinHeight }} />
        <div className="relative flex-1">
          {layout.bar ? <Seg style={{ left: lineLeft(CHART.governorWidth / 2), top: 0, bottom: 0, width: LINE }} /> : null}
        </div>
        {leftmost === null ? null : (
          <>
            <Seg style={{ left: lineLeft(leftmost) - governor.left, top: HALF, width: governor.left - lineLeft(leftmost), height: LINE }} />
            {centers.map((c) => (
              <Seg key={c} style={{ left: lineLeft(c) - governor.left, top: HALF, bottom: 0, width: LINE }} />
            ))}
          </>
        )}
        {departments.length > 0 ? (
          <Seg style={{ left: CHART.governorWidth, top: HALF, width: CHART.listOffset - CHART.combOffset, height: LINE }} />
        ) : null}
      </div>
      {departments.length > 0 ? (
        <ul className="flex flex-col self-center" style={{ marginLeft: CHART.listOffset, width: CHART.listWidth, gap: CHART.listGap }}>
          {departments.map((card, i) => (
            <li key={card.id} className="relative flex flex-col">
              <OrgCard card={card} wide />
              <Seg style={{ left: -CHART.combOffset, top: HALF, width: CHART.combOffset, height: LINE }} />
              <Seg
                style={{
                  left: -CHART.combOffset,
                  top: i === 0 ? HALF : -CHART.listGap,
                  bottom: i === departments.length - 1 ? HALF : 0,
                  width: LINE,
                }}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Governor row → deputies' bar: the drop from the governor, the "L" lines on to its own columns, the bar. */
function BarZone({ layout }: Readonly<{ layout: ChartLayout }>) {
  const governor = layout.governor!
  return (
    <div className="relative" style={{ height: CHART.barBelowRow }}>
      {layout.bar ? (
        <>
          <Seg style={{ left: lineLeft(governor.left + CHART.governorWidth / 2), top: 0, bottom: 0, width: LINE }} />
          <Seg style={{ left: lineLeft(layout.bar.from), top: '100%', width: layout.bar.to - layout.bar.from + LINE, height: LINE }} />
        </>
      ) : null}
      {(layout.leftLink?.centers ?? []).map((c) => (
        <Seg key={c} style={{ left: lineLeft(c), top: 0, bottom: 0, width: LINE }} />
      ))}
    </div>
  )
}

function Columns({ group, riser }: Readonly<{ group: DirectorsGroup | DeputyGroup; riser?: number }>) {
  const last = group.columns.length - 1
  return (
    <div className="flex items-start" style={{ paddingLeft: group.columnsLeft, gap: CHART.columnGap }}>
      {group.columns.map((column, i) => (
        <ColumnView
          key={column.head?.id ?? `c${i}`}
          column={column}
          riserLeft={riser !== undefined && i === last ? riser - (group.columnsLeft + i * COLUMN_STEP) : undefined}
        />
      ))}
    </div>
  )
}

function DirectorsGroupView({ group }: Readonly<{ group: DirectorsGroup }>) {
  return (
    <div className="flex flex-col" style={{ width: group.width }}>
      <div className="relative" style={{ height: DIRECTORS_SPACER }}>
        {group.columns.map((column, i) => (
          <Seg key={column.head?.id ?? `c${i}`} style={{ left: lineLeft(i * COLUMN_STEP + CHART.columnWidth / 2), top: 0, bottom: 0, width: LINE }} />
        ))}
      </div>
      <Columns group={group} />
    </div>
  )
}

function DeputyGroupView({ group }: Readonly<{ group: DeputyGroup }>) {
  const center = group.cardLeft + CHART.deputyWidth / 2
  const cardRight = group.cardLeft + CHART.deputyWidth
  const riser = group.sideLineX === null ? undefined : group.sideLineX - LINE
  const spacer = group.role === 'raised' ? CHART.raisedDeputyDrop : CHART.deputyDrop
  const zone = CHART.columnsBelowDeputy + (group.role === 'raised' ? RAISE : 0)
  const barTop = zone - CHART.columnBarAbove
  // A child deputy's drop starts on its parent's line: the parent stands RAISE higher, its line childLineTop below its top.
  const dropTop = group.role === 'child' ? CHART.deputyDrop - RAISE + CHART.childLineTop : 0
  return (
    <div className="flex flex-col" style={{ width: group.width }}>
      <div className="relative" style={{ height: spacer }}>
        <Seg style={{ left: lineLeft(center), top: dropTop, bottom: 0, width: LINE }} />
      </div>
      <div className="relative flex flex-col" style={{ marginLeft: group.cardLeft, width: CHART.deputyWidth }}>
        <OrgCard card={group.card} style={{ minHeight: CHART.deputyMinHeight }} />
        {group.childLineTo === null ? null : (
          <Seg style={{ left: CHART.deputyWidth, top: CHART.childLineTop, width: group.childLineTo - group.x - cardRight + LINE, height: LINE }} />
        )}
        {riser === undefined ? null : (
          <>
            <Seg style={{ left: CHART.deputyWidth, top: HALF, width: riser - cardRight, height: LINE }} />
            <Seg style={{ left: riser - group.cardLeft, top: HALF, bottom: 0, width: LINE }} />
          </>
        )}
      </div>
      <div className="relative" style={{ height: zone }}>
        {group.columnBar ? (
          <>
            <Seg style={{ left: lineLeft(center), top: 0, height: barTop, width: LINE }} />
            <Seg style={{ left: lineLeft(group.columnBar.from), top: barTop, width: group.columnBar.to - group.columnBar.from + LINE, height: LINE }} />
            {group.columns.map((column, i) => (
              <Seg
                key={column.head?.id ?? `c${i}`}
                style={{ left: lineLeft(group.columnsLeft + i * COLUMN_STEP + CHART.columnWidth / 2), top: barTop, bottom: 0, width: LINE }}
              />
            ))}
          </>
        ) : null}
        {riser === undefined ? null : <Seg style={{ left: riser, top: 0, bottom: 0, width: LINE }} />}
      </div>
      <div className="flex items-start">
        <Columns group={group} riser={group.sideJoinsOpenBlock ? riser : undefined} />
        {group.side.length > 0 ? (
          <div style={{ marginLeft: CHART.sideGap }}>
            <SideColumn cards={group.side} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface ChartPreviewProps extends ChartEditing {
  nodes: OrgChartInput[]
  /** Accessible name of the scrollable chart region. */
  regionLabel: string
}

export function ChartPreview({ nodes, regionLabel, onEdit, label }: Readonly<ChartPreviewProps>) {
  const layout = useMemo(() => buildChartLayout(nodes), [nodes])
  const editing = useMemo(() => ({ onEdit, label }), [onEdit, label])
  return (
    // A scrollable region must be focusable so the keyboard can scroll it (WCAG 2.1.1).
    <section
      aria-label={regionLabel}
      tabIndex={0}
      className="bg-org-surface text-org-text focus-visible:ring-ring overflow-x-auto rounded-md border p-6 [color-scheme:light] focus-visible:ring-2 focus-visible:outline-none"
    >
      <ChartEditContext value={editing}>
        <div className="mx-auto flex flex-col" style={{ width: layout.width }}>
          {layout.governor ? (
            <>
              <GovernorRow layout={layout} />
              <BarZone layout={layout} />
            </>
          ) : null}
          <div className="flex items-start" style={{ gap: CHART.groupGap }}>
            {layout.groups.map((group) =>
              group.type === 'directors' ? <DirectorsGroupView key="directors" group={group} /> : <DeputyGroupView key={group.card.id} group={group} />,
            )}
          </div>
          {layout.extraRoots.length > 0 ? (
            <div className="flex items-start" style={{ gap: CHART.columnGap, marginTop: CHART.columnsBelowDeputy }}>
              {layout.extraRoots.map((column, i) => (
                <ColumnView key={column.head?.id ?? `r${i}`} column={column} />
              ))}
            </div>
          ) : null}
        </div>
      </ChartEditContext>
    </section>
  )
}
