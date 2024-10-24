import { ErrorPageComponent } from '@/webapp/src/components/errors/ErrorPageComponent/index.js'

export const ActivatedUsersOnlyPageComponent = (props: { title?: string; message?: string }) => {
  const title = props.title || 'Activate your account'
  const message = props.message || 'Activate your account to access this page'
  return <ErrorPageComponent title={title} message={message} />
}
