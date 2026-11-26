/**
 * Redaktor məzmununun önizləməsi.
 *
 * Spec 002 kənarlaşması D1 (template konstitusiyası Maddə X.1): göstərilən HTML
 * redaktorun öz məzmunudur (istifadəçinin hazırda redaktə etdiyi mətn) və
 * `sanitizeHtmlToFragment` (DOMPurify) ilə sanitizasiya olunur.
 * The sanitized nodes are inserted directly — no `innerHTML` /
 * `dangerouslySetInnerHTML` sink, so the tree is never re-parsed (no mXSS).
 * Alternativ (iframe `srcdoc` sandbox) nginx `frame-ancestors` qaydaları ilə
 * toqquşur və redaktor stillərini paylaşa bilmir.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@cbar/lib-react-ui-kit/dialog'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { getRuntimeConfig } from '@/shared/config/runtime-config'
import { sanitizeHtmlToFragment } from '@/shared/lib/sanitize-html'
import { resolvePreviewMedia } from '../model/preview-media'

export interface PreviewDialogProps {
  open: boolean
  html: string
  onClose: () => void
}

export function PreviewDialog({ open, html, onClose }: PreviewDialogProps) {
  const { t } = useTranslation('richText')
  // Callback ref: the dialog content mounts only while open, and a new `html`
  // yields a new ref, so React re-runs it with the same container.
  const renderPreview = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container) return
      const fragment = sanitizeHtmlToFragment(html)
      resolvePreviewMedia(fragment, getRuntimeConfig().urls.mediaBaseUrl)
      container.replaceChildren(fragment)
    },
    [html],
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('previewDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('previewDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div
          ref={renderPreview}
          className="rte-preview max-h-[70vh] overflow-y-auto"
        />
      </DialogContent>
    </Dialog>
  )
}
