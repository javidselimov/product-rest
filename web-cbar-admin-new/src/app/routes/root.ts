import { createRootRoute } from '@tanstack/react-router'

import { NotFoundPage } from '@/pages/not-found'

/** Hər route breadcrumb üçün i18n açarı daşıyır (research R13). */
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    /** Breadcrumb etiketi — `t(crumb)` (namespace açarın içindədir, məs. `nav:laws.label`). */
    crumb?: string
  }
}

/** Root: özü layout daşımır (login shell-siz açılır); 404 burada tutulur. */
export const rootRoute = createRootRoute({
  notFoundComponent: NotFoundPage,
})
