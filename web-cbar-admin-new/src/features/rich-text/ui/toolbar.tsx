/**
 * Redaktor alət paneli. Aktiv/deaktiv vəziyyət `useEditorState` selektoru ilə
 * (yalnız lazım olan sahələr — hər tranzaksiyada bütün paneli yenidən render
 * etməmək üçün). Düymələr kit `IconButton` + `Tooltip`; qruplar `Separator` ilə.
 */

import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import {
  AttachIcon,
  EyeIcon,
  ImageIcon,
  TrashIcon,
} from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Separator } from '@cbar/lib-react-ui-kit/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@cbar/lib-react-ui-kit/tooltip'
import { useEditorState, type Editor } from '@tiptap/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  AccordionIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ClearFormatIcon,
  CodeIcon,
  ExitFullscreenIcon,
  FullscreenIcon,
  Heading2Icon,
  Heading3Icon,
  HighlightIcon,
  IndentIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MergeCellsIcon,
  OutdentIcon,
  QuoteIcon,
  RedoIcon,
  SplitCellIcon,
  TableColumnAddIcon,
  TableColumnDeleteIcon,
  TableHeaderIcon,
  TableIcon,
  TableRowAddIcon,
  TableRowDeleteIcon,
  TextColorIcon,
  UndoIcon,
} from './editor-icons'
import { DEFAULT_TABLE, HEADING_LEVEL } from '../model/constants'

export interface ToolbarProps {
  editor: Editor
  onInsertFile: () => void
  onInsertImage: () => void
  onOpenLink: () => void
  sourceMode: boolean
  fullscreen: boolean
  onTogglePreview: () => void
  onToggleSource: () => void
  onToggleFullscreen: () => void
  /** `false` olanda yalnız Önizləmə düyməsi göstərilir. Default `true`. */
  editable?: boolean
}

interface ToolbarButtonProps {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          type="button"
          size="sm"
          variant={active ? 'subtle' : 'ghost'}
          colorPalette={active ? 'primary' : 'black'}
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          // Redaktor seçimi düymə klikində itməsin.
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
        >
          {children}
        </IconButton>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

interface ToolbarColorProps {
  label: string
  onPick: (color: string) => void
  children: ReactNode
}

// Kit-də rəng seçici yoxdur (research R10) — native `Input type="color"`.
function ToolbarColor({ label, onPick, children }: ToolbarColorProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="relative inline-flex size-8 items-center justify-center">
          <span aria-hidden className="text-foreground pointer-events-none">
            {children}
          </span>
          <Input
            type="color"
            aria-label={label}
            className="absolute inset-0 h-8 w-8 cursor-pointer p-0 opacity-0"
            onChange={(event) => onPick(event.target.value)}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

const Group = () => <Separator orientation="vertical" className="mx-1 h-5" />

export function Toolbar({
  editor,
  onInsertFile,
  onInsertImage,
  onOpenLink,
  sourceMode,
  fullscreen,
  onTogglePreview,
  onToggleSource,
  onToggleFullscreen,
  editable = true,
}: ToolbarProps) {
  const { t } = useTranslation('richText')

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      h2: e.isActive('heading', { level: HEADING_LEVEL.H2 }),
      h3: e.isActive('heading', { level: HEADING_LEVEL.H3 }),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      link: e.isActive('link'),
      details: e.isActive('details'),
      table: e.isActive('table'),
      alignLeft: e.isActive({ textAlign: 'left' }),
      alignCenter: e.isActive({ textAlign: 'center' }),
      alignRight: e.isActive({ textAlign: 'right' }),
      alignJustify: e.isActive({ textAlign: 'justify' }),
      canIndent: e.can().sinkListItem('listItem'),
      canOutdent: e.can().liftListItem('listItem'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })

  const chain = () => editor.chain().focus()

  const toggleAccordion = () => {
    if (editor.isActive('details')) chain().unsetDetails().run()
    else chain().setDetails().run()
  }

  const showEditing = editable && !sourceMode

  return (
    <div
      role="toolbar"
      className="border-border flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5"
    >
      {showEditing ? (
        <>
          <ToolbarButton
            label={t('bold')}
            active={state.bold}
            onClick={() => chain().toggleBold().run()}
          >
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('italic')}
            active={state.italic}
            onClick={() => chain().toggleItalic().run()}
          >
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarColor
            label={t('textColor')}
            onPick={(color) => chain().setColor(color).run()}
          >
            <TextColorIcon size={16} />
          </ToolbarColor>
          <ToolbarColor
            label={t('highlight')}
            onPick={(color) => chain().setBackgroundColor(color).run()}
          >
            <HighlightIcon size={16} />
          </ToolbarColor>
          <Group />
          <ToolbarButton
            label={t('alignLeft')}
            active={state.alignLeft}
            onClick={() => chain().setTextAlign('left').run()}
          >
            <AlignLeftIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('alignCenter')}
            active={state.alignCenter}
            onClick={() => chain().setTextAlign('center').run()}
          >
            <AlignCenterIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('alignRight')}
            active={state.alignRight}
            onClick={() => chain().setTextAlign('right').run()}
          >
            <AlignRightIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('alignJustify')}
            active={state.alignJustify}
            onClick={() => chain().setTextAlign('justify').run()}
          >
            <AlignJustifyIcon />
          </ToolbarButton>
          <Group />
          <ToolbarButton
            label={t('heading2')}
            active={state.h2}
            onClick={() => chain().toggleHeading({ level: 2 }).run()}
          >
            <Heading2Icon />
          </ToolbarButton>
          <ToolbarButton
            label={t('heading3')}
            active={state.h3}
            onClick={() => chain().toggleHeading({ level: HEADING_LEVEL.H3 }).run()}
          >
            <Heading3Icon />
          </ToolbarButton>
          <Group />
          <ToolbarButton
            label={t('bulletList')}
            active={state.bulletList}
            onClick={() => chain().toggleBulletList().run()}
          >
            <ListIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('orderedList')}
            active={state.orderedList}
            onClick={() => chain().toggleOrderedList().run()}
          >
            <ListOrderedIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('outdent')}
            disabled={!state.canOutdent}
            onClick={() => chain().liftListItem('listItem').run()}
          >
            <OutdentIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('indent')}
            disabled={!state.canIndent}
            onClick={() => chain().sinkListItem('listItem').run()}
          >
            <IndentIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('blockquote')}
            active={state.blockquote}
            onClick={() => chain().toggleBlockquote().run()}
          >
            <QuoteIcon />
          </ToolbarButton>
          <Group />
          <ToolbarButton
            label={t('accordion')}
            active={state.details}
            onClick={toggleAccordion}
          >
            <AccordionIcon />
          </ToolbarButton>
          <Group />
          <ToolbarButton
            label={t('insertTable')}
            active={state.table}
            onClick={() =>
              chain()
                .insertTable({
                  rows: DEFAULT_TABLE.ROWS,
                  cols: DEFAULT_TABLE.COLS,
                  withHeaderRow: true,
                })
                .run()
            }
          >
            <TableIcon />
          </ToolbarButton>
          {state.table ? (
            <>
              <ToolbarButton
                label={t('addRowBelow')}
                onClick={() => chain().addRowAfter().run()}
              >
                <TableRowAddIcon />
              </ToolbarButton>
              <ToolbarButton
                label={t('addColumnRight')}
                onClick={() => chain().addColumnAfter().run()}
              >
                <TableColumnAddIcon />
              </ToolbarButton>
              <ToolbarButton
                label={t('deleteRow')}
                onClick={() => chain().deleteRow().run()}
              >
                <TableRowDeleteIcon />
              </ToolbarButton>
              <ToolbarButton
                label={t('deleteColumn')}
                onClick={() => chain().deleteColumn().run()}
              >
                <TableColumnDeleteIcon />
              </ToolbarButton>
              <ToolbarButton
                label={t('toggleHeaderRow')}
                onClick={() => chain().toggleHeaderRow().run()}
              >
                <TableHeaderIcon />
              </ToolbarButton>
              <ToolbarButton
                label={t('mergeCells')}
                onClick={() => chain().mergeCells().run()}
              >
                <MergeCellsIcon />
              </ToolbarButton>
              <ToolbarButton
                label={t('splitCell')}
                onClick={() => chain().splitCell().run()}
              >
                <SplitCellIcon />
              </ToolbarButton>
              <ToolbarButton
                label={t('deleteTable')}
                onClick={() => chain().deleteTable().run()}
              >
                <TrashIcon />
              </ToolbarButton>
            </>
          ) : null}
          <Group />
          <ToolbarButton
            label={t('link')}
            active={state.link}
            onClick={onOpenLink}
          >
            <LinkIcon />
          </ToolbarButton>
          <ToolbarButton label={t('insertFile')} onClick={onInsertFile}>
            <AttachIcon />
          </ToolbarButton>
          <ToolbarButton label={t('insertImage')} onClick={onInsertImage}>
            <ImageIcon />
          </ToolbarButton>
          <Group />
          <ToolbarButton
            label={t('clearFormatting')}
            onClick={() => chain().unsetAllMarks().clearNodes().run()}
          >
            <ClearFormatIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('undo')}
            disabled={!state.canUndo}
            onClick={() => chain().undo().run()}
          >
            <UndoIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('redo')}
            disabled={!state.canRedo}
            onClick={() => chain().redo().run()}
          >
            <RedoIcon />
          </ToolbarButton>
        </>
      ) : null}

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton label={t('preview')} onClick={onTogglePreview}>
          <EyeIcon />
        </ToolbarButton>
        {editable ? (
          <>
            <ToolbarButton
              label={t('source')}
              active={sourceMode}
              onClick={onToggleSource}
            >
              <CodeIcon />
            </ToolbarButton>
            <ToolbarButton
              label={fullscreen ? t('exitFullscreen') : t('fullscreen')}
              active={fullscreen}
              onClick={onToggleFullscreen}
            >
              {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </ToolbarButton>
          </>
        ) : null}
      </div>
    </div>
  )
}
