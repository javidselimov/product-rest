import { Outlet, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { findNavItem } from '@/app/routes/nav'
import { brand } from '@/shared/config/brand'
import { CommandPalette } from './command-palette'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppShell() {
  const route = useRouterState({ select: (state) => state.location.pathname })
  const { t, i18n } = useTranslation(['common', 'nav'])
  const [commandOpen, setCommandOpen] = useState(false)

  /** ⌘K / Ctrl+K hər yerdə paleti açır — topbar-ın reklam etdiyi qısayol. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  /** Səhifə başlığı route-u izləyir ki, brauzer tarixçəsi oxunaqlı olsun. */
  useEffect(() => {
    const item = findNavItem(route)
    document.title = item
      ? `${t(`${item.key}.label`, { ns: 'nav' })} · ${brand.appName}`
      : t('pageTitleFallback', { appName: brand.appName })
  }, [route, t, i18n.language])

  return (
    <>
      <div className="bg-background flex min-h-svh">
        <Sidebar className="hidden w-64 shrink-0 border-r lg:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenCommand={() => setCommandOpen(true)} />
          <main className="w-full flex-1 space-y-8 px-4 py-8 md:px-8">
            <Outlet />
          </main>
          <footer className="border-border text-muted-foreground border-t px-4 py-6 text-xs md:px-8">
            {t('footer', {
              year: new Date().getFullYear(),
              orgName: t('brand.orgName'),
            })}
          </footer>
        </div>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
