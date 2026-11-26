'use client'

/**
 * FAQ search and topic choice (spec 051 US2, US3; Figma A `3516:6546`, B "Search row" `2782:5705`).
 *
 * A plain GET form, so it works without JavaScript: `q` from the search field and, in view B only, `topic` from a native
 * `<select>` (the kit `Select` submits nothing without JS — research D6 of spec 002). Without JS the "Show" button submits
 * the choice; once hydrated the choice submits itself and the button goes. `'use client'` because `inputVariants` lives in
 * a client module and for that one change handler; the component holds no state of its own.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { CaretDownIcon, SearchIcon } from '@cbar/lib-react-ui-kit/icons'
import { inputVariants } from '@cbar/lib-react-ui-kit/input'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { useSyncExternalStore } from 'react'

import { QUERY_MAX_LENGTH } from '@/shared/constants/limits'
import { QUERY_PARAM } from '@/shared/constants/query-params'

export type FaqSearchLabels = {
  form: string
  search: string
  placeholder: string
  topic: string
  allTopics: string
  apply: string
}

type FaqSearchFormProps = Readonly<{
  action: string
  q: string
  labels: FaqSearchLabels
  /** View B only: the topic choice. */
  topics?: { value: string; options: { slug: string; name: string }[] }
}>

/** Figma: 54 high, 4 radius, 20 inner padding (16 on mobile), 20px icon 12 from the text. */
const fieldClass = cn(inputVariants({ size: 'md' }), 'bg-background text-foreground h-13.5 w-full rounded-xs text-base leading-6')

const subscribe = () => () => {}

export function FaqSearchForm({ action, q, labels, topics }: FaqSearchFormProps) {
  // false on the server and during hydration, true afterwards — no effect, no extra render pass.
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)

  return (
    <form
      method="get"
      action={action}
      role="search"
      aria-label={labels.form}
      data-slot="faq-search"
      className={cn('flex flex-col gap-4', topics && 'desk:flex-row desk:items-center')}
    >
      <div className="relative min-w-0 flex-1">
        <SearchIcon aria-hidden="true" className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 tab:left-5" />
        <input
          type="search"
          name={QUERY_PARAM.QUERY}
          maxLength={QUERY_MAX_LENGTH}
          defaultValue={q}
          aria-label={labels.search}
          placeholder={labels.placeholder}
          className={cn(fieldClass, 'pr-5 pl-12 tab:pl-13')}
        />
      </div>

      {topics ? (
        <div className="flex items-center gap-3 desk:w-100 desk:shrink-0">
          <div className="relative min-w-0 flex-1">
            <select
              name={QUERY_PARAM.TOPIC}
              defaultValue={topics.value}
              aria-label={labels.topic}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
              className={cn(fieldClass, 'cursor-pointer appearance-none pr-12 pl-4 font-medium tab:pl-5')}
            >
              <option value="">{labels.allTopics}</option>
              {topics.options.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
            <CaretDownIcon aria-hidden="true" className="text-foreground pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2" />
          </div>
          {hydrated ? null : (
            <Button type="submit" variant="outline" className="h-13.5 rounded-xs">
              {labels.apply}
            </Button>
          )}
        </div>
      ) : null}
    </form>
  )
}
