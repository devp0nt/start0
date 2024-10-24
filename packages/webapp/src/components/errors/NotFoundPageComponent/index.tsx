import { ErrorPageComponent } from '@/webapp/src/components/errors/ErrorPageComponent/index.js'

export const NotFoundPageComponent = (props: { title?: string; message?: string }) => {
  const title = props.title || 'Page not found'
  const message = props.message || 'Visit another page please'
  return <ErrorPageComponent title={title} message={message} />
}
