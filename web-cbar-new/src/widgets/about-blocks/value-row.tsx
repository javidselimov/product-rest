/**
 * Dəyər sətirləri — Figma `968:1100`: solda 200px (48 ikon kafeli + ad 18/700), sağda mətn;
 * sətirlər xəttlə ayrılır, xətt ilə sətir arası 36. Mobildə ikon və ad mətnin üstündədir.
 */
import type { ValueItem } from '@/features/about-content/model/types'
import { CmsContent } from '@/widgets/cms-content/cms-content'

type ValueRowsProps = Readonly<{ items: ValueItem[] }>

export function ValueRows({ items }: ValueRowsProps) {
  return (
    <ul data-slot="value-rows" className="flex flex-col gap-9">
      {items.map((item, index) => (
        <li
          key={`${index}-${item.title}`}
          className="border-border flex flex-col gap-4 border-t pt-9 tab:flex-row tab:gap-6"
        >
          <div className="flex shrink-0 flex-col gap-6 tab:w-50">
            {item.icon ? (
              <span className="bg-site-icon-tile flex size-12 items-center justify-center rounded-sm">
                {/* CMS media şəkli: ölçüsü və formatı redaktordan gəlir, `next/image` tətbiq olunmur (spec 002 D4). */}
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS media ikonu */}
                <img src={item.icon.src} alt={item.icon.alt} className="max-h-5 max-w-5" />
              </span>
            ) : null}
            <h2 className="text-primary text-lg leading-6 font-bold">{item.title}</h2>
          </div>
          <CmsContent html={item.html} variant="about" className="min-w-0 flex-1" />
        </li>
      ))}
    </ul>
  )
}
