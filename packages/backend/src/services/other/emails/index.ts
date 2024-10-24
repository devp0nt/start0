import { getSomeEnv, isLocalHostEnv } from '@/backend/src/services/other/env.js'
import { logger } from '@/backend/src/services/other/logger.js'
import { isTestEnv } from '@/backend/src/test/helpers/testEnv.js'
import { createSendEmailThroughBrevo } from 'svag-brevo'
import { createEmailsThings } from 'svag-emails'

const env = getSomeEnv(['BREVO_API_KEY', 'FROM_EMAIL_ADDRESS', 'FROM_EMAIL_NAME'])

const { sendEmailThroughBrevo } = createSendEmailThroughBrevo({
  apiKey: env.BREVO_API_KEY,
  fromEmailAddress: env.FROM_EMAIL_ADDRESS,
  fromEmailName: env.FROM_EMAIL_NAME,
  mock: isLocalHostEnv() || isTestEnv(),
})

export const {
  createEmailDefinition,
  applyEmailsPreviewsToExpressApp,
  getSentEmails,
  clearSentEmails,
  getLastSentEmail,
} = createEmailsThings({
  sendEmailThroughProvider: sendEmailThroughBrevo,
  logger,
  mock: isLocalHostEnv() || isTestEnv(),
})
