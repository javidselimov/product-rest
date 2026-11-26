import { TooltipProvider } from '@cbar/lib-react-ui-kit/tooltip'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { RichTextEditor } from './rich-text-editor'

// Media seçici bu feature-in testinə aid deyil — yalnız modul sərhədi stub-lanır.
vi.mock('@/features/media/components/media-picker-dialog', () => ({
  MediaPickerDialog: () => null,
}))

// jsdom-da olmayan Range ölçmə API-ləri — ProseMirror kursor/scroll üçün çağırır.
beforeAll(async () => {
  // Redaktor şəkil ünvanları üçün `urls.mediaBaseUrl`-i oxuyur (bootstrap-dakı kimi).
  await loadRuntimeConfig()
  const emptyRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect
  if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = () => [] as unknown as DOMRectList
  }
  if (!Range.prototype.getBoundingClientRect) {
    Range.prototype.getBoundingClientRect = () => emptyRect
  }
  if (!document.createRange) {
    document.createRange = () => new Range()
  }
  if (!document.elementFromPoint) {
    document.elementFromPoint = () => null
  }
})

function renderEditor(
  props: Partial<React.ComponentProps<typeof RichTextEditor>> = {},
) {
  const changes: string[] = []
  render(
    <TooltipProvider>
      <RichTextEditor
        value="<p>salam</p>"
        onChange={(html) => changes.push(html)}
        {...props}
      />
    </TooltipProvider>,
  )
  return { changes }
}

describe('<RichTextEditor>', () => {
  it('ilkin məzmunu göstərir', () => {
    renderEditor()
    expect(screen.getByText('salam')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Qalın' })).toBeInTheDocument()
  })

  it('daxil edilən mətni HTML olaraq onChange-ə ötürür', async () => {
    const user = userEvent.setup()
    const { changes } = renderEditor()
    const surface = document.querySelector('[contenteditable="true"]')
    expect(surface).not.toBeNull()
    // jsdom-da user-event contenteditable kursorunu yerləşdirə bilmir (ilk uşaq
    // mətn deyil, <p>-dir) — mətn ProseMirror-un paste kanalı ilə daxil edilir.
    await act(async () => {
      ;(surface as HTMLElement).focus()
    })
    await user.paste('dünya')
    expect(changes.length).toBeGreaterThan(0)
    expect(changes.at(-1)).toContain('dünya')
    expect(changes.at(-1)).toContain('<p>')
  })

  it('mənbə rejimində HTML-i textarea-da göstərir', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.click(screen.getByRole('button', { name: 'HTML mənbəyi' }))
    const textarea = screen.getByRole('textbox', {
      name: 'HTML mənbə redaktoru',
    })
    expect(textarea).toHaveValue('<p>salam</p>')
    // Mənbə rejimində redaktə düymələri gizlənir, önizləmə qalır.
    expect(
      screen.queryByRole('button', { name: 'Qalın' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Önizləmə' })).toBeInTheDocument()
  })

  it('mənbə rejimindən çıxanda redaktə olunmuş HTML-i qaytarır', async () => {
    const user = userEvent.setup()
    const { changes } = renderEditor()
    await user.click(screen.getByRole('button', { name: 'HTML mənbəyi' }))
    const textarea = screen.getByRole('textbox', {
      name: 'HTML mənbə redaktoru',
    })
    await user.clear(textarea)
    await user.paste('<h2>Başlıq</h2>')
    await user.click(screen.getByRole('button', { name: 'HTML mənbəyi' }))
    // StarterKit `trailingNode` başlıqdan sonra boş <p> əlavə edir (köhnə paneldə də belədir).
    expect(changes.at(-1)).toContain('<h2>Başlıq</h2>')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Başlıq',
    )
  })

  it('önizləmə mənbə HTML-ini sanitizasiya edib göstərir', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.click(screen.getByRole('button', { name: 'HTML mənbəyi' }))
    const textarea = screen.getByRole('textbox', {
      name: 'HTML mənbə redaktoru',
    })
    await user.clear(textarea)
    await user.paste(
      '<p>Mətn</p><img src="/media/4" alt="şəkil" onerror="alert(1)"><script>alert(2)</script>',
    )
    await user.click(screen.getByRole('button', { name: 'Önizləmə' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Mətn')
    const image = within(dialog).getByRole('img', { name: 'şəkil' })
    expect(image).not.toHaveAttribute('onerror')
    expect(dialog.querySelector('script')).toBeNull()
  })

  it('editable=false olanda alət paneli yalnız önizləmə göstərir', () => {
    renderEditor({ editable: false })
    expect(
      screen.queryByRole('button', { name: 'Qalın' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'HTML mənbəyi' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Önizləmə' })).toBeInTheDocument()
    expect(document.querySelector('[contenteditable="true"]')).toBeNull()
  })
})
