// install/tar.mjs saf funksiyalarının testləri (spec 002, FR-083).
//
// Testlər **sintetik** tar buferi qurur — real arxiv tələb olunmur, ona görə
// `vendor/` boş olsa da bu fayl işləyir.
//
// Formatın əhatəsi qəsdən dardır: real npm arxivi ölçülüb (research R-002) —
// 367 girişin hamısı adi fayl (`typeflag` '0'), `prefix` sahəsi istifadə
// edilmir, ən uzun ad 49 simvoldur. Oxuyucu bundan artığını dəstəkləmir və
// tanımadığını **səssiz ötürmür**, rədd edir.

import { describe, expect, it } from 'vitest'

import { packagePath, tarEntries } from './tar.mjs'

/** Bir ustar girişi: 512 baytlıq başlıq + 512-yə yuvarlaqlaşdırılmış məzmun. */
function tarEntry({ name, content = '', type = '0' }) {
  const byteLength = Buffer.byteLength(content)
  const header = Buffer.alloc(512)

  header.write(name, 0, 'utf8')
  header.write('000644\0 ', 100, 'ascii') // mode
  header.write(`${byteLength.toString(8).padStart(11, '0')}\0`, 124, 'ascii')
  header[156] = type.charCodeAt(0)
  header.write('ustar\0', 257, 'latin1')
  header.write('00', 263, 'ascii')

  const body = Buffer.alloc(Math.ceil(byteLength / 512) * 512)
  Buffer.from(content, 'utf8').copy(body)

  return Buffer.concat([header, body])
}

/** Arxivin sonu iki sıfır blokdur. */
const buildTar = (entries) => Buffer.concat([...entries.map(tarEntry), Buffer.alloc(1024)])

describe('tarEntries', () => {
  it('ad və məzmunu oxuyur', () => {
    const entries = tarEntries(buildTar([{ name: 'package/package.json', content: '{"a":1}' }]))

    expect(entries).toHaveLength(1)
    expect(entries[0].name).toBe('package/package.json')
    expect(entries[0].content.toString('utf8')).toBe('{"a":1}')
  })

  it('512-ə yuvarlaqlaşdırmanı düzgün keçir — sonrakı giriş sürüşmür', () => {
    const large = 'x'.repeat(600) // iki blok tutur
    const entries = tarEntries(
      buildTar([
        { name: 'package/boyuk.txt', content: large },
        { name: 'package/kicik.txt', content: 'son' },
      ]),
    )

    expect(entries.map((entry) => entry.name)).toEqual(['package/boyuk.txt', 'package/kicik.txt'])
    expect(entries[0].content).toHaveLength(600)
    expect(entries[1].content.toString('utf8')).toBe('son')
  })

  it('boş fayl girişini itirmir', () => {
    const entries = tarEntries(buildTar([{ name: 'package/bos.txt', content: '' }]))

    expect(entries).toHaveLength(1)
    expect(entries[0].content).toHaveLength(0)
  })

  it('sıfır blokda dayanır — sonrakı zibil oxunmur', () => {
    const archive = Buffer.concat([
      tarEntry({ name: 'package/a.txt', content: 'a' }),
      Buffer.alloc(1024),
      tarEntry({ name: 'package/gizli.txt', content: 'oxunmamalıdır' }),
    ])

    expect(tarEntries(archive).map((entry) => entry.name)).toEqual(['package/a.txt'])
  })

  it('tanınmayan typeflag-i rədd edir — səssiz ötürmə yoxdur', () => {
    // '2' = symlink, '5' = qovluq, 'L' = GNU uzun ad. Real npm arxivində
    // heç biri yoxdur; olsaydı, səssizcə atlamaq arxivi natamam açardı.
    for (const type of ['2', '5', 'L']) {
      expect(() => tarEntries(buildTar([{ name: 'package/x', type }]))).toThrow(/typeflag/i)
    }
  })

  it('yarımçıq başlığı rədd edir', () => {
    expect(() => tarEntries(Buffer.alloc(200))).toThrow(/yarımçıq|natamam/i)
  })

  it('səkkizlik olmayan ölçü sahəsini rədd edir', () => {
    const archive = buildTar([{ name: 'package/a.txt', content: 'a' }])
    archive.write('zzzzzzzzzzz\0', 124, 'ascii')

    expect(() => tarEntries(archive)).toThrow(/ölçü/i)
  })
})

describe('packagePath', () => {
  it('`package/` prefiksini soyur', () => {
    expect(packagePath('package/src/button/index.js')).toBe('src/button/index.js')
    expect(packagePath('package/LICENSE')).toBe('LICENSE')
  })

  it.each([
    ['qovluqdan yuxarı çıxan yol', 'package/../qaç.js'],
    ['dərində gizlənmiş yuxarı çıxış', 'package/src/../../qaç.js'],
    ['mütləq POSIX yolu', '/etc/passwd'],
    ['Windows disk hərfi', 'C:\\Windows\\x.dll'],
    ['ters-kəsr ilə yuxarı çıxış', 'package\\..\\qaç.js'],
    ['`package/` prefiksi yoxdur', 'src/x.js'],
    ['yalnız prefiks', 'package/'],
  ])('%s → rədd edilir', (_label, path) => {
    expect(() => packagePath(path)).toThrow()
  })

  it('ad daxilindəki nöqtələr yol seqmenti kimi oxunmur', () => {
    // `..gizli` seqmenti `..` DEYİL — qanuni fayl adıdır.
    expect(packagePath('package/src/..gizli.js')).toBe('src/..gizli.js')
  })
})
