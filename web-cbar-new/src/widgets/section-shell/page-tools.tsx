/**
 * Breadcrumb and share row, Figma `breadcrumb, social links` (spec 024 FR-002, FR-003; spec 028).
 *
 * One row on desktop (100px, breadcrumb left, share right), stacked on tablet and mobile.
 */
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@cbar/lib-react-ui-kit/breadcrumb'
import { CaretRightIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'
import { Fragment } from 'react'

import { getT } from '@/shared/i18n/server'

import { PAGE_TOOLS_CLASS } from './constants'
import type { SectionShellData } from './model'
import { ShareButtons } from './share-buttons'

type PageToolsProps = Readonly<{ shell: SectionShellData }>

export function PageTools({ shell }: PageToolsProps) {
  const t = getT(shell.locale, 'section')

  return (
    <div
      data-slot="page-tools"
      data-print="hide"
      className={PAGE_TOOLS_CLASS}
    >
      <Breadcrumb aria-label={t('breadcrumb.label')}>
        <BreadcrumbList className="gap-1">
          {shell.crumbs.map((crumb, index) => (
            <Fragment key={`${index}-${crumb.label}`}>
              {index > 0 ? (
                <BreadcrumbSeparator className="text-muted-foreground">
                  <CaretRightIcon />
                </BreadcrumbSeparator>
              ) : null}
              {/* Figma crumbs have no padding of their own (4px gap); this replaces the inner `px-4` of the kit `size`. */}
              <BreadcrumbItem className="px-0! font-medium">
                {crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <ShareButtons locale={shell.locale} pageUrl={shell.share.pageUrl} title={shell.share.title} />
    </div>
  )
}
