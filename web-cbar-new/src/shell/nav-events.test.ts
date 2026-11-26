import { describe, expect, it } from 'vitest'

import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { buildSectionShell } from '@/widgets/section-shell'

import { buildNavSections } from './nav'

const cop29 = { id: 209, title: 'COP29', slug: 'cop29', navUrl: null, children: [] }
const eventsNode = { id: 84, title: 'Tədbirlər', slug: 'tedbirler', navUrl: null, children: [cop29] }
const media = mediaTreeAz[0]!
const tree = [{ ...media, children: media.children.map((node) => (node.slug === eventsNode.slug ? eventsNode : node)) }]

const sidebar = (current: { slug?: string; href?: string }) =>
  buildSectionShell({ section: 'media', tree, locale: 'az', current, pageUrl: 'https://x', pageTitle: 'x' })

const eventsItem = (current: { slug?: string; href?: string }) => sidebar(current).nav.find((item) => item.title === 'Tədbirlər')!

describe('The legacy events subtree in the menus (spec 034 FR-030)', () => {
  it('points the top menu at the list and leaves the old pages out', () => {
    const section = buildNavSections(tree, 'az').all[0]!.children.find((item) => item.title === 'Tədbirlər')!

    expect(section.href).toBe('/az/media/events')
    expect(section.children).toEqual([])
  })

  it('leaves the old pages out of the left menu on the list', () => {
    const item = eventsItem({ href: '/az/media/events' })

    expect(item.href).toBe('/az/media/events')
    expect(item.current).toBe(true)
    expect(item.children).toEqual([])
  })

  it('keeps them out on the other Media pages', () => {
    expect(eventsItem({ slug: 'media' }).children).toEqual([])
  })

  it('keeps the left menu and breadcrumb of an old page', () => {
    const shell = sidebar({ slug: 'cop29' })

    expect(eventsItem({ slug: 'cop29' }).children.map((item) => item.title)).toEqual(['COP29'])
    expect(shell.crumbs.map((crumb) => crumb.label)).toEqual(['Ana səhifə', 'Media', 'Tədbirlər', 'COP29'])
    expect(shell.crumbs[2]!.href).toBe('/az/media/events')
  })
})
