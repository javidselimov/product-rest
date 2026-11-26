# Research: spec 042

## R1. Sərhəd hansı en olmalıdır?

- **Decision**: `desk` (1360px, `--breakpoint-desk: 85rem`), utility `desk:hidden`.
- **Rationale**: üst zolaq keçidləri `site-header.tsx`-də `max-desk:hidden`-dır, yəni tam `desk`-dən görünür. Panel bəndini eyni
  token-la gizlətmək "Media"nın hər endə tam bir yerdə olmasını zəmanət edir: <1360 paneldə, ≥1360 üst zolaqda. Token dəyişsə
  ikisi birlikdə dəyişir.
- **Alternatives**: `lg` (1024) — nav çubuğunun göründüyü en; 1024–1359-da "Media" heç yerdə olmazdı (üst zolaq gizli). Rədd.

## R2. Bölmə üst zolaq keçidinə necə uyğunlaşdırılır?

- **Decision**: `isTopLinkSection(section, locale)` = `!section.external && topLinks.some(l => section.href === \`/${locale}/${l.slug[locale]}\`)`.
- **Rationale**: üst zolaq keçidinin href-i `site-header.tsx`-də məhz belə qurulur, bölmənin href-i `navFor`-dan gəlir. Eyni ünvan =
  eyni səhifə. Başlıq dəyişsə qayda işləyir (spec Edge Cases). Test API-də az/en slug-ları uyğundur: `media`/`media`,
  `insan-resurslari`/`human-resources` (2026-11-12 yoxlanıldı). `elaqe` kök deyil — təsiri yoxdur.
- **Alternatives**: başlığa görə (`'Media'`) — dil və redaktə ilə qırılır; node id-yə görə (77) — mühitlər arasında fərqli ola bilər. Rədd.

## R3. Qayda modeldə (bayraq) yoxsa görünüşdə?

- **Decision**: görünüşdə — `OverflowPanel` `li` sinfi. `NavSection` dəyişmir.
- **Rationale**: `buildNavSections().all` mobil çekmecəyə də gedir, `footerSections` eyni `toSection`-u işlədir. Gizlətmə yalnız bir
  en və bir yer üçündür; model bayrağı başqa istehlakçıları qarışdırardı. Mövcud `index < visibleCount && 'lg:hidden'` qaydası da
  elə görünüşdədir — yeni sinif onun yanında durur.
- **Alternatives**: `buildNavSections`-dan `overflowDesk` siyahısı qaytarmaq — tablet/masaüstü üçün iki ayrı siyahı render etmək
  lazım gələrdi (dublikat DOM). Rədd.

## R4. Admin panel / redaktor bunu edə bilərmi?

- **Decision**: yox; admin dəyişikliyi də lazım deyil.
- **Rationale**: `visible=false` səhifəni bütün naviqasiyadan çıxarır və `GetTree` uşaqlarını kökə qaldırır; `showInSideNav`
  (spec 041) yalnız sol menyudur; sıra dəyişikliyi "Media"nı ilk 8-ə — nav çubuğuna salır. Qaydanın mənbəyi kodda sabit `topLinks`-dir,
  CMS məlumatı deyil. Yeni admin bayrağı ("hamburgerdə göstər") yalnız bir ekran eni üçün olardı və üst zolaq kodda qaldıqca
  redaktor onu düzgün idarə edə bilməzdi.

## R5. Əlçatanlıq

- **Decision**: `display:none` (`hidden`) kifayətdir.
- **Rationale**: `display:none` elementi accessibility ağacından və Tab sırasından çıxarır (FR-005). JSDOM media query hesablamır,
  ona görə testdə sinif yoxlanılır, faktiki görünüş quickstart-da brauzerdə ölçülür.
