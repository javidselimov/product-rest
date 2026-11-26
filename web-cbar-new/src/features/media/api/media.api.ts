/**
 * Galleries, videos, live streams — contracts/public-api.md #22–#25; spec 035 adds `q`, `from`,
 * `to` to both lists and `GET /videos/{id}`. Cached for 10 s (spec 003 FR-015); each filter
 * combination is its own cache key.
 */
import 'server-only'

import { z } from 'zod'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import type { Locale } from '@/shared/i18n'

import {
  galleryDetailSchema,
  galleryListSchema,
  videoItemSchema,
  videoListSchema,
  videoStreamSchema,
  type GalleryDetail,
  type GalleryList,
  type VideoItem,
  type VideoList,
  type VideoStream,
} from '../model/schemas'

const videoStreamListSchema = z.array(videoStreamSchema)

const fetchGalleries = cachedJson(galleryListSchema, { keyPrefix: 'gallery-list', tag: 'media' })
const fetchGallery = cachedJsonOrNull(galleryDetailSchema, { keyPrefix: 'gallery-detail', tag: 'media' })
const fetchVideos = cachedJson(videoListSchema, { keyPrefix: 'video-list', tag: 'media' })
const fetchVideo = cachedJsonOrNull(videoItemSchema, { keyPrefix: 'video-detail', tag: 'media' })
const fetchStreams = cachedJson(videoStreamListSchema, { keyPrefix: 'video-streams', tag: 'media' })

export type MediaListQuery = {
  page?: number
  pageSize?: number
  /** Title search; blank is not sent. */
  q?: string
  /** `YYYY-MM-DD`, inclusive: the event date of a gallery, the Baku day of a video. */
  from?: string
  to?: string
}

function listPath(resource: 'galleries' | 'videos', locale: Locale, query: MediaListQuery): string {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, q, from, to } = query
  const params = new URLSearchParams({ locale, page: String(page), pageSize: String(pageSize) })
  for (const [key, value] of Object.entries({ q, from, to })) {
    if (value) params.set(key, value)
  }
  return `/api/v1/${resource}?${params}`
}

export function getGalleries(locale: Locale, query: MediaListQuery = {}): Promise<GalleryList> {
  return fetchGalleries(listPath('galleries', locale, query))
}

/** `null` when the gallery is inactive, missing or has no translation in `locale`. */
export function getGallery(locale: Locale, id: number): Promise<GalleryDetail | null> {
  return fetchGallery(`/api/v1/galleries/${id}?locale=${locale}`)
}

export function getVideos(locale: Locale, query: MediaListQuery = {}): Promise<VideoList> {
  return fetchVideos(listPath('videos', locale, query))
}

/** `null` when the video is inactive, missing or has no translation in `locale`. */
export function getVideo(locale: Locale, id: number): Promise<VideoItem | null> {
  return fetchVideo(`/api/v1/videos/${id}?locale=${locale}`)
}

export function getVideoStreams(locale: Locale): Promise<VideoStream[]> {
  return fetchStreams(`/api/v1/video-streams?locale=${locale}`)
}
