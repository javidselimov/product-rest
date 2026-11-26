/**
 * Daxili (`/…`) keçid `Link`, xarici keçid yeni pəncərədə — CMS-dən gələn ünvanlar üçün.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'

type SmartLinkProps = {
  href: string
  className?: string
  children: ReactNode
  'aria-label'?: string
}

export function isInternalHref(href: string): boolean {
  return href.startsWith('/')
}

export function SmartLink({ href, className, children, ...rest }: SmartLinkProps) {
  if (isInternalHref(href)) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}

/** CMS-dən gələn nisbi ünvana locale prefiksi verir; mütləq olduğu kimi qalır. */
export function localizeHref(href: string | null | undefined, locale: string, fallback: string): string {
  if (!href) return fallback
  if (/^https?:\/\//.test(href)) return href
  if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href
  return `/${locale}${href.startsWith('/') ? href : `/${href}`}`
}
