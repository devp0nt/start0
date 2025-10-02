import { generalProjectListApi } from '@admin/core/generated/api/client'
import type { GeneralProjectListApi200DataItem } from '@admin/core/generated/api/models'

import { Loader } from '@admin/core/components/loader'
import { AdminCtx } from '@admin/core/lib/ctx'
import { Select } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import * as zustand from 'zustand'

// RODO: on editp project refetch projects

// const getProjectSlugFormWindowLocation = () => {
//   return window.location.pathname.split('/')[0]
// }

// const getProjectSlugFormUrl = (url: string) => {
//   return url.split('/')[1]
// }

export const useProjectStore = zustand.create<{
  activeProjectSlugInitialized: boolean
  projectsInitialized: boolean
  projects: Record<string, GeneralProjectListApi200DataItem>
  activeProjectSlug: string
  activeProjectName: () => string
  lastActiveNonGeneralProjectSlug: string | null
  activeProjectId: () => string | null
  initialized: () => boolean
  setActiveProjectSlug: (project: string) => void
  setProjects: (projects: Record<string, GeneralProjectListApi200DataItem>) => void
}>((set, get) => ({
  activeProjectSlugInitialized: false,
  projectsInitialized: false,
  projects: {},
  activeProjectSlug: 'general',
  activeProjectName: () =>
    Object.values(get().projects).find((project) => project.slug === get().activeProjectSlug)?.name || 'AdminHub',
  lastActiveNonGeneralProjectSlug: null,
  initialized: () => get().activeProjectSlugInitialized && get().projectsInitialized,
  activeProjectId: () => (get().activeProjectSlug === 'general' ? null : get().projects[get().activeProjectSlug].id),
  setProjects: (projects) => {
    set((prev) => ({
      ...prev,
      projects,
      projectsInitialized: true,
    }))
  },
  setActiveProjectSlug: (project) => {
    set((prev) => ({
      ...prev,
      activeProjectSlug: project,
      lastActiveNonGeneralProjectSlug: project === 'general' ? prev.lastActiveNonGeneralProjectSlug : project,
      activeProjectSlugInitialized: true,
    }))
  },
}))

const useProjectSlugFromRouteParams = () => {
  const location = useLocation()
  const routeParams = useParams()
  const currentActiveProjectSlug = useProjectStore((state) => state.activeProjectSlug)
  const lastActiveNonGeneralProjectSlug = useProjectStore((state) => state.lastActiveNonGeneralProjectSlug)
  const setProject = useProjectStore((state) => state.setActiveProjectSlug)
  const activeProjectSlugInitialized = useProjectStore((state) => state.activeProjectSlugInitialized)
  useEffect(() => {
    const project = routeParams.project
    if ((project && project !== currentActiveProjectSlug) || !activeProjectSlugInitialized) {
      setProject(project ?? 'general')
    }
  }, [location, routeParams, currentActiveProjectSlug, setProject, activeProjectSlugInitialized])
  return useMemo(() => {
    return {
      project: currentActiveProjectSlug,
      nonGeneralProject: lastActiveNonGeneralProjectSlug,
      activeProjectSlugInitialized,
    }
  }, [activeProjectSlugInitialized, currentActiveProjectSlug, lastActiveNonGeneralProjectSlug])
}

const useProjectsSyncWithCtx = () => {
  const projects = AdminCtx.useProjects()
  const setProjects = useProjectStore((state) => state.setProjects)
  const projectsInitialized = useProjectStore((state) => state.projectsInitialized)
  useEffect(() => {
    setProjects(projects)
  }, [projects])
  return useMemo(() => {
    return {
      projectsInitialized,
      projects,
    }
  }, [projectsInitialized, projects])
}

export const ProjectSlugFromRouteParamsGuard = ({ children }: { children: React.ReactNode }) => {
  const initialized = useProjectStore((state) => state.initialized())
  useProjectsSyncWithCtx()
  useProjectSlugFromRouteParams()
  if (!initialized) {
    return <Loader type="page" />
  }
  return <>{children}</>
}

export const ProjectSelect = () => {
  const nonGeneralProject = useProjectStore((state) => state.lastActiveNonGeneralProjectSlug)
  const project = useProjectStore((state) => state.activeProjectSlug)
  const location = useLocation()
  const navigate = useNavigate()
  const projects = useProjectStore((state) => state.projects)
  const currentPath = location.pathname
  return (
    <Select
      size="large"
      value={nonGeneralProject}
      // disabled={project === 'general'}
      style={{ width: 200 }}
      onChange={(value) => {
        const newPath = currentPath.replace(`/${project}`, `/${value}`)
        if (newPath !== currentPath) {
          void navigate(newPath)
        }
      }}
      options={[...Object.entries(projects).map(([slug, project]) => ({ label: project.name, value: slug }))]}
    />
  )
}

type ProjectsLoaderResult =
  | {
      isLoading: true
      projects: null
      error: null
      reload: () => Promise<void>
    }
  | {
      isLoading: false
      projects: Record<string, GeneralProjectListApi200DataItem>
      error: null
      reload: () => Promise<void>
    }
  | {
      isLoading: false
      projects: null
      error: { message: string }
      reload: () => Promise<void>
    }

export const useProjectsLoader = (): ProjectsLoaderResult => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<{ message: string } | null>(null)
  const [projects, setProjects] = useState<Record<string, GeneralProjectListApi200DataItem> | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      setProjects(null)
      setIsLoading(true)
      const res = await generalProjectListApi()
      const result = res.data.reduce(
        (acc: Record<string, GeneralProjectListApi200DataItem>, project: GeneralProjectListApi200DataItem) => {
          acc[project.slug] = project
          return acc
        },
        {},
      )
      setError(null)
      setProjects(result)
      setIsLoading(false)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      setError(error instanceof Error ? { message: error.message } : { message: 'Unknown error' })
      setProjects(null)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [])

  return { isLoading, projects, error, reload } as ProjectsLoaderResult
}
