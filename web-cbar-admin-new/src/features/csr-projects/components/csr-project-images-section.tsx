/**
 * Project photos (spec 038): the shared `AssetsSection` on `/csr-projects/{id}/assets`,
 * reorderable. The order is the order of the gallery in the site's dialog. Every change refetches
 * the detail: the sub-resource returns 204.
 */

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import {
  attachedAssetSchema,
  type AttachedAsset,
} from '@/entities/media/model/types'
import { AssetsSection } from '@/features/assets/components/assets-section'
import type { AnyRow } from '@/shared/crud/types'
import { csrProjectsKeys } from '../api/csr-projects.keys'

interface CsrProjectImagesSectionProps {
  id: string
  detail: AnyRow
}

export function CsrProjectImagesSection({
  id,
  detail,
}: CsrProjectImagesSectionProps) {
  const queryClient = useQueryClient()
  // The detail is already schema-checked; this only narrows the type.
  const assets = useMemo<AttachedAsset[]>(() => {
    const parsed = attachedAssetSchema.array().safeParse(detail.assets ?? [])
    return parsed.success ? parsed.data : []
  }, [detail.assets])

  return (
    <AssetsSection
      assetsPath={`/csr-projects/${id}/assets`}
      assets={assets}
      titleKey="csrProjects:images.title"
      descriptionKey="csrProjects:images.description"
      reorderable
      onChanged={() =>
        void queryClient.invalidateQueries({
          queryKey: csrProjectsKeys.detail(id),
        })
      }
    />
  )
}
