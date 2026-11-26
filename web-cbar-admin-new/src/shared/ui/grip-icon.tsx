/**
 * Drag handle — the kit has none. Drawn on the kit `Icon` base on a 24×24 grid with `currentColor`, like the editor icons
 * (`rich-text/ui/editor-icons`). Used by the page tree and `SortableList`.
 */

import { Icon, type IconProps } from '@cbar/lib-react-ui-kit/icons'

export const GripIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="9" cy="6" r="1" />
    <circle cx="15" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="18" r="1" />
  </Icon>
)
