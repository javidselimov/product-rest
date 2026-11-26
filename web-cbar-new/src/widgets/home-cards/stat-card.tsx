/**
 * Ana səhifə kartlarının ortaq qabığı (server komponenti) — Figma `809:24614` / `809:24678` /
 * `809:24733` (spec 022): ağ fon, `border` çərçivə, 4px radius, başlıq + sağda tarix, ayırıcı xətt.
 *
 * Ölçülər Figma-dan: başlıq sətri 28, aralıq 16, ayırıcı xətt hündürlük tutmur (Figma-da
 * 0 hündürlüklü xətt). Figma-da çərçivə içəri çəkilir (`strokeAlign: INSIDE`), CSS-də isə
 * hündürlüyə 2px əlavə edir — ona görə şaquli padding Figma-dakından 1px azdır (16 → 15).
 * Nəticə Figma ilə eynidir: 286 / 202 / 200 (brauzerdə ölçülüb).
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import Link from 'next/link'
import type { ReactNode } from 'react'

type StatCardProps = {
  title: string
  dateLabel?: string | null
  /** Başlıq bu səhifəyə keçid olur (Figma-da kartda ayrıca düymə yoxdur). */
  href?: string
  children: ReactNode
  className?: string
  slot?: string
}

export function StatCard({ title, dateLabel, href, children, className, slot }: StatCardProps) {
  return (
    <section
      data-slot={slot ?? 'stat-card'}
      aria-label={title}
      // `cn` — ötürülən padding (məs. dəhliz `py-[19px]`) base-i əvəz etsin, CSS sırasından asılı olmasın.
      className={cn('bg-background border-border flex flex-col gap-4 rounded-xs border px-5 py-[15px]', className)}
    >
      <div className="flex h-7 items-center justify-between gap-5">
        <h3 className="text-foreground text-xl/7 font-semibold">
          {href ? (
            <Link href={href} className="hover:text-primary hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {dateLabel ? <p className="text-muted-foreground shrink-0 text-sm font-medium">{dateLabel}</p> : null}
      </div>
      {/* Figma-da xətt 0 hündürlükdədir — `-mb-px` 1px-lik çərçivəni layout-dan çıxarır. */}
      <div className="border-border -mb-px border-t" aria-hidden="true" />
      {children}
    </section>
  )
}

type StatBoxProps = {
  label: string
  value: string
  note?: string | null
  accent?: boolean
  /**
   * `corridor` — Figma `809:24705` / `809:24715`: 100px, məzmun hər iki oxda mərkəzdə, aralıq 8;
   * etiket 16/24 (boz), 16/20 (teal, iki sətir); dəyər 24/28.
   * `inflation` — Figma `809:24668` / `809:24673`: 110px, məzmun hər iki oxda mərkəzdə, aralıq 8;
   * etiket 16/28; dəyər 24/28 (teal) və 20/28 (boz "Hədəf"); tarix 14/28, dəyərə yapışıq.
   */
  variant: 'corridor' | 'inflation'
  className?: string
}

/** Etiket + dəyər qutusu (Figma dəhliz/inflyasiya qutuları). `accent` — teal fon, ağ mətn. */
export function StatBox({ label, value, note, accent = false, variant, className }: StatBoxProps) {
  const tone = accent ? 'bg-site-accent-strong text-primary-foreground' : 'bg-site-surface text-foreground'

  if (variant === 'inflation') {
    return (
      <div
        className={cn(
          'flex h-[110px] flex-col items-center justify-center gap-2 rounded-xs text-center',
          tone,
          accent ? 'p-3.5' : 'text-site-text-strong px-4 py-5',
          className,
        )}
      >
        <span className="text-base/7 font-semibold">{label}</span>
        <div className="flex flex-col items-center">
          <strong className={cn('font-bold', accent ? 'text-2xl/7' : 'text-xl/7')}>{value}</strong>
          {note ? <span className="text-site-on-accent-muted text-sm/7 font-medium">{note}</span> : null}
        </div>
      </div>
    )
  }

  // Figma-da etiket mətni qutunun 16px padding-indən enlidir (`Yuxarı həddi` 100, `Uçot faiz
  // dərəcəsi` 109 — qutu 110), ona görə üfüqi padding yoxdur, yoxsa etiket iki sətrə düşər.
  return (
    <div
      className={cn(
        'flex h-[100px] flex-col items-center justify-center gap-2 rounded-xs text-center',
        tone,
        accent ? '' : 'text-site-text-strong',
        className,
      )}
    >
      <span className={cn('text-base font-semibold', accent ? 'leading-5' : 'text-muted-foreground leading-6')}>
        {label}
      </span>
      <strong className="text-2xl/7 font-bold">{value}</strong>
      {note ? <span className="text-sm/5 font-medium">{note}</span> : null}
    </div>
  )
}
