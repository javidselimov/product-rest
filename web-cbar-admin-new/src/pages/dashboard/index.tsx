import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { ClockIcon, EditIcon, HistoryIcon } from '@cbar/lib-react-ui-kit/icons'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/shared/ui/page-header'

/**
 * İdarə paneli — köhnə paneldəki kimi yer tutucu (spec FR-037): üç izah kartı,
 * real məlumat bağlanması bu spec-in əhatəsində deyil.
 */
export function DashboardPage() {
  const { t } = useTranslation('dashboard')

  const cards = [
    { key: 'publishQueue', icon: ClockIcon },
    { key: 'latestEdits', icon: EditIcon },
    { key: 'auditLog', icon: HistoryIcon },
  ] as const

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <section className="grid gap-6 md:grid-cols-3">
        {cards.map(({ key, icon: Icon }) => (
          <Card key={key}>
            <CardHeader>
              <span className="bg-muted text-muted-foreground grid size-10 place-items-center rounded-lg">
                <Icon size={20} />
              </span>
              <CardTitle>{t(`${key}.title`)}</CardTitle>
              <CardDescription>{t(`${key}.description`)}</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              {t(`${key}.body`)}
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  )
}
