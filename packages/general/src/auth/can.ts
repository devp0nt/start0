import type {
  AdminPermission as PrismaAdminPermission,
  UserPermission as PrismaUserPermission,
} from '@/backend/src/services/other/prisma.js'
import type { CheckIfArraySatisfies } from 'svag-types'
import { z } from 'zod'

export const adminPermissions = ['manageAdmins', 'viewUsers', 'manageUsers'] as const
export const zAdminPermission = z.enum(adminPermissions)
export type AdminPermission = z.output<typeof zAdminPermission>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const check1: CheckIfArraySatisfies<AdminPermission, PrismaAdminPermission> = true
export const toHumanAdminPermission = (permission: AdminPermission) => {
  return (
    {
      manageAdmins: 'Manage admins',
      viewUsers: 'View users',
      manageUsers: 'Manage users',
    }[permission] || 'Unknown permission'
  )
}
export const adminPermissionsOptions = adminPermissions.map((permission) => ({
  value: permission,
  label: toHumanAdminPermission(permission),
}))

export const userPermissions = ['useBetaFeatures'] as const
export const zUserPermission = z.enum(userPermissions)
export type UserPermission = z.output<typeof zUserPermission>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const check2: CheckIfArraySatisfies<UserPermission, PrismaUserPermission> = true
export const toHumanUserPermission = (permission: UserPermission) => {
  return (
    {
      useBetaFeatures: 'Use beta features',
    }[permission] || 'Unknown permission'
  )
}
export const userPermissionsOptions = userPermissions.map((permission) => ({
  value: permission,
  label: toHumanUserPermission(permission),
}))

type MaybeAdmin = {
  permissions: AdminPermission[]
} | null
type MaybeUser = {
  permissions: UserPermission[]
} | null

export type SimpleCanAsAdminFn = (admin: MaybeAdmin) => boolean
export type SimpleCanAsUser = (user: MaybeUser) => boolean

export const hasPermissionAsAdmin = (admin: MaybeAdmin, permission: AdminPermission) => {
  if (!admin) {
    return false
  }
  return admin.permissions.includes(permission)
}
export const hasPermissionAsUser = (user: MaybeUser, permission: UserPermission) => {
  if (!user) {
    return false
  }
  return user.permissions.includes(permission)
}

const createSimpleCanAsAdminFn = (permission: AdminPermission): SimpleCanAsAdminFn => {
  return (admin) => {
    return hasPermissionAsAdmin(admin, permission)
  }
}
const createSimpleCanAsUserFn = (permission: UserPermission): SimpleCanAsUser => {
  return (user) => {
    return hasPermissionAsUser(user, permission)
  }
}

// admin

export const canManageAdmins = createSimpleCanAsAdminFn('manageAdmins')
export const canViewUsers = createSimpleCanAsAdminFn('viewUsers')
export const canManageUsers = createSimpleCanAsAdminFn('manageUsers')

// user

export const canUseBetaFeatures = createSimpleCanAsUserFn('useBetaFeatures')
