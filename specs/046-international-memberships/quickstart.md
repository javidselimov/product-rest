# Quickstart — spec 046 yoxlaması

Docker bu maşında işləmir: API seed-i PGlite ilə, frontend-lər test API-yə qarşı (`local:testcbar`) və MSW ilə yoxlanılır.

## 1. Seed (`api-cbar-admin`)

1. PGlite üzərində miqrasiyaları tətbiq et (yaddaş: `pglite-api-testing`), səhifə 120 altında az slug `beynelxalq-teskilatlarda-uzvluk`
   olan səhifə yarat: az və en sətirləri test mühitindəki kimi (az başlıq/slug, `<p>Beynəlxalq təşkilatlarda üzvlük</p>`).
2. `0029`-u işlət → az məzmunda `<table>` + 14 `<tr>` (başlıqdan sonra), en başlıq "Membership in international organizations",
   en slug `membership-in-international-organizations`.
3. Təkrar işlət → `content` dəyişmir (`md5` eyni).
4. Ayrı bazalarda: (a) səhifə yoxdur → `NOTICE`, xəta yoxdur; (b) az məzmun redaktə olunub → toxunulmur; (c) en sətri yoxdur → INSERT.
5. `dotnet build` (api-cbar-admin) yaşıl.

## 2. Sayt (`web-cbar-new`)

```bash
cd product-rest/web-cbar-new
npm run verify            # Node 24 və 22 (yaddaş: run-tests-on-node22); layout-fixtures + memberships testləri daxil
npm run local:testcbar    # :3002, test API
```

- Test API-də səhifə hələ yer tutucudur → MSW fikstürü + proxy (yaddaş: `hybrid-fixture-proxy-for-ui-measuring`) ilə 14 sətirlik məzmunu ver.
- `/az/beynelxalq-teskilatlarda-uzvluk` (bölmə yolu ilə) 1728 / 744 / 390-da aç, Edge CDP `getBoundingClientRect` ilə
  [contracts/ui-contract.md](./contracts/ui-contract.md) dəyərlərini tutuşdur (yaddaş: `figma-measure-dom`).
- `?sort=oldest` → 1997 birinci; `?sort=xyz` → 2025 birinci; JS söndürülmüş halda menyu işləyir.
- Memorandum səhifəsi (`/az/merkezi-banklarla-emekdasliq`) dəyişməyib: hər iki sıra, "Tarix:" etiketi.
- En səhifə: en başlıq, en cədvəl.

## 3. Admin panel (`web-cbar-admin-new`)

```bash
cd product-rest/web-cbar-admin-new
npm run verify
npm run roundtrip -- "Beynəlxalq təşkilatlarda üzvlük"     # live API, cədvəl bayt-bayt qalır
npm run local:testcbar                                     # :5175
```

- Sol menyu bağlı halda (təmiz `nexus-ui`) 12 sətir; qrupları aç/bağla (siçan və klaviatura); səhifəni yenilə → vəziyyət qalır.
- Ünvanla `/memorandums` → "Beynəlxalq əməkdaşlıq" açıq, bənd aktiv. Mobil en (390) → sheet-də eyni qruplar.
- ⌘K → "Memorandum" axtarışı tapır, qrup başlığı görünür.
- Səhifələr → 122-ni aç → "Memorandumlar" kartı, klik → `/memorandums`. 554-ü aç → cədvəl qaydası qeydi. Adi səhifədə kart yoxdur.

## 4. Sənədlər (FR-018)

```bash
cd <repo kökü>
grep -rn "5 qrup\|Məzmun qrupu\|groups.content\|groups.finance" product-rest/web-cbar-admin-new/{CLAUDE.md,docs} CLAUDE.md   # boş olmalıdır
grep -rn "Admin paneldə \*\*" product-rest/web-cbar-new/docs   # hər nəticədə qrup yolu: **Qrup → Bölmə**
```

`/sync-business-logic` işlədilib, `new_business_logic.md`-də admin naviqasiyası və üzvlük səhifəsi var.
