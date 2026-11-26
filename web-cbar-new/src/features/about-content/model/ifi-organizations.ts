/**
 * "Cooperation with international financial institutions" page: CMS HTML → intro (spec 044). The
 * organizations are a content type of their own and reach the block through the loader.
 *
 * The page may still carry the old organization list, one heading line (`<p><strong>Name</strong></p>`,
 * contract §1.5) per organization. It is left out from the first heading line once organizations
 * arrive, so they do not show twice; without organizations it stays, so the text never disappears.
 */
import type { HtmlNode } from '@/shared/lib/html-blocks'

import { headingInner, outerOf } from './markup'
import type { IfiOrganization, IfiOrganizationsBlock } from './types'

export function parseIfiOrganizations(nodes: HtmlNode[], organizations: IfiOrganization[]): IfiOrganizationsBlock {
  const listStart = organizations.length > 0 ? nodes.findIndex((node) => headingInner(node) !== null) : -1
  const page = listStart >= 0 ? nodes.slice(0, listStart) : nodes

  return { kind: 'ifi-organizations', introHtml: outerOf(page), organizations }
}
