# Contract: Runtime konfiqurasiya, mühit faylları və rejimlər

Proyekt: `web-cbar-admin-next` | Spec: [../spec.md](../spec.md) | Research: R2, R14

## 1. API ünvanı — iki qat

| Qat | Mənbə | Dəyər forması | Kim oxuyur |
| --- | --- | --- | --- |
| Runtime (üstün) | `/config.json` → `{ "urls": { "apiUrl": string } }` | `https://<api-host>/api/v1` (sonda `/`-sız) və ya `/api/v1` | `shared/config/runtime-config.ts#loadRuntimeConfig` (bootstrap, `cache: 'no-store'`) |
| Build-time (fallback) | `VITE_API_URL` | eyni forma | `runtime-config.ts` fallback |

Servis yolları **həmişə** API kökünə nisbidir: `/auth/login`, `/laws`, `/pages/tree`. `/api/v1`
prefiksi yalnız `apiUrl`-dədir. Axios `baseURL` hər sorğuda `getRuntimeConfig().urls.apiUrl`-dan
oxunur (template interceptor-u).

`config.json` Zod ilə yoxlanılır (`urls.apiUrl: z.string().min(1)`); yanlış forma → fallback.

## 2. Fayllar

```text
public/config.json            {"urls":{"apiUrl":"/api/v1"}}            # dev/preview default
.env.development              VITE_API_URL=/api/v1
                              VITE_API_PROXY_TARGET=http://localhost:5253
.env.production               VITE_API_URL=<<DEYISDIRIN:API-URL-PROD>>   # fallback; /config.json üstündür
.env.example                  eyni açarlar, izahla
.env.nexus(.example)          NEXUS_USERNAME / NEXUS_PASSWORD (gitignored) — kit quraşdırması
```

Dəyişənlər:

| Açar | Məna | Default |
| --- | --- | --- |
| `VITE_API_URL` | build-time apiUrl fallback | `/api` (template) → burada `/api/v1` |
| `VITE_API_PROXY_TARGET` | Vite dev proxy hədəfi; `/api/*` bura yönlənir (`changeOrigin`) | boş → proxy yoxdur |
| `VITE_ENABLE_MSW` | `'true'` → brauzerdə MSW worker `/api/v1/*`-ni cavablandırır | söndürülü (**template-dən fərq**: dev default real API) |

`main.tsx`: `shouldUseMockApi = import.meta.env.VITE_ENABLE_MSW === 'true'` — hostname/DEV şərtləri
silinir.

## 3. Deploy (`.ci-cd/*.yaml`, Helm)

```yaml
# dev.yaml (test.yaml, prod.yaml eyni struktur)
ingress:
  hostname: 'cbaradmin-temp.e-cbar.az'          # TODO(devops): köhnə paneldən; test ilə eyni host — təsdiq
configMap:
  environment.ts:
    mountPath: /usr/share/nginx/html/config.json
    data: |-
      {
        "urls": {
          "apiUrl": "https://api-cbar-test.e-cbar.az/api/v1"   # TODO(devops): host təsdiqi; sonda / yoxdur
        }
      }
```

| Mühit | Branch | Hostname (TODO(devops)) | apiUrl (TODO(devops)) |
| --- | --- | --- | --- |
| dev | MR `feature/*`, `bugfix/*` | `cbaradmin-temp.e-cbar.az` | `https://api-cbar-test.e-cbar.az/api/v1` |
| test | `test` | `cbaradmin-temp.e-cbar.az` (dev ilə toqquşur — DevOps) | `https://api-expertise-test.e-cbar.az/api/v1` |
| prod | `master` | `cbaradmin-prod.e-cbar.az` | köhnə chart TEST-ə baxırdı — **prod ünvanı DevOps-dan** |

`Dockerfile`, `default.conf` (`/config.json` no-store, SPA fallback, təhlükəsizlik başlıqları),
`.gitlab-ci.yml` (`devops-linux-team/ci-cd` include + `.ci-cd/app.gitlab-ci.yml`) template-dən
dəyişmədən gəlir. Nexus credential yalnız BuildKit secret / masked CI variable.

API tərəfi: deploy mühitində `Cors__Origins__0` = panel origin-i (proxy yalnız dev-dədir) —
`api-cbar-admin/.ci-cd` `TODO(devops)` marker-ı var, bu spec toxunmur.

## 4. Lokal orkestrasiya

`dev.ps1` / `dev.sh` (root): beş server — köhnə `web-cbar-admin` 5173-də, yeni
`web-cbar-admin-next` **5174**-də (`vite.config.ts` `server.port`, `strictPort`), log
`web-admin-next.log`. API CORS siyasəti yalnız 5173-ə icazə verir; yeni panel proxy ilə eyni
mənbədən sorğu göndərdiyi üçün portu sərbəstdir. Start sırası: Docker → api-admin → api-web →
web-admin → web-admin-next → web-public.
`npm install` addımı `web-cbar-admin-next` üçün `npm run install:public` + (kit üçün)
`npm run install:nexus` — ikincisi VPN/`.env.nexus` tələb edir; skript yoxdursa xəbərdarlıq verib
davam edir (kit `node_modules`-da yoxdursa `npm run dev` stilsiz açılır — quickstart §Problemlər).

## 5. Test rejimi

`vitest` → `shared/testing/setup.ts` MSW node server, `onUnhandledRequest: 'error'`; `runtime-config`
testdə `/config.json` tapmır → `VITE_API_URL` fallback (`vitest.config.ts` `define`/env ilə `/api/v1`).
Handler-lər `http.get('/api/v1/laws', …)` formasında — apiUrl `/api/v1` olduğundan tam yol budur.
