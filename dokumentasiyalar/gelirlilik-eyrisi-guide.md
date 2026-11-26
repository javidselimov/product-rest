# Gəlirlilik əyrisi — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Gəlirlilik əyrisi»** qrafikini izah edir: admin panelə Excel faylları
necə yüklənir, dəyişiklik saytda harada və necə görünür. Əyri dövlət qiymətli kağızlarının
müddətə görə gəlirliyini göstərir; hər iş günü üçün bir əyri olur.

> Köhnə admin paneldəki kimi, data **əl ilə yazılmır** — hər bölmə üçün hazır Excel (.xlsx)
> faylı yüklənir. Paneldə yaratma/redaktə forması yoxdur: yalnız «Excel-dən yüklə» və tarixə görə
> silmə var.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Maliyyə** → **Gəlirlik əyriləri** (`/yield-curves`); üstdə üç tab: **Əyri**, **Parametrlər**, **Müddətlər** |
| **Sayt (AZ)** | `https://<sayt>/az/statistics` — «Gəlirlik əyrisi» kartı |
| **Sayt (EN)** | `https://<sayt>/en/statistics` |
| **Ana səhifə** | `https://<sayt>/az` → **İcmal göstəricilər** bölməsi → **Gəlirlilik əyrisi** tabı |

Paneldəki üç tab **üç ayrı data dəstidir**, hər biri öz Excel faylı ilə yüklənir və bir-birinə
toxunmur:

| Tab | Nə saxlayır | Nümunə fayl (repo kökündə) | Saytda |
|---|---|---|---|
| **Əyri** | Tarix üzrə əyri nöqtələri: müddət (gün) → gəlirlik (%) | `yieldcurve_2026_10_12.xlsx` | Qrafikin özü |
| **Parametrlər** | Tarix üzrə Nelson–Siegel parametrləri β₀, β₁, β₂, λ | `parametrler_2026_10_12.xlsx` | `/statistics`-də qrafikin altındakı yazı |
| **Müddətlər** | Tarix üzrə 7 standart müddətin (3 ay … 4 il) gəlirliyi | `muddetler_2026_10_12.xlsx` | **Hazırda göstərilmir** (bax §4) |

Yüklənmə **dərhal** yazılır, baxış/təsdiq addımı yoxdur. Sayt API cavablarını **10 saniyə**
keşləyir — dəyişiklik ən geci 10 saniyəyə görünür, səhifəni yeniləmək kifayətdir.

---

## 2. Hazırlıq: Excel fayllarının formatı

Faylların formatı sabitdir, server onu dəqiq yoxlayır. Ümumi qaydalar (üç fayl üçün də):

- Yalnız **.xlsx** (Excel 2007+). `.xls`, `.csv`, adı dəyişdirilmiş fayl qəbul olunmur.
- Ölçü **5 MB-a qədər**.
- Server faylın **açılanda görünən (aktiv) vərəqini** oxuyur. Faylda bir neçə vərəq varsa, saxlamazdan
  əvvəl data olan vərəqə keçin.
- Rəqəmlər **rəqəm xanası** olmalıdır (mətn kimi yazılmış «6,9» qəbul olunmur). Düstur varsa, onun
  hesablanmış nəticəsi götürülür.
- 1-ci sətir başlıq sayılır və **oxunmur** — nə yazıldığının fərqi yoxdur.
- **Fayldakı tarix oxunmur.** Əyri və Müddətlər fayllarının A sütunundakı tarix nəzərə alınmır;
  tarix yükləmə pəncərəsində **Tarix** sahəsində seçdiyinizdir (bax §3.1).

### 2.1. «Əyri» faylı (`yieldcurve_…xlsx`)

| Sütun | Nə var | Yoxlama |
|---|---|---|
| A | Tarix | Oxunmur |
| **B** | Müddət, **gündə** (90, 91, 92 … 1460) | Tam ədəd, 1–32767. Eyni müddət faylda iki dəfə ola bilməz |
| **C** | Gəlirlik, faizlə (6.9, 6.89 …) | Rəqəm; 4 onluq rəqəmə qədər yuvarlaqlaşdırılır |

Data **2-ci sətirdən** başlayır, sətirlərin sayı məhduddur: ən çox **5000** nöqtə. B və C
ikisi də boş olan sətir buraxılır. Nümunə faylda 1371 nöqtə var (90-dan 1460 günə qədər, hər gün).

### 2.2. «Parametrlər» faylı (`parametrler_…xlsx`)

Yalnız **2-ci sətir** oxunur:

| A2 | B2 | C2 | D2 |
|---|---|---|---|
| β₀ | β₁ | β₂ | λ |

Dördü də dolu rəqəm olmalıdır (mənfi ola bilər, məs. β₂ = −9.5262). 6 onluq rəqəmə qədər
yuvarlaqlaşdırılır. 3-cü və sonrakı sətirlər oxunmur.

### 2.3. «Müddətlər» faylı (`muddetler_…xlsx`)

Yalnız **C2:C8** xanaları oxunur, sıra sabitdir:

| Xana | Müddət |
|---|---|
| C2 | 3 ay |
| C3 | 6 ay |
| C4 | 9 ay |
| C5 | 1 il |
| C6 | 2 il |
| C7 | 3 il |
| C8 | 4 il |

B sütunundakı adlar («3 ay», «6 ay» …) yoxlanılmır — sıra xanaya görədir, ona görə sətirlərin
yerini dəyişməyin. Yeddi xananın hamısı dolu olmalıdır. **C9 və aşağıda** rəqəm varsa fayl rədd
edilir («gözləniləndən çox sətir») — bu, səhvən Əyri faylını Müddətlər tabına yükləməkdən qoruyur.

---

## 3. Admin paneldə əməliyyatlar

**Maliyyə → Gəlirlik əyriləri** açılanda **Əyri** tabı görünür. Hər tabda: üstdə qısa izah, sağda
**«Excel-dən yüklə»** düyməsi, altda tarixlər siyahısı (ən yeni tarix yuxarıda, səhifədə 20 sətir).

Siyahı sütunları:

| Tab | Sütunlar |
|---|---|
| **Əyri** | Tarix · Nöqtə sayı · Yüklənib · əməllər (göz — nöqtələrə bax; zibil qutusu — sil) |
| **Parametrlər** | Tarix · β₀ · β₁ · β₂ · λ · Yüklənib · sil |
| **Müddətlər** | Tarix · 3 ay · 6 ay · 9 ay · 1 il · 2 il · 3 il · 4 il · Yüklənib · sil |

### 3.1. Yeni tarixin datasını yükləmək

1. Lazımi taba keçin (Əyri / Parametrlər / Müddətlər) — **hər tab yalnız öz faylını qəbul edir**.
2. **Excel-dən yüklə** düyməsi. Pəncərənin başlığı hansı data yüklənəcəyini və faylın gözlənilən
   formatını yazır (məs. «Əyri nöqtələrini yüklə — Faylın B sütunu müddət (gün), C sütunu
   gəlirlikdir, 2-ci sətirdən başlayır»).
3. **Tarix** — əyrinin tarixi. Standart olaraq **bugünkü gün** durur; lazım olanı seçin. Fayldakı
   tarix oxunmadığı üçün bu sahə mütləq düzgün olmalıdır.
4. **Excel faylı** — faylı sahəyə atın və ya klikləyib seçin («Yalnız .xlsx, 5 MB-a qədər»).
5. **Yüklə**. Uğurlu olanda pəncərə bağlanır, «DD.MM.YYYY tarixi üçün yükləndi» bildirişi çıxır və
   tarix siyahıda görünür.

Tam əyri üçün eyni tarixə **üç fayl** yüklənir: Əyri tabında `yieldcurve_…`, Parametrlər tabında
`parametrler_…`, Müddətlər tabında `muddetler_…`. Ardıcıllığın fərqi yoxdur, amma saytda qrafik
yalnız **Əyri** yükləndikdən sonra çıxır (§4).

### 3.2. Mövcud tarixin üstünə yazmaq

Seçilmiş tarixdə bu tabın datası artıq varsa, **Yüklə** basılanda sarı xəbərdarlıq çıxır:
«… tarixi üçün bu data artıq yüklənib. Fayldakı ilə tam əvəzlənsin?». **Üstünə yaz** — köhnə data
bütünlüklə yenisi ilə əvəzlənir (Əyri tabında həmin tarixin bütün köhnə nöqtələri silinir, yalnız
fayldakılar qalır). **Ləğv et** — heç nə dəyişmir, pəncərə fayl seçiminə qayıdır.

Üstünə yazma yalnız **həmin taba** aiddir: Əyrini yenidən yükləmək Parametrlərə və Müddətlərə
toxunmur.

### 3.3. Əyri nöqtələrinə baxmaq

**Əyri** tabında sətrin sağındakı **göz** ikonu sağdan panel açır: «DD.MM.YYYY — əyri nöqtələri»,
altında cədvəl **Müddət (gün)** / **Gəlirlik (%)**, müddətə görə artan sırada. Yüklənən faylı
yoxlamaq üçün istifadə edin. Parametrlər və Müddətlər üçün ayrıca baxış lazım deyil — dəyərlər
siyahının sütunlarındadır.

### 3.4. Tarixi silmək

Sətirdəki **zibil qutusu** → təsdiq pəncərəsi («… tarixinin bütün əyri nöqtələri silinsin?
Parametrlərə və müddətlərə toxunulmayacaq.») → **Sil**. Silmə **birdəfəlikdir** və yalnız həmin
tabın datasına aiddir. Yenidən lazım olsa faylı yenidən yükləyin.

> Təsdiq mətnində tarix `2026-10-12` (il-ay-gün) formatında görünür, siyahıda isə `12.10.2026`.
> Eyni tarixdir.

### 3.5. Yükləmə xətaları

Xəta pəncərənin içində qırmızı blokda çıxır; fayl yazılmır (yoxlama **tam** keçməyincə heç nə
dəyişmir, yarımçıq yüklənmə olmur).

| Mesaj | Səbəb | Həll |
|---|---|---|
| «Tarix seçin» / «Fayl seçin» | Sahə boşdur | Doldurun |
| «Yalnız .xlsx formatlı fayl yükləmək olar» | Uzantı .xlsx deyil, ya da fayl əslində Excel deyil (məs. adı dəyişdirilmiş .csv) | Excel-də **Fayl → Fərqli saxla → Excel Workbook (.xlsx)** |
| «Fayl çox böyükdür» | 5 MB-dan böyükdür | Artıq vərəq/formatı təmizləyin |
| «Faylda data tapılmadı — düzgün faylı seçdiyinizi yoxlayın» | Gözlənilən xanalar boşdur (Əyri: B/C 2-ci sətirdən; Parametrlər: A2:D2; Müddətlər: C2:C8) | Faylı və aktiv vərəqi yoxlayın; başqa tabın faylını seçmədiyinizə əmin olun |
| «Faylda gözləniləndən çox sətir var — bu bölmənin faylını seçdiyinizi yoxlayın» | Müddətlər tabında C9 və aşağıda rəqəm var (çox güman Əyri faylıdır); Əyri tabında 5000-dən çox nöqtə | Düzgün tabı/faylı seçin |
| «C5 xanası boşdur və ya düzgün rəqəm deyil» | Həmin xana boşdur, mətndir, ya da hədd xaricindədir (gəlirlik < 10000; parametr < 1 000 000; müddət tam ədəd 1–32767) | Excel-də xananı düzəldin |
| «Sətir 15: müddət faylda təkrarlanır» | Əyri faylında eyni gün sayı iki sətirdə var | Təkrarı silin |
| Sarı «… bu data artıq yüklənib» | Tarixdə data var | §3.2 |

---

## 4. Saytda nə və necə görünür

### 4.1. Statistika səhifəsi (`/az/statistics`, `/en/statistics`)

Səhifədə üç kart alt-alta gəlir: **AZIR**, **İnflyasiya** və **Gəlirlik əyrisi**. Gəlirlik kartında:

- **Qrafik** — bir hamar xətt, nöqtələri işarəli. X oxu — müddət **gündə** (fayldakı B sütunu,
  artan sırada: 90, 91, … 1460); Y oxu — gəlirlik, `%` ilə. Üstünə gələndə dəyər göstərilir.
  Hündürlük 320 px.
- **Altındakı kiçik yazı** — əyrinin tarixi (uzun formatda) və, həmin tarixə Parametrlər
  yüklənibsə, «Nelson-Siegel parametrləri: β₀ = …, β₁ = …, β₂ = …, λ = …» (4 onluq rəqəmlə).
  Parametrlər yoxdursa yalnız tarix qalır.

Hansı tarix göstərilir: **Əyri tabında olan ən yeni tarix**. Həmin tarixin Parametrləri varsa yazıya
əlavə olunur; başqa tarixin parametrləri götürülmür. Yəni yeni gün üçün yalnız Parametrlər
yüklənib Əyri yüklənməyibsə, sayt hələ **köhnə** günün əyrisini göstərir.

Boş hallar:

| Vəziyyət | Kartda |
|---|---|
| Əyri tabında heç bir tarix yoxdur | «Bu göstərici üçün məlumat yoxdur» |
| API əlçatan deyil | Ümumi xəta bloku (texniki problem, məzmun deyil) |

**Müddətlər** tabının datası API-dən gəlsə də, sayt onu hazırda **heç bir yerdə göstərmir**. Bu tab
gələcək istifadə üçündür; yükləmək saytda heç nəyi dəyişmir.

### 4.2. Ana səhifə — «İcmal göstəricilər» → «Gəlirlilik əyrisi» tabı

Ana səhifədəki **İcmal göstəricilər** bölməsində **Gəlirlilik əyrisi** adlı tab var. Panelin
başlığının sağında təqvim ikonu ilə əyrinin tarixi, altında eyni qrafik (hündürlük 374 px) və
**«Daha ətraflı»** keçidi → `/statistics`. Burada Nelson–Siegel parametrləri **göstərilmir**.

Əyri tabında heç bir tarix yoxdursa, bu tab ana səhifədə **ümumiyyətlə çıxmır**; API xətasında isə
tab qalır və içində «Bu blok hazırda yüklənə bilmədi» yazılır.

### 4.3. Dil

Data dildən asılı deyil — eyni rəqəmlər `/az` və `/en`-də göstərilir. Yalnız kartın başlığı, ox
yazıları və tarix formatı saytın interfeys mətnlərindən tərcümə olunur; paneldən dəyişmir.

> Qeyd: saytda statistika səhifəsində başlıq «Gəlirlik əyrisi», ana səhifədə isə «Gəlirlilik əyrisi»
> yazılıb; admin menyuda «Gəlirlik əyriləri». Üçü də eyni şeydir; yazılış fərqi interfeys
> mətnlərindədir (dəyişmək üçün texniki komandaya bildirin).

---

## 5. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] **Əyri** tabında yeni tarix siyahıdadır, **Nöqtə sayı** gözlənilən qədərdir (göz ikonu ilə bir
  neçə nöqtəni yoxlayın).
- [ ] **Parametrlər** tabında eyni tarix var, β₀ … λ dəyərləri fayldakı ilə eynidir.
- [ ] (İstəyə bağlı) **Müddətlər** tabında eyni tarix var.
- [ ] `/az/statistics` — qrafik yeni tarixə keçib, altdakı yazıda tarix və parametrlər düzgündür
  (10 saniyəyə qədər gözləyin, yeniləyin).
- [ ] `/az` ana səhifə — «Gəlirlilik əyrisi» tabında tarix yenidir.
- [ ] `/en/statistics` — eyni qrafik ingiliscə başlıqla.

## 6. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Saytda hələ köhnə tarix görünür | Əyri yüklənməyib (yalnız Parametrlər/Müddətlər yüklənib), ya da 10 saniyəlik keş | **Əyri** tabına `yieldcurve_…` faylını yükləyin; bir az gözləyib yeniləyin |
| Qrafik səhv günə yazılıb | Yükləmə pəncərəsində **Tarix** səhv seçilib (fayldakı tarix oxunmur) | Səhv tarixi silin (§3.4), düzgün tarixlə yenidən yükləyin |
| Qrafikin altında parametrlər yoxdur | Həmin tarix üçün Parametrlər yüklənməyib | Parametrlər tabında **eyni tarixlə** yükləyin |
| «Faylda data tapılmadı» | Yanlış tabın faylı, ya da aktiv vərəq boşdur | §2, §3.5 |
| «Gözləniləndən çox sətir» Müddətlər tabında | Əyri faylı seçilib | `muddetler_…` faylını seçin |
| «B2 xanası … düzgün rəqəm deyil» Əyri tabında | B sütununda gün sayı yox, mətn və ya «3M» kimi işarə var | Müddət gün sayı ilə tam ədəd olmalıdır |
| Ana səhifədə «Gəlirlilik əyrisi» tabı yoxdur | Əyri tabı tam boşdur | Ən azı bir tarix yükləyin |
| Sayt «Bu blok hazırda yüklənə bilmədi» / xəta bloku | API əlçatan deyil | Texniki komandaya bildirin |
| Düymə «Excel-dən yüklə» görünmür və ya 403 | İstifadəçinin rolunda gəlirlilik əyrisi icazəsi yoxdur | **İdarəetmə → İstifadəçilər**-də rolu yoxlayın |

---

## Əlavə: developerlər üçün

Commit-lər: `2ea391b` (api-cbar-admin), `af9f0d5` (api-cbar), `d75bd54` (web-cbar-admin-new). Deploy
sırası: **api-cbar-admin** (miqrasiya `0011`) → **api-cbar** → **web-cbar-admin-new**.

| Qat | Yer |
|---|---|
| DB | `api-cbar-admin/db/migrations/0011-yield-curve-datasets.sql` → `yc_yields` (`curve_date`, `period` int 1–32767 gün, `yield` numeric(8,4), UNIQUE(curve_date, period)), `yc_parameters` (`curve_date` UNIQUE, `beta0..2`, `lambda` numeric(12,6)), `yc_periods` (`curve_date` UNIQUE, `three_month … four_year` numeric(8,4)). Köhnə `yield_curves*` cədvəlləri hələ qalır (datası köçürülüb) |
| Domain | `Cbar.Domain/Entities/Statistics.cs` → `YcYield`, `YcParameters`, `YcPeriods` — **hər iki** API-də eyni |
| Admin API | `api-cbar-admin` → `Controllers/YieldCurvesController.cs`, `/api/v1/yield-curves`: `GET yields` (paged, tarix üzrə qruplaşdırılmış: `curveDate`, `pointsCount`, `updatedAt`), `GET yields/{date}`, `POST yields/import`, `DELETE yields/{date}`; eyni dəst `parameters` və `periods` üçün (`GET`, `POST …/import`, `DELETE …/{date}`). İcazələr `yield_curves.read/create/delete`; hər yazı `audit_log`-a `yield_curves.import_*` / `delete_*` kimi düşür (entity id `yyyyMMdd`) |
| Import | `multipart/form-data`: `date` (`yyyy-MM-dd`, string), `file` (.xlsx, ≤5 MB, imza yoxlanır), `overwrite` (bool). Oxuyucu `Validation/XlsxSheetReader.cs` — BCL zip + XML, aktiv vərəq (`workbookView/@activeTab`), düsturun cached dəyəri, ədədlər PHP `round` kimi (15 əhəmiyyətli rəqəm → `decimals`) |
| Xəta kodları | `date_required`, `file_required`, `not_xlsx`, `file_too_large`, `no_rows`, `too_many_rows`, `invalid_value` (`details.row/column`), `duplicate_period`; `409 date_exists` (`details.count`). Hamısı `problem+json`, `message` + `code` |
| Public API | `api-cbar` → `StatsController`: `GET /api/v1/yield-curves/latest` (ən yeni `yc_yields.curve_date`), `GET /api/v1/yield-curves/{date}` (nöqtə yoxdursa 404). Cavab `{ curveDate, parameters|null, yields:[{period:string, yield}], periods|null }` — `period` köhnə kontrakta görə **string** qalır |
| OpenAPI | hər iki API-də `openapi/paths/statistics.yaml`, `components/schemas/statistics.yaml` (`YieldCurve*`) |
| Admin panel | `web-cbar-admin-new/src/features/yield-curves/` (`model/module.ts` — üç `defineModule`, `canCreate/canEdit=false`, `rowKey=curveDate`; `model/schemas.ts`; `components/yield-curve-import-dialog.tsx`; `components/yield-points-sheet.tsx`; `api/yield-curves.service.ts`), `pages/yield-curves/index.tsx`; route-lar `app/routes/index.ts` → `yieldCurveRoute` (`/yield-curves`, `/parameters`, `/periods`); menyu `app/routes/nav.ts` (`finance` qrupu); mətnlər `locales/{az,en}/yieldCurves.json` |
| Sayt | `web-cbar-new`: `features/stats/api/stats.api.ts` (`getYieldCurveLatest`, `cachedJsonOrNull`, 10 s) → `features/stats/model/series.ts` (`yieldSeries`: categories = `period`, bir `line` seriyası, `smooth`, `symbols`, `unit '%'`) → `views/statistics/loader.ts` (caption: `formatLongDate` + NS parametrləri `toFixed(4)`) → `views/statistics/index.tsx` (`ChartCard`, 320 px); ana səhifə `views/home/loader.ts` (`yieldBlock`) → `widgets/home-cards/statistics-panels.tsx` (`YieldCurvePanel`, 374 px). Zod sxemi `features/stats/model/schemas.ts` → `yieldCurveSchema` `periods`-u oxumur (passthrough) |
| Testlər | panel: `features/yield-curves/yield-curves.test.tsx`, MSW `shared/testing/handlers/yield-curves.ts`; sayt: `views/finance.test.tsx`, `features/stats/model/series.test.ts` |

**Davranış qeydləri:**

- Əyri importu: `XlsxSheetReader.Read(buffer, 2, ∞, {B,C})`; B və C boş sətir buraxılır; `MaxPoints = 5000`;
  `period` tam ədəd 1–32767; `yield` `|v| < 10000`, 4 onluq; dublikat `period` → `duplicate_period`.
  Yazı bir tranzaksiyada: `ExecuteDelete` + `AddRange`.
- Parametrlər: yalnız 2-ci sətir, A–D, `|v| < 1 000 000`, 6 onluq; mövcud sətir update olunur.
- Müddətlər: `C2:C8`; C-də dolu olan ilk `Row > 8` → `too_many_rows`; B etiketləri yoxlanılmır.
- Faylın A sütunundakı tarix heç bir importda oxunmur — tarix yalnız formdan gəlir.
- `latest` = `yc_yields`-dəki ən yeni tarix; `parameters`/`periods` həmin tarixə `SingleOrDefault`.
- Admin siyahısı 20 sətir/səhifə, `OrderByDescending(CurveDate)`; `supportsSearch` yoxdur.

**Bilinən boşluqlar / qeyri-müəyyənliklər:**

- `periods` (Müddətlər) saytda heç yerdə render olunmur — sayt sxemi onu oxumur. Ana səhifə
  panelinin şərhində Figma-dakı «Parametrlər» qutusunun da göstərilmədiyi qeyd olunub.
- Silmə təsdiqində tarix `rowLabel = curveDate` ilə `yyyy-MM-dd` formatında çıxır, siyahı sütunu isə
  `dd.MM.yyyy` göstərir.
- «Gəlirlik» / «Gəlirlilik» yazılışı sayt (`home.json` vs `finance.json`) və panel (`nav.json` vs
  `yieldCurves.json`) arasında fərqlidir.
- `/statistics` səhifəsinə saytın əsas menyusundan keçid kodda tapılmadı (yoxlanılmalıdır); hazırda
  birbaşa URL və ana səhifə panellərindəki «Daha ətraflı» ilə açılır.
- Köhnə `yield_curves`, `yield_curve_yields`, `yield_curve_parameters` cədvəllərini silən miqrasiya
  hələ yazılmayıb.
