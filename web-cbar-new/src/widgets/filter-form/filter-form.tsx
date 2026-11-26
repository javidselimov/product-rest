/**
 * GET filtr forması qabığı — eyni yola göndərir, `page` sıfırlanır (contracts/routes.md §4).
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import type { ReactNode } from 'react'

type FilterFormProps = {
  action: string
  submitLabel: string
  label: string
  children: ReactNode
}

export function FilterForm({ action, submitLabel, label, children }: FilterFormProps) {
  return (
    <form
      method="get"
      action={action}
      aria-label={label}
      data-slot="filter-form"
      className="border-border bg-card flex flex-wrap items-end gap-4 rounded-md border p-4"
    >
      {children}
      <Button type="submit" colorPalette="primary">
        {submitLabel}
      </Button>
    </form>
  )
}
