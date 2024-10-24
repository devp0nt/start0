import { ErrorPageComponent } from '@/webapp/src/components/errors/ErrorPageComponent/index.js'

export const AccessDeniedPageComponent = (props: { title?: string; message?: string }) => {
  const title = props.title || 'You are not allowed to access this page'
  const message = props.message || 'You are not allowed to access this page'
  return <ErrorPageComponent title={title} message={message} />
}
