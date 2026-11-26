/**
 * Vərəq redaktoru (data-model.md §5 CurrencyRateSheet): sətirlər lokal state-də,
 * valideyn `key` ilə remount edir (vərəq/qaralama dəyişəndə sıfırlanır).
 * Saxlamadan əvvəl bütöv validasiya — boş / qeyri-rəqəm / ≤0 məzənnə sətir
 * xətası olur və sorğu getmir.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { Card, CardContent, CardFooter } from '@cbar/lib-react-ui-kit/card'
import { Combobox, type ComboboxOption } from '@cbar/lib-react-ui-kit/combobox'
import {
  DataTable,
  type DataTableColumn,
} from '@cbar/lib-react-ui-kit/data-table'
import { FieldError } from '@cbar/lib-react-ui-kit/field'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { SaveIcon, TrashIcon } from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { COLUMN_WIDTH } from '../model/constants'
import { useSaveSheet } from '../hooks/use-currency'
import type {
  CurrencyMaster,
  PutSheetPayload,
  SheetRate,
} from '../model/schemas'

interface EditableRate {
  currencyCode: string
  nominal: number | null
  nameAz: string | null
  /** Input dəyəri — rəqəmə yalnız saxlamada çevrilir. */
  rate: string
}

interface RateSheetEditorProps {
  /** Saxlanılacaq tarix (`yyyy-MM-dd`); null → əvvəlcə tarix seçilməlidir. */
  date: string | null
  initialRates: SheetRate[]
  /** Qaralama rejimi: sətir silmək yalnız burada mümkündür. */
  isDraft: boolean
  /** Valyuta master-i — əlavə etmə siyahısı və ad/nominal üçün. */
  currencies: CurrencyMaster[]
  onSaved: (date: string) => void
}

const toEditable = (rate: SheetRate): EditableRate => ({
  currencyCode: rate.currencyCode,
  nominal: rate.nominal,
  nameAz: rate.nameAz,
  rate: String(rate.rate),
})

export function RateSheetEditor({
  date,
  initialRates,
  isDraft,
  currencies,
  onSaved,
}: RateSheetEditorProps) {
  const { t } = useTranslation('currency')
  const [rows, setRows] = useState<EditableRate[]>(() =>
    initialRates.map(toEditable),
  )
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const save = useSaveSheet()

  // Seçim siyahısı yüklənmiş vərəqdə OLMAYAN valyutalardır (köhnə panel: sərbəst
  // kod girişi). Cari sətirlərə görə süzülmür ki, eyni kodun təkrar seçimi
  // aşağıdakı dublikat yoxlamasına düşsün və istifadəçi səbəbi görsün.
  const options = useMemo<ComboboxOption[]>(() => {
    const loaded = new Set(initialRates.map((r) => r.currencyCode))
    return currencies
      .filter((c) => !loaded.has(c.code))
      .map((c) => ({
        value: c.code,
        label: `${c.code} — ${c.nameAz ?? c.nameEn ?? ''}`.trim(),
      }))
  }, [currencies, initialRates])

  const addRow = (code: string) => {
    if (rows.some((r) => r.currencyCode === code)) {
      setFormError(t('sheet.errors.duplicate', { code }))
      return
    }
    const info = currencies.find((c) => c.code === code)
    setFormError(null)
    setRows((prev) => [
      ...prev,
      {
        currencyCode: code,
        nominal: info?.nominal ?? null,
        nameAz: info?.nameAz ?? null,
        rate: '',
      },
    ])
  }

  const setRate = (code: string, rate: string) =>
    setRows((prev) =>
      prev.map((r) => (r.currencyCode === code ? { ...r, rate } : r)),
    )

  const removeRow = (code: string) => {
    setRows((prev) => prev.filter((r) => r.currencyCode !== code))
    setRowErrors((prev) => {
      if (!(code in prev)) return prev
      const next = { ...prev }
      delete next[code]
      return next
    })
  }

  const handleSave = () => {
    setFormError(null)
    if (!date) {
      setFormError(t('sheet.errors.pickDate'))
      return
    }
    if (rows.length === 0) {
      setFormError(t('sheet.errors.atLeastOne'))
      return
    }
    const errors: Record<string, string> = {}
    const rates: PutSheetPayload['rates'] = []
    for (const row of rows) {
      const text = row.rate.trim()
      const value = Number(text)
      if (text === '') errors[row.currencyCode] = t('sheet.errors.rateRequired')
      else if (Number.isNaN(value))
        errors[row.currencyCode] = t('sheet.errors.rateNumber')
      else if (value <= 0)
        errors[row.currencyCode] = t('sheet.errors.ratePositive')
      else rates.push({ currencyCode: row.currencyCode, rate: value })
    }
    setRowErrors(errors)
    if (Object.keys(errors).length > 0) {
      setFormError(t('sheet.errors.fixRows'))
      return
    }
    save.mutate(
      { date, rates },
      {
        onSuccess: () => {
          toast.success(t('sheet.saved'))
          onSaved(date)
        },
        onError: (error) =>
          setFormError(
            isAppError(error) ? error.message : t('common:errors.unexpected'),
          ),
      },
    )
  }

  const columns: DataTableColumn<EditableRate>[] = [
    {
      key: 'currencyCode',
      title: t('sheet.columns.code'),
      width: COLUMN_WIDTH.CODE,
      render: (_value, row) => (
        <span className="font-medium">{row.currencyCode}</span>
      ),
    },
    {
      key: 'nameAz',
      title: t('sheet.columns.name'),
      render: (_value, row) => row.nameAz ?? '—',
    },
    {
      key: 'nominal',
      title: t('sheet.columns.nominal'),
      width: COLUMN_WIDTH.NOMINAL,
      align: 'right',
      render: (_value, row) => row.nominal ?? '—',
    },
    {
      key: 'rate',
      title: t('sheet.columns.rate'),
      width: COLUMN_WIDTH.RATE_INPUT,
      render: (_value, row) => {
        const error = rowErrors[row.currencyCode]
        return (
          <div className="space-y-1">
            <Input
              size="sm"
              type="number"
              inputMode="decimal"
              step="any"
              value={row.rate}
              onChange={(e) => setRate(row.currencyCode, e.target.value)}
              aria-label={t('sheet.rateFor', { code: row.currencyCode })}
              aria-invalid={error ? true : undefined}
              className="max-w-44"
            />
            {error ? <FieldError>{error}</FieldError> : null}
          </div>
        )
      },
    },
  ]
  if (isDraft) {
    columns.push({
      key: '__actions',
      title: t('crud:actions'),
      width: COLUMN_WIDTH.ROW_ACTION,
      align: 'right',
      render: (_value, row) => (
        <IconButton
          size="sm"
          variant="ghost"
          colorPalette="red"
          aria-label={t('sheet.removeRow', { code: row.currencyCode })}
          onClick={() => removeRow(row.currencyCode)}
        >
          <TrashIcon />
        </IconButton>
      ),
    })
  }

  return (
    <div className="space-y-4">
      {formError ? (
        <Alert variant="surface" colorPalette="red">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="p-0">
          <DataTable
            aria-label={t('sheet.columns.rate')}
            columns={columns}
            data={rows}
            rowKey={(row) => row.currencyCode}
            emptyText={t('sheet.empty')}
            className="rounded-none border-0"
            scroll={{ x: true }}
          />
        </CardContent>
        <CardFooter className="border-border flex-col items-stretch gap-3 border-t pt-4 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <Combobox
              options={options}
              value=""
              onValueChange={(code) => {
                if (code) addRow(code)
              }}
              placeholder={t('sheet.addPlaceholder')}
              searchPlaceholder={t('sheet.searchPlaceholder')}
              emptyMessage={t('sheet.noOptions')}
              aria-label={t('sheet.addCurrency')}
              className="w-full md:w-72"
            />
            <p className="text-muted-foreground text-xs">
              {t('sheet.addHint')}
            </p>
          </div>
          <Button onClick={handleSave} disabled={save.isPending}>
            {save.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <SaveIcon size={16} />
            )}
            {t('sheet.save')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
