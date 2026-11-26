# Ərazi idarələri — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Ərazi idarələri»** bölməsini (Mərkəzi Bankın regional ofisləri) admin
paneldən necə idarə etməyi və dəyişikliyin saytda harada, necə görünəcəyini izah edir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Təşkilat** → yuxarıdakı tab **Ofislər** (`/organization/offices`) |
| **Sayt (AZ)** | `https://<sayt>/az/organization?section=offices` |
| **Sayt (EN)** | `https://<sayt>/en/organization?section=offices` |
| **Saytda yolu** | Haqqımızda → Təşkilati struktur və idarəetmə → **Ərazi idarələri** (sol menyu) |

Saytda hər ofis bir **kart** kimi görünür: solda binanın fotosu, sağda ad, ünvan, telefon,
rəhbər və «Əsasnamə» düyməsi. Dəyişiklik saytda **ən geci ~10 saniyəyə** görünür (sayt məlumatı
qısa müddət keşləyir); səhifəni yeniləmək kifayətdir.

---

## 2. Hazırlıq: faylları əvvəlcədən yükləyin

Formadakı **Foto** və **Əsasnamə** sahələri yalnız **Media kitabxanasında artıq olan** faylı
seçməyə imkan verir — formanın içində yeni fayl yükləmək olmur. Ona görə əvvəlcə:

1. Sol menyu → **Media kitabxanası** → **Fayl yüklə**.
2. Binanın fotosunu yükləyin (jpg / png / webp).
3. Əsasnaməni yükləyin — **hər dil üçün ayrı fayl** (adətən PDF): azərbaycanca və ingiliscə.

> Eyni fayl ikinci dəfə yüklənsə, sistem onu yenidən saxlamır, mövcud olanı qaytarır
> (tarix/ad köhnə görünə bilər — bu normaldır).

---

## 3. Admin paneldə əməliyyatlar

### 3.1. Yeni ofis əlavə etmək

**Təşkilat → Ofislər → «Yeni» düyməsi.** Forma iki hissədən ibarətdir:

**Ümumi sahələr (dildən asılı deyil):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Sıra** | Rəqəm (0, 10, 20…) | Kartların ardıcıllığı. Kiçik rəqəm yuxarıda. Bərabər olanda — əvvəl yaradılan yuxarıda. |
| **Aktiv** | ✔ / boş | Boşdursa ofis saytda **heç bir dildə** görünmür (silinmir, gizlənir). |
| **Foto** | Media kitabxanasından şəkil | Kartın solundakı bina fotosu. Hər iki dil üçün eynidir. Boşdursa boz yer tutucu görünür. |

**Dil üzrə sahələr (AZ və EN tabları ayrıca doldurulur):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Ad** \* | Məs. «Gəncə ərazi idarəsi» | Kartın başlığı (göy, qalın). |
| **Ünvan** | Tam ünvan | «Ünvan» sütunu. Boşdursa sütun görünmür. |
| **Telefon** | Məs. `(+994 22) 256-00-00` | «Telefon» sütunu. Mobil cihazda kliklə zəng edilir. Boşdursa görünmür. |
| **Rəhbər** | Rəhbərin adı, soyadı | «Rəhbər» sütunu. Boşdursa görünmür. |
| **Əsasnamə** | Media kitabxanasından o dilin sənədi | «Əsasnamə» düyməsi; sənədi yeni pəncərədə açır. Fayl seçilməyibsə düymə görünmür. |

\* **Ad** ən azı bir dildə mütləq doldurulmalıdır.

Sonda **Yadda saxla**.

### 3.2. Mövcud ofisi redaktə etmək

Siyahıda (sütunlar: ID, Ad, Ünvan, Telefon, Status) ofisin sətrini açın, lazım olan sahəni
dəyişin, **Yadda saxla**. Ən çox rast gələn hallar:

- **Rəhbər dəyişdi** → AZ və EN tablarında **Rəhbər** sahəsini yeniləyin.
- **Yeni əsasnamə qəbul olundu** → yeni PDF-ləri Media kitabxanasına yükləyin, sonra hər
  dil tabında **Əsasnamə → Dəyiş** ilə yenisini seçin.
- **Telefon/ünvan dəyişdi** → hər iki dil tabında yeniləyin (sahələr dillər arasında
  avtomatik köçmür).
- **Ardıcıllığı dəyişmək** → **Sıra** rəqəmlərini yenidən verin. Gələcəkdə araya ofis
  əlavə etmək asan olsun deyə 10, 20, 30… addımı tövsiyə olunur.

### 3.3. Ofisi müvəqqəti gizlətmək

**Aktiv** işarəsini götürün → Yadda saxla. Ofis hər iki dildə saytdan itir, amma bütün
məlumatı paneldə qalır; geri qaytarmaq üçün işarəni yenidən qoyun. Siyahıda status
«Qeyri-aktiv» kimi görünür.

### 3.4. Ofisi yalnız bir dildə göstərmək / bir dildən çıxarmaq

Ofis saytın bir dilində yalnız **həmin dilin tabı doldurulubsa** görünür.

- Ofis ingiliscə hələ hazır deyilsə — **EN tabını tam boş saxlayın**: `/az`-da görünəcək,
  `/en`-də görünməyəcək.
- Mövcud ofisi bir dildən çıxarmaq üçün həmin dilin **bütün** sahələrini (ad, ünvan, telefon,
  rəhbər, əsasnamə) təmizləyin və saxlayın — o dilin tərcüməsi silinir.

> ⚠ Bir dildə yalnız telefon və ya ünvan yazıb **adı boş** saxlamayın: o dil «dolu» sayılır,
> amma başlıqsız qalır — saxlama ya xəta verəcək, ya da kart saytda başlıqsız görünəcək.
> Ya ad da yazın, ya da həmin tabı tam boş saxlayın.

### 3.5. Ofisi silmək

Siyahıda **Sil** → təsdiq. Ofis və onun bütün dil məlumatları **birdəfəlik** silinir (geri
qaytarmaq olmur). Media kitabxanasındakı foto və PDF-lər silinmir. Əmin deyilsinizsə,
silmək əvəzinə **Aktiv** işarəsini götürün (3.3).

### 3.6. Faylı Media kitabxanasından silsəniz

Ofisə bağlı foto və ya əsasnamə kitabxanadan silinərsə, xəta yaranmır: saytda foto yerinə
boz yer tutucu görünür, «Əsasnamə» düyməsi isə yox olur. Yeni fayl seçənə qədər belə qalır.

---

## 4. Saytda nə və necə görünür

**Səhifə:** Haqqımızda → **Təşkilati struktur və idarəetmə** → sol menyuda **Ərazi idarələri**.
Səhifənin üstündə breadcrumb, sol tərəfdə «Haqqımızda» menyusu, ortada kartlar siyahısı.

**Kartın quruluşu (desktop):**

```
┌───────────────┬─────────────────────────────────────────────────────┐
│               │  Gəncə ərazi idarəsi                    ← Ad         │
│               │  ─────────────────────────────────────────────────── │
│   [ Foto ]    │  Ünvan            Telefon            Rəhbər          │
│               │  Gəncə ş., ...    (+994 22) ...      Ad Soyad        │
│               │                                                      │
│               │  [ 📄 Əsasnamə ]                  ← o dilin PDF-i    │
└───────────────┴─────────────────────────────────────────────────────┘
```

- **Mobil/dar ekranda** foto kartın üstünə keçir, Ünvan / Telefon / Rəhbər alt-alta düzülür.
- Kartlar **Sıra** rəqəminə görə yuxarıdan aşağı düzülür.
- Boş sahə üçün sətir **görünmür** (məs. rəhbər yazılmayıbsa «Rəhbər» sütunu olmur); üç
  sahənin hamısı boşdursa yalnız başlıq və (varsa) düymə qalır.
- **Əsasnamə** düyməsi səhifənin dilinə uyğun faylı açır: `/az`-da AZ tabında seçilən,
  `/en`-də EN tabında seçilən sənəd.
- Heç bir aktiv ofis yoxdursa: «Bu bölmə üçün məlumat yoxdur» mesajı.
- API əlçatan deyilsə: ümumi xəta bloku (bu, məzmun problemi deyil — texniki komandaya
  bildirin).

---

## 5. Sol menyudakı «Ərazi idarələri» linki

Sol menyudakı bəndin özü ofislər modulundan deyil, **Səhifələr** ağacından gəlir: «Haqqımızda»
altında bir səhifə var ki, onun **Menyu linki** sahəsində `/organization?section=offices`
yazılıb. Buna görə:

- Menyu bəndinin **adını** dəyişmək və ya onu **menyudan gizlətmək** üçün:
  **Səhifələr** → həmin səhifə → başlıq / «Saytın menyusunda» seçimi.
- **Menyu linki** sahəsini dəyişməyin və silməyin — əks halda bənd kartlar səhifəsinə
  aparmayacaq.
- Səhifə başlığının özü («Ərazi idarələri» / «Regional offices») saytın interfeys
  mətnlərindəndir və paneldən dəyişmir.

---

## 6. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] `/az/organization?section=offices` açılır, kart yerindədir, sıra düzgündür.
- [ ] `/en/organization?section=offices` — ingiliscə məlumat düzgündür (və ya qəsdən yoxdur).
- [ ] Foto görünür (boz yer tutucu deyil).
- [ ] «Əsasnamə» düyməsi hər dildə **öz dilinin** sənədini açır.
- [ ] Telefon nömrəsi mobil cihazda kliklə zəng açır.

## 7. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Ofis saytda görünmür | **Aktiv** işarəsi yoxdur | İşarəni qoyun |
| Ofis yalnız AZ-da görünür | EN tabı boşdur | EN tabını doldurun |
| Foto əvəzinə boz sahə | Foto seçilməyib və ya kitabxanadan silinib | **Foto → Seç** |
| «Əsasnamə» düyməsi yoxdur | O dil üçün sənəd seçilməyib | Həmin dil tabında **Əsasnamə → Seç** |
| EN səhifədə AZ sənədi açılır | EN tabında AZ faylı seçilib | EN tabında ingiliscə PDF-i seçin |
| Formada lazımi faylı tapmıram | Fayl kitabxanaya yüklənməyib | Əvvəl **Media kitabxanası → Fayl yüklə** |
| Saxlayanda «Media asset not found» | Seçilmiş fayl artıq silinib | Faylı yenidən yükləyib seçin |

---

## Əlavə: developerlər üçün

| Qat | Yer |
|---|---|
| Admin modul | `product-rest/web-cbar-admin-new/src/features/organization/model/modules.ts` → `officesModule` |
| Admin API | `api-cbar-admin` → `OrganizationOfficesController` — `GET/POST /api/v1/organization/offices`, `GET/PUT/DELETE /{id}`; icazələr `Organization.Create/Update/Delete`; hər yazı `audit_log`-a düşür |
| Public API | `api-cbar` → `OrganizationController.GetOffices` — `GET /api/v1/organization/offices?locale=az\|en`; filtr: `IsActive` + həmin locale-də tərcümə var; sıra `SortOrder, Id` |
| Sayt | `web-cbar-new/src/views/organization/loader.ts` (`officesBody`) → `widgets/about-blocks/office-cards.tsx` (Figma `2046:3531`) |
| DB | `organization_offices`, `organization_office_translations`; foto/rəhbər/əsasnamə ayrıca `organization_office_details`, `organization_office_translation_details` cədvəllərində (migrasiya `0014`) |

- Admin forması bütün dil sahələri boş olan locale-i payload-a qoşmur; `PUT` payload-da
  olmayan locale-in tərcüməsini silir (`ApplyTranslations` → `RemoveAll`).
- Media silinəndə `photo_media_id` / `regulation_media_id` `NULL` olur (`ON DELETE SET NULL`).
- Saytın `?section=` dəyəri yanlışdırsa, default `board` (İdarə Heyəti) açılır.
