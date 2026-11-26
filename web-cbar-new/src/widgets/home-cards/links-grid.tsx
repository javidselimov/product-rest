/**
 * Publications, quick links, useful links and the promo banner: server components.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'

import { SmartLink } from '@/widgets/smart-link/smart-link'
import { SiteImage } from '@/shared/ui/site-image'

import { SectionHeading } from './section-heading'

export type PublicationCard = {
  key: string
  title: string | null
  href: string
  imageUrl: string | null
  dateLabel: string
}
export type QuickLink = {
  key: string
  title: string | null
  href: string | null
}
export type UsefulLink = {
  key: string
  title: string | null
  href: string | null
  host: string
}
export type PromoBanner = {
  title: string | null
  description: string | null
  href: string
  /** With an image the banner is a full image as in Figma (coin banner, `813:26806`, spec 022). */
  imageUrl?: string | null
}

export function Publications({
  title,
  items,
}: {
  title: string
  items: PublicationCard[]
}) {
  return (
    <section aria-label={title}>
      <SectionHeading title={title} />
      {/*
        Mobile (<sm): horizontal snap scrolling, so 5 tall cards do not take 3 rows; edge bleed uses
        -mx-4/px-4, and scroll-pl-4 keeps snap from eating the left gap. sm+: an auto-fill grid
        where cards fill the width and a lone column does not stay empty.
      */}
      <ul className="-mx-4 mt-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] sm:overflow-visible sm:px-0 sm:pb-0">
        {items.map((pub) => (
          <li key={pub.key} className="w-40 shrink-0 snap-start sm:w-auto">
            <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
              <SmartLink href={pub.href} className="block h-full">
                <div className="bg-muted aspect-[3/4] w-full overflow-hidden p-3">
                  {pub.imageUrl ? (
                    // The `relative` box is inside `p-3`, so the padding is kept.
                    <div className="relative h-full w-full">
                      <SiteImage
                        src={pub.imageUrl}
                        alt={pub.title ?? ''}
                        fill
                        sizes="160px"
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                </div>
                <CardContent className="p-4">
                  <p className="text-foreground line-clamp-2 text-sm font-medium">
                    {pub.title}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {pub.dateLabel}
                  </p>
                </CardContent>
              </SmartLink>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function QuickLinks({
  title,
  items,
}: {
  title: string
  items: QuickLink[]
}) {
  return (
    <section aria-label={title}>
      <SectionHeading title={title} />
      {/* Full-width row: with auto-fit the links share the width and wrap when there are many */}
      <ul className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-4">
        {items.map((link) => (
          <li key={link.key}>
            {link.href ? (
              <SmartLink
                href={link.href}
                className="bg-muted text-primary hover:bg-accent hover:text-accent-foreground flex h-full items-center justify-between gap-3 rounded-md px-5 py-4 text-sm font-medium transition-colors"
              >
                <span>{link.title}</span>
                <span aria-hidden="true">↗</span>
              </SmartLink>
            ) : (
              <span className="bg-muted text-primary flex h-full items-center justify-between gap-3 rounded-md px-5 py-4 text-sm font-medium">
                {link.title}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function UsefulLinks({
  title,
  items,
}: {
  title: string
  items: UsefulLink[]
}) {
  return (
    <section aria-label={title}>
      <SectionHeading title={title} />
      {/* auto-fit: a few banners share the width, many wrap */}
      <ul className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-6">
        {items.map((banner) => {
          const body = (
            <CardContent className="flex h-full flex-col justify-center px-5 py-5">
              <h3 className="text-foreground text-[15px] leading-snug font-semibold">
                {banner.title}
              </h3>
              {banner.host ? (
                <span className="text-primary mt-1.5 text-sm">
                  {banner.host}
                </span>
              ) : null}
            </CardContent>
          )
          return (
            <li key={banner.key}>
              <Card className="h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
                {banner.href ? (
                  <SmartLink href={banner.href} className="block h-full">
                    {body}
                  </SmartLink>
                ) : (
                  body
                )}
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function PromoBannerCard({
  banner,
  goLabel,
}: {
  banner: PromoBanner
  goLabel: string
}) {
  if (banner.imageUrl) {
    return (
      <div data-slot="promo-banner">
        <SmartLink
          href={banner.href}
          aria-label={banner.title ?? goLabel}
          className="relative block aspect-[1320/220] w-full overflow-hidden"
        >
          <SiteImage src={banner.imageUrl} alt="" fill sizes="(min-width: 1360px) 1320px, 100vw" className="object-cover" />
        </SmartLink>
      </div>
    )
  }

  return (
    <Card
      data-slot="promo-banner"
      className="bg-primary text-primary-foreground border-primary"
    >
      <CardContent className="flex flex-col items-start gap-4 px-8 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{banner.title}</h2>
          {banner.description ? (
            <p className="mt-1 text-sm opacity-80">{banner.description}</p>
          ) : null}
        </div>
        <Button
          asChild
          variant="outline"
          className="border-primary-foreground text-primary-foreground shrink-0"
        >
          <SmartLink href={banner.href}>{goLabel}</SmartLink>
        </Button>
      </CardContent>
    </Card>
  )
}
