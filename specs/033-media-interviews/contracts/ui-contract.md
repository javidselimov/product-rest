# UI müqaviləsi: 033

## 1. Siyahı `/{locale}/press-releases?type=3`

`SectionShell` + `NewsFilter` + `NewsGrid variant="photo"` + `ListPagination`, 9 kart. Xəbərlərlə eynidir,
yeni komponent yoxdur.

| | Desktop 1728 | Tablet 744 | Mobil 390 |
|---|---|---|---|
| Figma | `1107:27193` | `1659:18410` | `1659:19162` |
| Kart | 312 en, şəkil 197 | `visual-diff`-də ölçülür | `visual-diff`-də ölçülür |
| Sütun arası | 24 | | |
| Bloklar arası | 60 | | |

Figma-da kart hündürlüyü başlığa görə 345–367-dir. Boş şəkil: `bg-site-image-placeholder`, Xəbərlər kimi.

## 2. Detal `/{locale}/press-releases/{slug}`

| | Desktop | Tablet | Mobil |
|---|---|---|---|
| Figma | `1308:29099` | `1659:19795` | `1659:20332` |
| Mətn eni | 984 | 664 | 342 |
| H1 | 32/600, lh 44 | | 22/600, lh 28 |
| H1 → mətn | 36 | | 36 |
| Mətn → düymə | 60 | 60 | 60 |
| Düymə | `1308:29833` 312×56 | `1659:20066` 312×56 | `1659:20482` 312×56 |

Render sırası: `SectionShell` H1 → `CmsContent` (mətn varsa) → `Save as PDF` (PDF varsa) → `Attachments`
(qalan qoşmalar varsa). Tarix, örtük, qalereya render olunmur.

Figma-da iki gizli node var (`1308:29105` xətt, `1308:29106` "Son yenilənmə"): render olunmur.

### `Save as PDF`

- `Button asChild`, `variant="outline"`, içində `<a>`; `data-slot="press-release-pdf"`, `data-print="hide"`.
- `h-14 w-78` (56×312), ağ fon, 1px `#A3A3A3`, radius 4, mətn 18/500 lh 28, mərkəzdə, ikon yoxdur.
- Kit rəngləri `#A3A3A3`-ü vermirsə, semantik token axtarılır; yoxdursa `visual-diff`-də qeyd olunur.
- `href="/media/{id}"`, `download="{təmiz başlıq}.pdf"`. `target` yoxdur.
- Mobildə də 312-dir, 342-yə uzanmır (Figma).
- Klaviatura: adi link fokusu.

### Mətn

Figma-da sual `600`, cavab `400`, cütlər arası 50. Bu, CMS markup-ıdır: sual `<strong>`-da. `CmsContent
variant="about"` işlədilir, tipə xüsusi CSS əlavə olunmur. Fərq varsa `visual-diff`-də qeyd olunur.

## 3. Etiketlər

| Açar (`content`) | AZ | EN |
|---|---|---|
| `newsList.interviews` | Müsahibələr və çıxışlar | Interviews and speeches |
| `newsList.saveAsPdf` | PDF kimi yüklə | Save as PDF |

## 4. Admin panel

| Açar (`pressReleases`) | AZ | EN |
|---|---|---|
| `types.3` | Müsahibə və çıxış | Interview and speech |
| `attachments.cardImage` | Kart şəkli | Card image |
| `attachments.pdfButton` | PDF düyməsi | PDF button |
| `attachments.descriptionInterview` | İlk şəkil yalnız siyahı kartında görünür. Hər dilin ilk PDF-i "PDF kimi yüklə" düyməsidir, qalan fayllar sənəd siyahısındadır. Sıranı oxlarla dəyişin, fayl dilini seçin. | The first image appears only on the list card. The first PDF of each language is the "Save as PDF" button, other files are listed as documents. Reorder with the arrows and choose each file's language. |
| `attachments.locale.label` | Fayl dili | File language |
| `attachments.locale.all` | Hər iki dil | Both languages |
| `attachments.locale.az` | AZ | AZ |
| `attachments.locale.en` | EN | EN |

| Açar (`media`) | AZ | EN |
|---|---|---|
| `assets.localeChanged` | Fayl dili yeniləndi | File language updated |
| `assets.localeFailed` | Fayl dili yenilənmədi | File language was not updated |

Palet: `3` → `tertiary` (kit-də `info` yoxdur; `1` `primary`, `2` `secondary`-dir).

`AssetsSection`: opsional `localeControl?: { ariaLabel: (name: string) => string; options: { value: 'all' |
'az' | 'en'; label: string }[] }`. Sorğunu `attach`/`reorder` kimi section özü göndərir, xəta və toast
eyni yerdədir. `all` ↔ `null` xəritələnir, çünki kit `Select`-i boş dəyər qəbul etmir. Select `aria-label`-i
fayl adını daşıyır. Prop verilməsə Qanunlarda heç nə dəyişmir.
