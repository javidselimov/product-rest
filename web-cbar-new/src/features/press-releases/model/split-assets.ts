/**
 * Splits a press release's assets for the detail page. The API order (`SortOrder`) is kept, so
 * editors choose by ordering, and the API has already left out files of the other language.
 *
 * - `photos`, news (spec 029 data-model §4.4): the first photo is the cover, the remaining photos
 *   form the gallery, everything else is a downloadable attachment.
 * - `files`, announcements (spec 031): no cover and no gallery, Figma hides the image frame, so
 *   every asset, images included, stays a downloadable attachment.
 * - `document`, interviews and speeches (spec 033): the first photo belongs to the list card and
 *   is not shown here, the first PDF is the download button, the rest are attachments.
 */
import type { MediaAsset } from '@/entities/content'

import { PRESS_RELEASE_TYPE } from './constants'
import type { PressReleaseType } from './schemas'

export type PressReleaseLayout = 'photos' | 'files' | 'document'

export type SplitAssets = {
  cover: MediaAsset | null
  gallery: MediaAsset[]
  pdf: MediaAsset | null
  attachments: MediaAsset[]
}

const LAYOUTS: Record<PressReleaseType, PressReleaseLayout> = {
  [PRESS_RELEASE_TYPE.NEWS]: 'photos',
  [PRESS_RELEASE_TYPE.ANNOUNCEMENT]: 'files',
  [PRESS_RELEASE_TYPE.INTERVIEW]: 'document',
}

export const layoutFor = (type: PressReleaseType): PressReleaseLayout => LAYOUTS[type]

const isImage = (asset: MediaAsset) => asset.mimeType.startsWith('image/')
const isPdf = (asset: MediaAsset) => asset.mimeType === 'application/pdf'

export function splitPressReleaseAssets(assets: MediaAsset[], layout: PressReleaseLayout = 'photos'): SplitAssets {
  if (layout === 'files') return { cover: null, gallery: [], pdf: null, attachments: assets }

  const images = assets.filter(isImage)
  if (layout === 'document') {
    const pdf = assets.find(isPdf) ?? null
    return { cover: null, gallery: [], pdf, attachments: assets.filter((asset) => asset !== images[0] && asset !== pdf) }
  }

  const [cover = null, ...gallery] = images
  return { cover, gallery, pdf: null, attachments: assets.filter((asset) => !isImage(asset)) }
}
