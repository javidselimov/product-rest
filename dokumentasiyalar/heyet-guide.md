# Heyət — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Heyət»** bölməsini — İdarə Heyəti üzvləri, baş direktorlar və sədrin
müşavirləri — admin paneldən necə idarə etməyi və dəyişikliyin saytda harada, necə görünəcəyini
izah edir. Hər əməkdaşın saytda iki yeri var: siyahıdakı **kart** və kliklə açılan
**bioqrafiya səhifəsi** (foto, vəzifə, qəbul günləri, telefon, tərcümeyi-hal və mətbuat üçün
yüklənə bilən fotolar).

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Təşkilat** → yuxarıdakı tab **Heyət** (`/organization/staff`) |
| **Sayt — İdarə Heyəti (AZ / EN)** | `https://<sayt>/az/organization?section=board` · `/en/organization?section=board` |
| **Sayt — Baş direktorlar və müşavirlər** | `https://<sayt>/az/organization?section=management` · `/en/organization?section=management` |
| **Sayt — bioqrafiya səhifəsi** | `https://<sayt>/az/organization/staff/detail/<ID>` · `/en/organization/staff/detail/<ID>` |
| **Saytda yolu** | Haqqımızda → Təşkilati struktur və idarəetmə → sol menyuda **İdarə Heyəti** və ya **Baş direktorlar və müşavirlər** |

Əməkdaşın hansı səhifəyə düşdüyünü formadakı **Kateqoriya** həll edir:

| Kateqoriya (paneldə) | Saytda harada |
|---|---|
| **İdarə heyəti** | «İdarə Heyəti» səhifəsi: birinci — böyük **Sədr** kartı, qalanları «Sədr müavinləri» |
| **Baş direktor** | «Baş direktorlar və müşavirlər» səhifəsi, **Baş direktorlar** qrupu |
| **Sədrin müşaviri** | eyni səhifə, **Müşavirlər** qrupu |

Dəyişiklik yadda saxlanandan sonra saytda **ən geci ~10 saniyəyə** görünür (sayt API
cavablarını qısa müddət keşləyir); səhifəni yeniləmək kifayətdir.

---

## 2. Hazırlıq: fotoları əvvəlcədən yükləyin

Formadakı **Foto** sahəsi və «Mətbuat üçün fotoşəkillər» bölməsi yalnız **Media kitabxanasında
artıq olan** faylı seçməyə imkan verir — formanın içində yeni fayl yükləmək olmur. Ona görə
əvvəlcə:

1. Sol menyu → **Media kitabxanası** → **Fayl yüklə**.
2. **Portret** fotosunu yükləyin (jpg / png / webp) — kartda və bioqrafiya səhifəsinin başlığında
   bu görünür. Kartlarda foto **yuxarıdan hizalanaraq kəsilir**, üz fotonun yuxarı hissəsində
   olmalıdır.
3. Lazımdırsa, **mətbuat üçün** tam ölçülü fotoları yükləyin (yalnız şəkil faylları; PDF və video
   qəbul olunmur).

> Eyni fayl ikinci dəfə yüklənsə, sistem onu yenidən saxlamır, mövcud olanı qaytarır
> (tarix/ad köhnə görünə bilər — bu normaldır).

---

## 3. Admin paneldə əməliyyatlar

**Təşkilat → Heyət** siyahısının üstündə kateqoriya tabları var: **Hamısı | İdarə heyəti |
Baş direktor | Sədrin müşaviri** — cədvəli yalnız o kateqoriyaya daraldır (seçim ünvan sətrinə
yazılır, linki paylaşmaq olar). Sütunlar: **Sıra, Ad, soyad, Vəzifə, Kateqoriya, Status**.
Siyahı səhifələnmir — bütün əməkdaşlar bir cədvəldədir, **Sıra** üzrə düzülmüş.

### 3.1. Yeni əməkdaş əlavə etmək

**Təşkilat → Heyət → «Yeni» düyməsi.** Forma iki hissədən ibarətdir:

**Ümumi sahələr (dildən asılı deyil):**

| Sahə | Nə seçilir / yazılır | Saytda təsiri |
|---|---|---|
| **Kateqoriya** | İdarə heyəti · Baş direktor · Sədrin müşaviri (standart: İdarə heyəti) | Hansı səhifədə və hansı qrupda görünəcəyi (bax §1) |
| **Sıra** | Rəqəm (0, 10, 20…) | Kartların ardıcıllığı; kiçik rəqəm əvvəl. Bərabər olanda — əvvəl yaradılan əvvəl. **İdarə heyətində birinci əməkdaş Sədr kartı olur.** |
| **Aktiv** | ✔ / boş | Boşdursa əməkdaş saytda **heç bir dildə** görünmür, bioqrafiya səhifəsi də açılmır (silinmir, gizlənir) |
| **Telefon** | Məs. `(+994 12) 493-11-22` | Bioqrafiya səhifəsində «Əlaqə» bloku; mobil cihazda kliklə zəng edilir. Hər iki dildə eynidir. Boşdursa blok görünmür |
| **Foto** | Media kitabxanasından şəkil | Kartdakı və bioqrafiya başlığındakı portret. Boşdursa foto yerində ad-soyadın **baş hərfləri** göstərilir |

**Dil üzrə sahələr (AZ və EN tabları ayrıca doldurulur):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Ad, soyad** \* | Məs. «Taleh Kazımov» | Kartın və bioqrafiya səhifəsinin başlığı; brauzer tabının adı |
| **Vəzifə** | Məs. «Mərkəzi Bankın sədri» | Kartda adın altında; bioqrafiyada başlıq kartında. Boşdursa sətir görünmür |
| **Qəbul günləri** | Sərbəst mətn, məs. «Hər ayın birinci çərşənbəsi, 15:00–17:00» | Bioqrafiya səhifəsində «Qəbul günləri» bloku (təqvim ikonu ilə). Boşdursa blok görünmür |
| **Tərcümeyi-hal** | Zəngin mətn (redaktor) | Bioqrafiya səhifəsinin əsas mətni. Bölmələri **Başlıq 3** ilə ayırın — qaydalar `product-rest/web-cbar-new/docs/about-cms-guide.md` §6-dadır |

\* **Ad, soyad** ən azı bir dildə mütləq doldurulmalıdır («Ad, soyad ən azı bir dildə
doldurulmalıdır» xətası).

Sonda **Yadda saxla** — siyahıya qayıdırsınız. **«Mətbuat üçün fotoşəkillər»** kartı yalnız
artıq saxlanmış qeyddə var: fotoları əlavə etmək üçün yeni əməkdaşı siyahıdan yenidən açın (§3.3).

### 3.2. Mövcud əməkdaşı redaktə etmək

Siyahıda sətri açın, lazım olan sahəni dəyişin, **Yadda saxla**. Ən çox rast gələn hallar:

- **Vəzifə dəyişdi** → AZ və EN tablarında **Vəzifə** sahəsini yeniləyin (sahələr dillər
  arasında avtomatik köçmür).
- **Yeni sədr** → yeni şəxsə İdarə heyətində ən kiçik **Sıra** rəqəmini verin; köhnə sədrin
  sırasını böyüdün və ya **Aktiv** işarəsini götürün. Sədr üçün ayrıca işarə yoxdur — həmişə
  **İdarə heyətində birinci** olan Sədr kartı kimi göstərilir.
- **Əməkdaş baş direktordan İdarə Heyətinə keçdi** → **Kateqoriya** sahəsini dəyişin; qeyd
  saytda avtomatik o biri səhifəyə keçir (bioqrafiya ünvanı dəyişmir).
- **Ardıcıllığı dəyişmək** → **Sıra** rəqəmlərini yenidən verin. Araya adam salmaq asan olsun
  deyə 10, 20, 30… addımı tövsiyə olunur.
- **Yeni portret** → yeni şəkli Media kitabxanasına yükləyin, sonra **Foto → Dəyiş** ilə seçin.

### 3.3. Mətbuat üçün fotoşəkillər

Redaktə formasının altındakı **«Mətbuat üçün fotoşəkillər»** kartı. Saytda bioqrafiyanın
altında «Fotoşəkillər» bölməsi kimi çıxır: hər foto ayrıca yüklənir, bir düymə ilə hamısı ZIP
kimi yüklənir. **Portret (Foto sahəsi) bu dəstə avtomatik düşmür** — lazımdırsa onu da əlavə edin.

| Nə etmək | Necə |
|---|---|
| Foto əlavə etmək | **Foto əlavə et** → «Foto seç» pəncərəsində kitabxanadan şəkli seçin. Artıq əlavə olunmuş fayllar seçilə bilmir (sönük). Yeni foto siyahının **sonuna** düşür |
| Ardıcıllığı dəyişmək | Sətirdəki **↑ / ↓** düymələri. Hər klik dərhal saxlanır («Sıra yeniləndi») — ayrıca **Yadda saxla** lazım deyil |
| Fotonu çıxarmaq | Sətirdəki **zibil qutusu** → «Fotonu çıxar» dialoqunda **Çıxar**. Fayl kitabxanada qalır |

Hər sətirdə faylın adı, `#` ilə media nömrəsi və «mövqe N» yazılır. Saytdakı ardıcıllıq
buradakının eynisidir.

Mümkün xətalar:

| Mesaj | Səbəb |
|---|---|
| «Only image assets can be attached as photos.» | Şəkil olmayan fayl (PDF, video) seçilib |
| «Already attached.» | Bu fayl artıq dəstdədir |
| «Media asset not found.» | Seçilmiş fayl artıq kitabxanadan silinib |

### 3.4. Əməkdaşı müvəqqəti gizlətmək

**Aktiv** işarəsini götürün → Yadda saxla. Əməkdaş hər iki dildə kartlardan itir, bioqrafiya
ünvanı **«Səhifə tapılmadı»** verir, amma bütün məlumat (fotolar daxil) paneldə qalır. Geri
qaytarmaq üçün işarəni yenidən qoyun. Siyahıda status «Qeyri-aktiv» görünür.

Struktur sxemində bu şəxsə bağlı kart varsa, o kart da saytdan gizlənir (bax
`struktur-sxemi-guide.md` §4.3).

### 3.5. Əməkdaşı yalnız bir dildə göstərmək / bir dildən çıxarmaq

Əməkdaş saytın bir dilində yalnız **həmin dilin tabı doldurulubsa** görünür — həm kart, həm
bioqrafiya səhifəsi.

- İngiliscə tərcümeyi-hal hələ hazır deyilsə, amma kart lazımdırsa — EN tabında heç olmasa
  **Ad, soyad** və **Vəzifə** yazın: kart görünəcək, bioqrafiya səhifəsi başlıq kartı ilə
  (mətnsiz) açılacaq.
- Əməkdaşı bir dildən tamamilə çıxarmaq üçün həmin dilin **bütün** sahələrini (ad, vəzifə,
  qəbul günləri, tərcümeyi-hal) təmizləyin və saxlayın — o dilin tərcüməsi silinir.

> ⚠ Bir dildə yalnız vəzifə və ya tərcümeyi-hal yazıb **adı boş** saxlamayın: o dil «dolu»
> sayılır, amma kart başlıqsız qalır. Ya ad da yazın, ya da həmin tabı tam boş saxlayın.

### 3.6. Əməkdaşı silmək

Siyahıda **Sil** → təsdiq. Qeyd, dil məlumatları və mətbuat fotolarının **bağlantıları**
birdəfəlik silinir (geri qaytarmaq olmur). Media kitabxanasındakı fayllar silinmir. Struktur
sxemində bu şəxsə bağlı kart qalır, sadəcə bağlantısı qırılır (`struktur-sxemi-guide.md` §6).
Əmin deyilsinizsə, silmək əvəzinə **Aktiv** işarəsini götürün (§3.4).

### 3.7. Faylı Media kitabxanasından silsəniz

- **Portret** (Foto sahəsində seçilmiş fayl) əməkdaşa bağlı olduğu müddətdə kitabxanadan
  silinmir — «File is attached to content; detach it first.» xətası çıxır. Əvvəl formada
  **Foto → Təmizlə**.
- **Mətbuat fotosu** üçün belə qoruma **yoxdur** (yoxlanılmalıdır — kodda bu cədvəl «istifadədə»
  yoxlamasına daxil deyil): fayl kitabxanadan silinsə, saytda həmin foto və ZIP-dən sakitcə
  itir, paneldəki siyahıda isə adsız, yalnız `#nömrə` ilə sətir qalır. Belə sətri **zibil
  qutusu** ilə çıxarın.

---

## 4. Saytda nə və necə görünür

### 4.1. «İdarə Heyəti» səhifəsi (`?section=board`)

**Səhifə:** Haqqımızda → Təşkilati struktur və idarəetmə → sol menyuda **İdarə Heyəti**.
Yuxarıda breadcrumb, solda «Haqqımızda» menyusu, ortada:

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │  Taleh Kazımov                     ← Ad, soyad (ağ)  │
│  [Foto]  │  Mərkəzi Bankın sədri              ← Vəzifə          │   ← göy gradient,
│ 300×380  │  ──────────────────────────────────                  │      tam en
└──────────┴──────────────────────────────────────────────────────┘

Sədr müavinləri                                   ← başlıq (dəyişmir)
┌──────┬────────────────────┐  ┌──────┬────────────────────┐
│[Foto]│ Ad Soyad           │  │[Foto]│ Ad Soyad           │   ← 2 sütun,
│128×160│ Vəzifə            │  │      │ Vəzifə             │      mobildə 1
└──────┴────────────────────┘  └──────┴────────────────────┘
```

- **Birinci** (ən kiçik sıralı) İdarə heyəti üzvü böyük **Sədr** kartıdır, qalanları «Sədr
  müavinləri» başlığı altında. Müavin yoxdursa başlıq da görünmür.
- Hər kart kliklənir → bioqrafiya səhifəsi.
- Heç bir aktiv İdarə heyəti üzvü yoxdursa: «Bu bölmə üçün məlumat yoxdur».

### 4.2. «Baş direktorlar və müşavirlər» səhifəsi (`?section=management`)

İki qrup, hər biri öz başlığı ilə: **Baş direktorlar** (Kateqoriya = Baş direktor) və
**Müşavirlər** (Kateqoriya = Sədrin müşaviri). Kartlar şaquli: üstdə foto (229×200), altda ad və
vəzifə; desktopda **4 sütun**, planşetdə 2, mobildə 1. Boş qrup başlığı ilə birlikdə gizlənir;
hər iki qrup boşdursa — «Bu bölmə üçün məlumat yoxdur».

### 4.3. Bioqrafiya səhifəsi (`/organization/staff/detail/<ID>`)

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │  Ad Soyad                              ← başlıq (H1) │
│  [Foto]  │  Vəzifə                                              │
│ 300×380  │  ──────────────────────────────────                  │
│          │  📅 Qəbul günləri      📞 Əlaqə                       │
│          │     <mətn>                (+994 12) ...  ← zəng linki │
└──────────┴──────────────────────────────────────────────────────┘

<Tərcümeyi-hal — Başlıq 3 bölmələri və mətn>

Fotoşəkillər                        [ ↓ Hamısını yüklə (ZIP, 21,9 MB) ]
┌────────────┐ ┌────────────┐ ┌────────────┐
│   [foto]   │ │   [foto]   │ │   [foto]   │     ← 3 sütun (planşet 2, mobil 1)
│ JPG · 4000×6000 px · 8,2 MB │ ...
│ [↓ Yüklə]  │ │ [↓ Yüklə]  │ │ [↓ Yüklə]  │
└────────────┘ └────────────┘ └────────────┘
```

- Breadcrumb: … › **İdarə Heyəti** (və ya **Baş direktorlar və müşavirlər**, kateqoriyaya görə)
  › Ad Soyad. Siyahıya qayıdış breadcrumb-dandır.
- «Qəbul günləri» və «Əlaqə» blokları yalnız doludursa görünür; telefon mobil cihazda kliklə
  zəng açır.
- Foto yoxdursa, foto yerində adın baş hərfləri.
- «Fotoşəkillər» bölməsi yalnız ən azı bir mətbuat fotosu olanda çıxır. Hər kartın altında
  format, ölçü (piksel) və fayl həcmi avtomatik yazılır; «Hamısını yüklə» düyməsindəki həcm
  faylların cəmidir. ZIP-in içində fayllar yükləndiyi **orijinal adları** ilə gedir.
- Əməkdaş deaktivdirsə, silinibsə və ya bu dildə tərcüməsi yoxdursa — «Səhifə tapılmadı».
- API əlçatan deyilsə siyahı səhifəsində ümumi xəta bloku çıxır (məzmun problemi deyil —
  texniki komandaya bildirin).

---

## 5. Sol menyudakı «İdarə Heyəti» və «Baş direktorlar və müşavirlər» linkləri

Sol menyudakı bəndlər heyət modulundan deyil, **Səhifələr** ağacından gəlir: «Haqqımızda» altında
**Menyu linki** sahəsində `/organization?section=board` və `/organization?section=management`
yazılmış səhifələr var.

- Bəndin **adını** dəyişmək və ya onu **menyudan gizlətmək** üçün: **Səhifələr** → həmin
  səhifə → başlıq / «Saytın menyusunda» seçimi.
- **Menyu linki** sahəsini dəyişməyin və silməyin — əks halda bənd kartlar səhifəsinə aparmır.
- Səhifənin öz başlığı («İdarə Heyəti», «Baş direktorlar və müşavirlər») və qrup adları («Sədr
  müavinləri», «Baş direktorlar», «Müşavirlər», «Fotoşəkillər», «Qəbul günləri», «Əlaqə») saytın
  interfeys mətnləridir və paneldən dəyişmir.

---

## 6. Əlaqəli modullar

- **Struktur sxemi** (Təşkilat → Struktur sxemi): sxemdəki sədr/müavin/baş direktor kartları
  Heyətdəki qeydə bağlanır — ad və vəzifə oradan gəlir, klik bioqrafiyanı açır. Heyətdə adı
  dəyişsəniz kart da dəyişir; əməkdaşı deaktiv etsəniz kart gizlənir. Ətraflı:
  `struktur-sxemi-guide.md` §2, §4.3, §6.
- **Tərcümeyi-halın markup qaydaları** (Başlıq 3 bölmələri, nə etməməli):
  `product-rest/web-cbar-new/docs/about-cms-guide.md` §6.

---

## 7. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] `/az/organization?section=board` — Sədr kartı düzgün şəxsdir, müavinlərin sırası
      düzgündür.
- [ ] `/az/organization?section=management` — əməkdaş düzgün qrupdadır (Baş direktorlar /
      Müşavirlər).
- [ ] Karta klik → bioqrafiya açılır; ad, vəzifə, qəbul günləri, telefon düzgündür.
- [ ] Tərcümeyi-hal bölmələrə ayrılıb (Başlıq 3), mətn oxunaqlıdır.
- [ ] Mətbuat fotoları doğru ardıcıllıqdadır, «Hamısını yüklə» ZIP-i açılır.
- [ ] `/en/...` — ingiliscə ad/vəzifə düzgündür (və ya qəsdən yoxdur).
- [ ] Foto görünür (baş hərflər deyil) və üz kəsilməyib.

## 8. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Əməkdaş saytda görünmür | **Aktiv** işarəsi yoxdur | İşarəni qoyun |
| Əməkdaş yalnız AZ-da görünür | EN tabı boşdur | EN tabında heç olmasa **Ad, soyad** yazın |
| Səhv adam Sədr kartındadır | İdarə heyətində **Sıra** rəqəmi ən kiçik deyil | Sədrə ən kiçik sıranı verin |
| Əməkdaş səhv səhifədədir | **Kateqoriya** səhv seçilib | Kateqoriyanı dəyişin |
| Foto əvəzinə baş hərflər | Foto seçilməyib | **Foto → Seç** |
| Kartda üz kəsilib | Foto üfüqidir / üz aşağıdadır | Portret (şaquli) foto yükləyin — kart yuxarıdan hizalayır |
| Bioqrafiyada «Fotoşəkillər» yoxdur | Mətbuat fotosu əlavə olunmayıb | Redaktə formasının altında **Foto əlavə et** |
| Foto əlavə etmək alınmır («Only image assets…») | Seçilən fayl şəkil deyil | jpg/png/webp seçin |
| Bioqrafiya «Səhifə tapılmadı» verir | Qeyd deaktivdir və ya bu dildə tərcüməsi yoxdur | Aktiv edin / həmin dilin tabını doldurun |
| Saxlayanda «Media asset not found» | Seçilmiş fayl artıq silinib | Faylı yenidən yükləyib seçin |
| Portreti kitabxanadan silmək olmur | Fayl əməkdaşa bağlıdır | Əvvəl formada **Foto → Təmizlə** |
| Dəyişiklik saytda dərhal çıxmadı | Saytın ~10 saniyəlik keşi | Bir az gözləyib səhifəni yeniləyin |

---

## Əlavə: developerlər üçün

| Qat | Yer |
|---|---|
| Admin modul | `product-rest/web-cbar-admin-new/src/features/organization/model/modules.ts` → `staffModule` (`STAFF_TYPE_OPTIONS` 1/2/3; tip filtri `filters[type]` tabs); sxemlər `model/schemas.ts` (`staffSchema`, `staffPhotoSchema`) |
| Admin fotolar | `features/organization/components/staff-photos-section.tsx` (`editExtras`, yalnız edit rejimində) + `api/staff-photos.service.ts`; test `features/organization/organization.test.tsx` |
| Admin API | `api-cbar-admin` → `OrganizationStaffController`: `GET/POST /api/v1/organization/staff` (`?type=`), `GET/PUT/DELETE /{id}`; fotolar `POST /{id}/photos {mediaId}` → 200, `PUT /{id}/photos/order {photoIds}` → 204 (tam siyahı tələb olunur), `DELETE /{id}/photos/{photoId}` → 204; icazələr `Organization.Read/Create/Update/Delete` (foto əməliyyatları `Update`); hər yazı `audit_log`-a `organization_staff.*` kimi düşür |
| Public API | `api-cbar` → `OrganizationController`: `GET /api/v1/organization/staff?locale=&type=` (filtr `IsActive` + locale-də tərcümə; sıra `SortOrder, Id`), `GET /staff/{id}?locale=` (eyni filtr, `photos` ilə), `GET /staff/{id}/photos.zip` (MinIO-dan stream, sıxılmadan, `Content-Disposition: attachment`) |
| Sayt | `web-cbar-new/src/views/organization/loader.ts` (`boardBody` → `splitBoard`: birinci üzv sədr; `managementBody`: type 2 və 3 paralel) → `views/organization/index.tsx`; bioqrafiya `views/staff-member/{loader,index}.tsx`; widget-lər `widgets/about-blocks/staff-cards.tsx` (`ChairCard` `1988:2869`, `DeputyCard` `1988:2900`, `StaffCard` `1814:2293`, `StaffHeaderCard` `2007:91584`), `widgets/about-blocks/staff-photos.tsx` (`2037:4289`); ZIP proxy `app/media/staff-photos/[id]/route.ts` |
| Route-lar | `app/[locale]/(content)/organization/page.tsx`, `.../organization/staff/detail/[id]/page.tsx` |
| DB | `organization_staff` (`type`, `sort_order`, `is_active`, `phone`, `photo_media_id` → `ON DELETE SET NULL`), `organization_staff_translations` (`full_name`, `position`, `reception_days`, `bio`), `organization_staff_photos` (migrasiya `0012`; `staff_id` CASCADE, `media_id` RESTRICT, `UNIQUE(staff_id, media_id)`) |

- Admin forması bütün dil sahələri boş olan locale-i payload-a qoşmur; `PUT` payload-da
  olmayan locale-in tərcüməsini silir (`ApplyTranslations` → `RemoveAll`). `Translations.Count == 0`
  → 400.
- `type` DB/API-də yoxlanmır (`short`); 1/2/3 xaricində dəyər saytda heç bir bölməyə düşmür.
- Sayt sorğuları `server/cached.ts` ilə 10 s stale-while-revalidate keşlənir
  (`CONTENT_REVALIDATE_SECONDS`), ona görə «dərhal» yox, «≤10 s».
- Sədr bayrağı yoxdur: `splitBoard` sıradakı birinci `type=1` üzvü sədr sayır.
- Soft-delete olunmuş media global query filter ilə gizlənir: public `photos` proyeksiyasında
  belə foto düşür, ZIP-də iştirak etmir; admin `ToDetailDto` isə `p.Media?.OriginalName` →
  `null` qaytarır (paneldə `#mediaId`). Admin `MediaController.Delete`-in «in use» yoxlaması
  `organization_staff.photo_media_id`-ni əhatə edir, `organization_staff_photos`-u **yox** —
  ehtimal ki, əlavə edilməlidir.
- `OrganizationStaffController.Delete` `org_chart_nodes.staff_id`-ni `ExecuteUpdateAsync` ilə
  özü `NULL` edir (0015-in FK-sı olmayan mühitlər üçün).
