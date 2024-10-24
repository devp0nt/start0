import { getOneEnv, isLocalHostEnv, isProductionNodeEnv } from '@/backend/src/services/other/env.js'
import { trackError } from '@/backend/src/services/other/sentry.js'
import { sendMessageToAlertsChat } from '@/backend/src/services/other/telegram.js'
import { isTestEnv } from '@/backend/src/test/helpers/testEnv.js'
import { Errory } from '@/general/src/other/errory.js'
import { generalAppConfig } from '@/general/src/other/generalAppConfig.js'
import { createLogger } from 'svag-logger'

// eslint-disable-next-line n/no-process-env
const herokuDyno = process.env.DYNO
const herokuDynoParts = herokuDyno ? herokuDyno.split('.') : ['unknown', '0']
const herokuDynoNumber = herokuDynoParts[1]
const herokuDynoName = herokuDynoParts[0]

export const { logger } = createLogger({
  format: isProductionNodeEnv() ? 'json' : 'human-yaml',
  // format: 'json',
  Errory,
  defaultMeta: {
    service: 'backend',
    hostEnv: getOneEnv('HOST_ENV'),
    dyno: herokuDyno,
    dynoName: herokuDynoName,
    dynoNumber: herokuDynoNumber,
  },
  debugConfig: getOneEnv('DEBUG'),
  invisibleLogProps: ['service', 'hostEnv', 'dyno', 'dynoName', 'dynoNumber'],
  projectSlug: generalAppConfig.projectSlug,
  trackError: (error, meta) => {
    const sentryId = trackError(error, meta)
    const metaObject = typeof meta === 'object' ? meta : {}
    void sendMessageToAlertsChat(`Error: ${error.message}
https://svagatron.sentry.io/issues/?query=${sentryId}
<code>
${JSON.stringify(
  { ...metaObject, env: getOneEnv('HOST_ENV') },
  (k, v) => {
    if (typeof v === 'bigint') {
      return v.toString()
    }
    return v
  },
  2
)}
</code>`)
  },
  alwaysLogErrors: !isTestEnv(),
  sensetiveKeys: isLocalHostEnv()
    ? []
    : [
        'authTokenSource',
        'email',
        'oldEmail',
        'newEmail',
        'phone',
        'oldPhone',
        'newPhone',
        'password',
        'newPassword',
        'oldPassword',
        'token',
        'apiKey',
        'verifcationCode',
        'signature',
        'signedUrl',
        'apiSecret',
        'apiKey',
        'secret',
        'url',
      ],
})
