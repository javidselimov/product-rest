import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { pagesKeys } from '../api/pages.keys'
import { pagesService } from '../api/pages.service'
import type { ReorderUpdate } from '../model/tree'

export function usePagesTree(locale: string) {
  return useQuery({
    queryKey: pagesKeys.tree(locale),
    queryFn: () => pagesService.tree(locale),
  })
}

export function usePageDetail(id: string | undefined) {
  return useQuery({
    queryKey: pagesKeys.detail(id ?? 'new'),
    queryFn: () => pagesService.detail(id!),
    enabled: id !== undefined,
  })
}

/**
 * Sürüklə-burax sıralaması: `planReorder` yazılarını `/move` ilə ardıcıl
 * göndərir (atomar deyil — yarıda xəta olsa, ağac yenidən yüklənir və qismən
 * dəyişmiş sıranı göstərir). Hər halda ağac yenilənir.
 */
export function useReorderPages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updates: ReorderUpdate[]) => {
      for (const { node, sortOrder } of updates) {
        await pagesService.move(node.id, {
          newParentId: node.parentId,
          sortOrder,
        })
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: pagesKeys.all }),
  })
}
