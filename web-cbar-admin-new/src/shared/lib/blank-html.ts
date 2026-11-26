/**
 * Whether a rich-text value is empty: the editor saves an untouched field as `<p></p>`. The same rule as the admin
 * API's `FaqSupport.IsBlankHtml` (spec 051) — an image, table or embed counts as content.
 */

const EMBEDDED_CONTENT = /<(img|table|iframe|video|audio)\b/i
const TAG = /<[^>]+>/g
const NBSP = /&nbsp;/g

export function isBlankHtml(html: string | null | undefined): boolean {
  if (!html?.trim()) return true
  if (EMBEDDED_CONTENT.test(html)) return false
  return html.replace(TAG, ' ').replace(NBSP, ' ').trim() === ''
}
