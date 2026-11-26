import type {
  MoneyMarkCategory,
  MoneyMarkDetail,
  MoneyMarkListItem,
  MoneyMarkNewsDetail,
  MoneyMarkNewsListItem,
} from '@/features/money-marks/model/schemas'

export const moneyMarkNewsItems: MoneyMarkNewsListItem[] = Array.from(
  { length: 11 },
  (_, i) => ({
    id: 600 + i,
    title: i === 0 ? 'Yeni 200 manatlıq əskinas' : `Valyuta xəbəri ${i + 1}`,
    slug: i === 0 ? 'yeni-200-manat' : `valyuta-xeberi-${i + 1}`,
    publishedAt: `2026-05-${String(20 - i).padStart(2, '0')}`,
  }),
)

export const moneyMarkNewsDetailFixture: MoneyMarkNewsDetail = {
  ...moneyMarkNewsItems[0],
  content:
    '<p>Yeni əskinas <img src="/media/71" alt="200 manat"> dövriyyəyə buraxılır.</p>',
}

export const moneyMarkCategories: MoneyMarkCategory[] = [
  { id: 1, name: 'Dövriyyədə olan' },
  { id: 2, name: 'Yubiley' },
]

export const moneyMarkItems: MoneyMarkListItem[] = [
  {
    id: 1,
    title: '1 manat',
    slug: '1-manat',
    categoryName: 'Dövriyyədə olan',
    frontImageUrl: '/media/11',
    rearImageUrl: '/media/12',
  },
  {
    id: 2,
    title: '5 manat',
    slug: '5-manat',
    categoryName: 'Dövriyyədə olan',
    frontImageUrl: '/media/13',
    rearImageUrl: null,
  },
  {
    id: 3,
    title: '50 qəpik',
    slug: '50-qepik',
    categoryName: 'Dövriyyədə olan',
    frontImageUrl: '/media/14',
    rearImageUrl: '/media/15',
  },
  {
    id: 4,
    title: 'Yubiley sikkəsi',
    slug: 'yubiley-sikkesi',
    categoryName: 'Yubiley',
    frontImageUrl: null,
    rearImageUrl: null,
  },
]

export const moneyMarkDetailFixture: MoneyMarkDetail = {
  ...moneyMarkItems[0],
  type: 1,
  description: '<p>Ön tərəfdə Azərbaycanın xəritəsi.</p>',
  securityFeatures: '<ul><li>Su nişanı</li><li>Holoqram</li></ul>',
}
