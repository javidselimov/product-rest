/**
 * Which library files a media field may take (spec 053): the FinCERT logo takes images, the RFC-2350 field documents.
 * The rule mirrors the API's check (`image/*` for a logo, any other upload type for a document), so a file the picker
 * offers is never refused on save.
 */

import type { MediaAccept } from '@/shared/crud/types'

const IMAGE_MIME_PREFIX = 'image/'

export function acceptsMedia(accept: MediaAccept | undefined, mimeType: string | null | undefined): boolean {
  if (!accept) return true
  const isImage = (mimeType ?? '').startsWith(IMAGE_MIME_PREFIX)
  return accept === 'image' ? isImage : Boolean(mimeType) && !isImage
}
