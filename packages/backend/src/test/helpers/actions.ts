import { welcomeUserEmail } from '@/backend/src/services/other/emails/defs/welcomeUser/index.js'
import { u } from '@/backend/src/test/helpers/integration.js'
import type { Admin, User } from '@prisma/client'

const doAdminAuth = async () => {
  const t0 = u.getTrpcCaller()
  const signInInput = {
    email: u.env.INITIAL_ADMIN_EMAIL,
    password: u.env.INITIAL_ADMIN_PASSWORD,
  }
  const r1 = await t0.signInAdmin({
    ...signInInput,
  })
  const admin = await u.get.admin(r1.adminId)
  const ta = u.getTrpcCaller({ admin })
  return {
    admin,
    ta,
  }
}

const doUserAuth = async ({ admin, index }: { admin: Admin; index: number }) => {
  const ta = u.getTrpcCaller({ admin })
  await ta.createUserForAdmin({
    name: `User ${index}`,
    email: `t${index}@example.com`,
    permissions: [],
  })
  const r1 = u.exists(welcomeUserEmail.getLastSentEmail())
  const email = r1.variables.email
  const password = r1.variables.password
  const t0 = u.getTrpcCaller()
  const signInInput = {
    email,
    password,
  }
  const r2 = await t0.signInUser({
    ...signInInput,
  })
  const user = await u.get.user(r2.userId)
  const tu = u.getTrpcCaller({ user })
  return {
    user,
    tu,
  }
}

const doNewProject = async ({ user, index }: { user: User; index: number }) => {
  const tu = u.getTrpcCaller({ user })
  const r1 = await tu.createProjectForUser({
    name: `Project ${index}`,
  })
  const project = await u.get.project(r1.project.id)
  return {
    project,
  }
}

export const actions = {
  adminAuth: doAdminAuth,
  userAuth: doUserAuth,
  newProject: doNewProject,
}
