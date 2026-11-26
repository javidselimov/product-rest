/**
 * Test render helper-ləri. Qeyd: bu fayl app layer-i import edir — FSD istiqamət
 * qaydasının test-only istisnasıdır (production bundle-a düşmür); real app ilə
 * eyni provider stack-i qurmaq üçün lazımdır.
 */

import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { registerAuthBridge } from '@/app/providers/auth-bridge'
import { AppProviders } from '@/app/providers/app-providers'
import { routeTree } from '@/app/routes'

/** Tam aplikasiyanı verilmiş URL-də, real provider stack ilə render edir. */
export function renderApp(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  // main.tsx ilə eyni: 401 → refresh/logout körpüsü bu router-ə bağlanır.
  // Sessiya bərpası (`restoreSession`) burada yoxdur — onu yoxlayan test özü çağırır.
  registerAuthBridge(router)
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}
