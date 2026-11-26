# Data Model: Media upload hardening (spec 019)

**Sxem dəyişmir.** Migration yoxdur, `Cbar.Domain` (hər iki kopya) toxunulmur. Bu sənəd mövcud
`media_assets` cədvəlinə **yazılan dəyərlərin** qaydalarını və upload axınının ardıcıllığını təsvir edir.

## 1. `media_assets` — dəyişən sahə qaydaları

| Sütun | Tip | Bu gün | Spec 019-dan sonra |
|---|---|---|---|
| `original_name` | `varchar(255)` | `file.FileName` olduğu kimi; > 255 → DB xətası (spec 018-dən sonra 400) | §3 qaydası ilə təmizlənmiş, həmişə ≤ 255 kod nöqtəsi |
| `mime_type` | `varchar` | Extension-dan (`AllowedTypes`) | Dəyişmir — extension-dan; əlavə olaraq məzmun §2 ilə uyğunlaşdırılır |
| `checksum_sha256` | `char(64)` hex, unikal deyil | `SHA256.HashData(byte[])` | `SHA256.HashDataAsync(stream)` — **eyni dəyər** (research R2) |
| `storage_key` | unikal | `yyyy/MM/{checksum[..16]}{ext}` | Dəyişmir (ext təmizlənmiş addan, kiçik hərflə) |
| `size_bytes` | `bigint` | `file.Length` | Dəyişmir |
| `created_by`, `deleted_at` | — | — | Dəyişmir |

Mövcud sətirlər yenidən yoxlanmır və adları dəyişdirilmir (spec Assumptions).

## 2. Məzmun imzaları (FR-005)

Pəncərə: faylın ilk **1024 baytı** (`H`). "@n" = n-ci baytdan başlayaraq.

| Extension | MIME | Qəbul şərti |
|---|---|---|
| `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` | uzantıdan (`image/jpeg` və s.) | **Raster şəkil ailəsi** — aşağıdakılardan **hər hansı biri**: JPEG `FF D8 FF` @0; PNG `89 50 4E 47 0D 0A 1A 0A` @0; GIF `GIF87a`/`GIF89a` @0; WebP `RIFF` @0 **və** `WEBP` @8 |
| `.pdf` | `application/pdf` | `%PDF-` `H` daxilində istənilən mövqedə |
| `.zip` | `application/zip` | `PK 03 04` və ya `PK 05 06` (boş arxiv) @0 |
| `.docx`, `.xlsx` | OOXML | `PK 03 04` @0 |
| `.doc`, `.xls` | OLE2 | `D0 CF 11 E0 A1 B1 1A E1` @0 |
| `.rar` | `application/vnd.rar` | `Rar! 1A 07` @0 (v4 və v5) **və ya** 7-Zip `37 7A BC AF 27 1C` @0 |
| `.xml`, `.svg` | `application/xml`, `image/svg+xml` | İsteğe bağlı BOM (`EF BB BF`, `FF FE`, `FE FF`), sonra ASCII boşluqlar (`20 09 0A 0D`), sonra `<` (UTF-16-da kodlaşdırılmış `<`) |

Şəkil ailəsi və `.rar`/7z tolerantlığı quickstart §1b-nin nəticəsidir (`test`: 4 `.png` əslində JPEG,
2 `.jpg` əslində PNG, 2 `.rar` əslində 7-Zip); istifadəçi qərarı 2026-10-07, spec FR-005.

Fayl pəncərədən qısadırsa, şərt mövcud baytlar üzərində yoxlanır (qısa fayl imzanı tam daşımırsa — rədd).
Tanınmayan məzmun (qırıq PDF və s.) uyğunsuzluq sayılır.

## 3. Fayl adı qaydası (FR-007, FR-008)

Giriş: multipart `filename` (`IFormFile.FileName`). Addımlar ardıcıl:

1. NFC normallaşdırma.
2. Son `/` və ya `\`-dən sonrakı hissə.
3. `Cc` kateqoriyası + bidi idarəetmə simvolları (U+200E, U+200F, U+202A–U+202E, U+2066–U+2069) silinir.
4. Əvvəl/son boşluqlar kəsilir.
5. `ext = Path.GetExtension(ad)`; ad > 255 kod nöqtəsidirsə əsas hissə surrogate cütünü bölmədən
   `255 − len(ext)` kod nöqtəsinə qədər kəsilir.
6. Əsas hissə boşdursa → `file` + `ext`.
7. `ext` `AllowedTypes`-da yoxdursa → 400 (FR-008).

| Giriş | Saxlanan |
|---|---|
| `İllik hesabat 2025 (son).pdf` | `İllik hesabat 2025 (son).pdf` (dəyişmir) |
| `C:\Users\x\hesabat.pdf` | `hesabat.pdf` |
| `../hesabat.pdf` | `hesabat.pdf` |
| `..\..\evil<TAB>name.pdf` | `evilname.pdf` |
| 300 simvol + `.pdf` | ilk 251 simvol + `.pdf` (255) |
| `.pdf` | `file.pdf` |
| `<TAB><TAB>.pdf` | `file.pdf` |
| `report.pdf.` | ext boş → 400 `File type '' is not allowed.` |

## 4. Upload axını (ardıcıllıq və vəziyyət)

```text
binding (çərçivə: >64 KB → /tmp, DeleteOnClose)
  → boş fayl?                         → 400 "Empty file."                      (dəyişmir)
  → adı təmizlə (§3)
  → ext whitelist-də?                  → 400 "File type '…' is not allowed."   (dəyişmir)
  → ilk 1024 bayt imzaya uyğun (§2)?   → 400 "File content does not match type '…'."  (YENİ)
  → stream.Position = 0; SHA-256 axınla (RequestAborted)
  → dedup: mövcud qeyd (silinmişsə bərpa) → 200 mövcud qeyd                   (dəyişmir)
  → stream.Position = 0; MinIO PutAsync (multipart, 5 MiB hissələr, RequestAborted)
  → INSERT media_assets; storage_key yarışı → 200 qalib qeyd (spec 018)       (dəyişmir)
  → audit media.upload; log sətri (ölçü, müddət, working set, peak)            (log YENİ)
  → 200
sorğu sonu: müvəqqəti fayl çərçivə tərəfindən silinir (uğur / xəta / kəsilmə)
```

Hər rədd addımı anbara və DB-yə toxunmazdan əvvəldir — "heç nə saxlanmır" (US3 ss. 1). Kəsilmə hash
və ya PutAsync zamanı olarsa DB qeydi yaranmır (INSERT PutAsync-dən sonradır).

## 5. Public cavab başlıqları (`api-cbar` `GET /media/{id}`, FR-009)

| Başlıq | 200 | 304 / 404 |
|---|---|---|
| `X-Content-Type-Options: nosniff` | hamısı (YENİ) | — |
| `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` | hamısı (YENİ; PDF daxil — quickstart §1c: PDF CSP ilə açılır, 2026-10-07) | — |
| `Content-Disposition`, `Cache-Control`, `ETag`, `Content-Type` | dəyişmir | dəyişmir |
