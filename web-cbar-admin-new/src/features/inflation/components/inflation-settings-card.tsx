/**
 * Ana səhifə inflyasiya xülasəsi — köhnə paneldəki "Aylıq inflyasiya
 * parametrləri" forması: cari inflyasiya, hədəf (sərbəst mətn) və növbəti
 * yenilənmə tarixi. `GET|PUT /inflation/settings`, tək sətir.
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
import { DatePicker } from '@cbar/lib-react-ui-kit/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@cbar/lib-react-ui-kit/form'
import { SaveIcon } from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { isAppError } from '@/shared/api/types'
import { SHORT_TEXT_MAX } from '@/shared/constants/limits'
import {
  dateStringToDate,
  dateToDateString,
  isDateString,
} from '@/shared/crud/date-io'
import {
  useInflationSettings,
  useSaveInflationSettings,
} from '../hooks/use-inflation'
import type { InflationSettings } from '../model/schemas'

interface SettingsFormValues {
  currentInflation: string
  targetInflation: string
  nextUpdateDate: string
}

const isNumeric = (value: string) =>
  value.trim() !== '' && !Number.isNaN(Number(value))

const buildSchema = (t: (key: string) => string) =>
  z.object({
    currentInflation: z
      .string()
      .refine(isNumeric, t('settings.validation.currentInflation')),
    targetInflation: z
      .string()
      .trim()
      .min(1, t('settings.validation.targetInflation'))
      .max(SHORT_TEXT_MAX, t('settings.validation.targetInflationLength')),
    nextUpdateDate: z
      .string()
      .refine(isDateString, t('settings.validation.nextUpdateDate')),
  })

const toFormValues = (
  settings: InflationSettings | null | undefined,
): SettingsFormValues => ({
  currentInflation: settings ? String(settings.currentInflation) : '',
  targetInflation: settings?.targetInflation ?? '',
  nextUpdateDate: settings?.nextUpdateDate ?? '',
})

export function InflationSettingsCard() {
  const { t } = useTranslation('inflation')
  const query = useInflationSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.title')}</CardTitle>
        <CardDescription>{t('settings.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <Spinner className="size-5" />
        ) : query.isError ? (
          <Alert variant="surface" colorPalette="red">
            <AlertDescription>
              {isAppError(query.error)
                ? query.error.message
                : t('common:errors.unexpected')}
            </AlertDescription>
          </Alert>
        ) : (
          <SettingsForm initial={toFormValues(query.data)} />
        )}
      </CardContent>
    </Card>
  )
}

function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const { t, i18n } = useTranslation('inflation')
  const schema = useMemo(() => buildSchema(t), [t])
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  })
  const save = useSaveInflationSettings()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null)
    try {
      const saved = await save.mutateAsync({
        currentInflation: Number(values.currentInflation),
        targetInflation: values.targetInflation.trim(),
        nextUpdateDate: values.nextUpdateDate,
      })
      form.reset(toFormValues(saved))
    } catch (caught) {
      setError(
        isAppError(caught) ? caught.message : t('common:errors.unexpected'),
      )
    }
  })

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="surface" colorPalette="red">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          noValidate
          aria-label={t('settings.title')}
          className="grid items-end gap-4 md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <FormField
            control={form.control}
            name="currentInflation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.currentInflation')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetInflation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.targetInflation')}</FormLabel>
                <FormControl>
                  <Input
                    maxLength={255}
                    placeholder={t('settings.targetPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextUpdateDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.nextUpdateDate')}</FormLabel>
                <FormControl>
                  <DatePicker
                    value={dateStringToDate(field.value)}
                    onChange={(date) => field.onChange(dateToDateString(date))}
                    format="dd.MM.yyyy"
                    locale={i18n.language.startsWith('en') ? 'en-GB' : 'az-AZ'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <SaveIcon size={16} />
            )}
            {t('form.save')}
          </Button>
        </form>
      </Form>
    </div>
  )
}
