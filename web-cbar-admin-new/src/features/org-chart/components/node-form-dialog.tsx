/**
 * Create / edit a chart node (spec 027, spec 060). The card either links to a staff member or a division
 * (its name, position and public link come from there) or stands alone with its own title;
 * per-locale title/subtitle override the linked texts. A block or group chooses how the site's desktop
 * chart shows its departments ("Departamentlər"). The sibling order is not a field: a new card goes last
 * among its siblings, an edited one keeps its place (or goes last under a new parent), and
 * "Sıranı dəyiş" in the list moves it.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { Checkbox } from '@cbar/lib-react-ui-kit/checkbox'
import { Combobox, type ComboboxOption } from '@cbar/lib-react-ui-kit/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@cbar/lib-react-ui-kit/dialog'
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@cbar/lib-react-ui-kit/field'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { RadioGroup, RadioGroupItem } from '@cbar/lib-react-ui-kit/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cbar/lib-react-ui-kit/select'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { TreeSelect } from '@cbar/lib-react-ui-kit/tree-select'
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LOCALES, firstTranslation, type Locale } from '@/entities/content/model/types'
import { isAppError } from '@/shared/api/types'
import { useOrgChartLinks, useSaveOrgChartNode } from '../hooks/use-org-chart'
import { DEPARTMENTS_MODE, DEPARTMENTS_OPEN_KINDS } from '../model/constants'
import { ORG_CHART_KINDS, type OrgChartNode, type OrgChartNodeUpsert } from '../model/schemas'
import { descendantIds, nodeTitle, toTreeSelectData } from '../model/tree'

type LinkType = 'none' | 'staff' | 'division'
type DepartmentsMode = (typeof DEPARTMENTS_MODE)[keyof typeof DEPARTMENTS_MODE]

/** `null` node with a `parentId` = create under that parent; a node = edit it. */
export type NodeFormTarget = { node: OrgChartNode } | { parentId: number | null }

interface NodeFormDialogProps {
  target: NodeFormTarget | null
  nodes: OrgChartNode[]
  onClose: () => void
}

interface FormState {
  kind: string
  parentId: number | null
  linkType: LinkType
  linkId: string
  curatorDirect: boolean
  isActive: boolean
  departments: DepartmentsMode
  texts: Record<Locale, { title: string; subtitle: string }>
}

/** Last among the siblings under `parentId` (the node itself left out). */
const lastSortOrder = (nodes: OrgChartNode[], parentId: number | null, self: number | null) =>
  nodes.filter((n) => n.parentId === parentId && n.id !== self).reduce((max, n) => Math.max(max, n.sortOrder), 0) + 1

function initialState(target: NodeFormTarget): FormState {
  if ('node' in target) {
    const n = target.node
    return {
      kind: String(n.kind),
      parentId: n.parentId,
      linkType: n.staffId !== null ? 'staff' : n.divisionId !== null ? 'division' : 'none',
      linkId: String(n.staffId ?? n.divisionId ?? ''),
      curatorDirect: n.curatorDirect,
      isActive: n.isActive,
      departments: n.departmentsOpen ? DEPARTMENTS_MODE.OPEN : DEPARTMENTS_MODE.DROPDOWN,
      texts: {
        az: { title: n.translations.az?.title ?? '', subtitle: n.translations.az?.subtitle ?? '' },
        en: { title: n.translations.en?.title ?? '', subtitle: n.translations.en?.subtitle ?? '' },
      },
    }
  }
  return {
    kind: target.parentId === null ? '1' : '5',
    parentId: target.parentId,
    linkType: 'none',
    linkId: '',
    curatorDirect: false,
    isActive: true,
    departments: DEPARTMENTS_MODE.DROPDOWN,
    texts: { az: { title: '', subtitle: '' }, en: { title: '', subtitle: '' } },
  }
}

export function NodeFormDialog({ target, nodes, onClose }: NodeFormDialogProps) {
  return (
    <Dialog open={target !== null} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      {/* Remount per target so the form starts from that node's values. */}
      {target ? <NodeForm key={'node' in target ? target.node.id : `new-${target.parentId}`} target={target} nodes={nodes} onClose={onClose} /> : null}
    </Dialog>
  )
}

function NodeForm({ target, nodes, onClose }: { target: NodeFormTarget; nodes: OrgChartNode[]; onClose: () => void }) {
  const { t } = useTranslation(['organization', 'common'])
  const [form, setForm] = useState(() => initialState(target))
  const [localError, setLocalError] = useState<string | null>(null)
  const links = useOrgChartLinks()
  const save = useSaveOrgChartNode()
  const editing = 'node' in target ? target.node : null
  const untitled = t('organization:chart.untitled')

  const parentData = useMemo(
    () => toTreeSelectData(nodes, editing ? descendantIds(nodes, editing.id) : new Set(), (n) => nodeTitle(n, 'az', untitled)),
    [nodes, editing, untitled],
  )

  const linkOptions = useMemo<ComboboxOption[]>(() => {
    if (form.linkType === 'staff')
      return (links.data?.staff ?? []).map((s) => ({ value: String(s.id), label: firstTranslation(s.translations, 'fullName') }))
    if (form.linkType === 'division')
      return (links.data?.divisions ?? []).map((d) => ({ value: String(d.id), label: firstTranslation(d.translations, 'name') }))
    return []
  }, [form.linkType, links.data])

  /** Linked texts for the placeholders, so the editor sees what an empty override shows. */
  const linkedText = (locale: Locale): { name?: string; role?: string | null } => {
    const id = Number(form.linkId)
    if (form.linkType === 'staff') {
      const tr = links.data?.staff.find((s) => s.id === id)?.translations[locale]
      return { name: tr?.fullName, role: tr?.position }
    }
    if (form.linkType === 'division') return { name: links.data?.divisions.find((d) => d.id === id)?.translations[locale]?.name }
    return {}
  }

  const canOpen = DEPARTMENTS_OPEN_KINDS.includes(Number(form.kind))
  const departmentsLegend = useId()

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))
  const setText = (locale: Locale, key: 'title' | 'subtitle', value: string) =>
    setForm((f) => ({ ...f, texts: { ...f.texts, [locale]: { ...f.texts[locale], [key]: value } } }))

  const submit = () => {
    // The record is optional: a link type with no record saves as an unlinked card, which then
    // needs its own name (the unit may simply not exist in Staff / Divisions).
    if (form.linkId === '' && LOCALES.every((l) => form.texts[l].title.trim() === ''))
      return setLocalError(t('organization:chart.form.titleRequired'))
    setLocalError(null)

    const translations: OrgChartNodeUpsert['translations'] = {}
    for (const l of LOCALES) {
      const { title, subtitle } = form.texts[l]
      if (title.trim() || subtitle.trim()) translations[l] = { title: title.trim() || null, subtitle: subtitle.trim() || null }
    }
    const linkId = form.linkId === '' ? null : Number(form.linkId)
    const sortOrder =
      editing && editing.parentId === form.parentId ? editing.sortOrder : lastSortOrder(nodes, form.parentId, editing?.id ?? null)
    const body: OrgChartNodeUpsert = {
      parentId: form.parentId,
      kind: Number(form.kind),
      staffId: form.linkType === 'staff' ? linkId : null,
      divisionId: form.linkType === 'division' ? linkId : null,
      curatorDirect: form.curatorDirect,
      sortOrder,
      isActive: form.isActive,
      translations,
      departmentsOpen: canOpen && form.departments === DEPARTMENTS_MODE.OPEN,
    }
    save.mutate(
      { id: editing?.id ?? null, body },
      {
        onSuccess: () => {
          toast.success(t('organization:chart.form.saved'))
          onClose()
        },
      },
    )
  }

  const errorMessage =
    localError ?? (save.error ? (isAppError(save.error) ? save.error.message : t('common:errors.unexpected')) : null)

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{editing ? t('organization:chart.form.editTitle') : t('organization:chart.form.createTitle')}</DialogTitle>
        <DialogDescription>{t('organization:chart.form.description')}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="chart-kind">{t('organization:chart.fields.kind')}</FieldLabel>
          <Select value={form.kind} onValueChange={(v) => set('kind', v)}>
            <SelectTrigger id="chart-kind" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORG_CHART_KINDS.map((k) => (
                <SelectItem key={k} value={String(k)}>
                  {t(`organization:chart.kinds.${k}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="chart-parent">{t('organization:chart.fields.parent')}</FieldLabel>
          <TreeSelect
            id="chart-parent"
            treeData={parentData}
            value={form.parentId}
            onChange={(value) => set('parentId', value === null || value === undefined ? null : Number(value))}
            treeDefaultExpandAll
            showSearch
            allowClear
            placeholder={t('organization:chart.fields.root')}
            searchPlaceholder={t('common:search')}
            aria-label={t('organization:chart.fields.parent')}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="chart-link-type">{t('organization:chart.fields.linkType')}</FieldLabel>
          <Select value={form.linkType} onValueChange={(v) => setForm((f) => ({ ...f, linkType: (v || 'none') as LinkType, linkId: '' }))}>
            <SelectTrigger id="chart-link-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['none', 'staff', 'division'] as const).map((v) => (
                <SelectItem key={v} value={v}>
                  {t(`organization:chart.fields.link.${v}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="chart-link">{t('organization:chart.fields.record')}</FieldLabel>
          <Combobox
            id="chart-link"
            options={linkOptions}
            value={form.linkId}
            onValueChange={(v) => set('linkId', v)}
            disabled={form.linkType === 'none' || links.isPending}
            placeholder={t('organization:chart.fields.recordPlaceholder')}
            searchPlaceholder={t('common:search')}
            emptyMessage={t('organization:chart.fields.noRecords')}
            aria-label={t('organization:chart.fields.record')}
            className="w-full"
          />
        </Field>
        {LOCALES.map((l) => (
          <fieldset key={l} className="contents">
            <Field>
              <FieldLabel htmlFor={`chart-title-${l}`}>
                {t('organization:chart.fields.title')} ({t(`crud:localeTab.${l}`)})
              </FieldLabel>
              <Input
                id={`chart-title-${l}`}
                value={form.texts[l].title}
                maxLength={500}
                placeholder={linkedText(l).name ?? ''}
                onChange={(e) => setText(l, 'title', e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`chart-subtitle-${l}`}>
                {t('organization:chart.fields.subtitle')} ({t(`crud:localeTab.${l}`)})
              </FieldLabel>
              <Input
                id={`chart-subtitle-${l}`}
                value={form.texts[l].subtitle}
                maxLength={500}
                placeholder={linkedText(l).role ?? ''}
                onChange={(e) => setText(l, 'subtitle', e.target.value)}
              />
            </Field>
          </fieldset>
        ))}
        <FieldDescription className="sm:col-span-2">
          {/* A block or group headed by a person: the card must say the unit's name, the person only gives the link. */}
          {form.linkType === 'staff' && canOpen
            ? t('organization:chart.fields.unitStaffHint')
            : t('organization:chart.fields.overrideHint')}
        </FieldDescription>
        {canOpen ? (
          <FieldSet>
            <FieldLegend id={departmentsLegend} variant="label">
              {t('organization:chart.fields.departments')}
            </FieldLegend>
            <RadioGroup
              aria-labelledby={departmentsLegend}
              value={form.departments}
              onValueChange={(v) => set('departments', v as DepartmentsMode)}
            >
              {Object.values(DEPARTMENTS_MODE).map((mode) => (
                <Field key={mode} orientation="horizontal">
                  <RadioGroupItem id={`chart-departments-${mode}`} value={mode} />
                  <FieldLabel htmlFor={`chart-departments-${mode}`}>{t(`organization:chart.fields.departmentsMode.${mode}`)}</FieldLabel>
                </Field>
              ))}
            </RadioGroup>
            <FieldDescription>{t('organization:chart.fields.departmentsHint')}</FieldDescription>
          </FieldSet>
        ) : null}
        <div className="flex flex-col justify-end gap-3 sm:col-start-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.curatorDirect} onCheckedChange={(c) => set('curatorDirect', c === true)} />
            {t('organization:chart.fields.curatorDirect')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.isActive} onCheckedChange={(c) => set('isActive', c === true)} />
            {t('organization:chart.fields.isActive')}
          </label>
        </div>
      </div>
      {errorMessage ? (
        <Alert variant="surface" colorPalette="red">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      <DialogFooter>
        <Button variant="outline" colorPalette="black" onClick={onClose} disabled={save.isPending}>
          {t('common:actions.cancel')}
        </Button>
        <Button onClick={submit} disabled={save.isPending}>
          {save.isPending ? <Spinner className="size-4" /> : null}
          {t('organization:chart.form.save')}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
