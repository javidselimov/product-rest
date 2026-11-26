# Performance & Resilience Patterns

Source: condensed paraphrase of https://frontendpatterns.dev/<slug> (Den Odell), fetched 2026-10-08.

## Performance

### Code Splitting — `/code-splitting`
- **Problem:** One monolithic bundle ships every route, editor and chart library up front (e.g. 2MB shipped where 100KB was needed), so TTI suffers badly on mobile/3G.
- **Solution:** Use dynamic `import()` at natural boundaries (routes first, then heavy components, then feature-flagged/premium features) so the bundler emits chunks that load on demand.
- **Wrong choice / avoid when:** Splitting so finely that request overhead dominates (especially HTTP/1.1), or so coarsely that chunks stay huge.
- **Tradeoffs:** First visit to a route waits on a chunk; every split point needs fallback + error UI; build/debug complexity and possible duplicated shared deps.
- **Checks:**
  - Every `lazy()`/`import()` has a `Suspense` fallback and an error path (try/catch or error boundary).
  - Route components are split; vendor code sits in its own cache group (e.g. `node_modules` -> vendor, `minChunks: 2` -> common).
  - Feature-flag imports use literal paths so the bundler can see them.
  - Likely-next chunks are prefetched (hover/`mouseenter`), but not everything.

```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
<Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>
<Link to="/dash" onMouseEnter={() => import('./pages/Dashboard')} />
```

### Debounce — `/debounce`
- **Problem:** Per-keystroke/resize handlers fire many redundant requests or recalculations (≈10 requests for "javascript"), causing wasted load and out-of-order results.
- **Solution:** Restart a timer on each event; run the work only once the timer completes without interruption.
- **Wrong choice / avoid when:** The user needs continuous feedback during the activity (scroll-spy, pointer tracking, progress) — use throttle instead (e.g. 100ms ≈ 10 updates/s).
- **Tradeoffs:** Adds at least `delay` latency; delay tuning is a balance; leaked timers cause stale updates; it is not a rate limiter.
- **Checks:**
  - Delay is 150–300ms for interactive input (150–200ms autocomplete, 300–500ms heavier APIs); never ~1000ms.
  - Timer is cleared on unmount / effect cleanup; listeners are removed.
  - A pending/"Searching…" cue shows while `query !== debouncedQuery`.
  - Stale responses are still guarded (AbortController or ignore flag) — debounce reduces but does not eliminate races.

```tsx
function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
```

### Lazy Loading — `/lazy-loading`
- **Problem:** The page fetches code and images users may never reach (admin/analytics code, dozens of below-fold images), delaying interactivity and wasting bandwidth.
- **Solution:** Defer JS via `import()`, images via `loading="lazy"` or IntersectionObserver, and third-party scripts via `async`/`defer` or first interaction; pair with hover/intent prefetch.
- **Wrong choice / avoid when:** Above-the-fold/LCP images (load eagerly with `fetchpriority="high"`) and UI expected to open instantly (modals, drawers).
- **Tradeoffs:** First-use spinner, fallback UI per split point, retry/error handling for chunk failures, layout shift if dimensions are missing.
- **Checks:**
  - LCP/hero image is NOT lazy and has `fetchpriority="high"`.
  - Lazy images have explicit `width`/`height` (or aspect-ratio) to avoid CLS.
  - Observers `unobserve` after loading; one-shot listeners use `{ once: true }`.
  - Bundle analyzer shows no duplicated shared deps across chunks.

### Memoization — `/memoization`
- **Problem:** Expensive derivations (filtering/sorting 10k items) rerun on every render, and fresh inline callbacks break `React.memo` children.
- **Solution:** Cache results keyed on inputs (`useMemo`/`useCallback`/`React.memo`; Vue `computed`; Svelte `$derived`); with React Compiler, manual hooks are mainly for what the compiler skips.
- **Wrong choice / avoid when:** Trivial computations, "just in case" memoization without profiling, or functions with side effects.
- **Tradeoffs:** Memory for CPU; dependency arrays cause stale values or useless caches; shallow compare misses nested mutation; harder debugging.
- **Checks:**
  - A profile justifies each memo; cheap work is not wrapped.
  - Dependency arrays are complete and contain stable references (lint `exhaustive-deps` clean).
  - Memoized callbacks are only worthwhile when passed to memoized children.
  - Unbounded-input caches are bounded (e.g. LRU, default `maxSize = 100`).

## Resilience

### Async Boundary — `/async-boundary`
- **Problem:** Uncoordinated per-widget loaders flicker and shift layout, while a single page spinner holds everything hostage to the slowest widget.
- **Solution:** Wrap related components in a Suspense-style boundary that shows one fallback and reveals the group together; nest boundaries so critical regions appear first.
- **Wrong choice / avoid when:** Grouping a slow child with fast ones; data fetched in `useEffect` (does not suspend); frameworks without native support.
- **Tradeoffs:** One slow child blocks its whole boundary (one 5s widget delays all four); placement is hard; no built-in timeout; needs a paired error boundary.
- **Checks:**
  - Boundaries align with meaningful regions (main, sidebar, feed), not one per page or per leaf.
  - `use(promise)` receives a cached/stable promise, not one created per render.
  - Fallback is delayed ~200ms (timer inside the fallback) to avoid spinner flash.
  - Each Suspense boundary has an error boundary around it.

### Error Boundary — `/error-boundary`
- **Problem:** One render error in a minor widget unmounts the whole tree, blanking the app and losing user input.
- **Solution:** Wrap regions in boundaries that catch render errors and show fallback UI; layer a root safety net plus granular ones around risky widgets, third-party embeds and user content.
- **Wrong choice / avoid when:** Relying on it for event handlers, async code or promise rejections (React/Svelte don't catch those — use try/catch).
- **Tradeoffs:** Covers mostly render/lifecycle errors; React needs classes or `react-error-boundary`; generic messages can hide bugs; reset may re-fail immediately.
- **Checks:**
  - App root has a boundary; risky widgets have their own.
  - `onError`/`componentDidCatch` reports to the logging service (Sentry etc.).
  - Fallback offers a reset/Retry, and reset changes something (resetKeys/refetch) so it doesn't instantly re-throw.
  - Async errors are routed into it deliberately (store in state, rethrow in render) when boundary handling is desired.

### Error Handling — `/error-handling`
- **Problem:** Failures surface as endless spinners, swallowed errors or vague "something went wrong", with inconsistent recovery across components.
- **Solution:** Catch at API boundaries, classify errors (network/timeout/4xx/5xx), keep error in state, show actionable messages with recovery, log with context; fall back to clearly-labelled stale cache when possible.
- **Wrong choice / avoid when:** Empty `catch {}`, developer messages shown to users, retrying 4xx, one generic toast for everything, unmarked stale data.
- **Tradeoffs:** Boilerplate; a decision per error type; centralized handlers oversimplify; dual messages (user vs. dev); log noise.
- **Checks:**
  - `fetch` wrappers throw on `!response.ok` and classify (`TypeError` -> network, status 0).
  - 404 -> not found, 401 -> login, 403 -> no permission, 5xx/timeout -> retry offered.
  - Requests have a timeout via `AbortController` (default ~5000ms), `AbortError` mapped to a timeout message.
  - Global `unhandledrejection`/`error` listeners exist; form input survives a retry.

### Loading State — `/loading-state`
- **Problem:** Without visible feedback users double-submit, refresh mid-save, or lose their place when content pops in.
- **Solution:** Spinners for actions, skeletons for content, real progress bars for long tasks; disable and relabel buttons; track loading separately from data and error.
- **Wrong choice / avoid when:** Instant spinners on very fast operations, spinner spam on every call, fake percentages without backend progress, polish masking slow code.
- **Tradeoffs:** More state per component; skeletons must track layout changes; optimistic updates need rollback; ARIA often forgotten.
- **Checks:**
  - Indicators appear only after ~200ms (a 50ms spinner is worse than none).
  - Submit buttons are `disabled` + `aria-busy` with "Saving…" text, reset in `finally`.
  - Spinners use `role="status"`; progress bars use `role="progressbar"` with `aria-valuemin=0`/`aria-valuemax=100`.
  - Loading, empty and error are distinct render branches; superseded requests are aborted.

### Retry — `/retry`
- **Problem:** Transient failures (blips, timeouts, deploys) are shown as hard errors, identical to permanent ones; mobile users suffer most.
- **Solution:** Automatically retry transient failures with exponential backoff plus jitter and a cap; fail fast on permanent errors; optionally add a circuit breaker.
- **Wrong choice / avoid when:** 404/401 and other 4xx (except 408/429), non-idempotent requests like POST without idempotency keys, or careless use on metered connections.
- **Tradeoffs:** Real failures surface late; no jitter -> thundering herd; tuning is hard; retries hide flaky infra; delays escalate quickly (1, 2, 4, 8, 16s).
- **Checks:**
  - Retryable set is limited to 408, 429, 500, 502, 503, 504 and network `TypeError`.
  - Defaults ≈ `maxRetries = 3`, base 1000ms, doubling, capped at `maxDelay = 30000`, ±25% jitter.
  - `Retry-After` (seconds or HTTP date) overrides computed delay.
  - User sees "retrying (attempt N)…" then a friendly final error; retries stop on abort/unmount. Circuit breaker (if used): 5 failures -> open for 60s -> half-open trial.

```ts
async function fetchWithRetry(url: string, signal: AbortSignal, max = 3, base = 1000) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { signal }).catch((e) => { if (e.name === 'AbortError') throw e; return null; });
    if (res && (res.ok || ![408, 429, 500, 502, 503, 504].includes(res.status))) return res;
    if (attempt >= max) return res ?? Promise.reject(new Error('Network error'));
    const delay = Math.min(base * 2 ** attempt, 30_000) * (0.75 + Math.random() * 0.5);
    await new Promise((r, j) => { const t = setTimeout(r, delay); signal.addEventListener('abort', () => { clearTimeout(t); j(signal.reason); }, { once: true }); });
  }
}
```

## AI response UX

### Streaming Response — `/streaming-response`
- **Problem:** Awaiting the full body (`response.json()`) leaves users staring at nothing for ~10s for a long answer, which feels broken.
- **Solution:** Read `response.body` with a reader, decode chunks with `TextDecoder({ stream: true })`, parse deltas (SSE), and append to the message; first token replaces the thinking indicator.
- **Wrong choice / avoid when:** You must validate/post-process the complete answer before display, or proxies/compression buffer the response anyway.
- **Tradeoffs:** Chunk boundaries split characters/frames/markdown; partial fences and tables flicker; mid-stream failures must keep partial text; auto-scroll can fight the user.
- **Checks:**
  - `decoder.decode(value, { stream: true })` is used; SSE buffer splits on `\n\n` and keeps the trailing partial frame; `[DONE]` ends the loop.
  - Fetch receives an `AbortController` signal.
  - Unclosed code fences (odd count of ```) render as plain `<pre>` until closed.
  - Auto-scroll only while the user is within ~40px of the bottom.

```ts
const reader = res.body!.getReader(); const dec = new TextDecoder();
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  append(dec.decode(value, { stream: true }));
}
```

### Stop Generation — `/stop-generation`
- **Problem:** Users must sit through a long wrong answer, and "cosmetic" stop buttons hide the text while the server keeps generating billed tokens.
- **Solution:** Abort the fetch via `AbortController`, treat `AbortError` as a normal `stopped` outcome that keeps partial content, swap send for stop while streaming, and abort the upstream model call when the client connection closes.
- **Wrong choice / avoid when:** A stop that only hides output without cancelling the request (client and server).
- **Tradeoffs:** Missing server-side cancel is invisible in the UI; race between stop and the last token; truncated text can mislead; stale controllers can abort the wrong turn.
- **Checks:**
  - Status union includes `idle | streaming | complete | stopped | error`; `AbortError` -> `stopped`, not `error`.
  - Stop button renders only while streaming, has `aria-label="Stop generating"`, icon `aria-hidden`.
  - Stopped messages keep partial text with a "Stopped." marker and Regenerate action.
  - Server listens for `res.on('close')` and aborts upstream if `!res.writableFinished`; controller ref is cleared after each generation.

### Response Regeneration — `/response-regeneration`
- **Problem:** Without regenerate users retype prompts; an overwriting regenerate destroys a nearly-good answer with no way back.
- **Solution:** Store each assistant turn as `variants[]` + `activeVariant`; regenerate appends a variant through the same stream/stop/retry pipeline, with a "‹ 2 / 3 ›" pager; edit-and-resubmit is separate and truncates later turns.
- **Wrong choice / avoid when:** Overwriting the previous answer, regenerating with identical sampling, or treating prompt edits as plain regeneration.
- **Tradeoffs:** Storage grows with variants; pager state during streaming; edits are destructive without branching; ambiguity over which variant is canonical.
- **Checks:**
  - Tokens are appended by variant id, so switching mid-stream is safe.
  - Pager shows only when variants > 1, in `role="group"` labelled "Response versions", prev/next disabled at ends.
  - Regenerate disabled while the active variant is streaming.
  - Sampling nudge such as `temperature = Math.min(0.7 + attempts * 0.1, 1)`; model output inserted as text, not raw HTML.

### Thinking Indicator — `/thinking-indicator`
- **Problem:** The silent gap before the first token (a second or two, far longer for reasoning models) makes users think the send failed and resend.
- **Solution:** Immediately show a distinct "assistant is composing" indicator in the assistant's message slot, announced via a polite live region, respecting reduced motion, replaced in place by streamed text; agents show truthful phase labels.
- **Wrong choice / avoid when:** A generic page spinner, a visual-only animation, or invented phase labels.
- **Tradeoffs:** Long waits still feel stalled; double announcements if live regions are misdesigned; fake phases erode trust; reduced-motion fallback often forgotten.
- **Checks:**
  - Shown instantly on send (no 200ms delay, unlike generic loading states).
  - `role="status"` + `aria-live="polite"` with sr-only "Assistant is thinking…"; dots `aria-hidden`. Prefer a pre-existing empty region whose text changes.
  - `prefers-reduced-motion` disables animation (static opacity ~0.7); dots ~1.4s cycle staggered 0.2s/0.4s.
  - Rendered when `status === 'streaming' && !content`, in the same slot the text later fills (no flash).
