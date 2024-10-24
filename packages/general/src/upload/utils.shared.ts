export const getS3UploadName = (path: string) => {
  const filename = path.replace(/^.*[\\/]/, '')
  const parts = filename.split('-')
  parts.shift()
  return parts.join('-')
}

export const getS3UploadUrl = (s3Url: string | undefined | null, s3Key: string) => {
  return `${s3Url || ''}/${s3Key}`
}
