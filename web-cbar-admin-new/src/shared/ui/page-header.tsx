import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@cbar/lib-react-ui-kit/breadcrumb'
import { Link, useRouter } from '@tanstack/react-router'
import { Fragment, type ReactNode } from 'react'

import { brand } from '@/shared/config/brand'

interface PageHeaderProps {
  title: string
  description?: string
  /** Brend kökü ilə cari səhifə arasındakı zəncir; cari səhifə avtomatik əlavə olunur. */
  trail?: { label: string; path: string }[]
  actions?: ReactNode
}

export function PageHeader({
  title,
  description,
  trail = [],
  actions,
}: PageHeaderProps) {
  const router = useRouter()
  return (
    <div className="border-border flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList size="xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{brand.shortName}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {trail.map((crumb) => (
              <Fragment key={crumb.path}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={crumb.path}
                    onClick={(e) => {
                      e.preventDefault()
                      router.history.push(crumb.path)
                    }}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Fragment>
            ))}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground max-w-2xl text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
