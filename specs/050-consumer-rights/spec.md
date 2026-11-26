# Feature Specification: "İstehlakçıların və investorların hüquqları" bölməsinin Figma redizaynı

**Feature Branch**: `050-consumer-rights`

**Created**: 2026-11-17

**Status**: Draft

**Input**: "speckit ilə hal-hazırda olan web-cbar-new saytında quraq, dizayna uyğun, köhnə sayt məntiqinə də bax, sualların varsa dəqiqləşdirək
və speckit ilə icra edək." (Figma: "Consumer and Investor Rights" səhifəsi və ətrafındakı alt səhifələr.)

Qərarlar (2026-11-17, istifadəçi):
1. Bölmənin sol menyusu Figma kimi **yalnız dörd bənddir**: Vətəndaş müraciətlərinə dair statistika, Şikayət indeksləri, İnzibati işlərə baxan
   vəzifəli şəxslər, Sənədlər. Qalan alt səhifələr sol menyudan çıxır (spec 041), silinmir; ünvanları işləyir.
2. Figma-da gizli olan "Mərkəzi Banka müraciət imkanları" kadrı (`2615:15218`, altı tablı hub) **bu spec-ə daxil deyil** — ayrıca spec olacaq.
3. "İnzibati işlərə baxan vəzifəli şəxslər" səhifəsi (id 86) **CMS-də bu bölməyə köçürülür** (seed). Saytın səhifə ünvanı slug-dan qurulur
   (`/{locale}/{slug}`), ana səhifədən asılı deyil, ona görə ünvan dəyişmir və yönləndirmə lazım deyil (plan research R7).
4. Statistika səhifəsindəki "qısa icmal" kartları **cədvəllərdən avtomatik** qurulur: son doldurulmuş ay. Redaktor ayrıca icmal yazmır.

Agentin qəbul etdiyi defoltlar (istifadəçi düzəldə bilər):
5. Bloklar **redaktorun adi işarələməsindən** qurulur (spec 024, 044–047 kimi): API, sxem və admin panel dəyişmir; bazaya yalnız seed yazılır.
6. Birləşən səhifələr saytda yığılır: Statistika səhifəsi 94-ün ünvanında açılır və 93-ün (İnfoqrafika) məzmununu da göstərir; Şikayət indeksləri
   95-in ünvanında açılır, 96 (Sığorta) onun ikinci tabıdır. 93 və 96-nın öz ünvanları birləşmiş səhifəyə yönlənir.
7. Seed başlıqları Figma-ya uyğunlaşdırır (95 → "Şikayət indeksləri", 101 → "Sənədlər") və metodologiya mətnini 95-ə əlavə edir — yalnız mətn hələ
   köhnə formadadırsa (0026/0028/0029/0030 nümunəsi).

**Figma** (fayl "cbar website (Copy)", səhifə "Consumer and Investor Rights" `2445:16785`):

| Section | Desktop 1728 | Tablet 744 | iPhone 390 |
|---|---|---|---|
| İstehlakçıların və investorların hüquqları `2457:19212` | `2445:16786` | `2448:3656` | `2448:4323` |
| Vətəndaş müraciətlərinə dair statistika `2566:74672` | `2557:137809` | `2565:102519` | `2565:105546` |
| Şikayət indeksləri `2552:67914` | `2453:4111` | `2474:95890` | `2474:97131` |
| İnzibati işlərə baxan vəzifəli şəxslər `2554:69348` | `2553:6979` | `2555:8317` | `2555:8979` |
| Sənədlər `2621:114005` | `2572:14435` | `2575:99128` | `2575:99965` |

Komponentlər: "Şikayət indeksləri — komponentlər" `2452:145200` (`Complaint / Year` `2452:145191`, `Complaint / Index` `2453:4106`,
`Complaint / Document` `2463:4855`, `Complaint / Latest` `2463:5419`); "Müraciət statistikası — komponentlər" `2557:10150` (`Stat / Channel`
`2557:10129`, `Infoqrafika / Year` `2557:136849`, `Sənədlər / Section` `2572:14430`; `Müraciət / Section` və `Müraciət / Hub` hub-a aiddir, əhatədən
kənardır). Ölçülər plan mərhələsində `contracts/ui-contract.md`-yə yazılır.

**Köhnə vəziyyət** (test API `api-cbar-test.cbar.az`, 2026-11-17). Köhnə Yii2 saytda bu bölmənin xüsusi kodu yoxdur: hamısı ümumi CMS səhifə
şablonudur (`visitor/views/pages/index.php`). Məntiq tamamilə redaktorun HTML-indədir: iç-içə `<details data-accordion>` akkordeonları, `data-media-link`
fayl linkləri və cədvəllər.

| id | az başlıq (slug) | en slug | Məzmun | Figma |
|---|---|---|---|---|
| 87 | İstehlakçıların və investorların hüquqları (`istehlakcilarin-ve-investorlarin-huquqlari`) | `consumer-and-investor-rights` | bölmə kökü; lead + 9 bəndlik siyahı (88 ilə demək olar eyni) | kök səhifə |
| 88 | Fəaliyyət istiqamətləri | `activity-directions` | kökün mətni | yoxdur |
| 89–92 | Müraciətlərə baxılması, Vətəndaşların qəbulu, Bizimlə əlaqə, Əks əlaqə | var | mətn, akkordeon, fayllar | gizli hub (kənarda) |
| 93 | İnfoqrafika (`infoqrafika`) | en-də yoxdur | il → ay akkordeonu, hər ayda bir PDF (65 fayl) | Statistikanın "İnfoqrafika" bloku |
| 94 | Vətəndaş müraciətlərinə dair statistika | `statistics-of-citizens-appeals` | 5 kanal akkordeonu (Yazılı, Vətəndaş qəbulu, Daxil olan zənglər, Whatsapp, Səyyar qəbul) → il akkordeonu → aylar × sektorlar cədvəli | öz səhifəsi |
| 95 | Bank xidmətlərindən istifadə üzrə şikayət indeksi | `complaint-index-on-bank-customers-use-of-bank-services` | il → ay akkordeonu, hər ayda bir PDF (64 fayl); metodologiya yoxdur | "Şikayət indeksləri", Bank tabı |
| 96 | Avto-icbari sığorta üzrə şikayət indeksi | `complaint-index-on-compulsory-mtpl-insurance` | il → ay akkordeonu, hər ayda bir PDF (79 fayl) | Sığorta tabı |
| 97 | Tədbirlər (`tedbirler-2`) | `events-2` | xəbər arxivi (spec 034 hadisələri) | yoxdur |
| 98, 99 | Təkliflər, Ərazi idarələrinə müraciət | 98 var | mətn | gizli hub (kənarda) |
| 100 | Tətbiq edilmiş nəzarət tədbirləri | `supervisory-actions-imposed` | böyük akkordeon arxivi | yoxdur |
| 101 | Kapital bazarı (`kapital-bazari-3`) | `capital-market-3` | 2 akkordeon (Səhmdarlar, Emitentlər) + fayllar | "Sənədlər" |
| 102, 103 | Ödəniş xidmətləri, Rəqəmsal fırıldaqçılıq statistikası | 102 var | qısa mətn + fayllar | yoxdur |
| 433 | İstehlakçıların və investorların hüquqları (Kopya) | var | qaralama alt ağacı (434–449) | yoxdur |
| 86 | İnzibati işlərə baxan vəzifəli şəxslər — **Media altında** | `officials-authorized-to-consider-cases-on-administrative-violations` | lead, paraqraflar, siyahı | öz səhifəsi |

Yeni saytda bu bölmə üçün xüsusi heç nə yoxdur: səhifələr adi məzmun kimi göstərilir.

## Clarifications

### Session 2026-11-17

- Q: Statistika icmalındakı WhatsApp kartında cəmin altında hansı bölgü göstərilsin (Figma mövzu üzrə, CMS cədvəli sektor üzrə)? → A: Digər kartlar kimi sektor bölgüsü, CMS cədvəlindən (Figma-dakı mövzu sətirləri bazada yoxdur).
- Q: "Fəaliyyət istiqamətləri" (88) öz ünvanında qalsın, yoxsa köka yönlənsin? → A: 88-in az və en ünvanı bölmə kökünə daimi yönlənir (spec 047 "Ümumi məlumat" kimi); 88 sol menyuda gizlidir.
- Q: Kanallar fərqli aylara qədər doldurulubsa, qısa icmal hansı ayı göstərsin? → A: Dörd kanalın (Yazılı, Vətəndaş qəbulu, Daxil olan zənglər, WhatsApp) hamısında doldurulmuş ən son ortaq ay; başlıq və bütün kartlar həmin ay.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ziyarətçi bölməni Figma şablonunda açır (Priority: P1)

Ziyarətçi üst menyudan "İstehlakçıların və investorların hüquqları"nı açır: breadcrumb, paylaşma düymələri, solda dörd bəndli bölmə menyusu, sağda
başlıq, lead paraqraf və nömrələnmiş fəaliyyət istiqamətləri siyahısı görür.

**Why this priority**: Bölmənin giriş səhifəsidir və bütün digər səhifələrin şablonu (sol menyu, breadcrumb) burada yaranır.

**Independent Test**: Seed olunmuş bazada kök ünvanı az və en dilində üç endə açmaq, Figma `2445:16786` ilə tutuşdurmaq, sol menyuda yalnız dörd bənd
olduğunu yoxlamaq.

**Acceptance Scenarios**:

1. **Given** seed tətbiq olunub, **When** ziyarətçi `/az/istehlakcilarin-ve-investorlarin-huquqlari` açır, **Then** başlıq, lead və nömrələnmiş siyahı Figma kimi göstərilir, sol menyuda Figma sırası ilə dörd bənd var.
2. **Given** ziyarətçi gizlədilmiş alt səhifəni (məs. "Tədbirlər") birbaşa ünvanla açır, **Then** səhifə eyni şablonda adi mətn kimi açılır; sol menyuda o səhifənin özü görünür (spec 041: açıq səhifə istisnası), digər gizli bəndlər görünmür.
3. **Given** en dili, **Then** eyni şablon en başlıqları və mətni ilə göstərilir.
4. **Given** ziyarətçi "Fəaliyyət istiqamətləri"nin köhnə ünvanını (`…/fealiyyet-istiqametleri` və ya en `…/activity-directions`) açır, **Then** bölmə kökünə daimi yönləndirilir.

---

### User Story 2 - Ziyarətçi şikayət indeksinin son faylını və arxivini tapır (Priority: P1)

Ziyarətçi "Şikayət indeksləri"ni açır: Bank / Sığorta tabları, seçilmiş tabın "SON MƏLUMAT" kartı (ən son ayın faylı), "Arxiv" başlığı altında il
akkordeonları (açılınca ay sənəd kartları) və altda "Şikayət indeksinin metodologiyası" (düstur və izahlar).

**Why this priority**: Bölmənin ən çox yenilənən məlumatıdır; hər ay yeni fayl əlavə olunur.

**Independent Test**: Seed olunmuş bazada 95-in ünvanını açmaq; tabları dəyişmək; son məlumat kartının ən son ayın faylına apardığını, arxivdə hər
ilin bütün aylarının olduğunu yoxlamaq.

**Acceptance Scenarios**:

1. **Given** açıq səhifə, **Then** Bank tabı seçilib, son məlumat kartı 95-in ən yeni il/ay faylını göstərir, arxivdə illər yenidən köhnəyə doğru, hamısı bağlıdır.
2. **When** ziyarətçi Sığorta tabına keçir, **Then** son məlumat kartı və arxiv 96-nın məzmunu ilə dəyişir və ünvan tabı əks etdirir (paylaşılan link həmin tabı açır).
3. **When** il akkordeonu açılır, **Then** həmin ilin hər ayı sənəd kartı kimi göstərilir və klik faylı açır.
4. **Given** ziyarətçi 96-nın köhnə ünvanını açır, **Then** Şikayət indeksləri səhifəsinin Sığorta tabına daimi yönləndirilir.
5. **Given** JavaScript işləmir, **Then** tablar adi linkdir (server seçilmiş tabı render edir) və arxiv akkordeonları açılır.

---

### User Story 3 - Ziyarətçi müraciət statistikasına baxır (Priority: P2)

Ziyarətçi "Vətəndaş müraciətlərinə dair statistika"nı açır: "<Ay İl> — qısa icmal" kartları (dörd kanal üzrə cəmi və sektor sətirləri), kanal
seçimli statistika cədvəlləri (il akkordeonlarında) və İnfoqrafika (il → ay → PDF).

**Why this priority**: Böyük cədvəl arxividir; Figma onu oxunaqlı edir, amma məlumat köhnə görünüşdə də əlçatandır.

**Independent Test**: 94 və 93-ün məzmunu ilə səhifəni açmaq; icmalın son doldurulmuş ayın rəqəmlərini göstərdiyini cədvəllə tutuşdurmaq; kanalları
dəyişmək; infoqrafika faylını açmaq.

**Acceptance Scenarios**:

1. **Given** 94-ün cədvəllərində son doldurulmuş ay Sentyabr 2026-dır, **Then** icmal başlığı "Sentyabr 2026 — qısa icmal"dır və dörd kartın hər biri (Daxil olan zənglər, Yazılı müraciətlər, Vətəndaşların qəbulu, WhatsApp) həmin ayın kanal cəmini və altı sektor sətrini göstərir; WhatsApp kartı da sektor bölgüsü ilə (Figma-dakı mövzu sətirləri yox).
2. **Given** zənglər İyun 2026-ya, qalan üç kanal May 2026-ya qədər doldurulub, **Then** icmal başlığı "May 2026 — qısa icmal"dır və dörd kartın hamısı May rəqəmlərini göstərir. Dörd kanalın ortaq doldurulmuş ayı yoxdursa (məs. bir kanal cədvəli tamamilə yoxdur və ya ən yeni ilində heç bir ay dolu deyil), icmal bloku göstərilmir; statistika və infoqrafika blokları dəyişmədən qalır.
3. **When** ziyarətçi kanal tabını və ya il düyməsini seçir, **Then** həmin kanalın həmin ilinin cədvəli Figma `Stat / Channel` görünüşündə göstərilir (ilkin vəziyyət: birinci kanal, ən yeni il); seçim ünvandadır və JavaScript olmadan işləyir. Səyyar qəbulun çevrilmiş cədvəli (şəhər × ay) eyni çərçivədə öz sütunları ilə göstərilir.
4. **When** İnfoqrafika ilinin akkordeonu açılır, **Then** ayların faylları sənəd kartı kimi göstərilir.
5. **Given** ziyarətçi 93-ün köhnə ünvanını açır, **Then** Statistika səhifəsinə (İnfoqrafika blokuna) daimi yönləndirilir.

---

### User Story 4 - Ziyarətçi "İnzibati işlər" və "Sənədlər" səhifələrini oxuyur (Priority: P2)

"İnzibati işlərə baxan vəzifəli şəxslər" bölmənin altında Figma görünüşündə açılır (lead, paraqraflar, alt başlıq, nömrələnmiş siyahı).
"Sənədlər" Səhmdarlar / Emitentlər / İnformasiya sorğusu akkordeon bölmələrini, içində mətn, siyahı və PDF sənəd kartlarını göstərir.

**Independent Test**: Seed-dən sonra hər iki səhifəni üç endə açmaq; 86-nın köhnə Media ünvanının yeni ünvana yönləndiyini yoxlamaq.

**Acceptance Scenarios**:

1. **Given** seed tətbiq olunub, **Then** 86 ağacda bu bölmənin altındadır, Media menyusunda yoxdur, breadcrumb "Ana səhifə › İstehlakçıların və investorların hüquqları › İnzibati işlərə baxan vəzifəli şəxslər"dir.
2. **When** ziyarətçi köhnə linklə (`/az/inzibati-islere-baxan-vezifeli-sexsler` və ya `/az/media/inzibati-islere-baxan-vezifeli-sexsler`, en ekvivalenti) gəlir, **Then** səhifə bu bölmənin şablonunda açılır (ünvan slug-dan asılıdır, ana səhifədən yox).
3. **Given** "Sənədlər" açılır, **Then** akkordeonlar bağlıdır, açılan bölmədə mətn və sənəd kartları Figma `Sənədlər / Section` kimidir.

---

### User Story 5 - Redaktor bölməni adi redaktorla saxlayır (Priority: P3)

Redaktor admin paneldə bu səhifələri açıb saxlayır; heç bir akkordeon, cədvəl, fayl linki itmir, sayt eyni blokları qurur. Redaktor təlimatı
(`dokumentasiyalar/istehlakci-huquqlari-guide.md`) yeni ay, il və kanal əlavə etməyi, metodologiyanı, sol menyunu və İnformasiya sorğusunun faylını
göstərir.

**Independent Test**: Layout fikstürlərinin admin roundtrip testi və sayt blok testi; `npm run roundtrip` canlı yoxlaması.

**Acceptance Scenarios**:

1. **Given** fikstür redaktorun saxladığı formadadır, **When** admin editor onu açıb saxlayır, **Then** bayt-bayt eyni qalır və sayt gözlənilən blokları qurur.
2. **Given** redaktor arxivə yeni ay əlavə edir, **Then** son məlumat kartı və icmal avtomatik yenilənir, kod dəyişmir.

### Edge Cases

- Səhifənin mətnində tanınan quruluş (akkordeon/cədvəl) yoxdursa, səhifə adi CMS mətni kimi bütöv göstərilir; heç nə kəsilmir.
- 96 dərc olunmayıb və ya silinib: Şikayət indeksləri yalnız Bank məzmununu tabsız göstərir. 93 yoxdur: İnfoqrafika bloku göstərilmir.
- Bir dildə səhifə yoxdur (93 və 99 en-də yoxdur): en Statistika səhifəsi İnfoqrafikasız açılır; yönləndirmə yalnız mövcud dilə edilir.
- Ay adı və ya rəqəm hüceyrəsi tanınmırsa (boş, "-", mətn), həmin dəyər icmala daxil edilmir, səhifə çökmür.
- Redaktor 95/101 başlığını artıq dəyişib: seed başlığa toxunmur.
- "(Kopya)" qaralaması (433) və alt ağacı: sol menyuda görünmür, açılanda adi mətn kimi.
- Çox uzun cədvəllər mobil ekranda üfüqi sürüşmə yaratmamalıdır: cədvəl öz qabında sürüşür, səhifə yox.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sayt bu bölməni digər şablon bölmələri kimi (About, Media, Beynəlxalq əməkdaşlıq, Maliyyə savadlılığı) breadcrumb, paylaşma və sol menyulu bölmə şablonunda göstərməlidir; bölmə həm az, həm en kök başlığı ilə tanınmalıdır.
- **FR-002**: Sol menyuda Figma sırası ilə yalnız dörd bənd olmalıdır: Statistika (94), Şikayət indeksləri (95), İnzibati işlər (86), Sənədlər (101). Qalan alt səhifələr (88–93, 96–100, 102, 103, 433) seed ilə sol menyudan çıxarılmalı, silinməməli, ağacda və footer-də qalmalıdır.
- **FR-003**: Kök səhifə lead paraqrafı və nömrələnmiş siyahını Figma `2445:16786` görünüşündə göstərməlidir.
- **FR-004**: Şikayət indeksləri səhifəsi 95 (Bank) və 96 (Sığorta) məzmununu iki tab kimi göstərməli; hər tab üçün ən son il/ayın faylını "son məlumat" kartında, bütün illəri arxiv akkordeonlarında, ayları sənəd kartları kimi göstərməlidir. Seçilmiş tab ünvanda saxlanmalıdır.
- **FR-005**: Şikayət indeksləri səhifəsi seçilmiş tabın metodologiya blokunu (düstur kəsri, iki tərif, izah, qeyd) göstərməlidir. Bank və Sığorta metodologiyası fərqlidir (Sığortada məxrəc "Bağlanan müqavilələr üzrə bazar payı"dır, əlavə izah paraqrafı var); mətnlər seed ilə müvafiq olaraq 95-in və 96-nın məzmununa yazılır.
- **FR-006**: Statistika səhifəsi 94-ün kanal cədvəllərindən son doldurulmuş ayın icmal kartlarını avtomatik qurmalı (dörd kart, hamısı sektor bölgüsü ilə, WhatsApp daxil; ay = dörd kanalın hamısında doldurulmuş ən son ortaq ay, yoxdursa icmal göstərilmir); kanal tabları və il seçimi ("İl: 2026 2025 …" düymələri, ən yeni il seçili) ilə bir cədvəli; 93-ün məzmunundan İnfoqrafika il/ay sənəd kartlarını göstərməlidir.
- **FR-007**: 93 və 96-nın ünvanları birləşmiş səhifəyə (müvafiq olaraq İnfoqrafika bloku və Sığorta tabı), 88-in ünvanı isə bölmə kökünə daimi yönlənməlidir, hər iki dildə.
- **FR-008**: Seed 86-nı Media-dan bu bölməyə köçürməli, sol menyuda Figma sırasında (Şikayət indekslərindən sonra, Sənədlərdən əvvəl) göstərməlidir. Səhifə Media menyularından çıxır; ünvanı dəyişmir, köhnə linklər işləyir.
- **FR-009**: "İnzibati işlər" səhifəsi lead, paraqraflar, alt başlıq və nömrələnmiş siyahını Figma `2553:6979` görünüşündə göstərməlidir.
- **FR-010**: "Sənədlər" səhifəsi akkordeon bölmələrini (bağlı gəlir), içindəki mətni, siyahıları və fayl linklərini sənəd kartı kimi Figma `2572:14435` görünüşündə göstərməlidir. Üçüncü bölmə "İnformasiya sorğusu" CMS-də yoxdur; seed onu (paraqraf) 101-ə əlavə edir. Figma-dakı "…“966” Çağrı Mərkəzinin istifadəsinə dair Qaydalar" PDF-i media kitabxanasında tapılmadı: redaktor yükləyib həmin bölməyə linkləyənə qədər kart göstərilmir.
- **FR-011**: Seed 95-in başlığını "Şikayət indeksləri" / en ekvivalenti, 101-in başlığını "Sənədlər" / "Documents" etməlidir — yalnız başlıq hələ köhnədirsə. Bütün seed-lər idempotent və mövcud bazada işləyən olmalıdır.
- **FR-012**: Tanınan quruluş olmayan hər səhifə adi CMS mətni kimi bütöv göstərilməlidir.
- **FR-013**: Bütün akkordeon, tab və kartlar JavaScript olmadan oxunaqlı, klaviatura ilə idarə olunan və ekran oxuyucusu üçün düzgün semantikalı olmalıdır.
- **FR-014**: Hər yeni layout üçün legacy-HTML qoruyucusu olmalıdır: saytda və admin paneldə eyni fikstür, gözlənilən bloklar siyahısı və admin roundtrip testi (CLAUDE.md qaydası).
- **FR-015**: Redaktor təlimatları — `dokumentasiyalar/istehlakci-huquqlari-guide.md` (bölmənin admin paneldən idarəsi, `dokumentasiyalar/README.md`-də sətir) və `web-cbar-new/docs/consumer-rights-cms-guide.md` (işarələmə qaydası) —, kök CLAUDE.md, `business_logic/new_business_logic.md` və menyu dəyişikliyindən təsirlənən CMS təlimatları eyni dəyişiklikdə yenilənməlidir.
- **FR-016**: Gizli hub kadrı (`2615:15218`) və onun altı səhifəsinin birləşdirilməsi bu spec-in əhatəsindən kənardadır.

### Key Entities *(include if feature involves data)*

- **Bölmə səhifəsi (CMS page)**: id, başlıq, slug, ana səhifə, az/en məzmun, fayllar, "Sol menyuda göstər" bayrağı (`page_details`).
- **Arxiv elementi**: il → ay → fayl linki (redaktor işarələməsindən çıxarılır); "son məlumat" ən yeni il/ay elementidir.
- **Statistika cədvəli**: kanal → il → ay sətirləri (Yanvar…Dekabr, "Yekun") × sektor sütunları (Kredit təşkilatları, Ödəniş sistemləri, Valyuta mübadiləsi məntəqələri, Sığortaçılar, Kapital bazarı, Digər, Cəmi). Bu forma dörd kanalda eynidir (Yazılı, Vətəndaş qəbulu, Daxil olan zənglər, WhatsApp). Səyyar qəbul cədvəli çevrilmişdir: şəhər/rayon sətirləri × ay sütunları, "Cəmi" sətri; icmala daxil deyil.
- **İcmal kartı**: kanal adı, ay cəmi, altı sektor sətri — cədvəldən hesablanır, saxlanmır. Dörd kart da eyni formadadır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Beş Figma səhifəsinin hər biri üç endə (1728, 744, 390) açılır və ölçülər `contracts/ui-contract.md`-dəki dəyərlərdən 2 px-dən çox fərqlənmir; heç bir endə səhifə səviyyəsində üfüqi sürüşmə yoxdur.
- **SC-002**: Köhnə məzmundakı bütün fayl linkləri (link sayı: 93: 65, 95: 32, 96: 45, 101: hamısı) yeni görünüşdə əlçatandır — itən link sayı 0.
- **SC-003**: Ziyarətçi şikayət indeksinin ən son faylını səhifə açıldıqdan sonra bir kliklə açır.
- **SC-004**: İcmal kartlarının rəqəmləri cədvəlin son doldurulmuş ay sətri ilə 100% eynidir.
- **SC-005**: Köhnə ünvanların (88, 93, 96; 86 öz ünvanında açılır) hamısı bir yönləndirmə ilə doğru səhifəyə çatır.
- **SC-006**: Redaktor yeni ay əlavə etdikdə son məlumat kartı və icmal kod dəyişikliyi olmadan yenilənir.
- **SC-007**: Hər iki frontendin `npm run verify`-ı keçir; admin roundtrip testləri yeni fikstürləri bayt-bayt saxlayır.

## Assumptions

- Test mühitindəki məzmun (2026-11-17) produksiyadakı ilə eyni quruluşdadır; plan mərhələsində dump ilə tutuşdurulur.
- Fayl kartında fayl tipi (PDF) linkin media məlumatından götürülür; tip bilinməzsə ümumi fayl ikonası göstərilir.
- 86-nın köçürülməsi `pages` cədvəlində sətir dəyişikliyidir (parent), sütun dəyişikliyi yoxdur; paylaşılan mühitdə buna icazə var (ALTER TABLE yoxdur).
- Metodologiya mətninin en tərcüməsi qaralamadır (spec 045/046 kimi), redaktor sonra düzəldir.
- Footer-dəki "Onlayn müraciət" / "Sorğu platforması" düymələri və "Əlaqə" bloku saytın ümumi footer-idir, bu spec-də dəyişmir.
- "Mərkəzi Banka müraciət imkanları" hub-ı ayrıca spec-də həll olunanadək 89–92, 98, 99 səhifələri ünvanla əlçatan, sol menyuda gizlidir.
