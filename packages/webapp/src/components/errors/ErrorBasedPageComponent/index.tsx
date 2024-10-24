import { toErrory } from '@/general/src/other/errory.js'
import { AccessDeniedPageComponent } from '@/webapp/src/components/errors/AccessDeniedPageComponent/index.js'
import { ActivatedUsersOnlyPageComponent } from '@/webapp/src/components/errors/ActivatedUsersOnlyPageComponent/index.js'
import { AuthorizedUsersOnlyPageComponent } from '@/webapp/src/components/errors/AuthorizedUsersOnlyPageComponent/index.js'
import { ErrorPageComponent } from '@/webapp/src/components/errors/ErrorPageComponent/index.js'
import { NotFoundPageComponent } from '@/webapp/src/components/errors/NotFoundPageComponent/index.js'

export const ErrorBasedPageComponent = ({ error }: { error: any }) => {
  const { code, message } = toErrory(error)
  switch (code) {
    case 'unauthorized':
      return <AuthorizedUsersOnlyPageComponent message={message} />
    case 'unactivated':
      return <ActivatedUsersOnlyPageComponent message={message} />
    case 'accessDenied':
      return <AccessDeniedPageComponent message={message} />
    case 'notFound':
      return <NotFoundPageComponent message={message} />
    default:
      return <ErrorPageComponent message={message} />
  }
}
