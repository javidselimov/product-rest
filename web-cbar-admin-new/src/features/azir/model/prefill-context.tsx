/**
 * "Formaya yüklə" provider-i (spec 021 R14) — səhifə (`pages/azir`) kartı və
 * siyahını bununla əhatə edir. Kontekst, hook və `rowToFormValues` `prefill.ts`-dədir.
 */

import { useState, type ReactNode } from 'react'

import { AzirPrefillContext, createAzirPrefill } from './prefill'

export function AzirPrefillProvider({ children }: { children: ReactNode }) {
  const [prefill] = useState(createAzirPrefill)
  return <AzirPrefillContext value={prefill}>{children}</AzirPrefillContext>
}
