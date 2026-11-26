/**
 * `features/rich-text` ictimai girişi. Redaktor lazy yüklənir — TipTap chunk-ı
 * yalnız richtext sahəsi olan form açılanda gəlir (research R10).
 * `<Suspense fallback={<RichTextEditorFallback />}>` ilə istifadə olunur.
 *
 * Deploy-dan sonra köhnə tabda bu chunk artıq serverdə yoxdur; `React.lazy`
 * rədd olunmuş import-u keşləyir və xəta ekranı çıxırdı (spec 004 R1). Chunk
 * xətasında səhifə bir dəfə yenilənir, o vaxta qədər skeleton görünür.
 */

import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { createElement, lazy } from 'react'

import { isChunkLoadError, reloadOnce } from '@/shared/lib/chunk-reload'

export type { RichTextEditorProps } from './ui/rich-text-editor'

export const RichTextEditor = lazy(() =>
  import('./ui/rich-text-editor')
    .then((module) => ({ default: module.RichTextEditor }))
    .catch((error: unknown) => {
      if (isChunkLoadError(error) && reloadOnce(error)) {
        return new Promise<never>(() => {})
      }
      throw error
    }),
)

export function RichTextEditorFallback() {
  return createElement(Skeleton, { className: 'h-60 w-full' })
}
