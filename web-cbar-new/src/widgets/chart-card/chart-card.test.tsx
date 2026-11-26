/**
 * ECharts ağır və canvas-a bağlı dependency-dir — jsdom-da mock-lanır (Maddə VI.2:
 * mock davranışı assert edilmir; iddialar kartın vəziyyətləri üzərindədir).
 */
import { describe, expect, it, vi } from 'vitest'

import { azirSeries } from '@/features/stats/model/series'
import { azirFixture } from '@/shared/testing/fixtures/stats'
import { renderApp, screen } from '@/shared/testing/render'

import { buildOption } from './chart'
import { ChartCard } from './chart-card'

vi.mock('echarts/core', () => ({
  use: () => undefined,
  init: () => ({ setOption: () => undefined, resize: () => undefined, dispose: () => undefined }),
}))
// Leaf modullar yan təsirlidir (özləri qeydiyyatdan keçir) — boş mock kifayətdir;
// renderer istisnadır, chart.tsx onun install-ını açıq çağırır (spec 003 FR-014).
vi.mock('echarts/lib/renderer/installCanvasRenderer', () => ({ install: () => undefined }))
vi.mock('echarts/lib/chart/line', () => ({}))
vi.mock('echarts/lib/chart/bar', () => ({}))
vi.mock('echarts/lib/component/grid', () => ({}))
vi.mock('echarts/lib/component/tooltip', () => ({}))
vi.mock('echarts/lib/component/legend', () => ({}))

describe('ChartCard', () => {
  it('məlumat olanda qrafik konteynerini render edir', async () => {
    renderApp(<ChartCard title="AZIR" data={azirSeries(azirFixture)} emptyLabel="Məlumat yoxdur" />)

    expect(screen.getByText('AZIR')).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: 'AZIR' })).toBeInTheDocument()
  })

  it('boş məlumatda boş vəziyyət göstərir', () => {
    renderApp(<ChartCard title="AZIR" data={{ categories: [], series: [] }} emptyLabel="Məlumat yoxdur" />)

    expect(screen.getByText('Məlumat yoxdur')).toBeInTheDocument()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('xəta halında ErrorState göstərir', () => {
    renderApp(<ChartCard title="AZIR" data={null} error emptyLabel="Məlumat yoxdur" />, { locale: 'az' })

    expect(screen.getByText('Serverdə xəta baş verdi. Bir azdan yenidən cəhd edin')).toBeInTheDocument()
  })
})

describe('buildOption', () => {
  const palette = { series: ['c1', 'c2'], foreground: 'fg', muted: 'm', border: 'b' }

  it('token rənglərini və vahidi tətbiq edir', () => {
    const option = buildOption(azirSeries(azirFixture), palette) as {
      color: string[]
      yAxis: { axisLabel: { formatter: string } }
      legend?: unknown
      series: { type: string }[]
    }

    expect(option.color).toEqual(['c1', 'c2'])
    expect(option.yAxis.axisLabel.formatter).toBe('{value}%')
    expect(option.legend).toBeDefined()
    expect(option.series[0].type).toBe('line')
  })

  it('tək seriyada legend yoxdur, sütunda boundaryGap var', () => {
    const option = buildOption(
      { categories: ['a'], series: [{ name: 'x', kind: 'bar', data: [1] }], legend: true },
      palette,
    ) as { legend?: unknown; xAxis: { boundaryGap: boolean } }

    expect(option.legend).toBeUndefined()
    expect(option.xAxis.boundaryGap).toBe(true)
  })
})
