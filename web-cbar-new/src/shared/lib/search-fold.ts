/**
 * Search folding shared by the site's own searches (release schedule — spec 039 research R4, FAQ — spec 051 research R5).
 * The site filters itself: Postgres `ILIKE` does not fold the Azerbaijani İ/ı pair without ICU.
 */
const DOTLESS_I = /ı/g

/** Case- and dotted/dotless-i-insensitive form: "İllik", "ILLIK" and "illik" all fold to "illik". */
export function foldForSearch(text: string): string {
  return text.normalize('NFC').toLocaleLowerCase('az').replace(DOTLESS_I, 'i')
}
