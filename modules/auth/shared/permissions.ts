import { Error0 } from '@devp0nt/error0'
import type { AdminOptions } from 'better-auth/plugins'
import { createAccessControl } from 'better-auth/plugins/access'
import { userAc, adminAc, defaultStatements } from 'better-auth/plugins/admin/access'
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
export const zPermissions = z
  .object({
    ...Object.fromEntries(
      Object.entries(adminPluginOptions.ac.statements).map(([key, value]) => [
        key,
        z
          .array(z.enum(value as unknown as [string, ...string[]]))
          .optional()
          .meta({ 'x-ui:view-widget': 'tags' }),
      ]),
    ),
  })
  .meta({
    'x-descriptions': true,
  }) as z.ZodType<Permissions>

const flatPermissions = (permissions: Permissions) => {
  return Object.entries(permissions).flatMap(([key, value]) => value.map((v) => `${key}:${v}`))
}
export const isOneOfPermissionsSuitable = (requiredPermissions: Permissions, userPermissions: Permissions) => {
  const requiredPermissionsFlat = flatPermissions(requiredPermissions)
  const userPermissionsFlat = flatPermissions(userPermissions)
  return requiredPermissionsFlat.some((permission) => userPermissionsFlat.includes(permission))
}
export const isAllPermissionsSuitable = (requiredPermissions: Permissions, userPermissions: Permissions) => {
  const requiredPermissionsFlat = flatPermissions(requiredPermissions)
  const userPermissionsFlat = flatPermissions(userPermissions)
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
  const userPermissions = role === 'special' ? ownPermissions : adminPluginOptions.roles[role].statements
  if (permission) {
    return isOneOfPermissionsSuitable(permission, userPermissions)
  } else if (permissions) {
    return isAllPermissionsSuitable(permissions, userPermissions)
  } else {
    throw new Error('Either permission or permissions must be provided')
  }
}
export const hasUserPermission = ({
  user,
  permission,
  permissions,
}: {
  user: { permissions: Permissions; role: keyof typeof adminPluginOptions.roles } | null
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
  user: { permissions: Permissions; role: keyof typeof adminPluginOptions.roles } | null
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
export const createHasPermission = (
  user: { permissions: Permissions; role: keyof typeof adminPluginOptions.roles } | null,
) => {
  return ({ permission, permissions }: { permission?: Permissions; permissions?: Permissions }) => {
    return hasUserPermission({
      user,
      permission,
      permissions,
    })
  }
}
export const createRequirePermission = (
  user: { permissions: Permissions; role: keyof typeof adminPluginOptions.roles } | null,
) => {
  return ({ permission, permissions }: { permission?: Permissions; permissions?: Permissions }) => {
    requirePermission({
      user,
      permission,
      permissions,
    })
  }
}
