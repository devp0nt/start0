import { zPrepareS3UploadTrpcInput } from './input.js'
import { getSomeEnv } from '@/backend/src/services/other/env.js'
import { getS3Client } from '@/backend/src/services/other/s3.js'
import { trpcBaseProcedure } from '@/backend/src/services/other/trpc.js'
import { ErroryExpected } from '@/general/src/other/errory.js'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getRandomString } from 'svag-utils'

// 4 GB
const maxFileSize = 4 * 1024 * 1024 * 1024

export const prepareS3UploadTrpcRoute = trpcBaseProcedure()
  .input(zPrepareS3UploadTrpcInput)
  .mutation(async ({ input }) => {
    if (input.fileSize > maxFileSize) {
      throw new ErroryExpected('File size should be less then 10MB')
    }
    const env = getSomeEnv(['S3_BUCKET_NAME'])

    const s3Client = getS3Client()
    const s3Key = `uploads/${getRandomString({ length: 32, symbols: false, lowercase: true })}-${input.fileName}`
    const signedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: s3Key,
        ContentType: input.fileType,
        ContentLength: input.fileSize,
      }),
      {
        expiresIn: 3_600,
      }
    )

    return {
      s3Key,
      signedUrl,
    }
  })
