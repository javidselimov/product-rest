import { Avatar, AvatarFallback } from '@cbar/lib-react-ui-kit/avatar'
import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@cbar/lib-react-ui-kit/dropdown-menu'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import {
  GlobeIcon,
  LogoutIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from '@cbar/lib-react-ui-kit/icons'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@cbar/lib-react-ui-kit/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@cbar/lib-react-ui-kit/tooltip'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { logoutEverywhere } from '@/app/providers/auth-bridge'
import { ROLE_LABEL_KEYS, initials } from '@/entities/user/model/types'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { brand } from '@/shared/config/brand'
import { SUPPORTED_LANGUAGES } from '@/shared/i18n'
import { useUiStore } from '@/shared/model/ui-store'
import { Sidebar } from './sidebar'

interface TopbarProps {
  onOpenCommand: () => void
}

export function Topbar({ onOpenCommand }: TopbarProps) {
  const { t, i18n } = useTranslation('common')
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const user = useAuthStore((state) => state.user)
  const [navOpen, setNavOpen] = useState(false)

  return (
    <header className="border-border bg-background/90 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetTrigger asChild>
          <IconButton
            variant="ghost"
            colorPalette="black"
            aria-label={t('navigation.open')}
            className="lg:hidden"
          >
            <MenuIcon />
          </IconButton>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('navigation.title')}</SheetTitle>
            <SheetDescription>
              {t('navigation.description', { appName: brand.appName })}
            </SheetDescription>
          </SheetHeader>
          <Sidebar onNavigate={() => setNavOpen(false)} className="h-full" />
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        colorPalette="black"
        onClick={onOpenCommand}
        className="text-muted-foreground w-full max-w-xs justify-start gap-2"
      >
        <SearchIcon size={16} />
        <span className="flex-1 text-left">{t('search')}</span>
        <kbd className="rounded-2xs border-border border px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>
      </Button>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              variant="ghost"
              colorPalette="black"
              aria-label={t('language.label')}
            >
              <GlobeIcon />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={i18n.language}
              onValueChange={(value) => void i18n.changeLanguage(value)}
            >
              {SUPPORTED_LANGUAGES.map((lng) => (
                <DropdownMenuRadioItem key={lng} value={lng}>
                  {t(`language.${lng}`)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              variant="ghost"
              colorPalette="black"
              aria-label={
                theme === 'dark'
                  ? t('theme.switchToLight')
                  : t('theme.switchToDark')
              }
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>
            {theme === 'dark' ? t('theme.light') : t('theme.dark')}
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t('account.menu')}
              className="focus-visible:outline-ring ml-1 flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Avatar size="sm" colorPalette="primary">
                <AvatarFallback>
                  {user ? initials(user.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-foreground hidden text-sm font-medium md:inline">
                {user?.name ?? t('account.user')}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <span className="block">{user?.name ?? t('account.user')}</span>
              {user ? (
                <span className="text-muted-foreground block text-xs font-normal">
                  {t(ROLE_LABEL_KEYS[user.roleCode])}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => void logoutEverywhere()}
            >
              <LogoutIcon size={16} />
              {t('account.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
