/**
 * Route → modul konfiqi xəritəsi. `createCrudRoutes` lazy komponentlərinin
 * konfiqi tapması üçün: route tree qurulanda modullar `registerModule` ilə
 * yolla qeyd olunur, `CrudListPageRoute`/`CrudFormPageRoute` cari yoldan oxuyur.
 */

import type { AnyRow, ModuleConfig } from '@/shared/crud/types'

const registry = new Map<string, ModuleConfig<AnyRow, string>>()

export function registerModule<Row extends AnyRow, Path extends string>(
  config: ModuleConfig<Row, Path>,
): ModuleConfig<Row, Path> {
  registry.set(
    config.basePath,
    config as unknown as ModuleConfig<AnyRow, string>,
  )
  return config
}

/** Cari yoldan (`/laws`, `/laws/new`, `/laws/7`) modulu tapır — ən uzun prefiks. */
export function resolveModule(
  pathname: string,
): ModuleConfig<AnyRow, string> | undefined {
  let best: ModuleConfig<AnyRow, string> | undefined
  for (const [basePath, config] of registry) {
    if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
      if (!best || basePath.length > best.basePath.length) best = config
    }
  }
  return best
}

export function clearModules(): void {
  registry.clear()
}
