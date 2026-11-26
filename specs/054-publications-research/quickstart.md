# Quickstart: spec 054 — yoxlama

Docker bu maşında işləmir. API-lər PGlite + socket ilə real SQL üzərində yoxlanır (yaddaş: "API-ləri Docker-siz yoxlamaq"). Köməkçi skriptlər repo-lokal
`.tmp-pubs/` qovluğundadır və commit olunmur. Ünvanlar kök `CLAUDE.md`-dədir. Kontraktlar:
- `contracts/public-api.md`
- `contracts/admin-api.md`
- `contracts/admin-ux.md`
- `contracts/publication-markup.md`
- `contracts/ui-contract.md`

## 1. Seed generatoru (faza 1: ağac)

1. `node specs/054-publications-research/seed/extract-tree.mjs` iki mənbədən oxuyur:
   - Figma dump-larından (`seed/figma-texts.json`, commit olunur) giriş mətnlərini və başlıqları;
   - test API-dən bölmə səhifələrinin bugünkü az/en mətnini və md5-ni.

   Çıxış hər səhifə üçün belədir: `slug, legacy title, legacy md5, figma title, figma intro`.
2. `node specs/054-publications-research/seed/build-tree-seed.mjs` → `api-cbar-admin/db/migrations/0041-publications-tree-seed.sql`. Faylı ikinci dəfə
   qurmaq eyni baytları verir.

## 2. Sxem, ağac və ölçü düzəlişi (api-cbar-admin)

1. Hər iki API üçün `dotnet build` işlədilir (`dotnet` PATH-da yoxdursa: `C:/Program Files/dotnet`). `diff -rq product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain`
   boş qaytarmalıdır.
2. PGlite bazasına `0001…0037` tətbiq olunur. Test API-dən bu səhifələr yüklənir: bölmə (62–76, 371-in ağacı), istehlakçı bölməsi (87, 102, 103) və onların `page_details`-i.
3. API başladılır, `0038…0041` tətbiq olunur. Gözlənilən nəticə:
   - `NOTICE spec 054: groups 2 created, moved 11, hidden 6, titles N, intros N`;
   - ağac `data-model.md` "Ağac seed-i" ilə eynidir;
   - 102 üçün `show_in_side_nav = false`, `page_nav_details.show_in_dropdown_nav = true`;
   - 103 üçün `show_in_side_nav = true`;
   - 87-nin qalan uşaqlarının sırası dəyişməyib.
4. API yenidən başladılır: heç nə dəyişmir. 66-nın az mətnini əl ilə dəyişib seed-i yenidən işlətmək: Figma girişi yazılmır.
5. Boş bazada (`0001…0041`, səhifəsiz) xəta yoxdur, sətir yaranmır, yalnız `NOTICE` çıxır.
6. **Ölçü düzəlişi**:
   - Lokal MinIO-ya iki fayl qoyulur, media sətrinə saxta `size_bytes = 1064` yazılır, API başladılır. Log: `media sizes: checked 2, fixed 2, missing 0`.
     `size_bytes` real ölçüdür, `media_asset_details`-də iki sətir var.
   - İkinci start-da yoxlama olmur (`checked 0`).
   - Obyekti olmayan media sətri üçün log `missing 1` olur, sətir yenə yazılır.
   - İki API instansı eyni anda işlədilir: yalnız biri işləyir (advisory lock).

## 3. Admin API

`POST /api/v1/auth/login`, sonra:

| Sorğu | Gözlənilən |
|---|---|
| `POST /working-papers` düzgün (az + en) | 201, `code "02/2025"`; `audit_log`-da `working_papers.create` |
| eyni `number`+`year` ilə ikinci `POST` | 409 `problem+json` |
| `number: 0`, `year: 1980` | 400, `errors.number`, `errors.year` |
| hər iki dildə başlıqsız | 400, `errors.translations` |
| az başlıq var, müəllif yoxdur | 400, `errors.translations[0].authors` |
| `jelCodes: ["E5x"]` | 400 |
| `mediaId` = şəkil | 400 |
| `GET /working-papers?year=2025&status=published&q=likvid` | süzülmüş `{items,total,page,pageSize}` |
| `DELETE /working-papers/{id}` | 204; həmin nömrə/il ilə yeni `POST` 201 (partial unique) |
| `PUT /pages/{id}` `showInDropdownNav` göndərilmir | saxlanılan dəyər qalır |
| `PUT /pages/{id}` `showInDropdownNav: null` | saxlanılan dəyər qalır (`contracts/admin-api.md`: `null` = göndərilməyən) |
| `PUT /pages/{id}` dəyər sol menyu bayrağına bərabərdir, sətir yoxdur | `page_nav_details` sətri yazılmır, dəyər `null` qalır |
| `PUT /pages/{id}` `menuGroup` 121 simvol | 400 (`DbExceptionHandler`); panel 120 ilə məhdudlaşdırır |
| `PUT /pages/{id}` en tərcüməsində `menuGroup` göndərilmir | en etiketi qalır |

## 4. Public API (api-cbar, `cbar_web_ro`)

| Sorğu | Gözlənilən |
|---|---|
| `GET /api/v1/working-papers?locale=az` | dərc olunmuş və az başlıqlı məqalələr, sıra il ↓ nömrə ↓, xülasəsiz |
| `GET …?locale=en` | yalnız en başlıqlı məqalələr |
| `GET /api/v1/working-papers/02-2025?locale=az` | detal: `abstract`, `jelCodes`, `file.sizeBytes` |
| `GET /api/v1/working-papers/2-2025`, `/99-2025` | 404 |
| draft və ya silinmiş məqalə | siyahıda yoxdur, detal 404 |
| `GET /api/v1/pages/tree?locale=az` | 102: `showInSideNav false`, `showInDropdownNav true`, `menuGroup "Ödəniş sistemləri"`; 66, 67, 69, 76: `menuGroup "Strategiyalar və konsepsiyalar"`; digərlərində hər iki sahə `null` |
| `cbar_web_ro` ilə `INSERT INTO working_papers …` | permission denied |

`route-diff.mjs` hər iki API-də təmiz qalmalıdır.

## 5. Admin panel

`cd product-rest/web-cbar-admin-new && npm run verify` keçməlidir (lint, `check:kit`, `check:i18n`, `check:layout-fixtures`, `tsc -b`, test, build).
`npm run roundtrip -- "Haqqımızda" "Pul siyasəti" "İllik hesabat"` dəyişməz qalmalıdır: redaktora extension əlavə olunmur, iki yeni fixture bayt-bayt saxlanılır.
Əl ilə yoxlama (`npm run dev`, :5174):

- Sidebar-da "İşçi məqalələri" İstehlakçı hüquqlarından sonra, Sual-cavabdan əvvəl görünür.
- Məqalə yaradılır: JEL "c22, E53, , C22" yazılır, yadda saxlanır, yenidən açılır. Nəticə "C22, E53" olmalıdır.
- Forma dəyişdirilib başqa menyuya keçiləndə panel təsdiq soruşur.
- "Səhifələr" → İşçi məqalələri: sol menyuda "İşçi məqalələri" aktivdir, formada keçid kartı var.
- "Səhifələr" → Ödəniş xidmətləri: "Yalnız açılan menyularda" seçilidir. Bölmə kökündə bu seçim deaktivdir.

## 6. Sayt

`cd product-rest/web-cbar-new && npm run verify` keçməlidir. Testlər Node 22 ilə də işlədilir. Əl ilə yoxlama (`npm run dev`, :3001):

| Ünvan | Gözlənilən |
|---|---|
| `/az/isci-meqaleler-silsilesi` | giriş, filtr, "Bütün məqalələr", 10 sətir, səhifələmə |
| `…?q=muxtarov`, `…?q=İNFLYASİYA` | böyük-kiçik hərf və İ/ı fərqi olmadan nəticə |
| `…?year=2024`, sonra "Filtrləri təmizlə" | yalnız 2024, sonra hamısı |
| `…?q=zzzz` | boş vəziyyət + "Filtrləri təmizlə" |
| `…?page=99` | son səhifə |
| sətrə klik → `/az/isci-meqaleler-silsilesi/02-2025` | breadcrumb "… › Tədqiqatlar › İşçi məqalələri › <başlıq>", meta, xülasə, açar sözlər mətn, PDF kartı ölçü ilə |
| en dilinə keçid detalda | `/en/working-paper-series/02-2025` və ya (en-də yoxdursa) en siyahısı |
| `/az/isci-meqaleler-silsilesi/01-1999` | 404 |
| api-cbar `GET /working-papers` 500 | səhifə 73-ün köhnə mətni il arxivi kimi, linklər adi link |
| `/az/illik-hesabat` | "İl" = 2025, yalnız 2025 kartları; şrift linki seçimin üstündə kart kimi |
| `/az/illik-hesabat?year=all` | bütün illər azalan, qruplar arası 40 |
| `/az/reqemsal-firildaqciliq-statistikasi` | breadcrumb bu bölmədən, istehlakçı bölməsində yoxdur |
| `/az/odenis-xidmetleri` | sol menyuda yoxdur, mega menyunun "Nəşrlər…" sütununda var; mobil siyirtmədə var |
| `/az/kreditlesme-fealiyyeti-ve-maliyyelesme-menbelerine-dair-sorgu` | açılır (il arxivi), heç bir menyuda yoxdur, sol menyuda aktiv bənd yoxdur |
| `/az/risk-esasli-nezaret-uzre-siyaset-konsepsiyasi` | Figma girişi və bir kart (ad, PDF çipi, ölçü) |
| `/az/ekonometrik-modeller` | giriş və səhifə faylından qurulan kart |
| JS söndürülüb | axtarış, il menyusu, səhifələmə və sol menyu qrupları işləyir |

Son faza (köçürmə) üçün əlavə yoxlama:
- `/page-895/nowcasting-household-consumption?language=en` → 308 → `/en/working-paper-series/02-2025`.
- Xəritədə olan, amma bazada olmayan açar → 307 → siyahı.

**Ölçmə**: 1728, 744 və 390 enliklərində Figma rəqəmləri (`contracts/ui-contract.md`) DOM-dakı `getBoundingClientRect` ilə tutuşdurulur, fərq ≤ 2 px olmalıdır (SC-001).
Test API-də endpoint hələ yoxdursa: MSW fikstürü + test API-yə forward edən Node proxy işlədilir (yaddaş: "Fikstür proxy ilə UI ölçmə"), ölçmə Edge CDP ilə aparılır.

## 7. Köçürmə (son faza, FR-028)

1. `node specs/054-publications-research/seed/extract-papers.mjs` canlı cbar.az-dan oxuyur və `working-papers.json` yazır. Yoxlama çıxışı:
   - `az 77 links / 76 ids`, `en 78 / 77`;
   - hər məqalədə nömrə, il, başlıq, müəllif və PDF var;
   - yarımçıq sətirlər ayrıca siyahıda göstərilir.
2. PDF-lər `upload-media.mjs` ilə admin API-yə yüklənir. Təkrar işlətmək yeni media yaratmır (SHA-256).
3. `build-papers-seed.mjs` iki fayl yaradır: `0042-working-papers-seed.sql` və `web-cbar-new/src/shared/config/legacy-working-papers.ts`.
4. Seed iki dəfə işlədilir: ikinci dəfə 0 sətir yaranır. Siyahıdakı say köhnə linklərin sayına bərabər olmalıdır (SC-007).

## 8. Sənədlər

- `web-cbar-new/docs/publications-cms-guide.md` (yeni): şablonun formaya görə seçilməsi, il akkordionu, sənəd kartı, menyu seçimləri.
- `dokumentasiyalar/nesrler-ve-tedqiqatlar-guide.md` (yeni, azərbaycanca) və `dokumentasiyalar/README.md` sətri.
- Kök `CLAUDE.md`: web-cbar-new bəndi (bölmə şablonu, işçi məqalələri, `showInDropdownNav`, `menuGroup`), admin bölməsi, media ölçüsü düzəlişi.
- `web-cbar-new/CLAUDE.md`, `web-cbar-admin-new/CLAUDE.md`.
- `specs/046-international-memberships/contracts/admin-nav.md` (sidebar sırası).
- `web-cbar-new/docs/consumer-rights-cms-guide.md`: iki səhifə bu bölməyə köçüb.
- `business_logic/` (`/sync-business-logic`) və hər iki API-nin `openapi/` (spec-first, kod yazılmazdan əvvəl).
