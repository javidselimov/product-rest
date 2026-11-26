# UI contract: 049 — `useInView`, `Reveal`, `Chart` lazy gate

Yalnız `product-rest/web-cbar-new`. Xarici interfeys (API, URL, HTML mətni) dəyişmir; bu, komponentlər arası daxili kontraktdır.

## 1. `shared/lib/viewport-observer.ts`

```ts
type Entry = Readonly<{ isIntersecting: boolean; initial: boolean }>
export function observeViewport(el: Element, rootMargin: string, cb: (entry: Entry) => void): () => void
```

- Eyni `rootMargin` üçün bir `IntersectionObserver` (`threshold: 0`). Qaytarılan funksiya target-i çıxarır; son target çıxanda observer
  `disconnect` olunur və hovuzdan silinir.
- `initial: true` — target üçün ilk callback (brauzerin ilkin bildirişi).
- `IntersectionObserver` yoxdursa: `cb({ isIntersecting: true, initial: true })` sinxron çağırılır, no-op unobserve qaytarılır.

## 2. `shared/lib/use-in-view.ts`

```ts
export function useInView(ref: RefObject<Element | null>, options: { rootMargin: string; once?: boolean }): boolean
```

- İlk render (server və hydration) `false`. `once: true` → `true` olandan sonra bir daha `false` olmur və observer-dən çıxır.
- IO yoxdursa effektdə dərhal `true`.

## 3. `shared/ui/reveal.tsx` (`'use client'`)

```tsx
type RevealProps = Readonly<{
  as?: 'div' | 'li' | 'section'   // default 'div'
  index?: number                  // stagger mövqeyi; yoxdursa gecikmə 0
  className?: string
  children: ReactNode
}> & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'>
```

Render: `<as data-reveal={state} style={{ '--reveal-index': min(index, REVEAL_STAGGER_MAX_STEPS) }} …>`.

Vəziyyət maşını (data-model.md):

| Hal | `data-reveal` | Görünüş |
|---|---|---|
| server, hydration, reduced motion, IO yoxdur, ilkin görünən | `static` | görünür, keçid yoxdur |
| ilkin görünməyən | `pending` | `opacity: 0`, `translateY(--reveal-shift)` |
| sonra daxil olub | `shown` | keçidlə görünür, son vəziyyət |

Qaydalar:

- Reveal iç-içə istifadə olunmur (research R8).
- `index` siyahının `map` indeksidir; limit komponentdə tətbiq olunur, çağıran kəsmir.
- Element `role`, `aria-*`, `data-slot` və s. atributları ötürür — `<li>`-ni əvəz edəndə siyahı semantikası qalır.

## 4. CSS (`app/globals.css`)

```css
[data-reveal] { --reveal-duration: 450ms; --reveal-shift: 16px; --reveal-stagger: 60ms; }
[data-reveal='pending'] { opacity: 0; translate: 0 var(--reveal-shift); }
[data-reveal='pending']:focus-within { opacity: 1; translate: none; }
[data-reveal='shown'] { transition: opacity var(--reveal-duration) ease-out, translate var(--reveal-duration) ease-out;
                        transition-delay: calc(var(--reveal-index, 0) * var(--reveal-stagger)); }
@media (prefers-reduced-motion: reduce) { [data-reveal] { opacity: 1; translate: none; transition: none; } }
@media print { [data-reveal] { opacity: 1; translate: none; } }  /* later in the file than pending, same specificity */
```

The individual `translate` property is used instead of `transform`, so a transform utility on the element is not overridden
(implementation decision, 2026-11-16).

`static` üçün qayda yoxdur — elementin öz stili qüvvədədir.

## 5. Sabitlər (`shared/constants/motion.ts`, spec 032)

| Ad | Dəyər | Mənası |
|---|---|---|
| `LAZY_ROOT_MARGIN` | `'100% 0px'` | ağır blok görünən sahədən bir ekran əvvəl yüklənir |
| `REVEAL_ROOT_MARGIN` | `'0px'` | reveal 1 px daxil olanda başlayır |
| `REVEAL_STAGGER_MAX_STEPS` | `8` | stagger limiti: 8 × 60 + 450 = 930 ms < 1 s |
| `REDUCED_MOTION_QUERY` | `'(prefers-reduced-motion: reduce)'` | mövcud 3 təkrarı (hero-slider, history-stepper) da buna keçə bilər |

## 6. `widgets/chart-card/chart.tsx`

- Props dəyişmir. Konteyner `ref`-i `useInView(…, { rootMargin: LAZY_ROOT_MARGIN, once: true })`-a verilir.
- ECharts import effekti `inView === false` ikən heç nə etmir; `true` olanda indiki kimi işləyir. Skeleton və `style={{ height }}` dəyişmir.
- Görünürlüyü test etmək üçün `data-slot="chart"` qalır.

## 7. Tətbiq yerləri

research R8-dəki cədvəl. Yeni yer əlavə edəndə: iç-içə olmasın, header/nav/footer/hero/dialoq olmasın.
