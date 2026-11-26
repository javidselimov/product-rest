'use client'

/**
 * ECharts wrapper (spec 002 D1, research R8; spec 049 US1).
 *
 * ECharts loads only in the browser and only when the chart comes within one screen of the viewport
 * (`LAZY_ROOT_MARGIN`), so a chart further down the page costs nothing on open. Until then the
 * fixed-height skeleton holds its place, so nothing shifts. Colours are read on mount from the kit's
 * CSS tokens (`--chart-1..5`, `--foreground`, `--border`) and re-applied when `html.class` (the theme)
 * changes. The server passes only serializable `ChartData`.
 */
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { useEffect, useRef, useState } from 'react'

import type { ChartData } from '@/features/stats/model/series'
import { LAZY_ROOT_MARGIN } from '@/shared/constants/motion'
import { useInView } from '@/shared/lib/use-in-view'

import { AREA_OPACITY, AXIS_FONT_SIZE, BAR_MAX_WIDTH, CHART_GRID, CHART_HEIGHT, SYMBOL_SIZE } from './constants'

type EChartsLike = {
  setOption: (option: Record<string, unknown>, opts?: { notMerge?: boolean }) => void
  resize: () => void
  dispose: () => void
}

type Palette = {
  series: string[]
  foreground: string
  muted: string
  border: string
}

const TOKEN_FALLBACK = 'currentColor'

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement)
  const read = (name: string, fallback = TOKEN_FALLBACK) => style.getPropertyValue(name).trim() || fallback
  return {
    series: ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'].map((n) => read(n)),
    foreground: read('--foreground'),
    muted: read('--muted-foreground'),
    border: read('--border'),
  }
}

/** ECharts option from serializable series. */
export function buildOption(data: ChartData, palette: Palette): Record<string, unknown> {
  const unit = data.unit ?? ''
  const showLegend = data.legend && data.series.length > 1

  return {
    color: palette.series,
    textStyle: { color: palette.foreground },
    tooltip: { trigger: 'axis', valueFormatter: (v: unknown) => `${v}${unit}` },
    legend: showLegend ? { bottom: 0, textStyle: { color: palette.muted } } : undefined,
    grid: { left: CHART_GRID.left, right: CHART_GRID.right, top: CHART_GRID.top, bottom: showLegend ? CHART_GRID.bottomWithLegend : CHART_GRID.bottom },
    xAxis: {
      type: 'category',
      data: data.categories,
      boundaryGap: data.series.some((s) => s.kind === 'bar'),
      axisLine: { lineStyle: { color: palette.border } },
      axisLabel: {
        color: palette.muted,
        fontSize: AXIS_FONT_SIZE,
        // 'auto' measures label width and thins labels at an even step, so they do not overlap in a
        // narrow (mobile) container; on a wide screen all 12 months show.
        hideOverlap: true,
        interval: 'auto',
      },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { color: palette.muted, fontSize: AXIS_FONT_SIZE, formatter: `{value}${unit}` },
      splitLine: { lineStyle: { color: palette.border } },
    },
    series: data.series.map((s) => ({
      name: s.name,
      type: s.kind,
      data: s.data,
      connectNulls: true,
      smooth: s.smooth ?? false,
      symbol: s.symbols ? 'circle' : 'none',
      symbolSize: SYMBOL_SIZE,
      barMaxWidth: BAR_MAX_WIDTH,
      ...(s.area ? { areaStyle: { opacity: AREA_OPACITY } } : {}),
    })),
  }
}

type ChartProps = Readonly<{
  data: ChartData
  height?: number
  /** Accessible name for the skeleton and the chart container. */
  label: string
}>

export function Chart({ data, height = CHART_HEIGHT, label }: ChartProps) {
  // The outer box is always laid out at its final height, so it is the element watched for the viewport.
  const boxRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<EChartsLike | null>(null)
  const [ready, setReady] = useState(false)
  const inView = useInView(boxRef, { rootMargin: LAZY_ROOT_MARGIN, once: true })

  useEffect(() => {
    if (!inView) return
    let disposed = false
    let observer: ResizeObserver | undefined

    void (async () => {
      // No barrels (`echarts/charts`, `echarts/components`): a dynamic namespace import is not
      // tree-shaken, so every chart type — map, dataZoom, toolbox — ended up in the bundle
      // (~1.1 MB raw, spec 003 FR-014).
      //
      // Chart and component leaf modules call `use(install)` at their end, so the import itself
      // registers them and the returned namespace is unused. The renderer is the exception:
      // `installCanvasRenderer` only exports `install` and does not register itself, hence the
      // explicit `core.use(...)` below.
      const [core, canvasRenderer] = await Promise.all([
        import('echarts/core'),
        import('echarts/lib/renderer/installCanvasRenderer'),
        import('echarts/lib/chart/line'),
        import('echarts/lib/chart/bar'),
        import('echarts/lib/component/grid'),
        import('echarts/lib/component/tooltip'),
        import('echarts/lib/component/legend'),
      ])
      if (disposed || !containerRef.current) return

      core.use(canvasRenderer.install)
      chartRef.current = core.init(containerRef.current) as unknown as EChartsLike
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => chartRef.current?.resize())
        observer.observe(containerRef.current)
      }
      setReady(true)
    })()

    return () => {
      disposed = true
      observer?.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [inView])

  useEffect(() => {
    if (!ready) return

    const apply = () => chartRef.current?.setOption(buildOption(data, readPalette()), { notMerge: true })
    apply()

    // On a theme change (`html.dark`) the colours are read from the tokens again.
    const themeObserver = new MutationObserver(apply)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => themeObserver.disconnect()
  }, [ready, data])

  return (
    <div ref={boxRef} data-slot="chart" className="relative w-full" style={{ height }}>
      {!ready ? <Skeleton className="absolute inset-0" aria-label={label} /> : null}
      <div ref={containerRef} role="img" aria-label={label} className="h-full w-full" />
    </div>
  )
}
