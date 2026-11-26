/*
 * Renders CMS content — the **only** place that uses `dangerouslySetInnerHTML`.
 *
 * Constitution Article X.1 exception, spec 002 D2. The content is HTML from the admin panel,
 * under editorial control, and is prepared on the server by `prepareCmsHtml` (media addresses
 * plus a `<script>`/`on*`/`javascript:` filter) before it gets here — the loaders call it.
 * This component renders the prepared string as is; styles live in `src/app/cms-content.css`.
 */
/* eslint-disable no-restricted-syntax -- spec 002 D2: sanitised CMS HTML (Article X.1 exception) */
import { cn } from '@cbar/lib-react-ui-kit/lib'

type CmsContentProps = {
  /** Output of `prepareCmsHtml` — raw API content is never passed here. */
  html: string
  className?: string
  /**
   * `about` — Figma typography of the "About us" pages (spec 024).
   * `history` — event text on the dark History year card (spec 026).
   * `media-requests` — Figma typography of the "Media requests" page (spec 037).
   * `csr` — Figma typography of the CSR page and its project dialog (spec 038).
   * `logo` — text around the version table of the logo page (spec 040).
   * `inherit` — a fragment inside a styled box takes the box's font and colour, no margins (spec 047).
   * `fincert` — body of a FinCERT direction accordion (spec 053).
   */
  variant?: 'about' | 'history' | 'media-requests' | 'csr' | 'logo' | 'inherit' | 'fincert'
  /** `list` — the announcement list table (spec 031 ui-contract §2.1), independent of the typography variant. */
  tables?: 'list'
}

export function CmsContent({ html, className, variant, tables }: CmsContentProps) {
  if (!html) return null

  return (
    <div
      data-slot="cms-content"
      data-variant={variant}
      data-tables={tables}
      className={cn('cms-content', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
