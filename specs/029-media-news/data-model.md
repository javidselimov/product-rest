# Data model: Media → Xəbərlər / Elanlar (spec 029)

**Sxem dəyişmir** (FR-021): migration, yeni cədvəl, `Cbar.Domain` dəyişikliyi yoxdur. Aşağıdakılar
mövcud entity-lərin bu feature-da necə oxunduğu və frontend-in view modelləridir.

## 1. Mövcud entity-lər (oxunur)

| Entity | Sahələr (istifadə olunan) | Qayda |
|---|---|---|
| `PressRelease` (`press_releases`) | `Id`, `Type` (smallint: **1 Xəbər, 2 Elan**), `Status`, `PublishedAt`, `DeletedAt` | Public: `Status = Published`, `PublishedAt ≤ now`, `DeletedAt IS NULL` (qlobal filtr, R9) |
| `PressReleaseTranslation` | `Locale`, `Title`, `Slug`, `Content` | Locale-də tərcümə yoxdursa o dildə görünmür. Axtarış `Title` üzrə |
| `PressReleaseAsset` | `MediaId`, `SortOrder`, `Media.MimeType`, `Media.OriginalName`, `Media.SizeBytes` | Sıra: `SortOrder`, sonra `Id`. `image/*` → örtük + qalereya, qalanı → qoşma |

`Type` dəyər sahəsi: yalnız `{1, 2}` (FR-020a). DB-də CHECK yoxdur — qaydanı admin API qoruyur;
`0` dəyəri heç bir public siyahıya düşmür (tipli sorğular `1`/`2` istəyir).

## 2. Public API kontrakt dəyişikliyi (`api-cbar`)

Ətraflı: [contracts/public-api.md](./contracts/public-api.md).

- Siyahı sorğusu: `+ q`, `+ from`, `+ to`.
- Siyahı elementi və detal: `+ type: integer` (1|2).

## 3. Admin API kontrakt dəyişikliyi (`api-cbar-admin`)

Ətraflı: [contracts/admin-api.md](./contracts/admin-api.md).

- Siyahı sorğusu: `+ type`.
- Yaratma/redaktə: `type` nullable — `null` → POST `1`, PUT mövcud dəyər; `∉ {1,2}` → 400
  (əvvəl səssiz `0`).

## 4. Frontend view modelləri (`web-cbar-new`)

### 4.1 `NewsListFilters` (URL → loader)

| Sahə | URL | Parser | Yanlış dəyər |
|---|---|---|---|
| `type` | `type` | `enumParam(['1','2'])` | `'1'` (tipsiz də `'1'`) |
| `q` | `q` | `queryParam` (trim, ≤ 200) | `''` |
| `from` | `from` | `dateParam` (`YYYY-MM-DD`) | `undefined` |
| `to` | `to` | `dateParam` | `undefined` |
| `page` | `page` | `pageSchema` | `1` |

`hasFilters = q !== '' || from || to` — "Filtrləri təmizlə" həmişə görünür (Figma), bu bayraq
yalnız boş nəticə mesajının mətnini seçir ("Heç nə tapılmadı" vs "Hələ xəbər yoxdur").

### 4.2 `NewsListData` (`views/press-releases/loader.ts`)

```text
locale, type ('1'|'2'), title (Xəbərlər|Elanlar — CMS ağacındakı bəndin adı, yoxsa i18n),
filters: { q, from, to }, page, pageSize (9), total,
items: NewsCardItem[] | null, error: boolean,
shell: SectionShellData   // current.href = /{locale}/press-releases?type={type}
```

`NewsCardItem`: `key`, `href` (`/{locale}/press-releases/{slug}`), `title`, `dateLabel`
(`formatDate` → `dd.mm.yyyy`), `dateTime` (ISO, `<time dateTime>`), `imageUrl | null`.

### 4.3 `PressReleaseViewData` (`views/press-release/loader.ts`, genişlənir)

```text
locale, type ('1'|'2' — API `type`, yoxdursa '1'), title, dateLabel (dd.mm.yyyy), dateTime,
html, description,
cover: GalleryImage | null,
gallery: GalleryImage[],          // örtükdən sonrakı şəkillər; boşdursa qalereya yoxdur
attachments: AttachmentFile[],    // yalnız şəkil olmayanlar
shell: SectionShellData           // trail = title; current.href = siyahının tipli ünvanı
```

`GalleryImage`: `id` (mediaId), `url` (`/media/{id}`), `alt` (`{title} — şəkil {n}`).

### 4.4 `splitPressReleaseAssets(assets)` (saf funksiya)

```text
input:  MediaAsset[] (API sırası ilə)
output: { cover: Asset | null, gallery: Asset[], attachments: Asset[] }
qayda:  images = assets.filter(mimeType starts with 'image/')
        cover = images[0] ?? null; gallery = images.slice(1)
        attachments = assets.filter(not image)
```

## 5. Admin view modeli (`web-cbar-admin-new`)

- `pressReleaseRowSchema` / `pressReleaseDetailSchema`: `+ type: z.number().int()`.
- `PRESS_RELEASE_TYPE_OPTIONS = [{ value: '1', labelKey: 'pressReleases:types.1' }, { value: '2',
  labelKey: 'pressReleases:types.2' }]`.
- Forma sahəsi `type`: select, `valueAsNumber`, `defaultValue: '1'`, məcburi.

## 6. i18n açarları

**web-cbar-new** `locales/{az,en}/content.json`, yeni blok. **Implementasiyada adı `newsList`-dir**
(`content.news` artıq sətir açarıdır): `newsList.news`, `newsList.announcements`, `filterLabel`,
`searchLabel` (placeholder da budur), `dateRange`, `dateFrom`, `dateTo`, `submit`, `clear`,
`noResults`, `empty` ("Bu bölmədə hələ məlumat yoxdur"), `imageAlt`, `gallery.{label, prev, next,
position, thumb, open}`; `thumb` az-da "{{n}} nömrəli şəkli göstər" (şəkilçi rəqəmə görə dəyişir).
Silinənlər: `pressReleases`, `releases`, `announcements`, `back.pressReleases`. İlkin plan:

| Açar | az | en |
|---|---|---|
| `news.title` | Xəbərlər | News |
| `news.announcementsTitle` | Elanlar | Announcements |
| `news.filterLabel` | Xəbər filtri | News filter |
| `news.searchLabel` | Bölmə üzrə axtarış | Search in section |
| `news.searchPlaceholder` | Bölmə üzrə axtarış | Search in section |
| `news.dateFrom` | Başlanğıc tarixi | From |
| `news.dateTo` | Son tarix | To |
| `news.dateRange` | Tarix aralığı | Date range |
| `news.submit` | Axtar | Search |
| `news.clear` | Filtrləri təmizlə | Clear filters |
| `news.noResults` | Heç nə tapılmadı | Nothing found |
| `news.empty` | Hələ xəbər yoxdur | No news yet |
| `news.gallery.label` | Fotoqalereya | Photo gallery |
| `news.gallery.prev` | Əvvəlki şəkil | Previous photo |
| `news.gallery.next` | Növbəti şəkil | Next photo |
| `news.gallery.position` | Şəkil {{current}} / {{total}} | Photo {{current}} of {{total}} |
| `news.gallery.thumb` | {{n}}-ci şəkli göstər | Show photo {{n}} |
| `news.imageAlt` | {{title}} — şəkil {{n}} | {{title}} — photo {{n}} |

Köhnə açarlar (`releases`, `type`, `common:actions.all` press-reliz istifadəsi) istifadəsiz
qalırsa silinir; `back.pressReleases` detaldan BackLink silindiyi üçün yoxlanılır.

**web-cbar-admin-new** `locales/{az,en}/pressReleases.json`: `fields.type`, `columns.type`,
`filters.type` (Növ / Type), `types.1` (Xəbər / News), `types.2` (Elan / Announcement).
