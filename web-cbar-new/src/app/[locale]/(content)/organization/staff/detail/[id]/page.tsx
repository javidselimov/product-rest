import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Locale } from '@/shared/i18n'
import { StaffMemberView } from '@/views/staff-member'
import { loadStaffMember } from '@/views/staff-member/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const data = await loadStaffMember(locale, id)
  if (!data) return {}
  return {
    title: data.fullName ?? undefined,
    description: data.position ?? undefined,
    alternates: { languages: { az: `/az/organization/staff/detail/${id}`, en: `/en/organization/staff/detail/${id}` } },
  }
}

export default async function StaffMemberPage({ params }: Props) {
  const { locale, id } = await params
  const data = await loadStaffMember(locale, id)
  if (!data) notFound()
  return <StaffMemberView data={data} />
}
