# Quickstart / Validation: Media upload hardening (spec 019)

Lokal .NET SDK yoxdur — `api-cbar-admin` və `api-cbar` yalnız GitLab `test` branch → `test` mühitində
build və yoxlanılır (Konstitusiya VIII.1 sapması, plan Complexity Tracking). §1 deploy-dan **əvvəl**,
§2–§6 sonra. Hər addımın nəticəsi (rəqəm, status, ekran) bu faylın sonundakı cədvələ yazılır.

Dəyişənlər: `ADMIN=https://<api-cbar-admin test host>`, `PUBLIC=https://api-cbar-test.cbar.az`,
`TOKEN` = `POST $ADMIN/api/v1/auth/login` cavabından access token (15 dəq).

## §0 Giriş yoxlaması

> **Cavab (2026-10-07)**: Grafana dashboard-u var — `Namespace = cbar`, `App = api-cbar-admin`. Panellər:
> **Memory** (faktiki istifadə göy, request 512 MB sarı, limit 2 GB qırmızı), **Container restarts**,
> **Revision** (deploy olunmuş versiya, məs. `3.0.0+test.33765d3a.32`), **Search in logs** (log sətri
> axtarışı). SC-001/SC-002 üçün əsas mənbə Memory + Container restarts panelləridir; log sətri dəqiq
> peak rəqəmi üçün əlavə mənbədir (panel scrape intervalı qısa pikləri hamarlaya bilər).

- [ ] `test` podunun yaddaş qrafikinə və restart sayına baxmaq mümkündür (Rancher/Grafana/`kubectl`)?
      Bəli → SC-001/SC-002 üçün əsas mənbə. Xeyr → yalnız log sətri (research R8) və restart üçün
      `/healthz` + log-da startup mesajlarının sayı.
- [ ] Test faylları hazırdır (scratchpad-da, repo-ya commit olunmur): 4 fərqli ~240 MB fayl (məs.
      təsadüfi baytlı, sonu `.zip` imzalı deyil — **həqiqi** ZIP: böyük təsadüfi faylı arxivləyin),
      bir 250 MB-a yaxın PDF; hər icazəli tipdən bir kiçik həqiqi fayl; saxta fayllar
      (`png-as.pdf`, `text-as.png`, `html-as.xls`, `exe-as.docx`); skriptli `xss.svg`
      (`<svg xmlns=… onload="alert(document.domain)"><script>alert(1)</script>…`); `xss.xml`
      (XHTML namespace-li `<script>`).

## §1 Deploy-dan əvvəl (baseline və qərar ölçmələri)

**a. Yaddaş baseline (köhnə upload kodu).** Plan icra sırasının 1-ci commit-i yalnız log sətrini əlavə
edir (research R8). Həmin commit deploy olunandan sonra: bir 240 MB yükləmə → log-dan `WorkingSet` /
`PeakWorkingSet` artımı; sonra 4 paralel yükləmə → uğur sayı və restart sayı. Gözlənti: pik artım
≥ 500 MB; paralel testdə OOMKill mümkündür (test mühitidir, qəbul olunur — əvvəlcədən komandaya xəbər verin).

**b. İmza qaydasının mövcud kitabxanaya quru tətbiqi (research R5 riski).** Scratchpad-da kiçik Node
skripti: `GET $ADMIN/api/v1/media?pageSize=100&page=N` ilə bütün qeydləri (id, `originalName`,
`mimeType`) gəzir, hər biri üçün `GET $PUBLIC/media/{id}` açır, ilk 1024 baytı oxuyub bağlantını kəsir,
[data-model.md §2](./data-model.md#2-məzmun-imzaları-fr-005) qaydasını tətbiq edir. Çıxış: tip üzrə
`uyğun / uyğunsuz` sayı və uyğunsuzların siyahısı. **Gate**: uyğunsuz > 0 olan tip varsa implementasiyadan
əvvəl istifadəçi ilə qərar (istisna, bildiriş və ya qayda düzəlişi) — spec yenilənir.

**c. PDF + `sandbox` CSP (research R7).** Lokal Node serveri (`node:http`, .NET lazım deyil) eyni PDF-i
iki URL-dən verir: başlıqsız və `nosniff` + `default-src 'none'; style-src 'unsafe-inline'; sandbox` ilə.
Chrome, Edge, Firefox-da birbaşa açılır. Nəticə: PDF hər üçündə CSP ilə də normal görünürsə → PDF
istisnası silinir (data-model §5, contracts/public-media.md yenilənir); yoxsa istisna qalır və spec FR-009
mətni buna uyğun yenilənir. Eyni serverdə `xss.svg` CSP ilə açılır → alert çıxmamalıdır (qaydanın özünün
yoxlaması).

**d. Dedup baseline.** Mövcud bir faylı yükləyin → qaytarılan `id`; `SELECT count(*) FROM media_assets`
(və ya `GET /media` `total`) qeyd edin.

## §2 Spec-first (OpenAPI)

```bash
cd product-rest/api-cbar-admin/openapi && npm run lint && npm run bundle
cd product-rest/api-cbar/openapi       && npm run lint && npm run bundle
node .claude/skills/sync-openapi/scripts/route-diff.mjs   # route fərqi 0 olmalıdır
```

Gözlənti: lint təmiz, route-diff fərqsiz (route əlavə/silinmir). Spec dəyişiklikləri istifadəçi tərəfindən
təsdiqlənir, sonra kod.

## §3 Yaddaş (US1, SC-001, SC-002, SC-007)

1. Bir 240 MB yükləmə → log sətri: `PeakWorkingSet` artımı **< 50 MB** (SC-002), §1a ilə müqayisə.
2. 4 fərqli 240 MB faylı paralel yükləyin (4 ayrı `curl -F file=@… &`) → 4/4 `200`, restart sayı 0 (SC-001).
3. Yükləməni yarıda kəsin (`curl`-u Ctrl+C) → `GET /media?search=<ad>` qeyd tapmır; pod girişi varsa
   `ls /tmp | wc -l` yükləmədən əvvəlki sayla eynidir (SC-007). Log-da 499, Error yoxdur.
4. 250 MB-dan böyük fayl → bu günkü kimi rədd (400/413).

## §4 Dedup (FR-004, SC-003)

1. §1d-dəki faylı yenidən yükləyin → eyni `id`, `total` artmır.
2. Eyni faylı iki terminaldan eyni anda → hər ikisi eyni `id` (spec 018 davranışı).
3. Bir test faylını yükləyin, `DELETE`, yenidən yükləyin → eyni `id`, qeyd bərpa olunur.

## §5 Tip və ad (US3, US4, SC-005)

1. Hər icazəli tipdən həqiqi fayl → hamısı `200` (`.doc`, `.xls`, `.docx`, `.xlsx`, BOM-lu `.svg`/`.xml` daxil).
2. Hər saxta fayl → `400`, `message` = `File content does not match type '…'.`, `total` artmır.
3. Adlar ([data-model.md §3](./data-model.md#3-fayl-adı-qaydası-fr-007-fr-008) cədvəli) — `curl -F
   "file=@hesabat.pdf;filename=..\\..\\evil\tname.pdf"` və s.; `GET /media?search=` ilə saxlanan adı
   yoxlayın. 300 simvolluq ad → `200`, ad 255, `.pdf` ilə bitir.
4. Admin panel (`web-cbar-admin-next`, 5174, `VITE_API_URL` test-ə): saxta fayl yükləyəndə toast-da
   API mesajı görünür (FR-006).

## §6 Public başlıqlar (US2, SC-004, SC-006)

1. `curl -sI $PUBLIC/media/<svg id>` → `X-Content-Type-Options: nosniff`, `Content-Security-Policy: …sandbox`.
   `curl -sI $PUBLIC/media/<pdf id>` → `nosniff`; CSP §1c qərarına uyğun.
2. `xss.svg` və `xss.xml`-i admin-dən yükləyin, public URL-i brauzerdə birbaşa açın → şəkil/sənəd
   görünür, alert yoxdur, DevTools Console-da CSP bloku görünür (SC-004).
3. Public saytda (`web-cbar-next` `npm run local:testcbar` və ya test sayt) şəkilli səhifə → şəkillər
   görünür; bir PDF linki brauzerdə açılır.
4. `openapi/scripts/contract-check.mjs` (`api-cbar`) → yaşıl.
5. SC-006 (seed): lokal `.\dev.ps1 -Seed` .NET SDK tələb edir — bu maşında mümkün deyil. Əvəzində
   `test`-də `placeholder-1.svg` / `placeholder-2.svg`-ni yükləyin → `200` (imza: `<`-lə başlayır) və
   public URL `<img>` kimi görünür. Tam seed yoxlaması SDK olan maşında və ya növbəti boş-baza qurulumunda.

## Nəticələr

| Addım | Gözlənti | Faktiki | Tarix |
|---|---|---|---|
| §1a ingress limiti | — | **`test` ingress gövdəni ~100 MiB-də kəsir** (nginx 413): 100 000 000 B → keçir, 104 857 600 B → 413. 250 MB faylla ölçmə mümkün deyil; ölçmə 96.5 MB (90 MiB) faylla aparılır | 2026-10-07 |
| §1a pik artım (köhnə), 1 × 96.5 MB | ≈ 2 × fayl | id 2117, 10:11:22–10:11:41 Bakı, 200, 18.4 s — Grafana Memory: **~180 → ~510 MB (+~330 MB ≈ 3.4 × fayl)** | 2026-10-07 |
| §1a 4 paralel (köhnə), 4 × 96.5 MB | restart ≥ 0 | id 2118–2121, 10:11:59–10:12:26 Bakı, 4/4 200, 24–26 s — Grafana Memory: **~510 MB → ~1 GB**, sonra 10:24-ə qədər **~1 GB-da qalır** (yaddaş geri qaytarılmır); restarts **0** | 2026-10-07 |
| §1b uyğunsuz sayı | 0 | **8 / 1976** yoxlanan (133 → 404, obyekt anbarda yoxdur): 4 `.png` əslində JPEG (id 946, 1363–1365), 2 `.jpg` əslində PNG (1326, 1368), 2 `.rar` əslində 7-Zip (1535, 1536). Qalan tiplər 0 | 2026-10-07 |
| §1c PDF + CSP (Chrome/Edge/Firefox) | — | açılır (istifadəçi yoxladı) → PDF istisnası silindi | 2026-10-07 |
| Yeni versiya | — | Revision `3.0.0+test.c484f828.33`, pod ~10:34 Bakı; boş vəziyyətdə ~50 MB (köhnə pod ~1 GB-da qalmışdı) | 2026-10-07 |
| §3.1 pik artım (yeni), 1 × 96.5 MB | < 50 MB | id 2122, 10:39:53–10:40:12 Bakı, 200 — Grafana Memory: ~50 → ~135 MB (+~80 MB). ⚠️ hədəf ödənmədi, istifadəçi qəbul etdi (spec FR-001 qeydi) | 2026-10-07 |
| §3.2 4 paralel (yeni), 4 × 96.5 MB | 4/4, restart 0 | id 2123–2126, 10:40:32–10:40:58 Bakı, **4/4 200** (11–25 s) — Grafana Memory ~135 → ~260 MB (köhnə: ~1 GB); restarts **0**. Log (10:41:31–32): process working set **~380 MB, peak 385 MB** — artım disk keşi deyil, prosesin özüdür | 2026-10-07 |
| §3.3 kəsilmə | qeyd yoxdur | 10:41:43, 21 MB-da kəsildi → `search=big-abort` **total 0**. `/tmp` sayı — pod girişi yoxdur, yoxlanmadı (fayl `DeleteOnClose`) | 2026-10-07 |
| §4 dedup | eyni id, total sabit | ✅ ardıcıl (2153/2153, ilk ad qayıdır), paralel (2154/2154), silmə → yenidən yükləmə bərpa edir (2153) | 2026-10-07 |
| §5 tip/ad | 100% / 100% | ✅ saxta 8/8 → 400 (dəqiq mesajla), həqiqi 22/22 → 200, ad 9/9, boş fayl → 400. **Cəmi 43/43** (`functional.mjs`) | 2026-10-07 |
| §6 başlıqlar | nosniff + CSP | ✅ `api-cbar` deploy-dan sonra SVG (2143), XML (2144), PDF (2131), JPEG (2127) — hamısında `nosniff` + sandbox CSP; 304 və 404 dəyişməyib; `contract-check.mjs` **73/73** | 2026-10-07 |
| §6 SVG/XML skript | 0 icra | ✅ istifadəçi brauzerdə `xss.svg` və `xss.xml`-i birbaşa açdı — alert yoxdur; PDF açılır | 2026-10-07 |
| SC-006 seed | şəkillər görünür | ⚠️ tam yoxlanmadı: `placeholder-*.svg` bu checkout-da yoxdur, `test`-də mock seed yüklənməyib (`/media/1` → 404). Əvəz: `plain.svg`/`bom.svg` 200 ilə qəbul olundu (imza `<`) | 2026-10-07 |
