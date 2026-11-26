/**
 * The activity directions (spec 053 ui-contract §3, Figma `2678:3924`): numbered native `<details>`, all closed on
 * arrival and opened one by one. They open without JS, the browser announces their state, and `data-accordion` prints
 * them open (`globals.css`). The body is the editor's HTML, rendered by the one HTML sink. No `gap` on `<details>`:
 * Chrome counts the hidden body of a closed one as a flex child (spec 044).
 */
import { CaretDownIcon } from '@cbar/lib-react-ui-kit/icons'

import type { FincertDirectionView } from '@/features/fincert/model/view'
import { CmsContent } from '@/widgets/cms-content/cms-content'

type FincertDirectionsProps = Readonly<{ directions: FincertDirectionView[] }>

export function FincertDirections({ directions }: FincertDirectionsProps) {
  return (
    // An ordered list: the number circle is decorative (`aria-hidden`), the list carries the order to screen readers.
    <ol data-slot="fincert-directions" className="border-border list-none border-t p-0">

      {directions.map((direction) => (
        <li key={direction.id} className="border-border bg-background border-b">
          <details data-accordion="" className="group/direction">
            <summary className="focus-visible:outline-ring flex cursor-pointer list-none items-center gap-3 p-4 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 tab:gap-4 tab:p-5 desk:gap-5 desk:px-6 [&::-webkit-details-marker]:hidden">
              <span
                aria-hidden="true"
                className="bg-site-fincert-tint text-primary group-open/direction:bg-primary group-open/direction:text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm leading-5 font-semibold tab:size-9 tab:text-base tab:leading-[22px]"
              >
                {direction.number}
              </span>
              <span className="text-foreground group-open/direction:text-primary min-w-0 flex-1 text-base leading-6 font-semibold tab:text-lg tab:leading-[26px]">
                {direction.title}
              </span>
              <CaretDownIcon
                aria-hidden="true"
                className="text-foreground size-5 shrink-0 group-open/direction:rotate-180 motion-safe:transition-transform"
              />
            </summary>
            <div data-type="details-content" className="px-4 pb-5 tab:pr-5 tab:pb-6 tab:pl-18 desk:pr-16 desk:pb-7 desk:pl-20">
              <CmsContent html={direction.bodyHtml} variant="fincert" />
            </div>
          </details>
        </li>
      ))}
    </ol>
  )
}
