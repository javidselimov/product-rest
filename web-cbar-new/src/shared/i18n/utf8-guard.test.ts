/**
 * UTF-8 mühafizəsi (FR-020, konstitusiya Maddə I.5).
 *
 * Azərbaycan hərfləri shell redirection və ya `Set-Content` ilə yazılanda
 * korlanır (`ə` → `?`, `Ã¦` və s.). Bu test hər locale və sənəd faylını
 * oxuyur və hərflərin sağ qaldığını təsdiqləyir — korlanma commit-dən əvvəl
 * gate-də görünür.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { NAMESPACES, SUPPORTED_LANGUAGES, resources } from './index'

const ROOT = process.cwd()

/** Azərbaycan əlifbasının latın qrafikasına xas hərfləri. */
const AZ_LETTERS = ['ə', 'ı', 'ğ', 'ş', 'ç', 'ö', 'ü', 'Ə', 'İ', 'Ğ', 'Ş', 'Ç', 'Ö', 'Ü']

/** Korlanmanın tipik izləri: mojibake və əvəzetmə simvolu. */
const MOJIBAKE = /[�]|Ã[-¿]|Ä[-¿]|Å[-¿]/

function collectFiles(dir: string, extensions: string[]): string[] {
  const result: string[] = []

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (extensions.includes(extname(entry.name))) {
        result.push(fullPath)
      }
    }
  }

  try {
    if (statSync(dir).isDirectory()) walk(dir)
  } catch {
    // dir yoxdursa siyahı boş qalır
  }

  return result
}

describe('locale faylları', () => {
  const locales = collectFiles(join(ROOT, 'src', 'locales'), ['.json'])

  it('hər iki dil üçün fayllar tapılır', () => {
    expect(locales.length).toBe(SUPPORTED_LANGUAGES.length * NAMESPACES.length)
  })

  it.each(locales)('%s korlanma izi daşımır', (file) => {
    const text = readFileSync(file, 'utf8')

    expect(text).not.toMatch(MOJIBAKE)
    // JSON hələ də parse olunur — korlanma dırnaqları da poza bilər.
    expect(() => JSON.parse(text)).not.toThrow()
  })

  it('az resursları Azərbaycan hərflərini saxlayır', () => {
    const allText = JSON.stringify(resources.az)

    for (const letter of ['ə', 'ı', 'ş', 'ç', 'ü', 'ö', 'ğ']) {
      expect(allText).toContain(letter)
    }
  })

  it('bütün Azərbaycan hərfləri ən azı bir yerdə sağ qalıb', () => {
    const allText = locales.map((f) => readFileSync(f, 'utf8')).join('')
    const missing = AZ_LETTERS.filter((h) => !allText.includes(h))

    // Böyük hərflərin hamısı hər dəstdə olmaya bilər; kiçiklər məcburidir.
    expect(missing.filter((h) => h === h.toLocaleLowerCase('az-AZ'))).toEqual([])
  })
})

describe('sənədlər', () => {
  const docs = [
    ...collectFiles(join(ROOT, 'docs'), ['.md']),
    ...collectFiles(join(ROOT, '.ci-cd'), ['.yaml', '.yml']),
    // CI override-i kökdədir (`.ci-cd/` Helm chart-a köçürülür), amma AZ şərhlər daşıyır.
    join(ROOT, 'app.gitlab-ci.yml'),
  ]

  it('sənəd faylları tapılır', () => {
    expect(docs.length).toBeGreaterThan(0)
  })

  it.each(docs)('%s korlanma izi daşımır', (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(MOJIBAKE)
  })
})
