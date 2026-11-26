/**
 * The link rule the admin API applies wherever an editor types a link (image popups spec 009,
 * release schedule spec 039): blank, `http(s)://…` or a site path `/…`. A protocol-relative
 * `//host` and any other scheme, for example `javascript:`, are refused.
 */
export function isAllowedLink(value: string): boolean {
  const link = value.trim()
  if (link === '') return true
  if (/^https?:\/\//i.test(link)) return true
  return link.startsWith('/') && !link.startsWith('//')
}
