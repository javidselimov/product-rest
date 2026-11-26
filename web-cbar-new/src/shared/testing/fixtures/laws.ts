import type {
  LawCategory,
  LawDetail,
  LawListItem,
} from '@/features/laws/model/schemas'

import { makeMediaAsset } from '../factories'

export const lawCategories: LawCategory[] = [
  { id: 1, name: 'Bank qanunvericiliyi' },
  { id: 2, name: 'Valyuta tənzimi' },
]

export const lawItems: LawListItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: 500 + i,
  title: i === 0 ? 'Mərkəzi Bank haqqında Qanun' : `Sənəd ${i + 1}`,
  slug: i === 0 ? 'merkezi-bank-haqqinda' : `sened-${i + 1}`,
  publishedAt: `2026-0${(i % 8) + 1}-15`,
  categoryName: i % 2 === 0 ? 'Bank qanunvericiliyi' : 'Valyuta tənzimi',
}))

export const lawDetailFixture: LawDetail = {
  ...lawItems[0],
  description:
    '<p>Bu Qanun Mərkəzi Bankın statusunu müəyyən edir.</p><div class="tableWrapper"><table><tr><td>Maddə 1</td></tr></table></div>',
  assets: [
    makeMediaAsset({
      mediaId: 811,
      originalName: 'qanun.pdf',
      url: '/media/811',
    }),
  ],
}
