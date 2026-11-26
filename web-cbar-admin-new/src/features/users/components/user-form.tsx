/**
 * Xüsusi istifadəçi forması (spec T113): yaratma `{username,email,password,roleId}`,
 * redaktə `{email,roleId,isActive}` — username kilidlidir və payload-a düşmür,
 * şifrə yalnız yaratmada. Saxlama `useCrudSave` ilə (invalidasiya, toast,
 * siyahıya qayıdış); 409 (username/email məşğul) və 400 formanın üstündə Alert-də.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import { Checkbox } from '@cbar/lib-react-ui-kit/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cbar/lib-react-ui-kit/select'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useCrudSave } from '@/features/crud/hooks/use-crud'
import { isAppError } from '@/shared/api/types'
import { PageHeader } from '@/shared/ui/page-header'
import { usersModule } from '../model/module'
import {
  DEFAULT_ROLE_ID,
  ROLE_OPTIONS,
  passwordSchema,
  type UserDetail,
} from '../model/schemas'

interface UserFormValues {
  username: string
  email: string
  password: string
  roleId: string
  isActive: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const buildSchema = (t: (key: string) => string, isEdit: boolean) =>
  z.object({
    username: isEdit
      ? z.string()
      : z.string().trim().min(1, t('validation.usernameRequired')),
    email: z
      .string()
      .trim()
      .min(1, t('validation.emailRequired'))
      .refine((v) => EMAIL_RE.test(v), t('validation.emailFormat')),
    password: isEdit ? z.string() : passwordSchema(t('passwordPolicy')),
    roleId: z.string().min(1, t('validation.roleRequired')),
    isActive: z.boolean(),
  })

interface UserFormProps {
  /** Route param; yaratmada undefined. */
  id?: string
  /** Redaktədə yüklənmiş detail; yaratmada null. */
  detail: UserDetail | null
}

export function UserForm({ id, detail }: UserFormProps) {
  const { t } = useTranslation('users')
  const router = useRouter()
  const isEdit = id !== undefined
  const schema = useMemo(() => buildSchema(t, isEdit), [t, isEdit])
  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: detail?.username ?? '',
      email: detail?.email ?? '',
      password: '',
      roleId: String(detail?.roleId ?? DEFAULT_ROLE_ID),
      isActive: detail?.isActive ?? true,
    },
  })
  const save = useCrudSave(usersModule, id)
  const [rootError, setRootError] = useState<string | null>(null)

  const onSubmit = form.handleSubmit(async (values) => {
    setRootError(null)
    const payload = isEdit
      ? {
          email: values.email,
          roleId: Number(values.roleId),
          isActive: values.isActive,
        }
      : {
          username: values.username,
          email: values.email,
          password: values.password,
          roleId: Number(values.roleId),
        }
    try {
      await save.mutateAsync(payload)
    } catch (error) {
      if (isAppError(error)) {
        for (const [field, message] of Object.entries(
          error.fieldErrors ?? {},
        )) {
          if (
            field === 'username' ||
            field === 'email' ||
            field === 'password' ||
            field === 'roleId'
          ) {
            form.setError(field, { message })
          }
        }
        setRootError(error.message)
      } else {
        setRootError(t('common:errors.unexpected'))
      }
    }
  })

  const entity = t('entity')
  const title = isEdit
    ? t('crud:editEntity', { entity })
    : t('crud:newEntity', { entity })

  return (
    <>
      <PageHeader
        title={title}
        trail={[{ label: t('title'), path: usersModule.basePath }]}
        actions={
          <>
            <Button
              variant="outline"
              colorPalette="black"
              onClick={() => router.history.push(usersModule.basePath)}
            >
              {t('crud:cancel')}
            </Button>
            <Button type="submit" form="user-form" disabled={save.isPending}>
              {save.isPending ? <Spinner className="size-4" /> : null}
              {t('crud:save')}
            </Button>
          </>
        }
      />

      {rootError ? (
        <Alert variant="surface" colorPalette="red">
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form id="user-form" onSubmit={onSubmit} noValidate>
          <Card>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.username')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="off"
                        disabled={isEdit}
                        className="max-w-md"
                        {...field}
                      />
                    </FormControl>
                    {isEdit ? (
                      <FormDescription>{t('usernameLocked')}</FormDescription>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="off"
                        className="max-w-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEdit ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.password')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          className="max-w-md"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('passwordPolicyHint')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.role')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger
                          className="max-w-xs"
                          onBlur={field.onBlur}
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem
                            key={String(option.value)}
                            value={String(option.value)}
                          >
                            {option.labelKey
                              ? t(option.labelKey)
                              : String(option.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEdit ? (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0">
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
                        <FormLabel>{t('fields.isActive')}</FormLabel>
                        <FormDescription>{t('isActiveHint')}</FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              ) : null}
            </CardContent>
          </Card>
        </form>
      </Form>
    </>
  )
}
