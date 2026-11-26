/**
 * Missiya banneri — Figma `968:1094` (r8, p40, Tarix hero-su ilə eyni göy gradient) və mətni
 * `968:1095`: 22/500 ağ, sətir 168%; vurğulanan sözlər ("cavabdehliyi", "dürüstlüyü",
 * "inkişafı") Lora italik teal `secondary-500`-dür. Redaktor onları `Kursiv` ilə (`<em>`) işarələyir.
 *
 * `cms-content.css` qatsızdır və konteynerin rəng/ölçüsünü özü verir, ona görə tipoqrafiya
 * birbaşa paraqraflara (`[&_p]`) yazılır; `about` variantı son paraqrafın boşluğunu sıfırlayır.
 */
import { CmsContent } from '@/widgets/cms-content/cms-content'

type MissionBannerProps = Readonly<{ html: string }>

export function MissionBanner({ html }: MissionBannerProps) {
  return (
    <section
      data-slot="mission-banner"
      className="from-site-hero-from to-site-hero-to rounded-md bg-linear-to-br p-6 tab:p-10"
    >
      <CmsContent
        html={html}
        variant="about"
        className="[&_em]:font-serif [&_em]:text-site-accent [&_em]:italic [&_p]:text-primary-foreground [&_p]:text-lg [&_p]:leading-[1.68] [&_p]:font-medium tab:[&_p]:text-[22px]"
      />
    </section>
  )
}
