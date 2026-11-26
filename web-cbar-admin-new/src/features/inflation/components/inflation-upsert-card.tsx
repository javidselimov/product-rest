/**
 * İnflyasiya parametri əlavə et / yenilə kartı (tasks T106): RHF + Zod,
 * `POST /inflation` upsert. Uğurda yalnız dəyər sahəsi sıfırlanır.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cbar/lib-react-ui-kit/select'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { isAppError } from '@/shared/api/types'
import { useInflationUpsert } from '../hooks/use-inflation'
import { INFLATION_PARAMETERS, MONTHS } from '../model/schemas'

interface InflationFormValues {
  year: string
  month: string
  parameterCode: string
  value: string
}

const isNumeric = (value: string) =>
  value.trim() !== '' && !Number.isNaN(Number(value))

const buildSchema = (t: (key: string) => string) =>
  z.object({
    year: z
      .string()
      .refine((v) => /^\d{4}$/.test(v.trim()), t('validation.year')),
    month: z
      .string()
      .refine((v) => MONTHS.includes(Number(v)), t('validation.month')),
    parameterCode: z
      .string()
      .refine(
        (v) => (INFLATION_PARAMETERS as readonly string[]).includes(v),
        t('validation.parameterCode'),
      ),
    value: z.string().refine(isNumeric, t('validation.value')),
  })

export function InflationUpsertCard() {
  const { t } = useTranslation('inflation')
  const schema = useMemo(() => buildSchema(t), [t])
  const form = useForm<InflationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: String(new Date().getFullYear()),
      month: '1',
      parameterCode: INFLATION_PARAMETERS[0],
      value: '',
    },
  })
  const upsert = useInflationUpsert()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null)
    try {
      await upsert.mutateAsync({
        year: Number(values.year),
        month: Number(values.month),
        parameterCode: values.parameterCode,
        value: Number(values.value),
      })
      form.resetField('value')
    } catch (caught) {
      setError(
        isAppError(caught) ? caught.message : t('common:errors.unexpected'),
      )
    }
  })

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
            className="grid items-end gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
          >
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.year')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1900}
                      max={2200}
                      step={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.month')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full" onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MONTHS.map((month) => (
                        <SelectItem key={month} value={String(month)}>
                          {t(`common:months.${month}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parameterCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.parameterCode')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full" onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INFLATION_PARAMETERS.map((code) => (
                        <SelectItem key={code} value={code}>
                          {t(`parameters.${code}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.value')}</FormLabel>
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
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <SaveIcon size={16} />
              )}
              {t('form.save')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
