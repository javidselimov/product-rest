/** FAQ constants (spec 051). */

/** Fragment id of a question, the same in both locales: `#sual-101` (spec 051 FR-016a). */
export const FAQ_ANCHOR_PREFIX = 'sual-'

export function faqAnchor(questionId: number): string {
  return `${FAQ_ANCHOR_PREFIX}${questionId}`
}
