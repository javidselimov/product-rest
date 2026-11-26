/**
 * Əlaqə və xarici keçidlərin **tək mənbəyi** (spec 002 contracts/routes.md §5).
 *
 * Dəyərlər köhnə `web-cbar`-dən (`Header.tsx`, `Footer.tsx`) köçürülüb — bunlar
 * redaksiya məzmunu deyil, saytın sabit çərçivə məlumatlarıdır. Ünvan mətni
 * i18n-dədir (`footer:address`), çünki dilə görə dəyişir.
 */
import type { Locale } from '@/shared/i18n'

export const contacts = {
  /** Başlıqdakı qısa nömrə (`tel:` keçidi). */
  hotlineShort: '966',
  hotline: '(+994 12) 966',
  phone: '(+994 12) 493 5058',
  /** Daxili nömrə köhnə saytın footer-indən və Figma-dan: 2243 (əvvəlki 572 səhv idi, spec 022). */
  press: { phone: '(+994 12) 966', extension: '2243' },
} as const

export const externalLinks = {
  ecbar: 'https://www.e-cbar.az/',
  onlineFeedback: 'https://contact.e-cbar.az/',
  survey: 'https://e-cbar.az/Survey',
} as const

export type TopLinkKey = 'career' | 'media' | 'contact'

/**
 * Başlığın üst zolağındakı keçidlər (Figma `12:1063`, spec 022 FR-005). CMS bölmələrinə
 * gedir, slug-lar dilə görə fərqlidir (test API ağacından, 2026-10-12).
 */
export const topLinks: readonly { key: TopLinkKey; slug: Record<Locale, string> }[] = [
  { key: 'career', slug: { az: 'insan-resurslari', en: 'human-resources' } },
  { key: 'media', slug: { az: 'media', en: 'media' } },
  { key: 'contact', slug: { az: 'elaqe', en: 'contacts' } },
]

/**
 * Altlıqdakı "Faydalı linklər" (Figma `659:13324`, spec 022 FR-009). Başlıqlar və ünvanlar
 * CMS-in ana səhifə bannerlərindən (test API, 2026-10-12); MEAS saytın öz səhifəsidir.
 * `href` `/` ilə başlayırsa daxili yoldur və locale prefiksi alır.
 */
export const footerUsefulLinks: readonly { key: string; title: Record<Locale, string>; href: string }[] = [
  { key: 'survey', title: { az: 'Sorğu platforması', en: 'Online surveys' }, href: externalLinks.survey },
  {
    key: 'meas',
    title: { az: 'Məlumatların Elektron Açıqlanması Sistemi', en: 'Electronic Information Disclosure System' },
    href: '/securities',
  },
  {
    key: 'infobank',
    title: {
      az: 'Maliyyə məhsul və xidmətlərinin məlumat-axtarış sistemi',
      en: 'Financial products and services information system',
    },
    href: 'https://infobank.az/',
  },
  {
    key: 'literacy',
    title: { az: 'Maliyyə savadlılığı portalı', en: 'Financial literacy portal' },
    href: 'https://bizimpullar.az/',
  },
  {
    key: 'edu',
    title: { az: 'Virtual Təhsil Platforması', en: 'Virtual Education Platform' },
    href: 'https://edu.e-cbar.az/',
  },
  {
    key: 'mpcr',
    title: {
      az: 'Daşınar əmlakın yüklüyünün dövlət reyestri',
      en: 'State register of pledges of movable property',
    },
    href: 'https://mpcr.e-cbar.az/',
  },
  {
    key: 'ranking',
    title: {
      az: 'Biznes mühiti və beynəlxalq reytinqlər üzrə Komissiya',
      en: 'Commission on business environment and international ratings',
    },
    href: 'https://azranking.az/',
  },
  {
    key: 'dxr',
    title: { az: 'Dövlət xidmətləri portalı', en: 'State services portal' },
    href: 'https://www.dxr.az/',
  },
]

/**
 * Alt zolağın keçidləri (Figma `659:13347`). Köhnə saytda var idi
 * (`/pages/privacy-policy`, `/home/sitemap`), yeni sistemdə hələ hədəf səhifə yoxdur —
 * `href: null` render olunmur, ölü keçid qoyulmur. Səhifə yarananda yol burada yazılır.
 */
export const legalLinks: readonly { key: 'privacy' | 'sitemap'; href: string | null }[] = [
  { key: 'privacy', href: null },
  { key: 'sitemap', href: null },
]

export type SocialKey = 'facebook' | 'instagram' | 'x' | 'telegram' | 'youtube' | 'linkedin'

export type SocialLink = {
  key: SocialKey
  /** `/site/…` ikonu (köhnə saytdan köçürülmüş statik SVG). */
  icon: string
  href: (locale: Locale) => string
}

/** Altlıqdakı 6 sosial şəbəkə — sıra köhnə saytdakı kimidir. */
export const socialLinks: readonly SocialLink[] = [
  {
    key: 'facebook',
    icon: '/site/facebook_new.svg',
    href: () =>
      'https://www.facebook.com/Az%C9%99rbaycan-Respublikas%C4%B1n%C4%B1n-M%C9%99rk%C9%99zi-Bank%C4%B1-107763107801037',
  },
  { key: 'instagram', icon: '/site/instagram.svg', href: () => 'https://www.instagram.com/cbar.az_official' },
  {
    key: 'x',
    icon: '/site/x.svg',
    href: (locale) => `https://x.com/${locale === 'az' ? 'Merkezi_Bank_AZ' : 'Central_Bank_AZ'}`,
  },
  { key: 'telegram', icon: '/site/telegram.svg', href: () => 'https://t.me/MerkeziBank_AZ' },
  { key: 'youtube', icon: '/site/youtube_new.svg', href: () => 'https://www.youtube.com/@merkezi_bank' },
  { key: 'linkedin', icon: '/site/linkedin.svg', href: () => 'https://www.linkedin.com/company/cbaraz' },
]

/**
 * Loqo — locale-ə görə fərqli fayl. `inverse` tünd fon üçündür (footer, spec 022):
 * yazı ağdır, emblem eynidir (`logo-*-inverse.svg` orijinaldan yalnız yazı rəngi ilə fərqlənir).
 */
export function logoPath(locale: Locale, variant: 'default' | 'inverse' = 'default'): string {
  return variant === 'inverse' ? `/site/logo-${locale}-inverse.svg` : `/site/logo-${locale}.svg`
}
