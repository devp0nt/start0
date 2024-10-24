import { applyEmailsPreviewsToExpressApp } from '@/backend/src/services/other/emails/index.js'
import type { Express } from 'express'

// @index('./defs/**/index.(ts|tsx)', f => `import { ${f.path.split('/').slice(0, -1).pop()}Email } from '${f.path}.js'`)
import { saleEmail } from './defs/sale/index.js'
import { welcomeAdminEmail } from './defs/welcomeAdmin/index.js'
import { welcomeUserEmail } from './defs/welcomeUser/index.js'
// @endindex

export const applyAppEmailsPreviewsToExpressApp = ({ expressApp }: { expressApp: Express }) => {
  applyEmailsPreviewsToExpressApp({
    expressApp,
    route: '/emails/:name',
    emailsDefinitions: [
      // @index('./defs/**/index.(ts|tsx)', f => `${f.path.split('/').slice(0, -1).pop()}Email,`)
      saleEmail,
      welcomeAdminEmail,
      welcomeUserEmail,
      // @endindex
    ],
  })
}
