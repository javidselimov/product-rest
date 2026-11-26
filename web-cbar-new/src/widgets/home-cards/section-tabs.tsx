'use client'

/**
 * Ana səhifə bölməsinin başlığı + tab siyahısı (Figma `812:24785` tabsList, spec 022).
 *
 * Kit `Tabs` (klaviatura ox düymələri, ARIA) — yalnız görünüş Figma-ya uyğunlaşdırılıb:
 * boz zolaq, aktiv tab tünd teal fonda ağ mətn. Panellər server-də render olunub
 * `content` kimi ötürülür, bu komponent yalnız seçimi idarə edir.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cbar/lib-react-ui-kit/tabs'
import type { ReactNode } from 'react'

export type SectionTab = {
  key: string
  label: string
  content: ReactNode
}

type SectionTabsProps = {
  title: string
  tabs: SectionTab[]
  /** Kök elementin `data-slot`-u (testlər və stil üçün). */
  slot?: string
  /** Bütün panellərin altında (məs. "Bütün xəbərlər"). */
  footer?: ReactNode
  /**
   * Tab siyahısının yeri: `end` — başlığın əks tərəfində (Figma "İcmal göstəricilər"
   * `212:3326` və Media `813:25085`, hər ikisi SPACE_BETWEEN), `start` — başlığın yanında, 36px.
   */
  tabsAlign?: 'start' | 'end'
  /** Kök üçün əlavə siniflər (məs. başlıq–panel aralığı: Media 36, İcmal göstəricilər 60). */
  className?: string
}

const TRIGGER =
  'text-muted-foreground data-[state=active]:bg-site-accent-strong data-[state=active]:text-primary-foreground h-11 rounded-xs px-4.5 text-base font-medium'

export function SectionTabs({ title, tabs, slot, footer, tabsAlign = 'start', className }: SectionTabsProps) {
  if (tabs.length === 0) return null

  return (
    <Tabs defaultValue={tabs[0].key} data-slot={slot} className={cn('flex flex-col gap-9', className)}>
      <div className={`flex flex-wrap items-center gap-x-9 gap-y-4 ${tabsAlign === 'end' ? 'justify-between' : ''}`}>
        <h2 className="text-foreground text-[32px]/11 font-semibold">{title}</h2>
        <TabsList variant="plain" size="lg" className="bg-site-surface h-11 max-w-full gap-0 overflow-x-auto p-0">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className={TRIGGER}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.key} value={tab.key} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}

      {footer}
    </Tabs>
  )
}
