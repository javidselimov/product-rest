/**
 * CSR page body (spec 038, Figma `1801:60657`): intro, file row, section title and project cards,
 * 32 apart. One block, because the gap between `AboutBlocks` blocks is 32/36.
 *
 * A dialog needs JS and the projects have no address of their own, so the full texts are repeated
 * in `noscript`.
 */
import type { CsrProjectsBlock } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { AboutFileRow } from '@/widgets/attachments/attachments'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { CsrProjectCard } from './csr-project-card'

export function CsrProjects({ block, locale }: Readonly<{ block: CsrProjectsBlock; locale: Locale }>) {
  const t = getT(locale, 'media')

  return (
    <div data-slot="csr-projects" className="flex flex-col gap-8">
      <CmsContent html={block.introHtml} variant="csr" />
      {block.files.map((file) => (
        <AboutFileRow key={file.id} file={file} inlineMeta />
      ))}
      {block.projects.length > 0 ? (
        <>
          <h2 className="text-foreground text-xl leading-[26px] font-semibold tab:leading-7">{t('csr.projectsTitle')}</h2>
          <ul className="grid grid-cols-1 gap-4 tab:grid-cols-2 desk:gap-6">
            {block.projects.map((project) => (
              <li key={project.id}>
                <CsrProjectCard project={project} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <noscript>
        {block.projects.map((project) => (
          <section key={project.id}>
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <CmsContent html={project.html} variant="csr" />
          </section>
        ))}
      </noscript>
    </div>
  )
}
