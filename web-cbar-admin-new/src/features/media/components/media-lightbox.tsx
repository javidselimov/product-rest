/**
 * Böyüdülmüş önizləmə (spec 010 US3). Keşdəki eyni blob istifadə olunur — yeni
 * sorğu getmir. Bağlama: kit-in "×" düyməsi, Esc, fona klik. Fokus `DialogTrigger`-ə
 * qayıdır — ona görə trigger (önizləmə düyməsi) `children` kimi ötürülür.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@cbar/lib-react-ui-kit/dialog'
import type { ReactElement } from 'react'

import { PreviewImage } from './preview-image'

interface MediaLightboxProps {
  blob: Blob
  name: string
  /** Açan düymə (`type="button"` — forma daxilində submit etməsin). */
  children: ReactElement
}

export function MediaLightbox({ blob, name, children }: MediaLightboxProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="truncate pr-6" title={name}>
            {name}
          </DialogTitle>
        </DialogHeader>
        <PreviewImage
          blob={blob}
          alt={name}
          className="mx-auto max-h-[80vh] max-w-full object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
