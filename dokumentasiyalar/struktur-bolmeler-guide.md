# Struktur bölmələr (Şöbələr) — idarəetmə təlimatı

Bu sənəd cbar.az-ın **struktur bölmələrini** (departamentlər, şöbələr) admin paneldən necə idarə
etməyi və dəyişikliyin saytda harada, necə görünəcəyini izah edir. Hər bölmənin saytda öz
səhifəsi var: ad, məlumat kartı (rəhbər və təsvir) və hər dil üçün ayrıca **Əsasnamə** sənədi.

Bölmələr həm də **Struktur sxemi** kartlarının bağlandığı qeydlərdir: sxemdə departament kartına
klikləyəndə açılan səhifə buradan gəlir (bax `struktur-sxemi-guide.md`).

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Təşkilat** → yuxarıdakı tab **Şöbələr** (`/organization/divisions`) |
| **Sayt (AZ) — siyahı/sxem** | `https://<sayt>/az/organization?section=divisions` |
| **Sayt (EN) — siyahı/sxem** | `https://<sayt>/en/organization?section=divisions` |
| **Sayt — bölmənin səhifəsi** | `https://<sayt>/az/organization/divisions/<ID>` (ID siyahının birinci sütunudur) |
| **Saytda yolu** | Haqqımızda → Təşkilati struktur və idarəetmə → **Struktur bölmələr** (sol menyu) → sxemdə kart və ya siyahıda bölmənin adı |

Dəyişiklik saytda **ən geci ~10 saniyəyə** görünür (sayt məlumatı qısa müddət keşləyir); səhifəni yeniləmək kifayətdir.

---

## 2. Hazırlıq: əsasnamə faylını əvvəlcədən yükləyin

Formadakı **Şəkil** və **Əsasnamə** sahələri yalnız **Media kitabxanasında artıq olan** faylı
seçməyə imkan verir — formanın içindən yeni fayl yükləmək olmur. Qayda ərazi idarələrindəki ilə
eynidir (`erazi-idareleri-guide.md` §2): əvvəlcə **Media kitabxanası → Fayl yüklə**, əsasnamə
**hər dil üçün ayrı fayl** (adətən PDF).

> Əsasnamə üçün şəkil faylı (jpg/png) seçməyin — saytda fayl sətri əvəzinə kiçik şəkil
> önizləməsi çıxar. Sənəd formatlarından istifadə edin (PDF, DOCX və s.).

---

## 3. Admin paneldə əməliyyatlar

### 3.1. Yeni bölmə əlavə etmək

**Təşkilat → Şöbələr → «Yeni» düyməsi** («Yeni şöbə» forması). Forma iki kartdan ibarətdir:

**Ümumi sahələr (dildən asılı deyil):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Sıra** | Rəqəm (0, 10, 20…), boş qoymaq olmur | Siyahıda bölmələrin ardıcıllığı. Kiçik rəqəm yuxarıda; bərabər olanda əvvəl yaradılan yuxarıda. |
| **Aktiv** | ✔ / boş (yeni qeyddə ✔) | Boşdursa bölmə saytda **heç bir dildə** görünmür və səhifəsi açılmır (silinmir, gizlənir). |
| **Şəkil** | Media kitabxanasından şəkil | **Hazırda saytda heç yerdə göstərilmir** — sayt API-si bu sahəni vermir. Doldurmaq məcburi deyil. |

**Tərcümələr (AZ və EN tabları ayrıca doldurulur):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Ad** \* | Məs. «Maliyyə idarəetməsi departamenti» | Siyahıda bölmənin adı, bölmə səhifəsinin başlığı, brauzer tabının adı; sxem kartında da (kartın öz adı yazılmayıbsa) bu ad çıxır. |
| **Təsvir** | Rich text: rəhbər, əlaqə, mətn | Bölmə səhifəsindəki məlumat kartı. «Direktor: Ad Soyad» kimi sətirlər etiket/dəyər cütü kimi, qalan mətn adi məzmun kimi göstərilir — qaydalar `web-cbar-new/docs/about-cms-guide.md` §5-dədir. |
| **Əsasnamə** | Media kitabxanasından **o dilin** sənədi | Məlumat kartının altında «Əsasnamə» fayl sətri. Seçilməyibsə sətir göstərilmir. Seçicinin yanında seçilmiş faylın adı yazılır. |

\* **Ad** ən azı bir dildə mütləq doldurulmalıdır, əks halda forma «Ad ən azı bir dildə
doldurulmalıdır» xətası verir.

Media sahəsində düymələr: **Seç** (fayl yoxdursa), **Dəyiş** / **Təmizlə** (fayl varsa); açılan
pəncərə «Fayl seç» Media kitabxanasıdır. Sonda **Yadda saxla**.

### 3.2. Mövcud bölməni redaktə etmək

Siyahıda (sütunlar: ID, Ad, Sıra, Status; axtarış və filtr yoxdur) bölmənin sətrini açın, sahəni
dəyişin, **Yadda saxla**. Siyahıda ad AZ tərcüməsindən, o yoxdursa EN-dən götürülür. Ən çox rast
gələn hallar:

- **Rəhbər dəyişdi** → AZ və EN tablarında **Təsvir**dəki «Direktor: …» sətrini yeniləyin.
- **Yeni əsasnamə qəbul olundu** → yeni PDF-ləri Media kitabxanasına yükləyin, sonra hər dil
  tabında **Əsasnamə → Dəyiş** ilə yenisini seçin. Köhnə fayl kitabxanada qalır.
- **Əsasnaməni saytdan götürmək** → həmin dil tabında **Əsasnamə → Təmizlə**, Yadda saxla. Fayl
  kitabxanadan silinmir.
- **Ardıcıllığı dəyişmək** → **Sıra** rəqəmlərini yenidən verin; araya bölmə salmaq asan olsun
  deyə 10, 20, 30… addımı tövsiyə olunur. (Struktur sxemi qurulubsa saytda bu sıra görünmür —
  orada kartların öz sırası var, bax §4.1.)
- **Bölmənin adı dəyişdi** → yalnız burada dəyişin; ona bağlı sxem kartı adı avtomatik götürür
  (kartın öz **Ad** sahəsi boşdursa).

### 3.3. Bölməni müvəqqəti gizlətmək

**Aktiv** işarəsini götürün → Yadda saxla. Bölmə hər iki dildə siyahıdan itir, səhifəsi «Səhifə
tapılmadı» verir, ona bağlı **sxem kartı da altındakı kartlarla birlikdə gizlənir**. Bütün
məlumat paneldə qalır; geri qaytarmaq üçün işarəni yenidən qoyun. Siyahıda status «Qeyri-aktiv»
kimi görünür.

### 3.4. Bölməni yalnız bir dildə göstərmək / bir dildən çıxarmaq

Bölmə saytın bir dilində yalnız **həmin dilin tabı doldurulubsa** görünür (siyahıda da, öz
səhifəsində də).

- Bölmə ingiliscə hələ hazır deyilsə — **EN tabını tam boş saxlayın**: `/az`-da görünəcək,
  `/en`-də nə siyahıda olacaq, nə də səhifəsi açılacaq. Sxemdə ona bağlı kart `/en`-də
  **kliklənməyəcək** (kartın öz EN adı varsa kart görünür, yoxdursa kart da gizlənir).
- Mövcud bölməni bir dildən çıxarmaq üçün həmin dilin **bütün** sahələrini (Ad, Təsvir,
  Əsasnamə) təmizləyin və saxlayın — o dilin tərcüməsi silinir.

> ⚠ Bir dildə yalnız Əsasnamə seçib və ya Təsvir yazıb **Adı boş** saxlamayın: o dil «dolu»
> sayılır və bölmə saytda həmin dildə başlıqsız çıxır. Ya Ad da yazın, ya da tabı tam boş saxlayın.
> Təsvir redaktorunda yazıb silmisinizsə, boş paraqraf qala bilər və tab «dolu» sayıla bilər
> (yoxlanılmalıdır) — belə halda yenidən açıb təsvirin həqiqətən boş olduğuna baxın.

### 3.5. Bölməni silmək

Siyahıda **Sil** → təsdiq. Bölmə və onun bütün dil məlumatları (əsasnamə bağlantıları daxil)
**birdəfəlik** silinir, geri qaytarmaq olmur. Media kitabxanasındakı şəkil və PDF-lər silinmir.

Ona bağlı **sxem kartı silinmir**, sadəcə bağlantısı qırılır: kartın öz adı varsa saytda qalır,
amma kliklənmir; öz adı yoxdursa kart altındakılarla birlikdə saytdan itir
(`struktur-sxemi-guide.md` §6). Əmin deyilsinizsə, silmək əvəzinə **Aktiv** işarəsini götürün (§3.3).

### 3.6. Faylı Media kitabxanasından silsəniz

- **Şəkil** sahəsində seçilmiş faylı kitabxana silməyə **qoymur**: «Fayl məzmuna bağlıdır —
  əvvəlcə onu məzmundan ayırın». Əvvəl bölmə formasında **Şəkil → Təmizlə**.
- **Əsasnamə** faylı isə silinə bilir. Saytda sətir sadəcə yox olur, xəta yaranmır. Paneldə
  seçicinin yanındakı fayl adı itir; bu halda formanı olduğu kimi saxlamaq istəsəniz
  «Media asset not found» xətası alırsınız — həmin dil tabında **Əsasnamə → Təmizlə** və ya yeni
  fayl seçin, sonra saxlayın.

---

## 4. Saytda nə və necə görünür

### 4.1. «Struktur bölmələr» səhifəsi (`/organization?section=divisions`)

Səhifənin görünüşü **Struktur sxemi**nin qurulub-qurulmamasından asılıdır:

| Vəziyyət | Nə görünür |
|---|---|
| Sxemdə ən azı bir kart saytda görünür | Yalnız **interaktiv sxem** (+ «Struktur bölmələr» CMS səhifəsinin sənədləri). Bölmələrin düz siyahısı **göstərilmir**; bölməyə sxemdəki departament kartından keçilir. |
| Sxem boşdur | CMS səhifəsinin şəkli və sənədləri, altında **bölmələrin siyahısı**: iki sütunlu (dar ekranda bir sütun) kartlar, hər birində bölmənin adı və sağda ox; klik bölmənin səhifəsini açır. Sıra — **Sıra** rəqəmi. |
| Sxem boşdur, aktiv bölmə də yoxdur | «Bu bölmə üçün məlumat yoxdur» |
| Bölmələr API-dən alınmadı | Ümumi xəta bloku — məzmun problemi deyil, texniki komandaya bildirin |

Sxemdə hansı kartın hansı bölməyə bağlandığı **Təşkilat → Struktur sxemi**də kartın
**Bağlantı → Struktur bölmə** sahəsi ilə verilir (`struktur-sxemi-guide.md` §2–3).

### 4.2. Bölmənin səhifəsi (`/organization/divisions/<ID>`)

**Breadcrumb:** … → Struktur bölmələr → *Bölmənin adı*. Sol menyuda «Struktur bölmələr» bəndi
seçili qalır. Başlıq — **Ad**.

```
┌──────────────────────────────────────────────────────┐
│  Direktor                        ← Təsvirdəki         │
│  Rzayev Samir Eyvaz oğlu           «Direktor: …»      │
│                                                       │
│  Qalan təsvir (adi mətn, siyahılar, cədvəllər…)       │
└──────────────────────────────────────────────────────┘
          ↓ 40 px
┌──────────────────────────────────────────────────────┐
│  📄  Əsasnamə                              245 KB    │  ← o dilin faylı
└──────────────────────────────────────────────────────┘
```

- **Məlumat kartı** Təsvirdən qurulur: «Etiket: dəyər» şəklindəki paraqraflar (etiket 40
  simvola qədər, linksiz) kartın yuxarısında etiket/dəyər sətirləri kimi, qalan hər şey onların
  altında adi məzmun kimi. Təsvir tamamilə boşdursa kart **heç göstərilmir** — yalnız başlıq (və
  varsa əsasnamə) qalır.
- **Əsasnamə sətri**: ad həmişə sabit «Əsasnamə» / «Regulation» etiketidir (faylın adı yox),
  sağda faylın ölçüsü, klik faylı yeni tabda açır. `/az`-da AZ tabında, `/en`-də EN tabında seçilən
  fayl açılır. Seçilməyibsə sətir yoxdur.
- Bölmə deaktivdirsə, silinibsə və ya həmin dildə tərcüməsi yoxdursa səhifə **«Səhifə
  tapılmadı»** (404) verir.

---

## 5. Sol menyudakı «Struktur bölmələr» linki və ümumi sənədlər

Sol menyudakı bənd və sxemin yanındakı ümumi sənədlər («Mərkəzi Bankın təşkilatı strukturu» və s.)
**Şöbələr** modulundan deyil, **Səhifələr** ağacındakı «Struktur bölmələr» səhifəsindən gəlir —
onun **Menyu linki** sahəsində `/organization?section=divisions` yazılıb. Bu sahəni dəyişməyin və
silməyin. Ümumi sənədləri əlavə etmək / dəyişmək: **Səhifələr → həmin səhifə → Sənədlər** kartı
(`about-cms-guide.md` §4). Hər bölmənin **öz** əsasnaməsi isə yalnız **Təşkilat → Şöbələr**
formasındakı **Əsasnamə** sahəsidir.

---

## 6. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] `/az/organization/divisions/<ID>` açılır, başlıq düzgündür, «Direktor» sətri kartda ayrıca çıxır.
- [ ] «Əsasnamə» sətri var və **o dilin** faylını açır; `/en/…`-də EN faylı açılır (və ya qəsdən yoxdur).
- [ ] `/en/organization/divisions/<ID>` — ingiliscə məlumat düzgündür və ya 404 verir (EN qəsdən boşdursa).
- [ ] Struktur sxemi qurulubsa — sxemdə bu bölmənin kartı var və kliklə düzgün səhifə açılır.
- [ ] Sxem qurulmayıbsa — `/az/organization?section=divisions` siyahısında bölmə yerindədir, sırası düzgündür.

## 7. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Bölmə saytda heç yerdə görünmür | **Aktiv** işarəsi yoxdur | İşarəni qoyun |
| Bölmə yalnız AZ-da görünür, EN-də 404 | EN tabı boşdur | EN tabını doldurun (ən azı Ad) |
| Siyahıda bölmələr yoxdur, yalnız sxem var | Struktur sxemi qurulub — düz siyahı qəsdən gizlənir | Bölməyə sxemdən kart bağlayın (`struktur-sxemi-guide.md` §3.1) |
| Sxemdəki kart bu bölməyə keçmir | Kart bölməyə bağlanmayıb, ya da bölmənin bu dildə tərcüməsi yoxdur | Kartın **Bağlı qeyd**ini yoxlayın; tərcüməni doldurun |
| «Əsasnamə» sətri yoxdur | O dil üçün sənəd seçilməyib və ya fayl kitabxanadan silinib | Həmin dil tabında **Əsasnamə → Seç** |
| EN səhifədə AZ sənədi açılır | EN tabında AZ faylı seçilib | EN tabında ingiliscə PDF-i seçin |
| Əsasnamə əvəzinə kiçik şəkil çıxır | Sənəd kimi şəkil faylı seçilib | PDF/DOCX seçin |
| «Direktor» ayrıca sətir kimi yox, adi mətn kimi çıxır | Paraqrafda link var, etiket uzundur və ya «:» yoxdur | `about-cms-guide.md` §5 formatına salın |
| Formada lazımi faylı tapmıram | Fayl kitabxanaya yüklənməyib | Əvvəl **Media kitabxanası → Fayl yüklə** |
| Saxlayanda «Media asset not found» | Seçilmiş fayl kitabxanadan silinib | Sahəni **Təmizlə** və ya yeni fayl seçin |
| Şəkli kitabxanadan silə bilmirəm | Şəkil bölməyə bağlıdır | Bölmə formasında **Şəkil → Təmizlə**, sonra silin |
| Şəkil seçmişəm, saytda görünmür | Sahə hazırda saytda istifadə olunmur | Normaldır (bax §3.1) |

---

## Əlavə: developerlər üçün

| Qat | Yer |
|---|---|
| Admin modul | `product-rest/web-cbar-admin-new/src/features/organization/model/modules.ts` → `divisionsModule`; sxemlər `model/schemas.ts` → `divisionSchema`; etiketlər `src/locales/az/organization.json` |
| Admin API | `api-cbar-admin` → `OrganizationDivisionsController` — `GET/POST /api/v1/organization/divisions`, `GET/PUT/DELETE /{id}`; icazələr `Organization.Read/Create/Update/Delete`; hər yazı `audit_log`-a `organization_divisions.*` kimi düşür |
| Public API | `api-cbar` → `OrganizationController.GetDivisions` — `GET /api/v1/organization/divisions?locale=az\|en`; filtr `IsActive` + həmin locale-də tərcümə; sıra `SortOrder, Id`; cavabda `id, name, description, regulation{mediaId, originalName, mimeType, sizeBytes, url}` — **`mediaId` (Şəkil) verilmir** |
| Sayt | `web-cbar-new/src/views/division/{loader.ts,index.tsx}` (Figma `1003:12461`); siyahı/sxem `views/organization/loader.ts` (`divisionsBody`) → `views/organization/index.tsx` (`OrgChartSection` / `DivisionsSection`); route `app/[locale]/(content)/organization/divisions/[id]/page.tsx`; fakt sətirləri `features/about-content/model/parse.ts` → `parseFacts` |
| DB | `organization_divisions` (`media_id`), `organization_division_translations` (`name`, `description`); əsasnamə ayrıca `organization_division_translation_details` (`translation_id`, `regulation_media_id`, miqrasiya `0016`, commit `407ed4c`) |

- Tək şöbə üçün public endpoint yoxdur — səhifə siyahını alıb `id` ilə tapır; tapılmazsa 404.
- Admin forması bütün dil sahələri boş olan locale-i payload-a qoşmur; `PUT` payload-da olmayan
  locale-in tərcüməsini silir (`ApplyTranslations` → `RemoveAll`). Ad üçün serverdə boşluq
  yoxlaması yoxdur — boş `name` qəbul olunur.
- `MediaExistsAsync` şəkil + hər locale-in əsasnaməsini bir sorğuda yoxlayır; media soft-delete
  (`deleted_at`) olduğundan silinmiş id → 400 «Media asset not found».
- `MediaController.Delete`-in «istifadədədir» yoxlaması `organization_divisions.media_id`-ni
  əhatə edir, `organization_division_translation_details.regulation_media_id`-ni **yox** — ona
  görə əsasnamə silinə bilir, şəkil yox.
- `0016`: translations cədvəlinə FK yalnız `REFERENCES` icazəsi olan mühitdə əlavə olunur;
  olmayan yerdə details sətrini controller tərcümə ilə birlikdə silir. `cbar_web_ro`-ya SELECT
  miqrasiyada verilir. Deploy sırası: **api-cbar-admin** (0016) → **api-cbar** → frontendlər.
- Bölmə silinəndə `org_chart_nodes.division_id` `ExecuteUpdateAsync` ilə `NULL` edilir (0015-in
  FK qoya bilmədiyi mühitlər üçün).
