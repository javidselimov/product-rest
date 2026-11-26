# Sual-cavab — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Sual-cavab»** səhifəsini izah edir: mövzular, suallar və videolar admin paneldən necə idarə olunur və
dəyişiklik saytda harada, necə görünür.

> Köhnə saytda bu səhifə adi CMS mətni idi: 226 sual bir uzun HTML siyahısında yazılmışdı. Yeni saytda **hər sual admin
> paneldə ayrıca qeyddir** (mövzu, sual, cavab), nömrəni və siyahını əl ilə yazmaq lazım deyil. Səhifənin başlığı isə əvvəlki
> kimi **Səhifələr** bölməsindədir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Sual-cavab** (`/faq`). Üç tab: **Suallar**, **Mövzular**, **Videolar** |
| **Sayt (AZ)** | `https://<sayt>/az/sual-cavab` |
| **Sayt (EN)** | `https://<sayt>/en/faq` — ingiliscə suallar hələ yoxdur, bax §8 |
| **Bir mövzu** | `https://<sayt>/az/sual-cavab?topic=pul-siyaseti` |
| **Köhnə ünvan** | `page-131/…` avtomatik yeni səhifəyə yönlənir |

Səhifə **iki yerdən** qurulur:

| Saytda | Haradan gəlir | Admin paneldə |
|---|---|---|
| Başlıq | CMS səhifəsi `sual-cavab` / `faq` | **Səhifələr** → Sual-cavab |
| Mövzu kartları, suallar, cavablar | Sual-cavab bölməsi | **Sual-cavab** → Suallar, Mövzular |
| «Video sual-cavab» kartları | Sual-cavab bölməsi | **Sual-cavab** → Videolar |
| Axtarış sahəsi, «Mövzu», «N sual», «Bax» kimi etiketlər | Saytın sabit etiketləri (az/en) | Dəyişdirilmir |

Dəyişiklik saytda **təsdiqsiz, ən geci ~10 saniyə** sonra görünür (saytın qısa keşi var).

**Kim redaktə edə bilər:** **admin** və **moderator** rolları.

---

## 2. Yayımdan sonra bir dəfəlik hazırlıq

Yeni sayt ilk dəfə yayımlananda köhnə səhifənin məzmunu **avtomatik** köçürülür: **8 mövzu, 226 sual** (az dilində) və **1 video**,
hamısı dərc olunmuş halda. «Pul siyasəti» mövzusu «Pul siyasəti» səhifəsinə bağlanır (bax §6). Paneldə artıq mövzu varsa, heç nə
təkrar yaradılmır. Köhnə səhifənin «Playlist-ə keçid» linki köçürülmür: eyni videoya aparırdı.

Aşağıdakıları bir dəfə edin:

1. **Sual-cavab → Suallar** siyahısında mövzu tablarını bir-bir açıb sualların sayını köhnə səhifə ilə tutuşdurun: Pul siyasəti 23,
   Valyuta ehtiyatlarının idarə olunması 6, Kredit təşkilatlarının fəaliyyəti 39, Ödəniş xidmətləri və ödəniş sistemləri 29,
   Kapital bazarları 18, Sığorta 84, Milli pul nişanları 20, Mərkəzi Banka müraciət və qəbul məsələlərinə dair 7.
2. Cədvəlli cavabları (məsələn, «Milli pul nişanları» → metal pul nişanlarının çəkisi) saytda açıb baxın.
3. Səhifənin köhnə mətni **Səhifələr** bölməsində qalır. Sayt onu yalnız FAQ boş olanda göstərir (bax §9). Silməyin: ehtiyat kimi qalsın.

---

## 3. Sual əlavə etmək

1. **Sual-cavab → Suallar**. Sualın düşəcəyi mövzunun tabını seçin, sonra **Yeni**. Forma həmin mövzu seçilmiş açılır.
   Başqa yol: mövzunun formunda **«Yeni sual»** düyməsi (§5).
2. Sahələri doldurun:

| Sahə | Nə yazılır | Saytda |
|---|---|---|
| **Mövzu** | Siyahıdan seçin (adla axtarmaq olar). Məcburidir | Sualın düşdüyü kart |
| **Status** | Default «Dərc olunub». «Qaralama» saytda görünmür | — |
| **Sual (AZ / EN)** | Sualın mətni. **Nömrəni yazmayın** — sayt sıradan özü qoyur («1. …») | Kartın içində sətir |
| **Cavab (AZ / EN)** | Redaktorda: paraqraf, siyahı, cədvəl, link, şəkil, YouTube | Sual açılanda |

3. **Yadda saxla**. Yeni sual mövzunun **sonuna** düşür.

Qaydalar:

- Ən azı bir dildə həm sual, həm cavab olmalıdır.
- Bir dili tam boş saxlaya bilərsiniz: sual o dildə saytda görünməyəcək. Amma dilə başlamısınızsa, həm sual, həm cavab məcburidir.
  Forma yarımçıq sahənin altında «Bu dildə həm sualı, həm cavabı yazın, ya da hər ikisini boş saxlayın» yazır.
- Yadda saxlamadan formadan çıxsanız, panel soruşur: «Yadda saxlanmamış dəyişikliklər» → **Çıx** və ya **Ləğv et** (formada qalırsınız).

---

## 4. Sualı düzəltmək, köçürmək, silmək

- **Düzəltmək:** siyahıda sətri açın, dəyişin, **Yadda saxla**.
- **Başqa mövzuya köçürmək:** formada **Mövzu**-nu dəyişin. Sual yeni mövzunun sonuna düşür.
- **Müvəqqəti gizlətmək:** statusu «Qaralama» edin.
- **Silmək:** siyahıda sil düyməsi → təsdiq.

Siyahı saytdakı sıradadır (mövzu, sonra sual). Süzgəclər: mövzu tabları, **Axtar** (sual mətnində, az və en), **Status**,
**Tərcümə → EN yoxdur** (ingiliscə tam olmayan suallar). **Dillər** sütununda tam dolu dillər `AZ` / `EN`, boş dil sarı «EN yoxdur»
nişanıdır. Sıra bu siyahıda dəyişmir — mövzunun formunda dəyişir (§5).

---

## 5. Mövzular: ad, sıra, sualların sırası

**Sual-cavab → Mövzular**. Sütunlar: ad, sualların sayı, dillər, bağlı səhifələr, status.

- **Yeni mövzu:** **Yeni** → **Ad (AZ / EN)** (ən azı bir dildə) və **Status** → **Yadda saxla**. Mövzu siyahının sonuna düşür.
- **Mövzuların sırası:** siyahının üstündə **«Sıranı dəyiş»** → pəncərədə sətri sürüşdürün və ya ↑ / ↓ düymələri ilə yerini
  dəyişin. Hər hərəkət **dərhal saxlanır**. **Bağla** ilə çıxın.
- **Sualların sırası:** mövzunu açın. Yadda saxladıqdan sonra formanın altında üç kart görünür:
  - **«Saytda ünvan»** — mövzunun saytdakı ünvanı (`/az/sual-cavab?topic=…`). Açar mövzu yaradılanda adından alınır və
    **dəyişmir**: adı dəyişsəniz də köhnə linklər işləyir.
  - **«Mövzunun sualları»** — saytdakı sıra ilə. Sətri sürüşdürün və ya ↑ / ↓ ilə yerini dəyişin, dərhal saxlanır və saytdakı
    nömrələr dəyişir. Sualın adına klikləyəndə onun forması açılır. **«Yeni sual»** bu mövzu seçilmiş forma açır.
  - **«Saytın menyusunda keçid kartı»** — bax §6.
- **Silmək:** yalnız **boş** mövzu silinir. Sualı olan mövzunu silmək istəsəniz panel yazır: «Mövzuda N sual var — əvvəl onları başqa
  mövzuya keçirin və ya silin».

Mövzu saytda yalnız ən azı bir dərc olunmuş sualı olanda görünür.

---

## 6. Bölmə səhifəsində keçid kartı

Mövzunu saytın istənilən səhifəsinə bağlaya bilərsiniz. Onda həmin səhifənin mətnindən sonra kart görünür:
**«Pul siyasəti üzrə sual-cavab · 23 sual · Bax →»**. Kart mövzunun ayrıca görünüşünü açır.

1. Mövzunu açın → **«Saytın menyusunda keçid kartı»** kartı.
2. **«Səhifə əlavə et»** → səhifəni adla axtarın. Siyahıda səhifələr menyudakı yolu ilə görünür («Pul siyasəti › …»).
3. Seçən kimi saxlanır. Səhifəni ✕ ilə çıxarın, ↑ / ↓ ilə sıralayın. Bir səhifəyə bir neçə mövzu bağlanıbsa, kartlar bu sıra ilə düzülür.

Bu kartdakı dəyişiklik formanın qalan sahələrinə toxunmur: adı dəyişib hələ saxlamamısınızsa, o dəyişiklik itmir.

Bağlı səhifəni **Səhifələr** bölməsində açanda **«Sual-cavab keçid kartı»** kartı ona bağlı mövzuları göstərir və mövzuya aparır.
«Sual-cavab» səhifəsinin özünü açanda isə **«Bu səhifənin məzmunu»** kartı məzmunun **Sual-cavab** bölməsindən gəldiyini yazır.

---

## 7. Videolar

**Sual-cavab → Videolar**. Siyahıda önizləmə şəkli, başlıq, status.

1. **Yeni** → **YouTube linki** (videonun ünvanı: `youtube.com/watch?v=…`, `youtu.be/…`, `…/shorts/…`). Önizləmə şəkli avtomatik götürülür.
2. **Başlıq (AZ / EN)** — ən azı bir dildə. Başlığı olmayan dildə video görünmür.
3. **Yadda saxla**. Video formasında önizləmə və «YouTube-da aç» linki görünür.

Link YouTube videosu deyilsə (məsələn, kanalın və ya axtarışın ünvanıdır), forma «YouTube linki tanınmadı» yazır. Sıra: siyahının
üstündə **«Sıranı dəyiş»**.

---

## 8. Saytda necə görünür

- **Bütün mövzular:** başlıq, axtarış sahəsi, mövzu kartları (bağlı). Kartda mövzunun adı və sualların sayı. Kart açılanda
  nömrələnmiş suallar və **«Ayrıca aç»** linki, sual açılanda cavab. Altda «Video sual-cavab» kartları: klikdə video YouTube-da açılır.
- **Bir mövzu** (`?topic=`): mövzunun adı başlıqdır, suallar düz siyahıdır, yanında mövzu seçimi. «Bütün mövzular» geri qaytarır.
- **Axtarış:** sualda və cavabın mətnində axtarır. Böyük-kiçik hərf və İ/ı fərqi nəzərə alınmır. Uyğun suallar açıq gəlir. Heç nə
  tapılmasa «… üzrə sual tapılmadı» və «Axtarışı təmizlə» linki görünür.
- **Sualın linki:** hər sualın öz ünvanı var: `…/sual-cavab#sual-101` (rəqəm sualın paneldəki nömrəsidir — formanın ünvanında `/faq/101`).
  Belə link açılanda mövzu və sual özü açılır.
- **Footer:** «Naviqasiya» sütununda «Sual-cavab» linki.
- **Çap:** bütün kartlar açıq çap olunur.

### İngilis dili

İngiliscə suallar hələ yazılmayıb. Mövzuların ingiliscə adları var, amma sualı olmayan mövzu görünmür, yəni ingiliscə səhifə FAQ
əvəzinə səhifənin öz ingiliscə mətnini göstərir (səhifənin ingiliscə versiyası varsa). Tərcümə üçün: **Suallar → Tərcümə → EN yoxdur**,
sualı açın, **EN** tabında sual və cavabı yazın. İlk ingiliscə sual dərc olunan kimi ingiliscə FAQ özü işə düşür. Footer-in ingiliscə
«FAQ» linki yalnız ingiliscə səhifə olanda görünür.

---

## 9. Yoxlama siyahısı

- [ ] Yeni sual saytda öz mövzusunda, düzgün nömrə ilə görünür
- [ ] Cavabdakı cədvəl, link və şəkillər saytda düzgün görünür
- [ ] Axtarış sualı tapır (sualın və cavabın sözü ilə)
- [ ] Sualın linki (`#sual-…`) sualı açır
- [ ] Bağlı səhifənin altında keçid kartı var və mövzunu açır
- [ ] Video kartı YouTube-da düzgün videonu açır

---

## 10. Tez-tez rast gəlinən hallar

| Vəziyyət | Səbəb və həll |
|---|---|
| Yeni sual saytda yoxdur | Status «Qaralama»dır, ya həmin dildə sual və ya cavab boşdur. ~10 saniyə gözləyib səhifəni yeniləyin |
| Mövzu saytda yoxdur | Mövzu «Qaralama»dır, həmin dildə adı yoxdur və ya dərc olunmuş sualı yoxdur |
| Saytda bütün suallar əvəzinə köhnə mətn görünür | Heç bir mövzu görünmür (hamısı qaralama, boş) və ya xidmət müvəqqəti cavab vermir. Sayt belə halda səhifənin öz mətnini göstərir |
| Nömrələr səhv görünür | Nömrə sıradan gəlir. Mövzunun formunda **«Mövzunun sualları»** ilə sıranı düzəldin. Mətnə nömrə yazmayın |
| Mövzunu silə bilmirəm | Mövzuda sual var. Sualları başqa mövzuya köçürün və ya silin |
| Keçid kartı səhifədə görünmür | Mövzunun həmin dildə dərc olunmuş sualı yoxdur və ya səhifə mövzuya bağlanmayıb (§6) |
| «Sıra siyahısı bütün elementləri bir dəfə saxlamalıdır…» xətası | Başqa redaktor eyni anda sual əlavə edib və ya silib. Səhifəni yeniləyib yenidən cəhd edin |
| «YouTube linki tanınmadı» | Link videonun deyil. Videonu YouTube-da açıb ünvan sətrindəki linki köçürün |

---

## 11. Developerlər üçün

- Spec: `specs/051-faq-page/` (spec, plan, tasks, `contracts/`). Seed: `api-cbar-admin/db/migrations/0033-faq-seed.sql`, generatoru
  `specs/051-faq-page/seed/`. Cədvəllər `0032-faq.sql`.
- Admin API: `/api/v1/faq/topics`, `/faq/questions`, `/faq/videos` (+ `…/order`, `…/topics/{id}/questions/order`), icazələr `faq.*`.
  Public API: `GET /api/v1/faq?locale=`, `GET /api/v1/faq/topics?pageId=&locale=`.
- Panel: `web-cbar-admin-new/src/features/faq`, `pages/faq`, `shared/ui/sortable-list.tsx`.
- Sayt: `web-cbar-new/src/views/faq`, `widgets/faq`, `features/faq`; redaktor qeydi `web-cbar-new/docs/faq-cms-guide.md`.
- Köhnə ünvan `page-131` canlı bazada başqa id-dirsə, `web-cbar-new/src/proxy.ts` `LEGACY_FAQ_PAGE` deploy-dan əvvəl düzəldilir.
