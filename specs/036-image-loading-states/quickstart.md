# Quickstart: yoxlama

## Lokal

```bash
cd product-rest/web-cbar-new
npm run verify              # həm Node 24, həm Node 22
npm run local:testcbar      # http://localhost:3002/az, test API
```

## Brauzer (Edge DevTools və ya CDP)

Şərt: Slow 4G, CPU 4× yavaş, keş söndürülüb. Ölçülər: 1728, 744, 390.

| # | Səhifə | Gözlənilən |
|---|---|---|
| 1 | `/az/press-releases` | Kartda shimmer, sonra yumşaq açılma; ilk 3 şəkil əvvəl istənir |
| 2 | `/az/media/galleries` keçidi | Forma kimi skeleton; real səhifəyə keçiddə kart yerindən oynamır |
| 3 | `/az/media/galleries/{id}` | Qonşu şəkil artıq yüklənib, keçidə boş qutu yoxdur |
| 4 | `/az` | Slayder keçidində boş rəngli fon yoxdur; kart hover-i işləyir |
| 5 | `/az/national-currency` | Sikkə arxasında shimmer qalmır |
| 6 | Şəkli 404 olan qalereya | Shimmer dayanır, boz qutu qalır |
| 7 | JS söndürülüb, `/az/press-releases` | Şəkillər görünür |
| 8 | `prefers-reduced-motion: reduce` | Pulsasiya və fade yoxdur |
| 9 | Keşdə olan səhifəni yeniləyin | Şəkil animasiyada ilişmir |
| 10 | `/az/statistics` | Əvvəlki spinner |

Skeleton ilə real kart `getBoundingClientRect` ilə tutuşdurulur (fərq < 1 px), layout shift ≤ 0,01.

## Test deploy-dan sonra

GitLab `test` branch-ına push istifadəçi tərəfindən edilir.

```bash
for i in 1 2 3; do
  curl -s -o /dev/null -D - -H "Accept: image/avif,image/webp" \
    -w "ttfb=%{time_starttransfer}\n" \
    "https://temp.cbar.az/_next/image?url=%2Fmedia%2F1807&w=384&q=75" | grep -iE "x-nextjs-cache|ttfb"
done
```

Gözlənilən: birinci `MISS` ola bilər, sonrakılar `HIT`, TTFB < 0,1 s. `MISS` qalırsa keş fərziyyəsi səhvdir
(research R1): pod log-una baxın.

## Nəticələr (06.11.2026)

Headless Edge, production build, test API, 400 KB/s, CPU 4×. Yoxlama skripti repo-ya əlavə olunmayıb.

| Yoxlama | Nəticə |
|---|---|
| `npm run verify` Node 24 | Keçdi |
| Vitest Node 22 | 111 fayl, 1097 test keçdi |
| Route skeleton görünür | 1728, 744, 390-da hə |
| Yüklənən görünən şəkil pulsasiyasız | 0 (1728). 744 və 390-da kartlar ilk ekrandan aşağıdadır |
| Layout shift, `/az/press-releases` | 0,0002 / 0,0005 / 0,0001 (hədd 0,01) |
| Skeleton kart eni | Real kartla eyni (312, 327) |
| Skeleton kart hündürlüyü | Ölçmədə 321 / 349. Başlıq 3 sətrə çıxarılıb, 349 olmalıdır, yenidən ölçülməyib |
| Şəkil 404 | Pulsasiya dayanır, `opacity: 0`, boz qutu qalır (qalereya 1) |
| Reduced motion | `transition: none` |
| Kart hover | `opacity, transform, scale` keçidi qalır |
| Foto qalereya qonşusu | Klikdən 30 ms sonra hazırdır |
| Slayder | Növbəti slayd `loading="eager"`, hazırdır (dev) |
| `/az/statistics` | Spinner qalır (dev) |
| JS sönülü | `scripting` false, şəkil `opacity: 1`. Məzmun skeleton arxasında gizli qalır, spec Assumptions-a baxın |

Yoxlanmayıb: `X-Nextjs-Cache: HIT` (SC-001, deploy gözləyir); 744 və 390-da menyu hündürlüyü real menyudan fərqlənə bilər.
