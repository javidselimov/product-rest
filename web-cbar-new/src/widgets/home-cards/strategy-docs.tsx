/**
 * "Strategiya və sənədlər" (Figma `813:25097`, spec 022 FR-014), server component.
 *
 * The first document is the large card (424: image 240, title, full-width button with an arrow),
 * the rest are narrow document cards (200: cover 236, title). The documents are managed in the
 * admin panel (spec 057); without a cover a placeholder background shows. A site page opens in
 * the same tab, an external address in a new one (`SmartLink`).
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { ArrowRightIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'

import { SiteImage } from '@/shared/ui/site-image'
import { SmartLink } from '@/widgets/smart-link/smart-link'

export type StrategyDoc = {
  key: string
  title: string
  summary: string | null
  /** Cover; a placeholder without one. */
  coverUrl: string | null
  href: string
}

function Cover({ doc, className, sizes }: { doc: StrategyDoc; className: string; sizes: string }) {
  return (
    <div className={cn('bg-border relative shrink-0 overflow-hidden', className)}>
      {doc.coverUrl ? <SiteImage src={doc.coverUrl} alt="" fill sizes={sizes} className="object-cover" /> : null}
    </div>
  )
}

const TITLE = 'text-site-text-strong text-lg/6 font-semibold'

type StrategyDocsProps = {
  title: string
  moreLabel: string
  docs: StrategyDoc[]
}

export function StrategyDocs({ title, moreLabel, docs }: StrategyDocsProps) {
  if (docs.length === 0) return null
  const [featured, ...rest] = docs

  return (
    <section aria-label={title} data-slot="strategy-docs" className="flex min-w-0 flex-col gap-9">
      <h2 className="text-foreground text-[32px]/11 font-semibold">{title}</h2>
      {/*
        Tablet (Figma `831:4378`): the large card is full width, document cards below in 2 columns.
        The fixed 424 + 200 + 200 row is desktop only; on tablet it overflowed the 872px container.
      */}
      <ul className="grid gap-6 tab:grid-cols-2 desk:flex desk:flex-row">
        <li className="border-site-divider bg-background flex flex-col justify-between gap-9 overflow-hidden rounded-xs border pb-4 tab:col-span-2 desk:w-106 desk:shrink-0">
          <div className="flex flex-col gap-6">
            <Cover doc={featured} className="h-60 w-full" sizes="(min-width: 1360px) 424px, 100vw" />
            <h3 className={`${TITLE} px-4`}>
              <SmartLink href={featured.href} className="hover:text-primary hover:underline">
                {featured.title}
              </SmartLink>
            </h3>
          </div>
          <Button asChild colorPalette="primary" size="lg" className="mx-4 h-12 text-base font-medium">
            <SmartLink href={featured.href}>
              {moreLabel}
              <ArrowRightIcon aria-hidden="true" />
            </SmartLink>
          </Button>
        </li>

        {rest.map((doc) => (
          <li
            key={doc.key}
            className="border-site-divider bg-background flex flex-col gap-6 overflow-hidden rounded-xs border desk:w-50 desk:shrink-0"
          >
            {/* On tablet the card widens up to 328; the cover keeps its 200:236 ratio and is not cropped. */}
            <Cover doc={doc} className="h-59 w-full tab:h-auto tab:aspect-[200/236]" sizes="(min-width: 1360px) 200px, (min-width: 744px) 50vw, 100vw" />
            {/* Figma `813:25170`: fixed 177px text area, so the card is 1 + 236 + 24 + 177 + 1 = 439. */}
            <div className="flex min-h-[177px] flex-col gap-4 px-4">
              <h3 className={TITLE}>
                <SmartLink href={doc.href} className="hover:text-primary hover:underline">
                  {doc.title}
                </SmartLink>
              </h3>
              {doc.summary ? <p className="text-foreground line-clamp-5 text-base/7">{doc.summary}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
