/**
 * AZIR dəyəri əlavə et / yenilə kartı (tasks T105, spec 021): RHF + Zod,
 * `POST /azir` upsert — tam əvəzetmə, ona görə forma həmişə bütün sahələri
 * göndərir (boş → `null`). Uğurda tarix və müddət ardıcıl giriş üçün qalır,
 * qalan sahələr sıfırlanır. "Formaya yüklə" (prefill konteksti) kartı sətrin
 * dəyərləri ilə doldurur. Server sahə xətaları sahənin altına, qalanı alert-ə.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { Checkbox } from '@cbar/lib-react-ui-kit/checkbox'
import { DatePicker } from '@cbar/lib-react-ui-kit/date-picker'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@cbar/lib-react-ui-kit/form'
import { SaveIcon } from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cbar/lib-react-ui-kit/select'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { isAppError } from '@/shared/api/types'
import {
  dateStringToDate,
  dateToDateString,
  isDateString,
} from '@/shared/crud/date-io'
import { useAzirUpsert } from '../hooks/use-azir'
import {
  DEAL_VOLUME_MAX_EXCLUSIVE,
  RATE_MAX_DECIMALS,
  RATE_MAX_EXCLUSIVE,
} from '../model/constants'
import {
  AZIR_EMPTY_FORM_VALUES,
  rowToFormValues,
  useAzirPrefill,
  type AzirFormValues,
} from '../model/prefill'
import { AZIR_TERMS } from '../model/schemas'

/** Server `errors` açarları ilə eyni ad daşıyan sahələr (data-model.md §3). */
const SERVER_FIELDS: readonly (keyof AzirFormValues)[] = [
  'valueDate',
  'term',
  'rate',
  'dealVolume',
  'dealCount',
  'minRate',
  'maxRate',
  'isReservePlan',
]

const isBlank = (value: string) => value.trim() === ''

const isNumeric = (value: string) =>
  !isBlank(value) && !Number.isNaN(Number(value))

/** Mənalı onluq rəqəmlər: `250.00` → 0 (payload-a `250` gedir). */
const decimalPlaces = (value: string) => {
  const match = /\.(\d+)$/.exec(value.trim())
  return match ? match[1].replace(/0+$/, '').length : 0
}

/** Boş → keçir; doludursa rəqəm olmalı və şərti ödəməlidir. */
const optional =
  (check: (n: number, raw: string) => boolean) => (value: string) =>
    isBlank(value) || (isNumeric(value) && check(Number(value), value))

const isRate = optional(
  (n, raw) =>
    n >= 0 && n < RATE_MAX_EXCLUSIVE && decimalPlaces(raw) <= RATE_MAX_DECIMALS,
)

const toNullableNumber = (value: string) =>
  isBlank(value) ? null : Number(value)

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      valueDate: z.string().refine(isDateString, t('validation.valueDate')),
      term: z
        .string()
        .refine(
          (v) => (AZIR_TERMS as readonly string[]).includes(v),
          t('validation.term'),
        ),
      rate: z
        .string()
        .refine((v) => isNumeric(v) && isRate(v), t('validation.rate')),
      dealVolume: z
        .string()
        .refine(
          optional((n) => n >= 0 && n < DEAL_VOLUME_MAX_EXCLUSIVE),
          t('validation.dealVolume'),
        )
        .refine(
          (v) => isBlank(v) || decimalPlaces(v) <= 2,
          t('validation.dealVolumeDecimals'),
        ),
      dealCount: z.string().refine(
        optional((n) => n >= 0 && Number.isInteger(n)),
        t('validation.dealCount'),
      ),
      minRate: z.string().refine(isRate, t('validation.minRate')),
      maxRate: z.string().refine(isRate, t('validation.maxRate')),
      isReservePlan: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (!isNumeric(values.minRate) || !isNumeric(values.maxRate)) return
      if (Number(values.minRate) > Number(values.maxRate)) {
        ctx.addIssue({
          code: 'custom',
          path: ['minRate'],
          message: t('validation.minLeMax'),
        })
      }
    })

type NumberFieldName =
  'rate' | 'dealVolume' | 'dealCount' | 'minRate' | 'maxRate'

export function AzirUpsertCard() {
  const { t, i18n } = useTranslation('azir')
  const schema = useMemo(() => buildSchema(t), [t])
  const form = useForm<AzirFormValues>({
    resolver: zodResolver(schema),
    defaultValues: AZIR_EMPTY_FORM_VALUES,
  })
  const upsert = useAzirUpsert()
  const [error, setError] = useState<string | null>(null)
  const prefill = useAzirPrefill()
  // `reset`-dən dərhal sonra `setFocus` işləmir (RHF sahələri yenidən qeyd edir) —
  // fokus növbəti render-dən sonrakı effektdədir.
  const [prefillCount, setPrefillCount] = useState(0)

  useEffect(
    () =>
      prefill.subscribe((row) => {
        setError(null)
        form.reset(rowToFormValues(row))
        setPrefillCount((count) => count + 1)
      }),
    [prefill, form],
  )

  useEffect(() => {
    if (prefillCount > 0) form.setFocus('rate')
  }, [prefillCount, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null)
    try {
      await upsert.mutateAsync({
        valueDate: values.valueDate,
        term: values.term,
        rate: Number(values.rate),
        dealVolume: toNullableNumber(values.dealVolume),
        dealCount: toNullableNumber(values.dealCount),
        minRate: toNullableNumber(values.minRate),
        maxRate: toNullableNumber(values.maxRate),
        isReservePlan: values.isReservePlan,
      })
      form.reset({
        ...AZIR_EMPTY_FORM_VALUES,
        valueDate: values.valueDate,
        term: values.term,
      })
    } catch (caught) {
      if (!isAppError(caught)) {
        setError(t('common:errors.unexpected'))
        return
      }
      let unmapped = !caught.fieldErrors
      for (const [field, message] of Object.entries(caught.fieldErrors ?? {})) {
        const target = SERVER_FIELDS.find((name) => name === field)
        if (target) form.setError(target, { message })
        else unmapped = true
      }
      if (unmapped) setError(caught.message)
    }
  })

  const renderNumberField = (
    name: NumberFieldName,
    inputMode: 'decimal' | 'numeric' = 'decimal',
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t(`form.${name}`)}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode={inputMode}
              step={inputMode === 'numeric' ? 1 : 'any'}
              min={0}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('form.title')}</CardTitle>
        <CardDescription>{t('form.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="surface" colorPalette="red">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            noValidate
            aria-label={t('form.title')}
            className="grid items-start gap-4 md:grid-cols-4"
          >
            <FormField
              control={form.control}
              name="valueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.valueDate')}</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={dateStringToDate(field.value)}
                      onChange={(date) =>
                        field.onChange(dateToDateString(date))
                      }
                      format="dd.MM.yyyy"
                      locale={
                        i18n.language.startsWith('en') ? 'en-GB' : 'az-AZ'
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.term')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full" onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AZIR_TERMS.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {renderNumberField('rate')}
            <FormField
              control={form.control}
              name="isReservePlan"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0 md:pt-7">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t('form.isReservePlan')}</FormLabel>
                    <FormDescription>
                      {t('form.isReservePlanHint')}
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {renderNumberField('dealVolume')}
            {renderNumberField('dealCount', 'numeric')}
            {renderNumberField('minRate')}
            {renderNumberField('maxRate')}

            <div className="flex justify-end md:col-span-4">
              <Button type="submit" disabled={upsert.isPending}>
                {upsert.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <SaveIcon size={16} />
                )}
                {t('form.save')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
