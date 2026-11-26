/**
 * Sayt boyu şəkilli popup (spec 009 FR-010, contracts/public-api.md).
 *
 * `GET /api/v1/image-popups` bu dildə şəkli olan aktiv popup-lardan ən son
 * aktivləşdirilənini qaytarır — ən çox bir element. Siyahı forması gələcəkdə
 * genişlənməyə yer saxlayır; sayt yalnız birincini göstərir. Nəticə
 * serializable-dır: server layout-dan client-ə prop gedir.
 */
import { z } from 'zod'

export const imagePopupSchema = z
  .object({
    id: z.number(),
    imageUrl: z.string(),
    link: z.string().nullable().optional(),
    altText: z.string().nullable().optional(),
  })
  .passthrough()

export type ImagePopup = z.infer<typeof imagePopupSchema>

export function toImagePopup(list: readonly ImagePopup[]): ImagePopup | null {
  return list[0] ?? null
}
