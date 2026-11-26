import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import { FolderOpenIcon } from '@cbar/lib-react-ui-kit/icons'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/** Boş siyahı vəziyyəti (template konstitusiyası VII.4: empty state məcburidir). */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="bg-muted text-muted-foreground grid size-12 place-items-center rounded-full">
          <FolderOpenIcon />
        </span>
        <p className="text-foreground text-sm font-medium">{title}</p>
        {description ? (
          <p className="text-muted-foreground max-w-md text-sm">
            {description}
          </p>
        ) : null}
        {action}
      </CardContent>
    </Card>
  )
}
