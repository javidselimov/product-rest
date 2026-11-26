/**
 * Attachments: image strip plus a grouped accordion or flat list (spec 002 FR-015, data-model.md §2).
 *
 * Numeric groups descend (years), others keep their input order; ungrouped files
 * come last. With at least one group a kit `Accordion` (first group open), otherwise a flat list.
 * Server component: addresses are prepared in the loader with `mediaUrl`: a same-origin
 * `/media/{id}` path through the proxy route (spec 003 D1).
 */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@cbar/lib-react-ui-kit/accordion'

import { fileExtension, fileIcon, formatSize, isImageMime, type AttachmentFile } from '@/entities/content'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { SiteImage } from '@/shared/ui/site-image'

export function groupAttachments(files: AttachmentFile[]): { groups: [string, AttachmentFile[]][]; ungrouped: AttachmentFile[] } {
  const groups = new Map<string, AttachmentFile[]>()
  const ungrouped: AttachmentFile[] = []

  for (const file of files) {
    const group = file.group?.trim()
    if (!group) ungrouped.push(file)
    else groups.set(group, [...(groups.get(group) ?? []), file])
  }

  const keys = [...groups.keys()].sort((a, b) => {
    const na = Number(a)
    const nb = Number(b)
    return !Number.isNaN(na) && !Number.isNaN(nb) ? nb - na : 0
  })

  return { groups: keys.map((key) => [key, groups.get(key) ?? []]), ungrouped }
}

/**
 * About-us file row, Figma `pdf file` (`1000:12443`): height 72, white, border, p20, icon 32, name 16/600.
 * `inlineMeta`: type and size follow the name, Figma `1801:60662` (spec 038).
 */
export function AboutFileRow({ file, inlineMeta = false }: { file: AttachmentFile; inlineMeta?: boolean }) {
  const meta = [fileExtension(file.mimeType, file.title)?.toUpperCase(), formatSize(file.sizeBytes)].filter(Boolean).join(', ')

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-background border-site-divider hover:border-primary flex min-h-18 items-center gap-6 border p-5 transition-colors tab:gap-[50px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- statik yerli SVG ikon */}
      <img src={fileIcon(file.mimeType, file.title)} alt="" width={32} height={32} className="size-8 shrink-0" />
      {inlineMeta ? (
        <span className="text-site-text-strong min-w-0 text-base leading-6 font-semibold">
          {file.title} ({meta})
        </span>
      ) : (
        <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-foreground text-base leading-6 font-semibold">{file.title}</span>
          <span className="text-muted-foreground text-sm">{formatSize(file.sizeBytes)}</span>
        </span>
      )}
    </a>
  )
}

function FileCard({ file }: { file: AttachmentFile }) {
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="border-border bg-card hover:border-primary flex items-center gap-4 rounded-md border p-3 transition-colors"
    >
      {/* No `next/image`: a static local SVG is already small and vector. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- statik yerli SVG ikon */}
      <img src={fileIcon(file.mimeType, file.title)} alt="" width={40} height={40} className="w-10 shrink-0" />
      <span className="min-w-0">
        <span className="text-foreground block text-sm font-medium">{file.title}</span>
        <span className="text-muted-foreground block text-xs">{formatSize(file.sizeBytes)}</span>
      </span>
    </a>
  )
}

type AttachmentsProps = {
  locale: Locale
  files: AttachmentFile[]
  heading?: string
  /** `about`: About-us file rows without a visible title (spec 024 FR-018). */
  variant?: 'about'
  /**
   * List image files as plain downloadable rows instead of the thumbnail strip — announcements
   * (spec 031) show no photos at all.
   */
  imagesAsFiles?: boolean
}

export function Attachments({ locale, files, heading, variant, imagesAsFiles = false }: AttachmentsProps) {
  const t = getT(locale, 'content')
  const images = imagesAsFiles ? [] : files.filter((f) => isImageMime(f.mimeType))
  const documents = imagesAsFiles ? files : files.filter((f) => !isImageMime(f.mimeType))
  const { groups, ungrouped } = groupAttachments(documents)

  if (files.length === 0) return null

  if (variant === 'about' && groups.length === 0 && images.length === 0) {
    return (
      <section data-slot="attachments" aria-label={heading ?? t('documents')}>
        <h2 className="sr-only">{heading ?? t('documents')}</h2>
        <ul className="flex flex-col gap-5">
          {documents.map((file) => (
            <li key={file.id}>
              <AboutFileRow file={file} />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <div data-slot="attachments">
      {images.length > 0 ? (
        <ul aria-label={t('images')} className="mt-8 flex flex-wrap gap-3">
          {images.map((image) => (
            <li key={image.id}>
              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border bg-card block rounded-md border p-1 transition-shadow hover:shadow-md"
              >
                {/* Fixed height, intrinsic width: the `h-32 w-auto` pair also satisfies
                    Next's aspect ratio warning. */}
                <SiteImage
                  src={image.url}
                  alt={image.title}
                  width={256}
                  height={128}
                  sizes="256px"
                  className="h-32 w-auto object-contain"
                />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {documents.length > 0 ? (
        <section className="mt-10" aria-label={heading ?? t('documents')}>
          <h2 className="text-foreground mb-4 text-lg font-semibold">{heading ?? t('documents')}</h2>

          {groups.length > 0 ? (
            <Accordion type="multiple" variant="card" defaultValue={[groups[0][0]]}>
              {groups.map(([group, items]) => (
                <AccordionItem key={group} value={group}>
                  <AccordionTrigger>
                    <span className="flex w-full items-center justify-between gap-3 pr-2">
                      <span>{group}</span>
                      <span className="text-muted-foreground text-xs font-normal">
                        {t('fileCount', { count: items.length })}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3">
                      {items.map((file) => (
                        <li key={file.id}>
                          <FileCard file={file} />
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : null}

          {ungrouped.length > 0 ? (
            <ul className={`space-y-3 ${groups.length > 0 ? 'mt-3' : ''}`}>
              {ungrouped.map((file) => (
                <li key={file.id}>
                  <FileCard file={file} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
