# Quickstart: spec 048 yoxlaması

## Avtomatik

```bash
cd product-rest/web-cbar-new && npm run verify
cd product-rest/web-cbar-admin-new && npm run verify
# Node 22 ilə də: npx -y node@22 node_modules/vitest/vitest.mjs run (hər iki komponentdə)
```

Gözlənilən: hər ikisi yaşıl; `nav.test.ts`-də gizli bəndlər `buildNavSections` nəticəsində yoxdur, köklər və footer eynidir;
`menu-visibility.test.ts`-də `sideNavOff`/`parentSideNavOff` "Üst menyu" sətrində.

## Əl ilə (test API, backend lazım deyil)

```bash
cd product-rest/web-cbar-new && npm run local:testcbar   # :3002
```

1. `http://localhost:3002/az/maliyye-savadliligi` — 1440px: sol menyunu yaz; hamburgeri aç, "Maliyyə savadlılığı" altındakı bəndlər eyni dəstdir.
2. "Beynəlxalq əməkdaşlıq" bölməsində eyni yoxlama.
3. 900px (tablet hamburger) və 390px (mobil çekmecə) endə eyni bölmələr.
4. Gizli səhifəni (məs. Seminarlar) ünvanla aç: açılır, sol menyuda aktivdir, breadcrumb dəyişməyib, hamburgerdə yoxdur.
5. `/en` üçün 1–3.
6. Admin (`web-cbar-admin-new`, `npm run local:testcbar`, :5175): sol menyuda gizli səhifənin formasında "Saytın menyusunda" kartı
   "Üst menyu: Görünməyəcək: sol menyuda göstərilmir" yazır; bölmə kökündə "Üst menyu: görünəcək".
