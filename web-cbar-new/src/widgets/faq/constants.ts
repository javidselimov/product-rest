/**
 * FAQ classes shared by the topic card (view A) and the topic link card (spec 051 US5), so the two frames cannot drift
 * apart. Sizes: `specs/051-faq-page/contracts/ui-contract.md` (Figma `FAQ / Mövzu`: padding 16, mobile 12, radius 4,
 * border #D4D4D4).
 */
export const TOPIC_CARD_CLASS = 'border-site-divider bg-background rounded-xs border p-3 tab:p-4'

/** Topic name 18/24 600, 17/24 on mobile. */
export const TOPIC_NAME_CLASS = 'text-foreground min-w-0 flex-1 text-[17px] leading-6 font-semibold tab:text-lg'

/** "23 sual" 14/18, #787878. */
export const TOPIC_COUNT_CLASS = 'text-site-logo-muted shrink-0 text-sm leading-[18px]'

/** Cards 16 apart, 12 on mobile. */
export const TOPIC_LIST_CLASS = 'flex flex-col gap-3 tab:gap-4'

/** `sizes` of a video preview: three across on desktop, two on tablet, full width on mobile. */
export const VIDEO_IMAGE_SIZES = '(min-width: 1024px) 424px, (min-width: 640px) 50vw, 100vw'
