/**
 * Press release detail in the Media section shell (spec 029 US3, contracts/ui-contract.md §3,
 * Figma `1298:19683`, `1298:18952`; announcements spec 031, Figma `1298:20343` — no cover, no gallery;
 * interviews and speeches spec 033, Figma `1308:29099` — text and a download, no date).
 * The breadcrumb replaces the old "back" link.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'

import { IMAGE_SIZES } from '@/shared/constants/layout'
import { getT } from '@/shared/i18n/server'
import { Attachments } from '@/widgets/attachments/attachments'
import { CmsContent } from '@/widgets/cms-content/cms-content'
import { PhotoGallery } from '@/widgets/photo-gallery'
import { SectionShell } from '@/widgets/section-shell'
import { SiteImage } from '@/shared/ui/site-image'

import type { PressReleaseViewData } from './loader'

/** Interview or speech (spec 033): only the text and its files. `first:mt-0` keeps a scanned item, which has no text, flush with the title. */
function DocumentBody({ data }: Readonly<{ data: PressReleaseViewData }>) {
  const t = getT(data.locale, 'content')

  return (
    <div data-slot="press-release" className="flex flex-col items-start">
      {data.hasText ? <CmsContent html={data.html} variant="about" /> : null}

      {data.pdf ? (
        <Button
          asChild
          variant="outline"
          colorPalette="black"
          data-print="hide"
          className="bg-background mt-15 h-14 w-78 rounded-xs border-(--ui-color-neutral-400) text-lg leading-7 font-medium first:mt-0"
        >
          <a data-slot="press-release-pdf" href={data.pdf.url} download={data.pdf.fileName}>
            {t('newsList.saveAsPdf')}
          </a>
        </Button>
      ) : null}

      {data.attachments.length > 0 ? (
        <div className="mt-15 w-full first:mt-0">
          <Attachments locale={data.locale} files={data.attachments} heading={t('attachments')} variant="about" imagesAsFiles />
        </div>
      ) : null}
    </div>
  )
}

export function PressReleaseView({ data }: Readonly<{ data: PressReleaseViewData }>) {
  const t = getT(data.locale, 'content')
  const isAnnouncement = data.layout === 'files'

  if (data.layout === 'document') {
    return (
      <SectionShell shell={data.shell} title={data.title}>
        <DocumentBody data={data} />
      </SectionShell>
    )
  }

  return (
    <SectionShell shell={data.shell} title={data.title}>
      <div data-slot="press-release" className="flex flex-col">
        {data.cover ? (
          <div data-slot="press-release-cover" className="bg-site-image-placeholder relative mb-8 aspect-[984/502] w-full overflow-hidden">
            <SiteImage src={data.cover.url} alt={data.cover.alt} fill priority sizes={IMAGE_SIZES.CONTENT_COLUMN} className="object-cover" />
          </div>
        ) : null}

        <time dateTime={data.dateTime} className="text-muted-foreground text-sm leading-7">
          {data.dateLabel}
        </time>
        <CmsContent html={data.html} variant="about" tables={isAnnouncement ? 'list' : undefined} className="mt-6" />

        {/* Announcements (spec 031) have no cover/gallery; their photos are plain file rows. */}
        <Attachments locale={data.locale} files={data.attachments} heading={t('attachments')} variant="about" imagesAsFiles={isAnnouncement} />

        {data.gallery.length > 0 ? (
          <div className="mt-9">
            <PhotoGallery
              images={data.gallery}
              labels={{
                label: t('newsList.gallery.label'),
                prev: t('newsList.gallery.prev'),
                next: t('newsList.gallery.next'),
                // The client fills these placeholders, so they are passed through as literals.
                position: t('newsList.gallery.position', { current: '{{current}}', total: '{{total}}' }),
                thumb: t('newsList.gallery.thumb', { n: '{{n}}' }),
                open: t('newsList.gallery.open'),
              }}
            />
          </div>
        ) : null}
      </div>
    </SectionShell>
  )
}
