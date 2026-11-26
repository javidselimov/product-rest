# Tədbirlər — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Tədbirlər»** bölməsini admin paneldən necə idarə etməyi, dəyişikliyin saytda
harada, necə görünəcəyini izah edir.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Məzmun** → **Tədbirlər** (`/events`), tab **Bölmələr** (`/events/categories`) |
| **Sayt, siyahı** | `https://<sayt>/az/media/events`, `https://<sayt>/en/media/events` |
| **Sayt, tədbir** | `https://<sayt>/az/media/events/<tədbirin-ünvanı>` |
| **Saytda yolu** | Media → **Tədbirlər** |
| **Ana səhifə** | «Təqvim» bloku ən yaxın 3 gələcək tədbiri göstərir |

Gələcək və keçmiş tədbirləri sistem tarixə görə özü ayırır, əl ilə köçürmək lazım deyil. Bitmə tarixi
(yoxdursa başlanğıc tarixi) bu gün və ya sonradırsa tədbir «Gələcək tədbirlər»dədir, ertəsi gün
«Keçmiş tədbirlər»ə keçir. Gün Bakı vaxtı ilə hesablanır.

Dəyişiklik saytda **ən geci ~10 saniyəyə** görünür; səhifəni yeniləmək kifayətdir.

---

## 2. Yeni tədbir əlavə etmək

1. **Tədbirlər** → **Yeni**.
2. Sahələri doldurun:

| Sahə | Məcburi | Qeyd |
|---|---|---|
| Başlıq | bəli, ən azı bir dildə | Hansı dildə yazılmayıbsa, tədbir həmin dilin saytında görünmür |
| Başlanğıc tarixi | bəli | |
| Status | bəli | Saytda yalnız **Dərc olunub** görünür |
| Bitmə tarixi | yox | Yalnız çoxgünlük tədbir üçün. Saytda `4–5 iyun 2026` kimi görünür |
| Saat | yox | Bakı vaxtı |
| Məkan | yox | Hər dil üçün ayrıca, məs. `Mərkəzi Bank, Bakı`, `Onlayn` |
| Növ | yox | Qərar, Mətbuat konfransı, Konfrans, Seminar. Cari ilin dərc olunmuş **Qərar** tədbirləri «Məlumatların yayımlanması qrafiki» səhifəsinin «Qrafikə uyğun» pəncərəsində də görünür, bax [yayım qrafiki təlimatı](yayim-qrafiki-guide.md) §6 |
| Bölmə | yox | Siyahıdakı filtr üçün, aşağıda |
| Məzmun | yox | Gələcək tədbirdə boşdursa saytda «tezliklə dərc olunacaq» yazılır |
| Qalereya | yox | Mövcud qalereya seçilir, şəkillər mətndən sonra görünür |
| Press reliz | yox | Mətndən sonra relizə link. Yalnız reliz dərc olunubsa görünür |
| CMS səhifəsi | yox | Bölmə 4-ə baxın. Adi tədbir üçün boş saxlayın |

3. **Yadda saxla**. Saytdakı ünvan başlıqdan avtomatik yaranır.

Tədbir press-relizin yerini tutmur. Tədbir hadisənin özüdür, reliz isə onun haqqında xəbərdir. Relizi
**Press relizlər** bölməsində ayrıca yazıb sonra tədbirə bağlayın.

---

## 3. Bölmələr

**Tədbirlər → Bölmələr** tabında bölmə əlavə edin, adını və sırasını dəyişin. Saytda filtr öz-özünə
uyğunlaşır:

| Bölmə sayı | Saytda |
|---|---|
| 1–5 | Hamısı tab kimi |
| 6–9 | 5 tab + **Digər** menyusu |
| 10 və çox | Axtarışlı açılan siyahı |

- **Aktiv** işarəsini götürsəniz bölmə filtrdən çıxır, tədbirlərdəki nişanı isə qalır.
- Tədbiri olan bölmə silinmir. Əvvəl həmin tədbirlərdə bölməni dəyişin.

---

## 4. Köhnə tədbirlər

Köhnə saytda tədbirlər adi səhifə idi. Deploy zamanı 6 tədbir avtomatik yaranır və **CMS səhifəsi**
sahəsi ilə öz səhifəsinə bağlanır: COP29, Mərkəzi bankçılıq 105 il və 100 il, Heydər Əliyev 100 və 90 il,
AR Mərkəzi Bankı 20 il.

- Saytda kart həmin səhifəni açır. Mətni, şəkli və alt səhifələri **Səhifələr** bölməsində əvvəlki kimi
  redaktə edin. Səhifələrin ünvanları dəyişmir.
- Bu səhifələrin alt ağacı saytın menyusunda görünmür, səhifə açılanda sol menyuda çıxır.

### Deploy-dan sonra yoxlanmalı tarixlər

Köhnə səhifələrdə tarix sahəsi olmayıb, ona görə tarixlər ilkin dəyərdir. **Tədbirlər** bölməsində yoxlayın:

| Tədbir | İlkin tarix | Mənbə | Nə etmək lazımdır |
|---|---|---|---|
| COP29 | 14.11.2024 | Səhifənin mətni | Yoxlamaq kifayətdir |
| Mərkəzi bankçılıq, 105 il | 30.09.2024 | Alt səhifənin mətni | Yoxlamaq kifayətdir |
| Heydər Əliyev, 90 il | 08.05.2013 | Səhifənin mətni | Yoxlamaq kifayətdir |
| Mərkəzi bankçılıq, 100 il | 28.09.2019 | Prezident Sərəncamının tarixi | Tədbirin öz tarixini verin |
| Heydər Əliyev, 100 il | 10.05.2023 | **Təxmini** | Real tarixi verin |
| AR Mərkəzi Bankı, 20 il | 16.01.2012 | **Təxmini** | Real tarixi verin |

Növ və bölmə bu tədbirlərdə boşdur, istəsəniz seçin.

---

## 5. Yoxlama siyahısı

- [ ] Status **Dərc olunub**-dur.
- [ ] Hər iki dildə başlıq var, ya da tədbir bir dil üçündür.
- [ ] Tədbir düzgün tabdadır: gələcək və ya keçmiş.
- [ ] Bağlı qalereya aktivdir, reliz dərc olunub.
- [ ] Yaxın tədbir ana səhifənin «Təqvim» blokunda görünür.

---

## 6. Tez-tez rast gələn problemlər

| Problem | Səbəb | Həll |
|---|---|---|
| Tədbir saytda yoxdur | Status **Dərc olunub** deyil | Statusu dəyişin |
| İngilis saytında yoxdur | EN başlıq boşdur | EN tabında başlıq yazın |
| Qalereya görünmür | Qalereya deaktivdir | Qalereyanı aktiv edin |
| Reliz linki yoxdur | Reliz dərc olunmayıb və ya tarixi gələcəkdədir | Relizi yoxlayın |
| Kart tədbiri yox, başqa səhifəni açır | **CMS səhifəsi** seçilib | Sahəni boşaldın |
| Bölmə silinmir | Ona bağlı tədbir var | Tədbirlərin bölməsini dəyişin |
| «Təqvim» bloku yoxdur | Gələcək tədbir yoxdur | Tədbir əlavə edin |

---

## 7. Developerlər üçün

Spec: `specs/034-media-events/`. Cədvəllər `events`, `event_translations`, `event_categories`,
`event_category_translations`; köhnə tədbirlər miqrasiya `0019-events-legacy-seed.sql` ilə yaranır. Səhifə
tapılmasa həmin tədbir buraxılır: deploy-dan sonra arxivdə 6 tədbirin olduğunu yoxlayın.
