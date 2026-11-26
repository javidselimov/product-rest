import { describe, expect, it } from 'vitest'

import { getPage, getPagesTree } from './pages.api'

describe('pages api', () => {
  it('ağacı locale ilə oxuyur və sxemə salır', async () => {
    const tree = await getPagesTree('az')

    expect(tree).toHaveLength(11)
    expect(tree[0].children[0].children[0].slug).toBe('sedrler')
  })

  it('en ağacı fərqlidir', async () => {
    const tree = await getPagesTree('en')

    expect(tree.map((n) => n.slug)).toContain('about-us')
  })

  it('səhifəni slug ilə oxuyur (kodlanmış slug daxil)', async () => {
    const page = await getPage('az', 'faiz-dəhlizi')

    expect(page?.slug).toBe('faiz-dəhlizi')
    expect(page?.assets).toHaveLength(4)
  })

  it('404 → null', async () => {
    await expect(getPage('az', 'yoxdur')).resolves.toBeNull()
  })
})
