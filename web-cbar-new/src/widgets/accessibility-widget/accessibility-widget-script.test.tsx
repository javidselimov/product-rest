import { describe, expect, it } from 'vitest'

import { renderApp } from '@/shared/testing/render'

import { AccessibilityWidgetScript } from './accessibility-widget-script'

const widgetScript = (container: HTMLElement) =>
  container.querySelector<HTMLScriptElement>('script[src="/vendor/accw/acc-widget.min.js"]')

describe('AccessibilityWidgetScript', () => {
  it('aktiv olanda kontraktdakı teqi render edir (contracts/widget-embed.md)', () => {
    const { container } = renderApp(
      <AccessibilityWidgetScript enabled locale="az" nonce="n0nce" />,
      { locale: 'az' },
    )
    const script = widgetScript(container)

    expect(script).not.toBeNull()
    expect(script).toHaveAttribute('defer')
    // Widget yalnız `readystatechange`-də init olur — `async` onu qaçırar (research R2).
    expect(script).not.toHaveAttribute('async')
    expect(script).toHaveAttribute('nonce', 'n0nce')
    expect(script).toHaveAttribute('data-accw-lang', 'az')
    expect(script).toHaveAttribute('data-accw-position', 'bottom-left')
    expect(script).toHaveAttribute('data-accw-offset', '20,20')
    expect(script).toHaveAttribute('data-accw-size', 'md')
  })

  it('dili route locale-ından götürür', () => {
    const { container } = renderApp(
      <AccessibilityWidgetScript enabled locale="en" nonce={undefined} />,
      { locale: 'en' },
    )

    expect(widgetScript(container)).toHaveAttribute('data-accw-lang', 'en')
  })

  it('deaktiv olanda heç nə render etmir — fayla sorğu getmir (SC-003)', () => {
    const { container } = renderApp(
      <AccessibilityWidgetScript enabled={false} locale="az" nonce="n0nce" />,
      { locale: 'az' },
    )

    expect(container.querySelector('script')).toBeNull()
  })
})
