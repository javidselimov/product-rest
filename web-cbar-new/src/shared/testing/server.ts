/**
 * MSW node server-i — Vitest-də bütün sorğuları, Next server prosesində isə
 * yalnız auth səthini cavablandırır (R-002).
 */
import { setupServer } from 'msw/node'

import { handlers } from './handlers'

export const server = setupServer(...handlers)
