/**
 * Başlıq axtarışı — adi GET forması, JS-siz işləyir (spec 002 FR-025).
 *
 * Server komponentidir: kit `Input` client komponentidir, amma prop-ları
 * serializable olduğu üçün buradan render oluna bilər. `size="lg"` — çekmecədəki tam enli
 * variant (Figma `821:2847`: 56 hündürlük, 16 boşluq, 16 mətn, ikon 20).
 */
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { SearchIcon } from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

type HeaderSearchProps = { locale: Locale; size?: 'sm' | 'lg'; className?: string }

export function HeaderSearch({ locale, size = 'sm', className }: HeaderSearchProps) {
  const t = getT(locale, 'nav')

  return (
    <form
      role="search"
      action={`/${locale}/search`}
      method="get"
      aria-label={t('search.label')}
      className={className}
    >
      <Input
        type="search"
        name="q"
        size={size}
        placeholder={t('search.placeholder')}
        aria-label={t('search.label')}
        autoComplete="off"
        endElement={
          <IconButton type="submit" variant="ghost" size="xs" aria-label={t('search.submit')}>
            <SearchIcon className={size === 'lg' ? 'size-5' : 'size-4'} aria-hidden="true" />
          </IconButton>
        }
      />
    </form>
  )
}
