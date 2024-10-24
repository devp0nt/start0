import { getSomeEnv } from '@/backend/src/services/other/env.js'
import { ErroryUnexpected } from '@/general/src/other/errory.js'

export const isTestEnv = () => {
  const env = getSomeEnv(['NODE_ENV', 'HOST_ENV'])
  return env.NODE_ENV === 'test' && env.HOST_ENV === 'local'
}

export const throwIfNotTestEnv = () => {
  const env = getSomeEnv(['NODE_ENV', 'HOST_ENV'])
  if (env.HOST_ENV !== 'local') {
    throw new ErroryUnexpected('Tests is not allowed in not local host env')
  }
  if (env.NODE_ENV !== 'test') {
    throw new ErroryUnexpected('Run tests only with NODE_ENV=test')
  }
}
