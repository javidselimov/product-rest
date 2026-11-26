import { describe, expect, it } from 'vitest'

import {
  coerceFieldValue,
  defaultBuildPayload,
  defaultParseDetail,
  initialFormState,
  serverErrorPath,
} from './form-model'
import type { FieldConfig } from './types'

const fields: FieldConfig[] = [
  { name: 'sortOrder', labelKey: 'sort', type: 'number', nullable: false },
  { name: 'year', labelKey: 'year', type: 'number' },
  {
    name: 'isActive',
    labelKey: 'active',
    type: 'checkbox',
    defaultValue: true,
  },
  { name: 'publishedAt', labelKey: 'pub', type: 'datetime' },
  { name: 'eventDate', labelKey: 'ev', type: 'date' },
  {
    name: 'categoryId',
    labelKey: 'cat',
    type: 'select',
    valueAsNumber: true,
    nullable: true,
    options: [{ value: 3, label: 'A' }],
  },
  {
    name: 'status',
    labelKey: 'st',
    type: 'select',
    options: [
      { value: 'draft', labelKey: 'x' },
      { value: 'published', labelKey: 'y' },
    ],
  },
  { name: 'mediaId', labelKey: 'm', type: 'media' },
  {
    name: 'title',
    labelKey: 't',
    type: 'text',
    perLocale: true,
    required: true,
  },
  { name: 'description', labelKey: 'd', type: 'richtext', perLocale: true },
]

describe('time field payload', () => {
  const field: FieldConfig = { name: 'at', labelKey: 'x', type: 'time' }

  it('keeps the value and sends null when empty', () => {
    expect(coerceFieldValue(field, '10:30')).toBe('10:30')
    expect(coerceFieldValue(field, '')).toBeNull()
  })
})

describe('coerceFieldValue cədvəli', () => {
  it('number: boş → 0 (nullable=false) / null; rəqəm → Number', () => {
    expect(coerceFieldValue(fields[0], '')).toBe(0)
    expect(coerceFieldValue(fields[1], '')).toBeNull()
    expect(coerceFieldValue(fields[1], '12')).toBe(12)
    expect(coerceFieldValue(fields[1], 'abc')).toBeNull()
  })
  it('checkbox boolean, date boş → null, datetime → ISO', () => {
    expect(coerceFieldValue(fields[2], true)).toBe(true)
    expect(coerceFieldValue(fields[2], undefined)).toBe(false)
    expect(coerceFieldValue(fields[4], '')).toBeNull()
    expect(coerceFieldValue(fields[4], '2025-09-07')).toBe('2025-09-07')
    expect(coerceFieldValue(fields[3], '2025-09-07T10:00')).toMatch(/Z$/)
  })
  it('select: boş+nullable → null, valueAsNumber → Number, string qalır', () => {
    expect(coerceFieldValue(fields[5], '')).toBeNull()
    expect(coerceFieldValue(fields[5], '3')).toBe(3)
    expect(coerceFieldValue(fields[6], 'draft')).toBe('draft')
  })
  it('media: boş → null, id → Number', () => {
    expect(coerceFieldValue(fields[7], '')).toBeNull()
    expect(coerceFieldValue(fields[7], '88')).toBe(88)
  })
})

describe('initialFormState', () => {
  it('checkbox default, select ilk seçim (nullable deyilsə), locale-lər boş', () => {
    const state = initialFormState({ fields })
    expect(state.values.isActive).toBe(true)
    expect(state.values.status).toBe('draft')
    expect(state.values.categoryId).toBe('')
    expect(state.translations).toEqual({
      az: { title: '', description: '' },
      en: { title: '', description: '' },
    })
  })
})

describe('defaultParseDetail', () => {
  it('detail-i form state-ə çevirir (datetime → local, date → 10 simvol)', () => {
    const state = defaultParseDetail(
      { fields },
      {
        sortOrder: 2,
        isActive: false,
        publishedAt: '2025-09-07T10:00:00Z',
        eventDate: '2025-09-07T00:00:00',
        categoryId: 3,
        mediaId: null,
        translations: { az: { title: 'Salam', description: '<p>x</p>' } },
      },
    )
    expect(state.values.sortOrder).toBe('2')
    expect(state.values.isActive).toBe(false)
    expect(state.values.publishedAt).toMatch(/^2025-09-07T\d{2}:\d{2}$/)
    expect(state.values.eventDate).toBe('2025-09-07')
    expect(state.values.categoryId).toBe('3')
    expect(state.values.mediaId).toBe('')
    expect(state.translations.az.title).toBe('Salam')
    expect(state.translations.en.title).toBe('')
  })
})

describe('defaultBuildPayload', () => {
  it('boş locale ötürülür, dolu locale coerce edilir', () => {
    const payload = defaultBuildPayload(
      { fields },
      {
        sortOrder: '',
        year: '2025',
        isActive: true,
        publishedAt: '',
        eventDate: '',
        categoryId: '3',
        status: 'published',
        mediaId: '5',
      },
      {
        az: { title: 'Salam', description: '' },
        en: { title: '', description: '' },
      },
    )
    expect(payload).toEqual({
      sortOrder: 0,
      year: 2025,
      isActive: true,
      publishedAt: null,
      eventDate: null,
      categoryId: 3,
      status: 'published',
      mediaId: 5,
      translations: { az: { title: 'Salam', description: '' } },
    })
  })

  it('hər hansı per-locale sahə dolu olanda locale saxlanılır', () => {
    const payload = defaultBuildPayload(
      { fields },
      {},
      {
        az: { title: '', description: '' },
        en: { title: '', description: '<p>x</p>' },
      },
    )
    expect(Object.keys(payload.translations as object)).toEqual(['en'])
  })
})

describe('serverErrorPath', () => {
  it('maps a general field and a field of a language tab to their form paths', () => {
    expect(serverErrorPath({ fields }, 'year')).toBe('values.year')
    expect(serverErrorPath({ fields }, 'translations.en.title')).toBe('translations.en.title')
  })

  it('leaves keys the form has no field for to the banner', () => {
    expect(serverErrorPath({ fields }, 'translations')).toBeNull()
    expect(serverErrorPath({ fields }, 'translations.fr.title')).toBeNull()
    expect(serverErrorPath({ fields }, 'translations.en.year')).toBeNull()
    expect(serverErrorPath({ fields }, 'title')).toBeNull()
    expect(serverErrorPath({ fields }, 'legacyPageId')).toBeNull()
  })
})
