# media-backfill

SQL-i köçürülmüş, amma faylları köhnə mühitdə qalmış `media_assets` sətirlərinin
fayllarını köhnə public host-dan (`https://uploads.cbar.az/...`) endirib MinIO-ya yazır.

**Problem.** DB test mühitinə köçürülüb, fayllar isə prod-un storage-ında qalıb və ora
giriş yoxdur. Nəticədə test DB-də sətirlər var, MinIO-da obyekt yoxdur — `/media/{id}`
404 qaytarır.

**Həll.** Storage-a giriş lazım deyil: köhnə fayllar `uploads.cbar.az`-da anonim `GET`
ilə açıqdır. Sətri fayla bağlayan sütun **`original_name`**-dir — legacy Yii tətbiqi
fayl adını `substr(md5(uniqid()), 0, 25)` kimi yaradırdı
([UploadBehavior.php](../../product-host/common/components/uploader/UploadBehavior.php))
və miqrasiya həmin adı olduğu kimi gətirib. Skript `uploads.cbar.az/<qovluq>/<original_name>`
ünvanlarını sıra ilə yoxlayır, tapdığını endirir və MinIO-ya **mövcud `storage_key`**
açarı ilə yazır.

**`storage_key` onsuz da düzgündür** (`2026/06/<hash>.pdf` — yeni API-nin öz formatı),
ona görə uğurlu köçürmə üçün **DB-yə yazı lazım deyil**. Geri qaytarmaq lazım gəlsə
sadəcə obyektləri silmək kifayətdir.

> **Tarixçə.** Alət əvvəlcə `storage_key`-də köhnə mütləq URL olduğu fərziyyəsi ilə
> yazılmışdı. Bu bazada belə sətir yoxdur — o rejim `--source-from storage-key` kimi
> saxlanılıb, amma default `original-name`-dir.

Bir dəfəlik alətdir — işini görəndən sonra saxlamağa ehtiyac yoxdur.

## Quraşdırma

```bash
cd tools/media-backfill
npm install
```

## Konfiqurasiya

`.env.example`-i `.env` adı ilə kopyalayın və dəyərləri özünüz doldurun — `.env`
git-ə düşmür, əmr sətrinə və log-a da düşmür:

```bash
cp .env.example .env    # PowerShell: Copy-Item .env.example .env
```

Həqiqi mühit dəyişənləri (əgər varsa) `.env`-dən üstün tutulur.

| Dəyişən | Nümunə | Qeyd |
| --- | --- | --- |
| `PG` | `postgres://cbar:pass@localhost:5433/cbar` | **Yazma hüququ olan** bağlantı (`cbar_web_ro` yox) |
| `MINIO_ENDPOINT` | `s3.cbar.az:443` | Sxemsiz, `host:port` — API-lərdəki `MediaStorage__Endpoint` ilə eyni |
| `MINIO_USE_SSL` | `true` | `MediaStorage__UseSsl` ilə eyni |
| `MINIO_REGION` | `cbar` | `MediaStorage__Region` ilə eyni; boş buraxılsa SDK default-u işlədilir |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | — | Vault-dakı dəyərlər |
| `MINIO_BUCKET` | `cbar-media-test` | Mühitin `MediaStorage__Bucket` dəyəri |
| `SOURCE_BASE` | `https://uploads.cbar.az` | Yalnız `storage_key` nisbi yol olduqda istifadə olunur |

## İşlətmə qaydası

```bash
# 0. Köhnə host neçə faylı hələ verir — heç bir credential lazım deyil
node backfill-media.mjs --probe --from-dump ../../schema-new/cbar-schema-and-data-20260914.sql

# 1. DB-də nə olduğuna baxın — yalnız oxuyur, MinIO açarları lazım deyil
node backfill-media.mjs --inspect

# 2. Quru sınaq — heç nə yazılmır, yalnız plan göstərilir
node backfill-media.mjs --dry-run

# 3. Bir neçə sətirdə yoxla
node backfill-media.mjs --ids 657,813,76

# 4. Hamısı
node backfill-media.mjs --concurrency 6
```

Sonda `backfill-report.json` hər sətrin nəticəsini saxlayır.

### Ölçülmüş əhatə (2026-09-22, 1818 sətir)

| Nəticə | Sətir | Qeyd |
| --- | --- | --- |
| `found` | **1690** (93%) | hamısı `assets/` qovluğunda, ümumi ~1.88 GB, ən böyüyü 189 MB |
| `source-missing` | 128 | 57 generasiya/mock (`stat-41-8.xlsx`, `placeholder.png`), 58 yeni paneldə yaradılmış test kontenti (`cbar-test.pdf`, `pul-siyaseti-icmali-*.pdf`), 10 legacy ad, 3 digər |

Yəni tapılmayanların böyük hissəsi köhnə sistemdə **heç vaxt olmayıb** — itki deyil.
Detallar `probe-report.json`-dadır.

### Flaglar

| Flag | Nə edir |
| --- | --- |
| `--probe` | Yalnız `HEAD`: köhnə host hansı sətirləri hələ verir. Nə MinIO, nə DB yazısı |
| `--from-dump FAYL` | Sətirləri Postgres əvəzinə `pg_dump` `COPY` blokundan oxuyur (DB yazısını söndürür) |
| `--source-from` | `original-name` (default) və ya `storage-key` — hansı sütun faylı köhnə hostda adlandırır |
| `--folders a,b,c` | Sıra ilə yoxlanacaq legacy qovluqlar (default-da `assets` birincidir) |
| `--fix-metadata` | Endirilən baytlara əsasən `size_bytes`/`checksum_sha256`-nı da yeniləyir (default: yox) |
| `--inspect` | Yalnız oxuyur: neçə sətrin `storage_key`-i URL/yol/fayl adıdır, hansı qovluqlar və tiplər var, 10 nümunə, həmçinin köhnə host-un adı hansı **başqa** sütunların içində yazılıb (CMS mətnləri). Yalnız `PG` lazımdır |
| `--dry-run` | Nə endirir, nə yükləyir, nə də DB-yə yazır |
| `--no-db` | Faylları köçürür, amma DB-yə yazmır (yalnız oxuma hüququ olanda). Sətirlərdə köhnə URL qaldığı üçün bu halda `api-cbar` tərəfində açarın normallaşdırılması lazımdır — aşağıya baxın |
| `--ids 1,2,3` | Yalnız həmin sətirlər |
| `--limit N` | İlk N sətir |
| `--force` | MinIO-da artıq olan obyekti də yenidən yükləyir |
| `--include-deleted` | `deleted_at` dolu sətirləri də götürür (default: yox) |
| `--concurrency N` | Paralel axın sayı (default 4) |
| `--source-base URL` | Nisbi yollar üçün baza (default `https://uploads.cbar.az`) |
| `--report fayl.json` | Hesabat faylının adı |

### Status dəyərləri

| Status | Mənası |
| --- | --- |
| `copied` | Endirilib, MinIO-ya mövcud `storage_key` açarı ilə yazılıb |
| `found` | Yalnız `--probe`: köhnə host faylı verir, hələ köçürülməyib |
| `already-in-minio` | Obyekt onsuz da var, ötürülüb |
| `source-missing` | Köhnə host faylı heç bir qovluqda vermir — 404, yaxud 200 ilə HTML səhv səhifəsi (yumşaq 404) |
| `no-source` | Sətrin `original_name`-i boşdur, axtaracaq ad yoxdur |
| `key-conflict` | Hesablanan açar artıq başqa `media_assets` sətrinə aiddir (eyni fayla iki sətir) — əl ilə həll edilməlidir |
| `error` | Şəbəkə/MinIO xətası — təkrar işlətmək olar, skript idempotentdir |

## Nə lazımdır, nə lazım deyil

| Tərəf | Nə lazımdır |
| --- | --- |
| Köhnə prod storage | **Heç nə** — ora girmək lazım deyil |
| Mənbə (`uploads.cbar.az`) | **Heç nə** — fayllar anonim `GET` ilə açıqdır |
| MinIO (test) | Yazma açarları (`MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`) |
| Postgres (test) | Yalnız **oxuma** — hansı faylların köçürüləcəyi `media_assets`-dən oxunur |

Default rejimdə (`--source-from original-name`) **DB-yə heç nə yazılmır**, çünki
`storage_key` onsuz da düzgündür. `cbar_web_ro` kimi yalnız-oxuma bağlantı kifayətdir.
`--from-dump` istifadə etsəniz, Postgres bağlantısı da lazım deyil — yalnız MinIO açarları.

`--fix-metadata` yeganə istisnadır: o, `size_bytes`/`checksum_sha256`-nı yeniləyir və
yazma hüququ tələb edir.

## İkinci alət: `scrape-relink.mjs`

`backfill-media.mjs` yalnız **sətrin göstərdiyi** faylı köçürür. Amma miqrasiya bəzi
cədvəllərdə sətir **ümumiyyətlə yaratmayıb** — şəkli placeholder ilə əvəz edib və ya NULL
qoyub. Belə şəkil bazada heç bir yerdə göstərilmir, ona görə backfill onu tapa bilməz.

Dump-dakı vəziyyət (2026-09-22):

| Cədvəl.sütun | Sətir | Vəziyyət |
| --- | --- | --- |
| `page_assets.media_id` | 2226 | ✅ 1094 fərqli real fayl |
| `press_release_assets.media_id` | 4 | ✅ real |
| `organization_staff.photo_media_id` | 26 | ❌ 25-i `placeholder.png` |
| `organization_divisions.media_id` | 42 | ❌ NULL |
| `banners.media_id` | 9 | ❌ NULL |
| `money_marks.front/rear_media_id` | 73+73 | ❌ cəmi 2 fərqli fayl |
| `gallery_images.media_id` | 20 | ❌ 12-si `mock_placeholder.jpg` |
| `homepage_publications.media_id` | 10 | ❌ 5-i `test-image-2.png` |
| `news_slider.media_id` | 8 | ❌ 5-i `test-image-2.png` |
| `users.avatar_media_id`, `meas_documents.media_id` | 3 | ❌ NULL |

Legacy DB əlçatan olsaydı, bağlantını o verərdi. Əlçatan deyil — ona görə bağlantı köhnə
saytın **render olunmuş səhifələrindən** bərpa olunur və yeni sətirlərə **ortaq mətnə görə**
(məsələn şəxsin tam adı) qaytarılır. Sıraya görə yox: iki tərəfin sırası fərqlidir, səhv
üz səhv ada yapışardı.

```bash
# Uyğunlaşmanı gör — heç bir credential lazım deyil, heç nə yazılmır
node scrape-relink.mjs --plan --from-dump ../../schema-new/cbar-schema-and-data-20260914.sql

# Eyni şey, canlı test DB-sinə qarşı
node scrape-relink.mjs --plan

# Tətbiq et: şəkli endir, MinIO-ya yaz, media_assets sətri yarat, foreign key-i bağla
node scrape-relink.mjs --apply
```

`--recipe list` mövcud resept adlarını verir.

### Ölçülmüş nəticə (2026-09-22)

| Resept | Sətir | Uyğunlaşdı | Fayl | Uyğunlaşmayan |
| --- | --- | --- | --- | --- |
| `staff` | 26 | **23** | 22 şəkil | `Taleh Kazımov` (deaktiv test sətri), `Vüqar Ramin oğlu Əhmədov` + kopyası — saytda yoxdur |
| `moneymarks` | 72 | **72** | 144 şəkil (ön+arxa) | — |
| `divisions` | 42 | **41** | 41 PDF | `Bazar davranışlarının tənzimlənməsi departamenti` |
| `gallery` | 14 | **12** | 101 foto | `Maliyyə savadlılığı tədbiri`, `Fotoqalereya` (test sətirləri) |
| | **154** | **148** | **308 fayl** | |

Bir neçə sətir eyni faylı bölüşür (staff 23→22, divisions 41→40). `--apply` eyni baytları
`checksum_sha256` üzrə tanıyıb **tək** `media_assets` sətri yaradır, çünki admin panelin
təkrar axtarışı bir sətir gözləyir.

`divisions`-da "şəkil" əslində departamentin **Əsasnamə PDF-idir** — sütun adı `media_id`
olsa da, məzmun sənəddir.

### Bərpa olunmayanlar və səbəbi

| Cədvəl | Sətir | Niyə resept yoxdur |
| --- | --- | --- |
| `banners` | 9 | Köhnə saytda banner-lər **şəkilsizdir** — sadəcə mətn link kartlarıdır (`infobank.az`, `edu.e-cbar.az`). `media_id`-nin NULL olması itki deyil, düzgün vəziyyətdir |
| `news_slider` | 8 | Bazadakı sətirlər **uydurma demo kontentdir** (`Uçot dərəcəsi sabit saxlanıldı`, link `/az/press-releases`). Canlı saytdakı slayder real press-release-lərdir — aralarında uyğunluq yoxdur |
| `homepage_publications` | 10 | Eyni səbəb: bazada `Pul siyasəti icmalı`, saytda `Azərbaycan Respublikası Mərkəzi Bankının xidmətləri` |
| `users.avatar_media_id`, `meas_documents` | 3 | Public səhifədə render olunmur |

### `gallery` resepti — digərlərindən fərqlidir

Digər üç resept mövcud sətirdə bir sütunu yeniləyir. Qalereya isə **şəkil siyahısına**
sahibdir və miqrasiya qalereyaları gətirib, fotolarını gətirməyib — ona görə burada
`gallery_images`-də **yeni sətirlər yaradılır**, mövcud sətir yenilənmir.

Ölçülmüş nəticə (dump üzərində): **12 / 14 qalereya, 101 foto**, hamısı fərqli fayl.
Uyğunlaşmayan 2-si `Maliyyə savadlılığı tədbiri` və `Fotoqalereya` — test sətirləridir.

**İki qoruyucu var:**

1. **Başlıq tək başına kifayət etmir.** Bank hər il eyni abidəni ziyarət edir, ona görə bir
   neçə qalereyanın başlığı hərfbəhərf eynidir və yalnız tarixlə fərqlənir. İlk versiya
   5 və 8-ci qalereyanı **eyni** legacy səhifəyə bağlamışdı. İndi açar `başlıq @tarix`-dir
   (`galleries.event_date` ↔ saytdakı `dd.mm.yyyy`), başlıq isə yalnız **birmənalı** olduqda
   ehtiyat variant kimi işləyir.
2. **Redaktorun işi silinmir.** Kolleksiyanı əvəz etmək mövcud sətirləri silmək deməkdir,
   ona görə yalnız hamısı miqrasiyanın placeholder-lərinə baxan qalereyalar əvəz olunur
   (`mock_placeholder.jpg`, `placeholder.png`, `test-image-2.png`, `1.png`, `2.png`).
   Başqa şəkil saxlayan qalereya `has-content` kimi ötürülür. `--replace-all` bunu ləğv edir.

Yazma `BEGIN`/`COMMIT` içindədir və şəkillər **əvvəlcə** yüklənir: placeholder-ini itirib
fotolarını almayan qalereya toxunulmamışdan daha pis görünərdi. Bu səbəbdən bu resept
`--concurrency`-dən asılı olmayaraq **bir-bir** işləyir — bütün işçilər tək PG bağlantısını
paylaşır, paralel tranzaksiyalar bir-birini kəsərdi.

## Nəzərə alınmalı məqamlar

- Skript **idempotentdir**: təkrar işlətmək artıq köçürülmüş faylları `already-in-minio`
  kimi ötürür.
- `storage_key` UNIQUE-dir və admin API fayl təkrarını `checksum_sha256` üzrə **tək sətir**
  gözləyən sorğu ilə tapır. Ona görə skript yeniləmədən əvvəl hər ikisini yoxlayır;
  toqquşma olsa DB-ni pozmaq əvəzinə hesabatda qeyd edir.
- `size_bytes` və `checksum_sha256` faktiki fayldan yenidən hesablanır — köhnə sistemdən
  gələn dəyərlər çox vaxt yanlış olur.
- **Fayl tipi əhəmiyyətli deyil** — şəkil, PDF, XLSX, ZIP, hamısı eyni yolla köçürülür.
  `Content-Type` DB-dəki `mime_type`-dan götürülür, o boşdursa köhnə serverin verdiyi
  başlıqdan. Ölçüsü bilinən fayllar yaddaşa yığılmadan axınla ötürülür, ona görə 200 MB-lıq
  illik hesabat PDF-ləri də problem yaratmır.
- İşlətməzdən əvvəl DB-nin `pg_dump`-ını götürmək məsləhətdir; skript yalnız
  `media_assets` sətirlərinin üç sütununu dəyişir, amma geri qaytarmaq asan olsun.

## İşçi məqalələri (spec 054 US6) — `import-working-papers.mjs`

Köhnə saytdan oxunmuş 78 işçi məqaləsini (`specs/054-publications-research/seed/working-papers.json`, `extract-papers.mjs`
yaradır) eyni `.env` ilə birbaşa PostgreSQL və MinIO-ya yazır, admin login lazım deyil.

- PDF-lər köhnə uploads host-undan endirilir, MinIO-ya admin API-nin açar formatı ilə (`YYYY/MM/<sha256[0..16]>.pdf`) yazılır,
  `media_assets` + `media_asset_details` sətri yaranır. Eyni baytlar mövcud sətri işlədir (ingiliscə məqalədə az və en PDF-i eynidir).
- Məqalələr tək tranzaksiyada yazılır; nömrə + il və ya köhnə səhifə artıq varsa ötürülür. Təkrar işlətmək təhlükəsizdir.

```bash
node import-working-papers.mjs --plan                      # heç nə lazım deyil
node import-working-papers.mjs --dry-run                   # PG (oxuma)
node import-working-papers.mjs --apply --only 02-2025      # bir məqalə
node import-working-papers.mjs --apply                     # qalanları
```

## Strategiya səhifəsi (spec 057 US4) — `import-strategy-page.mjs`

Köhnə saytın `/pages/strategy` səhifəsini (sədrin "2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası" müraciəti) CMS
səhifəsi 104-ə köçürür. Ana səhifənin "Strategiya və sənədlər" bloku birinci kartla bu səhifəyə aparır. Eyni `.env` ilə işləyir, admin
login lazım deyil.

- Fayllar köhnə saytın **kökündən** endirilir (uploads host-undan yox): `9183.png` (portret), `2024_2026_Azerbaijani.pdf` (~36,6 MB),
  `2024_2026_English.pdf` (~32,9 MB). Biri endirilməsə, heç nə yazılmır.
- Eyni baytlar media kitabxanasında varsa, mövcud sətir işlədilir. Yoxdursa, MinIO-ya admin API-nin açar formatı ilə
  (`YYYY/MM/<sha256[0..16]>.<ext>`) yazılır və `media_assets` + `media_asset_details` sətri yaranır.
- Mətn `strategy-letter.az.html` / `strategy-letter.en.html` şablonlarındandır. Şablonların forması admin panelin redaktorunun
  saxladığı formadır, `web-cbar-admin-new` `roundtrip.test.ts` (`fixtures/strategy-letter.html`) bunu kilidləyir. 104-ün o dildəki
  mətni yalnız hələ də alt səhifə 105-in ("icra statusu") surətidirsə yazılır. Redaktorun dəyişdirdiyi mətnə toxunulmur, hesabatda
  `edited` görünür. Başlıq, slug, ağac və menyular dəyişmir. `audit_log` yazılmır.
- Bütün PG yazıları bir tranzaksiyadadır. Təkrar işlətmək təhlükəsizdir: ikinci dəfə fayl yüklənmir, mətn `same` olur.

```bash
node import-strategy-page.mjs --plan                                    # faylları endirib yoxlayır; PG/MinIO lazım deyil
node import-strategy-page.mjs --dry-run                                 # + PG (oxuma): media var/yox, hər dil nə alacaq
node import-strategy-page.mjs --apply --report strategy-report.json     # test (default mənbə https://test.cbar.az)
node import-strategy-page.mjs --apply --source=https://www.cbar.az --report strategy-report-prod.json   # prod, prod .env ilə
```

**Ardıcıllıq:** əvvəl `api-cbar-admin` (miqrasiya `0043`/`0044`) deploy olunur, sonra alət işlədilir. Prod-da yalnız prod deploy-dan
sonra və prod `.env` ilə işlədilir.

**Geri qaytarma:** 104-ün mətnini 105-in həmin dildəki mətnindən yenidən köçürün. 104 və 105 test bazasının id-ləridir, mühitin öz
id-ləri hesabatdadır (`strategyPage`, `progressPage`):

```sql
UPDATE page_translations t SET content = s.content FROM page_translations s
WHERE t.page_id = 104 AND s.page_id = 105 AND t.locale = s.locale;
```

Media sətirləri qalır: başqa səhifə onlara istinad edə bilər.
