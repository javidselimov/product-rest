/**
 * Year archive of the publications section (spec 054 US3, ui-contract §5; Figma `2748:10054`, `2762:11057`, `2797:19903`):
 * the text before the accordions, the "İl" menu, the chosen year's cards — every year with "Hamısı" — and the text after.
 * The choice is the `year` search parameter (`selectArchive`), so it works without JavaScript and a shared link keeps it.
 */
import { ARCHIVE_ALL, selectArchive } from '@/features/about-content/model/file-archive'
import type { ArchiveGroup, FileArchiveBlock } from '@/features/about-content/model/types'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { YearMenu, type YearMenuOption } from '@/widgets/year-menu'

import { queryHref } from './consumer-parts'
import { DocumentParts } from './document-parts'

type Query = Record<string, string | string[] | undefined>

type FileArchiveProps = Readonly<{ block: FileArchiveBlock; locale: Locale; query?: Query }>

export function FileArchive({ block, locale, query }: FileArchiveProps) {
  const t = getT(locale, 'about')
  const { selected, shown } = selectArchive(block.groups, query?.[QUERY_PARAM.YEAR])
  const labelOf = (group: ArchiveGroup) => group.label || t('archive.other')
  const options: YearMenuOption[] = [
    { key: ARCHIVE_ALL, label: t('archive.all'), href: queryHref({ [QUERY_PARAM.YEAR]: ARCHIVE_ALL }), selected: selected === ARCHIVE_ALL },
    ...block.groups.map((group) => ({
      key: group.key,
      label: labelOf(group),
      href: queryHref({ [QUERY_PARAM.YEAR]: group.key }),
      selected: group.key === selected,
    })),
  ]
  const chosen = block.groups.find((group) => group.key === selected)

  return (
    <div data-slot="file-archive" className="flex flex-col gap-8">
      <DocumentParts parts={block.before} locale={locale} />
      <YearMenu
        summary={chosen ? labelOf(chosen) : t('archive.allSummary')}
        label={t('archive.year')}
        visibleLabel
        options={options}
        className="w-[220px] max-tab:flex-1"
      />
      <div className="flex flex-col gap-10">
        {shown.map((group) => (
          <section key={group.key} aria-labelledby={`archive-${group.key}`} className="flex flex-col gap-3">
            <h2 id={`archive-${group.key}`} className="text-foreground text-[18px] leading-[26px] font-semibold tab:text-xl tab:leading-7">
              {labelOf(group)}
            </h2>
            <DocumentParts parts={group.parts} locale={locale} />
          </section>
        ))}
      </div>
      <DocumentParts parts={block.after} locale={locale} />
    </div>
  )
}
