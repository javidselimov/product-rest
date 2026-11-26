/**
 * Gallery lists — photo and video galleries (spec 035, spec 032).
 */

/** 3 × 3 card grid per page (Figma `1643:29161`). */
export const GALLERY_PAGE_SIZE = 9

export const GALLERY_KINDS = ['photos', 'videos'] as const
export type GalleryKind = (typeof GALLERY_KINDS)[number]

/** Path of each list under `/{locale}`; the CMS `navUrl` of the menu items matches it. */
export const GALLERY_LIST_PATH = {
  photos: 'media/galleries',
  videos: 'media/videos',
} as const satisfies Record<GalleryKind, string>

/** `media.json` key of the tab label — also the page title in metadata. */
export const GALLERY_TAB_LABEL_KEY = {
  photos: 'gallery.photos',
  videos: 'gallery.videos',
} as const satisfies Record<GalleryKind, string>

/** `media.json` key of the empty state of an unfiltered list. */
export const GALLERY_EMPTY_KEY = {
  photos: 'noGalleries',
  videos: 'noVideos',
} as const satisfies Record<GalleryKind, string>
