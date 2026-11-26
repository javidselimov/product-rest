/** Event module ids and query keys: the same root as the engine keys (B1). */

import { crudKeys } from '@/features/crud/api/crud.keys'

export const EVENTS_MODULE_ID = 'events'
export const EVENT_CATEGORIES_MODULE_ID = 'event-categories'

export const eventsKeys = {
  ...crudKeys(EVENTS_MODULE_ID),
  /** Gallery, press release and page choices of the form. */
  links: () => [EVENTS_MODULE_ID, 'links'] as const,
}
