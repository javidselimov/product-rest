# Quickstart: Rəsmi məzənnə bülleteninin Excel importu — yoxlama

**Feature**: [spec.md](spec.md) · Kontraktlar: [admin-api-import.md](contracts/admin-api-import.md),
[public-xml-feed.md](contracts/public-xml-feed.md) · Məlumat: [data-model.md](data-model.md)

Lokalda .NET SDK yoxdur, ona görə backend ssenariləri (1–7) **test mühitində** yoxlanılır
(`test` branch-ı GitLab-da avtomatik test-ə gedir). Admin panel testləri (8) lokaldadır.

## Ön şərtlər

- Deploy sırası: `api-cbar-admin` (migration `0010` işləyir) → `api-cbar` → `web-cbar-admin-new`.
- `currency_rates.prepare` icazəli istifadəçi.
- Nümunə fayl: repo kökündə `Resmi Mezenne 13 10 2026.xlsx`.
- Səhv fayllar: hər hansı `.pdf`; həmin `.pdf`-in adı `.xlsx` edilmiş nüsxəsi; Excel-də boş
  yeni `.xlsx`; nümunə faylın `G8` (EUR) xanası silinmiş nüsxəsi; `B9`-u `USD` edilmiş nüsxəsi.

## 1. Master tamamlanıb (FR-010a)

`GET /api/v1/currencies` → `items` 42 element; `SDR`, `XAU`, `XAG`, `XPT`, `XPD`, `KRW`
(`nominal: 100`) var; mövcud 12-nin `sortOrder` və `showOnHomepage` dəyəri deploy-dan əvvəlki
kimidir. Migration-u ikinci dəfə işə salmaq heç nə dəyişmir.

## 2. Boş tarixə import (US1, SC-002)

Panel → Məzənnələr → "Excel-dən yüklə", tarix `13.10.2026`, nümunə fayl.
Gözlənilən: toast "42 valyuta yazıldı", ötürülən kod yoxdur; səhifə 13.10.2026 vərəqinə keçir.
Yoxla: `USD 1.7000`, `EUR 1.8992`, `BYN 0.5638`, `CZK 0.0779`, `SDR 2.3005`, `XAU 7133.2510`,
`KRW 0.1266`. Hər dəyər faylın `G` sütunu ilə 4 rəqəmədək eynidir.

## 3. Mövcud tarixə import (Q2)

Eyni tarixə eyni faylı yenidən yüklə → "Bu tarix üçün məzənnələr artıq var" təsdiqi.
"Ləğv et" → dəyişiklik yoxdur. "Üstünə yaz" → uğur. Əvvəl vərəqə əl ilə faylda olmayan kod
əlavə etmək olmadığı üçün (master = fayl), merge-i API ilə yoxla: `PUT` ilə yalnız `USD`
olan vərəq yarat, sonra USD-siz fayl nüsxəsini `overwrite=true` ilə yüklə → USD dəyəri qalır.

## 4. Əl ilə düzəliş (US2)

13.10.2026 vərəqində `USD`-ni `1.7001` et → Saxla → səhifəni yenilə → `1.7001`, qalanlar dəyişməyib.

## 5. Səhv fayllar (US3, SC-004)

| Fayl | Gözlənilən mesaj (`code`) |
|---|---|
| `.pdf` | yalnız xlsx (`not_xlsx`) |
| `.pdf` → `.xlsx` adı | yalnız xlsx (`not_xlsx`) |
| boş `.xlsx` | faylda məzənnə tapılmadı (`no_rates`) |
| `G8` boş | sətir 8, EUR: məzənnə səhvdir (`invalid_rate`) |
| `B9 = USD` | sətir 9, USD təkrarlanır (`duplicate_code`) |
| 6 MB fayl | fayl çox böyükdür (413 / `file_too_large`) |

Hər birindən sonra: `GET /api/v1/currency-rates/dates` dəyişməyib, audit-də yeni import qeydi yoxdur.

## 6. Public tərəf (SC-005)

- `https://<test web-cbar-new>/az/...` məzənnə səhifəsi 13.10.2026 üçün yeni valyutaları göstərir.
- `GET <test api-cbar>/currencies/13.10.2026.xml`: əvvəl `<ValType Type="Bank metalları">`
  (`XPD, XPT, XAG, XAU`, `Nominal` = `1 t.u.`), sonra "Xarici valyutalar"-da metal yoxdur,
  `Code="SDR"` var.
- Metalsız köhnə tarix (məs. yalnız 12 valyutalı vərəq) üçün XML deploy-dan əvvəlki ilə eynidir
  (deploy-dan əvvəl `curl` ilə saxla, sonra `diff`).

## 7. İcazə və audit

- `currency_rates.prepare` olmayan istifadəçi: düymə görünmür; birbaşa `POST` → `403`.
- `audit_log`-da `currency_rates.import` qeydi: istifadəçi, tarix, `fileName`, dəyərlər,
  üstünə yazmada `before`.

## 8. Admin panel gate (lokal)

```bash
cd product-rest/web-cbar-admin-new
npm run verify            # lint → check:kit → check:i18n → tsc -b → test:run → build
npx -y node@22 node_modules/vitest/vitest.mjs run src/features/currency   # CI Node versiyası
```

MSW testləri: uğur (say + ötürülən kodlar toast-da), `409 → təsdiq → overwrite=true` təkrarı,
`400 invalid_rate` sətir/kod mesajı, icazəsiz istifadəçidə düymə yoxdur.
