import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@cbar/lib-react-ui-kit/form'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { userFromToken } from '@/entities/user/model/types'
import { isAppError } from '@/shared/api/types'
import { HTTP_STATUS } from '@/shared/constants/http'
import { authService } from '../api/auth.service'
import { useAuthStore } from '../model/auth-store'

const buildLoginSchema = (t: (key: string) => string) =>
  z.object({
    username: z.string().trim().min(1, t('validation.usernameRequired')),
    password: z.string().min(1, t('validation.passwordRequired')),
  })

type LoginValues = z.infer<ReturnType<typeof buildLoginSchema>>

interface LoginFormProps {
  /** Uğurlu login-dən sonra çağırılır — səhifə redirect-i idarə edir. */
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation('auth')
  const login = useAuthStore((state) => state.login)
  const loginSchema = useMemo(() => buildLoginSchema(t), [t])
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    try {
      const { accessToken, expiresAt } = await authService.login(values)
      const user = userFromToken(accessToken)
      if (!user) {
        form.setError('root', { message: t('unexpectedError') })
        return
      }
      login(accessToken, user, expiresAt)
      onSuccess()
    } catch (error) {
      if (isAppError(error) && error.status === HTTP_STATUS.UNAUTHORIZED) {
        // Yanlış məlumat digər texniki xətalardan fərqləndirilir (spec FR-009).
        form.setError('root', { message: t('invalidCredentials') })
      } else if (isAppError(error) && error.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
        // Server mətni ingiliscədir — ad üzrə limit lokal mətnlə göstərilir (spec 012 FR-013).
        form.setError('root', { message: t('tooManyAttempts') })
      } else if (isAppError(error)) {
        form.setError('root', { message: error.message })
      } else {
        form.setError('root', { message: t('unexpectedError') })
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2"
        noValidate
      >
        {form.formState.errors.root ? (
          <Alert variant="surface" colorPalette="red" className="mb-2">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="relative pb-6">
              <FormLabel>{t('username')}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  autoComplete="username"
                  placeholder={t('usernamePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage className="absolute inset-x-0 bottom-0 truncate text-xs leading-6" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative pb-6">
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage className="absolute inset-x-0 bottom-0 truncate text-xs leading-6" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? <Spinner className="size-4" /> : null}
          {t('submit')}
        </Button>
      </form>
    </Form>
  )
}
