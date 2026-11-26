# Admin UX contract — işçi məqalələri və səhifə menyu sahələri (web-cbar-admin-new)

## 1. Sol menyu

- Yeni qrup `publications` yaranır. Mətni az "Nəşrlər və tədqiqatlar", en "Publications and research"-dür.
  - Yeri `consumer`-dən sonra, `faq`-dan əvvəldir. Bu, saytın footer sırasıdır (`web-cbar-new/src/shell/nav.ts`).
  - Qrupda bir bənd var: `workingPapers` (`/working-papers`), az "İşçi məqalələri", en "Working papers".
  - Tək bəndli qrup başlıqsız bənd kimi görünür (spec 046 `navEntries`). Menyu yolu "İşçi məqalələri" olur. Spec ikinci bənd gətirmir.
- Bunlar eyni dəyişiklikdə yenilənir: `specs/046-international-memberships/contracts/admin-nav.md` sıra cədvəli və sidebar/router testlərində bağlı sətir sayı.

## 2. `/working-papers` — `ModuleConfig` (`features/working-papers/model/module.ts`)

### Siyahı

- Sütunlar: Nömrə (`02/2025`), Başlıq (az, yoxdursa en), Dillər (az/en nişanları), Status (`Badge`), Yenilənib.
- Filtrlər: İl (`number`), Status (`select`). Axtarış (`supportsSearch`) başlıqda axtarır. `listEnvelope: 'paged'`, `pageSize` 20.
- "Yeni" düyməsi aktiv il filtrini yeni formaya ötürür (`prefillFromSearch: ['year']`).
- Boş, yüklənmə və xəta vəziyyətləri CRUD şablonunun öz vəziyyətləridir.

### Forma

Ümumi sahələr (dildən asılı olmayan):

| Sahə | Tip | Qayda / kömək |
|---|---|---|
| Nömrə | `number`, 1–99 | "İl daxilində sıra: 02/2025-də 2" |
| İl | `number` | 1990 – gələn il |
| Məqalənin dili | `select`: Azərbaycan dili / İngilis dili / Digər | |
| JEL kodları | `text` | "Vergüllə: C22, E53, E58" — hər biri hərf + 1–2 rəqəm |
| Status | mövcud status sahəsi | |

Dil tabları (az / en):

| Sahə | Tip | Qayda / kömək |
|---|---|---|
| Başlıq | `text`, 500 | ən azı bir dildə vacib |
| Müəlliflər | `text` | "Vergüllə ayırın"; başlıq doludursa vacib |
| Xülasə | `textarea` | sətir sonu yeni paraqraf olur |
| Açar sözlər | `textarea` | "Vergüllə ayırın" |
| PDF fayl | `media`, `mediaAccept: 'document'`, `mediaNameKey` | şəkillər seçicidə deaktivdir |

Formanın davranışı:
- Vergüllü sahələr `buildPayload`-da massivə bölünür: trim edilir, boş və təkrar elementlər silinir. `parseDetail`-də `", "` ilə birləşir.
- Server xətaları sahənin altında görünür (`errors["translations.en.authors"]` → en tabındakı Müəlliflər). Xətalı dil tabının başlığında işarə var.
- Saxlanmamış dəyişikliklə çıxanda panel soruşur (`useBlocker`, mövcud CRUD qaydası).
- Mətnlər `locales/{az,en}/workingPapers.json` faylındadır və `shared/i18n/index.ts`-də qeydiyyatdan keçir. `check:i18n` iki dili tutuşdurur.

## 3. Səhifə forması — menyu sahələri (`features/pages`)

### "Saytın menyusunda" kartı (`menu-visibility-card.tsx`, `model/menu-visibility.ts`)

Bugünkü "Sol menyuda göstər" bayrağı (spec 041) bir seçim qrupuna çevrilir: native radio, kit `radio-group`.

| Seçim | `showInSideNav` | `showInDropdownNav` |
|---|---|---|
| Bütün menyularda | true | true |
| Yalnız açılan menyularda (sol menyuda yox) | false | true |
| Menyularda yox | false | false |

Qaydalar:
- Səhifə bölmə kökündədirsə (dropdown qaydası kökə şamil olmur) ikinci seçim deaktiv olur və kömək mətni göstərir.
- Heç vaxt seçilməmiş səhifədə showInDropdownNav null-dur, radio effektiv dəyərdən (showInSideNav) seçilir.
- Saxlanılmış qeyri-standart cüt (`true` + `false`) gəlirsə kart "Yalnız sol menyuda" deyə məlumat verir. Redaktor seçim edənə qədər dəyər dəyişmir.
- Kartın "Saytın menyusunda" xülasəsi (`menuVisibility()`) yeni qaydanı əks etdirir: `isInDropdownNav` = `showInDropdownNav ?? showInSideNav`.

### Menyu qrupu (dil tablarında)

- Sahə: "Menyu qrupu", `text`, 120 simvol. Kömək mətni: "Açılan menyuda eyni qrupu olan bacı səhifələr bir yerdə göstərilir. Saytın yeni menyusunda
  görünəcək".
- 054-də sayt bu sahəni göstərmir, ona görə kömək mətni bunu açıq deyir (spec 055).
- Göndərilməyən dəyər saxlanılır (MSW `handlers/pages.ts` merge qaydası genişlənir).

### İdarə olunan bölmə

- `managed-sections.ts`: `'isci-meqaleler-silsilesi': { kind: 'link', to: '/working-papers', group: 'publications', item: 'workingPapers' }`.
  Açar az slug-dır, `-copy` atılır.
- Nəticədə səhifə formasında "Məqalələr bu bölmədədir" kartı görünür, sol menyuda "İşçi məqalələri" işarələnir (spec 053 `use-managed-nav`).
- Mətnlər `pages.json` `managedSection.workingPapersText` açarındadır.

## 4. Testlər (Vitest + MSW, funksional)

- **Siyahı.** Filtr və axtarış sorğu parametrlərinə düşür. "Yeni" düyməsi ili ötürür.
- **Forma.**
  - Vergüllü sahə massiv kimi göndərilir və geri birləşir.
  - Server 409 xətası nömrə sahəsinin altında görünür.
  - en tabındakı xəta tab başlığında işarələnir.
  - PDF seçicidə şəkil deaktivdir.
  - Saxlanmamış dəyişikliklə çıxanda təsdiq soruşulur.
- **Səhifə forması.**
  - Üç radio seçimi düzgün cütü göndərir.
  - Göndərilməyən `menuGroup` saxlanılır.
  - İşçi məqalələri səhifəsində idarə olunan bölmə kartı görünür və sol menyuda "İşçi məqalələri" işarələnir.
- MSW handler-ləri `shared/testing/handlers/working-papers.ts` və `pages.ts`-dədir. Fikstürlər real kontrakt formasındadır.
