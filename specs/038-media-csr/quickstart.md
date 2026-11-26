# Quickstart: KSM layihələrini yoxlamaq

Docker bu maşında işləmir. API-lər PGlite + socket ilə qaldırılır (yaddaş qeydi `pglite-api-testing`). Əl yoxlamaları üçün bütün addımlar `product-rest/`-dən.

## 1. Miqrasiyalar

1. `0020` və `0021`-i köhnə məzmunlu bazaya tətbiq et (köhnə CMS mətni ilə iki səhifə + asset-lər).
   Gözlənən: 4 kateqoriya, 4 layihə, Biləsuvar-da 9, Qanvermədə 3 foto. Səhifə mətni dəyişməyib.
2. `schema_migrations`-dan `0021`-i silib yenidən işlət. Gözlənən: dublikat yoxdur.
3. Boş bazada işlət. Gözlənən: xəta yoxdur, fotolar atlanır, `NOTICE`.

## 2. Admin API və public API

```bash
cd api-cbar-admin && dotnet build
cd ../api-cbar && dotnet build
diff -r api-cbar-admin/src/Cbar.Domain api-cbar/src/Cbar.Domain
node ../.claude/skills/sync-openapi/scripts/route-diff.mjs
```

- Layihə yarat, `GET /api/v1/csr-projects?locale=az` (public): qaralama görünmür; dərc et: görünür; `showEn=false`: `en` cavabında yoxdur.
- Kateqoriyanı bağlı layihə ilə silməyə çalış: 409.
- Layihə fotosunu `DELETE /api/v1/media/{id}` ilə silməyə çalış: 409.
- `api-cbar` `cbar_web_ro` rolu ilə qoşulur, cədvəl icazə xətası yoxdur.

## 3. Admin panel

```bash
cd web-cbar-admin-new && npm run verify
```

Yaradır → foto əlavə edir → sıralayır → dərc edir. Az və en tabları, kateqoriya tab-ı, boş məcburi sahə xətası.

## 4. Sayt

```bash
cd web-cbar-new && npm run lint && npm run typecheck && npm run test:run
```

İstifadəçinin 3002 dev serverinə toxunulmur, `build` ayrı nüsxədə. Hamısı Node 22-də.

Fikstür proxy + production build + headless Edge, 1728/744/390:

- Ölçülər `contracts/ui-contract.md` ilə uyğundur.
- Karta klik modal açır, thumb sayğacı dəyişir, Escape fokusu qaytarır.
- `/az/...` və `/en/...`: en-də AZ PDF görünmür.
- Proxy `csr-projects`-ə 500 qaytaranda: giriş və fayl görünür, başlıq və kartlar yoxdur.
- JS söndürülmüş: layihə mətnləri oxunur.
- Köhnə mətnli səhifədə layihələr gələndə köhnə siyahı görünmür, API 500 olanda görünür.
- Axtarış: "qanvermə" KSM səhifəsini tapır.
- `/media/galleries`-də layihə fotosu yoxdur, Tədbirlər filtrində KSM kateqoriyası yoxdur.

## 5. Deploy-dan əvvəl

Prod-da `page_asset_translations` başlıqlarının (`bilesuvar-nba-%`, `qanverme_%`) və iki slug-ın mövcudluğunu oxuma sorğusu ilə yoxla.
