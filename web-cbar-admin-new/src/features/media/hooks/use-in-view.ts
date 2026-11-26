/**
 * Element görünüş sahəsinə (üstəgəl `rootMargin`) bir dəfə girəndə `true` olur və
 * elə qalır — önizləmə yalnız görünəndə endirilir (spec 010, research R5).
 * IntersectionObserver olmayan mühitdə element dərhal görünən sayılır.
 */

import { useCallback, useEffect, useState } from 'react'

export function useInView<T extends Element>(rootMargin = '200px') {
  const [element, setElement] = useState<T | null>(null)
  const [seen, setSeen] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  const ref = useCallback((node: T | null) => setElement(node), [])

  useEffect(() => {
    if (seen || !element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, rootMargin, seen])

  return [ref, seen] as const
}
