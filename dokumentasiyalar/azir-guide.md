# AZIR (banklararası faiz dərəcəsi indeksi) — idarəetmə təlimatı

Bu sənəd cbar.az-ın **AZIR** bölməsini izah edir: gündəlik indeks dəyərləri admin paneldən necə
daxil edilir və düzəldilir, dəyişiklik saytda harada və necə görünür. AZIR dəyəri bir **tarix +
müddət** üçün bir sətirdir: faiz dərəcəsi və (1D üçün) əqdlərin həcmi, sayı, günün minimum və
maksimum dərəcəsi, «ehtiyat plan əsasında hesablanıb» işarəsi.

> Bu bölmədə adi «Yeni / Redaktə et» forması **yoxdur**. Səhifənin üstündəki bir kart həm əlavə edir,
> həm də yeniləyir: eyni tarix + müddət ikinci dəfə saxlananda mövcud sətir **üzərinə yazılır**,
> dublikat yaranmır.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Maliyyə** → **AZIR** (`/azir`) |
| **Sayt (AZ)** | `https://<sayt>/az/statistics/azir` |
| **Sayt (EN)** | `https://<sayt>/en/statistics/azir` |
| **Saytda yolu** | Ana səhifə → «Pul bazarı» kartı → **AZIR dərəcələri** düyməsi; köhnə `/indeks/rates` ünvanı da bura yönləndirilir |

Saytda səhifə yuxarıdan aşağı: başlıq, **1D qrafiki** və metodologiya xəbərdarlığı, **tarix filtri**
(«Başlanğıc tarix» / «Son tarix» / «Göstər»), **Yüklə** (Excel), **cədvəl** (Tarix, Faiz, Əqdlərin
həcmi, Əqdlərin sayı) və altında **«AZIR indeksi ilə bağlı məlumatlar»** statistika bloku.

Dəyişiklik saytda **təsdiqsiz, ən geci ~10 saniyə** sonra görünür (saytın qısa keşi var): saxladıqdan
sonra səhifəni bir-iki dəfə yeniləmək kifayətdir.

---

## 2. Hazırlıq

Əlavə hazırlıq lazım deyil — media, tərcümə və ya başqa modul tələb olunmur. Yalnız bunları bilin:

- **Rəqəmlər dildən asılı deyil.** Bir dəyər daxil edilir, sayt onu AZ-da vergüllə (`7,25`), EN-də
  nöqtə ilə (`7.25`) göstərir.
- **Həcm mln manatla** yazılır (məs. `250.00`), say tam ədəddir, dərəcələr faizlə (`7.25`, `%` yazılmır).
- Onluq ayırıcı formada **nöqtədir** (`7.25`).
- Statistika blokundakı **ABŞ dolları ekvivalenti** əl ilə daxil edilmir — həmin tarixə qədər olan son
  rəsmi USD məzənnəsindən avtomatik hesablanır.

---

## 3. Admin paneldə əməliyyatlar

**Maliyyə → AZIR** səhifəsi üç hissədən ibarətdir:

1. Başlıqda **«Excel-dən yüklə»** düyməsi — bankın gündəlik faylı ilə bütün günü bir dəfəyə yazır (§3.0).
2. Üstdə **«Dəyər əlavə et / yenilə»** kartı — tək dəyəri əl ilə yazmaq və düzəltmək üçün.
3. Altda **siyahı** — sütunlar: Tarix, Müddət, Dəyər (%), Həcm (mln manat), Əqd sayı, Hesablama
   (nişan «Adi» / «Ehtiyat plan»), Min. dərəcə (%), Maks. dərəcə (%), Yenilənib. Ən yeni tarix
   yuxarıda, səhifədə 50 sətir. Boş sahə `—` kimi görünür.

### 3.0. Günü Excel faylı ilə yükləmək (tövsiyə olunan yol)

Bank hər gün **«AZIR Website»** adlı `.xlsx` faylı göndərir (nümunə: `tools/AZIR Website 2026-10-27.xlsx`).
Faylı dəyişmədən yükləyin:

1. **Excel-dən yüklə** → faylı seçin (və ya pəncərəyə atın) → **Yüklə**.
2. Uğurdan sonra pəncərədə **xülasə** görünür: «27.10.2026 tarixi üçün 4 dəyər yazıldı» və hər müddətin
   yazılan dəyərləri (Dəyər, Həcm, Say, Min., Maks., Ehtiyat plan). Rəqəmləri bankın faylı ilə tutuşdurun,
   sonra **Bağla**. Siyahı özü yenilənir.
3. Həmin tarixdə bu müddətlərin dəyəri **artıq varsa**, heç nə yazılmır və sarı xəbərdarlıq çıxır:
   «… bu müddətlərin dəyəri artıq var: 1D, 30D … Fayldakı dəyərlər onları əvəz edəcək.» **Əvəz et** —
   fayldakı müddətlər tam əvəzlənir (xülasədə köhnə dəyər üstündən xətli görünür); **Ləğv et** — heç nə
   dəyişmir. Faylda olmayan müddətlərə toxunulmur.

Fayl necə oxunur:

| Faylda | Paneldə |
|---|---|
| **B2** xanasındakı tarix | Dəyərlərin tarixi (redaktor tarix seçmir). Gələcək tarix qəbul olunmur |
| «Ad / Faiz» başlıq sətrindən sonrakı sətirlər | Ada görə tanınır (sırası vacib deyil, böyük/kiçik hərf fərq etmir) |
| `AZIR` və ya `1D AZIR` | **1D**; adda `*` varsa **Ehtiyat plan** işarəsi |
| `TF AZIR 30D` / `90D` / `180D` | **30D / 90D / 180D** (ana səhifə «Pul bazarı» kartının qutuları). Faizi boş, `-` və ya 0-dırsa yazılmır |
| `AZIR TFAI` | **Yazılmır** (sayt TFAI-ni göstərmir) — xülasədə qeyd olunur |
| `LAST MIN RATE` / `LAST MAX RATE` | 1D-nin **Minimum / Maksimum dərəcə** sahələri; 0 olarsa boş qalır (əqd olmayıb) |
| Faiz (`6,3048%`) | Faylda kəsr kimi saxlanır, `6.3048` kimi yazılır (4 onluq) |
| Əqdlərin həcmi | **mln manat**: 10 000-ə qədər olduğu kimi; 1 000 000 və yuxarı manat sayılıb mln-a çevrilir (xülasədə sarı qeyd); arada olan rəqəm rədd edilir |
| Əqdlərin sayı | Tam ədəd; `-` boş deməkdir |
| `*` ilə başlayan qeyd sətirləri | Nəzərə alınmır |

Fayl səhvdirsə **heç nə yazılmır** və pəncərədə səbəb göstərilir:

| Mesaj | Səbəb |
|---|---|
| «Yalnız .xlsx formatlı fayl yükləmək olar» | `.xls`, `.pdf` və s. |
| «B2 xanasında tarix tapılmadı» / «Fayldakı tarix (…) gələcək tarixdir» | Tarix xanası boşdur və ya səhvdir |
| «Faylda «Ad / Faiz» başlıq sətri tapılmadı — şablon dəyişib?» | Bank şablonu dəyişib |
| «Sətir N, sütun B: tanınmayan indeks adı» | Faylda yeni və ya səhv yazılmış ad var |
| «Sətir N: bu indeks faylda ikinci dəfə gəlir» | Eyni sətir iki dəfədir |
| «Faylda 1D AZIR dəyəri yoxdur» | 1D sətri yoxdur və ya faizi boşdur |
| «Sətir N, sütun X: dəyər düzgün deyil» | Rəqəm yerinə mətn, mənfi dəyər, kəsr say, min > maks |
| «… həcmin vahidi aydın deyil (nə mln manat, nə manat)» | Həcm 10 000 ilə 1 000 000 arasındadır |

Tək bir dəyəri düzəltmək üçün faylı yenidən yükləmək lazım deyil — kartdan istifadə edin (§3.2).

### 3.1. Yeni günün dəyərini əl ilə daxil etmək

Kartı doldurub **Yadda saxla**:

| Sahə | Nə yazılır | Saytda təsiri |
|---|---|---|
| **Tarix** \* | Tarix seçici (`gg.aa.iiii`) | Cədvəlin «Tarix» sütunu; statistika «Yenilənmə tarixi» ən böyük tarixi götürür |
| **Müddət** \* | `1D` (default), `30D`, `90D`, `180D` | Saytdakı AZIR səhifəsi **yalnız 1D**-ni göstərir; `30D/90D/180D` ana səhifənin «Pul bazarı» kartındakı qutulardadır |
| **Dəyər (%)** \* | `0 ≤ dəyər < 10000`, ən çox 4 onluq | «Faiz» sütunu, qrafikin nöqtəsi, statistikada «Faiz indeksi». **`0` yazılan gün saytda görünmür** (bax §4) |
| **Ehtiyat plan əsasında hesablanıb** | ✔ / boş | Faizin yanında `*` və cədvəlin altında «*Ehtiyat plan əsasında hesablanmışdır» qeydi; ana səhifə kartında da `*` |
| **Əqdlərin həcmi (mln manat)** | `0 ≤ həcm < 10 000 000 000`, ən çox 2 onluq; boş ola bilər | «Əqdlərin həcmi (mln. AZN)» sütunu; statistikada həcm göstəriciləri və USD ekvivalenti |
| **Əqdlərin sayı** | 0 və ya müsbət tam ədəd; boş ola bilər | «Əqdlərin sayı» sütunu |
| **Minimum dərəcə (%)** | `0 ≤ dəyər < 10000`, ən çox 4 onluq; boş ola bilər | Statistikada «Son əməliyyat günündə minimum faiz» — yalnız **ən son** günün dəyəri götürülür |
| **Maksimum dərəcə (%)** | eyni qayda; boş ola bilər | «Son əməliyyat günündə maksimum faiz» |

\* Tarix, Müddət və Dəyər məcburidir. Qalan sahələr boş qala bilər — boş sahə saytda `—` göstərilir,
sətir gizlənmir.

Uğurla saxlananda «AZIR dəyəri yadda saxlanıldı» bildirişi çıxır, siyahı yenilənir; kartda **Tarix və
Müddət qalır**, qalan sahələr təmizlənir — növbəti günü ardıcıl daxil etmək üçün tarixi dəyişib davam
edin.

Formanın verə biləcəyi xətalar (sahənin altında):

| Mesaj | Səbəb |
|---|---|
| «Tarix düzgün seçilməlidir» | Tarix seçilməyib |
| «Dəyər 0 ilə 10000 arasında, ən çox 4 onluq rəqəmli olmalıdır» | Dəyər boşdur, mənfidir və ya çox onluğu var |
| «Həcm 0 və ya müsbət, 10 000 000 000-dan kiçik rəqəm olmalıdır» | Mənfi həcm |
| «Həcmin onluq hissəsində ən çox 2 rəqəm ola bilər» | Məs. `250.125` |
| «Əqdlərin sayı 0 və ya müsbət tam ədəd olmalıdır» | Kəsr və ya mənfi say |
| «Minimum dərəcə maksimum dərəcədən böyük ola bilməz» | Min > Maks (ikisi də doldurulubsa) |

Xəta olanda **heç nə yazılmır**. Server də eyni qaydaları yoxlayır; onun mesajı da sahənin altına düşür,
sahəyə aid olmayan xəta isə kartın üstündə qırmızı blokda görünür.

### 3.2. Mövcud dəyəri düzəltmək («Formaya yüklə»)

Ayrıca redaktə səhifəsi yoxdur. Siyahıda sətrin sağındakı **qələm** düyməsi (**Formaya yüklə**)
sətrin bütün sahələrini yuxarıdakı karta köçürür və kursoru **Dəyər (%)** sahəsinə qoyur. Lazım olanı
dəyişib **Yadda saxla** — eyni tarix + müddət olduğu üçün mövcud sətir yenilənir.

> ⚠ **Saxlama tam əvəzetmədir.** Kartda nə varsa, sətrə o yazılır: boş qoyulan sahə sətirdə də
> **silinir**, işarə götürülübsə **götürülür**. Ona görə bir sahəni düzəltmək üçün sətri həmişə
> «Formaya yüklə» ilə doldurun, karta əl ilə sıfırdan yazmayın — əks halda həcm/say/min/max itəcək.

Tez-tez rast gələn hallar:

- **Dərəcə səhv yazılıb** → Formaya yüklə → Dəyər (%) → Yadda saxla.
- **Həcm və ya say sonradan məlum oldu** → Formaya yüklə → sahəni doldur → Yadda saxla.
- **Ehtiyat plan işarəsini götürmək/qoymaq** → Formaya yüklə → işarəni dəyiş → Yadda saxla.
- **Tarixi səhv seçmisiniz** → tarix dəyişmək «köçürmək» deyil, **yeni sətir** yaradır. Düzgün tarixlə
  saxlayın, sonra səhv tarixli sətri silin (§3.3).

Sətrin **Yenilənib** sütunu hər saxlamada (yalnız işarə dəyişsə də) yenilənir. Hər yaratma, yeniləmə və
silmə audit jurnalına əvvəlki/sonrakı dəyərlərlə yazılır.

### 3.3. Dəyəri silmək

Siyahıda **Sil** (zibil qutusu) → dialoq «Qeydi sil»: «"2026-09-12 1D" AZIR dəyəri silinsin? Bu
əməliyyat geri qaytarıla bilməz.» → **Sil**. Sətir bütün sahələri ilə **birdəfəlik** silinir.

Həmin gün saytda cədvəldən, qrafikdən və statistikadan dərhal çıxır. Silinən son gün idisə, statistika
bloku növbəti ən son günə keçir.

> «Gizlətmə» və ya «aktiv/deaktiv» seçimi bu modulda **yoxdur**. Günü saytdan müvəqqəti çıxarmağın
> yeganə yolu sətri silməkdir (və ya dərəcəni `0` yazmaq — bax §4; bu, məlumatı itirmir, amma
> tövsiyə olunan üsul deyil).

### 3.4. Siyahıda axtarış

Siyahının üstündə filtrlər: **Başlanğıc**, **Son** (tarix aralığı) və **Müddət** («Müddət: hamısı»,
`1D`, `30D`, `90D`, `180D`). Filtrlər ünvanda qalır, linki paylaşmaq olar. Mətn axtarışı yoxdur.

### 3.5. Kimlər edə bilər

Bölməni görmək, dəyər yazmaq və silmək ayrı icazələrdir. **Administrator** və **Moderator** rollarının
üçü də var. Excel ilə yükləmə yazma icazəsidir (kartla eyni). Düymələr hamıya görünür; icazəsi olmayan
istifadəçi saxlayanda və ya yükləyəndə «icazə yoxdur» xətası alır — onda istifadəçinin rolunu yoxlayın.

---

## 4. Saytda nə və necə görünür

**Səhifə:** `/az/statistics/azir` (EN: `/en/statistics/azir`). Ünvan dəyişdikdə iki dil arasında
filtr saxlanılır.

```
┌──────────────────────────────────────────────────────────────┐
│ Banklararası Təminatsız Pul Bazarında İstinad Faiz Dərəcəsi - AZIR │
├──────────────────────────────────────────────────────────────┤
│ AZIR — banklararası faiz dərəcəsi        [ 1D xətti qrafiki ] │
│ ℹ 15 may 2025-ci il tarixindən etibarən AZIR indeksləri …     │
├──────────────────────────────────────────────────────────────┤
│ Başlanğıc tarix [ 31.08.2026 ]  Son tarix [ 30.10.2026 ] Göstər│
│                                                     [⬇ Yüklə] │
├──────────────┬──────────┬──────────────────────┬──────────────┤
│ Tarix        │ Faiz     │ Əqdlərin həcmi (mln. AZN) │ Əqdlərin sayı │
│ 30.10.2026   │ 7,25%    │ 250,00               │ 18           │
│ 29.10.2026   │ 7,00% *  │ 220,00               │ 15           │
│ …            │          │ —                    │ —            │
│ *Ehtiyat plan əsasında hesablanmışdır                         │
├──────────────────────────────────────────────────────────────┤
│ AZIR indeksi ilə bağlı məlumatlar                             │
│ Yenilənmə tarixi ………………………………… 30.10.2026                     │
│ Faiz indeksi, %-lə ……………………………… 7,25%                         │
│ Ötən ayın sonundan faiz fərqi ……………… +0,25                     │
│ … (cəmi 11 sətir)                                             │
└──────────────────────────────────────────────────────────────┘
```

**Qaydalar (hamısı koddan):**

- Cədvəl və qrafik **yalnız `1D`** müddətini və **yalnız dərəcəsi 0-dan böyük** günləri göstərir;
  ən yeni tarix yuxarıda. `30D/90D/180D` sətirləri bu səhifədə yoxdur.
- **Default aralıq:** bu gün − 60 gün … bu gün. İstifadəçi tarixləri dəyişə bilər; aralıq 10 ildən uzun
  ola bilməz, gələcək «Son tarix» bu günə endirilir. Səhv tarixdə filtrin altında qırmızı mesaj çıxır
  («Tarix düzgün deyil.» / «Başlanğıc tarix son tarixdən sonra ola bilməz.» / «Aralıq 10 ildən uzun
  ola bilməz.») və default aralıq göstərilir.
- Faiz 2–4 onluqla (`7,25%`, `7,1234%`), həcm 2 onluqla, say tam ədəd. Boş həcm/say `—`.
- `*` yalnız işarəli günün faizinin yanındadır; qeyd «*Ehtiyat plan əsasında hesablanmışdır» cədvəlin
  altında **yalnız göstərilən sətirlərdən ən azı biri işarəlidirsə** çıxır.
- Aralıqda sətir yoxdursa: «Seçilmiş dövr üçün məlumat yoxdur.»
- Metodologiya xəbərdarlığı sabit mətndir, paneldən dəyişmir. Metodologiya PDF-ləri bu səhifədə
  **yoxdur** (saytın `public/` qovluğunda da belə fayl yoxdur) — spec-ə görə ayrıca işdir.
- **Yüklə** düyməsi cari aralığın Excel faylını verir: `AZIR-1D_<başlanğıc>_<son>.xlsx`. Birinci
  vərəq `1D AZIR` — ekrandakı 4 sütun, eyni sətirlər, rəqəmlər rəqəm xanası kimi, `%`/`*` yoxdur
  (banklar bu strukturu avtomatik oxuyur — dəyişmir). İşarəli gün varsa ikinci vərəq **«Qeydlər»**:
  həmin tarixlər və qeyd mətni. Brauzer faylı 60 saniyə keşləyə bilər.
- **Statistika bloku** («AZIR indeksi ilə bağlı məlumatlar») filtrdən **asılı deyil**, həmişə ən son
  vəziyyəti göstərir — hamısı 1D üzrə:

| Sətir | Haradan gəlir |
|---|---|
| Yenilənmə tarixi | Dərəcəsi > 0 olan ən son 1D günü |
| Faiz indeksi, %-lə | Həmin günün **Dəyər (%)** |
| Ötən ayın sonundan faiz fərqi | Son faiz − son günün ayından əvvəlki ayın sonuna qədər olan son faiz |
| Ötən ilin sonundan faiz fərqi | Son faiz − keçən ilin 31 dekabrına qədər olan son faiz |
| Son əməliyyat günündə minimum / maksimum faiz | Son günün **Minimum / Maksimum dərəcə** sahələri — yalnız o gün; əvvəlki günə baxılmır |
| Əməliyyat həcmi, mln. manatla | Son günün **Əqdlərin həcmi** |
| Ötən ayın sonundan dəyişim | Son həcm − ötən ay sonuna qədər olan son həcm |
| Son 1 ildə minimum / maksimum həcm | **Keçən ilin 1 yanvarından** bu günə qədər olan həcmlər (etiket «son 1 il» yazsa da — köhnə saytla eyni qayda, qəsdən saxlanıb) |
| Əməliyyat həcminin dollarla ifadəsi, mln. USD | Son həcm ÷ həmin tarixə qədər olan son rəsmi USD məzənnəsi |

  Hesablana bilməyən göstərici (sahə boşdur, müqayisə günü yoxdur, USD məzənnəsi yoxdur) `—` göstərilir,
  qalanı normal işləyir. Fərqlər işarə ilə (`+0,25`, `−0,10`).

- Səhifənin hissələri müstəqildir: statistika yüklənməsə cədvəl və qrafik görünür, əksinə də. Xəta
  bloku çıxırsa, bu məzmun problemi deyil — texniki komandaya bildirin.

**Digər yerlər:**

- **Ana səhifə → «Pul bazarı» kartı:** son 60 günün ən son **1D** dəyəri böyük rəqəmlə (işarəlidirsə
  `7,25%*` və altında qeyd), yanında qrafik, **AZIR dərəcələri** düyməsi bu səhifəyə aparır. Kartdakı
  `30/90/180 gün` qutuları həmin günün `30D/90D/180D` dəyərləridir — Excel faylı ilə yüklənir (§3.0) və ya
  kartda əl ilə yazılır; dəyəri olmayan qutu görünmür.
- **Statistika səhifəsi** (`/az/statistics`): bütün tarixçənin ümumi AZIR qrafiki — filtrsiz, dəyişmir.
- Saytın menyusunda AZIR səhifəsinə bənd olub-olmaması **Səhifələr** ağacından asılıdır (yoxlanılmalıdır);
  kodda yalnız ana səhifə kartı və köhnə `/indeks/rates` yönləndirməsi var.

---

## 5. Dil görünüşü

AZIR dəyərlərinin tərcüməsi yoxdur — eyni rəqəmlər hər iki dildə görünür, yalnız sütun başlıqları,
qeyd mətni, xəbərdarlıq və statistika etiketləri saytın öz mətnləridir və paneldən dəyişmir. Onluq
ayırıcı dilə görə dəyişir (AZ `7,25`, EN `7.25`). Excel faylında başlıqlar və «Qeydlər»/«Notes» vərəq
adı səhifənin dilindədir; rəqəmlər dildən asılı deyil.

---

## 6. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] `/az/statistics/azir` — yeni gün cədvəlin **birinci** sətrindədir, faiz, həcm, say düzgündür.
- [ ] İşarəli gündürsə faizin yanında `*` və cədvəlin altında qeyd var; deyilsə `*` yoxdur.
- [ ] Qrafikin son nöqtəsi yeni günə uyğundur.
- [ ] «AZIR indeksi ilə bağlı məlumatlar» → Yenilənmə tarixi yeni gündür, min/maks faiz daxil
      etdiyinizlə eynidir.
- [ ] `/en/statistics/azir` — eyni rəqəmlər, nöqtəli onluq.
- [ ] **Yüklə** → fayl açılır, sətir sayı ekranla eynidir.
- [ ] Ana səhifə «Pul bazarı» kartında böyük rəqəm yeni 1D dəyəridir.

## 7. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Gün saytda görünmür | Dəyər `0` yazılıb, ya da müddət `1D` deyil | Formaya yüklə → Dəyər (%) düzəlt / `1D` ilə saxla |
| Gün saytda görünmür, admin-də var | Saytın keşi (~10 s) | Bir neçə saniyə sonra səhifəni yeniləyin |
| Gün cədvəldə yoxdur, amma «Yenilənmə tarixi» doğrudur | Gün default 60 günlük aralıqdan kənardadır | Filtrdə aralığı genişləndirin |
| Həcm/say/min/max itdi | Sətir karta «Formaya yüklə» ilə deyil, əl ilə yazılıb — boş sahələr silindi | Formaya yüklə → sahələri yenidən doldurun → Yadda saxla |
| Eyni günə iki sətir yaranıb | Fərqli müddət seçilib (məs. `1D` və `30D`) | Artıq olanı silin |
| Statistikada min/maks faiz `—` | Son günün Minimum/Maksimum dərəcə sahələri boşdur | Son günü Formaya yüklə → doldur |
| Statistikada «dollarla ifadəsi» `—` | Son günün həcmi boşdur və ya həmin tarixə qədər USD məzənnəsi yoxdur | Həcmi doldurun / məzənnə modulunu yoxlayın |
| «Ötən ayın/ilin sonundan fərq» `—` | Müqayisə üçün əvvəlki dövrdə 1D sətri yoxdur | Normaldır (tarixçə yoxdur) |
| Ana səhifə kartında 30/90/180 gün qutuları boşdur | Son günün `30D/90D/180D` dəyəri yazılmayıb | Günün faylını yükləyin (§3.0) və ya kartda əl ilə yazın |
| Excel yükləyəndə «Sətir N, sütun B: tanınmayan indeks adı» | Bank faylında yeni/dəyişmiş ad var | Faylın həmin sətrinə baxın; şablon dəyişibsə texniki komandaya |
| Xülasədə «həcm manatdan çevrildi» qeydi | Faylda həcm manatla yazılıb | Rəqəmin mln manat kimi düzgün olduğunu yoxlayın |
| Saxlayanda qırmızı blokda ümumi xəta | Server/şəbəkə xətası və ya icazə yoxdur | Rolunuzu yoxlayın, təkrar edin, davam edərsə texniki komandaya |

---

## Əlavə: developerlər üçün

| Qat | Yer |
|---|---|
| Admin səhifə | `product-rest/web-cbar-admin-new/src/pages/azir/index.tsx` → `CrudListPage` + `AzirUpsertCard` (`features/azir/components/azir-upsert-card.tsx`), prefill konteksti `features/azir/model/prefill.ts`, modul `features/azir/model/module.ts` (`canCreate/canEdit: false`, `pageSize: 50`) |
| Admin API | `api-cbar-admin` → `AzirController` — `GET /api/v1/azir?from&to&term&page&pageSize`, `POST /api/v1/azir` (upsert, `(valueDate, term)` üzrə), `DELETE /api/v1/azir/{id}`; icazələr `azir.read/create/delete` (yeniləmə də `azir.create`-dir); audit `azir.create/update/delete` |
| Public API | `api-cbar` → `StatsController` — `GET /api/v1/azir?from&to&term` (filtr yoxdur, `rate > 0` süzgəci saytdadır), `GET /api/v1/azir/summary` (yalnız `1D`, `rate > 0`; «bu gün» konteyner TZ `Asia/Baku`) |
| Sayt | `web-cbar-new/src/app/[locale]/(content)/statistics/azir/page.tsx` → `views/azir/loader.ts`; aralıq `features/stats/model/azir-range.ts` (60 gün, maks 3653); sətirlər `azir-rows.ts`; export `…/azir/export/route.ts` + `azir-export.ts` + `shared/lib/xlsx`; köhnə URL `src/proxy.ts` `LEGACY_AZIR`; statistika `widgets/azir-summary` |
| Keş | `web-cbar-new/src/server/cached.ts` `CONTENT_REVALIDATE_SECONDS = 10` (stale-while-revalidate); export cavabı `Cache-Control: private, max-age=60` |
| DB | `azir_index_values` (`UNIQUE (value_date, term)`, `rate numeric(8,4)`), detal `azir_index_value_details` (migrasiya `0008`; FK yalnız `REFERENCES` icazəsi varsa yaranır, controller detalı özü silir) |
| Spec | `specs/021-azir-rates-page/` (spec, data-model §3 validasiya, contracts/admin-api.md, public-api.md, web-routes.md, xlsx.md) |

- Upsert tam əvəzetmədir (`ApplyDetails`): panel həmişə 8 sahəni göndərir, boş → `null`, işarə həmişə
  göndərilir. Yalnız detal dəyişəndə də `UpdatedAt` açıq yenilənir.
- Server validasiyası `FieldValidationProblem` ilə `errors.{field}` qaytarır; panel `SERVER_FIELDS`
  üzrə sahəyə, qalanını alert-ə yazır.
- `AZIR_TERMS` (admin) `['1D','30D','90D','180D']` saytın `HOME_AZIR_TERMS` (`['30D','90D','180D']`) ilə
  uyğundur (spec 058; əvvəl `1D/1W/1M` idi).
- **Excel importu** (spec 058, `specs/058-azir-excel-import/`): `POST /api/v1/azir/import` (multipart `file`,
  `overwrite`; icazə `azir.create`), oxuyucu `Validation/AzirSheetReader.cs` (saf funksiya, testlər
  `tests/Cbar.AdminApi.Tests/AzirSheetReaderTests.cs` bankın real faylı ilə), bütöv tranzaksiya, audit
  `azir.import` (entity id `yyyyMMdd`). Mövcud müddət → `409 date_exists` (`valueDate`, `count`, `terms`).
  TFAI yazılmır: saytın `/statistics` qrafiki (`azirSeries`) bütün müddətləri bir `%` oxunda çəkir (ana səhifə qrafiki yalnız 1D-dir).
  Panel: `features/azir/components/azir-import-dialog.tsx` + `azir-import-summary.tsx`, `model/import-state.ts`.
