/**
 * Category and type chips of an event (spec 034, Figma `2291:36188`). Not the kit `Badge`: Figma
 * draws them as quiet grey chips. The background is `site-surface-muted` #F5F5F5, an accepted
 * difference from Figma's #F1F2F4 (no such token in the kit).
 */
export function EventTags({ tags }: Readonly<{ tags: string[] }>) {
  if (tags.length === 0) return null

  return (
    <span className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="bg-site-surface-muted rounded-xs px-2.5 py-1 text-xs leading-4 font-medium text-(--ui-color-neutral-600)">
          {tag}
        </span>
      ))}
    </span>
  )
}
