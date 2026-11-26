# Research: spec 045 — Anlaşma Memorandumları

Bütün qərarlar mövcud koda (spec 044 IFI nümunəsi), Figma `2210:56798`-ə və test API-dəki səhifə 122 məzmununa əsaslanır.
Açıq `NEEDS CLARIFICATION` yoxdur; istifadəçi təsdiqi gözləyən bir məzmun qərarı var (R5).

## R1. Məzmun növü və cədvəllər

- **Decision**: `memorandums` + `memorandum_translations` (iki yeni cədvəl). Alt resurs, media, zəngin mətn yoxdur.
- **Rationale**: İstifadəçi ayrıca panel bölməsi seçdi. Sətir üç xanadır (təşkilat, ölkə, il); il dildən asılı deyil, ad və ölkə dildən asılıdır.
- **Alternatives**: Redaktor cədvəli (istifadəçi rədd etdi); `ifi_organizations`-ə `kind` sütunu (rədd: mövcud cədvələ ALTER qadağandır, sahələr fərqlidir).

## R2. Tarix

- **Decision**: `signed_year smallint NOT NULL`, `CHECK (signed_year BETWEEN 1991 AND 2100)`. Admin formada 1991 … cari il + 1.
- **Rationale**: İstifadəçi "yalnız il" seçdi; Figma-nın ən köhnə sətri 1996, Mərkəzi Bank 1992-dən fəaliyyətdədir.
- **Alternatives**: `date` (rədd: köhnə memorandumların günü məlum deyil).

## R3. Ölkə

- **Decision**: Tərcümə cədvəlində sərbəst mətn `country varchar(100)`.
- **Rationale**: Figma-da "BƏƏ" kimi qısaltma var, ölkə üzrə filtr yoxdur; sorğu kitabçası 28 sətir üçün artıq cədvəl və panel bölməsidir.
- **Alternatives**: `countries` cədvəli (rədd: əhatədən kənar); ISO kodu + frontend adları (rədd: redaktor qısaltmanı idarə edə bilməz).

## R4. Sıra harada qurulur

- **Decision**: `api-cbar` həmişə `signed_year DESC, sort_order, id` qaytarır, parametr almır. "Əvvəlcə köhnələr" saytda qurulur: illər artan,
  il daxilində API-nin sırası qorunur (`features/memorandums/model/sort.ts`, stabil qruplaşdırma).
- **Rationale**: Bir endpoint, bir keş açarı; sıra saf funksiyadır və Vitest ilə yoxlanılır. Spec 039-da axtarış da loader tərəfdədir.
- **Alternatives**: `?sort=` API parametri (rədd: kontrakt böyüyür, fayda yoxdur); bütün massivi `reverse()` (rədd: il daxilində redaktor sırası tərsinə dönür, FR-010).

## R5. Köhnə məzmun və seed

- **Fakt** (test API, 2026-11-13): səhifə 122 az/en məzmunu birbaşa `<p><strong>İsveçrə Milli Bankı</strong></p>` ilə başlayır, giriş yoxdur;
  dörd bankın axın mətni var (İsveçrə, Polşa, Türkiyə, Almaniya). Memorandum siyahısı köhnə məzmunda yoxdur.
- **Decision**: Memorandumlar varsa CMS məzmunu ilk "heading line"-dan kəsilir (spec 044 R5 ilə eyni funksiya), əvvəlki hissə giriş olur.
  `0028` seed-i: (a) `memorandums` boşdursa 28 sətir; (b) səhifə az slug `merkezi-banklarla-emekdasliq` ilə tapılır,
  `has_table_privilege('page_translations','UPDATE')` varsa və həmin dilin məzmunu `<p><strong>` ilə başlayırsa (boşluqlar nəzərə alınmadan),
  Figma giriş paraqrafı əvvələ əlavə olunur (az və en ayrı-ayrı yoxlanılır). Başlıq və slug dəyişmir.
- **Rationale**: Şərt idempotentdir (ikinci işləmədə məzmun artıq `<p>Azərbaycan …` ilə başlayır) və redaktorun dəyişikliyini qoruyur.
- **Məzmun qərarı (istifadəçi təsdiqi)**: dörd bankın köhnə mətni saytda görünməyəcək, CMS-də ehtiyat kimi qalır. Alternativ: mətni cədvəldən
  sonra göstərmək (Figma-da yoxdur) — təsdiq olunmasa `parse` kəsmir, cədvəl girişdən sonra, köhnə mətn cədvəldən sonra gəlir.

## R6. Çeşidləmə seçimi (UI)

- **Decision**: Ünvan parametri `?sort=oldest` (standart — parametrsiz, `newest`). Seçim native `<details>` açılan siyahısıdır: `<summary>` Figma
  düyməsidir ("Tarix: əvvəlcə yenilər" + ox), içində iki `Link`; aktiv seçim `aria-current="true"`. Server komponenti, JS tələb etmir.
  Route `searchParams.sort`-u oxuyur və view-a ötürür; `loadCmsPage` imzası dəyişmir, sıra view-da blok üzərində tətbiq olunur.
- **Rationale**: Layihə qaydası "interaktiv seçim = URL parametri + server render". Kit `Select` GET formasında dəyər göndərmir; native `<select>`
  JS-siz ayrıca "Tətbiq et" düyməsi tələb edir və Figma görünüşünü vermir. `<details>` spec 044 kartlarında artıq istifadə olunur.
  `loadCmsPage` `cache()` ilədir və `generateMetadata` ilə paylaşılır — üçüncü arqument sorğunu ikiləşdirərdi.
- **Alternatives**: Client komponent + `router.replace` (rədd: yeni `'use client'`, JS-siz işləmir); sütun başlığına klik (rədd: Figma-da ayrıca düymədir).
- **Qeyd**: açılan siyahının görünüşü Figma-da yoxdur (yalnız bağlı düymə) — mövcud kit `popover`/menyu tokenləri ilə qurulur, ui-contract-da fərz kimi qeyd olunur.

## R7. Layout seçimi və guard

- **Decision**: `COOPERATION_LAYOUTS`-a `merkezi-banklarla-emekdasliq`, `…-copy`, `cooperation-with-central-banks`, `…-copy` → `'memorandums'`.
  Yeni `AboutLayoutKind`; blok `{ type: 'memorandums', rows }`. Guard: `fixtures/memorandums.html` (seed-dən sonrakı forma: giriş paraqrafı +
  köhnə `<p><strong>` bank mətni), `EXPECTED_BLOCKS`, admin `fixtures/layouts/memorandums.html` + `roundtrip.test.ts`.
- **Rationale**: CLAUDE.md qaydası — yeni `AboutLayoutKind` guard-sız `verify`-dan keçmir.

## R8. Cədvəl widget-i

- **Decision**: Yeni `widgets/about-blocks/memorandums.tsx` — həqiqi `<table>` (`<caption>` əvəzinə `aria-labelledby` ilə H2), `<thead>` brend fon,
  zebra sətirlər. `widgets/data-table` və `release-schedule-table` yenidən istifadə olunmur.
- **Rationale**: Figma ölçüləri (başlıq 44, sətir padding 16/24, zebra `#FCFBF9`, radius 4) mövcud cədvəllərdən fərqlidir; implementasiyada əvvəl
  `data-table`-ın variantla uyğunlaşıb-uyğunlaşmadığı yoxlanılır — uyğundursa variant, deyilsə yeni komponent (dublikat stil yaradılmır).

## R9. İcazələr, konkurens, axtarış

- **Decision**: `memorandums.read/create/update/delete` — `Permissions.cs` (`Memorandums` sinfi + `All` + sayğac şərhi), `0027`-də privilege-guard
  DO bloku ilə `moderator` roluna; OpenAPI-də `x-permission`. Konkurens yoxlaması yoxdur (spec 044 R1). Sayt axtarışına əlavə edilmir (spec 044 R8).
- **Rationale**: Mövcud nümunələrlə eyni; yeni mexanizm qurulmur.
