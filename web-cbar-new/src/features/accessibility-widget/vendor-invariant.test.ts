/**
 * Vendor surətinin invariantı (spec 007 contracts/widget-embed.md, research R1).
 *
 * Yamaqlı skript rəsmi hosta yalnız `<a href>` ilə istinad edir: resurs (`src=`,
 * `url(`) həmişə öz serverimizdən gəlir. Faylı yeniləyən kəs əvəzləmələri unutsa,
 * gate burada qırılır. Addımlar: `public/vendor/accw/VENDOR.md`.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const VENDOR_DIR = join(process.cwd(), 'public', 'vendor', 'accw')
const script = readFileSync(join(VENDOR_DIR, 'acc-widget.min.js'), 'utf8')

const GOV_HOST = 'accessibility.cert.gov.az'

describe('acc-widget.min.js vendor surəti', () => {
  it('rəsmi host yalnız href-lərdə qalır', () => {
    const contexts = [...script.matchAll(/.{0,6}https:\/\/accessibility\.cert\.gov\.az[^"]*/g)].map(
      (m) => m[0],
    )

    expect(contexts.length).toBeGreaterThan(0)
    for (const context of contexts) {
      expect(context).toBe(`href="https://${GOV_HOST}/`)
    }
  })

  it('resurs URL-ləri öz serverimizə yönəlib', () => {
    expect(script).not.toMatch(/src=["']https?:/)
    expect(script).not.toMatch(/url\(["']?https?:/)
    // Nisbi yol sənədin URL-inə görə həll olunur və alt səhifələrdə 404 verirdi.
    expect(script).not.toContain('./fonts/')

    expect(script).toContain('/vendor/accw/accw-icon.png')
    expect(script).toContain('/vendor/accw/fonts/OpenDyslexic3-Regular.woff')
    expect(script).toContain('/vendor/accw/fonts/OpenDyslexic3-Regular.ttf')
  })

  it('istinad olunan fayllar mövcuddur', () => {
    for (const file of [
      'accw-icon.png',
      'fonts/OpenDyslexic3-Regular.woff',
      'fonts/OpenDyslexic3-Regular.ttf',
      'fonts/OFL.txt',
      'VENDOR.md',
    ]) {
      expect(existsSync(join(VENDOR_DIR, file)), file).toBe(true)
    }
  })
})
