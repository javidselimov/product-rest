/**
 * File size formatting (spec 032).
 */

/** Binary kilobyte — matches what the legacy site and admin panel display. */
export const BYTES_PER_KB = 1024
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const
/** Index into `FILE_SIZE_UNITS` from which a fractional digit is shown ("8,2 MB"). */
export const FRACTION_FROM_UNIT = 2
/** Values at or above this are shown without a fraction ("12 KB", not "12.3 KB"). */
export const WHOLE_NUMBER_FROM = 10
