import { Error0 } from '@devp0nt/error0'
import type { AdminOptions } from 'better-auth/plugins'
import { createAccessControl, type Statements } from 'better-auth/plugins/access'
// import { defaultStatements } from 'better-auth/plugins/admin/access'
import z from 'zod'

export const getAdminPluginSettings = () => {
  const accessControlStatements = {
    user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password', 'get', 'update'] as const,
    session: ['list', 'revoke', 'delete'] as const,
    adminUser: ['view', 'manage'] as const,
    memberUser: ['view', 'manage'] as const,
    idea: ['view', 'manage'] as const,
    newsPost: ['view', 'manage'] as const,
    appConfig: ['view', 'manage'] as const,
  } as const

  // const accessControl = createAccessControl(accessControlStatements)
  const accessControl = createAccessControl({
    user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password', 'get', 'update'],
    session: ['list', 'revoke', 'delete'],
    adminUser: ['view', 'manage'],
    memberUser: ['view', 'manage'],
    idea: ['view', 'manage'],
    newsPost: ['view', 'manage'],
    appConfig: ['view', 'manage'],
  } satisfies Statements)

  const userRole = accessControl.newRole({
    user: [],
    session: [],
    adminUser: [],
    memberUser: [],
    idea: [],
    newsPost: [],
    appConfig: [],
  })

  const adminRole = accessControl.newRole({
    user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password', 'get', 'update'],
    session: ['list', 'revoke', 'delete'],
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
    user: [],
    session: [],
    adminUser: [],
    memberUser: [],
    idea: [],
    newsPost: [],
    appConfig: [],
  })

  const adminRoles = ['admin', 'manager', 'analyst', 'special']

  const options = {
    adminRoles,
    ac: accessControl,
    roles: {
      user: userRole,
      admin: adminRole,
      manager: managerRole,
      analyst: analystRole,
      special: specialRole,
    },
  } satisfies AdminOptions

  const createServerAdminPlugin = async () => {
    const plugins = await import('better-auth/plugins')
    return plugins.admin(options)
  }

  const createClientAdminPlugin = async () => {
    const plugins = await import('better-auth/client/plugins')
    return plugins.adminClient(options)
  }

  return {
    accessControlStatements,
    accessControl,
    userRole,
    adminRole,
    managerRole,
    analystRole,
    specialRole,
    adminRoles,
    options,
    createServerAdminPlugin,
    createClientAdminPlugin,
  }
}

// TODO: move to own better-auth plugin

const adminPluginSettings = getAdminPluginSettings()
type AdminPluginSettings = typeof adminPluginSettings

export type Permissions = {
  [K in keyof AdminPluginSettings['accessControlStatements']]?: Array<
    AdminPluginSettings['accessControlStatements'][K][number]
  >
}
export const zPermissions = z
  .object({
    ...Object.fromEntries(
      Object.entries(adminPluginSettings.accessControl.statements).map(([key, value]) => [key, z.array(z.enum(value))]),
    ),
  })
  .meta({}) as z.ZodType<Permissions>
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
  role: keyof typeof adminPluginSettings.options.roles
  ownPermissions: Permissions
  permission?: Permissions
  permissions?: Permissions
}) => {
  const userPermissions = role === 'special' ? ownPermissions : adminPluginSettings.options.roles[role].statements
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
  user: { permissions: Permissions; role: keyof typeof adminPluginSettings.options.roles } | null
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
  user: { permissions: Permissions; role: keyof typeof adminPluginSettings.options.roles } | null
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
  user: { permissions: Permissions; role: keyof typeof adminPluginSettings.options.roles } | null,
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
  user: { permissions: Permissions; role: keyof typeof adminPluginSettings.options.roles } | null,
) => {
  return ({ permission, permissions }: { permission?: Permissions; permissions?: Permissions }) => {
    requirePermission({
      user,
      permission,
      permissions,
    })
  }
}
