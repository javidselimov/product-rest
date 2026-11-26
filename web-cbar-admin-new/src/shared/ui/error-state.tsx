/**
 * Query error state (guideline §15: hər sorğu üçün error vəziyyəti görünməlidir).
 * Kit primitivlərindən qurulub; mesaj normalize olunmuş AppError-dən gəlir.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { InfoCircleIcon } from '@cbar/lib-react-ui-kit/icons'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'

interface ErrorStateProps {
  error: unknown
  onRetry: () => void
  className?: string
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation('common')
  const message = isAppError(error) ? error.message : t('errors.unexpected')

  return (
    <Card className={className}>
      <CardHeader className="items-center text-center">
        <span className="bg-destructive/10 text-destructive mx-auto grid size-10 place-items-center rounded-full">
          <InfoCircleIcon size={20} />
        </span>
        <CardTitle className="text-base">{t('errors.loadFailed')}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button variant="outline" colorPalette="black" onClick={onRetry}>
          {t('errors.retry')}
        </Button>
      </CardContent>
    </Card>
  )
}
