/**
 * Redaktor alət panelinin kit-də olmayan ikonları. Hamısı kit-in `Icon` bazası
 * üzərində 24×24 torda, `currentColor` ilə çəkilir (stroke 1.5) — kit ikonları
 * ilə eyni ölçü və rəng davranışı. Kit-də olanlar (`ImageIcon`, `AttachIcon`,
 * `EyeIcon`, `TrashIcon`, `TrashAltIcon`) buradan deyil, kit-dən import edilir.
 */

import { Icon, type IconProps } from '@cbar/lib-react-ui-kit/icons'

export type EditorIconProps = IconProps

export const BoldIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M7 4h6.5a3.5 3.5 0 0 1 0 7H7z" />
    <path d="M7 11h7.5a3.5 3.5 0 0 1 0 7H7z" />
  </Icon>
)

export const ItalicIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M10 4h8" />
    <path d="M6 20h8" />
    <path d="m14 4-4 16" />
  </Icon>
)

export const LinkIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="m10 14 1 1a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5" />
    <path d="m14 10-1-1a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5" />
  </Icon>
)

export const UndoIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 8h10a5 5 0 0 1 0 10H9" />
    <path d="m8 4-4 4 4 4" />
  </Icon>
)

export const RedoIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M20 8H10a5 5 0 0 0 0 10h5" />
    <path d="m16 4 4 4-4 4" />
  </Icon>
)

export const TableIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M3 15h18M10 4v16" />
  </Icon>
)

export const TableRowAddIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="8" rx="2" />
    <path d="M9 4v8M15 4v8" />
    <path d="M12 15v6M9 18h6" />
  </Icon>
)

export const TableColumnAddIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="10" height="16" rx="2" />
    <path d="M3 10h10M3 15h10" />
    <path d="M18 9v6M15 12h6" />
  </Icon>
)

export const TableRowDeleteIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="8" rx="2" />
    <path d="M9 4v8M15 4v8" />
    <path d="m9.5 15.5 5 5m0-5-5 5" />
  </Icon>
)

export const TableColumnDeleteIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="10" height="16" rx="2" />
    <path d="M3 10h10M3 15h10" />
    <path d="m15.5 9.5 5 5m0-5-5 5" />
  </Icon>
)

export const TableHeaderIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M3 15h18M10 10v10" />
    <path d="M6 7h12" />
  </Icon>
)

export const MergeCellsIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M12 4v4M12 16v4" />
    <path d="M6 12h4.5m-1.5-1.5 1.5 1.5-1.5 1.5" />
    <path d="M18 12h-4.5m1.5-1.5-1.5 1.5 1.5 1.5" />
  </Icon>
)

export const SplitCellIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M12 4v16" />
    <path d="M9.5 12H5.5m1.5-1.5L5.5 12 7 13.5" />
    <path d="M14.5 12h4m-1.5-1.5 1.5 1.5-1.5 1.5" />
  </Icon>
)

export const CodeIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="m8 8-4 4 4 4" />
    <path d="m16 8 4 4-4 4" />
    <path d="m14 5-4 14" />
  </Icon>
)

export const FullscreenIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 9V4h5" />
    <path d="M20 9V4h-5" />
    <path d="M4 15v5h5" />
    <path d="M20 15v5h-5" />
  </Icon>
)

export const ExitFullscreenIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M9 4v5H4" />
    <path d="M15 4v5h5" />
    <path d="M9 20v-5H4" />
    <path d="M15 20v-5h5" />
  </Icon>
)

export const Heading2Icon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 6v12M12 6v12M4 12h8" />
    <path d="M15 11a2.5 2.5 0 0 1 5 0c0 2.2-5 3.8-5 7h5" />
  </Icon>
)

export const Heading3Icon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 6v12M12 6v12M4 12h8" />
    <path d="M15.5 9.5A2.5 2.5 0 1 1 18 13h-1.5H18a2.5 2.5 0 1 1-2.5 3.5" />
  </Icon>
)

export const ListIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4 6h.5M4 12h.5M4 18h.5" />
  </Icon>
)

export const ListOrderedIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M10 6h10M10 12h10M10 18h10" />
    <path d="M4 5h1.5v4M4 9h3" />
    <path d="M4 14.5a1.5 1.5 0 0 1 3 .5c0 1.2-3 2-3 4h3" />
  </Icon>
)

export const IndentIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 6h16M11 12h9M4 18h16" />
    <path d="m4 9.5 3 2.5-3 2.5" />
  </Icon>
)

export const OutdentIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 6h16M11 12h9M4 18h16" />
    <path d="m7 9.5-3 2.5 3 2.5" />
  </Icon>
)

export const QuoteIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M6 16a3 3 0 0 0 3-3V8H5v5h4" />
    <path d="M15 16a3 3 0 0 0 3-3V8h-4v5h4" />
  </Icon>
)

export const AlignLeftIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 6h16M4 10h10M4 14h16M4 18h10" />
  </Icon>
)

export const AlignCenterIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 6h16M7 10h10M4 14h16M7 18h10" />
  </Icon>
)

export const AlignRightIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 6h16M10 10h10M4 14h16M10 18h10" />
  </Icon>
)

export const AlignJustifyIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </Icon>
)

export const HighlightIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="m9 11 8-8 4 4-8 8z" />
    <path d="m9 11-4 4v4h4l4-4" />
    <path d="M5 19H3" />
    <path d="m11 9 4 4" />
  </Icon>
)

export const TextColorIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="m6 16 6-12 6 12" />
    <path d="M8.5 11h7" />
    <path d="M4 20h16" />
  </Icon>
)

export const ClearFormatIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <path d="M4 7V4h16v3" />
    <path d="M5 20h6" />
    <path d="M13 4 8 20" />
    <path d="m15 15 5 5m0-5-5 5" />
  </Icon>
)

export const AccordionIcon = (props: EditorIconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="6" rx="1.5" />
    <path d="m15 6 2 2 2-2" />
    <path d="M3 15h18M3 19h18" />
  </Icon>
)
