/**
 * Paylaşma düymələri (spec 024 FR-003, research R7, Figma `social links`).
 *
 * Kənar SDK yoxdur: hər şəbəkənin öz paylaşma ünvanına adi keçid (Maddə X.4), serverdə
 * render olunur, JS-siz işləyir. Kit `IconButton` `asChild` ilə keçidə forma verir.
 */
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { EnvelopeIcon, FacebookIcon, LinkedinIcon, WhatsappIcon } from '@cbar/lib-react-ui-kit/icons'
import type { ComponentType, SVGProps } from 'react'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

import { PrintButton } from './print-button'

/** Figma: 36×36, r6 (kitdə `rounded-sm`), `#F9F9F9` fon, 16px `#787878` ikon — 16px ikonu kit `IconButton` `sm` özü verir. */
export const SHARE_BUTTON_CLASS = 'size-9 rounded-sm bg-site-surface text-muted-foreground hover:bg-muted hover:text-foreground'

type ShareLink = { key: 'facebook' | 'linkedin' | 'whatsapp' | 'email'; href: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }

export function shareLinks(pageUrl: string, title: string): ShareLink[] {
  const url = encodeURIComponent(pageUrl)
  const text = encodeURIComponent(title + ' ' + pageUrl)
  return [
    { key: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, Icon: FacebookIcon },
    { key: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, Icon: LinkedinIcon },
    { key: 'whatsapp', href: `https://wa.me/?text=${text}`, Icon: WhatsappIcon },
    { key: 'email', href: `mailto:?subject=${encodeURIComponent(title)}&body=${url}`, Icon: EnvelopeIcon },
  ]
}

type ShareButtonsProps = Readonly<{ locale: Locale; pageUrl: string; title: string }>

export function ShareButtons({ locale, pageUrl, title }: ShareButtonsProps) {
  const t = getT(locale, 'section')

  return (
    <ul data-slot="share-buttons" aria-label={t('share.label')} className="flex items-center gap-2.5">
      {shareLinks(pageUrl, title).map(({ key, href, Icon }) => {
        const external = key !== 'email'
        const label = t(`share.${key}`)
        return (
          <li key={key}>
            <IconButton asChild variant="ghost" size="sm" className={SHARE_BUTTON_CLASS}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={external ? `${label} (${t('share.newTab')})` : label}
              >
                <Icon aria-hidden="true" />
              </a>
            </IconButton>
          </li>
        )
      })}
      <li>
        <PrintButton label={t('share.print')} className={SHARE_BUTTON_CLASS} />
      </li>
    </ul>
  )
}
