/**
 * Köhnə cbar.az səhifələrindən götürülmüş legacy HTML nümunələri (research R11).
 * `roundtrip.test.ts` hər birini TipTap-dan keçirib struktur sayğaclarını müqayisə edir.
 */

export interface LegacySample {
  name: string
  html: string
}

export const LEGACY_SAMPLES: LegacySample[] = [
  {
    name: 'accordion',
    html:
      '<details data-accordion><summary>Bankın tarixi</summary>' +
      '<div data-type="details-content"><p>Azərbaycan Respublikasının Mərkəzi Bankı 1992-ci ildə yaradılıb.</p></div>' +
      '</details>',
  },
  {
    name: 'cədvəl',
    html:
      '<table><tbody>' +
      '<tr><th>Valyuta</th><th>Kod</th><th>Məzənnə</th></tr>' +
      '<tr><td>ABŞ dolları</td><td>USD</td><td>1.7000</td></tr>' +
      '<tr><td>Avro</td><td>EUR</td><td>1.8500</td></tr>' +
      '</tbody></table>',
  },
  {
    name: 'media link',
    html: '<p>Sənədi yükləyin: <a href="/media/3" data-media-link="">fayl</a></p>',
  },
  {
    name: 'linkli inline şəkil',
    html: '<p><a href="/media/4"><img src="/media/4" alt="Bankın binası"></a></p>',
  },
  {
    name: 'YouTube',
    html: '<div data-youtube-video><iframe src="https://www.youtube-nocookie.com/embed/abc123" width="640" height="360"></iframe></div>',
  },
  {
    name: 'Google Maps',
    html: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1d3039.5" width="600" height="450" style="border:0" allowfullscreen loading="lazy"></iframe>',
  },
]

export interface FeatureCounts {
  details: number
  tables: number
  rows: number
  mediaLinks: number
  images: number
  videos: number
}

const count = (html: string, re: RegExp): number =>
  (html.match(re) ?? []).length

/** Köhnə `roundtrip-check.mjs` ilə eyni regex sayğacları. */
export function countFeatures(html: string): FeatureCounts {
  return {
    details: count(html, /<details/g),
    tables: count(html, /<table/g),
    rows: count(html, /<tr/g),
    mediaLinks: count(html, /data-media-link/g),
    images: count(html, /<img/g),
    videos: count(html, /<iframe/g),
  }
}
