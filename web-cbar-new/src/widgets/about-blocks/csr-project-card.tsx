'use client'

/**
 * Project card and its dialog (spec 038, Figma `1801:4920`, `1801:5472`). Sizes are in
 * `specs/038-media-csr/contracts/ui-contract.md`.
 *
 * The title button stretches over the card through `::after`, so the whole card opens the dialog
 * while the button's name stays the title alone. The header sits outside the scrolling area, so
 * the close button stays in reach on a long project.
 */
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@cbar/lib-react-ui-kit/dialog'

import type { CsrProject } from '@/features/about-content/model/types'
import { IMAGE_SIZES } from '@/shared/constants/layout'
import { SiteImage } from '@/shared/ui/site-image'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { CsrProjectGallery } from './csr-project-gallery'

const DIALOG_CLASS = [
  'flex flex-col gap-0 overflow-hidden rounded-none rounded-t-2xl border-0 p-0',
  'top-auto bottom-0 left-0 w-full max-w-full max-h-[calc(100dvh-3.5rem)] translate-x-0 translate-y-0 sm:max-w-full',
  'tab:top-1/2 tab:bottom-auto tab:left-1/2 tab:-translate-x-1/2 tab:-translate-y-1/2 tab:rounded-xs',
  'tab:w-166 tab:max-w-[calc(100%-2.5rem)] tab:max-h-[min(56.25rem,calc(100dvh-2.5rem))] desk:w-220',
  '[&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5 tab:[&_[data-slot=dialog-close]]:top-8 tab:[&_[data-slot=dialog-close]]:right-10',
  '[&_[data-slot=dialog-close]]:bg-site-surface-muted [&_[data-slot=dialog-close]]:flex [&_[data-slot=dialog-close]]:size-10',
  '[&_[data-slot=dialog-close]]:items-center [&_[data-slot=dialog-close]]:justify-center [&_[data-slot=dialog-close]]:rounded-full',
  '[&_[data-slot=dialog-close]]:opacity-100 [&_[data-slot=dialog-close]_svg]:size-6!',
].join(' ')

/** Figma #00CBB6 at 14% with #007369 text; the nearest tokens are the kit teal at 15% and secondary-800. */
function Tag({ children }: Readonly<{ children: string }>) {
  return <span className="bg-site-accent/15 rounded-xs px-2.5 py-1 text-xs leading-4 tracking-[0.25px] text-(--ui-color-secondary-800)">{children}</span>
}

export function CsrProjectCard({ project }: Readonly<{ project: CsrProject }>) {
  return (
    <Dialog>
      <article
        data-slot="csr-project-card"
        className="border-site-divider bg-background relative flex h-full flex-col overflow-hidden rounded-xs border transition-colors hover:border-(--ui-color-neutral-400)"
      >
        <div className="bg-site-image-placeholder relative h-50 shrink-0">
          {project.cover ? <SiteImage src={project.cover.src} alt="" fill sizes={IMAGE_SIZES.HALF} className="object-cover" /> : null}
        </div>
        <div className="flex flex-col items-start gap-2.5 px-6 pt-5 pb-6">
          {project.category ? <Tag>{project.category}</Tag> : null}
          <h3 className="text-site-text-strong text-lg leading-6 font-semibold">
            <DialogTrigger className="focus-visible:after:outline-ring cursor-pointer text-left outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2">
              {project.cardTitle}
            </DialogTrigger>
          </h3>
          <p className="text-muted-foreground text-sm leading-7">{project.summary}</p>
        </div>
      </article>

      <DialogContent className={DIALOG_CLASS} aria-describedby={undefined} data-slot="csr-project-dialog">
        <div className="flex min-h-15 shrink-0 items-center px-5 pt-5 tab:min-h-18 tab:px-10 tab:pt-8">
          {project.category ? <Tag>{project.category}</Tag> : null}
        </div>
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pt-5 pb-8 tab:px-10 tab:pb-10">
          <DialogTitle className="text-site-text-strong text-xl leading-[26px] font-semibold tab:leading-7">{project.title}</DialogTitle>
          {project.gallery.length > 0 ? <CsrProjectGallery images={project.gallery} title={project.title} /> : null}
          <CmsContent html={project.html} variant="csr" className="text-site-text-strong" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
