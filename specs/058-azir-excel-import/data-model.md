# Data Model: AZIR Excel importu (spec 058)

**Baza dəyişmir.** Migration yoxdur, `Cbar.Domain` (hər iki nüsxə) toxunulmur. Yazılan cədvəllər spec 021-dəkidir:
`azir_index_values (id, value_date, term, rate, created_at, updated_at, UNIQUE (value_date, term))` və
`azir_index_value_details (azir_index_value_id PK, deal_volume numeric(12,2), deal_count, min_rate numeric(8,4), max_rate numeric(8,4),
is_reserve_plan, updated_at)` ([spec 021 data-model](../021-azir-rates-page/data-model.md)).

## 1. Fayl → yaddaş modeli (`AzirSheetReader`, saxlanılmır)

### AzirSheet

| Sahə | Tip | Mənbə / qayda |
|---|---|---|
| `ValueDate` | `DateOnly` | `B2`: rəqəm → Excel seriya tarixi; mətn → `dd.MM.yyyy`. Yoxdursa `date_missing`; `> BakuClock.Today()` → `date_in_future` |
| `Terms` | `IReadOnlyList<AzirSheetTerm>` | başlıq sətrindən sonrakı tanınmış müddət sətirləri, fayl sırası ilə; 1D həmişə var |
| `Skipped` | `IReadOnlyList<AzirSkippedRow>` | tanınan, amma yazılmayan sətirlər |
| `VolumeConverted` | `bool` | 1D həcmi manatdan `÷ 1 000 000` çevrilibsə `true` |

### AzirSheetTerm

| Sahə | Tip | 1D | 30D / 90D / 180D |
|---|---|---|---|
| `Row` | `int` | faylın sətri | eyni |
| `Term` | `string` | `"1D"` | `"30D"` / `"90D"` / `"180D"` |
| `Rate` | `decimal` | `C × 100`, 4 onluq, `0 < x < 10 000` | `C × 100`, 4 onluq, `0 < x < 10 000` |
| `IsReservePlan` | `bool` | adda `*` | adda `*` |
| `DealVolume` | `decimal?` | D, R5 qaydası, 2 onluq | `null` |
| `DealCount` | `int?` | E, `≥ 0` tam | `null` |
| `MinRate` | `decimal?` | `LAST MIN RATE` C `× 100`, 4 onluq; 0/boş → `null` | `null` |
| `MaxRate` | `decimal?` | `LAST MAX RATE` C `× 100`, 4 onluq; 0/boş → `null` | `null` |

Qayda: `MinRate` və `MaxRate` ikisi də doludursa `MinRate ≤ MaxRate` (`invalid_value`, `LAST MIN RATE` sətri, `C`).

### AzirSkippedRow

| Sahə | Tip | Qiymətlər |
|---|---|---|
| `Row` | `int` | faylın sətri |
| `Name` | `string` | fayldakı ad (kəsilmiş) |
| `Reason` | `string` | `tfai` — TFAI yazılmır (spec Qərar 8); `empty` — 30D/90D/180D faizi boş, `-` və ya 0 |

### Sətir tanınması (R4)

```
normalize(B) = upper(collapse_spaces(trim(B)))         reserve = '*' ∈ B, sonra '*' silinir
'' və ya '*…' ilə başlayan (normallaşmadan əvvəl)        → nəzərə alınmır
'AZIR' | '1D AZIR'                                       → 1D
'TF AZIR 30D' | 'TF AZIR 90D' | 'TF AZIR 180D'           → 30D | 90D | 180D
'AZIR TFAI'                                              → skipped(tfai)
'LAST MIN RATE' | 'LAST MAX RATE'                        → 1D.min | 1D.max
başqa                                                    → unknown_index (row, 'B')
eyni nəticə ikinci dəfə                                   → duplicate_index (row, 'B')
```

### Rədd kodları (oxuyucu)

| `code` | Nə vaxt | `row` / `column` |
|---|---|---|
| `not_xlsx` | zip/XML oxunmur | — |
| `file_too_large` | açılmış hissə > 20 MB (`XlsxSheetReader`) | — |
| `date_missing` | `B2` boş və ya tarix deyil | 2 / `B` |
| `date_in_future` | tarix Bakı günündən sonradır | 2 / `B` |
| `header_missing` | "Ad / Faiz" başlıq sətri yoxdur | — |
| `unknown_index` | cədvəldə tanınmayan ad | sətir / `B` |
| `duplicate_index` | eyni müddət və ya min/max iki dəfə | sətir / `B` |
| `missing_1d` | 1D sətri yoxdur və ya faizi boş/0 | 1D sətri / `C` (sətir varsa) |
| `invalid_value` | rəqəm deyil, mənfi, sərhəddən kənar, tam olmayan say, `min > max` | sətir / sütun |
| `ambiguous_volume` | 1D həcmi `10 000 < x < 1 000 000` | sətir / `D` |

## 2. Yazma (controller, R6)

```
write_set = sheet.Terms                              (1D + dəyəri olan digərləri)
existing  = SELECT … WHERE value_date = sheet.ValueDate AND term IN write_set.terms   (Include Details)
if existing ≠ ∅ and !overwrite  → 409 date_exists { count, terms }
BEGIN
  for t in write_set:
    row = existing[t.Term] ?? new AzirIndexValue { ValueDate, Term }
    row.Rate = t.Rate; row.Details ??= new(); row.Details.{DealVolume, DealCount, MinRate, MaxRate, IsReservePlan} = t.…
    if existing: row.UpdatedAt = now
  audit.Log("azir.import", "azir_index_value", yyyyMMdd(ValueDate), before: snapshot(existing), after: { fileName, values })
COMMIT
```

Faylda olmayan və `skipped` olan müddətlər oxunmur və yazılmır. Bazanın CHECK-ləri (`min ≤ max`, mənfi deyil) son sərhəddir; oxuyucu onları
əvvəlcədən yoxlayır ki, redaktor sətir/sütun görsün.

## 3. Panel modeli (`web-cbar-admin-new/src/features/azir`)

- `model/schemas.ts`: `AZIR_TERMS = ['1D', '30D', '90D', '180D']`; `azirImportResultSchema` (Zod, `contracts/admin-api.md` §2);
  `AZIR_IMPORT_ERROR_CODES` (yuxarıdakı cədvəl + `file_required`, `date_exists`).
- `model/import-state.ts`: dialoq vəziyyəti

  ```ts
  type AzirImportState =
    | { step: 'pick'; file: File | null }
    | { step: 'confirm'; file: File; date: string; terms: string[] }
    | { step: 'done'; result: AzirImportResult }
  ```

  `isPending` və xəta `useMutation`-dan gəlir, vəziyyətdə saxlanmır (derived state yoxdur).
