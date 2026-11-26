/**
 * The suffix after a year in Azerbaijani: "2026-cı il", "2027-ci il", "2030-cu il" (spec 039 research
 * R14). It follows the vowel harmony of the last spoken word of the number: the units if not zero,
 * else the tens, else hundreds ("yüz") or thousands ("min").
 */

/** By the units digit: bir, iki, üç, dörd, beş, altı, yeddi, səkkiz, doqquz. */
const BY_UNITS = ['', 'ci', 'ci', 'cü', 'cü', 'ci', 'cı', 'ci', 'ci', 'cu']
/** By the tens digit: on, iyirmi, otuz, qırx, əlli, altmış, yetmiş, səksən, doxsan. */
const BY_TENS = ['', 'cu', 'ci', 'cu', 'cı', 'ci', 'cı', 'ci', 'ci', 'cı']
const AFTER_HUNDRED = 'cü' // yüz
const AFTER_THOUSAND = 'ci' // min

const BASE = 10

export function azYearSuffix(year: number): string {
  const units = year % BASE
  if (units !== 0) return BY_UNITS[units]!
  const tens = Math.floor(year / BASE) % BASE
  if (tens !== 0) return BY_TENS[tens]!
  const hundreds = Math.floor(year / (BASE * BASE)) % BASE
  return hundreds !== 0 ? AFTER_HUNDRED : AFTER_THOUSAND
}
