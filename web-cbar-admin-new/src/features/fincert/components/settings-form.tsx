/**
 * "FinCERT → Ümumi" (spec 053, `contracts/admin-ux.md` §2.1): the single settings record — contacts, the reporting
 * portal and, per language, the mission, the portal texts and the RFC-2350 document. One "Yadda saxla" sends one `PUT`;
 * server field errors show under their field; leaving with unsaved changes asks first, as the CRUD forms do. Not a CRUD
 * module: there is no list, only this record.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { Card, CardContent, CardHeader, CardTitle } from '@cbar/lib-react-ui-kit/card'
import { Form } from '@cbar/lib-react-ui-kit/form'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cbar/lib-react-ui-kit/tabs'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { LOCALES } from '@/entities/content/model/types'
import { FieldControl } from '@/features/crud/components/field-control'
import { isAppError } from '@/shared/api/types'
import type { FieldConfig, FormShape } from '@/shared/crud/types'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { ErrorState } from '@/shared/ui/error-state'
import { PageHeader } from '@/shared/ui/page-header'
import { SectionTabs } from '@/shared/ui/section-tabs'
import { useFincertSettings, useSaveFincertSettings } from '../hooks/use-fincert-settings'
import { fincertSectionTabs } from '../model/module'
import type { FincertSettings } from '../model/schemas'
import {
  CONTACT_FIELDS,
  LOCALE_FIELDS,
  PORTAL_FIELDS,
  formPathOf,
  formToBody,
  settingsFormSchema,
  settingsToForm,
} from '../model/settings-form'

const NS = 'fincert'
const FORM_ID = 'fincert-settings-form'

function FieldList({ fields }: Readonly<{ fields: FieldConfig[] }>) {
  return (
    <CardContent className="space-y-4">
      {fields.map((field) => (
        <FieldControl key={field.name} ns={NS} field={field} />
      ))}
    </CardContent>
  )
}

function SettingsFormBody({ settings }: Readonly<{ settings: FincertSettings }>) {
  const { t } = useTranslation(['fincert', 'crud', 'common'])
  const save = useSaveFincertSettings()
  const [rootError, setRootError] = useState<string | null>(null)
  const form = useForm<FormShape>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settingsToForm(settings),
  })

  const unsaved = form.formState.isDirty
  const blocker = useBlocker({
    shouldBlockFn: () => unsaved && !save.isPending,
    enableBeforeUnload: () => unsaved && !save.isPending,
    withResolver: true,
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setRootError(null)
    try {
      const saved = await save.mutateAsync(formToBody(data))
      form.reset(settingsToForm(saved))
      toast.success(t('fincert:general.saved'))
    } catch (error) {
      if (!isAppError(error)) {
        setRootError(t('common:errors.unexpected'))
        return
      }
      let unplaced = false
      for (const [field, text] of Object.entries(error.fieldErrors ?? {})) {
        const path = formPathOf(field)
        if (path) form.setError(path, { message: text })
        else unplaced = true
      }
      // Field errors show under their field; an error without one, or on a key the form has no field for, needs the banner.
      if (unplaced || !error.fieldErrors || Object.keys(error.fieldErrors).length === 0) setRootError(error.message)
    }
  })

  const localeErrors = form.formState.errors.translations

  return (
    <>
      <PageHeader
        title={t('fincert:general.title')}
        description={t('fincert:general.description')}
        actions={
          <Button type="submit" form={FORM_ID} disabled={save.isPending}>
            {save.isPending ? <Spinner className="size-4" /> : null}
            {t('crud:save')}
          </Button>
        }
      />
      <SectionTabs tabs={fincertSectionTabs} />

      {rootError ? (
        <Alert variant="surface" colorPalette="red">
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('fincert:general.contacts')}</CardTitle>
              </CardHeader>
              <FieldList fields={CONTACT_FIELDS} />
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('fincert:general.portal')}</CardTitle>
              </CardHeader>
              <FieldList fields={PORTAL_FIELDS} />
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('fincert:general.texts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={LOCALES[0]}>
                <TabsList variant="line">
                  {LOCALES.map((locale) => (
                    <TabsTrigger key={locale} value={locale}>
                      {t(`crud:localeTab.${locale}`)}
                      {localeErrors?.[locale] ? (
                        <Badge size="xs" variant="subtle" colorPalette="red" className="ml-2">
                          {t('crud:localeHasErrors')}
                        </Badge>
                      ) : null}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LOCALES.map((locale) => (
                  // Both tabs stay mounted, so a server error on the hidden language is still set on its field.
                  <TabsContent key={locale} value={locale} className="pt-4" forceMount>
                    <div className="space-y-4 data-[state=inactive]:hidden">
                      {LOCALE_FIELDS.map((field) => (
                        <FieldControl
                          key={`${locale}.${field.name}`}
                          ns={NS}
                          field={field}
                          locale={locale}
                          mediaName={field.type === 'media' ? (settings.translations[locale]?.rfcFile?.originalName ?? undefined) : undefined}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </form>
      </Form>

      <DeleteDialog
        open={blocker.status === 'blocked'}
        title={t('crud:unsaved.title')}
        description={t('crud:unsaved.description')}
        confirmLabel={t('crud:unsaved.leave')}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  )
}

export function SettingsForm() {
  const { t } = useTranslation('fincert')
  const settings = useFincertSettings()

  if (settings.isSuccess) return <SettingsFormBody settings={settings.data} />
  // While loading or after an error the title and the tabs stay, so the editor can still reach the two lists.
  return (
    <>
      <PageHeader title={t('general.title')} description={t('general.description')} />
      <SectionTabs tabs={fincertSectionTabs} />
      {settings.isError ? (
        <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />
      ) : (
        <Skeleton className="h-96 w-full" />
      )}
    </>
  )
}
