/**
 * Dev rejimi üçün MSW browser worker — backend olmadığından MSW həm test, həm
 * dev data mənbəyidir (specs/001 plan.md §11). main.tsx yalnız DEV-də dinamik
 * import edir, ona görə msw production bundle-a düşmür.
 */

import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
