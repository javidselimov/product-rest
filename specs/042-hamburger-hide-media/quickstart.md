# Quickstart: spec 042 yoxlaması

## Avtomatik

```bash
cd product-rest/web-cbar-new
npx vitest run src/shell
npm run verify
# CI Node 22-dədir: test:run-u Node 22 ilə də işlət
```

Gözlənilən: `nav.test.ts` `isTopLinkSection`, `nav-overflow.test.tsx` Media/İnsan resursları bəndlərində `desk:hidden`, digər bəndlərdə
yox; mobil çekmecə testi Media-nı göstərir.

## Brauzerdə (lokal backend lazım deyil)

```bash
cd product-rest/web-cbar-new
npm run local:testcbar        # :3002, test API
```

Edge-də `http://localhost:3002/az` açılır, hər endə hamburger panelinin kök bəndləri ölçülür:

```js
[...document.querySelectorAll('[data-slot="nav-overflow-panel"] > ul > li')]
  .map((li) => [li.querySelector('a')?.textContent, getComputedStyle(li).display])
```

| En | Gözlənilən |
|---|---|
| 1440 | Media, İnsan resursları → `none`; üst zolaqdakı "Media" keçidi görünür və `/az/media` açır |
| 1200 | Media, İnsan resursları → `block` |
| 900 | bütün bölmələr `block` (hamburger tək düymədir) |
| 390 | mobil çekmecədə Media və alt bəndləri var |

`/en` üçün eyni: "Media", "Human Resources".
