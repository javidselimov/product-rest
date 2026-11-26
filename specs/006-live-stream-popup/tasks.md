# Tasks: Canlı yayım (admin bölməsi + ictimai saytda popup)

**Input**: [spec.md](./spec.md), [plan.md](./plan.md). Gündəlik status [`CANLI-YAYIM-PLANI.md`](../../CANLI-YAYIM-PLANI.md)-dadır.

Yollar repo kökünə nisbidir (`commonrabc/`).

## Phase 1: Backend (api-cbar-admin, MR 1)

- [x] T001 `api-cbar-admin/src/Cbar.AdminApi/Controllers/VideoStreamsController.cs`: `ToDetailDto`-ya `s.CreatedAt`
- [x] T002 `specs/001-admin-template-migration/contracts/admin-api.md`: `/video-streams` cavabı
- [ ] T003 ⛔ `dotnet build` + `GET /api/v1/video-streams` (SDK olan maşında)

## Phase 2: Admin bölməsi (web-cbar-admin-new, MR 2), US1

- [x] T010 `src/features/live-streams/model/schemas.ts`, `createdAt` / `updatedAt` ilə
- [x] T011 YouTube URL qaydası paylaşılan yerə çıxarılır, host yoxlaması (FR-002)
- [x] T012 `src/features/live-streams/model/module.ts`: sütunlar və sahələr (FR-003)
- [x] T013 `src/features/videos/model/{modules,schemas}.ts`: stream modulu və tablar silinir
- [x] T014 `src/app/routes/index.ts`: route-lar + `/videos/streams` redirect
- [x] T015 `src/app/routes/nav.ts`: `liveStreams` bəndi
- [x] T016 `src/locales/{az,en}/{liveStreams,nav,videos}.json` + `src/shared/i18n/index.ts`
- [x] T017 `src/shared/testing/{handlers,fixtures}/live-streams.ts`, `handlers/videos.ts` təmizliyi
- [x] T018 `src/features/live-streams/live-streams.test.tsx`; `videos.test.tsx` təmizliyi
- [x] T019 `npm run verify`

## Phase 3: Status toggle (web-cbar-admin-new), US1

- [x] T020 `src/features/live-streams/components/live-status-toggle.tsx` — Status sütununda (`render: custom`), `api/live-streams.{keys,service}.ts`
- [x] T021 Test + `npm run verify`

## Phase 4: Data və bağlanma məntiqi (web-cbar-new, MR 3), US2

- [x] T030 `src/features/media/model/live-stream.ts`: `toLiveStream` + test
- [x] T031 `src/features/live-stream/model/dismissal.ts` + test (FR-005)
- [x] T032 `src/features/live-stream/model/store.ts`
- [x] T033 `src/app/[locale]/layout.tsx` → `SiteShell` prop (Phase 5 ilə birlikdə — istehlakçısız prop ölü kod olardı)

## Phase 5: Popup (web-cbar-new), US2

- [x] T040 `src/widgets/live-stream/live-stream-dialog.tsx` (FR-006)
- [x] T041 `src/shell/site-shell.tsx` mount + `web-cbar-new/CLAUDE.md` client siyahısı
- [x] T042 Test: US2 ssenariləri 1–7
- [x] T043 `npm run verify`

## Phase 6: Header düyməsi (web-cbar-new), US3

- [x] T050 `src/widgets/live-stream/live-stream-button.tsx`
- [x] T051 `src/shell/{site-header,mobile-nav}.tsx`
- [x] T052 Test + `npm run verify`
