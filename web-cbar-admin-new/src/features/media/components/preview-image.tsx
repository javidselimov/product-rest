import { useBlobImageRef } from '../hooks/use-media-preview'

interface PreviewImageProps {
  blob: Blob
  alt: string
  className?: string
}

/**
 * Blob-u `<img>` kimi göstərir — SVG də yalnız `<img>`-dədir, inline DOM-a düşmür
 * (FR-014: skript icra olunmur).
 */
export function PreviewImage({ blob, alt, className }: PreviewImageProps) {
  const ref = useBlobImageRef(blob)
  return <img ref={ref} alt={alt} className={className} />
}
