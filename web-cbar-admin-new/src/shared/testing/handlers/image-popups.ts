/**
 * Şəkilli popup mock-ları — real kontrakt (specs/009-image-popup/contracts/admin-api.md):
 * `/image-popups` `{items}` envelope, sıra `id DESC`, siyahı detail ilə eyni
 * formadadır. API kimi `mediaName`-i media store-dan doldurur və `activatedAt`-i
 * yalnız yaratmada (aktivdirsə) və deaktiv → aktiv keçidində yeniləyir.
 */

import {
  imagePopupFixtures,
  type ImagePopupMockRow,
  type ImagePopupTranslationMock,
} from '../fixtures/image-popups'
import { createCrudStore } from './lib/crud-store'
import { mediaStore } from './media'

type TranslationBody = Partial<Omit<ImagePopupTranslationMock, 'mediaName'>>

/** API `Normalize` kimi: boş sətir → null. */
const blank = (value: string | null | undefined) =>
  value == null || value.trim() === '' ? null : value.trim()

const withMediaNames = (
  translations: Record<string, TranslationBody> | undefined,
): ImagePopupMockRow['translations'] =>
  Object.fromEntries(
    Object.entries(translations ?? {}).map(([locale, tr]) => [
      locale,
      {
        mediaId: tr.mediaId ?? null,
        mediaName:
          mediaStore.all().find((m) => m.id === tr.mediaId)?.originalName ??
          null,
        link: blank(tr.link),
        altText: blank(tr.altText),
      },
    ]),
  )

export const imagePopupsStore = createCrudStore<ImagePopupMockRow>({
  path: '/image-popups',
  envelope: 'items',
  seed: imagePopupFixtures,
  sort: (a, b) => b.id - a.id,
  applyBody: (body, existing, id) => {
    const now = new Date().toISOString()
    const isActive = body.isActive === true
    const activated = isActive && (existing === null || !existing.isActive)
    return {
      ...(existing ?? {}),
      id,
      title: String(body.title ?? ''),
      isActive,
      activatedAt: activated ? now : (existing?.activatedAt ?? null),
      translations: withMediaNames(
        body.translations as Record<string, TranslationBody> | undefined,
      ),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
  },
})

export const imagePopupsHandlers = imagePopupsStore.handlers
