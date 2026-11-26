# Bölmə şablonu kontraktı — "Nəşrlər və tədqiqatlar" səhifələrinin HTML formaları (web-cbar-new)

Bölmə `SectionKey 'publications'`-dir. Kök başlığı `"Nəşrlər və tədqiqatlar"` / `"Publications and research"`-dir, böyük-kiçik hərf fərqi nəzərə alınmır.
Bölmədə hər CMS səhifəsinin layout-u slug ilə yox, mətnin forması ilə seçilir (`publicationsLayoutFor(html, assets)`). İstisnalar:
- işçi məqalələri siyahısı öz view-udur. Məqalə yoxdursa bu qaydaya düşür;
- "(Kopya)" ağacı bugünkü kimi `isSectionCopy` qaydası ilə işləyir.

## Forma tanıma (ardıcıllıqla)

| # | Şərt | Layout | Nümunə səhifələr (test dump-ı) |
|---|---|---|---|
| 1 | mətnin üst səviyyəsində (legacy `div` sarğıları açıldıqdan sonra) ən azı bir `<details>` | `file-archive` | 63, 64, 71, 73, 75, 103 |
| 2 | `<details>` yoxdur; mətndə ən azı bir `href="/media/<id>"` linki **və ya** səhifənin `assets` siyahısı boş deyil | `document-list` | 65, 66, 67, 69, 70, 72, 74, 76, 102 |
| 3 | qalan hər şey | `plain` | 62 kök, iki qrup səhifəsi |

Fayl linki `href="/media/<id>"` ilə tanınır. `data-media-link` atributu olsa da, olmasa da link fayl linki sayılır.

## `file-archive`

Redaktorun saxladığı forma (TipTap `details` extension + media link):

```html
<p><a data-media-link="" href="/media/1537">Hesabatların aydın oxunması üçün bu şrifti yükləyin</a></p>
<details data-accordion=""><summary>2025</summary><div data-type="details-content">
  <p><a data-media-link="" href="/media/947">… 31 dekabr 2025-ci il tarixinə Konsolidasiya edilmiş Maliyyə Hesabatları</a></p>
</div></details>
<details data-accordion=""><summary>2024</summary><div data-type="details-content">
  <p><a data-media-link="" href="/media/948">…</a></p><p><a data-media-link="" href="/media/949">…</a></p>
</div></details>
<p>Akkordionlardan sonrakı mətn.</p>
```

Köhnə import `details-content` içində `<div><a …></a></div>` yazır, redaktor isə `<p>` yazır. Parser ikisini də oxuyur.

Bloklar:
- **`before`**: ilk `<details>`-dən əvvəlki düyünlər.
  - Yalnız fayl link(lər)indən ibarət paraqraf sənəd kartı olur.
  - Qalan düyünlər HTML kimi `cms-content`-ə gedir.
- **`groups`**: hər `<details>` bir qrupdur.
  - Etiket `summary` mətnindən gəlir: trim edilir, daxili boşluqlar bir boşluğa sıxılır.
  - `^\d{4}$` formasında olan etiket il qrupu olur.
  - Boş etiket chrome etiketi "Digər" / "Other" ilə göstərilir.
  - Sıra: əvvəl il qrupları azalan, sonra digər qruplar mətndəki sıra ilə.
  - Eyni il iki dəfə gəlirsə qruplar birləşir, mətndəki sıra saxlanılır.
- **Qrupun içi**: fayl linki kart olur, başqa link adi link (`<a>`) olur, qalan mətn HTML kimi qalır.
- **`after`**: sonuncu `<details>`-dən sonrakı düyünlər, `before` ilə eyni qayda ilə.

Görünüş (ui-contract §5):
- `before` → "İl" seçimi (`YearMenu`) → seçilmiş qrup(lar) → `after`.
- Seçim `?year=<il>` və ya `?year=all` parametri ilə verilir. Default ən yeni ildir. İl qrupu yoxdursa default `all`-dur.
- Qeyri-il qrupları "Hamısı" seçimində və öz adları ilə menyuda görünür. `?year=` qrupun indeksini deyil, etiketini daşıyır, URL-encoded.

## `document-list`

```html
<p>Giriş mətni (Figma) …</p>
<p><a data-media-link="" href="/media/1033">Azərbaycan Respublikası Mərkəzi Bankının risk əsaslı nəzarət üzrə Siyasət Konsepsiyası</a></p>
```

Bloklar:
- **`intro`**: fayl linkli paraqraflardan başqa bütün düyünlər, mətndəki sırası ilə, HTML kimi.
- **`files`**: fayl linkli paraqraflardakı linklər, sıra ilə. Mətndə fayl linki yoxdursa `files` səhifənin `assets` siyahısından qurulur (74).

Görünüş: giriş, sonra kartlar. Aralar 36-dır (ui-contract §7).

## Sənəd kartı (iki layout-da da)

- Kartın adı linkin mətnidir. Assets-dən qurulan kartda ad asset-in `title`-ıdır, o da yoxdursa fayl adıdır.
- URL `/media/<id>`-dir. `target="_blank"` və `rel="noopener"` mövcud `markMediaLinks` qaydasıdır.
- Mime və ölçü səhifənin `assets` siyahısından media id ilə tapılır. Tapılmırsa mime "PDF" fərz edilmir: çip ümumi "Fayl" yazır, ölçü sətri göstərilmir.
- Səhifənin ümumi fayl siyahısı (`Attachments`) bu iki layout-da göstərilmir (`BLOCKS_WITH_FILES`).

## Guard (root `CLAUDE.md`)

1. `web-cbar-new/src/features/about-content/fixtures/` qovluğuna iki fayl əlavə olunur:
   - `file-archive.html`: 63-ün az mətninin 3 illik qısaldılmış forması, üstəlik boş və qeyri-il `summary`-li bir qrup və başqa səhifəyə link.
   - `document-list.html`: 66-nın Figma girişi və bir fayl linki.
2. Eyni iki fayl `web-cbar-admin-new/src/features/rich-text/fixtures/layouts/` qovluğuna kopyalanır.
3. `EXPECTED_BLOCKS`-a (`model/layout-fixtures.test.ts`) bunlar əlavə olunur:
   - `file-archive: ['file-archive']`;
   - `document-list: ['document-list']`.

   `blockShape` switch-inə iki case yazılır.
4. Hər iki layout admin `roundtrip.test.ts` siyahısına əlavə olunur. Redaktor fixture-u bayt-bayt saxlamalıdır.
5. `check:layout-fixtures` iki nüsxəni tutuşdurur (yalnız komponentlər yan-yana olanda).

Yeni slug əlavə etmək kod dəyişikliyi tələb etmir. Bölməyə yeni səhifə yaradılanda o, forması ilə avtomatik doğru layout-a düşür (SC-006).
