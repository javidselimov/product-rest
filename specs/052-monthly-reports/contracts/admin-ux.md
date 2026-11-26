# Admin UX contract: spec 052 (`web-cbar-admin-new`)

Bölmə `CrudListPage`/`CrudFormPage` üzərində qurulur. Əl ilə yazılmış ekran yoxdur. Yeni Figma kadrı yoxdur.

## Fayllar

```text
src/features/monthly-reports/
  api/monthly-reports.service.ts, keys.ts       # siyahı/detal mühərrikdən, burada yalnız seriyalar (lookup)
  model/schemas.ts                               # rowSchema, detailSchema, seriesSchema (Zod)
  model/constants.ts                             # YEAR_MIN 2000, YEAR_MAX_AHEAD 1, MONTHS_IN_YEAR 12, COLUMN_WIDTH, PERIOD
  model/period.ts (+ test)                       # nextPeriod(year, month), periodLabel(year, month, periodMonths, t)
  model/module.ts                                # createMonthlyReportsModule(series)
src/pages/monthly-reports/index.tsx              # LookupGate (seriyalar) → CrudListPage / CrudFormPage
src/app/routes/index.ts, nav.ts                  # createCrudRoutes('/monthly-reports'), NavGroup `consumer`, NavKey `monthlyReports`
src/shared/crud/types.ts                         # ModuleConfig.newSearch (opsional)
src/features/crud/components/crud-list-page.tsx  # "Yeni" newSearch nəticəsini sorğuya əlavə edir
src/entities/content/ui/locale-badges.tsx        # features/faq-dan köçür (research R13)
src/features/pages/model/managed-sections.ts     # 3 slug + link.search
src/locales/{az,en}/monthly-reports.json, nav.json
src/shared/testing/handlers/monthly-reports.ts   # in-memory store, 409, 400
```

## Siyahı (`/monthly-reports`)

| Element | Davranış |
|---|---|
| Başlıq | "Aylıq hesabatlar" / "Monthly reports". Təsvirdə bunlar yazılır: "Şikayət indeksləri və infoqrafika. Sayt arxivi və son məlumatı buradan qurur." |
| Seriya tabları | `type: 'tabs'`, `series` (açar): "Hamısı" + üç seriya (az adı, qısa etiket i18n-dən: "Bank indeksi", "Sığorta indeksi", "İnfoqrafika") |
| Süzgəclər | il (`number`), status (`statusFilter`) |
| Sütunlar | Seriya (qısa etiket) · Dövr (`periodLabel`, məs. "Sentyabr 2026" və ya "İyun 2025 – May 2026") · Fayllar (`LocaleBadges`; `missingFile` → `Badge colorPalette="red"` "Fayl silinib") · Status (badge) · Dəyişib (`datetime`) |
| "Yeni" | aktiv `series` + (seriya süzülübsə) `newSearch` → `year`, `month` = ilk sətrin növbəti ayı (`nextPeriod`) |
| Boş vəziyyət | "Bu seriyada hələ hesabat yoxdur" |

## Forma (`/monthly-reports/new`, `/monthly-reports/$id`)

| Sahə | Tip | Qayda |
|---|---|---|
| Seriya | `select` (açar) | məcburi; `prefillFromSearch: ['series', 'year', 'month']` |
| İl | `number`, `min` 2000, `max` cari il + 1 | məcburi |
| Ay | `select` (12 ay, az/en i18n), `valueAsNumber` | məcburi |
| Fayl | `media`, `perLocale`, `required`, `mediaNameKey: 'translations.{locale}.mediaName'` | ən azı bir dil (image-popups nümunəsi). Kömək mətni: "en faylı yoxdursa, bu ay ingilis saytında göstərilmir" |
| Status | `select` (mövcud status sahəsi) | defolt `draft` |

- Başlıq sahəsi yoxdur. Formanın altında oxunuş üçün önizləmə yoxdur: başlıq qaydası kömək mətnindədir.
- 409 mühərrikin mövcud server xətası yolu ilə göstərilir (`problem.message`).
- Yadda saxlanılmamış dəyişikliklə çıxanda soruşur (spec 051 `useBlocker`, bütün modullarda var).

## Səhifə formu (`ManagedSectionCard`)

Bu slug-larda kart göstərilir: `bank-xidmetlerinden-istifade-uzre-sikayet-indeksi`, `avto-icbari-sigorta-uzre-sikayet-indeksi`, `infoqrafika`.
- Link "İstehlakçı hüquqları → Aylıq hesabatlar"-a aparır, `search: { series: '<açar>' }` ilə.
- Admin API seriyanı açarla tanıyır, çünki id mühitlər arasında fərqli ola bilər. Ona görə link, tab və forma eyni dəyəri işlədir və çevirmə
  lazım deyil.

## Test (Vitest + RTL + MSW, `functional-component-tests` qaydası)

1. Bank tabında "Yeni" basılır, forma Bank + növbəti ayla açılır, fayl seçilir, yadda saxlanılır, siyahıda yeni sətir görünür.
2. Eyni dövr ikinci dəfə saxlananda 409 mesajı görünür.
3. Fayl seçilmədən saxlama cəhdi validasiya mesajı verir.
4. `missingFile` sətri "Fayl silinib" nişanı ilə görünür.
5. Səhifə 95-in formasında kart Bank süzgəcli siyahıya aparır.
6. `nextPeriod`: Dekabr 2026-dan sonra Yanvar 2027 gəlir. `periodLabel` 12 ay üçün "İyun 2025 – May 2026" verir.
