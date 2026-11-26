/**
 * Brend və template dəyərlərinin TƏK MƏNBƏYİ (template spec 005, FR-002).
 *
 * Burada yalnız tərcümə olunmayan xüsusi adlar və URL saxlanılır — istifadəçiyə
 * görünən cümlələr i18n-dədir və `{{appName}}` interpolyasiyası ilə bu dəyərləri alır.
 *
 * `templateInfo.enabled: false` — bu, artıq starter template deyil, CBAR CMS admin
 * panelidir; template göstəricisi bütün səthlərdə söndürülüb.
 */

export const brand = {
  /** Breadcrumb kökü və qısa istinadlar. */
  shortName: 'CBAR',
  /** Sidebar, brauzer tab başlığı, giriş kartı. */
  appName: 'CBAR Admin',
} as const

export interface TemplateInfo {
  /** `false` → `TemplateBadge` heç nə render etmir. */
  enabled: boolean
  /** Yalnız `https://` — Maddə X.1 (sxem kompilyasiya səviyyəsində sabitlənir). */
  repoUrl: `https://${string}`
  /** Yalnız MSW demo rejimi (`VITE_ENABLE_MSW=true`) üçün seed admin şifrəsi. */
  demoPassword: string
}

export const templateInfo: TemplateInfo = {
  enabled: false,
  repoUrl: 'https://gitlab.cbar.az/cbar/web-cbar-admin',
  demoPassword: 'ChangeMe123!',
}
