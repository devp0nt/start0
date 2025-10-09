import { Error0 } from '@devp0nt/error0'
import type { AdminOptions } from 'better-auth/plugins'
import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements, userAc } from 'better-auth/plugins/admin/access'
import get from 'lodash/get'
import z from 'zod'

const accessControlStatements = {
  ...defaultStatements,
  adminUser: ['view', 'manage'],
  memberUser: ['view', 'manage'],
  idea: ['view', 'manage'],
  newsPost: ['view', 'manage'],
  appConfig: ['view', 'manage'],
} as const

const accessControl = createAccessControl(accessControlStatements)

const userRole = accessControl.newRole({
  ...userAc.statements,
})

const adminRole = accessControl.newRole({
  ...adminAc.statements,
  adminUser: ['view', 'manage'],
  memberUser: ['view', 'manage'],
  idea: ['view', 'manage'],
  newsPost: ['view', 'manage'],
  appConfig: ['view', 'manage'],
})

const managerRole = accessControl.newRole({
  user: ['list', 'ban', 'get'],
  session: ['list', 'revoke', 'delete'],
  adminUser: ['view'],
  memberUser: ['view'],
  idea: ['view', 'manage'],
  newsPost: ['view', 'manage'],
  appConfig: ['view', 'manage'],
})

const analystRole = accessControl.newRole({
  user: ['list', 'get'],
  session: ['list'],
  adminUser: ['view'],
  memberUser: ['view'],
  idea: ['view'],
  newsPost: ['view'],
  appConfig: ['view'],
})

const specialRole = accessControl.newRole({
  ...userAc.statements,
})

const adminRoles = ['admin', 'manager', 'analyst', 'special']

const roles = {
  user: userRole,
  admin: adminRole,
  manager: managerRole,
  analyst: analystRole,
  special: specialRole,
}

export const adminPluginOptions = {
  adminRoles,
  ac: accessControl,
  roles,
} satisfies AdminOptions

export const createServerAdminPlugin = async () => {
  const plugins = await import('better-auth/plugins')
  return plugins.admin(adminPluginOptions)
}

export const createClientAdminPlugin = async () => {
  const plugins = await import('better-auth/client/plugins')
  return plugins.adminClient(adminPluginOptions)
}

// TODO: move to own better-auth plugin

export type Permissions = {
  [K in keyof typeof adminPluginOptions.ac.statements]?: Array<(typeof adminPluginOptions.ac.statements)[K][number]>
}
export const getZPermissions = () =>
  z
    .object({
      ...Object.fromEntries(
        Object.entries(adminPluginOptions.ac.statements).map(([key, value]) => [
          key,
          z
            .array(z.enum(value as unknown as [string, ...string[]]))
            .optional()
            .meta({
              'x-ui:view-widget': 'tags',
              'x-ui:form-widget': 'checkboxes',
              'x-ui:form-emptyValue': [],
              'x-ui:form-options': { inline: true },
              uniqueItems: true,
            }),
        ]),
      ),
    })
    .meta({
      'x-descriptions': true,
    }) as z.ZodType<Permissions>
export const zPermissions = getZPermissions()
export const getRolePermissions = (role: keyof typeof adminPluginOptions.roles): Permissions => {
  const result = get(adminPluginOptions, ['roles', role, 'statements'], undefined)
  if (!result) {
    // eslint-disable-next-line no-console
    console.error(`Role ${role} not found`)
    return {}
  }
  return result
}
export const getFinalPermissions = (
  role: keyof typeof adminPluginOptions.roles,
  ownPermissions: Permissions,
): Permissions => {
  if (role === 'special') {
    return ownPermissions
  } else {
    return getRolePermissions(role)
  }
}
const flatPermissions = (permissions: Permissions) => {
  return Object.entries(permissions).flatMap(([key, value]) => value.map((v) => `${key}:${v}`))
}
export const isOneOfPermissionsSuitable = (permission: Permissions, finalPermissions: Permissions) => {
  const requiredPermissionsFlat = flatPermissions(permission)
  const userPermissionsFlat = flatPermissions(finalPermissions)
  return requiredPermissionsFlat.some((permission) => userPermissionsFlat.includes(permission))
}
export const isAllPermissionsSuitable = (permissions: Permissions, finalPermissions: Permissions) => {
  const requiredPermissionsFlat = flatPermissions(permissions)
  const userPermissionsFlat = flatPermissions(finalPermissions)
  return requiredPermissionsFlat.every((permission) => userPermissionsFlat.includes(permission))
}
export const hasPermission = ({
  role,
  ownPermissions,
  permission,
  permissions,
}: {
  role: keyof typeof adminPluginOptions.roles
  ownPermissions: Permissions
  permission?: Permissions
  permissions?: Permissions
}) => {
  const finalPermissions = getFinalPermissions(role, ownPermissions)
  if (permission) {
    return isOneOfPermissionsSuitable(permission, finalPermissions)
  } else if (permissions) {
    return isAllPermissionsSuitable(permissions, finalPermissions)
  } else {
    throw new Error('Either permission or permissions must be provided')
  }
}
type WithRoleAndPermissions = {
  role: keyof typeof adminPluginOptions.roles
  permissions: Permissions
}
export const hasUserPermission = ({
  user,
  permission,
  permissions,
}: {
  user: WithRoleAndPermissions | null
  permission?: Permissions
  permissions?: Permissions
}) => {
  if (!user) {
    return false
  }
  return hasPermission({
    role: user.role,
    ownPermissions: user.permissions,
    permission,
    permissions,
  })
}
export const requirePermission = ({
  user,
  permission,
  permissions,
}: {
  user: WithRoleAndPermissions | null
  permission?: Permissions
  permissions?: Permissions
}) => {
  const substring = permission ? 'one of this' : 'all of this'
  if (!hasUserPermission({ user, permission, permissions })) {
    throw new Error0(
      `Only for admins with ${substring} permissions: ${flatPermissions(permission || permissions || {}).join(', ')}`,
      {
        expected: true,
        httpStatus: 403,
      },
    )
  }
}
export const createHasPermission = (user: WithRoleAndPermissions | null) => {
  return ({ permission, permissions }: { permission?: Permissions; permissions?: Permissions }) => {
    return hasUserPermission({
      user,
      permission,
      permissions,
    })
  }
}
export const createRequirePermission = (user: WithRoleAndPermissions | null) => {
  return ({ permission, permissions }: { permission?: Permissions; permissions?: Permissions }) => {
    requirePermission({
      user,
      permission,
      permissions,
    })
  }
}

const withFinalPermissionsOne = <T extends WithRoleAndPermissions>(user: T): WithFinalPermissions<T> => {
  return { ...user, finalPermissions: getFinalPermissions(user.role, user.permissions) }
}
export type WithFinalPermissions<T extends WithRoleAndPermissions> = T & { finalPermissions: Permissions }
export function withFinalPermissions<T extends WithRoleAndPermissions>(user: T): WithFinalPermissions<T>
export function withFinalPermissions<T extends WithRoleAndPermissions>(users: T[]): Array<WithFinalPermissions<T>>
export function withFinalPermissions(user: null): null
export function withFinalPermissions(user: WithRoleAndPermissions | WithRoleAndPermissions[] | null) {
  if (user === null) {
    return null
  }
  if (Array.isArray(user)) {
    return user.map((u) => withFinalPermissionsOne(u))
  }
  return withFinalPermissionsOne(user)
}
