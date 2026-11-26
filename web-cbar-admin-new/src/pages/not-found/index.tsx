import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { ExploreIcon } from '@cbar/lib-react-ui-kit/icons'
import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { brand } from '@/shared/config/brand'

export function NotFoundPage() {
  const { t } = useTranslation('common')
  const route = useRouterState({ select: (state) => state.location.pathname })

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center">
          <span className="bg-muted text-muted-foreground mx-auto grid size-12 place-items-center rounded-full">
            <ExploreIcon />
          </span>
          <CardTitle>{t('notFound.title', { path: route })}</CardTitle>
          <CardDescription>
            {t('notFound.description', { appName: brand.appName })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">{t('notFound.back')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
