/* eslint-disable n/no-process-env */
import { applyDotEnvFiles } from 'svag-dotenv'
import {
  createEnvThings,
  parsePublicEnv,
  zEnv,
  zEnvNumber,
  zEnvOptional,
  zEnvRequired,
  zEnvRequiredOnNotLocalHost,
  zHostEnv,
  zNodeEnv,
} from 'svag-env'
import { get__dirname } from 'svag-esm'
import z from 'zod'

const __dirname = get__dirname(import.meta)
const rawEnv = {
  ...process.env,
  ...applyDotEnvFiles({ cwd: __dirname, lastPathPart: 'webapp/.env', withProcessEnv: false }),
  ...applyDotEnvFiles({ cwd: __dirname, withProcessEnv: false }),
}

export const {
  getAllEnv,
  getOneEnv,
  getSomeEnv,
  isLocalHostEnv,
  isProdHostEnv,
  isNotLocalHostEnv,
  isProductionNodeEnv,
} = createEnvThings({
  name: 'backend',
  source: rawEnv,
  schema: z.object({
    WEBAPP_URL: zEnvRequired,
    BACKEND_URL: zEnvRequired,
    PORT: zEnvNumber,
    NODE_ENV: zNodeEnv,
    HOST_ENV: zHostEnv,
    DATABASE_URL: zEnvRequired,
    JWT_SECRET: zEnvRequired,
    INITIAL_ADMIN_PASSWORD: zEnvRequired,
    INITIAL_ADMIN_EMAIL: zEnvRequired,
    PASSWORD_SALT: zEnvRequired,
    BREVO_API_KEY: zEnvRequiredOnNotLocalHost,
    FROM_EMAIL_ADDRESS: zEnvRequiredOnNotLocalHost,
    FROM_EMAIL_NAME: zEnvRequiredOnNotLocalHost,
    BACKEND_SENTRY_DSN: zEnvRequiredOnNotLocalHost,
    SOURCE_VERSION: zEnvRequiredOnNotLocalHost,
    S3_ACCESS_KEY_ID: zEnvRequiredOnNotLocalHost,
    S3_SECRET_ACCESS_KEY: zEnvRequiredOnNotLocalHost,
    S3_BUCKET_NAME: zEnvRequiredOnNotLocalHost,
    S3_REGION: zEnvRequiredOnNotLocalHost,
    S3_ENDPOINT: zEnvRequiredOnNotLocalHost,
    S3_URL: zEnvRequiredOnNotLocalHost,
    DEBUG: zEnv,
    TELEGRAM_BOT_DEV_TOKEN: zEnvRequiredOnNotLocalHost,
    TELEGRAM_ALERTS_CHAT_ID: zEnvRequiredOnNotLocalHost,
    BASIC_AUTH_USERNAME: zEnvOptional,
    BASIC_AUTH_PASSWORD: zEnvOptional,
  }),
})

export const publicEnv = parsePublicEnv({ source: rawEnv })
