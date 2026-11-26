# Şəkilli popup (elan banneri) — idarəetmə təlimatı

Bu sənəd cbar.az-da səhifə açılan kimi ekranın ortasında çıxan **elan şəklini** («şəkilli
popup») admin paneldən necə idarə etməyi və onun saytda nə vaxt, hansı dildə, necə
görünəcəyini izah edir. Popup-da yalnız şəkil var: başlıq zolağı, mətn və düymə yoxdur —
elanın bütün mətni şəklin öz içində olmalıdır. Şəklə klik edəndə redaktorun verdiyi ünvan açılır.

> Bu bölmə **Canlı yayımlar** bölməsinin «qardaşıdır»: eyni qaydalarla açılır-bağlanır və
> siyahıda statusu eyni cür dəyişir. İkisi eyni anda aktiv olanda əvvəl canlı yayım açılır (§4.3).

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Media** → **Şəkilli popup-lar** (`/image-popups`) |
| **Sayt (AZ)** | İstənilən səhifə — `https://<sayt>/az/...` |
| **Sayt (EN)** | İstənilən səhifə — `https://<sayt>/en/...` |
| **Saytda yolu** | Ayrıca səhifəsi yoxdur: ziyarətçi sessiyada **ilk açdığı** səhifədə popup avtomatik çıxır |

Eyni anda saytda **yalnız bir** popup göstərilir — aktiv olanların içindən **ən son aktiv
edilən**. Dəyişiklik saytda **ən geci ~10 saniyə** sonra görünür (saytın qısa keşi var); bir dəfə
səhifəni yeniləmək kifayətdir.

---

## 2. Hazırlıq: şəkilləri əvvəlcədən hazırlayın

- Popup-da mətn yazılmır, şəkil olduğu kimi göstərilir. Ona görə **hər dil üçün ayrı şəkil**
  lazımdır: azərbaycanca mətnli şəkil AZ üçün, ingiliscə mətnli şəkil EN üçün.
- Tövsiyə olunan forma — üfüqi, təxminən 2:1 (nümunə ekran şəklində belədir). Masaüstündə
  popup ekran eninin yarısından, hündürlükdə isə ekranın 85%-indən çox olmur; böyük şəkil
  proporsiyası saxlanaraq kiçildilir.
- Formadakı **Şəkil** sahəsi yalnız **Media kitabxanasında artıq olan** faylı seçir — formanın
  içində yeni fayl yükləmək olmur. Əvvəlcə: Sol menyu → **Media kitabxanası** → **Fayl yüklə**.
- Yalnız şəkil faylı qəbul olunur (jpg / png / webp / gif / svg). PDF və ya başqa fayl seçilsə
  saxlama «Media asset must be an image.» xətası verir.

> Eyni fayl ikinci dəfə yüklənsə, sistem onu yenidən saxlamır, mövcud olanı qaytarır
> (tarix/ad köhnə görünə bilər — bu normaldır).

---

## 3. Admin paneldə əməliyyatlar

**Media → Şəkilli popup-lar** səhifəsində siyahı var. Sütunlar: **Başlıq**, **Şəkil** (AZ
şəklinin fayl adı, yoxdursa EN-inki), **Dillər** (hansı dildə şəkil var — `AZ` / `EN` nişanları),
**Yaradılma vaxtı**, **Yenilənmə vaxtı**, **Status**. Ən yeni yazı siyahının başındadır.

### 3.1. Yeni popup əlavə etmək

**Şəkilli popup-lar → «Yeni»**. Forma iki hissədən ibarətdir:

**Ümumi sahələr (dildən asılı deyil):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Başlıq** \* | Elanın adı, məs. «Strategiyanın 2025 icra statusu» | **Saytda görünmür.** Yalnız siyahıda yazını tanımaq üçündür (ən çox 500 simvol). |
| **Aktiv** | ✔ / boş (yeni yazıda **işarəli** gəlir) | İşarəlidirsə yadda saxlanan kimi saytda çıxa bilər (§4.1). Boşdursa heç bir dildə görünmür. |

**Dil üzrə sahələr (AZ və EN tabları ayrıca doldurulur):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Şəkil** \*\* | Media kitabxanasından o dilin şəkli (**Seç**) | Popup-ın özü. `/az`-da AZ tabındakı, `/en`-də EN tabındakı şəkil çıxır. Dilin şəkli yoxdursa o dildə popup **heç açılmır**. |
| **Link** | `https://…` xarici ünvan və ya `/az/…` kimi saytın öz yolu | Şəklə klik edəndə açılan ünvan. Boşdursa şəkil kliklənmir. |
| **Alt mətn** | Şəkildəki mətnin qısa variantı | Ekran oxuyucular üçün; gözlə görünmür. Boşdursa şəkil «dekorativ» sayılır. Ən çox 500 simvol. |

\* **Başlıq** mütləqdir.
\*\* **Şəkil** ən azı bir dildə seçilməlidir — əks halda forma «Şəkil ən azı bir dildə
doldurulmalıdır» xətası verir.

**Link qaydası.** Link yalnız üç cür başlaya bilər: `http://`, `https://` və ya `/`. Başqa hər
şey («www.cbar.az», `//host`, `mailto:` və s.) rədd edilir — xəta həmin dil tabındakı sahənin
altında çıxır: «Link http://, https:// və ya / ilə başlamalıdır». Ən çox 1000 simvol.

- **Saytın öz səhifəsi** → dil prefiksi ilə yazın: AZ tabında `/az/...`, EN tabında `/en/...`
  (sahədəki nümunə belə göstərir). Belə link **eyni tabda** açılır.
- **Xarici ünvan** (`https://...`) **yeni tabda** açılır.
- Hər dilin linki ayrıdır: AZ-da link olub EN-də olmaya bilər — bu xəta deyil.

Sonda **Yadda saxla**.

### 3.2. Mövcud popup-ı redaktə etmək

Siyahıda yazının sətrini açın, dəyişin, **Yadda saxla**. Nəzərə alın:

- **Şəkli dəyişmək**: yeni şəkli əvvəl Media kitabxanasına yükləyin, sonra həmin dil tabında
  **Şəkil → Dəyiş**. Dilin şəklini tam çıxarmaq üçün **Təmizlə** (digər dildə şəkil qalmalıdır).
- **Redaktə popup-ı «yenidən ən öndə» etmir.** Aktiv popup-ın şəklini və ya linkini dəyişmək
  onun saytdakı növbəsini dəyişmir: bir neçə aktiv popup varsa yenə ən son *aktiv edilən*
  göstərilir (§4.1).
- **Artıq bağlamış ziyarətçi** redaktədən sonra popup-ı həmin brauzer sessiyasında yenidən
  görmür — popup eyni yazı sayılır (§4.2). Elanı hamıya «təzədən» göstərmək lazımdırsa, **yeni
  yazı** yaradın.

### 3.3. Statusu dəyişmək (aktiv / qeyri-aktiv)

İki yol var:

- **Siyahıdan, bir kliklə**: **Status** sütunundakı düymə («Aktiv» yaşıl / «Qeyri-aktiv» boz).
  Klik statusu dərhal dəyişir, ekranın küncündə «"…" aktiv edildi» / «"…" qeyri-aktiv edildi»
  bildirişi çıxır. Formanı açmaq lazım deyil.
- **Formadan**: **Aktiv** işarəsi → **Yadda saxla**.

**Qeyri-aktiv** popup saytda heç bir dildə görünmür, amma bütün məlumatı paneldə qalır.
**Qeyri-aktivdən aktivə** keçid popup-ı aktivlər arasında **ən önə** çıxarır: köhnə elanı
yenidən aktiv etsəniz, ondan sonra yaradılmış digər aktiv popup-ı üstələyir.

### 3.4. Popup-ı yalnız bir dildə göstərmək / bir dildən çıxarmaq

Popup saytın bir dilində yalnız **həmin dil tabında şəkil seçilibsə** görünür. Bir dilin şəkli
heç vaxt o biri dildə göstərilmir — əvəzləmə yoxdur.

- Elan yalnız azərbaycanca lazımdırsa — **EN tabında Şəkil seçməyin**: `/az`-da çıxacaq,
  `/en`-də heç nə çıxmayacaq.
- Mövcud popup-ı bir dildən çıxarmaq üçün həmin tabda **Şəkil → Təmizlə** → **Yadda saxla**.

> Diqqət: popup «ən son aktiv edilən» prinsipi ilə **hər dil üçün ayrıca** seçilir. Məsələn,
> A popup-ı yalnız AZ şəkli ilə, ondan sonra B popup-ı yalnız EN şəkli ilə aktiv edilibsə,
> `/az`-da A, `/en`-də B görünəcək.

### 3.5. Popup-ı silmək

Siyahıda **Sil** → təsdiq («"…" qeydi silinsin? Bu əməliyyat geri qaytarıla bilməz»). Yazı və
onun dil məlumatları **birdəfəlik** silinir. Media kitabxanasındakı şəkil silinmir. Əmin
deyilsinizsə, silmək əvəzinə statusu **Qeyri-aktiv** edin (§3.3).

### 3.6. Şəkli Media kitabxanasından silmək

Popup-a bağlı şəkli kitabxanadan silmək **olmur** — sistem «File is attached to content; detach
it first.» xətası verir. Əvvəl popup-da həmin dilin **Şəkil → Təmizlə** (və ya **Dəyiş**) edin,
sonra faylı silin.

---

## 4. Saytda nə və necə görünür

### 4.1. Hansı popup göstərilir

Ziyarətçi hansı səhifəni açırsa açsın (ana səhifə, xəbər, valyuta…), sayt onun dili üçün
**bir** popup seçir:

1. yalnız **Aktiv** olanlar;
2. yalnız **bu dildə şəkli** olanlar;
3. onların içindən **ən son aktiv edilən** (aktiv edilmə vaxtı yoxdursa — ən sonuncu yaradılan).

Heç nə tapılmasa popup çıxmır və səhifə adi qaydada işləyir. Sayt məlumatı serverdə,
~10 saniyəlik keşlə alır: paneldəki dəyişiklik saytda ən geci 10 saniyə və bir yeniləmə sonra
görünür.

### 4.2. Nə vaxt açılır, nə vaxt yox (ziyarətçi tərəfi)

Popup **sessiyada ilk açılan səhifədə** avtomatik açılır: səhifə tünd yarımşəffaf qatla örtülür,
ortada çərçivəsiz şəkil, sağ-yuxarı küncündə kiçik dairəvi ağ **×** düyməsi.

```
┌────────────────────────────────────────────────────┐
│  (tünd fon)                                        │
│          ┌──────────────────────────────┐ (×)      │
│          │                              │          │
│          │     [ elan şəkli — AZ/EN ]   │ ← klik → Link
│          │                              │          │
│          └──────────────────────────────┘          │
└────────────────────────────────────────────────────┘
```

Bağlanma yolları — hamısı eyni sayılır: **×**, **Esc**, tünd fona klik, **şəklə klik** (linkə
keçid).

Bağlananda brauzer bunu **həmin tab-ın sessiyası boyu** yadda saxlayır (brauzerin
`sessionStorage`-ində `cbar:image-popup:dismissed:<id>` qeydi):

| Vəziyyət | Popup çıxır? |
|---|---|
| Sessiyada ilk səhifə | **Bəli** |
| Bağlamadan səhifəni yenilədi (F5) | **Bəli** (qeyd yalnız bağlananda yazılır) |
| Bağladı, sonra F5 / başqa səhifə / başqa dil | Xeyr |
| Şəklə klikləyib keçid etdi, geri qayıtdı | Xeyr (keçid bağlanma sayılır) |
| Yeni brauzer tabı və ya brauzeri bağlayıb açdı | **Bəli** (sessiya təzədir) |
| Redaktor **başqa** popup-ı aktiv etdi (yeni yazı) | **Bəli** — qeyd köhnə yazıya bağlıdır |
| Redaktor eyni popup-ı redaktə etdi, ya da söndürüb yenidən yandırdı | Xeyr — eyni yazı sayılır |

- Şəkil hər hansı səbəbdən yüklənməsə, popup boş çərçivə göstərmir — səssizcə bağlanır və bu
  bağlanma **yadda saxlanmır** (növbəti səhifədə yenidən cəhd edilir).
- Brauzerdə storage bloklanıbsa (məs. bəzi gizli rejimlər), popup çıxır və bağlanır, amma
  bağlanma yadda qalmır — hər səhifədə yenidən çıxa bilər. Bu, saytın xətası deyil.
- Klaviatura və ekran oxuyucu: fokus popup daxilində qalır, Esc bağlayır; oxucu **Alt mətn**-i
  (boşdursa «Elan» sözünü) oxuyur; linkli şəkil «Ətraflı» kimi, xarici link isə əlavə
  «(yeni tabda açılır)» ilə elan olunur.
- Mobil ekranda popup kənarlardan boşluqla sığır; hündür şəkil ekranın 85%-ini aşmır.

### 4.3. Canlı yayım popup-ı ilə eyni anda

Eyni anda həm aktiv **canlı yayım** (Media → Canlı yayımlar), həm də aktiv şəkilli popup ola
bilər. Ziyarətçi heç vaxt ekranda **iki popup** görmür — **növbə canlı yayımındır**:

1. Səhifə açılır → əvvəl canlı yayım popup-ı çıxır.
2. Ziyarətçi onu bağlayır → şəkilli popup **dərhal** açılır (əgər o özü bu sessiyada
   bağlanmayıbsa).
3. Sonrakı səhifələrdə canlı yayım artıq bağlı sayıldığı üçün yalnız şəkilli popup-ın öz qaydası
   işləyir (§4.2).

Şəkilli popup yalnız o halda açılır ki, canlı yayım dialoqu **açıq deyil** və (canlı yayım
yoxdur **və ya** bu sessiyada bağlanıb). Canlı yayımın bağlanması şəkilli popup-ı «bağlanmış»
saymır — qeydlər ayrıdır. Header-dəki «Canlı yayım» düyməsi ilə yayımı sonradan yenidən açmaq
şəkilli popup-a təsir etmir.

---

## 5. Əlaqəli modullar

- **Media kitabxanası** — şəkillər buradan seçilir; popup-a bağlı faylı silmək olmur (§3.6).
- **Canlı yayımlar** — eyni açılma-bağlanma qaydası; növbədə üstündür (§4.3).
- **Ana səhifə blokları → Bannerlər** — başqa şeydir: ana səhifədəki link zolağı. Popup ilə
  əlaqəsi yoxdur, biri o birini əvəz etmir.

---

## 6. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] Siyahıda yazının **Status**-u «Aktiv», **Dillər** sütununda lazımi `AZ` / `EN` nişanları var.
- [ ] **Yeni brauzer tabında** `https://<sayt>/az` açın — AZ şəkli çıxır (10 saniyəyə qədər gözləyin).
- [ ] Yeni tabda `/en` — EN şəkli çıxır (və ya qəsdən heç nə çıxmır).
- [ ] Şəklə klik — düzgün ünvan açılır: saytın səhifəsi eyni tabda, xarici link yeni tabda.
- [ ] **×** ilə bağlayıb başqa səhifəyə keçin — popup yenidən çıxmır.
- [ ] Mobil ölçüdə (brauzeri daraldın) şəkil kəsilmir, × görünür.
- [ ] Köhnə elan artıq lazım deyilsə — **Qeyri-aktiv** edilib (yoxsa iki aktivdən yalnız biri görünəcək və hansı olduğu çaşdıra bilər).

## 7. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Popup saytda çıxmır | Mənim brauzerimdə artıq bağlanıb | **Yeni tabda** və ya gizli pəncərədə açın |
| Popup çıxmır (yeni tabda da) | Status «Qeyri-aktiv», ya da bu dildə şəkil yoxdur | Statusu aktiv edin; həmin dil tabında **Şəkil → Seç** |
| Popup yalnız AZ-da çıxır | EN tabında şəkil seçilməyib | EN tabında **Şəkil → Seç** |
| Başqa elan çıxır, mənimki yox | Bir neçə aktiv popup var, o biri daha gec aktiv edilib | Lazımsızı **Qeyri-aktiv** edin, ya da öz popup-ınızı söndürüb yenidən yandırın (ən önə keçir) |
| Dəyişdim, saytda köhnəsi görünür | Saytın ~10 saniyəlik keşi | Bir az gözləyib səhifəni yeniləyin |
| Şəklə klik işləmir | Həmin dildə **Link** boşdur | O dil tabında Link yazın |
| «Link http://, https:// və ya / ilə başlamalıdır» | Link «www.…» və ya başqa formada yazılıb | Əvvəlinə `https://` əlavə edin, ya da `/az/...` yolu yazın |
| «Şəkil ən azı bir dildə doldurulmalıdır» | Heç bir tabda şəkil seçilməyib | Ən azı bir dildə **Şəkil → Seç** |
| «Media asset must be an image.» | Seçilən fayl şəkil deyil (məs. PDF) | Şəkil faylı seçin |
| Faylı kitabxanadan silə bilmirəm («File is attached to content…») | Fayl hansısa popup-a bağlıdır | Popup-da **Şəkil → Təmizlə/Dəyiş**, sonra silin |
| Formada lazımi şəkli tapmıram | Fayl kitabxanaya yüklənməyib | Əvvəl **Media kitabxanası → Fayl yüklə** |

---

## Əlavə: developerlər üçün

Spec: `specs/009-image-popup/` (spec, plan, `contracts/{admin-api,public-api,ui}.md`,
quickstart). Deploy sırası: **api-cbar-admin** (miqrasiya `0006`) → **api-cbar** →
**web-cbar-admin-new** → **web-cbar-new**.

| Qat | Yer |
|---|---|
| DB | `api-cbar-admin/db/migrations/0006-image-popups.sql` → `image_popups` (`title`, `is_active`, `activated_at`, `created_by`) + `image_popup_translations` (`popup_id`, `locale`, `media_id` → `media_assets` ON DELETE SET NULL, `link` ≤1000, `alt_text` ≤500; UNIQUE `(popup_id, locale)`) |
| Domain | `Cbar.Domain/Entities/ImagePopup.cs` — **hər iki** API-də eyni |
| Admin API | `api-cbar-admin` → `ImagePopupsController`: `GET/POST /api/v1/image-popups`, `GET/PUT/DELETE /{id}`; icazələr `image_popups.read/create/update/delete`; audit `image_popups.create/update/delete` |
| Public API | `api-cbar` → `MediaContentController.GetImagePopups` — `GET /api/v1/image-popups?locale=az\|en`, anonim, massiv **0 və ya 1** element `{ id, imageUrl: "/media/<mediaId>", link, altText }` |
| Admin panel | `web-cbar-admin-new/src/features/image-popups/` (`model/module.ts`, `model/link-rule.ts`, `components/image-popup-status-toggle.tsx`, `components/image-popup-locales.tsx`, `api/image-popups.service.ts`); nav `app/routes/nav.ts` (`imagePopups`, group `media`); i18n `locales/{az,en}/imagePopups.json` |
| Sayt | `web-cbar-new`: `app/[locale]/layout.tsx` (`getImagePopups(locale).catch(() => [])`) → `shell/site-shell.tsx` → `widgets/image-popup/image-popup-dialog.tsx`; `features/image-popup/{api,model}`; bağlanma `shared/lib/popup-dismissal.ts` (prefiks `cbar:image-popup:dismissed`) |
| Testlər | panel `features/image-popups/image-popups.test.tsx`, `model/link-rule.test.ts`; sayt `widgets/image-popup/image-popup-dialog.test.tsx`, `image-popup-coexistence.test.tsx`, `shared/lib/popup-dismissal.test.ts` |

**API qaydaları (admin):**

- `Validate`: `Title` 1–500; naməlum locale → 400; ən azı bir `MediaId` → yoxsa «At least one
  locale must have an image.»; media mövcud olmalı (soft-deleted sayılmır) və `MimeType`
  `image/*`; link `http://` / `https://` / `/` (amma `//` yox), ≤1000; alt ≤500. Boş string-lər
  `null`-a çevrilir.
- `ActivatedAt`: create-də `IsActive ? now : null`; `PUT`-da **yalnız** `false → true` keçidində
  `now` olur — adi redaktə növbəni dəyişmir. Status toggle paneldə PATCH deyil, sətrin tam DTO-su
  ilə `PUT`-dur.
- `PUT` payload-da olmayan locale-in tərcüməsini silir (`ApplyTranslations` → `RemoveAll`).
- `DELETE` hard delete, tərcümələr cascade. `MediaController.Delete` `image_popup_translations`-ı
  yoxlayır → bağlı fayl üçün **409**.

**Public filtr və sıra:** `Locale == locale && Popup.IsActive && MediaId != null && Media != null
&& Media.DeletedAt == null`; sıra `ActivatedAt == null` (null-lar sona), `ActivatedAt DESC`,
`PopupId DESC`; `Take(1)`. Seçim locale üzrə ayrıca aparılır (hər dildə fərqli popup ola bilər).

**Sayt tərəfi:**

- Keş: `server/cached.ts` → `CONTENT_REVALIDATE_SECONDS = 10`, stale-while-revalidate, teq
  `media`. (Spec-in quickstart-ındakı «60 saniyə» köhnədir — 2026-10-14-dən 10 s.)
- Açılma şərti (`useEffect`): `popup` var **və** `!liveOpen` **və** (`liveStreamId === undefined`
  **və ya** canlı yayım `sessionStorage`-də bağlanıb) **və** popup özü bağlanmayıb. `liveOpen`
  `false` olanda effect yenidən işləyir — ona görə canlı yayım bağlanan kimi şəkilli popup açılır.
- `onError` → `setOpen(false)` qeyd yazmadan. Link: `/^https?:\/\//` → `<a target="_blank"
  rel="noopener noreferrer">`, əks halda `next/link`.
- `contracts/ui.md`-dəki «bu səhifədə bağlanıb / `pathname`» köhnədir — 2026-10-22
  clarification-dan sonra bağlanma sessiya boyu və səhifədən asılı deyil; kod belədir.

**Bilinən boşluqlar / qeydlər:**

- Nümayiş tarix aralığı (başlanğıc-bitmə) yoxdur, yalnız aktiv/qeyri-aktiv.
- Səhifə üzrə hədəfləmə yoxdur — popup bütün səhifələrdə eynidir.
- Dil prefiksi olmayan daxili link (`/pages/x`) saytın `proxy.ts`-i ilə default dilə yönlənir;
  EN tabında belə link EN ziyarətçini AZ səhifəyə apara bilər — ona görə prefiks tövsiyə olunur
  (yoxlanılmalıdır).
