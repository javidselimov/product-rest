# Spec 054 — iş qeydi

Çoxgünlük işin vəziyyəti. Tapşırıqlar `tasks.md`-dədir, burada yalnız yoxlama nəticələri və təhvil qeydləri durur.

## Təhvil (2026-11-20)

US1–US5 və Polish (T091–T099) bitib. **US6 (T084–T090) təxirə salınıb** (istifadəçi qərarı, 2026-11-20). İkinci sessiyanın dəyişiklikləri commit
olunmayıb.

**Yoxlanılıb:**
- Sayt `verify`: 173 fayl, 1657 test, build. Admin panel `verify`: 69 fayl, 702 test. İkisi Node 22 ilə də yaşıl.
- API-lər PGlite-da: işçi məqalələri (T040), menyu yeri və menyu qrupu (T076, `.tmp-pubs/t076-check.mjs`, 16 yoxlama), media ölçüsü (T052, aşağıda).
- `route-diff` hər iki API-də fərqsiz. `Cbar.Domain` mənbəsi iki nüsxədə eynidir.
- Figma ölçməsi (T097): 9 ekran × 1728/744/390, üfüqi sürüşmə yoxdur, tapılan fərqlər düzəldilib (tasks.md T097).
- SC-002: baza xəttinin 342 fayl linkinin hamısı yeni saytda var. JS-siz axtarış, il menyusu, səhifələmə və sol menyu işləyir (T098).

**US6 təxirə salındığı üçün prod-da:**
- köhnə ~78 məqalə köçürülməyib: dildə məqalə olmadıqca "İşçi məqalələr silsiləsi" köhnə CMS mətnini göstərir (ehtiyat qaydası);
- köhnə `page-895/*` məqalə ünvanları yeni detala yönlənmir, bugünkü kimi işləyir;
- redaktorlar məqalələri paneldən əl ilə daxil edə bilər. Sonradan US6 işləsə, seed bazada olan il + nömrəni ötürür.

**Redaktorun yoxlamalı olduğu qaralamalar:** qrup səhifələrinin en başlıqları, Figma girişlərinin en tərcümələri, en menyu qrupları
("Strategies and concepts", "Payment systems") — seed `0041`.

**Deploy-dan sonra:** Grafana-da (`App api-cbar-admin`) `media sizes: checked N, fixed M` sətri; `GET /api/v1/pages/illik-hesabat`-da real `sizeBytes`.

**Açıq dizayn sualı:** bölmənin zəif mətni #A3A3A3 #F5F5F5 fonda ~2.3:1 kontrastdır, WCAG AA (4.5:1) keçmir. Figma tələbidir.

**Spec 055 üçün açıq məsələlər:**
- mega menyunun Variant B dizaynı (`2810:21571`, açıq nümunə `2810:22348`);
- "Maraqlı ola bilər" sütunu və alt başlıqlar (`2810:21533`, `2810:21557`, `2810:21563`);
- menyu üçün qısa səhifə adları;
- `menuGroup`-un göstərilməsi (data hazırdır: `GET /pages/tree` `menuGroup`);
- mobil F (tasks.md T099 qeydi).

**Qeydlər:**
- Köhnə dotnet prosesləri `bin`-i kilidləyə bilər ("file is locked by Cbar.*Api (PID)"). PID-i tapıb dayandır, sonra build et.
- Spec qərarlarından kənara çıxmalar tasks.md-də yazılıb:
  - T019 `YearSortMenu` refaktoru edilmədi.
  - "(Kopya)" kökü də menyudan çıxır.
  - admin API `legacyPageId`-i göndərilməyəndə saxlayır.
  - detal PDF kartında ölçü göstərilir (research R9, FR-018), Figma-da yoxdur.
- Admin panel CRUD mühərrikinə üç genişlənmə əlavə olunub (`web-cbar-admin-new/CLAUDE.md` "İşçi məqalələri").
- PGlite köməkçiləri `.tmp-pubs/`-dədir (`db.mjs`, `t076-check.mjs`, `t097-measure.mjs`, `t098-*.mjs`). Repo-ya daxil deyil.

## Media ölçüsü düzəlişi (T052, 2026-11-20)

Docker və MinIO bu maşında işləmir. `MediaSizeBackfillService` bu üsulla yoxlandı:
- PGlite bazası: test dump-ı, 438 media sətri, hamısının ölçüsü 1064/2008 bayt;
- `.tmp-pubs/fake-s3.mjs`: StatObject-ə (HEAD) cavab verən kiçik S3 endpoint-i. MinIO kimi `X-Minio-Error-Code: NoSuchKey` başlığını göndərir, bucket HEAD-inə 200 qaytarır;
- admin API build-i (`.tmp-pubs/admin-bin`), hər halda bir start (`.tmp-pubs/backfill-run.ps1`).

| Hal | Log | Nəticə |
|---|---|---|
| bütün obyektlər 2 961 312 bayt | `media sizes: checked 438, fixed 438, missing 0` | `GET /pages/illik-hesabat` 67 faylın hamısında 2961312 |
| saxlama əlçatan deyil (port bağlı) | `media sizes: run stopped, will retry on the next start` | heç bir sətir yazılmadı |
| obyekt yoxdur | `object 2026/06/7266582bf0ac8015.pdf of media 368 is missing` … `checked 2, fixed 0, missing 2` | sətirlər yazıldı, təkrar yoxlanmır |
| ikinci start | `media sizes: checked 0, fixed 0, missing 0` | — |

Yoxlanmayan: iki instansın eyni anda işləməsi (`pg_try_advisory_lock`). Standart Postgres davranışıdır, deploy-da dev mühitinin logu ilə baxılacaq.

Minio 7.0.0 qeydi: obyektin HEAD 404-ündən sonra client bucket-i ayrıca yoxlayır. Bucket da 404 verirsə, `BucketNotFoundException` atılır. Servis bunu "saxlama xətası" sayır və heç nə yazmır, bu düzgündür.

Deploy-dan sonra dev/test mühitində yoxlanacaqlar:
- Grafana logunda (`App api-cbar-admin`) `media sizes: checked N, fixed M` sətri;
- `GET /api/v1/pages/illik-hesabat` cavabında `sizeBytes`-ın real dəyər olması.
