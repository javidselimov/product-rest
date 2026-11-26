# Research: "Sol menyuda göstər" bayrağı (spec 041)

Bütün qərarlar kodun 2026-11-12 vəziyyətinə əsaslanır. Açıq sual qalmayıb.

## R1 — Bayraq ağacdan süzgəc yox, node-un sahəsidir

**Decision**: `api-cbar` `GET /api/v1/pages/tree` gizli səhifəni çıxarmır. Hər node-a `showInSideNav: boolean` əlavə olunur,
süzgəci sol menyunu quran iki widget edir.

**Rationale**: `GetTree` ağacda olmayan valideynin uşağını kökə qaldırır (`PagesController.cs:43`). Səhifə ağacdan çıxsaydı
`Visible`-ın yan təsiri təkrarlanardı (FR-008, FR-012). Breadcrumb və aktiv zəncir (`findChainBy`, `activeChainIds`) də ağacda
olan node-a əsaslanır (FR-007, US2).

**Alternatives considered**: ayrıca `GET /pages/side-nav` endpoint-i, yəni iki ağac. Bunda sorğu sayı artır və iki ağac uyğunsuz
ola bilər. `Visible`-ı üç vəziyyətli etmək də fikirləşildi, amma mövcud kontraktı dəyişir (konstitusiya VII.3).

## R2 — Saxlama: yoldaş `page_details` cədvəli

**Decision**: miqrasiya `0024-page-details.sql`:
`page_details(page_id integer PRIMARY KEY, show_in_side_nav boolean NOT NULL DEFAULT true)`.
FK `pages(id) ON DELETE CASCADE` yalnız `has_table_privilege('pages','REFERENCES')` olanda qurulur. Rol mövcuddursa
`GRANT SELECT … TO cbar_web_ro` verilir.

**Rationale**: paylaşılan mühitdə `pages` başqa rola məxsus ola bilər, `ALTER TABLE` startup-ı bloklayır (root `CLAUDE.md`,
`0016`/`0017` nümunəsi). Sətri olmayan səhifə görünür sayılır (FR-002), ona görə backfill yoxdur. Sütun müsbət adlıdır və DTO
ilə eyni mənanı daşıyır, inversiya yoxdur.

**Alternatives considered**: ümumi `page_settings(key, value)` cədvəli. Çevikdir, amma tipsizdir və EF proyeksiyası çətinləşir.
Gələcək səhifə xüsusiyyətləri `page_details`-ə yeni miqrasiya ilə sütun kimi əlavə oluna bilər, çünki o cədvəlin sahibi
`api-cbar-admin` rolu özüdür.

## R3 — Silmə

**Decision**: səhifələr soft-delete olunur (`DeletedAt`, `PagesController.cs:253`), ona görə `page_details` sətri qalır və heç
yerdə görünmür (səhifənin query filter-i onu da gizlədir). Bərpa olunan səhifə dəyərini saxlayır. Fiziki silinmədə FK varsa
cascade işləyir, yoxdursa qalıq sətir zərərsizdir: id `serial`-dır və təkrar istifadə olunmur.

**Rationale**: spec FR-004 bu formada dəqiqləşdirildi. Əlavə kod lazım deyil.

## R4 — Admin input-unda bayraq nullable-dır

**Decision**: `PageFlagsDto`-ya `bool? ShowInSideNav = null` əlavə olunur. `null` gələrsə mövcud dəyər dəyişmir. Cavablarda
həmişə `bool` olur.

**Rationale**: `PageFlagsInput`-un mövcud qaydası budur: "flags göndərilsə, buraxılan sahə default-a qayıdır". Deploy arasında
yeni API köhnə panel bundle-ı ilə işləyəcək: köhnə panel bayrağı göndərmir. Default `true` olsaydı, köhnə paneldən adi saxlama
sol menyuda gizli səhifəni səssizcə yenidən göstərərdi. Nullable input bunu istisna edir. OpenAPI-də bu istisna sahənin
təsvirində yazılır.

**Alternatives considered**: ayrıca endpoint, `PUT /pages/{id}/side-nav`. Bu, spec-first marşrut, əlavə icazə və UI axını
deməkdir. Bayraq forma ilə birlikdə saxlanmalıdır (US1).

## R5 — Sətir yalnız lazım olanda yaradılır

**Decision**: `ApplySettings`-də dəyər `false`-dursa, ya da sətir artıq varsa upsert olunur. `true` gəlib sətir yoxdursa heç nə
yazılmır.

**Rationale**: cədvəl yalnız istisnaları saxlayır, minlərlə səhifə üçün boş sətir yaranmır. Oxuma qaydası hər iki halda eynidir:
`Detail == null || Detail.ShowInSideNav`.

## R6 — Saytda görünmə qaydası

**Decision**: bənd o halda göstərilir ki, `node.showInSideNav !== false || open.has(node.id)`. Burada `open` mövcud
`activeChainIds` nəticəsidir: açıq səhifə və onun bütün əcdadları. Gizli bənd göstərilməyəndə uşaqları da göstərilmir, çünki
render rekursivdir. Qayda `entities/page-node`-da bir funksiyadır (`isInSideNav(node, open)`), iki widget onu işlədir:
`widgets/section-shell/model.ts` `toNavItem` (map-dan əvvəl `filter`) və `widgets/section-sidebar` `renderLevel`.

**Rationale**: FR-009 ("özü və ya alt ağacı açıqdır") `activeChainIds` ilə birbaşa uyğun gəlir. Kodda bu artıq Tədbirlər üçün
(`isEventsNode`) tətbiq olunur. Gizli bənd açıq olanda alt bəndləri adi qaydada görünür, çünki onların öz bayrağı açıqdır.

**Interfeys**: `PageNode.showInSideNav?: boolean`, sxemdə optional. Sahə yoxdursa bənd görünür (FR-011). Optional olduğu üçün
60+ mövcud fikstür dəyişmir.

## R7 — Admin kartının qaydası

**Decision**: `menuVisibility` hər dil üçün iki nəticə qaytarır: `top` (indiki) və `side`. `side`:

1. `top` görünmürsə `side` də görünmür, səbəbləri eynidir.
2. Ağacda dərinlik 1-dirsə (kök və ya kökə qalxan) səbəb `sectionRoot` olur: kök sol menyunun bəndi deyil.
3. Səhifənin öz bayrağı söndürülübsə səbəb `sideNavOff`.
4. Valideyndən bölmə kökünə qədər əcdadlardan (kök daxil deyil) birində bayraq söndürülübsə səbəb `parentSideNavOff`.
5. Səbəb 3 və ya 4 varsa kartda qeyd göstərilir: "Səhifənin özü açıq olanda sol menyuda görünür" (FR-015).

`placementUnder` yolu artıq gəzir. O, əlavə olaraq `sideNavHiddenAncestor` qaytarır. Admin ağacının node-larında
`flags.showInSideNav` var (R4, cavab).

**Bilərəkdən modelləşdirilmir**: Haqqımızda və Media şablonunun iki səviyyə limiti (`NAV_DEPTH = 2`). Panel şablonun hansı bölmədə
olduğunu bilmir (bölmə başlıqla tanınır, `SECTION_TITLES` saytdadır), bu limit də yeni bayraqla bağlı deyil. Kart bu gün də onu
göstərmir. FR-017 bayraq qaydalarına aiddir, spec-də bu dəqiqləşdirildi.

## R8 — "5 dəqiqə" qeydi köhnəlib

**Decision**: `pages.json` `menuVisibility.hint` mətni dəyişir: "Dəyişiklik saytda bir neçə saniyə ərzində görünür." (en uyğun).

**Rationale**: ağac `cachedJson` ilə keşlənir, ömrü `CONTENT_REVALIDATE_SECONDS = 10`-dur
(`web-cbar-new/src/shared/constants/cache.ts`), stale-while-revalidate ilə. 300 saniyə köhnə dəyər idi (`pages.api.ts` şərhi).
Admin `menu-visibility.ts` başlığındakı istinad (`web-cbar-new/src/shell/nav.ts MAX_DEPTH`) də yoxlanılır və sol menyu
qaydasının yeri (`entities/page-node` `isInSideNav`) ora əlavə olunur.

## R9 — Deploy sırası və uyğunluq

| Vəziyyət | Nəticə |
|---|---|
| Yeni admin API + köhnə api-cbar | Bayraq saxlanır, sayt hələ görmür. Hamı görünür, zərər yoxdur |
| Yeni api-cbar + köhnə sayt | Sayt sahəni `passthrough` ilə qəbul edir, istifadə etmir |
| Yeni sayt + köhnə api-cbar | Sahə yoxdur, hamı görünür (FR-011) |
| Yeni panel + köhnə admin API | Bayraq default açıq göstərilir. Göndərilən sahəni köhnə API nəzərə almır (System.Text.Json naməlum sahəni atır). Söndürülən dəyər saxlanmır: panel yalnız admin API-dən sonra deploy olunmalıdır |
| Köhnə panel + yeni admin API | Bayraq göndərilmir, dəyər dəyişmir (R4) |

Sıra: `api-cbar-admin` → `api-cbar` → `web-cbar-new` və `web-cbar-admin-new`. Konstitusiya IV ilə eynidir.

## R10 — Verification

API-lərdə test layihəsi yoxdur (konstitusiya VIII.1). Docker bu maşında işləmir, ona görə miqrasiya və endpoint PGlite +
socket ilə real SQL üzərində yoxlanılır (layihənin mövcud üsulu). Frontend-lərdə `npm run verify` işlədilir: Vitest + MSW,
handler-lər yeni sahə ilə yenilənir. Node 22 ilə də yoxlanılır, çünki CI-da odur.
