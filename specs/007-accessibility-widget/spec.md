# Feature Specification: Müyəssərlik menyusu (ictimai saytda widget + admindən aktiv/deaktiv)

**Feature Branch**: `007-accessibility-widget`

**Created**: 2026-09-29

**Status**: Implemented — test mühitində yoxlama (T009, T010, T034, T036, T037) gözləyir

**Input**: User description: "https://accessibility.cert.gov.az/ bu saytin dokumentasiyasini oxu men onu web-cbar-new burada tetbiq etmek isteyirem bu menyunu web-cbar-admin-new buradan aktivleshdirmek ve deaktivleshdirmek funksionalliqi da elave etmek isteyirem"

**Əhatə olunan proyektlər**: `api-cbar-admin` (dəyişiklik gözlənilmir, mövcud `settings` API-si istifadə olunur), `api-cbar` (yeni, dar public oxuma endpoint-i), `web-cbar-admin-new`, `web-cbar-new`.

**Deploy sırası (Maddə II.3, IV.2)**: `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`. Ayar yoxdursa, widget söndürülmüş sayılır, ona görə sıra pozulsa da sayt sınmır.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: `product-host`-da müyəssərlik menyusu **yoxdur** (`visitor/views`, `visitor/widgets`, `layouts` yoxlanılıb). Bu, heç bir Yii2 controller-i əvəz etməyən **yeni funksiyadır**. Paritet cədvəlinə "yeni" kimi düşür.

**Mənbə sənəd (ölçülüb, 2026-09-29)**: https://accessibility.cert.gov.az/

- **Qoşulma**: `</body>`-dan əvvəl bir `<script src="https://accessibility.cert.gov.az/acc-widget.min.js" defer>` teqi qoyulur. Sənəd bunu "sürətli quraşdırma və avtomatik yeniləmə" kimi təqdim edir.
- **Konfiqurasiya `<html>` atributları ilə**:
  - `lang`: `az` / `en` / `ru` / `tr`;
  - `data-accw-position`: `bottom-left` / `bottom-right` / `top-left` / `top-right`;
  - `data-accw-offsett`: `none` və ya `x,y`. Sənəddə belə yazılıb, amma skript əslində `data-accw-offset` oxuyur (research R2);
  - `data-accw-size`: `sm` / `md` / `lg`.
- **Menyunun imkanları** (skriptin mətnlərindən çıxarılıb):
  - şrift ölçüsü, qalınlığı, sətir hündürlüyü və hərf aralığı;
  - oxunaqlı şrift və disleksiya şrifti (OpenDyslexic);
  - tünd, açıq və yüksək kontrast; aşağı və yüksək doyma (saturation);
  - linkləri vurğulama, böyük kursor, oxuma bələdçisi, animasiyaları dayandırma;
  - parametrləri sıfırlama.
- **Davranış**: ziyarətçinin seçimləri **cookie**-də saxlanılır. İkon və digər resurslar `accessibility.cert.gov.az`-dan yüklənir. API açarı, qeydiyyat və lisenziya şərti göstərilməyib.
- **Hüquqi kontekst**: sənəd Nazirlər Kabinetinin qərarına (e-qanun.az/framework/24256, bölmə 11) istinad edir: dövlət saytları WCAG 2.1-ə uyğun olmalıdır. Widget bu tələbin **bir hissəsidir**, saytın öz müyəssərliyini əvəz etmir.

**Hazırkı vəziyyət (ölçülüb)**:

- **Baza**: `settings` cədvəli (`key` PK, `value jsonb`, `updated_by`, `updated_at`), `0001-initial-schema.sql:743`. `cbar_web_ro` rolu `0001`-də bütün cədvəllərə SELECT alır, bu cədvəl də daxildir.
- **Admin API**: `SettingsController` (`GET/PUT api/v1/settings/{key}`). Yazma `AuditService` ilə `audit_log`-a düşür.
- **Admin panel**: `features/settings` (sidebar-da `/settings`) açar/JSON dialoqu ilə ümumi ayar redaktorudur. Xüsusi keçid (switch) yoxdur.
- **Public API**: `api-cbar`-da ayar oxuyan endpoint yoxdur.
- **Public sayt**:
  - `security-headers.ts` CSP qoyur: `script-src 'self' 'nonce-…' 'strict-dynamic'`, `connect-src 'self'`, `font-src 'self'`, `img-src … https:`. Xarici skript hazırda bloklanır;
  - `<html>`-də `lang` və tünd tema class-ı var (`app/layout.tsx:37`).

## Clarifications

### Session 2026-09-29

- Q1 (admin nəyi idarə edir): **Yalnız aktiv/deaktiv keçidi.** Yer (sol aşağı) və ölçü (orta) sabitdir. Görünüş parametrləri üçün user story ləğv olunub.
- Q2 (skriptin mənbəyi): **Yoxlanılmış surət saytın öz serverindən verilir.** Rəsmi hostdan birbaşa yüklənmir. Skriptin istinad etdiyi resurslar (ikon və s.) da öz serverdən verilir. Yeniləmə əl ilə, yoxlamadan sonra edilir.

## User Scenarios & Testing *(mandatory)*

### User Story 1: Ziyarətçi müyəssərlik menyusundan istifadə edir (Priority: P1)

Görmə və ya oxuma çətinliyi olan ziyarətçi saytın istənilən səhifəsində künc ikonunu görür. Menyunu açıb şrifti böyüdür, kontrastı dəyişir və ya animasiyaları dayandırır. Seçimləri başqa səhifəyə keçəndə və sonrakı ziyarətdə də qalır.

**Why this priority**: Feature-in əsas dəyəridir və qanunvericiliyin tələb etdiyi imkanları verir. Admin keçidi olmadan da (həmişə aktiv rejimdə) təkbaşına dəyər verir.

**Independent Test**: Ayar aktiv olanda istənilən səhifəni hər iki dildə açıb menyunun göründüyünü, dilinin səhifənin dilinə uyğun olduğunu və seçimin naviqasiyadan sonra qaldığını yoxlamaq.

**Acceptance Scenarios**:

1. **Given** menyu aktivdir, **When** ziyarətçi `/az/...` səhifəsini açır, **Then** menyu ikonu razılaşdırılmış küncdə görünür və menyu Azərbaycan dilindədir.
2. **Given** menyu aktivdir, **When** ziyarətçi `/en/...` səhifəsini açır, **Then** menyu ingilis dilindədir.
3. **Given** ziyarətçi şrifti böyüdüb, **When** eyni brauzer sessiyasında başqa səhifəyə keçir və ya səhifəni yeniləyir, **Then** seçim tətbiq olunmuş qalır. Brauzer bağlanandan sonra seçimlər sıfırlanır, çünki widget öz cookie-sini sessiyalıq yazır (research R9). Widget məntiqi dəyişdirilmir.
4. **Given** menyu açıqdır, **When** ziyarətçi yalnız klaviaturadan istifadə edir, **Then** ikon və menyu bəndlərinə Tab ilə çatmaq və onları aktivləşdirmək olur.
5. **Given** menyu aktivdir, **When** səhifə açılır, **Then** saytın məzmunu, header-i və digər popup-ları (məs. canlı yayım) menyu ikonu tərəfindən örtülmür.

---

### User Story 2: Redaktor menyunu admindən aktiv və ya deaktiv edir (Priority: P1)

Admin paneldə səlahiyyətli istifadəçi bir keçidlə (switch) ictimai saytda müyəssərlik menyusunu yandırır və ya söndürür. Hazırkı vəziyyəti, kimin və nə vaxt dəyişdiyini görür.

**Why this priority**: İstifadəçinin açıq tələbidir. Widget problem yaradanda (xəta, dizaynla toqquşma, yavaşlıq) onu kodu deploy etmədən söndürməyə imkan verir.

**Independent Test**: Admində keçidi dəyişib ictimai saytı yeniləmək və menyunun göründüyünü və ya itdiyini yoxlamaq.

**Acceptance Scenarios**:

1. **Given** menyu deaktivdir, **When** redaktor keçidi "aktiv"ə çevirib yadda saxlayır, **Then** ən gec 1 dəqiqə ərzində ictimai saytda səhifə açılışında menyu görünür.
2. **Given** menyu aktivdir, **When** redaktor onu deaktiv edir, **Then** ən gec 1 dəqiqə ərzində səhifə açılışında nə ikon, nə də widget skripti yüklənir.
3. **Given** redaktor keçidi dəyişib, **When** audit jurnalına baxılır, **Then** kimin, nə vaxt, hansı vəziyyətdən hansına dəyişdiyi qeyd olunub.
4. **Given** yadda saxlama uğursuz olur (şəbəkə və ya server xətası), **When** cavab gəlir, **Then** keçid əvvəlki vəziyyətə qayıdır və xəta mesajı göstərilir.
5. **Given** ayar bazada heç yaradılmayıb, **When** admin səhifəsi açılır, **Then** keçid "deaktiv" göstərilir.

---

### Edge Cases

- **Widget skripti yüklənmir və ya xəta verir**: səhifə tam render olunur və interaktivdir. Yalnız menyu görünmür. Skript səhifənin ilk göstərilməsini gecikdirmir.
- **`accessibility.cert.gov.az` əlçatmazdır**: sayta təsiri yoxdur, çünki bütün widget resursları öz serverdən verilir.
- **Rəsmi versiya yenilənib**: saytdakı surət avtomatik dəyişmir. Yeni versiya yoxlanılıb ayrıca dəyişikliklə gətirilir.
- **Ayar oxuna bilmir** (public API xətası və ya ayar yoxdur): menyu deaktiv sayılır, səhifə normal render olunur.
- **Menyu söndürülüb, amma ziyarətçinin əvvəlki seçimləri cookie-də qalıb**: menyu yüklənmədiyi üçün seçimlər tətbiq olunmur və sayt standart görünüşdə açılır.
- **Saytın öz tünd teması ilə widget-in kontrast rejimləri eyni anda aktivdir**: məzmun oxunaqlı qalır (mətn fonla birləşmir). Bu, hər iki temada yoxlanılır.
- **Ayar dəyişikliyi və keş**: dəyişiklik ictimai saytda **ən gec 1 dəqiqə** ərzində görünür. Bu, digər məzmunun keş müddəti ilə eynidir (research R5).
- **Səhifə daxilində naviqasiya** (tam yenilənmə olmadan keçid): ikon bir dəfə görünür, təkrarlanmır və seçimlər qorunur.
- **Səhifənin dili dəyişir** (az ↔ en): menyu yeni dildə göstərilir.
- **Çap versiyası**: menyu ikonu çapa düşmür.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Admin paneldə müyəssərlik menyusu üçün aydın etiketli **keçid (switch)** olmalıdır: "İctimai saytda müyəssərlik menyusu: aktiv / deaktiv". Ümumi JSON redaktoru ilə əl ilə açar yazmaq tələb olunmamalıdır.
- **FR-002**: Vəziyyət paylaşılan ayarlar anbarında bir açar altında saxlanılmalıdır. Açar yoxdursa, dəyər **deaktiv**dir.
- **FR-003**: Hər dəyişiklik mövcud audit mexanizmi ilə qeyd olunmalıdır (kim, nə vaxt, əvvəl/sonra). Admin ekranında son dəyişikliyin vaxtı göstərilməlidir.
- **FR-004**: Keçidi dəyişmək yalnız ayarları redaktə etmək səlahiyyəti olan istifadəçilərə açıq olmalıdır. Digərləri vəziyyəti ya görməməli, ya da yalnız oxumalıdır.
- **FR-005**: Public API yalnız bu feature-in ayarını qaytaran dar bir oxuma nöqtəsi təqdim etməlidir. Digər ayarlar ictimai tərəfə açılmamalıdır (Maddə III.3).
- **FR-006**: İctimai sayt ayarı **server tərəfdə** oxumalıdır. Ziyarətçinin brauzeri ayar üçün API-yə müraciət etməməlidir.
- **FR-007**: Menyu aktiv olanda ictimai saytın **bütün səhifələrində**, hər iki dildə widget yüklənməlidir. Deaktiv olanda widget skripti **ümumiyyətlə yüklənməməlidir**, sadəcə gizlədilməsi kifayət deyil.
- **FR-008**: Widget-in dili səhifənin dilindən götürülməlidir (`az` → `az`, `en` → `en`).
- **FR-009**: Widget-in yeri və ölçüsü sabitdir: **sol aşağı künc, orta ölçü, küncdən widget-in standart məsafəsi (20px)**. Admin bunları dəyişmir (Q1).
- **FR-010**: Widget skripti səhifənin ilk göstərilməsini və əsas məzmunun interaktivliyini gecikdirməməlidir (təxirə salınmış yüklənmə).
- **FR-011**: Saytın təhlükəsizlik siyasətinə (CSP) **xarici mənbə əlavə olunmamalıdır**. Widget skripti saytın öz skriptləri kimi icazə almalıdır. Skriptin ehtiyacı olan inline stil və ya şəkil icazələri mövcud siyasətin daxilində qalmalıdır. Daxil deyilsə, plan mərhələsində əsaslandırılmalıdır.
- **FR-012**: Widget skriptinin **yoxlanılmış surəti** saytın öz serverindən verilməlidir (Q2). Skriptin rəsmi hosta istinad edən bütün resursları (ikon, şəkil, stil, şrift) da öz serverdən verilməlidir. Nəticədə ziyarətçinin brauzeri `accessibility.cert.gov.az`-a heç vaxt müraciət etmir.
- **FR-012a**: Surətin hansı rəsmi versiyadan, hansı tarixdə götürüldüyü və ona hansı dəyişikliklərin (resurs ünvanları) edildiyi repo-da qeyd olunmalıdır, ki növbəti yeniləmə təkrarlana bilsin.
- **FR-013**: Admin paneldəki bütün yeni mətnlər hər iki dildə (az/en) olmalıdır (Maddə V.4).
- **FR-014**: Widget ikonu saytın mövcud interaktiv elementlərini (header, cookie/popup dialoqları, canlı yayım popup-ı, "yuxarı qayıt" düyməsi, əgər varsa) örtməməlidir. Dialoq açıq olanda fokus düzgün idarə olunmalıdır.

### Key Entities

- **Müyəssərlik menyusu ayarı**: bir açar altında saxlanılan konfiqurasiya. Atributları: aktivdir/deaktivdir; son dəyişən istifadəçi və vaxt. Tək nüsxədir, dildən asılı deyil.
- **Ziyarətçi seçimləri**: widget-in özünün cookie-də saxladığı şrift, kontrast və s. seçimləri. Sistem bunları saxlamır və idarə etmir.

## Deviations

- **D-1 (web-cbar-new Konstitusiya X.4 və X.1, üçüncü tərəf runtime script)**: X.4 CDN script-lərini və analitika snippet-lərini qadağan edir. Bu feature dövlətin rəsmi müyəssərlik widget-inin **yoxlanılmış surətini** öz serverdən yükləyir. Əsaslar:
  - qanunvericilik konteksti var;
  - CDN yoxdur, fayl SHA-256 ilə qeyd olunub;
  - skriptdə şəbəkə çağırışı və `eval` olmadığı ölçülüb;
  - CSP zəiflədilmir;
  - admin keçidi ilə söndürülür (research R1, R10).

  Vendor kodunun daxilindəki `innerHTML` (statik şablonlar) da bu qeydə daxildir. D-1 başqa üçüncü tərəf script-inə icazə vermir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor menyunu admindən 3 klikdən az hərəkətlə aktiv və ya deaktiv edir. Dəyişiklik ictimai saytda ən gec 1 dəqiqə ərzində, növbəti səhifə açılışında görünür.
- **SC-002**: Menyu aktiv olanda saytın 18 route-unun hamısında, hər iki dildə ikon görünür və menyu səhifənin dilindədir.
- **SC-003**: Menyu deaktiv olanda səhifə widget faylına **sıfır** sorğu göndərir. Aktiv və ya deaktiv, heç bir vəziyyətdə `accessibility.cert.gov.az`-a sorğu getmir (brauzerin şəbəkə panelində yoxlanılır).
- **SC-004**: Menyu aktiv olanda ilk göstərilmə vaxtı deaktiv vəziyyətdən nəzərəçarpacaq dərəcədə pis deyil. Ölçmə nəticəsi plan mərhələsində qeyd olunur.
- **SC-005**: Brauzer konsolunda widget səbəbindən CSP pozuntusu xətası yoxdur.
- **SC-006**: Hər iki frontend-də `npm run verify` keçir. Aktiv/deaktiv ssenariləri avtomatik testlərlə əhatə olunub.

## Assumptions

- Widget pulsuz, qeydiyyatsız və açarsız istifadə olunur (sənəddə başqa şərt yoxdur).
- Skriptin surətini öz serverdən vermək qadağan deyil: sənəddə lisenziya şərti yoxdur. **Risk**: bu, CERT (`accessibility.cert.gov.az` sahibi) ilə təsdiqlənməyib. Canlıya çıxmazdan əvvəl təsdiq alınması tövsiyə olunur.
- Admin ekranı mövcud "Ayarlar" bölməsinə kart və ya keçid kimi yerləşdirilir. Ayrıca sidebar bəndi tələb olunmur. Yer plan mərhələsində dəqiqləşir.
- Yeni cədvəl və migration lazım deyil. Mövcud `settings` cədvəli və admin API istifadə olunur.
- `api-cbar` build-i lokalda yoxlanıla bilmir (.NET SDK yoxdur). Yoxlama deploy olunmuş test mühitində aparılır.
- Səlahiyyət modeli mövcud "Ayarlar" bölməsinin səlahiyyəti ilə eynidir.
- `data-accw-offsett` atributunun dəqiq yazılışı və widget-in yüklədiyi resursların tam siyahısı (şəkil, stil, şrift, məs. OpenDyslexic) plan mərhələsində skriptin özündən ölçülür.
- Widget saytın öz müyəssərlik işini (alt mətnlər, kontrast, klaviatura) əvəz etmir. WCAG 2.1 uyğunluğunun auditi bu spec-in əhatəsindən kənardır.
- `ru` və `tr` dilləri istifadə olunmur, çünki sayt yalnız az/en-dir.
