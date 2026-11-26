# Research: spec 044 — Beynəlxalq maliyyə təşkilatları

Bütün qərarlar mövcud koda (spec 038 CSR projects nümunəsi) və Figma `2172:3599`-a əsaslanır. Açıq `NEEDS CLARIFICATION` yoxdur.

## R1. Konkurens yoxlaması

- **Decision**: Yoxdur. Son saxlayan qalib gəlir, hər dəyişiklik audit jurnalına düşür.
- **Rationale**: Kodda heç bir version/ETag/`IsConcurrencyToken` nümunəsi yoxdur, CSR projects da belə işləyir. Tək bu bölmə üçün mexanizm qurmaq
  paneldə ayrıca xəta axını tələb edir.
- **Alternatives**: `version` sütunu + 409 (rədd: yeni nümunə, panel dəyişikliyi), `xmin` (rədd: EF-də heç yerdə istifadə olunmur).
- **Spec təsiri**: FR-007 çıxarılır, Assumptions-a qeyd əlavə olunur.

## R2. Üzvlük tarixləri necə saxlanılır

- **Decision**: Ayrıca sub-resource endpoint-ləri (`/{id}/memberships…`), admin formada `editExtras` bölməsi ilk saxlamadan sonra görünür.
- **Rationale**: Panelin `ModuleConfig`-ində per-locale massiv sahəsi yoxdur; CSR foto bölməsi (`csr-project-images-section.tsx` → `AssetsSection`)
  eyni "əvvəl saxla, sonra əlavə et" axını ilə işləyir və redaktorlara tanışdır.
- **Alternatives**: Upsert body-də `memberships` massivi (rədd: yeni form sahə tipi lazımdır); tarixləri zəngin mətndə cədvəl kimi saxlamaq
  (rədd: istifadəçi ayrıca content type seçdi, cədvəl markup-ı redaktor səhvinə həssasdır).

## R3. Loqo

- **Decision**: `logo_media_id` (nullable, `media_assets`-ə şərti FK `ON DELETE SET NULL`), yalnız `image/*`. `MediaController.Delete`-in EXISTS
  zəncirinə `ifi_organizations.logo_media_id` əlavə olunur ki, istifadədə olan loqo silinməsin.
- **Rationale**: CSR `cover_media_id` ilə eyni; panelin `type:'media'` sahəsi hazırdır. Kart qalereya olmadığı üçün ayrıca şəkil cədvəli lazım deyil.

## R4. Seed və səhifə 121

- **Decision**: `0026` bir `DO $seed$` bloku: `ifi_organizations` boşdursa 4 təşkilat və DB-nin 5 tarixi. Sonra ayrıca blok: səhifə az slug
  `beynelxalq-teskilatlarla-emekdasliq` ilə tapılır; `has_table_privilege('page_translations','UPDATE')` varsa və az başlıq hələ
  "Beynəlxalq təşkilatlarla əməkdaşlıq"-dırsa: az başlıq Figma başlığına dəyişir, az və en məzmunun əvvəlinə giriş paraqrafı əlavə olunur.
  en başlıq dəyişmir. Slug-lar dəyişmir (URL sabit qalır).
- **Rationale**: İstifadəçi "seed ilə" seçdi. Başlıq şərti redaktorun sonrakı dəyişikliyini qoruyur və seed-i idempotent edir (ikinci işləmədə
  başlıq artıq yenidir). Privilege yoxlaması paylaşılan mühitdə başqa rolun sahib olduğu cədvəldə startup-ı bloklamır (`0020` üsulu).
- **Alternatives**: Səhifəyə toxunmamaq (rədd: Figma başlığı və girişi redaktor işi qalardı, istifadəçi seed istədi); köhnə siyahını məzmundan
  silmək (rədd: sayt onsuz da kəsir, köhnə mətn ehtiyat kimi qalır — CSR FR-025 kimi).
- **Mətn mənbəyi**: az — Figma `2172:3599` mətnləri; en — köhnə en məzmunu (`schema-new/cbar-schema-and-data-20260914.sql`, səhifə 121 en sətri),
  AYİB üçün tərcümə qaralaması. Loqolar seed edilmir (MinIO).

## R5. Köhnə siyahının saytda kəsilməsi

- **Decision**: Təşkilatlar varsa, CMS məzmunu ilk "heading line"-dan (`<p>` içində yalnız bir `<strong>`, `cms-markup.md` §1) kəsilir; ondan əvvəlki
  hissə giriş olur. Təşkilat yoxdursa və ya API xəta verirsə məzmun tam qalır.
- **Rationale**: Köhnə məzmunun hər təşkilatı `<p><strong>Ad</strong></p>` ilə başlayır; seed girişi bundan əvvələ qoyur. CSR `parseCsrProjects`
  eyni "ilk başlıqdan kəs" üsulunu istifadə edir, amma sabit başlıq siyahısı ilə — burada başlıq təşkilat adıdır, ona görə forma qaydası seçilir.

## R6. Layout seçimi

- **Decision**: `features/about-content/model/layouts.ts`-ə `COOPERATION_LAYOUTS` (az/en slug + `-copy` variantları → `'ifi-organizations'`) və
  `cooperationLayoutFor(slug)`; `views/cms-page/loader.ts` `sectionLayout` cooperation-da onu çağırır. Yeni `AboutLayoutKind` `'ifi-organizations'`.
- **Rationale**: Spec 043 cooperation-u həmişə `plain` qaytarır; Media bölməsinin `MEDIA_LAYOUTS` cədvəli eyni problemi həll edir. Yeni layout
  CLAUDE.md-dəki fixture guard-a düşür (fixture + `EXPECTED_BLOCKS` + admin roundtrip).

## R7. Accordion

- **Decision**: Native `<details>`/`<summary>`, hamısı bağlı (`open` atributu yoxdur; 2026-11-13-dək birinci açıq idi); ox CSS ilə `[open]`-da dönür. Çapda hamısı açıq (`globals.css` details qaydaları).
- **Rationale**: JS olmadan işləyir (FR-016), ekran oxuyucusu açıq/bağlı vəziyyəti özü bildirir, server komponenti qalır.
  `widgets/org-chart/org-chart-tree.tsx` artıq eyni üsulu istifadə edir. Kit `Accordion` client komponentdir və JS-siz açılmır.

## R8. Sayt axtarışı

- **Decision**: Bu spec-də `SearchController`-ə əlavə edilmir.
- **Rationale**: İstifadəçi tələb etmədi, səhifə öz CMS məzmunu ilə tapılır. Sonrakı iş kimi `diff_report_logic.md`-də qeyd olunur.

## R9. İcazələr

- **Decision**: `ifi.read`, `ifi.create`, `ifi.update`, `ifi.delete` — `Authorization/Permissions.cs` (`Ifi` sinfi + `All` + sayğac şərhi),
  `0025`-də `permissions`/`role_permissions` privilege-guard DO bloku ilə `moderator` roluna; OpenAPI-də `x-permission`.
- **Rationale**: `Permissions.cs` remarks-dakı yeni icazə yoxlama siyahısı; admin rolu kodda bütün icazələrə malikdir.
