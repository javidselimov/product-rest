/** `GET /api/v1/fincert`, `specs/053-fincert-page/contracts/public-api.md`. */
import { z } from 'zod'

export const fincertPortalSchema = z.object({ title: z.string(), description: z.string().nullable(), url: z.string() })

export const fincertRfcSchema = z.object({
  file: z.object({ url: z.string(), mimeType: z.string(), sizeBytes: z.number() }).nullable(),
  url: z.string().nullable(),
})

export const fincertDirectionSchema = z.object({ id: z.number(), title: z.string(), body: z.string() })

export const fincertMembershipSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  badge: z.string().nullable(),
  url: z.string().nullable(),
  logo: z.string().nullable(),
})

export const fincertSchema = z.object({
  mission: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  portal: fincertPortalSchema.nullable(),
  rfc: fincertRfcSchema.nullable(),
  directions: z.array(fincertDirectionSchema),
  memberships: z.array(fincertMembershipSchema),
})

export type FincertDto = z.infer<typeof fincertSchema>
export type FincertDirectionDto = z.infer<typeof fincertDirectionSchema>
export type FincertMembershipDto = z.infer<typeof fincertMembershipSchema>
