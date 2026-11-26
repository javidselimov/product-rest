# Contract: UI

## web-cbar-admin-new

**Sidebar**:
- `nav.ts`:
  - yeni `NavKey` `'imagePopups'`;
  - `{ path: '/image-popups', key: 'imagePopups', icon: ImageIcon, group: 'media' }`;
  - `liveStreams`-dən dərhal sonra gəlir.
- `nav.json`:
  - az: "Şəkilli popup-lar", "Saytda popup kimi göstərilən elan şəkli";
  - en: "Image popups", "Announcement image shown as a popup on the site".

**Route-lar** (`createCrudRoutes`):
- `/image-popups`
- `/image-popups/new`
- `/image-popups/$id`

**Siyahı sütunları** (FR-006):

| Sütun | Render |
| --- | --- |
| Başlıq | `title` |
| Şəkil | `translations.az.mediaName ?? translations.en.mediaName ?? '—'` (custom) |
| Dillər | `az` / `en` nişanları: hansı dildə şəkil var (custom badge) |
| Yaradılma | `date` |
| Yenilənmə | `date` |
| Status | `ImagePopupStatusToggle`: `LiveStatusToggle` nümunəsidir, tam DTO ilə PUT |

**Forma sahələri**:

| Sahə | Tip | perLocale | Qayda |
| --- | --- | --- | --- |
| `title` | text | yox | required |
| `mediaId` | media | **bəli** | required, yəni ən azı bir dil. `mediaNameKey: 'translations.{locale}.mediaName'` (R6) |
| `link` | text | bəli | `withLinkRule`. Placeholder: `https://… və ya /az/…` |
| `altText` | text | bəli | isteğe bağlı. Help: "Ekran oxuyucular üçün. Şəkildəki mətni qısa yazın." |
| `isActive` | checkbox | yox | `defaultValue: true` |

**i18n**: `locales/{az,en}/imagePopups.json`. Hər iki dil məcburidir (Maddə V.4).

## web-cbar-new

**Komponent ağacı**:

```
app/[locale]/layout.tsx (server)
  └─ Promise.all([... getVideoStreams(locale), getImagePopups(locale) ...])
      └─ SiteShell ─┬─ LiveStreamDialog  (dəyişmir)
                    └─ ImagePopupDialog ('use client')  props: { popup, liveStreamId }
                          ├─ usePathname()
                          ├─ useImagePopupStore (open/setOpen)
                          ├─ useLiveStreamStore(s => s.open)    — R10
                          └─ image-popup dismissal (shared/lib/popup-dismissal)
```

**`toImagePopup(list)`**: `list[0] ?? null` qaytarır, forması `{ id, imageUrl, link, altText }`. Nəticə seriallaşdırıla biləndir: server → client prop.

**Davranış**:

| Hadisə | Nəticə |
| --- | --- |
| mount / `pathname` dəyişir / `liveOpen` false olur | Açılır, əgər: popup var, bu səhifədə bağlanmayıb, `!liveOpen` və (canlı yayım yoxdur və ya bu səhifədə bağlanıb) |
| × düyməsi, Esc, arxa fona klik | `markDismissed(id, pathname)`, sonra bağlanır |
| Şəklə klik (link var) | `markDismissed`, sonra bağlanır, sonra keçid: `http(s)` → `<a target="_blank" rel="noopener noreferrer">`, `/…` → `next/link` |
| Şəklə klik (link yoxdur) | Heç nə baş vermir. `<img>` link ilə sarılmır, kursor dəyişmir |
| `<img onError>` | Bağlanır, **bağlanma qeydi yazılmır**. Keçici xəta olsa, növbəti açılışda yenidən cəhd edilir |

**DOM və a11y**:
- `DialogContent`:
  - `data-slot="image-popup-dialog"`, `aria-describedby={undefined}`;
  - R9-dakı class-lar.
- `DialogTitle`: `sr-only`, mətni `altText ?? t('imagePopup.title')`.
- `<img>`:
  - `alt={altText ?? ''}`;
  - `className="block h-auto max-h-[85vh] w-auto max-w-full"`;
  - `decoding="async"`.
- Link olanda əlavə etiket: `aria-label={t('imagePopup.openLink')}` ("Ətraflı"). Yeni tab üçün `sr-only` "(yeni tabda açılır)".
- i18n: `media` namespace-inə `imagePopup.{title,openLink,newTab}` əlavə olunur, az və en.
