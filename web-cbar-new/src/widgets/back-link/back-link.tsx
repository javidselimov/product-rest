import { ChevronLeftIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-primary mt-8 inline-flex items-center gap-1 text-sm font-medium hover:underline">
      <ChevronLeftIcon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  )
}
