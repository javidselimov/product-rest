/**
 * Server tərəfli tema və dil.
 *
 * Sayt yalnız açıq temadadır (spec 022 research R8): köhnə `ui-theme` cookie-si
 * oxunmur və `.dark` class-ı heç vaxt qoyulmur. `suppressHydrationWarning` yoxdur.
 * Dil yalnız `x-locale` başlığından gəlir.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  headers: new Map<string, string>(),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      state.cookies.has(name) ? { name, value: state.cookies.get(name) as string } : undefined,
  }),
  headers: async () => ({
    get: (name: string) => state.headers.get(name) ?? null,
  }),
}))

const { default: RootLayout } = await import('./layout')

beforeEach(() => {
  state.cookies.clear()
  state.headers.clear()
})

async function renderRootLayout() {
  const element = await RootLayout({ children: null })
  return renderToStaticMarkup(element)
}

describe('root layout', () => {
  it('köhnə ui-theme=dark cookie-si nəzərə alınmır — sayt açıq temada qalır', async () => {
    state.cookies.set('ui-theme', 'dark')

    expect(await renderRootLayout()).not.toContain('class="dark"')
  })

  it('hydration üçün suppressHydrationWarning işlətmir', async () => {
    expect(await renderRootLayout()).not.toContain('suppressHydrationWarning')
  })

  it('dili proxy-nin qoyduğu x-locale başlığından götürür', async () => {
    state.headers.set('x-locale', 'en')

    expect(await renderRootLayout()).toContain('lang="en"')
  })

  it('NEXT_LOCALE cookie-si oxunmur', async () => {
    state.cookies.set('NEXT_LOCALE', 'en')

    expect(await renderRootLayout()).toContain('lang="az"')
  })

  it('heç nə yoxdursa defolt dil az-dır', async () => {
    expect(await renderRootLayout()).toContain('lang="az"')
  })
})
