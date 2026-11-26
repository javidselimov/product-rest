# FinCERT seed (spec 053)

Köhnə FinCERT səhifəsinin (səhifə 133, `fincert`) məzmununu `api-cbar-admin/db/migrations/0037-fincert-seed.sql`-ə çevirən alətlər.
Heç bir komponent bu qovluğu import etmir. Bu, yalnız migration-ı yenidən qurmaq üçündür.

| Fayl | Nədir |
|---|---|
| `extract.mjs` | test API-dən (`GET /api/v1/pages/fincert?locale=az\|en`) və ya qovluqdan oxuyur, `fincert-az.json`, `fincert-en.json` yazır |
| `fincert-az.json`, `fincert-en.json` | missiya, 4 istiqamət (gövdə HTML olduğu kimi), e-poçt, telefon (Figma forması), portal, RFC köhnə linki |
| `fincert-first.json` | FIRST üzvlüyü: az mətn Figma-dandır, en mətn **qaralamadır** |
| `build-seed.mjs` | üç JSON-dan `0037-fincert-seed.sql` qurur (deterministik) |

## İşlətmə

```bash
node .tmp-053/baseline.mjs                                  # SC-002 baza xətti (.tmp-053/api/*.json-dan)
node specs/053-fincert-page/seed/extract.mjs [.tmp-053/api] # qovluq verilməsə test API-dən oxuyur
node specs/053-fincert-page/seed/build-seed.mjs
```

`extract.mjs` nəticə baza xətti ilə tutuşmursa xəta ilə dayanır. Yoxlanan sahələr:
- istiqamət sayı;
- hər istiqamətdə `li` sayı;
- e-poçt, telefon, portal və RFC linki.

## Redaktorun etməli olduğu işlər

- **FIRST loqosu** admin paneldən yüklənir: "FinCERT → Beynəlxalq üzvlüklər". Seed loqosuz yazır, kart loqosuz görünür.
- **en FIRST mətni** qaralamadır. Redaktor yoxlamalıdır.
- **RFC-2350**: test mühitində köhnə PDF media kitabxanasında yoxdur. Seed onu köhnə link kimi (`rfc_url`) yazır. Redaktor sənədi
  "FinCERT → Ümumi" formasında yükləyəndə fayl linkdən üstün olur.
- Migration tətbiq olunubsa, dəyişiklik yeni migration ilə gəlir. `0037`-ni redaktə etmə.
