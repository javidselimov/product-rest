/**
 * Müyəssərlik menyusu kartı (spec 007 US2, contracts/admin-setting.md): ictimai
 * saytdakı CERT.az widget-ini yandırıb-söndürür. Ayrı endpoint yoxdur — ümumi
 * `PUT /settings/accessibility.widget { value: { enabled } }` (audit olunur).
 * Optimistik deyil: sorğu gedərkən keçid bağlıdır, sonra server vəziyyəti göstərilir.
 * İcazə gate-i (`settings.manage`) səhifədədir.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { Switch } from '@cbar/lib-react-ui-kit/switch'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { formatDateTime } from '@/shared/crud/date-io'
import { useSettingSave, useSettingsList } from '../hooks/use-settings'
import {
  ACCESSIBILITY_WIDGET_KEY,
  findAccessibilityWidgetSetting,
  readAccessibilityWidgetEnabled,
} from '../model/accessibility-widget'

export function AccessibilityWidgetCard() {
  const { t, i18n } = useTranslation('settings')
  const list = useSettingsList()
  const save = useSettingSave()
  const items = list.data ?? []
  const enabled = readAccessibilityWidgetEnabled(items)
  const updatedAt = findAccessibilityWidgetSetting(items)?.updatedAt

  const onChange = (next: boolean) =>
    save.mutate(
      { key: ACCESSIBILITY_WIDGET_KEY, value: { enabled: next } },
      {
        onSuccess: () => {
          toast.success(
            t(
              next
                ? 'accessibilityWidget.activated'
                : 'accessibilityWidget.deactivated',
            ),
          )
        },
        onError: (error) => {
          toast.error(
            isAppError(error) ? error.message : t('common:errors.unexpected'),
          )
        },
      },
    )

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t('accessibilityWidget.title')}</CardTitle>
        <CardDescription>{t('accessibilityWidget.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Switch
            checked={enabled}
            onCheckedChange={onChange}
            disabled={!list.isSuccess || save.isPending}
            aria-label={t('accessibilityWidget.toggle')}
            colorPalette="green"
          />
          <span className="text-foreground text-sm font-medium">
            {t(
              enabled
                ? 'accessibilityWidget.active'
                : 'accessibilityWidget.inactive',
            )}
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          {updatedAt
            ? t('accessibilityWidget.lastChanged', {
                date: formatDateTime(updatedAt, i18n.language),
              })
            : t('accessibilityWidget.neverChanged')}
          {' · '}
          {t('accessibilityWidget.cacheHint')}
        </p>
      </CardContent>
    </Card>
  )
}
