/**
 * `yyyy-MM-dd` → `dd.MM.yyyy` LOKAL gün kimi. `shared/crud/date-io#formatDate`
 * tarix-only sətri `new Date()` ilə UTC gecəyarısı oxuyur və qərb saat
 * qurşaqlarında bir gün geri sürüşür; vərəq tarixi "gün" anlayışıdır, ona görə
 * kit `parseDate`/`formatDate` (lokal) ilə çevrilir — DatePicker ilə eyni.
 */

import { formatDate as kitFormatDate } from '@cbar/lib-react-ui-kit/date-picker'

import { dateStringToDate } from '@/shared/crud/date-io'

export const DAY_FORMAT = 'dd.MM.yyyy'

export function formatDay(value: string | null | undefined): string {
  const date = dateStringToDate(value)
  return date ? kitFormatDate(date, DAY_FORMAT) : '—'
}
