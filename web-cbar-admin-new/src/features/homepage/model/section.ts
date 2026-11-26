/**
 * `/homepage-blocks` bölməsinin ortaq naviqasiyası: alt bölmə tabları və
 * breadcrumb zənciri. Hub səhifəsi, beş blok modulu və məlumat sətirləri
 * modulu eyni siyahını paylaşır ki, tab çubuğu hər ekranda eyni görünsün.
 */

import type { CrumbConfig, SectionTabConfig } from '@/shared/crud/types'

export const HOMEPAGE_SECTION_TABS: SectionTabConfig[] = [
  { to: '/homepage-blocks', labelKey: 'homepage:tabs.overview' },
  { to: '/homepage-blocks/banners', labelKey: 'homepage:tabs.banners' },
  { to: '/homepage-blocks/news-slider', labelKey: 'homepage:tabs.newsSlider' },
  {
    to: '/homepage-blocks/running-lines',
    labelKey: 'homepage:tabs.runningLines',
  },
  { to: '/homepage-blocks/links', labelKey: 'homepage:tabs.links' },
  {
    to: '/homepage-blocks/publications',
    labelKey: 'homepage:tabs.publications',
  },
  {
    to: '/homepage-blocks/strategy-docs',
    labelKey: 'homepage:tabs.strategyDocs',
  },
  { to: '/homepage-blocks/info-lines', labelKey: 'homepage:tabs.infoLines' },
]

export const HOMEPAGE_CRUMBS: CrumbConfig[] = [
  { labelKey: 'nav:homepageBlocks.label', path: '/homepage-blocks' },
]
