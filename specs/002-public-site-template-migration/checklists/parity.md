# Paritet checklisti: `web-cbar` (3000) → `web-cbar-next` (3001)

**Purpose**: Spec SC-001–SC-009 və quickstart §4 ssenarilərinin real stack ilə yoxlanması; cutover qərarının girişi
**Created**: 2026-09-14
**Feature**: [spec.md](../spec.md) · [tasks.md](../tasks.md) T079
**Mühit**: `dev.ps1` ilə tam stack (Docker infra + `api-cbar-admin` 5253 + `api-cbar` 5139 + iki sayt yanaşı), seed-lənmiş baza (mock məzmun); yoxlama alətləri: `curl`, `logs/api-web.log` (sorğu çoxluğu), Chrome (konsol, tema).

## 1. Route pariteti (SC-001) — status kodları

| Route | Köhnə | Yeni | Qeyd |
| --- | --- | --- | --- |
| `/` | 307 → `/az` | 307 → `/az` | eyni |
| `/laws?type=1&page=2` | 307 → `/az/laws?type=1&page=2` | 307 → `/az/laws?type=1&page=2` | sorğu qorunur |
| `/ru` | 307 → `/az/ru` | **404** | **qəbul edilmiş fərq** — spec FR-005 (dəstəklənməyən locale 404) |
| `/az`, `/en` | 200 | 200 | |
| `/az/press-releases`, `?type=2&page=3` | 200 | 200 | |
| `/az/laws`, `?type=1` | 200 | 200 | |
| `/az/securities` | 200 | 200 | cədvəl 11 sətir (10 qeyd + başlıq) |
| `/az/currencies` | 200 | 200 | 13 sətir hər ikisində; XML keçidi `currencies/19.08.2026.xml` eyni |
| `/az/statistics` | 200 | 200 | |
| `/az/national-currency`, `?type=2` | 200 | 200 | |
| `/az/national-currency/news` | 200 | 200 | |
| `/az/organization`, `?section=offices` | 200 | 200 | |
| `/az/media` | 200 | 200 | |
| `/az/search?q=manat`, `/az/search` | 200 | 200 | |
| `/az/haqqimizda`, `/az/pul-siyaseti`, `/az/tarix` | 200 | 200 | CMS catch-all |
| `/az/press-releases/{slug}` | 200 | 200 | |
| `/az/yoxdur-bele-sehife` | 404 | 404 | route `loading.tsx` silindikdən sonra (research D7) |
| `/az/press-releases/yoxdur`, `/en/laws/yoxdur`, `/az/media/galleries/999999`, `/az/organization/staff/detail/abc` | — | 404 | kit dizaynında 404 səhifəsi |
| `/en/laws?page=2` | 200 | 200 | |

Nəticə: paritet cədvəlindəki 18 route yeni saytda real API ilə işləkdir; yeganə fərq `/ru` (spec tələbi).

## 2. API sorğu çoxluğu (SC-002) — `logs/api-web.log`

Hər route üçün köhnə və yeni saytın `api-cbar`-a göndərdiyi `GET` yolları (parametrlər daxil) müqayisə edilib:

| Route | Sorğu sayı | Nəticə |
| --- | --- | --- |
| `/az` | 11 | SAME |
| `/az/press-releases?type=2&page=3` | 2 | SAME |
| `/az/laws?type=1&categoryId=1` | 3 | SAME |
| `/az/securities` | 4 | SAME |
| `/az/currencies`, `?date=2026-08-19` | 2 | SAME |
| `/az/statistics` | 4 | SAME |
| `/az/national-currency`, `?type=2` | 3 | SAME |
| `/az/national-currency/news` | 2 | SAME |
| `/az/organization`, `?section=divisions` | 2 | SAME |
| `/az/media` | 4 | SAME |
| `/az/search?q=manat` | 2 | SAME |
| `/az/haqqimizda` | 2 | SAME |
| `/en/press-releases/{slug}` | 2 | SAME |

Nəticə: 16 yoxlanan route-da fərq **sıfırdır**.

## 3. Legacy markup (SC-003) — DOM sayları

| Səhifə | Köhnə | Yeni |
| --- | --- | --- |
| `/az/haqqimizda` | accordion 1, cədvəl 1, iframe 2, media keçidi 2, şəkil 1 | accordion 1, cədvəl 1, iframe 2, media keçidi 2, şəkil 1 |
| `/az/pul-siyaseti`, `/az/tarix` | 0/0/0/0/0 (seed-də zəngin markup yoxdur) | 0/0/0/0/0 |

Media keçidləri mütləq (`http://localhost:5139/media/{id}`), `target="_blank"` + `rel="noopener noreferrer"`; accordion `<details>` ilə JS-siz açılır. Fikstür əsaslı struktur testi: `src/shared/lib/cms-html.test.ts`, `src/views/cms-page/index.test.tsx`.

## 4. Dizayn sistemi (SC-004)

- `npm run lint` sıfır tapıntı: hex/rgb/oklch/palitra sinifi, hardcoded JSX mətn, `dangerouslySetInnerHTML` (yalnız `widgets/cms-content`), `NEXT_PUBLIC_*`, `@/server/*` client importu, kit barrel.
- Qaranlıq tema: `/az/haqqimizda` və `/az/laws` Chrome-da yoxlanıb — sidebar, accordion, cədvəl, badge, filtr formaları oxunaqlıdır; tema `ui-theme` cookie ilə səhifələr arasında qorunur. Loqo qaranlıq temada açıq fon üzərində göstərilir.
- Kitdə olmayan hissələr (spec D4, research D6): mega-menyu (`<nav>` + token-lar), slayder (kit primitivləri), filtr `select`/`date` (native + kit `inputVariants`), server cədvəli (`widgets/data-table`).

## 5. Gate (SC-005)

- `npm run verify` (setup:check → check:self-contained → lint → typecheck → test:run → build): **keçir**; 63 test faylı, 500+ test.
- `npm run audit`: critical/high **0**.
- Hər view/loader üçün test var (`src/views/**`), az/en açar pariteti (`key-parity.test.ts`), UTF-8 mühafizəsi, 18 route metadata müqaviləsi (`src/app/metadata.test.ts`).

## 6. Yönləndirmə, dil, tema (SC-007, SC-008)

- Prefikssiz ünvanlar 100% `/az`-a; dil keçidi sorğu parametrlərini qoruyur (`language-switcher.test.tsx`; brauzerdə `/az/laws?type=1` → EN düyməsi).
- Bütün chrome etiketləri 10 namespace × 2 dil; kit etiketləri (`pagination`, `sheet`…) `UIMessagesProvider` ilə az/en.

## 7. Yanaşı işləmə (SC-009)

- `dev.ps1` / `dev.sh` altı serveri qaldırır; köhnə 3000, yeni 3001 eyni `api-cbar`-a qoşulur (bu checklist həmin rejimdə çıxarılıb).

## 8. Brauzer yoxlaması (quickstart §4 ssenari 4, 5, 17)

- Konsol (Chrome, `/az/haqqimizda` yenidən yüklənərək): tətbiqə aid xəta/hydration xəbərdarlığı **yoxdur**; yalnız React DevTools genişləndirməsinin öz mesajları (`eval` CSP altında — production-da yaranmır).
- Tema (ssenari 5): toggle → `html.dark`, cookie, yenidən yükləmədə qorunur ✔.
- Mobil çekmecə (ssenari 4): brauzer pəncərəsi bu sessiyada 400px-ə kiçildilə bilmədi (maksimallaşdırılmış pəncərə); davranış `src/shell/mobile-nav.test.tsx` və `accessibility.test.tsx` ilə təsdiqlənir — **əl ilə dar ekran yoxlaması cutover-dən əvvəl təkrarlanmalıdır**.
- JS-siz (ssenari 17): siyahı filtrləri GET formaları, səhifələmə adi keçidlər, accordion `<details>` — server HTML-də mövcuddur (curl ilə təsdiqlənib); brauzerdə JS söndürülərək təkrar yoxlama tövsiyə olunur.

## 9. Deploy (T078)

- `npm run setup:check -- --strict` sıfır qalıq; `npm run build` standalone çıxışı 18 route ilə keçir.
- `npm run docker:build` **icra edilməyib** — kit üçün Nexus credential-ı (VPN + `.env.nexus`) bu mühitdə yoxdur; CI eyni `install:nexus` yolunu işlədir. Cutover-dən əvvəl CI dev deploy-u ilə təsdiqlənməlidir.
- `.ci-cd/{dev,test,prod}.yaml` hostname və `API_URL` dəyərləri `TODO(devops)` daşıyır.

## 10. Qəbul edilmiş fərqlər (paritet pozuntusu deyil)

| Fərq | Mənbə |
| --- | --- |
| `/ru` → 404 (köhnə: `/az/ru`) | spec FR-005, template konstitusiyası |
| Blok xətası kartda `ErrorState` (köhnə: blok gizlənirdi) | spec US2-5 |
| Dizaynlı 404, işıqlı/qaranlıq tema, `generateMetadata` | spec Assumptions |
| Route `loading.tsx` yoxdur | research D7 (404 statusu üçün) |
| Filtr sahələri native `<select>`/`<input type="date">` kit stilində | research D6 |

## Notes

- Cutover (köhnə `web-cbar`-in silinməsi, `web-cbar-next` → `web-cbar`, port 3001 → 3000, hostname) ayrı spec-dir; bu checklist onun girişidir.
- Açıq qalanlar: dar ekran əl yoxlaması (8), CI/Docker build (9).
