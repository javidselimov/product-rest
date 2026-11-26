# Research: Media → Tədbirlər (spec 034)

Ölçmələr 2026-11-04 test mühitində və cari kodda aparılıb. Test bazası kiçikdir, prod ölçülməyib.

## R1. Tədbir press-reliz deyil, ayrıca entity-dir

**Decision**: Yeni `events` cədvəlləri, press-relizə istəyə bağlı istinad.

**Rationale**: `api-cbar` relizi `PublishedAt <= now` ilə süzür, gələcək tədbir isə görünməlidir. Tarix aralığı, saat, məkan,
bölmə relizdə yoxdur. Figma-dakı bəzi tədbirlərin relizi yoxdur.

**Alternatives**: `type = 4` + `*_details`: embargo istisnası, xəbər siyahısı və axtarış qarışır. CMS markup-ı: filtr və
gələcək/keçmiş ayrımı etibarlı deyil.

## R2. Köhnə 6 tədbir ilkin tarixlə miqrasiyada yaranır

**Decision**: `0019-events-legacy-seed.sql` səhifəni az slug-a görə tapır, `events` + `event_translations` yazır.

**Rationale**: Miqrasiya bir dəfə işləyir, ona görə sonrakı deploy redaktor dəyişikliyinin üzərinə yazmır. `pages`-ə yazılmır.
`NOT EXISTS (page_id)` təkrar sətrin qarşısını alır. Tapılmayan slug `RAISE NOTICE` ilə keçilir, deploy dayanmır.

**Risk**: Slug-lar test mühitində ölçülüb, prodda ölçülməyib. Prod-da səhifə tapılmazsa tədbir yaranmır və redaktor paneldən
əlavə edir. Bu, deploy-dan sonrakı yoxlamadadır (quickstart Q6).

| Az slug (test) | Səhifə | Tarix |
|---|---|---|
| `cop29` | `#209` | 2024-11-14 |
| `azerbaycan-merkezi-bankciligi-105-il` | `#212` | 2024-09-30 |
| `azerbaycan-merkezi-bankciligi-100-il` | `#215` | 2019-09-28 |
| `heyder-eliyev-90-il` | `#224` | 2013-05-08 |
| `heyder-eliyev-100-il` | `#223` | 2023-05-10 (təxmini) |
| `ar-merkezi-banki-20-il` | `#225` | 2012-01-16 (təxmini) |

## R3. Köhnə səhifələr gizlədilmir, alt ağac menyularda süzülür

**Decision**: `Visible=false` istifadə olunmur. `shell/nav.ts` və `section-shell/model.ts` Tədbirlər node-unun uşaqlarını
göstərmir; cari səhifə həmin alt ağacdadırsa sol menyu əvvəlki kimi qalır.

**Rationale**: `PagesController.GetTree` valideyni görünməyən node-u kök sayır: "Roots: no parent, or parent not visible".
6 kök gizlədilsəydi, COP29-un "Fotoqalereya" kimi uşaqları üst menyuya çıxardı. Ağacda qalmaq breadcrumb-ı (`findChainBy`) və
köhnə səhifənin sol menyusunu da qoruyur. `GetBySlug` `Visible`-ə baxmır, amma bu artıq lazım deyil.

**Alternatives**: 23 səhifəni gizlətmək: breadcrumb qırılır, 23 əl addımı hər mühitdə. `GetTree`-ni dəyişmək: bütün sayta
təsir edir.

## R4. Menyu keçidi slug-a görədir, `navUrl` yox

**Decision**: `FEATURE_ROUTES`-a `tedbirler` və `events` → `media/events` (üst menyu), `entities/page-node` `isEventsNode` +
`nodeHref` (sol menyu və breadcrumb). `nodeHref` `FEATURE_ROUTES`-u bilmir, ona görə ikisi də lazımdır.

**Rationale**: Qalereya və video bu yolu işlədir. Sayt deploy-u ilə avtomatik işləyir, hər mühitdə redaktor addımı tələb etmir.
`navUrl` təyin olunsa da prioritet odur, ziddiyyət yoxdur. `#84` mətni `#209` ilə eynidir (normallaşdırılmış müqayisə, 1037 simvol),
ona görə heç nə itmir. `/az/tedbirler` açıq qalır.

## R5. Gələcək/keçmiş serverdə hesablanır

**Decision**: `api-cbar` Bakı gününü `UTC + 4` ilə hesablayır (`PressReleasesController.BakuOffset`) və `upcoming` sahəsini
qaytarır. Sayt tarix məntiqini təkrarlamır.

**Rationale**: Azərbaycanda DST yoxdur, sabit offset dəqiqdir. Köhnə mock UTC idi və gecə 00:00–04:00 arası səhv idi.

## R6. "Daha çox göstər" `limit` parametridir

**Decision**: Sayt `pageSize = limit` (addım 10) ilə bir sorğu göndərir. `GET /events` üçün `pageSize` tavanı 500-dür.

**Rationale**: JS-siz işləyir, link paylaşılır, sıralama bir yerdədir. Tədbirlər ildə onlarladır, 500 onilliklərə çatır.

**Alternatives**: Client-də yığmaq: `'use client'` və JS asılılığı. Çox səhifəli paralel sorğular: sorğu sayı artır.

## R7. Qalereya detal cavabının içindədir

**Decision**: `GET /events/{slug}` şəkilləri özü qaytarır, sayt mövcud `widgets/photo-gallery`-ni işlədir.

**Rationale**: Bir sorğu. `GetGallery` kimi süzülür (`IsActive`, soft-delete). Bağlılıq qırıqdırsa boş massiv.

## R8. Bölmə silinməsi: sərt, istifadədə olanda 409

**Decision**: `event_categories`-də `deleted_at` yoxdur. Silinməmiş tədbirə bağlı bölmə `ConflictProblem` verir. FK `ON DELETE SET
NULL` soft-deleted tədbirləri qoruyur.

**Rationale**: Bölmə sadə lookup-dır, deaktiv etmək gizlətmə ehtiyacını ödəyir.

## R9. Admin CRUD mühərrikində `time` tipi və axtarışlı `select`

**Decision**: `FieldType`-a `time`, `select`-ə `searchable` bayrağı (kit `Combobox`). Seçimlər `pages/laws` nümunəsi ilə yüklənir:
`pages/events` `LookupGate` + `buildEventsModule(choices)`. Mənbələr: `/event-categories`, `/galleries` və `/press-releases`
(ən yeni 100), `/pages/tree` (düzləndirilir). Siyahıdan kənar qalan bağlılığın adı detail-dən gəlir (`mediaNameKey`).

**Rationale**: Hazır nümunə var, yeni `lookup` sahə tipi lazım olmadı. Feature-lər bir-birini import etmir, ona görə
kompozisiya `pages/` qatındadır.

## R10. Axtarışda səhifəyə bağlı tədbir yoxdur

**Decision**: `SearchController` yalnız `PageId == null` tədbirləri qaytarır.

**Rationale**: Bağlı tədbirin səhifəsi axtarışda artıq var, ikinci nəticə eyni yerə aparardı.

## R11. Bir yerdə Figma-dan sapma

Press-reliz linki Figma-da yoxdur (istifadəçi qərarı 3). Mətndən sonra sadə link, `ui-contract.md` §6.
