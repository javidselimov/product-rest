/**
 * Media giriş səhifəsi — Figma `1045:17244` / `1658:12660` / `1658:13179` (spec 028 US1).
 * Şablon + CMS giriş mətni; bloklar yoxdur, menyu CMS ağacındandır.
 */
import { Attachments } from '@/widgets/attachments/attachments'
import { CmsContent } from '@/widgets/cms-content/cms-content'
import { SectionShell } from '@/widgets/section-shell'

import type { MediaViewData } from './loader'

export function MediaView({ data }: Readonly<{ data: MediaViewData }>) {
  return (
    <SectionShell shell={data.shell} title={data.title}>
      <div data-slot="media">
        <CmsContent html={data.html} variant="about" />
        <Attachments locale={data.locale} files={data.attachments} />
      </div>
    </SectionShell>
  )
}
