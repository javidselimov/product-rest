'use client'

/**
 * News slider: kit primitives and tokens (spec 002 D4, FR-021; spec 022 Figma `813:25368`).
 *
 * The image fills the area under a brand overlay and a gradient from the left; the text is white.
 * Below are a divider, a counter ("1/3") and previous/next buttons. Auto-advance is 6 s and
 * stops under `prefers-reduced-motion`. Links are plain `Link`s, so the first slide and its
 * links work without JS.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { CaretLeftIcon, CaretRightIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SmartLink } from '@/widgets/smart-link/smart-link'
import { REDUCED_MOTION_QUERY } from '@/shared/constants/motion'
import { SiteImage } from '@/shared/ui/site-image'

export type HeroSlide = {
  key: string
  title: string | null
  description: string | null
  href: string
  imageUrl: string | null
  dateLabel: string | null
}

const INTERVAL_MS = 6000

const NAV_BUTTON =
  'border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground size-11 rounded-sm border bg-transparent'

export function HeroSlider({ slides, className }: { slides: HeroSlide[]; className?: string }) {
  const { t } = useTranslation('home')
  const [index, setIndex] = useState(0)
  const count = slides.length

  useEffect(() => {
    if (count <= 1) return
    if (window.matchMedia?.(REDUCED_MOTION_QUERY).matches) return
    const id = window.setInterval(() => setIndex((p) => (p + 1) % count), INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [count, index])

  if (count === 0) return null

  const go = (delta: number) => setIndex((p) => (p + delta + count) % count)

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('slider.label')}
      data-slot="hero-slider"
      className={cn('bg-primary relative h-[744px] overflow-hidden', className)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <article
            key={slide.key}
            aria-roledescription="slide"
            aria-label={t('slider.position', { index: i + 1, count })}
            aria-hidden={i !== index}
            inert={i !== index}
            className="relative h-full w-full shrink-0"
          >
            {slide.imageUrl ? (
              <SiteImage
                src={slide.imageUrl}
                alt=""
                fill
                skeleton={false}
                // The first slide is the LCP element of the page; leaving it lazy hurts the metric directly.
                priority={i === 0}
                // The next slide is fetched ahead, so the move never shows the bare background.
                loading={i === (index + 1) % count ? 'eager' : undefined}
                sizes="(min-width: 1360px) 70vw, 100vw"
                className="object-cover"
              />
            ) : null}
            <div className="bg-site-overlay-brand absolute inset-0" aria-hidden="true" />
            <div className="from-primary absolute inset-y-0 left-0 w-[505px] max-w-full bg-linear-to-r to-transparent" aria-hidden="true" />

            <div className="text-primary-foreground relative flex max-w-[836px] flex-col gap-10 px-6 pt-20 tab:px-[92px] tab:pt-[149px]">
              <div className="flex flex-col gap-6">
                {/* The line clamps keep the button above the bottom line (149 + 3×54 + 2×36 + 96 < 620). */}
                <h2 className="line-clamp-3 text-[28px]/9 font-bold tab:text-[40px]/[54px]">
                  <SmartLink href={slide.href} className="hover:underline">
                    {slide.title}
                  </SmartLink>
                </h2>
                {slide.description ? (
                  <p className="line-clamp-2 text-lg tab:text-2xl/9">{slide.description}</p>
                ) : null}
              </div>
              <Button
                asChild
                colorPalette="secondary"
                size="xl"
                className="text-primary-foreground h-14 w-fit min-w-[270px] text-lg font-medium"
              >
                <SmartLink href={slide.href}>{t('readMore')}</SmartLink>
              </Button>
            </div>
          </article>
        ))}
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-6 bottom-12 flex flex-col gap-6 tab:right-[60px] tab:left-[86px]">
          <div className="border-primary-foreground/45 border-t" aria-hidden="true" />
          <div className="text-primary-foreground flex items-center justify-end gap-10">
            <p className="text-lg/6 font-semibold" aria-live="polite">
              {index + 1}/{count}
            </p>
            <div className="flex gap-2.5">
              <IconButton type="button" variant="outline" className={NAV_BUTTON} aria-label={t('slider.prev')} onClick={() => go(-1)}>
                <CaretLeftIcon aria-hidden="true" />
              </IconButton>
              <IconButton type="button" variant="outline" className={NAV_BUTTON} aria-label={t('slider.next')} onClick={() => go(1)}>
                <CaretRightIcon aria-hidden="true" />
              </IconButton>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
