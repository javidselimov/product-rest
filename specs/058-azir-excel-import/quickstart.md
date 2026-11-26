# Quickstart: AZIR Excel importunun yoxlanması (spec 058)

Dəyərlər: [contracts/admin-api.md](./contracts/admin-api.md) §3, qaydalar: [data-model.md](./data-model.md).

## 1. API — test layihəsi (bazasız)

```bash
cd product-rest/api-cbar-admin
dotnet test CbarAdminApi.slnx          # AzirSheetReaderTests daxil
```

Gözlənən: `AzirSheetReaderTests` yaşıl — nümunə fayl (`Fixtures/azir-2026-10-27.xlsx`) 27.10.2026, 1D `6.3048` ehtiyat plan, həcm 0, say 0,
min/max `null`, 30D `5.9748`, 90D `6.1316`, 180D `6.3484`, `skipped = [10 AZIR TFAI tfai]`; hər rədd kodu üçün sintetik fayl testi; həcm
sərhədləri (`10000` → mln, `10000.01` və `999999` → `ambiguous_volume`, `1000000` → `1.00`, `132000000` → `132.00`).

`dotnet` PATH-da olmaya bilər: `"C:/Program Files/dotnet/dotnet.exe"`.

## 2. OpenAPI

```bash
cd product-rest/api-cbar-admin/openapi && npm run lint && npm run bundle && cd ../../..
node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin   # repo kökündən; POST /api/v1/azir/import hər iki tərəfdə
```

## 3. API — canlı (stack)

Docker bu maşında işləmir — PGlite yolu (yaddaş: `pglite-api-testing`) və ya test/dev mühiti. Admin API `:5253`, token `POST /api/v1/auth/login`.

```bash
F="tools/AZIR Website 2026-10-27.xlsx"
curl -s -H "Authorization: Bearer $T" -F "file=@$F" http://localhost:5253/api/v1/azir/import          # 200, contracts §3
curl -s -H "Authorization: Bearer $T" -F "file=@$F" http://localhost:5253/api/v1/azir/import          # 409 date_exists, terms 4
curl -s -H "Authorization: Bearer $T" -F "file=@$F" -F overwrite=true http://localhost:5253/api/v1/azir/import   # 200, previous dolu
curl -s -H "Authorization: Bearer $T" "http://localhost:5253/api/v1/azir?from=2026-10-27&to=2026-10-27"   # 4 sətir
curl -s -H "Authorization: Bearer $T" -F "file=@README.md" http://localhost:5253/api/v1/azir/import    # 400 not_xlsx
```

- Audit: `audit_log`-da `azir.import`, entity id `20261027`, `after.fileName`.
- `api-cbar` (`:5139`): `GET /api/v1/azir?term=1D&from=2026-10-27` → `rate 6.3048, isReservePlan true, dealVolume 0, dealCount 0`.
- İctimai sayt (`:3001/az/statistics/azir`): 27.10.2026 sətri `6,3048% * | 0,00 | 0` (SC-002); ana səhifə kartında 30/90/180 gün qutuları.
- Yalnız `azir.read` icazəli istifadəçi: `POST /azir/import` → 403.

## 4. Panel

```powershell
cd product-rest/web-cbar-admin-new
npm run verify      # lint → check:kit → check:i18n → check:layout-fixtures → tsc -b → test:run → build
```

Vitest-i PowerShell-dən işlət (Git Bash-da "failed to find the runner"), Node 22 ilə də (yaddaş: `run-tests-on-node22`).

Əl ilə (`npm run dev` → `:5174/azir`, və ya `npm run local:testcbar` → `:5175/azir` deploy olunmuş test API ilə — API deploy olunandan sonra):

1. "Excel-dən yüklə" → nümunə fayl → "Yüklə" → xülasə: 4 müddət, TFAI qeydi; siyahıda 27.10.2026.
2. Yenidən → sarı təsdiq, "Ləğv et" → heç nə dəyişmir; "Əvəz et" → xülasədə köhnə dəyərlər.
3. Excel-də `B8`-i `TF AZIR 60D` et → "Sətir 8, sütun B: tanınmayan indeks adı".
4. Kart: müddət siyahısı `1D, 30D, 90D, 180D`; 30D yazılır.
5. `azir.read` rolu ilə: düymə görünmür.

## 5. Prod yoxlaması (deploydan əvvəl, bir dəfə)

```sql
SELECT term, count(*) FROM azir_index_values GROUP BY term;   -- 1W/1M yoxdursa siyahı dəyişikliyi heç nəyi gizlətmir
```

## 6. Deploy sırası

1. `api-cbar-admin` MR (OpenAPI + `AzirSheetReader` + controller + testlər) → test mühiti, Grafana-da başlanğıc logu.
2. `web-cbar-admin-new` MR (dialoq, müddət siyahısı, mətnlər) — API-dən sonra. `api-cbar` və `web-cbar-new` dəyişmir.
