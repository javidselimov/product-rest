/** Ay nömrəsi → `common:months.<n>` etiketi (siyahı sütunu üçün). */

import { useTranslation } from 'react-i18next'

export function MonthCell({ month }: { month: number }) {
  const { t } = useTranslation('common')
  return <>{t(`months.${month}`, { defaultValue: String(month) })}</>
}
