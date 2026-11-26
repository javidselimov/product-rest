# Feature Specification: "Beynəlxalq əməkdaşlıq" bölməsi bölmə şablonunda

**Feature Branch**: `043-international-cooperation`

**Created**: 2026-11-12

**Status**: Implemented

**Input**: "Bu səhifəni düzəldək, Figma-ya uyğun planla." Figma: `2142:119643` ("Beynəlxalq əməkdaşlıq "), fayl "cbar website (Copy)".

**Hazırkı vəziyyət** (kod və test API, 2026-11-12):

- CMS kök səhifəsi id 120: az `Beynəlxalq əməkdaşlıq` / `beynelxalq-emekdasliq`, en `International Cooperation` / `international-cooperation`.
  Məzmunu var (iki paraqraf), faylı yoxdur. Uşaqları: Beynəlxalq təşkilatlarla əməkdaşlıq, Mərkəzi banklarla əməkdaşlıq, Beynəlxalq tədbirlər,
  AMB tərəfindən təqdim edilən texniki yardımlar, və redaktor qaralaması "Beynəlxalq əməkdaşlıq (Kopya)" (id 466, 4 uşaqla).
- Sayt bölməni köhnə görünüşdə (spec 002) göstərir: göy H1 zolağı və 320px `SectionSidebar`, çünki kök `SECTION_TITLES`-də yoxdur.
- Figma frame-i Media/About şablonunun eynisidir (`widgets/section-shell`, spec 028): breadcrumb `Ana səhifə › Beynəlxalq əməkdaşlıq`
  və paylaşma düymələri (hündürlük 100), solda 312px boz menyu (`#F5F5F5`, padding 20, radius 4), sağda 984px məzmun: H1 DM Sans 600
  32/44, giriş 16/28, aralıq 36.

**Admin panel**: dəyişiklik lazım deyil. Menyu adları, sırası və mətn CMS-dəndir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bölmənin kökü Figma şablonunda (Priority: P1)

Ziyarətçi `/az/beynelxalq-emekdasliq` (və ya `/en/international-cooperation`) açır: breadcrumb, paylaşma, sol menyuda bölmənin alt
səhifələri, bir H1 və CMS giriş mətni görür. Menyuda aktiv bənd yoxdur.

**Independent Test**: səhifəni 1728px endə açıb Figma `2142:119643` ilə ölçüləri tutuşdurmaq.

**Acceptance Scenarios**:

1. **Given** kök səhifə açılıb, **Then** breadcrumb `Ana səhifə › Beynəlxalq əməkdaşlıq`-dır, son element link deyil.
2. **Given** kök səhifə açılıb, **Then** sol menyu kökün uşaqlarını sırası ilə göstərir, köhnə sidebar yoxdur.
3. **Given** kök səhifə açılıb, **Then** məzmun Figma tipoqrafiyasındadır (`CmsContent variant="about"`).

### User Story 2 - Alt səhifələr də şablondadır (Priority: P1)

Ziyarətçi menyudan "Mərkəzi banklarla əməkdaşlıq"ı açır: eyni şablon, bənd menyuda cari, breadcrumb üç səviyyəli.

### Edge Cases

- **Redaktor qaralaması "(Kopya)"**: kökün uşağıdır, menyuda görünür; redaktor "Sol menyuda göstər" (spec 041) ilə gizlədə bilər. Kopya
  səhifəsində menyu Kopya kökündən qurulur (Media/About kimi).
- **Media layout slug-ı** (`media-sorgulari` və s.) bu bölmədə olsa belə `plain` qalır: layout cədvəli bölməyə görədir.
- **Məzmun boşdur**: şablonda alt səhifə kartları göstərilir (mövcud qayda).
- **Kökün başlığı dəyişərsə** bölmə köhnə görünüşə qayıdır (tanınma başlığa görədir, About/Media kimi).

## Requirements *(mandatory)*

- **FR-001**: Kökü "Beynəlxalq əməkdaşlıq" / "International Cooperation" olan bölmənin bütün CMS səhifələri `section-shell` şablonunda göstərilməlidir.
- **FR-002**: Bölmənin səhifələri adi CMS məzmunudur (`plain`); About blokları və Media layout-ları tətbiq olunmur.
- **FR-003**: Admin panel, API və verilənlər bazası dəyişmir.

## Success Criteria *(mandatory)*

- **SC-001**: 1728px endə menyu 312px, məzmun 984px, H1 32/44, giriş 16/28 — Figma ilə eyni.
- **SC-002**: Redaktor üçün məcburi əməliyyat yoxdur; Figma-dakı mətn və 3 bəndlik menyu redaktor işidir (bax Assumptions).

## Assumptions

- Figma menyusunda 3 bənd var ("Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq", "Mərkəzi banklarla əməkdaşlıq", "Beynəlxalq təşkilatlarda
  üzvlük"), CMS-də 4 + Kopya; giriş mətni də fərqlidir. Menyu və mətn CMS-dəndir, uyğunlaşdırma redaktor işidir.
- Komponent: yalnız ictimai sayt (`web-cbar-new`). Deploy sırası şərti yoxdur.
