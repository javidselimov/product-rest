'use client'

/**
 * Mobil naviqasiya — kit `Sheet` + `Accordion` ilə tam ağac (spec 002 FR-010).
 *
 * Yeganə client hissə çekmecənin açılıb-bağlanmasıdır; keçidlər adi `Link`-dir
 * və seçiləndə çekmecə bağlanır. Başlıqda dar ekranda gizlənən axtarış (`children`
 * və dil keçidi — `children` slotu ilə), qaynar xətt və E-CBAR burada təkrar verilir ki,
 * mobil istifadəçi onlara çata bilsin. Aktiv yayım varsa "Canlı yayım" düyməsi də
 * buradadır (spec 006) — klikdə çekmecə bağlanır, sonra dialoq açılır.
 */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@cbar/lib-react-ui-kit/accordion'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { MenuIcon, PhoneIcon } from '@cbar/lib-react-ui-kit/icons'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@cbar/lib-react-ui-kit/sheet'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { contacts, externalLinks } from '@/shared/config/contacts'
import type { Locale } from '@/shared/i18n'
import { LiveStreamButton } from '@/widgets/live-stream/live-stream-button'

import type { NavSection } from './nav'

const LINK = 'text-foreground hover:bg-accent hover:text-accent-foreground block rounded-sm px-2 py-1.5 text-sm'

function SectionLink({ item, className }: { item: NavSection; className?: string }) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {item.title}
      </a>
    )
  }

  return (
    <SheetClose asChild>
      <Link href={item.href} className={className}>
        {item.title}
      </Link>
    </SheetClose>
  )
}

function Children({ items, depth }: { items: NavSection[]; depth: number }) {
  if (items.length === 0) return null

  return (
    <ul className={depth > 2 ? 'ml-3 border-l border-border pl-2' : undefined}>
      {items.map((item) => (
        <li key={item.key}>
          <SectionLink item={item} className={LINK} />
          <Children items={item.children} depth={depth + 1} />
        </li>
      ))}
    </ul>
  )
}

type MobileNavProps = {
  locale: Locale
  sections: NavSection[]
  className?: string
  /** Aktiv canlı yayım var — düymə çekmecənin altında göstərilir. */
  hasLiveStream?: boolean
  /** Çekmecənin yuxarısında göstərilən axtarış forması (server komponenti). */
  children?: ReactNode
}

export function MobileNav({ locale, sections, className, hasLiveStream = false, children }: MobileNavProps) {
  const { t } = useTranslation('nav')

  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* Mobil zolağın tünd göy fonunda (spec 022, Figma `839:8335`: ikon 24). */}
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          className={`text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground ${className ?? ''}`}
          aria-label={t('openMenu')}
          data-slot="mobile-nav-trigger"
        >
          <MenuIcon className="size-6" aria-hidden="true" />
        </IconButton>
      </SheetTrigger>

      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('menu')}</SheetTitle>
        </SheetHeader>

        {/* Kit SheetContent gövdəyə üfüqi boşluq vermir; başlıqla (16px) hizalayırıq. */}
        <div className="px-4 pb-6">
          {/* Figma `821:2846`: axtarış tam enli, altında 24 boşluqla dil keçidi sağda. */}
          {children ? <div className="mt-2 flex flex-col gap-6">{children}</div> : null}

          <nav aria-label={t('mobileMenu')} className="mt-2">
            <SheetClose asChild>
              <Link href={`/${locale}`} className={`${LINK} font-semibold`}>
                {t('home')}
              </Link>
            </SheetClose>

            <Accordion type="multiple" variant="list" className="mt-2">
              {sections.map((section) =>
                section.children.length === 0 ? (
                  <div key={section.key} className="border-border border-b py-1">
                    <SectionLink item={section} className={`${LINK} font-medium`} />
                  </div>
                ) : (
                  <AccordionItem key={section.key} value={section.key}>
                    <AccordionTrigger className="text-sm font-medium">{section.title}</AccordionTrigger>
                    <AccordionContent>
                      <SectionLink item={section} className={LINK} />
                      <Children items={section.children} depth={2} />
                    </AccordionContent>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          </nav>

          <div className="border-border mt-6 flex flex-col gap-3 border-t pt-5">
            {hasLiveStream ? (
              <SheetClose asChild>
                <LiveStreamButton className="w-full" />
              </SheetClose>
            ) : null}
            <a
              href={`tel:${contacts.hotlineShort}`}
              className="text-foreground flex items-center gap-2 px-2 text-sm font-medium"
              aria-label={`${t('hotline')} ${contacts.hotline}`}
            >
              <PhoneIcon className="size-4" aria-hidden="true" />
              <span>
                {t('hotline')}: {contacts.hotline}
              </span>
            </a>
            <Button asChild colorPalette="primary">
              <a href={externalLinks.ecbar} target="_blank" rel="noopener noreferrer">
                {t('ecbar')}
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
