# Feature Specification: Ağır blokların ekrana gələndə yüklənməsi və scroll reveal effekti

**Feature Branch**: `049-scroll-reveal-lazy-widgets`

**Created**: 2026-11-16

**Status**: Draft

**Input**: "Next.js-də səhifələri aşağıdan yuxarı qaldıranda (scroll edəndə) observer kimi yüklənmələr olsun və scroll reveal effekti
istəyirəm." Qərarlar (2026-11-16): (1) "observer kimi yüklənmə" ağır widget-lərin (qrafiklər, qalereyalar, video və s.) yalnız ekrana
yaxınlaşanda yüklənməsi deməkdir — infinite scroll və skeleton-dan sonra açılan məzmun bu spec-ə daxil deyil; (2) reveal effekti bütün
saytda vahiddir — bir ümumi primitiv, section-shell blokları, kartlar və ana səhifə blokları ona keçir; (3) effekt: fade + yüngül yuxarı
sürüşmə, kart qruplarında kiçik ardıcıllıq (stagger), `prefers-reduced-motion`-da animasiyasız.

**Əhatə**: yalnız `web-cbar-new` (public sayt). API, admin panel, sxem və seed dəyişmir. Köhnə saytda (`product-host`) qarşılığı yoxdur —
bu yeni UX davranışıdır, heç bir Yii2 controller/view-u əvəz etmir və heç bir URL, feed və ya funksiya ləğv edilmir.

**Hazırkı vəziyyət** (kod, 2026-11-16):

- Qrafiklər (`widgets/chart-card/chart.tsx`) ECharts-ı artıq dinamik import edir, amma **komponent mount olan kimi** — qrafik ekranın
  çox aşağısında olsa da, ana səhifənin statistika panellərində, `/statistics` və `/azir` səhifələrində bütün qrafiklər səhifə açılan kimi
  yüklənir və çəkilir. Yüklənmə müddətində sabit hündürlüklü skeleton göstərilir.
- Video (`widgets/video-player`) artıq facade-dir: klikə qədər YouTube-dan yalnız örtük şəkli yüklənir. Canlı yayım dialoqu da yalnız
  açılanda iframe yaradır.
- Foto qalereya (`widgets/photo-gallery`) client komponentdir, şəkilləri `SiteImage` (`next/image`) ilə göstərir; CMS HTML-dəki
  şəkillər `cms-html.ts`-də `loading="lazy"` alır.
- `IntersectionObserver` hazırda yalnız tarix stepper-ində (`about-blocks/history-stepper.tsx`) avtomatik oynatmanı idarə etmək üçün
  işlənir. Saytda scroll reveal effekti yoxdur.
- `prefers-reduced-motion` artıq hero slayderdə, nav çubuğunda, skeleton və şəkil keçidlərində nəzərə alınır.
- CSP nonce ilədir: `script-src` yalnız `'self'` + nonce, `style-src` `'unsafe-inline'`-ı saxlayır.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ağır bloklar yalnız ziyarətçi onlara yaxınlaşanda yüklənir (Priority: P1)

Ziyarətçi qrafikləri olan səhifəni (ana səhifə, statistika, AZIR) açır. Birinci ekrandakı məzmun dərhal görünür; ekranın aşağısındakı
qrafiklər o yerə scroll edilənə qədər yüklənmir və çəkilmir. Ziyarətçi aşağı düşdükcə qrafik görünən sahəyə çatmazdan bir az əvvəl
yüklənməyə başlayır, ona görə çox vaxt artıq hazır görünür. Qrafiğin yeri əvvəlcədən ayrılıb, səhifə tullanmır.

**Why this priority**: Əsas qazanc buradadır: ilk açılışda daha az iş, zəif cihaz və şəbəkədə səhifə daha tez istifadəyə yararlı olur.

**Independent Test**: Statistika səhifəsini açıb heç scroll etmədən şəbəkə və performans panelinə baxmaq: aşağıdakı qrafiklərin kodu və
çəkilişi yoxdur; scroll edəndə qrafiklər bir-bir yüklənir, səhifənin hündürlüyü dəyişmir.

**Acceptance Scenarios**:

1. **Given** səhifədə birinci ekrandan aşağıda qrafik var, **When** səhifə açılır və ziyarətçi scroll etmir, **Then** həmin qrafik yüklənmir, yerində eyni ölçülü placeholder durur.
2. **Given** ziyarətçi aşağı scroll edir, **When** qrafik görünən sahəyə yaxınlaşır (ondan əvvəlki önyükləmə məsafəsində), **Then** qrafik yüklənib çəkilir və placeholder-in yerini eyni ölçüdə tutur.
3. **Given** qrafik birinci ekrandadır, **When** səhifə açılır, **Then** o, indiki kimi dərhal yüklənir.
4. **Given** qrafik bir dəfə yüklənib, **When** ziyarətçi yuxarı qalxıb yenidən aşağı düşür, **Then** qrafik təkrar yüklənmir və çəkilişi itmir.
5. **Given** brauzer görünürlük izləməsini dəstəkləmir, **When** səhifə açılır, **Then** bütün ağır bloklar indiki kimi dərhal yüklənir.
6. **Given** ziyarətçi tab-larda (məs. ana səhifənin statistika tab-ları) gizli paneldəki qrafiyə keçir, **When** panel açılır və görünür, **Then** qrafik yüklənir.

---

### User Story 2 - Məzmun blokları scroll edəndə yumşaq görünür (Priority: P2)

Ziyarətçi istənilən səhifədə aşağı scroll edir. Görünən sahəyə daxil olan bloklar (bölmələr, kartlar, ana səhifə blokları) qısa fade və
yüngül yuxarı sürüşmə ilə görünür; kart qruplarında kartlar bir-birinin ardınca kiçik fasilə ilə gəlir. Hər blok yalnız bir dəfə
animasiya olunur.

**Why this priority**: Vizual keyfiyyət; dəyərlidir, amma US1-in performans qazancından asılı deyil və ondan az kritikdir.

**Independent Test**: Ana səhifəni və bir section-shell səhifəsini (məs. "Haqqımızda") açıb aşağı scroll etmək: birinci ekran dərhal və
animasiyasız görünür, aşağıdakı bloklar daxil olanda bir dəfə görünür, yuxarı qalxıb enəndə təkrarlanmır.

**Acceptance Scenarios**:

1. **Given** səhifə açılır, **When** birinci ekrandakı məzmun göstərilir, **Then** o, animasiyasız, dərhal görünür.
2. **Given** blok birinci ekrandan aşağıdadır, **When** ziyarətçi scroll edib blok görünən sahəyə daxil olur, **Then** blok təxminən yarım saniyəyə fade + yüngül yuxarı sürüşmə ilə görünür.
3. **Given** bir sırada bir neçə kart var, **When** sıra görünən sahəyə daxil olur, **Then** kartlar kiçik ardıcıl fasilə ilə görünür və bütün sıra 1 saniyədən tez tam görünür.
4. **Given** blok artıq görünüb, **When** ziyarətçi yuxarı qalxıb yenidən enir, **Then** blok yenidən gizlənmir və animasiya təkrarlanmır.
5. **Given** ziyarətçi sistemdə "hərəkəti azalt" seçimini aktiv edib, **When** scroll edir, **Then** bütün bloklar animasiyasız, dərhal görünür.
6. **Given** ziyarətçi səhifənin ortasındakı lövbərə (`#…`) keçid edir və ya geri düyməsi ilə scroll mövqeyinə qayıdır, **When** səhifə həmin mövqedə açılır, **Then** görünən sahədəki məzmun gizli qalmır.

---

### User Story 3 - JS-siz, axtarış sistemi və çap üçün məzmun tam qalır (Priority: P1)

JavaScript-i söndürülmüş ziyarətçi, axtarış robotu və ya səhifəni çap edən istifadəçi bütün mətni, başlıqları və şəkilləri görür; heç bir
blok reveal gözləyərək gizli və ya şəffaf qalmır. Server-in göndərdiyi HTML-də mətn məzmunu indiki kimi tamdır.

**Why this priority**: Bu effekt məzmunun əlçatanlığını pozarsa, effekt zərərlidir; ona görə US1 ilə eyni prioritetdədir.

**Independent Test**: JS-i söndürüb bir neçə səhifəni açmaq və çap önizləməsinə baxmaq: hər şey görünür. Server HTML-ində başlıq və mətnlər
var, `opacity:0` ilə gizlənmiş blok yoxdur.

**Acceptance Scenarios**:

1. **Given** JS söndürülüb, **When** istənilən səhifə açılır, **Then** bütün bloklar görünür, heç biri gizli deyil.
2. **Given** JS söndürülüb və səhifədə qrafik var, **When** səhifə açılır, **Then** qrafik yerində indiki kimi placeholder görünür, ətrafındakı mətn tamdır.
3. **Given** ziyarətçi səhifəni çap edir, **When** çap önizləməsi açılır, **Then** hələ scroll edilməmiş bloklar da görünür.
4. **Given** skrinrider istifadəçisi, **When** səhifədə klaviatura ilə naviqasiya edir, **Then** reveal gözləyən bloklar da oxunur və fokuslana bilir.

---

### Edge Cases

- Səhifə çox qısadır və bütün məzmun birinci ekrana sığır: heç nə animasiya olunmur, heç nə gecikmir.
- Ziyarətçi çox sürətlə (məs. End düyməsi ilə) səhifənin sonuna düşür: keçilən bloklar sonradan gizli qalmır; yalnız görünən sahədəkilər animasiya olunur və ya dərhal görünür.
- Səhifə müştəri tərəfli naviqasiya ilə dəyişir (Next keçidi): yeni səhifənin birinci ekranı animasiyasız görünür, əvvəlki səhifənin vəziyyəti yeni səhifəyə keçmir.
- Qrafik yüklənməsi uğursuz olur (şəbəkə xətası): indiki xəta davranışı qalır, placeholder sonsuz fırlanmır.
- Ekran ölçüsü dəyişir (fırlatma, pəncərə ölçüsü) və ya tab paneli dəyişir: hələ yüklənməmiş qrafik görünən sahəyə daxil olanda yüklənir.
- Hündür blok (görünən sahədən hündür) yalnız kiçik hissəsi ilə daxil olur: reveal yenə də başlayır, blok yarım-görünür vəziyyətdə ilişib qalmır.
- Daxili scroll konteynerləri (dialoq, cədvəlin üfüqi scroll-u, hamburger paneli): reveal və lazy yükləmə onların içinə tətbiq olunmur.
- Fokus və ya lövbər gizli bloka düşür: blok dərhal görünür.

## Requirements *(mandatory)*

### Functional Requirements

**Ağır blokların ekrana gələndə yüklənməsi**

- **FR-001**: Sayt ağır interaktiv blokların (qrafiklər və eyni xüsusiyyətli digər bloklar) kodunu və çəkilişini yalnız blok görünən sahəyə önyükləmə məsafəsi qədər yaxınlaşanda başlatmalıdır.
- **FR-002**: Önyükləmə məsafəsi blokun adi scroll zamanı görünməzdən əvvəl hazır olmasına yetəcək qədər olmalıdır (ilkin dəyər: görünən sahənin altında təxminən bir ekran hündürlüyü); dəyər ortaq sabitdə saxlanılır.
- **FR-003**: Yüklənməmiş ağır blokun yerində yekun blokla eyni ölçülü placeholder olmalıdır; yüklənmə zamanı səhifənin düzülüşü yerindən oynamamalıdır.
- **FR-004**: Bir dəfə yüklənmiş blok yuxarı-aşağı scroll ilə yenidən yüklənməməli, boşaldılmamalıdır.
- **FR-005**: Görünürlük izləməsini dəstəkləməyən mühitdə (köhnə brauzer, testlər) ağır bloklar dərhal yüklənməlidir.
- **FR-006**: Bloku əhatə edən başlıq, izahat, cədvəl və digər mətn məzmunu server HTML-ində indiki kimi dərhal gəlməlidir; yalnız ağır interaktiv hissə gecikdirilir.
- **FR-007**: Artıq tələb üzrə yüklənən bloklar (video facade, canlı yayım dialoqu) olduğu kimi qalır; spec onları dəyişmir. Şəkillərin brauzer səviyyəli lazy yüklənməsi də olduğu kimi qalır.

**Scroll reveal**

- **FR-008**: Saytda bir ortaq reveal primitivi olmalıdır; bütün reveal effektləri ondan istifadə edir, hər səhifə öz animasiyasını yazmır.
- **FR-009**: Reveal aşağıdakılara tətbiq olunmalıdır: section-shell şablonunun məzmun blokları, kart siyahıları və şəbəkələri (xəbər, tədbir, KSM, maliyyə təşkilatları və s.), ana səhifənin hero-dan aşağıdakı blokları. Header, nav, footer, breadcrumb, hero slayder və dialoqlar reveal olunmur.
- **FR-010**: Effekt: şəffaflıq 0→1 və təxminən 16 px aşağıdan yerinə sürüşmə, müddəti 400–500 ms; dəqiq dəyərlər ortaq sabitlərdədir.
- **FR-011**: Kart qruplarında hər növbəti kart kiçik gecikmə ilə gəlir; qrupun ümumi gecikməsi məhdudlaşdırılır ki, uzun siyahının sonuncu kartı da 1 saniyədən gec başlamasın.
- **FR-012**: Hər element yalnız bir dəfə reveal olunur; görünən sahədən çıxanda yenidən gizlənmir.
- **FR-013**: Səhifə açılanda görünən sahədə olan məzmun animasiyasız, dərhal görünməlidir (lövbər və ya bərpa olunmuş scroll mövqeyi ilə açılan sahə daxil).
- **FR-014**: "Hərəkəti azalt" seçimi aktiv olanda heç bir reveal animasiyası oynanmamalı, bütün məzmun dərhal görünməlidir.
- **FR-015**: Gizli başlanğıc vəziyyəti yalnız JS işlək olanda tətbiq olunmalıdır; JS-siz, server HTML-ində, çapda və görünürlük izləməsi olmayan mühitdə məzmun həmişə görünür.
- **FR-016**: Reveal gözləyən məzmun əlçatanlıq ağacından çıxarılmamalı, fokus ala bilməli; fokus və ya lövbər gizli elementə düşəndə element dərhal görünməlidir.

**Ümumi**

- **FR-017**: Yeni davranış CSP-ni zəiflətməməlidir: yeni inline skript, `script-src`-ə əlavə mənbə və ya nonce istisnası olmamalıdır.
- **FR-018**: Bütün yeni rəqəmsal dəyərlər (önyükləmə məsafəsi, müddət, sürüşmə, stagger, limit) spec 032 sabitlər standartına uyğun ortaq və ya slice sabitlərində olmalıdır.
- **FR-019**: Hər iki davranış funksional testlərlə örtülməlidir (görünürlük izləməsi test mühitində idarə olunan stub-la): yükləmə görünəndə başlayır, dəstək olmayanda dərhal, reveal bir dəfə olur, hərəkəti azaltmada animasiya yoxdur, JS-siz vəziyyətdə məzmun görünür. `npm run verify` yaşıl qalmalıdır.
- **FR-020**: Hər iki dil (`/az`, `/en`) və bütün enlər (390 / 744 / 1728 Figma çərçivələri) eyni davranır.

### Key Entities

- **Ağır blok**: kodu və çəkilişi baha olan interaktiv blok (hazırda qrafiklər). Atributları: yekun ölçü (placeholder üçün), yüklənib-yüklənmədiyi.
- **Reveal elementi / qrupu**: scroll ilə bir dəfə görünən məzmun bloku və ya kartlar qrupu. Atributları: vəziyyət (gözləyir / görünüb), qrup daxilində sırası (stagger üçün).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Qrafikli səhifələrdə (ana səhifə, `/statistics`, `/azir`) birinci ekrandan aşağıdakı qrafiklər scroll edilməyincə yüklənmir: açılışda yüklənən qrafik sayı birinci ekrandakı qrafik sayına bərabərdir.
- **SC-002**: Bu səhifələrdə mobil profildə (yavaşladılmış CPU və şəbəkə) səhifənin interaktiv olma müddəti və əsas axın bloklanma vaxtı indikindən pis deyil, qrafikli səhifələrdə nəzərəçarpacaq dərəcədə yaxşıdır (ölçülən baza: dəyişiklikdən əvvəlki Lighthouse ölçməsi).
- **SC-003**: Lazy yükləmə və reveal səbəbindən düzülüş sürüşməsi əlavə olunmur: CLS dəyişiklikdən əvvəlki səviyyədə və ya daha aşağıdır.
- **SC-004**: Adi sürətlə scroll edən ziyarətçi qrafiyə çatanda onu hazır görür (placeholder ən çox qısa müddət görünür) — yerli ölçmədə orta sürətli scroll-da placeholder görünən sahədə 300 ms-dən çox qalmır.
- **SC-005**: Reveal-li istənilən blok görünən sahəyə daxil olandan sonra 1 saniyədən tez tam görünür (stagger daxil).
- **SC-006**: JS söndürülmüş, "hərəkəti azalt" aktiv və çap rejimlərinin hər birində yoxlanan səhifələrin 100%-də bütün məzmun görünür.
- **SC-007**: Server HTML-indəki mətn məzmunu (başlıqlar, paraqraflar, keçidlər) dəyişiklikdən əvvəlki ilə eynidir — axtarış sistemi üçün itki yoxdur.

## Assumptions

- "Ağır blok" hazırda praktiki olaraq ECharts qrafikləridir (ana səhifə statistika panelləri, `/statistics`, `/azir`). Video və canlı yayım artıq klikə qədər yüklənmir; foto qalereya isə ilkin olaraq şəkilləri brauzerin lazy yükləməsi ilə alır — onun JS-ni gecikdirmək ölçmədə fayda göstərsə plan mərhələsində əlavə olunur, yoxsa olduğu kimi qalır.
- Struktur sxemi (`org-chart`) client JS işlətmir, ona görə lazy yükləmə ona aid deyil; reveal ona tətbiq oluna bilər.
- CMS HTML-in (`widgets/cms-content`) içindəki hər paraqraf ayrıca reveal olunmur; reveal blok səviyyəsindədir (bütün mətn bloku, section-shell-in bölmə blokları, kartlar).
- Infinite scroll, siyahıların avtomatik növbəti səhifəsi və skeleton-dan sonra açılan məzmun bu spec-in əhatəsi xaricindədir.
- Animasiya parametrləri (16 px, 400–500 ms, stagger) Figma-da animasiya təsviri olmadığı üçün sənaye standartı əsasında seçilib; dizayner fərqli dəyər verərsə yalnız sabitlər dəyişir.
- Yeni üçüncü tərəf animasiya kitabxanası əlavə olunmur; brauzerin standart imkanları kifayətdir.
- Yalnız `web-cbar-new` dəyişir, bir upstream MR; deploy sırasına təsiri yoxdur. `business_logic/new_business_logic.md` və `web-cbar-new/CLAUDE.md` eyni dəyişiklikdə qısa qeydlə yenilənir.
