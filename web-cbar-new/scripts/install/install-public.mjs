// Public addım (US4, FR-043): yalnız public registry-dən gələn asılılıqlar.
//
// VPN və credential **tələb olunmur** — optional qrup (o cümlədən UI kit)
// ümumiyyətlə fetch olunmur, daxili registry-yə heç bir sorğu getmir.
//
// İstifadə:  npm run install:public

import process from 'node:process'

import { isKitInstalled, KIT_NAME, runNpmInstall } from './lib.mjs'

const ROOT = process.cwd()

console.log('Public asılılıqlar quraşdırılır (daxili registry / VPN tələb olunmur)…')

const { status } = runNpmInstall(['--omit=optional', '--no-audit', '--no-fund'])

if (status !== 0) {
  console.error('✗ Public quraşdırma alınmadı — səbəb üçün yuxarıdakı npm çıxışına bax.')
  process.exit(status)
}

// Yekun status — «səssiz yarımçıq vəziyyət» qadağandır (spec Edge Cases).
console.log('✓ Public asılılıqlar quraşdırıldı.')

if (isKitInstalled(ROOT)) {
  console.log(`✓ kit: var — ${KIT_NAME} artıq yerindədir. Mühit tamdır.`)
} else {
  console.log(`ℹ kit: yoxdur — ${KIT_NAME} quraşdırılmayıb.`)
  console.log('  Tətbiq açılacaq, lakin UI stilsiz olacaq və açılışda xəbərdarlıq görünəcək.')
  console.log('  Tam mühit üçün:')
  console.log('    npm run install:offline    # şəbəkə tələb olunmur (repo daxilindəki arxivdən)')
  console.log('    npm run install:nexus      # daxili şəbəkə daxilində, registry-dən')
}
