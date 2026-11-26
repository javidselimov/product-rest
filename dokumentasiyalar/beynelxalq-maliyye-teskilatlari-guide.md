# Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq»** səhifəsini izah edir: Mərkəzi Bankın əməkdaşlıq
etdiyi təşkilatların (Dünya Bankı Qrupu, Beynəlxalq Valyuta Fondu, Asiya İnkişaf Bankı, Avropa Yenidənqurma və İnkişaf Bankı)
kartları admin paneldən necə idarə olunur, üzvlük tarixləri haradan gəlir və dəyişiklik saytda harada, necə görünür.

> Köhnə saytda bu səhifə adi CMS mətni idi: hər təşkilat qalın başlıq (`Dünya Bankı`), bir neçə paraqraf, siyahı və sayt linki.
> Loqo, ayrıca üzvlük ili və açılıb-bağlanan kart yox idi. Yeni saytda **hər təşkilat admin paneldə ayrıca qeyddir**: loqo, ad,
> üzvlük ili, missiya, üzvlük tarixləri və mətn öz sahələrindədir, HTML yazmaq lazım deyil, redaktorun səhvi kartların
> görünüşünü pozmur. Səhifənin başlığı və giriş mətni isə əvvəlki kimi **Səhifələr** bölməsindədir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Məzmun** → **Maliyyə təşkilatları** (`/ifi-organizations`) |
| **Sayt (AZ)** | `https://<sayt>/az/beynelxalq-teskilatlarla-emekdasliq` |
| **Sayt (EN)** | `https://<sayt>/en/cooperation-with-international-organizations` |
| **Saytda yolu** | **Beynəlxalq əməkdaşlıq** → sol menyuda bu səhifə |
| **Ünvan** | Dəyişməyib, köhnə səhifənin slug-ıdır. Yönləndirmə lazım deyil |

Səhifə **iki yerdən** qurulur:

| Saytda | Haradan gəlir | Admin paneldə |
|---|---|---|
| Başlıq və giriş mətni | CMS səhifəsi `beynelxalq-teskilatlarla-emekdasliq` / `cooperation-with-international-organizations` | **Səhifələr** → Beynəlxalq əməkdaşlıq → bu səhifə |
| Təşkilat kartları | Maliyyə təşkilatları | **Maliyyə təşkilatları** |
| «Əməkdaşlıq edilən təşkilatlar», «Üzvlük:», «Əsas missiya» | Saytın sabit etiketləri (az/en) | Dəyişdirilmir |

Dəyişiklik saytda **təsdiqsiz, ən geci ~10 saniyə** sonra görünür (saytın qısa keşi var). Saxladıqdan sonra səhifəni bir-iki
dəfə yeniləmək kifayətdir.

**Kim redaktə edə bilər:** **admin** və **moderator** rolları. Başqa rolun istifadəçisi bölməni açanda «icazə yoxdur» xətası görür.

---

## 2. Yayımdan sonra bir dəfəlik hazırlıq

Yeni sayt ilk dəfə yayımlananda Figma-dakı dörd təşkilat **avtomatik** yaradılır, az və en mətnləri ilə, dərc olunmuş halda:

| Sıra | Təşkilat | Üzvlük ili | Sayt | Üzvlük tarixləri |
|---|---|---|---|---|
| 10 | Dünya Bankı Qrupu | 1992 | www.worldbank.org | 5 tarix (aşağıda) |
| 20 | Beynəlxalq Valyuta Fondu | 1992 | www.imf.org | — |
| 30 | Asiya İnkişaf Bankı | 1999 | www.adb.org | — |
| 40 | Avropa Yenidənqurma və İnkişaf Bankı | 1992 | www.ebrd.com | — |

Dünya Bankı Qrupunun tarixləri: 18.09.1992 Beynəlxalq Yenidənqurma və İnkişaf Bankı · 23.09.1992 Çoxtərəfli İnvestisiya
Zəmanətləri Agentliyi · 18.10.1992 Beynəlxalq İnvestisiya Mübahisələrinin Həlli Mərkəzi · 31.03.1995 Beynəlxalq İnkişaf
Assosiasiyası · 11.10.1995 Beynəlxalq Maliyyə Korporasiyası.

Eyni anda səhifənin az başlığı **«Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq»** olur və mətnin əvvəlinə Figma-dakı giriş
paraqrafı əlavə olunur — **yalnız** başlıq hələ köhnə «Beynəlxalq təşkilatlarla əməkdaşlıq» idisə. Başlığı əvvəlcədən özünüz
dəyişmisinizsə, səhifəyə toxunulmur. Panel artıq təşkilat varsa heç nəyi təkrar yaratmır.

Aşağıdakıları bir dəfə edin:

### 2.1. Loqoları yükləyin

Avtomatik köçürmə fayl yükləyə bilmir, ona görə kartlar əvvəlcə **loqosuz** görünür (ad sola keçir, kart bir az alçaq olur).

1. **Media** bölməsində dörd loqonu yükləyin.
2. **Maliyyə təşkilatları** → təşkilatın üzərinə klikləyin → **Loqo** sahəsindən yüklədiyiniz şəkli seçin → **Yadda saxla**.

Loqo kartın başlığında **103×58** qutuda göstərilir, qutuya sığdırılır (kəsilmir). Ən yaxşı nəticə üçün:

- şəffaf fonlu **PNG** və ya **SVG**;
- eni hündürlüyünün təxminən **1,8 qatı** (məs. 206×116, 412×232) — başqa nisbətdə şəklin yanlarında və ya üstündə boşluq qalır;
- yalnız şəkil faylı qəbul olunur; PDF və ya başqa fayl seçsəniz panel «The logo must be an image.» mesajını göstərir.

### 2.2. İngiliscə mətnləri yoxlayın

Figma-da yalnız Azərbaycan mətni var. İngiliscə mətnlər köhnə saytın en səhifəsindən götürülüb, olmayanlar **tərcümə
qaralamasıdır**:

| Təşkilat | EN mətnin mənbəyi |
|---|---|
| Hamısı — **«Main mission»** (Əsas missiya) | tərcümə qaralaması |
| Dünya Bankı Qrupu, BVF, Asiya İnkişaf Bankı — mətn və tarixlərin adları | köhnə en səhifəsi |
| Avropa Yenidənqurma və İnkişaf Bankı — bütün en mətni | tərcümə qaralaması (köhnə saytda bu təşkilat yox idi) |

Hər təşkilatı açın, **EN** tabını oxuyun və lazım olsa düzəldin.

### 2.3. Başlıq və girişi yoxlayın

Saytda başlıq «Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq», altında bir cümləlik giriş olmalıdır:

> Azərbaycan Respublikasının Mərkəzi Bankı (ARMB) Dünya Bankı Qrupu, Beynəlxalq Valyuta Fondu, Asiya İnkişaf Bankı və Avropa
> Yenidənqurma və İnkişaf Bankı ilə əməkdaşlıq edir.

Görünmürsə (məsələn, başlıq yayımdan əvvəl dəyişdirilib), **Səhifələr**-də əl ilə yazın — bax §5. İngilis başlığı
(«Cooperation with international organizations») avtomatik dəyişmir; istəsəniz özünüz dəyişin.

### 2.4. SECO

Köhnə səhifədə beşinci təşkilat — **İsveçrənin İqtisadi Məsələlər üzrə Dövlət Katibliyi (SECO)** — var idi. Figma-da olmadığı
üçün kartı yaradılmayıb; köhnə mətni səhifədə qalır, amma saytda görünmür (§5.2). Lazımdırsa **Yeni** ilə əlavə edin (§3.1).

### 2.5. Sol menyunun adları

Sol menyu bölmənin səhifə ağacından qurulur. Figma-da bəndlər «Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq», «Mərkəzi
banklarla əməkdaşlıq», «Beynəlxalq təşkilatlarda üzvlük»-dür. Adları və sıranı **Səhifələr**-də dəyişin; menyudan gizlətmək
üçün səhifə formunun **«Saytın menyusunda»** kartında **«Menyularda yox»** seçin.

---

## 3. Təşkilatlar

**Maliyyə təşkilatları** siyahısı bütün təşkilatları göstərir: **ID · Ad · Üzvlük ili · Tarixlər** (üzvlük tarixlərinin sayı)
**· Sıra · Status**. Siyahı saytdakı kimi **Sıra** rəqəminə görə düzülüb.

**Axtarış və filtr:** yuxarıdakı axtarış sahəsi adda axtarır (hər iki dildə); **Status** filtri ilə süzmək olar.

### 3.1. Yeni təşkilat əlavə etmək

1. **Maliyyə təşkilatları** → **Yeni**.
2. Sahələri doldurun:

| Sahə | Məcburi | Qeyd |
|---|---|---|
| Status | bəli | Saytda yalnız **Dərc olunub** görünür. **Qaralama** və **Arxiv** görünmür. «Planlaşdırılıb» seçimi yoxdur |
| Sıra | yox | Kartlar saytda bu rəqəmə görə, kiçikdən böyüyə düzülür. Default 0 |
| Azərbaycan dilində göstər / İngilis dilində göstər | — | Default ikisi də işarəlidir. İşarəni götürsəniz kart həmin dilin saytında görünmür |
| Loqo | yox | Media kitabxanasından şəkil (§2.1). Boş qalsa başlıqda yalnız ad görünür |
| Üzvlük ili | yox | Dörd rəqəm, **1900–2100**. Kartın başlığında sağda «Üzvlük: 1992». Boş qalsa göstərilmir |
| Sayt ünvanı | yox | Tam ünvan, **`https://` və ya `http://` ilə**: `https://www.worldbank.org`. `www.worldbank.org` yazsanız forma saxlamır |
| **Ad** (AZ / EN) | bəli, ən azı bir dildə | Kartın başlığı |
| Əsas missiya (AZ / EN) | yox | Açılan kartın yuxarısındakı göy qutunun mətni. Boş qalsa qutu görünmür |
| Üzvlük tarixlərinin başlığı (AZ / EN) | yox | Tarix kartlarının üstündəki qalın sətir: «Azərbaycan DB Qrupuna daxil olan beş quruma aşağıda qeyd olunan tarixlərdə üzv olmuşdur:» |
| Mətn (AZ / EN) | yox | Tarixlərdən sonrakı adi mətn (paraqraf, siyahı, link — redaktor) |

3. **Yadda saxla**. Saxladıqdan sonra formanın altında **Üzvlük tarixləri** bölməsi görünür (§4).

**Dillər haqqında:** hansı dilin tabında heç nə yazmasanız, kart həmin dilin saytında görünmür. Bir dildə yazmağa başlamısınızsa
(məs. yalnız EN missiyasını doldurmusunuz), həmin dildə **Ad** da məcburidir — forma «Bu dilin adını yazın və ya dili tam boş
saxlayın» mesajını göstərəcək.

### 3.2. Təşkilatı redaktə etmək

Siyahıda təşkilatın üzərinə klikləyin, dəyişin, **Yadda saxla**. Dildən birini tam silmək üçün həmin dilin tabındakı bütün
sahələri boşaldın — kart o dilin saytından çıxır.

### 3.3. Sırasını dəyişmək

Kartlar **Sıra** rəqəminə görə düzülür. Avtomatik yaradılan təşkilatlar 10, 20, 30, 40 ilə nömrələnib, ona görə ikisinin arasına
yeni təşkilat qoymaq üçün aradakı rəqəmi verin (məs. 20 ilə 30 arasına 25).

### 3.4. Təşkilatı gizlətmək və silmək

- **Müvəqqəti gizlətmək:** Statusu **Qaralama** edin. Təşkilat paneldə qalır, saytdan çıxır.
- **Bir dildə gizlətmək:** «… dilində göstər» işarəsini götürün.
- **Silmək:** siyahıda **Sil** düyməsi → təsdiq. Silinən təşkilat siyahıdan və saytdan çıxır (məlumat bazada qalır, geri qaytarmaq
  üçün developerə müraciət edin).

**Loqo kimi istifadə olunan şəkil** media kitabxanasından silinmir — panel «File is attached to content; detach it first.»
mesajını göstərir. Əvvəl təşkilatın **Loqo** sahəsini boşaldın və ya başqa şəkil seçin.

---

## 4. Üzvlük tarixləri

Açılan kartın ortasındakı **tarix kartlarıdır**: hər birində tarix (`gün.ay.il`) və qurumun adı. Məsələn, Dünya Bankı Qrupunun
beş qurumu. Tarixlər təşkilatın formasında ayrıca bölmədədir və **yalnız təşkilat bir dəfə yadda saxlanandan sonra** görünür.

### 4.1. Tarix əlavə etmək

1. Təşkilatı açın, formanın altında **Üzvlük tarixləri** bölməsinə enin.
2. **Tarix əlavə et**.
3. **Tarix** seçin, **Qurumun adı (AZ)** və **Qurumun adı (EN)** yazın.
4. **Tarixi saxla**. Tarix siyahının sonuna əlavə olunur.

| Mesaj | Səbəb |
|---|---|
| «Tarixi seçin» | Tarix boşdur |
| «Ən azı bir dildə qurumun adını yazın» | Hər iki ad boşdur |

Ad hansı dildə boşdursa, o tarix **həmin dilin saytında görünmür**.

### 4.2. Redaktə, sıra, silmə

Hər tarixin sətrində düymələr var:

| Düymə | Nə edir |
|---|---|
| ↑ / ↓ | Tarixi yuxarı / aşağı aparır. Saytda tarix kartları bu sıra ilə düzülür (tarixə görə avtomatik sıralanmır) |
| ✏️ | Tarixi və adları redaktə etmək üçün formanı açır → **Tarixi saxla** |
| 🗑 | Silmə təsdiqi → **Sil** |

Tarix əlavə etmək, dəyişmək və silmək **dərhal** saxlanır — təşkilatın **Yadda saxla** düyməsini basmaq lazım deyil.

---

## 5. Səhifənin başlığı və giriş mətni

**Səhifələr** → **Beynəlxalq əməkdaşlıq** → **Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq**.

### 5.1. Başlıq

Saytda səhifənin başlığı (H1), breadcrumb-un son elementi və brauzer tabının adıdır. Sol menyudakı ad da buradandır.

### 5.2. Giriş mətni və köhnə siyahı

Səhifənin **Mətn** sahəsindən saytda yalnız **giriş** göstərilir: mətnin əvvəlindən **ilk qalın başlıq sətrinə** qədər olan hissə.
Qalın başlıq sətri dedikdə:

- yalnız qalın sözdən ibarət paraqraf — məs. **Dünya Bankı** (redaktorda **B** düyməsi ilə, sətirdə başqa söz yoxdur);
- və ya Başlıq 2 / 3 / 4.

Köhnə saytın təşkilat siyahısı məhz belə başlıqla başlayır, ona görə saytda **görünmür** — kartlar onun yerini tutur. Mətn panel
ehtiyat kimi qalır; istəsəniz silə bilərsiniz.

Qaydalar:

- **Giriş mətnində qalın başlıq sətri yazmayın.** Yazsanız, ondan sonrakı hər şey saytda görünməz.
- Cümlənin içindəki qalın söz başlıq sayılmır — «ARMB **dörd** təşkilatla…» kimi yazmaq olar.
- **Heç bir dərc olunmuş təşkilat yoxdursa** (və ya məlumat müvəqqəti alınmırsa), sayt səhifənin **bütün mətnini** — köhnə siyahı
  ilə birlikdə — göstərir. Bu, ziyarətçinin boş səhifə görməməsi üçündür.

### 5.3. Slug-a toxunmayın

Kartların görünüşü səhifənin ünvanına bağlıdır: az `beynelxalq-teskilatlarla-emekdasliq`, en
`cooperation-with-international-organizations`. Slug dəyişdirilsə, səhifə adi mətn kimi göstərilir və kartlar itir.

### 5.4. «(Kopya)» səhifəsi

«Beynəlxalq əməkdaşlıq (Kopya)» altındakı nüsxə (`…-copy` slug-ı) də eyni kartları göstərir — yeni mətni canlı səhifəyə
toxunmadan orada hazırlaya bilərsiniz.

---

## 6. Saytda nə görünür

### 6.1. Səhifənin quruluşu

Yuxarıdan aşağı: breadcrumb (Ana səhifə › Beynəlxalq əməkdaşlıq › səhifə) və paylaşma düymələri → solda bölmənin menyusu →
başlıq → giriş mətni → **«Əməkdaşlıq edilən təşkilatlar»** başlığı → təşkilat kartları, bir-birinin altında.

Heç bir dərc olunmuş təşkilat yoxdursa, «Əməkdaşlıq edilən təşkilatlar» başlığı da görünmür (§5.2).

### 6.2. Kart

Səhifə açılanda **bütün kartlar bağlıdır**. Bağlı kartda bir sətir var:

**[loqo] Ad ................................................ Üzvlük: 1992 ⌄**

Ziyarətçi sətrə klikləyəndə kart açılır, ox yuxarı dönür; yenidən klik bağlayır. Kartlar bir-birindən asılı deyil — bir neçəsi
eyni anda açıq ola bilər.

Açıq kartda, sıra ilə:

1. **Əsas missiya** — açıq göy qutu, başlıq tünd göy;
2. **Üzvlük tarixlərinin başlığı** — qalın sətir;
3. **Tarix kartları** — haşiyəli kartlar, tarix tünd göy qalın (`18.09.1992`), altında qurumun adı;
4. **Mətn**;
5. **Sayt linki** — altdan xətli `www.worldbank.org ↗`, **yeni pəncərədə** açılır. Linkin mətni ünvanın özüdür, ayrıca yazılmır.

Boş sahə öz hissəsini göstərmir: missiyası olmayan kartda göy qutu, tarixi olmayan kartda tarix kartları, sayt ünvanı olmayan
kartda link yoxdur.

### 6.3. Ekran ölçüləri

| Ekran | Fərq |
|---|---|
| **Desktop** | Tarix kartları sətirdə 3 |
| **Planşet** | Tarix kartları sətirdə 2 |
| **Mobil** | Tarix kartları bir-birinin altında; «Üzvlük: 1992» adın altına keçir |

### 6.4. Əlçatanlıq və çap

- Kartlar **JavaScript olmadan** da açılıb bağlanır.
- Klaviatura: **Tab** ilə karta keçin, **Enter** və ya **Boşluq** ilə açın.
- **Çap** edəndə bağlı kartlar da açıq çap olunur.
- İngilis saytında etiketlər: «Cooperating organizations», «Membership: 1992», «Main mission».

---

## 7. Yoxlama siyahısı

- [ ] Dörd təşkilatın **loqosu** yüklənib və kartda düzgün görünür.
- [ ] **EN** mətnləri oxunub və düzəldilib (§2.2).
- [ ] Hər təşkilatın statusu **Dərc olunub**-dur; kartlar istədiyiniz sırada düzülüb.
- [ ] Dünya Bankı Qrupunun 5 tarixi düzgün sırada və hər iki dildə adla görünür.
- [ ] Sayt linkləri açılır və yeni pəncərədə açılır.
- [ ] Başlıq və giriş mətni Figma-dakıdır, altında köhnə siyahı görünmür.
- [ ] Səhifə açılanda bütün kartlar bağlıdır, hər biri klikdə açılır.
- [ ] İngilis saytında (`/en/cooperation-with-international-organizations`) kartlar və etiketlər yoxlanıb.
- [ ] Sol menyuda bölmənin bəndləri Figma-dakı adlarla və sırada görünür.

---

## 8. Tez-tez rast gələn problemlər

| Problem | Səbəb | Həll |
|---|---|---|
| Kart saytda yoxdur | Status **Dərc olunub** deyil və ya təşkilat silinib | Statusu dəyişin |
| Kart yalnız bir dildə yoxdur | O dildə **Ad** boşdur və ya «… dilində göstər» işarəsi götürülüb | Həmin dilin tabını doldurun / işarəni qoyun |
| «Üzvlük tarixləri» bölməsi görünmür | Təşkilat hələ yadda saxlanmayıb | Əvvəl **Yadda saxla** |
| Tarix bir dildə yoxdur | Həmin dildə qurumun adı boşdur | ✏️ ilə adı yazın |
| Tarixlər səhv sıradadır | Sıra əl ilədir, tarixə görə avtomatik deyil | ↑ / ↓ ilə düzəldin |
| Forma saxlamır: «Ünvan http:// və ya https:// ilə başlamalıdır» | Sayt ünvanı `www.` ilə yazılıb | `https://www.…` yazın |
| Sayt linki kartda görünmür | Sayt ünvanı boşdur | Ünvanı yazın |
| Üzvlük ili saxlanmır | İl 1900–2100 aralığında deyil | Düzgün il yazın |
| «The logo must be an image.» | Loqo kimi şəkil olmayan fayl seçilib | PNG / SVG / JPG seçin |
| Loqo kənarlarında boşluq var | Şəklin nisbəti 103×58 deyil | Eni hündürlüyünün ~1,8 qatı olan şəkil yükləyin |
| Media kitabxanasında şəkil silinmir | Şəkil təşkilatın loqosudur | Əvvəl təşkilatda loqonu dəyişin |
| Giriş mətninin bir hissəsi saytda görünmür | Girişdə qalın başlıq sətri var | Həmin sətri adi paraqraf edin (§5.2) |
| Saytda köhnə təşkilat siyahısı görünür | Dərc olunmuş təşkilat yoxdur və ya məlumat müvəqqəti alınmır | Təşkilatları dərc edin; problem qalırsa developerə yazın |
| Səhifə adi mətn kimi görünür, kart yoxdur | Səhifənin slug-ı dəyişdirilib | Slug-ı qaytarın (§5.3) |
| Səhifə sol menyuda yoxdur | «Saytın menyusunda» kartında seçim «Bütün menyularda» deyil | **Səhifələr**-də «Bütün menyularda» seçin |
| Dəyişiklik görünmür | Saytın 10 saniyəlik keşi | Bir az gözləyib səhifəni yeniləyin |

---

## 9. Figma ilə fərqlər

| Figma | Saytda | Səbəb |
|---|---|---|
| Frame-də birinci kart (Dünya Bankı) açıq göstərilir | Səhifə açılanda **bütün kartlar bağlıdır** | 2026-11-13 qərarı |
| Kartda həmişə loqo var | Loqo yüklənənə qədər kart loqosuz, bir az alçaq | Loqolar avtomatik yüklənmir (§2.1) |
| Yalnız desktop dizaynı | Planşetdə 2, mobildə 1 sütun tarix kartı; mobildə il adın altında | Kiçik ekranlar Figma-da yoxdur |
| Yalnız Azərbaycan mətni | İngilis mətni köhnə saytdan və ya qaralama | §2.2 |

---

## 10. Developerlər üçün

Spec: `specs/044-ifi-cooperation/` (spec, plan, research, data-model, `contracts/{api,ui-contract}.md`, quickstart, tasks).

- **Cədvəllər:** `ifi_organizations`, `ifi_organization_translations`, `ifi_memberships`, `ifi_membership_translations` — miqrasiya
  `0025-ifi-organizations.sql` (yeni cədvəllər, şərti FK-lar, `member_since` CHECK 1900–2100, `cbar_web_ro` SELECT). Seed
  `0026-ifi-organizations-seed.sql`: `ifi_organizations` boşdursa və `locales` az/en varsa 4 təşkilat + DB-nin 5 tarixi; səhifə 121-in
  az başlığı/girişi yalnız başlıq köhnədirsə və `page_translations`-a UPDATE icazəsi varsa.
- **İcazələr:** `ifi.read/create/update/delete`, moderator roluna verilir; yazmalar `audit_log`-a (`ifi.*`, `ifi.membership_*`).
- **Admin API:** `/api/v1/ifi-organizations` (CRUD, soft delete) və `/{id}/memberships` (`POST`, `PUT /{membershipId}`,
  `DELETE /{membershipId}`, `PUT /order` dəqiq id dəsti ilə). Loqo `MediaController.Delete`-in "istifadədədir" yoxlamasındadır.
- **Public API:** `GET /api/v1/ifi-organizations?locale=` — `published`, silinməmiş, dildə görünən və tərcüməsi olan; tarixlərdən
  yalnız həmin dildə adı olanlar; səhifələmə yoxdur.
- **Sayt:** layout `ifi-organizations` — `features/about-content/model/layouts.ts` `cooperationLayoutFor` (az/en slug + `-copy`);
  kəsmə `features/about-content/model/ifi-organizations.ts` (ilk heading line); kart `widgets/about-blocks/ifi-organization-card.tsx`
  (native `<details>`, `open` yoxdur, `data-accordion` → çap qaydası; `<details>`-də `gap` yox, məzmuna `mt-4` — Chrome bağlı kartın
  gizli məzmununu flex uşağı sayır). Loader `http(s)` olmayan sayt ünvanını atır. API xətasında `[]` → tam CMS mətni.
- **Admin panel:** `features/ifi-organizations` (`model/module.ts`, `components/ifi-memberships-section.tsx` — `editExtras`).
- **Layout guard:** `features/about-content/fixtures/ifi-organizations.html` (sayt) = `features/rich-text/fixtures/layouts/ifi-organizations.html`
  (panel), `EXPECTED_BLOCKS`, `roundtrip.test.ts`.
- **Deploy sırası:** `api-cbar-admin` → `api-cbar` → `web-cbar-new`; `web-cbar-admin-new` `api-cbar-admin`-dən sonra. Sayt köhnə API ilə
  də işləyir: endpoint yoxdursa səhifənin CMS mətnini göstərir.
- **Sonrakı iş:** təşkilat mətnləri sayt axtarışında yoxdur (`api-cbar` `SearchController`) — `business_logic/diff_report_logic.md` §5.1.
- Redaktor qeydi saytın öz repo-sunda da var: `product-rest/web-cbar-new/docs/cooperation-cms-guide.md`.
