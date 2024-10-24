import { ErrorPageComponent } from '@/webapp/src/components/errors/ErrorPageComponent/index.js'

export const AuthorizedUsersOnlyPageComponent = (props: { title?: string; message?: string }) => {
  const title = props.title || 'Please log in'
  const message = props.message || 'You must log in to access this page'
  return <ErrorPageComponent title={title} message={message} />
}
