/**
 * Parametr dialoqu (yeni / redaktə): `key` redaktədə kilidlidir, `value` JSON
 * mətnidir — `JSON.parse` uğursuz olanda parser mesajı sahə xətası kimi
 * göstərilir (data-model.md §6). API 400 dialoq içində Alert-də.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@cbar/lib-react-ui-kit/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@cbar/lib-react-ui-kit/form'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { Textarea } from '@cbar/lib-react-ui-kit/textarea'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { isAppError } from '@/shared/api/types'
import { useSettingSave } from '../hooks/use-settings'
import type { SettingItem } from '../model/schemas'

interface SettingFormValues {
  key: string
  value: string
}

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      key: z
        .string()
        .trim()
        .min(1, t('validation.keyRequired'))
        .refine((v) => !/\s/.test(v), t('validation.keyNoSpaces')),
      value: z
        .string()
        .refine((v) => v.trim() !== '', t('validation.valueRequired')),
    })
    .superRefine((data, ctx) => {
      if (data.value.trim() === '') return
      try {
        JSON.parse(data.value)
      } catch (error) {
        ctx.addIssue({
          code: 'custom',
          path: ['value'],
          message:
            error instanceof Error
              ? error.message
              : t('validation.invalidJson'),
        })
      }
    })

interface SettingDialogProps {
  /** Redaktə olunan parametr; yeni parametr üçün null. */
  item: SettingItem | null
  onClose: () => void
}

export function SettingDialog({ item, onClose }: SettingDialogProps) {
  const { t } = useTranslation('settings')
  const isEdit = item !== null
  const schema = useMemo(() => buildSchema(t), [t])
  const form = useForm<SettingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      key: item?.key ?? '',
      value:
        item && item.value !== undefined
          ? JSON.stringify(item.value, null, 2)
          : '',
    },
  })
  const save = useSettingSave()

  const close = () => {
    if (!save.isPending) onClose()
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({
        key: values.key,
        value: JSON.parse(values.value),
      })
      toast.success(t(isEdit ? 'saved' : 'created'))
      onClose()
    } catch (error) {
      form.setError('root', {
        message: isAppError(error)
          ? error.message
          : t('common:errors.unexpected'),
      })
    }
  })

  return (
    <Dialog open onOpenChange={(next) => (!next ? close() : undefined)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('dialog.editTitle', { key: item.key })
              : t('dialog.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="setting-form"
            onSubmit={onSubmit}
            noValidate
            className="space-y-4"
          >
            {form.formState.errors.root ? (
              <Alert variant="surface" colorPalette="red">
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dialog.key')}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="off"
                      disabled={isEdit}
                      placeholder={t('dialog.keyPlaceholder')}
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dialog.value')}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={12}
                      spellCheck={false}
                      placeholder={t('dialog.valuePlaceholder')}
                      className="min-h-48 font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('dialog.valueHelp')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            colorPalette="black"
            onClick={close}
            disabled={save.isPending}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="setting-form" disabled={save.isPending}>
            {save.isPending ? <Spinner className="size-4" /> : null}
            {t('common:actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
