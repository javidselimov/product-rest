# Feature Specification: Media → Qalereya (foto və video)

**Branch**: `feature/035-media-gallery-redesign`

**Created**: 2026-11-05

**Status**: Implemented (deploy gözləyir)

**Input**: Media bölməsinin "Fotoqalereya" və "Videoqalereya" bəndlərini yeni Figma dizaynına keçirmək: bir
"Qalereya" səhifəsi, iki tab, axtarış və tarix filtri, səhifələmə, foto və video detalı.

**Figma** (`cbar website (Copy)`, səhifə `Media`, bölmə `Qalereya` `1647:35084`):

| Ekran | Desktop | Tablet 744 | Mobile 390 |
|---|---|---|---|
| Fotoqalereya siyahısı | `1643:29161` | `1660:23914` | `1660:24682` |
| Videoqalereya siyahısı | `1647:32539` | `1660:25331` | `1660:26117` |
| Video detalı | `1647:34253` | `1660:26784` | `1660:27317` |
| Foto detalı | `1646:31123` | `1660:27731` | `1660:28311` |

- **Siyahı**: H1 "Qalereya" (32/44), "Fotoqalereya" / "Videoqalereya" tabları (18/24, 40 + 15 + 1 xətt), filtr
  (axtarış + tarix aralığı + "Filtrləri təmizlə" + "Axtar", 44), 3 × 3 kart, səhifələmə sağda. Kart Xəbər kartının
  eynisidir (`1048:23216/23217`): şəkil 312 × 197, 24, tarix 16/28, 16, başlıq 20/28.
- **Video detalı**: H1 = video adı, 36, 984 × 601 örtük (#D4D4D4), ortada 80 px dairə (qara 55%) və 40 px play ikonu.
- **Foto detalı**: H1 = qalereya adı, Xəbər detalının fotoqalereyası (`photogallery`), tarix və səhifələmə yoxdur.

## User Scenarios & Testing

### US1 — Qalereya siyahısı (P1)

Ziyarətçi `/media/galleries`-də fotoqalereyaları, `/media/videos`-da videoları görür; tabla o biri siyahıya keçir.

1. **Given** aktiv qalereyalar, **When** `/az/media/galleries` açılır, **Then** H1 "Qalereya", "Fotoqalereya" tabı
   aktivdir, 9 kart ən yeni tədbir tarixindən başlayır, kart qalereya detalına aparır.
2. **Given** filtrli siyahı, **When** "Videoqalereya" tabına basılır, **Then** `/az/media/videos` filtrsiz açılır.
3. **Given** video siyahısı, **Then** kartda YouTube önizləməsi var, kart `/media/videos/{id}`-yə aparır (xarici keçid yox).
4. **Given** 9-dan çox qeyd, **Then** səhifələmə görünür və keçidlər filtrləri saxlayır.

### US2 — Axtarış və tarix filtri (P1)

1. **When** ad yazılıb "Axtar" basılır, **Then** GET forması `q`, `from`, `to` göndərir, `page` göndərmir.
2. **Then** qalereyada tarix `eventDate`-ə, videoda `publishedAt`-ın Bakı gününə görədir; tarixsiz qeyd filtr qoyulanda düşür.
3. **When** nəticə yoxdur, **Then** "Heç nə tapılmadı"; filtrsiz boş siyahıda "Fotoqalereya / Video tapılmadı".
4. **When** "Filtrləri təmizlə", **Then** eyni siyahı filtrsiz açılır.

### US3 — Detallar (P1)

1. **Given** video, **When** örtüyə basılır, **Then** `youtube-nocookie` iframe-i autoplay ilə açılır; ondan əvvəl YouTube-dan yalnız önizləmə yüklənir.
2. **Given** YouTube olmayan keçid, **Then** pleyer yoxdur, yalnız "YouTube-da izlə" keçidi.
3. **Given** qalereya, **Then** H1 adı, böyük şəkil və miniatürlər; tarix yoxdur.
4. **Given** deaktiv və ya dildə tərcüməsi olmayan qalereya/video, **Then** 404.

## Requirements

- **FR-001** `api-cbar` `GET /galleries`, `GET /videos`: `q` (trim, ILIKE, `%`/`_`/`\` literal, > 200 → 400), `from`, `to`.
- **FR-002** `api-cbar` yeni `GET /videos/{id}`: aktiv + dildə tərcümə, siyahı ilə eyni proyeksiya, yoxdursa 404.
- **FR-003** `GET /galleries/{id}` dildə tərcümə olmayanda 404 (`title` artıq null deyil).
- **FR-004** Sayt: bir view iki siyahı üçün, link tablar, `ListFilter` (Xəbərlərlə ortaq), `NewsGrid`, 9 kart/səhifə.
- **FR-005** Video siyahısından canlı yayım kartı çıxır; canlı yayım düyməsi (`layout.tsx`) qalır.
- **FR-006** Video detalı client facade, iframe yalnız klikdə; CSP dəyişmir.
- **FR-007** Admin panelə və miqrasiyaya dəyişiklik yoxdur.

## Qəbul olunmuş sapmalar

- Kart, tarix qutusu (28, Figma 24) və planşet filtri (164, Figma 172; düymələr 144 sağda, Figma 304 + 336) Xəbər
  widget-ləridir, spec 029-da qəbul olunub (`029-media-news/visual-diff.md` #2, #5, #7). Kart sabit 367 deyil, başlıq qısa olanda kiçilir.
- Desktop filtrdə Figma sağ qrupu `MIN`-ə düzür (sağda 38 px boşluq); Xəbərlərdə `SPACE_BETWEEN`-dir. Ortaq widget sağa düzür.
- Mobil H1 altı 32 (Figma 24) — `section-shell`, spec 034-də də qeyd olunub.
- Tarixsiz qalereya siyahıda əvvəldədir (Postgres `DESC`-də NULL birinci) — sıralama 035-də dəyişmir.

## Success Criteria

- **SC-001** `npm run verify` Node 24 və 22-də yaşıl; `dotnet build`, `route-diff` 0 fərq.
- **SC-002** 1728/744/390-da Figma ilə ölçmə: yuxarıdakı sapmalardan başqa ≤ 1 px (scrollbar 15 px nəzərə alınmaqla).
