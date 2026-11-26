# How to use — template-i yeni layihəyə çəkmək

Bu repo **starter template**-dir. Onu çəkən komanda ayrı bir repo inkişaf etdirir,
ona görə burada iki cür məzmun var:

- **Skeleton** — arxitektura, alətlər, qaydalar. Yeni layihə bunları olduğu kimi alır.
- **Template-in öz tarixçəsi** — necə qurulduğunu sənədləşdirən spec-lər, hesabatlar,
  demo domain. Bunlar yeni layihəyə lazım deyil, amma "sadəcə sil" işləmir: bir neçə
  alət onlara bağlıdır. Aşağıdakı cədvəl nəyi niyə saxlayıb-silməyi göstərir.

Ardıcıllıq: **çək → uyğunlaşdır → təmizlə → sənədləri yenilə → ilk feature → yoxla**.

---

## 1. Template-i çəkmək

**Tövsiyə** — GitLab-da yeni layihəni bu repodan "template" kimi yaratmaq
(tarixçəsiz kopya). Əl ilə eyni nəticə:

```bash
git clone <template-repo-url> my-app
cd my-app
rm -rf .git          # tarixçə template-in tarixçəsidir — yeni repo-ya keçməməlidir
git init
git checkout -b feat/init
npm run install:public
npm run install:nexus   # VPN + .env.nexus — bax README §"Quraşdırma"
```

Branch adı git hook gate-inə uyğun olmalıdır: `feat`, `feature`, `docs`, `hotfix`,
`bugfix`, `reconcile`, `test`, `develop`, `development`, `main`, `master` — dəqiq ad
və ya `ad/təsvir` forması (tam siyahı `scripts/git-hooks/lib.mjs`-dədir). Commit
başlığı `<prefiks>[(scope)][!]: təsvir` — məsələn `chore: template-dən başlanğıc`.

## 2. Uyğunlaşdırma

Claude Code-da `/template-setup` skill-ini çağır — və ya README
§"Yeni layihəyə uyğunlaşdırma" cədvəli ilə əl ilə. Üç şey dəyişir:

| Nə | Harada |
| --- | --- |
| `<<DEYISDIRIN:…>>` placeholder-ləri (ingress hostname, API URL, proxy target) | `.ci-cd/*.yaml`, `.env.*` |
| Brend: `brand.shortName` / `appName`, `templateInfo.enabled: false`, `repoUrl`; `tagline`, `orgName`; favicon; `<title>` | `src/shared/config/brand.ts`, `src/locales/{az,en}/common.json`, `public/favicon.svg`, `index.html` |
| GitLab CI variable-ları `NEXUS_USERNAME` / `NEXUS_PASSWORD` (masked) | GitLab → Settings → CI/CD → Variables — fayla yazılmır |

`.env.nexus` gitignore-dadır — hər developer `.env.nexus.example`-dan özü yaradır.

## 3. Təmizləmə

Heç nə avtomatik silinmir — bu cədvəl üzrə özün qərar ver. Hər sətirdə səbəb var ki,
yanlış şeyi silməyəsən.

### Sil — template-in tarixçəsi, yeni layihəyə lazım deyil

| Yol | Nədir | Niyə / necə |
| --- | --- | --- |
| `artifacts/` | guard hook-un yoxlama hesabatı (`hook-guard-report.html`) | Template-in iş masasının çıxışıdır. Sil və `.gitignore`-a `artifacts/` əlavə et. |
| `coverage/`, `lighthouse-report.json` | test coverage və Lighthouse hesabatı | `.gitignore`-da `coverage` olsa da bu fayllar **tracked**-dır (ignore-dan əvvəl commit olunub). `git rm -r --cached coverage lighthouse-report.json` ilə çıxar; CI hər dəfə yenidən yaradır. |
| `specs/002-cicd-template-config/` … `specs/006-husky-git-hooks/` | CI/CD, install, branding, git hook işlərinin spec/plan/tasks-ı | Template-in necə qurulduğunun tarixçəsidir. Yalnız `template-setup` skill-i və README §"Yeni layihəyə uyğunlaşdırma" 002 və 005-in `contracts/`-ına istinad edir — ona görə **uyğunlaşdırma bitəndən sonra**, skill ilə birlikdə sil. |
| `.claude/skills/template-setup/` | uyğunlaşdırma skill-i | Bir dəfə işlədilir. Yuxarıdakı spec-lərlə birlikdə sil; `CLAUDE.md` skills cədvəlindəki sətrini də çıxar. |
| `.specify/feature.json` | Spec Kit-in "cari feature" göstəricisi (`specs/006-…`) | Per-checkout state, `.specify/.gitignore`-da ignore-dadır. Silə bilərsən; ilk `/speckit-specify` yenidən yazır. |

### Saxla — skeleton və alətlər

| Yol | Niyə |
| --- | --- |
| `.specify/` (`memory/constitution.md`, `templates/`, `scripts/`, `workflows/`) | Spec-driven prosesin özü. Konstitusiya korporativ standartı kilidləyir (stack, FSD, dil, təhlükəsizlik) — yeni layihə də ona tabedir. |
| `.claude/hooks/`, `.claude/settings.json` | Guard hook konstitusiyanı icra edir: konstitusiya və `src/index.css` dəyişikliyi təsdiq istəyir, `specs/` boşdursa `src/`-ə yazını **bloklayır** (bax §5), token-storage və rol-müqayisəsi qadağalarını tutur. |
| `.claude/skills/speckit-*`, `frontend-standards`, `ui-kit-usage` / `ui-kit-setup` / `ui-kit-review` | Gündəlik iş axını. `ui-kit-*` üçlüyü kit-dən kopyalanıb — burada redaktə olunmur. |
| `specs/001-template-reconstruction/` | Template-in memarlıq qərarları. **Konstitusiya** guideline-dan kənarlaşmalar registrini (D1–D6) bu qovluğun `spec.md`-sinə istinad edir, `src/`-də dörd fayl şərhi (`app/providers/app-providers.tsx`, `app/routes/index.ts`, `shared/config/runtime-config.ts`, `shared/testing/browser.ts`) `plan.md §N`-ə. Silinsə registr itir və istinadlar ölü olur. Köçürmək istəsən (məsələn `docs/decisions/`), konstitusiyadakı yolu `/speckit-constitution` ilə yenilə. |
| `scripts/git-hooks/`, `.husky/` | Git hook-ları: `prepare` addımı `scripts/git-hooks/install.mjs` ilə qurur; qaydalar `lib.mjs`-dədir, `.husky/*` faylları bir sətirdir. Branch/commit gate-i və push-da lint + typecheck + test — CI eyni gate-i işlədir. |
| `.gitlab-ci.yml`, `.ci-cd/`, `Dockerfile`, `default.conf`, `.npmrc` | Pipeline, image, nginx başlıqları (Maddə X.6), `@cbar:registry`. Təşkilat sabitləri — dəyişilmir. |

### Layihəyə görə

| Yol | Qərar |
| --- | --- |
| `.mcp.json` + `.claude/skills/figma-page/` | `figma-bridge` serveri **repodan kənar yola** (`../showcase-ui/tools/figma-bridge/mcp.mjs`) baxır — template-in iş masasına bağlıdır, sənin mühitində işləməyəcək. Figma istifadə etmirsənsə ikisini də sil; edirsənsə yolu öz mühitinə düzəlt. |
| Demo domain: `src/pages/{projects,team,reports,components}`, `src/features/{projects,team}`, `src/widgets/*`, `src/entities/{project,member}`, `src/shared/testing/handlers/{projects,team}.ts` | Kit-in necə istifadə olunduğunu göstərən nümunə. Real domain gələndə sil. **Skeleton kimi qalan:** `features/auth`, `features/settings`, `entities/user`, `pages/{overview,settings,not-found}`, `handlers/{auth,settings}.ts`. |
| `src/pages/components` | Kit qalereyası — komponent seçəndə faydalıdır, prod-a lazım deyil. |

Səhifə silmək = CLAUDE.md-dəki "yeni səhifə dörd addım"-ın tərsi: `pages/<x>/` →
`app/routes/index.ts`-də route → `app/routes/nav.ts`-də nav bəndi →
`locales/{az,en}/nav.json`-da açarlar. Feature silərkən onun MSW handler-ini
`shared/testing/handlers/index.ts`-dən və `factories.ts`-dəki fixture-ları da çıxar.
Hər addımdan sonra `npm run verify`.

Yeni bölmə əlavə edəndə nav bəndinin `group`-u saytın hansı bölməsini doldurduğuna görə seçilir
(spec 046): `about`, `marketParticipants`, `legalActs`, `nationalCurrency`, `statistics`, `media`,
`cooperation` — saytın üst menyusunun sırası ilə — və panelin öz qrupları `homepage`, `admin`.
Bütün bölmələrə aid alət (Səhifələr, Media kitabxanası) qrupsuzdur. Tək bəndlik qrup başlıqsız bənd
kimi görünür. Yeni saytın bölməsi üçün `NAV_GROUPS`-a açar və `nav.json`-a `groups.<açar>` (az/en)
əlavə et. Bölmə bir CMS səhifəsinin cədvəlini və ya kartlarını verirsə, həmin səhifənin az slug-ını
`features/pages/model/managed-sections.ts`-ə yaz ki, səhifə formunda bölməyə keçid görünsün. Menyu
dəyişəndə redaktor təlimatlarındakı yolları da yenilə (`web-cbar-new/docs/*-cms-guide.md`).

## 4. Sənədləri yenilə

| Fayl | Nə |
| --- | --- |
| `README.md` | Başlıq və giriş abzası öz layihən üçün; "aktiv iş `specs/001…`" sətri; §"Yeni layihəyə uyğunlaşdırma" və bu sənədə keçid — uyğunlaşdırma bitibsə silinə bilər. |
| `CLAUDE.md` | "Aktiv iş" sətri (öz spec-inə), skills cədvəlindən silinmiş skill-lər, "Açıq report" bəndi (kit bug-ı — aktual olub-olmadığını yoxla). |
| `package.json#name` | `nexus` → öz layihə adın (deploy-a təsir etmir). |
| `docs/how-to-use.md` | Bu fayl — işin bitəndə sil. |

## 5. İlk feature — spec-driven axın

Konstitusiya (Maddə IX): kod dəyişikliyi spec-siz başlanmır. Guard hook bunu icra edir:
`specs/` altında heç bir `spec.md` yoxdursa `src/`-ə **hər yazı bloklanır**
(`.claude/hooks/guard.mjs`, "Spec gate"). Yəni `specs/`-i tam boşaltmısansa, ilk kod
sətrindən əvvəl:

```text
/speckit-specify   → specs/NNN-<slug>/spec.md   (NƏ / NİYƏ)
/speckit-plan      → plan.md                    (NECƏ)
/speckit-tasks     → tasks.md                   (fazalı icra siyahısı)
/speckit-implement
```

Nömrələmə ardıcıldır: `001` saxlanılıbsa `002`-dən, silinibsə `001`-dən.

## 6. Yoxlama

```bash
npm run verify                     # lint + typecheck + test + build — merge şərti
grep -rn "DEYISDIRIN" --exclude-dir=node_modules --exclude-dir=coverage --exclude-dir=dist --exclude-dir=specs --exclude-dir=.claude --exclude=README.md .
git status --short                 # coverage/, artifacts/, lighthouse-report.json görünməməlidir
npm run dev                        # template göstəricisi (footer, giriş, sidebar) yoxdur
```

`grep` boş qayıtmalıdır (DevOps-un verəcəyi açıq bəndlər istisna).
