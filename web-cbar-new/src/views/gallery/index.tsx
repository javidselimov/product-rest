/**
 * Photo gallery detail (spec 035, Figma `1646:31123`; tablet `1660:27731`, mobile `1660:28311`):
 * H1 = gallery title, then the news photo gallery (large photo + thumbnail strip). No date and
 * no pagination — every image of the gallery is in the strip.
 */
import { getT } from '@/shared/i18n/server'
import { EmptyState } from '@/shared/ui/empty-state'
import { PhotoGallery } from '@/widgets/photo-gallery'
import { SectionShell } from '@/widgets/section-shell'

import type { GalleryViewData } from './loader'

export function GalleryView({ data }: Readonly<{ data: GalleryViewData }>) {
  const t = getT(data.locale, 'media')
  const content = getT(data.locale, 'content')

  return (
    <SectionShell shell={data.shell} title={data.title}>
      <section data-slot="gallery">
        {data.images.length === 0 ? (
          <EmptyState title={t('noImages')} />
        ) : (
          <PhotoGallery
            images={data.images}
            labels={{
              label: content('newsList.gallery.label'),
              prev: content('newsList.gallery.prev'),
              next: content('newsList.gallery.next'),
              // The client fills these placeholders, so they are passed through as literals.
              position: content('newsList.gallery.position', { current: '{{current}}', total: '{{total}}' }),
              thumb: content('newsList.gallery.thumb', { n: '{{n}}' }),
              open: content('newsList.gallery.open'),
            }}
          />
        )}
      </section>
    </SectionShell>
  )
}
