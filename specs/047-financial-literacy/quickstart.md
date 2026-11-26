# Quickstart: Maliyyə savadlılığı yoxlaması

## §0. Ön şərtlər

- `product-rest/web-cbar-new` və `product-rest/web-cbar-admin-new` yan-yana checkout olunub (`check:layout-fixtures` üçün).
- Node 24 (lokal) və Node 22 (CI ilə eyni) — testlər hər ikisində (memory: run-tests-on-node22).
- Seed üçün Docker lazım deyil: PGlite (memory: pglite-api-testing).

## §1. Avtomatik qapılar

```bash
cd product-rest/web-cbar-new && npm run verify          # layout guard, parse/view testləri, proxy yönləndirməsi daxil
cd product-rest/web-cbar-admin-new && npm run verify    # roundtrip.test.ts: iki yeni fixture bayt-bayt
cd product-rest/api-cbar-admin && dotnet build          # migration faylı build-ə toxunmur, amma MR qapısıdır
```

Gözlənən: hər üçü yaşıl. `layout-fixtures.test.ts`-də `financial-literacy` və `literacy-platform` sətirləri, `proxy.test.ts`-də
`/az/umumi-melumat → /az/maliyye-savadliligi` və `/en/maliyye-savadliligi/general-information → /en/financial-literacy` halları var.

## §2. Seed (PGlite)

Dump-dan `pages`, `page_translations`, `page_details` cədvəllərini PGlite-ə yükləyin və `0030-financial-literacy-seed.sql`-i dörd vəziyyətdə işlədin:

| Ssenari | Gözlənən |
|---|---|
| köhnə mətn (dump) | 106/110/111/112 az+en yeni mətndədir; `page_details`-də 107, 108, 109, 452 `false` |
| 110 az əl ilə dəyişdirilib | 110 az dəyişmir, qalanları yazılır |
| `maliyye-savadliligi` slug-ı yoxdur | 106 atlanır, `NOTICE`, xəta yoxdur |
| ikinci icra | heç bir sətir dəyişmir (`UPDATE 0`, `INSERT 0`) |
| `page_details`-də 108 üçün `true` sətri var | 108 `true` qalır |

## §3. Brauzer (test API + fikstür proxy)

Test API hələ köhnə mətndədir. Görünüşü yeni mətnlə yoxlamaq üçün fikstür proxy işlədilir (memory: hybrid-fixture-proxy-for-ui-measuring): proxy
`/api/v1/pages/{106,110,111,112 slug-ları}` sorğularına seed mətnini qaytarır, qalanını test API-yə ötürür.

```bash
cd product-rest/web-cbar-new && npm run local:testcbar -- --api=http://localhost:<proxy>
```

Açın: `/az/maliyye-savadliligi`, `/en/financial-literacy`, `/az/maliyye-savadliligi-portali`, `/az/virtual-tehsil-platformasi`,
`/az/maliyye-mehsul-ve-xidmetlerinin-melumat-axtaris-sistemi` — 1728, 744 (scrollbar 15px), 390 enində.

Yoxlanılır:

1. Ölçülər [contracts/ui-contract.md](./contracts/ui-contract.md) ilə, 1px dəqiqliklə (Edge CDP `getBoundingClientRect`).
2. Sol menyuda 3 bənd var. `/az/seminarlar-vebinarlar` açıqdırsa, o da görünür (spec 041).
3. `/az/umumi-melumat` 308 ilə kökə gedir.
4. Qalereyada 7 şəkil var. Səhifənin altında fayl siyahısında şəkillər **yoxdur**.
5. CTA düyməsi `mailto:mmpi@cbar.az`-dir, keçid düymələri yeni tabda açılır.
6. JavaScript söndürülüb: bütün mətn, kartlar, CTA, birinci şəkil görünür.
7. Köhnə mətnlə (proxy-siz test API) səhifələr adi mətn kimi açılır, heç nə itmir.

## §4. Redaktor round-trip (canlı)

```bash
cd product-rest/web-cbar-admin-new && npm run roundtrip -- "Maliyyə savadlılığı" "Virtual Təhsil Platforması"
```

Gözlənən: seed tətbiq olunmuş mühitdə hər iki səhifə dəyişmədən saxlanır.

## §5. Sənədlər

`web-cbar-new/docs/financial-literacy-cms-guide.md` var. Kök və `web-cbar-new` `CLAUDE.md`-də spec 047 qeydi var.
`business_logic/` `/sync-business-logic` ilə yenilənib. Təlimatdakı panel yolu ("**Səhifələr**") paneldə tapılır.
