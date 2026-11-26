/**
 * Əməkdaşın bioqrafiyası — Figma `1199:17030` (spec 024 US4): hero başlıq kartı (foto, ad, vəzifə,
 * qəbul günləri, telefon), bio bölmələri (başlıq 20/600, mətn 16/400) və mətbuat fotoları
 * (`2037:4289`, yalnız CMS-də foto varsa). Siyahıya qayıdış breadcrumb-dandır.
 */
import { getT } from '@/shared/i18n/server'
import { StaffHeaderCard } from '@/widgets/about-blocks/staff-cards'
import { StaffPhotos } from '@/widgets/about-blocks/staff-photos'
import { SectionShell } from '@/widgets/section-shell'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import type { StaffMemberViewData } from './loader'

export function StaffMemberView({ data }: Readonly<{ data: StaffMemberViewData }>) {
  const t = getT(data.locale, 'about')

  return (
    // H1 başlıq kartındakı addır (Figma-da ayrıca səhifə başlığı yoxdur).
    <SectionShell shell={data.shell} title={null}>
      <div className="flex flex-col gap-9">
        <StaffHeaderCard
          fullName={data.fullName}
          position={data.position}
          photoUrl={data.photoUrl}
          photoAlt={t('staff.photoAlt', { name: data.fullName ?? '' })}
          receptionDays={data.receptionDays ? { label: t('staff.receptionDays'), value: data.receptionDays } : null}
          phone={data.phone ? { label: t('staff.contact'), value: data.phone, tel: data.tel } : null}
        />
        <CmsContent html={data.bioHtml} variant="about" />
        {data.photos.length > 0 ? (
          <StaffPhotos
            title={t('photos.title')}
            photos={data.photos}
            zip={data.photosZip ? { href: data.photosZip.href, label: t('photos.downloadAll', { size: data.photosZip.size }) } : null}
            downloadLabel={t('photos.download')}
            downloadAria={(fileName) => t('photos.downloadAria', { name: fileName })}
            photoAlt={(fileName) => t('photos.alt', { name: data.fullName ?? '', file: fileName })}
          />
        ) : null}
      </div>
    </SectionShell>
  )
}
