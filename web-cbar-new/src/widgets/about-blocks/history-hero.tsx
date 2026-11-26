/**
 * Tarix hero kartı — Figma `1845:118925` (984×206, r8, göy gradient, Lora 36/600 ağ; mobil 342×120, 24/600).
 * Başlıqdakı `<em>` vurğu rəngi ilə kursivdir ("mərkəzi bankçılıq"). Lora saytda yalnız bu başlıqda və Missiya
 * bannerinin vurğularındadır (`font-serif`, research R11); fayllar `fonts.css`-dədir.
 */
import { CmsContent } from '@/widgets/cms-content/cms-content'

type HistoryHeroProps = Readonly<{ html: string }>

export function HistoryHero({ html }: HistoryHeroProps) {
  return (
    <section
      data-slot="history-hero"
      className="from-site-hero-from to-site-hero-to flex min-h-30 items-center rounded-md bg-linear-to-br p-6 tab:min-h-[206px] tab:p-[50px]"
    >
      <CmsContent
        html={`<p>${html}</p>`}
        // Figma mətn qutusu 404, 36/53 — kitin `text-4xl`-i 44px-dir, ona görə arbitrary. Lora-da 2 sətrə sığır.
        // `m-0!`: qatsız `.cms-content p { margin-bottom: 1rem }` adi utility-ni üstələyir (kart 222 olurdu, Figma 206).
        className="max-w-[404px] [&_em]:text-site-accent-strong [&_p]:m-0! [&_p]:font-serif [&_p]:text-2xl [&_p]:leading-9 [&_p]:font-semibold [&_p]:text-primary-foreground tab:[&_p]:text-[36px] tab:[&_p]:leading-[53px]"
      />
    </section>
  )
}
