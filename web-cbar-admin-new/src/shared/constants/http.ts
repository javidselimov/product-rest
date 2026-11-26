/**
 * HTTP status codes the panel branches on (spec 032). `shared/api/types.ts`
 * maps them to `AppError.code`; features compare `error.status` against these
 * instead of bare numbers.
 */
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNSUPPORTED_MEDIA_TYPE: 415,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const
