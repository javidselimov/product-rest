# Feature Specification: Masaüstü hamburger panelində üst zolaqdakı bölmələr təkrarlanmasın

**Feature Branch**: `042-hamburger-hide-media`

**Created**: 2026-11-12

**Status**: Implemented

**Input**: "Desktopda hamburger menyuda Media hissəsi görünməli deyil, Figma-da klik etdiyim yerdəki kimi olmalıdır. Amma elə
olmalıdır ki, mobil dizaynda pozulmasın. Admin paneldə nəsə dəyişmək lazımdırsa qeyd et, yox əgər redaktor bunu adminkada dəyişə
bilirsə, onu mənə de." Figma: `1088:26873` ("menu - hamburger"), "Media" bəndi `1088:26879` `visible:false`.

**Hazırkı vəziyyət** (kod və test API, 2026-11-12):

- Nav çubuğu ağacın ilk 8 kök bölməsini göstərir, qalanlar hamburger panelindədir. Test API ağacında "Media" 9-cu kökdür, ona görə
  masaüstündə hamburger panelində görünür.
- Header-in üst zolağında üç sabit keçid var: "Karyera" (İnsan resursları), "Media", "Əlaqə". Bu zolaq yalnız 1360px və daha geniş
  ekranda görünür.
- Deməli 1360px+ ekranda "Media" iki yerdədir: üst zolaqda və hamburger panelində. Figma-da paneldə yoxdur. "İnsan resursları" da
  eyni vəziyyətdədir (16-cı kök, üst zolaqda "Karyera"), Figma panelində o da yoxdur.
- 744–1359px ekranda üst zolaq keçidləri gizlidir, "Media"ya yalnız hamburger paneli aparır. 744px-dən dar ekranda mobil çekmecə
  bütün bölmələri göstərir, üst zolaq keçidləri orada yoxdur.

**Admin panel**: redaktorun bu nəticəni verən ayarı yoxdur, admin dəyişikliyi də lazım deyil:

- "Menyuda görünür" söndürülsə "Media" saytın bütün naviqasiyasından (mobil çekmecə, footer, breadcrumb) çıxar və alt səhifələri
  üst menyuya qalxar.
- "Sol menyuda göstər" (spec 041) yalnız bölmənin sol menyusuna təsir edir.
- Sıranı dəyişib "Media"nı ilk 8-ə salmaq onu nav çubuğuna keçirir və Figma-dakı çubuğu pozur.

Qayda header düzümünə aiddir (üst zolaq keçidləri kodda sabitdir), CMS məlumatına yox. Dəyişiklik yalnız ictimai saytdadır.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Geniş masaüstündə hamburger paneli Figma ilə eynidir (Priority: P1)

1360px və daha geniş ekranda ziyarətçi hamburgeri açır. Panel nav çubuğuna sığmayan bölmələri göstərir, amma üst zolaqda artıq
keçidi olan "Media" və "İnsan resursları" paneldə yoxdur. Ziyarətçi Media-ya üst zolaqdakı "Media" keçidi ilə keçir.

**Why this priority**: Tələbin özüdür: panel Figma `1088:26873` ilə üst-üstə düşməlidir, eyni keçid iki dəfə göstərilməməlidir.

**Independent Test**: 1440px endə saytı açıb hamburgeri açmaq: paneldə "Media" və "İnsan resursları" yoxdur, qalan sığmayan
bölmələr əvvəlki sırada var; üst zolaqdakı "Media" keçidi Media səhifəsini açır.

**Acceptance Scenarios**:

1. **Given** ekran eni 1360px və ya daha çoxdur, **When** hamburger paneli açılır, **Then** "Media" bəndi və onun alt bəndləri görünmür.
2. **Given** eyni en, **When** panel açılır, **Then** "İnsan resursları" bəndi də görünmür.
3. **Given** eyni en, **When** panel açılır, **Then** üst zolaqda keçidi olmayan bütün sığmayan bölmələr əvvəlki sırada görünür.
4. **Given** eyni en, **When** ziyarətçi üst zolaqdakı "Media" keçidinə klik edir, **Then** Media səhifəsi açılır.
5. **Given** sayt ingiliscədir (`/en`), **When** 1360px+ endə panel açılır, **Then** "Media" və "Human Resources" görünmür.

---

### User Story 2 - Dar ekranlarda heç nə dəyişmir (Priority: P1)

744–1359px ekranda və mobil telefonda ziyarətçi "Media"ya əvvəlki kimi menyudan çatır.

**Why this priority**: Tələbin şərtidir: "mobil dizaynda pozulmasın". Bu enlərdə üst zolaq keçidləri görünmür, panel bəndi yeganə yoldur.

**Independent Test**: 1200px, 900px və 390px endə menyunu açmaq: "Media" əvvəlki yerində var və işləyir.

**Acceptance Scenarios**:

1. **Given** ekran eni 1024–1359px-dir, **When** hamburger paneli açılır, **Then** "Media" və "İnsan resursları" əvvəlki kimi görünür.
2. **Given** ekran eni 744–1023px-dir (tablet), **When** hamburger paneli açılır, **Then** bütün bölmələr, o cümlədən "Media", əvvəlki kimi görünür.
3. **Given** ekran eni 744px-dən azdır, **When** mobil çekmecə açılır, **Then** "Media" və alt bəndləri əvvəlki kimi görünür.
4. **Given** hər hansı en, **When** nav çubuğu, footer və breadcrumb göstərilir, **Then** onlar dəyişməyib.

---

### Edge Cases

- **Pəncərənin eni dəyişir** (1360px sərhədi keçilir): bənd səhifə yenilənmədən ekran eninə uyğun görünür və ya gizlənir.
- **Üst zolaq keçidinə uyğun bölmə ağacda yoxdur** ("Əlaqə" kök deyil): paneldə dəyişən heç nə olmur.
- **Redaktor bölməni yeni yerə köçürür**: "Media" ilk 8-ə düşərsə nav çubuğunda göstərilir (mövcud qayda); qayda yalnız panelə aiddir.
- **Bölmənin başlığı dəyişir**: qayda ada yox, keçidin ünvanına baxır, ona görə yenə işləyir. Slug dəyişərsə bölmə paneldə yenidən
  görünür, çünki üst zolaq keçidi də köhnə ünvana aparır (ayrıca düzəliş tələb edir).
- **Sığmayan bölmələrin hamısı üst zolaqda olsa**: panel boş qalardı. İndiki ağacda belə deyil (12 sığmayan bölmə); bu hal yalnız
  testdə qeyd olunur.
- **Klaviatura ilə gəzmə**: 1360px+ endə gizli bəndə Tab ilə fokus düşmür.
- **"Sual-cavab"**: Figma panelində o da gizlidir, amma üst zolaqda keçidi yoxdur. Bu spec-in əhatəsində deyil.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 1360px və daha geniş ekranda hamburger paneli üst zolaqda keçidi olan bölmələri (alt bəndləri ilə birlikdə) göstərməməlidir.
- **FR-002**: Bölmənin üst zolaq keçidinə uyğunluğu başlığa görə yox, keçidin ünvanına görə müəyyən olunmalıdır və hər iki dildə işləməlidir.
- **FR-003**: 1360px-dən dar ekranda hamburger panelinin və mobil çekmecənin tərkibi dəyişməməlidir.
- **FR-004**: Nav çubuğu, footer, breadcrumb, sol menyu və üst zolaq dəyişməməlidir.
- **FR-005**: Gizli bənd ekran oxuyucusu və klaviatura üçün də əlçatmaz olmalıdır (gizli bəndə fokus düşmür).
- **FR-006**: Admin panel, ictimai və admin API, verilənlər bazası dəyişməməlidir.
- **FR-007**: Media redaktor təlimatı "Media"nın geniş ekranda hamburger panelində olmamasının qəsdən olduğunu və admin ayarı ilə dəyişmədiyini yazmalıdır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 1360px+ endə hamburger paneli Figma `1088:26873` ilə eyni bölmə dəstini göstərir: "Media" və "İnsan resursları" yoxdur.
- **SC-002**: 1360px-dən dar hər yoxlanan endə (1200, 900, 390) "Media"ya menyudan bir klikdə çatmaq olur.
- **SC-003**: 1360px+ endə "Media" keçidi səhifədə tam bir dəfə görünür (üst zolaqda).
- **SC-004**: Redaktor üçün heç bir əməliyyat tələb olunmur: dəyişiklik yayımlanan kimi işləyir.

## Assumptions

- "Desktop" 1360px və daha geniş ekrandır: üst zolaq keçidlərinin göründüyü en. 1024–1359px-də panel dəyişmir, çünki orada "Media"ya
  başqa yol yoxdur.
- Qayda "İnsan resursları"na da tətbiq olunur: o da üst zolaqdadır və Figma panelində yoxdur.
- Komponent: yalnız ictimai sayt (`web-cbar-new`). Deploy sırası şərti yoxdur.
