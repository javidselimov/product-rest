/**
 * Minimal ZIP writer for the xlsx container (spec 021 research R6, contracts/xlsx.md).
 *
 * Every entry is deflated (method 8); local headers + central directory + EOCD,
 * UTF-8 names, a fixed DOS timestamp so identical input yields identical bytes.
 * No ZIP64: the archive must stay below 4 GiB and 65535 entries (an AZIR export
 * is well under 1 MB). Server-only — relies on `node:zlib`.
 */
import { crc32, deflateRawSync } from 'node:zlib'

export type ZipEntry = { name: string; data: Uint8Array }

/** 2026-01-01 00:00:00 in DOS format. */
const DOS_TIME = 0
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1

const VERSION = 20
/** General purpose bit 11: file name is UTF-8. */
const FLAG_UTF8 = 0x0800
const METHOD_DEFLATE = 8

const LOCAL_HEADER = 0x04034b50
const CENTRAL_HEADER = 0x02014b50
const END_OF_CENTRAL_DIR = 0x06054b50

const MAX_U32 = 0xffffffff
const MAX_U16 = 0xffff

export function createZip(entries: ZipEntry[]): Uint8Array {
  if (entries.length > MAX_U16) throw new Error('createZip: too many entries (no ZIP64)')

  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const name = encoder.encode(entry.name)
    const compressed = deflateRawSync(entry.data)
    const crc = crc32(entry.data)

    if (offset > MAX_U32 || compressed.length > MAX_U32 || entry.data.length > MAX_U32) {
      throw new Error('createZip: archive too large (no ZIP64)')
    }

    const local = new Uint8Array(30 + name.length + compressed.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, LOCAL_HEADER, true)
    lv.setUint16(4, VERSION, true)
    lv.setUint16(6, FLAG_UTF8, true)
    lv.setUint16(8, METHOD_DEFLATE, true)
    lv.setUint16(10, DOS_TIME, true)
    lv.setUint16(12, DOS_DATE, true)
    lv.setUint32(14, crc, true)
    lv.setUint32(18, compressed.length, true)
    lv.setUint32(22, entry.data.length, true)
    lv.setUint16(26, name.length, true)
    lv.setUint16(28, 0, true)
    local.set(name, 30)
    local.set(compressed, 30 + name.length)

    const central = new Uint8Array(46 + name.length)
    const cv = new DataView(central.buffer)
    cv.setUint32(0, CENTRAL_HEADER, true)
    cv.setUint16(4, VERSION, true)
    cv.setUint16(6, VERSION, true)
    cv.setUint16(8, FLAG_UTF8, true)
    cv.setUint16(10, METHOD_DEFLATE, true)
    cv.setUint16(12, DOS_TIME, true)
    cv.setUint16(14, DOS_DATE, true)
    cv.setUint32(16, crc, true)
    cv.setUint32(20, compressed.length, true)
    cv.setUint32(24, entry.data.length, true)
    cv.setUint16(28, name.length, true)
    // extra, comment, disk start, internal and external attributes stay 0
    cv.setUint32(42, offset, true)
    central.set(name, 46)

    locals.push(local)
    centrals.push(central)
    offset += local.length
  }

  const centralSize = centrals.reduce((sum, c) => sum + c.length, 0)
  if (offset > MAX_U32 || centralSize > MAX_U32) {
    throw new Error('createZip: archive too large (no ZIP64)')
  }

  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, END_OF_CENTRAL_DIR, true)
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)

  const out = new Uint8Array(offset + centralSize + end.length)
  let at = 0
  for (const part of [...locals, ...centrals, end]) {
    out.set(part, at)
    at += part.length
  }
  return out
}
