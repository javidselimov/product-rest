'use client'

/**
 * GET forması üçün tarix sahəsi — kit `Field` + kit `inputVariants` stilində
 * native `<input type="date">` (spec 002 research R4 / D6: kitin `DatePicker`-i
 * `name` prop-u daşımır və JS-siz GET formasında dəyər göndərmir).
 *
 * `'use client'`: `inputVariants` client modulundadır; komponent yenə də SSR olunur.
 */
import { Field, FieldLabel } from '@cbar/lib-react-ui-kit/field'
import { inputVariants } from '@cbar/lib-react-ui-kit/input'

type DateFieldProps = {
  id: string
  name: string
  label: string
  value?: string
  className?: string
}

export function DateField({ id, name, label, value, className }: DateFieldProps) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type="date"
        name={name}
        defaultValue={value}
        className={`${inputVariants({ size: 'md' })} bg-background text-foreground`}
      />
    </Field>
  )
}
