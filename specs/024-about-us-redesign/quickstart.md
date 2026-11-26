# Quickstart: "Haqqımızda" redizaynının yoxlanması

## Ön şərtlər

- Spec 022 bu branch-də mövcuddur (font, token-lər, `(content)` group, header/footer).
- Node 22 (CI ilə eyni), `npm ci` `product-rest/web-cbar-new`-də.
- Figma "CBAR Figma bridge" plugin-i açıqdır (`figma_health` → connected).
- Admin panel redaktoru üçün test mühitində giriş (məzmunu formaya salmaq üçün).

## 1. Avtomatik gate

```bash
cd product-rest/web-cbar-new
npm run verify
```

Gözlənilən: hər addım yaşıl. Yeni testlər:

- `shared/lib/html-blocks.test.ts` — tokenizer: TipTap çıxışı, void elementlər, balanssız HTML → `null`.
- `features/about-content/model/parse.test.ts` — kontraktın §6 nümunələri hər layout üçün gözlənilən `AboutBlock[]`-ə
  çevrilir; pozulmuş formalar (3 hücrəli sətir, ilsiz tarix, banner yoxdur) fallback verir;
  bu günkü test-mühit HTML-i (`haqqimizda`, `tarixi`, `missiya-ve-deyerler`) heç bir mətn
  itirmədən render olunur (SC-004).
- `views/cms-page/index.test.tsx`, `widgets/about-blocks/*.test.tsx`, `views/organization/*.test.tsx` — breadcrumb, menyu, aktiv link,
  sədr/müavin bölgüsü, şöbə linkləri, xəta vəziyyətində şablonun qalması.
- `views/organization/divisions.loader.test.ts` — MSW: divisions CMS səhifəsi bir dəfə oxunur,
  mövcud olmayan id → `notFound`.

## 2. Lokal icra (test API ilə)

```bash
npm run local:testcbar        # http://localhost:3002, API: api-cbar-test.cbar.az
```

Açılacaq ünvanlar (az və en):

| Səhifə | URL |
|---|---|
| Haqqımızda | `/az/haqqimizda`, `/en/about-us` |
| Tarix | `/az/tarixi`, `/en/history` |
| Missiya | `/az/missiya-ve-deyerler` |
| Komitə | `/az/pul-siyaseti-ve-maliyye-sabitliyi-komitesi` |
| İdarə Heyəti / Rəhbərlik | `/az/organization?section=board`, `?section=management` |
| Struktur bölmələr / Ərazi idarələr | `?section=divisions`, `?section=offices` |
| Şöbə | `/az/organization/divisions/20` |
| Bio | `/az/organization/staff/detail/3` |
| Kopya (formaya salınmış məzmun) | `/az/haqqimizda-copy`, `/az/tarix-copy`, `/az/missiya-ve-deyerler-copy` |

Gözlənilən: bu günkü (formaya salınmamış) məzmunla bütün səhifələr yeni şablonda açılır, mətn
itmir (SC-004, SC-006). JS söndürüləndə accordion və il linkləri işləyir.

## 3. Məzmunun formaya salınması (redaktor, test mühiti)

1. Admin paneldə "Haqqımızda (Kopya)", "Tarix (Kopya)", "Missiya və dəyərlər (Kopya)"
   səhifələrini `docs/about-cms-guide.md`-yə görə doldur (Figma mətnləri).
2. Roundtrip (SC-003):

   ```bash
   cd product-rest/web-cbar-admin-new
   npm run roundtrip -- "Haqqımızda (Kopya)" "Tarix (Kopya)" "Missiya və dəyərlər (Kopya)"
   ```

   Gözlənilən: üç səhifə üçün də diff yoxdur.
3. `/az/tarix-copy`-ə yeni hadisə sətri əlavə et → kod dəyişikliyi olmadan timeline-da və il
   naviqasiyasında görünür (SC-005).

## 4. Vizual müqayisə (SC-001)

Hər səhifə üçün 1728, 744, 390 enlərində brauzer ekran görüntüsü və Figma exportu yanaşı.
Ölçülər gözlə yox, `getBoundingClientRect` ilə yoxlanılır (±2px). Figma exportu böyük frame-də
vaxt aşımına düşür, ona görə blok-blok çıxarılır:

| Səhifə | Desktop | Tablet | Mobil |
|---|---|---|---|
| Haqqımızda | `1186:14873` | `1345:24722` | `1342:22407` |
| Tarix | `898:3060` | `1400:28042` | `1400:23720` |
| Missiya | `968:822` | `1396:18475` | `1396:15392` |
| Komitə | `1284:16521` | `1463:19539` | `1444:27323` |
| İdarə Heyəti | `1189:15956` | — | — |
| Rəhbərlik | `986:4734` | — | — |
| Struktur | `996:8542` | — | `1415:28874` |
| Şöbə | `996:9576` | `1424:28788` | `1419:17448` |
| Bio | `1199:17024` | — | `1494:25151` |

Fərqlər `specs/024-about-us-redesign/visual-diff.md`-də cədvəl kimi qeyd olunur (səhifə, en,
element, Figma, sayt, qərar).

## 5. Əlavə yoxlamalar

- 320–1920 aralığında üfüqi sürüşmə yoxdur (SC-002): DevTools-da `document.documentElement.scrollWidth <= innerWidth`.
- Klaviatura: Tab ilə breadcrumb → paylaşma → menyu → məzmun → il naviqasiyası (SC-008).
- Çap önizləməsi: header, footer, menyu, paylaşma yoxdur.
- Network paneli: hər səhifənin server sorğu sayı əvvəlkindən artıq deyil (SC-007). Server
  log-unda (`API_URL`-ə gedən sorğular) sayılır.
