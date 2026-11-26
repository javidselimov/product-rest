/**
 * Parametrlər səhifəsi (contracts/admin-api.md §8, data-model.md §6): açar →
 * JSON dəyər cədvəli (kit `DataTable`), "Yeni parametr" və sətir redaktəsi
 * `SettingDialog` ilə. Vəziyyətlər: loading / empty / error / success (VII.4).
 * Cədvəldən əvvəl müyəssərlik menyusu kartı (spec 007) — yalnız `settings.manage` ilə.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  DataTable,
  type DataTableColumn,
} from '@cbar/lib-react-ui-kit/data-table'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { EditIcon, PlusIcon } from '@cbar/lib-react-ui-kit/icons'
import { ScrollArea } from '@cbar/lib-react-ui-kit/scroll-area'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Can } from '@/features/auth/components/can'
import { AccessibilityWidgetCard } from '@/features/settings/components/accessibility-widget-card'
import { SettingDialog } from '@/features/settings/components/setting-dialog'
import { useSettingsList } from '@/features/settings/hooks/use-settings'
import type { SettingItem } from '@/features/settings/model/schemas'
import { formatDateTime } from '@/shared/crud/date-io'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { PageHeader } from '@/shared/ui/page-header'
import { COLUMN_WIDTH } from './constants'

/** Dialoq vəziyyəti: bağlı (null), yeni (`item: null`), redaktə (`item`). */
type Editor = { item: SettingItem | null } | null

const prettyJson = (value: unknown): string =>
  value === undefined ? '—' : JSON.stringify(value, null, 2)

export function SettingsPage() {
  const { t, i18n } = useTranslation('settings')
  const list = useSettingsList()
  const [editor, setEditor] = useState<Editor>(null)

  const columns = useMemo<DataTableColumn<SettingItem>[]>(
    () => [
      {
        key: 'key',
        title: t('columns.key'),
        width: COLUMN_WIDTH.KEY,
        render: (_value, record) => (
          <code className="text-foreground font-mono text-sm">
            {record.key}
          </code>
        ),
      },
      {
        key: 'value',
        title: t('columns.value'),
        render: (_value, record) => (
          <ScrollArea
            className="max-h-40"
            classNames={{ viewport: 'max-h-40' }}
          >
            <pre className="text-foreground font-mono text-xs break-all whitespace-pre-wrap">
              {prettyJson(record.value)}
            </pre>
          </ScrollArea>
        ),
      },
      {
        key: 'updatedAt',
        title: t('columns.updatedAt'),
        width: COLUMN_WIDTH.UPDATED_AT,
        render: (_value, record) =>
          formatDateTime(record.updatedAt, i18n.language),
      },
      {
        key: '__actions',
        title: t('columns.actions'),
        align: 'right',
        width: COLUMN_WIDTH.ACTIONS,
        render: (_value, record) => (
          <IconButton
            size="sm"
            variant="ghost"
            colorPalette="black"
            aria-label={t('editAria', { key: record.key })}
            onClick={() => setEditor({ item: record })}
          >
            <EditIcon />
          </IconButton>
        ),
      },
    ],
    [t, i18n.language],
  )

  const items = list.data ?? []

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button onClick={() => setEditor({ item: null })}>
            <PlusIcon size={16} />
            {t('new')}
          </Button>
        }
      />

      <Can permission="settings.manage">
        <AccessibilityWidgetCard />
      </Can>

      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      ) : !list.isPending && items.length === 0 ? (
        <EmptyState title={t('empty')} description={t('emptyHint')} />
      ) : (
        <DataTable
          aria-label={t('title')}
          columns={columns}
          data={items}
          rowKey="key"
          loading={list.isPending}
          scroll={{ x: true }}
        />
      )}

      {editor ? (
        <SettingDialog
          key={editor.item?.key ?? 'new'}
          item={editor.item}
          onClose={() => setEditor(null)}
        />
      ) : null}
    </>
  )
}
