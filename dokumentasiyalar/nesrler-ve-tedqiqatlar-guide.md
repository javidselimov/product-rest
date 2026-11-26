# Nəşrlər və tədqiqatlar — idarəetmə təlimatı

Bu sənəd cbar.az-ın **Nəşrlər və tədqiqatlar** bölməsini izah edir. Burada bunları tapacaqsınız:
- faylı (PDF) media kitabxanasına necə yükləmək;
- işçi məqaləsini admin paneldən necə əlavə etmək, dəyişmək, gizlətmək və silmək;
- illik hesabat kimi il arxivinə yeni ili və yeni sənədi necə əlavə etmək;
- tək sənəd səhifəsinə (strategiyalar, konsepsiyalar) sənədi necə əlavə etmək;
- bölməyə yeni səhifəni necə yaratmaq, onun menyudakı yerini və menyu qrupunu necə seçmək;
- dəyişiklik saytda harada və necə görünür.

> Köhnə saytda işçi məqalələri səhifə mətnində əl ilə yazılmış link siyahısı idi. Yeni saytda **hər məqalə admin paneldə ayrıca qeyddir**:
> sayt siyahını, axtarışı, il seçimini və məqalənin öz səhifəsini özü qurur. Bölmənin qalan səhifələri əvvəlki kimi **Səhifələr**
> bölməsindədir. Sayt onların görünüşünü mətnin formasından özü seçir: ayrıca «görünüş» ayarı yoxdur.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel: məqalələr** | Sol menyu → **Nəşrlər və tədqiqatlar → İşçi məqalələri** (`/working-papers`) |
| **Admin panel: bölmənin səhifələri** | **Səhifələr** → Nəşrlər və tədqiqatlar |
| **Admin panel: fayllar** | **Media kitabxanası** |
| **Sayt (AZ)** | `https://<sayt>/az/nesrler-ve-tedqiqatlar` və alt səhifələri |
| **Sayt (EN)** | `https://<sayt>/en/...` (səhifənin en slug-ı) |
| **Məqalə səhifəsi** | `/az/isci-meqaleler-silsilesi/02-2025`, `/en/working-paper-series/02-2025` |

| Nə etmək istəyirsiniz | Harada | Bölmə |
|---|---|---|
| Yeni işçi məqaləsi | **İşçi məqalələri → Yeni** | §4 |
| İllik hesabata (və ya başqa il arxivinə) yeni il | **Səhifələr** → səhifə → mətndə akkordion | §5 |
| Mövcud ilə yeni sənəd | **Səhifələr** → səhifə → həmin ilin akkordionu | §5.3 |
| Strategiya, konsepsiya kimi tək sənəd | **Səhifələr** → səhifə → mətndə fayl linki | §6 |
| Bölməyə yeni səhifə | **Səhifələr** → qrup səhifəsi → **Alt səhifə əlavə et** | §7 |
| Səhifəni menyudan çıxarmaq, yalnız üst menyuda saxlamaq | Səhifə formu → **Saytın menyusunda** | §8 |
| Başlıq, giriş mətni | **Səhifələr** → həmin səhifə → **AZ** / **EN** tabı | — |
| «İl», «Hamısı», «Axtar», «Xülasə» kimi etiketlər | Saytın sabit etiketləridir (az/en), paneldən dəyişdirilmir | — |

Dəyişiklik saytda təsdiqsiz, bir neçə saniyə ərzində görünür. Saytı yeniləyin (F5).

**Kim redaktə edə bilər:** **admin** və **moderator** rolları.

---

## 2. Yayımdan sonra bir dəfəlik hazırlıq

Yeni sayt ilk dəfə yayımlananda bölmənin ağacı **avtomatik** Figma-dakı kimi qurulur:
- iki qrup səhifəsi yaranır: **Tədqiqatlar** və **Nəşrlər, hesabatlar və sənədlər**;
- səhifələr qruplara köçür;
- «Rəqəmsal fırıldaqçılıq statistikası» və «Ödəniş xidmətləri» istehlakçı hüquqları bölməsindən bu bölməyə köçür;
- Figma-da olmayan köhnə səhifələr menyulardan çıxır. Onlar silinmir, ünvanları açılır.
- Sonra (spec 056) «Maliyyə sabitliyi hesabatı» və «Bank sektoru üzrə makroprudensial siyasət çərçivəsi» yeni **Maliyyə sabitliyi**
  bölməsinə köçür və orada menyularda görünür. Ünvanları dəyişmir.

```
Nəşrlər və tədqiqatlar (kök)
├── Tədqiqatlar (qrup)
│   ├── Ekonometrik modellər                    tək sənəd
│   └── İşçi məqalələr silsiləsi                məqalələr «İşçi məqalələri» bölməsindən
└── Nəşrlər, hesabatlar və sənədlər (qrup)
    ├── İllik hesabat                           il arxivi
    ├── Sahələrarası …                          il arxivi
    ├── Strategiyalar və konsepsiyalar (4 səhifə) tək sənəd
    ├── Rəqəmsal fırıldaqçılıq statistikası     il arxivi
    └── Ödəniş xidmətləri                       tək sənəd, yalnız açılan menyularda
```

Aşağıdakıları bir dəfə edin:

1. **İngiliscə mətnləri yoxlayın.** Qrup səhifələrinin en başlıqları, en giriş mətnləri və en menyu qrupları qaralamadır. **Səhifələr** →
   səhifə → **EN** tabı.
2. **İşçi məqalələrini yoxlayın.** Köhnə məqalələr hələ köçürülməyibsə, siyahı səhifəsi köhnə mətnini göstərir (bax §9). Yeni məqalələri
   §4-dəki kimi əlavə edin.
3. Saytda `/az/nesrler-ve-tedqiqatlar`-ı açın, sol menyunun iki qrupunu açıb hər səhifəyə baxın.

---

## 3. Faylı media kitabxanasına yükləmək

Məqalənin PDF-i də, illik hesabatın sənədləri də əvvəl **Media kitabxanası**na yüklənir. Formalardakı və redaktordakı fayl seçicisi yalnız
kitabxanada olan faylları göstərir, orada yükləmə düyməsi yoxdur.

1. Sol menyu → **Media kitabxanası** → **Fayl yüklə**.
2. Kompüterdən faylı seçin. İcazəli formatlar: pdf, docx, doc, xlsx, xls, zip, xml və şəkillər (jpg, png, gif, webp, svg).
3. «"…" yükləndi» bildirişini gözləyin. Fayl siyahının əvvəlində görünür.

Məsləhətlər:
- **Faylı yükləməzdən əvvəl adını oxunaqlı edin**: `illik-hesabat-2025-az.pdf`, `WP-02-2025-en.pdf`. Redaktorda fayl linki mətnsiz
  qoyulanda linkin mətni faylın adı olur, saytda kartın başlığı da odur (bax §5.2).
- Hər dil üçün ayrıca fayl yükləyin. AZ səhifəyə az faylı, EN səhifəyə en faylı bağlanır.
- Axtarış sahəsinə (**Fayl axtar**) adın bir hissəsini yazıb faylı sonra tez tapa bilərsiniz.
- Səhifəyə və ya məqaləyə bağlı faylı kitabxanadan silmək olmur: əvvəl onu məzmundan ayırın.

---

## 4. İşçi məqaləsi

### 4.1. Yeni məqalə: addım-addım

1. PDF-i (hər dil üçün öz faylı varsa, ikisini də) **Media kitabxanası**na yükləyin (§3).
2. Sol menyu → **Nəşrlər və tədqiqatlar → İşçi məqalələri** → **Yeni**.
   Siyahıda **İl** filtri seçilibsə, yeni formada **İl** sahəsi həmin illə dolu açılır.
3. Formun yuxarı hissəsini doldurun (dildən asılı olmayan sahələr):

   | Sahə | Nə yazılır | Nümunə | Saytda |
   |---|---|---|---|
   | **Nömrə** (məcburi) | İl daxilində sıra, 1–99 | `2` | Kod `02/2025`, ünvan `.../02-2025` |
   | **İl** (məcburi) | 1990-dan gələn ilə qədər | `2025` | Kod, «İl» seçimi, siyahının sırası, məqalə səhifəsində «Tarix» |
   | **Məqalənin dili** | Azərbaycan dili, İngilis dili və ya Digər | İngilis dili | Məqalə səhifəsində «Dil» |
   | **JEL kodları** | Vergüllə. Hər kod hərf və 1–2 rəqəmdir | `C22, E53, E58` | Məqalə səhifəsində «JEL təsnifatı» |
   | **Status** | **Qaralama**, **Dərc olunub** və ya **Arxiv** | Dərc olunub | Saytda yalnız **Dərc olunub** görünür |

4. **AZ** tabını açıb doldurun:

   | Sahə | Nə yazılır | Nümunə | Saytda |
   |---|---|---|---|
   | **Başlıq** | Məqalənin adı | `Azərbaycanda inflyasiya gözləntilərinin modelləşdirilməsi` | Siyahının sətri, məqalə səhifəsinin başlığı |
   | **Müəlliflər** | Vergüllə | `Elmir Muxtarov, Əli Hacılı` | Siyahıda başlığın altında, məqalə səhifəsində |
   | **Xülasə** | Sadə mətn, formatsız. Yeni sətir = saytda yeni paraqraf | — | Məqalə səhifəsində «Xülasə» |
   | **Açar sözlər** | Vergüllə | `inflyasiya, gözləntilər, pul siyasəti` | Məqalə səhifəsində; axtarış bunlarda da gedir |
   | **PDF fayl** | **Seç** → kitabxanadan fayl. Yalnız sənəd seçilə bilər, şəkillər sönük görünür | — | Məqalə səhifəsində yükləmə kartı |

5. **EN** tabında eyni sahələri ingiliscə doldurun. İngiliscə versiya yoxdursa, **EN** tabını tam boş saxlayın (bax §4.2).
6. **Yadda saxla**. «Dəyişikliklər yadda saxlanıldı» çıxır, məqalə siyahıda görünür. **Dillər** sütunu hansı dillərin doldurulduğunu göstərir.
7. Saytda yoxlayın: `/az/isci-meqaleler-silsilesi` siyahısında məqalə görünür, ona klikləyəndə `.../02-2025` səhifəsi açılır, PDF yüklənir.

> Məqaləni əvvəl **Qaralama** kimi saxlayıb sonra yoxlaya bilərsiniz: qaralama saytda görünmür. Hazır olanda **Status**-u
> **Dərc olunub** edib yenidən saxlayın.

### 4.2. Qaydalar və xəta mesajları

| Panel nə yazır | Nə deməkdir | Nə etməli |
|---|---|---|
| **Nömrə** altında xəta | Həmin ildə bu nömrə ilə başqa məqalə var | Siyahını **İl** filtri ilə açıb boş nömrəni tapın |
| «Bu dildə başlığı yazın və ya dili tam boş saxlayın» | Dilin bir sahəsi (məsələn müəlliflər) doludur, başlığı boşdur | Başlığı yazın və ya o dilin bütün sahələrini silin |
| «Başlığı olan dildə ən azı bir müəllif yazın» | Başlıq var, müəllif yoxdur | **Müəlliflər**-i doldurun |
| «"…" JEL kodu deyil» | Kod formata uymur (`E5`, `E58` düzdür; `E 58`, `E580`, `58` səhvdir) | Kodu düzəldin |
| Tabın üstündə qırmızı nişan | Həmin dilin tabında xəta var | Tabı açıb qırmızı sahəyə baxın |

Əlavə qaydalar:
- Başlıq ən azı bir dildə məcburidir.
- Dili tam boş saxlaya bilərsiniz: məqalə o dilin saytında siyahıda görünmür. EN saytda məqaləni açan istifadəçi dil dəyişdiricisi ilə
  siyahıya keçir.
- Vergüllü sahələrdə artıq boşluq, boş element və təkrar özü silinir. JEL kodları böyük hərflə saxlanılır (`e58` → `E58`).
- Yadda saxlamadan başqa yerə keçsəniz, panel soruşur.

### 4.3. Dəyişmək, gizlətmək, silmək

- **Dəyişmək:** siyahıda məqaləyə klikləyin, sahəni dəyişin, **Yadda saxla**. Axtarış sahəsi və **İl** / **Status** filtrləri məqaləni tez
  tapmağa kömək edir.
- **PDF-i dəyişmək:** yeni faylı kitabxanaya yükləyin, formada **PDF fayl** → **Dəyiş** → yeni fayl. **Təmizlə** faylı məqalədən ayırır.
- **Saytdan gizlətmək (silmədən):** **Status** → **Qaralama** və ya **Arxiv**. Məqalənin səhifəsi saytda açılmır, siyahıdan çıxır.
- **Nömrəni və ya ili dəyişmək** məqalənin ünvanını dəyişir (`02-2025` → `03-2025`). Köhnə ünvana verilmiş linklər işləməyəcək.
- **Silmək:** formada **Sil**. Bu geri qaytarılmır. Silinmiş məqalənin nömrəsi yenidən istifadə oluna bilər.

---

## 5. İl arxivi (İllik hesabat, Sahələrarası…, Rəqəmsal fırıldaqçılıq statistikası)

### 5.1. Səhifə necə qurulub

Mətndə ən azı bir **akkordion** varsa, sayt səhifəni il arxivi kimi göstərir:
- **hər akkordion bir ildir**: akkordionun başlığı il (`2025`), içi həmin ilin sənəd linkləridir;
- saytda akkordionlar açılan siyahı kimi deyil, **«İl» menyusu** və sənəd kartları kimi görünür;
- akkordiondan əvvəlki və sonrakı mətn (giriş, qeyd) yerində qalır.

Redaktorda belə görünür:

```
Hesabatların aydın oxunması üçün bu şrifti yükləyin        ← akkordiondan əvvəlki mətn
▸ 2025                                                      ← akkordionun başlığı
    31 dekabr 2025-ci il tarixinə Maliyyə Hesabatları       ← fayl linki
▸ 2024
    31 dekabr 2024-cü il tarixinə Maliyyə Hesabatları
    2024-cü il üzrə İllik hesabat
```

### 5.2. Yeni il əlavə etmək: addım-addım

1. Yeni ilin sənədlərini **Media kitabxanası**na yükləyin (§3), az və en faylları ayrıca.
2. **Səhifələr** → Nəşrlər və tədqiqatlar → Nəşrlər, hesabatlar və sənədlər → səhifəni (məsələn **İllik hesabat**) → **Redaktə et**.
3. **AZ** tabında, **Məzmun** redaktorunda kursoru akkordionlardan birinin **üstünə**, boş sətrə qoyun (Enter ilə yeni sətir açın).
   Akkordionların sırası önəmli deyil: sayt illəri özü ən yenidən köhnəyə düzür.
4. **Sənəd linkini qoyun.** Hər sənəd ayrıca sətirdə (ayrıca paraqrafda) olmalıdır:
   1. Sənədin saytda görünəcək adını yazın: `31 dekabr 2025-ci il tarixinə Konsolidasiya edilmiş Maliyyə Hesabatları`.
   2. Bu mətni siçanla seçin.
   3. Alətlər panelində **Fayl əlavə et** → kitabxanadan faylı seçin. Seçilmiş mətn fayl linkinə çevrilir.

   Mətn seçmədən **Fayl əlavə et** bassanız, linkin mətni faylın adı olur (`illik-hesabat-2025-az.pdf`). Bu da işləyir, amma saytda kartın
   başlığı fayl adı olacaq.
5. Növbəti sənəd üçün Enter basıb 4-cü addımı təkrarlayın.
6. **Akkordion yaradın:** həmin ilin bütün sənəd sətirlərini seçin → alətlər panelində **Accordion**. Seçilmiş sətirlər akkordionun içinə
   düşür, kursor onun boş başlığına keçir.
7. Başlığa **yalnız ili** yazın: `2025`. (`2025-ci il`, `2025 il` yazsanız, «İl» menyusunda il kimi yox, adi ad kimi görünəcək.)
8. **Sənədləri səhifəyə bağlayın:** formun **Sənədlər** hissəsində → **Sənəd əlavə et** → eyni faylı seçin → **Bağla**. Hər fayl üçün
   təkrarlayın. Bu addımsız kart fayl növünü («PDF») və ölçüsünü göstərə bilmir, «Fayl» yazır.
9. **EN** tabında eyni işi ingiliscə adlar və en faylları ilə görün. EN faylını da **Sənədlər**-də bağlayın.
10. **Yadda saxla**.
11. Saytda yoxlayın: səhifə açılanda «İl» menyusu yeni ili göstərir, sənəd kartlarında «PDF» və ölçü var, kart faylı açır.

> **Önizləmə** düyməsi mətnin təxmini görünüşünü göstərir, amma il menyusunu və kartları qurmur. Son nəticəni saytda yoxlayın.

### 5.3. Mövcud ilə sənəd əlavə etmək

1. Faylı kitabxanaya yükləyin.
2. Redaktorda həmin ilin akkordionunun içində, sonuncu sənəd sətrinin sonuna kursor qoyub **Enter** basın: yeni sətir akkordionun içində açılır.
3. §5.2-nin 4-cü addımı kimi adı yazıb seçin → **Fayl əlavə et**.
4. Faylı **Sənədlər**-də bağlayın, **Yadda saxla**.

Sənədin adını dəyişmək üçün linkin mətnini birbaşa redaktorda düzəldin. Sənədi çıxarmaq üçün onun sətrini silin və faylı **Sənədlər**-dən
**Ayır** (fayl kitabxanada qalır).

### 5.4. Saytda nə görünür və xüsusi hallar

- «İl» menyusu ilk açılışda **ən yeni ili** göstərir. **Hamısı** bütün illəri ardıcıl göstərir.
- Seçim ünvandadır (`?year=2024`, `?year=all`): seçilmiş ilə link vermək olar.
- Başlığı il olmayan akkordion («Arxiv») menyuda öz adı ilə, illərdən sonra görünür. Başlığı boş olan «Digər» yazılır.
- Eyni il iki akkordionda olsa, sayt onları bir ildə birləşdirir.
- Akkordiondan kənarda **yalnız fayl linkindən ibarət sətir** də kart olur (məsələn illik hesabatın şrift linki).
- Akkordionun içində **başqa səhifəyə** link kart olmur, adi link kimi qalır. Adi mətn də olduğu kimi göstərilir.
- **Sənədlər** hissəsindəki **Qrup etiketi** bu bölmədə istifadə olunmur: illəri yalnız mətndəki akkordionlar müəyyən edir.
- Bu səhifələrdə səhifənin ümumi fayl siyahısı ayrıca göstərilmir: hər dil yalnız öz mətnindəki kartları göstərir.

---

## 6. Tək sənəd səhifələri (Strategiyalar və konsepsiyalar, Ödəniş xidmətləri, Ekonometrik modellər)

Mətndə akkordion yoxdursa, amma fayl linki və ya səhifəyə bağlı fayl varsa, sayt səhifəni **tək sənəd** səhifəsi kimi göstərir: giriş mətni
yuxarıda, sənəd kartları onun altında.

**Sənəd əlavə etmək və ya dəyişmək:**
1. Faylı **Media kitabxanası**na yükləyin.
2. **Səhifələr** → səhifə → **Redaktə et** → **AZ** tabı.
3. Giriş mətnindən sonra yeni sətirdə sənədin adını yazın, seçin → **Fayl əlavə et** → faylı seçin.
   Sənəd linki **öz sətrində tək** olmalıdır: mətnin ortasındakı fayl linki kart olmur, paraqrafla birlikdə giriş mətnində qalır.
4. Faylı **Sənədlər** → **Sənəd əlavə et** ilə səhifəyə bağlayın.
5. **EN** tabında eyni işi görün, **Yadda saxla**.

Kartların sırası mətndəki sıradır. Mətndə heç bir fayl linki yoxdursa, kartlar **Sənədlər** hissəsindəki fayllardan qurulur: kartın adı
sənədin **Başlıq (AZ)** / **Başlıq (EN)**-ıdır (**Başlıqları redaktə et**), o da boşdursa fayl adıdır. Sıra **Sənədlər**-dəki sıradır
(yuxarı/aşağı oxları).

---

## 7. Bölməyə yeni səhifə əlavə etmək

Yeni səhifə üçün proqramçıya ehtiyac yoxdur: sayt onu mətninin formasına görə il arxivi, tək sənəd və ya adi mətn kimi göstərir.

| Mətndə nə var | Saytda |
|---|---|
| Ən azı bir akkordion | İl arxivi (§5) |
| Akkordion yoxdur, amma fayl linki və ya səhifəyə bağlı fayl var | Tək sənəd səhifəsi (§6) |
| Heç biri | Adi mətn səhifəsi |

1. **Səhifələr** → ağacda **Nəşrlər və tədqiqatlar** → lazım olan qrup (**Tədqiqatlar** və ya **Nəşrlər, hesabatlar və sənədlər**) →
   **Alt səhifə əlavə et**.
2. **AZ** tabı: **Başlıq**. **Slug** başlıqdan avtomatik yaranır və səhifənin ünvanı olur
   (`/az/<slug>`). Saxlandıqdan sonra adı dəyişsəniz də slug dəyişmir.
3. **Məzmun**: giriş mətni və §5 və ya §6 qaydası ilə sənədlər.
4. **EN** tabı: ingiliscə başlıq və mətn. İngiliscə versiya hələ yoxdursa, **Bayraqlar** kartında **EN saytda göstər**-i söndürün.
5. **Status** → **Dərc olunub**. **Bayraqlar** kartında **Aktiv** işarəli olmalıdır.
6. **Saytın menyusunda** kartında **Menyudakı yeri**-ni seçin (§8). Kartın altındakı xülasə hər dil üçün səhifənin harada görünəcəyini
   yazır.
7. Lazımdırsa **Menyu qrupu**nu yazın (§9).
8. **Yadda saxla**. Sənədləri §5.2 / §6-dakı kimi **Sənədlər** hissəsində bağlayın.

Səhifənin menyudakı sırasını dəyişmək üçün ağacda onu sürükləyin və ya **Sıra** sahəsini dəyişin. Başqa qrupa keçirmək üçün ağacda
**Köçür** → **Valideyn səhifə**.

---

## 8. Səhifənin menyulardakı yeri

**Səhifələr** → səhifə → **Saytın menyusunda** kartı → **Menyudakı yeri**:

| Seçim | Bölmənin sol menyusu | Açılan menyular (üst menyu, mobil menyu) |
|---|---|---|
| **Bütün menyularda** | var | var |
| **Yalnız açılan menyularda (sol menyuda yox)** | yox | var |
| **Menyularda yox** | yox | yox |

- Sol menyuda olmayan səhifə özü açıq olanda yenə orada görünür.
- «Menyularda yox» səhifəni silmir: o öz ünvanı ilə açılır, footer və breadcrumb onu göstərir.
- «Ödəniş xidmətləri» **Yalnız açılan menyularda**dır.
- Bölmə kökü üçün ikinci seçim yoxdur.
- Seçimin altındakı xülasə hər dil üçün səhifənin harada görünəcəyini və görünməyəcəksə səbəbini yazır («status «Dərc olunub» deyil»,
  «bu dildə başlıq yoxdur» və s.).
- Kart «yalnız sol menyuda göstərilir (köhnə ayar)» yazırsa, heç bir seçim işarəli deyil. Seçim edənə qədər səhifə belə qalır.

Köhnə **Sol menyuda göstər** bayrağı bu seçimə keçib, **Bayraqlar** kartında artıq yoxdur. **Bayraqlar**-dakı **Menyuda görünür** isə
fərqlidir: onu söndürmək səhifəni bütün naviqasiyadan çıxarır və alt səhifələrini üst səviyyəyə qaldırır. Menyudan çıxarmaq üçün
**Menyudakı yeri**-ni istifadə edin.

---

## 9. Menyu qrupu

**Səhifələr** → səhifə → **AZ** / **EN** tabı → **Menyu qrupu** (120 simvola qədər).

Eyni qrupu olan bacı səhifələr açılan menyuda bir yerdə göstəriləcək. Hazırda iki qrup var: «Strategiyalar və konsepsiyalar» (dörd sənəd)
və «Ödəniş sistemləri» (Ödəniş xidmətləri). Yeni səhifəni mövcud qrupa salmaq üçün qrupun adını **hərfi-hərfinə eyni** yazın.

> Sayt bu etiketi **hələ göstərmir**. O, menyunun yeni dizaynında görünəcək (spec 055). İndi yazılan etiket saxlanılır.

Etiketi silmək üçün sahəni boşaldıb yadda saxlayın.

---

## 10. İşçi məqalələri saytda

- **Siyahı:** başlıq, giriş mətni, axtarış, «İl» seçimi, sətirlər (il, başlıq, müəlliflər, kod), səhifədə 10 sətir. Sıra: il, sonra nömrə,
  ən yenisi yuxarıda. «İl» menyusu yalnız məqaləsi olan illəri göstərir.
- **Axtarış** başlıqda, müəlliflərdə və açar sözlərdə gedir, böyük-kiçik hərf və İ/ı fərqi nəzərə alınmır.
- **Məqalə səhifəsi:** başlıq, «Müəllif(lər) / Nömrə / Dil / Tarix» qutusu, «Xülasə», «Açar sözlər», «JEL təsnifatı», PDF kartı.
- **Giriş mətni** «İşçi məqalələr silsiləsi» səhifəsinin (**Səhifələr**-də) mətnindən gəlir: ilk akkordiona qədər olan hissə. Sonrakı köhnə
  akkordionlar köhnə link siyahısıdır və göstərilmir. Bu səhifənin formasında panel məqalələrin **İşçi məqalələri** bölməsindən gəldiyini
  yazır və ora link verir.
- **Məqalə yoxdursa** (bu dildə heç biri dərc olunmayıb) və ya sayt məqalələri ala bilmirsə, səhifə öz köhnə mətnini bütöv göstərir. Köhnə
  mətni silməyin.

---

## 11. Yoxlama siyahısı

İşçi məqaləsi:
- [ ] **Status** **Dərc olunub**-dur.
- [ ] Hər iki dildə başlıq və müəllif var (və ya ikinci dil qəsdən tam boşdur).
- [ ] Hər dilin PDF-i seçilib.
- [ ] Məqalə səhifəsi `.../NN-YYYY` ünvanında açılır, PDF yüklənir.

İl arxivi və tək sənəd:
- [ ] Akkordionun başlığı yalnız 4 rəqəmli ildir.
- [ ] Hər sənəd öz sətrində fayl linkidir.
- [ ] Fayllar **Sənədlər**-də bağlıdır, kartda «PDF» və ölçü görünür.
- [ ] EN tabında en adları və en faylları var.

Yeni səhifə:
- [ ] **Status** **Dərc olunub**, **Aktiv** işarəlidir.
- [ ] **Menyudakı yeri** seçilib, xülasə gözlənilən nəticəni yazır.

---

## 12. Tez-tez rast gələn problemlər

| Problem | Səbəb və həll |
|---|---|
| Siyahı səhifəsi köhnə mətni göstərir | Bu dildə dərc olunmuş məqalə yoxdur. Məqaləni dərc edin və ya həmin dildə başlıq yazın |
| Məqalə saytda yoxdur | **Status** **Dərc olunub** deyil və ya bu dildə başlığı yoxdur |
| Sənəd kartında «Fayl» yazılır, ölçü yoxdur | Fayl mətndə linklənib, amma səhifəyə bağlı deyil. **Sənədlər** → **Sənəd əlavə et** |
| Kartın başlığı `hesabat_final_v2.pdf` kimidir | Link mətn seçilmədən qoyulub. Redaktorda linkin mətnini düzəldin |
| Fayl linki kart olmayıb, mətnin içində qalıb | Link başqa mətnlə eyni sətirdədir. Onu ayrıca sətrə çıxarın |
| İl menyusunda il yoxdur | Akkordionun başlığı yalnız 4 rəqəmli il olmalıdır: `2025`, `2025-ci il` yox |
| Menyuda «Digər» görünür | Akkordionun başlığı boşdur. Başlığa ili yazın |
| Səhifə il arxivi kimi göstərilməli idi, adi mətn kimi görünür | Mətndə akkordion yoxdur. Sənəd sətirlərini seçib **Accordion** basın |
| Səhifə sol menyuda görünmür | **Saytın menyusunda** kartında seçim «Bütün menyularda» deyil. Kartın xülasəsində səbəb yazılır |
| Saxlayanda **Nömrə** sahəsinin altında xəta | Həmin ildə bu nömrə ilə məqalə var. Nömrəni yoxlayın |
| Fayl seçicidə fayl sönük görünür | Bu sahə yalnız sənəd qəbul edir (PDF, Word, Excel, arxiv). Şəkil seçilə bilməz |
| Kitabxanada faylı silmək olmur | Fayl məzmuna bağlıdır. Əvvəl onu səhifədən və ya məqalədən ayırın |

---

## 13. Developerlər üçün

- Sayt: `product-rest/web-cbar-new/docs/publications-cms-guide.md` (layout seçimi, `publicationsLayoutFor`, sənəd kartı, menyu qaydası).
- Spec: `specs/054-publications-research/`, HTML formaları `contracts/publication-markup.md`.
- API: admin `GET|POST|PUT|DELETE /api/v1/working-papers`, public `GET /api/v1/working-papers?locale=`, `GET /api/v1/working-papers/{key}`.
- Seed: `api-cbar-admin` `0041` (ağac, menyu bayraqları, menyu qrupları).
