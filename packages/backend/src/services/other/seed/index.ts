import type { AppContext } from '@/backend/src/services/other/ctx.js'
import { isNotLocalHostEnv } from '@/backend/src/services/other/env.js'
import type { User, Prisma, AdminPermission } from '@/backend/src/services/other/prisma.js'
import { adminPermissions } from '@/general/src/auth/can.js'
import { getPasswordHash } from '@/general/src/auth/utils.server.js'
import { ErroryUnexpected } from '@/general/src/other/errory.js'

type SeedUserInput = {
  ctx: AppContext
  index?: number
  prefix?: string
  user?: Partial<Prisma.UserCreateInput>
}
const getUserData = ({ ctx, index = 1, prefix = 'user', user }: SeedUserInput) => {
  return {
    name: `${prefix}${index}`,
    email: `${prefix}${index}@example.com`,
    authTokenSource: `${prefix}${index}`,
    ...user,
    password: user?.password ? getPasswordHash(user.password) : getPasswordHash('1234'),
  } satisfies Prisma.UserCreateInput
}
const seedUser = async (input: SeedUserInput) => {
  const user = await input.ctx.prisma.user.create({
    data: getUserData(input),
  })
  return user
}

type SeedAdminInput = {
  ctx: AppContext
  index?: number
  prefix?: string
  admin?: Partial<Prisma.AdminCreateInput>
}
const getAdminData = ({ ctx, index = 1, prefix = 'admin', admin }: SeedAdminInput) => {
  return {
    name: `${prefix}${index}`,
    email: `${prefix}${index}@example.com`,
    authTokenSource: `${prefix}${index}`,
    permissions: adminPermissions as never as AdminPermission[],
    ...admin,
    password: admin?.password ? getPasswordHash(admin.password) : getPasswordHash('1234'),
  } satisfies Prisma.AdminCreateInput
}
const seedAdmin = async (input: SeedAdminInput) => {
  const admin = await input.ctx.prisma.admin.create({
    data: getAdminData(input),
  })
  return admin
}

const seedProject = async ({
  ctx,
  index = 1,
  project: _project,
  user,
}: {
  ctx: AppContext
  index?: number
  project?: Partial<Prisma.ProjectCreateInput>
  user: User
}) => {
  const project = await ctx.prisma.project.create({
    data: {
      name: `project${index}`,
      ...defineRelation('user', user.id),
      ..._project,
    },
  })
  return project
}

// helpers

const defineRelation = <TRelationName extends string>(
  relationName: TRelationName,
  relationId: string | undefined | null
): { [K in TRelationName]: { connect: { id: string } } } => {
  return relationId
    ? ({
        [relationName]: {
          connect: {
            id: relationId,
          },
        },
      } as any)
    : {}
}

const createExtendedSeedHelper = <TInput extends { ctx: AppContext }, TGetDataResult, TSeedResult>(
  ctx: AppContext,
  getDataFn: (input: TInput) => TGetDataResult,
  seedFn: (input: TInput) => TSeedResult
) => {
  const resultFn = (input: Omit<TInput, 'ctx'>) => {
    if (isNotLocalHostEnv()) {
      throw new ErroryUnexpected('Seed is not allowed in not local host env')
    }
    return seedFn({ ...input, ctx } as TInput)
  }
  resultFn.data = (input: Omit<TInput, 'ctx'>) => getDataFn({ ...input, ctx } as TInput)
  return resultFn as {
    (input: Omit<TInput, 'ctx'>): TSeedResult
    data: (input: Omit<TInput, 'ctx'>) => TGetDataResult
  }
}

const createSeedHelper = <TInput extends { ctx: AppContext }, TSeedResult>(
  ctx: AppContext,
  seedFn: (input: TInput) => TSeedResult
) => {
  const resultFn = (input: Omit<TInput, 'ctx'>) => {
    if (isNotLocalHostEnv()) {
      throw new ErroryUnexpected('Seed is not allowed not in local host env')
    }
    return seedFn({ ...input, ctx } as TInput)
  }
  return resultFn
}

export const getSeedFns = (ctx: AppContext) => {
  return {
    user: createExtendedSeedHelper(ctx, getUserData, seedUser),
    admin: createExtendedSeedHelper(ctx, getAdminData, seedAdmin),
    project: createSeedHelper(ctx, seedProject),
  }
}
export type SeedFns = ReturnType<typeof getSeedFns>
