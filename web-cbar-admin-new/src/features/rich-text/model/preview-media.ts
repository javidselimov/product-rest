import { resolveMediaSrc } from '@/entities/media/model/types'

/**
 * Önizləmə DOM-undakı nisbi `/media/{id}` şəkil ünvanlarını ictimai API kökü ilə
 * tamamlayır — redaktor DOM-u ilə eyni qayda (`MediaImage` node view). Yalnız
 * göstərmək üçündür, saxlanılan HTML dəyişmir.
 */
export function resolvePreviewMedia(root: ParentNode, mediaBaseUrl: string): void {
  if (!mediaBaseUrl) return
  for (const img of Array.from(root.querySelectorAll('img[src^="/media/"]'))) {
    img.setAttribute(
      'src',
      resolveMediaSrc(img.getAttribute('src') ?? '', mediaBaseUrl),
    )
  }
}
