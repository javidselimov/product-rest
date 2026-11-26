# Implementation Plan: Canlı yayım (admin bölməsi + ictimai saytda popup)

**Spec**: [spec.md](./spec.md) · **Tracker**: [`CANLI-YAYIM-PLANI.md`](../../CANLI-YAYIM-PLANI.md)

## Yanaşma

Mövcud data qatı yenidən istifadə olunur. Yeni cədvəl, migration və public endpoint yoxdur.

| Proyekt | Dəyişiklik | MR |
| --- | --- | --- |
| `api-cbar-admin` | `VideoStreamsController.ToDetailDto`-ya `CreatedAt` | 1 |
| `web-cbar-admin-new` | `videoStreamsModule` → `features/live-streams`, ayrıca sidebar bəndi, YouTube yoxlaması, status toggle | 2 |
| `web-cbar-new` | layout-da yayım alınır, `LiveStreamDialog` + `LiveStreamButton`, sessionStorage bağlanma qeydi | 3 |

MR-lar bir-birindən asılı deyil. Panel `createdAt` gəlməyəndə "—" göstərir.

## web-cbar-admin-new

- **Modul:** `features/live-streams/model/module.ts`, `defineModule`, `apiPath: '/video-streams'`, `basePath: '/live-streams'`, `listEnvelope: 'items'`.
- **YouTube qaydası:** `withYoutubeUrlRule` `shared/crud`-a (və ya `entities/content`-ə) çıxarılır. Parametri sahə adıdır: `videos` üçün `youtubeUrl`, `live-streams` üçün `streamUrl`.
- **Status toggle:** `rowActions` komponenti `PUT /video-streams/{id}` göndərir, sətirin tam DTO-su ilə və `isLive` tərsinə çevrilmiş halda. Siyahı detail forması ilə eynidir, ayrıca GET lazım deyil.
- **Route:** `createCrudRoutes`, köhnə `/videos/streams` → `/live-streams` redirect.

## web-cbar-new

```
app/[locale]/layout.tsx (server)
  └─ getVideoStreams(locale) → toLiveStream() → { id, title, embedUrl } | null
      └─ SiteShell (server) ─┬─ SiteHeader → LiveStreamButton ('use client')
                             ├─ MobileNav  → LiveStreamButton
                             └─ LiveStreamDialog ('use client')
                                   ├─ usePathname()
                                   ├─ useLiveStreamStore (open/setOpen)
                                   └─ dismissal.ts (sessionStorage, try/catch)
```

- **Layout remount olmur.** Ona görə açılma yoxlaması `useEffect([pathname, stream.id])`-dədir: hər route dəyişikliyində `isDismissed` yoxlanılır.
- **FSD qatları:**
  - `widgets/live-stream`, `features/live-stream/model` və `features/media/model/live-stream.ts` (mapping);
  - `shell` app qatıdır və widget import edə bilər.
- **CSP dəyişmir:** `frame-src` YouTube-u artıq icazəli edir.

## Verification

- Hər iki frontend-də `npm run verify` keçir.
- Brauzerdə yoxlama: tracker-in "Son yoxlama" bölməsi.
- `api-cbar-admin` üçün `dotnet build` SDK olan maşında aparılır (lokalda bloklanıb).
