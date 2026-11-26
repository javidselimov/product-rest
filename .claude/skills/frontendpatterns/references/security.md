# Security patterns

Condensed, paraphrased from https://frontendpatterns.dev/<slug> (fetched 2026-10-08). The defenses are layered, not alternatives: encode output, sanitize rich input, add CSP plus Trusted Types, protect cookies, pin third-party bytes, and redact what leaves the app.

### Content Security Policy — `/content-security-policy`
- **Problem:** A single injected or compromised script, whether from your own pages or a third-party CDN or tag, runs with the page's full privileges. Where inline code is normal, the browser cannot tell injected script from real script.
- **Solution:** Send a response header that allowlists sources per resource type, starting from `default-src 'self'`. Forbid inline code and `eval`, and admit any necessary inline block with a per-response nonce or a hash.
- **Wrong choice / avoid when:** It is wrong to treat CSP as your only defense, to use loose policies (`'unsafe-inline'`, bare `https:`), to reuse a static nonce, or to enforce on day one on a tag-heavy site without a report-only phase.
- **Tradeoffs:** A strict policy takes several tuning rounds. Inline handlers and `eval` libraries must be refactored, nonces couple the policy to server rendering, and reports contain extension noise.
- **Checks:**
  - The policy has no `'unsafe-inline'` or `'unsafe-eval'` in `script-src`, and no wildcard or `https:` sources.
  - It includes `object-src 'none'`, `base-uri 'self'` and `frame-ancestors 'none'` (or a deliberate allowlist).
  - Nonces come from a CSPRNG (`crypto.randomBytes(16)`) and are freshly generated for every response.
  - Rollout uses `Content-Security-Policy-Report-Only` with `report-to` (plus `report-uri` for older browsers) before switching to enforcement.

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{per-request}';
  style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; report-to csp-endpoint
Reporting-Endpoints: csp-endpoint="https://example.com/csp-reports"
```

### CSRF Protection — `/csrf-protection`
- **Problem:** Browsers attach cookies to requests from any origin, so a hostile page can fire authenticated state changes with a form, an `<img>` or `fetch`. A cookie shows the user is logged in. It does not show that they intended the request.
- **Solution:** The server issues a random token and the client echoes it in a custom header on unsafe methods. Use a synchronizer token (kept in the session and exposed through `<meta>`) or a double-submit cookie (cookie and header must match). SameSite acts as a second layer.
- **Wrong choice / avoid when:** It does not fit legitimate cross-origin clients such as native apps and public APIs, which should use bearer tokens. Do not rely on SameSite alone or on a client-only scheme. Plain double-submit fails when an untrusted subdomain can plant cookies, so use an HMAC-signed token bound to the session instead.
- **Tradeoffs:** Any call that omits the header gets a 403. The server must generate, store and compare tokens. SPAs must rotate tokens on login and logout. Pages cached with one user's token must never be served to another user.
- **Checks:**
  - Every POST, PUT, PATCH and DELETE sends `X-CSRF-Token` (or an equivalent header), added in one shared fetch wrapper.
  - The server compares tokens with `crypto.timingSafeEqual` after a length check, and a mismatch returns 403.
  - The token has at least 32 random bytes. Only the CSRF cookie is JS-readable (`httpOnly: false`), never the session cookie.
  - The session cookie also carries `SameSite=Lax` or `Strict`.

```js
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
if (UNSAFE.has(method)) headers.set('X-CSRF-Token',
  document.querySelector('meta[name="csrf-token"]')?.content ?? '');
return fetch(url, { ...options, headers, credentials: 'same-origin' });
```

### Input Sanitization — `/input-sanitization`
- **Problem:** User data passed straight to an interpreter (an HTML sink, SQL) executes. The vectors go well beyond `<script>`: `onerror`, `javascript:` URLs, SVG, `<iframe>`, `<object>`. Deny-lists cannot keep up with new variants.
- **Solution:** Validate against allow-lists at the entry point. Render plain text as text (`textContent` or framework bindings). Pass rich text through a maintained sanitizer such as DOMPurify with explicit allowed tags and attributes. Parameterize all queries.
- **Wrong choice / avoid when:** Regex or deny-list HTML filtering is easily bypassed. HTML sanitizing is the wrong tool for plain-text fields. Client-only sanitization is not enough. Sanitizing does not replace context-specific output encoding, and data cleaned once is not safe in every later context.
- **Tradeoffs:** Over-aggressive sanitizing strips legitimate content. Allow-lists need ongoing upkeep, the sanitizer dependency must be kept patched, and large documents cost CPU.
- **Checks:**
  - Every `dangerouslySetInnerHTML`, `v-html`, `{@html}` or `innerHTML` receives the output of `DOMPurify.sanitize(...)`.
  - The DOMPurify configuration sets `ALLOWED_TAGS` and `ALLOWED_ATTR` explicitly, and the code has no regex HTML stripping.
  - The server repeats every client validation, and identifiers use strict patterns such as `/^[a-zA-Z0-9_-]{3,20}$/`.
  - DB access uses only parameterized queries, with no string-built SQL.

```js
const clean = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['b','i','em','strong','a','p','ul','ol','li'], ALLOWED_ATTR: ['href'] });
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

### Output Encoding — `/output-encoding`
- **Problem:** User data rendered without escaping becomes code (XSS), and stored payloads hit every viewer. Each context (HTML body, attribute, inline JS, URL) has different dangerous characters, so encoding for the wrong context only looks safe.
- **Solution:** Escape for the exact sink: entities for `< > &` in the HTML body, plus quotes in attributes, `JSON.stringify` with `<` escaped for inline JS, and `encodeURIComponent` for URL parts. Rely on framework auto-escaping, and allowlist the scheme of user URLs.
- **Wrong choice / avoid when:** Encoding cannot handle rich text that must stay HTML (sanitize instead). Do not encode for the wrong context, double-encode (`&amp;lt;`), use encoding as the only defense, or hand-roll encoders for complex cases.
- **Tradeoffs:** Correctness depends on identifying the context. One careless escape hatch reopens the hole, and the dangerous path looks almost identical to the safe one, so audits are tedious.
- **Checks:**
  - Text goes through framework bindings or `textContent`, and raw-HTML escape hatches appear only with sanitized input.
  - User URLs are protocol-checked against `['http:', 'https:']`. Escaping does not stop `javascript:`, and only React 19 blocks it.
  - Query values use `encodeURIComponent`, and inline script data uses `JSON.stringify(x).replace(/</g, '\\u003c')`.
  - Any hand-written encoder escapes `&` first.

### PII Redaction — `/pii-redaction`
- **Problem:** Loggers, analytics and error reporters quietly send emails, passwords, card numbers and tokens to third-party dashboards with weak access control and no retention limits, which creates breach and GDPR/CCPA exposure.
- **Solution:** Route every outbound sink through one shared redactor. Prefer an allow-list of safe keys so new fields are hidden by default, with a deny-list and regex placeholders (`[EMAIL]`, `[CARD]`) as backups. Hook it into Sentry `beforeSend` and the structured logger.
- **Wrong choice / avoid when:** Redaction is not a substitute for minimizing collection, because data you never collect cannot leak. Regex should not be the primary control, and a deny-list alone only blocks what you anticipated. Third-party SDK paths you cannot hook stay uncovered, and over-redaction makes logs useless.
- **Tradeoffs:** Over-redaction removes debugging context and regex gives false positives and misses. Cloning and scanning payloads costs CPU, key lists drift, and the central redactor is a single point of failure that needs tests.
- **Checks:**
  - One `redact()` is used by the logger, the analytics wrapper and the error reporter, with no per-integration scrubbing.
  - The logger uses an allow-list such as `level, message, timestamp, requestId, userId, route, statusCode`, and any other key becomes `[REDACTED]`.
  - Sentry `beforeSend` redacts request data, headers, extra and breadcrumbs, and deletes `event.request.cookies`.
  - Key matching is case-insensitive (`password, token, authorization, cookie, email, phone, ...`), and real values appear only in local dev.

### SameSite Cookie — `/samesite-cookie`
- **Problem:** Cookies ride along on cross-site requests, so a hidden form posting to `/account/transfer` arrives looking authenticated.
- **Solution:** Set `SameSite` on each cookie, and the browser enforces it. `Strict` never sends the cookie cross-site. `Lax` (Chromium's default when unset) sends it only on top-level GET navigations. `None` sends it everywhere and requires `Secure`. Combine it with `Secure` and `HttpOnly`, and keep CSRF tokens.
- **Wrong choice / avoid when:** Avoid `Strict` when users arrive from email or search links and must stay logged in. Avoid `None` unless embeds, SSO POST-back or widgets need it. Never rely on SameSite as the only CSRF defense, because it misses old browsers, state-changing GETs and same-site subdomains.
- **Tradeoffs:** `Strict` hurts inbound-link UX, and `None` without `Secure` is silently dropped. Safari 12 treats `None` as `Strict`. A "site" means the registrable domain plus scheme, so subdomains count as same-site.
- **Checks:**
  - Session cookies use `SameSite=Lax` (or `Strict` for high-value sessions) with `Secure; HttpOnly`.
  - Every `SameSite=None` cookie also has `Secure` and a documented cross-site reason.
  - No GET endpoint changes state.

```
Set-Cookie: sessionId=abc; SameSite=Lax; Secure; HttpOnly; Path=/
Set-Cookie: widgetPrefs=xyz; SameSite=None; Secure; Path=/
```

### Secure Token Storage — `/secure-token-storage`
- **Problem:** A JWT in `localStorage` or `sessionStorage` can be read by any script (an XSS payload, a compromised tag, an extension) and reused long after the tab closes.
- **Solution:** Keep session and refresh tokens in `httpOnly; Secure; SameSite` cookies set by the server. In SPAs, hold only a short-lived access token in a JS variable and refresh it from a cookie-authenticated endpoint after a reload or a 401.
- **Wrong choice / avoid when:** Web storage is never acceptable for long-lived tokens. httpOnly cookies are not possible for purely static frontends without a backend. Native and non-browser clients need another flow. Cross-site APIs need `SameSite=None` plus credentialed CORS. Secure storage does not replace XSS or CSRF defenses.
- **Tradeoffs:** It needs backend control, CSRF protection becomes mandatory, and silent refresh adds complexity. `Secure` cookies need HTTPS locally, and cookies are capped at about 4 KB.
- **Checks:**
  - The code has no `localStorage` or `sessionStorage` writes of tokens or JWTs.
  - The server sets the auth cookie with `httpOnly: true, secure: true, sameSite: 'strict'|'lax'` and a bounded `maxAge`.
  - The access token lives only in module memory and is sent as `Authorization: Bearer`. On a 401, the client refreshes once (`credentials: 'include'`) and retries once.

```js
res.cookie('session', token, { httpOnly: true, secure: true, sameSite: 'strict',
  maxAge: 60 * 60 * 1000, path: '/' });
```

### Subresource Integrity — `/subresource-integrity`
- **Problem:** A CDN `<script>` or `<link>` runs whatever bytes the URL serves, and a CDN breach, hijacked package or DNS hijack swaps them unseen. HTTPS protects the transport, not the content.
- **Solution:** Add `integrity="sha384-..."` and `crossorigin="anonymous"` to the tag so the browser blocks any byte mismatch. Pin exact versioned URLs, generate hashes in the build, and enforce with the `Integrity-Policy` header.
- **Wrong choice / avoid when:** SRI does not suit mutable or "latest" URLs, fast-rotating analytics or ad scripts, or CDNs without CORS headers. It does nothing for availability or privacy. `require-sri-for` is dead, so use `Integrity-Policy`.
- **Tradeoffs:** Any legitimate byte change breaks loading until the hash is regenerated. Verification is all-or-nothing, so a blocked critical file breaks the page unless there is a fallback, and failures are silent to users, so you need monitoring.
- **Checks:**
  - Every cross-origin `<script>` and stylesheet has both `integrity` and `crossorigin`.
  - URLs are pinned to exact versions, with no `@latest`.
  - Build-time hashing is in place (`vite-plugin-sri-gen`, `rollup-plugin-sri` or `webpack-subresource-integrity`).
  - `Integrity-Policy: blocked-destinations=(script)` is set, ideally preceded by `Integrity-Policy-Report-Only`, with a self-hosted fallback for critical libraries.

```html
<script src="https://cdn.example.com/lib@3.7.1/lib.min.js"
  integrity="sha384-<base64>" crossorigin="anonymous"></script>
<!-- hash: openssl dgst -sha384 -binary file.js | openssl base64 -A -->
```

### Trusted Types — `/trusted-types`
- **Problem:** DOM XSS sinks (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `script.src`, `eval`, `iframe.srcdoc`) are scattered across the code and look harmless in review. Sanitization protects only the places where someone remembered it, and CSP does not stop script-less DOM XSS.
- **Solution:** Enforce with CSP so covered sinks accept only `TrustedHTML`, `TrustedScript` and `TrustedScriptURL` objects, which only named policies created through `trustedTypes.createPolicy` can produce. A raw string throws `TypeError`. Centralize sanitization (DOMPurify) inside the policy.
- **Wrong choice / avoid when:** It cannot be the only defense, since support is recent (Safari 26, Firefox 148). It does not cover server-side reflected or stored XSS or CSS injection, and a permissive `default` policy should not become the permanent fix. It fails when proxies or CDNs may strip headers, and a buggy `createHTML` still stamps bad output as trusted.
- **Tradeoffs:** Migrating a legacy codebase takes refactoring, and third-party libraries that write to sinks break. Duplicate policy names throw an error under a strict `trusted-types` directive, and the policy guarantees provenance, not correctness.
- **Checks:**
  - The page sends `require-trusted-types-for 'script'` together with `trusted-types <names>` listing only the expected policy names.
  - There are few policies, each wrapping a vetted sanitizer, and a `default` policy (if any) is strict: it sanitizes HTML and rejects cross-origin script URLs.
  - Rollout goes through `Content-Security-Policy-Report-Only` with `report-to` before enforcement.

```js
// CSP: require-trusted-types-for 'script'; trusted-types sanitize default;
const sanitizer = trustedTypes.createPolicy('sanitize', {
  createHTML: (input) => DOMPurify.sanitize(input),
});
el.innerHTML = sanitizer.createHTML(userInput); // ok; raw string -> TypeError
```
