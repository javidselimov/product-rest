/**
 * Məzmun səhifələrinin konteyneri (spec 022 research R3).
 *
 * `(content)` route group-udur — URL-ə təsir etmir. Ana səhifə (`[locale]/page.tsx`)
 * bu group-dan kənardadır, çünki onun bölmələri tam enlidir və konteyneri
 * özləri açır; qalan bütün səhifələr burada 1320-lik site konteynerinə düşür.
 */
import type { ReactNode } from 'react'

import { SiteContainer } from '@/shared/ui/site-container'

export default function ContentLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <SiteContainer>{children}</SiteContainer>
}
