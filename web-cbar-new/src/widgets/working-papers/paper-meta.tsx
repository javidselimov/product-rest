/**
 * The working paper page's blocks under the title (spec 054 FR-010, ui-contract §4; Figma `2703:6295`, tablet `2743:8111`,
 * mobile `2743:8913`): the four-field meta box, the abstract, the keywords and the JEL codes. Keywords and JEL are one
 * comma-separated line each: the chip layers of the frame are hidden (plan decision 2026-11-20). A block without content
 * is left out with its heading.
 */
import type { WorkingPaperDetailDto } from '@/features/working-papers/model/schemas'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'

type Props = Readonly<{ paper: WorkingPaperDetailDto; locale: Locale }>

const LINE_BREAK = /\r?\n+/

function Section({ id, title, children }: Readonly<{ id: string; title: string; children: React.ReactNode }>) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-foreground text-xl leading-7 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function PaperMeta({ paper, locale }: Props) {
  const t = getT(locale, 'workingPapers')
  const fields: [string, string][] = [
    [t('meta.authors'), paper.authors.join(', ')],
    [t('meta.number'), paper.code],
    [t('meta.language'), t(`language.${paper.language}`)],
    [t('meta.date'), String(paper.year)],
  ]
  const paragraphs = (paper.abstract ?? '').split(LINE_BREAK).map((p) => p.trim()).filter(Boolean)

  return (
    <>
      <dl data-slot="paper-meta" className="bg-site-meta grid grid-cols-[1.76fr_1fr_1fr_1fr] rounded-xs max-desk:grid-cols-[1.7fr_1fr_1fr_1fr] max-tab:grid-cols-1">
        {fields.map(([label, value], index) => (
          <div
            key={label}
            className={`flex flex-col gap-1 px-6 py-5 max-desk:px-5 max-tab:px-4 max-tab:py-3.5 ${index > 0 ? 'border-site-file-border max-desk:border-site-divider border-l max-tab:border-t max-tab:border-l-0' : ''}`}
          >
            <dt className="text-muted-foreground text-sm font-semibold">{label}</dt>
            <dd className="text-foreground text-base leading-7 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {paragraphs.length > 0 ? (
        <section aria-labelledby="paper-abstract" className="flex flex-col gap-4">
          <h2 id="paper-abstract" className="text-foreground text-xl leading-7 font-semibold">
            {t('abstract')}
          </h2>
          {paragraphs.map((text, i) => (
            <p key={i} className="text-foreground text-base leading-7">
              {text}
            </p>
          ))}
        </section>
      ) : null}
      {paper.keywords.length > 0 ? (
        <Section id="paper-keywords" title={t('keywords')}>
          <p className="text-foreground text-base leading-[26px] tab:leading-7">{paper.keywords.join(', ')}</p>
        </Section>
      ) : null}
      {paper.jelCodes.length > 0 ? (
        <Section id="paper-jel" title={t('jel')}>
          <p className="text-foreground text-base leading-[26px] tab:leading-7">{paper.jelCodes.join(', ')}</p>
        </Section>
      ) : null}
    </>
  )
}
