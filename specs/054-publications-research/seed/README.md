# Seed generatorları — spec 054

Tooling-dir, heç bir komponent bu qovluğu import etmir (Konstitusiya II). Çıxış faylları komponentlərin repo-suna yazılır və orada commit olunur.

## Fayllar

| Fayl | Nədir |
|---|---|
| `figma-texts.json` | Figma-dakı başlıqlar, giriş mətnləri, qrup səhifələri, menyu qrupları və menyu bayraqları. az mətn Figma-dan gəlir, **en mətnlər draft tərcümədir** |
| `extract-tree.mjs` | test API-dən bölmə səhifələrinin bugünkü az/en başlığını, mətnini və md5-ni oxuyur, `figma-texts.json` ilə birləşdirib `tree.json` yazır |
| `build-tree-seed.mjs` | `tree.json` → `api-cbar-admin/db/migrations/0041-publications-tree-seed.sql`; deterministikdir |
| `extract-papers.mjs`, `upload-media.mjs`, `build-papers-seed.mjs` | son faza (US6): köhnə işçi məqalələri, PDF-lər, `0042-…-seed.sql` və `web-cbar-new/src/shared/config/legacy-working-papers.ts` |

## Figma mənbələri (`2698:5000`)

| Açar | Node | İstifadə |
|---|---|---|
| kök | `2698:22502` | giriş köhnə mətnlə eynidir, dəyişmir |
| Tədqiqatlar | `3487:291490` | yeni qrup səhifəsi: başlıq + 3 paraqraf (kökün iki paraqrafı + yeni cümlə) |
| Nəşrlər, hesabatlar və sənədlər | `2730:100609` | yeni qrup səhifəsi: başlıq + 1 paraqraf |
| Ekonometrik modellər | `2699:23673` | giriş köhnə mətnlə eynidir |
| Mikromaliyyə | `2766:114051` | yeni giriş |
| Kibertəhlükəsizlik | `2767:115663` | yeni giriş |
| Risk əsaslı nəzarət | `2776:16546` | yeni giriş + Figma başlığı |
| Nəzarət Texnologiyaları | `2776:18033` | yeni giriş + Figma başlığı |
| İşçi məqalələri | `2825:22947` | Figma başlığı ("İşçi məqalələri"); giriş köhnə ilə eynidir |
| Ödəniş xidmətləri | `2795:36871` (gizli bölmə) | yeni giriş |

## İşlətmə sırası

```bash
node specs/054-publications-research/seed/extract-tree.mjs      # → seed/tree.json
node specs/054-publications-research/seed/build-tree-seed.mjs   # → api-cbar-admin/db/migrations/0041-publications-tree-seed.sql
```

Seed yalnız köhnə mətnin üzərinə yazır: başlıq `title = legacy` olanda, giriş mətnin md5-i köhnə md5 olanda dəyişir. Redaktorun dəyişikliyinə toxunmur.
Təkrar işləyəndə heç nəyi dəyişmir.
