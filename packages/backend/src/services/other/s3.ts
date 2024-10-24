import { getSomeEnv } from '@/backend/src/services/other/env.js'
import { S3Client } from '@aws-sdk/client-s3'
import _ from 'lodash'

export const getS3Client = _.memoize(() => {
  const env = getSomeEnv(['S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME', 'S3_REGION', 'S3_ENDPOINT'])
  if (!env.S3_ACCESS_KEY_ID) {
    throw new Error('S3_ACCESS_KEY_ID is missing')
  }
  if (!env.S3_SECRET_ACCESS_KEY) {
    throw new Error('S3_SECRET_ACCESS_KEY is missing')
  }
  if (!env.S3_BUCKET_NAME) {
    throw new Error('S3_BUCKET_NAME is missing')
  }
  if (!env.S3_REGION) {
    throw new Error('S3_REGION is missing')
  }
  const s3Client = new S3Client({
    endpoint: env.S3_ENDPOINT || undefined,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  })
  return s3Client
})
