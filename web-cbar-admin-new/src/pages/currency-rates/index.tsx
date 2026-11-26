/**
 * Məzənnələr səhifəsi (tasks T102): URL `?date=` seçilmiş vərəqi göstərir
 * (boş → son vərəq); "Yeni vərəq" yüklənmiş sətirlərdən qaralama açır; redaktor
 * `editorKey` ilə remount olur ki, vərəq dəyişəndə lokal sətirlər sıfırlansın.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import { DatePicker } from '@cbar/lib-react-ui-kit/date-picker'
import { Field, FieldLabel } from '@cbar/lib-react-ui-kit/field'
import {
  CalendarIcon,
  FileUploadIcon,
  PlusIcon,
  TrashIcon,
} from '@cbar/lib-react-ui-kit/icons'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RateImportDialog } from '@/features/currency/components/rate-import-dialog'
import { RateSheetEditor } from '@/features/currency/components/rate-sheet-editor'
import { SheetDatesPanel } from '@/features/currency/components/sheet-dates-panel'
import {
  useCurrencies,
  useDeleteSheet,
  useSheet,
} from '@/features/currency/hooks/use-currency'
import { formatDay } from '@/features/currency/model/format-day'
import { CURRENCY_SECTION_TABS } from '@/features/currency/model/section-tabs'
import { dateStringToDate, dateToDateString } from '@/shared/crud/date-io'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { ErrorState } from '@/shared/ui/error-state'
import { PageHeader } from '@/shared/ui/page-header'
import { SectionTabs } from '@/shared/ui/section-tabs'

export function CurrencyRatesPage() {
  const { t, i18n } = useTranslation('currency')
  const search = useSearch({ strict: false }) as { date?: unknown }
  const navigate = useNavigate()
  /** '' = son vərəq (`?date` yoxdur). */
  const selectedDate = typeof search.date === 'string' ? search.date : ''
  /** null deyilsə — həmin tarix üçün saxlanılmamış qaralama. */
  const [draftDate, setDraftDate] = useState<string | null>(null)
  const [datesOpen, setDatesOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const sheet = useSheet(selectedDate)
  const master = useCurrencies()
  const remove = useDeleteSheet()

  const isDraft = draftDate !== null
  const loadedDate = sheet.data?.date ?? (selectedDate || null)
  const effectiveDate = draftDate ?? loadedDate
  const pickerLocale = i18n.language.startsWith('en') ? 'en-GB' : 'az-AZ'

  const goToDate = (date: string) => {
    setDraftDate(null)
    void navigate({
      to: '.',
      search: ((prev: Record<string, unknown>) => {
        const next: Record<string, unknown> = {
          ...prev,
          date: date || undefined,
        }
        if (next.date === undefined) delete next.date
        return next
      }) as never,
    })
  }

  const editorKey = isDraft
    ? 'draft'
    : `sheet:${loadedDate ?? 'latest'}:${sheet.dataUpdatedAt}`

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <>
            <Button
              variant="outline"
              colorPalette="black"
              onClick={() => setDatesOpen(true)}
            >
              <CalendarIcon size={16} />
              {t('sheet.dates')}
            </Button>
            {!isDraft && loadedDate ? (
              <Button
                variant="outline"
                colorPalette="red"
                onClick={() => {
                  remove.reset()
                  setDeleteOpen(true)
                }}
              >
                <TrashIcon size={16} />
                {t('sheet.deleteSheet')}
              </Button>
            ) : null}
            <Button
              variant="outline"
              colorPalette="black"
              onClick={() => setImportOpen(true)}
              disabled={isDraft}
            >
              <FileUploadIcon size={16} />
              {t('import.open')}
            </Button>
            <Button
              onClick={() => setDraftDate(dateToDateString(new Date()))}
              disabled={isDraft}
            >
              <PlusIcon size={16} />
              {t('sheet.newSheet')}
            </Button>
          </>
        }
      />

      <SectionTabs tabs={CURRENCY_SECTION_TABS} />

      <Card>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
          <Field className="md:max-w-xs">
            <FieldLabel htmlFor="sheet-date">{t('sheet.date')}</FieldLabel>
            <DatePicker
              id="sheet-date"
              value={dateStringToDate(isDraft ? draftDate : loadedDate)}
              onChange={(date) => {
                const next = dateToDateString(date)
                if (isDraft) {
                  if (next) setDraftDate(next)
                } else {
                  goToDate(next)
                }
              }}
              format="dd.MM.yyyy"
              locale={pickerLocale}
              placeholder={t('sheet.latest')}
              aria-label={t('sheet.date')}
            />
          </Field>
          {sheet.isFetching && !sheet.isPending ? (
            <p className="text-muted-foreground flex items-center gap-2 pb-2 text-sm">
              <Spinner className="size-4" />
              {t('crud:refreshing')}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {isDraft ? (
        <Alert variant="surface" colorPalette="yellow">
          <AlertDescription>{t('sheet.draftNotice')}</AlertDescription>
        </Alert>
      ) : null}

      {sheet.isPending ? (
        <Skeleton className="h-80 w-full" />
      ) : sheet.isError ? (
        <ErrorState error={sheet.error} onRetry={() => void sheet.refetch()} />
      ) : (
        <RateSheetEditor
          key={editorKey}
          date={effectiveDate}
          initialRates={sheet.data.rates}
          isDraft={isDraft}
          currencies={master.data ?? []}
          onSaved={goToDate}
        />
      )}

      <DeleteDialog
        open={deleteOpen}
        title={t('sheet.deleteTitle')}
        description={t('sheet.deleteConfirm', {
          date: formatDay(effectiveDate),
        })}
        isPending={remove.isPending}
        error={remove.error}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          if (!effectiveDate) return
          remove.mutate(effectiveDate, {
            onSuccess: () => {
              setDeleteOpen(false)
              toast.success(t('sheet.deleted'))
              goToDate('')
            },
          })
        }}
      />

      {importOpen ? (
        <RateImportDialog
          initialDate={loadedDate}
          onClose={() => setImportOpen(false)}
          onImported={(result) => {
            setImportOpen(false)
            toast.success(t('import.done', { count: result.imported }), {
              description:
                result.skipped.length > 0
                  ? t('import.skipped', { codes: result.skipped.join(', ') })
                  : undefined,
            })
            goToDate(result.date)
          }}
        />
      ) : null}

      <SheetDatesPanel
        open={datesOpen}
        onClose={() => setDatesOpen(false)}
        onPick={(date) => {
          setDatesOpen(false)
          goToDate(date)
        }}
      />
    </>
  )
}
