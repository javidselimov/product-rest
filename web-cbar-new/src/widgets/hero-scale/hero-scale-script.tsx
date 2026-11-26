/**
 * Ana səhifə birinci ekranının miqyas skripti (server komponenti).
 *
 * `public/scripts/hero-scale.js` `--hero-scale`-i (header-dən sonra qalan hündürlük / 744) yazır,
 * `views/home` birinci ekran sırasına `zoom: var(--hero-scale, 1)` verir — zoom nə olursa olsun
 * slayder + sağ panel ekranı Figma kompozisiyasının miqyaslanmış surəti kimi tutur.
 *
 * Teq **sinxron**dur (`defer`/`async` yox, `next/script` yox): hero-dan əvvəl icra olunmalıdır ki,
 * ilk boyamada miqyas hazır olsun və blok sıçramasın. Inline kod əvəzinə fayl — `dangerouslySetInnerHTML`
 * yalnız `widgets/cms-content`-dədir.
 */
export const HERO_SCALE_SRC = '/scripts/hero-scale.js'

export function HeroScaleScript({ nonce }: { nonce: string | undefined }) {
  // eslint-disable-next-line @next/next/no-sync-scripts -- ilk boyamadan əvvəl miqyas lazımdır, `defer` blokun sıçramasına səbəb olur (~0.5 KB yerli fayl)
  return <script src={HERO_SCALE_SRC} nonce={nonce} />
}
