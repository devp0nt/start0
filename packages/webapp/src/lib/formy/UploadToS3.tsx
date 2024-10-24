import css from './UploadsToS3.module.scss'
import { getS3UploadName } from '@/general/src/upload/utils.shared.js'
import { useAppContext } from '@/webapp/src/lib/ctx.js'
import { useFormyField } from '@/webapp/src/lib/formy.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Button, Buttons, FormItem } from '@/webapp/src/lib/uninty.components.js'
import { useRef, useState } from 'react'
import type { FormyInputPropsGeneral } from 'svag-formy/dist/utils.js'

export const useUploadToS3 = () => {
  const prepareS3Upload = trpc.prepareS3Upload.useMutation()

  const uploadToS3 = async (file: File) => {
    const { signedUrl, s3Key } = await prepareS3Upload.mutateAsync({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })

    return await fetch(signedUrl, {
      method: 'PUT',
      body: file,
    })
      .then(async (rawRes) => {
        return await rawRes.text()
      })
      .then((res) => {
        return { s3Key, res }
      })
  }

  return { uploadToS3 }
}

export const UploadToS3 = ({
  label,
  name,
  formy,
  hint,
}: FormyInputPropsGeneral & React.ComponentProps<typeof FormItem>) => {
  const { error, value } = useFormyField({ formy, name })
  const ctx = useAppContext()
  const disabled = formy.isSubmitting

  const inputEl = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const { uploadToS3 } = useUploadToS3()

  return (
    <FormItem label={label} hint={hint} error={error}>
      <input
        className={css.fileInput}
        type="file"
        disabled={loading || disabled}
        accept="*"
        ref={inputEl}
        onChange={({ target: { files } }) => {
          void (async () => {
            setLoading(true)
            try {
              if (files?.length) {
                const file = files[0]
                const { s3Key } = await uploadToS3(file)
                void formy.setFieldValue(name, s3Key)
              }
            } catch (error_: any) {
              // eslint-disable-next-line no-console
              console.error(error_)
              formy.setFieldError(name, error_.message)
            } finally {
              void formy.setFieldTouched(name, true, false)
              setLoading(false)
              if (inputEl.current) {
                inputEl.current.value = ''
              }
            }
          })()
        }}
      />
      {!!value && !loading && (
        <div className={css.uploads}>
          <div className={css.upload}>
            <a className={css.uploadLink} target="_blank" href={ctx.getS3UploadUrl(value)} rel="noreferrer">
              {getS3UploadName(value)}
            </a>
          </div>
        </div>
      )}
      <div className={css.buttons}>
        <Buttons>
          <Button
            type="button"
            onClick={() => inputEl.current?.click()}
            loading={loading}
            disabled={loading || disabled}
          >
            {value ? 'Upload More' : 'Upload'}
          </Button>
          {!!value && !loading && (
            <Button
              type="button"
              onClick={() => {
                void formy.setFieldValue(name, null)
                formy.setFieldError(name, undefined)
                void formy.setFieldTouched(name)
              }}
              disabled={disabled}
            >
              Remove
            </Button>
          )}
        </Buttons>
      </div>
    </FormItem>
  )
}
