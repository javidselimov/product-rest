# Qalereya — idarəetmə təlimatı

Bu təlimat admin paneldə foto qalereya və videoların necə əlavə olunduğunu, dəyişdirildiyini və saytda necə
yoxlandığını addım-addım izah edir. Admin paneli idarə edənlər və QA test mühəndisləri üçündür.

---

## 1. Qısa xülasə

| | Foto | Video |
|---|---|---|
| **Admin panel** | Sol menyu → **Media** → **Qalereyalar** (`/galleries`) | Sol menyu → **Media** → **Videolar** (`/videos`) |
| **Fayllar** | **Media** → **Media kitabxanası** (`/media-library`) | Fayl yüklənmir, yalnız YouTube linki yazılır |
| **Sayt, siyahı** | `https://<sayt>/az/media/galleries` | `https://<sayt>/az/media/videos` |
| **Sayt, detal** | `https://<sayt>/az/media/galleries/<id>` | `https://<sayt>/az/media/videos/<id>` |
| **Saytda yolu** | Media → Qalereya, tab **Fotoqalereya** | Media → Qalereya, tab **Videoqalereya** |

İngilis saytı üçün ünvanda `/az/` əvəzinə `/en/` yazın.

Üç şeyi yadda saxlayın:

- **Şəkil əvvəl Media kitabxanasına yüklənir.** Qalereyanın içində yükləmə yoxdur, orada yalnız seçim var.
- **Şəkillər yalnız yaradılmış qalereyaya əlavə olunur.** Yeni qalereyanın formasında Şəkillər kartı görünmür.
- **Dəyişiklik saytda ən geci ~10 saniyəyə görünür.** Köhnə məlumat görsəniz, səhifəni bir də yeniləyin.

---

## 2. Hazırlıq

**Video üçün:**

- YouTube linki. Video YouTube-da açıq (public və ya unlisted) olmalıdır, əks halda saytda oynamayacaq.
- Azərbaycanca və ingiliscə başlıq.
- Dərc tarixi.

**Foto üçün:**

- Şəkil faylları: `jpg`, `png`, `gif`, `webp` və ya `svg`.
- Azərbaycanca və ingiliscə başlıq.
- Tədbir tarixi.
- Hansı şəklin kart şəkli olacağı, çünki kartda birinci şəkil görünür.

Əməliyyat icazə xətası verirsə, rolunuzda həmin hüquq yoxdur. Sistem administratoruna müraciət edin.

---

## 3. Video əlavə etmək

1. **Videolar** → **Yeni**.
2. Sahələri doldurun:

| Sahə | Məcburi | Qeyd |
|---|---|---|
| Başlıq (AZ, EN tabları) | bəli, ən azı bir dildə | Başlıq olmayan dildə video həmin dilin saytında görünmür |
| YouTube URL | bəli | `http://` və ya `https://` ilə başlamalıdır, formatlar aşağıdadır |
| Dərc tarixi | yox | Kartda görünür, tarix filtri bununla işləyir. Boş saxlamayın, bölmə 6-ya baxın |
| Sıra | bəli, ilkin `0` | Kiçik rəqəm əvvəl gəlir. Tarixə görə sıralanmaq üçün `0` saxlayın |
| Aktiv | ilkin açıq | Söndürüləndə video saytdan çıxır |

3. **Yadda saxla**. «Qeyd yaradıldı» bildirişi çıxır və panel siyahıya qayıdır.
4. Saytda yoxlayın: `/az/media/videos` və `/en/media/videos`.

**Qəbul olunan YouTube linkləri:**

| Format | Nümunə |
|---|---|
| Adi link | `https://www.youtube.com/watch?v=VIDEO_ID` |
| Qısa link | `https://youtu.be/VIDEO_ID` |
| Embed | `https://www.youtube.com/embed/VIDEO_ID` |
| Shorts | `https://www.youtube.com/shorts/VIDEO_ID` |
| Canlı yayım yazısı | `https://www.youtube.com/live/VIDEO_ID` |

Panel yalnız linkin `http(s)://` ilə başladığını yoxlayır, YouTube olub-olmadığını yox. Başqa sayt linki və ya
playlist linki də yadda saxlanılır, amma saytda pleyer çıxmır: kartda şəkil olmur, detalda yalnız «YouTube-da izlə»
keçidi görünür.

Video saytda örtük şəkli və play düyməsi ilə açılır. Örtük YouTube-dan avtomatik gəlir, onu paneldə dəyişmək olmur.
Video özü klikdən sonra yüklənir.

**Dəyişmək:** siyahıda qələm ikonu → sahələri dəyişin → **Yadda saxla**.

**Müvəqqəti gizlətmək:** **Aktiv** işarəsini götürün. Qeyd paneldə qalır, sonra yenidən açmaq olar.

**Silmək:** siyahıda zibil qutusu ikonu → təsdiq. Paneldən geri qaytarılmır, şübhə varsa **Aktiv**-i söndürün.

**Canlı yayım** başqa bölmədir: **Canlı yayımlar**, bax [Canlı yayım popup-u](canli-yayim-guide.md).

---

## 4. Foto idarəetməsi

Foto üç mərhələdədir: şəkli kitabxanaya yükləyin, qalereya yaradın, şəkilləri qalereyaya bağlayın.

### 4.1. Şəkilləri kitabxanaya yükləmək

1. **Media kitabxanası** → **Fayl yüklə**.
2. Faylı seçin. Fayllar bir-bir yüklənir, çoxlu seçim yoxdur.
3. Yükləmə bitəndə «"ad" yükləndi» bildirişi çıxır.

Fayl adını anlaşılan qoyun, məsələn `konfrans-2026-01.jpg`. Seçicidə şəkillər ad üzrə axtarılır.

Eyni fayl ikinci dəfə yüklənəndə yeni kart yaranmır, sistem mövcud faylı işlədir. Bu halda fayl siyahının əvvəlinə
düşmür və köhnə adı ilə qalır. Tapmaq üçün axtarışda köhnə adını yazın.

### 4.2. Qalereya yaratmaq

1. **Qalereyalar** → **Yeni**.
2. Sahələri doldurun:

| Sahə | Məcburi | Saytda təsiri |
|---|---|---|
| Başlıq (AZ, EN tabları) | bəli, ən azı bir dildə | Kart başlığı, detal səhifəsinin başlığı və axtarış. Başlıq olmayan dildə qalereya siyahıda yoxdur, detal tapılmır |
| Tədbir tarixi | yox | Kartda görünür, tarix filtri bununla işləyir. Detal səhifəsində göstərilmir |
| Sıra | bəli, ilkin `0` | Kiçik rəqəm əvvəl gəlir və tarixdən üstündür. Tarixə görə sıralanmaq üçün `0` saxlayın |
| Aktiv | ilkin açıq | Söndürüləndə qalereya siyahıdan çıxır, detal tapılmır |

3. **Yadda saxla**. Panel siyahıya qayıdır, şəkil hələ əlavə olunmayıb.

### 4.3. Şəkilləri qalereyaya əlavə etmək

1. Siyahıda yeni qalereyanın sətrində qələm ikonuna basın. Səhifənin aşağısında **Şəkillər** kartı açılır.
2. **Şəkil əlavə et** basın, ad üzrə axtarıb şəklə klikləyin.
3. Dialoq bağlanır və şəkil siyahıya düşür. Növbəti şəkil üçün bu addımı təkrarlayın.
4. Oxlarla sıranı düzəldin. **Birinci şəkil saytda kart şəklidir.**
5. Saytda yoxlayın: `/az/media/galleries` və `/en/media/galleries`.

Şəkillər kartında edilən hər dəyişiklik dərhal saxlanılır, **Yadda saxla** basmaq lazım deyil.

Seçici Media kitabxanasındakı bütün faylları göstərir. Yalnız şəkil seçin: PDF və ya Excel faylı da əlavə olunur,
amma saytda şəkil kimi görünmür. Qalereyada artıq olan fayl seçicidə solğun görünür və seçilmir.

Eyni şəkillər hər iki dildə göstərilir, şəkil dəstini dilə görə ayırmaq olmur.

### 4.4. Mövcud qalereyanı idarə etmək

| Nə etmək istəyirsiniz | Necə |
|---|---|
| Şəkil əlavə etmək | Qələm ikonu → **Şəkil əlavə et** |
| Sıranı dəyişmək | Şəklin yanındakı yuxarı və aşağı oxları |
| Kart şəklini dəyişmək | İstədiyiniz şəkli oxla birinci yerə qaldırın |
| Şəkli qalereyadan çıxarmaq | Şəklin yanındakı zibil qutusu → **Çıxar**. Fayl kitabxanada qalır |
| Şəkli başqası ilə əvəz etmək | Yenisini əlavə edin, oxla yerinə qaldırın, köhnəsini çıxarın |
| Başlığı və ya tarixi dəyişmək | Qələm ikonu → sahələr → **Yadda saxla** |
| Müvəqqəti gizlətmək | **Aktiv** işarəsini götürün |
| Bütün qalereyanı silmək | Siyahıda zibil qutusu → təsdiq. Paneldən geri qaytarılmır, fayllar kitabxanada qalır |
| Faylı kitabxanadan silmək | Əvvəl bütün qalereyalardan çıxarın. Bağlı fayl silinmir: «Fayl məzmuna bağlıdır» |

Qalereyanı tədbirə də bağlamaq olar, bax [Tədbirlər](tedbirler-guide.md).

---

## 5. Saytda nə görünür

**Siyahı** (`/media/galleries`, `/media/videos`): «Qalereya» başlığı, **Fotoqalereya** və **Videoqalereya** tabları,
filtr, səhifədə 9 kart, səhifələmə.

**Filtr:**

- **Axtarış** yalnız başlıqda və yalnız cari dildə işləyir.
- **Tarix aralığı** fotoda Tədbir tarixinə, videoda Dərc tarixinə (Bakı vaxtı) baxır.
- Tarix filtri qoyulanda tarixi olmayan qeydlər siyahıdan düşür.
- **Filtrləri təmizlə** bütün filtrləri sıfırlayır. Tab dəyişəndə də filtrlər silinir.
- Filtr ünvanda qalır, ona görə filtrli linki başqasına göndərmək olar.

**Foto detalı:** qalereya adı, böyük şəkil, altında miniatür zolaq və oxlar. Böyük şəklə klik orijinal faylı yeni tabda
açır. Tarix bu səhifədə görünmür.

**Video detalı:** video adı, örtük və play düyməsi. Klikdən sonra video həmin yerdə oynayır.

**Boş hallar:**

| Vəziyyət | Saytda |
|---|---|
| Filtr heç nə tapmayıb | «Heç nə tapılmadı» |
| Foto siyahısı boşdur | «Fotoqalereya tapılmadı» |
| Video siyahısı boşdur | «Video tapılmadı» |
| Qalereyada şəkil yoxdur | Kart boz qutu, detalda «Bu qalereyada şəkil yoxdur» |

**Ana səhifə:** qalereya kartları eyni siyahıdan gəlir, ona görə **Sıra** orada da təsir edir. Video tabı ana səhifədə
hazırda gizlidir.

---

## 6. Yoxlama siyahısı

**Yayımdan əvvəl, admin:**

- [ ] **Aktiv** açıqdır.
- [ ] Hər iki dildə başlıq var, ya da qeyd yalnız bir dil üçündür.
- [ ] Tarix doldurulub. Tarixsiz qeyd eyni Sıra daxilində siyahının ən əvvəlinə düşür və filtrdə tapılmır.
- [ ] **Sıra** `0`-dır, ya da başqa rəqəm qəsdən qoyulub.
- [ ] Qalereyada ən azı bir şəkil var, birinci şəkil kart üçün uyğundur.
- [ ] Video saytda pleyerlə açılır, örtük şəkli görünür.
- [ ] Test qeydləri silinib və ya söndürülüb.

**QA ssenariləri:**

| # | Addım | Gözlənilən nəticə |
|---|---|---|
| 1 | AZ və EN başlıqla video yaradın | `/az/media/videos` və `/en/media/videos`-da kart var, örtük YouTube-dandır |
| 2 | Kartı açıb play basın | Video həmin yerdə oynayır |
| 3 | Yalnız AZ başlıqla video yaradın | AZ saytda var, EN siyahıda yoxdur, EN detal ünvanı tapılmır |
| 4 | URL-i `www.youtube.com` kimi, `https://`-siz yazın | Forma «YouTube URL http:// və ya https:// ilə başlamalıdır» xətası verir |
| 5 | YouTube olmayan `https://` linki yazın | Yadda saxlanılır, kartda şəkil yoxdur, detalda yalnız «YouTube-da izlə» keçidi var |
| 6 | Hər iki dildə başlığı boş saxlayın | Forma «ən azı bir dildə doldurulmalıdır» xətası verir, qeyd yaranmır |
| 7 | Videonun **Aktiv**-ini söndürün | ~10 saniyədən sonra siyahıdan çıxır, detal ünvanı tapılmır |
| 8 | Yeni qalereyanın formasına baxın | Şəkillər kartı yoxdur, yalnız yadda saxlanandan sonra redaktədə çıxır |
| 9 | Qalereyaya üç şəkil əlavə edin | Kartda birinci şəkil, detalda üçü də eyni sıra ilə görünür |
| 10 | Üçüncü şəkli oxla birinci yerə qaldırın | Saytda kart şəkli dəyişir, **Yadda saxla** lazım olmur |
| 11 | Şəkli qalereyadan çıxarın | Saytda itir, Media kitabxanasında qalır |
| 12 | Qalereyaya bağlı faylı kitabxanadan silməyə çalışın | Silinmir, «bağlıdır» xətası çıxır |
| 13 | Eyni şəkli ikinci dəfə əlavə etməyə çalışın | Seçicidə həmin şəkil solğundur və seçilmir |
| 14 | Mövcud şəkli kitabxanaya yenidən yükləyin | Yeni kart yaranmır |
| 15 | Şəkilsiz qalereya yaradın | Kart boz qutudur, detalda «Bu qalereyada şəkil yoxdur» |
| 16 | İki qalereyaya fərqli tarix verin, **Sıra** `0` | Yeni tarixli əvvəldədir |
| 17 | Köhnə tarixli qalereyaya **Sıra** `-1` verin | Yeni tarixlidən əvvələ keçir |
| 18 | Saytda başlıqdan bir söz axtarın | Yalnız uyğun kartlar qalır, ünvanda `?q=` görünür |
| 19 | Tarix aralığı seçin | Yalnız aralıqdakılar qalır, tarixsiz qeyd düşür |
| 20 | Filtrlə ikinci səhifəyə keçin, sonra tabı dəyişin | Səhifələmə filtri saxlayır, tab dəyişəndə filtr silinir |
| 21 | 10-dan çox kart olan siyahını açın | Birinci səhifədə 9 kart, səhifələmə görünür |
| 22 | Köhnə `/gallery/photos` ünvanını açın | `/az/media/galleries`-ə yönləndirir |
| 23 | Sol menyudan Qalereya və Videoqalereya bəndlərini açın | Yeni siyahılar açılır (bölmə 8-ə baxın) |

Testi bitirəndə yaratdığınız test qeydlərini silin.

---

## 7. Tez-tez rast gələn problemlər

| Problem | Səbəb | Həll |
|---|---|---|
| Şəkil əlavə etmə düyməsi yoxdur | Qalereya hələ yaradılmayıb | Yadda saxlayın, siyahıdan qələm ikonu ilə açın |
| Seçicidə şəkil yoxdur | Fayl kitabxanaya yüklənməyib | **Media kitabxanası** → **Fayl yüklə** |
| Yüklənmiş fayl siyahının əvvəlində deyil | Fayl artıq var idi | Köhnə adı ilə axtarın |
| Fayl yüklənmir | Format icazəli deyil və ya məzmunu uzantıya uyğun gəlmir | `jpg`, `png`, `gif`, `webp`, `svg` işlədin |
| Saytda dəyişiklik yoxdur | Keşin vaxtı bitməyib | ~10 saniyə gözləyib səhifəni bir neçə dəfə yeniləyin |
| Saytda qeyd yoxdur | **Aktiv** sönülüdür | Aktiv edin |
| İngilis saytında yoxdur | EN başlıq boşdur | EN tabında başlıq yazın |
| Kart boz qutudur | Şəkil yoxdur və ya birinci şəklin faylı açılmır | Şəkil əlavə edin və ya birinci şəkli dəyişin |
| Kart şəkli səhvdir | Sıra düzgün deyil | İstədiyiniz şəkli birinci yerə qaldırın |
| Qalereya gözlənilən yerdə deyil | **Sıra** tarixdən üstündür | Paneldə Sıra sütununa baxın, `0` edin |
| Tarixsiz qeyd ən əvvəldədir | Tarix boşdur | Tarix yazın |
| Filtrdə qeyd tapılmır | Tarix boşdur və ya axtarış başqa dildədir | Tarix yazın, cari dildə axtarın |
| Videoda pleyer yoxdur | Link YouTube videosu deyil, məsələn playlistdir | Bölmə 3-dəki formatlardan birini yazın |
| Video oynamır | YouTube-da məhdudlaşdırılıb və ya silinib | YouTube-da yoxlayın |
| Tarixi gələcəkdə olan video artıq görünür | Tarix yayımı gecikdirmir | Vaxtına qədər **Aktiv**-i söndürün |
| Fayl kitabxanadan silinmir | Qalereyaya və ya başqa məzmuna bağlıdır | Əvvəl məzmundan ayırın |
| Sol menyu köhnə səhifəyə aparır | Menyu linki köhnədir | Bölmə 8 |

---

## 8. Açıq işlər (test mühiti, 06.11.2026)

**Menyu linkləri.** Spec 035-dən sonra siyahılar `/media#galleries` ünvanından yeni ünvanlara köçüb, amma iki menyu
bəndi hələ köhnə linkdədir. Bu səbəbdən sol menyudan keçid siyahını yox, Media giriş səhifəsini açır. Kod dəyişmir,
düzəliş paneldədir: **Səhifələr** bölməsində aşağıdakı səhifələrin **Menyu linki** sahəsini dəyişin.

| Səhifə | Slug (az / en) | İndi | Olmalıdır |
|---|---|---|---|
| 82 Qalereya | `qalereya` / `photo-gallery` | `/media#galleries` | `/media/galleries` |
| 83 Videoqalereya | `videoqalereya` / `video-gallery` | `/media#videos` | `/media/videos` |

Sahəni boş qoymayın, yoxsa üst menyu `/az/qalereya` CMS səhifəsinə aparar. Dəyişiklikdən sonra sol menyuda bənd aktiv
olur, breadcrumb isə `Ana səhifə › Media › Qalereya` olur.

**Məlumat tapşırıqları:**

- [ ] Səhifə 82 və 83-ün Menyu linkini dəyişin (spec 035 T017, yayımdan əvvəl mütləqdir).
- [ ] Qalereyaların **Sıra** dəyərlərini yoxlayın. Test API-də 05.06.2026 tarixli qalereya 15 tarixi 08.11.2026 olan
  16-dan əvvəl gəlir, 01.06 tarixli 1 isə 03.06 tarixli 4-dən əvvəl. Bu, Sıra dəyərlərinin fərqli olmasına işarədir;
  dəyərlər paneldən yoxlanmayıb.
- [ ] Qalereya 1-in («Maliyyə savadlılığı tədbiri») örtüyünü dəyişin: `/media/2` 404 verir, kart boz qalır.
- [ ] Test qeydi `testqal1`-i (16) yayımdan əvvəl silin və ya söndürün.
- [ ] **Media (Kopya)** altındakı 411 və 412 səhifələrində də köhnə link var (`/media#galleries&copy=1`). Kopya
  yayımdan əvvəl gizlədilməlidir.

Səhifə açılanda çıxan «Canlı yayım» popup-ı xəta deyil: test məlumatında stream 1 aktivdir və popup sessiyada bir dəfə
görünür.

---

## 9. Developerlər üçün

Spec: `specs/035-media-gallery-redesign/`, commit `652168a`. Admin panelə və miqrasiyaya dəyişiklik yoxdur. Deploy sırası:
`api-cbar`, sonra `web-cbar-new`.

| Qat | Harada |
|---|---|
| API (`q`, `from`, `to`, `GET /videos/{id}`) | `api-cbar`: `MediaContentController.cs` |
| Siyahı, 9 kart | `views/media-gallery-list/` |
| Filtr | `widgets/list-filter/` |
| Kart | `widgets/news-grid/` |
| Foto detalı | `views/gallery/`, `widgets/photo-gallery/` |
| Video detalı | `views/video/`, `widgets/video-player/` |
| Panel | `features/galleries/`, `features/videos/`, `features/media/` |

`/az/media#galleries` HTTP 200 qaytarır, çünki `#` serverə getmir və `proxy.ts` onu yönləndirə bilmir. Köhnə
`/gallery/photos[/detail/{id}]` və `/videos` yollarını `proxy.ts` 308 ilə yönləndirir.

**Figma:** `cbar website (Copy)`, səhifə `Media`, bölmə `Qalereya` (`1647:35084`).

| Ekran | Desktop | Tablet 744 | Mobil 390 |
|---|---|---|---|
| Foto siyahısı | `1643:29161` | `1660:23914` | `1660:24682` |
| Video siyahısı | `1647:32539` | `1660:25331` | `1660:26117` |
| Foto detalı | `1646:31123` | `1660:27731` | `1660:28311` |
| Video detalı | `1647:34253` | `1660:26784` | `1660:27317` |

**Figma ilə kod fərqləri:**

| Yer | Figma | Kod | Vəziyyət |
|---|---|---|---|
| Sol menyu | Bir bənd «Qalereya» | İki bənd: Qalereya, Videoqalereya | CMS qərarı, açıq |
| Foto detalında səhifələmə | Görünür (`1646:31181`) | Yoxdur | Spec 035 «yoxdur» yazır, dizaynerlə dəqiqləşdirin |
| Kart hündürlüyü | Sabit 367 | Qısa başlıqda kiçilir | Qəbul olunub |
| Tarix qutusu | 24 | 28 | Qəbul olunub |
| Planşet filtri | 172 | 164 | Qəbul olunub |
| Mobil H1 altı | 24 | 32 | Qəbul olunub |

**Görüləcək işlər:**

- [ ] `product-rest/web-cbar-new/docs/media-cms-guide.md` «köhnə `/media#galleries` işləyir» yazır, yenilənməlidir.
- [ ] `FEATURE_ROUTES`-a `qalereya` slug-ını əlavə etmək olar, boş Menyu linki də səhifəni düzgün aparar.
- [ ] Mövcud olmayan qalereya not-found ekranı və `noindex` göstərir, amma HTTP status 200-dür, spec isə 404 yazır.
  Səbəb ehtimal ki `[locale]/loading.tsx` axan cavabıdır; bütün sayta aid ola bilər.
- [ ] Media seçicisi qalereyada şəkil olmayan faylları da təklif edir, filtr əlavə etmək olar.
