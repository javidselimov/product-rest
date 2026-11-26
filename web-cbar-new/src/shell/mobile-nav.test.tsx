import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { hideInSideNav } from '@/shared/testing/factories'
import { pageTreeAz } from '@/shared/testing/fixtures/pages'
import { renderApp, screen } from '@/shared/testing/render'

import { MobileNav } from './mobile-nav'
import { buildNavSections } from './nav'

describe('MobileNav', () => {
  it('düymə ilə çekmecə açılır və tam ağac göstərilir', async () => {
    const user = userEvent.setup()
    const { all } = buildNavSections(pageTreeAz, 'az')

    renderApp(<MobileNav locale="az" sections={all} />, { locale: 'az' })

    await user.click(screen.getByRole('button', { name: 'Menyunu aç' }))

    const nav = await screen.findByRole('navigation', { name: 'Mobil menyu' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ana səhifə' })).toHaveAttribute('href', '/az')

    // Bütün bölmələr (overflow daxil) çekmecədədir.
    expect(screen.getByRole('link', { name: 'E-xidmətlər' })).toHaveAttribute('href', 'https://www.e-cbar.az/')
    // "Menyularda yox" qeyd olunmuş kök yalnız geniş hamburger panelindən çıxır, çekmecədə qalır (spec 056 FR-010).
    expect(screen.getByRole('link', { name: 'İstinadlar' })).toHaveAttribute('href', '/az/istinadlar')

    // Accordion açılanda alt səviyyələr görünür.
    await user.click(screen.getByRole('button', { name: 'Haqqımızda' }))
    expect(await screen.findByRole('link', { name: 'Sədrlər' })).toBeInTheDocument()
  })

  it('Media çekmecədə qalır — üst zolaq mobil ekranda yoxdur (spec 042)', async () => {
    const user = userEvent.setup()
    const { all } = buildNavSections(pageTreeAz, 'az')

    renderApp(<MobileNav locale="az" sections={all} />, { locale: 'az' })
    await user.click(screen.getByRole('button', { name: 'Menyunu aç' }))
    await user.click(await screen.findByRole('button', { name: 'Media' }))

    expect(await screen.findByRole('link', { name: 'Fotoqalereya' })).toHaveAttribute('href', '/az/media/galleries')
  })

  it('sol menyuda gizli səhifə çekmecədə də yoxdur (spec 048)', async () => {
    const user = userEvent.setup()
    const { all } = buildNavSections(hideInSideNav(pageTreeAz, [51]), 'az')

    renderApp(<MobileNav locale="az" sections={all} />, { locale: 'az' })
    await user.click(screen.getByRole('button', { name: 'Menyunu aç' }))
    await user.click(await screen.findByRole('button', { name: 'Media' }))

    expect(await screen.findByRole('link', { name: 'Fotoqalereya' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Press relizlər' })).toBeNull()
  })

  it('bağlama düyməsi kit kataloqundan az dilindədir', async () => {
    const user = userEvent.setup()
    const { all } = buildNavSections(pageTreeAz, 'az')

    renderApp(<MobileNav locale="az" sections={all} />, { locale: 'az' })
    await user.click(screen.getByRole('button', { name: 'Menyunu aç' }))

    expect(await screen.findByRole('button', { name: 'Bağla' })).toBeInTheDocument()
  })

  it('çekmecədə axtarış slotu, qaynar xətt və E-CBAR var', async () => {
    const user = userEvent.setup()
    const { all } = buildNavSections(pageTreeAz, 'az')

    renderApp(
      <MobileNav locale="az" sections={all}>
        <form role="search" aria-label="Saytda axtarış" />
      </MobileNav>,
      { locale: 'az' },
    )
    await user.click(screen.getByRole('button', { name: 'Menyunu aç' }))

    expect(await screen.findByRole('search', { name: 'Saytda axtarış' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Qaynar xətt/ })).toHaveAttribute('href', 'tel:966')
    expect(screen.getByRole('link', { name: 'E-CBAR' })).toHaveAttribute('href', 'https://www.e-cbar.az/')
  })
})
