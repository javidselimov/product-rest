/**
 * Popup linki qaydası (spec 009 FR-006) — API ilə eyni: boş, `http(s)://` və ya
 * sayt daxili `/…` yol. `//host` (protokolsuz) və digər sxemlər, məs.
 * `javascript:`, rədd olunur. Hər dil ayrıca yoxlanılır, xəta həmin tabın
 * sahəsinin altında görünür.
 */

import { i18n } from '@/shared/i18n'
import type { FormSchema } from '@/shared/crud/types'
import { isAllowedLink } from '@/shared/lib/site-link'

export { isAllowedLink }

export const withLinkRule =
  (field: string, messageKey: string) =>
  (base: FormSchema): FormSchema =>
    base.superRefine((data, ctx) => {
      for (const [locale, values] of Object.entries(data.translations)) {
        const link = values[field]
        if (typeof link !== 'string' || isAllowedLink(link)) continue
        ctx.addIssue({
          code: 'custom',
          path: ['translations', locale, field],
          message: i18n.t(messageKey),
        })
      }
    })
