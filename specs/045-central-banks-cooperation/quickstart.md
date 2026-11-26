# Quickstart / validation: spec 045

Ön şərtlər: .NET 10 SDK (`C:/Program Files/dotnet`, PATH-da olmaya bilər), Node 24 (lokal) və Node 22 (CI ilə eyni testlər üçün).
Bu maşında Docker işləmir: API-lər PGlite + socket üsulu ilə real SQL üzərində yoxlanılır (memory "API-ləri Docker-siz yoxlamaq").
Ünvanlar və login: `product-rest/api-cbar-admin/CREDENTIALS.md`.

## 1. Migration və seed

1. Boş bazada `api-cbar-admin`-i başlat → `schema_migrations`-də `0027-memorandums.sql`, `0028-memorandums-seed.sql`.
   Gözlənən: 28 `memorandums` (published), 56 `memorandum_translations`.
2. Seed-in `DO` blokunu ikinci dəfə işlət → sayılar dəyişmir (NOTICE "already exists").
3. Səhifə 122 köhnə məzmunla (`<p><strong>İsveçrə Milli Bankı…`) → az və en məzmunun əvvəlində giriş paraqrafı, köhnə mətn yerində.
   İkinci işləmə → giriş ikiləşmir. Məzmunu əvvəlcədən başqa mətnlə başlat → seed səhifəyə toxunmur.
4. `api-cbar` `cbar_web_ro` ilə qoşulur, `SELECT` keçir.

## 2. Admin API (`:5253`)

- `POST /api/v1/auth/login` → token.
- `POST /api/v1/memorandums` boş `translations`, boş `country` və ya `signedYear: 1800` → 400 problem+json; düzgün body → 201.
- `PUT /{id}` → 200; `DELETE /{id}` → 204, siyahıda yoxdur. `GET /?search=türkiyə` → uyğun sətirlər.
- `memorandums.*` icazəsi olmayan rol → 403. `audit_log`-da `memorandums.*` sətirləri.

## 3. Public API (`:5139`)

- `GET /api/v1/memorandums?locale=az` → 28 element, 2026 → 1996, il daxilində sort ilə; `?locale=en` → en adlar.
- Bir sətri draft et, birini sil, birində `showEn=false` → müvafiq dildə görünmür.

## 4. Kontrakt və frontend qapıları

- `node .claude/skills/sync-openapi/scripts/route-diff.mjs` (hər iki API) → fərq yoxdur; `openapi/` `npm run lint`.
- `diff -rq product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` → boş.
- `dotnet build` hər iki API.
- `product-rest/web-cbar-new`: `npm run verify` (Node 24 və 22-də test).
- `product-rest/web-cbar-admin-new`: `npm run verify`, sonra `npm run roundtrip -- "Mərkəzi banklarla əməkdaşlıq"`.

## 5. Sayt (`:3001`)

- `/az/merkezi-banklarla-emekdasliq` və `/en/cooperation-with-central-banks`: başlıq, giriş, cədvəl başlığı, çeşidləmə, 28 sətir; köhnə
  `<p><strong>` bank mətnləri görünmür.
- `?sort=oldest` → 1996 yuxarıda, 2026-nın yeddi sətri öz aralarında əvvəlki sıra ilə; `?sort=xyz` → standart sıra.
- 1728, 744, 390px-də Edge CDP `getBoundingClientRect` ilə `contracts/ui-contract.md` ölçüləri; 390-da üfüqi sürüşmə yoxdur.
- JS söndürülmüş: çeşidləmə siyahısı açılır, link sıranı dəyişir. Çap önizləməsi: düymə yoxdur, cədvəl tamdır.
- Public API-ni dayandır → səhifə açılır, CMS məzmunu tam görünür, cədvəl yoxdur.
- Test API-də endpoint hələ yoxdursa: MSW fikstürü + test API-yə forward edən Node proxy (memory "Fikstür proxy ilə UI ölçmə").

## 6. Admin panel (`:5174`)

- Menyuda "Memorandumlar"; siyahıda təşkilat, ölkə, il, status; axtarış işləyir.
- Yeni memorandum (az + en, il) → dərc → saytda ilinə uyğun yerdə. Boş ölkə və ya səhv il → sahə xətası, saxlanmır.
