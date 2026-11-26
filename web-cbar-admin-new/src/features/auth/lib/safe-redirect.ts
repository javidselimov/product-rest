/** Yalnız eyni mənbəli daxili yollara qayıdış (açıq redirect qadağandır). */
export const safeRedirect = (target: string | undefined): string =>
  target && target.startsWith('/') && !target.startsWith('//') ? target : '/'
