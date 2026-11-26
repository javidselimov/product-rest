// `prepare` sarğısı: npm install / npm ci / install:public / install:nexus hər
// dəfə bunu çağırır və git hook-larını (.husky/) aktivləşdirir.
//
// HƏMİŞƏ exit 0 — hook quraşdırması heç bir halda install-ı qırmır (FR-041):
//   HUSKY=0             → developer bilərəkdən söndürüb
//   CI set              → GitLab runner / Docker build (ENV CI=true) — hook mənasızdır
//   .git yoxdur (cwd)   → Docker build konteksti, arxivdən açılan qovluq
//   husky modulu yoxdur → `--omit=dev` və ya `--ignore-scripts` sonrası
// Qərar saf `installDecision` ilə verilir (lib.test.mjs onu yoxlayır); burada yalnız I/O.

import { existsSync } from 'node:fs'

import { MESSAGES, installDecision } from './lib.mjs'

try {
  const hasHusky = existsSync('node_modules/husky/index.js')
  const decision = installDecision(process.env, existsSync('.git'), hasHusky)

  if (decision !== 'install') {
    console.log(MESSAGES.install[decision])
    process.exit(0)
  }

  const { default: husky } = await import('husky')
  const result = husky() // '' — uğur; boş olmayan string — husky-nin öz izahı
  console.log(result ? MESSAGES.install.error(String(result).trim()) : MESSAGES.install.success)
} catch (error) {
  console.log(MESSAGES.install.error(error?.message ?? String(error)))
}

process.exit(0)
