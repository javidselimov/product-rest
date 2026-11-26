'use client'

/**
 * Dil dəyişdiricisi (spec 002 FR-008): yalnız **digər** dil göstərilir; keçid
 * cari yolun locale seqmentini dəyişir, sorğu parametrləri olduğu kimi qalır.
 * Cookie yazılmır — dil yalnız URL-dir (research R5). Adi keçiddir: JS-siz işləyir.
 *
 * `next/link` deyil, adi `<a>`: dil dəyişəndə səhifə **tam yüklənir**. Client
 * naviqasiyasında root `<html lang>` yenilənmir, müyəssərlik menyusu isə dili yalnız
 * init-də oxuyur — ikisi də köhnə dildə qalardı (spec 007 research R4).
 *
 * `variant="pill"` — çekmecədəki kontur düymə (Figma `821:2848`): 999 radius, 8/16 boşluq,
 * 16/28 medium mətn, sağda 24-lük ox.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { CaretRightIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { LANGUAGE_ENDONYM, isSupportedLocale, otherLocale, type Locale } from '@/shared/i18n'

/** `/az/laws` + `?page=2` → `/en/laws?page=2`. Prefikssiz yol olarsa prefiks əlavə olunur. */
export function switchLocaleHref(pathname: string, search: string, target: Locale): string {
  // Sondakı boş seqment (`/az/`) atılır ki, nəticə `/en/` olmasın.
  const segments = pathname.split('/').filter((segment, index) => index === 0 || segment !== '')
  if (isSupportedLocale(segments[1])) {
    segments[1] = target
  } else {
    segments.splice(1, 0, target)
  }
  const path = segments.join('/') || `/${target}`
  return search ? `${path}?${search}` : path
}

type LanguageSwitcherProps = { locale: Locale; variant?: 'ghost' | 'pill'; className?: string }

const PILL =
  'border-site-language-outline text-foreground hover:bg-accent h-auto gap-1.5 rounded-full border px-4 py-2 text-base/7 font-medium'

export function LanguageSwitcher({ locale, variant = 'ghost', className }: LanguageSwitcherProps) {
  const { t } = useTranslation('common')
  const pathname = usePathname() ?? `/${locale}`
  const searchParams = useSearchParams()
  const target = otherLocale(locale)
  const href = switchLocaleHref(pathname, searchParams?.toString() ?? '', target)

  return (
    <Button asChild variant="ghost" size="sm" className={cn(variant === 'pill' && PILL, className)}>
      <a
        href={href}
        hrefLang={target}
        lang={target}
        aria-label={t('language.switchTo', { language: LANGUAGE_ENDONYM[target] })}
        data-slot="language-switcher"
      >
        {target.toUpperCase()}
        {variant === 'pill' ? <CaretRightIcon className="size-6" aria-hidden="true" /> : null}
      </a>
    </Button>
  )
}
