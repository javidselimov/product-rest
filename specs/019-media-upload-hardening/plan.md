# Implementation Plan: Media upload-da yaddaş (DoS) və təhlükəsizlik risklərinin aradan qaldırılması

**Branch**: `019-media-upload-hardening` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/019-media-upload-hardening/spec.md`

## Summary

İki upstream repo, iki müstəqil MR, cəmi ~5 SP (`api-admin-review.md` #11):

- **Yaddaş (~3 SP, `api-cbar-admin`)** — çərçivə 64 KB-dan böyük multipart faylı artıq `/tmp`-də
  saxlayır; yaddaşı tutan yalnız controller-in `MemoryStream` + `ToArray()` nüsxəsidir (R1). Nüsxə silinir:
  `file.OpenReadStream()` (seekable) → `SHA256.HashDataAsync` (eyni checksum, dedup qırılmır — R2) →
  `Position = 0` → `MediaStorage.PutAsync` (Minio 7 multipart, 5 MiB hissələr — R3). `RequestAborted`
  ötürülür (R4). Öz müvəqqəti faylımız yoxdur; çərçivənin faylı `DeleteOnClose`-dur. Yaddaş baseline-ı və
  nəticəsi `test`-də log sətri + pod metrikləri ilə ölçülür (R8).
- **Magic byte + ad (~1 SP, `api-cbar-admin`)** — `Validation/MediaUploadRules.cs`: ilk 1024 baytın
  11 tip üzrə imza cədvəli (R5, [data-model §2](./data-model.md#2-məzmun-imzaları-fr-005)) → yeni 400;
  fayl adı NFC + hər iki ayırıcı + `Cc`/bidi silinməsi + kod nöqtəsi ilə 255 kəsmə (R6,
  [data-model §3](./data-model.md#3-fayl-adı-qaydası-fr-007-fr-008)).
- **SVG (~1 SP, `api-cbar`)** — public `GET /media/{id}` 200-ə hər fayl üçün `nosniff` və admin preview ilə
  eyni `sandbox` CSP — SVG **və** XML vektoru bağlanır, seed dəyişmir (R7). PDF istisnası §1c ölçməsindən
  sonra silindi (PDF CSP ilə açılır).
- **OpenAPI (spec-first)** — hər iki API-də təsvir/başlıq/400 halı; admin `x-known-issues`-dən yaddaş
  sətri silinir ([contracts/](./contracts/)).

**Deploy-dan əvvəl iki qapı** (quickstart §1): (b) imza qaydasının mövcud kitabxanaya quru tətbiqi —
uyğunsuz fayl çıxarsa spec-ə qayıdılır; (c) PDF-in `sandbox` CSP ilə brauzerlərdə açılması — ✅ 2026-10-07:
açılır, istisna silindi.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`, `api-cbar`)

**Primary Dependencies**: mövcud — ASP.NET Core (`IFormFile`, `FormOptions`), `System.Security.Cryptography`
(`SHA256.HashDataAsync`), `Minio` 7.0.0, EF Core + Npgsql 10, Serilog. **Yeni NuGet yoxdur** (R5:
imza kitabxanası rədd edilib)

**Storage**: PostgreSQL `media_assets` — sxem, migration, `Cbar.Domain` dəyişmir; yalnız `original_name`
qəbul qaydası. MinIO — açar formatı və obyekt məzmunu dəyişmir. Konteyner `/tmp` — çərçivənin multipart
buferi (bu gün də, R9)

**Testing**: avtomatik test yoxdur (Konstitusiya VIII.1). Lokal: OpenAPI lint + bundle + `route-diff.mjs`,
§1b/§1c Node skriptləri (scratchpad). GitLab `test` → pipeline build + deploy → `curl`, brauzer, panel,
`contract-check.mjs`, log/pod metrikləri ([quickstart.md](./quickstart.md))

**Target Platform**: Linux konteyner (k8s), `limits.memory: 2Gi`, `requests.memory: 512Mi`, ingress arxasında

**Project Type**: web-service — iki upstream repo, iki MR

**Performance Goals**: 250 MB yükləmənin pik yaddaş artımı < 50 MB (FR-001/SC-002; gözlənti ~5–15 MB,
R3); 4 × 240 MB paralel — 4/4 uğur, restart 0 (SC-001). Fayl diskdən iki dəfə oxunur (hash + yazma) — bu
gün də bir dəfə diskdən, bir dəfə yaddaşdan oxunur; CPU (SHA-256) eynidir

**Constraints**: 250 MB həddi və icazəli tip siyahısı dəyişmir; route-lar, uğurlu cavablar və mövcud 400
mətnləri dəyişmir; dedup (ardıcıl, paralel, bərpa) dəyişmir (FR-004, spec 018); panel dəyişmir;
`placeholder-*.svg` seed axını dəyişmir (FR-010); public `Cache-Control`/`ETag` dəyişmir; lokalda .NET SDK
yoxdur — kod build olunmadan yazılır, pipeline yoxlayır

**Scale/Scope**: `api-cbar-admin`: 1 yeni fayl (`Validation/MediaUploadRules.cs`), `MediaController.Upload`,
`MediaStorage.PutAsync` (ct parametri); OpenAPI `paths/media.yaml`, `components/schemas/media.yaml`,
`openapi.yaml`, `dist/`. `api-cbar`: `Controllers/MediaController.Get` (2 başlıq); OpenAPI
`paths/misc.yaml`, `openapi.yaml`, `dist/`. Root: `api-admin-review.md` #11

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2–I.3 `product-host` referansı | Spec Yii2 `UploadAssetsBehavior`-u (extension whitelist, generasiya olunmuş saxlama adı, statik verilmə) göstərir; paritet cədvəli var. Funksiya itmir — SVG icazəli qalır, orijinal ad görünməyə davam edir | ✅ |
| II.1/II.3 müstəqil proyektlər | İki MR: `api-cbar-admin` (upload) və `api-cbar` (başlıqlar). Bir-birindən asılı deyil, deploy sırası sərbəstdir; hər biri ayrıca geri qaytarıla bilər | ✅ |
| II.4 yalnız HTTP/DB əlaqəsi | `MediaUploadRules` yalnız admin-dədir; `api-cbar` heç nə import etmir. §1b skripti HTTP üzərindən işləyir | ✅ |
| III.2 `api-cbar` read-only | `api-cbar`-da yalnız cavab başlığı; DB-yə yazma yoxdur | ✅ |
| III.3 public filtr | `/media/{id}` soft-delete filtri (global query filter) dəyişmir | ✅ |
| III.4 admin JWT, audit | Avtorizasiya dəyişmir. Rədd olunan yükləmə heç nə yazmır (audit də yox); uğurlu yükləmə əvvəlki kimi `media.upload` / `media.restore` | ✅ |
| IV run/start sırası, seed | Port, skript, sıra dəyişmir. Seed-in `placeholder-*.svg` faylları imzadan keçir (`<` ilə başlayır) və public-də `<img>` kimi görünür (FR-010) | ✅ |
| V.1 `Cbar.Domain` iki kopya | Toxunulmur. `MediaStorageOptions` dublikatı da toxunulmur | ✅ |
| V.2 migration | Yoxdur | ✅ |
| V.5 UTF-8 | Spec sənədləri Write aləti ilə; kodda Azərbaycan hərfli fayl yazılmır | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | Route və uğurlu cavablar eyni. Yeni 400 mövcud forma ilə (spec 018). Public cavaba yalnız başlıq əlavə olunur; `web-cbar`/`web-cbar-next` təsirlənmir ([contracts/public-media.md](./contracts/public-media.md)). Spec-first: `openapi/` əvvəl; route dəyişmədiyi üçün `spec-first.mjs` keçir | ✅ |
| VII.1 XML feed | `CurrenciesController` toxunulmur | ✅ |
| VII.5 sirlər, `TODO(devops)` | Yeni sirr yoxdur. İki yeni `TODO(devops)` qeydi plan-da (paylaşılan keş, ephemeral storage) — kodda marker yaradılmır | ✅ |
| VIII.1 real icra ilə verification | Lokal stack qaldırıla bilmir (.NET SDK yoxdur). Build pipeline-da, icra `test`-də; SC-006 (boş baza seed) `test`-də iki placeholder upload ilə əvəzlənir | ⚠️ sapma, əsaslandırılıb (Complexity Tracking) |
| Yeni runtime dependency yalnız spec ilə | Yoxdur | ✅ |

**Post-design re-check (Phase 1-dən sonra)**: dizayn bir saf statik sinif, controller-də ardıcıllıq dəyişikliyi,
`PutAsync`-ə opsional parametr, bir log sətri və public cavabda iki başlıq əlavə edir. Yeni proyekt, port,
dependency, cədvəl, route yoxdur. Planlaşdırılan PDF istisnası §1c ölçməsindən sonra silindi — dizayn
FR-009 ilə hərfən uyğundur. Nəticə: ✅ (VIII.1 sapması qalır).

## Project Structure

### Documentation (this feature)

```text
specs/019-media-upload-hardening/
├── spec.md
├── plan.md                    # bu fayl
├── research.md                # Phase 0 — R1–R10
├── data-model.md              # Phase 1 — sahə qaydaları, imza cədvəli, ad qaydası, axın, public başlıqlar
├── quickstart.md              # Phase 1 — §0 giriş, §1 baseline + iki qapı, §2–§6 test mühiti
├── contracts/
│   ├── media-upload.md        # POST /api/v1/media — yeni 400, OpenAPI dəyişikliyi
│   └── public-media.md        # GET /media/{id} — yeni başlıqlar, istehlakçılara təsir
├── checklists/
│   └── requirements.md
└── tasks.md                   # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/                         # MR 1
├── src/Cbar.AdminApi/
│   ├── Validation/
│   │   └── MediaUploadRules.cs                      # YENİ: AllowedTypes (köçür), SanitizeFileName (R6),
│   │                                                #       MatchesSignature(ext, ReadOnlySpan<byte>) (R5)
│   ├── Controllers/MediaController.cs               # Upload: ad → ext → imza → hash (stream) → dedup → put;
│   │                                                #   MemoryStream/ToArray silinir; RequestAborted; log sətri (R8)
│   └── Services/MediaStorage.cs                     # PutAsync(..., CancellationToken ct = default)
└── openapi/
    ├── paths/media.yaml                             # collection.post təsviri, 400 halları
    ├── components/schemas/media.yaml                # MediaUploadResult.originalName təsviri
    ├── openapi.yaml                                 # x-known-issues: yaddaş sətri silinir; # Sync:
    └── dist/

product-rest/api-cbar/                               # MR 2
├── src/Cbar.WebApi/Controllers/MediaController.cs   # Get: callback daxilində nosniff + CSP (hər fayl)
└── openapi/
    ├── paths/misc.yaml                              # media.get təsviri + 200 başlıqları
    ├── openapi.yaml                                 # # Sync:
    └── dist/

api-admin-review.md                                  # #11 "Vəziyyət" + təxirə salınanlar (FR-012)
```

**Structure Decision**: qaydalar `Validation/`-dadır (spec 016 konvensiyası: sorğu yoxlaması), saf statik —
DI yoxdur (R10). `api-cbar`-da service layer yoxdur, başlıqlar controller-də mövcud başlıqların yanına
yazılır. `Cbar.Domain`, panel(lər), `web-cbar*`, seed skriptləri toxunulmur.

**İcra sırası** (`test` branch-inə commit-lər bu ardıcıllıqla):

1. **Qapılar (kodsuz)**: quickstart §0, §1b (imza quru tətbiqi), §1c (PDF + CSP). §1b uyğunsuz verərsə —
   dayan, istifadəçi ilə qərar, spec yenilənir. §1c nəticəsi data-model §5 və contracts/public-media.md-ə yazılır.
2. **OpenAPI hər iki API** (contracts/) → lint + bundle + route-diff → istifadəçi təsdiqi (spec-first).
3. **`api-cbar-admin` commit A — yalnız log sətri** (R8) → push → quickstart §1a baseline (köhnə upload kodu),
   §1d dedup baseline.
4. **`api-cbar-admin` commit B — axın** (MemoryStream silinir, `HashDataAsync`, `PutAsync` ct) → §3, §4.
5. **`api-cbar-admin` commit C — `MediaUploadRules`** (imza + ad) → §5.
6. **`api-cbar` commit** (başlıqlar) → §6. (3–5-dən asılı deyil; paralel getə bilər.)
7. `api-admin-review.md` #11 "Vəziyyət" sətri: icra olunub + təxirə salınanlar (ayrı media domeni,
   antivirus, `.docx`/`.zip` ayrımı); quickstart nəticələr cədvəli doldurulur. Lazımdırsa spec FR-009 mətni
   (§1c nəticəsi).

B ilə C ayrı commit-dir ki, yaddaş ölçməsi (§3) imza dəyişikliyindən təsirlənməsin və hər biri ayrıca geri
qaytarıla bilsin.

**Deploy**: iki komponent, sıra sərbəstdir, migration yoxdur. `api-cbar` deploy-dan sonra ingress/CDN-də
paylaşılan keş varsa təmizlənməsi DevOps-dan istənir (`TODO(devops)`, R7). `/tmp` ephemeral storage limiti
DevOps-a qeyd kimi ötürülür (R9) — bu dəyişikliklə artmır.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VIII.1: verification `dev.ps1` lokal stack-i ilə yox, deploy olunmuş `test` mühitində; SC-006 boş baza seed-i tam yoxlanmır | Bu maşında .NET SDK yoxdur, heç bir API lokalda build/run olunmur | SDK quraşdırmaq bu task-ın əhatəsindən kənardır; spec 013–018 eyni yolla yoxlanılıb. Seed-in kritik hissəsi (iki SVG-nin yüklənməsi və `<img>` kimi görünməsi) `test`-də yoxlanır |
| Əlavə log sətri (ölçmə üçün) | SC-002 əvvəl/sonra rəqəm tələb edir; pod metriklərinə giriş təsdiqlənməyib | Müvəqqəti diaqnostika endpoint-i yeni route + spec-first + silinmə deməkdir; sətir sonradan əməliyyat logu kimi faydalıdır |
