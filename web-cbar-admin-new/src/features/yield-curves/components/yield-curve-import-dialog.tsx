/**
 * Gəlirlik əyrisi importu: tarix + data dəstinin `.xlsx` faylı → server faylı
 * oxuyub dərhal yazır (köhnə admin kimi, baxış addımı yoxdur). Tarixdə həmin
 * data artıq varsa server `409 date_exists` qaytarır — dialoq təsdiq istəyir və
 * eyni sorğunu `overwrite` ilə təkrarlayır (data tam əvəzlənir). Valideyn
 * dialoqu açanda mount edir, ona görə hər açılış təmiz state ilə başlayır.
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
import { useYieldCurveImport } from '../hooks/use-yield-curves'
import { IMPORT_ERROR_CODES, type YieldCurveDataset } from '../model/schemas'


/** `yyyy-MM-dd` → `dd.MM.yyyy`. */
const formatDay = (date: string) => date.split('-').reverse().join('.')

interface YieldCurveImportDialogProps {
  dataset: YieldCurveDataset
  onClose: () => void
  onImported: (date: string) => void
}

export function YieldCurveImportDialog({
  dataset,
  onClose,
  onImported,
}: YieldCurveImportDialogProps) {
  const { t, i18n } = useTranslation(['yieldCurves', 'common'])
  const importFile = useYieldCurveImport(dataset)
  const [date, setDate] = useState(dateToDateString(new Date()))
  const [file, setFile] = useState<File | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    date?: string
    file?: string
  }>({})
  /** true — 409 gəlib, həmin tarixdə bu data artıq var. */
  const [confirming, setConfirming] = useState(false)

  const pickerLocale = i18n.language.startsWith('en') ? 'en-GB' : 'az-AZ'

  const submit = (overwrite: boolean) => {
    const errors = {
      date: date ? undefined : t('import.errors.pickDate'),
      file: file ? undefined : t('import.errors.pickFile'),
    }
    setFieldErrors(errors)
    if (!file || !date) return

    importFile.mutate(
      { date, file, overwrite },
      {
        onSuccess: () => onImported(date),
        // `unknown`: interceptor `AppError` atır (Error deyil), tipdə isə Error yazılıb.
        onError: (error: unknown) => {
          if (
            isAppError(error) &&
            error.status === HTTP_STATUS.CONFLICT &&
            error.code === 'date_exists'
          )
            setConfirming(true)
        },
      },
    )
  }

  const errorMessage = (() => {
    const error: unknown = importFile.error
    if (!error || confirming) return null
    if (!isAppError(error)) return t('common:errors.unexpected')
    const code = error.code as (typeof IMPORT_ERROR_CODES)[number] | undefined
    if (code && IMPORT_ERROR_CODES.includes(code)) {
      return t(`import.errors.${code}`, {
        row: error.details?.row,
        column: error.details?.column,
      })
    }
    return error.message
  })()

  return (
    <Dialog open onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${dataset}.importTitle`)}</DialogTitle>
          <DialogDescription>
            {t(`${dataset}.importDescription`)}
          </DialogDescription>
        </DialogHeader>

        {confirming ? (
          <Alert variant="surface" colorPalette="yellow">
            <AlertDescription>
              {t('import.confirmOverwrite', { date: formatDay(date) })}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="yield-import-date">
                {t('import.date')}
              </FieldLabel>
              <DatePicker
                id="yield-import-date"
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
              <FieldLabel htmlFor="yield-import-file">
                {t('import.file')}
              </FieldLabel>
              <Upload
                id="yield-import-file"
                accept={XLSX_ACCEPT}
                aria-label={t('import.file')}
                disabled={importFile.isPending}
                beforeUpload={(picked) => {
                  setFile(picked)
                  setFieldErrors((prev) => ({ ...prev, file: undefined }))
                  importFile.reset()
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
                    setConfirming(false)
                    importFile.reset()
                  }
                : onClose
            }
            disabled={importFile.isPending}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={() => submit(confirming)}
            disabled={importFile.isPending}
          >
            {importFile.isPending ? <Spinner className="size-4" /> : null}
            {confirming ? t('import.overwrite') : t('import.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
