// import type { Permissions as PermissionsType } from '@auth/shared/permissions'
export {}

declare global {
  namespace PrismaJson {
    type Permissions = any
  }
}
