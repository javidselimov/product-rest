# Müsahibələr və çıxışlar — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Müsahibələr və çıxışlar»** bölməsindəki materialları admin paneldən necə
əlavə etməyi və düzəltməyi, dəyişikliyin saytda harada, necə görünəcəyini izah edir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Məzmun** → **Press relizlər** (`/press-releases`), süzgəc **Növ: Müsahibə və çıxış** |
| **Sayt, siyahı (AZ)** | `https://<sayt>/az/press-releases?type=3` |
| **Sayt, siyahı (EN)** | `https://<sayt>/en/press-releases?type=3` |
| **Sayt, material** | `https://<sayt>/az/press-releases/<materialın-ünvanı>` |
| **Saytda yolu** | Media → **Müsahibələr və çıxışlar** (sol menyu) |

Ayrıca «Müsahibələr» bölməsi yoxdur. Hər material bir **press relizdir**, sadəcə **Növ** sahəsində
**Müsahibə və çıxış** seçilib. Xəbər və Elanlarla eyni siyahıda saxlanılır, saytda isə öz şablonu
ilə görünür:

| | Xəbər | Elan | **Müsahibə və çıxış** |
|---|---|---|---|
| Siyahıda şəkil | var | yoxdur | **var** |
| Material səhifəsində örtük şəkli | var | yoxdur | **yoxdur** |
| Material səhifəsində tarix | var | var | **yoxdur** (tarix yalnız siyahıda) |
| «PDF kimi yüklə» düyməsi | yoxdur | yoxdur | **var** |

Dəyişiklik saytda **ən geci ~10 saniyəyə** görünür; səhifəni yeniləmək kifayətdir.

**Ən vacib dörd qayda:**

1. **Növ** sahəsi yeni formada **«Xəbər»** ilə açılır. Dəyişməyi unutsanız, material Xəbərlərə düşür.
2. Fayllar (PDF, şəkil) **yalnız material bir dəfə yadda saxlanandan sonra** əlavə olunur.
3. Saytda görünmək üçün həm **Status: Dərc olunub**, həm də **keçmiş tarix** lazımdır.
4. Hər fayla **dil** seçin: AZ fayla `AZ`, EN fayla `EN`. Dil seçilməsə, fayl hər iki dildə görünür.

---

## 2. Hazırlıq: faylları əvvəlcədən yükləyin

Material formasında kompüterdən fayl yükləmək olmur, yalnız **Media kitabxanasında artıq olan**
faylı seçmək olur. Ona görə əvvəlcə:

1. Sol menyu → **Media kitabxanası** → **Fayl yüklə**.
2. PDF-ləri yükləyin: **hər dil üçün ayrı fayl** (azərbaycanca və ingiliscə).
3. Siyahı kartı üçün şəkli yükləyin (jpg, png, webp).

**Fayl adı.** Faylın adını yükləməzdən **əvvəl** kompüterdə düzəldin. Paneldə faylın adını sonradan
dəyişmək olmur, «Əlavə sənədlər» siyahısında isə ziyarətçi məhz bu adı görür. Məsələn
`Global-Finance-musahibe-az.pdf` yaxşıdır, `scan_0012.pdf` pisdir.

**Şəkil.** Kart nisbəti 312×197-dir (təxminən 16:10). Başqa nisbətli şəkil sıxılmır, qutunu dolduracaq
şəkildə kənarlardan kəsilir. Vacib hissəni (məs. üzü) şəklin ortasında saxlayın.

**Limitlər.** Fayl ən çox 250 MB ola bilər. İcazəli formatlar: jpg, png, gif, webp, svg, pdf, xlsx,
xls, docx, doc, zip, xml.

> Eyni fayl ikinci dəfə yüklənsə, sistem onu yenidən saxlamır, mövcud olanı qaytarır. Ona görə ad və
> tarix köhnə görünə bilər. Bu normaldır. Eyni səbəbdən faylın **adını kompüterdə dəyişib yenidən
> yükləmək köhnə adı dəyişmir**: fayl eyni olduğu üçün sistem köhnə adlı qeydi qaytarır.

---

## 3. Forma necə qurulub

Forma yuxarıdan aşağı üç hissədən ibarətdir:

```
┌ Tərcümələr ──────────────────────────────────────────────┐
│  [ AZ ] [ EN ]                                           │
│  Başlıq *                                                │
│  Məzmun  (mətn redaktoru)                                │
└──────────────────────────────────────────────────────────┘
┌ Ümumi sahələr ───────────────────────────────────────────┐
│  Növ *  ·  Status  ·  Dərc tarixi                        │
└──────────────────────────────────────────────────────────┘
┌ Şəkillər və sənədlər ──────────  [ + Sənəd əlavə et ] ───┐
│  yalnız mövcud materialı redaktə edəndə görünür          │
└──────────────────────────────────────────────────────────┘
```

**Tərcümələr (AZ və EN tabları ayrıca doldurulur):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Başlıq** \* | Materialın adı | Kartın başlığı (3 sətirdən uzundursa kəsilir, sonda «…»), material səhifəsinin başlığı, yüklənən PDF-in adı, səhifənin ünvanı. |
| **Məzmun** | Müsahibənin və ya çıxışın mətni | Material səhifəsində başlığın altında. Boş ola bilər (bax 4.5). |

\* **Başlıq** ən azı bir dildə mütləq doldurulmalıdır.

**Ümumi sahələr (hər iki dil üçün eynidir):**

| Sahə | Nə seçilir | Saytda təsiri |
|---|---|---|
| **Növ** \* | **Müsahibə və çıxış** | Hansı siyahıda və hansı şablonla görünəcəyini təyin edir. Default **Xəbər**dir. |
| **Status** | Qaralama, Planlaşdırılıb, Dərc olunub, Arxiv | Saytda **yalnız «Dərc olunub»** görünür. Default **Qaralama**dır. |
| **Dərc tarixi** | Tarix və saat | Kartdakı tarix, siyahının sırası, saytdakı tarix süzgəci. Boşdursa material saytda görünmür. |

**Şəkillər və sənədlər** bölməsi formadan **ayrı işləyir**: fayl əlavə etmək, silmək, sırasını və
dilini dəyişmək **dərhal** saxlanılır, **Yadda saxla** lazım deyil. **Ləğv et** bu dəyişiklikləri geri
qaytarmır.

---

## 4. Admin paneldə əməliyyatlar

### 4.1. Yeni material əlavə etmək

**Addım 1. Materialı yaradın.**

1. **Press relizlər** → **Yeni**.
2. **AZ** tabında **Başlıq** və **Məzmun**, **EN** tabında onların ingiliscəsini yazın.
3. **Növ** → **Müsahibə və çıxış**.
4. **Status**-u **Qaralama** saxlayın (faylları əlavə edəndən sonra dəyişəcəksiniz).
5. **Dərc tarixi** → materialın **real** tarixi və saatı.
6. **Yadda saxla**. Panel sizi **siyahıya qaytarır**.

**Addım 2. Faylları əlavə edin.**

7. Siyahıda materialın sətrinin sağındakı **Redaktə et** işarəsini (qələm) basın. Tapmaq üçün yuxarıdakı **Növ**
   süzgəcindən və ya axtarışdan istifadə edin.
8. Səhifənin altında **Şəkillər və sənədlər** → **Sənəd əlavə et**.
9. Pəncərədə fayl adını axtarın, fayla klik edin. Hər fayl üçün təkrarlayın.
10. Hər faylın sətrində dili seçin: **AZ**, **EN** və ya **Hər iki dil**.
11. Nişanlara baxın (4.3). Lazımdırsa sıranı oxlarla dəyişin.

**Addım 3. Dərc edin.**

12. **Status** → **Dərc olunub** → **Yadda saxla**.
13. 6-cı bölmədəki siyahı ilə saytda yoxlayın.

> Qaralama saytda heç bir ünvanla açılmır, ona görə materialı dərcdən əvvəl saytda görmək olmur.
> Mətn redaktorundakı **Önizləmə** düyməsi yalnız mətnin özünü göstərir.

### 4.2. Mövcud materialı düzəltmək

Siyahıda materialın sətrində **Redaktə et**, dəyişiklik, **Yadda saxla**. Ən çox rast gələn hallar:

| Nəyi düzəldirsiniz | Nə edirsiniz |
|---|---|
| **Mətndəki səhv** | Lazımi dil tabında **Məzmun**-u düzəldin. Tablar bir-birinə köçmür. |
| **Başlıqdakı səhv** | **Başlıq**-ı düzəldin. **Diqqət:** səhifənin ünvanı da dəyişir, köhnə link işləmir (bax 4.7). |
| **Tarix səhvdir** | **Dərc tarixi**-ni dəyişin. Material siyahıda yeni tarixinə uyğun yerə keçir. |
| **Yanlış PDF qoşulub** | Bax 4.4. |
| **Kart şəkli dəyişməlidir** | Bax 4.4. |
| **EN düyməsi AZ faylını açır** | Faylın dilini yoxlayın (bax 4.3). |
| **Material səhvən Xəbərlərdə görünür** | **Növ** → **Müsahibə və çıxış** → **Yadda saxla**. Fayllar və dilləri qalır, material dərhal yeni şablona keçir. |

### 4.3. Fayllar saytda hara düşür: nişanlar, sıra və dil

**Şəkillər və sənədlər** siyahısındakı hər sətir saytda bir yerə düşür. Bunu **sıra** və **dil** təyin
edir, nişanlar nəticəni göstərir:

| Nişan | Nə deməkdir | Saytda harada |
|---|---|---|
| **Kart şəkli** | Həmin dildə sıradakı ilk şəkil | Yalnız **siyahı kartında**. Material səhifəsində görünmür. |
| **PDF düyməsi** | Həmin dildə sıradakı ilk PDF | Material səhifəsində **«PDF kimi yüklə»** düyməsi. |
| *(nişansız)* | Qalan bütün fayllar | Material səhifəsində **«Əlavə sənədlər»** siyahısı, fayl adı ilə. |

**Sıra.** Sətrin sağındakı yuxarı/aşağı oxlarla dəyişir. PDF düyməsini başqa fayla keçirmək üçün həmin
PDF-i digərindən yuxarı qaldırın.

**Dil.** Sətirdəki seçim üç dəyər alır:

| Seçim | `/az` səhifəsində | `/en` səhifəsində |
|---|---|---|
| **Hər iki dil** (default) | görünür | görünür |
| **AZ** | görünür | **heç yerdə görünmür** |
| **EN** | **heç yerdə görünmür** | görünür |

Nişan hər dil üçün ayrıca hesablanır, ona görə iki PDF-də eyni vaxtda **PDF düyməsi** nişanı ola bilər.
Bu düzgündür.

**Düzgün qurulmuş material belə görünür:**

```
Şəkillər və sənədlər
  1. kart.jpg          [Kart şəkli]    Hər iki dil
  2. musahibe-az.pdf   [PDF düyməsi]   AZ
  3. interview-en.pdf  [PDF düyməsi]   EN
```

**Əgər nəsə əskikdirsə:**

| Vəziyyət | Nəticə |
|---|---|
| Hər iki PDF-in dili **Hər iki dil**-dir (seçilməyib) | **Səhv.** Hər iki dildə düymə birinci PDF-i açır, ikinci PDF «Əlavə sənədlər»-ə düşür. |
| Yalnız AZ PDF var, dili **AZ** | `/az`-da düymə var, `/en`-də düymə yoxdur. |
| Tək PDF hər iki dil üçündür | Dili **Hər iki dil** saxlayın. Düymə hər iki dildə həmin faylı açır. |
| Şəklin dili **AZ**-dır | `/en` kartında boz qutu görünür. Kart şəkli üçün adətən **Hər iki dil** seçin. |
| İkinci şəkil əlavə olunub | Qalereyaya düşmür, «Əlavə sənədlər»-də fayl sətri kimi görünür. |
| Word və ya Excel faylı | Heç vaxt düymə olmur, həmişə «Əlavə sənədlər»-dədir. |

### 4.4. Faylı dəyişmək (yanlış PDF, köhnə şəkil)

Faylı yerində əvəz etmək olmur: yenisini əlavə edib köhnəsini ayırmaq lazımdır. Yeni fayl siyahının
**sonuna** düşür, ona görə sıra vacibdir.

1. Yeni faylı **Media kitabxanası**na yükləyin.
2. Materialı açın → **Sənəd əlavə et** → yeni faylı seçin.
3. Yeni faylın **dilini** seçin.
4. Köhnə faylın sətrində zibil qabı işarəsi → **Ayır** təsdiqi. Fayl materialdan ayrılır, kitabxanada qalır.
5. Nişanı yoxlayın. Qalan fayllar arasında yeni fayl ilk deyilsə, oxlarla yuxarı qaldırın.

Yadda saxla düyməsini basmaq lazım deyil, bütün bu addımlar dərhal saxlanılır. Köhnə faylı ayıranda
sayt dərhal yeni fayla keçir, ona görə əvvəl **əlavə edin**, sonra **ayırın**.

### 4.5. Mətni olmayan material (skan PDF)

Köhnə skan PDF-lərdə mətni köçürmək mümkün olmaya bilər. **Məzmun** sahəsini boş saxlayın: material
səhifəsində yalnız başlıq və «PDF kimi yüklə» düyməsi qalır, boş yer görünmür.

Bu halda **Başlıq** yenə də doldurulmalıdır.

### 4.6. Materialı yalnız bir dildə göstərmək

Material saytın bir dilində yalnız **həmin dilin tabı doldurulubsa** görünür.

- İngiliscə versiya hələ yoxdursa, **EN tabını tam boş saxlayın**: `/az`-da görünəcək, `/en`
  siyahısında olmayacaq, birbaşa link isə «tapılmadı» verəcək.
- Yalnız mətn yazıb **Başlıq**-ı boş saxlamayın: forma bu dili dolu sayır və saxlama xəta verir. Ya
  başlıq da yazın, ya da tabı tam boş saxlayın.

> ⚠ **Mövcud materialı bir dildən çıxarmaq çətindir.** Mətn redaktorunu boşaltsanız da sistem onu
> «dolu» sayır, buna görə başlığı silib saxlamaq xəta verir. Ən sadə yol: materialı silin və yalnız
> lazım olan dildə yenidən yaradın (ünvanı dəyişə bilər). Əgər material səhvən dərc olunubsa və
> təcili gizlətmək lazımdır, əvvəlcə **Status**-u **Qaralama** edin.

### 4.7. Başlığı dəyişəndə ünvan dəyişir

Səhifənin ünvanı başlıqdan avtomatik yaranır və paneldən ayrıca dəyişmir. Hər dilin öz ünvanı var.

- Başlığı dəyişib saxlayanda həmin dilin ünvanı **da dəyişir**.
- Köhnə ünvan **işləməyi dayandırır**, yönləndirmə yoxdur.
- Eyni başlıq artıq varsa, sonuna `-2`, `-3` əlavə olunur.

Link artıq paylaşılıbsa (xəbərdə, sosial şəbəkədə), başlığı yalnız həqiqətən lazım olanda dəyişin.

### 4.8. Tarix və sıra

Siyahının sırası **yalnız Dərc tarixi** ilə müəyyən olunur: ən yenisi yuxarıda. Materialı «yuxarı
qaldırmaq» üçün ayrıca sahə yoxdur.

- **Real tarix yazın.** PDF-in daxili tarixinə etibar etməyin.
- **Saat da sıraya təsir edir.** Eyni gündə iki material varsa, saatları fərqli yazın.
- **Gələcək tarix:** Status **Dərc olunub**, tarix gələcəkdədirsə, material həmin vaxta qədər saytda
  görünmür və vaxtı çatanda özü çıxır.
- **«Planlaşdırılıb» statusundan istifadə etməyin.** Bu status materialı dərc etmir: tarix çatsa da
  saytda görünməz qalır. Gələcəyə planlaşdırmaq üçün **Dərc olunub** + gələcək tarix seçin.

### 4.9. Materialı saytdan götürmək

| Məqsəd | Nə edirsiniz | Nəticə |
|---|---|---|
| Müvəqqəti gizlətmək | **Status** → **Qaralama** | Hər iki dildə saytdan itir, hər şey paneldə qalır. Geri qaytarmaq üçün **Dərc olunub**. |
| Köhnəlmiş materialı saxlamaq | **Status** → **Arxiv** | Saytda görünmür, paneldə qalır. |
| Tam silmək | Siyahıda sətrin zibil qabı işarəsi (**Sil**) → təsdiq | Panel və saytdan yox olur. **Paneldən geri qaytarmaq olmur.** |

Fayllar hər üç halda Media kitabxanasında qalır. Əmin deyilsinizsə, silmək əvəzinə **Qaralama** edin.

Materiala qoşulu faylı Media kitabxanasından silmək olmur (panel xəbərdarlıq verir): əvvəl materialdan
ayırın.

---

## 5. Saytda nə və necə görünür

### 5.1. Siyahı səhifəsi

**Səhifə:** Media → **Müsahibələr və çıxışlar** (`/az/press-releases?type=3`).

```
Ana səhifə › Media › Müsahibələr və çıxışlar

Müsahibələr və çıxışlar                  ← səhifələr ağacındakı menyu adı

[ Axtarış ]  [ Tarix aralığı ]   Filtrləri təmizlə   [ Axtar ]

┌───────────┐ ┌───────────┐ ┌───────────┐
│  [şəkil]  │ │  [şəkil]  │ │  [şəkil]  │   ← Kart şəkli
│           │ │           │ │           │
│ 14.03.2025│ │ 02.02.2025│ │ 18.11.2024│   ← Dərc tarixi
│ Başlıq    │ │ Başlıq    │ │ Başlıq    │   ← Başlıq (ən çox 3 sətir)
└───────────┘ └───────────┘ └───────────┘
                                 < 1 2 3 > ← hər səhifədə 9 kart
```

- Kartda şəkil yoxdursa boz qutu görünür.
- Axtarış **yalnız başlıq** üzrədir, mətnin içində axtarmır.
- Material ana səhifədə **görünmür**: ana səhifə yalnız Xəbər və Elanları götürür.
- Material **sayt axtarışında** başlıqla tapılır.

### 5.2. Material səhifəsi

```
Ana səhifə › Media › Müsahibələr və çıxışlar › Başlıq

Başlıq

Məzmun mətni…

[ PDF kimi yüklə ]        ← EN səhifədə: Save as PDF

Əlavə sənədlər
📄 əlavə-fayl.pdf         ← nişansız fayllar, kitabxanadakı adı ilə
```

- **Tarix və örtük şəkli qəsdən yoxdur.** Dizayn belədir, səhv deyil.
- **«PDF kimi yüklə»** həmin dilin PDF-ini yükləyir. Fayl kompüterdə **materialın başlığı** ilə
  saxlanılır, kitabxanadakı adı ilə yox.
- PDF yoxdursa düymə görünmür, fayl yoxdursa «Əlavə sənədlər» bloku görünmür.

---

## 6. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] `/az/press-releases?type=3` açılır, material **bu** siyahıdadır (Xəbərlərdə deyil).
- [ ] `/en/press-releases?type=3` — ingiliscə başlıq düzgündür (və ya qəsdən yoxdur).
- [ ] Tarix düzgündür, material siyahıda gözlənilən yerdədir.
- [ ] Kartda şəkil görünür (boz qutu deyil), hər iki dildə.
- [ ] Material səhifəsində mətn tamdır, cədvəl və siyahılar pozulmayıb.
- [ ] «PDF kimi yüklə» `/az`-da **AZ**, `/en`-də **EN** faylı yükləyir. Faylı açıb yoxlayın.
- [ ] «Əlavə sənədlər»-də artıq fayl yoxdur.

---

## 7. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Material saytda heç görünmür | Status **Dərc olunub** deyil | **Status** → **Dərc olunub** |
| Status düzgündür, amma görünmür | **Dərc tarixi** boşdur və ya gələcəkdədir | Keçmiş tarix yazın |
| «Planlaşdırılıb» material vaxtı çatsa da çıxmır | Bu status saytda işləmir | **Dərc olunub** + gələcək tarix (4.8) |
| Material Xəbərlərdə çıxıb | **Növ** default «Xəbər» qalıb | **Növ** → **Müsahibə və çıxış** |
| Yalnız AZ-da görünür | EN tabı boşdur | EN tabını doldurun |
| Formada «Şəkillər və sənədlər» yoxdur | Material hələ yaradılmayıb | **Yadda saxla**, sonra siyahıdan **Redaktə et** |
| Lazımi faylı seçicidə tapmıram | Fayl kitabxanaya yüklənməyib və ya adı başqadır | **Media kitabxanası** → **Fayl yüklə**; axtarış fayl adına görədir |
| Fayl seçicidə solğundur, seçilmir | Bu fayl materiala artıq qoşulub | Siyahıda mövcud sətirdən istifadə edin |
| «PDF kimi yüklə» yoxdur | Həmin dildə PDF yoxdur | PDF qoşun, dilini yoxlayın |
| Düymə başqa dilin faylını açır | Dil seçilməyib və ya səhv seçilib | Hər PDF-ə düzgün dil verin (4.3) |
| Düymə yanlış PDF-i açır | Sırada başqa PDF birincidir | Lazımi PDF-i oxla yuxarı qaldırın |
| Kartda boz qutu | Şəkil yoxdur və ya dili başqadır | Şəkil qoşun, dili **Hər iki dil** edin |
| «Əlavə sənədlər»-də anlaşılmaz fayl adı (`324c1a…pdf`) | Fayl kitabxanada belə adlanır | Ad dəyişmir. Mümkünsə həmin faylı düymə edin, çünki düymə faylı başlıqla yükləyir |
| Şəkil material səhifəsində görünmür | Kart şəkli orada göstərilmir | Normaldır. Mətnin içində şəkil lazımdırsa, redaktorda **Şəkil əlavə et** |
| Köhnə link «tapılmadı» verir | Başlıq dəyişib, ünvan da dəyişib | Yeni linki paylaşın (4.7) |
| Saxlayanda «Başlıq ən azı bir dildə doldurulmalıdır» | Hər iki tabda başlıq boşdur | Başlıq yazın |
| Saxlayanda digər xəta, bir tabda başlıq boşdur | Həmin dildə mətn var, başlıq yox | Başlıq yazın və ya mətni silin |
| Yükləyəndə «File type … is not allowed» | Format icazəli deyil | Faylı PDF-ə çevirin (bax 2) |
| Saxlama və ya yükləmə icazə xətası verir | Rolunuzda press-reliz və ya media icazəsi yoxdur | Administratora müraciət edin |

---

## 8. Köhnə materialların köçürülməsi

Köhnə saytın «Təqdimat və məruzələr» səhifəsindəki 15 material **əl ilə** daxil edilir, avtomatik
köçürmə yoxdur. Materialların siyahısı, AZ/EN başlıqları və fayl adları:
`specs/033-media-interviews/content-inventory.md`.

- Hər material üçün 4.1-dəki addımlar. Faylları cədvəldəki **fayl adı** ilə axtarın. Prod-da id-lər
  fərqli ola bilər, ona görə id ilə yox, adla axtarın.
- **Tarix** sütununu siz doldurursunuz: real dərc tarixi.
- **№4 Global Finance:** EN PDF yoxdur, köhnə saytdan yenidən yükləmək lazımdır.
- **Skan** yazılan fayllar üçün bax 4.5.
- `1792–1806` id-li faylları istifadə etməyin, onlar açılmır.
- **«Müsahibələr və çıxışlar» səhifəsinin köhnə 44 qoşmasını silməyin**, 15 material dərc olunub
  yoxlanana qədər qalsın.

---

## 9. Sol menyudakı «Müsahibələr və çıxışlar» linki

Menyu bəndinin özü press relizlərdən deyil, **Səhifələr** ağacından gəlir: «Media» altında səhifə
var, onun **Menyu linki** sahəsində `/press-releases?type=3` yazılıb. Buna görə:

- Bəndin **adını** dəyişmək üçün: **Səhifələr** → həmin səhifə → başlıq. Saytdakı siyahı başlığı və
  breadcrumb da bu addan gəlir.
- **Menyu linki** sahəsini dəyişməyin və silməyin. Əks halda bənd siyahıya aparmayacaq.
- Press reliz **Növü** ilə menyu arasında əlaqə yalnız bu linkdir (`type=3`).

---

## Əlavə: developerlər üçün

| Qat | Yer |
|---|---|
| Admin modul | `product-rest/web-cbar-admin-new/src/features/press-releases/model/module.ts`; fayl bölməsi `components/press-release-attachments-section.tsx`; ümumi `features/assets/components/assets-section.tsx` |
| Admin API | `api-cbar-admin` → `PressReleasesController`: `GET/POST /api/v1/press-releases`, `GET/PUT/DELETE /{id}`, `POST /{id}/assets`, `PUT /{id}/assets/order`, `PUT /{id}/assets/{mediaId}/locale`, `DELETE /{id}/assets/{mediaId}`; icazələr `press_releases.read/create/update/delete`; yükləmə üçün ayrıca `media.create`; hər yazı `audit_log`-a düşür |
| Public API | `api-cbar` → `PressReleasesController`: `GET /api/v1/press-releases?locale&type&q&from&to`, `GET /{slug}?locale`; filtr `Status == Published && PublishedAt <= now`, soft-delete, həmin locale-də tərcümə; başqa dilin faylı `details.locale` ilə çıxarılır |
| Sayt | `web-cbar-new/src/views/press-releases` (siyahı, `pressReleasesLabel`), `views/press-release` (`DocumentBody`), `features/press-releases/model/split-assets.ts` (`layoutFor`, `splitPressReleaseAssets`), `pdf-file-name.ts`; keş 10 s (`cachedJson`) |
| DB | `press_releases` (`type = 3`), `press_release_translations`, `press_release_assets`, yoldaş `press_release_asset_details (asset_id, locale)` (miqrasiya `0017`) |
| Spec | `specs/033-media-interviews/`; redaktor qeydi `web-cbar-new/docs/media-cms-guide.md` |

- `type` sahəsinin DB-də CHECK-i yoxdur, dəyəri `IsValidType` yoxlayır (1, 2, 3).
- `Scheduled` statusunu dəyişən fon prosesi yoxdur, public API yalnız `Published` götürür. Gələcək
  dərc `Published` + gələcək `PublishedAt` ilə işləyir (4.8).
- Admin forması `Dərc olunub` üçün tarix tələb etmir: `published_at` `NULL` olanda
  `PublishedAt <= now` yalandır, material saytda görünmür.
- `PUT` payload-da olmayan locale-in tərcüməsini silir (`ApplyTranslations` → `RemoveAll`), slug
  yalnız `Title` dəyişəndə yenilənir, köhnə slug üçün redirect yoxdur.
- Dil çıxarmaq problemi (4.6): boşaldılmış TipTap `<p></p>` qaytarır, `defaultBuildPayload` bunu
  dolu sayır və locale-i boş `Title` ilə göndərir. `TranslationDto.Title` nullable olmadığı üçün
  API-nin 400 verəcəyi gözlənilir (kodla oxunub, canlı yoxlanmayıb).
- Admin nişanı `isFirstInAnyLocale` ilə saytın seçimini təkrarlayır; qayda dəyişsə
  `split-assets.ts` və `press-release-attachments-section.tsx` birlikdə dəyişməlidir.
- `/press-releases/{id}` kimi `id` yolu public saytda yoxdur, yalnız locale-spesifik slug.
- Köhnə `/page-59/...` URL-lərindən redirect yoxdur (spec 033, əhatədən kənar).
