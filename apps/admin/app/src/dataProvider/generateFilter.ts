// toBackendFilters.ts
type CrudOperators =
  | 'eq'
  | 'ne'
  | 'lt'
  | 'gt'
  | 'lte'
  | 'gte'
  | 'in'
  | 'nin'
  | 'ina'
  | 'nina' // array: hasEvery / not hasEvery
  | 'contains'
  | 'ncontains'
  | 'containss'
  | 'ncontainss'
  | 'between'
  | 'nbetween' // expects [min, max]
  | 'null'
  | 'nnull'
  | 'startswith'
  | 'nstartswith'
  | 'startswiths'
  | 'nstartswiths'
  | 'endswith'
  | 'nendswith'
  | 'endswiths'
  | 'nendswiths'
  | 'or'
  | 'and'

type LogicalFilter = {
  field: string // supports dot paths like "user.profile.name"
  operator: Exclude<CrudOperators, 'or' | 'and'>
  value: any
}

type ConditionalFilter = {
  key?: string // optional nesting key, also supports dot paths
  operator: Extract<CrudOperators, 'or' | 'and'>
  value: Array<LogicalFilter | ConditionalFilter>
}

type CrudFilter = LogicalFilter | ConditionalFilter
type CrudFilters = CrudFilter[]

type WhereInput = Record<string, any>

/** Build nested object from a dotted path: "a.b.c" + leaf -> { a: { b: { c: leaf } } } */
function nest(path: string | undefined, leaf: any): any {
  if (!path) return leaf
  return path
    .split('.')
    .reverse()
    .reduce((acc, key) => ({ [key]: acc }), leaf)
}

/** Map a single operator into a Prisma-like field filter object */
function opToFieldFilter(operator: LogicalFilter['operator'], value: any): Record<string, any> {
  const negate = (inner: Record<string, any>) => ({ not: inner })

  switch (operator) {
    case 'eq':
      return { equals: value }
    case 'ne':
      return { not: value }

    case 'lt':
      return { lt: value }
    case 'gt':
      return { gt: value }
    case 'lte':
      return { lte: value }
    case 'gte':
      return { gte: value }

    case 'in':
      return { in: value }
    case 'nin':
      return { notIn: value }

    // Scalar-list helpers (Prisma: String[]/Int[] fields)
    case 'ina':
      return { hasEvery: value }
    case 'nina':
      return negate({ hasEvery: value })

    // Text search (case-insensitive by default; *s variants are case-sensitive)
    case 'contains':
      return { contains: value, mode: 'insensitive' }
    case 'ncontains':
      return negate({ contains: value, mode: 'insensitive' })
    case 'containss':
      return { contains: value }
    case 'ncontainss':
      return negate({ contains: value })

    case 'startswith':
      return { startsWith: value, mode: 'insensitive' }
    case 'nstartswith':
      return negate({ startsWith: value, mode: 'insensitive' })
    case 'startswiths':
      return { startsWith: value }
    case 'nstartswiths':
      return negate({ startsWith: value })

    case 'endswith':
      return { endsWith: value, mode: 'insensitive' }
    case 'nendswith':
      return negate({ endsWith: value, mode: 'insensitive' })
    case 'endswiths':
      return { endsWith: value }
    case 'nendswiths':
      return negate({ endsWith: value })

    // Range
    case 'between': {
      const [min, max] = Array.isArray(value) ? value : [undefined, undefined]
      const obj: Record<string, any> = {}
      if (min !== undefined) obj.gte = min
      if (max !== undefined) obj.lte = max
      return obj
    }
    case 'nbetween': {
      const [min, max] = Array.isArray(value) ? value : [undefined, undefined]
      const range: Record<string, any> = {}
      if (min !== undefined) range.gte = min
      if (max !== undefined) range.lte = max
      return negate(range)
    }

    // Null checks
    case 'null':
      return { equals: null }
    case 'nnull':
      return { not: null }

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    default:
      // Fallback: try to pass operator as-is; useful for custom Zod filter fields
      return { [operator]: value }
  }
}

/** Recursively convert Refine filters into Prisma-like WhereInput */
export const generateFilter = (filters?: CrudFilters): WhereInput => {
  if (!Array.isArray(filters) || filters.length === 0) return {}

  const toClause = (f: CrudFilter): WhereInput => {
    // Conditional group (AND/OR)
    if ('operator' in f && (f.operator === 'and' || f.operator === 'or')) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const group = f.value?.map(toClause).filter(Boolean)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!group || group.length === 0) return {}
      const key = f.operator === 'and' ? 'AND' : 'OR'
      const body = { [key]: group }

      // If a nesting key is provided, nest the logical group under it
      return f.key ? nest(f.key, body) : body
    }

    // Logical leaf
    const lf = f as LogicalFilter
    const fieldFilter = opToFieldFilter(lf.operator, lf.value)
    return nest(lf.field, fieldFilter)
  }

  // Top-level: AND all provided filters, but flatten when possible
  const clauses = filters.map(toClause).filter(Boolean)

  // If only one clause and it's already a top-level logical group, return it directly
  if (clauses.length === 1) return clauses[0]

  // Otherwise AND them together
  return { AND: clauses }
}
