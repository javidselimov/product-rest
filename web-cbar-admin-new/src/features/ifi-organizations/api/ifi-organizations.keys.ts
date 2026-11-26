/** IFI module id and query keys: the same root as the engine keys (B1). */

import { crudKeys } from '@/features/crud/api/crud.keys'

export const IFI_ORGANIZATIONS_MODULE_ID = 'ifi-organizations'

export const ifiOrganizationsKeys = crudKeys(IFI_ORGANIZATIONS_MODULE_ID)
