/**
 * `decodeURIComponent` that never throws: a malformed escape gives the input back unchanged.
 *
 * A route segment can hold a bare `%`: Next.js passes `/az/%25` to the page as `%`, and decoding that again throws a
 * `URIError` that turns the address into an error page instead of a 404. Editor markup (a `mailto:` link) can carry
 * one too. The raw value is the right fallback in both cases: no page or address matches it, so the caller's own
 * "not found" path runs.
 */
export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
