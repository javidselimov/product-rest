/**
 * Form page generated from the module config (B5–B8): detail fetch + reset by `key`,
 * RHF + Zod, az/en tabs, general fields, `editExtras`. A create form takes the
 * `prefillFromSearch` fields from the URL; leaving a form with unsaved changes asks
 * first (spec 051).
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { Form } from '@cbar/lib-react-ui-kit/form'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cbar/lib-react-ui-kit/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  useBlocker,
  useParams,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { HTTP_STATUS } from '@/shared/constants/http'
import {
  defaultBuildPayload,
  defaultParseDetail,
  initialFormState,
  serverErrorPath,
} from '@/shared/crud/form-model'
import { configLocales, getByPath, nsKey } from '@/shared/crud/path'
import { buildFormSchema, prefillValues } from '@/shared/crud/schema'
import type { AnyRow, FormShape, ModuleConfig } from '@/shared/crud/types'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { ErrorState } from '@/shared/ui/error-state'
import { PageHeader } from '@/shared/ui/page-header'
import { crudSaveKey, useCrudDetail, useCrudSave } from '../hooks/use-crud'
import { resolveModule } from '../model/module-registry'
import { FieldControl } from './field-control'

interface CrudFormPageProps<Row extends AnyRow> {
  config: ModuleConfig<Row, string>
  /** Route param-dan oxunmursa açıq verilir. */
  id?: string
}

export function CrudFormPage<Row extends AnyRow>({
  config,
  id: idProp,
}: CrudFormPageProps<Row>) {
  const params = useParams({ strict: false }) as { id?: string }
  const id = idProp ?? params.id
  const { t } = useTranslation()
  const detail = useCrudDetail(config, id)

  if (id !== undefined && detail.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }
  if (id !== undefined && detail.isError) {
    const error: unknown = detail.error
    const notFound = isAppError(error) && error.status === HTTP_STATUS.NOT_FOUND
    return (
      <ErrorState
        error={notFound ? { message: t('crud:notFound') } : error}
        onRetry={() => void detail.refetch()}
      />
    )
  }
  return (
    <CrudFormEditor
      key={id ?? 'new'}
      config={config}
      id={id}
      detail={id !== undefined ? (detail.data ?? null) : null}
    />
  )
}

interface CrudFormEditorProps<Row extends AnyRow> {
  config: ModuleConfig<Row, string>
  id: string | undefined
  detail: AnyRow | null
}

function CrudFormEditor<Row extends AnyRow>({
  config,
  id,
  detail,
}: CrudFormEditorProps<Row>) {
  const { t } = useTranslation()
  const router = useRouter()
  const isEdit = id !== undefined
  const locales = configLocales(config)
  const localeFields = config.fields.filter((f) => f.perLocale)
  const generalFields = config.fields.filter((f) => !f.perLocale)
  const canEdit = config.canEdit ?? true
  const readOnly = isEdit && !canEdit

  const schema = useMemo(() => buildFormSchema(config), [config])
  const search = useRouterState({
    select: (s) => s.location.search as Record<string, unknown>,
  })
  const defaultValues = useMemo<FormShape>(() => {
    if (detail !== null) {
      return (
        config.parseDetail ?? ((d: AnyRow) => defaultParseDetail(config, d))
      )(detail)
    }
    const initial = initialFormState(config)
    return {
      ...initial,
      values: {
        ...initial.values,
        ...prefillValues(config.prefillFromSearch, search),
      },
    }
    // The URL is read once, when the form opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, detail])
  const form = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  const save = useCrudSave(config, id)
  const [rootError, setRootError] = useState<string | null>(null)

  // A save navigates back to the list from its `onSuccess`, while the mutation is still
  // pending. That can happen before React renders the pending state, so the blocker asks
  // the mutation cache at the moment of navigation, not the last render.
  const queryClient = useQueryClient()
  const unsaved = form.formState.isDirty && !readOnly
  const saving = () =>
    queryClient.isMutating({ mutationKey: crudSaveKey(config.id) }) > 0
  const blocker = useBlocker({
    shouldBlockFn: () => unsaved && !saving(),
    enableBeforeUnload: () => unsaved && !saving(),
    withResolver: true,
  })

  const entity = t(nsKey(config.ns, config.entityKey ?? config.titleKey))
  const title = isEdit
    ? t('crud:editEntity', { entity })
    : t('crud:newEntity', { entity })
  const trail = [
    ...(config.crumbs ?? []).map((c) => ({
      label: t(c.labelKey),
      path: c.path,
    })),
    { label: t(nsKey(config.ns, config.titleKey)), path: config.basePath },
  ]

  const onSubmit = form.handleSubmit(async (data) => {
    setRootError(null)
    const payload = config.buildPayload
      ? config.buildPayload(data.values, data.translations, detail)
      : defaultBuildPayload(config, data.values, data.translations)
    try {
      await save.mutateAsync(payload)
    } catch (error) {
      if (isAppError(error)) {
        const fieldErrors = Object.entries(error.fieldErrors ?? {})
        let unplaced = false
        for (const [key, message] of fieldErrors) {
          const path = serverErrorPath(config, key)
          if (path) form.setError(path, { message })
          else unplaced = true
        }
        const conflictOnField =
          fieldErrors.length === 0 &&
          error.status === HTTP_STATUS.CONFLICT &&
          config.conflictField !== undefined
        if (conflictOnField) {
          form.setError(`values.${config.conflictField}`, {
            message: error.message,
          })
        }
        // An error that landed on its field shows there; the banner then asks to fix the marked fields.
        if (unplaced || (fieldErrors.length === 0 && !conflictOnField)) {
          setRootError(error.message)
        }
      } else {
        setRootError(t('common:errors.unexpected'))
      }
    }
  })

  const translationsError = form.formState.errors.translations
  const translationsMessage =
    translationsError && 'message' in translationsError
      ? (translationsError.message as string | undefined)
      : undefined
  const formErrorCount = Object.keys(form.formState.errors).length
  /** A tab is marked for an error of the whole translations block or one of its own fields. */
  const localeHasErrors = (locale: string) =>
    Boolean(translationsMessage) ||
    Object.keys(
      (translationsError as Record<string, object | undefined> | undefined)?.[
        locale
      ] ?? {},
    ).length > 0

  const EditExtras = config.editExtras

  return (
    <>
      <PageHeader
        title={title}
        trail={trail}
        actions={
          <>
            <Button
              variant="outline"
              colorPalette="black"
              onClick={() => router.history.push(config.basePath)}
            >
              {t('crud:cancel')}
            </Button>
            {!readOnly ? (
              <Button type="submit" form="crud-form" disabled={save.isPending}>
                {save.isPending ? <Spinner className="size-4" /> : null}
                {t('crud:save')}
              </Button>
            ) : null}
          </>
        }
      />

      {readOnly ? (
        <Alert variant="surface" colorPalette="yellow">
          <AlertDescription>{t('crud:readOnly')}</AlertDescription>
        </Alert>
      ) : null}

      {rootError ? (
        <Alert variant="surface" colorPalette="red">
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      ) : formErrorCount > 0 && form.formState.isSubmitted ? (
        <Alert variant="surface" colorPalette="red">
          <AlertDescription>
            {translationsMessage ?? t('crud:validation.fixErrors')}
          </AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form
          id="crud-form"
          onSubmit={onSubmit}
          noValidate
          className="space-y-6"
        >
          {localeFields.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('crud:translations')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={locales[0]}>
                  <TabsList variant="line">
                    {locales.map((locale) => (
                      <TabsTrigger key={locale} value={locale}>
                        {t(`crud:localeTab.${locale}`)}
                        {localeHasErrors(locale) ? (
                          <Badge
                            size="xs"
                            variant="subtle"
                            colorPalette="red"
                            className="ml-2"
                          >
                            {t('crud:localeHasErrors')}
                          </Badge>
                        ) : null}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {locales.map((locale) => (
                    <TabsContent
                      key={locale}
                      value={locale}
                      className="space-y-4 pt-4"
                      forceMount
                    >
                      <div className="space-y-4 data-[state=inactive]:hidden">
                        {localeFields.map((field) => (
                          <FieldControl
                            key={`${locale}.${field.name}`}
                            ns={config.ns}
                            field={field}
                            locale={locale}
                            disabled={readOnly}
                            mediaName={
                              field.type === 'media' &&
                              field.mediaNameKey &&
                              detail
                                ? (getByPath(
                                    detail,
                                    field.mediaNameKey.replace(
                                      '{locale}',
                                      locale,
                                    ),
                                  ) as string | undefined)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : null}

          {generalFields.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('crud:generalFields')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generalFields.map((field) => (
                  <FieldControl
                    key={field.name}
                    ns={config.ns}
                    field={field}
                    disabled={readOnly}
                    mediaName={
                      (field.type === 'media' || field.searchable) &&
                      field.mediaNameKey &&
                      detail
                        ? (getByPath(detail, field.mediaNameKey) as
                            string | undefined)
                        : undefined
                    }
                  />
                ))}
              </CardContent>
            </Card>
          ) : null}
        </form>
      </Form>

      {isEdit && detail && EditExtras ? (
        <EditExtras id={id} detail={detail} />
      ) : null}

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

/** Route komponenti: modulu cari yoldan tapır (`module-registry`). */
export function CrudFormPageRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const config = resolveModule(pathname)
  if (!config) throw new Error(`CRUD modulu tapılmadı: ${pathname}`)
  return <CrudFormPage config={config} />
}
