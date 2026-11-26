# Data model: 049

Server məlumatı, API, DB dəyişmir. Yalnız client tərəfli vəziyyətlər var.

## Reveal elementi

| Sahə | Tip | Qeyd |
|---|---|---|
| `state` | `'static' \| 'pending' \| 'shown'` | React state, `data-reveal` ilə render olunur |
| `index` | `number \| undefined` | stagger mövqeyi, `min(index, REVEAL_STAGGER_MAX_STEPS)` |

Keçidlər:

```text
           (server / hydration)
                static ──┬── reduced motion ─────────────▶ static (son)
                         ├── IO yoxdur ──────────────────▶ static (son)
                         ├── ilkin callback: görünür ────▶ static (son, unobserve)
                         └── ilkin callback: görünmür ───▶ pending
                pending ──── daxil olur ─────────────────▶ shown (son, unobserve)
```

`shown` və `static` son hallardır: element heç vaxt yenidən gizlənmir (FR-012). `pending` CSS ilə `:focus-within`-də və çapda görünür.

## Ağır blok (Chart)

| Sahə | Tip | Qeyd |
|---|---|---|
| `inView` | `boolean` | `useInView(once)`; `false → true`, geri yox |
| `ready` | `boolean` | mövcud; ECharts init olunub |

```text
inView=false, ready=false (skeleton)  ──görünən sahəyə 1 ekran qalıb──▶ inView=true ──import + init──▶ ready=true (qrafik)
```

Import uğursuz → `ready=false` qalır, skeleton görünür (indiki davranış).
