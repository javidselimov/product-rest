# Paritet cədvəli: `web-cbar-admin` → `web-cbar-admin-next`

**Purpose**: Spec SC-001/SC-002 üçün ekran-ekran paritet qeydi (tasks T125). Cutover qərarının giriş sənədi.
**Created**: 2026-09-07
**Feature**: [spec.md](../spec.md)

**Sübut mənbələri**: (A) avtomatik — `npm run verify` (lint, check:kit, check:i18n, tsc, 314 test / 41 fayl, build) və `roundtrip.test.ts`; (L) canlı — `.\dev.ps1 -Seed -NextAdmin` ilə real `api-cbar-admin` (:5253) və seed baza (134 səhifə); brauzerdə giriş, qabıq, səhifə ağacı, qanunlar siyahısı; `npm run roundtrip -- "Haqqımızda"` → 2 tərcümə, 0 mismatch (legacy HTML API vasitəsilə səhifə 1-ə yazıldıqdan sonra — seed bazasında heç bir səhifənin `content`-i yoxdur).

**Marker**: `[x]` = paritet təsdiqlənib (sübut sütununda hansı mənbə ilə). Boş qutu = əl ilə icra qalır.

## Ekranlar

| # | Köhnə ekran | Yeni ünvan | Sübut | Status |
| --- | --- | --- | --- | --- |
| 1 | Giriş | `/login` | A (auth-flow 6 test) + L (brauzer: giriş, `redirect` ilə geri qayıdış, yanlış giriş mesajı testdə) | [x] |
| 2 | İdarə paneli | `/` | A (router test) + L (brauzer ekranı) | [x] |
| 3 | Səhifə ağacı | `/pages` | A (pages 9 test: az/en, bayraqlar, köçürmə, silmə sayı) + L (ağac real seed ilə yükləndi) | [x] |
| 4 | Səhifə formu + sənədlər | `/pages/new`, `/pages/$id` | A (yaratma, validasiya, kilid, sənəd sıralama/başlıq/ayırma) | [x] |
| 5 | Zəngin mətn redaktoru | forma daxili | A (roundtrip 9 test, editor 5 test) + L (canlı round-trip 0 mismatch) | [x] |
| 6 | Press relizlər | `/press-releases` | A (5 test: siyahı, filtr, axtarış, yaratma, sənəd bağla/ayır) | [x] |
| 7 | Media kitabxanası | `/media-library` | A (5 test: siyahı, axtarış URL, silmə, 409 banner, yükləmə) | [x] |
| 8 | Qanunlar + kateqoriyalar | `/laws`, `/laws/categories` | A (6 test) + L (brauzer: 11 qanun real API-dən, kateqoriya adları lookup-dan, nişanlar, filtrlər) | [x] |
| 9 | MEAS sənədlər / emitentlər / məlumat tipləri | `/meas`, `/meas/emitents`, `/meas/info-types` | A (6 test) — qeyd: API sahəsi `regDate` (kontrakt düzəldildi) | [x] |
| 10 | Təşkilat: heyət / şöbələr / ofislər | `/organization/staff`, `/organization/divisions`, `/organization/offices` (`/organization` → staff) | A (6 test) | [x] |
| 11 | Pul nişanları / kateqoriyalar / xəbərlər | `/money-marks`, `/money-marks/categories`, `/money-marks/news` | A (6 test: iki media sahəsi, tip filtri, lookup) | [x] |
| 12 | Qalereyalar + şəkillər | `/galleries` | A (4 test: əlavə → sırala (tam siyahı) → çıxar, 409) | [x] |
| 13 | Videolar / yayımlar | `/videos`, `/live-streams` (spec 006: ayrıca bölmə; `/videos/streams` → redirect) | A (videos 2 test + live-streams 14 test: YouTube URL validasiyası, Aktiv/Qeyri-aktiv) | [x] |
| 14 | Ana səhifə hub + bannerlər, slayder, sürüşən sətirlər, linklər, nəşrlər | `/homepage-blocks/*` | A (6 test: şəkil-only banner `translations:{}`, tarixlər, items envelope səhifələməsiz) | [x] |
| 15 | Məlumat sətirləri | `/homepage-blocks/info-lines` (`/info-lines` → redirect) | A (5 test: qruplu cavab düzləşir, `alias` axtarışı URL-də, 13 alias) | [x] |
| 16 | Məzənnə vərəqi | `/currency-rates` | A (6 test: son vərəq, yeni vərəq, dəyiş/sil/əlavə, təkrar kod, boş rate, PUT yalnız qalan kodlar, tarixlər çekmecəsi) | [x] |
| 17 | Valyuta siyahısı | `/currency-rates/currencies` | A (3 dirty sətir → 3 PUT → dirty təmizlənir) | [x] |
| 18 | AZIR | `/azir` | A (6 test: upsert eyni açar → bir sətir, filtr URL, silmə) | [x] |
| 19 | İnflyasiya | `/inflation` | A (5 test) | [x] |
| 20 | Gəlirlik əyriləri | `/yield-curves`, forma | A (5 test: təkrar period, `parameters:null`, 409) | [x] |
| 21 | İstifadəçilər + şifrə sıfırlama | `/users` | A (7 test: zəif şifrə, yaratma, username kilidli, sıfırlama, öz hesabı 409) | [x] |
| 22 | Parametrlər | `/settings` | A (5 test: JSON xətası, yeni açar, açar kilidli) | [x] |
| — | `*` "hazır deyil" | template 404 | A (router test) | [x] (əvəz olunub) |
| — | Template demo (layihələr, komanda, hesabatlar, kit qalereyası) | silinib | — | [x] (ləğv) |

## Spec uğur meyarları

| SC | Nəticə |
| --- | --- |
| SC-001 (20 ekran işlək) | 22 ekran konfiq/xüsusi ekran kimi qurulub; hər biri MSW ilə real kontrakta qarşı test olunub; 4-ü (giriş, idarə paneli, səhifə ağacı, qanunlar) real API ilə brauzerdə də icra olunub. Qalan ekranların real API ilə əl icrası açıqdır (aşağıya bax). |
| SC-002 (payload eyniliyi) | Mühərrik köhnə `coerceFieldValue`/`defaultBuildPayload` cədvəlini birə-bir daşıyır (`form-model.test.ts`); hər modulun MSW store-u real DTO formasını yoxlayır. Brauzer Network müqayisəsi əl ilə qalır. |
| SC-003 (round-trip) | Fixture testi (6 nümunə) + canlı skript 0 mismatch. |
| SC-004 (kit-dən kənar rəng/control yoxdur) | `check:kit` sıfır tapıntı; yeganə qeyri-kit element ProseMirror redaktə sahəsidir (spec D1). |
| SC-005 (gate) | `npm run verify` keçir: lint, check:kit, check:i18n, tsc, 314 test, build. |
| SC-006 (performans) | Ölçülməyib (analiz G1 açıq qalır); TipTap ayrıca lazy chunk (485 kB), ilkin bundle 429 kB. |
| SC-007 (sessiya) | auth-flow testləri (401 → login + toast, taymer). |
| SC-008 (az/en tamlıq) | `check:i18n` 23 namespace bərabər. |

## Açıq qalanlar (əl ilə / DevOps)

- [ ] Real API ilə brauzerdə tam keçid: quickstart Q4–Q7, Q9–Q18 (brauzer avtomatlaşdırması sessiya ortasında kəsildi; yalnız Q1, Q2-nin bir hissəsi, Q8 və qanunlar siyahısı canlı görüldü). Skript və API tərəfi işləyir — `.\dev.ps1 -NextAdmin` ilə açıb keçmək kifayətdir.
- [ ] Qaranlıq tema və dar ekran vizual keçidi (Q19–Q20): tema keçidi işləyir (router testi `html.dark`), vizual yoxlama əl ilə.
- [ ] `npm run docker:build`: build stage-də `install:nexus` bu maşından Nexus-a çata bilmədi (VPN yoxdur) — CI runner-da (`NEXUS_USERNAME/PASSWORD`) və ya VPN ilə işlədilməlidir.
- [ ] DevOps: `.ci-cd/*.yaml` hostname-ləri (dev/test eyni host), prod API ünvanı, API tərəfində `Cors__Origins`.
- [ ] Seed bazasında səhifə məzmunu boşdur — canlı round-trip üçün `mock-content.sql` legacy HTML ilə yenilənməlidir (indi səhifə 1-də əl ilə yazılmış nümunə var).
