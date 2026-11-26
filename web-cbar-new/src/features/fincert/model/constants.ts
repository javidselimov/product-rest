/** FinCERT constants (spec 053). */

/** Fragment ids of the sections, the same in both locales (`data-model.md` "Bölmələr və ankerlər"). */
export const FINCERT_ANCHORS = {
  mission: 'missiya',
  directions: 'istiqametler',
  contacts: 'elaqe',
  portal: 'hesabat-portali',
  rfc: 'rfc-2350',
  cooperation: 'beynelxalq-emekdasliq',
} as const

export type FincertSectionKey = keyof typeof FINCERT_ANCHORS

/** The Figma order of the sections. */
export const FINCERT_SECTION_ORDER: readonly FincertSectionKey[] = ['mission', 'directions', 'contacts', 'portal', 'rfc', 'cooperation']

/** Everything a `tel:` link may not carry: the phone is shown as written, dialled from its digits and `+`. */
export const PHONE_NON_DIAL_CHARS = /[^\d+]/g

/** Line breaks of the plain-text mission; each non-empty line is a paragraph. */
export const MISSION_LINE_BREAK = /\r?\n/

/**
 * The links and images the page may render from CMS fields: `http(s)` and site-relative paths (`/media/1301`).
 * `javascript:`, `data:`, protocol-relative `//host` and editor typos are dropped.
 */
export const SAFE_HREF = /^(?:https?:\/\/|\/(?!\/))/i
