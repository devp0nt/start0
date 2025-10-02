import { appName } from '@apps/shared/utils'
import { AuthPage } from '@refinedev/antd'

export const LoginPage = () => {
  return (
    <AuthPage
      title={appName}
      type="login"
      formProps={{
        initialValues: { email: 'w@w.we', password: '1234', remember: true },
      }}
      registerLink={false}
    />
  )
}
