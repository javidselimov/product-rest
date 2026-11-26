export const mediaKeys = {
  all: ['media'] as const,
  lists: ['media', 'list'] as const,
  list: (params: { page: number; search?: string }) =>
    ['media', 'list', params] as const,
  /** Id-nin baytları dəyişmir (SHA-256 ilə ünvanlanır) — invalidasiya olunmur. */
  preview: (id: number) => ['media', 'preview', id] as const,
}
