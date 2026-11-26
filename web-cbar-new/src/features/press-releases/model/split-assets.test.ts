import { describe, expect, it } from 'vitest'

import { makeMediaAsset } from '@/shared/testing/factories'

import { layoutFor, splitPressReleaseAssets } from './split-assets'

const img = (mediaId: number, mimeType = 'image/jpeg') => makeMediaAsset({ mediaId, mimeType })
const pdf = (mediaId: number) => makeMediaAsset({ mediaId, mimeType: 'application/pdf' })
const ids = (assets: { mediaId: number }[]) => assets.map((a) => a.mediaId)

describe('splitPressReleaseAssets', () => {
  it('first photo is the cover, later photos the gallery, everything else the attachments — order kept', () => {
    const { cover, gallery, attachments } = splitPressReleaseAssets([pdf(1), img(2), img(3), pdf(4), img(5, 'image/svg+xml')])

    expect(cover?.mediaId).toBe(2)
    expect(ids(gallery)).toEqual([3, 5])
    expect(ids(attachments)).toEqual([1, 4])
  })

  it('a single photo is only the cover — no gallery', () => {
    const { cover, gallery } = splitPressReleaseAssets([img(7)])

    expect(cover?.mediaId).toBe(7)
    expect(gallery).toEqual([])
  })

  it('no photos: no cover, no gallery, files stay attachments', () => {
    const { cover, gallery, attachments } = splitPressReleaseAssets([pdf(8)])

    expect(cover).toBeNull()
    expect(gallery).toEqual([])
    expect(ids(attachments)).toEqual([8])
  })
})

describe("splitPressReleaseAssets('files') — announcements (spec 031)", () => {
  it('no cover, no gallery; every asset stays an attachment in the API order', () => {
    const { cover, gallery, attachments } = splitPressReleaseAssets([img(2), pdf(1), img(3)], 'files')

    expect(cover).toBeNull()
    expect(gallery).toEqual([])
    expect(ids(attachments)).toEqual([2, 1, 3])
  })

  it("'photos' is the default news split", () => {
    expect(splitPressReleaseAssets([img(2), pdf(1)], 'photos')).toEqual(splitPressReleaseAssets([img(2), pdf(1)]))
  })
})

describe("splitPressReleaseAssets('document') — interviews (spec 033)", () => {
  it('the first PDF is the download, the first photo belongs to the list card, the rest are attachments in API order', () => {
    const { cover, gallery, pdf: file, attachments } = splitPressReleaseAssets([img(1), pdf(2), img(3), pdf(4)], 'document')

    expect(cover).toBeNull()
    expect(gallery).toEqual([])
    expect(file?.mediaId).toBe(2)
    expect(ids(attachments)).toEqual([3, 4])
  })

  it('no PDF: nothing to download, later files stay attachments', () => {
    const { pdf: file, attachments } = splitPressReleaseAssets([img(1), img(2)], 'document')

    expect(file).toBeNull()
    expect(ids(attachments)).toEqual([2])
  })

  it('the other layouts never pick a download', () => {
    expect(splitPressReleaseAssets([pdf(1)], 'photos').pdf).toBeNull()
    expect(splitPressReleaseAssets([pdf(1)], 'files').pdf).toBeNull()
  })
})

describe('layoutFor', () => {
  it('maps each press release type to its detail layout', () => {
    expect(layoutFor('1')).toBe('photos')
    expect(layoutFor('2')).toBe('files')
    expect(layoutFor('3')).toBe('document')
  })
})
