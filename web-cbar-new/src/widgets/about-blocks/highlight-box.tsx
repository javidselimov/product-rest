/**
 * Vurğulanmış qutu — "Mərkəzi Bankın məqsədləri", Figma `1186:14894` (`#D6EAF4`, r4, p20).
 * İlk paraqraf Figma-da göy rəngdədir (əsas məqsəd), qalanı adi mətn.
 */
import { CmsContent } from '@/widgets/cms-content/cms-content'

type HighlightBoxProps = Readonly<{ title: string | null; html: string }>

export function HighlightBox({ title, html }: HighlightBoxProps) {
  return (
    <section data-slot="highlight-box" className="bg-site-on-accent-muted flex flex-col gap-5 rounded-xs p-5 tab:gap-6">
      {title ? <h2 className="text-primary text-xl leading-7 font-semibold">{title}</h2> : null}
      <CmsContent html={html} variant="about" className="[&>p:first-child]:text-primary" />
    </section>
  )
}
