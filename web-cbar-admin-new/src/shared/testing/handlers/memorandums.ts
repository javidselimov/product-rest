/**
 * Memorandum mocks: the real contract (spec 045, `contracts/api.md`). The list DTO is flat and
 * comes newest year first, as the API and the site order it.
 */

import { memorandumFixtures, type MemorandumMockRow } from '../fixtures/memorandums'
import { createCrudStore } from './lib/crud-store'

export const memorandumsStore = createCrudStore<MemorandumMockRow>({
  path: '/memorandums',
  envelope: 'paged',
  seed: memorandumFixtures,
  searchFields: ['translations.az.organization', 'translations.az.country'],
  filterFields: ['status'],
  listItem: (row) => {
    const translation = row.translations.az ?? row.translations.en
    return {
      id: row.id,
      status: row.status,
      sortOrder: row.sortOrder,
      showAz: row.showAz,
      showEn: row.showEn,
      organization: translation?.organization ?? null,
      country: translation?.country ?? null,
      signedYear: row.signedYear,
    }
  },
  sort: (a, b) => b.signedYear - a.signedYear || a.sortOrder - b.sortOrder || a.id - b.id,
})

export const memorandumsHandlers = memorandumsStore.handlers
