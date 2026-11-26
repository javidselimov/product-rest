/**
 * HTML sanitizasiyası (template konstitusiyası X.1, spec 002 — DOMPurify).
 *
 * Redaktorun önizləmə dialoqu redaktə olunan məzmunu DOM-a yerləşdirir; bu
 * funksiyalar həmin məzmunu DOMPurify ilə təmizləyir (allowlist əsaslı):
 *  - `script/style/object/embed/meta/link/base` və bütün `on*` atributları düşür;
 *  - `href/src/action` yalnız təhlükəsiz sxemlərlə qalır — `javascript:`,
 *    `vbscript:`, `data:` silinir (`img[src]` üçün `data:image/` istisnadır);
 *  - `iframe` saxlanılır (legacy Google Maps / YouTube embed-ləri), `srcdoc` isə
 *    allowlist-də olmadığı üçün silinir.
 * Legacy markup — `details/summary`, cədvəl, `img`, `a`, `data-*` atributları —
 * toxunulmaz qalır.
 */

import DOMPurify, { type Config } from 'dompurify'

/**
 * Shared DOMPurify config. Exported so call sites can invoke
 * `DOMPurify.sanitize` directly — Snyk Code only recognises the library call
 * itself as a sanitizer, not this module's wrappers.
 */
export const SANITIZE_CONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allowfullscreen', 'frameborder', 'loading', 'target'],
  FORBID_TAGS: ['style'],
  FORBID_ATTR: ['srcdoc'],
} satisfies Config

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}

/**
 * Sanitized nodes for direct DOM insertion. Unlike assigning `sanitizeHtml()`
 * output to `innerHTML`, the tree is never serialized and re-parsed, so
 * mutation XSS cannot reshape it on the way in.
 */
export function sanitizeHtmlToFragment(html: string): DocumentFragment {
  if (!html) return document.createDocumentFragment()
  return DOMPurify.sanitize(html, { ...SANITIZE_CONFIG, RETURN_DOM_FRAGMENT: true })
}
