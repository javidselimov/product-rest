# Quickstart: 033 yoxlaması

Bu maşında Docker işləmir: API dəyişikliyi lokalda yalnız build olunur, real yoxlama test deployundan sonradır.

## Gate-lər

```bash
cd product-rest/api-cbar-admin && dotnet build
cd product-rest/api-cbar && dotnet build
diff -r product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain   # bin/obj xaric, fərq olmamalıdır
node .claude/skills/sync-openapi/scripts/route-diff.mjs                                     # fərq olmamalıdır
cd product-rest/web-cbar-admin-new && npm run verify
cd product-rest/web-cbar-new && npm run verify
```

Testlər Node 22-də də işlədilir (CI). `verify`-ın nəticəsi `tail` ilə yox, exit code ilə oxunur.

## MSW ilə lokal (API-siz)

`web-cbar-new` və `web-cbar-admin-new` funksional testləri spec-in acceptance ssenarilərini əhatə edir:
detalın 4 halı, siyahı, tip seçimi, dil dəyişməsi.

## Test mühitində (deploydan sonra)

Sıra: `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`.

1. `schema_migrations`-da `0017-press-release-asset-details.sql` var; `api-cbar` qalxır (`cbar_web_ro` yeni cədvəli oxuyur).
2. Admin paneldə `type = 3` qaralama yaradın, AZ və EN PDF qoşun, dilləri seçin, dərc edin.
3. `GET /api/v1/press-releases/{slug}?locale=az` yalnız AZ PDF-i, `locale=en` yalnız EN PDF-i qaytarır.
4. `/az/press-releases?type=3`: kart, filtr, paginasiya; `/en`-də eyni.
5. Detal: düymə faylı yükləyir. Chrome və Firefox-da fayl adını yoxlayın (research R6).
6. Skan material: mətn boş, düymə var. PDF-siz material: düymə yoxdur. Yalnız AZ PDF: `/en`-də düymə yoxdur.
7. `/az/press-releases?type=1` və `?type=2`, bir xəbər və bir elan detalı dəyişməyib (SC-004).
8. Sayt axtarışında material çıxır, link düzgün detala aparır.
9. Menyu `navUrl` veriləndən sonra bənd aktivdir, H1 menyu adıdır, Kopya rejimində də (`&copy=1`).
10. Test qaralamasını silin: real məzmun deyil.

## Vizual

`visual-diff.md`: 1728/744/390, Figma rəqəmi + `getBoundingClientRect`, ±2px.
