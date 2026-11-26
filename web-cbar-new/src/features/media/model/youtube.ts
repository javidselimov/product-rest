/**
 * YouTube ünvanından video id-si (köhnə `media/page.tsx#youtubeVideoId`).
 */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\.|^m\./, '')
  let id: string | null = null

  if (host === 'youtu.be') {
    id = parsed.pathname.split('/')[1] ?? null
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parsed.pathname === '/watch') {
      id = parsed.searchParams.get('v')
    } else {
      id = /^\/(?:embed|shorts|live|v)\/([^/?]+)/.exec(parsed.pathname)?.[1] ?? null
    }
  }

  return id && /^[\w-]{6,}$/.test(id) ? id : null
}

/** Nocookie embed ünvanı — CSP `frame-src` ilə uyğun. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}
