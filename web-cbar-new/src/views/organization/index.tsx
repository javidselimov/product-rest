/**
 * Təşkilat bölmələri "Haqqımızda" şablonunda (spec 024 US4, US5).
 *
 * İdarə Heyəti — Figma `1988:2291` (sədr kartı tam endə, gradient; "Sədr müavinləri" başlığı 24/600,
 * müavinlər 2 sütun; "Sədr" başlığı ekran oxuyucu üçündür, research R9). Rəhbərlik — `1814:4894`:
 * "Baş direktorlar" (type 2) və "Müşavirlər" (type 3) qrupları, aralıq 40.
 * Struktur bölmələr — CMS səhifəsinin sxemi və əsasnamələri (`996:8542`) + şöbə keçidləri.
 * Ərazi idarələri — `2046:3531`: foto + ünvan/telefon/rəhbər + əsasnamə kartları (`OfficeCards`).
 * Tab düymələri yoxdur — keçid sol menyudandır.
 */
import { CaretRightIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'

import { getT } from '@/shared/i18n/server'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { OfficeCards } from '@/widgets/about-blocks/office-cards'
import { ChairCard, DeputyCard, DeputyGrid, StaffCard, StaffGrid, type StaffCardData } from '@/widgets/about-blocks/staff-cards'
import { SectionShell } from '@/widgets/section-shell'
import { Attachments } from '@/widgets/attachments/attachments'
import { CmsContent } from '@/widgets/cms-content/cms-content'
import { OrgChartChart, OrgChartTree } from '@/widgets/org-chart'

import type { OrganizationViewData } from './loader'

type PhotoAlt = (name: string) => string

/** Rəhbərlik qrupu — Figma `1814:4894`: alt başlıq 18/24 600, aralıq 16, 4 sütunlu tor. Boş qrup göstərilmir. */
function StaffGroup({ title, members, photoAlt }: Readonly<{ title: string; members: StaffCardData[]; photoAlt: PhotoAlt }>) {
  if (members.length === 0) return null
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-foreground text-lg leading-6 font-semibold">{title}</h2>
      <StaffGrid>
        {members.map((member) => (
          <li key={member.id}>
            <StaffCard member={member} photoAlt={photoAlt} />
          </li>
        ))}
      </StaffGrid>
    </section>
  )
}

/**
 * Struktur və əsasnamələr — interaktiv sxem (spec 027). Desktop (`2007:86376`): sxem → qeyd (aralıq 30)
 * → əsasnamələr (aralıq 60). Planşet/mobil (`2007:86360`, aralıq 36): əsasnamələr sxemdən əvvəldir —
 * sıra CSS `order` ilə dəyişir, DOM bir dəfədir. Sxem varsa CMS şəkli və düz şöbə siyahısı göstərilmir.
 */
function OrgChartSection({ data }: Readonly<{ data: OrganizationViewData }>) {
  const t = getT(data.locale, 'organization')
  const attachments = data.divisionsIntro?.attachments ?? []
  const hasFootnote = data.orgChart.some((n) => n.curatorDirect)
  return (
    <div className="flex flex-col gap-9 desk:gap-[60px]">
      <section aria-label={t('chart.label')} className="order-2 flex flex-col gap-9 desk:order-1 desk:gap-[30px]">
        <OrgChartChart nodes={data.orgChart} label={t('chart.scroll')} className="max-desk:hidden" />
        <OrgChartTree nodes={data.orgChart} className="desk:hidden" />
        {hasFootnote ? (
          <p className="text-muted-foreground text-xs leading-4 tracking-[0.25px] desk:text-sm desk:leading-[1.4] desk:font-medium desk:tracking-normal desk:italic">
            {t('chart.footnote')}
          </p>
        ) : null}
      </section>
      {attachments.length > 0 ? (
        <div className="order-1 desk:order-2">
          <Attachments locale={data.locale} files={attachments} variant="about" />
        </div>
      ) : null}
    </div>
  )
}

function Body({ data }: Readonly<{ data: OrganizationViewData }>) {
  const { locale, section } = data
  const t = getT(locale, 'organization')
  const tAbout = getT(locale, 'about')
  const photoAlt: PhotoAlt = (name) => tAbout('staff.photoAlt', { name })

  if (data.error) return <ErrorState kind="server" />

  if (section === 'board') {
    const { chair, deputies } = data.board
    if (!chair) return <EmptyState title={t('noStaff')} />
    return (
      <div className="flex flex-col gap-10">
        <section>
          <h2 className="sr-only">{tAbout('board.chair')}</h2>
          <ChairCard member={chair} photoAlt={photoAlt} />
        </section>
        {deputies.length > 0 ? (
          <section className="flex flex-col gap-5">
            <h2 className="text-foreground text-2xl leading-[31px] font-semibold">{tAbout('board.deputies')}</h2>
            <DeputyGrid>
              {deputies.map((member) => (
                <li key={member.id}>
                  <DeputyCard member={member} photoAlt={photoAlt} />
                </li>
              ))}
            </DeputyGrid>
          </section>
        ) : null}
      </div>
    )
  }

  if (section === 'management') {
    const { directors, advisers } = data.management
    if (directors.length === 0 && advisers.length === 0) return <EmptyState title={t('noStaff')} />
    return (
      <div className="flex flex-col gap-10">
        <StaffGroup title={t('management.directors')} members={directors} photoAlt={photoAlt} />
        <StaffGroup title={t('management.advisers')} members={advisers} photoAlt={photoAlt} />
      </div>
    )
  }

  if (section === 'divisions') return data.orgChart.length > 0 ? <OrgChartSection data={data} /> : <DivisionsSection data={data} />

  return data.offices.length === 0 ? <EmptyState title={t('noStaff')} /> : <OfficeCards offices={data.offices} locale={locale} />
}

/** Struktur bölmələr — sxem qurulmayıbsa: CMS səhifəsinin şəkli və əsasnamələri + şöbə keçidləri (spec 024 US5). */
function DivisionsSection({ data }: Readonly<{ data: OrganizationViewData }>) {
  const t = getT(data.locale, 'organization')
  const intro = data.divisionsIntro
  return (
    <div className="flex flex-col gap-8">
      {intro ? (
        <div className="flex flex-col gap-8 desk:max-w-[713px]">
          <CmsContent html={intro.html} variant="about" className="[&_img]:h-auto [&_img]:w-full" />
          <Attachments locale={data.locale} files={intro.attachments} variant="about" />
        </div>
      ) : null}
      {data.divisions.length === 0 ? (
        <EmptyState title={t('noStaff')} />
      ) : (
        <ul className="grid grid-cols-1 gap-3 tab:grid-cols-2">
          {data.divisions.map((division) => (
            <li key={division.id}>
              <Link
                href={division.href}
                className="border-site-divider text-foreground hover:border-primary hover:text-primary flex h-full items-center justify-between gap-3 rounded-xs border p-5 text-base leading-6 font-medium transition-colors"
              >
                <span>{division.name}</span>
                <CaretRightIcon aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function OrganizationView({ data }: Readonly<{ data: OrganizationViewData }>) {
  return (
    <SectionShell shell={data.shell} title={data.title}>
      <Body data={data} />
    </SectionShell>
  )
}
