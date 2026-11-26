# Quickstart: 049 yoxlaması

Hamısı `product-rest/web-cbar-new`-də.

## 0. Baza ölçməsi (dəyişiklikdən ƏVVƏL)

```bash
npm run local:testcbar   # :3002, test API-yə qarşı
```

Edge DevTools → Lighthouse, Mobile, Performance: `/az`, `/az/statistics`, `/az/statistics/azir`. TBT, TTI (və ya INP lab), CLS qeyd olunur
→ `specs/049-scroll-reveal-lazy-widgets/measurements.md`. Network panelində `echarts` filtri ilə açılışda yüklənən chunk sayı.

## 1. Gate

```bash
npm run verify
npx vitest run   # Node 22 ilə də (CI node:22)
```

## 2. Lazy yükləmə (US1, SC-001, SC-003, SC-004)

1. `/az/statistics`-i scroll etmədən aç. Network (`echarts`): yalnız birinci ekrandakı qrafiklər üçün chunk/init. Aşağıdakılarda skeleton.
2. Yavaş scroll et: qrafik görünən sahəyə çatanda artıq çəkilib və ya skeleton ≤ 300 ms qalır (Performance panel, CPU 4×).
3. Yuxarı qalx, yenidən en: təkrar yüklənmə yoxdur.
4. Ana səhifədə statistika tab-larını dəyiş: açılan tab-ın qrafiki yüklənir.
5. Lighthouse CLS baza ilə müqayisədə artmayıb; TBT qrafikli səhifələrdə azalıb.

## 3. Reveal (US2, SC-005)

1. `/az` və "Haqqımızda" bölməsinin bloklu bir səhifəsi (məs. tarix və ya KSM layihələri) — birinci ekran animasiyasız.
2. Aşağı scroll: bloklar bir dəfə fade + yuxarı sürüşmə ilə gəlir; xəbər kartları (`/az/press-releases`) ardıcıl, sıra 1 s-dən tez tam görünür.
3. Yuxarı qalx, en: animasiya təkrarlanmır.
4. End düyməsi ilə sona düş: heç nə gizli qalmır.
5. Səhifəni ortadan yenilə (scroll bərpası) və lövbərli keçid aç: görünən sahədə gizli məzmun yoxdur.
6. Müştəri naviqasiyası (menyudan başqa səhifəyə): yeni səhifənin birinci ekranı animasiyasız.

## 4. Progressive enhancement (US3, SC-006, SC-007)

1. DevTools → Rendering → `prefers-reduced-motion: reduce`: heç bir animasiya yoxdur, hər şey görünür.
2. JS söndür (DevTools → Disable JavaScript): bütün səhifələr tam görünür, qrafik yerində skeleton.
3. Çap önizləməsi (scroll etmədən): aşağıdakı bloklar görünür.
4. `curl -s http://localhost:3002/az/press-releases | grep -c 'data-reveal="pending"'` → `0`.
5. Klaviatura ilə Tab: gizli bloka düşən fokus onu dərhal göstərir.

## 5. Enlər və dillər

390 / 744 / 1728 enlərdə və `/en`-də 2–3 bəndləri təkrar.
