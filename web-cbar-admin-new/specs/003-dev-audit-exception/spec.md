# Spec 003 — dev asılılıqlarında düzəlişi olmayan audit tapıntısı üçün müvəqqəti istisna

**Status:** qəbul edilib (müvəqqəti) · **Tarix:** 2026-11-18 · **Konstitusiya:** Maddə X.4

## Kontekst

2026-11-18-də CI-ın `app:check` job-u `npm audit --audit-level=high --omit=optional`
addımında dayandı: 13 high tapıntı. Tapıntıların hamısının mənbəyi eynidir:

- **GHSA-fc5q-39xc-vjpf** — `picomatch` ReDoS (bir budaqlı təkrarlanan extglob-lar),
  CVSS 7.5, zəif versiyalar `<=4.0.7`.
- `picomatch`-in son buraxılışı 4.0.7-dir. Düzəldilmiş versiya hələ yoxdur, ona görə
  `npm audit fix`, `overrides` və versiya yeniləməsi problemi həll etmir. npm-in təklif
  etdiyi `npm audit fix --force` vitest-i 3.1.4-ə endirir, amma vite 8 eyni `picomatch`-i
  saxladığından tapıntı qalır.
- `picomatch` layihəyə yalnız dev asılılıqları ilə gəlir: `vite`, `vitest`,
  `typescript-eslint` (`tinyglobby`, `fdir` vasitəsilə). Brauzerə gedən bundle-da yoxdur.
  `npm audit --omit=dev --omit=optional` 0 tapıntı verir.
- Bu alətlər yalnız repo-dakı etibarlı glob nümunələrini işləyir. Kənar istifadəçi
  onlara nümunə ötürə bilmir, ona görə ReDoS vektoru build/test mühitində praktiki
  olaraq əlçatmazdır.

## Qərar

- `app:check` job-unda bloklayan audit yalnız runtime asılılıqlarını yoxlayır:
  `npm audit --audit-level=high --omit=dev --omit=optional`.
- Yeni `app:audit-dev` job-u tam auditi (`--omit=optional`) hər pipeline-da işlədir.
  `allow_failure: true` olduğundan pipeline dayanmır, tapıntı xəbərdarlıq kimi görünür.
  `npm audit` yalnız `package-lock.json`-u oxuyur, ona görə job quraşdırma etmir.
- Lokal `npm run audit` (tam audit) dəyişmir. İstisna müddətində orada bu tapıntının
  görünməsi gözləniləndir.

## Kənarlaşma

**D1** — Maddə X.4-ün müvəqqəti istisnası: dev asılılıqlarındakı high tapıntı merge-i
bloklamır, yalnız düzəldilmiş versiyası olmayan və bundle-a düşməyən tapıntılar üçün.
Runtime asılılıqlarında critical/high tapıntı əvvəlki kimi merge-i bloklayır.

## Bitmə şərti

`picomatch`-in düzəldilmiş versiyası (>4.0.7) çıxanda:

1. `npm update picomatch` (lazım olsa `overrides`) ilə lockfile yenilənir və
   `npm audit --audit-level=high` sıfır tapıntı verir.
2. `app.gitlab-ci.yml`-də `app:audit-dev` job-u silinir, `app:check`-dəki auditdən
   `--omit=dev` götürülür.
3. Bu spec-in statusu "bağlanıb" olaraq dəyişdirilir.

Əgər istisna müddətində dev asılılıqlarında **düzəlişi olan** yeni high/critical
tapıntı çıxarsa, o, `app:audit-dev` xəbərdarlığına baxmayaraq dərhal düzəldilir.

## Yoxlama

- `npm audit --audit-level=high --omit=dev --omit=optional`: 0 tapıntı.
- `npm audit --audit-level=high --omit=optional`: yalnız GHSA-fc5q-39xc-vjpf zənciri
  (13 qeyd, hamısı `picomatch`-dən).
