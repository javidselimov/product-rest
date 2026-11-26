# Research: Müyəssərlik menyusu

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Tarix**: 2026-09-29

Bütün faktlar 2026-09-29 tarixində ölçülüb: skriptin özündən, repo-dan və rəsmi hostun cavablarından.

## Ölçülmüş faktlar: `acc-widget.min.js`

| Fakt | Dəyər |
| --- | --- |
| URL | `https://accessibility.cert.gov.az/acc-widget.min.js` |
| Ölçü / `Last-Modified` / `ETag` | 33 904 bayt / `Wed, 25 Feb 2026 10:40:38 GMT` / `"699ed1a6-8470"` |
| SHA-256 (orijinal) | `6eba54dd23e8e805d53353894581e4ed8f3ead662c8cfcb102e4579535c0e59d` |
| İşə düşmə | yalnız `document.addEventListener("readystatechange", …)`, `interactive` və ya `complete` halında. Listener silinmir. |
| Konfiqurasiya oxuma | `$(name)` = `document.querySelector("[data-accw-<name>]").getAttribute(...)`, **istənilən elementdən**. Açarlar: `lang`, `position`, `offset`, `langstatus`, `size`. |
| Standart dəyərlər | position `bottom-left`, offset `[20,20]`, size yoxdursa miqyas `1` |
| Dil | `data-accw-lang` → `<html lang>` (`az-AZ` → `az`) → `navigator.language` |
| Saxlama | cookie `accw` (JSON), `path=/`. `setTime(getTime()+NaN)` səbəbindən `expires=Invalid Date` olur, yəni **sessiya cookie-si**. `SameSite`/`Secure` yoxdur. |
| Şəbəkə | `fetch`, `XMLHttpRequest`, `eval`, `new Function` **yoxdur** |
| DOM | `innerHTML` (9 dəfə, statik şablonlar və tərcümə mətnləri), bir inline `<style>`. Konteyner `document.body.appendChild` ilə əlavə olunur. |
| Xarici istinadlar | `<img src="https://accessibility.cert.gov.az/assets/img/accw-icon.png">` (menyu footer-i). `<a href="https://accessibility.cert.gov.az/" target="_blank">` (menyu düyməsi və footer). |
| Şrift | inline `@font-face OpenDyslexic3` → `url("./fonts/OpenDyslexic3-Regular.woff")`, `.ttf`. Nisbi yol **sənədin URL-inə görə** həll olunur, yəni `/az/about/`-da `/az/about/fonts/…` olur və qırılır. |
| Resursların mövcudluğu | `fonts/OpenDyslexic3-Regular.woff` 200, 86 256 B. `.ttf` 200, 237 868 B. `assets/img/accw-icon.png` 200, 15 406 B. |

## R1 — Surətin hazırlanması (vendoring)

- **Qərar**:
  - Orijinal fayl yüklənir və SHA-256 yoxlanılır.
  - Surət `web-cbar-new/public/vendor/accw/` altına qoyulur, **yalnız üç sətir-əvəzləmə** ilə:
    1. `https://accessibility.cert.gov.az/assets/img/accw-icon.png` → `/vendor/accw/accw-icon.png`;
    2. `./fonts/OpenDyslexic3-Regular.woff` → `/vendor/accw/fonts/OpenDyslexic3-Regular.woff`;
    3. `./fonts/OpenDyslexic3-Regular.ttf` → `/vendor/accw/fonts/OpenDyslexic3-Regular.ttf`.
  - `<a href="https://accessibility.cert.gov.az/">` linkləri saxlanılır. Bunlar istifadəçi klikləyəndə açılan naviqasiyadır və müəllifliyi göstərir. Özbaşına sorğu yaratmırlar (SC-003).
  - Proses `public/vendor/accw/VENDOR.md`-də qeyd olunur: mənbə URL, tarix, orijinal və yamaqlı SHA-256, əvəzləmələr, lisenziya qeydləri (FR-012a).
- **Səbəb**: Q2 (öz serverdən). Əvəzləmə olmadan ikon rəsmi hostdan yüklənir, dyslexia şrifti isə hər alt səhifədə 404 verir.
- **Rədd edilənlər**:
  - Skriptin məntiqini dəyişmək, məsələn cookie ömrünü düzəltmək və ya init-i yenidən yazmaq. Hər yeniləmədə diff yığılır və "yoxlanılmış surət" artıq "rəsmi kod" olmur.
  - Qeyri-minify versiyanı (`assets/js/acc-widget.js`) götürmək. Rəsmi paylanan fayl `.min.js`-dir.
- **Lisenziya**:
  - OpenDyslexic SIL OFL 1.1 lisenziyasındadır, yenidən paylamağa icazə verir. OFL mətni `fonts/`-a qoyulur.
  - Skriptin öz lisenziyası göstərilməyib. Bu, spec Assumptions-dakı riskdir və CERT təsdiqi tələb edir.

## R2 — Skriptin yüklənmə üsulu

- **Qərar**: server komponentində **adi `<script src="/vendor/accw/acc-widget.min.js" defer nonce={nonce}>`** yazılır. Konfiqurasiya elə həmin teqin `data-accw-*` atributlarındadır: `lang`, `position="bottom-left"`, `offset="20,20"`, `size="md"`.
- **Səbəb**:
  - Widget yalnız `readystatechange` hadisəsində işə düşür. `defer` skript sənəd `interactive` olandan sonra, amma `complete`-dən **əvvəl** icra olunur, ona görə `complete` keçidini tutur və **bir dəfə** init olur.
  - `next/script` (`afterInteractive` və ya `lazyOnload`) hidratasiyadan sonra yükləyir. O vaxt `readyState` artıq `complete` ola bilər, hadisə bir daha gəlmir və widget **heç görünmür**.
  - `strict-dynamic` CSP-si `'self'`-i nəzərə almır, ona görə teq nonce daşımalıdır. Nonce `headers().get(NONCE_HEADER)` ilə oxunur. Bu dəyər proxy-də artıq qurulur, amma hələ heç kəs oxumur.
  - Atributları `<html>`-ə deyil, skript teqinə qoymaq root layout-a toxunmur. Widget atributu istənilən elementdən oxuyur.
  - Real atribut adı `data-accw-offset`-dir. Sənəddəki `offsett` yazı səhvidir.
- **Implementasiyada ölçüləcək risk**:
  - Brauzerlər `nonce` atributunun dəyərini DOM-dan gizlədir. Bu, React 19 hidratasiyasında xəbərdarlıq verə bilər.
  - Xəbərdarlıq çıxarsa, `suppressHydrationWarning` yalnız bu teqə qoyulur və D-2 qeydi ilə sənədləşdirilir (web-cbar-new Konstitusiya XI.5).
- **Ölçmə nəticəsi (2026-09-29, T035)**: risk yoxdur. React DOM hidratasiyada `nonce`-u atributdan yox, `node.nonce` xassəsindən oxuyur (`react-dom-client.development.js`: `"nonce" === name.toLowerCase() ? node.nonce : node.getAttribute(name)`). Brauzer yalnız atributu gizlədir, xassə qalır. `next start` + headless Chrome-da konsol təmiz idi. `suppressHydrationWarning` qoyulmadı, D-2 lazım olmadı.
- **Rədd edilənlər**:
  - `next/script` `beforeInteractive`. Yalnız root layout-da işləyir, root layout-u ayara bağlamaq lazım olardı və vaxtı sənəd hadisələrinə görə qeyri-müəyyəndir.
  - Skripti yamaqla `readyState` yoxlamasına salmaq (R1-də rədd edilib).

## R3 — Harada render olunur

- **Qərar**: `app/[locale]/layout.tsx` ayarı mövcud `Promise.all`-a əlavə edir. Nəticə `SiteShell`-ə `accessibilityWidget` prop kimi ötürülür. `SiteShell` `<main>`-dən sonra, `LiveStreamDialog` ilə yanaşı `widgets/accessibility-widget`-in **server** komponentini (`AccessibilityWidgetScript`) render edir. `'use client'` yoxdur.
- **Səbəb**: spec 006 ilə eyni nümunədir. Client bundle-ı dəyişmir. Deaktiv olanda teq HTML-də ümumiyyətlə olmur (FR-007, SC-003).
- **App Router naviqasiyası**: layout remount olmur, teq yenidən icra olunmur və widget bir dəfə qalır. Widget konteyneri `body`-dədir, React ağacından kənardır, ona görə naviqasiyada silinmir.

## R4 — Dil dəyişəndə

- **Qərar**: `shell/language-switcher.tsx` `next/link`-dən **adi `<a>`**-ya keçir. Dil dəyişikliyi tam sənəd yüklənməsi olur.
- **Səbəb**:
  - Widget dili yalnız init anında oxuyur. Client naviqasiyasında az → en keçidində menyu Azərbaycan dilində qalardı.
  - Root layout (`<html lang>`) `[locale]` seqmentindən yuxarıdadır və client naviqasiyasında yenidən render olunmur. Tam yüklənmə bunu da düzəldir. Bu, implementasiyada ölçülüb təsdiqlənir.
  - Faylın öz şərhində artıq "Adi keçiddir: JS-siz işləyir" yazılıb, `<a>` bu niyyətə uyğundur. Dil dəyişikliyi nadirdir, tam yüklənmənin qiyməti azdır.
- **Rədd edilən**: yalnız widget aktiv olanda `<a>` istifadə etmək. İki davranış olardı və test matrisi ikiqat artardı.

## R5 — Public saytda ayarın oxunması və keş

- **Qərar**:
  - `features/accessibility-widget/api/accessibility-widget.api.ts` (`server-only`) `cachedJson(..., { keyPrefix: 'accessibility-widget', tag: 'settings' })` çağırır. Revalidate `CONTENT_REVALIDATE_SECONDS` = 60 s-dir.
  - Zod sxemi `{ enabled: boolean }`-dur. Layout-da `.catch(() => ({ enabled: false }))` yazılır.
- **Səbəb**: `web-cbar-new`-in bütün məzmun sorğuları bu keşdən keçir. Admin dəyişikliyi ən gec 1 dəqiqəyə görünür, spec buna uyğun yeniləndi. Xəta və ya 404 gələndə menyu deaktiv sayılır (spec Edge Cases).
- **Rədd edilən**: keşsiz sorğu. Hər səhifə açılışına əlavə API çağırışı düşərdi (1000/dəq/IP limiti SSR fan-out ilə paylaşılır).

## R6 — Public API endpoint-i

- **Qərar**:
  - `api-cbar`-da yeni `SiteSettingsController` əlavə olunur: `GET api/v1/site-settings/accessibility-widget` → həmişə `200 { "enabled": bool }`.
  - Sətir yoxdursa və ya `value` gözlənilən obyekt deyilsə, cavab `false`-dur.
  - Yalnız bu açar oxunur, ümumi `settings/{key}` endpoint-i **yoxdur** (FR-005).
- **Səbəb**:
  - `Setting` entity-si və `DbSet` `api-cbar`-ın `Cbar.Domain` kopyasında artıq var (`CbarDbContext.cs:50`). `cbar_web_ro` bu cədvəli oxuyur.
  - Domain dəyişikliyi və migration lazım deyil.
  - 404 əvəzinə `false` qaytarmaq frontend-i sadələşdirir və "ayar yoxdur = deaktiv" qaydasını bir yerdə saxlayır.
- **Rədd edilən**: ümumi `GET settings/{key}`. Gələcəkdə daxili ayarlar ictimai tərəfə sızardı (Maddə III.3).
- **Verification**: lokalda .NET SDK yoxdur, build test mühitinin pipeline-ında yoxlanılır.

## R7 — Ayarın açarı və forması

- **Qərar**: açar `accessibility.widget`, dəyər `{"enabled": true|false}`.
- **Səbəb**:
  - Fixture-lərdəki `homepage.showBanner` kimi nöqtəli ad sxeminə uyğundur.
  - Dəyər obyekt saxlanılır ki, gələcəkdə parametr əlavə etmək (US3 ləğv olunub, amma mümkündür) formanı sındırmasın.
  - Public API yalnız `enabled === true`-nu aktiv sayır.

## R8 — Admin UI

- **Qərar**:
  - Kart mövcud `features/settings`-in **içində** yaradılır, çünki FSD-də feature-lər bir-birini import etmir. Tərkibi:
    - `components/accessibility-widget-card.tsx`: kit `Card` + `Switch` (`@cbar/lib-react-ui-kit/switch`), `aria-label`, son dəyişiklik vaxtı;
    - `model/accessibility-widget.ts`: açar sabiti və dəyər sxemi.
  - Kart `pages/settings`-in **yuxarısında** göstərilir.
  - Data mövcud `useSettingsList()`-dən götürülür. Açar yoxdursa, keçid "deaktiv" göstərilir və 404 emalı lazım olmur.
  - Yazma mövcud `useSettingSave()` ilə gedir: `PUT /settings/accessibility.widget {value:{enabled}}`. Uğurda `settingsKeys.all` invalidasiya olunur.
  - Keçid **optimistik deyil**: sorğu gedərkən `disabled`, xətada `toast.error` göstərilir və server vəziyyəti qalır (US2-4).
- **Səbəb**: spec 006 status toggle-u ilə eyni nümunədir (`live-status-toggle.tsx`). Yeni endpoint və ya yeni route lazım deyil. Kit `Switch` artıq `currency-master-grid.tsx`-də istifadə olunur.
- **Səlahiyyət (FR-004)**:
  - Kart `<Can permission="settings.manage">` ilə sarılır.
  - Hazırkı modeldə bu icazə bütün rollara verilir (`permissionsForRole`). Backend isə `[Authorize]`-dan başqa rol yoxlamır.
  - Nəticədə səlahiyyət mövcud "Ayarlar" ekranı ilə **eyni səviyyədədir**. Server tərəfdə rol məhdudiyyəti bu feature-in əhatəsindən kənardır və mövcud boşluqdur, yeni yaradılmır.
- **Ümumi cədvəl**: açar ümumi cədvəldə də görünür. JSON ilə yanlış forma yazılsa, public tərəf onu `false` sayır (R6).
- **Audit**: `SettingsController` artıq `settings.create`/`settings.update` yazır (FR-003). Audit jurnalının admin baxışı yoxdur. Bu, dashboard-da "sonrakı versiya" kimi qeyd olunub. Əhatədən kənardır. Vaxt kartda `updatedAt`-dan göstərilir.

## R9 — Cookie

- **Qərar**: `docs/cookies.md`-yə `accw` sətri əlavə olunur: funksional, widget yazır, sessiyalıq, `SameSite`/`Secure` yoxdur, məzmunu yalnız görünüş seçimləridir. Kod dəyişmir.
- **Səbəb**: web-cbar-new Konstitusiya VIII.6 hər cookie-nin qeydini tələb edir. Cookie izləmə və ya analitika deyil. Həssas data saxlamır (X.3 pozulmur).

## R10 — Konstitusiya X.4 (üçüncü tərəf runtime script qadağası)

- **Qərar**: spec-də **D-1** kimi sənədləşdirilir. Əsaslar:
  1. qanunvericilik konteksti (WCAG 2.1, Nazirlər Kabinetinin qərarı) və rəsmi dövlət widget-i;
  2. CDN yoxdur, fayl öz serverdən verilir və SHA-256 ilə qeyd olunub (R1);
  3. ölçülüb: `fetch`/XHR/`eval` yoxdur;
  4. admin keçidi ilə deploy etmədən söndürülür;
  5. CSP zəiflədilmir.
- X.1 (`innerHTML`) vendor kodunun daxilindədir və statik şablonlara aiddir. D-1-ə daxildir. Bizim kodumuzda `innerHTML` yoxdur.

## R11 — Statik fayl və gate uyğunluğu

- `/vendor/*` proxy matcher-dən keçmir, çünki fayl uzantısı var. Fallback CSP (`next.config.ts`) alır. JS və şrift faylları üçün bu yetərlidir.
- `npm run verify` addımları üçün `public/vendor/**` yoxlanılmalı və lazım olsa istisna edilməlidir:
  - `check:self-contained`: nisbi yol əvəzləmədən sonra qalmır, amma skan siyahısı yoxlanılır;
  - ESLint;
  - Prettier (`format:check`). Minify fayl formatlanmamalıdır.
- **Çap**: `globals.css`-ə `@media print { .accw-widget, .accw-menu { display: none } }` əlavə olunur (spec Edge Cases).
- **Mövqe**: bütün saytda fixed-position UI yoxdur, sol aşağı künc boşdur (FR-014). Skip link `top-2 left-2`-dədir və toqquşmur.

## R12 — Performans (SC-004)

- Skript 34 KB-dır, `defer` ilə yüklənir və render-i bloklamır.
- Şrift yalnız ziyarətçi disleksiya şriftini seçəndə yüklənir (`@font-face` tənbəldir). İkon yalnız menyu açılanda görünür.
- Ölçmə: ana səhifədə aktiv və deaktiv halda Lighthouse Performance və LCP müqayisə olunur (quickstart §5).
