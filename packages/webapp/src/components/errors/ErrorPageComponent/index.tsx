export const ErrorPageComponent = (props: { title?: string; message?: string }) => {
  const title = props.title || 'Something went wrong'
  const message = props.message || 'Try again later'
  return (
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  )
}
