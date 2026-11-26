# Quickstart: 022 Figma redizaynının yoxlanması

## 0. Hazırlıq

- Branch: `feature/022-figma-redesign`.
- `product-rest/web-cbar-new`, Node 24 (lokal) və Node 22 (CI ilə eyni).
- Lokal backend lazım deyil: `npm run local:testcbar` test API-ni (`api-cbar-test.cbar.az`) istifadə edir, port **3002**.
- Figma: "cbar website (Copy)" açıq, "CBAR Figma bridge" plugin-i işləyir (`figma_health` → connected).

## 1. Gate

```bash
cd product-rest/web-cbar-new
npm run verify                       # setup:check → self-contained → lint → typecheck → test:run → build
# CI ilə eyni Node (node:22-alpine):
/c/Users/javid_salimov/.nodevm/versions/22.23.2/node.exe node_modules/vitest/vitest.mjs run --coverage
```

Gözlənilən: hamısı yaşıl. Silinmiş `theme-toggle.test.tsx` istisna olmaqla əvvəlki test faylları yerindədir.

## 2. Funksional yoxlama (`npm run local:testcbar`, http://localhost:3002/az)

| # | Addım | Gözlənilən |
|---|---|---|
| 1 | `/az` aç | Sıra: header → birinci ekran (slayder + 3 kart) → İcmal göstəricilər → Media → promo banner → Strategiya \| Təqvim → footer |
| 2 | İcmal göstəricilərdə hər tabı seç | Müvafiq data. Boş tab yoxdur |
| 3 | Media: Xəbərlər, Elanlar, Qalereya | 4 xəbər kartı, elanlar (mock), qalereya. "Bütün xəbərlər" `/az/press-releases` |
| 4 | Nəşrlər, faydalı linklər, sürətli keçidlər, video tabı | Görünmür. DevTools Network-da `/api/v1/videos` sorğusu yoxdur (server log) |
| 5 | Nav bəndinin üzərinə gəl | Tam enli panel: başlıq, xətt, sütunlar |
| 6 | Tab ilə nav-a keç | Panel açılır, fokus görünür, bütün linklərə çatılır |
| 7 | JS söndür (DevTools → Disable JavaScript), menyu linkinə keç | Keçid işləyir |
| 8 | `/en` | Bütün etiketlər ingiliscə, uzun mətnlər sınmır |
| 9 | Başqa səhifə (`/az/press-releases`, `/az/statistics/azir`) | Yeni header/footer, kontent 1320 konteynerində, əvvəlki layout pozulmayıb |
| 10 | Brauzerdə `ui-theme=dark` cookie qoy, yenilə | Sayt açıq temadadır, tema düyməsi yoxdur |
| 11 | DevTools Network → Fonts | DM Sans `localhost`-dan gəlir, kənar origin yoxdur, CSP xətası yoxdur |

## 3. Vizual müqayisə (SC-001, SC-002)

Hər enlik üçün brauzer ekran görüntüsü və Figma exportu yanaşı müqayisə olunur:

| Enlik | Səhifə | Figma node |
|---|---|---|
| 1728 | `/az` | `813:25078` |
| 744 | `/az` | `813:25077` |
| 390 | `/az` | `839:7046` |
| 1728 | açıq mega-menyu | `1083:26783` |
| 1728 / 744 / 390 | footer | `813:24811` / `834:5609` / `847:9688` |

Figma exportu: `figma_png` (`scale: 1`, böyük frame-lər üçün bölmə node-ları ayrıca). Fərqlər
`specs/022-figma-redesign/visual-diff.md`-də qeyd olunur və istifadəçi ilə razılaşdırılır.

Üfüqi sürüşmə: 320, 390, 744, 1024, 1360, 1920 enliklərində `document.documentElement.scrollWidth <= innerWidth`.

## 4. Klaviatura və a11y

- `src/shell/accessibility.test.tsx` yaşıl.
- Skip-link Tab ilə görünür və `#content`-ə aparır.
- Tab-lar (kit `Tabs`) ox düymələri ilə dəyişir.
