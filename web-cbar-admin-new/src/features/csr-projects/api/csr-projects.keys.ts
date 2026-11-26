/** CSR module ids and query keys: the same root as the engine keys (B1). */

import { crudKeys } from '@/features/crud/api/crud.keys'

export const CSR_PROJECTS_MODULE_ID = 'csr-projects'
export const CSR_CATEGORIES_MODULE_ID = 'csr-categories'

export const csrProjectsKeys = crudKeys(CSR_PROJECTS_MODULE_ID)
