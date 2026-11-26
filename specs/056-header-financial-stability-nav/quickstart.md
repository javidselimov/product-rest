# Quickstart: spec 056 yoxlaması

Bu maşında Docker işləmir. API-lər PGlite ilə yoxlanır (memory `pglite-api-testing`), UI isə test API-nin ağacı + MSW fikstürü +
Edge CDP ilə ölçülür (memory `hybrid-fixture-proxy-for-ui-measuring`, `figma-measure-dom`). Testləri PowerShell-dən işlət.

## 1. Seed (api-cbar-admin)

```powershell
cd product-rest/api-cbar-admin
dotnet build CbarAdminApi.slnx
```

PGlite-də: miqrasiyaları `0041`-ə qədər işlət, test API ağacına uyğun səhifələr yaz (və ya mövcud PGlite skriptini götür), sonra
`0042`-ni iki dəfə işlət. Gözlənən nəticələr [contracts/seed.md](contracts/seed.md) "Yoxlama" bölməsindədir:

- ağac və köklərin sırası [data-model.md](data-model.md) ilə eynidir;
- ikinci icra hər `NOTICE`-də 0 yazır;
- boş bazada seed xətasız ötür.

## 2. Testlər və gate

```powershell
cd product-rest/web-cbar-new;        npm run verify
cd product-rest/web-cbar-admin-new;  npm run verify
```

Node 22 ilə də `test:run` işlədilir (memory `run-tests-on-node22`).

## 3. Ölçmə (Figma ↔ DOM)

`npm run local:testcbar` (sayt, :3002). Seed test mühitinə düşənə qədər `pages/tree` cavabı fikstürlə əvəz olunur: proxy ağacı
seed-dən sonrakı formaya gətirir.

| En | Yoxlama | Gözlənən |
|---|---|---|
| 1440 | zolaq `li`-lərinin mətni və sırası | Figma `I813:25657;9:29` 9/9 |
| 1360 | zolaq `ul`-unun `scrollWidth <= clientWidth`, bir sətir (`li` `top` eyni) | ✅ |
| 1359, 1280, 1024 (az **və** en) | 8 bölmə bir sətirdə, 9-cu paneldə | ✅. en `lg`-də sığmasa `VISIBLE_SECTIONS_NARROW = 7` (research R2) |
| 1440 | panel açıq: görünən kök `li`-lər, hər birinin sütunu (`getBoundingClientRect().left`) | Figma `1088:26873`: 6 bölmə, 4 sütun (contracts/ui.md) |
| 1024 | panel açıq | 9-cu və sonrakı bütün bölmələr, gizli 4 bölmə də daxil |
| 900, 390 | planşet paneli, mobil çekmecə | bütün kök bölmələr |
| hər en | `document.documentElement.scrollWidth <= innerWidth` | üfüqi sürüşmə yoxdur |

## 4. Səhifələr

az və en üçün 10 yeni səhifə, 64, 65, 113 və 113-ün uşaqları köhnə ünvanları ilə açılır (200). Sol menyunun başlığı yeni bölmədir
(US1 §3, §5, US4). Ümumi şablonda breadcrumb yoxdur.

Nəticə (2026-11-23): seed-li PGlite + lokal `api-cbar` + `next start`, `.tmp-056/pages-check.mjs`. 21/21 səhifə (az 15, en 6) 200
qaytarır, H1 düzgündür, bölmə sol menyudadır. Buraya mövcud "Açıq bankçılıq" (38) də daxildir: o, "Ödəniş sistemləri"ndə qalır.

## 5. Deploy-dan əvvəl (prod)

Bayrağı artıq söndürülmüş kök bölmə varmı (research R3)?

```sql
SELECT p.id, t.title FROM pages p
JOIN page_details d ON d.page_id = p.id AND d.show_in_side_nav = false
JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az'
WHERE p.parent_id IS NULL AND p.deleted_at IS NULL;
```

Nəticədə gözlənilməyən bölmə varsa, deploy-dan əvvəl redaktorla razılaşdırılır. Sıra: `api-cbar-admin` → `web-cbar-new` →
`web-cbar-admin-new` (research R7).

## 6. Admin

Kök bölmənin formasında "Menyularda yox" seçilir: izah `noneRoot` görünür, "Üst menyu" sətrində panel qeydi çıxır. "Hər yerdə"yə
qayıdanda qeyd itir ([contracts/admin-ux.md](contracts/admin-ux.md)). Saxlamadan sonra sayt 1440-da bölməni paneldən çıxarır.
