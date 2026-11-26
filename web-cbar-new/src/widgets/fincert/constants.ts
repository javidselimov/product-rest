/**
 * FinCERT classes shared by the cards of the page, so their frames cannot drift apart. Sizes:
 * `specs/053-fincert-page/contracts/ui-contract.md` (radius 4, 1 px #D4D4D4, white).
 */
export const CARD_CLASS = 'border-site-divider bg-background rounded-xs border'

/** A card that is a link: one focus stop, the border turns primary on hover. */
export const LINK_CARD_CLASS =
  'hover:border-primary focus-visible:outline-ring transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2'

/** Section heading 24/32 600, 20/28 on mobile. */
export const SECTION_TITLE_CLASS = 'text-foreground text-xl leading-7 font-semibold tab:text-2xl tab:leading-8'

/** Logo box of a membership card, 120 × 48. */
export const MEMBERSHIP_LOGO_SIZES = '120px'
