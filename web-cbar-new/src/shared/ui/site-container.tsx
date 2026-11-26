/**
 * Saytın kontent konteyneri — Figma-da 1320 en (spec 022, contracts/ui-contract.md §2).
 *
 * `<main>` konteynersizdir ki, ana səhifənin bölmələri tam enli ola bilsin; məzmun
 * səhifələri bunu `(content)` layout-undan, route vəziyyətləri (error/loading/not-found)
 * və ana səhifə bölmələri isə birbaşa alır.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import type { ReactNode } from 'react'

type SiteContainerProps = Readonly<{
  children: ReactNode
  /** Şaquli boşluq daxil olmaqla əlavə class-lar; default məzmun səhifəsinin `py-8`-idir. */
  className?: string
}>

export function SiteContainer({ children, className = 'py-8' }: SiteContainerProps) {
  return (
    // `desk:px-0`: 1360+ enində daxili en tam 1320 olur (header/footer kimi); daha dar ekranda 16px kənar.
    <div data-slot="site-container" className={cn('mx-auto w-full max-w-site px-4 desk:px-0', className)}>
      {children}
    </div>
  )
}
