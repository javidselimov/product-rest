/**
 * Page form (spec FR-030): az/en title, slug, menu group, rich text; status, order, menu link, footer;
 * the menu location card (spec 054: two flags as one radio group); the other flags in 4 groups;
 * the `readonly`/`disabled` lock. PUT always sends the WHOLE `flags` object (a partial one would
 * clear protection flags).
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
import { Checkbox } from '@cbar/lib-react-ui-kit/checkbox'
import { FieldLegend, FieldSet } from '@cbar/lib-react-ui-kit/field'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cbar/lib-react-ui-kit/tabs'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Suspense, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { LOCALES, PAGE_STATUS_OPTIONS } from '@/entities/content/model/types'
import { FaqPageLinksCard } from '@/features/faq/components/faq-page-links-card'
import { RichTextEditor, RichTextEditorFallback } from '@/features/rich-text'
import { isAppError } from '@/shared/api/types'
import { PageHeader } from '@/shared/ui/page-header'
import { pagesKeys } from '../api/pages.keys'
import { pagesService } from '../api/pages.service'
import { useManagedNav } from '../hooks/use-managed-nav'
import { MENU_GROUP_MAX_LENGTH } from '../model/constants'
import {
  DEFAULT_PAGE_FLAGS,
  PAGE_FLAG_KEYS,
  type PageDetail,
  type PageFlagKey,
  type PageUpsert,
} from '../model/schemas'
import { ManagedSectionCard } from './managed-section-card'
import { MenuVisibilityCard } from './menu-visibility-card'
import { PageAttachmentsSection } from './page-attachments-section'

const FLAG_GROUPS: { key: string; flags: PageFlagKey[] }[] = [
  {
    key: 'visibility',
    // showInSideNav is set by the menu location card (spec 054).
    flags: ['active', 'visible', 'showAz', 'showEn'],
  },
  {
    key: 'protection',
    flags: ['readonly', 'disabled', 'removable', 'removableAll'],
  },
  { key: 'movement', flags: ['movableU', 'movableD', 'movableL', 'movableR'] },
  { key: 'treeState', flags: ['selected', 'collapsed'] },
]

const buildTranslationSchema = (t: TranslateFn) =>
  z.object({
    title: z.string(),
    slug: z.string(),
    menuGroup: z.string().max(
      MENU_GROUP_MAX_LENGTH,
      t('validation.menuGroupTooLong', { max: MENU_GROUP_MAX_LENGTH }),
    ),
    content: z.string(),
  })

type TranslateFn = (key: string, options?: Record<string, unknown>) => string

const buildSchema = (t: TranslateFn) => {
  const translationSchema = buildTranslationSchema(t)
  return z
    .object({
      status: z.string().min(1),
      sortOrder: z
        .string()
        .refine(
          (v) => v.trim() !== '' && Number.isInteger(Number(v)),
          t('validation.sortOrder'),
        ),
      navUrl: z.string(),
      showInFooter: z.boolean(),
      flags: z.object({
        ...(Object.fromEntries(
          PAGE_FLAG_KEYS.map((k) => [k, z.boolean()]),
        ) as Record<PageFlagKey, z.ZodBoolean>),
        showInDropdownNav: z.boolean().nullable(),
      }),
      translations: z.object({ az: translationSchema, en: translationSchema }),
    })
    .superRefine((data, ctx) => {
      if (!LOCALES.some((l) => data.translations[l].title.trim() !== '')) {
        ctx.addIssue({
          code: 'custom',
          path: ['translations'],
          message: t('validation.titleRequired'),
        })
      }
    })
}

type PageFormValues = z.infer<ReturnType<typeof buildSchema>>

interface PageFormProps {
  id?: string
  detail: PageDetail | null
  parentId: number | null
}

export function PageForm({ id, detail, parentId }: PageFormProps) {
  const { t, i18n } = useTranslation(['pages', 'common', 'crud'])
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEdit = id !== undefined
  const schema = useMemo(
    () => buildSchema((k, options) => t(`pages:${k}`, options)),
    [t],
  )
  // A page filled by a section of its own marks that section in the menu (spec 053 US4).
  useManagedNav(detail?.translations.az?.slug)

  const defaultValues = useMemo<PageFormValues>(
    () => ({
      status: detail?.status ?? 'draft',
      sortOrder: String(detail?.sortOrder ?? 1),
      navUrl: detail?.navUrl ?? '',
      showInFooter: detail?.showInFooter ?? false,
      flags: { ...DEFAULT_PAGE_FLAGS, ...(detail?.flags ?? {}) },
      translations: {
        az: {
          title: detail?.translations.az?.title ?? '',
          slug: detail?.translations.az?.slug ?? '',
          menuGroup: detail?.translations.az?.menuGroup ?? '',
          content: detail?.translations.az?.content ?? '',
        },
        en: {
          title: detail?.translations.en?.title ?? '',
          slug: detail?.translations.en?.slug ?? '',
          menuGroup: detail?.translations.en?.menuGroup ?? '',
          content: detail?.translations.en?.content ?? '',
        },
      },
    }),
    [detail],
  )
  const form = useForm<PageFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  const [rootError, setRootError] = useState<string | null>(null)

  const flags = useWatch({ control: form.control, name: 'flags' })
  const status = useWatch({ control: form.control, name: 'status' })
  const titleAz = useWatch({
    control: form.control,
    name: 'translations.az.title',
  })
  const titleEn = useWatch({
    control: form.control,
    name: 'translations.en.title',
  })
  const locked = flags.readonly || flags.disabled

  const save = useMutation({
    mutationFn: (payload: PageUpsert) =>
      isEdit ? pagesService.update(id, payload) : pagesService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pagesKeys.all })
      toast.success(isEdit ? t('crud:saved') : t('crud:created'))
      router.history.push('/pages')
    },
    onError: (error) =>
      setRootError(
        isAppError(error) ? error.message : t('common:errors.unexpected'),
      ),
  })

  const onSubmit = form.handleSubmit((data) => {
    setRootError(null)
    const translations: PageUpsert['translations'] = {}
    for (const locale of LOCALES) {
      const tr = data.translations[locale]
      if (tr.title.trim() === '') continue
      // The label goes only when the editor changed it: an omitted one keeps what is stored, '' clears it.
      const menuGroup = tr.menuGroup.trim()
      const storedMenuGroup = detail?.translations[locale]?.menuGroup ?? ''
      translations[locale] = {
        title: tr.title.trim(),
        content: tr.content,
        ...(tr.slug.trim() ? { slug: tr.slug.trim() } : {}),
        ...(menuGroup === storedMenuGroup ? {} : { menuGroup }),
      }
    }
    save.mutate({
      parentId: detail?.parentId ?? parentId,
      sortOrder: Number(data.sortOrder),
      status: data.status,
      showInFooter: data.showInFooter,
      navUrl: data.navUrl.trim() === '' ? null : data.navUrl.trim(),
      flags: data.flags,
      translations,
    })
  })

  const translationsError = form.formState.errors.translations
  const translationsMessage =
    translationsError && 'message' in translationsError
      ? (translationsError.message as string | undefined)
      : undefined

  return (
    <>
      <PageHeader
        title={
          isEdit
            ? t('pages:editTitle', {
                name:
                  detail?.translations.az?.title ??
                  detail?.translations.en?.title ??
                  id,
              })
            : t('pages:newTitle')
        }
        trail={[{ label: t('pages:title'), path: '/pages' }]}
        actions={
          <>
            <Button
              variant="outline"
              colorPalette="black"
              onClick={() => router.history.push('/pages')}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" form="page-form" disabled={save.isPending}>
              {save.isPending ? <Spinner className="size-4" /> : null}
              {t('common:actions.save')}
            </Button>
          </>
        }
      />

      {locked ? (
        <Alert variant="surface" colorPalette="yellow">
          <AlertDescription>{t('pages:lockedHint')}</AlertDescription>
        </Alert>
      ) : null}
      {rootError ? (
        <Alert variant="surface" colorPalette="red">
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      ) : translationsMessage && form.formState.isSubmitted ? (
        <Alert variant="surface" colorPalette="red">
          <AlertDescription>{translationsMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form
          id="page-form"
          onSubmit={onSubmit}
          noValidate
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('crud:translations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="az">
                <TabsList variant="line">
                  {LOCALES.map((locale) => (
                    <TabsTrigger key={locale} value={locale}>
                      {t(`crud:localeTab.${locale}`)}
                      {translationsMessage ? (
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
                {LOCALES.map((locale) => (
                  <TabsContent
                    key={locale}
                    value={locale}
                    className="space-y-4 pt-4"
                    forceMount
                  >
                    <div className="space-y-4 data-[state=inactive]:hidden">
                      <FormField
                        control={form.control}
                        name={`translations.${locale}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('pages:fields.title')} ({locale.toUpperCase()})
                            </FormLabel>
                            <FormControl>
                              <Input {...field} disabled={locked} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`translations.${locale}.slug`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('pages:fields.slug')} ({locale.toUpperCase()})
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={locked}
                                placeholder={t('pages:slugAuto')}
                                className="font-mono"
                              />
                            </FormControl>
                            <FormDescription>
                              {t('pages:slugFixed')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`translations.${locale}.menuGroup`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('pages:fields.menuGroup')} (
                              {locale.toUpperCase()})
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={locked}
                                maxLength={MENU_GROUP_MAX_LENGTH}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('pages:menuGroupHint')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`translations.${locale}.content`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('pages:fields.content')} (
                              {locale.toUpperCase()})
                            </FormLabel>
                            <FormControl>
                              <Suspense fallback={<RichTextEditorFallback />}>
                                <RichTextEditor
                                  value={field.value}
                                  onChange={field.onChange}
                                  editable={!locked}
                                />
                              </Suspense>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('crud:generalFields')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages:fields.status')}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          aria-label={t('pages:fields.status')}
                          className="max-w-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_STATUS_OPTIONS.map((o) => (
                            <SelectItem
                              key={String(o.value)}
                              value={String(o.value)}
                            >
                              {t(o.labelKey!)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages:fields.sortOrder')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={1}
                        {...field}
                        className="max-w-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="navUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages:fields.navUrl')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={locked}
                        placeholder="https://…"
                      />
                    </FormControl>
                    <FormDescription>{t('pages:navUrlHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="showInFooter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(c) => field.onChange(c === true)}
                      />
                    </FormControl>
                    <FormLabel>{t('pages:flags.showInFooter')}</FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <MenuVisibilityCard
            page={{ status, flags, titles: { az: titleAz, en: titleEn } }}
            parentId={isEdit ? (detail?.parentId ?? null) : parentId}
            onLocationChange={(pair) => {
              form.setValue('flags.showInSideNav', pair.showInSideNav, {
                shouldDirty: true,
              })
              form.setValue(
                'flags.showInDropdownNav',
                pair.showInDropdownNav,
                { shouldDirty: true },
              )
            }}
          />

          {isEdit ? (
            <>
              <ManagedSectionCard slug={detail?.translations.az?.slug} />
              <FaqPageLinksCard pageId={Number(id)} />
            </>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{t('pages:flagsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {FLAG_GROUPS.map((group) => (
                <FieldSet key={group.key}>
                  <FieldLegend>
                    {t(`pages:flagGroups.${group.key}`)}
                  </FieldLegend>
                  <div className="space-y-2">
                    {group.flags.map((flag) => (
                      <FormField
                        key={flag}
                        control={form.control}
                        name={`flags.${flag}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start gap-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(c) =>
                                  field.onChange(c === true)
                                }
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t(`pages:flags.${flag}`)}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FieldSet>
              ))}
            </CardContent>
          </Card>
        </form>
      </Form>

      {isEdit && detail ? (
        <PageAttachmentsSection pageId={id} assets={detail.assets} />
      ) : null}
      <p className="sr-only">{i18n.language}</p>
    </>
  )
}
