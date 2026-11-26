'use client'

/**
 * Opens the question a link points at (`#sual-<id>`, spec 051 FR-016a). The fragment never reaches the server, so the page
 * arrives closed; browsers that reveal ancestor `<details>` on fragment navigation open the topic themselves, and this
 * leaf opens the question too and scrolls to it. It renders nothing.
 */
import { useEffect } from 'react'

import { FAQ_ANCHOR_PREFIX } from '@/features/faq/model/constants'

function openTarget() {
  // The id is ASCII (`sual-<digits>`), so the raw fragment is compared as is — a malformed `%` escape cannot throw.
  const id = window.location.hash.slice(1)
  if (!id.startsWith(FAQ_ANCHOR_PREFIX)) return
  const target = document.getElementById(id)
  if (!(target instanceof HTMLDetailsElement)) return
  for (let node: HTMLElement | null = target; node; node = node.parentElement) {
    if (node instanceof HTMLDetailsElement) node.open = true
  }
  target.scrollIntoView({ block: 'start' })
}

export function FaqHashOpener() {
  useEffect(() => {
    openTarget()
    window.addEventListener('hashchange', openTarget)
    return () => window.removeEventListener('hashchange', openTarget)
  }, [])
  return null
}
