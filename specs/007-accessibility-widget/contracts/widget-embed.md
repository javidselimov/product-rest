# Contract: widget-in səhifəyə qoşulması (`web-cbar-new`)

## HTML (yalnız `enabled === true` olanda, SSR)

```html
<script
  src="/vendor/accw/acc-widget.min.js"
  defer
  nonce="{sorğunun CSP nonce-u}"
  data-accw-lang="{az|en}"
  data-accw-position="bottom-left"
  data-accw-offset="20,20"
  data-accw-size="md"
></script>
```

| Atribut | Mənbə | Qayda |
| --- | --- | --- |
| `defer` | sabit | Məcburidir. Widget yalnız `readystatechange`-də init olur (research R2). `async`, `next/script` və dinamik əlavə **qadağandır**. |
| `nonce` | `headers().get('x-nonce')` | `strict-dynamic` CSP-də olmasa, skript bloklanır |
| `data-accw-lang` | `[locale]` route seqmenti | `az` və ya `en` |
| `data-accw-position` / `-offset` / `-size` | sabit (spec FR-009) | Atribut adı `offset`-dir, `offsett` yox |

`enabled === false` olanda teq **HTML-də yoxdur**: `/vendor/accw/*`-a sorğu getmir (SC-003).

## Statik fayllar (`public/vendor/accw/`)

| Fayl | Mənbə | Dəyişiklik |
| --- | --- | --- |
| `acc-widget.min.js` | `https://accessibility.cert.gov.az/acc-widget.min.js` (SHA-256 `6eba54dd…c0e59d`) | 3 URL əvəzləməsi (research R1) |
| `accw-icon.png` | `…/assets/img/accw-icon.png` | yoxdur |
| `fonts/OpenDyslexic3-Regular.woff`, `.ttf` | `…/fonts/` | yoxdur |
| `fonts/OFL.txt` | OpenDyslexic lisenziyası | — |
| `VENDOR.md` | — | mənbə, tarix, orijinal və yamaqlı SHA-256, əvəzləmələr, yeniləmə addımları |

**İnvariant**: yamaqlı `acc-widget.min.js` faylında `accessibility.cert.gov.az` yalnız `<a href>` daxilində qalır. `src=` və `url(` daxilində qalmır. Bunu test yoxlayır.

## CSP

Dəyişmir. `script-src 'self' 'nonce-…' 'strict-dynamic'`, `font-src 'self'`, `img-src 'self' …` və `style-src 'self' 'unsafe-inline'` (widget-in inline `<style>`-u) yetərlidir. Mövcud CSP testləri dəyişmədən keçməlidir.
