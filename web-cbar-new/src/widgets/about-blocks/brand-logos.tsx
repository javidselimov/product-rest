/**
 * "Central Bank logo" page body (spec 040, Figma `2071:2843`): hero, the text and version grid, the
 * remaining text, download cards. One block, because its gaps (28/32/36) differ from `AboutBlocks`.
 * Sizes: `specs/040-media-logo/contracts/ui-contract.md`.
 *
 * CMS media images: size and format come from the editor, `next/image` is not used (spec 002 D4),
 * and logos stay outside `SiteImage` (spec 036).
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { ArrowDownIcon } from '@cbar/lib-react-ui-kit/icons'

import { formatFileSize } from '@/entities/content'
import type { BrandLogosBlock, LogoBackground, LogoDownload, LogoVersion } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { CmsContent } from '@/widgets/cms-content/cms-content'

const PREVIEW_BACKGROUND: Record<LogoBackground, string> = {
  light: 'bg-site-surface',
  dark: 'bg-site-logo-dark',
}

const CARD = 'border-site-logo-border bg-background rounded-xs border'

function Hero({ version }: Readonly<{ version: LogoVersion }>) {
  if (!version.image) return null
  return (
    <div
      data-slot="logo-hero"
      className={cn('flex h-[170px] items-center justify-center rounded-xs px-6 tab:h-[250px] desk:h-80', PREVIEW_BACKGROUND[version.background])}
    >
      {/* The first version card carries the name, so the enlarged copy is decorative. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS media logo */}
      <img src={version.image.src} alt="" className="max-h-full w-full max-w-[244px] object-contain tab:max-w-[520px]" />
    </div>
  )
}

function VersionCard({ version }: Readonly<{ version: LogoVersion }>) {
  return (
    <li className={cn(CARD, 'flex flex-col overflow-hidden desk:min-h-[282px]')}>
      <div className={cn('flex h-30 items-center justify-center p-3 tab:h-[170px] tab:p-5', PREVIEW_BACKGROUND[version.background])}>
        {version.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- CMS media logo
          <img src={version.image.src} alt={version.image.alt} className="max-h-full max-w-full object-contain" />
        ) : null}
      </div>
      <div className="flex flex-col gap-1 p-3 tab:px-4 tab:py-3.5">
        <h3 className="text-foreground text-sm leading-5 font-semibold wrap-anywhere tab:text-[15px]">{version.title}</h3>
        {version.description ? (
          <p className="text-site-logo-muted text-xs leading-[19px] tab:text-[13px]">{version.description}</p>
        ) : null}
      </div>
    </li>
  )
}

function DownloadCard({ file, locale }: Readonly<{ file: LogoDownload; locale: Locale }>) {
  const t = getT(locale, 'media')
  const size = file.size > 0 ? formatFileSize(file.size, locale) : ''
  const label = [t('logo.downloadFile', { label: file.label }), size].filter(Boolean).join(', ')

  return (
    <li className={cn(CARD, 'flex flex-col items-start gap-3 p-5')}>
      {file.label ? (
        <span className="border-site-logo-chip-border text-site-text-strong rounded-full border px-3 py-1 text-[13px] leading-[17px] font-bold wrap-anywhere">
          {file.label}
        </span>
      ) : null}
      {size ? <span className="text-site-logo-muted text-[13px] leading-[17px]">{size}</span> : null}
      <a
        href={file.url}
        download
        aria-label={label}
        className="bg-site-logo-download text-site-logo-download-text inline-flex items-center gap-1.5 rounded-xs px-3 py-2 text-[13px] leading-[18px] font-semibold hover:underline"
      >
        <ArrowDownIcon className="size-3.5" aria-hidden="true" />
        {t('logo.download')}
      </a>
    </li>
  )
}

export function BrandLogos({ block, locale }: Readonly<{ block: BrandLogosBlock; locale: Locale }>) {
  return (
    <div data-slot="brand-logos" className="flex flex-col gap-7 tab:gap-8 desk:gap-9">
      {block.hero ? <Hero version={block.hero} /> : null}
      {block.versions.length > 0 ? (
        <div className="flex flex-col gap-5">
          <CmsContent html={block.introHtml} variant="logo" />
          <ul data-slot="logo-versions" className="grid grid-cols-2 gap-3 tab:gap-5 desk:grid-cols-4">
            {block.versions.map((version, index) => (
              <VersionCard key={`${index}-${version.title}`} version={version} />
            ))}
          </ul>
        </div>
      ) : (
        <CmsContent html={block.introHtml} variant="logo" />
      )}
      <CmsContent html={block.restHtml} variant="logo" />
      {block.downloads.length > 0 ? (
        <ul data-slot="logo-downloads" className="grid grid-cols-1 gap-3 tab:grid-cols-3 tab:gap-4 desk:gap-5">
          {block.downloads.map((file) => (
            <DownloadCard key={file.id} file={file} locale={locale} />
          ))}
        </ul>
      ) : null}
    </div>
  )
}
