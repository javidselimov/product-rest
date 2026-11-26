# Admin UX contract — "Sual-cavab" (web-cbar-admin-new), spec 051

Məqsəd (User Story 6): redaktor HTML bilmədən sual əlavə edir, sıranı bir hərəkətlə dəyişir, dil boşluqlarını görür. Bütün mətnlər i18n (`faq`
namespace, az/en), kit komponentləri, `ModuleConfig` şablonu (R10).

## Menyu

- `app/routes/nav.ts`: yeni qrup `faq` (`NAV_GROUPS`-da `cooperation`-dan sonra, `homepage`-dən əvvəl — saytda kök sırası: … Beynəlxalq əməkdaşlıq,
  İnsan resursları, Məlumatların yayımlanması, **Sual-cavab**), bir bənd `faq` → `/faq`, ikon `ClipboardIcon` (və ya kit-də sual ikonu varsa o).
  Bir bəndli qrup başlıqsız bənd kimi görünür (spec 046 qaydası).
- `specs/046-international-memberships/contracts/admin-nav.md` və `web-cbar-new/docs/*-cms-guide.md`-dəki menyu yolları eyni dəyişiklikdə yenilənir.

## Bölmə tabları (hər üç ekranın başında)

`Suallar` (`/faq`) · `Mövzular` (`/faq/topics`) · `Videolar` (`/faq/videos`) — `sectionTabs`.

## Suallar — `/faq`

- Filtr tabları: "Hamısı" + hər mövzu (`FilterConfig type: 'tabs'`, seçimlər mövzular lookup-ından), axtarış ("Sual mətnində axtar"), status filtri,
  "Tərcümə" filtri ("EN yoxdur" → `missingLocale=en`) — en tərcümə təxirə salındığı üçün redaktor işi buradan izləyir.
- Sütunlar: № (mövzu daxilində), Sual (az, 2 sətrə qədər), Mövzu, Dillər (`Badge`: `AZ`, `EN`; boş dil `EN yoxdur` — `colorPalette` xəbərdarlıq),
  Status (`Badge`).
- "Yeni sual" → `/faq/new`; mövzu tabı seçilibsə `?topicId=` ilə (forma mövzunu əvvəlcədən seçir — `initialValues`).
- Sıra burada dəyişmir (paged cədvəl) — mövzu formunda dəyişir; siyahının üstündə qısa qeyd: "Sıranı dəyişmək üçün mövzunu açın" (link).

## Sual forması — `/faq/new`, `/faq/$id`

| Sahə | Tip | Qeyd |
|---|---|---|
| Mövzu | `select` (searchable, lookup) | məcburi |
| Status | `select` (Dərc olunub / Qaralama) | default "Dərc olunub" (redaktor yazan kimi görünsün) — `defaultValue` |
| Sual (az/en tab) | `textarea` perLocale | ≤ 1000, ən azı bir dil |
| Cavab (az/en tab) | `richtext` perLocale | saytın rich-text redaktoru (cədvəl, link, siyahı, şəkil, YouTube) |

- Dil tabında boş dil üçün nişan ("boş"); başlanmış dildə sual və cavabdan biri boşdursa forma xətası (API 400 ilə eyni mesaj).
- Yadda saxlanmamış dəyişiklik xəbərdarlığı (CRUD şablonu; yoxdursa `useBlocker` ilə bu spec-də əlavə olunur — test ilə).
- Saxladıqdan sonra toast + "Saytda bax" linki (`/{locale}/sual-cavab?topic=<slug>`, sayt ünvanı mühit konfiqindən; yoxdursa link göstərilmir).

## Mövzular — `/faq/topics`

- Sütunlar: ad (az), suallar sayı, dillər, bağlı səhifələr (başlıqlar), status.
- `listExtras`: "Sıranı dəyiş" düyməsi → kit `Dialog` içində `SortableList` (8 mövzu), "Yadda saxla" `PUT /faq/topics/order`.
- Silmə: sualı olan mövzuda API 409 mesajı dialoqda göstərilir.

## Mövzu forması — `/faq/topics/new`, `/faq/topics/$id`

| Sahə | Tip |
|---|---|
| Ad (az/en tab) | `text` perLocale |
| Açar | yalnız oxunur (`detail.slug`), yaradılanda göstərilmir; izah: "Saytda ünvan: …?topic=<açar>" |
| Status | `select` |
| Bağlı səhifələr | kit `Combobox` çoxseçimli, səhifə ağacından başlıq + yol ilə axtarış; izah: "Seçilmiş səhifələrin altında bu mövzuya keçid kartı göstərilir" |

`editExtras` — **"Mövzunun sualları"** kartı: `SortableList` (sürüşdür-burax + yuxarı/aşağı düymələri, hər sətirdə № + sual + dil nişanları + redaktə
linki), sıra dəyişən kimi `PUT /faq/topics/{id}/questions/order` (optimistik yeniləmə, xətada geri qaytarma + toast), "Yeni sual" (`/faq/new?topicId=`).

## Videolar — `/faq/videos`

- Sütunlar: önizləmə (YouTube kiçik şəkli, 96 × 54), başlıq (az), status.
- `listExtras`: "Sıranı dəyiş" (dialoq + `SortableList`).
- Forma: YouTube linki (`text`, Zod: id çıxmalıdır — "YouTube linki tanınmadı"), başlıq (az/en), status; `editExtras` — önizləmə kartı.

## Səhifə forması (mövcud, `features/pages`)

- `managed-sections.ts`: `sual-cavab` → `{ kind: 'link', to: '/faq', group: 'faq', item: 'faq' }` — FAQ səhifəsinin formunda "Məzmun «Sual-cavab»
  bölməsindən idarə olunur" kartı.
- Digər səhifələr: `GET /faq/topics?pageId=` boş deyilsə kart "Bu səhifədə FAQ bloku: Pul siyasəti" + mövzuya link.

## `SortableList` (`shared/ui/sortable-list.tsx`)

- Props: `items`, `getKey`, `renderItem`, `onReorder(nextIds)`, `labelFor(item)` (ekran oxuyucusu üçün ad), `disabled`.
- Sürüşdür-burax: native `draggable` + tutacaq ikonu (`aria-hidden`); klaviatura: hər sətirdə "Yuxarı"/"Aşağı" `IconButton` (`aria-label` adla), kənarda
  disabled. Hər dəyişiklikdən sonra `aria-live="polite"` elanı: "«Pul siyasəti nədir?» 3-cü yerə keçdi".
- Test: rol və `userEvent` ilə (klaviatura yolu), drag hadisəsi `fireEvent.dragStart/drop` ilə — davranış testi (memory: funksional komponent testləri).
