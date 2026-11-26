/**
 * "Bu səhifənin məzmunu" card (spec 046 FR-013): on a page whose table or cards come from a panel
 * section of its own, it names that section by its menu path and links to it; on the membership page
 * it explains the table rule instead. Pages outside `model/managed-sections.ts` get no card.
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { managedSectionFor } from '../model/managed-sections'

export function ManagedSectionCard({
  slug,
}: Readonly<{ slug?: string | null }>) {
  const { t } = useTranslation(['pages', 'nav'])
  const section = managedSectionFor(slug)
  if (!section) return null

  return (
    <Card data-testid="managed-section">
      <CardHeader>
        <CardTitle>{t('pages:managedSection.title')}</CardTitle>
        {section.kind === 'link' ? (
          <CardDescription>
            {t(`pages:${section.textKey ?? 'managedSection.linkText'}`, {
              path: `${t(`nav:groups.${section.group}`)} → ${t(`nav:${section.item}.label`)}`,
            })}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="text-sm">
        {section.kind === 'link' ? (
          <Link to={section.to} search={section.search} className="text-primary underline-offset-4 hover:underline">
            {t('pages:managedSection.open', {
              name: t(`nav:${section.item}.label`),
            })}
          </Link>
        ) : (
          <p className="text-muted-foreground">{t(`pages:${section.noteKey}`)}</p>
        )}
      </CardContent>
    </Card>
  )
}
