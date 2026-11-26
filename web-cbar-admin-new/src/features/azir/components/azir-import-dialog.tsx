/**
 * AZIR Excel import (spec 058): the bank's daily workbook → `POST /azir/import`. Same flow as the
 * yield curve import — the server reads and writes at once; a date that already has the file's
 * terms answers 409 `date_exists`, the dialog asks and repeats the request with `overwrite`. No date
 * field: the date is in the file. On success the dialog stays open with what was written. The
 * parent mounts it on open, so every opening starts clean.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
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

import { XLSX_ACCEPT } from '@/shared/constants/files'
import { useAzirImport } from '../hooks/use-azir'
import {
  conflictOf,
  formatDay,
  importErrorText,
  type AzirImportState,
} from '../model/import-state'
import { AzirImportSummary } from './azir-import-summary'

const FILE_INPUT_ID = 'azir-import-file'

interface AzirImportDialogProps {
  onClose: () => void
}

export function AzirImportDialog({
  onClose,
}: Readonly<AzirImportDialogProps>) {
  const { t } = useTranslation(['azir', 'common'])
  const importFile = useAzirImport()
  const [state, setState] = useState<AzirImportState>({ step: 'pick' })
  const [file, setFile] = useState<File | null>(null)
  const [fileMissing, setFileMissing] = useState(false)

  const submit = (overwrite: boolean) => {
    setFileMissing(!file)
    if (!file) return
    importFile.mutate(
      { file, overwrite },
      {
        onSuccess: (result) => setState({ step: 'done', result }),
        onError: (error: unknown) => {
          const conflict = conflictOf(error)
          if (conflict) setState(conflict)
        },
      },
    )
  }

  const backToPick = () => {
    importFile.reset()
    setState({ step: 'pick' })
  }

  const errorMessage = (() => {
    if (!importFile.isError || state.step !== 'pick') return null
    const text = importErrorText(importFile.error)
    if (text.key) return t(text.key, text.values)
    return text.message ?? t('common:errors.unexpected')
  })()

  return (
    <Dialog open onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('import.title')}</DialogTitle>
          <DialogDescription>{t('import.description')}</DialogDescription>
        </DialogHeader>

        {state.step === 'done' ? <AzirImportSummary result={state.result} /> : null}

        {state.step === 'confirm' ? (
          <Alert variant="surface" colorPalette="yellow">
            <AlertDescription>
              {t('import.confirm', {
                date: formatDay(state.valueDate),
                terms: state.terms.join(', '),
              })}
            </AlertDescription>
          </Alert>
        ) : null}

        {state.step === 'pick' ? (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor={FILE_INPUT_ID}>{t('import.file')}</FieldLabel>
              <Upload
                id={FILE_INPUT_ID}
                accept={XLSX_ACCEPT}
                aria-label={t('import.file')}
                disabled={importFile.isPending}
                beforeUpload={(picked) => {
                  setFile(picked)
                  setFileMissing(false)
                  importFile.reset()
                  // Only picks the file; sending is the "Import" button.
                  return false
                }}
              >
                <UploadDropzone
                  title={file ? file.name : t('import.pickFile')}
                  hint={t('import.fileHint')}
                />
              </Upload>
              {fileMissing ? (
                <FieldError>{t('import.errors.file_required')}</FieldError>
              ) : null}
            </Field>
            {errorMessage ? (
              <Alert variant="surface" colorPalette="red">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : null}

        <ImportFooter
          step={state.step}
          pending={importFile.isPending}
          onCancel={state.step === 'confirm' ? backToPick : onClose}
          onSubmit={() => submit(state.step === 'confirm')}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}

interface ImportFooterProps {
  step: AzirImportState['step']
  pending: boolean
  onCancel: () => void
  onSubmit: () => void
  onClose: () => void
}

/** "Close" once done; otherwise cancel + import (or replace, on the confirm step). */
function ImportFooter({
  step,
  pending,
  onCancel,
  onSubmit,
  onClose,
}: Readonly<ImportFooterProps>) {
  const { t } = useTranslation(['azir', 'common'])

  if (step === 'done')
    return (
      <DialogFooter>
        <Button onClick={onClose}>{t('import.close')}</Button>
      </DialogFooter>
    )

  return (
    <DialogFooter>
      <Button
        variant="outline"
        colorPalette="black"
        onClick={onCancel}
        disabled={pending}
      >
        {t('common:actions.cancel')}
      </Button>
      <Button onClick={onSubmit} disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        {step === 'confirm' ? t('import.overwrite') : t('import.submit')}
      </Button>
    </DialogFooter>
  )
}
