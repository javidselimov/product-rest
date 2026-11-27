# Quickstart: spec 061 yoxlaması

## 1. Avtomatik gate

```bash
cd product-rest/web-cbar-new && npm run verify          # Node 24 və Node 22 ilə (memory: CI node:22)
cd product-rest/web-cbar-admin-new && npm run verify    # yalnız fikstür/roundtrip dəyişikliyi
cd product-rest/api-cbar && dotnet build CbarWebApi.slnx && dotnet test CbarWebApi.slnx
cd product-rest/api-cbar/openapi && npm run lint && npm run bundle
node .claude/skills/sync-openapi/scripts/route-diff.mjs  # route dəyişmir, fərq 0
```

## 2. Sayt, test API ilə (`npm run local:testcbar`, :3002)

Test API köhnə ola bilər (`uploadedAt` yoxdur) — bu, FR-024-ün özüdür: kartda yalnız başlıqdakı tarix görünür.

| Ünvan | Gözlənən |
|---|---|
| `/az/statistika`, `/en/statistics` | giriş, sol menyu Figma sırasında (seed-dən sonra), qrafik yox |
| `/az/statistics` | → `/az/statistika` |
| `/az/statistics/charts` | AZIR, inflyasiya, gəlirlilik əyrisi |
| `/az/statistics/azir`, `/az/statistics/azir/export` | dəyişməyib |
| `/az/makroiqtisadi-statistika` | kateqoriya zolağı, 5 qrup, 9 kart, "Son yenilənmə" |
| `/az/makroiqtisadi-statistika?group=mezenne` | yalnız 2 kart |
| `/az/statistics/files/makroiqtisadi-statistika` | ZIP, 9 fayl |
| `/en/macroeconomic-indicators` | qrupsuz 9 kart |
| `/en/statistical-data-for-nsdp` | 6 dataset, hər birində XML + XLS |
| `/az/metodologiya`, `/az/melumatlarin-reviziyasi-siyaseti` | başlıq (+ fayllar, bağlanıbsa) |
| `/az/maliyye-sektorunun-statistikasi` | bir abzas |
| `/az/statistik-bulleten` və digər faza 2 səhifələri | şablonda, köhnə məzmun tam |
| ana səhifə "Daha ətraflı" | `/{locale}/statistics/charts` |

Qrup və sıra seed-dən əvvəl test bazasında yoxdur: seed tətbiq olunana qədər fayl səhifələri qrupsuz siyahıdır (edge case-in özü).

## 3. Figma tutuşdurması

Hər ekran 1728 / 744 / 390-da: Figma bridge rəqəmi (`contracts/ui-contract.md`) ↔ Edge CDP `getBoundingClientRect` (memory: "Figma ↔ DOM
ölçü tutuşdurması", 744-də scrollbar 15 px). Fərqlər spec-in "Figma-dan qəsdən fərqlər" cədvəlinə və ya düzəlişə.

## 4. Seed (məlumat bazasının qorunması)

Docker bu maşında işləmir; PGlite ilə (memory "API-ləri Docker-siz yoxlamaq") və ya test `pg_dump`-ı üzərində:

1. Bütün miqrasiyaları `0045`-ə qədər tətbiq et, test datasını yüklə; sətir sayları və `md5(string_agg(...))` snapshot-u götür
   (`pages`, `page_translations`, `page_details`, `page_assets`, `page_asset_translations`).
2. `0046`-nı işlət; NOTICE saylarını yaz. Sətir sayları azalmır; dəyişən sətirlər yalnız seed-contract Q3–Q8 hədəfləridir (diff siyahısı).
3. `0046`-nı ikinci dəfə işlət: bütün saylar 0, snapshot eyni.
4. Boş bazada (yalnız `seed.sql`) işlət: xətasız "no statistics section".
5. Bir redaktor dəyişikliyini simulyasiya et (məs. `sort_order` əl ilə dəyiş, bir faylın `group_label`-ını yaz): seed həmin hissəyə toxunmur.
6. Q0 `grep`: `DELETE|TRUNCATE|DROP|ALTER TABLE|CREATE TABLE|BEGIN|COMMIT` → 0.

## 5. Deploy sırası

`api-cbar-admin` (seed) → `api-cbar` (`uploadedAt`) → `web-cbar-new`. `web-cbar-admin-new`-in kodu dəyişmir (yalnız fikstür testləri).
Deploydan sonra Grafana-da `api-cbar-admin` logunda `spec 061:` NOTICE sətirləri.
