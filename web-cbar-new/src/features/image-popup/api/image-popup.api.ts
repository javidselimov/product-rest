/**
 * Şəkilli popup — spec 009 contracts/public-api.md. 10 s keşlənir, `media` teqi ilə.
 */
import 'server-only'

import { z } from 'zod'

import { cachedJson } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { imagePopupSchema, type ImagePopup } from '../model/image-popup'

const fetchImagePopups = cachedJson(z.array(imagePopupSchema), { keyPrefix: 'image-popups', tag: 'media' })

export function getImagePopups(locale: Locale): Promise<ImagePopup[]> {
  return fetchImagePopups(`/api/v1/image-popups?locale=${locale}`)
}
