# Aylıq hesabatlar — idarəetmə təlimatı

Bu sənəd admin paneldəki **«Aylıq hesabatlar»** bölməsini izah edir. Bölmədə hər ay dərc olunan üç hesabatın faylları saxlanılır:
**bank xidmətləri üzrə şikayət indeksi**, **avto-icbari sığorta üzrə şikayət indeksi** və **infoqrafika** (vətəndaş müraciətlərinə dair
aylıq statistik hesabat). Sənəd yeni ayın necə əlavə olunduğunu və onun saytda harada, necə görünəcəyini göstərir.

> Əvvəllər bu faylları səhifənin mətnində saxlayırdınız. Hər il üçün bir akkordeon, içində hər ay üçün bir akkordeon, onun içində
> fayl linki, iki dildə ayrı-ayrı. Başlıqda bir səhv olsa, blok saytda adi mətnə çevrilirdi. İndi **hər ay bir formadır**: seriya, il,
> ay, fayl. Akkordeon qurmaq və başlıq yazmaq lazım deyil. Səhifələrin giriş mətni və şikayət indeksinin metodologiyası isə əvvəlki
> kimi **Səhifələr** bölməsində qalır.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Aylıq hesabatlar** («İstehlakçı hüquqları» qrupunun tək bəndi, `/monthly-reports`) |
| **Sayt: şikayət indeksləri (AZ)** | `https://<sayt>/az/bank-xidmetlerinden-istifade-uzre-sikayet-indeksi` (Sığorta tabı: `…?tab=insurance`) |
| **Sayt: şikayət indeksləri (EN)** | `https://<sayt>/en/complaint-index-on-bank-customers-use-of-bank-services` |
| **Sayt: infoqrafika** | `https://<sayt>/az/vetendas-muracietlerine-dair-statistika#infoqrafika` (statistika səhifəsinin sonu) |
| **Saytda yolu** | Üst menyu → **İstehlakçıların və investorların hüquqları** → «Şikayət indeksləri» və ya «Vətəndaş müraciətlərinə dair statistika» |

Üç **seriya** var. Hər biri saytda bir yerdə göstərilir:

| Seriya (paneldə tab) | Saytda harada | Bir hesabat nəyi əhatə edir |
|---|---|---|
| **Bank indeksi** | «Şikayət indeksləri» səhifəsi, **Bank** tabı | bir ay |
| **Sığorta indeksi** | «Şikayət indeksləri» səhifəsi, **Sığorta** tabı | həmin ayla bitən **12 ay** |
| **İnfoqrafika** | «Vətəndaş müraciətlərinə dair statistika» səhifəsinin sonundakı **İnfoqrafika** bloku | bir ay |

Hər səhifə iki yerdən qurulur:

| Saytda | Haradan gəlir | Admin paneldə |
|---|---|---|
| «Son məlumat» kartı, «Arxiv» (il → ay) | Aylıq hesabatlar | **Aylıq hesabatlar** |
| Səhifənin başlığı, giriş mətni, metodologiya, statistika cədvəlləri | CMS səhifəsi | **Səhifələr** → İstehlakçıların və investorların hüquqları → səhifə ([İstehlakçı hüquqları təlimatı](istehlakci-huquqlari-guide.md)) |
| Tabların, «Son məlumat», «Arxiv» sözləri, ay adları | Saytın sabit etiketləri (az/en) | Dəyişdirilmir |

Dəyişiklik saytda **təsdiqsiz, ən geci ~10 saniyə** sonra görünür (saytın qısa keşi var). Saxladıqdan sonra səhifəni bir-iki dəfə
yeniləmək kifayətdir.

**Kim redaktə edə bilər:** **admin** və **moderator** rolları. Başqa rolun istifadəçisi bölməni açanda «icazə yoxdur» xətası görür.

---

## 2. Yayımdan sonra bir dəfəlik hazırlıq

Yeni sistem ilk dəfə yayımlananda səhifələrin mətnindəki köhnə arxivlər **avtomatik** bu bölməyə köçürülür. Hər ay öz faylı ilə,
dərc olunmuş halda köçür. az mətnindən sətir yaranır, ingiliscə mətndəki eyni ayın faylı həmin sətrə en faylı kimi əlavə olunur.
Test mühitində nəticə belədir:

| Seriya | Ay | az faylı | en faylı |
|---|---|---|---|
| Bank indeksi | 32 (2023–2026) | 32 | 32 |
| Sığorta indeksi | 45 (2022–2026) | 45 | 41 |
| İnfoqrafika | 65 (2021–2026) | 65 | — (ingiliscə səhifə yoxdur) |

Səhifələrin mətni **dəyişdirilmir**: köhnə akkordeonlar mətndə qalır, amma sayt onları artıq göstərmir (§5). Bölmədə artıq sətir
varsa, köçürmə ona toxunmur.

Aşağıdakıları bir dəfə yoxlayın:

### 2.1. Köçməyən aylar

Bunlar köçürülmür, saytda da görünmür:
- başlığı ay adı olmayan akkordeon (məsələn, «İyun ayı» və ya «Rüb I»);
- faylı media kitabxanasında olmayan ay.

Test mühitində belə iki ay var: Sığorta indeksinin **ingiliscə** arxivində iki ay faylı media kitabxanasına yox,
`uploads.cbar.az` saytına link verir. Bu aylar köhnə saytda görünürdü. Lazımdırsa, faylı media kitabxanasına yükləyin və həmin
ayın sətrini açıb **en** faylı kimi seçin (§4).

### 2.2. İnfoqrafikanın ingiliscə adı

Seriyanın ingiliscə adı («Statistical report on appeals received by the Central Bank of the Republic of Azerbaijan») **tərcümə
qaralamasıdır**, çünki köhnə saytda ingiliscə infoqrafika yox idi. Adı dəyişmək lazımdırsa, developerlərə müraciət edin: seriya
adlarını paneldən dəyişmək mümkün deyil (§7).

---

## 3. Yeni ay əlavə etmək

Hər ay **bir dəfə**, adətən hesabat hazır olanda:

1. Sol menyu → **Aylıq hesabatlar**.
2. Siyahının üstündəki tablardan seriyanı seçin: **Bank indeksi**, **Sığorta indeksi** və ya **İnfoqrafika**.
3. **Yeni** düyməsini basın. Forma bu seçimlə açılır:
   - **Seriya**: seçdiyiniz tab;
   - **İl** və **Ay**: həmin seriyanın siyahıdakı ən yeni ayından **sonrakı ay** (məsələn, son ay May 2026-dırsa, İyun 2026;
     Dekabrdan sonra növbəti ilin Yanvarı).
4. **Fayl**: **az** tabında **Seç** düyməsi ilə faylı media kitabxanasından seçin və ya yeni fayl yükləyin.
5. İngiliscə fayl varsa, **en** tabına keçib onu da seçin. Yoxdursa, en tabını boş saxlayın.
6. **Status**: saytda görünməsi üçün **Dərc olunub** seçin. **Qaralama** saytda görünmür.
7. **Yadda saxla**.

Başlıq **yazılmır**. Sayt onu seriyanın adından və dövrdən özü qurur:

| Seriya | Saytdakı başlıq (nümunə) |
|---|---|
| Bank indeksi | «Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi (İyun 2026)» |
| Sığorta indeksi | «Avto-icbari sığorta üzrə şikayət indeksi (İyul 2025 – İyun 2026)» |
| İnfoqrafika | «Azərbaycan Respublikasının Mərkəzi Bankına daxil olan müraciətlərə dair statistik hesabat (İyun 2026)» |

İngilis saytında ay adları ingiliscə olur: «… (June 2026)».

**Tablar «Hamısı» seçili olanda** və ya siyahı il və ya statusla süzüləndə **Yeni** il və ayı doldurmur. Onda seriyanı, ili və ayı
özünüz seçin.

> **Yeni ayı səhifənin mətninə yazmayın.** Seriyanın ən azı bir dərc olunmuş ayı varsa, sayt səhifə mətnindəki arxivi göstərmir:
> mətnə əlavə etdiyiniz akkordeon saytda görünməyəcək.

---

## 4. Düzəltmək, faylı dəyişmək, gizlətmək, silmək

Siyahıda sətrin sağındakı **qələm** düyməsi formanı açır.

| İstəyirsiniz | Nə etməli |
|---|---|
| Faylı dəyişmək | Dil tabında **Dəyiş** → yeni faylı seçin → **Yadda saxla** |
| İngiliscə faylı sonradan əlavə etmək | **en** tabında **Seç** → faylı seçin → **Yadda saxla** |
| Bir dilin faylını götürmək | Həmin dil tabında **Təmizlə** → **Yadda saxla**. Ən azı bir dildə fayl qalmalıdır |
| Ayı və ya ili səhv yazmısınız | Formada **İl**/**Ay**-ı düzəldin → **Yadda saxla**. Həmin ay seriyada artıq varsa, panel saxlamır (§6) |
| Ayı saytdan müvəqqəti çıxarmaq | **Status** → **Arxiv** və ya **Qaralama** |
| Ayı silmək | Siyahıda **zibil qabı** düyməsi → təsdiq. Silinmiş ayı sonra yenidən əlavə etmək olar |

Formadan yadda saxlamadan çıxanda panel soruşur: dəyişiklik itməsin deyə.

---

## 5. Saytda necə görünür

- **«Son məlumat»** kartı seriyanın ən yeni dərc olunmuş ayının faylını açır. Yeni ay əlavə olunanda **avtomatik** ona keçir.
- **«Arxiv»**-də illər ən yenisi yuxarıda, hamısı bağlı göstərilir. İl açılanda aylar sənəd kartlarıdır: «İyun 2026», faylın növü
  (PDF) və başlıq. Sıranı sayt özü qurur, ayları hansı sırada əlavə etdiyiniz önəmli deyil.
- **Şikayət indeksləri** səhifəsində iki tab var: **Bank** və **Sığorta**. Hər tabın altında öz metodologiyası durur (səhifənin
  mətnindən).
- **İnfoqrafika** statistika səhifəsinin sonundadır.
- **İngilis saytında** yalnız **en faylı olan** aylar görünür. Seriyanın heç bir ayında en faylı yoxdursa, ingilis saytı həmin hissəni
  səhifənin öz mətnindən göstərir (bugünkü İnfoqrafika kimi: ingiliscə blok yoxdur).
- Seriyanın **heç bir dərc olunmuş ayı yoxdursa** (hamısı qaralama, arxiv və ya silinib), sayt yenidən səhifə mətnindəki köhnə
  arxivi göstərir.

---

## 6. Siyahıda nə görünür

| Sütun | Mənası |
|---|---|
| **Seriya** | Bank indeksi, Sığorta indeksi və ya İnfoqrafika |
| **Dövr** | «Sentyabr 2026». Sığorta indeksi üçün 12 ay: «Oktyabr 2025 – Sentyabr 2026» |
| **Fayllar** | **AZ**, **EN** nişanları. Faylı olmayan dil sarı **«EN yoxdur»** kimi görünür. Qırmızı **«Fayl silinib»**: faylı media kitabxanasından silinib |
| **Status** | Qaralama, Dərc olunub, Arxiv |
| **Dəyişib** | son dəyişiklik tarixi |

Siyahı ən yeni ay birinci düzülür. Yuxarıda seriya tabları, filtr kartında **İl** və **Status** süzgəcləri var.

---

## 7. Tez-tez rast gəlinən hallar

| Vəziyyət | Səbəb və həll |
|---|---|
| «Bu seriyada İyun 2026 üçün hesabat artıq var.» | Həmin ay bu seriyada artıq var. Siyahıda tapıb redaktə edin |
| «Fayl ən azı bir dildə doldurulmalıdır» | Heç bir dil tabında fayl seçilməyib. **az** tabında **Seç** ilə faylı seçin |
| «Fayl tapılmadı.» | Seçilmiş fayl media kitabxanasından silinib. Başqa faylı seçin |
| «İl 2000 ilə … arasında olmalıdır.» | İl çox köhnədir və ya gələn ildən sonradır |
| Yeni ay saytda yoxdur | Status **Qaralama** və ya **Arxiv**-dir, ya da ay səhifənin mətninə yazılıb (§3). Statusu **Dərc olunub** edin. Saxladıqdan sonra ~10 saniyə gözləyin |
| Ay ingilis saytında yoxdur | Sətrin **en** faylı yoxdur (siyahıda «EN yoxdur»). Sətri açıb en faylını seçin |
| Siyahıda **«Fayl silinib»** | Fayl media kitabxanasından silinib, ay həmin dildə saytda görünmür. Sətri açıb yeni faylı seçin |
| **Yeni** il və ayı doldurmadı | «Hamısı» tabı seçilidir və ya il/status süzgəci var. Seriya tabını seçin, süzgəcləri təmizləyin |
| Saytda yenə köhnə arxiv görünür | Seriyanın dərc olunmuş ayı yoxdur. Ən azı bir ayı **Dərc olunub** edin |
| Seriyanın adını dəyişmək lazımdır | Paneldə mümkün deyil. Developerlərə müraciət edin (yeni miqrasiya ilə dəyişdirilir) |
| Səhifənin formasında «Bu səhifənin məzmunu» kartı | «Şikayət indeksləri», «Avto-icbari sığorta üzrə şikayət indeksi», «İnfoqrafika» səhifələrində kart bu bölməyə, seriya seçili açılan keçid verir. Arxivi orada, giriş mətnini və metodologiyanı səhifədə redaktə edin |

---

## 8. Yoxlama siyahısı

- [ ] Sol menyuda **Aylıq hesabatlar** var, üç tabda köçürülmüş aylar görünür (§2).
- [ ] Köçməyən aylar yoxlanıb, lazım olanlar əl ilə əlavə olunub (§2.1).
- [ ] **Bank indeksi** tabında **Yeni** növbəti ayla açılır.
- [ ] Yeni ay saytda «Son məlumat»-da və arxivdə görünür, faylı açılır.
- [ ] Sığorta indeksinin başlığında 12 aylıq dövr var («… – …»).
- [ ] İngilis saytında en faylı olan aylar görünür.

---

## 9. Developerlər üçün əlavə

- Spec: `specs/052-monthly-reports/` (spec, plan, research R1–R15, `data-model.md`, `contracts/`).
- Baza: `monthly_report_series` (+ `_translations`, üç sabit seriya, `period_months` 1/12/1), `monthly_reports` (seriya + il + ay, silinməmişlər
  arasında unikal), `monthly_report_translations` (dil üzrə `media_id`). Miqrasiyalar `0034` (cədvəllər, icazələr, seriyalar), `0035` (köhnə
  arxivlərin köçürülməsi, səhifələr az slug ilə tapılır, mətnə toxunulmur).
- API: admin `GET /api/v1/monthly-reports/series`, `GET|POST /api/v1/monthly-reports`, `GET|PUT|DELETE /api/v1/monthly-reports/{id}`
  (`monthly_reports.*` icazələri, audit). Public `GET /api/v1/monthly-reports?locale=&series=a,b`: həmin dildə faylı olmayan seriya cavabda yoxdur.
- Panel: `web-cbar-admin-new/src/features/monthly-reports`, səhifə `src/pages/monthly-reports`, "Yeni"-nin növbəti ayı `ModuleConfig.newSearch`.
- Sayt: `web-cbar-new/src/features/monthly-reports`, arxiv `features/about-content/model/report-archive.ts` (`reportTitle`), parser-lər
  `complaint-index.ts`, `appeal-statistics.ts`, loader `views/cms-page/loader.ts` (`loadConsumerSources`). Seriya yoxdursa spec 050 yolu (mətndən).
- Bölmənin qalan hissəsi (giriş, metodologiya, statistika cədvəlləri, sənədlər): [İstehlakçı hüquqları təlimatı](istehlakci-huquqlari-guide.md).
