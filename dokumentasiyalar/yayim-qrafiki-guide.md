# Məlumatların yayımlanması qrafiki — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Məlumatların yayımlanması qrafiki»** səhifəsini izah edir: Mərkəzi Bankın saytda hansı
məlumatı, hansı dövriliklə və hansı müddətdə dərc etdiyini göstərən cədvəl admin paneldən necə idarə olunur,
«Qrafikə uyğun» pəncərəsindəki qərar tarixləri haradan gəlir və dəyişiklik saytda harada, necə görünür.

> Köhnə saytda bu cədvəl adi səhifənin mətnində **əllə yazılmış HTML cədvəl** idi (`page-72`). Yeni saytda cədvəlin
> hər sətri admin paneldə ayrıca qeyddir: HTML yazmaq, sətir birləşdirmək lazım deyil, redaktorun səhvi cədvəlin
> görünüşünü pozmur. Səhifənin başlığı və giriş mətni isə əvvəlki kimi **Səhifələr** bölməsindədir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Məzmun** → **Yayım qrafiki** (`/release-schedule`); yuxarıda üç tab: **Sətirlər** · **Qruplar** · **Dövriliklər** |
| **Sayt (AZ)** | `https://<sayt>/az/media/release-schedule` |
| **Sayt (EN)** | `https://<sayt>/en/media/release-schedule` |
| **Saytda yolu** | Media → **Məlumatların yayımlanması qrafiki** (sol menyu) |
| **Köhnə ünvanlar** | `/page-72/…`, `/az/melumatlarin-yayimlanmasi-qrafiki`, `/en/information-disclosure-schedule` avtomatik yeni ünvana yönləndirilir |

Səhifə **üç yerdən** qurulur:

| Saytda | Haradan gəlir | Admin paneldə |
|---|---|---|
| Başlıq və giriş mətni | CMS səhifəsi `melumatlarin-yayimlanmasi-qrafiki` / `information-disclosure-schedule` | **Səhifələr** |
| Cədvəl (qruplar və sətirlər) | Yayım qrafiki | **Yayım qrafiki** → Sətirlər, Qruplar, Dövriliklər |
| «Qrafikə uyğun ↗» pəncərəsindəki tarixlər | Cari ilin «Qərar» növlü tədbirləri | **Tədbirlər** |

Dəyişiklik saytda **təsdiqsiz, ən geci ~10 saniyə** sonra görünür (saytın qısa keşi var). Saxladıqdan sonra səhifəni
bir-iki dəfə yeniləmək kifayətdir.

**Kim redaktə edə bilər:** **admin** və **moderator** rolları. Başqa rolun istifadəçisi bölməni açanda «icazə yoxdur»
xətası görür.

---

## 2. Yayımdan sonra bir dəfəlik hazırlıq

Yeni sayt ilk dəfə yayımlananda köhnə cədvəlin bütün sətirləri (22 sətir, 2 qrup, 7 dövrilik) **avtomatik** admin panelə
köçürülür, az və en mətnləri ilə birlikdə, köhnə sıra ilə. Heç nəyi yenidən yazmaq lazım deyil. Amma aşağıdakıları bir
dəfə edin:

### 2.1. Səhifəni Media bölməsinin altına keçirin

Köhnə saytda bu səhifə heç bir bölmənin içində deyildi, ona görə yeni saytda sol menyuda və breadcrumb-da görünmür.

1. **Səhifələr** bölməsini açın.
2. **«Məlumatların yayımlanması qrafiki»** səhifəsini tapın (az ünvanı `melumatlarin-yayimlanmasi-qrafiki`).
3. Onu **Media** səhifəsinin altına sürüşdürün (ağacda istədiyiniz sıraya, Figma-da «Korporativ sosial məsuliyyət»dən sonra).

Səhifənin özünün ünvanı ilə bağlı heç nə etməyin: menyudakı link avtomatik `/media/release-schedule`-ə aparır.

### 2.2. Giriş mətnini yeniləyin

Səhifənin mətnində **cədvəldən əvvəlki hissə** saytda giriş mətni kimi göstərilir. Hazırda orada köhnə qalın başlıq var
(«Mərkəzi Bankın internet səhifəsi vasitəsilə açıqlanan məlumatların strukturu və dövriliyi»). Figma-dakı mətni yazın:

> Mərkəzi Bankın internet saytında yerləşdirilən məlumatların növləri, onların yayımlanma dövriliyi və təqdim olunma
> müddətləri aşağıdakı cədvəldə göstərilib.

İngilis dilində də eyni şəkildə. Köhnə cədvəli mətndə saxlaya və ya silə bilərsiniz: Yayım qrafikində ən azı bir dərc
olunmuş sətir olduqca saytda **görünmür** (bax §7.4).

### 2.3. Köçürülmüş sətirləri yoxlayın

Köhnə cədvəldə bu beş sətrin dövriliyi və müddəti **boş** idi. Onlara Figma-dakı dəyərlər verilib — doğru olub-olmadığını
yoxlayın:

| Sətir | Verilmiş dövrilik | Verilmiş müddət |
|---|---|---|
| Milli pul nişanları üzrə məlumatlar | İnformasiyanın dəyişməsindən asılı olaraq | Dərhal |
| Nəşrlər və tədqiqatlar üzrə məlumatlar | İnformasiyanın dəyişməsindən asılı olaraq | Dərhal |
| Maliyyə savadlılığı üzrə məlumatlar | İnformasiyanın dəyişməsindən asılı olaraq | Dərhal |
| Beynəlxalq əməkdaşlıq üzrə | İnformasiyanın dəyişməsindən asılı olaraq | Dərhal |
| Ümumi kommunikasiya məlumatları | İnformasiyanın dəyişməsindən asılı olaraq | Dərhal |

Bir neçə sətrin ingiliscə mətni köhnə cədvəldən qısaldılıb (məs. «The schedule of statistical releases», «Complaint index on
compulsory civil liability insurance of vehicle owners») — EN tabında oxuyun.

### 2.4. Qərar tarixlərini yoxlayın

«Pul siyasəti ilə bağlı qəbul olunan qərarlar» sətrinin «Qrafikə uyğun ↗» linki pəncərə açır, tarixlər isə **Tədbirlər**
bölməsindən gəlir (bax §6). Cari ilin bütün qərar tarixləri Tədbirlərdə «Qərar» növü ilə dərc olunub-olunmadığını
yoxlayın.

---

## 3. Sətirlər

**Yayım qrafiki → Sətirlər** tabı cədvəlin bütün sətirlərini göstərir: Məzmun, Qrup, Dövrilik, Müddət xanası, Sıra, Status.
Siyahı saytdakı kimi düzülüb: əvvəl qrupun sırası, sonra sətrin sırası.

**Axtarış və filtrlər:** yuxarıdakı axtarış sahəsi məzmunda (hər iki dildə) axtarır; filtrlərlə **Qrup**, **Dövrilik** və
**Status** üzrə süzmək olar.

### 3.1. Yeni sətir əlavə etmək

1. **Sətirlər** → **Yeni**.
2. Sahələri doldurun:

| Sahə | Məcburi | Qeyd |
|---|---|---|
| Qrup | bəli | Sətrin altında durduğu qalın başlıq. Siyahı **Qruplar** tabından gəlir |
| Dövrilik | yox | Siyahıdan seçilir (**Dövriliklər** tabı). Boş qalsa saytda «—» görünür |
| Müddət xanası | bəli | **Mətn**, **Link** və ya **Qərarlar qrafiki** — bax §3.2 |
| Link | yalnız «Link» rejimində | Bax §3.2 |
| Status | bəli | Saytda yalnız **Dərc olunub** görünür. «Planlaşdırılıb» seçimi yoxdur |
| Sıra | yox | Qrup daxilində kiçikdən böyüyə düzülür. Default 0 |
| Azərbaycan dilində göstər / İngilis dilində göstər | — | Default ikisi də işarəlidir. İşarəni götürsəniz sətir həmin dilin saytında görünmür |
| Məzmun (AZ / EN) | bəli, ən azı bir dildə | Cədvəlin birinci sütunu, məs. «İllik inflyasiya» |
| Təqdim olunma müddəti (AZ / EN) | yox | Üçüncü sütun, məs. «Növbəti ayın 20-dək» |

3. **Yadda saxla**.

**Dillər haqqında:** hansı dilin tabında heç nə yazmasanız, sətir həmin dilin saytında görünmür. Bir dildə yazmağa
başlamısınızsa (məs. yalnız EN müddətini doldurmusunuz), həmin dildə **Məzmun** da məcburidir — forma bunu göstərəcək.

### 3.2. Müddət xanasının rejimləri

| Rejim | Saytda | Nə vaxt |
|---|---|---|
| **Mətn** | Adi mətn: «Dərhal», «Növbəti ayın 10-dək» | Əksər sətirlər |
| **Link** | Altdan xətli mətn və **↗** işarəsi; klik linki açır | Müddət başqa səhifədə yazılıbsa |
| **Qərarlar qrafiki** | Altdan xətli mətn və **↗**; klik pul siyasəti qərarlarının tarixlərini **pəncərədə** açır | Yalnız «Pul siyasəti ilə bağlı qəbul olunan qərarlar» kimi sətir |

**Link rejimi:**

- **Link** sahəsi bu rejimdə **məcburidir**. Qəbul olunur:
  - tam ünvan: `https://e-qanun.az/…` — saytda **yeni pəncərədə** açılır;
  - saytın öz yolu, **dil prefiksi olmadan**: `/statistik-hesabatlarin-yayimlanmasi-qrafiki`, `/statistics` — eyni pəncərədə
    açılır, `/az` və ya `/en` prefiksini sayt özü əlavə edir.
- Qəbul olunmur: `//host…`, `javascript:…`, `mailto:…` və digər sxemlər.
- Müddət mətni boş qalsa, saytda link «Keçid» sözü ilə göstərilir.

**Başqa rejimə keçəndə** Link sahəsindəki ünvan **saxlanmır** (silinir). Bu normaldır.

**Qərarlar qrafiki rejimi:** Link sahəsi lazım deyil. Müddət mətni boş qalsa saytda «Qrafikə uyğun» yazılır. Pəncərənin
məzmunu Tədbirlərdən qurulur (bax §6).

### 3.3. Sətri redaktə etmək

Siyahıda sətrin üzərinə klikləyin, dəyişin, **Yadda saxla**. Dildən birini tam silmək üçün həmin dilin tabındakı bütün
sahələri boşaldın — sətir o dilin saytından çıxar.

### 3.4. Sırasını dəyişmək

Sətirlər qrup daxilində **Sıra** rəqəminə görə düzülür. Köçürülmüş sətirlər 10, 20, 30 … ilə nömrələnib, ona görə
ikisinin arasına yeni sətir qoymaq üçün aradakı rəqəmi verin (məs. 20 ilə 30 arasına 25).

Sətri başqa qrupa keçirmək üçün formada **Qrup**-u dəyişin.

### 3.5. Sətri gizlətmək və silmək

- **Müvəqqəti gizlətmək:** Statusu **Qaralama** edin. Sətir paneldə qalır, saytdan çıxır.
- **Bir dildə gizlətmək:** «… dilində göstər» işarəsini götürün.
- **Silmək:** siyahıda **Sil** düyməsi. Silinən sətir siyahıdan çıxır və saytda görünmür.

---

## 4. Qruplar

**Yayım qrafiki → Qruplar** tabı cədvəlin qalın bölmə sətirləridir: «Pul və məzənnə siyasəti üzrə», «Normativ-hüquqi baza
üzrə».

| Sahə | Məcburi | Qeyd |
|---|---|---|
| Ad (AZ / EN) | bəli, ən azı bir dildə | Hansı dildə adı yoxdursa, qrup və onun **bütün sətirləri** həmin dilin saytında görünmür |
| Sıra | yox | Qruplar saytda bu rəqəmə görə düzülür |
| Aktiv | — | Deaktiv qrup **və onun sətirləri** saytda görünmür, paneldə qalır |

- Yeni qrup yaradanda sətir formasında **Qrup** siyahısında dərhal görünür.
- Adı dəyişəndə bütün sətirlərin başlığı saytda dəyişir.
- **Sətri olan qrup silinmir** — panel «The group is used by an item.» mesajını göstərir. Əvvəl həmin sətirləri başqa qrupa
  keçirin və ya silin. Silinmiş sətirlər də sayılır, ona görə belə qrupu silmək əvəzinə **Aktiv** işarəsini götürün.
- Qrupda heç bir dərc olunmuş sətir yoxdursa, saytda qrup başlığı da görünmür.

---

## 5. Dövriliklər

**Yayım qrafiki → Dövriliklər** tabı sətirlərin ikinci sütununda seçilən dəyərlərdir. Bir dəyər bir dəfə yazılır, sətirlərdə
seçilir — beləcə eyni dövrilik müxtəlif yazılmır.

Köçürülmüş dəyərlər:

| AZ | EN |
|---|---|
| İllik | Annually |
| Rüblük | Quarterly |
| Aylıq | Monthly |
| Gündəlik | Daily |
| İnformasiyanın dəyişməsindən asılı olaraq | Depending on updates |
| Qərar müvafiq qaydada təsdiq edildikdə | When decisions are accordingly approved |
| Yeni layihə müzakirələrə təqdim edildikdə | When new drafts are released |

| Sahə | Məcburi | Qeyd |
|---|---|---|
| Ad (AZ / EN) | bəli, ən azı bir dildə | Hansı dildə ad yoxdursa, həmin dilin saytında xanada «—» görünür |
| Sıra | yox | Sətir formasındakı seçim siyahısının sırası |

- Adı dəyişəndə **bütün** bağlı sətirlərdə saytda yeni ad görünür.
- **İstifadədə olan dövrilik silinmir** — panel «The periodicity is used by an item.» mesajını göstərir.

---

## 6. «Qrafikə uyğun» pəncərəsi — pul siyasəti qərarlarının tarixləri

Pəncərənin tarixləri **ayrıca yazılmır**: onlar **Tədbirlər** bölməsindəki **cari ilin** «Qərar» növlü, dərc olunmuş
tədbirləridir. Beləcə tarixlər bir yerdə saxlanır və ana səhifənin «Təqvim» bloku ilə eyni olur.

### 6.1. Pəncərədə nə görünür

- **Başlıq:** «Pul siyasəti qərarlarının açıqlanması qrafiki», altında «2026-cı il · Mərkəzi Bankın İdarə Heyəti» (il avtomatik).
- **«Növbəti açıqlama» kartı** (tünd mavi): bu gündən (Bakı vaxtı, bu gün daxil) sonrakı ilk qərarın tarixi və növü.
- **Tarix plitələri:** cari ilin bütün qərar tarixləri, artan sıra ilə. Hər plitədə gün, ay və növ:
  - **boz** — keçmiş tarix;
  - **tünd mavi** — növbəti açıqlama;
  - **ağ, haşiyəli** — sonrakı tarixlər.
- **«Bütün qərarlar →»** — Tədbirlər səhifəsini «Qərar» növü ilə süzülmüş açır.

### 6.2. Növ: «Press-reliz» və ya «Press-reliz və mətbuat konfransı»

Qərar günündə **«Mətbuat konfransı»** növlü dərc olunmuş tədbir də varsa, həmin tarixin altında **«Press-reliz və mətbuat
konfransı»** yazılır; yoxdursa **«Press-reliz»**. Yəni mətbuat konfranslı günü göstərmək üçün Tədbirlərdə həmin günə ikinci
tədbir — növü «Mətbuat konfransı» — əlavə edin.

### 6.3. Qərar tarixini əlavə etmək

1. **Tədbirlər** → **Yeni**.
2. **Növ:** **Qərar**. **Başlanğıc tarixi:** qərarın açıqlanacağı gün. **Status:** **Dərc olunub**. Başlıq yazın
   (məs. «Pul siyasəti üzrə qərar»), ən azı bir dildə.
3. Həmin gün mətbuat konfransı da olacaqsa, eyni tarixlə ikinci tədbir yaradın, **Növ:** **Mətbuat konfransı**.

Tədbirin ingiliscə başlığı olmasa da tarix ingilis saytının pəncərəsində görünür: pəncərə yalnız tarixi və növü göstərir.

### 6.4. Yeni il

Yeni ilin qərar tarixləri elan olunanda onları Tədbirlərə əlavə etmək **kifayətdir** — pəncərə 1 yanvardan avtomatik yeni
ili göstərir, səhifəni və ya sətri dəyişmək lazım deyil.

- Dekabrın sonunda cari ilin bütün qərarları keçibsə, amma növbəti ilin ilk tarixi artıq Tədbirlərdədirsə, «Növbəti
  açıqlama» kartı **növbəti ilin** tarixini göstərir; plitələr isə hələ cari ilindir.
- Növbəti qərar heç yazılmayıbsa, kart görünmür.
- Cari ildə heç bir qərar yoxdursa, plitələrin yerində «Bu il üçün qrafik hələ dərc olunmayıb.» yazılır.

Köhnə saytda bu link hər il yenidən yazılan ayrıca səhifəyə (`page-131`) aparırdı. O səhifə ağacda qalır, amma artıq lazım
deyil; əvvəlki illərin qərarları «Bütün qərarlar →» ilə Tədbirlərdə görünür.

---

## 7. Saytda nə görünür

### 7.1. Səhifənin quruluşu

Yuxarıdan aşağı: breadcrumb və paylaşma düymələri → solda **Media** menyusu → başlıq → giriş mətni → axtarış → cədvəl.

| Ekran | Cədvəl |
|---|---|
| **Desktop, planşet** | Üç sütun: **Məzmun · Dövrilik · Təqdim olunma müddəti**; tünd mavi başlıq sətri, hər qrup boz qalın sətirlə başlayır |
| **Mobil** | Hər sətir ayrıca kart: qalın məzmun, altında «Dövrilik» və «Təqdim olunma müddəti» etiketləri ilə dəyərlər |

### 7.2. Axtarış

- Yalnız **Məzmun** sütununda axtarır; qrup adı və müddət mətni axtarılmır.
- Böyük-kiçik hərfə və **İ / ı** fərqinə həssas deyil: «inflyasiya», «İNFLYASİYA», «INFLYASIYA» eyni nəticəni verir.
- Nəticədə yalnız uyğun sətirlər və onların qrup başlıqları qalır.
- Axtarış sözü ünvanda saxlanır (`?q=…`) — linki paylaşsanız qarşı tərəf eyni nəticəni görür.
- **«Filtrləri təmizlə»** bütün cədvəli qaytarır.
- Heç nə tapılmasa: «Axtarışa uyğun məlumat tapılmadı.»

### 7.3. Linklər və pəncərə

- Link rejimli xana: tam ünvan yeni pəncərədə, saytın öz yolu eyni pəncərədə açılır.
- Qərarlar qrafiki xanası pəncərəni açır; **Esc**, fona klik və ya bağlama düyməsi onu bağlayır. Brauzerdə JavaScript
  söndürülübsə, eyni link Tədbirlər səhifəsini («Qərar» növü) açır.
- Mobildə pəncərə ekranın altından açılır.

### 7.4. Yayım qrafikində heç nə yoxdursa

Yayım qrafikində **heç bir dərc olunmuş sətir yoxdursa** (və ya məlumat müvəqqəti alınmırsa), sayt səhifə 130-un **mətnini
olduğu kimi** — köhnə əl cədvəli ilə birlikdə — göstərir; axtarış və yeni cədvəl görünmür. Bu, ziyarətçinin heç vaxt boş
səhifə görməməsi üçündür. Bir sətir dərc olunan kimi səhifə yeni cədvələ keçir.

### 7.5. «Son yenilənmə» tarixi

Figma-da var, amma qəsdən göstərilmir.

---

## 8. Yoxlama siyahısı

- [ ] Səhifə 130 **Media** altındadır, sol menyuda «Məlumatların yayımlanması qrafiki» görünür və aktiv işarələnir.
- [ ] Giriş mətni Figma-dakı cümlədir, altında köhnə cədvəl görünmür.
- [ ] Yeni sətrin statusu **Dərc olunub**-dur və düzgün qrupdadır.
- [ ] Hər iki dildə məzmun var, ya da sətir qəsdən bir dil üçündür.
- [ ] Link rejimli sətrin linki açılır; saytın öz yolu dil prefiksi olmadan yazılıb.
- [ ] «Qrafikə uyğun ↗» pəncərəsində cari ilin bütün qərar tarixləri var, mətbuat konfranslı günlər düzgün yazılıb.
- [ ] «Növbəti açıqlama» düzgün tarixi göstərir.
- [ ] İngilis saytında (`/en/media/release-schedule`) cədvəl və pəncərə yoxlanıb.

---

## 9. Tez-tez rast gələn problemlər

| Problem | Səbəb | Həll |
|---|---|---|
| Sətir saytda yoxdur | Status **Dərc olunub** deyil | Statusu dəyişin |
| Sətir yalnız bir dildə yoxdur | O dildə məzmun boşdur və ya «… dilində göstər» işarəsi götürülüb | Həmin dilin tabını doldurun / işarəni qoyun |
| Bütöv qrup yoxdur | Qrup deaktivdir, o dildə adı yoxdur və ya dərc olunmuş sətri yoxdur | Qrupu yoxlayın |
| Dövrilik xanasında «—» | Dövrilik seçilməyib və ya o dildə adı yoxdur | Sətirdə seçin / Dövriliklərdə adı yazın |
| Link saxlanmır | «Link» rejimində link boşdur və ya `https://`, `http://`, `/` ilə başlamır | Düzgün ünvan yazın |
| Link başqa dilə aparır və ya 404 | Saytın öz yoluna `/az` yazılıb | Prefiksiz yazın: `/statistics` |
| Rejimi dəyişəndə link itdi | Link yalnız «Link» rejimində saxlanır | Normaldır; lazımdırsa yenidən yazın |
| Pəncərədə tarix yoxdur | Tədbirlərdə cari ilin «Qərar» tədbiri yoxdur və ya dərc olunmayıb | Tədbirlərə əlavə edin (§6.3) |
| Mətbuat konfransı yazılmır | Həmin gün «Mətbuat konfransı» növlü dərc olunmuş tədbir yoxdur | Eyni tarixlə ikinci tədbir yaradın |
| «Növbəti açıqlama» yoxdur | Bu gündən sonra heç bir qərar tarixi yoxdur | Növbəti tarixi Tədbirlərə əlavə edin |
| Saytda köhnə cədvəl görünür, axtarış yoxdur | Yayım qrafikində dərc olunmuş sətir yoxdur | Sətirləri dərc edin (§7.4) |
| Sol menyuda səhifə yoxdur | Səhifə 130 Media altında deyil | §2.1 |
| Qrup / dövrilik silinmir | Ona bağlı sətir var (silinmiş sətirlər də sayılır) | Qrupu deaktiv edin; dövriliyi sətirlərdən çıxarın |
| Dəyişiklik görünmür | Saytın 10 saniyəlik keşi | Bir az gözləyib səhifəni yeniləyin |

---

## 10. Developerlər üçün

Spec: `specs/039-media-release-schedule/` (spec, plan, research, data-model, `contracts/{admin-api,public-api,ui-contract}.md`,
quickstart).

- **Cədvəllər:** `release_schedule_groups`, `release_schedule_periodicities`, `release_schedule_items` və hər birinin
  `*_translations` cədvəli — miqrasiya `0022-release-schedule.sql`. `timing_mode` 1 mətn, 2 link, 3 qərarlar; `timing_url`
  yalnız rejim 2-də (CHECK). Köhnə cədvəl `0023-release-schedule-seed.sql` ilə köçür; cədvəllər boş deyilsə və ya `locales`
  yoxdursa (tam boş dev bazası) atlanır.
- **İcazələr:** `release_schedule.read/create/update/delete`, moderator roluna verilir.
- **Admin API:** `/api/v1/release-schedule/items`, `/groups`, `/periodicities` (CRUD, audit `release_schedule.*`).
- **Public API:** `GET /api/v1/release-schedule?locale=` — qruplar, sətirlər və `decisions` (`year`, `dates`, `next`);
  tarixlər `events` cədvəlindən (`type = 1`, eyni gündə `type = 2` → `withPressConference`), Bakı günü `BakuClock`.
- **Sayt:** `/[locale]/media/release-schedule` (`views/media-release-schedule`, `widgets/release-schedule-table`,
  `widgets/decisions-dialog`). Axtarış API-də yox, loader-dədir (`features/release-schedule/model/search.ts`), çünki
  Postgres İ/ı qatlamır. Giriş mətni `model/intro.ts` ilə CMS səhifəsinin ilk cədvəlinə qədər kəsilir. Menyu
  `isReleaseScheduleNode` + `FEATURE_ROUTES`, köhnə ünvanlar `src/proxy.ts` `legacyRedirect()`.
- **Admin panel:** `features/release-schedule`, `pages/release-schedule`; Link sahəsi həmişə görünür, `superRefine` onu yalnız
  «Link» rejimində məcburi edir, `buildPayload` digər rejimlərdə `null` göndərir.
- **Deploy sırası:** `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`. Sayt köhnə API ilə də işləyir:
  endpoint yoxdursa §7.4-dəki kimi CMS mətnini göstərir.
- Redaktor qeydi saytın öz repo-sunda da var: `product-rest/web-cbar-new/docs/media-cms-guide.md` → «Məlumatların
  yayımlanması qrafiki».
