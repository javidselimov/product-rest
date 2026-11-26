import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { installChunkReloadGuard } from '@/shared/lib/chunk-reload'
import { initTheme } from '@/shared/model/ui-store'
import '@/shared/i18n'
import './index.css'

async function bootstrap() {
  initTheme()

  // Deploy-dan sonra köhnə tabda chunk tapılmırsa bir dəfə yenilə (spec 004) —
  // aşağıdakı dinamik import-lardan əvvəl qoşulmalıdır.
  installChunkReloadGuard()

  // Config (build-time VITE_API_URL) router-dən əvvəl yüklənir — axios baseURL-i ondan oxuyur.
  await loadRuntimeConfig()

  // Real admin API default-dur (Vite proxy `/api` → api-cbar-admin). MSW worker
  // yalnız açıq opt-in ilə (`VITE_ENABLE_MSW=true`) `/api/v1/*`-ni brauzerdə
  // cavablandırır — API-siz demo və vizual yoxlama üçün.
  if (import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { worker } = await import('@/shared/testing/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const [
    { router },
    { registerAuthBridge, restoreSession },
    { AppProviders },
    { ErrorBoundary },
  ] = await Promise.all([
    import('@/app/router'),
    import('@/app/providers/auth-bridge'),
    import('@/app/providers/app-providers'),
    import('@/app/providers/error-boundary'),
  ])

  // 401 → refresh/logout körpüsü, sonra httpOnly cookie ilə sessiya bərpası
  // (spec 005) — ikisi də ilk render-dən əvvəl, ki guard login-ə tələsməsin.
  registerAuthBridge(router)
  await restoreSession()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      </ErrorBoundary>
    </StrictMode>,
  )
}

void bootstrap()
