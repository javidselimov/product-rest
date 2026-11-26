import { describe, expect, it } from 'vitest'

import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { buildSectionShell } from '@/widgets/section-shell'

import { buildNavSections } from './nav'

const scheduleNode = { id: 130, title: 'Məlumatların yayımlanması qrafiki', slug: 'melumatlarin-yayimlanmasi-qrafiki', navUrl: null, children: [] }
const media = mediaTreeAz[0]!
const tree = [{ ...media, children: [...media.children, scheduleNode] }]

const leftItem = (current: { slug?: string; href?: string }) =>
  buildSectionShell({ section: 'media', tree, locale: 'az', current, pageUrl: 'https://x', pageTitle: 'x' }).nav.find(
    (item) => item.title === scheduleNode.title,
  )!

describe('CMS page 130 in the menus (spec 039 FR-019)', () => {
  it('points the top menu at the schedule route', () => {
    const item = buildNavSections(tree, 'az').all[0]!.children.find((child) => child.title === scheduleNode.title)!
    expect(item.href).toBe('/az/media/release-schedule')
  })

  it('points the left menu at the route and marks it current there', () => {
    const item = leftItem({ href: '/az/media/release-schedule' })
    expect(item.href).toBe('/az/media/release-schedule')
    expect(item.current).toBe(true)
  })

  it('is not current on another Media page', () => {
    expect(leftItem({ slug: 'media' }).current).toBe(false)
  })

  it('also follows an editor-set navUrl', () => {
    const withNavUrl = [{ ...media, children: [{ ...scheduleNode, slug: 'yeni-slug', navUrl: '/media/release-schedule' }] }]
    const item = buildNavSections(withNavUrl, 'en').all[0]!.children[0]!
    expect(item.href).toBe('/en/media/release-schedule')
  })
})
