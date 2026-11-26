# Contract: Runtime konfiqurasiya, portlar, CSP, deploy və dev skriptləri

**Faza 1** | Tarix: 2026-09-14 | Mənbə: `nextjs-template/src/server/env.ts`, `next.config.ts`, `.ci-cd/*`, `Dockerfile`, `web-cbar/.ci-cd/*`, `dev.ps1`, `dev.sh`

## 1. Mühit dəyişənləri (`src/server/env.ts`, Zod, server-only)

| Dəyişən | Tip / default | Qeyd |
| --- | --- | --- |
| `API_URL` | url, default `http://localhost:5139` | `api-cbar` bazası; yalnız serverdə; media və XML keçidlərinin əsası |
| `NODE_ENV` | `development \| test \| production`, default `development` | |
| `TZ` | string, default `Asia/Baku` | tarix formatlaması |
| `CSP_FRAME_SRC` | string, optional | `frame-src`-ə əlavə mənbələr (boşluqla ayrılmış), ümumi `<iframe>` məzmunu üçün |

Silinən template dəyişənləri: `SESSION_COOKIE_NAME`, `ENABLE_MOCK_API`. `NEXT_PUBLIC_*` yoxdur
(ESLint qadağası qalır). Yanlış env → başlanğıcda AZ dilli xəta ilə dayanır (template davranışı).

## 2. Portlar və start sırası

| Servis | Port | Qeyd |
| --- | --- | --- |
| `api-cbar-admin` | 5253 | əvvəl |
| `api-cbar` | 5139 | |
| `web-cbar-admin` / `web-cbar-admin-next` | 5173 / 5174 | |
| `web-cbar` (köhnə) | 3000 | cutover-ə qədər |
| **`web-cbar-next`** | **3001** (lokal `next dev -p 3001`) | Docker/Helm `3000` (D5) |

Start sırası: Docker infra → `api-cbar-admin` → `api-cbar` → admin panellər → `web-cbar` →
`web-cbar-next` (sonuncu). `dev.ps1`/`dev.sh` kill siyahısına `3001` əlavə olunur; log
`logs/web-public-next.log`; install `npm run install:offline` (vendor kit, VPN-siz).

## 3. Təhlükəsizlik başlıqları (`next.config.ts#headers()` + proxy nonce)

| Direktiv | Dəyər |
| --- | --- |
| `default-src` | `'self'` |
| `script-src` | `'self' 'nonce-{nonce}' 'strict-dynamic'` (fallback: `'self'`) |
| `style-src` | `'self' 'unsafe-inline'` (CMS inline stil, kit) |
| `img-src` | `'self' data: https: {API_URL origin}` (`https:` — CMS məzmunundakı xarici şəkillər və YouTube önizləmələri; lokal `http` API origin ayrıca) |
| `media-src` | `'self' {API_URL origin}` |
| `font-src` | `'self'` |
| `connect-src` | `'self'` (brauzer API-yə müraciət etmir) |
| `frame-src` | `https://www.youtube.com https://www.youtube-nocookie.com {CSP_FRAME_SRC}` |
| `frame-ancestors` | `'none'` |
| `base-uri`, `form-action` | `'self'` |

Digər: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`,
`Permissions-Policy` (template). Genişlənmə əsaslandırması plan.md Complexity Tracking.

## 4. Deploy faylları

- `Dockerfile`: template (3 mərhələ, `node:22-alpine`, `install:nexus --context=docker` kit üçün
  `--secret id=nexus_env`, standalone, `USER node`, `PORT=3000`, `TZ=Asia/Baku`).
- `.gitlab-ci.yml`: template (`devops-linux-team/ci-cd` `ref: 1.0.0`, `pipelines/npm.gitlab-ci.yml`
  + `.ci-cd/app.gitlab-ci.yml`); branch xəritəsi dəyişmir.
- `.ci-cd/base.yaml`: `listenPort: 3000`, resurslar template/köhnə ilə eyni (1 CPU / 1Gi).
- `.ci-cd/dev.yaml`: `env`: `API_URL=https://api-cbar-test.e-cbar.az` (köhnə `web-cbar` dəyəri,
  `TODO(devops)`), `NODE_ENV=production`, `TZ=Asia/Baku`; hostname yoxdur (paylaşılan dev ingress).
- `.ci-cd/test.yaml`, `prod.yaml`: hostname `web-cbar-next-test.<INGRESS_DOMAIN>` /
  `web-cbar-next.<INGRESS_DOMAIN>` — `TODO(devops)`; `API_URL` `TODO(devops)`.
- `SESSION_COOKIE_NAME`, `ENABLE_MOCK_API` sətirləri bütün yaml-lardan silinir.
- `npm run setup` placeholder dəyərləri (research R1); `setup:check --strict` verify-də.

## 5. Cookie inventarı

Yalnız `ui-theme` (contracts/routes.md §7). Analitik/izləmə cookie-si yoxdur.

## 6. Root sənəd sinxronizasiyası (eyni dəyişiklikdə)

| Fayl | Dəyişiklik |
| --- | --- |
| `dev.ps1` | `$Services` yeni sətir, kill portları, `install:offline` budağı, çıxış siyahısında `Public (new) http://localhost:3001/az` |
| `dev.sh` | eyni |
| `GUIDE.md` | "Yeni public sayt (`web-cbar-next`)" bölməsi: port, install, kit |
| `CLAUDE.md` (root) | arxitektura diaqramı (`web-cbar-next` sətri), komanda cədvəli, "web-cbar" bölməsində "Being replaced" qeydi |
| `api-cbar-admin/CREDENTIALS.md` | ünvan siyahısına `3001` |
