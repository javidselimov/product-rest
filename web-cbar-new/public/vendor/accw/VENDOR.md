# Vendor: Müyəssərlik menyusu (accessibility.cert.gov.az)

Bu qovluq CERT.az-ın "Müyəssərlik menyusu" widget-inin **yoxlanmış surətidir**. Sayt skripti rəsmi hostdan yükləmir. Səbəbi spec 007-dədir (Q2-B): `specs/007-accessibility-widget/`.

**Faylları əl ilə redaktə etmə.** Dəyişiklik yalnız aşağıdakı yeniləmə addımları ilə edilir.

## Mənbə

| Fayl | Mənbə URL | Ölçü (B) | SHA-256 |
| --- | --- | --- | --- |
| `acc-widget.min.js` (orijinal) | `https://accessibility.cert.gov.az/acc-widget.min.js` | 33,904 | `6eba54dd23e8e805d53353894581e4ed8f3ead662c8cfcb102e4579535c0e59d` |
| `acc-widget.min.js` (yamaqlı, bu qovluqda) | — | 33,894 | `e33778f23c31b5686366522f9142b37904ffb1c77b61cc95865ea3b5f0abf0eb` |
| `accw-icon.png` | `https://accessibility.cert.gov.az/assets/img/accw-icon.png` | 15,406 | dəyişməyib |
| `fonts/OpenDyslexic3-Regular.woff` | `https://accessibility.cert.gov.az/fonts/OpenDyslexic3-Regular.woff` | 86,256 | dəyişməyib |
| `fonts/OpenDyslexic3-Regular.ttf` | `https://accessibility.cert.gov.az/fonts/OpenDyslexic3-Regular.ttf` | 237,868 | dəyişməyib |
| `fonts/OFL.txt` | `https://github.com/antijingoist/opendyslexic` (`OFL.txt`) | — | — |

- Endirilmə tarixi: 2026-09-29.
- Orijinal skriptin `Last-Modified` dəyəri: `Wed, 25 Feb 2026 10:40:38 GMT`.
- `accw-icon.png` adına baxmayaraq, əslində ICO formatındadır (16×16 və 32×32). Brauzerlər faylı məzmununa görə tanıyır. Rəsmi saytda da belədir, dəyişdirilməyib.

## Yamaqlar

Orijinal skriptə **yalnız** üç mətn əvəzləməsi tətbiq olunub. Hər biri faylda bir dəfə rast gəlir:

| Orijinal | Əvəzi | Səbəb |
| --- | --- | --- |
| `https://accessibility.cert.gov.az/assets/img/accw-icon.png` | `/vendor/accw/accw-icon.png` | xarici hosta sorğu getməsin (SC-003) |
| `./fonts/OpenDyslexic3-Regular.woff` | `/vendor/accw/fonts/OpenDyslexic3-Regular.woff` | nisbi URL sənədə görə həll olunur və alt səhifələrdə 404 verirdi |
| `./fonts/OpenDyslexic3-Regular.ttf` | `/vendor/accw/fonts/OpenDyslexic3-Regular.ttf` | eyni səbəb |

İki `<a href="https://accessibility.cert.gov.az/">` linki saxlanılıb. Bunlar müəllif linkləridir və yalnız kliklə açılır. Menyu düyməsindəki link klikdə `preventDefault` edilir. `src/features/accessibility-widget/vendor-invariant.test.ts` bu vəziyyəti yoxlayır.

## Məlum xüsusiyyətlər

- **İnit.** Widget yalnız `document.readystatechange` hadisəsində (`interactive`/`complete`) işə düşür. Skript SSR `<script defer>` kimi qoşulmalıdır. `next/script`, `async` və dinamik əlavə init-i qaçırır.
- **Konfiqurasiya.** Konfiqurasiya `data-accw-*` atributlarından oxunur: `lang`, `position`, `offset`, `langstatus`, `size`. Rəsmi sənəddəki `offsett` yazı səhvidir.
- **Kuki.** `accw` kukisi JSON saxlayır, `path=/`. Müddət hesablaması `NaN` verir, ona görə kuki **sessiya kukisidir**: brauzer bağlananda seçimlər sıfırlanır. SameSite/Secure yoxdur. Reyestr: `docs/cookies.md`.
- **DOM.** Skript `innerHTML`-i yalnız statik şablonlarla istifadə edir. `fetch`/XHR/`eval` yoxdur.

## Lisenziya

- OpenDyslexic şrifti SIL Open Font License 1.1 ilə yayılır (`fonts/OFL.txt`). Fayllar dəyişdirilməyib.
- Widget skriptinin lisenziyası açıq elan olunmayıb. CERT.az-dan yenidən paylama üçün təsdiq hələ alınmayıb (spec Assumptions). Bu açıq riskdir.

## Yeniləmə addımları

1. Rəsmi hostdan dörd faylı yenidən endir (`curl -o`, shell yönləndirməsi yox).
2. Yeni orijinal skriptin SHA-256-sını hesabla. Yuxarıdakı dəyərlə eynidirsə, yeniləməyə ehtiyac yoxdur.
3. Fərqlidirsə, köhnə orijinalla fərqi nəzərdən keçir. Yeni xarici sorğular (`fetch`, yeni `src=`/`url(`), `eval` və kuki dəyişiklikləri axtar.
4. Üç əvəzləməni təkrarla. Hər birinin tam bir dəfə tətbiq olunduğunu yoxla.
5. `npm run verify` icra et: invariant testi keçməlidir.
6. Bu faylda ölçüləri, SHA-256 dəyərlərini, `Last-Modified` dəyərini və tarixi yenilə.
