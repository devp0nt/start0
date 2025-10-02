import { AuthPage } from '@refinedev/antd'

export const LoginPage = () => {
  return (
    <AuthPage
      title="AdminHub"
      type="login"
      formProps={{
        initialValues: { email: 'w@w.we', password: '1234', remember: true },
      }}
      registerLink={false}
    />
  )
}
