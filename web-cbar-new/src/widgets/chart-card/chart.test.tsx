/**
 * Chart lazy loading (spec 049 US1). ECharts is mocked as in chart-card.test.tsx; the assertions are on
 * what the visitor sees: the skeleton holds the place until the chart nears the viewport, then the chart
 * replaces it, and it never goes back.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { azirSeries } from '@/features/stats/model/series'
import { azirFixture } from '@/shared/testing/fixtures/stats'
import { installIntersectionObserver } from '@/shared/testing/intersection-observer'
import { act, renderApp, waitFor } from '@/shared/testing/render'

import { Chart } from './chart'

vi.mock('echarts/core', () => ({
  use: () => undefined,
  init: () => ({ setOption: () => undefined, resize: () => undefined, dispose: () => undefined }),
}))
vi.mock('echarts/lib/renderer/installCanvasRenderer', () => ({ install: () => undefined }))
vi.mock('echarts/lib/chart/line', () => ({}))
vi.mock('echarts/lib/chart/bar', () => ({}))
vi.mock('echarts/lib/component/grid', () => ({}))
vi.mock('echarts/lib/component/tooltip', () => ({}))
vi.mock('echarts/lib/component/legend', () => ({}))

afterEach(() => vi.unstubAllGlobals())

const HEIGHT = 300

function renderChart() {
  const view = renderApp(<Chart data={azirSeries(azirFixture)} height={HEIGHT} label="AZIR" />)
  const box = view.container.querySelector<HTMLElement>('[data-slot=chart]')!
  const skeleton = () => box.querySelector('[data-slot=skeleton]')
  return { box, skeleton }
}

/** Lets the dynamic imports settle. */
const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)))

describe('Chart lazy loading', () => {
  it('keeps the skeleton at the final height while the chart is far from the viewport', async () => {
    installIntersectionObserver()
    const { box, skeleton } = renderChart()
    await flush()

    expect(skeleton()).toBeInTheDocument()
    expect(box).toHaveStyle({ height: `${HEIGHT}px` })
  })

  it('draws the chart once it nears the viewport and keeps it when scrolled away', async () => {
    const io = installIntersectionObserver()
    const { box, skeleton } = renderChart()

    act(() => io.enter(box))
    await waitFor(() => expect(skeleton()).toBeNull())

    act(() => io.leave(box))
    await flush()
    expect(skeleton()).toBeNull()
  })

  it('loads straight away without IntersectionObserver', async () => {
    const { skeleton } = renderChart()
    await waitFor(() => expect(skeleton()).toBeNull())
  })
})
