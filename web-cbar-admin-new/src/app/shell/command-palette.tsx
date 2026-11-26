import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@cbar/lib-react-ui-kit/command'
import { MoonIcon, SunIcon } from '@cbar/lib-react-ui-kit/icons'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { NAV_GROUPS, navItems, type NavItem } from '@/app/routes/nav'
import { useUiStore } from '@/shared/model/ui-store'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { t } = useTranslation(['common', 'nav'])
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)

  const run = (action: () => void) => {
    onOpenChange(false)
    action()
  }

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const label = t(`${item.key}.label`, { ns: 'nav' })
    const description = t(`${item.key}.description`, { ns: 'nav' })
    return (
      <CommandItem
        key={item.path}
        value={`${label} ${description}`}
        onSelect={() => run(() => navigate({ to: item.path }))}
      >
        <Icon size={16} />
        <span>{label}</span>
        <CommandShortcut>{item.path}</CommandShortcut>
      </CommandItem>
    )
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('commandPalette.title')}
      description={t('commandPalette.description')}
    >
      <CommandInput placeholder={t('commandPalette.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('commandPalette.empty')}</CommandEmpty>
        <CommandGroup heading={t('commandPalette.goTo')}>
          {navItems.filter((item) => !item.group).map(renderItem)}
        </CommandGroup>
        {/* Every group keeps its title here, one-item groups included: it gives a search hit its section. */}
        {NAV_GROUPS.map((group) => (
          <CommandGroup
            key={group}
            heading={t(`groups.${group}`, { ns: 'nav' })}
          >
            {navItems.filter((item) => item.group === group).map(renderItem)}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading={t('commandPalette.actions')}>
          <CommandItem
            value={t('theme.dark') + ' ' + t('theme.light')}
            keywords={['dark', 'light', 'tema', 'theme']}
            onSelect={() => run(toggleTheme)}
          >
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            <span>
              {theme === 'dark'
                ? t('theme.switchToLight')
                : t('theme.switchToDark')}
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
