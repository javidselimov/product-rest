/** API-nin üç xəta forması (contracts/admin-api.md §2) — MSW cavab köməkçiləri. */

import { HttpResponse } from 'msw'

/** Bare `NotFound()` → RFC 9110 ProblemDetails. */
export const problem404 = () =>
  HttpResponse.json(
    {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.5',
      title: 'Not Found',
      status: 404,
      traceId: '00-test',
    },
    { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
  )

/** ValidationProblemDetails. */
export const validation400 = (errors: Record<string, string[]>) =>
  HttpResponse.json(
    {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'One or more validation errors occurred.',
      status: 400,
      errors,
      traceId: '00-test',
    },
    { status: 400 },
  )

/** Açıq `{ message }` gövdəsi (BadRequest/Conflict/NotFound). */
export const message = (status: number, text: string) =>
  HttpResponse.json({ message: text }, { status })

export const noContent = () => new HttpResponse(null, { status: 204 })
