/**
 * Section template (spec 024 US1, contracts/ui-contract.md §2; spec 028 uses the same sizes for Media).
 *
 * Desktop (`desk`, Figma 1728): the tools row, below it a 312 menu + 24 + 984 content.
 * Tablet (`tab`, 744) and mobile (390): tools, menu, title and content stacked.
 * Side padding per Figma: on top of the site container 16px, +24 on tablet (=40), +8 on mobile (=24).
 */
import type { ReactNode } from 'react'

import { PUBLICATIONS_BODY_CLASS, SHELL_BODY_CLASS, SHELL_CLASS } from './constants'
import type { SectionShellData } from './model'
import { PageTools } from './page-tools'
import { SectionNav } from './section-nav'

type SectionShellProps = Readonly<{
  shell: SectionShellData
  /** `null`: the H1 of the page is in the content (biography header card). */
  title: string | null
  children: ReactNode
  /** Title size: most pages 32/600, the division page 28/600 (Figma `996:9576`). */
  titleSize?: 'lg' | 'md'
}>

export function SectionShell({ shell, title, children, titleSize = 'lg' }: SectionShellProps) {
  const titleClass = titleSize === 'lg' ? 'tab:text-[32px] tab:leading-11' : 'tab:text-[28px] tab:leading-11'
  // The publications section's Figma (spec 054 ui-contract §1): mobile title 24/32 with 24 below it, 40 menu → title on tablet.
  const publications = shell.section === 'publications'
  const mobileTitleClass = publications ? 'mb-6 text-2xl leading-8' : 'mb-8 text-[22px] leading-7'
  const bodyClass = publications ? `${SHELL_BODY_CLASS} ${PUBLICATIONS_BODY_CLASS}` : SHELL_BODY_CLASS

  return (
    <div data-slot="section-shell" className={SHELL_CLASS}>
      <PageTools shell={shell} />

      <div className={bodyClass}>
        <SectionNav locale={shell.locale} items={shell.nav} section={shell.section} />

        <article className="min-w-0">
          {title == null ? null : (
            <h1 className={`text-foreground ${mobileTitleClass} font-semibold tab:mb-9 ${titleClass}`}>{title}</h1>
          )}
          {children}
        </article>
      </div>
    </div>
  )
}
