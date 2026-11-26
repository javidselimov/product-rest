/** Sətir yolu və açar köməkçiləri (köhnə `crud/utils.ts`-in qarşılığı). */

import {
  DEFAULT_LOCALES,
  type AnyRow,
  type Locale,
  type ModuleConfig,
} from './types'

/** Nöqtəli yolu oxuyur ("translations.az.title"). */
export function getByPath(row: AnyRow, path: string): unknown {
  let current: unknown = row
  for (const part of path.split('.')) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    )
      return undefined
    current = (current as AnyRow)[part]
  }
  return current
}

export function getRowKey<Row extends AnyRow>(
  config: Pick<ModuleConfig<Row, string>, 'rowKey'>,
  row: Row,
): string | number {
  if (config.rowKey) return config.rowKey(row)
  return row['id'] as string | number
}

export function configLocales(config: {
  locales?: readonly Locale[]
}): readonly Locale[] {
  return config.locales ?? DEFAULT_LOCALES
}

/** i18n açarını modul namespace-i ilə tamamlayır: "fields.title" → "laws:fields.title". */
export function nsKey(ns: string, key: string): string {
  return key.includes(':') ? key : `${ns}:${key}`
}
