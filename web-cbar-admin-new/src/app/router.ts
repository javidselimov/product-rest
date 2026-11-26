import { createRouter } from '@tanstack/react-router'

import { RouterErrorFallback } from './providers/error-boundary'
import { routeTree } from './routes'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultErrorComponent: RouterErrorFallback,
})

/** Register — bütün `Link to` və `navigate` çağırışları bu route tree ilə tiplənir. */
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
