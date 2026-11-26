/**
 * Content list: card rows (title, date, category) with empty and error states.
 * Server component used by the list pages (press releases, laws, news). Rows below the first
 * screen reveal on scroll, staggered by position (spec 049, `shared/ui/reveal`).
 */
import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import Link from 'next/link'

import { EAGER_CARD_COUNT } from '@/shared/constants/layout'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { Reveal } from '@/shared/ui/reveal'
import { SiteImage } from '@/shared/ui/site-image'

export type ContentListItem = {
  key: string
  title: string
  href: string
  dateLabel: string | null
  badge?: string | null
  imageUrl?: string | null
}

type ContentListProps = {
  items: ContentListItem[] | null
  error: boolean
  emptyLabel: string
  errorLabel: string
  className?: string
}

export function ContentList({ items, error, emptyLabel, errorLabel, className }: ContentListProps) {
  if (error || items === null) {
    return <ErrorState kind="server" title={errorLabel} className={className} />
  }

  if (items.length === 0) {
    return <EmptyState title={emptyLabel} className={className} />
  }

  return (
    <ul data-slot="content-list" className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <Reveal as="li" key={item.key} index={index}>
          <Card className="hover:border-primary transition-colors">
            <CardContent className="flex gap-4 p-5">
              {item.imageUrl ? (
                // The box is the placeholder: the image is transparent until it loads.
                <div className="bg-muted relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded">
                  <SiteImage
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="112px"
                    loading={index < EAGER_CARD_COUNT ? 'eager' : undefined}
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0">
                <Link href={item.href} className="text-foreground text-base font-medium hover:underline">
                  {item.title}
                </Link>
                <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  {item.badge ? (
                    <Badge variant="subtle" colorPalette="primary" size="sm">
                      {item.badge}
                    </Badge>
                  ) : null}
                  {item.dateLabel ? <span>{item.dateLabel}</span> : null}
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ))}
    </ul>
  )
}
