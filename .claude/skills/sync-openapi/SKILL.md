---
name: sync-openapi
description: >-
  product-rest/api-cbar/openapi və product-rest/api-cbar-admin/openapi altındakı əl ilə
  saxlanılan OpenAPI 3.1 spec-lərini controller kodu ilə sinxronlaşdırır: yeni/silinmiş
  endpoint-lər, parametrlər, request DTO-ları, cavab proyeksiyaları, status kodları.
  Default inkremental — son sync commit-indən bəri dəyişən C# fayllarına görə; `--full`
  bütün spec-i koddan yoxlayır; API adı (`api-cbar`, `api-cbar-admin`) və ya resurs açarı
  (`laws`, `homepage` …) əhatəni daraldır. Use when the user asks to sync/update/refresh
  the OpenAPI spec, or after controller/DTO/entity changes in api-cbar or api-cbar-admin.
---

# /sync-openapi [api-cbar|api-cbar-admin] [--full] [resurs ...]

Məqsəd: hər iki API-nin `openapi/` spec-i controller-lərin **indiki** davranışını təsvir etsin.

| Spec | Kod | Konvensiyalar |
|---|---|---|
| `product-rest/api-cbar/openapi/` | `src/Cbar.WebApi/Controllers/*`, `Program.cs`, `src/Cbar.Domain/*` | `api-cbar/openapi/README.md` |
| `product-rest/api-cbar-admin/openapi/` | `src/Cbar.AdminApi/Controllers/*`, `Services/*`, `Program.cs`, `src/Cbar.Domain/*` | `api-cbar-admin/openapi/README.md` |

Spec-lər **əl ilə** yazılır, generasiya olunmur: controller-lər anonim tip qaytardığı üçün
runtime `/openapi/v1.json`-da cavab sxemi yoxdur (admin-də request sxemləri var, amma
`required` siyahıları səhvdir). Ona görə bu skill kodu oxuyub YAML-ı özü yazır.

## Qəti qaydalar

- **Kod dəyişdirilmir.** `src/`, `db/` yalnız oxunur. Kodda bug görsən — spec-də "düzəltmə",
  mövcud davranışı yaz və `x-known-issues`-a əlavə et (admin: `openapi.yaml` → `info.x-known-issues`;
  api-cbar: README-dəki kimi). Düzəliş ayrıca MR-dır.
- Yalnız `openapi/openapi.yaml`, `openapi/paths/*`, `openapi/components/**`, `openapi/.redocly.lint-ignore.yaml`
  yazılır; konvensiya həqiqətən dəyişibsə `openapi/README.md`. `scripts/`, `package*.json`,
  `redocly.yaml` toxunulmur. `dist/` gitignore-dadır.
- **Commit edilmir.** Sonda nəyin dəyişdiyini bildir.
- **Əvvəl README-ni oxu** — hər API-nin `openapi/README.md`-si konvensiyaların mənbəyidir
  (operationId adları, cavab kodu cədvəli, nullability qaydaları, sxem adlarında domen prefiksi).
  Mövcud qonşu əməliyyatlara bənzət: yeni CRUD resursu artıq olan CRUD resursu kimi görünməlidir.
- Hər sahə koddan yoxlanılır. Sahə kodda yoxdursa spec-də də yoxdur; kodda olan hər sahə spec-də var.
- YAML fayllar UTF-8 (BOM-suz), mətnlər (summary/description) **ingiliscə**, mövcud üslubda qısa.
- Bu maşında .NET SDK yoxdur — API-ni lokalda işə salmağa cəhd etmə. Statik yoxlama
  (`route-diff.mjs`) və deploy olunmuş test API-yə qarşı `drift` kifayətdir.

## Addım 0 — arqumentlər

- API adı yoxdur → hər ikisi. `api-cbar` / `api-cbar-admin` → yalnız o.
- `--full` → Addım 2-ni keç, hər controller "dəyişib" sayılır.
- Resurs açarı = `paths/<açar>.yaml` faylının adı (`laws`, `media-content`, `statistics` …) → yalnız
  həmin faylın path-ləri və onların istifadə etdiyi sxemlər. Naməlum açar → `paths/` siyahısını göstər, dayan.

## Addım 1 — hazırlıq və son sync nöqtəsi

Hər seçilmiş API üçün `product-rest/<api>/openapi/`-də:

```bash
[ -d node_modules ] || npm ci     # korporativ CA xətası → NODE_EXTRA_CA_CERTS (strict-ssl=false yox); lockfile dəyişməsin
```

`openapi.yaml`-ın **ilk sətri** sync markeridir:

```yaml
# Sync: <qısa-hash> · YYYY-MM-DD · inkremental|tam
```

- Varsa → `BASE` = o hash.
- Yoxdursa → `git log -1 --format=%h -- product-rest/<api>/openapi` (spec-in son commit-i).

## Addım 2 — nə dəyişib

Root reposunda:

```bash
git diff --name-status <BASE> -- product-rest/<api>/src
git ls-files --others --exclude-standard -- product-rest/<api>/src
```

`bin/`, `obj/`, `appsettings*.json`, `*.http`, `MigrationRunner.cs`, `Properties/` nəzərə alınmır.

| Dəyişən fayl | Spec-ə təsiri |
|---|---|
| `Controllers/*.cs` | həmin controller-in bütün əməliyyatları (route, parametrlər, body, cavab, status kodları); faylın içindəki `record` DTO-lar |
| `src/Cbar.Domain/Entities/*` | bu entity-ni proyeksiya edən cavab sxemlərindəki tip/nullability — sahə adını spec-də və controller-lərdə Grep et |
| `CbarDbContext.cs`, `db/migrations/*` | adətən yoxdur; yalnız `maxLength` və ya enum dəyərləri spec-də varsa |
| `Program.cs` | auth (401/403), rate limiter (429), JSON seçimləri (enum-ların string olması), MVC xaricində map olunan endpoint-lər (`/healthz`) |
| `Services/*` (admin) | servisin qaytardığı və cavaba düşən formalar (auth token-ləri, media yükləmə, slug generasiyası təsvirləri) |

Heç nə dəyişməyibsə, `--full`/resurs verilməyibsə **və** Addım 3 fərq göstərmirsə → "sync lazım deyil, BASE = …" de, dayan.

## Addım 3 — statik route fərqi (həmişə)

```bash
cd product-rest/<api>/openapi && npm run bundle
node .claude/skills/sync-openapi/scripts/route-diff.mjs <api|all>    # root-dan
```

Skript controller-lərin `[Route]`/`[HttpX]` atributlarından `METHOD path` siyahısını çıxarıb
`dist/openapi.json` ilə tutuşdurur — **lokal kodu** göstərir (`npm run drift` isə test-ə deploy olunanı).
İnkremental rejimdə də işlət: əvvəlki sync-lərdə buraxılmış endpoint-ləri də tutur.
Route çıxarışı `scripts/routes.mjs`-dədir və `.claude/hooks/spec-first.mjs` hook-u ilə ortaqdır —
onu dəyişəndə hər ikisini yoxla.

- `+ in code, missing from spec` → yeni əməliyyat (Addım 4).
- `- in spec, not in code` → kodda silinib: `openapi.yaml`-dakı path xəritəsindən, `paths/*.yaml`-dan və artıq
  heç kimin istinad etmədiyi sxemlərdən sil (Grep `$ref`-lərlə yoxla).
- `!` xəbərdarlıqları (action səviyyəsində `[Route]`) → həmin action-ı əl ilə yoxla.

## Addım 4 — spec-i yenilə

İş vahidi: təsirlənən hər **əməliyyat** (Addım 2-dən + Addım 3-dən). Controller → spec faylı
xəritəsi `openapi.yaml`-dakı `paths:` bölməsindədir (route prefiksi → `paths/<fayl>.yaml#/<açar>`).
Yeni resurs üçün fayl/tag seçimi: controller-in məntiqi qrupu (məs. public `image-popups`
`MediaContentController`-dədir → `media-content.yaml`, `MediaContent` tag-ı); uyğun fayl yoxdursa
yeni `paths/<resurs>.yaml` + `components/schemas/<resurs>.yaml`, tag isə `openapi.yaml`-da təsviri ilə.

Hər əməliyyat üçün kodu oxu və bunları tutuşdur:

1. **Path + path item**: `openapi.yaml` xəritəsi, path parametri path item səviyyəsində (`parameters.yaml`-dakı ortaq parametrlər — `Id`, `Slug`, `Locale`, `Page`, `PageSize` — varsa onlardan istifadə et). Route constraint (`{id:int}`, `{id:long}`, `{date:datetime}`) → parametrin tipi/formatı.
2. **Query parametrləri**: `[FromQuery]` və sadə tipli action parametrləri; default dəyərlər, clamp-lar (`Math.Clamp`), `string[]` olanlar.
3. **Request body**: DTO `record`-dan, admin README-dəki qaydayla (`required` = nullable olmayan bütün sahələr; `T?` required deyil; camelCase; translations map). `IFormFile` → `multipart/form-data`.
4. **Cavab sxemi**: proyeksiyadan (`Select(x => new { … })`), entity tipləri ilə; nullability proyeksiyadan (`?.`, `.FirstOrDefault()`, filtrsiz tərcümə). Siyahı forması: `{ items, total, page, pageSize }` / `{ items }` / çılpaq massiv — kodda hansıdırsa.
5. **Status kodları**: README-dəki cədvələ görə hər `return` yolu (`Ok`, `CreatedAtAction` + `Location`, `NoContent`, `NotFound()` vs `NotFound(new { message })`, `BadRequest`, `Conflict`, `File(...)`); `[Authorize]` → 401, `Roles=` → 403; public API-də hər əməliyyatda 429.
6. **Meta**: `tags`, `operationId` (README konvensiyası, unikal), `summary`, qeyri-aşkar davranış üçün qısa `description` (soft/hard delete, sıralama, silinmə şərtləri, embargo/locale filtri).
7. Kodda bug/qəribəlik → `x-known-issues` (mövcud siyahıda varsa yenilə, düzəlibsə sil).

`Cbar.Domain` dəyişibsə, eyni sahə hər iki spec-də ola bilər — hər iki API seçilibsə ikisini də yenilə.

Doğru qalan YAML-ı yenidən formatlama və ya yenidən ifadə etmə — diff kiçik və yoxlanıla bilən qalsın.

**Paralelləşdirmə**: 3-dən çox `paths/*.yaml` faylı təsirlənibsə (və ya `--full`), hər fayl üçün bir
`Explore` agenti işə sal (bir mesajda). Hər agentə ver: README-nin konvensiya hissəsi, path faylının və
istifadə etdiyi sxem fayllarının indiki mətni, aid controller fayl(lar)ı, "yalnız oxu; hər əməliyyat üçün
spec ↔ kod fərqlərini `fayl:sətir` sübutu ilə və təklif olunan YAML-ı qaytar". YAML-ı fayllara **özün**
yaz və agentin "yoxdur/fərqlidir" iddialarını kodda özün təsdiqlə.

## Addım 5 — yoxlama

`product-rest/<api>/openapi/`-də:

```bash
npm run lint      # 0 error olmalıdır; warning-ləri ya düzəlt, ya .redocly.lint-ignore.yaml-a səbəb şərhi ilə yaz
npm run bundle
node ../../../.claude/skills/sync-openapi/scripts/route-diff.mjs <api>   # 0 fərq olmalıdır
npm run drift     # test API-yə qarşı (şəbəkə lazımdır)
```

`drift` deploy olunmuş versiyanı görür. Lokal kodda olub test-ə hələ deploy olunmamış endpoint-lər
orada `- in spec, not in API` kimi görünəcək — bu gözləniləndir; spec-i deploy olunana uyğunlaşdırma,
sadəcə hesabatda göstər. `drift` başqa fərq tapırsa (məs. request body sahələri) — kodla tutuşdur və düzəlt.
`npm run contract` (admin üçün `ADMIN_USER`/`ADMIN_PASSWORD` olmadan yalnız 401 yolları) isteğe bağlıdır —
yalnız istifadəçi istəsə və ya dəyişiklik artıq test-ə deploy olunubsa.

## Addım 6 — sync markeri

Yalnız həqiqətən yoxlanmış API-lərdə, lint və route-diff təmiz olanda, `openapi.yaml`-ın ilk sətrini
yaz/yenilə: `# Sync: <git rev-parse --short HEAD> · YYYY-MM-DD · inkremental|tam`. İşçi ağacdakı commit
olunmamış dəyişikliklər də nəzərə alınıbsa sonuna `+ işçi ağac` artır.

Resurs filtri ilə işə salınıbsa hash-i **dəyişmə** — sətrin sonuna `· qismən: <resurslar> YYYY-MM-DD` artır.

## Addım 7 — hesabat (istifadəçiyə)

Qısa, Azərbaycan dilində, hər API üçün:
- `BASE → HEAD`, rejim, nəzərə alınan dəyişmiş fayl sayı;
- əlavə / silinən / dəyişən əməliyyatlar (`METHOD path` — nə dəyişdi, bir cümlə);
- yeni və ya silinən `x-known-issues`;
- `lint`, `route-diff`, `drift` nəticələri (drift-də deploy olunmamış kod səbəbli fərqlər ayrıca);
- yoxlaya bilmədiklərin (runtime davranışı, .NET build yoxdur);
- xatırlatma: dəyişikliklər commit olunmayıb.
