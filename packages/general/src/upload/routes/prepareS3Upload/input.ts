import { zStringRequired } from '@/general/src/other/validation.js'
import { z } from 'zod'

export const zPrepareS3UploadTrpcInput = z.object({
  fileName: zStringRequired,
  fileType: zStringRequired,
  fileSize: z.number().int().positive(),
})
