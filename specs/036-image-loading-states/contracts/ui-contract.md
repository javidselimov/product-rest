# UI Contract: yüklənmə vəziyyətləri

## 1. `SiteImage` (`src/shared/ui/site-image.tsx`)

`next/image` props-larını olduğu kimi qəbul edir. `src` yalnız `string`-dir. Əlavə prop:

| Prop | Default | Məna |
|---|---|---|
| `skeleton` | `true` | `fill` rejimində shimmer göstərilsin. `false`: yalnız fade |

Render:

```text
fill + skeleton + state=loading → <span data-slot="skeleton"> + <img data-slot="site-image" data-state="loading">
digər hallar                    → <img data-slot="site-image" data-state="…">
```

Valideyn `relative` olmalıdır (`fill`-in öz tələbi). Boz qutu valideyndədir, şəklin öz üzərində yox (`content-list` buna görə `fill`-ə keçib).

`onError` verildiyi üçün `next/image` hydration-dan sonra `img.src = img.src` edir, ona görə `src` atributu tam URL olur.

### Vəziyyət modeli

```text
loading ──load──▶ loaded
loading ──error─▶ error
istənilən ──src dəyişir──▶ loading
```

| Vəziyyət | Shimmer | Şəkil |
|---|---|---|
| `loading` (JS var) | var | `opacity: 0`, ən geci 8 s-də görünür |
| `loading` (JS yox) | statik | görünür |
| `loaded` | yox | `opacity: 1`, ~200 ms |
| `error` | yox | gizli, valideynin boz qutusu qalır |

`prefers-reduced-motion: reduce`: pulsasiya və keçid yoxdur.

### CSS müqaviləsi (`globals.css`)

- `[data-slot='site-image']`: `opacity` 200 ms və `transform` 300 ms keçidi.
- `@media (scripting: enabled)`, `[data-state='loading']`: `opacity: 0`, reveal animasiyası 8 s gecikmə ilə.
- `[data-state='error']`: `opacity: 0`.

## 2. Əvvəlcədən yükləmə

| Yer | Qayda |
|---|---|
| `NewsGrid` | ilk `EAGER_CARD_COUNT` (3) kart `loading="eager"` |
| `content-list` | eyni |
| `hero-slider` | `(index + 1) % count` slaydı eager, birinci slaydın `priority`-si qalır |
| `photo-gallery` | seçilmiş ±1 şəkil gizli, eager, böyük şəkillə eyni `sizes` |

## 3. Route skeleton-ları

`SectionShellSkeleton` (`widgets/section-shell`) real `SectionShell` ilə eyni xarici class-ları işlədir: alətlər sırası,
312 + 984 grid, H1 yeri. Sol sütun neytral xətlərdir, menyu mətni saxtalaşdırılmır.

| Route | Məzmun skeleton-u |
|---|---|
| `media/galleries`, `media/videos` | tab xətti, filtr, 9 kart |
| `press-releases` | filtr, 9 kart |
| `media/events` | filtr, sətirlər |
| `media/galleries/[id]`, `media/videos/[id]` | 984/601 qutu |
| `press-releases/[slug]`, `media/events/[slug]` | 984/502 qutu, mətn xətləri |

`NewsGridSkeleton` `NewsGrid` ilə eyni grid sabitini işlədir: 3/2/1 sütun, `aspect-[312/197]`, tarix 28, başlıq 2 sətir.

Bütün skeleton-lar `data-slot="route-skeleton"`, `aria-hidden`, ~150 ms gecikmə ilə görünür. Səhifənin `aria-busy` və
ya spinner mətni yoxdur: `[locale]/loading.tsx` qalan route-larda dəyişmir.
