# Research: Admin API-də sistemli input validation və səhifələmə limitləri

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Tarix**: 2026-10-05

Bütün sətir istinadları `product-rest/api-cbar-admin/` kökünə nisbidir, 2026-10-05 (`9194e08`)
vəziyyətinə görə.

## R1 — Bu gün nə var: binding, `[ApiController]` və gizli `Required`

**Faktlar**

- 32 controller sinfinin hamısında `[ApiController]` var. Ona görə model binding və ya
  model validation uğursuz olanda MVC action-ı çağırmadan **avtomatik** 400
  `application/problem+json` `ValidationProblemDetails` qaytarır (`ModelStateInvalidFilter`).
- `Cbar.AdminApi.csproj`-da `<Nullable>enable</Nullable>`. MVC null olmayan reference tipli
  property/parametrlərə **gizli `[Required]`** əlavə edir (`SuppressImplicitRequired…` heç yerdə
  söndürülməyib): JSON-da olmayan və ya `null` olan `string Email` bu gün də 400 verir.
  `[Required]`-in default-u `AllowEmptyStrings = false`-dır — `""` və `"   "` də rədd olunur.
  **Qeyri-müəyyən**: bunun dictionary **dəyərlərinə** (`Translations["az"].Title`) də tətbiq
  olunub-olunmadığı lokalda SDK olmadan yoxlana bilmir; review "Title boş ola bilər" deyir,
  konfiqurasiya isə əksini göstərir. Dizayn bu suala bağlı deyil: tərcümələr açıq `[Required]`
  ilə filterdə yoxlanır (R5), nəticə hər iki halda eynidir. Faktiki bugünkü davranış
  quickstart §1-də (baseline) `test` mühitində qeyd olunur.
- `string?` olan başlıqlar (məs. `BannerTranslationDto.Title`, sütun `NULL`) bu gün heç bir
  halda yoxlanmır (bax data-model.md).
- Bəzi controller-lər öz yoxlamasını artıq edir: `ImagePopupsController.Validate`
  (`:122-157` — locale açarları `db.Locales`-ə qarşı, uzunluqlar, link sxemi),
  `InflationController.SaveSettings` (`:86-92`). Hamısı `{ message }` qaytarır.
- `currency_rates.rate`-də `CHECK (rate > 0)` var (`0001:266`) — `<= 0` məzənnə bu gün
  saxlanılmır, amma 500 verir; yəni problem məlumat yox, cavabdır.
- Query-də `int page`/`int pageSize`-a `abc` və ya `int`-i aşan dəyər gəlsə binding uğursuz olur
  və eyni avtomatik 400 qayıdır. Spec-in "rəqəm olmayan / `int` aşan" edge case-ləri **artıq**
  500 vermir; yalnız düzgün tam ədədlər (0, mənfi, çox böyük) problemdir.
- OpenAPI artıq bu formanı sənədləşdirir: `components/responses.yaml#/ValidationFailed`,
  `#/BusinessRule` (iki media tipi: problem+json və ya `{ message }`),
  `components/schemas/common.yaml#/ValidationProblemDetails`.
- Panel (`web-cbar-admin-new/src/shared/api/types.ts:5-9, 69-98`) üç formanın hamısını oxuyur:
  `message ?? (errors ? firstFieldError ?? title : title)`; `errors` açarlarını sahə adına
  çevirir (`Translations` → `translations`, `$.status` → `status`). CRUD forması
  (`features/crud/components/crud-form-page.tsx:143-156`) yalnız **dil üzrə olmayan** sahələrin
  xətasını sahənin altına qoyur, qalanını (`message`) formanın üst xətası kimi göstərir.

**Nəticə**: 400 üçün artıq bir "rəsmi" forma var — `ValidationProblemDetails`. Yeni forma
icad etmək lazım deyil. 8b-nin işi əl ilə yazılmış `{ message }` 400-lərini və yeni qaydaları
**bu** formaya yığmaqdır.

## R2 — Validation mexanizmi: DataAnnotations, FluentValidation yox

**Decision**: DataAnnotations (`System.ComponentModel.DataAnnotations`) + `IValidatableObject`
(sahələrarası qaydalar üçün) + bir async action filter (locale açarları, R5). Yeni NuGet yoxdur.

**Rationale**

- `[ApiController]` DataAnnotations-ı avtomatik işlədir və nəticəni R1-dəki formada qaytarır.
  Bütün xətalar bir cavabda toplanır (SC-004) — action-a heç nə əlavə etmək lazım deyil.
- Record-ların primary constructor parametrlərindəki atributlar (`[MaxLength(200)] string Title`)
  MVC tərəfindən tanınır (ASP.NET Core 5+). DTO-lar bu gün positional record-dur — forma dəyişmir.
- `Dictionary<string, TDto>` dəyərlərini MVC özü də gəzir, amma dictionary üçün yaratdığı
  ModelState açarının forması (`Translations[az].Title` və ya indeksli `Translations[0].Value.Title`)
  lokalda SDK olmadan təsdiqlənə bilmir, atribut mesajı isə locale-i bilmir. Ona görə
  tərcümələr MVC-nin avtomatik gəzintisindən çıxarılır (`[ValidateNever]` `Translations`
  parametrində) və R5-dəki filter onları özü yoxlayır — açar və mesaj deterministikdir (FR-013).
- Konstitusiya: yeni runtime dependency yalnız spec ilə və əsaslandırılaraq. Lazım deyilsə,
  əlavə edilmir.

**Alternatives considered**

- *FluentValidation*: async qaydalar (locale-in DB-dən yoxlanması) və DI üçün daha rahatdır.
  Amma avtomatik MVC inteqrasiyası (`FluentValidation.AspNetCore`) rəsmi olaraq deprecated-dir;
  tövsiyə olunan yol hər action-da `await validator.ValidateAsync(dto)` çağırmaqdır — ~60 yazma
  action-ında əl ilə çağırış, unudulması asan. Üstəlik yeni dependency və 67 DTO üçün ayrıca
  validator sinfi. Qazanc (async) yalnız bir qayda üçündür (locale) və R5 onu başqa yolla həll edir.
- *Əl ilə `if`-lər controller-lərdə*: bugünkü vəziyyət; sistemli deyil, review-un tənqidi budur.

**Qeyd — atribut hədəfi iki cürdür**:

- **MVC-nin yoxladığı DTO-lar** (top-level gövdə, `List<>` sətirləri): **parametr** atributu
  (`[MaxLength(500)] string Title`). `[property: …]` əlavə etmək olmaz — MVC record-da atribut həm
  parametrdə, həm property-də olanda xəta atır.
- **Tərcümə DTO-ları** (filter `Validator.TryValidateObject` ilə yoxlayır, R5): **`[property: …]`**.
  `Validator` yalnız property-lərdəki atributları görür, constructor parametrlərini yox. Bu
  DTO-lar `[ValidateNever]` arxasında olduğu üçün MVC onları görmür və yuxarıdakı xəta yaranmır.

Səhv hədəf build-i sındırmır, qayda isə səssizcə işləmir — tasks-da yoxlama bəndi var.

## R3 — `PagingQuery`: forma, default-lar və hədlər

**Decision**

```text
PagingQuery  — [FromQuery] ilə bağlanan record: int? Page, int? PageSize
  .Resolve(int defaultPageSize) → PageWindow(Page, PageSize, Skip)
     Page     = Page < 1 or null → 1;          Page > 100_000 → 100_000
     PageSize = PageSize < 1 or null → default; PageSize > 100 → 100
     Skip     = (Page - 1) * PageSize           // ≤ 99_999 × 100 < int.MaxValue
```

- Hər list action-da `[FromQuery] int page = 1, [FromQuery] int pageSize = N` →
  `[FromQuery] PagingQuery paging`, sonra `var w = paging.Resolve(N);` və
  `.Skip(w.Skip).Take(w.PageSize)`, cavabda `page = w.Page, pageSize = w.PageSize` (FR-004).
- Endpoint-ə xas default (20/24/50) action-da qalır — bu gün də orada yazılıb, OpenAPI də
  hər list üçün öz `pageSize` default-unu sənədləşdirir (`components/parameters.yaml:2-3`).
- Fayl: `src/Cbar.AdminApi/Validation/PagingQuery.cs` (yeni qovluq, R8).

**Rationale**

- `api-cbar` artıq `Math.Clamp(page, 1, 100_000)` və `Math.Clamp(pageSize, 1, 100)` istifadə
  edir (`api-cbar/src/Cbar.WebApi/Controllers/LawsController.cs:22-23` və s.). Eyni hədlər iki
  API-də eyni məna daşıyır; 100_000 ofset daşmasının qarşısını alır (spec edge case).
- Fərq: `api-cbar` `pageSize < 1`-i 1-ə sıxır, spec (FR-002) default-a qaytarır. `pageSize=0`
  "ölçü verilməyib" kimi oxunur; 1 qeydlik səhifə heç vaxt istənilən nəticə deyil. `api-cbar`
  bu spec-in əhatəsindən kənardır, dəyişdirilmir.
- Nullable `int?`: query-də `pageSize` olmaması ilə `pageSize=0` eyni nəticə verir, default
  bir yerdə — `Resolve`-un arqumentində — yaşayır.
- Query parametrlərinin adı (`page`, `pageSize`) dəyişmir — record property adları
  case-insensitive bağlanır. Panel və OpenAPI üçün kontrakt eynidir.

**Alternatives considered**

- *Statik helper* `Paging.Clamp(ref page, ref pageSize, default)`: daha az dəyişiklik, amma
  review "ortaq record" deyir və record gələcəkdə sıralama/axtarış parametrləri üçün yer verir.
- *Rədd etmək (400)*: spec clamp seçib (Assumptions); panel və köhnə URL-lər sınmasın.
- *`[Range]` atributları record-da*: 400 verərdi, clamp yox — FR-002-yə zidd.

## R4 — 400 cavabının forması və `message`

**Decision**: `ApiBehaviorOptions.InvalidModelStateResponseFactory` bir dəfə `Program.cs`-də
dəyişdirilir: standart `ValidationProblemDetails` (`type`, `title`, `status: 400`, `errors`,
`traceId`) saxlanılır və ona **`message`** extension-u əlavə olunur.

- `message` = ilk 3 xəta mesajının `"; "` ilə birləşməsi; daha çoxu varsa sonuna
  `" (+N more)"`. Mesajlar özləri sahəni və dili adlandırır: tərcümə xətalarına filter
  `"[az] "` prefiksi qoyur (`"[az] The Title field is required."`), məzənnə xətası valyuta
  kodunu yazır — panelin üst xətası mənalı olsun (FR-014).
- `errors` açarları: top-level sahələr üçün MVC-nin öz açarları (`Email`, `RoleId`);
  tərcümələr üçün filterin qurduğu `Translations[az].Title`; siyahı sətirləri üçün
  `IValidatableObject`-in qaytardığı `Rates[2].Rate`.
  Panel `toFieldName` ilə ilk hərfi kiçildir — top-level sahələr (`email`, `roleId`) bu gün
  də formada sahənin altında görünür.
- Controller-də DB-yə baxmaq tələb edən 400-lər (məs. "Media asset not found.", "Unknown
  currency codes") `ModelState.AddModelError(key, msg); return ValidationProblem();` olur.
  `ControllerBase.ValidationProblem()` eyni factory-dən keçir — tək forma (FR-015).
- Mesaj dili ingiliscədir — API-nin bütün mövcud mesajları kimi; panel lokalizasiyası ayrıca.

**Rationale**: Panel `message`-i birinci oxuyur; `message` olmadan dil üzrə sahələrin xətası
yalnız `firstFieldError` kimi (birinci açar) görünərdi. `errors` xəritəsi RFC 9457 extension-u
kimi standartdır və #7-nin hədəflədiyi ProblemDetails ailəsinə aiddir.

**#7 ilə münasibət**: #7 hələ spec-lənməyib. Bu plan 400-ün formasını **müəyyən edir**, #7 isə
DB xətalarını (`23505` → 409, `23503`/`22001` → 400) xəritələyəndə 400 üçün eyni factory-ni
çağırmalıdır. Spec-in Assumptions bəndi ("iki forma yaradılmayacaq") bu yolla təmin olunur. 409
və 404-ün formasına bu plan **toxunmur** — o, #7-dir.

**Alternatives considered**

- *`message` olmadan saf `ValidationProblemDetails`*: panel dil üzrə sahələrin xətasını yalnız
  ilk açarla göstərir; çoxlu səhvdə qalanlar itir (SC-004 pozulur).
- *Öz `{ message, errors }` formamız*: ikinci forma; R1-dəki mövcud standartdan imtina.

## R5 — Locale açarlarının DB-yə qarşı yoxlanması

**Decision**: `TranslationsValidationFilter` — qlobal `IAsyncActionFilter`, `Order = -2001`
(`ModelStateInvalidFilter`-in `-2000`-indən **əvvəl**). Action arqumentlərindən
`IHasTranslations` interfeysini həyata keçirənləri tapır və hər biri üçün iki iş görür:

1. Locale açarlarını `locales` cədvəlindəki `is_active = true` kodlarla müqayisə edir; uyğun
   gəlməyən hər açar üçün
   `ModelState.AddModelError("Translations[ru]", "Unknown or inactive locale 'ru'.")`.
2. Hər tərcümə dəyərini `Validator.TryValidateObject(value, ctx, results, validateAllProperties: true)`
   ilə yoxlayır (atributlar tərcümə DTO-sunun üstündədir) və hər nəticəni
   `Translations[{locale}].{Member}` açarı, `"[{locale}] "` prefiksli mesajla yazır.

3. `IHasTranslations.RequiresTranslation` `true`-dursa və lüğət boşdursa —
   `Translations`: `"At least one translation is required."` (bu gün ~30 action-da əl ilə
   yazılmış eyni yoxlama; `Translations` `[ValidateNever]` olduğu üçün atribut kimi yazıla
   bilməz). Default interfeys üzvü `true`; `BannerUpsertDto` onu `MediaId is null` kimi,
   `PageAssetAttachDto` `false` kimi təyin edir (data-model.md).

Sonra `ModelStateInvalidFilter` bütün xətaları (top-level atributlar + locale + tərcümə
sahələri) **bir** 400-də qaytarır. `ImagePopupsController.Validate`-in öz locale yoxlaması
(`is_active`-ə baxmır) filterlə əvəz olunur. `Translations` parametri `[ValidateNever]` ilə işarələnir ki,
MVC eyni dəyərləri ikinci dəfə, başqa açarla yoxlamasın (R2).

- DB sorğusu yalnız arqumentdə tərcümə olan sorğularda, bir dəfə, keşsiz:
  `SELECT code FROM locales WHERE is_active`. Yazma sorğuları nadirdir; keşsiz olduğu üçün
  yeni aktivləşdirilən dil dərhal qəbul olunur (US3.2).
- Müqayisə ordinal və dəqiqdir — `AZ`, `" az"` rədd olunur (US3.3).
- `IHasTranslations` hər tərcüməli DTO-ya `: IHasTranslations` kimi açıq əlavə olunur
  (`TranslationEntries => Translations.Select(kv => KeyValuePair.Create(kv.Key, (object)kv.Value))`,
  bax data-model.md §4). Refleksiya ilə "Translations adlı
  property axtarmaq" əvəzinə açıq interfeys — yeni DTO-da unutmaq tasks-da yoxlama bəndidir.

**Rationale**: Atribut (`ValidationAttribute`) sinxrondur və DB-yə çıxış üçün sinxron sorğu
tələb edərdi; filter async-dir, DI-dən `CbarDbContext` alır və nəticəni eyni ModelState-ə
yazır — format eyni qalır.

**Alternatives considered**

- *Kodda sabit `["az", "en"]`*: FR-008 qadağan edir.
- *Singleton keş (TTL)*: lazımsız mürəkkəblik; yeni dilin qəbulunu TTL qədər gecikdirir.
- *Yalnız DB FK-ya güvənmək*: bu gün 500 verir (#7 onu 400-ə çevirsə də, qeyri-aktiv dil FK-dan
  keçir və "görünməyən tərcümə" problemi qalır).

**Edge case qərarı (spec-də açıq qalmışdı)**: qeyri-aktiv dildə mövcud tərcüməni geri göndərən
redaktə də 400 alır. Bu gün hər iki dil aktivdir, hal praktik deyil; dil deaktiv ediləndə
panel o dilin tabını göstərməməlidir — o, panel tərəfi işidir.

## R6 — Sahə uzunluqlarının mənbəyi

**Decision**: Hər `[MaxLength(n)]` dəyəri `db/migrations/0001…0006`-dakı `varchar(n)` ilə
**eyni** götürülür (FR-009); `text` sütunlarına limit qoyulmur (spec edge case: rich-text).
Plan inventarı (data-model.md) hər sahə üçün mənbə migration-u göstərir. Uyğunsuzluğun
qarşısını almaq üçün tasks-da "limitləri sxemlə tutuşdur" yoxlama bəndi var
(`information_schema.columns` sorğusu ilə test mühitində, quickstart §5).

**Rationale**: Mənbə sxemdir; EF modelində `HasMaxLength` ya yoxdur, ya da natamamdır (R9).
Kodda limit sxemdən böyük olsa DB xətası qalır (#7 tutur), kiçik olsa legitim məzmun rədd
olunur — hər ikisi bərabərlik ilə aradan qalxır.

**Alternatives considered**: EF modelindən runtime-da oxumaq (`IProperty.GetMaxLength()`) —
model sxemi tam əks etdirmir və `Cbar.Domain`-ə dəyişiklik tələb edərdi (iki kopya).

## R7 — Sabit qaydalar: məzənnə, email, başlıq

- **Məzənnə** (`CurrencyRateItemDto.Rate`): `> 0`. Qayda `CurrencyRateSheetDto`-nun
  `IValidatableObject.Validate`-indədir, sətir atributunda yox: atribut mesajı valyuta kodunu
  bilmir. Hər səhv sətir üçün açar `Rates[i].Rate`, mesaj `"Rate for USD must be greater
  than 0."` (US4.1, FR-010). Yuxarı hədd sütunun `numeric(p,s)` dəqiqliyindən götürülür (R9) —
  aşan dəyər bu gün 500 verir. Bir səhv sətir bütün vərəqi rədd edir (bugünkü
  "dublikat/naməlum kod" qaydaları kimi).
- **Email**: `[EmailAddress]` — praktik yoxlama (bir `@`, iki tərəfi boş deyil); spec-in
  "RFC-nin tam qrammatikası yox" fərziyyəsinə uyğundur. Yaratma və redaktədə (FR-011).
- **Başlıq / əsas ad**: tərcümə DTO-larında `string? Title` olan yerlər `string Title`-a
  keçmir (JSON forması və nullable semantika dəyişərdi); əvəzinə `[Required]` (boş və boşluq
  rədd) + `[MaxLength]`. Gizli `Required` artıq olan `string` sahələrinə yalnız `[MaxLength]`
  əlavə olunur (FR-007). Hansı sahənin "əsas ad" olduğu resurs-resurs data-model.md-dədir.
- **Trim**: dəyər dəyişdirilmir, yalnız tam boşluq boş sayılır (spec edge case) —
  `[Required]`-in davranışı ilə eyni.

## R8 — Kod harada yaşayır

**Decision**: yeni qovluq `src/Cbar.AdminApi/Validation/`:

| Fayl | Məzmun |
|---|---|
| `PagingQuery.cs` | `PagingQuery`, `PageWindow` (8a) |
| `ValidationResponse.cs` | `InvalidModelStateResponseFactory` + `message` (R4) |
| `TranslationsValidationFilter.cs` | `IHasTranslations`, filter (R5) |

DTO-lar yerində qalır (controller fayllarında, bugünkü kimi) — atributlar onlara yazılır.
Service qatı (#21) bu spec-in işi deyil.

**8a ayrıca yığılır**: `PagingQuery.cs` + 13 list action + OpenAPI. `Validation/` qovluğunun
qalanı 8b-dir. 8a ayrıca MR/commit kimi deploy oluna bilər.

## R9 — Sahə inventarı (DTO → sütun → qayda)

Tam inventar [data-model.md](./data-model.md)-dədir; bu bölmə onun necə çıxarıldığını
qeyd edir: hər yazma action-ının `[FromBody]`/`[FromForm]` DTO-su, DTO-nun hansı entity
sütununa köçürüldüyü (controller kodu), sütunun tipi/uzunluğu/`NOT NULL`-u (`db/migrations`),
mövcud əl ilə yoxlamalar (dəqiq mesaj və sətir ilə) və `product-host` `rules()` qarşılığı.
Hər sətirdə **Təsdiq** sütunu var — FR-012 və SC-006: inventar istifadəçi tərəfindən
təsdiqlənməmiş 8b implementasiyası başlamır.
