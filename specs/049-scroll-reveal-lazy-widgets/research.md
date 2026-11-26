# Research: 049 — ağır blokların ekrana gələndə yüklənməsi və scroll reveal

Hamısı `product-rest/web-cbar-new`-dədir. Kod vəziyyəti 2026-11-16.

## R1 — Görünürlük izləməsi: bir ortaq observer hovuzu

**Decision**: `shared/lib/viewport-observer.ts` — `rootMargin` açarı ilə paylaşılan `IntersectionObserver` hovuzu
(`Map<margin, { observer, callbacks: Map<Element, cb> }>`). `observe(el, margin, cb) → unobserve`. Son element çıxanda observer
`disconnect` olunur. Üstündə `shared/lib/use-in-view.ts` hook-u: `useInView(ref, { rootMargin, once })`.

**Rationale**: Bir səhifədə onlarla reveal elementi olacaq (xəbər şəbəkəsi 12+ kart). Hər element üçün ayrı observer işləyir, amma
brauzerin bir observer-də çox target-i toplu hesablaması daha ucuzdur və test stub-ı üçün bir giriş nöqtəsi verir.
`IntersectionObserver` yoxdursa (köhnə brauzer, jsdom) `observe` callback-i dərhal `isIntersecting: true` ilə çağırır — FR-005.

**Alternatives**: hər komponentdə `new IntersectionObserver` (history-stepper kimi) — sadədir, amma 30–50 observer; `react-intersection-observer`
paketi — yeni runtime dependency, konstitusiya onu spec tələb edir, fayda isə ~40 sətirdir. Rədd edildi.

## R2 — Lazy yükləmə: `Chart`-ın import effekti görünürlüyə bağlanır

**Decision**: `widgets/chart-card/chart.tsx`-də ECharts import effekti `useInView(containerRef, { rootMargin: LAZY_ROOT_MARGIN, once: true })`
`true` olana qədər başlamır. Mövcud skeleton (`style={{ height }}`) placeholder rolunu oynayır, ona görə CLS dəyişmir (FR-003). Yeni
`LazyMount` wrapper-i yoxdur.

**Rationale**: Ağır hissə ECharts modullarının import-u və `core.init`-dir; bunlar artıq bir effektdədir. Wrapper əlavə etmək (children-i
gec mount etmək) eyni nəticəni verər, amma bütün `Chart` istifadəçilərinə (home `statistics-panels`, `/statistics`, `/statistics/azir`,
`chart-card`) toxunardı. Gate bir yerdədir və hamısını əhatə edir.

`LAZY_ROOT_MARGIN = '100% 0px'` — görünən sahənin altında bir ekran hündürlüyü (spec FR-002). `IntersectionObserver` `rootMargin`-də
faizləri root-a (viewport) nisbətən hesablayır. Adi scroll sürətində ECharts chunk-ları (keşdə olmayanda) bu məsafədə yüklənir; SC-004
quickstart-da ölçülür, kifayət etməsə yalnız sabit dəyişir.

**Tab panelləri**: ana səhifənin `SectionTabs`-ı kit `Tabs` (Radix) üzərindədir, `forceMount` yoxdur — gizli tab-ın paneli mount olunmur.
Tab açılanda `Chart` mount olur, observer ilkin callback-də onu görünən kimi bildirir (acceptance 1.6). Əlavə iş yoxdur.

**Xəta**: import uğursuz olarsa indiki davranış (skeleton qalır) dəyişmir — spec edge case "indiki xəta davranışı qalır".

## R3 — Lazy yükləmənin əhatəsi

**Decision**: yalnız `Chart`. Video player (facade), canlı yayım dialoqu (açılanda iframe), foto qalereya və CMS şəkilləri (`loading="lazy"`)
dəyişmir. Struktur sxemi client JS işlətmir.

**Rationale**: Qalereyanın client JS-i kiçikdir (seçim state-i, düymələr); şəkillər artıq brauzer lazy-loading ilə gəlir. Gecikdirmək ölçülə
bilən fayda vermir, amma JS-siz render-i (birinci şəkil + thumbnail-lar) çətinləşdirərdi. Spec Assumptions buna icazə verir.

## R4 — Reveal: React-ə məxsus vəziyyətli client komponent, DOM-a kənardan toxunulmur

**Decision**: `shared/ui/reveal.tsx` (`'use client'`) — `<Reveal as="div|li|section" index? className …>{children}</Reveal>`. Vəziyyət React
state-indədir və `data-reveal="static|pending|shown"` atributu ilə render olunur. Server və ilk client render həmişə `static` (görünən)
verir — hydration uyğun gəlir. Children server komponentləri ola bilər.

**Rationale**: Alternativ — layout-da bir "controller" `querySelectorAll('[data-reveal]')` ilə atributları dəyişsin. Bu, React-in idarə etdiyi
elementlərin atributlarını hydration bitmədən (Suspense ilə seçici hydration) dəyişə bilər və React 19 dev-də hydration xəbərdarlığı,
müştəri naviqasiyasında isə MutationObserver tələb edir. Komponent yanaşması hər elementin öz həyat dövrünə bağlıdır, naviqasiyada
təbii olaraq yenidən mount olur.

**Alternatives**: CSS scroll-driven animations (`animation-timeline: view()`) — JS-siz olardı, amma Safari dəstəyi yenidir, "bir dəfə"
semantikası yoxdur (yuxarı qalxanda geri oynayır) və birinci ekran istisnasını vermir. Rədd edildi. Animasiya kitabxanası (framer-motion
və s.) — yeni dependency, ~30 KB, ehtiyac yoxdur. Rədd edildi.

## R5 — Birinci ekran və gizli vəziyyətin qərarı observer-in ilkin callback-i ilə

**Decision**: Mount-da element observer-ə verilir. `IntersectionObserver` hər yeni target üçün bir ilkin callback göndərir:

- ilkin callback-də görünür → `static` qalır, observer-dən çıxır (animasiya yoxdur — FR-013);
- ilkin callback-də görünmür → `pending` (gizli);
- sonrakı `isIntersecting` → `shown` (keçid oynanır), observer-dən çıxır (FR-012).

`getBoundingClientRect` ilə mount anında ölçmə istifadə olunmur.

**Rationale**: Müştəri naviqasiyasında Next scroll-u yeni səhifə commit olunandan sonra sıfırlayır; mount anındakı ölçmə köhnə scroll mövqeyinə
görə səhv qərar verə bilər. İlkin callback layout-dan sonra gəlir. Görünən sahədən aşağıdakı elementin bir kadr gec gizlənməsi görünmür.

Reveal observer-i `rootMargin: '0px'`, `threshold: 0`: 1 px daxil olan kimi başlayır, ona görə hündür blok yarım-görünən vəziyyətdə ilişmir
(edge case) və ilkin qərar dəqiq "görünən sahə"dir — kənarda qismən görünən element gizlədilmir.

**Geri düyməsi / lövbər**: brauzer scroll-u hydration-dan sonra bərpa edərsə, `pending` olmuş elementlər görünən sahəyə gəlir və observer
onları dərhal `shown` edir — qısa fade ilə görünür, gizli qalmır (acceptance 2.6).

## R6 — Progressive enhancement, çap, əlçatanlıq, reduced motion — CSS tərəfi

**Decision** (`app/globals.css`):

- Gizli vəziyyət yalnız `[data-reveal='pending']`-dədir: `opacity: 0; transform: translateY(var(--reveal-shift))`. Server HTML-i heç vaxt
  `pending` göndərmir, ona görə JS-siz və robot üçün məzmun görünür (FR-015, SC-006/007).
- `[data-reveal='shown']`: `transition: opacity, transform var(--reveal-duration) ease-out calc(var(--reveal-index, 0) * var(--reveal-stagger))`.
- `[data-reveal='pending']:focus-within` → dərhal görünür (FR-016). `opacity: 0` əlçatanlıq ağacından çıxarmır; `visibility`/`display`
  işlədilmir.
- `@media print` və `@media (prefers-reduced-motion: reduce)`: `[data-reveal]` üçün `opacity: 1; transform: none; transition: none`.
  Komponent də reduced motion-da observer-ə ümumiyyətlə qoşulmur (FR-014).
- Dəyərlər `:root`-da: `--reveal-duration: 450ms`, `--reveal-shift: 16px`, `--reveal-stagger: 60ms`.

**Rationale**: Animasiya dəyərləri CSS-dədir, TS-də təkrarlanmır (spec 032: bir mənbə). TS yalnız stagger limitini bilir.

**İmplementasiyada dəqiqləşdi** (2026-11-16): sürüşmə `transform` yox, ayrıca `translate` xassəsi ilə edilir — elementin öz transform
utility-si pozulmur; dəyişənlər təkrar `:root` yox, `[data-reveal]` üzərindədir. Müyəssərlik widget-i (spec 007) işə düşəndə `li`, `p`, `a`,
`h1`–`h6`… elementlərinə inline `transition: all` yazır və `<Reveal as="li">` kartlarının keçidini ləğv edirdi (brauzer ölçməsində tapıldı,
`measurements.md`). Vendor faylı redaktə olunmur, ona görə `shown` keçidi və reduced-motion `transition: none` `!important`-dır.

## R7 — Stagger limiti

**Decision**: `--reveal-index` = `min(index, REVEAL_STAGGER_MAX_STEPS)`, `REVEAL_STAGGER_MAX_STEPS = 8`
(`shared/constants/motion.ts`). Ən gec kart: 8 × 60 ms + 450 ms = 930 ms < 1 s (FR-011, SC-005).

**Rationale**: Uzun siyahının 30-cu kartı 1.8 s gözləməməlidir. Görünən sahəyə eyni anda daxil olan sıra adətən 3–4 kartdır, limit yalnız
böyük ekranlarda/sürətli scroll-da işə düşür.

Qeyd: indeks siyahıdakı mövqedir, sıradakı yox; ikinci sıra daxil olanda onun kartları da `index`-ə görə gecikir. Limit bunu 1 s altında saxlayır.

## R8 — Reveal harada tətbiq olunur (iç-içə yoxdur)

**Decision**:

| Yer | Element | Stagger |
|---|---|---|
| `widgets/about-blocks/about-blocks.tsx` | hər blok (`html`, `csr-projects`, `ifi-organizations`, `memorandums` …) | yox |
| `widgets/news-grid/news-grid.tsx` | hər `<li>` | bəli |
| `widgets/content-list/content-list.tsx` | hər `<li>` | bəli |
| `widgets/home-cards/news-tabs.tsx` | hər feed kartı `<li>` | bəli |
| `views/home/index.tsx` | statistika tab-ları, promo banner, strategiya + təqvim, gizli bloklar (publications, useful links) | yox |

Qayda: **Reveal iç-içə olmur** — ana səhifənin media bölməsi bütöv bükülmür, çünki içindəki kartlar artıq reveal olunur. Header, nav,
footer, breadcrumb, hero sırası (slayder + sağ kartlar), dialoqlar, `section-shell`-in `PageTools`/`SectionNav`-ı bükülmür (FR-009).
`html` bloku bütöv reveal olunur, paraqraf-paraqraf yox.

`section-shell`-in özü dəyişmir: onun `children`-i adətən `AboutBlocks`-dur və birinci ekrandadır.

## R9 — Testlər

**Decision**: `shared/testing/intersection-observer.ts` — idarə olunan stub (`installIntersectionObserver()` → `{ enter(el), leave(el) }`,
ilkin callback-i `initiallyVisible` seçimi ilə). Yalnız lazım olan testdə quraşdırılır; global `setup.ts`-ə əlavə olunmur, ona görə mövcud
testlər jsdom-un "IO yoxdur" yolunu görür: reveal `static`, chart dərhal yüklənir — dəyişmir.

Funksional testlər (davranış, rol/mətn ilə):

- `reveal.test.tsx`: server render `static`; ilkin görünən → `static` qalır; ilkin görünməyən → `pending`, daxil olanda `shown`, çıxıb
  qayıdanda `shown` qalır; reduced motion → observer çağırılmır; IO yoxdur → `static`; `index` 20 → `--reveal-index: 8`.
- `use-in-view.test.tsx` / `viewport-observer.test.ts`: eyni margin bir observer paylaşır, son unobserve-da disconnect, IO yoxdursa dərhal true.
- `chart.test.tsx`: görünməyəndə ECharts import olunmur (skeleton görünür), görünəndə yüklənir; IO yoxdursa dərhal.
- `renderToString` ilə: `Reveal` HTML-ində `pending` yoxdur (SC-007).

`npm run verify` + `test:run` Node 22 ilə də (yaddaş qaydası).
