/**
 * Sahə tipi → kit control (research R7 cədvəli, B5). RHF `FormField` ilə
 * bağlanır; etiket/izah/xəta kit `form` subpath-ından.
 */

import { Checkbox } from '@cbar/lib-react-ui-kit/checkbox'
import { Combobox, type ComboboxOption } from '@cbar/lib-react-ui-kit/combobox'
import { DatePicker } from '@cbar/lib-react-ui-kit/date-picker'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@cbar/lib-react-ui-kit/form'
import { Input } from '@cbar/lib-react-ui-kit/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cbar/lib-react-ui-kit/select'
import { Textarea } from '@cbar/lib-react-ui-kit/textarea'
import { Suspense } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MediaIdField } from '@/features/media/components/media-id-field'
import { RichTextEditor, RichTextEditorFallback } from '@/features/rich-text'
import { dateStringToDate, dateToDateString } from '@/shared/crud/date-io'
import { nsKey } from '@/shared/crud/path'
import type { FieldConfig, FormShape, Locale } from '@/shared/crud/types'

interface FieldControlProps {
  ns: string
  field: FieldConfig
  /** Per-locale sahə üçün locale; ümumi sahədə undefined. */
  locale?: Locale
  disabled?: boolean
  /** Media sahəsi və axtarışlı select: detail-dən oxunmuş ad. */
  mediaName?: string
}

/** A stored value older than the loaded list stays readable and selected. */
function withCurrentValue(
  options: ComboboxOption[],
  value: string,
  name: string | undefined,
): ComboboxOption[] {
  if (value === '' || options.some((option) => option.value === value)) {
    return options
  }
  return [{ value, label: name ?? `#${value}` }, ...options]
}

export function FieldControl({
  ns,
  field,
  locale,
  disabled,
  mediaName,
}: FieldControlProps) {
  const { control } = useFormContext<FormShape>()
  const { t, i18n } = useTranslation()
  const name = (
    locale ? `translations.${locale}.${field.name}` : `values.${field.name}`
  ) as `values.${string}` | `translations.${string}.${string}`
  const label = `${t(nsKey(ns, field.labelKey))}${locale ? ` (${locale.toUpperCase()})` : ''}`
  const placeholder = field.placeholderKey
    ? t(nsKey(ns, field.placeholderKey))
    : undefined
  const help = field.helpKey ? t(nsKey(ns, field.helpKey)) : undefined
  const optionLabel = (o: {
    labelKey?: string
    label?: string
    value: string | number
  }) => (o.labelKey ? t(nsKey(ns, o.labelKey)) : (o.label ?? String(o.value)))

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: rhf }) => {
        const value = rhf.value
        const stringValue = typeof value === 'string' ? value : ''

        if (field.type === 'checkbox') {
          return (
            <FormItem className="flex flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={value === true}
                  onCheckedChange={(checked) => rhf.onChange(checked === true)}
                  disabled={disabled}
                  onBlur={rhf.onBlur}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{label}</FormLabel>
                {help ? <FormDescription>{help}</FormDescription> : null}
                <FormMessage />
              </div>
            </FormItem>
          )
        }

        let control: React.ReactNode
        switch (field.type) {
          case 'select':
            control = field.searchable ? (
              <Combobox
                options={withCurrentValue(
                  (field.options ?? []).map((o) => ({
                    value: String(o.value),
                    label: optionLabel(o),
                  })),
                  stringValue,
                  mediaName,
                )}
                value={stringValue}
                onValueChange={rhf.onChange}
                disabled={disabled}
                placeholder={placeholder ?? '—'}
                searchPlaceholder={t('common:search')}
                emptyMessage={t('crud:empty')}
                aria-label={label}
                className="w-full"
              />
            ) : (
              <Select
                value={stringValue}
                onValueChange={(v) => rhf.onChange(v ?? '')}
                disabled={disabled}
              >
                <SelectTrigger
                  clearable={field.nullable}
                  aria-label={label}
                  onBlur={rhf.onBlur}
                >
                  <SelectValue placeholder={placeholder ?? '—'} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((o) => (
                    <SelectItem key={String(o.value)} value={String(o.value)}>
                      {optionLabel(o)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
            break
          case 'date':
            control = (
              <DatePicker
                value={dateStringToDate(stringValue)}
                onChange={(d) => rhf.onChange(dateToDateString(d))}
                format="dd.MM.yyyy"
                locale={i18n.language.startsWith('en') ? 'en-GB' : 'az-AZ'}
                disabled={disabled}
                aria-label={label}
                placeholder={placeholder}
              />
            )
            break
          case 'time':
            control = (
              <Input
                type="time"
                value={stringValue}
                onChange={(e) => rhf.onChange(e.target.value)}
                onBlur={rhf.onBlur}
                disabled={disabled}
                className="max-w-xs"
              />
            )
            break
          case 'datetime':
            control = (
              <Input
                type="datetime-local"
                value={stringValue}
                onChange={(e) => rhf.onChange(e.target.value)}
                onBlur={rhf.onBlur}
                disabled={disabled}
                className="max-w-xs"
              />
            )
            break
          case 'number':
            control = (
              <Input
                type="number"
                inputMode="decimal"
                step={field.step ?? 'any'}
                min={field.min}
                max={field.max}
                value={stringValue}
                onChange={(e) => rhf.onChange(e.target.value)}
                onBlur={rhf.onBlur}
                disabled={disabled}
                placeholder={placeholder}
                className="max-w-xs"
              />
            )
            break
          case 'richtext':
            control = (
              <Suspense fallback={<RichTextEditorFallback />}>
                <RichTextEditor
                  value={stringValue}
                  onChange={rhf.onChange}
                  editable={!disabled}
                />
              </Suspense>
            )
            break
          case 'textarea':
            control = (
              <Textarea
                value={stringValue}
                onChange={(e) => rhf.onChange(e.target.value)}
                onBlur={rhf.onBlur}
                disabled={disabled}
                placeholder={placeholder}
              />
            )
            break
          case 'media':
            control = (
              <MediaIdField
                value={stringValue}
                onChange={rhf.onChange}
                nameHint={mediaName}
                disabled={disabled}
                accept={field.mediaAccept}
              />
            )
            break
          default:
            control = (
              <Input
                type="text"
                value={stringValue}
                onChange={(e) => rhf.onChange(e.target.value)}
                onBlur={rhf.onBlur}
                disabled={disabled}
                placeholder={placeholder}
              />
            )
        }

        return (
          <FormItem>
            <FormLabel>
              {label}
              {field.required ? (
                <span aria-hidden className="text-destructive ml-0.5">
                  *
                </span>
              ) : null}
            </FormLabel>
            <FormControl>{control}</FormControl>
            {help ? <FormDescription>{help}</FormDescription> : null}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
