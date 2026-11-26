/**
 * SERVER-ONLY — mühit dəyişənləri (spec 002 contracts/runtime-config.md §1).
 *
 * Bu modul client bundle-ına **düşmür**: client faylından import etmək ESLint ilə
 * qadağandır (konstitusiya Maddə XI.2). Dəyərlər runtime-da oxunur, build-ə
 * bişirilmir — eyni image üç mühitdə yenidən build olmadan işləyir (FR-026).
 *
 * `NEXT_PUBLIC_*` dəyişəni bu layihədə yoxdur (Maddə VIII.2). Public sayt
 * anonimdir — sessiya cookie-si və mock bayrağı silinib (spec 002 D3, research R12).
 */
import { z } from 'zod'

const envSchema = z.object({
  /** `api-cbar` kök ünvanı. Yalnız server oxuyur — brauzer birbaşa API-yə getmir. */
  API_URL: z.url({ message: 'düzgün URL olmalıdır' }).default('http://localhost:5139'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  TZ: z.string().min(1).default('Asia/Baku'),
  /**
   * CSP `frame-src`-ə əlavə mənbələr (boşluqla ayrılmış) — CMS məzmunundakı ümumi
   * `<iframe>`-lər üçün. YouTube həmişə icazəlidir (research R5).
   */
  CSP_FRAME_SRC: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.split(/\s+/).filter(Boolean) : [])),
})

export type EnvironmentConfig = z.infer<typeof envSchema>

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  • ${issue.path.join('.') || '(kök)'} — ${issue.message}`)
    .join('\n')
}

function parseEnv(source: NodeJS.ProcessEnv): EnvironmentConfig {
  const result = envSchema.safeParse({
    API_URL: source.API_URL,
    NODE_ENV: source.NODE_ENV,
    TZ: source.TZ,
    CSP_FRAME_SRC: source.CSP_FRAME_SRC,
  })

  if (!result.success) {
    throw new Error(
      [
        'Mühit konfiqurasiyası yanlışdır — tətbiq başladıla bilmir.',
        formatIssues(result.error),
        'Dəyərlər `.ci-cd/{dev,test,prod}.yaml` faylındakı `env` siyahısından gəlir.',
      ].join('\n'),
    )
  }

  return result.data
}

/** `API_URL`-in origin-i (`https://host`) — CSP `img-src`/`media-src` üçün. */
export function apiOrigin(config: EnvironmentConfig = env): string {
  return new URL(config.API_URL).origin
}

/** Boot-da bir dəfə yoxlanılır; yanlışdırsa proses aydın mesajla dayanır. */
export const env: EnvironmentConfig = parseEnv(process.env)

/** Testlər üçün: sxemi ixtiyari mənbə ilə yoxlamağa imkan verir. */
export { parseEnv }
