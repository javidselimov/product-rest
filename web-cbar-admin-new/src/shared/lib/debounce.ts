import { useEffect, useState } from 'react'

import { SEARCH_DEBOUNCE_MS } from '@/shared/constants/timing'

/** Dəyəri `delayMs` sonra yayan hook (axtarış/filtr sahələri üçün). */
export function useDebounced<T>(value: T, delayMs = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}
