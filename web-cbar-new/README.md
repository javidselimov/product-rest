# web-cbar-next — cbar.az public saytı

`web-cbar`-in `nextjs-template` (CBAR Next Template) üzərində yenidən qurulmuş
versiyası: Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4,
`@cbar/lib-react-ui-kit`, react-i18next, Vitest + MSW. Eyni 18 route, eyni
`api-cbar` çağırışları; görünüş qatı yalnız CBAR UI kitidir.

Spec, plan və tasks: `../specs/002-public-site-template-migration/`.
Cutover-ə qədər köhnə `web-cbar` (port 3000) ilə **yanaşı** işləyir (port 3001).

## Tez başlanğıc

```bash
npm run install:public      # public paketlər
npm run install:offline     # UI kit — vendor/*.tgz arxivindən (VPN lazım deyil)
npm run dev                 # http://localhost:3001 → /az
```

Bütün stack üçün repo kökündən `.\dev.ps1` / `./dev.sh` (bax `../GUIDE.md`).
Sayt real `api-cbar` tələb edir (`API_URL`, defolt `http://localhost:5139`);
mock qatı yalnız testlərdədir.

## Skriptlər

| Əmr | Nə edir |
| --- | --- |
| `npm run dev` | `next dev -p 3001` |
| `npm run build` / `npm run start` | standalone build / server (port 3000 — Docker) |
| `npm run lint` · `typecheck` · `test:run` | ayrı-ayrı yoxlamalar |
| `npm run verify` | **merge gate**: setup:check → check:self-contained → lint → typecheck → test:run → build |
| `npm run audit` | `npm audit --audit-level=high` |
| `npm run install:offline` / `install:nexus` / `install:public` | kit quraşdırma yolları (offline — lokal; nexus — CI/Docker) |
| `npm run vendor:kit` | vendor arxivini Nexus-dan yeniləmək |

## Mühit dəyişənləri (yalnız server)

| Dəyişən | Defolt | Qeyd |
| --- | --- | --- |
| `API_URL` | `http://localhost:5139` | `api-cbar` kökü; brauzerə heç vaxt çıxmır |
| `TZ` | `Asia/Baku` | tarix formatlaması |
| `CSP_FRAME_SRC` | — | CMS məzmunundakı ümumi `<iframe>` mənbələri (boşluqla ayrılmış); YouTube həmişə icazəlidir |

Deploy dəyərləri `.ci-cd/{dev,test,prod}.yaml` `env` siyahısındadır; `NEXT_PUBLIC_*`
yoxdur. Mühit yanlışdırsa tətbiq boot-da Azərbaycan dilli mesajla dayanır.

## Memarlıq (qısa)

```text
src/app/[locale]/…      nazik route faylları: loader + view + generateMetadata
src/views/<route>/      loader.ts (server-only, API orkestrasiyası) + index.tsx (prop-lu view)
src/widgets/            cms-content (D2), chart-card (ECharts, D1), hero-slider, home-cards, list-pagination, attachments, section-sidebar, filter-form…
src/features/<x>/       api/ (server-only fetch) + model/ (Zod sxem, helper)
src/entities/           content (envelope, media-url, tarix), page-node (ağac)
src/shell/              site-header, mega-menu, mobile-nav, site-footer, language/theme
src/server/             env.ts, api-client.ts (yalnız route, loader və feature api görür)
src/locales/{az,en}/    10 namespace
```

Qaydalar `CLAUDE.md`-də; konstitusiya `.specify/memory/constitution.md`.

## Deploy

Template modeli: `Dockerfile` (standalone, `PORT=3000`, kit `install:nexus` ilə),
`.gitlab-ci.yml` (paylaşılan CBAR pipeline), `app.gitlab-ci.yml` (bu layihənin job
override-ləri — kökdədir, çünki `.ci-cd/` Helm chart-a köçürülür), `.ci-cd/*.yaml`
(Helm dəyərləri).
Hostname və `API_URL` dəyərləri DevOps təsdiqinə qədər `TODO(devops)` daşıyır.

## Sənədlər

- `docs/how-to-use.md` — yeni səhifə, data axını, gate
- `docs/cookies.md` — cookie registri (yalnız `ui-theme`)
- `../specs/002-public-site-template-migration/quickstart.md` — icra və verification ssenariləri
