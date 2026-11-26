import Link from 'next/link'

type SectionHeadingProps = {
  title: string
  href?: string
  hrefLabel?: string
}

export function SectionHeading({
  title,
  href,
  hrefLabel,
}: SectionHeadingProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-foreground text-xl font-bold">{title}</h2>
      {href && hrefLabel ? (
        <Link
          href={href}
          className="text-primary text-sm font-medium hover:underline"
        >
          {hrefLabel} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  )
}
