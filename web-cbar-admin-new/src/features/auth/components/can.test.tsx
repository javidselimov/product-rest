import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { adminUser } from '@/shared/testing/factories'
import { useAuthStore } from '../model/auth-store'
import { Can } from './can'

describe('<Can>', () => {
  afterEach(() => {
    useAuthStore.getState().logout()
  })

  it('icazə olanda uşaqları göstərir', () => {
    useAuthStore.setState({ isAuthenticated: true, user: adminUser })
    render(<Can permission="users.manage">gizli düymə</Can>)
    expect(screen.getByText('gizli düymə')).toBeInTheDocument()
  })

  it('icazə olmayanda fallback göstərir', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { ...adminUser, permissions: ['content.manage'] },
    })
    render(
      <Can permission="users.manage" fallback={<span>icazə yoxdur</span>}>
        gizli düymə
      </Can>,
    )
    expect(screen.queryByText('gizli düymə')).not.toBeInTheDocument()
    expect(screen.getByText('icazə yoxdur')).toBeInTheDocument()
  })

  it('user olmayanda heç nə render etmir', () => {
    render(<Can permission="users.manage">gizli düymə</Can>)
    expect(screen.queryByText('gizli düymə')).not.toBeInTheDocument()
  })
})
