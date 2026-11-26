/**
 * Qanun redaktəsində sənədlər bölməsi (`editExtras`): `AssetsSection`-ın
 * `/laws/{id}/assets` üzərində nazik sarğısı. Bağla/ayır uğurundan sonra
 * detail query-si invalidasiya olunur — siyahı server cavabından yenilənir.
 */

import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { attachedAssetSchema } from '@/entities/media/model/types'
import { AssetsSection } from '@/features/assets/components/assets-section'
import { crudKeys } from '@/features/crud/api/crud.keys'
import type { AnyRow } from '@/shared/crud/types'

const assetsSchema = z.array(attachedAssetSchema).catch([])

interface LawAttachmentsSectionProps {
  id: string
  detail: AnyRow
}

export function LawAttachmentsSection({
  id,
  detail,
}: LawAttachmentsSectionProps) {
  const queryClient = useQueryClient()
  const assets = assetsSchema.parse(detail.assets)
  return (
    <AssetsSection
      assetsPath={`/laws/${id}/assets`}
      assets={assets}
      onChanged={() =>
        void queryClient.invalidateQueries({
          queryKey: crudKeys('laws').detail(id),
        })
      }
    />
  )
}
