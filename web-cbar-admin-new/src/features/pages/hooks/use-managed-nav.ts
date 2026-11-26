/**
 * A page form marks the menu item of the panel section that fills the page (spec 053 US4, research R9): the FinCERT page
 * marks "FinCERT", the central banks page "Memorandumlar". The slug is known only once the page has loaded, so the route
 * cannot say it; the form writes the item into the shared UI store and takes it back when it leaves or the slug changes.
 * A page without a section, or one with only a note (`kind: 'note'`), leaves the route's item ("Səhifələr").
 */

import { useEffect } from 'react'

import { useUiStore } from '@/shared/model/ui-store'
import { managedSectionFor } from '../model/managed-sections'

export function useManagedNav(slug: string | null | undefined) {
  const setActiveNavOverride = useUiStore((state) => state.setActiveNavOverride)
  const clearActiveNavOverride = useUiStore((state) => state.clearActiveNavOverride)
  const section = managedSectionFor(slug)
  const item = section?.kind === 'link' ? section.item : null

  useEffect(() => {
    if (!item) return
    setActiveNavOverride(item)
    return clearActiveNavOverride
  }, [item, setActiveNavOverride, clearActiveNavOverride])
}
