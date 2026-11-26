/**
 * Struktur sxemi — planşet və mobil (spec 027, Figma `org/Structure chart`: planşet `2007:86365`
 * 664 en, mobil `2007:86347` 342 en). Desktop koordinatları burada işlənmir: ağac `parentId` və
 * API sırasından qurulur, budaqlar alt-alta düzülür. Client JS yoxdur — blok accordion-u native
 * `<details>`-dir, kartlar adi keçiddir.
 *
 * Figma komponentləri (`Prototype` səhifəsi):
 * - Governor `1838:40405`: `#004C7C`, r4, p20/24, aralıq 4, ad 18/24 600, vəzifə 14/28 400, ağ;
 * - Curator column başlığı (müavin): `#00B3DE`, r4, p16/20, ad 16/28 600, vəzifə 14/28, ağ;
 * - Person `1838:40425` (baş direktor): `#F3F3F3`, haşiyə `#C4C4C4`, r4, p12/16, aralıq 4,
 *   ad 14 600 `#333`, vəzifə 12/16 hərf aralığı 0.25 `#6B6B6B`;
 * - Block header `1838:40494`: `#00CBB6`, r4, p12/16, ad 14 600 ağ, sağda 16 px chevron; açılanda
 *   altında departamentlər, aralıq 4;
 * - Department `1838:40462`: haşiyə `#00CBB6`, r4, p10/12, ad 14/28 500 `#333`, sağda 16 px ox
 *   (`#004C7C`); fon — blokun içində `#F3F3F3` (Block), birbaşa tabe ağ (Direct), kuratora birbaşa
 *   tabe teal 16% (Office);
 * - Branch + Connector `1838:40232`: girinti 24/20/16 (səviyyəyə görə), üst boşluq 16/12/8; şaquli
 *   xətt 1.5 px, üfüqi 14 px, ox 6×8, rəng `#87949F`. Son budağın xətti oxda bitir.
 */
import { CaretDownIcon, CaretRightIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { buildTree, type TreeNode } from '@/entities/org-chart'
import { ORG_CHART_KIND } from '@/features/organization/model/constants'

import { BRANCH } from './constants'
import type { OrgChartCardData } from './model'

type Tree = TreeNode<OrgChartCardData>

const isBlock = (n: OrgChartCardData) => n.kind === ORG_CHART_KIND.block || n.kind === ORG_CHART_KIND.group
const label = (n: OrgChartCardData) => `${n.name}${n.curatorDirect ? ' *' : ''}`

const LINK_STATE = 'transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'

/** Kart — `href` varsa keçid, yoxdursa sadə blok. */
function CardShell({ node, className, children }: Readonly<{ node: OrgChartCardData; className: string; children: ReactNode }>) {
  return node.href ? (
    <Link href={node.href} className={`${className} ${LINK_STATE}`}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  )
}

function PersonCard({ node }: Readonly<{ node: OrgChartCardData }>) {
  if (node.kind === 1) {
    return (
      <CardShell node={node} className="bg-site-org-governor flex flex-col gap-1 rounded-xs px-6 py-5 text-white hover:opacity-90">
        <span className="text-lg leading-6 font-semibold">{label(node)}</span>
        {node.role ? <span className="text-sm leading-7">{node.role}</span> : null}
      </CardShell>
    )
  }
  if (node.kind === 2) {
    return (
      <CardShell node={node} className="bg-site-org-deputy flex flex-col gap-1 rounded-xs px-5 py-4 text-white hover:opacity-90">
        <span className="text-base leading-7 font-semibold">{label(node)}</span>
        {node.role ? <span className="text-sm leading-7">{node.role}</span> : null}
      </CardShell>
    )
  }
  return (
    <CardShell
      node={node}
      className="bg-site-org-director border-site-org-director-border hover:border-site-org-line flex flex-col gap-1 rounded-xs border px-4 py-3"
    >
      <span className="text-site-text-strong text-sm leading-[1.3] font-semibold">{label(node)}</span>
      {node.role ? <span className="text-muted-foreground text-xs leading-4 tracking-[0.25px]">{node.role}</span> : null}
    </CardShell>
  )
}

/** Departament sətri; `inBlock` — blokun accordion-unun içindədir (boz fon). */
function DepartmentRow({ node, inBlock }: Readonly<{ node: OrgChartCardData; inBlock: boolean }>) {
  let surface = inBlock ? 'bg-site-org-director' : 'bg-background'
  if (node.curatorDirect) surface = 'bg-site-org-block/16'
  return (
    <CardShell
      node={node}
      className={`${surface} border-site-org-block hover:bg-site-org-block/24 flex items-center gap-3 rounded-xs border px-3 py-2.5`}
    >
      <span className="text-site-text-strong flex-1 text-sm leading-7 font-medium">{label(node)}</span>
      {node.href ? <CaretRightIcon aria-hidden="true" className="text-site-org-governor size-4 shrink-0" /> : null}
    </CardShell>
  )
}

/**
 * Blok — accordion (Figma "Block header", State=Closed/Open). Departamenti yoxdursa adi kartdır və
 * öz səhifəsinə keçir; varsa başlıq açıb-bağlayır, blokun səhifəsi siyahının başında keçiddir.
 */
function BlockCard({ item }: Readonly<{ item: Tree }>) {
  const { node, children } = item
  const header = 'bg-site-org-block flex items-center gap-3 rounded-xs px-4 py-3 text-white'
  const title = <span className="flex-1 text-sm leading-[1.3] font-semibold">{label(node)}</span>
  if (children.length === 0) {
    return (
      <CardShell node={node} className={`${header} hover:opacity-90`}>
        {title}
        {node.href ? <CaretRightIcon aria-hidden="true" className="size-4 shrink-0" /> : null}
      </CardShell>
    )
  }
  return (
    <details className="group flex flex-col gap-1">
      <summary className={`${header} cursor-pointer list-none hover:opacity-90 [&::-webkit-details-marker]:hidden ${LINK_STATE}`}>
        {title}
        <CaretDownIcon aria-hidden="true" className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-1 flex flex-col gap-1">
        {node.href ? (
          <li>
            <DepartmentRow node={{ ...node, curatorDirect: false }} inBlock />
          </li>
        ) : null}
        {children.map((child) => (
          <li key={child.node.id}>
            <DepartmentRow node={child.node} inBlock />
          </li>
        ))}
      </ul>
    </details>
  )
}

const branchOf = (level: number) => BRANCH[Math.min(level, BRANCH.length - 1)]!

/** Şaquli xətt bütün budaqlardan keçir, sonuncuda oxda bitir (`--tick`, `Branches`-da). */
function Connector() {
  return (
    <span aria-hidden="true" className="text-site-org-connector absolute inset-y-0 left-0">
      <span className="absolute top-0 bottom-0 left-1 w-[1.5px] bg-current group-last/branch:bottom-auto group-last/branch:h-[calc(var(--tick)+1px)]" />
      <span className="absolute top-(--tick) left-1 h-[1.5px] w-3.5 bg-current" />
      <svg className="absolute top-[calc(var(--tick)-3px)] left-[18px]" width="6" height="8" viewBox="0 0 6 8" fill="currentColor">
        <path d="M0 0 6 4 0 8Z" />
      </svg>
    </span>
  )
}

function Node({ item, level }: Readonly<{ item: Tree; level: number }>) {
  const { node, children } = item
  if (isBlock(node)) return <BlockCard item={item} />
  if (node.kind === ORG_CHART_KIND.department) return <DepartmentRow node={node} inBlock={false} />
  return (
    <div className="flex flex-col">
      <PersonCard node={node} />
      {children.length > 0 ? <Branches items={children} level={level} /> : null}
    </div>
  )
}

function Branches({ items, level }: Readonly<{ items: Tree[]; level: number }>) {
  const b = branchOf(level)
  return (
    <ul className="flex flex-col">
      {items.map((child) => (
        <li key={child.node.id} className={`group/branch relative ${b.indent} ${b.top}`} style={{ ['--tick' as string]: `${b.tick}px` }}>
          <Connector />
          <Node item={child} level={level + 1} />
        </li>
      ))}
    </ul>
  )
}

export function OrgChartTree({ nodes, className = '' }: Readonly<{ nodes: OrgChartCardData[]; className?: string }>) {
  const roots = buildTree(nodes)
  if (roots.length === 0) return null
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {roots.map((root) => (
        <Node key={root.node.id} item={root} level={0} />
      ))}
    </div>
  )
}
