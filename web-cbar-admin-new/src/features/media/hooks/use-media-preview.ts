import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { PREVIEW_GC_MS } from '@/shared/constants/timing'
import { mediaKeys } from '../api/media.keys'
import { mediaService } from '../api/media.service'

/**
 * Önizləmə blob-u id üzrə keşdə: eyni şəkil seçicidə və sahədə bir dəfə endirilir
 * (FR-017). `retry: false` — 404/415 təkrarlanmır, xəta UI-da yer tutucudur.
 */
export function useMediaPreview(id: number | null, enabled: boolean) {
  return useQuery({
    queryKey: mediaKeys.preview(id ?? 0),
    queryFn: () => mediaService.preview(id ?? 0),
    enabled: enabled && id !== null,
    staleTime: Infinity,
    gcTime: PREVIEW_GC_MS,
    retry: false,
  })
}

/**
 * `<img>` ref-i: blob üçün `blob:` ünvanı yaradır və element ayrılanda (və ya blob
 * dəyişəndə) onu buraxır. Hər `<img>` öz ünvanını alır — biri bağlananda digərinin
 * şəkli sınmır. React 19 ref cleanup-ı istifadə olunur.
 */
export function useBlobImageRef(blob: Blob | undefined) {
  return useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || !blob) return
      const url = URL.createObjectURL(blob)
      img.src = url
      return () => URL.revokeObjectURL(url)
    },
    [blob],
  )
}
