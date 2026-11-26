# Quickstart / Validation: AZIR səhifəsi (spec 021)

Kod nümunəsi yoxdur. Bu sənəd feature-un işlədiyini sübut edən ssenarilərdir. Kontraktlar: [contracts/](./contracts/), qaydalar: [data-model.md](./data-model.md).

## 0. Ön şərtlər

- Lokal: Node 24 **və** Node 22 (CI `node:22`), korporativ CA üçün `NODE_EXTRA_CA_CERTS`. .NET SDK lokalda yoxdur: API dəyişiklikləri GitLab `test` pipeline-ında build olunur və **test** mühitində yoxlanılır.
- Deploy sırası: `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`.

## 1. Frontend qapıları (lokal)

```powershell
cd product-rest\web-cbar-admin-new; npm run verify
cd ..\web-cbar-new; npm run verify
# hər ikisini Node 22 ilə təkrar et (Intl / zlib.crc32 fərqləri)
```

Gözlənilən: lint, i18n paritet, `tsc`, Vitest və build yaşıldır. Yeni testlər §7-də sadalanıb.

## 2. OpenAPI (lokal)

```powershell
cd product-rest\api-cbar\openapi; npm run lint; npm run bundle
cd ..\..\api-cbar-admin\openapi; npm run lint; npm run bundle
node .claude\skills\sync-openapi\scripts\route-diff.mjs   # controller ↔ spec route fərqi = 0
```

## 3. Migration və admin API (test mühiti)

1. Deploy-dan sonra `api-cbar-admin` startup logunda `0008-azir-index-value-details.sql applied` görünür. Grafana `App api-cbar-admin`-də restart yoxdur. Mümkündürsə, FK-nın yaranıb-yaranmadığını qeyd et: `SELECT conname FROM pg_constraint WHERE conname = 'fk_azir_index_value_details_azir_index_value_id';`.
2. `api-cbar` read-only rol ilə yeni cədvəli oxuyur (grant işləyir): `GET /api/v1/azir?term=1D&from=…` `200` qaytarır və cavabda `isReservePlan` var. "permission denied" yoxdur.
3. Admin token ilə:
   - tam upsert (bütün 8 sahə) → `200`, cavabda bütün sahələr var;
   - eyni tarix+müddət, `isReservePlan: false` → sətir yenilənir, dublikat yaranmır, `audit_log`-da `azir.update` `before`/`after` ilə yazılır;
   - `dealVolume: -1` → `400`, `errors.dealVolume`;
   - `dealCount: 1.5` → `400`;
   - `minRate: 8, maxRate: 7` → `400`, `errors.minRate`;
   - yalnız `valueDate/term/rate` → `200`, qalan sahələr `null` / `false`;
   - detal sətri olmayan köhnə sətir siyahıda `null` / `false` ilə görünür;
   - yalnız `isReservePlan` dəyişəndə siyahıda `updatedAt` yenilənir;
   - sətri silmək → `204`, `azir_index_value_details`-də həmin `id` qalmır (FK olmasa da).

## 4. İstinad test dəsti və statistika (SC-002)

Test mühitində admin vasitəsilə 1D sətirləri yazılır. Lazım olsa əvvəlki test sətirləri silinir. USD məzənnəsi `2026-09-12`-yə qədər `1.7000`-dir (nominal 1).

| Tarix | rate | dealVolume | min / max | işarə |
|---|---|---|---|---|
| 2024-12-31 | 6.00 | 500 | — | |
| 2025-01-15 | 6.20 | 80 | — | |
| 2025-06-10 | 6.40 | 420 | — | |
| 2025-12-31 | 6.50 | 200 | — | |
| 2026-08-31 | 7.00 | 220 | — | ✔ |
| 2026-09-11 | 0 | — | — | (cədvəldə görünməməlidir) |
| 2026-09-12 | 7.25 | 250 | 6.90 / 7.60 | |

`GET /api/v1/azir/summary` (bu gün 2026-10-08 olanda) gözlənilən nəticə:

| Sahə | Gözlənilən |
|---|---|
| `lastDate` | 2026-09-12 |
| `lastRate` | 7.25 |
| `rateChangeSinceMonthEnd` | 0.25 |
| `rateChangeSinceYearEnd` | 0.75 |
| `lastMinRate` / `lastMaxRate` | 6.9 / 7.6 |
| `lastVolume` | 250 |
| `volumeChangeSinceMonthEnd` | 30 |
| `volumeMinSincePrevYearStart` / `Max` | 80 / 420 (2024-12-31-dəki 500 daxil deyil) |
| `lastVolumeUsd` | 147.06 |

Əlavə hallar:
- yalnız `2026-09-12` sətri olan baza → 3, 4, 8 `null`, digərləri dolu;
- USD olmayan baza → `lastVolumeUsd: null`;
- boş baza → 11 sahənin hamısı `null`, status 200.

`npm run contract` (api-cbar/openapi) `/api/v1/azir/summary`-ni şemaya qarşı yoxlayır.

## 5. Public səhifə (lokal MSW + test mühiti)

| # | Addım | Gözlənilən |
|---|---|---|
| 1 | `/az/statistics/azir` | qrafik, 15.05.2025 xəbərdarlığı, filtr (default bu gün−60 … bu gün), cədvəl (tarix azalan), statistika bloku, "Yüklə" |
| 2 | §4 dəsti ilə | 2026-09-11 (rate 0) cədvəldə yoxdur. 2026-08-31 yanında `*`, cədvəlin altında footnote |
| 3 | `?dateFrom=2026-09-12&dateTo=2026-09-12` | bir sətir, footnote yoxdur |
| 4 | `?dateFrom=2026-10-01&dateTo=2026-09-01` | inline `order` xətası, default aralıq göstərilir, redirect yoxdur |
| 5 | `?dateFrom=abc` | `format` xətası |
| 6 | `/en/statistics/azir` | bütün etiketlər ingiliscə, rəqəmlər eyni, onluq ayırıcı nöqtədir |
| 7 | summary sorğusu 500 verir (MSW) | statistika hissəsində inline xəta, cədvəl və qrafik görünür |
| 8 | `/indeks/rates?dateFrom=01/09/2026&dateTo=30/09/2026` | 308 → `/az/statistics/azir?dateFrom=2026-09-01&dateTo=2026-09-30` |
| 9 | `/indeks/rates?language=en&export=true` | 308 → `/en/statistics/azir/export?…` → fayl yüklənir |
| 10 | Ana səhifə | son 1D işarəlidirsə `*` + footnote. "AZIR" düyməsi `/az/statistics/azir` açır |
| 11 | Admin-də dəyişiklik → public | ≤ 60 s sonra görünür (keş, R12) |

## 6. Excel (SC-003)

1. Ssenari 1-dəki aralıqla "Yüklə" → `AZIR-1D_<from>_<to>.xlsx`.
2. Excel, LibreOffice Calc və Google Sheets-də xəbərdarlıqsız açılır.
3. `1D AZIR` vərəqi: 4 sütun, sətir sayı ekrandakı ilə eynidir. `=SUM(B2:B…)` rəqəm qaytarır. Tarix `DD.MM.YYYY` kimi görünür və tarix kimi sıralanır.
4. İşarəli sətir varsa `Qeydlər` vərəqi var, yoxdursa yoxdur.
5. `/en/...` → başlıqlar və `Notes` ingiliscə.

## 7. Avtomatik testlər (yeni, Vitest + MSW)

**`web-cbar-new`**:
- `azir-range.test.ts`: default aralıq, `format` / `order` / `tooLong`, gələcək `to`, `string[]`, köhnə `d/m/Y` → ISO;
- `numbers.test.ts`: az/en formatı, işarə, null → `—`;
- `xlsx/*.test.ts`: zip-i `inflateRawSync` ilə açıb hissələrin siyahısını, XML-in düzgünlüyünü, rəqəm və tarix xanalarını, escape-i və 2-ci vərəqin şərtini yoxlayır;
- `proxy.test.ts`: §3-dəki xəritənin hər sətri;
- `views/azir/azir.test.tsx`: §5-in 1–7-ci ssenariləri;
- `export/route.test.ts`: başlıqlar, 400, 502;
- `home-cards.test.tsx`: `*` və yeni link.

**`web-cbar-admin-new`** (`azir.test.tsx`):
- tam saxlama;
- işarənin götürülməsi;
- klient validasiyası (min > max, kəsr say, mənfi həcm);
- server `fieldErrors` → sahə;
- "Formaya yüklə" prefill.
