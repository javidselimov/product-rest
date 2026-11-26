/** `GET /api/v1/ifi-organizations`, `specs/044-ifi-cooperation/contracts/api.md`. */
import { z } from 'zod'

export const ifiOrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string().nullable(),
  memberSince: z.number().nullable(),
  websiteUrl: z.string().nullable(),
  mission: z.string().nullable(),
  membershipIntro: z.string().nullable(),
  content: z.string().nullable(),
  memberships: z.array(z.object({ joinedOn: z.string(), name: z.string() })),
})

export const ifiOrganizationListSchema = z.object({ items: z.array(ifiOrganizationSchema) })

export type IfiOrganizationDto = z.infer<typeof ifiOrganizationSchema>
