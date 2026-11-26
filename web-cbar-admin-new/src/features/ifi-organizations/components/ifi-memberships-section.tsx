/**
 * Membership dates of an organization (spec 044): the date cards in the open accordion on the site.
 * A sub-resource of the organization, so it shows after the first save, like CSR photos. Every
 * change refetches the detail; the list order is the order of the cards on the site.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { DatePicker } from '@cbar/lib-react-ui-kit/date-picker'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Label } from '@cbar/lib-react-ui-kit/label'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LOCALES } from '@/entities/content/model/types'
import { isAppError } from '@/shared/api/types'
import { dateStringToDate, dateToDateString } from '@/shared/crud/date-io'
import type { AnyRow } from '@/shared/crud/types'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { ifiOrganizationsKeys } from '../api/ifi-organizations.keys'
import { membershipsService } from '../api/memberships.service'
import {
  ifiMembershipSchema,
  type IfiMembership,
  type IfiMembershipUpsert,
} from '../model/schemas'

interface IfiMembershipsSectionProps {
  id: string
  detail: AnyRow
}

type Draft = { joinedOn: string; names: Record<string, string> }

/** `'new'` adds a membership, a number edits that one, `null` shows no form. */
type Editing = 'new' | number | null

const emptyDraft = (): Draft => ({ joinedOn: '', names: {} })

const draftOf = (membership: IfiMembership): Draft => ({
  joinedOn: membership.joinedOn,
  names: Object.fromEntries(
    Object.entries(membership.translations).map(([locale, t]) => [locale, t?.name ?? '']),
  ),
})

/** A language left blank is not sent, so the API removes it (contracts/api.md). */
function toUpsert(draft: Draft): IfiMembershipUpsert {
  const translations = Object.fromEntries(
    LOCALES.flatMap((locale) => {
      const name = (draft.names[locale] ?? '').trim()
      return name ? [[locale, { name }]] : []
    }),
  )
  return { joinedOn: draft.joinedOn, translations }
}

/** Shown in the list: the az name, else any language's. */
const labelOf = (membership: IfiMembership) =>
  membership.translations.az?.name ??
  Object.values(membership.translations).find(Boolean)?.name ??
  `#${membership.id}`

/** `yyyy-MM-dd` → `dd.MM.yyyy`, as on the site. */
const displayDate = (iso: string) => iso.split('-').reverse().join('.')

export function IfiMembershipsSection({ id, detail }: IfiMembershipsSectionProps) {
  const { t, i18n } = useTranslation('ifiOrganizations')
  const queryClient = useQueryClient()
  const formId = useId()
  const [editing, setEditing] = useState<Editing>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [formError, setFormError] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IfiMembership | null>(null)

  // The detail is already schema-checked; this only narrows the type.
  const memberships = useMemo<IfiMembership[]>(() => {
    const parsed = ifiMembershipSchema.array().safeParse(detail.memberships ?? [])
    return parsed.success ? parsed.data : []
  }, [detail.memberships])

  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: ifiOrganizationsKeys.detail(id) })

  const save = useMutation({
    mutationFn: (body: IfiMembershipUpsert) =>
      editing === 'new' || editing === null
        ? membershipsService.create(id, body)
        : membershipsService.update(id, editing, body),
    onSuccess: () => {
      setEditing(null)
      setFormError(null)
      toast.success(t('memberships.saved'))
      refresh()
    },
    onError: (error) =>
      setFormError(isAppError(error) ? error.message : t('memberships.saveFailed')),
  })
  const remove = useMutation({
    mutationFn: (membership: IfiMembership) => membershipsService.remove(id, membership.id),
    onSuccess: () => {
      setDeleteTarget(null)
      toast.success(t('memberships.deleted'))
      refresh()
    },
  })
  const reorder = useMutation({
    mutationFn: (ids: number[]) => membershipsService.reorder(id, ids),
    onSuccess: () => {
      setRowError(null)
      toast.success(t('memberships.reordered'))
      refresh()
    },
    onError: (error) =>
      setRowError(isAppError(error) ? error.message : t('memberships.reorderFailed')),
  })

  const open = (next: Editing, value: Draft) => {
    setFormError(null)
    setDraft(value)
    setEditing(next)
  }

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= memberships.length) return
    const ids = memberships.map((membership) => membership.id)
    ;[ids[index], ids[target]] = [ids[target]!, ids[index]!]
    reorder.mutate(ids)
  }

  const submit = () => {
    const body = toUpsert(draft)
    if (!body.joinedOn) return setFormError(t('memberships.dateRequired'))
    if (Object.keys(body.translations).length === 0) return setFormError(t('memberships.nameRequired'))
    save.mutate(body)
  }

  const title = t('memberships.title')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{t('memberships.description')}</CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="outline"
            colorPalette="black"
            size="sm"
            onClick={() => open('new', emptyDraft())}
          >
            <PlusIcon size={16} />
            {t('memberships.add')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {rowError ? (
          <Alert variant="surface" colorPalette="red">
            <AlertDescription>{rowError}</AlertDescription>
          </Alert>
        ) : null}

        {memberships.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('memberships.empty')}</p>
        ) : (
          <ul className="divide-border divide-y" aria-label={title}>
            {memberships.map((membership, index) => {
              const name = labelOf(membership)
              return (
                <li key={membership.id} className="flex items-center gap-3 py-2">
                  <span className="text-muted-foreground w-24 shrink-0 text-sm tabular-nums">
                    {displayDate(membership.joinedOn)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('memberships.moveUpAria', { name })}
                    disabled={index === 0 || reorder.isPending}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('memberships.moveDownAria', { name })}
                    disabled={index === memberships.length - 1 || reorder.isPending}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('memberships.editAria', { name })}
                    onClick={() => open(membership.id, draftOf(membership))}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    aria-label={t('memberships.deleteAria', { name })}
                    onClick={() => {
                      remove.reset()
                      setDeleteTarget(membership)
                    }}
                  >
                    <TrashIcon />
                  </IconButton>
                </li>
              )
            })}
          </ul>
        )}

        {editing !== null ? (
          <section
            aria-label={editing === 'new' ? t('memberships.addTitle') : t('memberships.editTitle')}
            className="border-border space-y-3 rounded-md border p-4"
          >
            {formError ? (
              <Alert variant="surface" colorPalette="red">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-date`}>{t('memberships.date')}</Label>
              <DatePicker
                id={`${formId}-date`}
                value={dateStringToDate(draft.joinedOn)}
                onChange={(date) => setDraft({ ...draft, joinedOn: dateToDateString(date) })}
                format="dd.MM.yyyy"
                locale={i18n.language.startsWith('en') ? 'en-GB' : 'az-AZ'}
                aria-label={t('memberships.date')}
              />
            </div>
            {LOCALES.map((locale) => (
              <div key={locale} className="space-y-1.5">
                <Label htmlFor={`${formId}-${locale}`}>
                  {t('memberships.name', { locale: locale.toUpperCase() })}
                </Label>
                <Input
                  id={`${formId}-${locale}`}
                  value={draft.names[locale] ?? ''}
                  onChange={(event) =>
                    setDraft({ ...draft, names: { ...draft.names, [locale]: event.target.value } })
                  }
                />
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" colorPalette="black" size="sm" onClick={() => setEditing(null)}>
                {t('memberships.cancel')}
              </Button>
              <Button type="button" size="sm" disabled={save.isPending} onClick={submit}>
                {t('memberships.save')}
              </Button>
            </div>
          </section>
        ) : null}
      </CardContent>

      <DeleteDialog
        open={deleteTarget !== null}
        title={t('memberships.deleteTitle')}
        description={t('memberships.deleteConfirm', { name: deleteTarget ? labelOf(deleteTarget) : '' })}
        confirmLabel={t('memberships.delete')}
        isPending={remove.isPending}
        error={remove.error}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget)}
      />
    </Card>
  )
}
