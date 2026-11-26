/**
 * The "Saytın menyusunda" card (spec 004 US4, FR-010; spec 041; spec 054 US5). The editor picks the page's
 * place in the site's menus (three radio options, each a pair of flags), and from the form's current values
 * the card shows, per locale, whether the page will be in the public top menu and in its section's left
 * menu, and why not. On a section root "none" only takes it out of the wide-screen hamburger panel, which the
 * top row notes (spec 056). The rules are in `model/menu-visibility.ts`.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Badge } from '@cbar/lib-react-ui-kit/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@cbar/lib-react-ui-kit/field'
import {
  RadioGroup,
  RadioGroupItem,
} from '@cbar/lib-react-ui-kit/radio-group'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { LOCALES, type Locale } from '@/entities/content/model/types'
import { usePagesTree } from '../hooks/use-pages'
import {
  MENU_BAR_SECTIONS,
  MENU_LOCATION_FLAGS,
  MENU_LOCATIONS,
  menuLocationOf,
  menuVisibility,
  rootPanelHidden,
  sideMenuVisibility,
  menuTreePlacementUnder,
  type MenuLocation,
  type MenuPageInput,
  type MenuTreePlacement,
} from '../model/menu-visibility'

type LocationFlags = (typeof MENU_LOCATION_FLAGS)[MenuLocation]

interface MenuVisibilityCardProps {
  page: MenuPageInput
  parentId: number | null
  /** The editor picked an option: both flags of its pair are set. */
  onLocationChange: (flags: LocationFlags) => void
}

interface RowProps {
  testId: string
  label: string
  visible: boolean
  reasons: string[]
  notes: string[]
}

function VisibilityRow({
  testId,
  label,
  visible,
  reasons,
  notes,
}: Readonly<RowProps>) {
  const { t } = useTranslation('pages')
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid={testId}>
      <span className="text-muted-foreground w-24">{label}</span>
      <Badge size="sm" variant="subtle" colorPalette={visible ? 'green' : 'red'}>
        {visible ? t('menuVisibility.visible') : t('menuVisibility.hidden')}
      </Badge>
      {visible ? null : (
        <span className="text-foreground">
          {t('menuVisibility.hiddenBecause', {
            reasons: reasons
              .map((reason) => t(`menuVisibility.reasons.${reason}`))
              .join(', '),
          })}
        </span>
      )}
      {notes.map((note) => (
        <span key={note} className="text-muted-foreground basis-full">
          {note}
        </span>
      ))}
    </div>
  )
}

interface LocationFieldProps {
  flags: MenuPageInput['flags']
  isSectionRoot: boolean
  onLocationChange: MenuVisibilityCardProps['onLocationChange']
}

/**
 * The hint under an option. On a section root two options read differently: "dropdown only" does not exist there
 * (spec 048) and "none" only leaves the wide-screen hamburger panel (spec 056).
 */
function hintKey(option: MenuLocation, isSectionRoot: boolean): string {
  if (isSectionRoot && option === 'dropdownOnly') return 'dropdownOnlyRoot'
  if (isSectionRoot && option === 'none') return 'noneRoot'
  return `${option}Hint`
}

/** The three options of contracts/admin-ux.md §3, as one native radio group under a legend. */
function LocationField({
  flags,
  isSectionRoot,
  onLocationChange,
}: Readonly<LocationFieldProps>) {
  const { t } = useTranslation('pages')
  const id = useId()
  const legendId = `${id}-legend`
  // null: the stored "left menu only" pair, which no option gives; it is kept until the editor picks one.
  const location = menuLocationOf(flags)

  return (
    <FieldSet>
      <FieldLegend id={legendId} variant="label">
        {t('menuVisibility.location.legend')}
      </FieldLegend>
      <RadioGroup
        aria-labelledby={legendId}
        value={location}
        onValueChange={(value) => {
          const picked = MENU_LOCATIONS.find((option) => option === value)
          if (picked) onLocationChange(MENU_LOCATION_FLAGS[picked])
        }}
        className="gap-3"
      >
        {MENU_LOCATIONS.map((option) => {
          // The dropdown rule applies below a section root only (spec 048), so a root cannot be "dropdown only".
          const disabled = option === 'dropdownOnly' && isSectionRoot
          const itemId = `${id}-${option}`
          const hint = t(`menuVisibility.location.${hintKey(option, isSectionRoot)}`)
          return (
            <Field key={option} orientation="horizontal">
              <RadioGroupItem
                id={itemId}
                value={option}
                disabled={disabled}
                aria-describedby={`${itemId}-hint`}
              />
              <div className="space-y-1">
                <FieldLabel htmlFor={itemId}>
                  {t(`menuVisibility.location.${option}`)}
                </FieldLabel>
                <FieldDescription id={`${itemId}-hint`}>{hint}</FieldDescription>
              </div>
            </Field>
          )
        })}
      </RadioGroup>
      {location === null ? (
        <Alert variant="surface" colorPalette="yellow">
          <AlertDescription>
            {t('menuVisibility.location.sideOnly')}
          </AlertDescription>
        </Alert>
      ) : null}
    </FieldSet>
  )
}

export function MenuVisibilityCard({
  page,
  parentId,
  onLocationChange,
}: Readonly<MenuVisibilityCardProps>) {
  const { t } = useTranslation('pages')
  const trees = { az: usePagesTree('az').data, en: usePagesTree('en').data }

  // Until the trees load, only the page's own rules are checked.
  const placement =
    trees.az && trees.en
      ? ({
          az: menuTreePlacementUnder(trees.az, parentId, 'az'),
          en: menuTreePlacementUnder(trees.en, parentId, 'en'),
        } satisfies Record<Locale, MenuTreePlacement | null>)
      : null
  const top = menuVisibility(page, placement)
  const side = sideMenuVisibility(page, placement)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('menuVisibility.title')}</CardTitle>
        <CardDescription>{t('menuVisibility.hint')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LocationField
          flags={page.flags}
          isSectionRoot={parentId === null}
          onLocationChange={onLocationChange}
        />
        <div className="space-y-3">
          {LOCALES.map((locale) => (
            <div
              key={locale}
              className="flex gap-2 text-sm"
              data-testid={`menu-visibility-${locale}`}
            >
              <span className="text-muted-foreground w-8 font-medium">
                {locale.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <VisibilityRow
                  testId={`menu-visibility-${locale}-top`}
                  label={t('menuVisibility.rows.top')}
                  visible={top[locale].visible}
                  reasons={top[locale].reasons}
                  notes={[
                    ...(top[locale].promotedToRoot
                      ? [t('menuVisibility.promotedToRoot')]
                      : []),
                    ...(rootPanelHidden(
                      page.flags,
                      placement?.[locale] ?? null,
                      parentId === null,
                    )
                      ? [
                          t('menuVisibility.rootPanelHidden', {
                            count: MENU_BAR_SECTIONS,
                          }),
                        ]
                      : []),
                  ]}
                />
                <VisibilityRow
                  testId={`menu-visibility-${locale}-side`}
                  label={t('menuVisibility.rows.side')}
                  visible={side[locale].visible}
                  reasons={side[locale].reasons}
                  notes={
                    side[locale].openOnly
                      ? [t('menuVisibility.sideNavOpenOnly')]
                      : []
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
