/**
 * One section of the FinCERT page (spec 053 ui-contract §1): a named region with its fixed anchor, the heading and the
 * content 20 below it. The mission has no visible heading in Figma, so its region is named by `aria-label`. One
 * `Reveal` per section, never nested. The site header does not stick, so the anchor needs only the small margin the
 * other anchored blocks use.
 */
import type { ReactNode } from 'react'

import { Reveal } from '@/shared/ui/reveal'

import { SECTION_TITLE_CLASS } from './constants'

type FincertSectionProps = Readonly<{
  id: string
  title: string
  /** `false` hides the heading and names the region with `aria-label` instead. */
  showTitle?: boolean
  children: ReactNode
}>

export function FincertSection({ id, title, showTitle = true, children }: FincertSectionProps) {
  const headingId = `${id}-title`
  return (
    <Reveal
      as="section"
      id={id}
      data-slot="fincert-section"
      aria-labelledby={showTitle ? headingId : undefined}
      aria-label={showTitle ? undefined : title}
      className="flex scroll-mt-6 flex-col gap-5"
    >
      {showTitle ? (
        <h2 id={headingId} className={SECTION_TITLE_CLASS}>
          {title}
        </h2>
      ) : null}
      {children}
    </Reveal>
  )
}
