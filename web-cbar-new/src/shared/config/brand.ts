/**
 * Brend göstəricilərinin **tək mənbəyi** (spec 002 research R1).
 *
 * `displayName` yalnız `<title>` fallback-ı və `alt` mətnləri üçündür; interfeysdə
 * görünən ad i18n-dən gəlir (`common:brand.name`), çünki iki dildə fərqlidir.
 */

export const brand = {
  /** Sayt başlığı (`<title>` sonluğu) — hər iki dildə tanınan qısa forma. */
  displayName: 'CBAR',
  /** Qısa forma — dar yerlərdə işlədilir. */
  shortName: 'CBAR',
} as const

/**
 * Şablon göstəriciləri söndürülüb: bu layihə artıq şablon deyil (research R1).
 * Demo şifrə yoxdur — public sayt anonimdir (spec 002 D3).
 */
export const templateInfo = {
  enabled: false,
} as const

export type Brand = typeof brand
export type TemplateInfo = typeof templateInfo
