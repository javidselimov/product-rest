'use client'

/**
 * "According to the schedule" and its dialog: the monetary policy decision dates of the year (spec 039
 * US3, Figma `1727:31563`, `1727:32212`, `1727:32597`).
 *
 * The trigger is a link to the events list filtered to decisions, so without JavaScript it still
 * leads to the dates. Once hydrated, a click opens the dialog instead. The dialog is controlled and
 * has no `DialogTrigger`, so closing returns focus to the link by hand.
 */
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@cbar/lib-react-ui-kit/dialog'
import { CalendarIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { useRef, useState, type MouseEvent, type ReactNode } from 'react'

import { DIALOG_CLASS, TILE_STATE_CLASS, type DecisionsDialogData } from './model'

type DecisionsDialogProps = Readonly<{
  data: DecisionsDialogData
  className?: string
  children: ReactNode
}>

export function DecisionsDialog({ data, className, children }: DecisionsDialogProps) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLAnchorElement>(null)

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // A modified click keeps its usual meaning: open the events list in a new tab or window.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setOpen(true)
  }

  return (
    <>
      <a ref={trigger} href={data.allHref} onClick={onClick} aria-haspopup="dialog" className={className}>
        {children}
      </a>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-slot="decisions-dialog"
          className={DIALOG_CLASS}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            trigger.current?.focus()
          }}
        >
          <span aria-hidden="true" className="bg-site-schedule-border mx-auto h-1 w-10 shrink-0 rounded-full tab:hidden" />
          <div className="flex flex-col gap-1 pr-10">
            <DialogTitle className="text-site-text-strong text-xl leading-7 font-semibold">{data.title}</DialogTitle>
            <DialogDescription className="text-site-text-strong text-base leading-7">{data.subtitle}</DialogDescription>
          </div>

          {data.next ? (
            <div data-slot="decisions-next" className="bg-site-schedule-head text-primary-foreground flex items-center gap-4 rounded-xs p-4">
              <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/12">
                <CalendarIcon className="size-6" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-xs leading-4 tracking-[0.25px]">{data.next.label}</span>
                <span className="text-lg leading-6 font-medium">{data.next.date}</span>
                <span className="text-base leading-7">{data.next.type}</span>
              </span>
            </div>
          ) : null}

          {data.tiles.length > 0 ? (
            <ol data-slot="decisions-tiles" className="grid grid-cols-4 gap-2">
              {data.tiles.map((tile) => (
                <li
                  key={tile.key}
                  aria-label={tile.label}
                  aria-current={tile.state === 'next' ? 'date' : undefined}
                  data-state={tile.state}
                  className={cn('flex min-h-27 flex-col items-center justify-center gap-1 rounded-xs px-1 py-3 text-center', TILE_STATE_CLASS[tile.state])}
                >
                  <span aria-hidden="true" className="text-lg leading-6 font-medium">{tile.day}</span>
                  <span aria-hidden="true" className="text-xs leading-4 tracking-[0.25px]">{tile.month}</span>
                  <span aria-hidden="true" className="text-xs leading-4 tracking-[0.25px]">{tile.type}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted-foreground text-base leading-7">{data.empty}</p>
          )}

          <div className="flex tab:justify-end">
            <a href={data.allHref} className="text-site-schedule-head text-base leading-7 font-medium hover:underline">
              {data.allLabel} <span aria-hidden="true">→</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
