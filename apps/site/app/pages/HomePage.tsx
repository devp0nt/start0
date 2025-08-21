export const HomePage = ({ data = {} }: { data?: Record<string, any> }) => {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Hello! Check our ideas!</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
