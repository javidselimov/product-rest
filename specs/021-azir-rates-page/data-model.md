# Data Model: AZIR səhifəsi (spec 021)

## 1. Saxlama: `azir_index_values` (dəyişmir) + yoldaş cədvəl `azir_index_value_details` (yeni)

Sahib: `api-cbar-admin`. Migration `0008-azir-index-value-details.sql` ([research R1](./research.md)). Mövcud `azir_index_values` (`id, value_date, term, rate, created_at, updated_at`, `UNIQUE (value_date, term)`) **toxunulmur**.

**`azir_index_value_details`** (1:1, ixtiyari):

| Sütun | Tip | Null | Default | Qeyd |
|---|---|---|---|---|
| `azir_index_value_id` | `bigint` PK | NOT NULL | — | `azir_index_values.id`; FK şərtlidir (aşağıda) |
| `deal_volume` | `numeric(12,2)` | NULL | — | mln manat; köhnə `eqd_hecm_az` |
| `deal_count` | `integer` | NULL | — | köhnə `eqd_say_az` |
| `min_rate` | `numeric(8,4)` | NULL | — | son əməliyyat günü min; köhnə `LAST MIN RATE` sətri |
| `max_rate` | `numeric(8,4)` | NULL | — | son əməliyyat günü max; köhnə `LAST MAX RATE` sətri |
| `is_reserve_plan` | `boolean` | NOT NULL | `false` | ehtiyat plan; köhnə başlıqdakı `*` |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | EF təyin edir, trigger yoxdur |

**CHECK-lər** (adlı, `CREATE TABLE`-ın içində):

| Ad | İfadə |
|---|---|
| `azir_index_value_details_deal_volume_nonneg` | `deal_volume IS NULL OR deal_volume >= 0` |
| `azir_index_value_details_deal_count_nonneg` | `deal_count IS NULL OR deal_count >= 0` |
| `azir_index_value_details_min_rate_nonneg` | `min_rate IS NULL OR min_rate >= 0` |
| `azir_index_value_details_max_rate_nonneg` | `max_rate IS NULL OR max_rate >= 0` |
| `azir_index_value_details_min_le_max` | `min_rate IS NULL OR max_rate IS NULL OR min_rate <= max_rate` |

**Şərtli FK** `fk_azir_index_value_details_azir_index_value_id`: `FOREIGN KEY (azir_index_value_id) REFERENCES azir_index_values(id) ON DELETE CASCADE`. Yalnız `has_table_privilege('azir_index_values','REFERENCES')` doğrudursa və constraint yoxdursa yaradılır (`0007:15-25` nümunəsi).

**Grant**: `cbar_web_ro` mövcuddursa `GRANT SELECT ON azir_index_value_details TO cbar_web_ro` (`0005:16-23` nümunəsi). `api-cbar` bu cədvəli oxuyur.

**Semantika**:
- Detal sətri yoxdursa bütün sahələr `null`, `is_reserve_plan = false` sayılır. Mövcud sətirlər üçün backfill yoxdur (FR-002).
- Silmə detal sətrini controller-də açıq silir; FK varsa cascade də var.
- Əlavə indeks lazım deyil: PK 1:1 JOIN-i örtür.

## 2. Entity-lər — `Cbar.Domain/Entities/Statistics.cs` (hər iki kopya, bayt-bayt eyni)

```text
AzirIndexValue                         (dəyişmir, yalnız naviqasiya əlavə olunur)
  Id, ValueDate, Term, Rate, CreatedAt, UpdatedAt
  Details: AzirIndexValueDetail?        ← yeni naviqasiya

AzirIndexValueDetail                   ← yeni
  AzirIndexValueId: long   (PK, FK)
  DealVolume: decimal?     (12,2)
  DealCount: int?
  MinRate: decimal?        (8,4)
  MaxRate: decimal?        (8,4)
  IsReservePlan: bool = false
  UpdatedAt: DateTimeOffset
```

`CbarDbContext` (hər iki kopya):
- `DbSet<AzirIndexValueDetail> AzirIndexValueDetails`.
- `b.Entity<AzirIndexValueDetail>(e => { e.ToTable("azir_index_value_details"); e.HasKey(x => x.AzirIndexValueId); e.Property(x => x.AzirIndexValueId).ValueGeneratedNever(); e.Property(x => x.DealVolume).HasPrecision(12,2); e.Property(x => x.MinRate).HasPrecision(8,4); e.Property(x => x.MaxRate).HasPrecision(8,4); })`. Şərh `UserSecurityStamp`-dakı kimi migration-a istinad etsin.
- `AzirIndexValue`: `HasOne(x => x.Details).WithOne().HasForeignKey<AzirIndexValueDetail>(d => d.AzirIndexValueId).OnDelete(DeleteBehavior.Cascade)`. EF səviyyəsində cascade DB FK-dan asılı deyil, çünki controller detalı izlənən entity kimi silir.

Ad mapping snake_case konvensiyası ilə avtomatikdir.

## 3. Validasiya qaydaları (admin upsert, FR-004)

| Sahə | Qayda | Xəta açarı (`errors`) |
|---|---|---|
| `valueDate` | məcburi | `valueDate` |
| `term` | məcburi, boş deyil, ≤ 10 simvol | `term` |
| `rate` | məcburi, `0 ≤ rate < 10000`, ≤ 4 onluq | `rate` |
| `dealVolume` | null və ya `0 ≤ v < 10^10`, ≤ 2 onluq | `dealVolume` |
| `dealCount` | null və ya tam `≥ 0` | `dealCount` |
| `minRate`, `maxRate` | null və ya `0 ≤ v < 10000`, ≤ 4 onluq | `minRate` / `maxRate` |
| `minRate ≤ maxRate` | ikisi də verilibsə | `minRate` |
| `isReservePlan` | bool; verilməyibsə `false` | — |

Upsert semantikası (FR-003): `(valueDate, term)` mövcuddursa **bütün** redaktə oluna bilən sahələr gələn dəyərlə əvəz olunur. Göndərilməyən nullable sahə `null` olur, işarə `false` olur. Panel həmişə tam forma göndərir (prefill, R14).

Yazma qaydası (bir tranzaksiya):
1. Ana sətir `Include(x => x.Details)` ilə yüklənir və ya yaradılır.
2. `Details` yoxdursa yaradılır, varsa 5 sahəsi əvəz olunur. Detal sahələrinin hamısı boş və işarə `false` olsa da detal sətri saxlanılır, sadəlik üçün.
3. `Details.UpdatedAt` və ana sətrin `UpdatedAt`-ı `now` olur. Yalnız detal dəyişəndə ana trigger işləmir, ona görə ana sətir açıq yenilənir.
4. Yeni ana sətirdə `Id` əvvəlcə alınmalıdır. EF bunu naviqasiya ilə avtomatik həll edir, mövcud iki `SaveChangesAsync` + tranzaksiya nümunəsi saxlanılır.

Audit (FR-006): `azir.create` / `azir.update` / `azir.delete`. `before` və `after` bütün sahələri daxil edir.

## 4. Törəmə (saxlanmır): 1D statistika xülasəsi (FR-015)

Giriş: `term = '1D'` və `rate > 0` olan sətirlər (`S`), USD məzənnəsi. `today` = Asia/Baku tarixi.

| # | Sahə (`/azir/summary`) | Qayda |
|---|---|---|
| 1 | `lastDate` | `max(S.value_date)` |
| 2 | `lastRate` | `S[lastDate].rate` |
| 3 | `rateChangeSinceMonthEnd` | `lastRate − S[max date ≤ son gün(ay(lastDate) − 1)].rate` |
| 4 | `rateChangeSinceYearEnd` | `lastRate − S[max date ≤ 31.12.(il(lastDate) − 1)].rate` |
| 5 | `lastMinRate` | `S[lastDate].details.min_rate` |
| 6 | `lastMaxRate` | `S[lastDate].details.max_rate` |
| 7 | `lastVolume` | `S[lastDate].details.deal_volume` |
| 8 | `volumeChangeSinceMonthEnd` | `lastVolume − S'[max date ≤ son gün(ay(lastDate) − 1)].deal_volume`, burada `S'` = `S` ∩ `deal_volume IS NOT NULL` |
| 9 | `volumeMinSincePrevYearStart` | `min(S.deal_volume)`, `value_date ≥ 01.01.(il(today) − 1)` |
| 10 | `volumeMaxSincePrevYearStart` | `max(...)`, eyni dövr |
| 11 | `lastVolumeUsd` | `round(lastVolume / (usd.rate / usd.nominal), 2)`; `usd` = `currency_code='USD'` və `rate_date ≤ lastDate` olan son sətir |

Hər sahə müstəqil olaraq `null` ola bilər (məlumat yoxdur, baza yoxdur, USD yoxdur), digərlərinə təsir etmir (FR-016). Rəqəmlər 4 onluğa (USD 2 onluğa) yuvarlaqlaşdırılır.

**Qeyd**: 3, 4 və 8-ci göstəricilərdə istinad nöqtəsi spec-dəki "bu ay" ifadəsini `lastDate`-in ayı kimi təfsir edir, `today`-in ayı kimi yox. Ayın ilk günlərində son dəyər ötən ayda olarsa, köhnə qayda (`last day of last month`, `today`-ə görə) dəyişməni 0 göstərərdi. `lastDate`-ə görə hesablama mənalıdır. 9–10-cu göstəricilər isə Clarifications Q2-yə görə `today`-ə bağlıdır.

## 5. Public sətir DTO-su (`GET /api/v1/azir`)

`{ valueDate, term, rate, dealVolume, dealCount, minRate, maxRate, isReservePlan }`. Bax [contracts/public-api.md](./contracts/public-api.md).

## 6. Frontend view modelləri (`web-cbar-new`)

```text
AzirRange       { from: IsoDate, to: IsoDate, error: null | 'format' | 'order' | 'tooLong', isDefault: boolean }
AzirTableRow    { date, rate, dealVolume|null, dealCount|null, isReservePlan }   // 1D, rate>0, date desc
AzirPageData    {
  locale, range,
  rows:    { data: AzirTableRow[] | null, error: boolean },
  chart:   { data: ChartData | null,     error: boolean },   // eyni rows-dan, artan
  summary: { data: AzirSummary | null,   error: boolean },
  hasReservePlan: boolean,
  exportHref: string
}
```
