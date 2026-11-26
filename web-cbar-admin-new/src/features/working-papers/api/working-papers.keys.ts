/** Working papers module id and query keys (spec 054): the module id is the engine's key root (B1). */

import { crudKeys } from '@/features/crud/api/crud.keys'

export const WORKING_PAPERS_MODULE_ID = 'working-papers'

export const workingPapersKeys = crudKeys(WORKING_PAPERS_MODULE_ID)
