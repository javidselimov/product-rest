# Ana səhifə blokları — idarəetmə təlimatı

Bu sənəd cbar.az **ana səhifəsinin** admin paneldən idarə olunan bloklarını izah edir: hansı
tab hansı bloku qidalandırır, formada hansı sahələr var və dəyişiklik saytda harada, necə
görünür. Admin paneldə bölmə **yeddi tabdan** ibarətdir: Bannerlər, Xəbər slayderi, Sürüşən
sətirlər, Linklər, Nəşrlər, Strategiya və sənədlər və Məlumat sətirləri.

> ⚠ Yeni dizaynda (2026) ana səhifənin quruluşu dəyişib. Yeddi tabdan saytda **hazırda üçü
> görünür**:
> - **Xəbər slayderi**: birinci ekrandakı böyük slayder;
> - **Məlumat sətirləri**: Faiz dəhlizi kartı və «İcmal göstəricilər» tabları;
> - **Strategiya və sənədlər**: Təqvimin yanındakı sənəd kartları, spec 057.
>
> Qalan dördü paneldə saxlanılır, amma saytda göstərilmir. Bax §1 cədvəli və §6.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Ana səhifə** → **Ana səhifə blokları** (`/homepage-blocks`); yuxarıda tablar: Ümumi · Bannerlər · Xəbər slayderi · Sürüşən sətirlər · Linklər · Nəşrlər · Strategiya və sənədlər · Məlumat sətirləri |
| **Sayt (AZ)** | `https://<sayt>/az` |
| **Sayt (EN)** | `https://<sayt>/en` |
| **Saytda yolu** | Ana səhifə (loqoya klik) |

**Hansı tab saytda nəyə çevrilir:**

| Admin tab | Saytda | Vəziyyət |
|---|---|---|
| **Xəbər slayderi** | Birinci ekranda sol tərəfdəki böyük şəkilli slayder | ✔ görünür |
| **Məlumat sətirləri** | Birinci ekranda sağda **Faiz dəhlizi** kartı; aşağıda «İcmal göstəricilər» bölməsinin **Monetar**, **Mərkəzi Bankın notları**, **Maliyyə sektoru** tabları | ✔ görünür |
| **Strategiya və sənədlər** | Səhifənin aşağısında, **Təqvim**in yanında «Strategiya və sənədlər» bloku: ilk üç dərc olunmuş sənəd, birincisi böyük kartdır | ✔ görünür (§3.7) |
| **Bannerlər** | «Media» bölməsindən sonrakı **promo banner** (yubiley sikkələri banneri kimi) | ⚠ bax §3.3 — paneldən yaradılan banner hazırda saytda çıxmır |
| **Sürüşən sətirlər** | — | ✖ yeni dizaynda yeri yoxdur, saytda göstərilmir |
| **Linklər** | «Sürətli keçidlər» bloku | ✖ gizlədilib (§6) |
| **Nəşrlər** | «Nəşrlər» bloku | ✖ gizlədilib (§6) |

Dəyişiklik saytda **ən geci ~10 saniyə** sonra görünür (sayt ana səhifə paketini 10 saniyə
yaddaşda saxlayır); səhifəni bir-iki dəfə yeniləmək kifayətdir.

---

## 2. Hazırlıq: şəkilləri əvvəlcədən yükləyin

Formalardakı **Şəkil** və **Fayl** sahələri yalnız **Media kitabxanasında artıq olan** faylı
seçməyə imkan verir («Seç» → «Fayl seç» pəncərəsi). Formanın içində yeni fayl yükləmək olmur:

1. Sol menyu → **Media kitabxanası** → **Fayl yüklə**.
2. Slayd üçün şəkli yükləyin (jpg / png / webp). Seçici fayl növünə görə məhdudlaşdırmır —
   şəkil sahəsinə PDF də seçmək mümkündür, buna diqqət edin.

**Slayder şəkli üçün tövsiyə.** Saytda şəkil slayderin bütün sahəsini doldurur (desktopda
744 px hündürlük, ekranın ~70%-i enində) və **kənarları kəsilə bilər** — şəkil sahəyə
«örtük» kimi yerləşdirilir. Üstünə göy rəngli şəffaf örtük və soldan tünd gradient düşür, mətn
ağ rəngdə solda yazılır. Ona görə:

- **enli, üfüqi** şəkil seçin (dəqiq piksel ölçüsü kodda sabitlənməyib);
- əsas obyekt **ortada və ya sağda** olsun — sol ~500 px tünd gradient altında qalır;
- şəklin üstündə **yazı olmasın** — slaydın başlığı onsuz da üstünə yazılır.

> Eyni fayl ikinci dəfə yüklənsə, sistem onu yenidən saxlamır, mövcud olanı qaytarır
> (tarix/ad köhnə görünə bilər — bu normaldır).

---

## 3. Admin paneldə əməliyyatlar

**Ana səhifə blokları** səhifəsi (tab **Ümumi**) yeddi kartdan ibarətdir. Kart bütövlükdə
keçiddir, kliklə həmin tabın siyahısı açılır. Hər tabda eyni qayda işləyir. **Strategiya və sənədlər**
bundan fərqlənir: Status, sıralama dialoqu və bərpa olunan silmə, bax §3.7.

- Siyahının üstündə **Yeni** düyməsi; sətrə klik → redaktə forması; sətrin **Əməllər**
  menyusunda **Redaktə et** / **Sil**.
- Forma iki hissədir: **Ümumi sahələr** (dildən asılı deyil) və **Tərcümələr** (**AZ** / **EN**
  tabları). Dil tabı tam boş qalsa, o dil üçün heç nə saxlanmır.
- Siyahıdakı **Status** sütunu **Aktiv** (yaşıl) / **Qeyri-aktiv** nişanıdır.
- **Sıra** sütunu: kiçik rəqəm əvvəl gəlir. Araya qeyd salmaq asan olsun deyə 10, 20, 30…
  addımı tövsiyə olunur.
- **Sil** → təsdiq → qeyd **birdəfəlik** silinir (geri qaytarmaq olmur). Əmin deyilsinizsə,
  **Aktiv** işarəsini götürün — qeyd paneldə qalır, saytdan itir.
- Media kitabxanasından fayl silinərsə, ona bağlı qeyd pozulmur: sadəcə şəkli boş qalır.

### 3.1. Xəbər slayderi (`/homepage-blocks/news-slider`)

Birinci ekrandakı böyük slayder. Siyahı sütunları: ID, Başlıq, Xəbər tarixi, Sıra, Status.

**Ümumi sahələr:**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Xəbər tarixi** \* | Tarix | Saytda **göstərilmir**; eyni Sıra-dakı slaydların ardıcıllığını müəyyən edir — yeni tarix əvvəl |
| **Şəkil** | Media kitabxanasından şəkil | Slaydın fon şəkli (bax §2). Boşdursa slayd düz göy fonda qalır |
| **Sıra** | Rəqəm (0, 10, 20…) | Slaydların ardıcıllığı; birinci slayd ilk açılan ekranda görünür |
| **Aktiv** | ✔ / boş | Boşdursa slayd heç bir dildə görünmür |

**Dil üzrə sahələr (AZ / EN):**

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Başlıq** \* | Xəbərin başlığı | Slaydın böyük ağ başlığı; 3 sətirdən uzunu kəsilir |
| **Təsvir** | 1–2 cümlə | Başlığın altında; 2 sətirdən uzunu kəsilir. Boşdursa sətir yoxdur |
| **Keçid** | Xəbərin ünvanı, məs. `/press-releases/<slug>` və ya tam `https://…` | Başlıq və **Ətraflı** düyməsi bura aparır. Boşdursa «Press relizlər» siyahısına aparır |

\* **Başlıq** ən azı bir dildə mütləqdir (forma xəbərdarlıq verir); **Xəbər tarixi** mütləqdir.

**Keçid necə yazılır.** Saytın öz səhifəsinə `/` ilə başlayan ünvan yazın (`/press-releases/…`,
`/statistics` …) — sayt dil prefiksini (`/az`, `/en`) özü əlavə edir. Tam `https://…` ünvan
olduğu kimi qalır və **yeni pəncərədə** açılır.

> ⚠ Bir dildə yalnız **Təsvir** və ya **Keçid** yazıb **Başlığı boş** saxlamayın — o dil «dolu»
> sayılır, amma başlıqsız yazıla bilmir və saxlama xəta verir. Ya başlığı da yazın, ya da həmin
> dil tabını tam boş saxlayın.

**Saytda davranış:** slaydlar 6 saniyədən bir avtomatik dəyişir; sağ-altda sayğac («1/3») və
əvvəlki/növbəti düymələri yalnız **birdən çox** slayd olanda çıxır. Aktiv slayd yoxdursa
birinci ekranda slayder yoxdur, yalnız sağdakı kartlar qalır.

### 3.2. Məlumat sətirləri (`/homepage-blocks/info-lines`)

Ana səhifədəki rəqəmli göstəricilər. Hər sətrin bir **Alias**-ı var — saytda hansı qutuya
düşəcəyini o müəyyən edir. Siyahı alias-a görə qruplaşdırılıb (sütunlar: ID, Alias, Başlıq,
Dəyər, İl, Sıra, Status, Yenilənib); **Axtar** sahəsi alias üzrə axtarır; səhifədə 50 sətir.

| Sahə | Nə yazılır / seçilir | Saytda təsiri |
|---|---|---|
| **Alias** \* | Aşağıdakı siyahıdan | Sətrin saytda yeri (cədvələ bax) |
| **İl** | Rəqəm və ya boş | Saytda göstərilmir, yalnız qeyd üçün |
| **Sıra** | Rəqəm | Eyni alias-da bir neçə sətir varsa, saytda **yalnız ən kiçik Sıra-lı** (bərabərdirsə ən əvvəl yaradılan) göstərilir |
| **Aktiv** | ✔ / boş | Boşdursa sətir nəzərə alınmır |
| **Başlıq** \* (AZ / EN) | Göstəricinin adı, məs. «Aşağı hədd» | Qutunun etiketi |
| **Dəyər** (AZ / EN) | Rəqəm + vahid, məs. `7,25%`, `15301,3 mln. USD` | Qutunun dəyəri. **Boşdursa sətir saytda çıxmır** |

**Alias → saytda yer:**

| Alias (formada adı) | Saytda harada | Necə görünür |
|---|---|---|
| Faiz dəhlizi — aşağı hədd · yuxarı hədd · uçot dərəcəsi | Birinci ekran, sağda **Faiz dəhlizi** kartı | Üç qutu bu ardıcıllıqla; sonuncu (uçot dərəcəsi) firuzəyi fonda vurğulanır. Kartın sağ-üst tarixi — bu üç sətrin **son saxlanma** tarixidir (qərarın tarixi deyil) |
| Pul göstəriciləri — valyuta ehtiyatları · pul bazası | «İcmal göstəricilər» → **Monetar** tabı | Böyük rəqəm + vahid (dəyər «15301,3 mln. USD» yazılıbsa rəqəm iri, vahid boz kiçik), altında başlıq |
| MB notları — dövriyyədəki həcm | «İcmal göstəricilər» → **Mərkəzi Bankın notları** tabı, solda | Böyük rəqəm + başlıq |
| MB notları — 28 · 84 · 168 · 252 günlük | Eyni tab, sağda | 4 kiçik qutu: başlıq + dəyər |
| Bank sektoru — kredit qoyuluşları · depozitlər | «İcmal göstəricilər» → **Maliyyə sektoru** tabı | «Bank sektoru» qutusunda iki sətir |
| Əsas göstəricilər | — | Yeni dizaynda **istifadə olunmur**; sətirlər saxlanılır, amma saytda çıxmır |

- Tabda göstəriləcək heç bir sətir yoxdursa (məs. iki «Pul göstəriciləri» sətri də deaktivdir),
  **o tab bütövlükdə gizlənir**. Dəhliz sətirlərinin hamısı boşdursa Faiz dəhlizi kartı yoxdur.
- Göstəricini yeniləmək üçün yeni sətir yaratmaq lazım deyil — mövcud sətri açıb **Dəyər**
  sahəsini dəyişin (hər iki dildə) və **Yadda saxla**. Dəhliz kartındakı tarix avtomatik yenilənir.
- Yeni sətir yaradıb köhnəni saxlayırsınızsa, yeninin **Sıra**-sını köhnədən kiçik edin, yoxsa
  saytda köhnə qalacaq. Sadə yol — köhnəni deaktiv etmək.

### 3.3. Bannerlər (`/homepage-blocks/banners`)

Siyahı sütunları: ID, Başlıq, Sıra, Status, Başlanğıc, Bitmə.

| Sahə | Nə yazılır | Qeyd |
|---|---|---|
| **Şəkil** | Media kitabxanasından | Banner yalnız şəkildən ibarət ola bilər |
| **Sıra** | Rəqəm | Ardıcıllıq |
| **Aktiv** | ✔ / boş | Boşdursa göstərilmir |
| **Başlanğıc vaxtı** / **Bitmə vaxtı** | Tarix-vaxt və ya boş | Banner yalnız bu aralıqda sayılır; boş sahə — hədd yoxdur |
| **Başlıq** / **Keçid** (AZ / EN) | Mətn / ünvan | Hər ikisi istəyə bağlıdır |

Şəkil **də**, tərcümə **də** boşdursa saxlama xəta verir («A banner needs an image or at least
one translation»).

> ⚠ **Hazırkı məhdudiyyət.** Saytda bannerlər iki yerə bölünür: **təsviri olan** banner
> «Media» bölməsindən sonra promo banner kimi (şəkil varsa — tam enli şəkil, 6:1 nisbətində
> kəsilir; yoxsa göy kart: başlıq, təsvir, «Keçid et» düyməsi), təsviri olmayanlar isə
> «Faydalı keçidlər» blokuna düşür, o blok isə gizlidir (§6). Panelin banner formasında isə
> **Təsvir sahəsi yoxdur** — yəni paneldən yaradılan və ya redaktə olunan banner saytda
> **görünmür**. Bunu texniki komandaya bildirin; promo banner lazımdırsa, hələlik developer
> köməyi tələb olunur. Mövcud promo bannerin (təsviri developer tərəfindən yazılmış qeydin)
> başlığını və keçidini paneldən dəyişmək olar — təsvir yerində qalır. Amma həmin qeydin
> **dil tabını tam boşaldıb saxlasanız**, o dilin tərcüməsi təsvirlə birlikdə silinir və
> banner saytdan itir.

### 3.4. Sürüşən sətirlər (`/homepage-blocks/running-lines`)

Sahələr: **Aktiv**, **Başlanğıc vaxtı**, **Bitmə vaxtı**; AZ / EN: **Mətn** \* (ən azı bir
dildə). Siyahıda ən son yaradılan yuxarıdadır (sütunlar: ID, Mətn, Status, Başlanğıc, Bitmə).

Saytın yeni dizaynında sürüşən sətir **yoxdur** — bu tabdakı qeydlər saytın heç bir yerində
görünmür. Tab köhnə saytdan qalan məlumatı saxlamaq üçündür.

### 3.5. Linklər (`/homepage-blocks/links`)

Sahələr: **Sıra**, **Aktiv**; AZ / EN: **Başlıq** \*, **URL** \*. Siyahı: ID, Başlıq, URL, Sıra,
Status.

> ⚠ Bir dil tabında yazırsınızsa, **həm Başlıq, həm URL** yazın — biri boş qalsa saxlama xəta
> verir. Dil lazım deyilsə tabı tam boş saxlayın.

Saytda bu siyahı «Sürətli keçidlər» blokudur və hazırda **gizlidir** (§6).

### 3.6. Nəşrlər (`/homepage-blocks/publications`)

Sahələr: **Fayl** (Media kitabxanasından — saytda bu, nəşrin **üz qabığı şəkli** kimi işlənir),
**Dərc tarixi**, **Sıra**, **Aktiv**; AZ / EN: **Başlıq** \*, **URL** (nəşrin açılacağı ünvan).
Siyahı: ID, Başlıq, Dərc tarixi, Sıra, Status.

Saytda «Nəşrlər» bloku hazırda **gizlidir** (§6).

### 3.7. Strategiya və sənədlər (`/homepage-blocks/strategy-docs`)

Ana səhifənin «Strategiya və sənədlər» bloku (spec 057). Əvvəllər bu blokun sənədləri saytın kodunda yazılmışdı, indi bu tabdan idarə olunur.

**Saytda ilk üç dərc olunmuş sənəd göstərilir, birincisi böyük kartdır** (şəkil, başlıq, «Daha ətraflı» düyməsi). Qalan ikisi kiçik
kartlardır (üz qabığı, başlıq, qısa mətn). Siyahıda üçdən çox sənəd ola bilər, dördüncüsü saytda görünmür.

**Siyahı:** Sıra, Üz qabığı, Başlıq, Keçid, Dillər, Status. Siyahının üstündə **Yeni** və **Sıranı dəyiş** düymələri var.

- **Sıranı dəyiş** dialoqunda sənədi sürüşdürün və ya ↑ / ↓ düymələri ilə yerini dəyişin. Hər hərəkət dərhal saxlanılır. Formada
  Sıra sahəsi yoxdur, yeni sənəd siyahının sonuna düşür.
- Keçid sütununda **«Keçid işləmir»** nişanı varsa, sənəd saytda heç bir dildə görünmür. Səbəb: ünvan yazılmayıb, seçilmiş səhifə isə
  silinib, qaralamadadır və ya həmin dildə göstərilmir. Səhifəni düzəldin və ya ünvan yazın.

**Forma**

| Sahə | Qayda |
|---|---|
| **Status** | «Dərc olunub» və ya «Qaralama». Qaralama saytda görünmür, paneldə qalır |
| **Səhifə** | Kartın açacağı CMS səhifəsi (axtarışla seçilir). Ünvan hər dil üçün səhifənin həmin dildəki ünvanından qurulur |
| **Başlıq** (AZ / EN) | Ən azı bir dildə məcburidir, ən çox 300 simvol. Başlığı olmayan dil saxlanılmır və saytda görünmür |
| **Qısa mətn** | İstəyə bağlıdır, ən çox 500 simvol. Yalnız kiçik kartlarda görünür (5 sətrə qədər) |
| **Üz qabığı** | Media kitabxanasından **yalnız şəkil** (PDF seçilmir). Bu dildə yoxdursa, digər dilin üz qabığı göstərilir, o da yoxdursa boz fon |
| **Ünvan** | İstəyə bağlıdır: saytın daxili ünvanı (`/az/…`) və ya `https://…`. Doludursa, həmin dildə **seçilmiş səhifədən üstündür**. Xarici ünvan yeni vərəqdə açılır |

Saxlamaq üçün ya **Səhifə** seçilməli, ya da başlığı olan dildə **Ünvan** yazılmalıdır. Bir dildə qısa mətn və ya ünvan yazıb başlığı
boş qoysanız, forma saxlamır və başlığı istəyir.

**Üz qabığı ölçüləri:** böyük kart 424 × 240 px, kiçik kart 200 × 236 px. Şəkil sahəni örtük kimi doldurur, kənarları kəsilə bilər.
Köhnə blokun iki üz qabığı (Risk əsaslı nəzarət, Mikromaliyyə) repozitoriyada `specs/057-homepage-strategy-docs/assets/`-dədir. Onları
Media kitabxanasına yükləyib həmin sənədlərin **AZ** üz qabığı kimi seçin. Şəkillərdəki mətn azərbaycancadır. Böyük kartın şəklini
dizayn komandası verir.

**Silmə:** sənəd silinəndə siyahıdan və saytdan çıxır, verilənlər bazasında isə qalır (bərpa üçün texniki komandaya müraciət edin).

**İlk vəziyyət:** deploy zamanı blokun əvvəlki üç sənədi öz səhifələrinə bağlı yazılır: Strategiya, Risk əsaslı nəzarət və Mikromaliyyə.
Üz qabıqlarını yuxarıdakı kimi əlavə edin.

**Strategiya səhifəsi:** birinci kart «Maliyyə sektorunun inkişaf Strategiyası» səhifəsinə aparır. Köhnə saytın `/pages/strategy`
müraciəti (sədrin portreti, mətn, imza, PDF) bu səhifənin mətnidir və bir dəfəlik alətlə köçürülür (`tools/media-backfill`). Mətni
**Səhifələr**-dən adi səhifə kimi dəyişə bilərsiniz. Portretin eni 300 px-dir, imza sağa düzlənib, PDF media kitabxanasındadır.
Portret sağa düzlənmiş abzasdadır: saytda sağda durur, telefonda (744 px-dən dar) isə sütunun tam eninə yayılır, mətn altından gəlir. Bu
qayda bütün səhifələrə aiddir: hər hansı səhifədə şəkli sağa düzləsəniz, telefonda tam enli olacaq; mərkəzə düzlənmiş şəkil mərkəzdə qalır.
Köhnə ünvanlar (`/pages/strategy`, `page-872/…`, `page-878/…`, iki PDF) yeni səhifələrə yönlənir.

---

## 4. Saytda nə və necə görünür

**Səhifə:** `/az` və ya `/en`. Yuxarıdan aşağı:

```
┌──────────────────────────────────────────┬──────────────────────┐
│                                          │  AZN məzənnəsi       │ ← Məzənnələr modulu
│   XƏBƏR SLAYDERİ                         ├──────────────────────┤
│   Başlıq (3 sətrə qədər)                 │  İnflyasiya          │ ← İnflyasiya parametrləri
│   Təsvir (2 sətrə qədər)                 ├──────────────────────┤
│   [ Ətraflı ]                            │  Faiz dəhlizi        │ ← Məlumat sətirləri
│                                   1/3 ‹ ›│  Aşağı│Yuxarı│Uçot   │   (corridor_*)
└──────────────────────────────────────────┴──────────────────────┘
  İcmal göstəricilər:  Monetar · Gəlirlilik əyrisi · Pul bazarı · MB notları · Maliyyə sektoru
                        ↑ məlumat sətirləri          ↑ statistika modulları  ↑ məlumat sətirləri
  Media:  Xəbərlər · Elanlar · Qalereya              ← Press relizlər / Qalereya
  [ Promo banner ]                                   ← Bannerlər (təsviri olan) — bax §3.3
  Strategiya və sənədlər | Təqvim                    ← Strategiya və sənədlər tabı (ilk üç) | Tədbirlər
```

- **Birinci ekran desktopda ekrana miqyaslanır.** Slayder + sağ kartlar sırası dizayn
  ölçüsündə (744 px hündürlük) qurulur və brauzerin pəncərəsinə görə bütövlükdə böyüdülüb-
  kiçildilir ki, başlıqdan sonra ekranda yalnız slayder və panel görünsün, qalan bölmələr
  sürüşdürəndə gəlsin. **Bu qəsdəndir.** Redaktor üçün nəticə: slayd şəkli müxtəlif
  ekranlarda **müxtəlif cür kəsilir** — bu, şəklin və ya panelin xətası deyil. Planşet və
  mobildə miqyas yoxdur, slayder tam enlidir, kartlar altına keçir.
- «İcmal göstəricilər»də datası olmayan tab **göstərilmir**; heç bir tabda data yoxdursa
  bölmə yoxdur.
- Hər hansı mənbə cavab verməsə, yalnız **həmin blokda** «Bu blok hazırda yüklənə bilmədi»
  yazısı çıxır, səhifənin qalanı işləyir — bu, məzmun problemi deyil, texniki komandaya
  bildirin.

---

## 5. Dil görünüşü

Hər qeyd saytın bir dilində yalnız **həmin dilin tabı doldurulubsa** görünür:

- Slayd ingiliscə hazır deyilsə — **EN tabını tam boş saxlayın**: `/az`-da görünəcək, `/en`-də
  o slayd atlanacaq (sayğac da ona görə fərqli olacaq).
- Məlumat sətrində **Dəyər** bir dildə boşdursa, o dildə qutu çıxmır; bütün sətirlər boşdursa
  tab/kart o dildə yoxdur.
- Mövcud qeydi bir dildən çıxarmaq üçün həmin dilin **bütün** sahələrini təmizləyib saxlayın —
  o dilin tərcüməsi silinir.

---

## 6. Gizli bloklar: Nəşrlər, Linklər, Faydalı keçidlər

Yeni dizaynda «Nəşrlər», «Sürətli keçidlər» (Linklər tabı) və «Faydalı keçidlər» (təsviri
olmayan bannerlər) blokları ana səhifədə **göstərilmir, amma ləğv edilməyib**: komponentlər
kodda qalır və saytın kodunda bir yerdən (developer tərəfindən) yenidən açıla bilər. Paneldə
bu tablara yazdıqlarınız saxlanır, saytda isə hələlik heç nə dəyişmir. Blok lazımdırsa, bunu
əvvəlcə texniki komanda ilə razılaşdırın.

---

## 7. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] `/az` açılır, slaydlar düzgün ardıcıllıqla gəlir, başlıq/təsvir kəsilmir (3 / 2 sətir).
- [ ] Slaydın **Ətraflı** düyməsi düzgün xəbəri açır (xarici ünvan — yeni pəncərədə).
- [ ] Slayd şəklində əsas obyekt sol gradientin altında qalmır.
- [ ] Faiz dəhlizi kartında üç dəyər və bugünkü tarix var.
- [ ] «İcmal göstəricilər»də Monetar / MB notları / Maliyyə sektoru tablarındakı rəqəmlər yenidir.
- [ ] «Strategiya və sənədlər»də ilk üç dərc olunmuş sənəd düzgün sırada və üz qabıqları ilə görünür, kartlar düzgün səhifəni açır.
- [ ] `/en` — ingiliscə başlıq və dəyərlər düzgündür (və ya qəsdən yoxdur).
- [ ] 10 saniyə gözləyib səhifəni yeniləmisiniz.

## 8. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Yeni slayd saytda yoxdur | **Aktiv** işarəsi yoxdur, ya da həmin dil tabı boşdur | İşarəni qoyun, dil tabını doldurun |
| Slayd ən sonda çıxır | **Sıra** rəqəmi böyükdür | Sıranı kiçildin (eyni sırada — yeni **Xəbər tarixi** əvvəl gəlir) |
| Dəyişiklik dərhal görünmür | Sayt ana səhifəni 10 san. yaddaşda saxlayır | Bir az gözləyib yeniləyin |
| Slayd şəklinin kənarı kəsilir, hər ekranda fərqli | Şəkil sahəni «örtük» kimi doldurur, birinci ekran miqyaslanır (§4) | Normaldır; əsas obyekti ortada/sağda olan enli şəkil seçin |
| Slayd düz göy fondadır | Şəkil seçilməyib və ya kitabxanadan silinib | **Şəkil → Seç** |
| «Ətraflı» press-relizlər siyahısını açır | **Keçid** boşdur | Xəbərin ünvanını yazın |
| Göstərici dəyişdi, saytda köhnə qalıb | Eyni alias-da bir neçə aktiv sətir var, saytda ən kiçik Sıra-lı çıxır | Köhnəni deaktiv edin və ya mövcud sətrin Dəyərini dəyişin |
| Göstərici saytda çıxmır | **Dəyər** boşdur və ya alias «Əsas göstəricilər»-dir | Dəyəri yazın; «Əsas göstəricilər» yeni dizaynda işlənmir |
| Faiz dəhlizi kartında tarix köhnədir | Tarix sətirlərin son saxlanma anıdır | Sətri açıb yenidən saxlayın |
| Saxlayanda «Başlıq ən azı bir dildə doldurulmalıdır» | Hər iki dil tabında başlıq boşdur | Başlığı yazın |
| Saxlayanda xəta, bir dildə yalnız Təsvir/URL yazılıb | O dil «dolu» sayılır, məcburi sahəsi boşdur | Başlığı (Linklərdə URL-i də) yazın və ya tabı tam boşaldın |
| Banner yaratdım, saytda yoxdur | Panel formasında Təsvir yoxdur; təsvirsiz bannerlər gizli blokdadır (§3.3, §6) | Texniki komandaya bildirin |
| Sürüşən sətir / Link / Nəşr saytda yoxdur | Bu bloklar yeni dizaynda göstərilmir (§3.4–3.6, §6) | — |
| Formada lazımi şəkli tapmıram | Fayl kitabxanaya yüklənməyib | Əvvəl **Media kitabxanası → Fayl yüklə** |
| Strategiya sənədi saytda yoxdur | Status «Qaralama»dır, sıra üçdən sonradır, həmin dildə başlıq yoxdur və ya «Keçid işləmir» | Statusu, sıranı, dil tabını və keçidi yoxlayın (§3.7) |
| Strategiya sənədinin kartı boz fondadır | Heç bir dildə üz qabığı yoxdur | **Üz qabığı → Seç** |
| Kart ingiliscə saytda azərbaycanca yazılı üz qabığı göstərir | EN üz qabığı yoxdur, AZ-dakı göstərilir | EN tabında öz üz qabığını seçin |
| Saxlayanda «Media asset not found» | Seçilmiş fayl artıq silinib | Faylı yenidən yükləyib seçin |

---

## Əlavə: developerlər üçün

| Qat | Yer |
|---|---|
| Admin hub | `web-cbar-admin-new/src/pages/homepage-blocks/index.tsx`; tablar və breadcrumb `features/homepage/model/section.ts` |
| Admin modullar | `features/homepage/model/modules.ts` (`bannersModule`, `newsSliderModule`, `runningLinesModule`, `homepageLinksModule`, `publicationsModule`), Zod `schemas.ts`; məlumat sətirləri `features/info-lines/model/module.ts` + `schemas.ts` (siyahı alias-a görə qruplu — `transformItems` düzləşdirir; `/info-lines` → `/homepage-blocks/info-lines` redirect) |
| Admin API | `api-cbar-admin`: `BannersController` (`/api/v1/banners`), `NewsSliderController` (`/news-slider`), `RunningLinesController` (`/running-lines`), `HomepageLinksController` (`/homepage-links`), `HomepagePublicationsController` (`/homepage-publications`), `InfoLinesController` (`/info-lines?alias=&page=&pageSize=`, default 50); hamısı `GET/POST`, `GET/PUT/DELETE /{id}`; icazələr `Permissions.Banners/NewsSlider/RunningLines/HomepageLinks/HomepagePublications/InfoLines.*`; hard delete; hər yazı `audit_log`-a düşür |
| Public API | `api-cbar` → `HomepageController.Get` — `GET /api/v1/homepage?locale=az\|en`, bir paket: `banners`, `newsSlider`, `runningLines`, `links`, `publications`, `infoLines` (alias-a görə qruplu), `strategyDocs` (spec 057: dərc olunmuş, dildə başlığı və işləyən keçidi olan, sıra ilə; `href` və `coverUrl` `StrategyDocLinks`-dən) |
| Strategiya və sənədlər (spec 057) | Admin: `features/homepage/model/strategy-docs.ts` (`buildStrategyDocsModule`), `pages/homepage-blocks/strategy-docs.tsx` (səhifə ağacı `LookupGate` ilə), sıralama `components/strategy-docs-reorder-dialog.tsx`. API: `HomepageStrategyDocsController` (`/api/v1/homepage-strategy-docs`, `PUT /order`, soft delete), qaydalar `Validation/StrategyDocRules.cs`, icazələr `Permissions.HomepageStrategyDocs.*`. DB: `homepage_strategy_docs` + `_translations` (`0043`), köçürmə `0044`. Sayt: `views/home/loader.ts` `toStrategyDoc`, `STRATEGY_DOCS_MAX = 3`, widget `widgets/home-cards/strategy-docs.tsx` (`SmartLink`). Strategiya səhifəsi: `tools/media-backfill/import-strategy-page.mjs`, köhnə ünvanlar `src/proxy.ts` `LEGACY_PAGES` + `next.config.ts` `redirects()` |
| Sayt | `web-cbar-new/src/views/home/loader.ts` → `index.tsx`; `blocks.ts` (`HOME_BLOCKS` — gizli bloklar), `features/homepage/model/schemas.ts` (`INFO_LINE_ALIASES`, `statRows`, `statUpdatedAt`); widget-lər `widgets/hero-slider/hero-slider.tsx`, `widgets/home-cards/{corridor-card,statistics-panels,links-grid}.tsx`; miqyas `widgets/hero-scale` + `public/scripts/hero-scale.js` (ui-contract 2026-10-19 sapması) |
| Keş | `web-cbar-new/src/server/cached.ts` — `CONTENT_REVALIDATE_SECONDS = 10`, tag `homepage` |
| DB | `banners` + `banner_translations` (`description` — migrasiya `0003`), `news_slider` + `news_slider_translations`, `running_lines` + `running_line_translations`, `homepage_links` + `homepage_link_translations`, `homepage_publications` + `homepage_publication_translations`, `info_lines` + `info_line_translations` (`0001`) |

**Public filtr (`HomepageController`):**

- Hər blok: `IsActive` + həmin locale-də tərcümə var. Bannerlər və sürüşən sətirlər əlavə
  olaraq `StartsAt <= now <= EndsAt` (UTC, `null` — hədd yoxdur).
- Sıra: slayder `SortOrder, NewsDate desc`; bannerlər/linklər `SortOrder, Id`; nəşrlər
  `SortOrder, PublishedAt desc`; info-line `Alias, SortOrder, Id`.
- `statRows` hər alias-ın **yalnız `items[0]`**-ını götürür və `title && value` tələb edir.
  `corridorDateLabel` = dəhliz sətirlərinin ən böyük `updatedAt`-i.

**Bilinən boşluqlar / uyğunsuzluqlar:**

- **Banner `description`:** `banner_translations.description` sütunu var (`0003`) və public
  API onu oxuyur (`promo` = `description` olan banner), amma admin `BannerUpsertDto` /
  `BannerTranslationDto` və panel forması bu sahəni daşımır. Nəticə: paneldən promo banner
  yaratmaq mümkün deyil; mövcud qeydin `PUT`-u `description`-ı **silmir** (controller
  mövcud tərcümədə yalnız `Title`/`Link` yazır), itki yalnız locale payload-dan çıxıb
  `RemoveAll`-a düşəndə olur (§3.3). Düzəliş: DTO + forma sahəsi (spec-first, `openapi/`).
- `runningLines` public API-də qaytarılır, saytda heç bir widget onu render etmir.
- `homepage_indicators` alias-ı saytın `INFO_LINE_ALIASES` xəritəsində yoxdur.
- Hero slaydda `dateLabel` hesablanır (`formatLongDate(newsDate)`), amma `HeroSlider` onu
  göstərmir.
- Admin «Tərcümələr» sxemi `perLocale.required`-i yalnız «ən azı bir dildə» yoxlayır;
  backend DTO-ları isə (`NewsSlider`/`HomepageLink`/`InfoLine`/`Publication`) locale daxilində
  `Title` (Linklərdə `Url` də) non-null tələb edir — yarımçıq locale 400 verir.
- Media seçici (`media-picker-dialog.tsx`) fayl növünə görə filtr etmir — şəkil sahəsinə PDF
  seçmək mümkündür.
- Admin siyahılarda `startsAt/endsAt` `datetime-local` kimi yazılır; saat qurşağı çevrilməsi
  bu sənəddə yoxlanılmayıb (yoxlanılmalıdır).
