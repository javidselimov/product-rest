// @vitest-environment node
import { crc32, inflateRawSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import { createZip } from './zip'

type CentralEntry = {
  name: string
  flags: number
  method: number
  crc: number
  compressedSize: number
  size: number
  offset: number
}

function readArchive(zip: Uint8Array) {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength)
  const eocd = zip.length - 22
  expect(view.getUint32(eocd, true)).toBe(0x06054b50)

  const count = view.getUint16(eocd + 10, true)
  const centralSize = view.getUint32(eocd + 12, true)
  const centralOffset = view.getUint32(eocd + 16, true)
  expect(view.getUint16(eocd + 8, true)).toBe(count)
  expect(centralOffset + centralSize).toBe(eocd)

  const decoder = new TextDecoder()
  const entries: CentralEntry[] = []
  let at = centralOffset
  for (let i = 0; i < count; i++) {
    expect(view.getUint32(at, true)).toBe(0x02014b50)
    const nameLength = view.getUint16(at + 28, true)
    const extraLength = view.getUint16(at + 30, true)
    const commentLength = view.getUint16(at + 32, true)
    entries.push({
      flags: view.getUint16(at + 8, true),
      method: view.getUint16(at + 10, true),
      crc: view.getUint32(at + 16, true),
      compressedSize: view.getUint32(at + 20, true),
      size: view.getUint32(at + 24, true),
      offset: view.getUint32(at + 42, true),
      name: decoder.decode(zip.subarray(at + 46, at + 46 + nameLength)),
    })
    at += 46 + nameLength + extraLength + commentLength
  }
  expect(at).toBe(eocd)

  return entries.map((entry) => {
    const local = entry.offset
    expect(view.getUint32(local, true)).toBe(0x04034b50)
    const nameLength = view.getUint16(local + 26, true)
    const extraLength = view.getUint16(local + 28, true)
    // The local header must agree with the central directory.
    expect(view.getUint16(local + 8, true)).toBe(entry.method)
    expect(view.getUint32(local + 14, true)).toBe(entry.crc)
    expect(view.getUint32(local + 18, true)).toBe(entry.compressedSize)
    expect(view.getUint32(local + 22, true)).toBe(entry.size)
    expect(decoder.decode(zip.subarray(local + 30, local + 30 + nameLength))).toBe(entry.name)

    const start = local + 30 + nameLength + extraLength
    const data = new Uint8Array(inflateRawSync(zip.subarray(start, start + entry.compressedSize)))
    return { ...entry, data }
  })
}

const encoder = new TextEncoder()

describe('createZip', () => {
  it('writes entries that read back with matching name, size and CRC32', () => {
    const inputs = [
      { name: '[Content_Types].xml', data: encoder.encode('<Types/>') },
      { name: 'xl/worksheets/sheet1.xml', data: encoder.encode('<a>'.repeat(500)) },
      { name: 'Qeydlər/əqd.txt', data: encoder.encode('Əqdlərin həcmi') },
      { name: 'empty.bin', data: new Uint8Array(0) },
    ]

    const entries = readArchive(createZip(inputs))

    expect(entries).toHaveLength(inputs.length)
    entries.forEach((entry, i) => {
      expect(entry.name).toBe(inputs[i].name)
      expect(entry.method).toBe(8)
      expect(entry.flags & 0x0800).toBe(0x0800)
      expect(entry.size).toBe(inputs[i].data.length)
      expect(entry.data).toEqual(inputs[i].data)
      expect(entry.crc).toBe(crc32(inputs[i].data))
    })
  })

  it('actually compresses repetitive data', () => {
    const data = encoder.encode('<row/>'.repeat(1000))
    const [entry] = readArchive(createZip([{ name: 'a.xml', data }]))

    expect(entry.compressedSize).toBeLessThan(data.length / 10)
  })

  it('is deterministic (fixed DOS timestamp)', () => {
    const inputs = [{ name: 'a.txt', data: encoder.encode('a') }]

    expect(createZip(inputs)).toEqual(createZip(inputs))
  })

  it('writes an empty archive as a bare EOCD', () => {
    const zip = createZip([])

    expect(zip).toHaveLength(22)
    expect(readArchive(zip)).toEqual([])
  })
})
