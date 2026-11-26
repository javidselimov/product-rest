# Canlı yayım popup-u — idarəetmə təlimatı

Bu sənəd cbar.az-da **canlı yayım** funksiyasını izah edir: admin paneldəki **«Canlı yayımlar»**
bölməsində YouTube yayımı necə əlavə olunur və aktiv edilir, saytda popup və header düyməsi nə
vaxt, hansı səhifələrdə görünür, ziyarətçi popup-ı bağlayanda nə baş verir.

> Köhnə saytda popup yalnız ana səhifədə çıxırdı. Yeni saytda o, ziyarətçinin **sessiyada ilk açdığı
> hansı səhifə olursa olsun** orada çıxır, bağlanandan sonra isə həmin sessiyada bir daha avtomatik
> açılmır — yalnız header-dəki qırmızı düymə ilə açılır.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Media** → **Canlı yayımlar** (`/live-streams`) |
| **Sayt (AZ)** | Hər səhifə: `https://<sayt>/az/...` — popup + header-də **«Canlı yayım»** düyməsi; siyahı `https://<sayt>/az/media` («Canlı yayım» bölməsi) |
| **Sayt (EN)** | Eyni qayda: `https://<sayt>/en/...`; siyahı `https://<sayt>/en/media` |
| **Saytda yolu** | Popup avtomatik açılır; sonra header-dəki qırmızı **Canlı yayım** düyməsi (mobildə menyunun altında) |

Saytda aktiv yayım olanda üç şey görünür:

1. **Popup** — başlıqda qırmızı «Canlı» nişanı və yayımın başlığı, altında YouTube pleyeri.
2. **Header düyməsi** — qırmızı, yanıb-sönən nöqtəli **«Canlı yayım»**; popup-ı istənilən vaxt açır.
3. **Media səhifəsindəki kart** — `/media` səhifəsinin yuxarısında göy kart: yayımın adı, tarixi və
   «Yayımı izlə →» linki (YouTube-un özündə açılır).

Dəyişiklik saytda **təxminən 10 saniyə** ərzində görünür (sayt API cavablarını qısa müddət keşləyir).
Yayımı aktiv edəndən sonra səhifəni bir-iki dəfə yeniləyin.

---

## 2. Hazırlıq: YouTube linki

Formada yalnız **YouTube** linki qəbul olunur, başqa mənbə (Facebook, öz serverdə `.m3u8` və s.) yoxdur.
Linkdə **konkret videonun ID-si** olmalıdır — popup pleyeri məhz bu ID ilə qurulur. Düzgün formalar:

- `https://www.youtube.com/watch?v=XXXXXXXXXXX`
- `https://youtu.be/XXXXXXXXXXX`
- `https://www.youtube.com/live/XXXXXXXXXXX`
- `https://www.youtube.com/embed/XXXXXXXXXXX`

> ⚠ Kanalın «canlı» səhifəsinin linki (`https://www.youtube.com/@kanal/live`) formadan **keçir**,
> amma onda video ID-si olmadığına görə saytda nə popup, nə header düyməsi çıxır. Həmişə
> yayımın özünün linkini (YouTube-da «Paylaş» düyməsindən) götürün.

---

## 3. Admin paneldə əməliyyatlar

### 3.1. Yeni yayım əlavə etmək

**Media → Canlı yayımlar → «Yeni» düyməsi.** Forma iki hissədən ibarətdir:

**Ümumi sahələr (dildən asılı deyil):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **YouTube URL** \* | Yayımın linki (bax §2) | Popup-dakı pleyer və Media səhifəsindəki «Yayımı izlə» linki. YouTube olmayan link saxlanmır: «YouTube linki daxil edin (https://www.youtube.com/… və ya https://youtu.be/…)» |
| **Tarix** | Tarix və saat (istəyə bağlı) | Media səhifəsindəki kartda tarix kimi görünür. Bir neçə yayım aktiv olanda popup üçün **ən son tarixli** seçilir (§3.5). Saytda **vaxt məhdudiyyəti yaratmır** — gələcək tarix yazsanız da yayım dərhal çıxır |
| **Aktiv** | ✔ / boş (yeni yazıda ✔ qoyuludur) | Boşdursa yayım saytda heç yerdə görünmür |

**Dil üzrə sahələr (AZ və EN tabları):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Başlıq** \* | Məs. «Mərkəzi Bankın mətbuat konfransı» | Popup-un başlığı və Media səhifəsindəki kartın adı. Yayım saytın bir dilində yalnız **o dildə başlıq varsa** görünür |

\* **YouTube URL** məcburidir; **Başlıq** ən azı bir dildə doldurulmalıdır («Başlıq ən azı bir dildə
doldurulmalıdır» xətası).

Sonda **Yadda saxla**. Siyahıda ən yeni yazı yuxarıda olur.

### 3.2. Siyahı və statusu bir kliklə dəyişmək

Siyahının sütunları: **Başlıq**, **Tarix**, **Yaradılma vaxtı**, **Yenilənmə vaxtı**, **Status**.
Siyahıda axtarış və filtr yoxdur.

**Status** sütunu düymədir: yaşıl **«Aktiv»** və ya boz **«Qeyri-aktiv»**. Düyməyə bir klik yayımı
əks vəziyyətə keçirir, formanı açmağa ehtiyac yoxdur. Uğurlu olanda «"…" aktiv edildi» / «"…"
qeyri-aktiv edildi» bildirişi çıxır və siyahı yenilənir.

> Yayım bitəndə onu məhz bu düymə ilə **qeyri-aktiv** edin — əks halda popup saytda qalır və hər yeni
> ziyarətçiyə artıq bitmiş yayımı göstərir.

### 3.3. Yayımı redaktə etmək

Siyahıda sətri açın (**Redaktə et**), sahəni dəyişin, **Yadda saxla**.

- **Link dəyişdi** (YouTube yayımı yenidən başladıldı) → **YouTube URL** sahəsini yeniləyin. Yayımın
  özü eyni qalır, ona görə popup-ı artıq bağlamış ziyarətçilərə yenidən avtomatik çıxmır (§4.2); yeni
  ziyarətçilər yeni linki görür.
- **Başlıq dəyişdi** → hər iki dil tabında yeniləyin (dillər arasında avtomatik köçmür).

### 3.4. Yayımı bir dildə gizlətmək / yalnız bir dildə göstərmək

Yayım `/az`-da yalnız AZ başlığı, `/en`-də yalnız EN başlığı varsa görünür. Bir dildən çıxarmaq
üçün həmin dilin **Başlıq** sahəsini tam boşaldıb saxlayın — o dilin tərcüməsi silinir. Həmin dildə
nə popup, nə header düyməsi, nə Media kartı olur.

### 3.5. Eyni anda bir neçə aktiv yayım

Sistem bir neçə yazının eyni anda **Aktiv** olmasına **mane olmur** (biri aktiv ediləndə digərləri
avtomatik söndürülmür). Nəticə:

- **Popup və header düyməsi** həmişə **bir** yayım göstərir — aktivlər arasında **Tarix**-i ən son
  olan (tarixi boş olanlar siyahının sonundadır). Linkində video ID-si olmayan yazı atlanır,
  növbətiyə keçilir.
- **Media səhifəsindəki kart** isə bütün aktiv yayımları siyahı kimi göstərir.

Qarışıqlıq olmasın deyə adətən **yalnız bir** yayımı aktiv saxlayın: yenisini aktiv edəndə köhnəsini
Status düyməsi ilə söndürün.

### 3.6. Yayımı silmək

Siyahıda **Sil** → «"…" qeydi silinsin? Bu əməliyyat geri qaytarıla bilməz.» → təsdiq. Yazı və hər iki
dil başlığı **birdəfəlik** silinir. Keçmiş yayımların tarixçəsi lazımdırsa, silmək əvəzinə
**Qeyri-aktiv** edin — siyahıda qalır, saytda görünmür.

---

## 4. Saytda nə və necə görünür

### 4.1. Popup

Aktiv yayım olanda ziyarətçi saytın **hər hansı** səhifəsini (ana səhifə, xəbər, məzənnə, …) ilk dəfə
açanda ekranın ortasında dialoq çıxır:

```
┌──────────────────────────────────────────────────────────┐
│  [ CANLI ]  Mərkəzi Bankın mətbuat konfransı        [ × ] │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│                  [  YouTube pleyeri  ]                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Başlıq boşdursa (bu dildə yoxdursa yayım onsuz da görünmür) «Canlı yayım» yazılır.
- Video **avtomatik başlamır** — ziyarətçi pleyerdə play-ə basır.
- Popup bağlananda video dayanır (pleyer tamamilə götürülür); yenidən açanda sıfırdan yüklənir.
- Pleyer YouTube-un «nocookie» rejimindədir; başqa mənbə göstərilə bilməz.

### 4.2. Bağlananda nə yadda qalır

Ziyarətçi popup-ı bağlayanda brauzerin **sessiya yaddaşına** (sessionStorage) «bu yayım bağlandı»
qeydi yazılır. Qeyd **yayıma görədir**, səhifəyə görə deyil:

| Hal | Popup avtomatik çıxır? |
|---|---|
| Bağlamadan səhifəni yenilədi | **Bəli** (qeyd yalnız bağlananda yazılır) |
| Bağladı, sonra eyni səhifəni yenilədi | Xeyr |
| Bağladı, başqa səhifəyə keçdi (link, birbaşa ünvan, dil dəyişdiricisi) | Xeyr |
| Bağladı, header-dəki **Canlı yayım** düyməsini basdı | **Açılır** (düymə qeydə baxmır) |
| Yeni tab və ya brauzeri bağlayıb yenidən açdı | **Bəli** (sessiya yaddaşı boşalır) |
| Redaktor **başqa** yayımı aktiv etdi (yeni yazı) | **Bəli** — yeni yayımın öz qeydi yoxdur |
| Redaktor eyni yazının linkini/başlığını dəyişdi | Xeyr — yayım eyni sayılır |
| Brauzerdə yaddaş bloklanıb (private rejim və s.) | Hər səhifədə yenidən çıxır, xəta vermir |

> Bitmiş yayımı silib yenisini **yeni yazı** kimi yaratmaq daha yaxşıdır: köhnə yazının linkini
> dəyişsəniz, popup-ı artıq bağlamış ziyarətçilər yeni yayımı avtomatik görməyəcək.

### 4.3. Header düyməsi

Aktiv yayım olanda header-də, axtarış xanası ilə dil seçimi arasında qırmızı **«Canlı yayım»**
düyməsi görünür (yanında yanıb-sönən nöqtə). Dar ekranlarda düymə header-dən çıxır və **mobil
menyunun** (☰) altında tam enli düymə kimi durur; basanda əvvəl menyu bağlanır, sonra popup açılır.
Aktiv yayım yoxdursa, düymə heç yerdə yoxdur.

### 4.4. Şəkilli popup ilə növbə

Saytda ayrıca **Şəkilli popup** (elan şəkli, admin → Media → Şəkilli popup-lar) da var. İkisi eyni anda
açılmır: canlı yayım popup-ı **birincidir**. Şəkilli popup yalnız canlı yayım popup-ı bağlanandan
sonra (və ya aktiv yayım yoxdursa) çıxır. Hər birinin öz bağlanma qeydi var — birini bağlamaq
o birini bağlamış saymır.

### 4.5. Media səhifəsi

`/az/media` səhifəsinin yuxarısında üç keçid var: **Fotoqalereyalar · Videolar · Canlı yayım**.
Aktiv yayım olanda «Canlı yayım» bölməsində göy kart çıxır: hər yayım bir sətir — başlıq, (varsa)
tarix və **«Yayımı izlə →»** linki (YouTube-un özündə, yeni tabda açılır). Aktiv yayım yoxdursa
kart görünmür, bölmə boş qalır.

### 4.6. Popup nə vaxt görünmür

| Səbəb | Nə etmək |
|---|---|
| Heç bir yazı **Aktiv** deyil | Siyahıda Status düyməsini basın |
| Bu dildə **Başlıq** yoxdur | Həmin dil tabında başlıq yazın |
| Linkdə video ID-si yoxdur (`/@kanal/live`, YouTube olmayan link) | Yayımın özünün linkini qoyun (§2) |
| Ziyarətçi popup-ı bu sessiyada artıq bağlayıb | Normaldır — header düyməsi var; yoxlamaq üçün yeni tab açın |
| API əlçatan deyil | Sayt popup-sız normal açılır — texniki komandaya bildirin |

---

## 5. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] Yayım aktiv edildi, ~10 saniyə gözlənildi, **yeni tabda** `/az/` açıldı — popup çıxdı.
- [ ] Popup-da düzgün video yüklənir, play işləyir.
- [ ] Popup bağlandı → başqa səhifəyə keçildi → popup **çıxmadı**, header düyməsi **var** və açır.
- [ ] `/en/` — ingiliscə başlıq düzgündür (və ya EN qəsdən boşdur və orada görünmür).
- [ ] Brauzer daraldıldı — düymə mobil menyunun altındadır.
- [ ] `/az/media` → «Canlı yayım» kartında yayım və tarix düzgündür.
- [ ] Yayım bitəndən sonra Status düyməsi ilə **Qeyri-aktiv** edildi.

## 6. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Aktiv etdim, popup çıxmır | Bağlanma qeydi var / keş hələ yenilənməyib | Yeni tab açın, 10 san gözləyib yeniləyin |
| Nə popup, nə düymə var, yazı aktivdir | Linkdə video ID-si yoxdur (`/@kanal/live`) | §2 — yayımın öz linkini qoyun |
| Yalnız AZ-da görünür | EN tabında başlıq boşdur | EN başlığı yazın |
| Səhv yayım göstərilir | Bir neçə yazı aktivdir; ən son **Tarix**-li seçilir | Köhnələri Qeyri-aktiv edin və ya tarixləri düzəldin |
| Bitmiş yayım hələ də çıxır | Yazı Qeyri-aktiv edilməyib | Status düyməsi → Qeyri-aktiv |
| Formada «YouTube linki daxil edin…» | Link YouTube host-u deyil və ya `http(s)://` ilə başlamır | YouTube linkini tam kopyalayın |
| Media səhifəsində kart yoxdur | Aktiv yayım yoxdur | Normal — bölmə yalnız aktiv yayımda dolur |
| Saxlayanda «At least one translation is required» | Hər iki dil tabı boşdur | Ən azı bir dildə Başlıq yazın |

---

## Əlavə: developerlər üçün

Spec: `specs/006-live-stream-popup/` (spec, plan, tasks); bağlanma qaydasının son dəyişikliyi commit
`9602b94` (2026-10-22: səhifəyə görə → sessiya boyu, yayıma görə).

| Qat | Yer |
|---|---|
| DB | `video_streams` (`stream_url` varchar(500), `is_live`, `starts_at` timestamptz, `created_at`, `updated_at`) + `video_stream_translations` (`stream_id`, `locale`, `title`; UNIQUE (stream_id, locale)) — `0001-initial-schema.sql:624` |
| Admin API | `api-cbar-admin` → `VideoStreamsController`: `GET/POST /api/v1/video-streams`, `GET/PUT/DELETE /{id}`; icazələr `video_streams.read/create/update/delete`; siyahı `Id DESC`, envelope `{ items }`; yazılar `audit_log`-a `video_streams.*` kimi düşür; silmə **hard delete** |
| Public API | `api-cbar` → `MediaContentController.GetVideoStreams` — `GET /api/v1/video-streams?locale=az\|en`; filtr: `IsLive` + həmin locale-də tərcümə; sıra `StartsAt DESC`; **`StartsAt` embargo deyil** |
| Admin panel | `web-cbar-admin-new`: `features/live-streams/model/module.ts` (`liveStreamsModule`, `apiPath: /video-streams`, `basePath: /live-streams`), `components/live-status-toggle.tsx` (Status sütunu → `PUT` tam DTO ilə), `api/live-streams.service.ts`; YouTube qaydası `shared/crud/youtube-url.ts` (`YOUTUBE_HOSTS`); köhnə `/videos/streams` → redirect `/live-streams`; lokalizasiya `locales/az/liveStreams.json` |
| Sayt | `web-cbar-new`: `app/[locale]/layout.tsx` → `getVideoStreams(locale).catch(() => [])` → `features/media/model/live-stream.ts#toLiveStream` (ilk ID-li yayım) → `shell/site-shell.tsx` → `widgets/live-stream/live-stream-dialog.tsx` + `live-stream-button.tsx` (header `site-header.tsx`, mobil `mobile-nav.tsx`); state `features/live-stream/model/store.ts` (Zustand); bağlanma `features/live-stream/model/dismissal.ts` → `shared/lib/popup-dismissal.ts`, açar `cbar:live-stream:dismissed:<id>` = `'1'` (sessionStorage); YouTube id `features/media/model/youtube.ts`; Media səhifəsi `views/media/loader.ts` → `index.tsx` |
| Keş | `web-cbar-new/src/server/cached.ts` — `cachedJson(…, { keyPrefix: 'video-streams', tag: 'media' })`, `CONTENT_REVALIDATE_SECONDS = 10`, stale-while-revalidate; `revalidateTag` hələ heç yerdən çağırılmır |
| Testlər | sayt: `widgets/live-stream/*.test.tsx`, `features/live-stream/model/live-stream.test.ts`, `shared/lib/popup-dismissal.test.ts`, `widgets/image-popup/image-popup-coexistence.test.tsx`; panel: `features/live-streams/live-streams.test.tsx`; MSW `shared/testing/handlers/live-streams.ts` |

**Qaydalar və bilinən boşluqlar:**

- Admin API `StreamUrl`-i yoxlamır (YouTube qaydası yalnız paneldədir); `Translations.Count == 0` → 400.
  Panel boş locale-i payload-a qoşmur, `PUT` payload-da olmayan locale-in tərcüməsini silir.
- «Yalnız bir aktiv» məhdudiyyəti nə DB-də, nə API-də var; sayt `toLiveStream` ilə siyahının
  ilk uyğun elementini götürür.
- Popup pleyeri `https://www.youtube-nocookie.com/embed/<id>` — CSP `frame-src` buna uyğundur;
  `youtubeId` `/@kanal/live` formasını tanımır (spec Edge Cases).
- Dialoq SSR-də həmişə bağlı render olunur; açılma qərarı `useEffect`-də (`window` yalnız orada).
- Şəkilli popup (`image-popup-dialog.tsx`) canlı yayım açıqdırsa və ya onun bağlanma qeydi yoxdursa
  gözləyir.
- Panel «Tarix» sütunu yalnız tarixi göstərir (`render: 'date'`), forma isə `datetime-local` —
  saat formada görünür, siyahıda yox.
