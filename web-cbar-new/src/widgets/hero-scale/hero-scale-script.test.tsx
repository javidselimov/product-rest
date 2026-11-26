import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'

import { afterEach, describe, expect, it } from 'vitest'

import { renderApp } from '@/shared/testing/render'

import { HERO_SCALE_SRC, HeroScaleScript } from './hero-scale-script'

const created: HTMLElement[] = []
const SOURCE = readFileSync(join(process.cwd(), 'public', HERO_SCALE_SRC), 'utf8')

/** `public/scripts/hero-scale.js`-i verilmiş ekran və header hündürlüyü ilə icra edir. */
function runScript({ width, height, header }: { width: number; height: number; header: number }) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
  const el = document.createElement('header')
  el.dataset.slot = 'site-header'
  el.getBoundingClientRect = () => ({ height: header }) as DOMRect
  document.body.append(el)
  created.push(el)
  runInNewContext(SOURCE, { window, document })
  return Number(document.documentElement.style.getPropertyValue('--hero-scale'))
}

afterEach(() => {
  created.splice(0).forEach((el) => el.remove())
  document.documentElement.style.removeProperty('--hero-scale')
})

describe('HeroScaleScript', () => {
  it('sinxron, nonce-lu teq render edir — hero-dan əvvəl icra olunmalıdır', () => {
    const { container } = renderApp(<HeroScaleScript nonce="n0nce" />, { locale: 'az' })
    const script = container.querySelector<HTMLScriptElement>(`script[src="${HERO_SCALE_SRC}"]`)

    expect(script).not.toBeNull()
    expect(script).toHaveAttribute('nonce', 'n0nce')
    expect(script).not.toHaveAttribute('defer')
    expect(script).not.toHaveAttribute('async')
  })
})

describe('hero-scale.js', () => {
  it('Figma hündürlüyündə (188 + 744) miqyas 1-dir', () => {
    expect(runScript({ width: 1728, height: 932, header: 188 })).toBe(1)
  })

  it('zoom out — ekran hündürləşəndə mütənasib böyüyür', () => {
    expect(runScript({ width: 2865, height: 1418, header: 188 })).toBeCloseTo(1230 / 744, 3)
  })

  it('zoom in — ekran alçalanda mütənasib kiçilir, 0.5-dən aşağı düşmür', () => {
    expect(runScript({ width: 1536, height: 760, header: 188 })).toBeCloseTo(572 / 744, 3)
    expect(runScript({ width: 1360, height: 400, header: 188 })).toBe(0.5)
  })

  it('dar/hündür ekranda panel enin 40%-indən çox olmur', () => {
    expect(runScript({ width: 1360, height: 2000, header: 188 })).toBeCloseTo((0.4 * 1360) / 448, 3)
  })
})
