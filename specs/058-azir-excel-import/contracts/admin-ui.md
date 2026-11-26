# Contract: AZIR bölməsində Excel importu (web-cbar-admin-new)

Menyu dəyişmir (Maliyyə → AZIR, `/azir`). Mətnlər `locales/{az,en}/azir.json` → `import.*`.

## 1. Səhifə

- Başlıqda, mövcud əməllərin yanında **"Excel-dən yüklə"** düyməsi (`FileUploadIcon`), `CrudListPage.extraActions` ilə. Kart kimi hamıya görünür:
  panelin bölmə üzrə icazəsi yoxdur (`<Can>` yalnız kobud rolları tanıyır); `azir.create` olmayan istifadəçiyə API 403 verir, dialoq xətanı göstərir.
- Upsert kartı və siyahı olduğu kimi qalır. Kartın və siyahı filtrinin müddət seçimi: `1D, 30D, 90D, 180D`.

## 2. Dialoq (`azir-import-dialog.tsx`)

| Addım | Görünən | Əməllər |
|---|---|---|
| `pick` | başlıq "AZIR faylını yüklə", təsvir (şablon: tarix B2-də, adlar B sütununda, TFAI yazılmır), `UploadDropzone` (`.xlsx`), səhv olarsa qırmızı `Alert` | "Ləğv et", "Yüklə" (fayl yoxdursa sahə altında "Fayl seçin") |
| `confirm` (409) | sarı `Alert`: "27.10.2026 üçün 1D, 30D, 90D, 180D dəyərləri artıq var. Fayldakı dəyərlər onları əvəz edəcək." | "Ləğv et" (→ `pick`, heç nə yazılmır), "Əvəz et" (eyni fayl, `overwrite=true`) |
| `done` | uğur `Alert` "27.10.2026 üçün 4 dəyər yazıldı"; cədvəl: Müddət · Dəyər (%) · Ehtiyat plan · Həcm (mln manat) · Say · Min · Maks; əvəzlənən xanada köhnə dəyər üstündən xətli kiçik mətn; `volumeConverted` → sarı `Alert` "Həcm faylda manatla verilib, mln manata çevrildi"; `skipped` → siyahı "Sətir 10 «AZIR TFAI» — TFAI yazılmır" | "Bağla" |

- Göndərmə zamanı düymələr bağlıdır, "Yüklə"/"Əvəz et" içində `Spinner`.
- Xəta mətni koddan: `import.errors.<code>` (`row`, `column` interpolyasiyası); naməlum kod → serverin `message`-i; `AppError` deyilsə →
  `common:errors.unexpected`.
- Uğurda `azirKeys.all` invalidasiya olunur — siyahı dialoq açıq ikən yenilənir.
- Dialoq hər açılışda təmiz vəziyyətlə mount olunur (valideyn şərti render edir). Bağlananda fokus "Excel-dən yüklə" düyməsinə qayıdır (kit `Dialog`).
- `done` cədvəli və `Alert`-lər dialoqun içindədir, `role="status"` ilə elan olunur (kit `Alert`); toast istifadə edilmir.

## 3. Xəta mətnləri (az)

| `code` | Mətn |
|---|---|
| `file_required` | Fayl seçin |
| `not_xlsx` | Yalnız .xlsx faylı yükləmək olar |
| `file_too_large` | Fayl çox böyükdür |
| `date_missing` | B2 xanasında tarix tapılmadı |
| `date_in_future` | Fayldakı tarix ({{date}}) gələcək tarixdir |
| `header_missing` | Faylda "Ad / Faiz" başlıq sətri tapılmadı — şablon dəyişib? |
| `unknown_index` | Sətir {{row}}, sütun {{column}}: tanınmayan indeks adı |
| `duplicate_index` | Sətir {{row}}: bu indeks faylda ikinci dəfə gəlir |
| `missing_1d` | Faylda 1D AZIR dəyəri yoxdur |
| `invalid_value` | Sətir {{row}}, sütun {{column}}: dəyər düzgün deyil |
| `ambiguous_volume` | Sətir {{row}}, sütun {{column}}: həcmin vahidi aydın deyil (nə mln, nə manat) |
