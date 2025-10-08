import type { Permissions as PermissionsType } from '@auth/shared/shared/permissions'

declare global {
  namespace PrismaJson {
    type Permissions = PermissionsType
  }
}
