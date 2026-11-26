// Konstitusiya lint qatının testi (SC-004).
//
// quickstart §6-dakı altı pozuntunun **hamısı** gate tərəfindən tutulmalıdır.
// Test ESLint-i proqram vasitəsilə işlədir və real konfiqurasiyanı oxuyur —
// qayda silinsə və ya fayl zonası sürüşsə, bu test dərhal qırmızıya düşür.

import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

/** Tam suite-də CPU yüklü olanda ESLint-in soyuq başlanğıcı adi test limitini keçə bilir. */
const ESLINT_WARMUP_TIMEOUT_MS = 90_000

let eslint

// Konfiqurasiya, parser və pluginlər ilk `lintText`-də yüklənir. İsinmə burada olmasa, bu
// yükləmə siyahıdakı birinci testin vaxtına düşür və test qayda səbəbi olmadan timeout alır.
beforeAll(async () => {
  eslint = new ESLint({ cwd: process.cwd() })
  await eslint.lintText('export {}\n', { filePath: 'src/views/probe/index.tsx', warnIgnored: false })
}, ESLINT_WARMUP_TIMEOUT_MS)

/** Verilmiş virtual fayl yolu üçün ESLint mesajlarını qaytarır. */
async function lint(code, filePath) {
  const [netice] = await eslint.lintText(code, { filePath, warnIgnored: false })
  return netice?.messages ?? []
}

const errorsOnly = (messages) => messages.filter((m) => m.severity === 2)

const CASES = [
  {
    name: '1. hardcoded rəng (palitra sinfi)',
    file: 'src/views/probe/index.tsx',
    code: `export function Probe() {\n  return <div className="bg-blue-600" />\n}\n`,
    rule: 'no-restricted-syntax',
    messageFragment: 'Palitra rəng sinifləri',
  },
  {
    name: '1b. hardcoded rəng (#hex)',
    file: 'src/views/probe/index.tsx',
    code: `export const color = '#1a73e8'\n`,
    rule: 'no-restricted-syntax',
    messageFragment: 'Hərfi rəng dəyəri',
  },
  {
    name: '2. kit barrel import',
    file: 'src/views/probe/index.tsx',
    code: `import { Button } from '@cbar/lib-react-ui-kit'\n\nexport const B = Button\n`,
    rule: 'no-restricted-imports',
    messageFragment: 'Barrel import qadağandır',
  },
  {
    name: '3. views daxilində birbaşa HTTP',
    file: 'src/views/probe/index.tsx',
    code: `import axios from 'axios'\n\nexport const a = axios\n`,
    rule: 'no-restricted-imports',
    messageFragment: 'Komponentdə birbaşa HTTP qadağandır',
  },
  {
    name: '4. qat istiqaməti (shared → features)',
    file: 'src/shared/probe.ts',
    code: `import { useAuthStore } from '@/features/auth/model/auth-store'\n\nexport const s = useAuthStore\n`,
    rule: 'no-restricted-imports',
    messageFragment: 'Qat istiqaməti pozulub',
  },
  {
    name: '5. hardcoded UI mətni',
    file: 'src/views/probe/index.tsx',
    code: `export function Probe() {\n  return <p>Layihələr</p>\n}\n`,
    rule: 'no-restricted-syntax',
    messageFragment: 'Hardcoded UI mətni qadağandır',
  },
  {
    name: '6. client komponentindən server-only import',
    file: 'src/views/probe/index.tsx',
    code: `import { getSession } from '@/server/session'\n\nexport const g = getSession\n`,
    rule: 'no-restricted-imports',
    messageFragment: 'server-only',
  },
  {
    name: 'əlavə. yeni NEXT_PUBLIC_* istinadı',
    file: 'src/shared/probe.ts',
    code: `export const host = process.env.NEXT_PUBLIC_API_HOST\n`,
    rule: 'no-restricted-syntax',
    messageFragment: 'NEXT_PUBLIC_*',
  },
  {
    name: 'əlavə. magic number (Maddə XII, spec 032)',
    file: 'src/features/probe/model/paging.ts',
    code: `export function pageOf(index: number) {\n  return Math.floor(index / 20) + 1\n}\n`,
    rule: '@typescript-eslint/no-magic-numbers',
    messageFragment: 'No magic number: 20',
  },
  {
    name: 'əlavə. magic number obyekt dəyərində (detectObjects)',
    file: 'src/features/probe/model/module.ts',
    code: `export const module = { pageSize: 20 }\n`,
    rule: '@typescript-eslint/no-magic-numbers',
    messageFragment: 'No magic number: 20',
  },
  {
    name: 'əlavə. dangerouslySetInnerHTML',
    file: 'src/views/probe/index.tsx',
    code: `export function Probe({ html }: { html: string }) {\n  return <div dangerouslySetInnerHTML={{ __html: html }} />\n}\n`,
    rule: 'no-restricted-syntax',
    messageFragment: 'dangerouslySetInnerHTML qadağandır',
  },
]

describe('konstitusiya lint qatı', () => {
  it.each(CASES)('tutur: $name', async ({ file, code, rule, messageFragment }) => {
    const messages = errorsOnly(await lint(code, file))

    expect(messages.map((m) => m.ruleId)).toContain(rule)
    expect(messages.map((m) => m.message).join('\n')).toContain(messageFragment)
  })

  it('qaydalara uyğun kodu buraxır', async () => {
    const code = [
      `'use client'`,
      ``,
      `import { Button } from '@cbar/lib-react-ui-kit/button'`,
      `import { useTranslation } from 'react-i18next'`,
      ``,
      `export function Probe() {`,
      `  const { t } = useTranslation(['common'])`,
      `  return <Button className="bg-primary">{t('common:actions.save')}</Button>`,
      `}`,
      ``,
    ].join('\n')

    expect(errorsOnly(await lint(code, 'src/views/probe/index.tsx'))).toEqual([])
  })

  it('sabit faylında rəqəmi və ondan import edən kodu buraxır (Maddə XII)', async () => {
    const sabit = `export const PROBE_PAGE_SIZE = 20\nexport const PROBE_LIMITS = { max: 500 } as const\n`
    expect(errorsOnly(await lint(sabit, 'src/features/probe/model/constants.ts'))).toEqual([])
    expect(errorsOnly(await lint(sabit, 'src/shared/constants/probe.ts'))).toEqual([])

    const istifadə = [
      `import { PROBE_PAGE_SIZE } from './constants'`,
      ``,
      `export function pageOf(index: number) {`,
      `  return Math.floor(index / PROBE_PAGE_SIZE) + 1`,
      `}`,
      ``,
    ].join('\n')
    expect(errorsOnly(await lint(istifadə, 'src/features/probe/model/paging.ts'))).toEqual([])
  })
})
