'use client'

/**
 * Təsvir / mühafizə elementləri tabları — kit `Tabs` sarğısı (yalnız tab keçidi client-dir).
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cbar/lib-react-ui-kit/tabs'
import type { ReactNode } from 'react'

type MoneyMarkTabsProps = {
  descriptionLabel: string
  securityLabel: string
  description: ReactNode
  security: ReactNode
}

export function MoneyMarkTabs({ descriptionLabel, securityLabel, description, security }: MoneyMarkTabsProps) {
  return (
    <Tabs defaultValue="description" data-slot="money-mark-tabs">
      <TabsList variant="line" colorPalette="primary">
        <TabsTrigger value="description">{descriptionLabel}</TabsTrigger>
        <TabsTrigger value="security">{securityLabel}</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="pt-4">
        {description}
      </TabsContent>
      <TabsContent value="security" className="pt-4">
        {security}
      </TabsContent>
    </Tabs>
  )
}
