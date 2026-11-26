/**
 * Vahid xəta tipi (contracts/mock-api.md §Xəta kontraktı, FR-029).
 *
 * Axın: Axios interceptor → `normalizeApiError` → `AppError` → TanStack Query → UI
 * (konstitusiya Maddə VII.2). Raw texniki mesaj istifadəçiyə **heç vaxt** çatmır:
 * `message` sahəsi Azərbaycan dilində, domainə uyğun mətndir (Maddə I.4, VII.3).
 *
 * **Bu modul zod-suzdur** (spec 003 D2). Səbəb: `src/providers/query-client.ts`
 * client modulundan `AppError`-u import edir, ona görə buradakı hər asılılıq bütün
 * client bundle-ına düşür. Sxem yoxlaması brauzerdə heç vaxt olmur — normalizasiya
 * və parse funksiyaları `./app-error-parse` server-only modulundadır.
 */
import { HTTP_STATUS } from '@/shared/constants/http'

/** UI-ın davranışını seçdiyi kateqoriya (contracts/mock-api.md cədvəli). */
export type AppErrorKind =
  | 'validation' // 400 — form sahə xətası
  | 'auth' // 401 — avtomatik çıxış
  | 'forbidden' // 403 — icazə mesajı, çıxış yox
  | 'notFound' // 404 — boş vəziyyət
  | 'server' // 5xx — ümumi xəta + yenidən cəhd
  | 'network' // şəbəkə/timeout
  | 'schema' // cavab sxemə uyğun deyil
  | 'unknown'

const FALLBACK_MESSAGE: Record<AppErrorKind, string> = {
  validation: 'Göndərilən məlumat düzgün deyil.',
  auth: 'Sessiya bitib. Yenidən daxil olun.',
  forbidden: 'Bu əməliyyat üçün icazəniz yoxdur.',
  notFound: 'Axtarılan məlumat tapılmadı.',
  server: 'Serverdə xəta baş verdi. Bir azdan yenidən cəhd edin.',
  network: 'Şəbəkə ilə əlaqə qurulmadı. İnternet bağlantınızı yoxlayın.',
  schema: 'Serverdən gözlənilməyən formatda cavab gəldi.',
  unknown: 'Gözlənilməz xəta baş verdi.',
}

export class AppError extends Error {
  readonly code: string
  readonly kind: AppErrorKind
  readonly status?: number
  /** Yalnız daxili diaqnostika üçün — UI-da göstərilmir, log-a redakt edilmiş düşür. */
  readonly details?: unknown

  constructor(params: {
    code: string
    message: string
    kind: AppErrorKind
    status?: number
    details?: unknown
  }) {
    super(params.message)
    this.name = 'AppError'
    this.code = params.code
    this.kind = params.kind
    this.status = params.status
    this.details = params.details
  }
}

export function kindFromStatus(status: number | undefined): AppErrorKind {
  if (status === undefined) return 'network'
  if (status === HTTP_STATUS.BAD_REQUEST || status === HTTP_STATUS.UNPROCESSABLE_ENTITY) return 'validation'
  if (status === HTTP_STATUS.UNAUTHORIZED) return 'auth'
  if (status === HTTP_STATUS.FORBIDDEN) return 'forbidden'
  if (status === HTTP_STATUS.NOT_FOUND) return 'notFound'
  if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) return 'server'
  return 'unknown'
}

export { FALLBACK_MESSAGE }
