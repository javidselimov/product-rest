/**
 * Altlıq — server komponenti (spec 002 FR-007; spec 022 FR-009, Figma `813:24811`).
 *
 * Teal xətt + tünd göy fon: loqo və sosial şəbəkələr, ayırıcı, üç sütun (Əlaqə,
 * Naviqasiya, Faydalı linklər), alt zolaq. Naviqasiya CMS ağacının sabit bölmə
 * dəstindən (`footerSections`), əlaqə dəyərləri və keçidlər `shared/config/contacts`-dən,
 * mətnlər `footer` namespace-indən.
 *
 * Figma-da gizli olanlar render olunmur: "Bizimlə əlaqə" kartı, "Mətbuat üçün"
 * sətri, "User Policy". Sosial ikonlar köhnə saytın SVG-ləridir — rəngi `mask` ilə
 * token-dən alırlar ki, tünd fonda Figma kimi açıq görünsünlər.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import Link from 'next/link'

import type { PageNode } from '@/entities/page-node'
import {
  contacts,
  externalLinks,
  footerUsefulLinks,
  legalLinks,
  logoPath,
  socialLinks,
} from '@/shared/config/contacts'
import { LOGO_SIZE } from '@/shared/constants/layout'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

import { footerSections } from './nav'
import { NavAnchor } from './nav-anchor'

const HEADING = 'text-site-on-brand-heading text-xl/6 font-bold'
const LINK = 'text-base/7 font-semibold hover:underline focus-visible:underline'

type SiteFooterProps = {
  locale: Locale
  tree: PageNode[]
}

export function SiteFooter({ locale, tree }: SiteFooterProps) {
  const t = getT(locale, ['footer', 'nav'])
  const sections = footerSections(tree, locale)
  const year = new Date().getFullYear()
  const legal = legalLinks.filter((link) => link.href !== null)

  return (
    <footer
      data-slot="site-footer"
      className="border-site-accent bg-primary text-primary-foreground mt-20 border-t-[10px]"
    >
      <div className="mx-auto flex w-full max-w-site flex-col gap-7.5 px-4 py-12.5 desk:px-0">
        <div className="flex flex-wrap items-center justify-between gap-9">
          <Link href={`/${locale}`} className="min-w-0 shrink">
            {/* eslint-disable-next-line @next/next/no-img-element -- statik yerli SVG */}
            <img
              src={logoPath(locale, 'inverse')}
              alt={t('nav:logoAlt')}
              // Başlıqdakı ilə eyni: viewBox nisbəti, en `className`-dədir.
              width={LOGO_SIZE.width}
              height={LOGO_SIZE.height}
              className="h-auto w-56 tab:w-67"
            />
          </Link>

          <ul aria-label={t('footer:socialLabel')} className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <li key={social.key}>
                <a
                  href={social.href(locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(`footer:social.${social.key}`)}
                  className="block opacity-100 transition-opacity hover:opacity-80"
                >
                  {/* SVG forma kimi (mask), rəng token-dən: ikon faylları dəyişmir. */}
                  <span
                    aria-hidden="true"
                    className="bg-site-on-brand-muted block size-9 mask-contain mask-center mask-no-repeat"
                    style={{ maskImage: `url(${social.icon})` }}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-site-divider border-t" aria-hidden="true" />

        <div className="grid gap-10 tab:grid-cols-2 desk:grid-cols-[424px_309px_312px] desk:justify-between">
          <div className="flex flex-col gap-6">
            <h2 className={HEADING}>{t('footer:contact')}</h2>
            <address className="flex flex-col gap-6 text-base/7 not-italic">
              <p>
                {t('footer:addressLabel')}: {t('footer:address')}
              </p>
              <p className="flex flex-wrap gap-x-4">
                <span>{t('footer:hotline')}:</span>
                <a href={`tel:${contacts.hotlineShort}`} className="font-semibold hover:underline">
                  {contacts.hotline}
                </a>
              </p>
              <p className="flex flex-wrap gap-x-5">
                <span>{t('footer:phone')}:</span>
                <a href={`tel:${contacts.phone.replace(/[^\d+]/g, '')}`} className="font-semibold hover:underline">
                  {contacts.phone}
                </a>
              </p>
            </address>

            <div className="flex flex-wrap gap-6">
              <Button asChild colorPalette="secondary" size="lg" className="text-primary h-12 w-50 px-5 text-base">
                <a href={externalLinks.onlineFeedback} target="_blank" rel="noopener noreferrer">
                  {t('footer:onlineFeedback')}
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                colorPalette="secondary"
                size="lg"
                className="border-site-on-brand-outline text-site-accent hover:bg-primary-foreground/10 hover:text-site-accent h-12 w-50 bg-transparent px-5 text-base"
              >
                <a href={externalLinks.survey} target="_blank" rel="noopener noreferrer">
                  {t('footer:questionary')}
                </a>
              </Button>
            </div>
          </div>

          <nav aria-label={t('footer:navigation')} className="flex flex-col gap-6">
            <h2 className={HEADING}>{t('footer:navigation')}</h2>
            <ul className="flex flex-col gap-4">
              {sections.map((item) => (
                <li key={item.key}>
                  <NavAnchor item={item} className={LINK}>
                    {item.title}
                  </NavAnchor>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer:usefulLinks')} className="flex flex-col gap-6">
            <h2 className={HEADING}>{t('footer:usefulLinks')}</h2>
            <ul className="flex flex-col gap-4">
              {footerUsefulLinks.map((link) => (
                <li key={link.key}>
                  <NavAnchor
                    item={
                      link.href.startsWith('/')
                        ? { href: `/${locale}${link.href}`, external: false }
                        : { href: link.href, external: true }
                    }
                    className={LINK}
                  >
                    {link.title[locale]}
                  </NavAnchor>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-site-divider border-t" aria-hidden="true" />

        <div className="flex flex-wrap items-center justify-between gap-x-20 gap-y-3">
          {legal.length > 0 ? (
            <ul aria-label={t('footer:legalLabel')} className="flex flex-wrap gap-10 text-xs">
              {legal.map((link) => (
                <li key={link.key}>
                  <Link href={`/${locale}${link.href}`} className="hover:underline">
                    {t(`footer:${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-sm/7 tab:ml-auto">
            © {year} {t('footer:allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  )
}
