/**
 * Sətir əməli: şifrəni sıfırla (`PUT /users/{id}/password`). Öz dialoqu və
 * mutation-ı var (B9 rowActions). Siyasət client-də Zod ilə, API 400 mesajı
 * dialoq içində göstərilir.
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
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { KeyIcon } from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { isAppError } from '@/shared/api/types'
import { usersService } from '../api/users.service'
import { passwordSchema, type UserRow } from '../model/schemas'

interface ResetPasswordValues {
  newPassword: string
}

export function ResetPasswordAction({ row }: { row: UserRow }) {
  const { t } = useTranslation('users')
  const [open, setOpen] = useState(false)
  const schema = useMemo(
    () => z.object({ newPassword: passwordSchema(t('passwordPolicy')) }),
    [t],
  )
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '' },
  })
  const reset = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      usersService.resetPassword(row.id, values.newPassword),
  })
  const formId = `reset-password-${row.id}`

  const close = () => {
    if (reset.isPending) return
    setOpen(false)
    form.reset()
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await reset.mutateAsync(values)
      toast.success(t('resetPassword.success', { name: row.username }))
      setOpen(false)
      form.reset()
    } catch (error) {
      form.setError('root', {
        message: isAppError(error)
          ? error.message
          : t('common:errors.unexpected'),
      })
    }
  })

  return (
    <>
      <IconButton
        size="sm"
        variant="ghost"
        colorPalette="black"
        aria-label={t('resetPassword.action', { name: row.username })}
        onClick={() => {
          reset.reset()
          form.reset()
          setOpen(true)
        }}
      >
        <KeyIcon />
      </IconButton>

      <Dialog
        open={open}
        onOpenChange={(next) => (!next ? close() : undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('resetPassword.title', { name: row.username })}
            </DialogTitle>
            <DialogDescription>
              {t('resetPassword.description')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              id={formId}
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
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resetPassword.newPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('passwordPolicyHint')}</FormDescription>
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
              disabled={reset.isPending}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" form={formId} disabled={reset.isPending}>
              {reset.isPending ? <Spinner className="size-4" /> : null}
              {t('resetPassword.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
