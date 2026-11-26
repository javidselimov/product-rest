/**
 * Yükləmə düyməsi (research R8): kit `Upload` HTTP-ni özü edir — `customRequest`
 * ilə `mediaService.upload`-a yönləndirilir ki, `Authorization` header-i və
 * `AppError` axını qorunsun.
 */

import { Progress } from '@cbar/lib-react-ui-kit/progress'
import { Upload } from '@cbar/lib-react-ui-kit/upload'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ACCEPT_ATTRIBUTE } from '@/entities/media/model/types'
import { isAppError } from '@/shared/api/types'
import { useMediaUpload } from '../hooks/use-media'

export function UploadButton() {
  const { t } = useTranslation('media')
  const [percent, setPercent] = useState<number | null>(null)
  const upload = useMediaUpload(setPercent)

  return (
    <div className="flex items-center gap-3">
      <Upload
        variant="button"
        accept={ACCEPT_ATTRIBUTE}
        aria-label={t('upload')}
        disabled={upload.isPending}
        customRequest={(option) => {
          setPercent(0)
          upload.mutate(option.file, {
            onSuccess: (item) => {
              setPercent(null)
              option.onSuccess?.(item)
            },
            onError: (error) => {
              setPercent(null)
              toast.error(isAppError(error) ? error.message : t('uploadFailed'))
              option.onError?.(error as Error)
            },
          })
          return { abort: () => undefined }
        }}
      >
        {t('upload')}
      </Upload>
      {percent !== null ? (
        <Progress
          value={percent}
          className="w-40"
          aria-label={t('uploading')}
        />
      ) : null}
    </div>
  )
}
