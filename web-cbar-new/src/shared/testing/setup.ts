/**
 * Vitest setup (R-009).
 *
 * `next/navigation` və `next/cache` burada mock-lanır — bu, «mock davranışını
 * assert etmək» qadağası deyil (konstitusiya Maddə VI.2), sadəcə framework
 * kontekstidir: jsdom-da nə Next router, nə də incremental cache store mövcuddur.
 */
import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { server } from './server'

export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}

export const navigationState = {
  pathname: '/az',
  params: { locale: 'az' } as Record<string, string>,
  searchParams: new URLSearchParams(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => navigationState.pathname,
  useParams: () => navigationState.params,
  useSearchParams: () => navigationState.searchParams,
  redirect: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

/**
 * `unstable_cache` Next-in server runtime-ındaki incremental cache store-una
 * söykənir; jsdom-da o store yoxdur və funksiya sorğunu ümumiyyətlə icra etmir.
 * Testdə keşsiz ötürücü qoyulur — beləliklə MSW handler-ləri həmişə çağırılır və
 * testlər **davranışı** yoxlamağa davam edir, keş mexanizmini yox (spec 003 Faza 6).
 *
 * `revalidateTag` boş funksiyadır: keş yoxdursa ləğv etməyə də bir şey yoxdur.
 */
vi.mock('next/cache', () => ({
  unstable_cache:
    <A extends unknown[], R>(fn: (...args: A) => Promise<R>) =>
    (...args: A) =>
      fn(...args),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}))

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  Object.values(routerMock).forEach((fn) => fn.mockClear())
  navigationState.pathname = '/az'
  navigationState.params = { locale: 'az' }
  navigationState.searchParams = new URLSearchParams()
})

afterAll(() => {
  server.close()
})
