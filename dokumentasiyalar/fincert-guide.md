# FinCERT — idarəetmə təlimatı

Bu sənəd cbar.az-ın **FinCERT** səhifəsini izah edir. Burada bunları tapacaqsınız:
- missiya, fəaliyyət istiqamətləri, əlaqə, hesabat portalı, RFC-2350 sənədi və beynəlxalq üzvlüklər admin paneldən necə idarə olunur;
- dəyişiklik saytda harada və necə görünür.

> Köhnə saytda FinCERT adi CMS mətni idi: hamısı bir uzun HTML mətnində yazılırdı. Yeni saytda **hər hissə admin paneldə ayrıca sahədir**.
> Telefonu dəyişmək və ya istiqamət əlavə etmək üçün HTML bilmək lazım deyil. Səhifənin başlığı əvvəlki kimi **Səhifələr** bölməsindədir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **FinCERT** (`/fincert`). Üç tab: **Ümumi**, **Fəaliyyət istiqamətləri**, **Beynəlxalq üzvlüklər** |
| **Sayt (AZ)** | `https://<sayt>/az/fincert` |
| **Sayt (EN)** | `https://<sayt>/en/fincert` |
| **Köhnə ünvan** | `page-893/fincert` avtomatik yeni səhifəyə yönlənir |

| Saytda | Admin paneldə |
|---|---|
| Başlıq «FinCERT» | **Səhifələr** → FinCERT |
| Missiya mətni | **FinCERT → Ümumi** → Mətnlər və sənəd → Missiya |
| Nömrəli akkordionlar | **FinCERT → Fəaliyyət istiqamətləri** |
| «Elektron poçt» və «Əlaqə nömrəsi» kartları | **FinCERT → Ümumi** → Əlaqə |
| Hesabat portalının kartı və «Portala keçid» düyməsi | **FinCERT → Ümumi** → Hesabat portalı (ünvan) və Mətnlər və sənəd (ad, təsvir) |
| «RFC-2350» kartı | **FinCERT → Ümumi** → Mətnlər və sənəd → RFC-2350 faylı və ya linki |
| «Beynəlxalq əməkdaşlıq» kartları | **FinCERT → Beynəlxalq üzvlüklər** |
| Bölmə başlıqları, düymə mətnləri | Saytın sabit etiketləri (az/en), dəyişdirilmir |

Dəyişiklik saytda təsdiqsiz, ən geci ~10 saniyə sonra görünür (saytın qısa keşi var).

**Kim redaktə edə bilər:** **admin** və **moderator** rolları.

---

## 2. Yayımdan sonra bir dəfəlik hazırlıq

Yeni sayt ilk dəfə yayımlananda köhnə səhifənin məzmunu **avtomatik** köçürülür. Köçürülənlər:
- missiya;
- 4 istiqamət (az və en);
- e-poçt, telefon və portal;
- RFC-2350 linkləri;
- FIRST üzvlüyü.

Paneldə artıq FinCERT məlumatı varsa, heç nə təkrar yaradılmır.

Aşağıdakıları bir dəfə edin:

1. **FIRST loqosunu yükləyin:** **FinCERT → Beynəlxalq üzvlüklər** → FIRST → **Loqo → Seç** → şəkli seçin və ya əvvəl Media
   kitabxanasına yükləyin → **Yadda saxla**. Loqosuz kart da düzgün görünür, sadəcə şəkilsiz.
2. **İngiliscə FIRST mətnini yoxlayın:** həmin formanın **EN** tabı. Mətn qaralamadır.
3. **RFC-2350 sənədlərini yükləyin** (istəyə görə). Köhnə PDF-lər hələ köhnə saytın ünvanına link kimi qalıb. Sənədi Media kitabxanasına
   yükləyin, sonra **FinCERT → Ümumi** → AZ və EN tablarında **RFC-2350 faylı → Seç**. Fayl seçiləndə link istifadə olunmur.
4. Saytda `/az/fincert` və `/en/fincert`-i açıb 4 istiqamətin hamısını açın, mətni köhnə səhifə ilə tutuşdurun.

---

## 3. Ümumi forma: əlaqə, portal, missiya, RFC-2350

**FinCERT → Ümumi.** Bir formadır, bir **Yadda saxla** düyməsi var.

| Kart / sahə | Nə yazılır | Saytda |
|---|---|---|
| **Əlaqə → E-poçt** | `fincert@cbar.az` | «Elektron poçt» kartı, klikdə poçt proqramı açılır |
| **Əlaqə → Telefon** | Yazıldığı kimi görünür: `(+994 12) 437 00 97` | «Əlaqə nömrəsi» kartı, klikdə zəng |
| **Hesabat portalı → Portalın ünvanı** | `https://` ilə tam link | «Portala keçid» düyməsi (yeni vərəqdə) |
| **AZ / EN → Missiya** | Sadə mətn. Hər sətir saytda ayrıca paraqrafdır | Başlıqdan sonra, iri şriftlə |
| **AZ / EN → Portalın adı, təsviri** | Kartın başlığı və alt mətni | Portal kartı |
| **AZ / EN → RFC-2350 faylı** | Media kitabxanasından **yalnız sənəd** (PDF, Word, Excel, arxiv) | Kart faylı yükləyir |
| **AZ / EN → RFC-2350 linki** | Fayl yoxdursa xarici link | Kart linki yeni vərəqdə açır |

Qaydalar:
- E-poçt düzgün formada olmalıdır, yoxsa sahənin altında xəta çıxır və heç nə saxlanmır.
- Linklər `http://` və ya `https://` ilə başlamalıdır.
- Portalın adı yazılıbsa, ünvanı da vacibdir.
- Hər iki dil eyni formadadır. Xəta olan dilin tabında qırmızı nişan görünür.
- Yadda saxlamadan başqa yerə keçsəniz, panel soruşur: «Yadda saxlanmamış dəyişikliklər» → **Çıx** və ya **Ləğv et**.

Sahəni boşaltsanız, saytda həmin kart və ya bölmə görünmür (bax §6).

---

## 4. Fəaliyyət istiqamətləri

**FinCERT → Fəaliyyət istiqamətləri.** Siyahıda bu sütunlar var:
- **№** (saytdakı nömrə);
- başlıq;
- dillər (**EN yoxdur** nişanı tərcümənin olmadığını göstərir);
- status;
- yenilənmə tarixi.

**Əlavə etmək:** **Yeni** → Status (default «Dərc olunub»), **Başlıq (AZ/EN)**, **Mətn (AZ/EN)** → **Yadda saxla**. Yeni istiqamət siyahının
sonuna düşür.
- Mətn redaktorunda paraqraf, nöqtəli siyahı, qalın mətn və link işlədin. Saytda siyahı nöqtələri dizayndakı kimi görünür.
- **Nömrəni başlığa yazmayın.** Sayt nömrəni sıradan özü qoyur.
- Ən azı bir dildə həm başlıq, həm mətn olmalıdır. Bir dilə başlamısınızsa, ikisi də məcburidir. Boş saxladığınız dil saytda görünmür.

**Sıranı dəyişmək:** siyahının üstündə **Sıranı dəyiş**. Sətri sürüşdürün və ya oxlarla yerini dəyişin. Hər hərəkət dərhal saxlanır, nömrələr
saytda da dəyişir.

**Gizlətmək / silmək:** statusu «Qaralama» edin (saytdan çıxır, sonra qaytarmaq olar) və ya sətirdə **Sil**.

---

## 5. Beynəlxalq üzvlüklər

**FinCERT → Beynəlxalq üzvlüklər.** Siyahıda loqo, ad, nişan və status görünür.

| Sahə | Nə yazılır | Saytda |
|---|---|---|
| **Status** | «Dərc olunub» / «Qaralama» | — |
| **Loqo** | Media kitabxanasından **yalnız şəkil** | Kartın solunda, 120 × 48 qutuya sığdırılır |
| **Link** | Təşkilatın saytı, `https://` ilə | Bütün kart linkə çevrilir (yeni vərəq) |
| **Təşkilatın adı (AZ/EN)** | Məcburidir (ən azı bir dildə) | Kartın başlığı |
| **Təsvir (AZ/EN)** | Bir cümlə | Başlığın altında |
| **Nişan (AZ/EN)** | Qısa qeyd, məs. «2026-cı ildən tam hüquqlu üzv» | Desktop-da sağda, mobildə mətnin altında |

Sıra **Sıranı dəyiş** dialoqundandır.

---

## 6. Saytda nə görünür

Səhifə bu sıra ilə qurulur:
1. Breadcrumb və paylaşma düymələri;
2. «FinCERT» başlığı;
3. missiya;
4. «Fəaliyyətin əsas istiqamətləri»: nömrəli akkordionlar, hamısı bağlı gəlir, ayrı-ayrı açılır;
5. «Əlaqə məlumatları»;
6. «Yüksək kateqoriyalı insident üzrə hesabatın göndərilməsi»;
7. «RFC-2350»;
8. «Beynəlxalq əməkdaşlıq».

- **Boş bölmə görünmür.** Məsələn, portal ünvanı silinibsə, portal bölməsi çıxmır. Bu qayda dillər üzrədir: EN tərcüməsi olmayan istiqamət
  `/en/fincert`-də görünmür.
- **Hər bölmənin sabit linki var:** `#missiya`, `#istiqametler`, `#elaqe`, `#hesabat-portali`, `#rfc-2350`, `#beynelxalq-emekdasliq`. Məsələn,
  `/az/fincert#rfc-2350` RFC bölməsindən açılır.
- **Ehtiyat:** FinCERT bölməsinin hamısı boşdursa və ya server cavab vermirsə, sayt **Səhifələr → FinCERT**-in köhnə mətnini göstərir. O mətni
  silməyin.

---

## 7. Yoxlama siyahısı

- [ ] Telefonu dəyişdim → `/az/fincert` «Əlaqə nömrəsi» kartında yeni nömrə, klik zəng açır.
- [ ] Yeni istiqamət əlavə etdim → saytda növbəti nömrə ilə, bağlı akkordion kimi görünür, açılır.
- [ ] Sıranı dəyişdim → saytda nömrələr yeni sıradadır.
- [ ] RFC faylı seçdim → kart faylı yükləyir, «PDF» nişanı görünür.
- [ ] EN tabını doldurdum → `/en/fincert`-də ingiliscə görünür.

---

## 8. Tez-tez rast gələn problemlər

| Problem | Səbəb və həll |
|---|---|
| Səhifə köhnə dizaynda, uzun mətnlə görünür | FinCERT bölməsinin hamısı boşdur və ya server əlçatmazdır. Ümumi formanı və istiqamətləri yoxlayın |
| Portal bölməsi görünmür | Portalın ünvanı və ya həmin dildə adı boşdur |
| İstiqamət `/en/fincert`-də yoxdur | EN başlığı və ya mətni boşdur (siyahıda «EN yoxdur») |
| Loqo seçicisində fayl seçilmir | Loqo sahəsi yalnız şəkil qəbul edir; PDF-i RFC sahəsinə seçin |
| RFC kartı köhnə sayta aparır | Fayl seçilməyib, köhnə link işləyir. Sənədi yükləyib **RFC-2350 faylı** sahəsində seçin |

---

## 9. Developerlər üçün əlavə

- Spec: `specs/053-fincert-page/`. API: `GET /api/v1/fincert?locale=` (api-cbar), `api/v1/fincert/settings|directions|memberships` (api-cbar-admin).
- Cədvəllər `fincert_*` (`0036`), köçürmə `0037-fincert-seed.sql`. Generator: `specs/053-fincert-page/seed/`.
- Sayt: `views/fincert`, `widgets/fincert`, `features/fincert`; qeyd `product-rest/web-cbar-new/docs/fincert-cms-guide.md`.
- **Səhifələr → FinCERT** formasında sol menyu «FinCERT»-i aktiv göstərir və forma bölməyə keçid kartı göstərir.
