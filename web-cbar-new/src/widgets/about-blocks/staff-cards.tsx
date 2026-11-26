/**
 * Staff cards (spec 024 US4).
 *
 * - `ChairCard`: chairman, Figma `1988:2869`: 984×380 horizontal, photo 300×380 on the left, same blue
 *   gradient as the History hero, name 32/600 white, position 16/400 white 75%, 1px white 15% line below. Mobile: photo on top.
 * - `DeputyCard`: deputy chairman, Figma `1988:2900`: 480×202 horizontal, p20, border neutral-200, photo 128×160 r4,
 *   name 18/24 600, position 16/28. `DeputyGrid` 2 columns (from tablet), 1 (mobile), gap 24, Figma `1988:2899`.
 * - `StaffCard`: management, Figma `1814:4894` (card `1814:2293`): 231×318, border 1px neutral-200 r4,
 *   photo 229×200 (top-aligned, cropped), body p16/16/18 gap 6, name 18/24 600, position 16/28.
 * - `StaffHeaderCard`: biography header, Figma `2007:91584`: same gradient hero as `ChairCard` (984×380,
 *   photo 300×380), name 32/600 white, position 16 white 75%, 1px white 15% line, contact blocks (label 13/500 white 60%,
 *   value 15/500 white, icon circle 48 brand-100) gap 32. The old white bordered `1199:17650` is hidden in Figma.
 * Without a photo: initials (the card size does not change).
 */
import { Separator } from '@cbar/lib-react-ui-kit/separator'
import { CalendarIcon, PhoneIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'
import type { ComponentType, ReactNode, SVGProps } from 'react'

import { initials } from '@/features/organization/model/schemas'
import { SiteImage } from '@/shared/ui/site-image'

export type StaffCardData = { id: number; href: string; fullName: string | null; position: string | null; photoUrl: string | null }

function Initials({ name }: Readonly<{ name: string | null }>) {
  return (
    <span aria-hidden="true" className="text-primary-foreground absolute inset-0 flex items-center justify-center text-4xl font-semibold">
      {initials(name)}
    </span>
  )
}

type PhotoAlt = (name: string) => string

export function ChairCard({ member, photoAlt }: Readonly<{ member: StaffCardData; photoAlt: PhotoAlt }>) {
  return (
    <Link
      href={member.href}
      data-slot="chair-card"
      className="from-site-hero-from to-site-hero-to group flex w-full flex-col overflow-hidden rounded-xs bg-linear-to-br tab:min-h-[380px] tab:flex-row"
    >
      <span className="bg-site-photo-placeholder relative block h-[264px] shrink-0 tab:h-auto tab:w-[300px]">
        {member.photoUrl ? (
          // The chairman photo is the LCP of the page. `priority` is deprecated in Next 16, `loading="eager"` is recommended.
          <SiteImage
            src={member.photoUrl}
            alt={photoAlt(member.fullName ?? '')}
            fill
            sizes="(min-width: 46.5rem) 300px, 100vw"
            loading="eager"
            className="object-cover object-[center_25%]"
          />
        ) : (
          <Initials name={member.fullName} />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-4 p-6 tab:p-10">
        <span className="text-primary-foreground text-2xl leading-8 font-semibold group-hover:underline tab:text-[32px] tab:leading-[42px]">
          {member.fullName}
        </span>
        {member.position ? <span className="text-primary-foreground/75 text-base leading-[21px]">{member.position}</span> : null}
        <span aria-hidden="true" className="bg-primary-foreground/15 block h-px w-full" />
      </span>
    </Link>
  )
}

export function DeputyCard({ member, photoAlt }: Readonly<{ member: StaffCardData; photoAlt: PhotoAlt }>) {
  return (
    <Link href={member.href} data-slot="deputy-card" className="border-border bg-background group flex h-full gap-5 rounded-xs border p-5">
      <span className="bg-site-photo-placeholder relative block h-40 w-32 shrink-0 overflow-hidden rounded-xs">
        {member.photoUrl ? (
          <SiteImage src={member.photoUrl} alt={photoAlt(member.fullName ?? '')} fill sizes="128px" className="object-cover object-top" />
        ) : (
          <Initials name={member.fullName} />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-2">
        <span className="text-foreground group-hover:text-primary text-lg leading-6 font-semibold">{member.fullName}</span>
        {member.position ? <span className="text-site-text-strong text-base leading-7">{member.position}</span> : null}
      </span>
    </Link>
  )
}

/** Deputies: 2 columns (from tablet), 1 (mobile); gap 24, Figma `1988:2899`. */
export function DeputyGrid({ children }: Readonly<{ children: ReactNode }>) {
  return <ul className="grid grid-cols-1 gap-6 tab:grid-cols-2">{children}</ul>
}

export function StaffCard({ member, photoAlt }: Readonly<{ member: StaffCardData; photoAlt: PhotoAlt }>) {
  return (
    <Link href={member.href} data-slot="staff-card" className="border-border bg-background group flex h-full flex-col overflow-hidden rounded-xs border">
      <span className="bg-site-photo-placeholder relative block h-[200px] overflow-hidden">
        {member.photoUrl ? (
          <SiteImage src={member.photoUrl} alt={photoAlt(member.fullName ?? '')} fill sizes="(min-width: 85rem) 231px, (min-width: 46.5rem) 50vw, 100vw" className="object-cover object-top" />
        ) : (
          <Initials name={member.fullName} />
        )}
      </span>
      <span className="flex flex-col gap-1.5 px-4 pt-4 pb-[18px]">
        <span className="text-foreground group-hover:text-primary text-lg leading-6 font-semibold">{member.fullName}</span>
        {member.position ? <span className="text-site-text-strong text-base leading-7">{member.position}</span> : null}
      </span>
    </Link>
  )
}

/** 4 columns (desktop), 2 (tablet), 1 (mobile); gap 20, Figma `1814:4894` `Grid`. */
export function StaffGrid({ children }: Readonly<{ children: ReactNode }>) {
  return <ul className="grid grid-cols-1 gap-5 tab:grid-cols-2 desk:grid-cols-4">{children}</ul>
}

type ContactItem = { key: string; label: string; value: ReactNode; Icon: ComponentType<SVGProps<SVGSVGElement>> }

type StaffHeaderCardProps = Readonly<{
  fullName: string | null
  position: string | null
  photoUrl: string | null
  photoAlt: string
  receptionDays: { label: string; value: string } | null
  phone: { label: string; value: string; tel: string | null } | null
}>

export function StaffHeaderCard({ fullName, position, photoUrl, photoAlt, receptionDays, phone }: StaffHeaderCardProps) {
  const contacts: ContactItem[] = []
  if (receptionDays) contacts.push({ key: 'reception', label: receptionDays.label, value: receptionDays.value, Icon: CalendarIcon })
  if (phone) {
    const value = phone.tel ? (
      <a href={`tel:${phone.tel}`} className="hover:underline">
        {phone.value}
      </a>
    ) : (
      phone.value
    )
    contacts.push({ key: 'phone', label: phone.label, value, Icon: PhoneIcon })
  }

  return (
    // Figma `2007:91584`: 984×380, same blue gradient as the chairman card; photo 300×380 on the left, text p40 gap16.
    <section
      data-slot="staff-header-card"
      className="from-site-hero-from to-site-hero-to flex flex-col overflow-hidden rounded-xs bg-linear-to-br tab:min-h-[380px] tab:flex-row"
    >
      <span className="bg-site-photo-placeholder relative block h-[264px] shrink-0 tab:h-auto tab:w-[300px]">
        {photoUrl ? (
          <SiteImage src={photoUrl} alt={photoAlt} fill sizes="(min-width: 46.5rem) 300px, 100vw" className="object-cover object-[center_20%]" loading="eager" />
        ) : (
          <Initials name={fullName} />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 p-6 tab:p-10">
        {/* The page H1: the Figma biography page has no separate title. */}
        <h1 className="text-primary-foreground text-2xl leading-8 font-semibold tab:text-[32px] tab:leading-[42px]">{fullName}</h1>
        {position ? <p className="text-primary-foreground/75 text-base leading-[21px]">{position}</p> : null}
        <Separator className="bg-primary-foreground/15" />
        {contacts.length > 0 ? (
          <dl className="flex flex-col gap-6 tab:flex-row tab:gap-8">
            {contacts.map(({ key, label, value, Icon }) => (
              <div key={key} className="flex gap-3.5">
                <span className="bg-site-on-accent-muted text-primary flex size-12 shrink-0 items-center justify-center rounded-full">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <div className="flex max-w-[200px] flex-col gap-1">
                  <dt className="text-primary-foreground/60 text-[13px] leading-[17px] font-medium">{label}</dt>
                  <dd className="text-primary-foreground text-[15px] leading-[22px] font-medium">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  )
}
