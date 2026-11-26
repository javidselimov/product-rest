/**
 * Alt bölmə tab çubuğu (research R13): Qanunlar | Kateqoriyalar və s.
 * Aktiv tab = cari yolun ən uzun prefiks uyğunluğu; keçid router history ilə.
 */

import { Tabs, TabsList, TabsTrigger } from '@cbar/lib-react-ui-kit/tabs'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export interface SectionTab {
  to: string
  labelKey: string
}

interface SectionTabsProps {
  tabs: SectionTab[]
  className?: string
}

export function SectionTabs({ tabs, className }: SectionTabsProps) {
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { t } = useTranslation()

  const active = [...tabs]
    .filter((tab) => pathname === tab.to || pathname.startsWith(`${tab.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0]?.to

  return (
    <Tabs
      value={active}
      onValueChange={(value) => router.history.push(value)}
      className={className}
    >
      <TabsList variant="line">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.to} value={tab.to}>
            {t(tab.labelKey)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
