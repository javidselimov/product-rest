/** Test mühiti üçün MSW node server — lifecycle setup.ts-dədir. */

import { setupServer } from 'msw/node'

import { handlers } from './handlers'

export const server = setupServer(...handlers)
