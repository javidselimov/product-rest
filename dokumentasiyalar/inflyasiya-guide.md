# İnflyasiya — idarəetmə təlimatı

Bu sənəd cbar.az-ın **inflyasiya** göstəricilərini admin paneldən necə idarə etməyi və
dəyişikliyin saytda harada, necə görünəcəyini izah edir. Bölmə iki fərqli şeyi idarə edir:

1. **Ana səhifədəki inflyasiya kartı** — cari (illik) inflyasiya, hədəf və tarix. Üç sahəlik tək
   forma ilə doldurulur.
2. **Aylıq inflyasiya seriyası** — il + ay + parametr üzrə dəyərlər. Saytda «Statistika»
   səhifəsindəki sütunlu qrafiki qurur.

> Formaların adları çaşdıra bilər: paneldəki **«Aylıq inflyasiya parametrləri»** kartı əslində
> ana səhifənin kartını (3 sahə) idarə edir — köhnə paneldəki ad saxlanılıb. Aylıq seriya isə
> onun altındakı **«Parametr əlavə et / yenilə»** kartı və siyahı ilə yazılır.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Maliyyə** → **İnflyasiya** (`/inflation`) |
| **Sayt (AZ) — ana səhifə kartı** | `https://<sayt>/az` → birinci ekranda **«İnflyasiya»** kartı |
| **Sayt (EN) — ana səhifə kartı** | `https://<sayt>/en` → **«Inflation»** kartı |
| **Sayt (AZ) — aylıq qrafik** | `https://<sayt>/az/statistics` → **«İnflyasiya»** qrafiki |
| **Sayt (EN) — aylıq qrafik** | `https://<sayt>/en/statistics` → **«Inflation»** qrafiki |
| **Saytda yolu** | Ana səhifə → «İnflyasiya» kartının başlığına klik → Statistika səhifəsi |

Dəyişiklik yadda saxlandıqdan sonra saytda **ən geci ~10 saniyə** içində görünür: sayt API
cavablarını 10 saniyəlik keşdə saxlayır, köhnə cavab bitəndən sonra ilk açılış hələ köhnəni
göstərə bilər, ikinci yeniləmə təzəsini gətirir.

İnflyasiya rəqəmləri **dildən asılı deyil** — AZ və EN eyni dəyərləri göstərir, yalnız kartın
etiketləri (İllik inflyasiya / Annual inflation, Hədəf / Target, ay adları) tərcümə olunur.

---

## 2. Hazırlıq

Əlavə fayl və ya başqa bölmədən qeyd lazım deyil. Yalnız iki şeyi əvvəlcədən müəyyənləşdirin:

- **Hədəf** sahəsi sərbəst mətndir (məs. `4 (±2)`) — saytda **olduğu kimi**, sonuna ` %` əlavə
  olunmaqla göstərilir. Ona görə mətnə faiz işarəsi **yazmayın**, yoxsa saytda `4 (±2) % %` çıxar.
  Mətn hər iki dildə eynidir — ora azərbaycanca söz yazsanız, ingilis səhifədə də o çıxar.
- **Tarix** sahəsi (paneldə «Növbəti yenilənmə tarixi») saytda cari inflyasiyanın **altında «ay
  il»** kimi göstərilir (məs. «sentyabr 2026»). Yəni sayt onu göstəricinin **aid olduğu dövr**
  kimi oxuyur, adındakı «növbəti» sözünə baxmayaraq. Hansı tarixi yazacağınızı buna görə seçin
  (bax §4.1).

---

## 3. Admin paneldə əməliyyatlar

**Maliyyə → İnflyasiya** səhifəsi yuxarıdan aşağı üç hissədən ibarətdir:

1. **«Aylıq inflyasiya parametrləri»** kartı — ana səhifə kartının üç sahəsi (§3.1).
2. **«Parametr əlavə et / yenilə»** kartı — aylıq seriyaya dəyər yazmaq (§3.2).
3. **Siyahı** — bütün aylıq dəyərlər, «İl» filtri ilə; sətirdən yalnız silmək olur (§3.3–3.4).

### 3.1. Ana səhifə kartını doldurmaq («Aylıq inflyasiya parametrləri»)

Kartın altında yazılıb: *«Ana səhifədəki inflyasiya kartının altında göstərilir: cari
inflyasiya, hədəf və tarix.»* Forma bir sətirdir:

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Cari inflyasiya** | Rəqəm (onluq hissə ola bilər, məs. `5.1`) | Kartın sol, yaşıl qutusunda böyük rəqəm + `%` («İllik inflyasiya») |
| **Hədəf inflyasiya** | Sərbəst mətn, ən çox 255 simvol, nümunə: `4 (±2)` — faiz işarəsiz | Kartın sağ, boz qutusunda («Hədəf») — mətn + ` %` |
| **Növbəti yenilənmə tarixi** | Təqvimdən tarix (gg.aa.iiii) | Cari rəqəmin **altında** yalnız **ay və il** göstərilir; gün görünmür |

Sonra **Yadda saxla**. Uğurda «Aylıq inflyasiya parametrləri yadda saxlanıldı» bildirişi çıxır.
Bu **tək qeyddir** — hər saxlama əvvəlkinin üstünə yazır, tarixçə yoxdur (kim nəyi dəyişib —
yalnız sistemin audit jurnalında qalır).

Formanın verə biləcəyi xətalar:

| Mesaj | Səbəb |
|---|---|
| «Cari inflyasiya rəqəm olmalıdır» | Sahə boşdur və ya rəqəm deyil |
| «Hədəf inflyasiya boş ola bilməz» | Hədəf boşdur (yalnız boşluqlar da boş sayılır) |
| «Hədəf inflyasiya ən çox 255 simvol ola bilər» | Mətn uzundur |
| «Tarix seçilməlidir» | Tarix seçilməyib |

Sistem tərəfdən əlavə məhdudiyyət: cari inflyasiya **±10 000-dən** kənar ola bilməz; dəyər
bazada **iki onluq rəqəmlə** saxlanır (daha çox yazılsa yuvarlaqlaşdırılır — yoxlanılmalıdır).

> Forma heç vaxt saxlanmayıbsa, kart boş açılır. Bu halda sayt ana səhifə kartını **aylıq
> seriyadan** özü düzəldir (bax §4.1). Forma bir dəfə saxlanandan sonra isə həmişə forma üstündür.

### 3.2. Aylıq dəyər əlavə etmək və ya yeniləmək («Parametr əlavə et / yenilə»)

Kartın altında yazılıb: *«Mövcud il + ay + parametr kombinasiyası saxlananda onun dəyəri
yenilənir.»* Yəni ayrıca «redaktə» yoxdur — eyni il, ay və parametri yenidən saxlasanız köhnə
dəyər əvəzlənir, siyahıda ikinci sətir yaranmır.

| Sahə | Nə seçilir / yazılır | Saytda təsiri |
|---|---|---|
| **İl** | 4 rəqəmli il (standart olaraq cari il) | Statistika səhifəsi yalnız **cari ili** göstərir — bax §4.2 |
| **Ay** | Siyahıdan: Yanvar … Dekabr (standart: Yanvar) | Qrafikdə üfüqi oxdakı ay |
| **Parametr** | **İİQ (illik)** və ya **Hədəf** | Qrafikdə ayrıca sütun seriyası: «İQİ, illik (%)» / «Hədəf (%)» |
| **Dəyər** | Rəqəm (onluq ola bilər, məs. `5.4`) | Sütunun hündürlüyü, faizlə |

**Yadda saxla** → «İnflyasiya parametri yadda saxlanıldı». Uğurdan sonra yalnız **Dəyər**
sahəsi təmizlənir; il, ay, parametr qalır — növbəti ayı seçib davam edə bilərsiniz. Siyahı
avtomatik yenilənir.

Xətalar:

| Mesaj | Səbəb |
|---|---|
| «İl 4 rəqəmdən ibarət olmalıdır» | İl boşdur və ya 4 rəqəm deyil |
| «Ay 1–12 aralığında seçilməlidir» | Ay seçilməyib |
| «Parametr seçilməlidir» | Parametr siyahıdan deyil |
| «Dəyər rəqəm olmalıdır» | Dəyər boşdur və ya rəqəm deyil |

Hər ay üçün adətən **iki** qeyd yazılır: biri «İİQ (illik)», biri «Hədəf». Hədəf il boyu eyni
rəqəmdirsə də, qrafikdə hər ayın yanında görünsün deyə **hər aya ayrıca** yazılmalıdır — sistem
onu özü çoxaltmır.

### 3.3. Siyahı və «İl» filtri

Siyahının sütunları: **İl · Ay · Parametr · Dəyər · Yenilənib**. Ay adla, parametr rəngli
nişanla («İİQ (illik)» və «Hədəf» fərqli rəngdə) göstərilir. Sıralama: ən yeni il və ay yuxarıda,
eyni ay içində parametr adına görə. Səhifələmə yoxdur — bütün qeydlər bir siyahıdadır.

**İl** filtrinə il yazın (rəqəm) — yarım saniyəyə siyahı həmin ilə daralır; filtr ünvan sətrinə
yazıldığı üçün səhifəni yeniləyəndə qalır. Axtarış xanası yoxdur.

Siyahıda **redaktə düyməsi yoxdur** — dəyəri dəyişmək üçün §3.2-dəki formada eyni il, ay və
parametri seçib yeni dəyəri yazın.

### 3.4. Aylıq dəyəri silmək

Siyahıda sətrin sağındakı **zibil qutusu** düyməsi → dialoqda **«"2026-09 cpi_yoy" inflyasiya
parametri silinsin? Bu əməliyyat geri qaytarıla bilməz.»** → **Sil**. Uğurda «Qeyd silindi».

- Silmə birdəfəlikdir, «gizlətmə» yoxdur; lazım olsa dəyəri yenidən yazın (§3.2).
- Ana səhifə kartı formadan (§3.1) doldurulubsa, aylıq qeydlərin silinməsi ona **təsir etmir**.
  Forma heç saxlanmayıbsa, kart seriyanın sonuncu dəyərlərindən qurulur və dəyişə bilər.

### 3.5. Kim edə bilər

Bölmə ayrıca icazələrlə qorunur: oxumaq, əlavə etmək (§3.2), parametrləri dəyişmək (§3.1) və
silmək (§3.4). **Moderator** rolunda hamısı var; «MEAS meneceri» rolu bölməni görmür. İcazəsi
olmayan düymə üçün sistem xəta qaytarır.

---

## 4. Saytda nə və necə görünür

### 4.1. Ana səhifə — «İnflyasiya» kartı

Birinci ekranda məzənnə və faiz dəhlizi kartlarının yanındadır. Başlıq **«İnflyasiya»**
(EN: *Inflation*) — klikləyəndə `/az/statistics` açılır. İçində iki qutu:

| Qutu | Etiket | Nədən gəlir |
|---|---|---|
| Sol (yaşıl, ağ yazı) | **İllik inflyasiya** / *Annual inflation* | **Cari inflyasiya** + `%`; altında kiçik yazı ilə **tarixin ayı və ili** (məs. «sentyabr 2026» / «September 2026») |
| Sağ (boz) | **Hədəf** / *Target* | **Hədəf inflyasiya** mətni + ` %` (məs. `4 (±2) %`) |

Rəqəm dilin formatında yazılır (AZ-da onluq ayırıcı vergül ola bilər — yoxlanılmalıdır).
Dəyər yoxdursa qutuda tire görünür.

**Forma (§3.1) heç saxlanmayıbsa** sayt kartı belə qurur:

- sol qutu — aylıq seriyada **ən sonuncu «İİQ (illik)»** dəyəri, altında həmin il+ayın adı;
- sağ qutu — **ən sonuncu «Hədəf»** dəyəri (rəqəm kimi, məs. `4 %`);
- heç bir «İİQ (illik)» qeydi yoxdursa, kart **ümumiyyətlə görünmür**.

Forma bir dəfə saxlanandan sonra aylıq seriya kartı daha idarə etmir.

Sayt API-dən cavab ala bilməyəndə kartın yerində xəta bloku çıxır; digər kartlar işləyir.

### 4.2. Statistika səhifəsi — «İnflyasiya» qrafiki

`/az/statistics` səhifəsində üç qrafik var: AZIR, **İnflyasiya**, Gəlirlik əyrisi. İnflyasiya
qrafiki:

- Başlıq **«İnflyasiya»**, altbaşlıq **«2026-cı il»** — səhifə **həmişə cari təqvim ilini**
  göstərir, il seçimi yoxdur. Keçən ilin dəyərləri saytda görünmür (paneldə qalır).
- Sütunlu qrafik: üfüqi oxda ay adları (yalnız dəyəri olan aylar), hər parametr ayrı rəngli
  seriya; leqenda: **«İQİ, illik (%)»** və **«Hədəf (%)»** (EN: *CPI, year-on-year (%)*,
  *Target (%)*). Şaquli ox faizlə.
- Ayın bir parametri yoxdursa, həmin ayda o sütun sadəcə boş qalır.
- Cari il üçün heç bir qeyd yoxdursa: **«Bu göstərici üçün məlumat yoxdur»**.

> İlin əvvəlində (yanvarda) yeni ilin ilk dəyəri yazılana qədər qrafik boş olur — bu gözlənilən
> davranışdır. Yanvar dəyərini mümkün qədər tez daxil edin.

Statistika səhifəsinə saytın öz menyusundan keçid kodda yoxdur — ora ana səhifədəki kartın
başlığından və ya birbaşa ünvanla gedilir (menyu bəndi CMS səhifələrindən idarə olunursa,
yoxlanılmalıdır).

### 4.3. Dil görünüşü

Hər iki dil eyni rəqəmləri göstərir; gizlətmə, «yalnız AZ» variantı yoxdur. Tərcümə olunan
yalnız etiketlər və ay adlarıdır. **Hədəf** mətni tərcümə olunmur — hər iki dildə eyni çıxır.

---

## 5. Əlaqəli modullar

- **Ana səhifə → Məlumat sətirləri** — faiz dəhlizi və digər göstəricilər oradandır, inflyasiya
  ilə əlaqəsi yoxdur.
- **Maliyyə → AZIR**, **Gəlirlik əyriləri** — Statistika səhifəsindəki digər iki qrafik.

---

## 6. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] Paneldə «Aylıq inflyasiya parametrləri» kartında üç sahə doludur və «Yadda saxla»dan sonra
      yaşıl bildiriş çıxıb.
- [ ] Hədəf mətnində `%` işarəsi **yoxdur**.
- [ ] `/az` ana səhifədə «İnflyasiya» kartı: rəqəm, altındakı ay-il və hədəf gözlədiyiniz kimidir
      (10–20 saniyə sonra yeniləyin).
- [ ] `/en` — eyni rəqəmlər, ingiliscə etiketlər və ay adı.
- [ ] Bu ayın **hər iki** parametri («İİQ (illik)» və «Hədəf») siyahıda var, il düzgündür.
- [ ] `/az/statistics` — İnflyasiya qrafikində yeni ay sütunu görünür, altbaşlıqdakı il doğrudur.
- [ ] Eyni ay üçün siyahıda təkrar sətir yoxdur (bir il + ay + parametr = bir sətir).

## 7. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Saxladım, saytda köhnə rəqəm qalır | 10 saniyəlik keş | 10–20 saniyə gözləyib səhifəni bir-iki dəfə yeniləyin |
| Kartda `4 (±2) % %` | Hədəf mətninə `%` yazılıb | Mətndən `%`-i silin |
| Kartın altındakı tarix gələcək ayı göstərir | «Növbəti yenilənmə tarixi» sahəsinə növbəti dərc tarixi yazılıb, sayt isə onu ay-il kimi göstərir | Sahəyə göstəricinin aid olduğu dövrün tarixini yazın (§2) |
| Ana səhifədə kart yoxdur | Forma saxlanmayıb **və** seriyada «İİQ (illik)» qeydi yoxdur, ya da API xətası | §3.1 formasını doldurun; xəta bloku görünürsə texniki komandaya bildirin |
| Statistika qrafiki boşdur, paneldə qeydlər var | Qeydlər cari il deyil (məs. keçən il) | Cari il üçün dəyər daxil edin; səhifə yalnız cari ili göstərir |
| Qrafikdə hədəf sütunu bəzi aylarda yoxdur | Hədəf hər aya ayrıca yazılmayıb | Çatışmayan aylar üçün «Hədəf» qeydi əlavə edin |
| Aylıq dəyəri düzəltmək istəyirəm, redaktə düyməsi yoxdur | Belə nəzərdə tutulub | Formada eyni il + ay + parametri seçib yeni dəyəri saxlayın — üstünə yazılır |
| Siyahıda qeyd görünmür | «İl» filtri doludur | Filtri təmizləyin |
| «İl 4 rəqəmdən ibarət olmalıdır» | İl sahəsində 4 rəqəm yoxdur | İli tam yazın (məs. 2026) |

---

## Əlavə: developerlər üçün

İki məlumat mənbəyi, iki API, bir panel səhifəsi. Deploy sırası adi qaydadadır:
**api-cbar-admin** → **api-cbar** → frontend-lər.

| Qat | Yer |
|---|---|
| DB | `monthly_inflation_parameters` (`0001-initial-schema.sql`: `year`, `month` CHECK 1–12, `parameter_code` varchar(50), `value` numeric(10,4), `UNIQUE (year, month, parameter_code)`); `inflation_settings` (`0005-inflation-settings.sql`: tək sətir `CHECK (id = 1)`, `current_inflation` numeric(6,2), `target_inflation` varchar(255), `next_update_date` date) |
| Domain | `Cbar.Domain/Entities/Statistics.cs` → `MonthlyInflationParameter`, `InflationSetting`; `CbarDbContext` — **hər iki** API-də eyni |
| Admin API | `api-cbar-admin` → `Controllers/InflationController.cs`: `GET /api/v1/inflation?year=`, `POST /api/v1/inflation` (upsert: tapılsa yalnız `Value` dəyişir), `GET/PUT /api/v1/inflation/settings` (tək sətir upsert; `GET` heç saxlanmayıbsa `Ok(null)` → 204), `DELETE /api/v1/inflation/{id}`. İcazələr `inflation.read/create/update/delete` (`0009-rbac-permissions.sql`; moderator hamısını alır). Audit: `inflation.create/update/delete`, `inflation.settings.create/update` |
| Public API | `api-cbar` → `Controllers/StatsController.cs`: `GET /api/v1/inflation?year=` (il, ay, kod üzrə artan), `GET /api/v1/inflation/settings` (sətir yoxdursa **404**) |
| OpenAPI | hər iki API-də `openapi/` (inflation path-ları — `/sync-openapi` ilə yoxlanılmalıdır) |
| Sayt | `web-cbar-new`: `features/stats/api/stats.api.ts` (`getInflation`, `getInflationSettings` — 404 → `null`), `features/stats/model/series.ts` (`inflationSeries`, `inflationSummary`), `views/home/loader.ts` (`inflationBlock`), `widgets/home-cards/inflation-card.tsx`, `views/statistics/{loader,index}.tsx`, route `app/[locale]/(content)/statistics/page.tsx`; etiketlər `locales/{az,en}/home.json` (`inflation`, `annualInflation`, `target`) və `finance.json` (`inflation`, `inflationYear`, `parameters.*`, `noData`) |
| Keş | `web-cbar-new/src/server/cached.ts` — `unstable_cache`, `CONTENT_REVALIDATE_SECONDS = 10`, tag `stats`, stale-while-revalidate |
| Admin panel | `web-cbar-admin-new`: `pages/inflation/index.tsx` (`CrudListPage` + `above`), `features/inflation/` (`model/module.ts` — `listEnvelope: 'array'`, `canCreate/canEdit: false`, filtr `year`; `model/schemas.ts` — `INFLATION_PARAMETERS = ['cpi_yoy','target']`; `components/inflation-settings-card.tsx`, `inflation-upsert-card.tsx`, `month-cell.tsx`; `hooks/use-inflation.ts`); route `app/routes/index.ts`, nav `app/routes/nav.ts` (group `finance`); lokalizasiya `locales/az/inflation.json`, ay adları `common.json → months` |
| Testlər | panel: `features/inflation/inflation.test.tsx`; sayt: `views/home/loader.test.ts`, `views/finance.test.tsx`, `features/stats/model/series.test.ts`, MSW `shared/testing/handlers/stats.ts` |

**Davranış qeydləri:**

- Ana səhifə kartı: `settings` varsa `currentInflation` / `targetInflation` / `nextUpdateDate`
  (`formatMonthYear` — yalnız il+ay); yoxdursa `inflationSummary` — sonuncu `cpi_yoy` və sonuncu
  `target` (il, ay üzrə sıralanmış). Nə `settings`, nə `cpi_yoy` → kart render olunmur.
- Statistika: `getInflation(new Date().getFullYear())`; `inflationSeries` x-oxunu dəyəri olan
  aylardan, seriyaları `parameterCode`-lardan qurur; etiket `finance:parameters.<code>`, tapılmasa
  kodun özü. `finance.json`-da `core_yoy` etiketi var, amma panel yalnız `cpi_yoy` və `target`
  yazmağa icazə verir.
- Admin upsert `POST` yalnız ay aralığını və boş kodu yoxlayır; kod siyahısı yalnız frontend-dədir
  (`INFLATION_PARAMETERS`). API birbaşa çağırılsa istənilən `parameter_code` saxlanır.
- `inflation_settings.current_inflation` numeric(6,2) — API ±10 000 yoxlayır, onluq hissə DB-də
  2 rəqəmə yuvarlaqlaşır; panel isə istənilən rəqəmi qəbul edir.
- `series.ts`-dəki `inflationYearLines` (iki illik xətt qrafiki) hazırda heç yerdə istifadə
  olunmur — spec 022 ilə ana səhifə qrafiki çıxarılıb, yalnız kart qalıb.

**Bilinən boşluqlar / qeyri-müəyyənliklər:**

- Panel sahəsi «Növbəti yenilənmə tarixi» adlanır, sayt isə onu cari dəyərin **dövrü** kimi
  göstərir (miqrasiya şərhində «the date shown next to the current rate»). Ad və ya davranış
  biri digərinə uyğunlaşdırılmalıdır.
- Statistika səhifəsinə saytın menyusundan keçid kodda yoxdur; CMS menyusunda olub-olmadığı
  yoxlanılmalıdır.
- Statistika yalnız cari ili göstərir; keçmiş illər üçün il seçimi yoxdur.
