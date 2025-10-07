import type { AdminOptions } from 'better-auth/plugins'
import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, userAc } from 'better-auth/plugins/admin/access'

const statement = {
  ...defaultStatements,
  adminUser: ['view', 'manage'],
  memberUser: ['view', 'manage'],
  idea: ['view', 'manage'],
  newsPost: ['view', 'manage'],
  appConfig: ['view', 'manage'],
} as const

const ac = createAccessControl(statement)

const user = ac.newRole({
  ...userAc.statements,
})

const admin = ac.newRole({
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password', 'get', 'update'],
  session: ['list', 'revoke', 'delete'],
  adminUser: ['view', 'manage'],
  memberUser: ['view', 'manage'],
  idea: ['view', 'manage'],
  newsPost: ['view', 'manage'],
  appConfig: ['view', 'manage'],
})

const manager = ac.newRole({
  user: ['list', 'ban', 'get'],
  session: ['list', 'revoke', 'delete'],
  adminUser: ['view'],
  memberUser: ['view'],
  idea: ['view', 'manage'],
  newsPost: ['view', 'manage'],
  appConfig: ['view', 'manage'],
})

const analyst = ac.newRole({
  user: ['list', 'get'],
  session: ['list'],
  adminUser: ['view'],
  memberUser: ['view'],
  idea: ['view'],
  newsPost: ['view'],
  appConfig: ['view'],
})

export const adminPluginOptions = {
  adminRoles: ['admin', 'manager', 'analyst'],
  ac,
  roles: {
    admin,
    user,
    manager,
    analyst,
  },
} satisfies AdminOptions
