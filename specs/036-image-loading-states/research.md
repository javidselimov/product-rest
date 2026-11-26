# Research: Şəkil və məlumat yüklənməsində boş yer

## R1. Optimizer keşi niyə işləmir

- **Decision**: `Dockerfile` runtime mərhələsində son `COPY`-dən sonra, `USER node`-dan əvvəl `RUN mkdir -p .next/cache && chown -R node:node .next/cache`.
- **Rationale**: `temp.cbar.az`-da eyni URL dörd dəfə `X-Nextjs-Cache: MISS` verdi. `COPY` root sahibliyi ilə yazır, proses `node`-dur, ona görə `.next/cache/images` yaradıla bilmir. Next yazma xətasını cavabı pozmadan keçir.
- **Status**: fərziyyədir. Pod daxilində yoxlanmayıb, Docker lokalda yoxdur. Yoxlama deploy-dan sonrakı `HIT`-dir; olmazsa pod log-una baxılır.
- **Alternatives**: `sharedCache`/volume — bir pod üçün artıq mürəkkəblikdir. AVIF-i söndürmək — kodlama 0,36 s-ə enir, amma səbəb qalır və şəkil iki dəfə böyüyür (WebP 16 146 bayt, AVIF 8 429 bayt).

## R2. Şəkli JS-siz gizli saxlamamaq

- **Decision**: `opacity: 0` yalnız `@media (scripting: enabled)` daxilində, `[data-state='loading']` seçicisi ilə. Üzərinə 8 s gecikmiş CSS animasiyası `opacity: 1` məcbur edir.
- **Rationale**: JS sönülü brauzerdə qayda tətbiq olunmur. Hydration qırılarsa animasiya şəkli açır. Script lazım deyil, ona görə CSP-yə toxunmur.
- **Alternatives**: inline `onload` — nonce CSP-də işləmir. `<noscript><style>` — nonce tələb edir, hydration qırılmasını həll etmir. Həmişə görünən şəkil — fade olmur.
- **Köhnə brauzer**: `scripting` media feature-i tanımayan brauzer qaydanı atır, şəkil adi qaydada görünür.

## R3. Yüklənmə vəziyyətini izləmək

- **Decision**: `onLoad`/`onError` + `useState<{ src, state }>`; `src` fərqlidirsə vəziyyət `loading` sayılır (effect yoxdur).
- **Rationale**: `next/image` hydration-dan əvvəl yüklənmiş şəkli ref-də `img.complete` ilə tapıb `onLoad` çağırır, ona görə keşdəki şəkil animasiyada ilişmir. Render zamanı müqayisə əlavə render və effect tələb etmir. Foto qalereyada eyni `img` node-u `src` dəyişir.
- **Qeyd**: `onLoad` `decode()`-dan sonra asinxron çağırılır, testdə `waitFor` lazımdır.

## R4. Shimmer

- **Decision**: kit `Skeleton`-la eyni class-lı `span` (`bg-accent absolute inset-0 animate-pulse`, `data-slot="skeleton"`), `fill` şəkildən əvvəl render olunur. Kit `div` render edir, bu şəkillər isə `button` və `span` içindədir. `skeleton={false}` hero üçün: orada `bg-primary` fonu və overlay var. Reduced-motion `globals.css`-də `[data-slot='skeleton']` üzərindədir, kit Skeleton-una da aiddir.
- **Rationale**: `Skeleton` artıq `chart-card`-da işlədilir və `aria-hidden` özündədir.
- **Alternatives**: `placeholder="data:..."` animasiyalı SVG — fade vermir, reduced-motion çətindir. Blur — spec-dən kənardadır.

## R5. Fade və `transition` toqquşması

- **Decision**: qayda `globals.css`-də `[data-slot='site-image']`: `transition: opacity 200ms ease, transform 300ms ease`. `motion-reduce`-də `transition: none`.
- **Rationale**: Tailwind `transition-transform` `transition-property`-ni əvəz edir, `news-tabs` şəklində fade itərdi. Tailwind 4 `hover:scale-*` `transform` yox `scale` xassəsini işlədir, ona görə siyahıda `scale` də var.

## R6. Skeleton-ların yeri

- **Decision**: `widgets/section-shell/section-shell-skeleton.tsx` və `widgets/news-grid/news-grid-skeleton.tsx`. Grid class-ları real komponentlə eyni sabitdən gəlir.
- **Rationale**: Təsdiqlənmiş plan `shared/ui/skeletons/` deyirdi, amma FSD-də `shared` widget ölçülərini bilməməlidir və class-lar təkrarlanardı. Ortaq sabit ölçü fərqini (SC-004) quruluşca aradan qaldırır.
- **Alternatives**: `shared/ui` — class surəti, zamanla ayrılır.

## R7. Yanıb-sönmə

- **Decision**: route skeleton-unda CSS `animation: fade-in 200ms ease 150ms both`.
- **Rationale**: 150 ms-dən tez gələn məlumatda skeleton görünmür. Client state lazım deyil.

## R8. Əvvəlcədən yükləmə

- **Decision**: `hero-slider` növbəti slaydda `loading="eager"`. `photo-gallery` seçilmiş şəklin ±1 qonşusunu eyni `sizes` ilə `hidden` `Image` kimi eager render edir.
- **Rationale**: eyni `srcset`/`sizes` eyni variantı keşləyir; `display: none` eager `img` yüklənir. `new Image()` ilə URL əl ilə qurmaq optimizer parametrlərini təkrarlayardı.
- **Eager sayı**: `NewsGrid` və `content-list` üçün ilk 3 kart (`desk` ilk sırası). Mobildə 1 sütunda iki əlavə şəkil qəbul olunur.

## R9. Xam `<img>`-lər

- **Decision**: `video-player` və `history-photos` `SiteImage fill unoptimized`-ə keçir. Bayt dəyişmir, YouTube host-u üçün `remotePatterns` lazım olmur.
- **Yoxlanıb**: `history-photos` yuvalarının hamısının nisbəti var, hündürlük şəkildən asılı deyil, `fill` təhlükəsizdir, yalnız `relative` lazımdır. `history-stepper` `link.querySelector('img')?.alt` oxuyur, `alt` qalır.
- **Xaric**: `image-popup` (dialoqun öz davranışı var), loqo, fayl ikonları, valyuta bayraqları.
