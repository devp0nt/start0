import type { Prisma, Project } from '@/backend/src/services/other/prisma.js'
import { pick } from 'svag-utils'

export const includesProjectWithEverything = {} satisfies Prisma.ProjectInclude
export type ProjectWithEverything = Prisma.ProjectGetPayload<{}>

export const toClientProjectPublic = (project: Project) => {
  return pick(project, ['id', 'sn'])
}
export type ClientProjectPublic = ReturnType<typeof toClientProjectPublic>

export const toClientProjectForAdmin = (project: ProjectWithEverything) => {
  return {
    ...pick(project, ['id', 'sn', 'name', 'createdAt', 'updatedAt']),
  }
}
export type ClientProjectForAdmin = ReturnType<typeof toClientProjectForAdmin>

export const toClientProjectForUser = (project: ProjectWithEverything) => {
  return {
    ...pick(project, ['id', 'sn', 'name', 'createdAt', 'updatedAt']),
  }
}
export type ClientProjectForUser = ReturnType<typeof toClientProjectForUser>
