# "Media" bölməsi — redaktor qeydi (spec 028)

Saytın `/media` giriş səhifəsi və bölmənin sol menyusu **admin paneldəki "Media" səhifə
ağacından** gəlir. Kodda bölmə adları yazılmır: ağacda nə varsa, menyuda o görünür.

## Giriş səhifəsi (`/az/media`, `/en/media`)

- Başlıq və giriş mətni "Media" səhifəsinin (slug `media`) özündən oxunur — hər iki dildə
  doldurun. Mətn adi paraqraflardır; Figma-dakı iki abzas CMS-də artıq var.
- Səhifəyə əlavə edilmiş fayllar (varsa) mətnin altında "Sənədlər" kimi görünür.
- Breadcrumb: "Ana səhifə › Media". Sağda paylaşma düymələri avtomatikdir.

## Sol menyu

"Media" səhifəsinin **birbaşa uşaqları**, ağacdakı sırada. Uşağı olan bənd (məs. "Tədbirlər")
sağda ox işarəsi ilə göstərilir və həmin bəndin səhifəsi açılanda alt bəndləri açılır.

Bəndin keçidi: "Naviqasiya ünvanı" (`navUrl`) doludursa o, yoxdursa səhifənin öz ünvanı.

Bəndi menyudan çıxarmaq üçün iki bayraq və menyu yeri seçimi var, təsirləri fərqlidir (spec 041, spec 054):

| Bayraq (söndürülüb) və ya seçim | Üst menyu, mobil, footer | Sol menyu | Breadcrumb | Ünvanla açılır | Alt səhifələr |
|---|---|---|---|---|---|
| Aktiv | yox | yox | — | yox (404) | üst səviyyəyə qalxır |
| Menyuda görünür | yox | yox | qısa: Ana səhifə › Bölmə › Səhifə | bəli | üst səviyyəyə qalxır |
| Menyudakı yeri: «Menyularda yox» | footer: bəli; açılan menyular: yox (kök bölmə qalır) | yalnız səhifənin özü və ya alt səhifəsi açıq olanda | bəli | bəli | menyularda gizlənir, üst səviyyəyə qalxmır |
| Menyudakı yeri: «Yalnız açılan menyularda» (spec 054) | footer və açılan menyular: bəli | yalnız səhifənin özü və ya alt səhifəsi açıq olanda | bəli | bəli | sol menyuda gizlənir |

Səhifəni menyulardan çıxarmaq, amma ünvanını və breadcrumb-unu saxlamaq lazımdırsa səhifə formunun **"Saytın menyusunda"** kartında
**"Menyudakı yeri" → "Menyularda yox"** seçin (spec 054-ə qədər bu, "Sol menyuda göstər" bayrağı idi). Spec 048-dən bəri belə səhifə sol menyu ilə yanaşı nav çubuğunun açılan menyusunda, hamburger panelində
və mobil menyuda da görünmür (açıq olanda da). "Menyuda görünür" isə səhifəni bütün saytın naviqasiyasından
çıxarır, alt səhifələrini üst menyuya qaldırır. Bölmə kökündə (Media) bu bayraq heç bir menyunu gizlətmir: kök
menyunun bəndi deyil. Qayda Haqqımızda və
Media şablonunda da, digər bölmələrin köhnə görünüşlü sol ağacında da eynidir.

| Bənd | Tövsiyə olunan `navUrl` | Qeyd |
|---|---|---|
| Fotoqalereya | `/media/galleries` | Köhnə `/media#galleries` işləyir, amma menyuda bənd aktiv görünmür |
| Videoqalereya | `/media/videos` | Köhnə `/media#videos` — eyni qeyd |
| Press-relizlər | `/press-releases?type=1` | dəyişmir |
| Elanlar | `/press-releases?type=2` | dəyişmir |
| Müsahibələr və çıxışlar | `/press-releases?type=3` | Materiallar dərc olunandan sonra verin, aşağıya baxın |

## Hamburger menyuda "Media" (spec 042)

Geniş masaüstündə (1360px və daha geniş) "Media" hamburger panelində **qəsdən yoxdur**: header-in üst zolağında artıq
"Media" keçidi var, Figma-da da panel onu göstərmir. "İnsan resursları" da eyni səbəbdən ("Karyera" keçidi) paneldə yoxdur.
Daha dar ekranda üst zolaq gizlidir, ona görə "Media" hamburger panelində, telefonda mobil menyuda qalır.

Bu, header qaydasıdır, admin panelində ayarı yoxdur. "Media"nı hamburgerdə göstərmək və ya gizlətmək üçün **"Menyuda görünür"-ü
söndürməyin**: bölmə bütün naviqasiyadan, o cümlədən mobil menyudan çıxar, alt səhifələri isə üst menyuya qalxar. Bölmələrin sırasını
dəyişib "Media"nı ilk 8-ə salmaq da onu nav çubuğuna keçirir.

## Figma adlarına keçid (istəyə görə, məzmun qərarı)

| Figma | CMS-də bu gün | Nə etmək |
|---|---|---|
| Xəbərlər | Press-relizlər | adı dəyişdirmək |
| Müsahibələr və çıxışlar | Təqdimat və məruzələr (boş) | aşağıdakı bölməyə baxın |
| Qalereya | Fotoqalereya + Videoqalereya | hələlik iki bənd qalır |
| Media sorğuları | Media Sorğuları (`519`) və İnformasiya sorğusu (`85`) | aşağıdakı bölməyə baxın |
| Məlumatların yayımlanması qrafiki | kök səhifə `melumatlarin-yayimlanmasi-qrafiki` (130) | Media altına keçirmək, aşağıdakı bölməyə baxın |
| Mərkəzi Bankın loqosu | — | yeni səhifə yaratmaq |
| — | İnzibati işlərə baxan vəzifəli şəxslər | Spec 050 seed-i (`0031`) onu **"İstehlakçıların və investorların hüquqları"** bölməsinə köçürür; Media-da artıq yoxdur. Ünvanı dəyişmir. Bax `docs/consumer-rights-cms-guide.md` |

## Elan mətnində siyahı cədvəli

Elandakı cədvəl Figma görünüşünü özü alır, mövcud elanları dəyişmək lazım deyil:

- Birinci sətir sütun adları sayılır, qalan sətirlər zolaqlı siyahıdır.
- 3–4 sütunlu cədvəldə son sütun (saat, bal) vurğulanır, 5–6 sütunda adi qalır.
- Geniş cədvəl telefonda sıxılmır, yana sürüşür.

Bu görünüş yalnız elanlardadır, digər səhifələrdəki cədvəllər dəyişmir.

### Tünd başlıq zolağı (istəyə görə)

Zolaq birinci sətrin xanaları birləşdiriləndə görünür. Redaktorda yalnız aşağıya sətir əlavə etmək olur, ona
görə sıra belədir.

Yeni cədvəldə:

1. `Cədvəl əlavə et` və lazım olan sütun sayını qurun.
2. Birinci sətrin xanalarını seçib `Xanaları birləşdir` düyməsini basın, "SİYAHI (sığorta vasitəçiləri)" yazın.
3. İkinci sətirə sütun adlarını, növbəti sətirlərə siyahını yazın.

Mövcud cədvəldə:

1. Kursoru birinci sətrə qoyub `Aşağıya sətir əlavə et` düyməsini basın.
2. Sütun adlarını birinci sətirdən yeni ikinci sətrə köçürün.
3. Birinci sətrin xanalarını birləşdirin və başlığı yazın.
4. Cədvəldən əvvəlki eyni mətnli paraqrafı silin.

## Müsahibələr və çıxışlar

Materiallar press-relizdir, tipi **Müsahibə və çıxış**. Köçürüləcək 15 materialın siyahısı:
`specs/033-media-interviews/content-inventory.md`.

Bir material əlavə etmək:

1. Press-relizlər → yeni: tipi seçin, tarix, az və en başlıq, mətn. Tarix siyahıda görünür, detalda yox.
2. Yadda saxlayandan sonra "Şəkillər və sənədlər" bölməsində PDF və şəkil əlavə edin.
3. Hər fayl üçün dil seçin: **AZ**, **EN** və ya **Hər iki dil**. Dil yalnız seçiləndə təsir edir: AZ fayl
   ingiliscə səhifədə heç görünmür.
4. Nişanlara baxın: **Kart şəkli** siyahı kartındakı şəkildir, detalda göstərilmir. **PDF düyməsi** həmin dilin
   "PDF kimi yüklə" düyməsidir. Sıranı oxlarla dəyişin. Qalan fayllar düymənin altında sənəd siyahısındadır.

Qaydalar:

- Şəkil yoxdursa kartda boz qutu görünür.
- Mətn boş ola bilər (skan PDF): səhifədə başlıq və düymə qalır.
- Bir dil üçün PDF yoxdursa həmin dildə düymə görünmür.
- Fayl dili Xəbər və Elanlarda da işləyir, amma orada adətən lazım deyil.

Menyu, bütün materiallar dərc olunub yoxlanandan sonra:

| Səhifə | Ad (az / en) | `navUrl` |
|---|---|---|
| `80` | Müsahibələr və çıxışlar / Interviews and speeches | `/press-releases?type=3` |
| `409` (Kopya) | eyni, kopya şəkilçisi ilə | `/press-releases?type=3&copy=1` |

Səhifə `80`-in 44 qoşmasını bütün materiallar yoxlanana qədər silməyin.

## Tədbirlər

Tədbirlər CMS səhifəsi deyil, admin panelin **Media → Tədbirlər** bölməsindən idarə olunur (`/media/events`, spec 034). Menyu bəndi `tedbirler` /
`events` slug-una görə özü bu siyahıya aparır, `navUrl` lazım deyil. Köhnə 6 tədbir səhifəsi yerindədir, alt ağacı menyularda göstərilmir,
səhifə açılanda sol menyuda çıxır. **Bu səhifələri gizlətməyin**: API gizli valideynin uşaqlarını kök kimi qaytarır, onlar üst menyuya çıxar.
Sol menyudan çıxarmaq lazımdırsa, "Menyudakı yeri"-ndə "Menyularda yox" və ya "Yalnız açılan menyularda" seçin.
Redaktor təlimatı: `dokumentasiyalar/tedbirler-guide.md`.

## Media sorğuları

Səhifə `519`, slug `media-sorgulari` (spec 037). Kontakt kartları səhifənin birinci cədvəlindən qurulur, hər sətir bir kartdır:
`Ad | Dəyər | Əlavə mətn`. Qayda yalnız bu səhifədədir. Hazır məzmun repo kökündə `media-sorgulari-html/`-dədir, redaktor təlimatı:
`dokumentasiyalar/media-sorgulari-guide.md`. "İnformasiya sorğusu" (`85`) Figma menyusunda yoxdur, amma hüquqi məzmun daşıyır:
saxlamaq və ya gizlətmək redaksiya qərarıdır. Səhifəni saxlayıb yalnız sol menyudan çıxarmaq üçün "Menyudakı yeri"-ndə "Yalnız açılan menyularda" seçin.

## Korporativ sosial məsuliyyət

Layihələr səhifənin mətnində yazılmır (spec 038). Admin paneldə **Haqqımızda → KSM layihələri** bölməsindədir (səhifə ağacında KSM səhifəsini açanda formada bu bölməyə keçid var):

- **Layihələr** tabı: kart başlığı, qısa təsvir, pəncərə başlığı, mətn (hər dil üçün), kateqoriya, sıra, status, dil görünüşü, kart şəkli.
- **Fotolar**: layihə birinci dəfə saxlanandan sonra formanın altında açılır, sıra oxlarla dəyişir.
- **Kateqoriyalar** tabı: kartdakı etiketlər. Layihəyə bağlı kateqoriya silinmir, silinmiş layihə də onu saxlayır.
- Kart şəkli boş qalsa, kartda ilk foto göstərilir. Hər ikisi boşdursa kartda boz sahə qalır.
- Bir dil tam boş qalsa, layihə həmin dildə görünmür. Başlanmış dildə üç başlıq sahəsi məcburidir.

Səhifənin özündə (`korporativ-sosial-mesuliyyet` / `corporate-social-responsibility`) giriş mətni və öz sətrində fayl keçidi göstərilir. Köhnə layihə siyahısı başlığından ("Korporativ sosial məsuliyyət layihələrimiz", "Layihələrimiz") sonrakı mətn saytda görünmür, istəsəniz onu admin paneldə silə bilərsiniz. Keçid "KSM Konsepsiyası" fayl sətri olur. Səhifənin alt hissəsində "Sənədlər" bloku göstərilmir, mətndə keçidi olmayan fayl saytda görünmür.

## Məlumatların yayımlanması qrafiki

Cədvəl səhifənin mətnində yazılmır (spec 039). Admin paneldə **Media → Yayım qrafiki** bölməsindədir (səhifə 130-un formasında bu bölməyə keçid var), üç tab:

- **Sətirlər**: məzmun və təqdim olunma müddəti (az/en), qrup, dövrilik, sıra, status, dillər üzrə görünüş. "Müddət xanası":
  **Mətn**; **Link** (`https://…` və ya saytın öz yolu, məs. `/statistik-hesabatlarin-yayimlanmasi-qrafiki`, dil prefiksini sayt özü
  əlavə edir); **Qərarlar qrafiki**: saytda pəncərə açılır.
- **Qruplar**: cədvəlin qalın bölmə sətirləri. Deaktiv qrup və onun sətirləri saytda görünmür.
- **Dövriliklər**: sətirlərdə seçilən dəyərlər ("Aylıq", "İllik" …). İstifadədə olan qrup və ya dövrilik silinmir.

Qərarlar qrafikinin tarixləri ayrıca yazılmır: bunlar **Media → Tədbirlər** bölməsində cari ilin "Qərar" növlü dərc olunmuş tədbirləridir.
Həmin gün "Mətbuat konfransı" növlü tədbir də varsa, tarixin altında "Press-reliz və mətbuat konfransı" yazılır. "Növbəti açıqlama" bu
gündən sonrakı ilk qərardır. Yeni ilin tarixlərini Tədbirlərə daxil etmək kifayətdir.

Yayımdan sonra bir dəfəlik işlər:

1. CMS-də `melumatlarin-yayimlanmasi-qrafiki` / `information-disclosure-schedule` səhifəsini **Media** altına keçirin: sol menyu və
   breadcrumb ondan qurulur. Səhifənin adı başlıqdır, linkini sayt özü `/media/release-schedule`-ə yönəldir.
2. Səhifənin mətnində cədvəldən əvvəlki hissə giriş mətnidir. Figma-dakı cümləni ("Mərkəzi Bankın internet saytında yerləşdirilən
   məlumatların növləri…") ora yazın. Köhnə cədvəl sətirlər gələndə saytda görünmür, istəsəniz silə bilərsiniz. Admin paneldə heç bir
   sətir dərc olunmayıbsa, saytda səhifənin mətni olduğu kimi (köhnə cədvəl daxil) göstərilir.
3. Köçürülmüş sətirlərdən "Milli pul nişanları", "Nəşrlər və tədqiqatlar", "Maliyyə savadlılığı", "Beynəlxalq əməkdaşlıq",
   "Ümumi kommunikasiya" köhnə cədvəldə dövriliksiz idi. Onlara Figma-dakı dəyərlər verilib, yoxlayın.
4. Tədbirlərdə cari ilin "Qərar" tarixlərini yoxlayın.

Köhnə `page-72/…` ünvanı və səhifənin öz ünvanları yeni səhifəyə yönləndirilir.

## Mərkəzi Bankın loqosu

Səhifə `553`, slug `merkezi-bankin-logosu` / `central-bank-logo` (spec 040). Versiya kartları səhifənin birinci cədvəlindən
qurulur, hər sətir bir kartdır: `Şəkil | Ad | İzah | Fon`. Fon `tünd` / `dark` ağ loqonu tünd önizləmədə göstərir. Birinci
sətrin şəkli Hero-dur. Yükləmə kartları səhifənin **Sənədlər** blokundakı fayllardır: çip faylın başlığıdır, ölçünü sayt
özü yazır, fayllar səhifənin altında ayrıca siyahı kimi təkrarlanmır. Hər format bir ZIP arxividir və bütün versiyaları
saxlayır: `SVG` (bütün SVG-lər), `PNG` (bütün versiyalar bütün ölçülərdə), `PDF` (bütün PDF-lər, EPS də burada). Sayt
arxivi yığmır, loqo dəyişəndə redaktor arxivi yenidən yükləyir (FR-016). Yeni ünvan və
yönləndirmə yoxdur. Hazır məzmun repo kökündə `merkezi-bankin-logosu-html/`-dədir, redaktor təlimatı:
`dokumentasiyalar/merkezi-bankin-logosu-guide.md`.

## "Media (Kopya)"

Redaktor surəti kökün uşağı kimi qalır (About-dakı qayda). Kopya səhifəsi açılanda menyu Kopya
kökünün uşaqlarından qurulur; əsl Media səhifələrində Kopya adi bənd kimi görünür. Yayımdan
əvvəl Kopyanı gizlətmək və ya silmək lazımdır.
