// toBackendPagination.ts

export type Pagination = {
  current?: number // 1-based page index
  pageSize?: number // items per page
  mode?: 'client' | 'server' | 'off'
}

export type BackendPagination = {
  take?: number // zPagination.take
  skip?: number // zPagination.skip
}

type Options = {
  /** Fallback page size if none provided (backend default is 10). */
  fallbackTake?: number
}

export const generatePagination = (pagination?: Pagination, options: Options = {}): BackendPagination => {
  const fallbackTake = Math.max(1, Math.floor(options.fallbackTake ?? 10))

  const take = Math.max(1, Math.floor(pagination?.pageSize ?? fallbackTake))

  // If mode is "off", return first page with provided size (backend can ignore if desired)
  if (pagination?.mode === 'off') {
    return { take, skip: 0 }
  }

  const current = Math.max(1, Math.floor(pagination?.current ?? 1))
  const skip = (current - 1) * take

  return { take, skip }
}
