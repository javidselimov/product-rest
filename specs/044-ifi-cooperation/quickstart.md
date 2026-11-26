# Quickstart / validation: spec 044

Ön şərtlər: .NET 10 SDK (`C:/Program Files/dotnet`, PATH-da olmaya bilər), Node 24 (lokal) və Node 22 (CI ilə eyni testlər üçün).
Bu maşında Docker işləmir: API-lər PGlite + socket üsulu ilə real SQL üzərində yoxlanılır (bax memory "API-ləri Docker-siz yoxlamaq").
Ünvanlar və login: `product-rest/api-cbar-admin/CREDENTIALS.md`.

## 1. Migration və seed

1. Boş bazada `api-cbar-admin`-i başlat → `schema_migrations`-də `0025-ifi-organizations.sql`, `0026-ifi-organizations-seed.sql`.
   Gözlənən: 4 `ifi_organizations` (published), DB üçün 5 `ifi_memberships`, hər birinin az/en tərcüməsi.
2. Seed-in `DO` blokunu ikinci dəfə işlət → sayılar dəyişmir (NOTICE "already exists").
3. Səhifə 121 köhnə başlıqla → az başlıq "Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq", məzmunun əvvəlində giriş.
   Başlığı əvvəlcədən başqa dəyərə dəyiş → seed səhifəyə toxunmur.
4. `api-cbar` `cbar_web_ro` ilə qoşulur, `SELECT` keçir.

## 2. Admin API (`:5253`)

- `POST /api/v1/auth/login` → token.
- `POST /api/v1/ifi-organizations` boş `translations` → 400 problem+json; düzgün body → 201.
- `POST /{id}/memberships`, `PUT …/order` səhv dəstlə → 400; düzgün → 204. `DELETE /{id}` → 204, siyahıda yoxdur.
- Loqo kimi istifadə olunan media-nı `DELETE /api/v1/media/{id}` → 409.
- `ifi.*` icazəsi olmayan rol → 403. `audit_log`-da `ifi.*` sətirləri.

## 3. Public API (`:5139`)

- `GET /api/v1/ifi-organizations?locale=az` → 4 element, sort ilə; `?locale=en` → en adlar.
- Bir təşkilatı draft et, birini sil, birində `showEn=false` → müvafiq dildə görünmür.

## 4. Kontrakt və frontend qapıları

- `node .claude/skills/sync-openapi/scripts/route-diff.mjs` (hər iki API) → fərq yoxdur; `openapi/` `npm run lint`.
- `diff -rq product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` → boş.
- `dotnet build` hər iki API.
- `product-rest/web-cbar-new`: `npm run verify` (Node 24 və 22-də test).
- `product-rest/web-cbar-admin-new`: `npm run verify`, sonra `npm run roundtrip -- "Beynəlxalq təşkilatlarla əməkdaşlıq"`.

## 5. Sayt (`:3001`)

- `/az/beynelxalq-teskilatlarla-emekdasliq` və `/en/cooperation-with-international-organizations`: başlıq, giriş, "Əməkdaşlıq edilən təşkilatlar", 4 kart,
  hamısı bağlı, köhnə `<p><strong>` siyahısı görünmür.
- 1728px-də Edge CDP `getBoundingClientRect` ilə `contracts/ui-contract.md` ölçüləri (kart 984×92, tarix kartı 306×123, gap 16); 744 və 390-da sütunlar.
- JS söndürülmüş: kartlar açılır/bağlanır. Çap önizləməsi: hamısı açıq.
- Public API-ni dayandır → səhifə açılır, CMS məzmunu tam görünür, kart yoxdur.
- Test API-də endpoint hələ yoxdursa: MSW fikstürü + test API-yə forward edən Node proxy (memory "Fikstür proxy ilə UI ölçmə").
