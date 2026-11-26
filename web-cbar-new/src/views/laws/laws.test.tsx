import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { renderApp, screen } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'
import { LawView } from '@/views/law'
import { loadLaw } from '@/views/law/loader'

import { LawsView } from './index'
import { loadLaws } from './loader'

describe('loadLaws', () => {
  it('filtrləri normallaşdırır və kateqoriyaları oxuyur', async () => {
    const data = await loadLaws('az', { categoryId: '2', type: '1', page: '1' })

    expect(data.categoryId).toBe(2)
    expect(data.type).toBe('1')
    expect(data.categories).toHaveLength(2)
    expect(data.items?.every((i) => i.badge === 'Valyuta tənzimi')).toBe(true)
  })

  it('siyahı xətasında kateqoriyalar yenə də gəlir', async () => {
    server.use(http.get(`${API}/api/v1/laws`, () => new HttpResponse(null, { status: 500 })))

    const data = await loadLaws('az', {})

    expect(data.error).toBe(true)
    expect(data.categories).toHaveLength(2)
  })
})

describe('LawsView', () => {
  it('GET filtr forması, seçilmiş dəyərlər və səhifələmə filtrləri qoruyur', async () => {
    const data = await loadLaws('az', { categoryId: '1', type: '2' })
    renderApp(<LawsView data={data} />, { locale: 'az' })

    const form = screen.getByRole('form', { name: 'Filtr' })
    expect(form).toHaveAttribute('action', '/az/laws')
    expect(form).toHaveAttribute('method', 'get')
    expect(screen.getByRole('combobox', { name: 'Kateqoriya' })).toHaveValue('1')
    expect(screen.getByRole('combobox', { name: 'Növ' })).toHaveValue('2')
    expect(screen.getByRole('option', { name: 'Normativ akt' })).toHaveValue('2')
    expect(screen.getByRole('link', { name: /Qiymətli kağızlar/ })).toHaveAttribute('href', '/az/securities')
  })

  it('səhifələmə keçidləri filtr parametrlərini saxlayır', async () => {
    const data = await loadLaws('en', { categoryId: '1', page: '1' })
    renderApp(<LawsView data={{ ...data, total: 30, pageSize: 10 }} />, { locale: 'en' })

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/en/laws?categoryId=1&page=2')
  })
})

describe('qanun detalı', () => {
  it('loader və view', async () => {
    const data = await loadLaw('az', 'merkezi-bank-haqqinda')
    renderApp(<LawView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mərkəzi Bank haqqında Qanun')
    expect(screen.getByText('Bank qanunvericiliyi')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /qanun\.pdf/ })).toHaveAttribute('href', `/media/811`)
    expect(screen.getByRole('link', { name: 'Qanunvericiliyə qayıt' })).toHaveAttribute('href', '/az/laws')
    await expect(loadLaw('az', 'yoxdur')).resolves.toBeNull()
  })
})
