import type { NextConfig } from 'next'

import { STRATEGY_SLUG } from './src/entities/page-node/lib/tree'
import { securityHeaders } from './src/shared/config/security-headers'

/**
 * Fallback CSP üçün API origin-i — build zamanı hesablanır, ona görə burada
 * `src/server/env.ts` deyil, `process.env` birbaşa oxunur (env modulu boot-da
 * yoxlanır və deploy dəyərləri ilə işləyir). Səhifə cavablarında proxy runtime
 * dəyərini istifadə edir; bu fallback yalnız statik/API cavablarına aiddir.
 */
function buildTimeApiOrigin(): string | undefined {
  try {
    return new URL(process.env.API_URL ?? 'http://localhost:5139').origin
  } catch {
    return undefined
  }
}

const nextConfig: NextConfig = {
  // `.next/standalone` çıxarır — konteyner image-i onu birbaşa işə salır və
  // runtime-da `node_modules` quraşdırmır. Bax: Dockerfile.
  output: 'standalone',

  /**
   * Şəkil optimizasiyası (spec 003 FR-009, D1).
   *
   * `remotePatterns` **qəsdən yoxdur**: CMS şəkilləri `src/app/media/[id]/route.ts`
   * proxy-sindən keçir, yəni optimizer üçün same-origin yoldur və defolt
   * `localPatterns` onları onsuz da qəbul edir. Bu, `remotePatterns`-in build
   * zamanı image-ə bişirilməsi ilə `API_URL`-in runtime dəyişəni olması arasındaki
   * ziddiyyəti həll edir (bir image üç mühitə promote olunur — Maddə VIII, FR-026).
   *
   * AVIF WebP-dən əvvəldir: kodlaşdırma bir qədər bahalıdır, amma nəticə
   * optimizer keşində saxlanılır, ona görə xərc bir dəfəlikdir.
   */
  images: {
    formats: ['image/avif', 'image/webp'],
    // CMS şəkilləri redaktə olunanda yeni `media_id` alır, ona görə variant keşini
    // qısa saxlamağın mənası yoxdur — 30 gün.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  /**
   * Müdafiə başlıqları tətbiq səviyyəsində verilir — reverse proxy-nin
   * mövcudluğuna güvənilmir (konstitusiya Maddə X.6).
   *
   * Səhifə sorğularında CSP-ni `src/proxy.ts` nonce-lu variantı ilə **əvəz edir**;
   * buradakı dəyər API və statik cavablar üçün fallback-dır.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders({
          apiOrigin: buildTimeApiOrigin(),
          frameSources: (process.env.CSP_FRAME_SRC ?? '').split(/\s+/).filter(Boolean),
        }),
      },
    ]
  },

  /**
   * The legacy site's strategy PDFs lay at its root (spec 057 US4). A path with a dot never reaches `src/proxy.ts`
   * (its matcher leaves files out), so these two legacy addresses are redirected here, to the page that now links the
   * files from the media library. Permanent: 308, like the proxy's legacy map.
   */
  async redirects() {
    return [
      { source: '/2024_2026_Azerbaijani.pdf', destination: `/az/${STRATEGY_SLUG.az}`, permanent: true },
      { source: '/2024_2026_English.pdf', destination: `/en/${STRATEGY_SLUG.en}`, permanent: true },
    ]
  },
}

export default nextConfig
