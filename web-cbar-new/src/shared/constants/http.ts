/**
 * HTTP status codes the site produces or inspects (spec 032). Only the codes in use are
 * listed — add a name here instead of writing the number at the call site.
 */
export const HTTP_STATUS = {
  OK: 200,
  NOT_MODIFIED: 304,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const
