/**
 * Bülleten importu (spec 025): tarix + Mərkəzi Bankın `.xlsx` faylı → server
 * faylı oxuyub dərhal yazır (legacy kimi, baxış addımı yoxdur). Tarixdə artıq
 * məzənnə varsa server `409 sheet_exists` qaytarır — dialoq təsdiq istəyir və
 * eyni sorğunu `overwrite` ilə təkrarlayır. Valideyn dialoqu açanda mount edir,
 * ona görə hər açılış təmiz state ilə başlayır.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { DatePicker } from '@cbar/lib-react-ui-kit/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@cbar/lib-react-ui-kit/dialog'
import { Field, FieldError, FieldLabel } from '@cbar/lib-react-ui-kit/field'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { Upload, UploadDropzone } from '@cbar/lib-react-ui-kit/upload'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { XLSX_ACCEPT } from '@/shared/constants/files'
import { HTTP_STATUS } from '@/shared/constants/http'
import { dateStringToDate, dateToDateString } from '@/shared/crud/date-io'
import { useImportSheet } from '../hooks/use-currency'
import { formatDay } from '../model/format-day'
import { IMPORT_ERROR_CODES, type RateImportResult } from '../model/schemas'


interface RateImportDialogProps {
  /** Default tarix (`yyyy-MM-dd`); null → bu gün. */
  initialDate: string | null
  onClose: () => void
  onImported: (result: RateImportResult) => void
}

export function RateImportDialog({
  initialDate,
  onClose,
  onImported,
}: RateImportDialogProps) {
  const { t, i18n } = useTranslation(['currency', 'common'])
  const importSheet = useImportSheet()
  const [date, setDate] = useState(initialDate ?? dateToDateString(new Date()))
  const [file, setFile] = useState<File | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    date?: string
    file?: string
  }>({})
  /** null deyilsə — 409 gəlib, həmin tarixdə bu qədər məzənnə var. */
  const [existingCount, setExistingCount] = useState<number | null>(null)

  const pickerLocale = i18n.language.startsWith('en') ? 'en-GB' : 'az-AZ'

  const submit = (overwrite: boolean) => {
    const errors = {
      date: date ? undefined : t('import.errors.pickDate'),
      file: file ? undefined : t('import.errors.pickFile'),
    }
    setFieldErrors(errors)
    if (!file || !date) return

    importSheet.mutate(
      { date, file, overwrite },
      {
        onSuccess: onImported,
        // `unknown`: interceptor `AppError` atır (Error deyil), tipdə isə Error yazılıb.
        onError: (error: unknown) => {
          if (
            isAppError(error) &&
            error.status === HTTP_STATUS.CONFLICT &&
            error.code === 'sheet_exists'
          ) {
            const count = Number(error.details?.count)
            setExistingCount(Number.isFinite(count) ? count : 0)
          }
        },
      },
    )
  }

  const errorMessage = (() => {
    const error: unknown = importSheet.error
    if (!error || existingCount !== null) return null
    if (!isAppError(error)) return t('common:errors.unexpected')
    const code = error.code as (typeof IMPORT_ERROR_CODES)[number] | undefined
    if (code && IMPORT_ERROR_CODES.includes(code)) {
      return t(`import.errors.${code}`, {
        row: error.details?.row,
        currency: error.details?.currency,
      })
    }
    return error.message
  })()

  const confirming = existingCount !== null

  return (
    <Dialog open onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('import.title')}</DialogTitle>
          <DialogDescription>{t('import.description')}</DialogDescription>
        </DialogHeader>

        {confirming ? (
          <Alert variant="surface" colorPalette="yellow">
            <AlertDescription>
              {t('import.confirmOverwrite', {
                count: existingCount,
                date: formatDay(date),
              })}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="import-date">{t('import.date')}</FieldLabel>
              <DatePicker
                id="import-date"
                value={dateStringToDate(date)}
                onChange={(next) => setDate(dateToDateString(next))}
                format="dd.MM.yyyy"
                locale={pickerLocale}
                aria-label={t('import.date')}
              />
              {fieldErrors.date ? (
                <FieldError>{fieldErrors.date}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="import-file">{t('import.file')}</FieldLabel>
              <Upload
                id="import-file"
                accept={XLSX_ACCEPT}
                aria-label={t('import.file')}
                disabled={importSheet.isPending}
                beforeUpload={(picked) => {
                  setFile(picked)
                  setFieldErrors((prev) => ({ ...prev, file: undefined }))
                  importSheet.reset()
                  // Fayl yalnız seçilir; göndərmə "Yüklə" düyməsi ilədir.
                  return false
                }}
              >
                <UploadDropzone
                  title={file ? file.name : t('import.pickFile')}
                  hint={t('import.fileHint')}
                />
              </Upload>
              {fieldErrors.file ? (
                <FieldError>{fieldErrors.file}</FieldError>
              ) : null}
            </Field>
            {errorMessage ? (
              <Alert variant="surface" colorPalette="red">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            colorPalette="black"
            onClick={
              confirming
                ? () => {
                    setExistingCount(null)
                    importSheet.reset()
                  }
                : onClose
            }
            disabled={importSheet.isPending}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={() => submit(confirming)}
            disabled={importSheet.isPending}
          >
            {importSheet.isPending ? <Spinner className="size-4" /> : null}
            {confirming ? t('import.overwrite') : t('import.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
