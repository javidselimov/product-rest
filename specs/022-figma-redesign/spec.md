# Feature Specification: Public saytın Figma dizaynına keçidi — ana səhifə, header, mega-menyu, mobil menyu, footer

**Feature Branch**: `022-figma-redesign`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "web-cbar-new public site redesign to match Figma "cbar website (Copy)" Main page — home page body, header with full-width mega-menu, tablet/mobile menu and footer, pixel-perfect (1320 container, DM Sans, 390/744/1728 breakpoints), dark mode removed."

**Mənbə dizayn**: Figma faylı "cbar website (Copy)", səhifə "Main page". Section `872:10036`:
Desktop `813:25078` (1728), Tablet `813:25077` (744), Mobile `839:7046` (390). Komponent
kitabxanası: frame `9:54` ("Components"). Node id-lərin tam siyahısı `plan.md`-dədir.

**Əhatə olunan proyektlər**:

- `web-cbar-new`: ana səhifə və bütün səhifələrin shell-i (header, mega-menyu, mobil/tablet menyu, footer).
- `api-cbar`, `api-cbar-admin`, `web-cbar-admin-new`: **dəyişmir**. Data mənbəyi olmayan yeni bloklar
  hələlik müvəqqəti statik məzmunla göstərilir. Onların backend-i ayrıca spec olacaq.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: bu feature aşağıdakıların görünüşünü əvəz edir.
Davranış və informasiya arxitekturası dəyişmir.

| Köhnə | Nə edir |
|---|---|
| `visitor/controllers/HomeController.php` `actionIndex`, `views/home/index.php`, `views/layouts/_news_slider.php`, `banners.php` | ana səhifə blokları |
| `views/layouts/header.php`, `views/layouts/menu/top.php`, `left.php`, `mobile.php` | header, menyu, mobil menyu |
| `views/layouts/footer.php`, `social.php` | footer |

**Hazırkı vəziyyət (koddan ölçülüb, 2026-10-12)**:

- Ana səhifə spec 002-nin köhnə layout-un 1:1 köçürməsidir. Kontent eni 1280px-dir, font
  yüklənmir (sistem fontu). Bloklar: xəbər slayderi, məzənnə, faiz dəhlizi, inflyasiya, pul bazarı,
  xəbər tabları (press/foto/video), promo banner, nəşrlər, faydalı linklər, 3 info-widget,
  gəlirlilik əyrisi, sürətli keçidlər.
- Mega-menyu CMS səhifə ağacından gəlir: 3 səviyyəli, kiçik açılan siyahılar, JS-siz (hover/focus).
- Saytda açıq/tünd tema seçimi var (`ui-theme` cookie).

## Clarifications

### Session 2026-10-12

- Q: Header və footer da dəyişirmi? → A: Bəli. Shell bütün səhifələr üçün Figma-ya uyğunlaşır.
- Q: Dəqiqlik səviyyəsi? → A: Pixel-perfect: kontent eni 1320, DM Sans, ölçülər 390 / 744 / 1728.
- Q: Tünd tema? → A: Ləğv edilir. Yalnız açıq tema qalır, tema seçimi silinir.
- Q: Mega-menyunun məzmunu? → A: CMS səhifə ağacından qalır, yalnız görünüş dəyişir.
- Q: Üst zolaq linkləri, E-CBAR, footer "Faydalı linklər"? → A: Sayt konfiqurasiyasında sabit siyahıdır.
  Header nav və footer "Naviqasiya" CMS ağacından gəlir.
- Q: Data mənbəyi olmayan bloklar (Strategiya və sənədlər, Təqvim, "Elanlar" tabı)? → A: Hələlik
  müvəqqəti statik məzmun. API-də elan endpoint-i yoxdur (yoxlanılıb).
- Q: Figma-da olmayan bloklar? → A: Nəşrlər, faydalı linklər, sürətli keçidlər və video tabı
  **ləğv edilmir**. UI-da göstərilmir, amma kodda saxlanılır. Gələcəkdə hansısa ana blokun içində
  tab kimi əlavə oluna bilər. Lazım olmasa sonra ayrıca qərarla tam silinir. Coin banner CMS-in
  promo banneridir (təsviri olan banner).
- Q: Rəng token-ləri üçün Maddə III.3 sapması (D-2)? → A: Təsdiqləndi (2026-10-12).
- Q: Tünd temanın ləğvi `@custom-variant dark` sətrinə toxunmadan? → A: Təsdiqləndi (2026-10-12).
- Q: Harada işlənir? → A: Ayrıca branch-də (`feature/022-figma-redesign`, GitLab konvensiyası),
  `test` branch-ində yox.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi ana səhifəni yeni dizaynda görür (Priority: P1)

Ziyarətçi cbar.az ana səhifəsini açır və Figma-dakı strukturu görür. Yuxarıda böyük xəbər
slayderi var, sağında məzənnə, inflyasiya və faiz dəhlizi kartları. Altında "İcmal göstəricilər"
bölməsi 5 tabla gəlir. Sonra "Media" bölməsi (Xəbərlər · Elanlar · Qalereya), promo banner,
"Strategiya və sənədlər" və "Təqvim".

**Why this priority**: Ana səhifə saytın əsas giriş nöqtəsidir və redizaynın əsas məqsədidir.

**Independent Test**: Ana səhifə 1728px enində açılır. Blokların sırası, ölçüləri, şriftləri
və rəngləri Figma frame `813:25078` ilə yanaşı müqayisə olunur. Bütün real data (məzənnə,
inflyasiya, faiz dəhlizi, göstəricilər, xəbərlər, qalereya) CMS və API-dən gəlir.

**Acceptance Scenarios**:

1. **Given** CMS-də 3 slayder xəbəri var, **When** ziyarətçi ana səhifəni açır, **Then** slayder
   başlığı, alt mətni, "Ətraflı" düyməsini və "1/3" sayğacını göstərir.
2. **Given** məzənnə, inflyasiya və faiz dəhlizi dataları var, **When** səhifə açılır, **Then**
   sağ sütunda 3 kart Figma-dakı kimi görünür (AZN: USD/EUR/RUB/TRY, tarix; inflyasiya: illik və
   hədəf; dəhliz: aşağı/yuxarı hədd və uçot dərəcəsi).
3. **Given** "İcmal göstəricilər" bölməsi, **When** ziyarətçi tab seçir (Monetar, Gəlirlilik
   əyrisi, Pul bazarı, Mərkəzi Bankın notları, Maliyyə sektoru), **Then** müvafiq göstəricilər
   göstərilir və "Daha ətraflı" uyğun bölməyə aparır.
4. **Given** "Media" bölməsi, **When** "Xəbərlər" tabı açıqdır, **Then** son 4 press-reliz tarix
   və başlıqla kart şəklində görünür, "Bütün xəbərlər" siyahıya aparır.
5. **Given** blokların biri üçün API xəta qaytarır, **When** səhifə açılır, **Then** yalnız həmin
   blokda xəta vəziyyəti görünür, qalan bloklar normal göstərilir (spec 002 FR-021 qorunur).

---

### User Story 2 — Ziyarətçi yeni header və mega-menyu ilə naviqasiya edir (Priority: P1)

Hər səhifənin yuxarısında Figma-dakı header görünür. Üst zolaqda logo, Karyera · Media · Əlaqə,
axtarış, dil dəyişdiricisi, çağrı mərkəzi və E-CBAR düyməsi var. Altında əsas naviqasiya gəlir.
Nav bəndinin üzərinə gələndə və ya fokuslananda tam enli panel açılır: bölmə başlığı, xətt və
sütunlar (sütun başlığı və altında linklər).

**Why this priority**: Header bütün səhifələrdə görünür. Saytda naviqasiyanın əsas vasitəsidir.

**Independent Test**: İstənilən səhifədə nav bəndinin üzərinə gəlinir və ya Tab ilə fokuslanır.
Açılan panel Figma `1083:26783` ilə müqayisə olunur. JavaScript söndürüləndə də keçidlər işləyir.

**Acceptance Scenarios**:

1. **Given** CMS ağacında 2-ci və 3-cü səviyyəli səhifələr var, **When** ziyarətçi nav bəndinin
   üzərinə gəlir, **Then** panel 2-ci səviyyəni sütun başlığı, 3-cü səviyyəni onun altındakı
   linklər kimi göstərir.
2. **Given** klaviatura istifadəçisi, **When** Tab ilə nav bəndinə və onun linklərinə keçir,
   **Then** panel açıq qalır və fokus görünür.
3. **Given** ziyarətçi panelin linkinə klikləyir, **When** səhifə dəyişir, **Then** panel bağlanır.

---

### User Story 3 — Ziyarətçi yeni footer-i görür (Priority: P2)

Hər səhifənin altında Figma footer-i görünür: teal xətt, tünd göy fon, "Əlaqə" sütunu (ünvan,
telefonlar, "Onlayn müraciət", "Sorğu platforması"), "Naviqasiya", "Bizimlə əlaqə" kartı,
"Faydalı linklər" və alt zolaq (məxfilik siyasəti, saytın xəritəsi, ©).

**Why this priority**: Bütün səhifələrdə görünür, amma naviqasiyadan az kritikdir.

**Independent Test**: İstənilən səhifənin footer-i Figma `813:24811` ilə müqayisə olunur, bütün
linklər işləyir.

**Acceptance Scenarios**:

1. **Given** istənilən səhifə, **When** ziyarətçi aşağı sürüşdürür, **Then** footer Figma-dakı
   sütunları və əlaqə məlumatlarını göstərir, telefonlar `tel:` linkidir.

---

### User Story 4 — Ziyarətçi saytı planşet və mobil cihazda istifadə edir (Priority: P2)

Planşetdə (744) və mobildə (390) header yığcam menyuya çevrilir, açılan menyu Figma-dakı
"opened" vəziyyəti kimi görünür. Ana səhifə blokları və footer Figma-nın tablet və mobil
frame-lərinə uyğun düzülür.

**Why this priority**: Ziyarətçilərin əhəmiyyətli hissəsi mobil cihazdan gəlir, amma desktop
dizaynı əsasdır və əvvəl tamamlanır.

**Independent Test**: Səhifə 744 və 390 enində açılır və Figma `813:25077` / `839:7046` ilə
müqayisə olunur. Menyu açılıb-bağlanır, üfüqi sürüşmə yoxdur.

**Acceptance Scenarios**:

1. **Given** 390px ekran, **When** ziyarətçi menyu düyməsini basır, **Then** menyu Figma-dakı
   kimi açılır, bütün CMS bölmələri əlçatandır.
2. **Given** 744px və 390px ekran, **When** ana səhifə açılır, **Then** heç bir blok ekrandan
   kənara çıxmır və üfüqi sürüşmə yaranmır.

---

### User Story 5 — Müvəqqəti statik bloklar aydın işarələnir (Priority: P3)

"Strategiya və sənədlər", "Təqvim" və "Elanlar" tabı Figma-dakı görünüşdə, müvəqqəti sabit
məzmunla göstərilir. Backend hazır olanda redaktor onları CMS-dən idarə edəcək.

**Why this priority**: Dizaynı tamamlayır, amma hələ real data yoxdur.

**Independent Test**: Bloklar göstərilir və linkləri mövcud səhifələrə aparır. Kodda müvəqqəti
məzmun bir yerdə toplanıb və backend gələndə əvəz olunmaq üçün işarələnib.

**Acceptance Scenarios**:

1. **Given** ana səhifə, **When** ziyarətçi "Təqvim"ə baxır, **Then** tədbirlər gün, ay, teq,
   başlıq və saatla Figma-dakı kimi görünür.

---

### Edge Cases

- Slayderdə 1 xəbər varsa sayğac "1/1" göstərir və ya gizlənir, keçid düymələri görünmür.
- Slayderdə xəbər yoxdursa birinci ekranda sol hissə boş qalmır, sağ sütun kartları tam enə yayılır.
- CMS-də promo banner yoxdursa coin banner yeri boş qalmır, blok render olunmur.
- Mega-menyuda 4-dən çox sütun (2-ci səviyyə bənd) varsa sütunlar növbəti sətirə keçir, panel
  ekrandan kənara çıxmır.
- 3-cü səviyyəsi olmayan 2-ci səviyyə bəndi panelda link kimi sütun başlığı olur.
- İngilis dilində (`/en`) uzun mətnlər kartları sındırmır. Bir dildə boş olan məzmun gizlədilir.
- Əvvəllər `ui-theme=dark` cookie-si olan ziyarətçi saytı açıq temada görür.
- Brauzer DM Sans-ı yükləyə bilmirsə yaxın sistem fontu göstərilir və layout sınmır.

## Requirements *(mandatory)*

### Functional Requirements

**Ümumi vizual sistem**

- **FR-001**: Sayt Figma-dakı tipoqrafiyanı (DM Sans 400/500/600/700/800), rəngləri, boşluqları
  və kölgələri istifadə ETMƏLİDİR. Kontent eni desktopda 1320px-dir.
- **FR-002**: Figma rəngləri bir mərkəzi yerdə semantik adlarla təyin OLUNMALIDIR. Komponentlər
  rəngə yalnız bu adlarla müraciət edir (Konstitusiya web-cbar-new Maddə III.3).
- **FR-003**: Layout üç əsas ölçüdə Figma-ya uyğun OLMALIDIR (390, 744, 1728). Aralıq enlərdə
  üfüqi sürüşmə olmamalıdır.
- **FR-004**: Tünd tema və tema seçimi ləğv EDİLİR. Köhnə tema cookie-si nəzərə alınmır.

**Header və naviqasiya**

- **FR-005**: Header-in üst zolağı logo, Karyera · Media · Əlaqə linkləri, axtarış, dil
  dəyişdiricisi, çağrı mərkəzi və E-CBAR düyməsini göstərməlidir. Üst zolaq linkləri və E-CBAR
  ünvanı sayt konfiqurasiyasından gəlir.
- **FR-006**: Əsas nav və mega-menyu məzmunu CMS səhifə ağacından gəlməlidir. Panel tam enlidir:
  bölmə başlığı, ayırıcı xətt, 2-ci səviyyə sütun başlığı, 3-cü səviyyə linklər.
- **FR-007**: Mega-menyu JavaScript olmadan hover və klaviatura fokusu ilə açılmalı, keçiddən
  sonra bağlanmalıdır (spec 002 FR-006/FR-010 davranışı qorunur).
- **FR-008**: Planşet və mobildə header Figma-dakı yığcam menyuya, açılan menyu "opened"
  vəziyyətinə uyğun olmalıdır.

**Footer**

- **FR-009**: Footer Figma-dakı 4 sütunu və alt zolağı göstərməlidir. "Naviqasiya" CMS ağacından,
  əlaqə məlumatları və "Faydalı linklər" sayt konfiqurasiyasından gəlir.

**Ana səhifə**

- **FR-010**: Birinci ekranda xəbər slayderi və sağda AZN məzənnəsi, İnflyasiya, Faiz dəhlizi
  kartları göstərilməlidir. Data mövcud mənbələrdən gəlir.
- **FR-011**: "İcmal göstəricilər" 5 tabla göstərilməlidir: Monetar, Gəlirlilik əyrisi, Pul
  bazarı, Mərkəzi Bankın notları, Maliyyə sektoru. Data mövcud info-line, gəlirlilik əyrisi və
  AZIR mənbələrindən gəlir.
- **FR-012**: "Media" bölməsi 3 tab göstərməlidir: Xəbərlər (press-relizlər), Elanlar (müvəqqəti
  statik), Qalereya. "Bütün xəbərlər" linki də olmalıdır.
- **FR-013**: Coin banner yerində CMS-in promo banneri göstərilməlidir. Banner yoxdursa blok gizlənir.
- **FR-014**: "Strategiya və sənədlər" və "Təqvim" müvəqqəti statik məzmunla göstərilməlidir. Bu
  məzmun kodda bir yerdə toplanır və backend gələndə əvəz olunmaq üçün işarələnir.
- **FR-015**: Nəşrlər, faydalı linklər, sürətli keçidlər və video tabı ana səhifədə
  **göstərilmir, amma ləğv edilmir** (Konstitusiya Maddə I.3). Komponentləri, data funksiyaları
  və testləri kodda saxlanılır. Ana səhifədə onların görünməsi bir yerdən söndürülür. Gizli
  bloklar üçün sorğu göndərilmir. Sonradan onları tab kimi qaytarmaq üçün yalnız bu yerdə
  dəyişiklik lazım olur. Həmin məzmun öz səhifələrində əlçatan qalır.
- **FR-016**: Bir blokun xətası digərlərini bloklamamalıdır (spec 002 FR-021 qorunur).
- **FR-017**: Bütün yeni mətn etiketləri az və en dillərində olmalıdır. Redaksiya məzmunu
  CMS/API-dən gəlir.

### Key Entities

- **Statik blok məzmunu (müvəqqəti)**: strategiya sənədi (üz qabığı, başlıq, qısa mətn, link),
  təqvim tədbiri (tarix, teq, başlıq, saat), elan (tarix, başlıq, link). Hamısı az/en.
- **Sayt konfiqurasiyası linkləri**: üst zolaq linkləri, E-CBAR, faydalı linklər, əlaqə məlumatları.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 1728, 744 və 390 enlərində ana səhifə, header, açıq mega-menyu və footer-in
  ekran görüntüləri Figma ilə yanaşı müqayisədə blok sırası, ölçü və rəng baxımından uyğundur.
  Hər fərq sənədləşdirilib və təsdiqlənib.
- **SC-002**: 320–1920px aralığında heç bir səhifədə üfüqi sürüşmə yoxdur.
- **SC-003**: Mega-menyunun bütün linklərinə yalnız klaviatura ilə çatmaq olur. JavaScript
  söndürüləndə naviqasiya işləyir.
- **SC-004**: Ana səhifə əvvəlkindən artıq API sorğusu göndərmir. Gizli blokların sorğuları
  göndərilmir, onların komponentləri və testləri isə yerində qalır.
- **SC-005**: Sayt səviyyəsində tünd tema izi qalmır: tema düyməsi və tema cookie-si yoxdur.
- **SC-006**: Frontend gate (`verify`) yaşıldır, mövcud test əhatəsi azalmır.

## Assumptions

- Figma "cbar website (Copy)" faylı yekun dizayndır. Rəng və ölçü dəyərləri oradan götürülür.
  Figma-da rəng dəyişənləri (variables) yoxdur, rənglər node-lardan toplanır.
- Figma-da `OLD` adlı variantlar nəzərə alınmır.
- DM Sans sayt tərəfindən öz serverindən verilir. Kənar font servisinə sorğu getmir, CSP dəyişmir.
- Konstitusiya Maddə III.4-ün toxunulmaz bloku (`@custom-variant dark` daxil) dəyişmir. Tünd
  temanın ləğvi tema seçiminin və cookie-nin silinməsi ilə edilir.
- Figma rəngləri mərkəzi token faylında hex dəyərlər kimi təyin olunur. Bu, Maddə III.3 üzrə
  sapma **D-2**-dir və istifadəçi tərəfindən **təsdiqlənib** (2026-10-12). Fayl kitin `tokens.css`-i
  kimi token mənbəyi sayılır. Komponentlərdə hex yenə də qadağandır. Sapma plan.md-də qeyd olunur.
- İş `feature/022-figma-redesign` branch-ində aparılır. Mərhələlər ayrıca commit-lərdir.
- "Elanlar", "Strategiya və sənədlər" və "Təqvim" üçün backend ayrıca spec-də yazılacaq.
- About us və Media Figma səhifələri bu feature-a daxil deyil.
