import { Card } from '@cbar/lib-react-ui-kit/card'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { LoginForm } from '../components/login-form'
import { LoginImage } from '../components/login-image'
import { safeRedirect } from '../lib/safe-redirect'

const route = getRouteApi('/login')

export function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation('auth')
  const { redirect } = route.useSearch()

  // Kartın hündürlüyü sabitdir (xəta alert-i üçün yer də daxil) — xəta çıxanda
  // kart böyüməsin. Sahə xətaları üçün yer `login-form`-da ayrılıb.
  // Qat sırası z-index ilə yox, DOM sırası ilə qurulur: fon və kart ikisi də
  // `absolute`/`relative`-dir, kart sonra gəldiyi üçün həmişə üstdədir.
  return (
    <div className="relative flex min-h-svh items-center justify-center p-4 sm:p-8">
      {/* Fon: eyni şəkil, bulanıq və korporativ tonla örtülmüş. */}
      <LoginImage
        className="absolute inset-0"
        imgClassName="scale-110 blur-xl"
      />
      <div className="bg-primary/35 dark:bg-background/70 absolute inset-0" />

      <Card className="relative grid w-full max-w-sm gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl lg:max-w-5xl lg:grid-cols-2">
        {/* Sol: forma */}
        <div className="flex h-[39rem] flex-col justify-center gap-8 overflow-y-auto p-8 sm:p-10 lg:h-[42rem] lg:p-14">
          {/* Loqo public saytla eynidir (`public/site/logo-az.svg`, 228×56).
              Dark temada yalnız mətn ağdır — tünd göy mətn tünd kartda itir. Tema `html.dark` klası ilə seçilir. */}
          <div className="self-start">
            <img
              src="/site/logo-az.svg"
              alt={t('bankName')}
              width={228}
              height={56}
              className="h-14 w-auto dark:hidden"
            />
            <img
              src="/site/logo-az-dark.svg"
              alt={t('bankName')}
              width={228}
              height={56}
              className="hidden h-14 w-auto dark:block"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t('welcome')}
            </h1>
            <p className="text-muted-foreground text-sm">{t('welcomeHint')}</p>
          </div>

          <LoginForm
            onSuccess={() => router.history.push(safeRedirect(redirect))}
          />

          <p className="text-muted-foreground text-xs">{t('subtitle')}</p>
        </div>

        {/* Sağ: illüstrasiya — yalnız desktopda. Binalar şəklin sağ yarısındadır. */}
        <div className="relative hidden lg:block">
          <LoginImage
            className="absolute inset-0"
            imgClassName="object-[68%_center]"
          />
          <div className="from-primary/85 via-primary/20 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent px-10 pt-24 pb-10">
            <p className="text-primary-foreground max-w-60 text-lg leading-snug font-semibold">
              {t('bankName')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
