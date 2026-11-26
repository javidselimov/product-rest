/**
 * Nazik log köməkçisi.
 *
 * Konstitusiya Maddə VII.5 / X.3: token, şifrə və şəxsi məlumat log-a düşmür.
 * Ona görə burada obyekt sərbəst şəkildə seriallaşdırılmır — həssas açarlar
 * çıxarılır. Log-lar `production`-da yalnız `warn` və `error` səviyyəsindədir.
 */
import { REDACT_MAX_DEPTH } from '@/shared/constants/limits'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const SENSITIVE_KEY = /(token|password|şifrə|secret|authorization|cookie|jwt)/i

const isProduction = process.env.NODE_ENV === 'production'

/** Həssas açarları dəyəri ilə birlikdə `[gizlədildi]` ilə əvəz edir. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > REDACT_MAX_DEPTH || value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1))

  const result: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEY.test(key) ? '[gizlədildi]' : redact(item, depth + 1)
  }
  return result
}

function write(level: LogLevel, message: string, context?: unknown) {
  if (isProduction && (level === 'debug' || level === 'info')) return

  const payload = context === undefined ? [] : [redact(context)]
  // Konsola yazan yeganə yer buradır — qalan kod `logger`-dən keçir.
  console[level === 'debug' ? 'log' : level](`[${level}] ${message}`, ...payload)
}

export const logger = {
  debug: (message: string, context?: unknown) => write('debug', message, context),
  info: (message: string, context?: unknown) => write('info', message, context),
  warn: (message: string, context?: unknown) => write('warn', message, context),
  error: (message: string, context?: unknown) => write('error', message, context),
}
