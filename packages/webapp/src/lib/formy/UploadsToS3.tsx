import css from './UploadsToS3.module.scss'
import { getS3UploadName } from '@/general/src/upload/utils.shared.js'
import { useAppContext } from '@/webapp/src/lib/ctx.js'
import { useFormyField } from '@/webapp/src/lib/formy.js'
import { useUploadToS3 } from '@/webapp/src/lib/formy/UploadToS3.js'
import { Button, FormItem } from '@/webapp/src/lib/uninty.components.js'
import { useRef, useState } from 'react'
import type { FormyInputPropsGeneral } from 'svag-formy/dist/utils.js'

export const UploadsToS3 = ({
  label,
  name,
  formy,
  hint,
}: FormyInputPropsGeneral & React.ComponentProps<typeof FormItem>) => {
  const { error, value } = useFormyField<string[]>({ formy, name })
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
        multiple
        ref={inputEl}
        onChange={({ target: { files } }) => {
          void (async () => {
            setLoading(true)
            try {
              if (files?.length) {
                const newValue = [...value]
                await Promise.all(
                  Array.from(files).map(async (file) => {
                    await uploadToS3(file).then(({ s3Key }) => {
                      newValue.push(s3Key)
                    })
                  })
                )
                void formy.setFieldValue(name, newValue)
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
      {!!value.length && (
        <div className={css.uploads}>
          {value.map((s3Key) => (
            <div key={s3Key} className={css.upload}>
              <a className={css.uploadLink} target="_blank" href={ctx.getS3UploadUrl(s3Key)} rel="noreferrer">
                {getS3UploadName(s3Key)}
              </a>
              <button
                type="button"
                className={css.delete}
                onClick={() => {
                  void formy.setFieldValue(
                    name,
                    value.filter((deletedS3Key) => deletedS3Key !== s3Key)
                  )
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={css.buttons}>
        <Button type="button" onClick={() => inputEl.current?.click()} loading={loading} disabled={loading || disabled}>
          {value.length ? 'Upload More' : 'Upload'}
        </Button>
      </div>
    </FormItem>
  )
}
