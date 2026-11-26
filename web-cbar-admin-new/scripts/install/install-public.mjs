// Public addım (spec 003, US2): yalnız public registry-dən gələn asılılıqlar.
// VPN və credential TƏLƏB OLUNMUR — optional qrup (o cümlədən @cbar kit)
// ümumiyyətlə fetch olunmur, Nexus-a heç bir sorğu getmir (research D1).
// İstifadə: npm run install:public

import process from 'node:process'

import { kitMovcuddur, runNpmInstall } from './lib.mjs'

const ROOT = process.cwd()

console.log('Public asılılıqlar quraşdırılır (Nexus/VPN tələb olunmur)…')

// NPM_AUTH set deyilsə boş verilir: `.npmrc`-dəki `${NPM_AUTH}` substitusiyası
// unset dəyişəndə npm-i yıxa bilir; omit olunan scope-a sorğu getmədiyi üçün
// boş credential heç vaxt istifadə olunmur (research D5).
const { status } = runNpmInstall(
  ['--omit=optional', '--no-audit', '--no-fund'],
  {
    NPM_AUTH: process.env.NPM_AUTH ?? '',
  },
)

if (status !== 0) {
  console.error(
    '✗ Public quraşdırma alınmadı — səbəb üçün yuxarıdakı npm çıxışına bax.',
  )
  process.exit(status)
}

// Yekun status — "səssiz yarımçıq vəziyyət" qadağandır (spec Edge Cases).
console.log('✓ Public asılılıqlar quraşdırıldı.')
if (kitMovcuddur(ROOT)) {
  console.log(
    '✓ kit: var — @cbar/lib-react-ui-kit artıq yerindədir. Mühit tamdır.',
  )
} else {
  console.log(
    'ℹ kit: yoxdur — @cbar/lib-react-ui-kit hələ quraşdırılmayıb (dev/build işləməyəcək).',
  )
  console.log('  Tam mühit üçün (VPN qoşulu halda):  npm run install:nexus')
}
