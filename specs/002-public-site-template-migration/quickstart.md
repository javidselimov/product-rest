# Quickstart: `web-cbar-next` — icra və verification bələdçisi

**Faza 1** | Tarix: 2026-09-14 | Spec: [spec.md](./spec.md) | Plan: [plan.md](./plan.md)

Bu sənəd feature-in uçdan-uca işlədiyini sübut edən icra ssenariləridir. Kontrakt detalları
[contracts/](./contracts/), modellər [data-model.md](./data-model.md)-dədir.

## 1. Ön şərtlər

- Node 22 (`.nvmrc`), npm; Docker (Postgres/Redis/MinIO/Meilisearch üçün).
- .NET SDK (`api-cbar-admin`, `api-cbar`).
- Seed-lənmiş baza: `.\dev.ps1 -Seed` (və ya `./dev.sh seed`) + `GUIDE.md`-dəki iki addımlı
  mock məzmun (placeholder şəkillər → `mock-content.sql`). Boş sayt = boş baza (root VIII.4).
- VPN **lazım deyil**: kit `vendor/cbar-lib-react-ui-kit-0.4.0.tgz`-dən quraşdırılır.

## 2. Quraşdırma və işə salma

```powershell
# bütün stack (köhnə 3000 + yeni 3001 yanaşı)
.\dev.ps1
```

```powershell
# yalnız yeni sayt, əl ilə
cd web-cbar-next
npm run install:public      # public paketlər
npm run install:offline     # kit (vendor tarball)
npm run dev                 # http://localhost:3001 → /az
```

Gözlənilən: `http://localhost:3001/` → `http://localhost:3001/az`; başlıqda CMS menyusu, altlıq;
`logs/web-public-next.log`-da env xətası yoxdur. Kit quraşdırılmayıbsa səhifənin başında
`role="alert"` xəbərdarlığı görünür (template `kit-status`) — `install:offline` təkrar işlədilir.

## 3. Merge gate (hər faza sonunda)

```bash
cd web-cbar-next
npm run verify     # setup:check → check:self-contained → lint → typecheck → test:run → build
npm run audit      # critical/high sıfır (ECharts əlavəsindən sonra)
```

Statik yoxlamalar (`npm run lint` daxilində): hex/rgb/oklch/palitra sinifi sıfır; hardcoded JSX
mətn sıfır; `dangerouslySetInnerHTML` yalnız `widgets/cms-content` faylında (istisna şərhi ilə);
`NEXT_PUBLIC_*` sıfır; `@/server/*` client importu sıfır; placeholder qalığı sıfır.

## 4. Uçdan-uca ssenarilər (əl ilə, real API, iki sayt yanaşı)

Hər ssenari `http://localhost:3000` (köhnə) və `http://localhost:3001` (yeni) üzərində eyni
ünvanla açılır.

| # | Ssenari | Addımlar | Gözlənilən |
| --- | --- | --- | --- |
| 1 | Yönləndirmə (US1, SC-007) | `/`, `/laws?type=law&page=2`, `/en/laws`, `/ru` | `/az`, `/az/laws?type=law&page=2`, ötür, 404 (kit dizaynı) |
| 2 | Menyu (FR-006) | Başlıqda bölmələri say; 9-cu bölmə "daha çox"-da; 3-cü səviyyəyə keçid; `navUrl`-lu səhifə | Köhnə ilə eyni keçid ünvanları |
| 3 | Dil (FR-008) | `/az/laws?type=law&page=2`-də EN | `/en/laws?type=law&page=2`; yalnız EN seçim kimi görünür |
| 4 | Mobil (FR-010) | 400px en, menyu düyməsi | Sheet açılır, tam ağac; üfüqi sürüşmə yoxdur |
| 5 | Tema (US1-6) | Toggle → yenilə → başqa səhifə | `.dark` html-də, cookie `ui-theme`, hydration xəbərdarlığı yoxdur (konsol) |
| 6 | Ana səhifə (US2) | `/az` | Slayder, məzənnə (trend işarəsi), dəhliz, inflyasiya, pul bazarı, gəlirlik qrafiki, xəbər/media tabları, vidjetlər, nəşrlər, keçidlər — köhnə ilə eyni məlumat |
| 7 | Blok xətası (US2-5) | `api-cbar` dayandırılıb `/az` açılır (və ya bir endpoint 500) | Qabıq render olunur, kartlar `ErrorState`; texniki mesaj yoxdur |
| 8 | CMS səhifəsi (US3, SC-003) | "Haqqımızda", "Pul siyasəti" | DevTools-da `details[data-accordion]`, `table`, `img`, `a[href*="/media/"]`, `iframe` sayları köhnə ilə eyni; media keçidi mütləq + `_blank` |
| 9 | Boş məzmun (US3-3) | Yalnız alt səhifəsi olan bölmə | Alt səhifə kartları |
| 10 | Press relizlər (US3-4) | `?type=2&page=3`; diapazondan kənar `page=999` | Yalnız elanlar, cari səhifə 3; boş vəziyyət |
| 11 | Qanunlar (US3-5) | Kateqoriya + tip seçib göndər; dil dəyiş | URL parametrləri yenilənir və dil dəyişəndə qalır |
| 12 | Bir dilli məzmun (US3-6) | `az`-da olan, `en`-də boş reliz `/en/press-releases/{slug}` | 404 |
| 13 | Məzənnə (US4-1) | `/az/currencies?date=…`; XML keçidi | Sətirlər köhnə ilə eyni sıra və dəyər; keçid `{API_URL}/currencies/DD.MM.YYYY.xml` |
| 14 | Statistika (US4-2) | `/az/statistics` | AZIR bütün müddətlər, inflyasiya cari il, gəlirlik son tarix; rənglər kit token-ları (DevTools: `--ui-color-chart-1`); boş cədvəl → boş vəziyyət |
| 15 | MEAS (US4-3) | Emitent + tip filtri | Cədvəl, fayl keçidləri, boş vəziyyət |
| 16 | Pul nişanları, təşkilat, media, axtarış (US5) | Hər bölmə + detal + `?q=manat` | Köhnə ilə eyni məzmun; media tabları JS-siz də görünür |
| 17 | JS-siz (FR-025) | DevTools "Disable JavaScript", `/az/laws` | Məzmun, menyu keçidləri, filtr forması, səhifələmə işləyir |
| 18 | SC-002 sorğu müqayisəsi | `logs/api-web.log`-u təmizlə, köhnədə `/az` aç, sorğuları kopyala; yenidə eyni | Yol + parametr çoxluğu eynidir |

## 5. Avtomatik testlər (Vitest + MSW)

```bash
cd web-cbar-next
npm run test:run
npm run test -- src/shared/lib/cms-html.test.ts      # legacy markup sayları + sanitizasiya
npm run test -- src/proxy.test.ts                    # yönləndirmə cədvəli
npm run test -- src/shared/i18n/key-parity.test.ts   # az/en pariteti
```

Gözlənilən: hər view üçün ən azı bir test (`views/*/index.test.tsx`), hər loader üçün MSW testi
(`views/*/loader.test.ts`), `cms-html.test.ts` fikstürdə accordion/table/img/iframe sayları
sabit, `<script>`/`on*`/`javascript:` sıfır; `onUnhandledRequest: 'error'` — kontraktdan kənar
sorğu testi uğursuz edir.

## 6. Deploy yoxlaması

```bash
cd web-cbar-next
npm run setup:check -- --strict     # placeholder qalığı sıfır
npm run docker:build                # BuildKit + nexus secret (VPN); və ya CI
docker run -p 3000:3000 -e API_URL=http://host.docker.internal:5139 web-cbar-next
```

Gözlənilən: `http://localhost:3000/az` açılır, media şəkilləri `API_URL` host-dan yüklənir
(CSP `img-src`), YouTube iframe oynayır (CSP `frame-src`), konsolda CSP pozuntusu yoxdur.

## 7. Problemlər

| Simptom | Səbəb / həll |
| --- | --- |
| Sayt boşdur, menyu yoxdur | Baza boşdur — `dev.ps1 -Seed` + mock məzmun; `api-cbar` `cbar_web_ro` rolu ilə qoşula bilmir (əvvəl `api-cbar-admin`) |
| Şəkillər 404 | Mock məzmun addım sırası pozulub (placeholder şəkillər əvvəl yüklənməli) |
| Şəkillər yüklənmir, konsolda CSP | `img-src`-də `API_URL` origin yoxdur — env düzgün verilməyib |
| Səhifə başında kit xəbərdarlığı | `npm run install:offline` işlədilməyib |
| `Env yoxlaması uğursuz` | `API_URL` url deyil / `CSP_FRAME_SRC` formatı |
| Qrafik boşdur | AZIR/inflyasiya cədvəlləri seed-də yoxdur — admin paneldən dəyər daxil edin |
| Port `3001` məşğuldur | `dev.ps1` portu boşaldır; əl ilə: prosesi dayandırın |
