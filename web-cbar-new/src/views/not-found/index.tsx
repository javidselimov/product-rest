'use client'

/**
 * 404 görünüşü — `[locale]` layout-u daxilində (qabıq ilə) render olunur.
 * `notFound()` çağıran hər detal səhifəsi bura düşür.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { defaultLocale, isSupportedLocale } from '@/shared/i18n'
import { EmptyState } from '@/shared/ui/empty-state'

export function NotFoundView() {
  const { t } = useTranslation('errors')
  const params = useParams<{ locale?: string }>()
  const locale = isSupportedLocale(params?.locale) ? params.locale : defaultLocale

  return (
    <section data-slot="not-found" className="py-12">
      <p className="text-muted-foreground text-center text-6xl font-semibold">404</p>
      <EmptyState
        className="mt-6 border-0"
        title={t('notFound.title')}
        description={t('notFound.description')}
        action={
          <Button asChild>
            <Link href={`/${locale}`}>{t('notFound.home')}</Link>
          </Button>
        }
      />
    </section>
  )
}
