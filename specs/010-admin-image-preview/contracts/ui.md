# Contract: `web-cbar-admin-new` — önizləmə UI

**Feature**: [../spec.md](../spec.md) | **Research**: R2, R5, R6

## 1. Ortaq komponentlər (`features/media/components/`)

### `MediaPreview`

| Prop | Tip | Məna |
| --- | --- | --- |
| `mediaId` | `number \| null` | `null` olduqda heç nə render olunmur |
| `name` | `string \| undefined` | `alt` mətni. Yoxdursa `#id` |
| `mimeType` | `string \| null \| undefined` | Məlumdursa və şəkil deyilsə, sorğu göndərilmir |
| `size` | `'sm' \| 'md'` | `sm` = 48×48 (siyahı sətri), `md` = 96×96 (form sahəsi, kart) |
| `zoomable` | `boolean` (default `true`) | Klik `MediaLightbox`-ı açır |

Vəziyyətlərin görünüşü:
- **loading**: kit `Skeleton`.
- **image**: `<img>` elementi, `object-contain`, `alt={name}`. Çərçivə: `bg-muted rounded-md border`.
- **notImage**: mövcud `iconForMime` ikonu.
- **unavailable**: `ImageIcon` + `media:preview.unavailable` tooltip/aria mətni.

Əlavə qaydalar:
- `zoomable` olduqda element `<button type="button">` olur, `aria-label={t('media:preview.open', { name })}`.
- Yalnız semantik rənglər istifadə olunur (`check:kit`).

### `MediaLightbox`

- Kit `Dialog` istifadə olunur. Başlıqda fayl adı, içində `<img class="max-h-[80vh] max-w-full object-contain">` olur.
- Bağlama yolları: kit-in "×" düyməsi, Esc və overlay-ə klik. Fokus trigger düyməsinə qayıdır, bu, kit davranışıdır.
- Eyni keşlənmiş blob istifadə olunur, yeni sorğu getmir.
- Dialoq form daxilində render olunsa da, forma submit olunmur: bütün düymələr `type="button"`-dur.

### `useMediaPreview(id, { enabled })`

- Query açarı `mediaKeys.preview(id)`-dir.
- `mediaService.preview(id)` sorğunu `apiClient.get('/media/{id}/preview', { responseType: 'blob' })` ilə göndərir.
- Nəticə `{ kind: 'image', blob } | { kind: 'notImage' } | { kind: 'unavailable' }` olur. 415 → `notImage`, 404 və digər xətalar → `unavailable`. Komponentə xəta atılmır.

## 2. İnteqrasiya nöqtələri

| Yer | Dəyişiklik | User story |
| --- | --- | --- |
| `features/media/components/media-id-field.tsx` | `#id · ad`-ın solunda `MediaPreview size="md"`. Seçicidən gələn `item.mimeType` yadda saxlanılır, "Təmizlə" onu sıfırlayır | US1 |
| `features/media/components/media-picker-dialog.tsx` | Kartdakı mime ikonu şəkil faylları üçün `MediaPreview size="md" zoomable={false}` olur. Kart kliki seçimdir, zoom deyil | US2 |
| `features/galleries/components/gallery-images-section.tsx` | Sətir ikonu → `MediaPreview size="sm"` | US2 |
| `features/assets/components/assets-section.tsx` | Sətir ikonu → `MediaPreview size="sm" mimeType={asset.mimeType}` | US2 |
| `features/media/components/media-grid.tsx` (kitabxana) | Kart ikonu → `MediaPreview size="md"` | US3 |

`field-control.tsx`, `crud-form-page.tsx` və modul konfiqləri **dəyişmir**: hamısı `MediaIdField`-dən keçir.

## 3. i18n (`locales/{az,en}/media.json`, hər iki dil məcburi)

| Açar | az | en |
| --- | --- | --- |
| `preview.open` | `{{name}} — böyüt` | `Enlarge {{name}}` |
| `preview.unavailable` | `Önizləmə əlçatan deyil` | `Preview unavailable` |
| `preview.loading` | `Önizləmə yüklənir` | `Loading preview` |

`preview.close` implementasiyada **yoxdur**: kit `Dialog`-un "×" düyməsinin öz tərcümə
olunmuş etiketi var (`dialog.close`). Lightbox `DialogTrigger asChild` ilə açılır, buna
görə bağlananda fokusu kit özü trigger-ə qaytarır. Obyekt URL-i `useObjectUrl` əvəzinə
`useBlobImageRef` (ref cleanup ilə revoke) + `PreviewImage` komponenti verir.

## 4. Test kontraktı (MSW, `shared/testing/handlers/media.ts`)

- `GET /api/v1/media/:id/preview` cavabları:
  - `mediaStore`-da `image/*` olan id → 200, fixture blob, müvafiq `Content-Type`;
  - digər mime → 415 `{ message, mimeType }`;
  - olmayan id → 404.
- Handler real kontraktı əks etdirir (template qaydası: `handlers/` = real kontrakt).
