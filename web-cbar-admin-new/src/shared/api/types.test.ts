import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { contractError, isAppError, normalizeApiError } from './types'

const axiosErrorWithResponse = (status: number, data: unknown) => {
  const error = new AxiosError('Request failed')
  error.response = {
    status,
    statusText: '',
    data,
    headers: { 'x-trace-id': 'trace-123' },
    config: { headers: new AxiosHeaders() },
  }
  return error
}

describe('normalizeApiError', () => {
  it('{ message } gövdəsini olduğu kimi götürür (Conflict/BadRequest)', () => {
    const appError = normalizeApiError(
      axiosErrorWithResponse(409, {
        message: 'File is attached to content; detach it first.',
      }),
    )
    expect(appError).toMatchObject({
      status: 409,
      code: 'CONFLICT',
      message: 'File is attached to content; detach it first.',
      traceId: 'trace-123',
    })
  })

  it('ProblemDetails (bare 404) → title mesaj olur', () => {
    const appError = normalizeApiError(
      axiosErrorWithResponse(404, {
        type: 'https://tools.ietf.org/html/rfc9110#section-15.5.5',
        title: 'Not Found',
        status: 404,
        traceId: '00-abc',
      }),
    )
    expect(appError.message).toBe('Not Found')
    expect(appError.code).toBe('NOT_FOUND')
    expect(appError.traceId).toBe('00-abc')
  })

  it('ValidationProblemDetails → fieldErrors camelCase, ilk mesaj ümumi mesaj', () => {
    const appError = normalizeApiError(
      axiosErrorWithResponse(400, {
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: {
          Translations: ['The Translations field is required.'],
          '$.status': ['The JSON value could not be converted.'],
        },
      }),
    )
    expect(appError.fieldErrors).toEqual({
      translations: 'The Translations field is required.',
      status: 'The JSON value could not be converted.',
    })
    expect(appError.message).toBe('The Translations field is required.')
    expect(appError.code).toBe('VALIDATION')
  })

  it('boş gövdəli 401/403/500 üçün Azərbaycanca default mesaj verir', () => {
    expect(normalizeApiError(axiosErrorWithResponse(401, ''))).toMatchObject({
      status: 401,
      code: 'AUTH',
      message: 'Sessiya etibarsızdır — yenidən daxil olun',
    })
    expect(normalizeApiError(axiosErrorWithResponse(403, ''))).toMatchObject({
      code: 'FORBIDDEN',
      message: 'Bu əməliyyat üçün icazəniz yoxdur',
    })
    expect(normalizeApiError(axiosErrorWithResponse(500, ''))).toMatchObject({
      code: 'SERVER',
      message: 'Gözlənilməz xəta baş verdi',
    })
  })

  it('timeout-u TIMEOUT koduna çevirir', () => {
    const error = new AxiosError('timeout', 'ECONNABORTED')
    expect(normalizeApiError(error).code).toBe('TIMEOUT')
  })

  it('cavabsız axios xətası NETWORK olur', () => {
    expect(normalizeApiError(new AxiosError('boom')).code).toBe('NETWORK')
  })

  it('axios olmayan xəta UNKNOWN olur, hazır AppError dəyişmir', () => {
    const appError = normalizeApiError(new Error('adi xəta'))
    expect(appError.code).toBe('UNKNOWN')
    expect(isAppError(appError)).toBe(true)
    const ready = contractError('rowSchema')
    expect(normalizeApiError(ready)).toBe(ready)
    expect(ready.code).toBe('CONTRACT')
  })
})
