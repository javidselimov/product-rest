# npm audit istisnaları (D-qeyd, konstitusiya X.4)

`npm run audit` (CI-da `app:check`) `scripts/audit/audit-check.mjs`-i işlədir: `npm audit`-in
hər **high/critical** tapıntısı gate-i qırır, `scripts/audit/exceptions.json`-dakı qeydlər istisnadır.
Skript istisnanı yalnız bu şərtlərlə buraxır:

- paketin lockfile-dakı bütün surətləri `dev: true`-dur, yəni image-ə və runtime-a düşmür;
- `reviewBy` tarixi keçməyib. Tarix keçəndə CI qırılır, qeyd yenidən nəzərdən keçirilməlidir.

Tapıntı aradan qalxanda skript `ℹ … exceptions.json-dan silin` yazır; qeyd həmin dəyişikliklə silinir.

## Qeydlər

### D-AUDIT-2 — `picomatch` GHSA-fc5q-39xc-vjpf (2026-11-18)

- **Problem:** tək budaqlı təkrarlanan extglob pattern-lərində ReDoS. Advisory `<=4.0.7`-ni əhatə edir,
  son buraxılış isə 4.0.7-dir, yəni yamaq hələ yoxdur.
- **Zəncirlər** (hamısı devDependency, lockfile-da dörd surətin hamısı `dev: true`):
  - `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → picomatch@2.3.2`;
  - `vitest`, `vite`, `tinyglobby`, `fdir → picomatch@4.0.7`.
- **Niyə `npm audit fix --force` olmaz:** `eslint-config-next`-i 14.2.35-ə endirir, o isə Next 16 və
  flat config ilə uyğun deyil; picomatch-ın özündə isə düzəlişli versiya yoxdur.
- **Risk:** picomatch yalnız lint və test zamanı repo-dakı qlob-ları emal edir. Xarici giriş yoxdur,
  production image-də yoxdur.
- **Çıxış:** picomatch yamağı çıxanda `npm audit fix` (və ya `overrides`) edilir və qeyd silinir.
  Ən gec 2027-01-18-də yenidən baxılır.

## Bağlanmış qeydlər

- **D-AUDIT-1 — `braces` GHSA-vfj7-8cjw-p6xm** (2026-10-08 → 2026-10-27): advisory artıq
  `braces@3.0.3`-ə uyğun gəlmir, `npm audit` onu tapmır; istisna silindi.
