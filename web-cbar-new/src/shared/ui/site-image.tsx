'use client'

/**
 * Content image (spec 036, contracts/ui-contract.md §1): `next/image` with a loading state.
 *
 * A `fill` image shows a pulsing block in the parent's box until it arrives, then fades in; an
 * image that fails leaves the parent's empty box instead of a broken-image icon. Hiding is done in
 * `globals.css` only under `@media (scripting: enabled)`, with a timed reveal, so the image still
 * shows without JS or after a failed hydration.
 *
 * `next/image` reports an image that finished before hydration through its ref, so a cached image
 * does not get stuck. The block is a `span`, not the kit `Skeleton` (a `div`): these images sit in
 * `button` and `span` parents.
 */
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

type LoadState = 'loading' | 'loaded' | 'error'

type SiteImageProps = Omit<ImageProps, 'src' | 'onLoad' | 'onError'> & {
  src: string
  /** Pulse while loading. `false` on a parent with its own background, such as the hero. */
  skeleton?: boolean
}

export function SiteImage({ src, alt, fill, skeleton = true, ...props }: SiteImageProps) {
  const [result, setResult] = useState<{ src: string; state: LoadState } | null>(null)
  // Compared at render: a new `src` is loading again without an effect, on the same `img` node.
  const state = result?.src === src ? result.state : 'loading'

  return (
    <>
      {fill && skeleton && state === 'loading' ? (
        <span data-slot="skeleton" aria-hidden="true" className="bg-accent absolute inset-0 block animate-pulse" />
      ) : null}
      <Image
        {...props}
        src={src}
        alt={alt}
        fill={fill}
        data-slot="site-image"
        data-state={state}
        onLoad={() => setResult({ src, state: 'loaded' })}
        onError={() => setResult({ src, state: 'error' })}
      />
    </>
  )
}
