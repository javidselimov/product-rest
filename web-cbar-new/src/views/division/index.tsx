/**
 * Struktur bölmənin səhifəsi — Figma `1003:12461` (spec 024 US5 #3): başlıq 28/600, məlumat
 * kartı `1003:12462` (1px çərçivə, p24, sətirlər arası 32; etiket 18/600, dəyər 16/400) və
 * kartdan 40px aşağıda əsasnamə fayl sətri `1000:12443` (CMS-də bağlanıbsa).
 */
import { SectionShell } from '@/widgets/section-shell'
import { Attachments } from '@/widgets/attachments/attachments'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import type { DivisionViewData } from './loader'

export function DivisionView({ data }: Readonly<{ data: DivisionViewData }>) {
  const hasHtml = data.html.trim() !== ''
  return (
    <SectionShell shell={data.shell} title={data.name} titleSize="md">
      <div className="flex flex-col gap-10">
        {data.facts.length > 0 || hasHtml ? (
          <section data-slot="division-info" className="border-site-divider flex flex-col gap-8 rounded-xs border p-6">
            {data.facts.length > 0 ? (
              <dl className="flex flex-col gap-8">
                {data.facts.map((fact) => (
                  <div key={fact.label} className="flex flex-col gap-2">
                    <dt className="text-foreground text-lg leading-8 font-semibold">{fact.label}</dt>
                    <dd className="text-foreground text-base leading-7">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {hasHtml ? <CmsContent html={data.html} variant="about" /> : null}
          </section>
        ) : null}
        {data.attachments.length > 0 ? <Attachments locale={data.locale} files={data.attachments} variant="about" /> : null}
      </div>
    </SectionShell>
  )
}
