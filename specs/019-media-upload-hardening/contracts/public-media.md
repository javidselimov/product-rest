# Contract: `GET /media/{id}` (api-cbar, public)

Route, status kodları, gövdə, `Cache-Control`, `ETag`, `Content-Disposition` **dəyişmir**. 200 cavabına
iki başlıq əlavə olunur (FR-009). Ayrı MR, `api-cbar-admin` MR-ından asılı deyil; deploy sırası sərbəstdir.

## 200 — yeni başlıqlar

| Başlıq | Dəyər | Hansı fayllar |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | hamısı |
| `Content-Security-Policy` | `default-src 'none'; style-src 'unsafe-inline'; sandbox` | hamısı |

Dəyər admin `GET /api/v1/media/{id}/preview` ilə **eynidir** (FR-009). Planlaşdırılan PDF istisnası
quickstart §1c-dən sonra (2026-10-07: PDF CSP ilə brauzerdə açılır) silinib — bax
[research.md R7](../research.md#r7--public-verilmədə-svgxml-skriptinin-qarşısı-fr-009).

304 və 404 cavablarına başlıq əlavə olunmur (gövdə yoxdur / ProblemDetails JSON).

## İstehlakçılara təsir

| İstehlakçı | Təsir |
|---|---|
| `web-cbar`, `web-cbar-next` `<img src="{API_URL}/media/{id}">`, CSS fonu | yoxdur — yerləşdirilmiş resursa cavabın CSP-si tətbiq olunmur |
| Birbaşa açılan SVG/XML | göstərilir, skript işləmir, xarici resurs yüklənmir |
| Birbaşa açılan PDF | dəyişmir — CSP ilə də açılır (§1c) |
| Office/ZIP/RAR linkləri | dəyişmir (yüklənir) |
| SSR-də server-side `fetch` | yoxdur |
| `openapi/scripts/contract-check.mjs` | `/media/{id}` 200 başlıqlarını yoxlamır — dəyişiklik tələb etmir |

## OpenAPI dəyişikliyi (`product-rest/api-cbar/openapi/`)

| Fayl | Dəyişiklik |
|---|---|
| `paths/misc.yaml` → `media.get.description` | "Every file is served with `nosniff` and a sandboxing CSP, so an SVG/XML opened directly cannot run script." |
| `paths/misc.yaml` → `media.get.responses.200.headers` | `X-Content-Type-Options` (`const: nosniff`), `Content-Security-Policy` (`const: …`) |
| `openapi.yaml` → `# Sync:` | yenilənir |
| `dist/` | lint + bundle |
