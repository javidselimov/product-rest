/** Validation helpers shared by the FinCERT forms (spec 053): the general form and the two CRUD modules. */

import { i18n } from '@/shared/i18n'

/** A message of the `fincert:validation` namespace. */
export const message = (key: string, options?: Record<string, unknown>) => i18n.t(`fincert:validation.${key}`, options)

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const WEB_URL = /^https?:\/\/\S+$/i

/** The API's address rule (`FincertSupport.IsWebUrl`): a full http(s) link. */
export const isWebUrl = (value: string) => WEB_URL.test(value)

/** The API's e-mail rule (`FincertSupport.IsEmail`). */
export const isEmail = (value: string) => EMAIL.test(value)
