/**
 * Press photos of a staff member, Figma `2037:4289` ("Mətbuat üçün fotoşəkillər"):
 * title 24/600 plus an outline button on the right "↓ Hamısını yüklə (ZIP, 21,9 MB)" (p10/16, r4, brand border),
 * below 3 columns (tablet 2, mobile 1) of card `2037:4298`: 314×373, border neutral-200, r4,
 * photo 314×283 (cover), details p16 gap6: meta 12/400 grey, "↓ Yüklə" button (p8/12, r4,
 * secondary-50 background, 13/600). Every link is same-origin `/media/…` with a `download` attribute.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { ArrowDownIcon } from '@cbar/lib-react-ui-kit/icons'

import { SiteImage } from '@/shared/ui/site-image'

export type StaffPhotoCardData = {
  mediaId: number
  /** Same-origin `/media/{id}`, both the preview and the download address. */
  url: string
  fileName: string
  /** "JPG · 4000×6000 px · 8,2 MB" (features/organization/model/photos). */
  meta: string
}

type StaffPhotosProps = Readonly<{
  title: string
  photos: StaffPhotoCardData[]
  zip: { href: string; label: string } | null
  downloadLabel: string
  downloadAria: (fileName: string) => string
  photoAlt: (fileName: string) => string
}>

export function StaffPhotos({ title, photos, zip, downloadLabel, downloadAria, photoAlt }: StaffPhotosProps) {
  return (
    <section data-slot="staff-photos" className="flex flex-col gap-5" aria-labelledby="staff-photos-title">
      <div className="flex flex-col gap-4 tab:flex-row tab:items-center tab:justify-between">
        <h2 id="staff-photos-title" className="text-foreground text-2xl leading-[31px] font-semibold">
          {title}
        </h2>
        {zip ? (
          <Button asChild variant="outline" colorPalette="primary" className="w-fit">
            <a href={zip.href} download>
              <ArrowDownIcon aria-hidden="true" className="size-4" />
              {zip.label}
            </a>
          </Button>
        ) : null}
      </div>
      <ul className="grid grid-cols-1 gap-5 tab:grid-cols-2 desk:grid-cols-3">
        {photos.map((photo) => (
          <li key={photo.mediaId} data-slot="staff-photo-card" className="border-border bg-background flex flex-col overflow-hidden rounded-xs border">
            <span className="bg-site-photo-placeholder relative block h-[283px]">
              <SiteImage src={photo.url} alt={photoAlt(photo.fileName)} fill sizes="(min-width: 46.5rem) 314px, 100vw" className="object-cover" />
            </span>
            <span className="flex flex-col items-start gap-1.5 p-4">
              {photo.meta ? <span className="text-muted-foreground text-xs leading-4">{photo.meta}</span> : null}
              <a
                href={photo.url}
                download={photo.fileName}
                aria-label={downloadAria(photo.fileName)}
                className="bg-site-on-brand-heading text-site-accent-strong inline-flex items-center gap-1.5 rounded-xs px-3 py-2 text-[13px] leading-[17px] font-semibold hover:underline"
              >
                <ArrowDownIcon aria-hidden="true" className="size-3.5" />
                {downloadLabel}
              </a>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
