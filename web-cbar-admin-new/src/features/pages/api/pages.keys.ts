export const pagesKeys = {
  all: ['pages'] as const,
  tree: (locale: string) => ['pages', 'tree', locale] as const,
  detail: (id: string | number) => ['pages', 'detail', String(id)] as const,
}
