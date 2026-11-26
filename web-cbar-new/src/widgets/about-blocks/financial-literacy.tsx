/**
 * "Financial literacy" page body (spec 047, Figma `2236:67755` / tablet `2248:3277` / mobile `2248:3626`;
 * `contracts/ui-contract.md` §1): sections under `h2` headings, the definition quote, principle cards, target group
 * chips, the photo gallery and the closing banner. Blocks come from the editor's markup (`model/financial-literacy.ts`).
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'

import type { FinancialLiteracyBlock, LiteracyCta, LiteracyImage, LiteracyPart } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { CmsContent } from '@/widgets/cms-content/cms-content'
import { PhotoGallery } from '@/widgets/photo-gallery'

import { PrincipleIcon, TargetGroupIcon } from './literacy-icons'

/** Cards and chips: 1 column, 2 from tablet, 4 from desktop; all cards of a row are as tall as the tallest. */
const GRID = 'grid grid-cols-1 tab:grid-cols-2 desk:grid-cols-4'
const CARD = 'border-site-literacy-card-border bg-background rounded-xs border'

function Gallery({ images, title, locale }: Readonly<{ images: LiteracyImage[]; title: string; locale: Locale }>) {
  const t = getT(locale, 'about')
  const content = getT(locale, 'content')
  return (
    <PhotoGallery
      images={images.map((image, index) => ({ id: image.mediaId, url: image.src, alt: t('literacy.imageAlt', { title, n: index + 1 }) }))}
      labels={{
        label: content('newsList.gallery.label'),
        prev: content('newsList.gallery.prev'),
        next: content('newsList.gallery.next'),
        // The client fills these placeholders, so they are passed through as literals.
        position: content('newsList.gallery.position', { current: '{{current}}', total: '{{total}}' }),
        thumb: content('newsList.gallery.thumb', { n: '{{n}}' }),
        open: content('newsList.gallery.open'),
      }}
    />
  )
}

type PartProps = Readonly<{ part: LiteracyPart; title: string; locale: Locale }>

function Part({ part, title, locale }: PartProps) {
  switch (part.kind) {
    case 'html':
      return <CmsContent html={part.html} variant="about" />
    case 'subheading':
      return <h3 className="text-foreground text-lg leading-[26px] font-semibold">{part.text}</h3>
    case 'quote':
      return (
        <figure className="bg-site-surface border-site-accent-strong flex flex-col gap-3 rounded-xs border-l-4 p-5 tab:px-8 tab:py-7">
          <blockquote className="text-site-literacy-ink text-xl leading-8 font-semibold">
            <CmsContent html={part.html} variant="inherit" />
          </blockquote>
          {part.source ? <figcaption className="text-site-literacy-muted text-sm leading-7 font-medium">{part.source}</figcaption> : null}
        </figure>
      )
    case 'principles':
      return (
        <ul data-slot="literacy-principles" className={cn(GRID, 'gap-3 tab:gap-4 desk:gap-6')}>
          {part.items.map((item, index) => (
            <li key={`${index}-${item.title}`} className={cn(CARD, 'flex flex-col gap-4 p-6')}>
              <span className="bg-site-literacy-icon text-site-literacy-ink flex size-12 shrink-0 items-center justify-center rounded-full">
                <PrincipleIcon index={index} />
              </span>
              <span className="text-foreground text-lg leading-[26px] font-semibold">{item.title}</span>
              {item.description ? <span className="text-site-literacy-muted text-sm leading-[22px]">{item.description}</span> : null}
            </li>
          ))}
        </ul>
      )
    case 'chips':
      return (
        <ul data-slot="literacy-target-groups" className={cn(GRID, 'gap-3')}>
          {part.items.map((label, index) => (
            <li key={`${index}-${label}`} className={cn(CARD, 'flex min-h-[62px] items-center gap-2.5 p-3')}>
              <span className="bg-site-literacy-tint text-site-literacy-ink flex size-9 shrink-0 items-center justify-center rounded-full">
                <TargetGroupIcon index={index} />
              </span>
              <span className="text-foreground text-[13px] leading-[18px] font-semibold">{label}</span>
            </li>
          ))}
        </ul>
      )
    case 'gallery':
      return <Gallery images={part.images} title={title} locale={locale} />
  }
}

function Cta({ cta, locale }: Readonly<{ cta: LiteracyCta; locale: Locale }>) {
  const t = getT(locale, 'about')
  return (
    <section
      data-slot="literacy-cta"
      className={cn(
        'from-site-hero-from to-site-hero-to flex flex-col gap-5 rounded-xs bg-linear-160 px-5 py-6 text-white',
        'tab:p-8 desk:flex-row desk:items-center desk:gap-8 desk:px-12 desk:py-10',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {cta.eyebrow ? <p className="text-site-literacy-cta-muted text-base leading-6 font-medium">{cta.eyebrow}</p> : null}
        <h2 className="text-[22px] leading-[30px] font-semibold tab:text-[26px] tab:leading-9">{cta.title}</h2>
        <div className="text-site-literacy-cta-muted text-sm leading-[22px]">
          <CmsContent html={cta.addressHtml} variant="inherit" />
        </div>
      </div>
      <a
        href={`mailto:${cta.email}`}
        className={cn(
          'bg-site-accent text-site-literacy-ink inline-flex h-12 shrink-0 items-center justify-center rounded-xs px-6 text-base leading-7 font-medium',
          'w-full tab:w-auto tab:self-start desk:self-center',
          'focus-visible:outline-ring hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2',
        )}
      >
        {t('literacy.ctaButton', { email: cta.email })}
      </a>
    </section>
  )
}

type FinancialLiteracyProps = Readonly<{ block: FinancialLiteracyBlock; locale: Locale; title: string }>

export function FinancialLiteracy({ block, locale, title }: FinancialLiteracyProps) {
  return (
    <div data-slot="financial-literacy" className="flex flex-col gap-7 tab:gap-8 desk:gap-9">
      {block.sections.map((section, index) => {
        const parts = section.parts.map((part, i) => <Part key={`${i}-${part.kind}`} part={part} title={title} locale={locale} />)
        return section.heading ? (
          <section key={`${index}-${section.heading}`} className="flex flex-col gap-6">
            <h2 className="text-foreground text-xl leading-7 font-semibold tab:text-2xl tab:leading-8">{section.heading}</h2>
            {parts}
          </section>
        ) : (
          <div key={`${index}-intro`} className="flex flex-col gap-6">
            {parts}
          </div>
        )
      })}
      {block.cta ? <Cta cta={block.cta} locale={locale} /> : null}
    </div>
  )
}
