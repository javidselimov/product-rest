/**
 * Modul konfiqindən üç route (contracts/module-config.md §3): siyahı (URL
 * search sxemi ilə), `/new`, `/$id`. Valideyn (`authed` layout) app qatından
 * ötürülür — features app-ı import etmir (FSD).
 */

import {
  createRoute,
  lazyRouteComponent,
  type AnyRoute,
  type RouteComponent,
} from '@tanstack/react-router'

import { listSearchSchema, newFormSearchSchema } from '@/shared/crud/schema'
import type { AnyRow, ModuleConfig } from '@/shared/crud/types'

export interface CrudRouteOverrides {
  list?: RouteComponent
  form?: RouteComponent
}

export function createCrudRoutes<Row extends AnyRow, Path extends string>(
  parent: AnyRoute,
  config: ModuleConfig<Row, Path>,
  overrides: CrudRouteOverrides = {},
) {
  const listRoute = createRoute({
    getParentRoute: () => parent,
    path: config.basePath,
    validateSearch: listSearchSchema(config),
    staticData: { crumb: `${config.ns}:${config.titleKey}` },
    component:
      overrides.list ??
      lazyRouteComponent(
        () => import('../components/crud-list-page'),
        'CrudListPageRoute',
      ),
  })
  const newRoute = createRoute({
    getParentRoute: () => parent,
    path: `${config.basePath}/new` as `${Path}/new`,
    validateSearch: newFormSearchSchema,
    staticData: { crumb: 'crud:new' },
    component:
      overrides.form ??
      lazyRouteComponent(
        () => import('../components/crud-form-page'),
        'CrudFormPageRoute',
      ),
  })
  const editRoute = createRoute({
    getParentRoute: () => parent,
    path: `${config.basePath}/$id` as `${Path}/$id`,
    staticData: { crumb: 'crud:edit' },
    component:
      overrides.form ??
      lazyRouteComponent(
        () => import('../components/crud-form-page'),
        'CrudFormPageRoute',
      ),
  })
  return [listRoute, newRoute, editRoute] as const
}
