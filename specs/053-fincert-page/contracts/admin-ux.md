# Admin UX contract — FinCERT bölməsi və sol menyu aktivliyi (web-cbar-admin-new)

## 1. Sol menyu

- Yeni bənd `fincert` (`/fincert`), qrup `fincert`; tək ekranlı qrup başlıqsız bənd kimi görünür (spec 046). Yer: `faq`-dan sonra, `homepage`-dən əvvəl.
  `nav.json` az "FinCERT" / en "FinCERT", təsvir az "Missiya, istiqamətlər, əlaqə, RFC-2350 və üzvlüklər".
- `specs/046-international-memberships/contracts/admin-nav.md` sıra cədvəli eyni dəyişiklikdə yenilənir; redaktor təlimatlarında menyu yolu "FinCERT".

## 2. Ekranlar (SectionTabs: "Ümumi", "Fəaliyyət istiqamətləri", "Beynəlxalq üzvlüklər")

### 2.1 `/fincert` — Ümumi (xüsusi forma)

- Kart "Əlaqə": E-poçt, Telefon (dildən asılı deyil).
- Kart "Hesabat portalı": Portal ünvanı (dildən asılı deyil); az/en tablarında Başlıq, Təsvir.
- Kart "Missiya": az/en tablarında mətn sahəsi (`Textarea`, sətir sonu = paraqraf).
- Kart "RFC-2350": az/en tablarında media seçici (yalnız sənəd növləri, mövcud media picker) və "və ya link" sahəsi; kömək mətni: "Fayl seçilibsə
  link göstərilmir".
- "Yadda saxla" (bir `PUT`), uğurda toast; server xətası sahələrin altında. Yadda saxlanılmamış dəyişikliklə çıxışda soruşur (`useBlocker`, CRUD
  formaları kimi). Yükləmə və xəta vəziyyətləri (`LookupGate`/mövcud forma skeleton-u).
- RHF + Zod; dil tabında xəta varsa tab başlığında işarə (mövcud CRUD forma qaydası).

### 2.2 `/fincert/directions` — `ModuleConfig`

- Siyahı sütunları: №, Başlıq (az, yoxdursa en), Dillər (az/en nişanları; yarımçıq dil xəbərdarlıq rəngində), Status, Yenilənib. Süzgəc: status.
  Başlıqda "Sıranı dəyiş" (`SortableList` dialoqu, spec 051 `reorder-dialog` nümunəsi; hər hərəkət dərhal `PUT …/order`, polite live region).
- Forma: Status; az/en tablarında Başlıq (`Input`), Mətn (`RichTextEditor`). Ən azı bir dil tam.

### 2.3 `/fincert/memberships` — `ModuleConfig`

- Siyahı: Loqo (kiçik önizləmə), Ad, Nişan, Status. "Sıranı dəyiş".
- Forma: Status, Loqo (media seçici, yalnız şəkil), Link; az/en tablarında Ad, Təsvir (`Textarea`), Nişan (`Input`, kömək: "məs. 2026-cı ildən tam hüquqlu
  üzv").

## 3. Səhifə formasında bölmə aktivliyi (FR-009, FR-010, research R9)

| Ekran | Aktiv sol menyu bəndi | Açıq qrup |
|---|---|---|
| `/pages`, `/pages/new` | Səhifələr | — |
| `/pages/{id}`, səhifə idarə olunmur | Səhifələr | — |
| `/pages/{id}`, `managedSectionFor(slug)` = `kind: 'note'` (554) | Səhifələr | — |
| `/pages/{id}`, `kind: 'link'` (FinCERT, 121, 122, KSM, 130, FAQ, 95, 96, 93 və `-copy` qaralamaları) | bölmənin bəndi (`fincert`, `ifiOrganizations`, `memorandums`, `csrProjects`, `releaseSchedule`, `faq`, `monthlyReports`) | bölmənin qrupu |
| Səhifə yüklənir (slug hələ bilinmir) | Səhifələr | — |

- Desktop sidebar və mobil `Sheet` eyni `Sidebar` komponentidir — ikisi də eyni aktivliyi göstərir.
- `aria-current="page"` aktiv bəndə keçir (ekran oxuyucusu "Səhifələr"-i cari ekran kimi oxumur).
- Səhifə formasından çıxanda override təmizlənir; başqa route-da route uyğunluğu bərpa olunur.
- `MANAGED_SECTIONS`-ə `fincert: { kind: 'link', to: '/fincert', group: 'fincert', item: 'fincert' }` əlavə olunur; formadakı keçid kartı ("Bu
  səhifənin məzmunu FinCERT bölməsindədir") mövcud komponentlə görünür.

## 4. Testlər (Vitest + RTL + MSW, istifadəçi davranışı)

- Sidebar: `/pages/{id}` FinCERT səhifəsi MSW ilə yüklənəndən sonra "FinCERT" bəndi `aria-current="page"`, "Səhifələr" yox; 122 üçün "Memorandumlar"
  aktiv və "Beynəlxalq əməkdaşlıq" qrupu açıq; adi səhifədə "Səhifələr" aktiv; formadan `/pages`-ə qayıdanda override yoxdur.
- Ümumi forma: yanlış e-poçt → sahə xətası, yadda saxlanılmır; uğurlu `PUT` body-si kontraktla eynidir; çıxışda soruşur.
- İstiqamətlər: yarımçıq dil → xəta; sıranı dəyiş → `PUT …/order` gedir.
