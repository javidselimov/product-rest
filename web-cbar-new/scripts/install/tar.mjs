// Minimal ustar oxuyucusu — vendored kit arxivini açmaq üçün (spec 002, FR-075).
//
// Niyə öz oxuyucumuz: Maddə II yeni paket asılılığını qadağan edir, sistem `tar`
// binarı isə platformadan asılılıq gətirərdi (alpine / Windows / macOS davranış
// fərqi). Yalnız Node built-in-ləri işlədilir.
//
// Formatın əhatəsi qəsdən dardır. Real npm arxivi ölçülüb (research R-002):
// 367 girişin **hamısı** adi fayldır (`typeflag` '0'), `prefix` sahəsi heç bir
// girişdə istifadə olunmur, ən uzun ad 49 simvoldur (100 baytlıq `name` sahəsinə
// rahat sığır). Ona görə GNU uzun ad uzantısı, qovluq və symlink girişləri
// dəstəklənmir — və **səssiz ötürülmür**, rədd edilir: səssiz ötürmə arxivi
// natamam açıb «yaşıl, amma yarımçıq» vəziyyət yaradardı.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const BLOCK_SIZE = 512
const PACKAGE_PREFIX = 'package/'

/** Adi fayl. Bəzi paketləyicilər '0' əvəzinə NUL yazır — hər ikisi eyni mənadadır. */
const ALLOWED_TYPES = new Set(['0', '\0'])

/** Başlıq sahəsini oxuyur: dəyər ilk NUL-a qədərdir. */
function readField(header, start, end) {
  return header.subarray(start, end).toString('utf8').replace(/\0[\s\S]*$/, '')
}

/**
 * Tar buferini girişlərə ayırır (saf funksiya).
 * Nəticə: `[{ name, type, content }]`. Arxivin sonu sıfır blokla bildirilir.
 *
 * Struktur pozuntusunda **atır** — çağıran tərəf bunu `archive-corrupt` xəta
 * sinifinə çevirir.
 */
export function tarEntries(tarBuffer) {
  const entries = []
  let offset = 0

  while (offset < tarBuffer.length) {
    if (offset + BLOCK_SIZE > tarBuffer.length) {
      throw new Error(`tar başlığı yarımçıqdır (ofset ${offset})`)
    }

    const header = tarBuffer.subarray(offset, offset + BLOCK_SIZE)
    if (header.every((byte) => byte === 0)) break // arxivin sonu

    const name = readField(header, 0, 100)

    const type = String.fromCharCode(header[156])
    if (!ALLOWED_TYPES.has(type)) {
      throw new Error(`dəstəklənməyən typeflag \`${type}\` — giriş: ${name}`)
    }

    const sizeText = readField(header, 124, 136).trim()
    const size = Number.parseInt(sizeText, 8)
    if (!/^[0-7]+$/.test(sizeText) || !Number.isSafeInteger(size)) {
      throw new Error(`giriş ölçüsü oxunmadı (\`${sizeText}\`) — giriş: ${name}`)
    }

    const bodyStart = offset + BLOCK_SIZE
    const content = tarBuffer.subarray(bodyStart, bodyStart + size)
    if (content.length < size) {
      throw new Error(`giriş məzmunu natamamdır — giriş: ${name}`)
    }

    entries.push({ name, type, content: Buffer.from(content) })
    offset = bodyStart + Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE
  }

  return entries
}

/**
 * Arxiv girişinin adını hədəf qovluğa nisbi yola çevirir (saf funksiya).
 *
 * `package/` prefiksi soyulur; hədəf qovluqdan kənara çıxan hər yol **rədd
 * edilir** — mütləq yol, disk hərfi, `..` seqmenti və prefiksiz giriş daxil.
 */
export function packagePath(name) {
  // Ters-kəsr Windows-da yol ayırıcısıdır: normallaşdırmasaq `package\..\x`
  // yoxlamadan yan keçərdi.
  const normalized = String(name).replaceAll('\\', '/')

  if (!normalized.startsWith(PACKAGE_PREFIX)) {
    throw new Error(`giriş \`${name}\` \`${PACKAGE_PREFIX}\` ilə başlamır`)
  }

  const relativePath = normalized.slice(PACKAGE_PREFIX.length)
  if (relativePath === '') {
    throw new Error(`giriş \`${name}\` boş yol verir`)
  }

  // Seqment səviyyəsində yoxlanılır: `..gizli.js` qanuni fayl adıdır, `..` deyil.
  const segments = relativePath.split('/')
  if (segments.some((segment) => segment === '..' || segment === '.' || segment === '')) {
    throw new Error(`giriş \`${name}\` hədəf qovluqdan kənara çıxır`)
  }

  return segments.join('/')
}

/**
 * `.tgz` buferini hədəf qovluğa açır. Açılan fayl sayını qaytarır.
 * Struktur və ya təhlükəsizlik pozuntusunda atır.
 */
export function extractArchive(gzBuffer, targetDir) {
  let tar
  try {
    tar = gunzipSync(gzBuffer)
  } catch (error) {
    throw new Error(`gzip açılmadı — ${error.message}`)
  }

  const entries = tarEntries(tar)
  if (entries.length === 0) {
    throw new Error('arxivdə heç bir giriş yoxdur')
  }

  for (const entry of entries) {
    const fullPath = join(targetDir, packagePath(entry.name))
    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, entry.content)
  }

  return entries.length
}
