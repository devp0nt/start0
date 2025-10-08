import { appName } from '@apps/shared/general'
import { AuthPage } from '@refinedev/antd'

export const LoginPage = () => {
  return (
    <AuthPage
      title={appName}
      type="login"
      formProps={{
        // initialValues: { email: 'w@w.we', password: '11111111', remember: true },
        initialValues: { email: 'w@w1.we', password: '9!FK\\$[!jf', remember: true },
      }}
      registerLink={false}
    />
  )
}
