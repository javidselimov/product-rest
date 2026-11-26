# Data Model: Mərkəzi Bankın loqosu

Saxlanan yeni məlumat yoxdur. Aşağıdakılar saytın view-model tipləridir (`features/about-content/model/types.ts`),
CMS HTML və səhifə fayllarından hər sorğuda qurulur.

## Mənbələr (mövcud)

| Mənbə | Sahələr | Haradan |
|---|---|---|
| Səhifə `553` | `title`, `slug`, `content` (HTML), dilə görə | `GET /api/v1/pages/{slug}?locale=` |
| Səhifə faylı | `mediaId`, `title` (dilə görə, yoxdursa orijinal ad), `mimeType`, `sizeBytes`, `group`, `url` | eyni cavabda `assets[]`, redaktorun sırası ilə |

Loader bunları `AttachmentFile[]` edir (`views/cms-page/loader.ts`), dəyişiklik yoxdur.

## LogoVersion

| Sahə | Tip | Qayda |
|---|---|---|
| `image` | `AboutImage \| null` | 1-ci xananın ilk təhlükəsiz şəkli (`imagesIn`, `/media/` və ya `https://`). `alt` boşdursa `title` |
| `title` | `string` | 2-ci xananın mətni, boş ola bilməz |
| `description` | `string \| null` | 3-cü xananın mətni, boşdursa `null` |
| `background` | `'light' \| 'dark'` | 4-cü xana `tünd`/`tund`/`dark` → `dark`, qalan hallar və xana yoxdursa → `light` |

## LogoDownload

`AttachmentFile`-dan, sıra saxlanır:

| Sahə | Tip | Qayda |
|---|---|---|
| `id` | `number` | `mediaId` |
| `label` | `string` | faylın adı, boşdursa `fileFormatLabel(mimeType, title)`, o da yoxdursa `FILE` |
| `size` | `number` | `sizeBytes`; `<= 0` göstərilmir. Mətnə widget çevirir (`formatFileSize(size, locale)`) |
| `url` | `string` | `/media/{id}` |

## BrandLogosBlock

```ts
type BrandLogosBlock = {
  kind: 'brand-logos'
  hero: LogoVersion | null      // versions[0], yalnız şəkli varsa
  introHtml: string             // cədvəldən əvvəlki məzmun (məs. "Loqo versiyaları" başlığı)
  versions: LogoVersion[]       // 0 → cədvəl tanınmayıb
  restHtml: string              // cədvəldən sonrakı məzmun
  downloads: LogoDownload[]
}
```

Cədvəl tanınmasa: `versions = []`, `hero = null`, bütün məzmun `introHtml`-dədir, `downloads` yenə doludur.

## Validation

- Sətir 3 və ya 4 xanalı, sətir sayı 1–8. Bir sətir uymursa bütün cədvəl tanınmır.
- Yalnız `th`-dan ibarət sətir başlıq sayılır və atlanır (`tableRows`).
- Yalnız yuxarı səviyyədəki birinci `<table>`.
