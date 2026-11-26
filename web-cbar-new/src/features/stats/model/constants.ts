/**
 * AZIR and statistics page constants (spec 021, spec 032).
 */
import type { FractionOptions } from '@/entities/content'

/** Default AZIR range: today − 60 … today (spec 021 FR-011); also the home card's window (R13). */
export const AZIR_DEFAULT_DAYS = 60
/** 10 years — a longer range is a `tooLong` error (spec 021 SC-005, export size). */
export const AZIR_MAX_RANGE_DAYS = 3653

/** Rate column: at least 2, at most 4 decimals ("7,25 %"). */
export const AZIR_RATE_FRACTION: FractionOptions = { minFraction: 2, maxFraction: 4 }
/** Volume column: always 2 decimals (million AZN). */
export const AZIR_VOLUME_FRACTION: FractionOptions = { minFraction: 2, maxFraction: 2 }
