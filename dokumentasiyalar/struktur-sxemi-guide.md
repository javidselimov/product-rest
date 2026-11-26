# Təşkilati struktur sxemi — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Struktur və əsasnamələr»** səhifəsindəki təşkilati sxemi izah edir: sxem
admin paneldən necə qurulur və dəyişdirilir, dəyişiklik saytda harada və necə görünür. Sxemdə
Mərkəzi Bankın strukturu var: sədr → müavinlər → baş direktorlar → bloklar → departamentlər.

> Əvvəllər bu sxem CMS-ə yüklənmiş tək şəkil idi. İndi o, ayrı-ayrı kartlardan qurulur. Hər kart
> saytda kliklənir, mobil və planşetdə isə alt-alta düzülür.
>
> **Spec 060-dan (2026-11) bəri desktop sxemi də avtomatik qurulur.** Paneldə canvas yoxdur: kartın
> yerini, ölçüsünü və xətlərini redaktor vermir. Hamısı kartların ağacından çıxır (§4.1).

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Sol menyu → **Təşkilat** → yuxarıdakı tab **Struktur sxemi** (`/organization/chart`) |
| **Sayt (AZ)** | `https://<sayt>/az/organization?section=divisions` |
| **Sayt (EN)** | `https://<sayt>/en/organization?section=divisions` |
| **Saytda yolu** | Haqqımızda → Təşkilati struktur və idarəetmə → **Struktur bölmələr** (sol menyu) |

Hər kart saytda klikləndikdə bir səhifə açır:
- əməkdaşa bağlı kart → həmin şəxsin bioqrafiya səhifəsi;
- struktur bölməyə bağlı kart → həmin bölmənin səhifəsi.

Saytda sxemin **iki ayrı görünüşü** var, ikisi də eyni kartlardan və eyni ağacdan qurulur:

| Ekran | Görünüş | Nədən qurulur |
|---|---|---|
| **Desktop** (≥1360 px) | Figma-dakı sxem: kartlar yan-yana, aralarında boz xətlər, bloklar kliklə açılır | Kartın **növü**, **valideyni**, qardaşları arasındakı **sırası** və blokun **«Departamentlər»** seçimi — avtomatik |
| **Planşet və mobil** | Alt-alta ağac: kart → altında budaqlar; bloklar açılıb-bağlanır | Kartların **valideyni** və **sırası** — avtomatik |

Dəyişiklik saytda **ən geci ~10 saniyəyə** görünür (sayt məlumatı qısa müddət keşləyir); səhifəni yeniləmək kifayətdir.

---

## 2. Hazırlıq: əməkdaş və bölmələr əvvəlcədən olmalıdır

Kartın adı, vəzifəsi və saytdakı keçidi adətən mövcud qeyddən gəlir:

- **Şəxslər** (sədr, müavinlər, baş direktorlar) → **Təşkilat → Heyət**;
- **Departamentlər** → **Təşkilat → Şöbələr**.

Karta bağlanacaq şəxs və ya bölmə orada hələ yoxdursa, əvvəlcə onu yaradın. Bağlı qeyddə adı
dəyişsəniz, sxemdəki kart da avtomatik dəyişir.

**Bloklar** ayrıca qeyd deyil — blok sadəcə kartın **Növ**-üdür. Bloka rəhbərlik edən şəxs varsa,
kartı **Əməkdaş** kimi həmin şəxsə bağlayın və blokun adını **Ad (AZ / EN)** sahəsinə özünüz
yazın: kartda blokun adı görünür. Ad boş qalsa kartda şəxsin adı çıxar. Blokun Şöbələrdə öz
səhifəsi varsa, onu **Struktur bölmə** kimi də bağlamaq olar.

> Karta heç nə bağlamaq da olar (məs. sadəcə ad lazım olan qrup və ya rəhbəri göstərilməyən
> blok). O halda kartın öz adı mütləq yazılmalıdır, saytda isə kart kliklənmir.

---

## 3. Admin paneldə əməliyyatlar

**Təşkilat → Struktur sxemi** səhifəsinin iki görünüşü var (yuxarıdakı tablar):

- **Siyahı** — kartların ağacı, girintili. Planşet və mobildə kartlar bu ardıcıllıqla düzülür, desktop sxemi də
  bu ağacdan qurulur. Bütün əməliyyatlar (əlavə, sıra, silmə) buradadır.
- **Sxem** — saytın desktop sxeminin özü, paneldə (§3.8).

Səhifənin başında:
- **Saytda bax** — saytın sxem səhifəsini yeni vərəqdə açır (§3.7);
- **Sıranı dəyiş** — kök kartların sırası (ən azı iki kök kart olanda görünür);
- **Yeni kart** — kök kart (adətən sədr).

Siyahının hər sətrində:
- kartın adı və növü (adın yanında `*` — kuratora birbaşa tabe);
- nişanlar: **Deaktiv**, **Departamentlər açıq** (§3.6);
- düymələr: **Sıranı dəyiş** (yalnız ən azı iki alt kartı olan kartda, §3.5), **+** (altına kart),
  **qələm** (redaktə), **zibil qutusu** (sil).

### 3.1. Yeni kart əlavə etmək

- **Ən yuxarı kart (sədr):** səhifənin başındakı **«Yeni kart»** düyməsi.
- **Hər hansı kartın altına:** həmin sətirdəki **+** düyməsi. Valideyn avtomatik seçilir.

Yeni kart həmişə qardaşlarının **sonuna** düşür. Yerini sonra **Sıranı dəyiş** ilə dəyişin (§3.5).

Formanın sahələri:

| Sahə | Nə seçilir / yazılır | Saytda təsiri |
|---|---|---|
| **Növ** | Sədr · Sədr müavini · Baş direktor · Blok · Departament · Qrup | Kartın görünüşü (rəng, ölçü, yazı) və desktopda harada durduğu — bax §4.1 |
| **Valideyn kart** | Ağacdan kart; boş qalsa — kök | Kart kimin altındadır. Hər üç görünüş bundan qurulur |
| **Bağlantı** | Bağlı deyil · Əməkdaş · Struktur bölmə | Kartın adı və keçidi haradan gəlsin |
| **Bağlı qeyd** | Heyətdən şəxs və ya Şöbələrdən bölmə (axtarışlı siyahı); **istəyə bağlı** — lazımi qeyd yoxdursa boş saxlayın və Ad-ı özünüz yazın | Kartın adı, vəzifəsi (yalnız şəxsdə) və klikdə açılan səhifə; boşdursa kart kliklənmir |
| **Ad (AZ / EN)** | Boş və ya öz mətniniz | Doldurulsa bağlı qeydin adının **yerinə** göstərilir |
| **Vəzifə (AZ / EN)** | Boş və ya öz mətniniz | Doldurulsa bağlı şəxsin vəzifəsinin **yerinə** göstərilir |
| **Departamentlər** | Açılan siyahı · Həmişə açıq — **yalnız Blok və Qrup** növündə görünür | Desktopda blokun departamentləri necə göstərilir — §3.6 |
| **Kuratora birbaşa tabe (\*)** | ✔ / boş | Kartın adına `*` əlavə olunur, sxemin altında «\* Kuratora birbaşa tabe olan şöbə» qeydi çıxır |
| **Aktiv** | ✔ / boş | Boşdursa kart **altındakılarla birlikdə** saytdan gizlənir (silinmir) |

**Ad və Vəzifə** sahələri boş olanda içində boz rənglə bağlı qeydin mətni görünür. Saytda da
həmin mətn göstəriləcək. Adətən bu sahələri boş saxlamaq kifayətdir, onları yalnız saytda başqa
mətn lazım olanda doldurun. Məsələn, Heyətdə «Sədrin birinci müavini» yazılıb, sxemdə isə tam
rəsmi ad lazımdır.

Sonda **Yadda saxla**. Formanın verə biləcəyi xətalar:

| Mesaj | Səbəb |
|---|---|
| «Bağlı qeyd yoxdursa ən azı bir dildə ad yazın» | Bağlantı «Bağlı deyil», Ad isə hər iki dildə boşdur |
| «Only a block or a group can show its departments always open.» | «Həmişə açıq» blok və qrupdan başqa növə göndərilib (panel bunu buraxmır, yalnız API-yə birbaşa sorğuda çıxır) |

### 3.2. Kartı redaktə etmək

Siyahıda sətirdəki **qələm** düyməsi → formanı dəyişin → **Yadda saxla**.

- **Kartı başqa yerə köçürmək** (məs. departament başqa bloka keçdi): **Valideyn kart** sahəsində
  yeni valideyni seçin. Kart yeni qardaşlarının **sonuna** düşür, öz altındakı kartlar da onunla
  birlikdə köçür. Kartı öz altına və ya öz alt kartının altına qoymaq olmur — siyahıda belə seçimlər bağlıdır.
- **Valideyn dəyişmirsə**, kartın sırası dəyişmir.
- **Şəxs dəyişdi** (məs. yeni baş direktor təyin olundu): Heyətə yeni şəxsi əlavə edin, sonra
  kartın **Bağlı qeyd** sahəsində onu seçin.

### 3.3. Kartı gizlətmək

**Aktiv** işarəsini götürün → Yadda saxla. Kart və onun **bütün alt kartları** saytdan itir, amma
paneldə qalır. Siyahıda «Deaktiv» nişanı görünür.

### 3.4. Kartı silmək

Siyahıda **zibil qutusu** → təsdiq. Silmə **birdəfəlikdir**, geri qaytarmaq olmur. Bağlı şəxs və
bölmə silinmir.

- **Altında kart olan kartı silmək olmur.** Dialoqda xəta çıxır. Əvvəl alt kartları silin və ya
  başqa valideynə köçürün.
- Əmin deyilsinizsə, silmək əvəzinə **Aktiv** işarəsini götürün (§3.3).

### 3.5. Sıranı dəyiş

Eyni valideynin altındakı kartların ardıcıllığı. Saytda üç görünüşün hamısı bu sıranı işlədir:
desktopda soldan sağa (müavinlər, sütunlar) və yuxarıdan aşağı (siyahılar), planşet və mobildə
yuxarıdan aşağı.

1. Valideynin sətrində **Sıranı dəyiş** ikonuna basın (köklər üçün — səhifənin başındakı düymə).
   Düymə yalnız ən azı iki alt kartı olan kartda görünür.
2. Dialoqda sətri sürüşdürün və ya **yuxarı / aşağı** oxları ilə yerini dəyişin.
3. **Hər hərəkət dərhal saxlanır**, ayrıca «Yadda saxla» yoxdur. Saxlamaq alınmasa, dialoqda xəta
   çıxır və sıra əvvəlki vəziyyətinə qayıdır.

Dialoqda deaktiv kartlar da var: onlar saytda görünməsə də, sıradakı yerləri saxlanır.

### 3.6. Departamentlər: açılan siyahı / həmişə açıq

Yalnız **Blok** və **Qrup** növündə. Blokun departamentləri — onun altındakı **Departament** növlü kartlardır.

| Seçim | Desktopda |
|---|---|
| **Açılan siyahı** (defolt) | Blokun sağ-altında ox var. Bloka klik edəndə altında departamentlər açılır, eyni sütunda altdakı kartlar siyahının hündürlüyü qədər aşağı düşür. İkinci klik bağlayır. Səhifə açılanda bütün bloklar bağlıdır, bir neçəsini eyni vaxtda açmaq olar. Klaviatura ilə də işləyir (Tab, sonra Enter və ya boşluq) |
| **Həmişə açıq** | Departamentlər klik olmadan, blokun altında sütun kimi görünür. Oxu yoxdur. Siyahıda bu kartda **«Departamentlər açıq»** nişanı görünür |

- Açılan siyahısı olan blokun **öz səhifəsinə** desktopda keçid yoxdur: klik yalnız siyahını açır.
  Planşet və mobildə blokun səhifəsi siyahının birinci sətridir.
- Departamenti olmayan blok (və ya departamentlərinin heç biri bu dildə görünmürsə) adi kartdır:
  bağlıdırsa öz səhifəsini açır.
- Seçim planşet və mobil görünüşü dəyişmir.

### 3.7. Saytda bax

Səhifənin başındakı **Saytda bax** düyməsi saytın sxem səhifəsini (`/az/organization?section=divisions`)
yeni vərəqdə açır. Dəyişikliyi saxlayandan sonra burada yoxlayın (sayt ~10 saniyəyə qədər köhnə
məlumatı göstərə bilər). Düymə yalnız saytın ünvanı panelə verilmiş mühitdə görünür (test və prod).

### 3.8. Sxem görünüşü

Səhifənin başındakı **Sxem** tabı saytın desktop sxemini paneldə göstərir: eyni qaydalar, eyni ölçülər, eyni
xətlər və rənglər (panelin qaranlıq temasında da sxem ağ fonda qalır).

- **AZ / EN** — sxemin dili. Sxem saytın həmin dildəki görünüşüdür: deaktiv kart, deaktiv əməkdaşa və ya şöbəyə
  bağlı kart və o dildə adı olmayan kart **altındakılarla birlikdə** burada da görünmür (§4.3). Kart siyahıda var,
  sxemdə yoxdursa, səbəb budur.
- **Karta klik** onun redaktə formunu açır (§3.2). Saxlayandan sonra sxem dərhal yenilənir — saytdakı ~10 saniyəlik
  gözləmə burada yoxdur.
- **Açılan siyahılı blok** saytdakı kimi kliklə açılır; onun departamentlərinə klik onların formunu açır. Blokun
  özünü redaktə etmək üçün **Siyahı**-dan istifadə edin.
- Seçilmiş görünüş və dil ünvandadır (`?view=chart&locale=en`): səhifəni yeniləmək və ya linki göndərmək onları saxlayır.
- Sxem enlidirsə, öz içində üfüqi sürüşür.

---

## 4. Saytda nə və necə görünür

**Səhifə:** Haqqımızda → Təşkilati struktur və idarəetmə → sol menyuda **Struktur bölmələr**.

### 4.1. Desktop (≥1360 px)

Kartların yeri **növündən və valideyninin növündən** çıxır. Kartın hündürlüyü mətnindən asılıdır:
uzun ad kartı uzadır, altındakılar aşağı düşür. Ölçülər və aralıqlar Figma-dakı kimidir.

| Kart → onun altındakı kart | Saytda harada durur |
|---|---|
| **Sədr** (kök) | Ən yuxarıda, ortada |
| Sədr → **Departament** | Sədrin sağında alt-alta siyahı, soldan daraq xətti ilə |
| Sədr → **Baş direktor** | Müavinlər sırasının ən solunda ayrıca sütun; sədrdən «L» formalı xətt |
| Sədr → **Sədr müavini** | Sədrin altında, bir sırada; sədrdən ortaq üfüqi xəttlə |
| Müavin → **Sədr müavini** | Valideyn müavinin sağında, eyni sırada. Valideyn müavin bir az yuxarıda durur (birinci müavin kimi) |
| Müavin → **Baş direktor** və ya **Blok** | Müavinin altında 68 px enində sütunlar, soldan sağa sıra ilə. Müavinə birbaşa tabe blokun sütununda yuxarıda boşluq qalır |
| Müavin → **Departament** («yan departamentlər») | Sonuncu sütunun sağında alt-alta, müavinin sağından xəttlə. Sonuncu sütun «həmişə açıq» blokla bitirsə, həmin blokun departamentlərinin yanına düşür |
| Baş direktor → **Blok** | Eyni sütunda, baş direktorun altında, alt-alta |
| Blok → **Departament** | Açılan siyahı və ya həmişə açıq — §3.6 |
| Başqa hər birləşmə | Valideynin altında sütunda, sıra ilə |

**Qrup** hər yerdə blok kimidir. Sədrdən başqa kök kart varsa, sxemin altında ayrıca sütun kimi görünür
(heç nə itmir).

Kartların görünüşü növündən asılıdır:

| Növ | Görünüş |
|---|---|
| **Sədr** | Tünd göy kart, ağ yazı |
| **Sədr müavini** | Açıq göy kart, ağ yazı |
| **Baş direktor** | Açıq boz kart, boz haşiyə, tünd yazı |
| **Blok / Qrup** | Firuzəyi kart, ağ yazı. Açılan siyahısı varsa, sağ-alt küncdə ox |
| **Departament** | Şəffaf kart, firuzəyi haşiyə. Kuratora birbaşa tabe olanın fonu açıq firuzəyidir |

- Sədrin sağındakı enli departament kartları mətni sola, dar kartlar ortaya hizalayır.
- Kartın üstünə gələndə çərçivə vurğulanır. Klikləyəndə bağlı səhifə açılır, bağlantısı olmayan
  kart kliklənmir.
- Sxem konteynerdən enlidirsə, sxemin öz daxilində üfüqi sürüşür (səhifə yox).
- Sxemin altında «\* Kuratora birbaşa tabe olan şöbə» qeydi çıxır (ən azı bir kartda bu işarə
  varsa), sonra isə əsasnamə sənədləri gəlir.

> **Figma-da olmayan quruluş paneldən qurulmur.** Yerləşmə qaydaları yuxarıdakı cədvəldədir və
> Figma-dakı strukturu əhatə edir. Yeni bir forma lazım olsa (məsələn, ikinci «birinci müavin»,
> müavinin altında üç pillə müavin və ya Figma-da olmayan başqa birləşmə), redaktor onu valideyn
> və sıra ilə düzəldə bilmir — texniki komandaya bildirin, qayda koda əlavə olunur. Bu, koordinatsız
> yanaşmanın qəbul edilmiş qiymətidir: əvəzində redaktor heç vaxt piksel, ölçü və xətt nöqtəsi vermir.
>
> Kartı «düzgün görünsün» deyə **mənaca yanlış valideynə qoymayın**. Məsələn, «Təşkilati inkişaf
> bloku»nun departamentləri blokun uşağıdır, müavinin yox; blokun yanında görünən «İnsan resursları»
> və «Strategiya» isə müavinin (yan departamentlər).

### 4.2. Planşet və mobil

Sxem alt-alta ağacdır. Kartın altındakı kartlar sol tərəfdə ox işarəli budaq xətti ilə düzülür.
Yuxarıdan aşağı ardıcıllıq **Sıranı dəyiş**-dəki sıradır. Burada əsasnamə sənədləri sxemdən **əvvəl**
gəlir.

- **Sədr, müavin, baş direktor** — tam enli kartlar: ad və vəzifə.
- **Blok** — firuzəyi başlıq, sağında ox. Başlığa toxunanda blok açılır və altında departamentlər
  görünür. Blokun öz səhifəsi varsa, siyahının birinci sətri ona keçiddir. Departamenti olmayan
  blok birbaşa öz səhifəsini açır.
- **Departament** — haşiyəli sətir, sağında ox. Fonu üç cür olur: blokun içində boz, birbaşa tabe
  olanda ağ, kuratora birbaşa tabe olanda açıq firuzəyi.

### 4.3. Kart saytda nə vaxt görünmür

Kart aşağıdakı hallarda saytda yoxdur, **altındakı bütün kartlarla birlikdə**:

| Səbəb | Necə düzəltmək |
|---|---|
| Kartın **Aktiv** işarəsi yoxdur | İşarəni qoyun |
| Bağlı şəxs və ya bölmə **deaktivdir** (Heyət/Şöbələrdə) | Həmin qeydi aktiv edin və ya kartı başqa qeydə bağlayın |
| Kartın **həmin dildə adı yoxdur** — nə öz adı, nə də bağlı qeydin o dildə adı | O dil üçün **Ad** yazın və ya bağlı qeydin o dildəki tərcüməsini doldurun |

Kart görünür, amma **kliklənmir**, əgər bağlı deyil və ya bağlı qeydin həmin dildə tərcüməsi yoxdur
(o dildə onun səhifəsi açılmır).

### 4.4. Sxem boş olanda

Admin paneldə heç bir kart yoxdursa, səhifə **köhnə görünüşdə** qalır: «Struktur bölmələr» CMS
səhifəsinin şəkli, əsasnamələr və şöbələrin siyahısı. Bu, sxemin API-dən alına bilmədiyi halda da
belədir.

Ən azı bir kart göründükdə:
- CMS səhifəsindəki şəkil və şöbələrin düz siyahısı göstərilmir;
- əsasnamə sənədləri qalır (CMS səhifəsinin əlavələrindən gəlir).

---

## 5. Sol menyudakı «Struktur bölmələr» linki və əsasnamələr

Sol menyudakı bənd **Səhifələr** ağacından gəlir: «Haqqımızda» altında **Menyu linki** sahəsində
`/organization?section=divisions` yazılmış səhifə var.

- **Menyu linki** sahəsini dəyişməyin və silməyin — əks halda bənd sxem səhifəsinə aparmır.
- Sxemin altındakı **ümumi sənədlər** («Mərkəzi Bankın təşkilatı strukturu», qəbul cədvəli və s.)
  həmin səhifənin **əlavələridir**. Sənədi dəyişmək və ya əlavə etmək üçün:
  **Səhifələr** → həmin səhifə → **Sənədlər** kartı.
- **Hər bölmənin öz əsasnaməsi** isə səhifə əlavəsi deyil — **Təşkilat → Şöbələr** formasındakı
  **Əsasnamə** sahəsidir (hər dil üçün ayrı fayl). Bax `struktur-bolmeler-guide.md`.

---

## 6. Bağlı şəxs və ya bölmə silinəndə

Heyətdən şəxsi və ya Şöbələrdən bölməni silsəniz, sxemdəki kart **silinmir**, sadəcə bağlantısı
qırılır:

- kartın **öz adı** varsa — kart saytda qalır, amma kliklənmir;
- öz adı **yoxdursa** — kart altındakılarla birlikdə saytdan itir.

Kartı redaktə edib yeni qeydə bağlayın və ya ona ad yazın.

---

## 7. Yoxlama siyahısı (dəyişiklikdən sonra)

- [ ] Hər kart mənaca düzgün valideynin altındadır (departament öz blokunun, blok öz baş direktorunun altında).
- [ ] Qardaşların sırası düzgündür (**Sıranı dəyiş**).
- [ ] Departamentləri klik olmadan görünməli olan bloklarda **Departamentlər → Həmişə açıq** seçilib.
- [ ] **Saytda bax** → desktopda sxem Figma-dakı kimi görünür, bloklar kliklə açılıb-bağlanır.
- [ ] Brauzeri daraldanda (planşet/mobil) ağac düzgün ardıcıllıqla görünür, bloklar açılır.
- [ ] Bir neçə karta klikləyin — düzgün şəxsin və ya bölmənin səhifəsi açılır.
- [ ] `/en/...` — ingiliscə adlar düzgündür, lazımi kartlar görünür.
- [ ] Kuratora tabe kartlarda `*` və altda qeyd var.

## 8. Tez-tez rast gələn problemlər

| Simptom | Səbəb | Həll |
|---|---|---|
| Kart heç yerdə görünmür | Kart və ya onun valideyni deaktivdir, ya da həmin dildə adı yoxdur | §4.3 |
| Kart **Siyahı**-da var, **Sxem**-də yoxdur | Saytda da görünmür: kart, valideyni və ya bağlı qeyd deaktivdir, ya da seçilmiş dildə adı yoxdur | §4.3; sxemin dilini yoxlayın |
| Kart desktopda gözlənilən yerdə deyil | Valideyni və ya növü səhvdir — yer bunlardan çıxır | Kartın **Valideyn kart** və **Növ** sahələrini yoxlayın (§4.1) |
| Departamentlər blokun altında yox, yanda görünür | Departamentin valideyni blok yox, müavindir (yan departament) | Departamentin valideynini bloka dəyişin |
| Bloka klik heç nə açmır, ox da yoxdur | Blokun bu dildə görünən departamenti yoxdur | Departament kartlarının valideynini, aktivliyini və bu dildə adını yoxlayın |
| Departamentlər klik olmadan görünməlidir | Blok «Açılan siyahı»dadır | Blokun formunda **Departamentlər → Həmişə açıq** |
| Ardıcıllıq səhvdir (desktop və ya mobil) | Qardaşların sırası | Valideynin sətrində **Sıranı dəyiş** |
| «Sıranı dəyiş» düyməsi yoxdur | Kartın birdən az alt kartı var | Sıralanacaq heç nə yoxdur |
| «Saytda bax» düyməsi yoxdur | Bu mühitdə saytın ünvanı panelə verilməyib (dev) | Saytı əl ilə açın: `/az/organization?section=divisions` |
| Figma-dakı kimi qurmaq olmur | Bu quruluş üçün qayda yoxdur (§4.1, sonuncu qeyd) | Texniki komandaya bildirin |
| Kart yalnız AZ-da görünür | EN üçün nə öz adı, nə bağlı qeydin EN adı var | EN **Ad** yazın və ya Heyət/Şöbələrdə EN tərcüməni doldurun |
| Kart kliklənmir | Bağlantı yoxdur və ya bağlı qeydin bu dildə tərcüməsi yoxdur | Kartı qeydə bağlayın və ya qeydin tərcüməsini doldurun |
| Kartı silmək olmur | Altında kart var | Əvvəl alt kartları silin və ya köçürün |
| Səhifədə yenə köhnə şəkil var | Paneldə görünən kart yoxdur (və ya API xətası) | Kartların aktiv olduğunu yoxlayın; problem qalırsa texniki komandaya bildirin |

---

## Əlavə: developerlər üçün

Spec-lər: `specs/027-org-structure-chart/` (sxemin özü, planşet/mobil ağac) və `specs/060-org-chart-auto-layout/`
(desktop ağacdan, blokun açılan siyahısı; canvas-ı əvəz edir). Dörd komponent, dörd ayrı MR. Deploy sırası:
**api-cbar-admin** (miqrasiya `0045`) → **api-cbar** → **web-cbar-admin-new** → **web-cbar-new**. `api-cbar` yeni cədvəli oxuyur,
ona görə `api-cbar-admin` mütləq əvvəl gedir.

| Qat | Yer |
|---|---|
| DB | `0015-org-chart-nodes.sql` → `org_chart_nodes` (`parent_id`, `kind` 1–6, `staff_id` / `division_id`, `curator_direct`, `sort_order`, `is_active`; `x/y/w/h` və `connector` geri qayıtmaq üçün qalır, oxunmur) + `org_chart_node_translations`. `0045-org-chart-node-details.sql` → yoldaş cədvəl `org_chart_node_details` (`node_id`, `departments_open`; sətir yoxdursa `false`, FK yalnız REFERENCES icazəsi olan mühitdə, `cbar_web_ro`-ya SELECT) |
| Domain | `Cbar.Domain/Entities/Organization.cs` → `OrgChartNode`, `OrgChartNodeTranslation`, `OrgChartNodeDetail`; `CbarDbContext` — **hər iki** API-də eyni |
| Admin API | `OrgChartController`: `GET/POST /api/v1/organization/chart`, `GET/PUT/DELETE /{id}`, `PUT /order` (spec 060), `PUT /layout` (köhnəlmiş, panel çağırmır); icazələr `organization.read/create/update/delete`; audit `org_chart_nodes.*`, sıra `org_chart_nodes.reorder` |
| Public API | `api-cbar` → `OrganizationController.GetChart` — `GET /api/v1/organization/chart?locale=az\|en`, hər node-da `departmentsOpen` |
| OpenAPI | hər iki API-də `openapi/paths/organization.yaml` (`chart*`), `components/schemas/organization.yaml` (`OrgChart*`; `layout`/`connector` `deprecated`) |
| Düzülüş | `web-cbar-new/src/entities/org-chart/model/layout.ts` (`buildChartLayout`, saf funksiya, `layout.test.ts`), ölçülər `entities/org-chart/constants.ts` (`CHART`). Qaydalar və Figma nöqtələri: `specs/060-org-chart-auto-layout/contracts/layout-rules.md` (L1–L11, R5 — Figma-dan qəsdən fərqlər) |
| Sayt | `views/organization/loader.ts` → `views/organization/index.tsx` → `widgets/org-chart/` (`org-chart-chart.tsx` desktop, `chart-parts.tsx` kartlar/bloklar/xətlər, `org-chart-tree.tsx` planşet/mobil). Server Component; açılan blok native `<details>` |
| Rənglər | `web-cbar-new/src/app/globals.css` → `--site-org-*` |
| Admin panel | `web-cbar-admin-new`: `pages/org-chart` + `features/org-chart/` (`node-list`, `node-form-dialog`, `sibling-order-dialog` — generik `features/crud/components/reorder-dialog.tsx` üstündə, `model/tree.ts`); «Saytda bax» `VITE_SITE_URL` (`.env.*`, boşdursa düymə yoxdur). Route `?view=list\|chart&locale=az\|en` |
| Paneldə sxem (US4) | `features/org-chart/chart/` — saytın `entities/org-chart/constants.ts` və `model/layout.ts`-inin **bayt-bayt nüsxəsi**, `npm run check:chart-layout` (hər iki komponentin `verify`-ında) fərqi tutur; `model/chart-view.ts` (saytın API süzgəcinin təkrarı, testli); `components/chart-tab.tsx`, `chart-preview.tsx`, `chart-preview-parts.tsx` (saytın `widgets/org-chart/org-chart-chart.tsx` / `chart-parts.tsx` render-inin portu: keçid əvəzinə redaktə düyməsi — **saytda render dəyişəndə bunu da dəyiş**). Rənglər `src/index.css` `--org-*` (saytın `--site-org-*` dəyərləri); DM Sans `src/fonts.css` (saytın faylları) |
| Testlər | sayt: `entities/org-chart/model/layout.test.ts`, `widgets/org-chart/org-chart-chart.test.tsx`, `views/sections.test.tsx`; panel: `features/org-chart/org-chart.test.tsx`; admin API: `tests/Cbar.AdminApi.Tests/OrgChartRulesTests.cs`; MSW: hər iki repoda `shared/testing/handlers/{organization,org-chart}.ts` |
| Ölçmə | `specs/060-org-chart-auto-layout/measure/` — fikstür proxy + headless Edge (CDP) Figma nöqtələri ilə tutuşdurma, açılan blokların bütün birləşmələri, klaviatura, JS-siz klik. Son nəticə `report-2026-11-26.md` |

**API qaydaları:**

- `PUT /chart/{id}` sıraya və köhnə koordinatlara toxunmur. Panel `sortOrder`-i özü hesablayır: redaktədə saxlanmış dəyər,
  valideyn dəyişəndə yeni qardaşların `max + 1`-i.
- `departmentsOpen`: `null` və ya göndərilməyib → saxlanmış dəyər qalır; `true` yalnız növ 4/6 üçün, başqa növdə → 400.
  `false` sətir yaratmır, `true` yaradır və ya yeniləyir. Kart silinəndə sətir də silinir.
- `PUT /chart/order` `{ parentId, ids }`: `ids` həmin valideynin **bütün** uşaqları (deaktivlər də), hər biri bir dəfə → 204,
  `sort_order = i + 1`; əskik/artıq/təkrar → 400; naməlum `parentId` → 404.
- `PUT` payload-da olmayan locale-in tərcüməsini silir. Boş `title`/`subtitle` `NULL` kimi saxlanır.
- Valideyn dövrü (özünə və ya nəslinə) → 400. Uşağı olan node-u silmək → 409.
- `staff_id` + `division_id` birlikdə → 400 (DB-də də CHECK var).
- Bağlanmayan node-un ən azı bir dildə `title`-ı olmalıdır → 400.
- **FK qeydi:** staff/division FK-ları yalnız miqrasiyanın REFERENCES icazəsi olan mühitdə əlavə
  olunur (0014 kimi). Olmayan yerdə `OrganizationStaffController.Delete` və
  `OrganizationDivisionsController.Delete` link-i `ExecuteUpdateAsync` ilə özləri `NULL` edir. Public
  sorğu əlaqəli cədvəli join etdiyi üçün qırıq id «bağlı deyil» kimi oxunur.

**Public filtr:**

- Node atılır, əgər:
  - `is_active = false`;
  - bağlı staff/division deaktivdir;
  - locale-də ad yoxdur (`title ?? staff.FullName ?? division.Name`).
- Atılan node-un bütün nəsli də atılır, ona görə cavabdakı hər `parentId` siyahıdakı bir node-a
  işarə edir.
- `link` yalnız bağlı qeydin həmin locale-də tərcüməsi olanda verilir.
- Sıralama: `SortOrder`, sonra `Id`.

**Sayt fallback-i:**

- `getOrgChart` xəta verərsə `[]` qaytarır və bölmə xəta vermir.
- `orgChart.length === 0` olanda köhnə `DivisionsSection` (CMS şəkli + şöbə siyahısı) render olunur.
- `departmentsOpen` sahəsi olmayan köhnə API ilə bütün bloklar «açılan siyahı» olur.

**Bilinən boşluqlar:**

- Test mühitindəki 40 kartda FR-017 düzəlişi redaktor tərəfindən edilməlidir: 40–43-ün valideyni 37, 37 «həmişə açıq»
  (`specs/060-org-chart-auto-layout/data-model.md`).
- JavaScript söndürülmüş brauzerdə saytın **heç bir** səhifəsi görünmür: kök `src/app/[locale]/loading.tsx` məzmunu Next-in gizli
  streaming blokunda saxlayır. Açılan blokun özü JS-siz işləyir (native `<details>`), amma bu səhifə səviyyəsində ayrıca həll tələb edir.
- Paneldəki sxemin render-i saytınkının əl ilə portudur: düzülüş kodu yoxlanılır (`check:chart-layout`), kartların görünüşü yox.
  Spec 060 ölçməsində (2026-11-26) 40 kartın hamısı saytla eyni yerdə və ölçüdə idi.
