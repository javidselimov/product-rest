/**
 * Press release attachments (research R9a, spec 030): the shared `AssetsSection` on
 * `/press-releases/{id}/assets`, reorderable. On the public site the first image is the
 * cover, the remaining images form the photo gallery and other files are listed as
 * documents — the badges tell the editor which is which. Announcements (`type` 2, spec 031)
 * show no photos on the site, so they get no badges and a different description; ordering
 * stays. In interviews and speeches (`type` 3, spec 033) the first image is the list card and
 * the first PDF of each language is the download button. Every type can set a file's language.
 * Every change refetches the detail (the sub-resource returns 204, the list only comes back
 * with the detail).
 */

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { LOCALES, type Locale } from '@/entities/content/model/types'
import {
  ASSET_LOCALE_ALL,
  attachedAssetSchema,
  isImageMime,
  type AttachedAsset,
} from '@/entities/media/model/types'
import { AssetsSection } from '@/features/assets/components/assets-section'
import type { AnyRow } from '@/shared/crud/types'
import { pressReleasesKeys } from '../api/press-releases.keys'
import { PRESS_RELEASE_TYPE } from '../model/constants'

const PDF_MIME = 'application/pdf'

/** The first file passing `matches` that a visitor of `locale` gets: the site's own rule. */
const firstFor = (
  assets: AttachedAsset[],
  locale: Locale,
  matches: (asset: AttachedAsset) => boolean,
) =>
  assets.find(
    (asset) => matches(asset) && (!asset.locale || asset.locale === locale),
  )

const isFirstInAnyLocale = (
  asset: AttachedAsset,
  assets: AttachedAsset[],
  matches: (asset: AttachedAsset) => boolean,
) =>
  LOCALES.some(
    (locale) => firstFor(assets, locale, matches)?.mediaId === asset.mediaId,
  )

const isImageAsset = (asset: AttachedAsset) => isImageMime(asset.mimeType)
const isPdfAsset = (asset: AttachedAsset) => asset.mimeType === PDF_MIME

interface PressReleaseAttachmentsSectionProps {
  id: string
  detail: AnyRow
}

export function PressReleaseAttachmentsSection({
  id,
  detail,
}: PressReleaseAttachmentsSectionProps) {
  const { t } = useTranslation('pressReleases')
  const queryClient = useQueryClient()
  // The detail is already schema-checked; this only narrows the type.
  const assets = useMemo<AttachedAsset[]>(() => {
    const parsed = attachedAssetSchema.array().safeParse(detail.assets ?? [])
    return parsed.success ? parsed.data : []
  }, [detail.assets])

  // Mirrors the public site's split: first image → cover, other images → gallery, files → none.
  const badgeFor = useCallback(
    (asset: AttachedAsset, _index: number, all: AttachedAsset[]) => {
      if (!isImageMime(asset.mimeType)) return null
      const firstImage = all.find((a) => isImageMime(a.mimeType))
      return firstImage?.mediaId === asset.mediaId
        ? t('attachments.cover')
        : t('attachments.gallery')
    },
    [t],
  )

  const interviewBadgeFor = useCallback(
    (asset: AttachedAsset, _index: number, all: AttachedAsset[]) => {
      if (isImageAsset(asset)) {
        return isFirstInAnyLocale(asset, all, isImageAsset)
          ? t('attachments.cardImage')
          : null
      }
      return isPdfAsset(asset) && isFirstInAnyLocale(asset, all, isPdfAsset)
        ? t('attachments.pdfButton')
        : null
    },
    [t],
  )

  const localeControl = useMemo(
    () => ({
      ariaLabel: (name: string) => t('attachments.locale.label', { name }),
      options: [
        { value: ASSET_LOCALE_ALL, label: t('attachments.locale.all') },
        ...LOCALES.map((locale) => ({
          value: locale,
          label: t(`attachments.locale.${locale}`),
        })),
      ],
    }),
    [t],
  )

  const isAnnouncement = detail.type === PRESS_RELEASE_TYPE.ANNOUNCEMENT
  const isInterview = detail.type === PRESS_RELEASE_TYPE.INTERVIEW
  const typeBadgeFor = isInterview ? interviewBadgeFor : badgeFor
  const descriptionKey = isInterview
    ? 'pressReleases:attachments.descriptionInterview'
    : 'pressReleases:attachments.description'

  return (
    <AssetsSection
      assetsPath={`/press-releases/${id}/assets`}
      assets={assets}
      titleKey="pressReleases:attachments.title"
      descriptionKey={
        isAnnouncement
          ? 'pressReleases:attachments.descriptionAnnouncement'
          : descriptionKey
      }
      reorderable
      badgeFor={isAnnouncement ? undefined : typeBadgeFor}
      localeControl={localeControl}
      onChanged={() =>
        void queryClient.invalidateQueries({
          queryKey: pressReleasesKeys.detail(id),
        })
      }
    />
  )
}
