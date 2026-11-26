/**
 * Təşkilat bölməsinin Zod sxemləri (B13, contracts/admin-api.md §6).
 * Üç resurs da `array` envelope ilə gəlir və siyahı elementi detail DTO-su ilə
 * eynidir — `translations` sətirdə mövcuddur, sütunlar oradan oxuyur.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

/**
 * Şöbə tərcüməsi — əsasnamə sənədi hər dil üçün ayrıdır (saytda şöbə səhifəsində kartın
 * altındakı fayl sətri). `regulationName` yalnız oxunur — media seçicisinin yanında fayl adı
 * üçün (`mediaNameKey`).
 */
const divisionTranslationSchema = z.looseObject({
  name: z.string(),
  description: z.string().nullable().optional(),
  regulationMediaId: z.number().nullable().optional(),
  regulationName: z.string().nullable().optional(),
})

export const divisionSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  mediaId: z.number().nullable().optional(),
  translations: translationsSchema(divisionTranslationSchema),
})

export type DivisionRow = z.infer<typeof divisionSchema>

/**
 * Ofis tərcüməsi — rəhbərin adı və əsasnamə sənədi hər dil üçün ayrıdır (köhnə saytdakı
 * `director_name_az/en`, `filename_az/en`). `regulationName` yalnız oxunur — media seçicisinin
 * yanında fayl adı üçün (`mediaNameKey`).
 */
const officeTranslationSchema = z.looseObject({
  name: z.string(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  directorName: z.string().nullable().optional(),
  regulationMediaId: z.number().nullable().optional(),
  regulationName: z.string().nullable().optional(),
})

export const officeSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  photoMediaId: z.number().nullable().optional(),
  translations: translationsSchema(officeTranslationSchema),
})

export type OfficeRow = z.infer<typeof officeSchema>

const staffTranslationSchema = z.looseObject({
  fullName: z.string(),
  position: z.string().nullable().optional(),
  receptionDays: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
})

/**
 * Mətbuat fotosu — `/organization/staff/{id}/photos` alt-resursu (saytda bio altındakı
 * "Fotoşəkillər"). `id` foto bağlantısının id-sidir, media id deyil.
 */
export const staffPhotoSchema = z.looseObject({
  id: z.number(),
  mediaId: z.number(),
  originalName: z.string().nullable().optional(),
  sortOrder: z.number().nullable().optional(),
})

export type StaffPhoto = z.infer<typeof staffPhotoSchema>

/** `POST /organization/staff/{id}/photos` cavabı (200). */
export const staffPhotoAddedSchema = z.looseObject({
  id: z.number(),
  mediaId: z.number(),
  sortOrder: z.number().nullable().optional(),
})

export const staffSchema = z.looseObject({
  id: z.number(),
  /** 1 — idarə heyəti, 2 — rəhbərlik (contracts/admin-api.md §6). */
  type: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  phone: z.string().nullable().optional(),
  photoMediaId: z.number().nullable().optional(),
  translations: translationsSchema(staffTranslationSchema),
  photos: z.array(staffPhotoSchema).default([]),
})

export type StaffRow = z.infer<typeof staffSchema>
