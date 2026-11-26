/**
 * Sayt başlığı — server komponenti (spec 002 FR-006, research R9; spec 022 FR-005, Figma `12:1065`).
 *
 * İki zolaq: üstdə loqo + əlavə keçidlər, axtarış, dil, canlı yayım, E-CBAR; altda
 * tünd göy nav çubuğu (hamburger + mega-menyu). Client hissələr yalnız kiçik
 * parçalardır: dil keçidi (sorğu parametrləri üçün `useSearchParams`), hamburger
 * çekmecəsi, canlı yayım düyməsi (spec 006 — yalnız aktiv yayım olanda); axtarış
 * adi GET formasıdır. Dar ekranda gizlənən hissələr çekmecədə təkrar verilir.
 *
 * 744-dən dar ekranda (Figma `839:8335` "menu - mob") hər iki zolaq yerinə tək tünd göy
 * zolaq var: ağ loqo solda, hamburger sağda. Axtarış, dil və E-CBAR çekmecədədir.
 *
 * Figma-da çağrı mərkəzi gizlidir (`12:1054`, visible: false) — qaynar xətt çekmecədə
 * və footer-də qalır.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import Link from 'next/link'

import type { PageNode } from '@/entities/page-node'
import { externalLinks, logoPath, topLinks } from '@/shared/config/contacts'
import { LOGO_SIZE } from '@/shared/constants/layout'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { LiveStreamButton } from '@/widgets/live-stream/live-stream-button'

import { HeaderSearch } from './header-search'
import { LanguageSwitcher } from './language-switcher'
import { MegaMenu } from './mega-menu'
import { MobileNav } from './mobile-nav'
import { buildNavSections } from './nav'

type SiteHeaderProps = {
  locale: Locale
  tree: PageNode[]
  /** Aktiv canlı yayım var — düymə göstərilir (popup `SiteShell`-dədir). */
  hasLiveStream?: boolean
}

export function SiteHeader({ locale, tree, hasLiveStream = false }: SiteHeaderProps) {
  const t = getT(locale, 'nav')
  const { visible, all } = buildNavSections(tree, locale)

  return (
    <header data-slot="site-header" className="bg-background shadow-site-header relative z-30">
      {/* Figma `12:2901`: 20 + 78 (zolaq) + 16 = 114, sonra nav 74 → header 188. */}
      {/* Figma `839:8335`: 390 eni, 24 yan boşluq, loqo 180 × 44, ikon 24. Figma-dakı 63
          yuxarı boşluq telefonun status zolağı üçündür — saytda 16/16. */}
      <div className="bg-primary flex items-center justify-between gap-4 px-6 py-4 tab:hidden" data-slot="site-header-mobile">
        <Link href={`/${locale}`} className="min-w-0 shrink">
          {/* eslint-disable-next-line @next/next/no-img-element -- statik yerli SVG */}
          <img src={logoPath(locale, 'inverse')} alt={t('logoAlt')} width={LOGO_SIZE.width} height={LOGO_SIZE.height} className="h-auto w-45" />
        </Link>
        {/* Düymə 36, ikon 24: ikonun sağ kənarı 24 yan boşluqla üst-üstə düşsün. */}
        <MobileNav locale={locale} sections={all} hasLiveStream={hasLiveStream} className="-mr-1.5">
          <HeaderSearch locale={locale} size="lg" />
          <LanguageSwitcher locale={locale} variant="pill" className="self-end" />
        </MobileNav>
      </div>

      <div className="mx-auto flex h-[114px] w-full max-w-site items-center justify-between gap-6 px-4 pt-5 pb-4 max-tab:hidden desk:px-0" data-slot="site-header-top">
        {/* Çox dar ekranda (<340px) loqo sıxılır ki, sağdakı düymələr kənara çıxmasın. */}
        <Link href={`/${locale}`} className="min-w-0 shrink">
          {/* eslint-disable-next-line @next/next/no-img-element -- statik yerli SVG */}
          <img
            src={logoPath(locale)}
            alt={t('logoAlt')}
            // SVG viewBox ölçüləri: en `className`-dən gəlir, bu atributlar yalnız
            // nisbəti verir ki, loqo yüklənənə qədər yer tutsun (layout sıçramasın).
            width={LOGO_SIZE.width}
            height={LOGO_SIZE.height}
            className="h-auto w-36 sm:w-44 lg:w-60"
          />
        </Link>

        <div className="flex items-center gap-6">
          <nav aria-label={t('topLinks.label')} className="max-desk:hidden">
            <ul className="flex items-center gap-6">
              {topLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}/${link.slug[locale]}`}
                    className="text-foreground hover:text-primary py-2 text-sm font-medium hover:underline"
                  >
                    {t(`topLinks.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <HeaderSearch locale={locale} className="w-[170px] max-md:hidden" />

          {hasLiveStream ? <LiveStreamButton className="max-sm:hidden" /> : null}

          <LanguageSwitcher locale={locale} className="text-base" />

          <Button asChild colorPalette="primary" size="lg" className="h-12 px-5 text-base max-sm:hidden">
            <a href={externalLinks.ecbar} target="_blank" rel="noopener noreferrer">
              {t('ecbar')}
            </a>
          </Button>
        </div>
      </div>

      <MegaMenu locale={locale} visible={visible} all={all} />
    </header>
  )
}
