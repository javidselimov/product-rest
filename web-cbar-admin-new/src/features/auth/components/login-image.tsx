import { useState } from 'react'

import avif720 from '../assets/login-bg-720.avif'
import avif1243 from '../assets/login-bg-1243.avif'
import webp720 from '../assets/login-bg-720.webp'
import webp1243 from '../assets/login-bg-1243.webp'

// Orijinal PNG 1.5 MB idi; AVIF 18/47 KB, WebP 28/76 KB (720/1243 px).
// Şəkil gələnə qədər 24 px-lik bulanıq önizləmə (142 bayt, inline) göstərilir,
// ona görə səhifə heç vaxt boş/ağ fonla açılmır.
const PLACEHOLDER =
  'data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAABwBACdASoYABMAPu1kqU2ppaOiMAgBMB2JQBhQA18OgVy36tUtTnUJ1OnqYADdiT8JnjwerzM2ocEw7ZGs39Cu7PO3xwsWJp/QMzZ4GnnfbRug1eON5iO7SCtLz/uJddr2k7bbobgsILm7C7KNrh79gIpzm+h090gAAA=='

// Səhifədə şəkil iki dəfə istifadə olunur (bulanıq fon + kartın sağ paneli).
// `sizes` hər ikisində eynidir ki, brauzer eyni faylı seçsin və bir dəfə yükləsin.
const SIZES = '100vw'

interface LoginImageProps {
  /** Konteyner — ölçü və mövqe çağıranın işidir. */
  className?: string
  /** `<img>`-ə əlavə klaslar (məs. `object-position`, `blur`). */
  imgClassName?: string
}

export function LoginImage({
  className = '',
  imgClassName = '',
}: Readonly<LoginImageProps>) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      aria-hidden
      className={`bg-muted overflow-hidden bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${PLACEHOLDER})` }}
    >
      <picture>
        <source
          type="image/avif"
          srcSet={`${avif720} 720w, ${avif1243} 1243w`}
          sizes={SIZES}
        />
        <source
          type="image/webp"
          srcSet={`${webp720} 720w, ${webp1243} 1243w`}
          sizes={SIZES}
        />
        <img
          src={webp1243}
          alt=""
          width={1243}
          height={976}
          decoding="async"
          fetchPriority="high"
          // Keşdən gələn şəkil onLoad-dan əvvəl hazır ola bilər — `complete` yoxlanır.
          ref={(img) => {
            if (img?.complete) setLoaded(true)
          }}
          onLoad={() => setLoaded(true)}
          className={`size-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      </picture>
    </div>
  )
}
