/**
 * `[locale]` seqmentinin yüklənmə vəziyyəti (spec 003 FR-019, US5).
 *
 * Bu fayl Next-də `children` ətrafında Suspense sərhədi yaradır. Nəticə: sayt
 * qabığı — başlıq, mega-menyu, altlıq — `[locale]/layout.tsx` hazır olan kimi
 * brauzerə **axır**, səhifənin məzmunu isə gələndə onun yerinə keçir. Əvvəl bütün
 * səhifə ən yavaş API blokunu gözləyirdi.
 *
 * Bir fayl bütün alt route-ları örtür (`press-releases`, `laws`, `media`, …), ona
 * görə hər biri üçün ayrıca fayl yazılmır.
 *
 * Konstitusiya Maddə VII.4: bu, sorğu səviyyəsindəki `loading`/`empty`/`error`
 * vəziyyətlərini **əvəz etmir, tamamlayır** — `RouteLoading`-in öz şərhinə bax.
 */
import { RouteLoading } from '@/shared/ui/route-states'
import { SiteContainer } from '@/shared/ui/site-container'

export default function LocaleLoading() {
  return (
    <SiteContainer>
      <RouteLoading />
    </SiteContainer>
  )
}
