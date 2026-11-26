// lib.mjs saf funksiyalarının testləri (spec 003, Maddə VI).
// Env direktivi yoxdur: qlobal setup (src/shared/testing/setup.ts) modul
// səviyyəsində window-a müraciət etdiyindən node mühitində çökərdi — saf
// funksiyalar üçün default jsdom zərərsizdir.

import { describe, expect, it } from 'vitest'

import {
  buildNpmAuth,
  classifyFailure,
  KONTEKSTLER,
  mesaj,
  parseContext,
  parseEnvFile,
  XETA_MESAJLARI,
} from './lib.mjs'

describe('parseEnvFile', () => {
  it('KEY=VALUE cütlərini oxuyur, şərh və boş sətirləri ötürür', () => {
    const text = [
      '# şərh sətri',
      '',
      'NEXUS_USERNAME=murad',
      'NEXUS_PASSWORD=gizli',
    ].join('\n')
    expect(parseEnvFile(text)).toEqual({
      NEXUS_USERNAME: 'murad',
      NEXUS_PASSWORD: 'gizli',
    })
  })

  it('dəyərdəki = simvolunu saxlayır (yalnız ilk = ayırıcıdır)', () => {
    expect(parseEnvFile('NEXUS_PASSWORD=a=b=c')).toEqual({
      NEXUS_PASSWORD: 'a=b=c',
    })
  })

  it('kənar boşluqları kəsir və cüt dırnaqları soyur', () => {
    const parsed = parseEnvFile(
      '  NEXUS_USERNAME = "murad"  \n' + "NEXUS_PASSWORD='gi zli'",
    )
    expect(parsed).toEqual({
      NEXUS_USERNAME: 'murad',
      NEXUS_PASSWORD: 'gi zli',
    })
  })

  it('CRLF sətir sonlarını qəbul edir (Windows faylı)', () => {
    expect(parseEnvFile('A=1\r\nB=2\r\n')).toEqual({ A: '1', B: '2' })
  })

  it('açarsız/etibarsız sətirləri səssiz ötürür', () => {
    expect(parseEnvFile('=dəyər\nyalnızmətn\n')).toEqual({})
  })
})

describe('buildNpmAuth', () => {
  it('user:pass cütünü gözlənən base64-ə çevirir', () => {
    // "npm:secret" → bilinən vektor
    expect(buildNpmAuth('npm', 'secret')).toBe('bnBtOnNlY3JldA==')
  })

  it('nəticədə newline olmur (uzun girişdə də)', () => {
    const auth = buildNpmAuth('istifadeci', 'x'.repeat(300))
    expect(auth).not.toMatch(/[\r\n]/)
  })

  it('non-ASCII şifrəni Latin1 kimi kodlaşdırır (UTF-8-dən fərqli)', () => {
    // 'ü' Latin1-də tək bayt (0xFC): "u:ü" → 0x75 0x3A 0xFC → "dTr8"
    expect(buildNpmAuth('u', 'ü')).toBe('dTr8')
    // UTF-8 olsaydı 0xC3 0xBC verərdi — fərqi sabitləyirik ki, reqressiya görünsün
    expect(buildNpmAuth('u', 'ü')).not.toBe(
      Buffer.from('u:ü', 'utf8').toString('base64'),
    )
  })
})

describe('classifyFailure', () => {
  it.each(['ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED', 'EAI_AGAIN'])(
    'şəbəkə kodunu sebeke-vpn sinfinə ayırır: %s',
    (code) => {
      expect(
        classifyFailure(
          `npm error code ${code}\nrequest to https://nexus.cbar.az failed`,
        ),
      ).toBe('sebeke-vpn')
    },
  )

  it('401-i auth-redd sinfinə ayırır və şəbəkə ilə qarışdırmır', () => {
    const stderr =
      'npm error code E401\nnpm error Unable to authenticate, need: BASIC realm="Sonatype Nexus"'
    expect(classifyFailure(stderr)).toBe('auth-redd')
    expect(classifyFailure(stderr)).not.toBe('sebeke-vpn')
  })

  it('tanınmayan stderr naməlum sinfinə düşür', () => {
    expect(
      classifyFailure('npm error code EJSONPARSE tamam başqa problem'),
    ).toBe('naməlum')
  })

  it('hər sinfin AZ mesajı var və heç biri credential nümunəsi daşımır', () => {
    for (const [sinif, mesaj] of Object.entries(XETA_MESAJLARI)) {
      const metn =
        typeof mesaj === 'function' ? mesaj(['NEXUS_PASSWORD']) : mesaj
      expect(metn, sinif).toMatch(/[əıöüğşç]/i) // Azərbaycan hərfləri
      expect(metn).not.toMatch(/NPM_AUTH=|password=|sifre=/i)
    }
  })

  // spec 004 (D12): versiya tapılmaması ayrıca sinifdir və auth-dan sonra gəlir
  it.each([
    'ETARGET',
    'No matching version found for @cbar/lib-react-ui-kit@^9.9.9',
    'E404',
  ])('versiya xətasını versiya-tapilmadi sinfinə ayırır: %s', (fragment) => {
    expect(classifyFailure(`npm error code ${fragment}`)).toBe(
      'versiya-tapilmadi',
    )
  })

  it('401 versiya xətasından üstündür (401 alan sorğu versiya siyahısına çatmır)', () => {
    expect(classifyFailure('npm error code E401\nnpm error ETARGET')).toBe(
      'auth-redd',
    )
  })
})

// ── spec 004: kontekst rejimi və mesaj variantları ────────────────────────────

describe('parseContext', () => {
  it('arqument yoxdursa lokal qaytarır', () => {
    expect(parseContext([])).toEqual({ context: 'lokal' })
    expect(parseContext(['--no-audit'])).toEqual({ context: 'lokal' })
  })

  it.each(KONTEKSTLER)('--context=%s dəyərini tanıyır', (value) => {
    expect(parseContext([`--context=${value}`])).toEqual({ context: value })
  })

  it('birbaşa node çağırışında qalan -- ayırıcısını nəzərə almır', () => {
    expect(parseContext(['--', '--context=ci'])).toEqual({ context: 'ci' })
  })

  it('tanınmayan dəyərdə xəta və icazəli siyahı qaytarır', () => {
    const result = parseContext(['--context=prod'])
    expect(result.error).toBe('kontekst-yanlis')
    expect(result.value).toBe('prod')
    expect(result.allowed).toEqual(['lokal', 'ci', 'docker'])
    expect(parseContext(['--context']).error).toBe('kontekst-yanlis')
  })
})

describe('mesaj (kontekst variantları)', () => {
  it('credential-fayl-yoxdur üç kontekstdə fərqli mətn verir', () => {
    const lokal = mesaj('credential-fayl-yoxdur', 'lokal')
    const ci = mesaj('credential-fayl-yoxdur', 'ci')
    const docker = mesaj('credential-fayl-yoxdur', 'docker')
    expect(new Set([lokal, ci, docker]).size).toBe(3)
  })

  it('ci variantı GitLab variable adlarını göstərir', () => {
    const ci = mesaj('credential-fayl-yoxdur', 'ci')
    expect(ci).toContain('NEXUS_USERNAME')
    expect(ci).toContain('NEXUS_PASSWORD')
    expect(ci).toMatch(/CI\/CD → Variables/)
  })

  it('docker variantı docker:build əmrini və secret id-ni göstərir', () => {
    const docker = mesaj('credential-fayl-yoxdur', 'docker')
    expect(docker).toContain('docker:build')
    expect(docker).toContain('nexus_env')
  })

  it('credential-bos hər kontekstdə boş açarları sadalayır', () => {
    for (const kontekst of KONTEKSTLER) {
      expect(mesaj('credential-bos', kontekst, ['NEXUS_PASSWORD'])).toContain(
        'NEXUS_PASSWORD',
      )
    }
  })

  it('lokal variantı spec 003 XETA_MESAJLARI ilə eynidir (geriyə uyğunluq)', () => {
    expect(mesaj('sebeke-vpn', 'lokal')).toBe(XETA_MESAJLARI['sebeke-vpn'])
    expect(mesaj('credential-bos', 'lokal', ['A'])).toBe(
      XETA_MESAJLARI['credential-bos'](['A']),
    )
  })

  it('kontekst-yanlis verilən dəyəri və icazəli siyahını göstərir', () => {
    const m = mesaj('kontekst-yanlis', 'lokal', 'prod')
    expect(m).toContain('prod')
    expect(m).toContain('lokal, ci, docker')
  })

  it('heç bir variant credential/base64 nümunəsi daşımır və AZ dilindədir', () => {
    const sinifler = [
      'credential-fayl-yoxdur',
      'credential-bos',
      'sebeke-vpn',
      'auth-redd',
      'versiya-tapilmadi',
      'kit-yoxdur',
      'naməlum',
    ]
    for (const sinif of sinifler) {
      for (const kontekst of KONTEKSTLER) {
        const metn = mesaj(sinif, kontekst, ['NEXUS_PASSWORD'])
        expect(metn, `${sinif}/${kontekst}`).toMatch(/[əıöüğşç]/i)
        expect(metn, `${sinif}/${kontekst}`).not.toMatch(
          /NPM_AUTH=|password=|sifre=/i,
        )
        expect(metn, `${sinif}/${kontekst}`).not.toMatch(
          /[A-Za-z0-9+/]{24,}={0,2}/,
        ) // base64-ə bənzər token yoxdur
      }
    }
  })
})
