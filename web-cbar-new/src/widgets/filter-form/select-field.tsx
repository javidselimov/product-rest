'use client'

/**
 * GET filtr forması üçün seçim sahəsi — kit `Field` + kit `inputVariants` stilində
 * **native** `<select>` (spec 002 research R4 / D6).
 *
 * `'use client'`: kitin `inputVariants` funksiyası client modulundadır və server
 * komponentindən çağırıla bilməz; komponent yenə də SSR olunur, JS tələb etmir.
 *
 * Kitin `Select`-i client tərəfli Radix komponentidir və JS-siz GET formasında
 * dəyər göndərmir; siyahı filtrləri JS-siz işləməlidir (FR-025), ona görə burada
 * native element kitin input stilini geyinir. Rəng və ölçü yalnız kit token-larıdır.
 */
import { Field, FieldLabel } from '@cbar/lib-react-ui-kit/field'
import { inputVariants } from '@cbar/lib-react-ui-kit/input'

export type SelectOption = { value: string; label: string }

type SelectFieldProps = {
  id: string
  name: string
  label: string
  options: SelectOption[]
  /** Boş dəyər — «Hamısı» seçimi. */
  allLabel: string
  value?: string
  className?: string
}

export function SelectField({ id, name, label, options, allLabel, value, className }: SelectFieldProps) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        name={name}
        defaultValue={value ?? ''}
        className={`${inputVariants({ size: 'md' })} bg-background text-foreground min-w-48`}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
