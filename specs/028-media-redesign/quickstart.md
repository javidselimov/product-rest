# Quickstart: "Media" giriş səhifəsinin yoxlanması

## Ön şərtlər

- Node 22 (CI ilə eyni), `npm ci` `product-rest/web-cbar-new`-də.
- Figma "CBAR Figma bridge" plugin-i açıqdır (`figma_health` → connected) — ölçüləri yenidən
  oxumaq lazım olsa.
- Test API əlçatandır (`https://api-cbar-test.cbar.az`).

## 1. Avtomatik gate

```bash
cd product-rest/web-cbar-new
npm run verify
```

Yeni/yenilənən testlər:

- `entities/page-node/lib/tree.test.ts` — `sectionRoot('media')`, `isSectionCopy`, `sectionKeyOf`;
  About köməkçiləri əvvəlki kimi.
- `widgets/section-shell/model.test.ts` — About halları (adı dəyişmiş) + Media: giriş səhifəsində
  aktiv bənd yoxdur, `/media/galleries` href ilə aktiv bənd, Kopya kökü, boş ağac.
- `views/media/loader.test.ts` — CMS səhifə + ağac; ağac uğursuz → menyu boş; səhifə yoxdur →
  etiket başlığı.
- `views/media/index.test.tsx` — breadcrumb, H1, məzmun, paylaşma, bir H1.
- `views/media-galleries`, `views/media-videos` testləri — kart sayı bugünkü ilə eyni, xəta
  vəziyyətində şablon qalır.
- `views/cms-page/*.test.*` — Media ağacının səhifəsi şablon alır, About blokları almır;
  digər bölmə köhnə görünüşdə.
- `proxy.test.ts` — matcher: `/media`, `/media/galleries` düşür, `/media/12` kənarda; legacy
  `/gallery/photos…`, `/videos` → 308.

## 2. Lokal icra (test API ilə)

```bash
npm run local:testcbar        # http://localhost:3002
```

| Səhifə | URL |
|---|---|
| Media giriş | `/az/media`, `/en/media` |
| Fotoqalereya siyahısı | `/az/media/galleries` |
| Video siyahısı | `/az/media/videos` |
| Qalereya detalı | `/az/media/galleries/{id}` (siyahıdan) |
| Media CMS səhifəsi | `/az/korporativ-sosial-mesuliyyet`, `/az/tedbirler` |
| Media (Kopya) | `/az/media-copy` və uşaqları |
| About reqressiya | `/az/haqqimizda`, `/az/organization?section=board`, `/az/organization/divisions/20` |
| Locale-siz | `http://localhost:3002/media` → `/az/media`; `/media/12` fayl |
| Köhnə | `/gallery/photos`, `/gallery/photos/detail/5?language=en`, `/videos` |

Gözlənilən: giriş səhifəsində CMS mətni görünür (bu gün görünmürdü), qalereya/video kartları
yeni ünvanlarda eyni sayda. About səhifələri dəyişməyib.

## 3. Vizual ölçmə (SC-001)

Brauzer 1728 / 744 / 390 enində, DevTools konsolunda:

```js
const r = (s) => { const b = document.querySelector(s)?.getBoundingClientRect(); return b && [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] }
r('[data-slot=page-tools]')      // 1728: h 100
r('[data-slot=section-nav]')     // 1728: w 312; 744: 664; 390: 342
r('[data-slot=section-shell] h1')// 1728: 32/600 lh44 → h 44; 390: 22/600
r('[data-slot=cms-content]')     // 1728: w 984, x = nav.x + 312 + 24
getComputedStyle(document.querySelector('[data-slot=cms-content] p')).fontSize // 16px / 14px (390)
document.documentElement.scrollWidth === window.innerWidth   // üfüqi sürüşmə yoxdur
```

Figma rəqəmləri: [contracts/ui-contract.md §2](./contracts/ui-contract.md). Nəticələr
`visual-diff.md`-ə yazılır.

## 4. JS-siz

DevTools → Disable JavaScript → `/az/media`: breadcrumb, menyu, paylaşma linkləri işləyir, çap
düyməsi gizlidir (024 qaydası).

## 5. Redaktor (koddan kənar)

Admin paneldə "Media" ağacında `fotoqalereya` → `navUrl` `/media/galleries`, `videoqalereya` →
`/media/videos`. Sonra `/az/media/galleries`-də sol menyuda "Fotoqalereya" aktiv görünməlidir.
Qalan ad/sıra dəyişiklikləri: spec "Redaktor tapşırıqları".
