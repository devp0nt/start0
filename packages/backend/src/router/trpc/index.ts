import { createTrpcRouter } from '@/backend/src/services/other/trpc.js'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path}.js'`)
import { pingTrpcRoute } from './routes/ping/index.js'
// @endindex
// @index('../../../../general/src/**/route.trpc.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.replace('../../../../general', '@/general')}.js'`)
import { getActionLogsForAdminTrpcRoute } from '@/general/src/actionLog/routes/getActionLogsForAdmin/route.trpc.js'
import { createAdminForAdminTrpcRoute } from '@/general/src/admin/routes/createAdminForAdmin/route.trpc.js'
import { getAdminForAdminTrpcRoute } from '@/general/src/admin/routes/getAdminForAdmin/route.trpc.js'
import { getAdminsForAdminTrpcRoute } from '@/general/src/admin/routes/getAdminsForAdmin/route.trpc.js'
import { updateAdminForAdminTrpcRoute } from '@/general/src/admin/routes/updateAdminForAdmin/route.trpc.js'
import { updateMyPasswordForAdminTrpcRoute } from '@/general/src/admin/routes/updateMyPasswordForAdmin/route.trpc.js'
import { getMeTrpcRoute } from '@/general/src/auth/routes/getMe/route.trpc.js'
import { signInAdminTrpcRoute } from '@/general/src/auth/routes/signInAdmin/route.trpc.js'
import { signInUserTrpcRoute } from '@/general/src/auth/routes/signInUser/route.trpc.js'
import { signOutTrpcRoute } from '@/general/src/auth/routes/signOut/route.trpc.js'
import { createProjectForUserTrpcRoute } from '@/general/src/project/routes/createProjectForUser/route.trpc.js'
import { getProjectForUserTrpcRoute } from '@/general/src/project/routes/getProjectForUser/route.trpc.js'
import { getProjectsForUserTrpcRoute } from '@/general/src/project/routes/getProjectsForUser/route.trpc.js'
import { updateProjectForUserTrpcRoute } from '@/general/src/project/routes/updateProjectForUser/route.trpc.js'
import { prepareS3UploadTrpcRoute } from '@/general/src/upload/routes/prepareS3Upload/route.trpc.js'
import { createUserForAdminTrpcRoute } from '@/general/src/user/routes/createUserForAdmin/route.trpc.js'
import { getUserForAdminTrpcRoute } from '@/general/src/user/routes/getUserForAdmin/route.trpc.js'
import { getUsersForAdminTrpcRoute } from '@/general/src/user/routes/getUsersForAdmin/route.trpc.js'
import { updateMyPasswordForUserTrpcRoute } from '@/general/src/user/routes/updateMyPasswordForUser/route.trpc.js'
import { updateUserForAdminTrpcRoute } from '@/general/src/user/routes/updateUserForAdmin/route.trpc.js'
// @endindex

export const trpcRouter = createTrpcRouter({
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
  ping: pingTrpcRoute,
  // @endindex
  // @index('../../../../general/src/**/route.trpc.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
  getActionLogsForAdmin: getActionLogsForAdminTrpcRoute,
  createAdminForAdmin: createAdminForAdminTrpcRoute,
  getAdminForAdmin: getAdminForAdminTrpcRoute,
  getAdminsForAdmin: getAdminsForAdminTrpcRoute,
  updateAdminForAdmin: updateAdminForAdminTrpcRoute,
  updateMyPasswordForAdmin: updateMyPasswordForAdminTrpcRoute,
  getMe: getMeTrpcRoute,
  signInAdmin: signInAdminTrpcRoute,
  signInUser: signInUserTrpcRoute,
  signOut: signOutTrpcRoute,
  createProjectForUser: createProjectForUserTrpcRoute,
  getProjectForUser: getProjectForUserTrpcRoute,
  getProjectsForUser: getProjectsForUserTrpcRoute,
  updateProjectForUser: updateProjectForUserTrpcRoute,
  prepareS3Upload: prepareS3UploadTrpcRoute,
  createUserForAdmin: createUserForAdminTrpcRoute,
  getUserForAdmin: getUserForAdminTrpcRoute,
  getUsersForAdmin: getUsersForAdminTrpcRoute,
  updateMyPasswordForUser: updateMyPasswordForUserTrpcRoute,
  updateUserForAdmin: updateUserForAdminTrpcRoute,
  // @endindex
})

export type TrpcRouter = typeof trpcRouter
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>
